// -----------------------------------------------------------------------------
// Topic library configuration.
//
// Every topic that content can be tagged with is declared here, with a stable
// slug, an approved short introduction, and a calm accent color used for Pin
// templates and topic labels. Accents are drawn from (or harmonize with) the
// brand palette and stay muted so no page is dominated by lavender or pink.
//
// A topic only gets a public archive page when it has at least MIN_ENTRIES
// approved+published entries (see src/lib/topics.js). This prevents thin,
// empty archive pages — matching the spec's "no thin pages" rule.
// -----------------------------------------------------------------------------

// A topic archive page only ships once it has this many visible entries — thin
// one-entry archives don't. Entry pages and chips degrade gracefully: they only
// link to a topic page that actually exists (see isTopicPublished).
export const MIN_TOPIC_ENTRIES = 3;

/**
 * @typedef {Object} Topic
 * @property {string} slug
 * @property {string} title
 * @property {string} intro   Approved, gentle 1–2 sentence introduction.
 * @property {string} accent  Hex accent color for labels and Pin templates.
 * @property {boolean} [alwaysPublish]  Override the min-entries gate.
 */

/** @type {Topic[]} */
export const TOPICS = [
  {
    slug: 'anxiety',
    title: 'Anxiety',
    intro:
      'When worry runs ahead of you, these are gentle places to rest — one true word at a time, without pressure to feel calm on command.',
    accent: '#7b9fb3',
  },
  {
    slug: 'overwhelm',
    title: 'Overwhelm',
    intro:
      'For the days when everything arrives at once. You do not have to carry all of it right now. Here is one thing to hold.',
    accent: '#8aa6b8',
  },
  {
    slug: 'exhaustion',
    title: 'Exhaustion',
    intro:
      'Tiredness that sleep does not fix is still real. These encouragements meet you gently, without asking you to perform.',
    accent: '#9fb0a6',
  },
  {
    slug: 'caregiving',
    title: 'Caregiving',
    intro:
      'For the woman quietly holding someone else together. You are seen, and your own weariness matters here too.',
    accent: '#b2c6b1',
  },
  {
    slug: 'grief',
    title: 'Grief',
    intro:
      'Grief keeps its own time. Nothing here will rush you. These are companions for sorrow, not solutions for it.',
    accent: '#8f9bb0',
  },
  {
    slug: 'chronic-pain',
    title: 'Chronic Pain',
    intro:
      'Living with pain that does not leave asks a great deal of a body and a heart. Come as you are, for as long as you can.',
    accent: '#a99bb0',
  },
  {
    slug: 'depression',
    title: 'Depression',
    intro:
      'On the heavy days, even small truths can be hard to reach. These are here whenever you can receive them, no striving required.',
    accent: '#8a93a6',
  },
  {
    slug: 'regret',
    title: 'Regret',
    intro:
      'For the things you cannot undo. Grace is wider than the moment you keep returning to. Begin here, gently.',
    accent: '#b0a0a0',
  },
  {
    slug: 'waiting',
    title: 'Waiting',
    intro:
      'The in-between is hard to sit inside. These words are for the long middle, when the answer has not come yet.',
    accent: '#c6b5c8',
  },
  {
    slug: 'uncertainty',
    title: 'Uncertainty',
    intro:
      'When the road ahead is unclear, you do not need the whole map today. Here is light for one next step.',
    accent: '#9aa9bd',
  },
  {
    slug: 'learning-to-pray',
    title: 'Learning to Pray',
    intro:
      'If you do not know what to say, you are still welcome to pray. These are simple, borrowable words to begin with.',
    accent: '#a6b8c2',
  },
  {
    slug: 'trusting-god',
    title: 'Trusting God',
    intro:
      'Trust is often quiet and slow. These encouragements are for choosing it again in small, honest ways.',
    accent: '#9db59c',
  },
  {
    slug: 'feeling-far-from-god',
    title: 'Feeling Far From God',
    intro:
      'Distance you can feel does not mean He has moved. These are gentle steps back toward a presence that never left.',
    accent: '#9a94ad',
  },
  {
    slug: 'loneliness',
    title: 'Loneliness',
    intro:
      'Being unseen is a particular ache. Here is companionship for it, and a reminder that you are not as alone as it feels.',
    accent: '#a3a7bd',
  },
  {
    slug: 'forgiveness',
    title: 'Forgiveness',
    intro:
      'Forgiveness is rarely quick and never a performance. Take these slowly, at the pace your heart can actually go.',
    accent: '#b3a9b4',
  },
  {
    slug: 'patience',
    title: 'Patience',
    intro:
      'Patience is not pretending you do not mind. It is staying tender while you wait. These are for that quieter kind of strength.',
    accent: '#aab9a6',
  },
  {
    slug: 'hope',
    title: 'Hope',
    intro:
      'Hope does not require you to feel optimistic. It only asks you to keep one small door open. Here is a hand on the latch.',
    accent: '#a8bfb0',
  },
  {
    slug: 'gratitude',
    title: 'Gratitude',
    intro:
      'Not the forced kind. Just noticing one true good thing, even on a hard day, and letting it be enough for now.',
    accent: '#bdc3a6',
  },
  {
    slug: 'faith',
    title: 'Faith',
    intro:
      'Faith is often smaller and steadier than we expect. These are for holding on when you cannot see far.',
    accent: '#9fb3ba',
  },
  {
    slug: 'adhd',
    title: 'ADHD',
    intro:
      'For minds that move quickly and hearts that tire of trying to keep up. Gentle, doable encouragement — no shame attached.',
    accent: '#a5b0bd',
  },
];

export const TOPIC_BY_SLUG = Object.fromEntries(TOPICS.map((t) => [t.slug, t]));
