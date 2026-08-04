// -----------------------------------------------------------------------------
// The matching layer for guided discovery.
//
// It answers one question: given what a visitor told us (a need, and how much
// capacity they have), which approved entry should we open, and what belongs
// around it?
//
// It creates nothing. Every piece it returns is resolved from something this
// repo already owns:
//
//   topic            <- src/config/topics.mjs, via the need's lanes
//   Scripture entry  <- src/data/entries, via getVisibleEntries() (approval gate)
//   free resource    <- src/config/products.mjs (kind: free/download)
//   products         <- src/config/products.mjs
//   next step        <- the entry's own small_step
//
// Selection is deterministic — the same answers always open the same journey.
// Nothing here is random and nothing is scored against the visitor.
// -----------------------------------------------------------------------------
import { NEEDS, TIERS, MAX_JOURNEY_CHOICES } from '../config/guided.mjs';
import { PRODUCTS, PRODUCT_BY_ID, KIND_PRIORITY } from '../config/products.mjs';
import { entryMeetsTier, selectCandidates } from './guided-guards.mjs';
import { getVisibleEntries, buildNow, type Entry, type EntryData } from './entries';
import { paths } from './urls';

export interface Need {
  slug: string;
  label: string;
  short: string;
  question: string;
  acknowledgment: string;
  lanes: string[];
}

export interface Tier {
  slug: string;
  minutes: number;
  label: string;
  blurb: string;
  requires: string[];
  shows: { reflection: boolean; journalQuestion: boolean; goDeeper: boolean };
}

export interface Product {
  id: string;
  title: string;
  url: string;
  kind: string;
  blurb: string;
  contents: string;
  topics: string[];
}

export const needs = NEEDS as Need[];
export const tiers = TIERS as Tier[];

// ---- Choosing which entries a need + tier opens ------------------------------

/**
 * The entries this need + tier can open, best fit first, capped at
 * MAX_JOURNEY_CHOICES. The first is the one the journey opens with; the rest
 * are offered as "is one of these closer to what you are carrying?".
 *
 * The ranking itself lives in guided-guards.mjs so `npm run validate` checks
 * coverage using the exact matching the site ships. Pass `visible` to avoid
 * re-querying the collection while building many pages.
 */
export async function candidatesFor(
  need: Need,
  tier: Tier,
  now: Date = buildNow(),
  visible?: Entry[],
): Promise<Entry[]> {
  // getVisibleEntries() applies the whole approval gate and returns
  // newest-effective-date first, which selectCandidates() uses as its stable
  // tie-break.
  const pool = visible ?? (await getVisibleEntries(now));
  const bySlug = new Map(pool.map((e) => [e.data.slug, e]));

  return selectCandidates(
    pool.map((e) => e.data),
    need,
    tier,
    MAX_JOURNEY_CHOICES,
  ).map((data: EntryData) => bySlug.get(data.slug) as Entry);
}

/**
 * Where one entry's journey lives.
 *
 * The entry a need + tier opens by default IS the /[need]/[tier]/ page, so it
 * gets no second URL of its own; only the alternates do. That keeps exactly one
 * built page per journey.
 */
export function journeyUrl(need: Need, tier: Tier, slug: string, candidates: Entry[]): string {
  return candidates[0]?.data.slug === slug
    ? paths.helpJourney(need.slug, tier.slug)
    : paths.helpJourneyEntry(need.slug, tier.slug, slug);
}

// ---- What belongs around the entry -------------------------------------------

/**
 * Products and free resources relevant to this entry, free things first.
 *
 * The entry's own `related_product_ids` are trusted first (a reviewer chose
 * them); topic matches from the shared catalog fill in behind them. Ids are
 * returned rather than objects so the page hands them straight to
 * <RelatedContent>, which stays the one place product links are rendered.
 */
export function relatedProductIds(data: EntryData, limit = 4): string[] {
  const topics = new Set([data.topic, ...data.secondary_topics]);

  const chosen = data.related_product_ids.filter((id) => PRODUCT_BY_ID[id]);
  const byTopic = (PRODUCTS as Product[])
    .filter((p) => !chosen.includes(p.id) && p.topics.some((t) => topics.has(t)))
    .map((p) => p.id);

  return [...chosen, ...byTopic]
    .map((id) => PRODUCT_BY_ID[id] as Product)
    .sort((a, b) => (KIND_PRIORITY[a.kind] ?? 9) - (KIND_PRIORITY[b.kind] ?? 9))
    .slice(0, limit)
    .map((p) => p.id);
}

/** The free resource to offer when one exists for this entry. */
export function freeResource(data: EntryData): Product | undefined {
  return relatedProductIds(data, 99)
    .map((id) => PRODUCT_BY_ID[id] as Product)
    .find((p) => p.kind === 'free' || p.kind === 'download');
}

export interface JourneyAlternate {
  entry: Entry;
  url: string;
}

export interface Journey {
  need: Need;
  tier: Tier;
  entry: Entry;
  /** This journey's own page. */
  url: string;
  acknowledgment: string;
  /** The other entries this need + tier could have opened, with their URLs. */
  alternates: JourneyAlternate[];
  /**
   * The free resource to lead with, when the entry has one. The one manageable
   * next step is not repeated here — it is the entry's own `small_step`, and
   * <EntryArticle> renders it, so a journey cannot show a different step from
   * the one on the entry's permanent page.
   */
  free?: Product;
  productIds: string[];
  /**
   * The same entry at the next tier up, when there is one. At the deepest tier
   * the way to go further is the entry's own permanent page, which the journey
   * always links to.
   */
  deeperUrl?: string;
  deeperTier?: Tier;
}

/**
 * Compose one journey.
 *
 * Throws if the entry cannot carry the tier. That is deliberate and matches how
 * the rest of this repo behaves: a journey that would render a blank section
 * fails the build rather than shipping.
 */
export async function buildJourney(
  need: Need,
  tier: Tier,
  entry: Entry,
  candidates: Entry[],
  now: Date = buildNow(),
  visible?: Entry[],
): Promise<Journey> {
  const { ok, missing } = entryMeetsTier(entry.data, tier.slug);
  if (!ok) {
    throw new Error(
      `Guided journey "${need.slug}/${tier.slug}" cannot open entry "${entry.data.slug}": ` +
        `missing ${missing.join(', ')}. Complete the entry, or remove the topic from the need's lanes.`,
    );
  }

  // "Stay a little longer" only appears when the deeper page genuinely exists:
  // the same entry has to be offered at that tier too.
  const nextTier = tiers[tiers.findIndex((t) => t.slug === tier.slug) + 1];
  let deeperUrl: string | undefined;
  if (nextTier) {
    const deeperCandidates = await candidatesFor(need, nextTier, now, visible);
    if (deeperCandidates.some((c) => c.id === entry.id)) {
      deeperUrl = journeyUrl(need, nextTier, entry.data.slug, deeperCandidates);
    }
  }

  return {
    need,
    tier,
    entry,
    url: journeyUrl(need, tier, entry.data.slug, candidates),
    acknowledgment: need.acknowledgment,
    alternates: candidates
      .filter((c) => c.id !== entry.id)
      .map((c) => ({ entry: c, url: journeyUrl(need, tier, c.data.slug, candidates) })),
    free: freeResource(entry.data),
    productIds: relatedProductIds(entry.data),
    deeperUrl,
    deeperTier: deeperUrl ? nextTier : undefined,
  };
}

/**
 * The breadcrumb trail for a journey page. Shared by both journey routes so the
 * two cannot drift.
 */
export function journeyCrumbs(journey: Journey) {
  return [
    { label: 'Home', href: paths.home },
    { label: 'Find help today', href: paths.help },
    { label: journey.need.short, href: paths.helpNeed(journey.need.slug) },
    { label: journey.entry.data.short_title, href: journey.url },
  ];
}

/**
 * The <head> description for a journey page. These pages are noindex — the
 * permanent entry page is the indexable one — so this is for link previews and
 * assistive technology, not for search.
 */
export function journeyDescription(journey: Journey): string {
  const d = journey.entry.data;
  return `${d.short_title} — ${d.scripture_reference} (${d.scripture_translation}), a prayer, and one small step. About ${journey.tier.minutes} minute${journey.tier.minutes === 1 ? '' : 's'}.`;
}
