// -----------------------------------------------------------------------------
// Related product / resource catalog (mapping only — NOT a store integration).
//
// Entries reference these by id via `related_product_ids`. URLs point at the
// REAL simplifytoglorify.com product collections and free PDF resources
// (URLs verified against the live sitemap on 2026-07-14; contents verified
// against the live collection pages on 2026-08-04).
//
// `kind` drives recommendation ordering: free content and downloads are offered
// before paid products, and nothing is shown "just because it exists".
// `kind` also drives the visible label via KIND_LABEL — a reader should be able
// to tell what a thing IS (printable set, free PDF) before deciding to click.
//
// kind: 'free' | 'download' | 'journal' | 'devotional' | 'prayer_cards'
//       | 'scripture_cards' | 'first_steps' | 'product'
//
// `contents` states plainly what you get. All twelve shop collections are the
// same five-part printable kit differing only by topic, so they share one
// contents line (COLLECTION_CONTENTS).
//
// Titles name the RESOURCE only, never its format — the format is the label's
// job (KIND_LABEL), and saying it twice reads as a stutter. This matters
// because two free PDFs share a title with a blog post of the same name
// ("How to Grieve Without a Timeline", "When You're Too Tired to Pray"). They
// are genuinely different things — a ~1,300-word essay and an 11-13 page
// printable — and neither blog post links to its PDF, so this is the only
// place a reader meets both. The pair is told apart by its label ("Article" vs
// "Free PDF") and by the blurb and contents line only the PDF carries.
//
// Prices are deliberately NOT mirrored here. Nothing reads the live store, so
// any price in this file would go stale silently; the shop page is one click
// away and always current. State what a thing IS, not what it costs.
// -----------------------------------------------------------------------------

/**
 * @typedef {{id:string,title:string,url:string,kind:string,blurb:string,
 *            contents:string,topics:string[]}} Product
 */

/**
 * Every shop collection bundles the same five printables — journal, Scripture
 * cards, prayer cards, a seven-day First Steps guide, and a devotional —
 * available individually or as the collection. Verified 2026-08-04.
 */
const COLLECTION_CONTENTS =
  'Five printables — journal, devotional, Scripture cards, prayer cards, ' +
  'and a 7-day First Steps guide. Sold together or separately.';

/** Free resources are single downloadable PDFs. */
const FREE_PDF_CONTENTS = 'A free printable PDF. No sign-up.';

/** @type {Product[]} */
export const PRODUCTS = [
  // --- Free PDF resources (offered first) -----------------------------------
  {
    id: 'free-scripture-for-anxious-hearts',
    title: '5 Days of Scripture for Anxious Hearts',
    url: 'https://simplifytoglorify.com/resources/5-days-of-scripture-for-anxious-hearts.pdf',
    kind: 'free',
    blurb: 'Five days of verses to hold when worry runs ahead of you.',
    contents: FREE_PDF_CONTENTS,
    topics: ['anxiety', 'overwhelm'],
  },
  {
    id: 'free-grieve-without-a-timeline',
    title: 'How to Grieve Without a Timeline',
    url: 'https://simplifytoglorify.com/resources/how-to-grieve-without-a-timeline.pdf',
    kind: 'free',
    blurb: 'A gentle companion for sorrow that keeps its own time.',
    contents: FREE_PDF_CONTENTS,
    topics: ['grief'],
  },
  {
    id: 'free-too-tired-to-pray',
    title: "When You're Too Tired to Pray",
    url: 'https://simplifytoglorify.com/resources/when-youre-too-tired-to-pray.pdf',
    kind: 'free',
    blurb: 'Short, borrowable prayers for the days you have nothing left.',
    contents: FREE_PDF_CONTENTS,
    topics: ['exhaustion', 'caregiving', 'learning-to-pray'],
  },
  {
    id: 'free-learning-to-pray',
    title: 'Learning to Pray',
    url: 'https://simplifytoglorify.com/resources/learning-to-pray.pdf',
    kind: 'free',
    blurb: 'A simple starting place for prayer when you do not know what to say.',
    contents: FREE_PDF_CONTENTS,
    topics: ['learning-to-pray', 'feeling-far-from-god'],
  },
  {
    id: 'free-when-you-cannot-fix-it',
    title: 'When You Cannot Fix It',
    url: 'https://simplifytoglorify.com/resources/when-you-cannot-fix-it.pdf',
    kind: 'free',
    blurb: 'Gentle help for the things that are not yours to mend.',
    contents: FREE_PDF_CONTENTS,
    topics: ['regret', 'caregiving'],
  },
  {
    id: 'free-names-of-god',
    title: 'Names of God for Hard Days',
    url: 'https://simplifytoglorify.com/resources/names-of-God-for-hard-days.pdf',
    kind: 'free',
    blurb: 'Who God says He is, for the days you need reminding.',
    contents: FREE_PDF_CONTENTS,
    topics: ['faith', 'trusting-god'],
  },
  {
    id: 'free-jesus-in-the-storm',
    title: 'Finding Jesus in the Middle of the Storm',
    url: 'https://simplifytoglorify.com/resources/finding-jesus-in-the-middle-of-the-storm.pdf',
    kind: 'free',
    blurb: 'Steadying Scripture for seasons that feel out of control.',
    contents: FREE_PDF_CONTENTS,
    topics: ['uncertainty', 'trusting-god', 'waiting'],
  },

  // --- Product collections (the real shop categories) -----------------------
  // Blurbs name who the collection is for. What you get is in `contents`.
  {
    id: 'anxiety-collection',
    title: 'Anxiety Collection',
    url: 'https://simplifytoglorify.com/products/anxiety/',
    kind: 'product',
    blurb: 'For the worry that runs ahead of you and will not sit down.',
    contents: COLLECTION_CONTENTS,
    topics: ['anxiety', 'overwhelm'],
  },
  {
    id: 'caregiving-collection',
    title: 'Caregiving Collection',
    url: 'https://simplifytoglorify.com/products/caregiving/',
    kind: 'product',
    blurb: 'For the daily, largely unseen work of caring for someone else.',
    contents: COLLECTION_CONTENTS,
    topics: ['caregiving', 'exhaustion'],
  },
  {
    id: 'grief-collection',
    title: 'Grief Collection',
    url: 'https://simplifytoglorify.com/products/grief/',
    kind: 'product',
    blurb: 'For loss that is still close, and for the long days after it.',
    contents: COLLECTION_CONTENTS,
    topics: ['grief', 'loneliness'],
  },
  {
    id: 'prayer-collection',
    title: 'Prayer Collection',
    url: 'https://simplifytoglorify.com/products/prayer/',
    kind: 'product',
    blurb: 'For prayer that has gone quiet, or never quite got started.',
    contents: COLLECTION_CONTENTS,
    topics: ['learning-to-pray', 'feeling-far-from-god'],
  },
  {
    id: 'regret-collection',
    title: 'Regret Collection',
    url: 'https://simplifytoglorify.com/products/regret/',
    kind: 'product',
    blurb: 'For the thing you would undo if undoing were yours to do.',
    contents: COLLECTION_CONTENTS,
    topics: ['regret', 'forgiveness'],
  },
  {
    id: 'faith-collection',
    title: 'Faith Collection',
    url: 'https://simplifytoglorify.com/products/faith/',
    kind: 'product',
    blurb: 'For faith that feels smaller than you would like it to be.',
    contents: COLLECTION_CONTENTS,
    topics: ['faith', 'hope', 'feeling-far-from-god'],
  },
  {
    id: 'trusting-god-collection',
    title: 'Trusting God Collection',
    url: 'https://simplifytoglorify.com/products/trusting-god/',
    kind: 'product',
    blurb: 'For the stretch of road whose end you cannot see from here.',
    contents: COLLECTION_CONTENTS,
    topics: ['trusting-god', 'uncertainty', 'waiting'],
  },
  {
    id: 'patience-collection',
    title: 'Patience Collection',
    url: 'https://simplifytoglorify.com/products/patience/',
    kind: 'product',
    blurb: 'For waiting that is taking longer than you planned for.',
    contents: COLLECTION_CONTENTS,
    topics: ['patience', 'waiting'],
  },
  {
    id: 'depression-collection',
    title: 'Depression Collection',
    url: 'https://simplifytoglorify.com/products/depression/',
    kind: 'product',
    blurb: 'For heaviness that does not lift on schedule.',
    contents: COLLECTION_CONTENTS,
    topics: ['depression'],
  },
  {
    id: 'chronic-pain-collection',
    title: 'Chronic Pain Collection',
    url: 'https://simplifytoglorify.com/products/chronic-pain/',
    kind: 'product',
    blurb: 'For a body that hurts and a faith grown tired of asking.',
    contents: COLLECTION_CONTENTS,
    topics: ['chronic-pain'],
  },
  {
    id: 'gratitude-collection',
    title: 'Gratitude Collection',
    url: 'https://simplifytoglorify.com/products/gratitude/',
    kind: 'product',
    blurb: 'For learning to notice what is good, on purpose.',
    contents: COLLECTION_CONTENTS,
    topics: ['gratitude'],
  },
  {
    id: 'adhd-collection',
    title: 'ADHD Collection',
    url: 'https://simplifytoglorify.com/products/adhd/',
    kind: 'product',
    blurb: 'For a mind that moves fast and a heart that wants to be still.',
    contents: COLLECTION_CONTENTS,
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

// The label shown above each link. Says what the thing is, not where it lives —
// "Printable set" tells a reader something; "From the shop" does not. It also
// names the FORMAT, which is what separates a free PDF from an article of the
// same title (see the note at the top of this file).
export const KIND_LABEL = {
  free: 'Free PDF',
  download: 'Free download',
  scripture_cards: 'Printable cards',
  prayer_cards: 'Printable cards',
  devotional: 'Printable devotional',
  journal: 'Printable journal',
  first_steps: 'Printable guide',
  product: 'Printable set',
};
