// -----------------------------------------------------------------------------
// Choosing which resources to offer alongside an entry.
//
// Plain .mjs for the same reason guided-guards.mjs is: the Astro build, the
// tests and `npm run validate` all import this, so the rule about what a visitor
// is offered can never be enforced in one place and not another.
//
// Nothing here owns a product. Everything is resolved from src/config/products.mjs
// (the catalog) and src/config/guided.mjs (which formats a tier permits).
//
// The ordering rule the whole file serves: free before paid, the specific before
// the general, and never more than a visitor was asked to choose between.
// -----------------------------------------------------------------------------
import {
  PRODUCTS,
  PRODUCT_BY_ID,
  KIND_PRIORITY,
  FORMAT_KINDS,
} from '../config/products.mjs';

/** Every topic an entry touches, its own first. */
function entryTopics(data) {
  return new Set([data.topic, ...(data.secondary_topics ?? [])]);
}

/**
 * Products and free resources relevant to this entry, free things first.
 *
 * The entry's own `related_product_ids` are trusted first (a reviewer chose
 * them); topic matches from the shared catalog fill in behind them. Ids are
 * returned rather than objects so the page hands them straight to
 * <RelatedContent>, which stays the one place product links are rendered.
 *
 * Only whole things are filled in automatically — a free resource or a whole
 * collection. The five individual formats a collection is made of are never
 * volunteered here, because they all link to the same collection page: a page
 * with no capacity to go on would list five identical links. Choosing between
 * them needs an answer to "how much do you have in you right now?", which only a
 * journey has. See journeyProductIds. A reviewer who names a format outright in
 * `related_product_ids` still gets it.
 */
export function relatedProductIds(data, limit = 4) {
  const topics = entryTopics(data);

  const chosen = (data.related_product_ids ?? []).filter((id) => PRODUCT_BY_ID[id]);
  const byTopic = PRODUCTS.filter(
    (p) =>
      !chosen.includes(p.id) &&
      !FORMAT_KINDS.includes(p.kind) &&
      p.topics.some((t) => topics.has(t)),
  ).map((p) => p.id);

  return [...chosen, ...byTopic]
    .map((id) => PRODUCT_BY_ID[id])
    .sort((a, b) => (KIND_PRIORITY[a.kind] ?? 9) - (KIND_PRIORITY[b.kind] ?? 9))
    .slice(0, limit)
    .map((p) => p.id);
}

/** The free resource to offer when one exists for this entry. */
export function freeResource(data) {
  return relatedProductIds(data, 99)
    .map((id) => PRODUCT_BY_ID[id])
    .find((p) => p.kind === 'free' || p.kind === 'download');
}

/**
 * The one piece of a collection that suits the capacity she just named.
 *
 * The tier says which formats fit that much time and writing; the need may hoist
 * one of them (someone who came to pray is offered prayers before verses). The
 * entry's topic decides which series it comes from — its own topic before a
 * secondary one, so a grief entry is not answered with the caregiving kit
 * because both happen to touch exhaustion.
 *
 * Returns undefined when the tier names no formats or nothing matches. That is a
 * normal outcome, not an error: the collection is still offered.
 */
export function formatForTier(data, tier, need) {
  const allowed = tier?.formats ?? [];
  if (allowed.length === 0) return undefined;

  // A need may only reorder what the tier already permits — never add to it, so
  // a preference can never talk a visitor past the capacity she just named.
  const order =
    need?.prefer_format && allowed.includes(need.prefer_format)
      ? [need.prefer_format, ...allowed.filter((k) => k !== need.prefer_format)]
      : allowed;

  // A reviewer's explicit choice wins, if it is one this tier allows.
  const named = (data.related_product_ids ?? [])
    .map((id) => PRODUCT_BY_ID[id])
    .find((p) => p && order.includes(p.kind));
  if (named) return named;

  const topics = entryTopics(data);
  return PRODUCTS.filter(
    (p) => order.includes(p.kind) && p.topics.some((t) => topics.has(t)),
  ).sort(
    (a, b) =>
      Number(!a.topics.includes(data.topic)) - Number(!b.topics.includes(data.topic)) ||
      order.indexOf(a.kind) - order.indexOf(b.kind),
  )[0];
}

/**
 * What a journey offers: a free resource where one exists, the one format that
 * fits this much capacity, and the collection it belongs to.
 *
 * At most three links, in that order — free before paid, and the specific before
 * the general. The format and its collection share a URL until individual
 * product pages exist; both are shown because they answer different questions,
 * "which part of this is for me today?" and "what else is in it?".
 */
export function journeyProductIds(data, tier, need) {
  const format = formatForTier(data, tier, need);

  // The collection the chosen format came from, so the two links agree with each
  // other. With no format to follow, fall back to whichever collection the
  // entry's own related products point at.
  const fromSeries = format
    ? PRODUCTS.find((p) => p.kind === 'product' && p.series === format.series)
    : undefined;
  const fromEntry = relatedProductIds(data, 99)
    .map((id) => PRODUCT_BY_ID[id])
    .find((p) => p.kind === 'product');

  return [
    ...new Set(
      [freeResource(data), format, fromSeries ?? fromEntry]
        .filter(Boolean)
        .map((p) => p.id),
    ),
  ];
}
