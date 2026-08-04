#!/usr/bin/env node
// Fast content pre-check. Reports per-entry, per-field problems and enforces the
// publish gate. Exit code 1 if any errors. Run: `npm run validate`.
//
// The Astro build (Zod schema) is authoritative; this catches issues sooner and
// with friendlier messages, especially after a CSV import.
import {
  loadAllEntries, TOPIC_SLUGS, PLACEHOLDER, LIVE_STATUSES, isValidUrl, isValidDate,
  passesPublishGate,
} from './lib/entries.mjs';
import { NEEDS, TIERS, RESERVED_SLUGS, MAX_JOURNEY_CHOICES } from '../src/config/guided.mjs';
import {
  findDiagnosisLanguage, checkPrayerVoice, journeyVisibleText, checkGuidedCopy,
  checkJourneyCoverage, selectCandidates,
} from '../src/lib/guided-guards.mjs';

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

  // --- Guided-discovery content safeguards ---------------------------------
  // These apply to every entry, not only the ones a journey happens to open:
  // any entry can be matched once the library grows or a need's lanes change.

  // A slug may never collide with a route the guided feature owns, or the
  // entry's own permanent page would be shadowed by it.
  if (RESERVED_SLUGS.includes(data.slug)) {
    err(`slug "${data.slug}" is a reserved route segment (${RESERVED_SLUGS.join(', ')})`);
  }

  // No diagnosis language: nothing tells a visitor what she is or has.
  for (const block of journeyVisibleText(data)) {
    for (const hit of findDiagnosisLanguage(block)) {
      err(`diagnosis language "${hit}" — say what is true about God or the moment, not about the reader`);
    }
  }

  // Prayers follow the approved voice: addressed to God, and finished.
  if (data.prayer) {
    for (const problem of checkPrayerVoice(data.prayer)) err(problem);
  }
}

// --- Guided discovery: configuration and coverage ----------------------------
// A journey must never open onto a blank section. These two checks catch the
// failure a per-entry pass cannot see: every entry is individually fine, but a
// visitor still reaches a dead end because a need's lanes and a tier's promises
// disagree.
for (const problem of checkGuidedCopy()) {
  errors.push(`✗ guided config: ${problem}`);
}

// Approximates the site's visible set: the full publish gate, ordered
// newest-effective-date first, exactly as getVisibleEntries() does. Entries
// scheduled for a future date are counted — they will be visible by then — so
// this can report coverage the site does not have *yet*, never coverage it will
// never have.
const effectiveDate = (d) =>
  new Date(d.featured_date ?? d.publish_date ?? d.updated_at ?? d.created_at ?? 0).getTime();

const liveEntries = entries
  .map(({ data }) => data)
  .filter((d) => passesPublishGate(d))
  .sort((a, b) => effectiveDate(b) - effectiveDate(a));

if (liveEntries.length === 0) {
  warnings.push('• guided discovery: no published entries yet, so no journey can be built');
} else {
  for (const problem of checkJourneyCoverage((need, tier) =>
    selectCandidates(liveEntries, need, tier, MAX_JOURNEY_CHOICES),
  )) {
    errors.push(`✗ guided discovery: ${problem}`);
  }
}

console.log(
  `\nChecked ${entries.length} entr${entries.length === 1 ? 'y' : 'ies'}, ` +
    `and ${NEEDS.length} need${NEEDS.length === 1 ? '' : 's'} × ${TIERS.length} tiers of guided discovery.`,
);
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
