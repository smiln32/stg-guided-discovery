// -----------------------------------------------------------------------------
// Related product / resource catalog (mapping only — NOT a store integration).
//
// Entries reference these by id via `related_product_ids`. URLs point at the
// REAL simplifytoglorify.com product collections and free PDF resources
// (verified against the live sitemap on 2026-07-14).
//
// `kind` drives recommendation ordering: free content and downloads are offered
// before paid products, and nothing is shown "just because it exists".
//
// kind: 'free' | 'download' | 'journal' | 'devotional' | 'prayer_cards'
//       | 'scripture_cards' | 'first_steps' | 'product'
// -----------------------------------------------------------------------------

/** @typedef {{id:string,title:string,url:string,kind:string,blurb:string,topics:string[]}} Product */

/** @type {Product[]} */
export const PRODUCTS = [
  // --- Free PDF resources (offered first) -----------------------------------
  {
    id: 'free-scripture-for-anxious-hearts',
    title: '5 Days of Scripture for Anxious Hearts (free PDF)',
    url: 'https://simplifytoglorify.com/resources/5-days-of-scripture-for-anxious-hearts.pdf',
    kind: 'free',
    blurb: 'Five days of verses to hold when worry runs ahead of you.',
    topics: ['anxiety', 'overwhelm'],
  },
  {
    id: 'free-grieve-without-a-timeline',
    title: 'How to Grieve Without a Timeline (free PDF)',
    url: 'https://simplifytoglorify.com/resources/how-to-grieve-without-a-timeline.pdf',
    kind: 'free',
    blurb: 'A gentle companion for sorrow that keeps its own time.',
    topics: ['grief'],
  },
  {
    id: 'free-too-tired-to-pray',
    title: "When You're Too Tired to Pray (free PDF)",
    url: 'https://simplifytoglorify.com/resources/when-youre-too-tired-to-pray.pdf',
    kind: 'free',
    blurb: 'Short, borrowable prayers for the days you have nothing left.',
    topics: ['exhaustion', 'caregiving', 'learning-to-pray'],
  },
  {
    id: 'free-learning-to-pray',
    title: 'Learning to Pray (free PDF)',
    url: 'https://simplifytoglorify.com/resources/learning-to-pray.pdf',
    kind: 'free',
    blurb: 'A simple starting place for prayer when you do not know what to say.',
    topics: ['learning-to-pray', 'feeling-far-from-god'],
  },
  {
    id: 'free-when-you-cannot-fix-it',
    title: 'When You Cannot Fix It (free PDF)',
    url: 'https://simplifytoglorify.com/resources/when-you-cannot-fix-it.pdf',
    kind: 'free',
    blurb: 'Gentle help for the things that are not yours to mend.',
    topics: ['regret', 'caregiving'],
  },
  {
    id: 'free-names-of-god',
    title: 'Names of God for Hard Days (free PDF)',
    url: 'https://simplifytoglorify.com/resources/names-of-God-for-hard-days.pdf',
    kind: 'free',
    blurb: 'Who God says He is, for the days you need reminding.',
    topics: ['faith', 'trusting-god'],
  },
  {
    id: 'free-jesus-in-the-storm',
    title: 'Finding Jesus in the Middle of the Storm (free PDF)',
    url: 'https://simplifytoglorify.com/resources/finding-jesus-in-the-middle-of-the-storm.pdf',
    kind: 'free',
    blurb: 'Steadying Scripture for seasons that feel out of control.',
    topics: ['uncertainty', 'trusting-god', 'waiting'],
  },

  // --- Product collections (the real shop categories) -----------------------
  {
    id: 'anxiety-collection',
    title: 'Anxiety Collection',
    url: 'https://simplifytoglorify.com/products/anxiety/',
    kind: 'product',
    blurb: 'Gentle encouragement for calm, trust, and steady faith.',
    topics: ['anxiety', 'overwhelm'],
  },
  {
    id: 'caregiving-collection',
    title: 'Caregiving Collection',
    url: 'https://simplifytoglorify.com/products/caregiving/',
    kind: 'product',
    blurb: 'Encouragement for the daily work of faithful care.',
    topics: ['caregiving', 'exhaustion'],
  },
  {
    id: 'grief-collection',
    title: 'Grief Collection',
    url: 'https://simplifytoglorify.com/products/grief/',
    kind: 'product',
    blurb: 'Gentle faith-filled support for the grieving heart.',
    topics: ['grief', 'loneliness'],
  },
  {
    id: 'prayer-collection',
    title: 'Prayer Collection',
    url: 'https://simplifytoglorify.com/products/prayer/',
    kind: 'product',
    blurb: 'Simple help for building an authentic prayer life.',
    topics: ['learning-to-pray', 'feeling-far-from-god'],
  },
  {
    id: 'regret-collection',
    title: 'Regret Collection',
    url: 'https://simplifytoglorify.com/products/regret/',
    kind: 'product',
    blurb: 'Gentle encouragement for a heart learning to receive grace.',
    topics: ['regret', 'forgiveness'],
  },
  {
    id: 'faith-collection',
    title: 'Faith Collection',
    url: 'https://simplifytoglorify.com/products/faith/',
    kind: 'product',
    blurb: 'Companions for your quiet time with God.',
    topics: ['faith', 'hope', 'feeling-far-from-god'],
  },
  {
    id: 'trusting-god-collection',
    title: 'Trusting God Collection',
    url: 'https://simplifytoglorify.com/products/trusting-god/',
    kind: 'product',
    blurb: 'Faith-filled encouragement when the way ahead is unclear.',
    topics: ['trusting-god', 'uncertainty', 'waiting'],
  },
  {
    id: 'patience-collection',
    title: 'Patience Collection',
    url: 'https://simplifytoglorify.com/products/patience/',
    kind: 'product',
    blurb: "Quiet encouragement for learning to trust God's timing.",
    topics: ['patience', 'waiting'],
  },
  {
    id: 'depression-collection',
    title: 'Depression Collection',
    url: 'https://simplifytoglorify.com/products/depression/',
    kind: 'product',
    blurb: 'Gentle encouragement when your heart feels heavy.',
    topics: ['depression'],
  },
  {
    id: 'chronic-pain-collection',
    title: 'Chronic Pain Collection',
    url: 'https://simplifytoglorify.com/products/chronic-pain/',
    kind: 'product',
    blurb: 'Gentle faith-filled support for weary bodies and hearts.',
    topics: ['chronic-pain'],
  },
  {
    id: 'gratitude-collection',
    title: 'Gratitude Collection',
    url: 'https://simplifytoglorify.com/products/gratitude/',
    kind: 'product',
    blurb: "Gentle encouragement for noticing God's goodness.",
    topics: ['gratitude'],
  },
  {
    id: 'adhd-collection',
    title: 'ADHD Collection',
    url: 'https://simplifytoglorify.com/products/adhd/',
    kind: 'product',
    blurb: 'Gentle encouragement for grace, focus, and faith.',
    topics: ['adhd'],
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
