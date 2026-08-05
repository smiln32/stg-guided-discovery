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
//
// ---- Where the five formats came from ---------------------------------------
//
// The twelve collections used to be all this file held, which meant a visitor
// with one minute and a visitor with fifteen were handed the identical link to
// the identical five-part kit. The Website Visitor Resource Guide package's
// catalog (data/stg_product_catalog.csv, 60 rows) describes what is actually
// inside each kit — five products per topic, each with its own writing load and
// energy fit — so the tiers can now offer the one piece that fits the capacity
// a visitor just named. That is what FORMATS below encodes.
//
// Three things about that import are worth knowing:
//
//   • Every row's ProductURL column is empty, so a format links to its
//     collection page, the same URL the collection entry uses. Two links to one
//     URL is the deliberate trade: the format says "this is the part for you",
//     the collection says "here is everything". When individual product pages
//     are published, only `url` here needs to change.
//   • The CSV titles carry their format ("… Journal", "… Prayer Cards"). They
//     are stored here without it, per the titles rule above — under a label
//     already reading "Printable journal", the suffix is the stutter that rule
//     exists to prevent. Nothing else about the titles is changed.
//   • Topics come from the COLLECTION, not from the CSV's single Topic column.
//     The collections' topic lists were curated against this site's taxonomy and
//     are wider than the CSV's (the anxiety kit also answers `overwhelm`; the
//     caregiving kit also answers `exhaustion`). Taking the CSV's narrower
//     column would have quietly dropped eight topics. See docs/topic-coverage.md.
// -----------------------------------------------------------------------------

/**
 * @typedef {{id:string,title:string,url:string,kind:string,blurb:string,
 *            contents:string,topics:string[],series?:string}} Product
 */

/**
 * Every shop collection bundles the same five printables — journal, Scripture
 * cards, prayer cards, a seven-day First Steps Guide, and a devotional —
 * available individually or as the collection. Verified 2026-08-04.
 */
const COLLECTION_CONTENTS =
  'Five printables — journal, devotional, Scripture cards, prayer cards, ' +
  'and a 7-day First Steps Guide. Sold together or separately.';

/** Free resources are single downloadable PDFs. */
const FREE_PDF_CONTENTS = 'A free printable PDF. No sign-up.';

/** @type {Product[]} */
const FREE_RESOURCES = [
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
    // Titled apart from the paid "Learning to Pray" series on purpose — the two
    // are different things, and offered side by side on the prayer journeys. The
    // id and the URL still say learning-to-pray: the id keeps its analytics
    // history, and the URL is the file's real name.
    id: 'free-learning-to-pray',
    title: "When You Don't Know What to Say",
    url: 'https://simplifytoglorify.com/resources/learning-to-pray.pdf',
    kind: 'free',
    blurb: 'A simple starting place for prayer, for anyone who was never taught how.',
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

];

// --- The twelve shop series --------------------------------------------------
// One row per collection. `topics` is this site's taxonomy, curated — it is
// wider than the source CSV's single Topic column, and it is what every product
// in the series inherits. `collection.blurb` names who the collection is for;
// what you get is in `contents`.
//
// `name` is the series title, carried by all five formats (the format itself is
// KIND_LABEL's job). Series ids match the source catalog's ProductID prefixes,
// so a future import of real per-product URLs lines up row for row.

/**
 * @typedef {{id:string,name:string,url:string,topics:string[],
 *            collection:{id:string,title:string,blurb:string}}} Series
 */

/** @type {Series[]} */
const SERIES = [
  {
    id: 'anxiety',
    name: 'Peace for an Anxious Heart',
    url: 'https://simplifytoglorify.com/products/anxiety/',
    topics: ['anxiety', 'overwhelm'],
    collection: {
      id: 'anxiety-collection',
      title: 'Anxiety Collection',
      blurb: 'For the worry that runs ahead of you and will not sit down.',
    },
  },
  {
    id: 'caregiving',
    name: 'Strength for the Caregiver',
    url: 'https://simplifytoglorify.com/products/caregiving/',
    topics: ['caregiving', 'exhaustion'],
    collection: {
      id: 'caregiving-collection',
      title: 'Caregiving Collection',
      blurb: 'For the daily, largely unseen work of caring for someone else.',
    },
  },
  {
    id: 'grief',
    name: 'When Someone You Love Is Gone',
    url: 'https://simplifytoglorify.com/products/grief/',
    topics: ['grief', 'loneliness'],
    collection: {
      id: 'grief-collection',
      title: 'Grief Collection',
      blurb: 'For loss that is still close, and for the long days after it.',
    },
  },
  {
    id: 'prayer',
    name: 'Learning to Pray',
    url: 'https://simplifytoglorify.com/products/prayer/',
    topics: ['learning-to-pray', 'feeling-far-from-god'],
    collection: {
      id: 'prayer-collection',
      title: 'Prayer Collection',
      blurb: 'For prayer that has gone quiet, or never quite got started.',
    },
  },
  {
    id: 'regret',
    name: 'Grace for What You Cannot Change',
    url: 'https://simplifytoglorify.com/products/regret/',
    topics: ['regret', 'forgiveness'],
    collection: {
      id: 'regret-collection',
      title: 'Regret Collection',
      blurb: 'For the thing you would undo if undoing were yours to do.',
    },
  },
  {
    id: 'faith',
    name: 'When You Feel Far From God',
    url: 'https://simplifytoglorify.com/products/faith/',
    topics: ['faith', 'hope', 'feeling-far-from-god'],
    collection: {
      id: 'faith-collection',
      title: 'Faith Collection',
      blurb: 'For faith that feels smaller than you would like it to be.',
    },
  },
  {
    id: 'trusting-god',
    name: 'When You Cannot Control the Outcome',
    url: 'https://simplifytoglorify.com/products/trusting-god/',
    topics: ['trusting-god', 'uncertainty', 'waiting'],
    collection: {
      id: 'trusting-god-collection',
      title: 'Trusting God Collection',
      blurb: 'For the stretch of road whose end you cannot see from here.',
    },
  },
  {
    id: 'patience',
    name: 'Patience for the Process',
    url: 'https://simplifytoglorify.com/products/patience/',
    topics: ['patience', 'waiting'],
    collection: {
      id: 'patience-collection',
      title: 'Patience Collection',
      blurb: 'For waiting that is taking longer than you planned for.',
    },
  },
  {
    id: 'depression',
    name: 'When Hope Feels Far Away',
    url: 'https://simplifytoglorify.com/products/depression/',
    topics: ['depression'],
    collection: {
      id: 'depression-collection',
      title: 'Depression Collection',
      blurb: 'For heaviness that does not lift on schedule.',
    },
  },
  {
    id: 'chronic-pain',
    name: 'Still Held on Hard Days',
    url: 'https://simplifytoglorify.com/products/chronic-pain/',
    topics: ['chronic-pain'],
    collection: {
      id: 'chronic-pain-collection',
      title: 'Chronic Pain Collection',
      blurb: 'For a body that hurts and a faith grown tired of asking.',
    },
  },
  {
    id: 'gratitude',
    name: 'Grace in the Small Things',
    url: 'https://simplifytoglorify.com/products/gratitude/',
    topics: ['gratitude'],
    collection: {
      id: 'gratitude-collection',
      title: 'Gratitude Collection',
      blurb: 'For learning to notice what is good, on purpose.',
    },
  },
  {
    id: 'adhd',
    name: 'Grace for the Busy Mind',
    url: 'https://simplifytoglorify.com/products/adhd/',
    topics: ['adhd'],
    collection: {
      id: 'adhd-collection',
      title: 'ADHD Collection',
      blurb: 'For a mind that moves fast and a heart that wants to be still.',
    },
  },
];

// --- The five formats every series is sold in --------------------------------
// Identical across all twelve topics in the source catalog — only the title and
// topic ever varied — so they are stated once here rather than sixty times.
//
// `blurb` is the catalog's BestFor: who this format is for. `contents` is its
// Included, and where the catalog's NotIncluded warns of a real mismatch (a
// 7-day guide is not a 30-day study; cards are not a study), that warning is
// folded in rather than stored in a field nothing renders.

/** @type {{kind:string,suffix:string,blurb:string,contents:string}[]} */
const FORMATS = [
  {
    kind: 'scripture_cards',
    suffix: 'scripture-cards',
    blurb: 'For keeping Scripture nearby without a reading or writing commitment.',
    contents:
      '30 printable cards — a verse with a brief truth or reflection. ' +
      'No teaching or journaling space.',
  },
  {
    kind: 'prayer_cards',
    suffix: 'prayer-cards',
    blurb: 'For borrowing simple prayers on the days words are hard to find.',
    contents:
      '30 printable cards — Scripture-rooted prayers written for this topic. ' +
      'No study or journaling space.',
  },
  {
    kind: 'first_steps',
    suffix: 'first-steps',
    blurb: 'A gentle starting place for low-energy, busy, or overwhelmed seasons.',
    contents:
      '7 days — a verse to hold, a prayer to borrow, a check-in, and one small ' +
      'next step. Intentionally brief; not a full 30-day study.',
  },
  {
    kind: 'devotional',
    suffix: 'devotional',
    blurb: 'For daily Scripture teaching and encouragement, with little writing asked of you.',
    contents:
      '30 days — Scripture readings, devotional reflections, application, and ' +
      'prayer. Limited writing space; not a guided journal.',
  },
  {
    kind: 'journal',
    suffix: 'journal',
    blurb: 'For deeper daily reflection, when there is time and energy to write.',
    contents:
      '30 days — Scripture readings, brief reflections, two guided prompts, ' +
      'prayer, and space to write. Asks for regular writing.',
  },
];

/** The kinds that are one piece OF a series rather than the whole set. */
export const FORMAT_KINDS = FORMATS.map((f) => f.kind);

/** @type {Product[]} */
export const PRODUCTS = [
  ...FREE_RESOURCES,
  ...SERIES.flatMap((s) => [
    {
      id: s.collection.id,
      title: s.collection.title,
      url: s.url,
      kind: 'product',
      blurb: s.collection.blurb,
      contents: COLLECTION_CONTENTS,
      topics: s.topics,
      series: s.id,
    },
    // Ids match the source catalog's ProductID exactly (`anxiety-journal`, …).
    ...FORMATS.map((f) => ({
      id: `${s.id}-${f.suffix}`,
      title: s.name,
      url: s.url,
      kind: f.kind,
      blurb: f.blurb,
      contents: f.contents,
      topics: s.topics,
      series: s.id,
    })),
  ]),
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
  first_steps: 'Printable First Steps Guide',
  product: 'Printable set',
};
