// Shared helpers for the content CLI scripts (validate / import / export / pins).
// These run in plain Node, so they read the YAML entry files directly rather
// than through Astro. The AUTHORITATIVE validation is still the Astro build
// (the Zod schema in src/content.config.ts); this mirror is a fast pre-check.
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { TOPICS } from '../../src/config/topics.mjs';

export const ROOT = path.resolve(fileURLToPath(import.meta.url), '../../..');
export const ENTRIES_DIR = path.join(ROOT, 'src', 'data', 'entries');
export const TOPIC_SLUGS = new Set(TOPICS.map((t) => t.slug));
export const PLACEHOLDER = '[VERIFIED NASB 2020 SCRIPTURE TEXT REQUIRED]';
export const LIVE_STATUSES = new Set(['published', 'scheduled']);

// The full column order used for CSV import/export. Keep in sync with the schema.
export const CSV_COLUMNS = [
  'id', 'status', 'is_sample', 'publish_date', 'featured_date', 'expiration_date',
  'rotation_eligible', 'rotation_priority', 'slug', 'page_title', 'short_title',
  'topic', 'secondary_topics', 'audience', 'season_or_circumstance', 'keywords',
  'search_phrases', 'scripture_reference', 'scripture_text', 'scripture_translation',
  'scripture_verified', 'scripture_verification_notes', 'gentle_word', 'prayer',
  'journal_question', 'small_step', 'carry_phrase', 'pin_quote', 'pin_prayer',
  'pin_practical_text', 'pin_curiosity_text', 'pin_title', 'pin_description',
  'pin_alt_text', 'pinterest_board', 'pinterest_status', 'pinterest_publish_date',
  'email_subject', 'email_preview_text', 'email_opening', 'email_body',
  'email_cta_text', 'email_status', 'email_send_date', 'email_segment',
  'related_entry_ids', 'related_articles', 'related_product_ids', 'related_resources',
  'seo_title', 'meta_description', 'canonical_url', 'social_title',
  'social_description', 'social_image', 'author', 'reviewed_by',
  'content_review_status', 'scripture_review_status', 'last_reviewed_date',
  'version', 'created_at', 'updated_at',
];

// Fields that are arrays of plain strings (CSV: semicolon-separated).
export const LIST_FIELDS = new Set([
  'secondary_topics', 'keywords', 'search_phrases', 'related_entry_ids', 'related_product_ids',
]);
// Fields that are arrays of {label,url} (CSV: "Label|url ;; Label|url").
export const LINK_FIELDS = new Set(['related_articles', 'related_resources']);
export const BOOL_FIELDS = new Set(['is_sample', 'rotation_eligible', 'scripture_verified']);

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
