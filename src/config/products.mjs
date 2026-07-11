// -----------------------------------------------------------------------------
// Related product / resource catalog (mapping only — NOT a store integration).
//
// Entries reference these by id via `related_product_ids`. Replace the example
// URLs with the real Simplify to Glorify shop/Etsy links before publishing.
// `kind` drives recommendation ordering: free content and downloads are offered
// before paid products, and nothing is shown "just because it exists".
//
// kind: 'free' | 'download' | 'journal' | 'devotional' | 'prayer_cards'
//       | 'scripture_cards' | 'first_steps' | 'product'
// -----------------------------------------------------------------------------

/** @typedef {{id:string,title:string,url:string,kind:string,blurb:string,topics:string[]}} Product */

/** @type {Product[]} */
export const PRODUCTS = [
  {
    id: 'caregiver-strength-journal',
    title: 'Strength for the Caregiver Journal',
    url: 'https://simplifytoglorify.com/shop/strength-for-the-caregiver-journal',
    kind: 'journal',
    blurb: 'A gentle guided journal for the long, quiet work of caregiving.',
    topics: ['caregiving', 'exhaustion'],
  },
  {
    id: 'caregiver-prayer-cards',
    title: 'Prayer Cards for the Caregiver',
    url: 'https://simplifytoglorify.com/shop/caregiver-prayer-cards',
    kind: 'prayer_cards',
    blurb: 'Short, borrowable prayers for tired days.',
    topics: ['caregiving'],
  },
  {
    id: 'grace-for-what-you-cannot-change',
    title: 'Grace for What You Cannot Change',
    url: 'https://simplifytoglorify.com/shop/grace-for-what-you-cannot-change',
    kind: 'devotional',
    blurb: 'A short devotional for regret and the things we cannot undo.',
    topics: ['regret', 'forgiveness'],
  },
  {
    id: 'anxious-heart-scripture-cards',
    title: 'Scripture Cards for an Anxious Heart',
    url: 'https://simplifytoglorify.com/shop/anxious-heart-scripture-cards',
    kind: 'scripture_cards',
    blurb: 'Verses to hold when worry runs ahead of you.',
    topics: ['anxiety', 'overwhelm', 'uncertainty'],
  },
  {
    id: 'learning-to-pray-first-steps',
    title: 'Learning to Pray — First Steps',
    url: 'https://simplifytoglorify.com/shop/learning-to-pray-first-steps',
    kind: 'first_steps',
    blurb: 'A simple starting place for prayer when you do not know what to say.',
    topics: ['learning-to-pray', 'feeling-far-from-god'],
  },
  {
    id: 'grief-companion-download',
    title: 'A Companion for Grief (free download)',
    url: 'https://simplifytoglorify.com/free/grief-companion',
    kind: 'free',
    blurb: 'A free printable of gentle Scripture and prayers for sorrow.',
    topics: ['grief'],
  },
];

export const PRODUCT_BY_ID = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));

// Lower number = offered first (free/downloads before paid products).
export const KIND_PRIORITY = {
  free: 0,
  download: 1,
  scripture_cards: 2,
  prayer_cards: 2,
  devotional: 3,
  journal: 3,
  first_steps: 4,
  product: 5,
};
