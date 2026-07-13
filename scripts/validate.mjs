#!/usr/bin/env node
// Fast content pre-check. Reports per-entry, per-field problems and enforces the
// publish gate. Exit code 1 if any errors. Run: `npm run validate`.
//
// The Astro build (Zod schema) is authoritative; this catches issues sooner and
// with friendlier messages, especially after a CSV import.
import {
  loadAllEntries, TOPIC_SLUGS, PLACEHOLDER, LIVE_STATUSES, isValidUrl, isValidDate,
} from './lib/entries.mjs';

const REQUIRED = [
  'slug', 'page_title', 'short_title', 'topic', 'scripture_reference',
  'scripture_text', 'scripture_translation', 'gentle_word', 'prayer',
];

const errors = [];
const warnings = [];
const seenSlugs = new Map();
const seenIds = new Map();

const entries = await loadAllEntries();
if (entries.length === 0) {
  console.error('No entries found in src/data/entries.');
  process.exit(1);
}

for (const { file, data } of entries) {
  const name = data.slug || data.id || file;
  const err = (m) => errors.push(`✗ ${name}: ${m}`);
  const warn = (m) => warnings.push(`• ${name}: ${m}`);

  for (const field of REQUIRED) {
    if (data[field] === undefined || data[field] === null || String(data[field]).trim() === '') {
      err(`missing required field "${field}"`);
    }
  }

  if (data.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) err(`slug "${data.slug}" must be kebab-case`);
  if (data.topic && !TOPIC_SLUGS.has(data.topic)) err(`unknown topic "${data.topic}"`);
  for (const t of data.secondary_topics || []) {
    if (!TOPIC_SLUGS.has(t)) err(`unknown secondary topic "${t}"`);
  }

  for (const df of ['publish_date', 'featured_date', 'expiration_date', 'last_reviewed_date', 'created_at', 'updated_at']) {
    if (!isValidDate(data[df])) err(`invalid date in "${df}": ${data[df]}`);
  }
  for (const item of data.exclusion_dates || []) {
    if (!isValidDate(item)) err(`invalid date in "exclusion_dates": ${item}`);
  }

  for (const link of [...(data.related_articles || []), ...(data.related_resources || [])]) {
    if (!link || !link.url || !isValidUrl(link.url)) err(`related link has an invalid URL: ${JSON.stringify(link)}`);
    if (link && !link.label) warn(`related link is missing a label (use descriptive text): ${link.url}`);
  }
  if (data.canonical_url && !isValidUrl(data.canonical_url)) err(`invalid canonical_url: ${data.canonical_url}`);

  // Slug / id uniqueness.
  if (data.slug) {
    if (seenSlugs.has(data.slug)) err(`duplicate slug also used by ${seenSlugs.get(data.slug)}`);
    else seenSlugs.set(data.slug, name);
  }
  if (data.id) {
    if (seenIds.has(data.id)) err(`duplicate id also used by ${seenIds.get(data.id)}`);
    else seenIds.set(data.id, name);
  }

  // Publish gate.
  const isLive = LIVE_STATUSES.has(data.status);
  const hasPlaceholder = String(data.scripture_text || '').includes(PLACEHOLDER);
  if (isLive) {
    if (data.content_review_status !== 'approved') err('cannot be live: content_review_status is not "approved"');
    if (data.scripture_review_status !== 'approved') err('cannot be live: scripture_review_status is not "approved"');
    if (!data.scripture_verified) err('cannot be live: scripture_verified is false');
    if (hasPlaceholder) err('cannot be live: Scripture is still a placeholder');
    if (data.status === 'scheduled' && !data.publish_date) err('scheduled but has no publish_date');
  } else if (hasPlaceholder) {
    warn('Scripture is a placeholder (fine while in review; must be replaced before publishing)');
  }
}

console.log(`\nChecked ${entries.length} entr${entries.length === 1 ? 'y' : 'ies'}.`);
if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`);
  warnings.forEach((w) => console.log('  ' + w));
}
if (errors.length) {
  console.log(`\n${errors.length} error(s):`);
  errors.forEach((e) => console.log('  ' + e));
  console.log('\nFix the errors above before publishing.\n');
  process.exit(1);
}
console.log('\n✓ No blocking errors. Content is ready for the build.\n');
