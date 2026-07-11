#!/usr/bin/env node
// Export all entries to a single CSV for backup or bulk editing.
//   npm run export:csv                 # writes content/entries-export.csv
//   npm run export:csv -- my-file.csv  # custom path
import { promises as fs } from 'node:fs';
import path from 'node:path';
import Papa from 'papaparse';
import { loadAllEntries, CSV_COLUMNS, LIST_FIELDS, LINK_FIELDS, BOOL_FIELDS } from './lib/entries.mjs';

const out = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'content/entries-export.csv';

function serialize(col, value) {
  if (value === undefined || value === null) return '';
  if (LIST_FIELDS.has(col)) return (value || []).join('; ');
  if (LINK_FIELDS.has(col)) return (value || []).map((l) => `${l.label}|${l.url}`).join(' ;; ');
  if (BOOL_FIELDS.has(col)) return value ? 'true' : 'false';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

const entries = await loadAllEntries();
const rows = entries.map(({ data }) => {
  const row = {};
  for (const col of CSV_COLUMNS) row[col] = serialize(col, data[col]);
  return row;
});

const csv = Papa.unparse({ fields: CSV_COLUMNS, data: rows });
await fs.mkdir(path.dirname(path.resolve(out)), { recursive: true });
await fs.writeFile(out, '﻿' + csv, 'utf8'); // BOM for Excel UTF-8
console.log(`Exported ${rows.length} entr${rows.length === 1 ? 'y' : 'ies'} to ${out}`);
