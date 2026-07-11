// -----------------------------------------------------------------------------
// Email program configuration: signup taxonomy, welcome series, 7-day journeys,
// and subscriber segments. This is the ARCHITECTURE + content contract. Actual
// sending is handled by the provider layer (src/lib/email/) which ships with a
// dev-safe mock and swaps to Zoho Campaigns or Zoho SMTP via env vars.
// -----------------------------------------------------------------------------

// Topic options shown at signup (spec §11).
export const EMAIL_TOPICS = [
  { value: 'anxiety-overwhelm', label: 'Anxiety and overwhelm' },
  { value: 'caregiving', label: 'Caregiving' },
  { value: 'grief', label: 'Grief' },
  { value: 'chronic-pain', label: 'Chronic pain' },
  { value: 'discouragement', label: 'Discouragement' },
  { value: 'trusting-god', label: 'Trusting God' },
  { value: 'learning-to-pray', label: 'Learning to pray' },
  { value: 'waiting-uncertainty', label: 'Waiting and uncertainty' },
  { value: 'feeling-far-from-god', label: 'Feeling far from God' },
  { value: 'general', label: 'General encouragement' },
  { value: 'unsure', label: 'I am not sure' },
];
export const EMAIL_TOPIC_VALUES = EMAIL_TOPICS.map((t) => t.value);

export const FREQUENCIES = [
  { value: 'daily', label: 'A gentle note most days' },
  { value: 'weekly', label: 'A weekly digest' },
  { value: 'occasional', label: 'Only now and then' },
];
export const FREQUENCY_VALUES = FREQUENCIES.map((f) => f.value);

// Map a content topic slug to the closest signup topic, so an entry page can
// pre-select a relevant option. Falls back to 'general'.
export const CONTENT_TO_EMAIL_TOPIC = {
  anxiety: 'anxiety-overwhelm',
  overwhelm: 'anxiety-overwhelm',
  exhaustion: 'caregiving',
  caregiving: 'caregiving',
  grief: 'grief',
  'chronic-pain': 'chronic-pain',
  depression: 'discouragement',
  regret: 'discouragement',
  waiting: 'waiting-uncertainty',
  uncertainty: 'waiting-uncertainty',
  'learning-to-pray': 'learning-to-pray',
  'trusting-god': 'trusting-god',
  'feeling-far-from-god': 'feeling-far-from-god',
  loneliness: 'general',
  forgiveness: 'general',
  patience: 'general',
  hope: 'general',
  gratitude: 'general',
  faith: 'general',
  adhd: 'general',
};

export function emailTopicForContentTopic(slug) {
  return CONTENT_TO_EMAIL_TOPIC[slug] || 'general';
}

// -------- Welcome series (spec §12A) ----------------------------------------
// Four short emails. `entrySlug` (optional) pulls Scripture/prayer from an
// approved entry so the copy stays reviewed rather than authored in the ESP.
export const WELCOME_SERIES = {
  id: 'welcome',
  name: 'Welcome to A Gentle Note',
  emails: [
    {
      day: 0,
      key: 'welcome-1',
      subject: 'Welcome — you do not have to carry it all today',
      preview: 'One Scripture, one prayer, one small step at a time.',
      purpose:
        'Explain what arrives, set a gentle expectation, link to today’s encouragement, invite a topic choice.',
      cta_text: 'Read today’s encouragement',
      cta_path: '/hold-this-today/',
      entrySlug: 'a-gentle-place-to-begin',
    },
    {
      day: 2,
      key: 'welcome-2',
      subject: 'How to use Hold This Today',
      preview: 'Read one. Save one. Carry one question.',
      purpose:
        'Read one entry, save one Pin, carry one question, explore by need.',
      cta_text: 'Browse by need',
      cta_path: '/hold-this-today/topics/',
    },
    {
      day: 4,
      key: 'welcome-3',
      subject: 'A helpful place to start',
      preview: 'A gentle entry chosen for where you are.',
      purpose: 'Send a topic-relevant entry and one related resource.',
      cta_text: 'Read this encouragement',
      cta_path: '/hold-this-today/',
      topicRelevant: true,
    },
    {
      day: 6,
      key: 'welcome-4',
      subject: 'Would you like to keep receiving these?',
      preview: 'Choose how often, or begin a seven-day journey.',
      purpose:
        'Present delivery options, invite a seven-day journey, mention products only if appropriate.',
      cta_text: 'Choose your rhythm',
      cta_path: '/hold-this-today/preferences/',
    },
  ],
};

// -------- Seven-day journeys (spec §12D) ------------------------------------
// Each day references an approved entry slug (reused across the site) so the
// journey never introduces unreviewed Scripture. Slugs may repeat the same
// entry only intentionally; here they map to the sample library plus room to
// grow. Missing slugs are simply skipped by the renderer with a warning.
export const JOURNEYS = [
  {
    slug: 'seven-days-for-an-anxious-heart',
    title: 'Seven Days for an Anxious Heart',
    topic: 'anxiety',
    description:
      'A gentle, week-long companion for worry — one Scripture, one prayer, and one small step each day.',
    days: [
      'when-you-are-worried-about-what-comes-next',
      'when-the-waiting-feels-too-long',
      'a-gentle-place-to-begin',
      'when-you-dont-know-what-to-pray',
      'for-the-caregiver-who-is-running-on-empty',
      'when-the-grief-comes-in-waves',
      'for-the-thing-you-cannot-undo',
    ],
  },
  {
    slug: 'seven-days-for-the-caregiver',
    title: 'Seven Days of Encouragement for the Caregiver',
    topic: 'caregiving',
    description:
      'For the woman quietly holding someone else together — a week of gentle, borrowable strength.',
    days: [
      'for-the-caregiver-who-is-running-on-empty',
      'when-you-are-worried-about-what-comes-next',
      'when-you-dont-know-what-to-pray',
      'a-gentle-place-to-begin',
      'when-the-waiting-feels-too-long',
      'for-the-thing-you-cannot-undo',
      'when-the-grief-comes-in-waves',
    ],
  },
  {
    slug: 'seven-days-of-learning-to-pray',
    title: 'Seven Days of Learning to Pray',
    topic: 'learning-to-pray',
    description:
      'If you do not know what to say, begin here — one simple, borrowable prayer a day.',
    days: [
      'when-you-dont-know-what-to-pray',
      'a-gentle-place-to-begin',
      'when-you-are-worried-about-what-comes-next',
      'when-the-waiting-feels-too-long',
      'for-the-caregiver-who-is-running-on-empty',
      'for-the-thing-you-cannot-undo',
      'when-the-grief-comes-in-waves',
    ],
  },
];

export const JOURNEY_BY_SLUG = Object.fromEntries(JOURNEYS.map((j) => [j.slug, j]));

// -------- Segments (spec §13) ------------------------------------------------
// Descriptive, non-invasive segments. NEVER infer a diagnosis from behavior.
export const SEGMENTS = [
  { key: 'topic', label: 'Signup topic', example: 'Selected “caregiving”.' },
  { key: 'frequency', label: 'Selected frequency', example: 'Prefers weekly.' },
  { key: 'journey', label: 'Journey enrollment', example: 'In “Seven Days for an Anxious Heart”.' },
  { key: 'status', label: 'Subscriber status', example: 'Confirmed / pending / unsubscribed.' },
  { key: 'content_interest', label: 'Content interests', example: 'Opened waiting-themed entries.' },
  { key: 'product_interest', label: 'Product interest', example: 'Clicked a caregiving journal.' },
  { key: 'last_engagement', label: 'Last engagement', example: 'Last opened 12 days ago.' },
  { key: 'date_subscribed', label: 'Date subscribed', example: 'Joined 2026-07-01.' },
  { key: 'source_campaign', label: 'Source campaign', example: 'utm_campaign=hold-this-today.' },
  { key: 'source_pin', label: 'Pinterest source Pin', example: 'utm_content=prayer.' },
  { key: 'completed_journey', label: 'Completed journey', example: 'Finished the caregiver journey.' },
];
