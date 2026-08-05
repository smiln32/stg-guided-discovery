// -----------------------------------------------------------------------------
// Guided discovery configuration — "Where do you need help today?"
//
// This is the visitor-facing entry point brought over from the
// "Meet Me Where I Am" journey engine. It is a MATCHING AND PRESENTATION layer
// only. It owns no Scripture, no reflections, no prayers, no products and no
// URLs of its own:
//
//   • Scripture, reflection (gentle_word), prayer, small step, journal question
//     and carry phrase all come from an approved entry in src/data/entries/.
//   • Topics come from src/config/topics.mjs.
//   • Free resources and products come from src/config/products.mjs.
//   • Visibility/approval comes from isVisible() in src/lib/entries.ts.
//
// What lives here is only the part the entry library cannot supply: the needs a
// visitor picks from, the gentle question asked of them, the line that
// acknowledges what they may be carrying, and the time/capacity tiers.
//
// Adding a journey means adding a NEED row here, not writing code — the same
// "growth rule" the original engine had.
// -----------------------------------------------------------------------------

/**
 * @typedef {Object} Need
 * @property {string} slug      URL segment. Kebab-case, permanent.
 * @property {string} label     The choice a visitor clicks ("I need comfort.")
 * @property {string} short     Short form used in headings and breadcrumbs.
 * @property {string} question  One gentle, open question. Never parsed, never
 *                              stored, never echoed back with interpretation.
 * @property {string} acknowledgment
 *                              One line that receives what the visitor may be
 *                              carrying. It never names a condition, never
 *                              summarizes the visitor, and never diagnoses.
 * @property {string[]} lanes   Topic slugs, most relevant first. The matcher
 *                              walks these in order to find entries.
 */

/**
 * The nine entry points. These merge the eight original journeys with the
 * needs named in the integration brief (comfort, clarity, steadiness,
 * encouragement, prayer, a practical next step) so neither list lost anything:
 *
 *   original journey  ->  need here
 *   peace             ->  steadiness
 *   hope              ->  hope
 *   comfort           ->  comfort
 *   wisdom            ->  clarity
 *   prayer            ->  prayer
 *   presence          ->  presence
 *   encouragement     ->  encouragement
 *   begin             ->  not-sure
 *   (new)             ->  next-step
 *
 * `lanes` are topic slugs from src/config/topics.mjs — the taxonomy is not
 * duplicated here, only referenced. A lane that has no approved entry yet is
 * skipped silently; the matcher falls through to the next one.
 *
 * @type {Need[]}
 */
export const NEEDS = [
  {
    slug: 'comfort',
    label: 'I need comfort.',
    short: 'Comfort',
    question: 'What has been on your heart lately?',
    acknowledgment:
      'There is no wrong way to grieve, and no schedule you are behind on. Thank you for bringing it here.',
    lanes: ['grief', 'loneliness', 'chronic-pain', 'caregiving', 'depression'],
  },
  {
    slug: 'steadiness',
    label: 'I need steadiness.',
    short: 'Steadiness',
    question: 'What feels hardest right now?',
    acknowledgment:
      'It makes sense that rest has been hard to find. You do not have to settle your own heart before you begin.',
    lanes: ['anxiety', 'overwhelm', 'uncertainty', 'trusting-god'],
  },
  {
    slug: 'clarity',
    label: 'I need clarity.',
    short: 'Clarity',
    question: 'What decision or question would you like to place before God?',
    acknowledgment:
      'Not knowing what to do is a real weight to carry. Thank you for being honest about it.',
    lanes: ['uncertainty', 'trusting-god', 'faith'],
  },
  {
    slug: 'encouragement',
    label: 'I need encouragement.',
    short: 'Encouragement',
    question: 'What has felt discouraging lately?',
    acknowledgment:
      'Carrying something heavy for a long time is tiring in a way other people do not always see.',
    lanes: ['depression', 'exhaustion', 'faith', 'hope'],
  },
  {
    slug: 'prayer',
    label: 'I need to pray.',
    short: 'Prayer',
    question: 'What would you like to place before God today?',
    acknowledgment:
      'Your heart is exactly what belongs here. You do not need the right words to begin.',
    lanes: ['learning-to-pray', 'feeling-far-from-god'],
  },
  {
    slug: 'next-step',
    label: 'I need one practical next step.',
    short: 'A next step',
    question: 'What is the one thing that most needs to move today?',
    acknowledgment:
      'When everything arrives at once, one next thing is enough. It does not have to be the biggest one.',
    lanes: ['overwhelm', 'adhd', 'exhaustion', 'uncertainty'],
  },
  {
    slug: 'hope',
    label: 'I need hope.',
    short: 'Hope',
    question: 'What keeps returning to your mind?',
    acknowledgment:
      'Waiting is hard, and it makes sense that this keeps coming back to you.',
    lanes: ['hope', 'waiting', 'depression', 'trusting-god'],
  },
  {
    slug: 'time-with-god',
    label: 'I want to spend time with God.',
    short: 'Time with God',
    question: 'What would you like this quiet time to hold?',
    acknowledgment:
      'Thank you for setting this time aside. Nothing here needs to be earned first.',
    lanes: ['feeling-far-from-god', 'gratitude', 'trusting-god', 'faith'],
  },
  {
    slug: 'not-sure',
    label: "I don't know where to begin.",
    short: 'A gentle beginning',
    question: 'You do not need the right words. What has been on your heart lately?',
    acknowledgment:
      'Not knowing where to begin is a beginning. You are here, and that is enough.',
    lanes: ['faith', 'learning-to-pray', 'overwhelm', 'anxiety', 'waiting'],
  },
];

export const NEED_BY_SLUG = Object.fromEntries(NEEDS.map((n) => [n.slug, n]));

/**
 * @typedef {Object} Tier
 * @property {string} slug
 * @property {number} minutes
 * @property {string} label
 * @property {string} blurb
 * @property {string[]} requires  Entry fields that MUST be present and non-empty
 *                                for an entry to be offered at this tier. This
 *                                is the "every journey path has the content its
 *                                tier promises" gate.
 * @property {{reflection:boolean, journalQuestion:boolean, goDeeper:boolean}} shows
 */

/**
 * Time / capacity tiers. Every tier requires Scripture, a prayer and a small
 * step — a visitor never leaves a journey without those three, no matter how
 * little capacity they had. Depth is what varies.
 *
 * `requires` is enforced twice: the matcher will not offer an entry that fails
 * it, and `npm run validate` fails the build if a tier cannot be satisfied at
 * all. Nothing renders a blank section.
 *
 * @type {Tier[]}
 */
export const TIERS = [
  {
    slug: 'one-minute',
    minutes: 1,
    label: 'About a minute',
    blurb: 'One verse, a short prayer to borrow, and one small step.',
    requires: ['scripture_text', 'prayer', 'small_step'],
    shows: { reflection: false, journalQuestion: false, goDeeper: false },
  },
  {
    slug: 'five-minutes',
    minutes: 5,
    label: 'About five minutes',
    blurb: 'A verse, a gentle word about it, a prayer, and one small step.',
    requires: ['scripture_text', 'gentle_word', 'prayer', 'small_step'],
    shows: { reflection: true, journalQuestion: false, goDeeper: false },
  },
  {
    slug: 'fifteen-minutes',
    minutes: 15,
    label: 'About fifteen minutes',
    blurb: 'All of that, plus a question to sit with and somewhere to go deeper.',
    requires: [
      'scripture_text',
      'gentle_word',
      'prayer',
      'small_step',
      'journal_question',
    ],
    shows: { reflection: true, journalQuestion: true, goDeeper: true },
  },
];

export const TIER_BY_SLUG = Object.fromEntries(TIERS.map((t) => [t.slug, t]));

/**
 * Translate a tier from journey words ("does this tier show a reflection?")
 * into the entry-field words <EntryArticle> expects ("render gentle_word?").
 *
 * This exists as a named function rather than a spread because the two objects
 * only happen to share one key name: handing `tier.shows` straight to
 * <EntryArticle> silently renders the full reflection at the one-minute tier,
 * since `gentleWord` is simply absent and defaults to true. It is covered by a
 * test for that reason.
 */
export function entrySectionsForTier(tier) {
  return {
    gentleWord: tier.shows.reflection,
    journalQuestion: tier.shows.journalQuestion,
  };
}

/** How many entries a journey offers a visitor to choose between. */
export const MAX_JOURNEY_CHOICES = 3;

// ---- Content-quality safeguards --------------------------------------------
// Ported from the Meet Me Where I Am QA gate. These protect the same things the
// original gate protected, applied to this repo's content model.

/**
 * Diagnosis language. "you seem" / "you appear" interpret the visitor in any
 * context, so they are rejected bare. "you are" / "you have" / "you sound" are
 * only diagnostic when they attach to a condition — bare "you have carried more
 * than one person was meant to carry" is good writing, not a diagnosis.
 */
export const DIAGNOSIS_CONDITIONS = [
  'anxious', 'anxiety', 'depressed', 'depression', 'traumatized', 'trauma',
  'ptsd', 'bipolar', 'ocd', 'burnt out', 'burned out', 'burnout',
  'grieving wrong', 'in denial', 'a narcissist', 'codependent', 'broken',
  'damaged', 'unwell', 'ill', 'sick',
];

const CONDITIONS_RE = DIAGNOSIS_CONDITIONS.join('|');

/** Applied to every visitor-facing string this feature can render. */
export const DIAGNOSIS_PATTERNS = [
  /\byou seem\b/i,
  /\byou appear\b/i,
  new RegExp(`\\byou are (?:${CONDITIONS_RE})\\b`, 'i'),
  new RegExp(`\\byou have (?:${CONDITIONS_RE})\\b`, 'i'),
  new RegExp(`\\byou're (?:${CONDITIONS_RE})\\b`, 'i'),
  new RegExp(`\\byou sound (?:${CONDITIONS_RE})\\b`, 'i'),
];

/**
 * The approved prayer voice for this library.
 *
 * NOTE: the original engine required the literal strings "Dear Father," /
 * "Lord," to open and "In Jesus' name, Amen." to close. That is a different
 * house style from the one every approved entry here already uses, which
 * addresses God directly by name and closes "Amen." Enforcing the imported
 * strings would have failed all sixteen reviewed entries, so what is enforced
 * is the RULE the original protected — a prayer is addressed to God and it is
 * finished — expressed in this library's approved voice.
 */
export const PRAYER_OPENINGS = [
  'God',
  'Father',
  'Dear Father',
  'Father of mercies',
  'Lord',
  'Dear Lord',
  'Lord Jesus',
  'Jesus',
  'Holy Spirit',
];

export const PRAYER_CLOSING = 'Amen.';

/**
 * Route segments the guided feature owns under BASE_PATH. An entry slug may
 * never collide with one, or the entry's permanent page would be shadowed.
 */
export const RESERVED_SLUGS = ['help', 'topics', 'search'];

// ---- The one thing this site is not -----------------------------------------

/**
 * The crisis note shown on every guided page.
 *
 * Brought over from the Website Visitor Resource Guide package, whose safety
 * precheck (R01) ran before everything else and overrode every other rule. That
 * precheck read what a visitor typed; there is nothing to read here — the box on
 * the need page is never sent anywhere and is never examined, and that promise is
 * worth more than a keyword scan would be. So the same duty is discharged the
 * only way a static site honestly can: the help is simply always on the page,
 * for everyone, whether or not anything was typed.
 *
 * The imported wording opened "It sounds like you may be going through something
 * very serious" — written as a reply to a message. As a standing line that both
 * reads wrong and interprets a visitor who has said nothing, which is exactly
 * what DIAGNOSIS_PATTERNS exists to prevent. What is kept is the substance: the
 * real numbers, no diagnosis, no promise about outcomes, and no product.
 *
 * `checkGuidedCopy()` sweeps this text for diagnosis language along with every
 * need and tier, so it cannot drift out of voice unnoticed.
 */
export const SAFETY_NOTE = {
  /** Deliberately not a question, and not addressed to a "you" in crisis. */
  heading: 'If you need help right now',
  body:
    'If you are in danger, or thinking of harming yourself, please reach a person ' +
    'who can help before you read anything else here. In the United States, call ' +
    'or text 988 for the Suicide and Crisis Lifeline — any hour of any day. ' +
    'Elsewhere, call your local emergency number. Nothing on this page can stand in ' +
    'for that, and there is no shame in needing it.',
};
