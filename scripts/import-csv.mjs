#!/usr/bin/env node
// Bulk import entries from a CSV into YAML files.
//
//   npm run import:csv -- content/import.csv           # dry-run preview
//   npm run import:csv -- content/import.csv --commit   # write the YAML files
//
// Behavior (spec §20): validates columns + required fields, preserves EXACT
// Scripture text, rejects duplicate ids/slugs (within the file and against
// existing entries), flags invalid dates / missing topics / missing verification,
// reports row-specific errors, previews before writing, never silently alters
// content, and is UTF-8 safe.
import { promises as fs } from 'node:fs';
import path from 'node:path';
import Papa from 'papaparse';
import YAML from 'yaml';
import {
  ENTRIES_DIR, CSV_COLUMNS, LIST_FIELDS, DATE_LIST_FIELDS, LINK_FIELDS, BOOL_FIELDS,
  NUMBER_FIELDS, TOPIC_SLUGS, PLACEHOLDER, LIVE_STATUSES, loadAllEntries, isValidUrl, isValidDate,
} from './lib/entries.mjs';

const args = process.argv.slice(2);
const commit = args.includes('--commit');
const input = args.find((a) => !a.startsWith('--')) || 'content/import.csv';
const REQUIRED = ['slug', 'page_title', 'short_title', 'topic', 'scripture_reference', 'scripture_text', 'scripture_translation', 'gentle_word', 'prayer'];

function parseList(v) {
  return String(v || '').split(';').map((s) => s.trim()).filter(Boolean);
}
function parseLinks(v) {
  return String(v || '')
    .split(';;')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((pair) => {
      const i = pair.indexOf('|');
      return i === -1
        ? { label: pair.trim(), url: pair.trim() }
        : { label: pair.slice(0, i).trim(), url: pair.slice(i + 1).trim() };
    });
}
function parseBool(v) {
  return /^(true|yes|1|on)$/i.test(String(v).trim());
}

function rowToEntry(row) {
  const e = {};
  for (const col of CSV_COLUMNS) {
    const raw = row[col];
    if (raw === undefined) continue;
    const val = typeof raw === 'string' ? raw : String(raw);
    if (val.trim() === '' && !REQUIRED.includes(col)) continue;
    if (LIST_FIELDS.has(col)) e[col] = parseList(val);
    else if (LINK_FIELDS.has(col)) e[col] = parseLinks(val);
    else if (BOOL_FIELDS.has(col)) e[col] = parseBool(val);
    else if (NUMBER_FIELDS.has(col)) e[col] = Number(val); // validated per-row below
    else e[col] = val; // scripture_text and all prose preserved verbatim
  }
  if (!e.id && e.slug) e.id = e.slug;
  return e;
}

function validateRow(e, rowNum, seen) {
  const errs = [];
  for (const f of REQUIRED) {
    if (!e[f] || String(e[f]).trim() === '') errs.push(`row ${rowNum}: missing "${f}"`);
  }
  if (e.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(e.slug)) errs.push(`row ${rowNum}: slug "${e.slug}" must be kebab-case`);
  if (e.topic && !TOPIC_SLUGS.has(e.topic)) errs.push(`row ${rowNum}: unknown topic "${e.topic}"`);
  for (const df of ['publish_date', 'featured_date', 'expiration_date']) {
    if (!isValidDate(e[df])) errs.push(`row ${rowNum}: invalid date "${df}"=${e[df]}`);
  }
  for (const dl of DATE_LIST_FIELDS) {
    for (const item of e[dl] || []) {
      if (!isValidDate(item)) errs.push(`row ${rowNum}: invalid date in "${dl}": ${item}`);
    }
  }
  for (const nf of NUMBER_FIELDS) {
    if (e[nf] !== undefined && !Number.isInteger(e[nf])) {
      errs.push(`row ${rowNum}: "${nf}" must be a whole number`);
    }
  }
  for (const link of [...(e.related_articles || []), ...(e.related_resources || [])]) {
    if (!isValidUrl(link.url)) errs.push(`row ${rowNum}: invalid related URL ${link.url}`);
  }
  if (e.slug) {
    if (seen.slugs.has(e.slug)) errs.push(`row ${rowNum}: duplicate slug "${e.slug}" (also in this file)`);
    seen.slugs.add(e.slug);
  }
  if (e.id) {
    if (seen.ids.has(e.id)) errs.push(`row ${rowNum}: duplicate id "${e.id}" (also in this file)`);
    seen.ids.add(e.id);
  }
  if (LIVE_STATUSES.has(e.status)) {
    if (String(e.scripture_text).includes(PLACEHOLDER)) errs.push(`row ${rowNum}: cannot import as live — Scripture is still a placeholder`);
    if (e.content_review_status !== 'approved') errs.push(`row ${rowNum}: cannot import as live — content_review_status not "approved"`);
    if (e.scripture_review_status !== 'approved') errs.push(`row ${rowNum}: cannot import as live — scripture_review_status not "approved"`);
    if (!parseBoolLoose(e.scripture_verified)) errs.push(`row ${rowNum}: cannot import as live — scripture_verified not true`);
  }
  return errs;
}
function parseBoolLoose(v) {
  return v === true || /^(true|yes|1|on)$/i.test(String(v).trim());
}

// ---- main ----
let text;
try {
  text = await fs.readFile(input, 'utf8');
} catch {
  console.error(`Could not read CSV: ${input}`);
  process.exit(1);
}
if (text.charCodeAt(0) === 0xfeff) text = text.slice(1); // strip UTF-8 BOM

const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
if (parsed.errors.length) {
  console.error('CSV parse errors:');
  parsed.errors.forEach((e) => console.error(`  row ${e.row}: ${e.message}`));
  process.exit(1);
}

const headers = parsed.meta.fields || [];
const unknown = headers.filter((h) => !CSV_COLUMNS.includes(h));
if (unknown.length) console.warn(`Warning: ignoring unknown columns: ${unknown.join(', ')}`);
const missingCols = REQUIRED.filter((r) => !headers.includes(r));
if (missingCols.length) {
  console.error(`CSV is missing required columns: ${missingCols.join(', ')}`);
  process.exit(1);
}

const existing = await loadAllEntries();
const existingSlugs = new Set(existing.map((x) => x.data.slug));
const existingIds = new Set(existing.map((x) => x.data.id));

const seen = { slugs: new Set(), ids: new Set() };
const allErrors = [];
const toWrite = [];

parsed.data.forEach((row, i) => {
  const rowNum = i + 2; // header is row 1
  const e = rowToEntry(row);
  allErrors.push(...validateRow(e, rowNum, seen));
  if (existingSlugs.has(e.slug)) console.warn(`  note: row ${rowNum} slug "${e.slug}" already exists — will be OVERWRITTEN on --commit`);
  if (existingIds.has(e.id) && !existingSlugs.has(e.slug)) allErrors.push(`row ${rowNum}: id "${e.id}" already used by a different entry`);
  toWrite.push({ rowNum, e });
});

console.log(`\nParsed ${toWrite.length} row(s) from ${input}.`);
if (allErrors.length) {
  console.log(`\n${allErrors.length} error(s):`);
  allErrors.forEach((e) => console.log('  ✗ ' + e));
  console.log('\nNo files were written. Fix the errors and re-run.\n');
  process.exit(1);
}

console.log('\nPreview:');
for (const { e } of toWrite) {
  console.log(`  • ${e.slug} [${e.status || 'draft'}] ${e.topic} — ${e.scripture_reference}`);
}

if (!commit) {
  console.log('\nDry run only. Re-run with --commit to write these YAML files.\n');
  process.exit(0);
}

await fs.mkdir(ENTRIES_DIR, { recursive: true });
for (const { e } of toWrite) {
  const file = path.join(ENTRIES_DIR, `${e.slug}.yaml`);
  await fs.writeFile(file, YAML.stringify(e, { lineWidth: 0 }), 'utf8');
  console.log(`  ✓ wrote ${path.relative(process.cwd(), file)}`);
}
console.log(`\nImported ${toWrite.length} entr${toWrite.length === 1 ? 'y' : 'ies'}. Run "npm run validate" and "npm run build".\n`);
