#!/usr/bin/env node
// Record that a person has reviewed an entry, and clear its demonstration flag.
//
//   npm run approve -- <slug> [<slug> ...]      one or more entries
//   npm run approve -- --all                    every entry still flagged
//   npm run approve -- <slug> --reviewer "Name"
//   npm run approve -- <slug> --dry-run
//
// Why this exists rather than a find-and-replace: `is_sample: false` is an
// ATTESTATION, not a formatting change. It says a person read this entry and
// stands behind it. Doing that one entry at a time, through a command that
// stamps who and when, leaves the claim traceable in git — one commit per
// entry if you want it — instead of a single sweep that says nothing about
// what was actually read.
//
// It edits the three governance lines in place and touches nothing else. It
// deliberately does NOT parse and re-emit the YAML: a round trip through the
// dumper would reformat every block scalar in the file and bury the one-line
// change in noise. Line edits keep the diff to exactly what changed.
//
// It also deliberately leaves `updated_at` alone. That field feeds the daily
// rotation order and the guided-discovery tie-break; reviewing an entry is not
// editing it, and it should not reshuffle the site.
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { listEntryFiles, loadEntry } from './lib/entries.mjs';
import { SITE_TIMEZONE } from '../src/config/site.mjs';

const DEFAULT_REVIEWER = 'Simplify to Glorify';

/** Today in the site's own timezone, as YYYY-MM-DD — the format entries use. */
function today() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: SITE_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/**
 * Replace a top-level key's value, or insert the line after `after` if the key
 * is absent. Returns null when nothing needed doing, so the caller can report
 * honestly instead of claiming a change it did not make.
 */
function setKey(lines, key, value, after) {
  const i = lines.findIndex((l) => l.startsWith(`${key}:`));
  if (i !== -1) {
    const next = `${key}: ${value}`;
    if (lines[i] === next) return null;
    const was = lines[i];
    lines[i] = next;
    return was;
  }
  const anchor = lines.findIndex((l) => l.startsWith(`${after}:`));
  if (anchor === -1) return null;
  lines.splice(anchor + 1, 0, `${key}: ${value}`);
  return '(absent)';
}

const argv = process.argv.slice(2);
const dryRun = argv.includes('--dry-run');
const all = argv.includes('--all');
const rIdx = argv.indexOf('--reviewer');
const reviewer = rIdx !== -1 ? argv[rIdx + 1] : DEFAULT_REVIEWER;
// rIdx + 1 is the reviewer NAME, not a slug — but only when --reviewer is
// actually present. Guarding on rIdx !== -1 matters: without it, rIdx + 1 is 0
// and the first slug on the line is silently dropped.
const reviewerNameIdx = rIdx === -1 ? -1 : rIdx + 1;
const slugs = argv.filter(
  (a, i) => !a.startsWith('--') && i !== reviewerNameIdx,
);

if (!all && slugs.length === 0) {
  console.error(
    'Usage: npm run approve -- <slug> [<slug> ...] [--reviewer "Name"] [--dry-run]\n' +
      '       npm run approve -- --all\n\n' +
      `Records a review by "${DEFAULT_REVIEWER}" unless --reviewer says otherwise.\n` +
      'Sets is_sample: false, reviewed_by, and last_reviewed_date. Nothing else.\n',
  );
  process.exit(1);
}

const files = await listEntryFiles();
const bySlug = new Map();
for (const file of files) {
  const data = await loadEntry(file);
  bySlug.set(data.slug || data.id, { file, data });
}

const pending = [...bySlug.entries()].filter(([, e]) => e.data.is_sample === true);
const targets = all ? pending.map(([s]) => s) : slugs;

const unknown = targets.filter((s) => !bySlug.has(s));
if (unknown.length) {
  console.error(`Unknown entr${unknown.length === 1 ? 'y' : 'ies'}: ${unknown.join(', ')}`);
  console.error(`\nKnown slugs:\n  ${[...bySlug.keys()].sort().join('\n  ')}`);
  process.exit(1);
}
if (targets.length === 0) {
  console.log('Nothing to do — no entry is still flagged as a demonstration.\n');
  process.exit(0);
}

const stamp = today();
let changed = 0;

for (const slug of targets) {
  const { file, data } = bySlug.get(slug);
  const raw = await fs.readFile(file, 'utf8');
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const lines = raw.split(/\r?\n/);
  const notes = [];

  const wasSample = setKey(lines, 'is_sample', 'false');
  if (wasSample) notes.push(`is_sample: ${wasSample.split(': ')[1]} -> false`);

  const wasReviewer = setKey(lines, 'reviewed_by', reviewer, 'author');
  if (wasReviewer) {
    const prev = wasReviewer === '(absent)' ? '(absent)' : wasReviewer.slice('reviewed_by: '.length);
    notes.push(`reviewed_by: ${prev} -> ${reviewer}`);
  }

  const wasDate = setKey(lines, 'last_reviewed_date', stamp, 'scripture_review_status');
  if (wasDate) {
    const prev = wasDate === '(absent)' ? '(absent)' : wasDate.slice('last_reviewed_date: '.length);
    notes.push(`last_reviewed_date: ${prev} -> ${stamp}`);
  }

  const live = data.status === 'published' || data.status === 'scheduled';
  if (notes.length === 0) {
    console.log(`  ${slug} — already recorded, nothing changed`);
    continue;
  }
  console.log(`${dryRun ? '[dry run] ' : ''}${slug}${live ? '' : `  (status: ${data.status} — still not live)`}`);
  notes.forEach((n) => console.log(`    ${n}`));
  if (!dryRun) await fs.writeFile(file, lines.join(eol), 'utf8');
  changed += 1;
}

const remaining = pending.length - (dryRun ? 0 : changed);
console.log(
  `\n${dryRun ? 'Would record' : 'Recorded'} ${changed} review${changed === 1 ? '' : 's'} by "${reviewer}" on ${stamp}.` +
    (remaining > 0
      ? `\n${remaining} entr${remaining === 1 ? 'y is' : 'ies are'} still flagged as demonstration content.`
      : '\nNo entry is flagged as demonstration content any more.') +
    '\n\nRun `npm run validate` next.\n',
);
