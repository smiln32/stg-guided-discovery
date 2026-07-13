// Shared helpers for the content CLI scripts (validate / import / export / pins).
// These run in plain Node, so they read the YAML entry files directly rather
// than through Astro. The AUTHORITATIVE validation is still the Astro build
// (the Zod schema in src/content.config.ts); this mirror is a fast pre-check.
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { TOPICS } from '../../src/config/topics.mjs';
import { LIVE_STATUSES as LIVE_STATUS_LIST, SCRIPTURE_PLACEHOLDER } from '../../src/config/entry-fields.mjs';

// Field lists, statuses, and the Scripture placeholder are shared with the Zod
// schema via src/config/entry-fields.mjs — one source of truth, checked for
// parity against the schema at build time.
export {
  CSV_COLUMNS, LIST_FIELDS, DATE_LIST_FIELDS, LINK_FIELDS, BOOL_FIELDS,
  NUMBER_FIELDS, SCRIPTURE_PLACEHOLDER as PLACEHOLDER,
} from '../../src/config/entry-fields.mjs';

export const ROOT = path.resolve(fileURLToPath(import.meta.url), '../../..');
export const ENTRIES_DIR = path.join(ROOT, 'src', 'data', 'entries');
export const TOPIC_SLUGS = new Set(TOPICS.map((t) => t.slug));
export const LIVE_STATUSES = new Set(LIVE_STATUS_LIST);

/**
 * The full publish gate, mirroring the Zod superRefine in content.config.ts:
 * live status + both reviews approved + Scripture verified and not a
 * placeholder. Standalone tools (e.g. the Pin exporter) use this so they can
 * never emit artifacts for an entry the build itself would reject.
 */
export function passesPublishGate(data) {
  return (
    LIVE_STATUSES.has(data.status) &&
    data.content_review_status === 'approved' &&
    data.scripture_review_status === 'approved' &&
    data.scripture_verified === true &&
    !String(data.scripture_text || '').includes(SCRIPTURE_PLACEHOLDER)
  );
}

export async function listEntryFiles() {
  const files = await fs.readdir(ENTRIES_DIR);
  return files
    .filter((f) => /\.(ya?ml|json)$/i.test(f))
    .map((f) => path.join(ENTRIES_DIR, f));
}

export async function loadEntry(file) {
  const raw = await fs.readFile(file, 'utf8');
  const data = /\.json$/i.test(file) ? JSON.parse(raw) : YAML.parse(raw);
  if (!data.id) data.id = path.basename(file).replace(/\.(ya?ml|json)$/i, '');
  return data;
}

export async function loadAllEntries() {
  const files = await listEntryFiles();
  const out = [];
  for (const file of files) out.push({ file, data: await loadEntry(file) });
  return out;
}

export function isValidUrl(u) {
  try {
    new URL(u);
    return true;
  } catch {
    return false;
  }
}

export function isValidDate(v) {
  if (v === undefined || v === null || v === '') return true;
  const d = new Date(v);
  return !Number.isNaN(d.getTime());
}
