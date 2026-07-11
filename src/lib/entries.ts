// -----------------------------------------------------------------------------
// Entry queries + visibility rules.
//
// Every public query flows through here so the "only approved, published,
// non-expired content is ever shown or indexed" rule lives in exactly one place.
// -----------------------------------------------------------------------------
import { getCollection, type CollectionEntry } from 'astro:content';
import { LIVE_STATUSES } from '../content.config';

export type Entry = CollectionEntry<'entries'>;
export type EntryData = Entry['data'];

/** The build "now". Overridable via BUILD_NOW (ISO string) for testing. */
export function buildNow(): Date {
  const override = typeof process !== 'undefined' && process.env?.BUILD_NOW;
  return override ? new Date(override) : new Date();
}

/**
 * Is this entry publicly visible as of `now`?
 * Requires: a live status, both reviews approved, Scripture verified, the
 * publish date reached (for scheduled entries), and not past expiration.
 */
export function isVisible(data: EntryData, now: Date = buildNow()): boolean {
  if (!(LIVE_STATUSES as readonly string[]).includes(data.status)) return false;
  if (data.content_review_status !== 'approved') return false;
  if (data.scripture_review_status !== 'approved') return false;
  if (!data.scripture_verified) return false;
  if (data.status === 'scheduled') {
    if (!data.publish_date || data.publish_date.getTime() > now.getTime()) return false;
  }
  if (data.expiration_date && data.expiration_date.getTime() <= now.getTime()) return false;
  return true;
}

function effectiveDate(data: EntryData): number {
  return (
    data.featured_date?.getTime() ??
    data.publish_date?.getTime() ??
    data.updated_at?.getTime() ??
    data.created_at?.getTime() ??
    0
  );
}

/** All entries, unfiltered (drafts included). Use for admin/validation only. */
export async function getAllEntries(): Promise<Entry[]> {
  return getCollection('entries');
}

/** Publicly visible entries, newest-effective-date first. */
export async function getVisibleEntries(now: Date = buildNow()): Promise<Entry[]> {
  const all = await getCollection('entries');
  return all
    .filter((e) => isVisible(e.data, now))
    .sort((a, b) => effectiveDate(b.data) - effectiveDate(a.data));
}

export async function getEntryBySlug(slug: string): Promise<Entry | undefined> {
  const all = await getCollection('entries');
  return all.find((e) => e.data.slug === slug);
}

export async function getVisibleEntryBySlug(
  slug: string,
  now: Date = buildNow(),
): Promise<Entry | undefined> {
  const e = await getEntryBySlug(slug);
  return e && isVisible(e.data, now) ? e : undefined;
}

/** Visible entries for a topic (primary or secondary), newest first. */
export async function getEntriesByTopic(
  topicSlug: string,
  now: Date = buildNow(),
): Promise<Entry[]> {
  const visible = await getVisibleEntries(now);
  return visible.filter(
    (e) => e.data.topic === topicSlug || e.data.secondary_topics.includes(topicSlug),
  );
}

/** Resolve related entries by id, keeping only visible ones. */
export async function getRelatedEntries(
  entry: Entry,
  limit = 3,
  now: Date = buildNow(),
): Promise<Entry[]> {
  const visible = await getVisibleEntries(now);
  const byId = new Map(visible.map((e) => [e.id, e]));

  const explicit = entry.data.related_entry_ids
    .map((id) => byId.get(id))
    .filter((e): e is Entry => Boolean(e) && e!.id !== entry.id);

  if (explicit.length >= limit) return explicit.slice(0, limit);

  // Fill remaining slots with same-topic entries (excluding self + already chosen).
  const chosen = new Set([entry.id, ...explicit.map((e) => e.id)]);
  const sameTopic = visible.filter(
    (e) =>
      !chosen.has(e.id) &&
      (e.data.topic === entry.data.topic ||
        e.data.secondary_topics.includes(entry.data.topic)),
  );
  return [...explicit, ...sameTopic].slice(0, limit);
}

/** The visible entry immediately older than `entry` by effective date. */
export async function getPreviousEntry(
  entry: Entry,
  now: Date = buildNow(),
): Promise<Entry | undefined> {
  const visible = await getVisibleEntries(now); // newest first
  const idx = visible.findIndex((e) => e.id === entry.id);
  return idx >= 0 && idx < visible.length - 1 ? visible[idx + 1] : undefined;
}
