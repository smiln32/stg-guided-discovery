// Tests for the guided-discovery safeguards and matching layer.
// Run: npm test   (Node's built-in test runner; no new dependencies)
//
// Two kinds of test live here:
//   • unit tests, which prove each guard actually rejects what it claims to —
//     a guard that has never been seen to fail is not a guard;
//   • integration tests over the real entry library, which prove the content
//     that ships today satisfies those guards and that every journey path a
//     visitor can take has content behind it.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  NEEDS, TIERS, RESERVED_SLUGS, MAX_JOURNEY_CHOICES, PRAYER_CLOSING,
  entrySectionsForTier, SAFETY_NOTE,
} from '../src/config/guided.mjs';
import {
  findDiagnosisLanguage, checkPrayerVoice, entryMeetsTier, journeyVisibleText,
  checkGuidedCopy, checkJourneyCoverage, selectCandidates, laneRank, OUT_OF_LANE,
  checkSafetyNote,
} from '../src/lib/guided-guards.mjs';
import { loadAllEntries, passesPublishGate } from '../scripts/lib/entries.mjs';
import { TOPICS } from '../src/config/topics.mjs';
import {
  PRODUCTS, PRODUCT_BY_ID, FORMAT_KINDS, KIND_LABEL, KIND_PRIORITY,
} from '../src/config/products.mjs';
import {
  relatedProductIds, formatForTier, journeyProductIds,
} from '../src/lib/product-match.mjs';

const need = (over = {}) => ({
  slug: 'test', label: 'l', short: 's', question: 'q', acknowledgment: 'a',
  lanes: ['grief'], ...over,
});
const tier = (slug) => TIERS.find((t) => t.slug === slug);
const entry = (over = {}) => ({
  slug: 'x', topic: 'grief', secondary_topics: [], rotation_priority: 0,
  scripture_text: 'text', gentle_word: 'word', prayer: 'God, hear me. Amen.',
  small_step: 'step', journal_question: 'question', ...over,
});

// --- No diagnosis language ---------------------------------------------------

test('diagnosis check rejects interpreting the visitor', () => {
  assert.deepEqual(findDiagnosisLanguage('You seem tired today.'), ['You seem']);
  assert.deepEqual(findDiagnosisLanguage('you appear overwhelmed'), ['you appear']);
  assert.deepEqual(findDiagnosisLanguage('You are anxious.'), ['You are anxious']);
  assert.deepEqual(findDiagnosisLanguage("you're depressed"), ["you're depressed"]);
  assert.deepEqual(findDiagnosisLanguage('you have burnout'), ['you have burnout']);
});

test('diagnosis check allows ordinary second-person writing', () => {
  // "you have"/"you are" only diagnose when a condition follows. Rejecting them
  // bare would fail clean writing and train everyone to ignore the check.
  for (const clean of [
    'when you have carried more than one person was meant to carry',
    'Thank You that You have not forgotten me',
    'You are welcome here exactly as you are',
    'you are tired in a place sleep does not reach',
  ]) {
    assert.deepEqual(findDiagnosisLanguage(clean), [], clean);
  }
});

// --- Prayer voice ------------------------------------------------------------

test('prayer voice requires an address to God and a close', () => {
  assert.deepEqual(checkPrayerVoice('God, hear me. Amen.'), []);
  assert.deepEqual(checkPrayerVoice('Father of mercies, hear me. Amen.'), []);
  assert.deepEqual(checkPrayerVoice('Holy Spirit, carry this. Amen.'), []);

  assert.equal(checkPrayerVoice('Please help me today. Amen.').length, 1);
  assert.equal(checkPrayerVoice('God, hear me.').length, 1);
  assert.equal(checkPrayerVoice('Please help me today.').length, 2);
  assert.deepEqual(checkPrayerVoice('   '), ['prayer is empty']);
});

test('prayer voice does not accept an address that only looks like one', () => {
  // "Father of mercies" opens correctly; "Fatherhood" does not.
  assert.equal(checkPrayerVoice('Fatherhood, hear me. Amen.').length, 1);
});

// --- Tier requirements -------------------------------------------------------

test('a tier will not open an entry that cannot carry it', () => {
  assert.equal(entryMeetsTier(entry(), 'one-minute').ok, true);
  assert.equal(entryMeetsTier(entry(), 'fifteen-minutes').ok, true);

  const noStep = entryMeetsTier(entry({ small_step: '  ' }), 'one-minute');
  assert.equal(noStep.ok, false);
  assert.deepEqual(noStep.missing, ['small_step']);

  // A missing reflection is fine at one minute (no reflection is shown) and
  // fatal at five (one is promised).
  assert.equal(entryMeetsTier(entry({ gentle_word: '' }), 'one-minute').ok, true);
  assert.equal(entryMeetsTier(entry({ gentle_word: '' }), 'five-minutes').ok, false);

  // Likewise the journal question, which only the fifteen-minute tier shows.
  assert.equal(entryMeetsTier(entry({ journal_question: '' }), 'five-minutes').ok, true);
  assert.equal(entryMeetsTier(entry({ journal_question: '' }), 'fifteen-minutes').ok, false);
});

test('every tier promises Scripture, a prayer and a small step', () => {
  for (const t of TIERS) {
    for (const field of ['scripture_text', 'prayer', 'small_step']) {
      assert.ok(t.requires.includes(field), `${t.slug} must require ${field}`);
    }
  }
});

test('a tier renders exactly the sections it promises', () => {
  // Regression: tier.shows was handed to <EntryArticle> directly, which reads
  // `gentleWord`, not `reflection`. The key was simply absent, defaulted to
  // true, and the one-minute tier quietly rendered the full reflection.
  assert.deepEqual(entrySectionsForTier(tier('one-minute')), {
    gentleWord: false, journalQuestion: false,
  });
  assert.deepEqual(entrySectionsForTier(tier('five-minutes')), {
    gentleWord: true, journalQuestion: false,
  });
  assert.deepEqual(entrySectionsForTier(tier('fifteen-minutes')), {
    gentleWord: true, journalQuestion: true,
  });

  // A tier that shows a section must also require its field, or the section can
  // render blank.
  for (const t of TIERS) {
    const sections = entrySectionsForTier(t);
    if (sections.gentleWord) assert.ok(t.requires.includes('gentle_word'), t.slug);
    if (sections.journalQuestion) assert.ok(t.requires.includes('journal_question'), t.slug);
  }
});

// --- Matching ----------------------------------------------------------------

test('lane rank prefers a primary topic, then a secondary, then nothing', () => {
  const lanes = ['grief', 'caregiving'];
  assert.equal(laneRank({ topic: 'grief', secondary_topics: [] }, lanes), 0);
  assert.equal(laneRank({ topic: 'caregiving', secondary_topics: [] }, lanes), 1);
  assert.equal(laneRank({ topic: 'anxiety', secondary_topics: [] }, lanes), OUT_OF_LANE);

  // A secondary match never outranks a primary one, however far down the lane
  // list the primary match sits.
  const lastLane = laneRank({ topic: 'caregiving', secondary_topics: [] }, lanes);
  const bestSecondary = laneRank({ topic: 'anxiety', secondary_topics: ['grief'] }, lanes);
  assert.ok(bestSecondary > lastLane);
  assert.ok(bestSecondary < OUT_OF_LANE);
});

test('matching is deterministic and follows lane order', () => {
  const pool = [
    entry({ slug: 'caregiving-one', topic: 'caregiving' }),
    entry({ slug: 'grief-one', topic: 'grief' }),
    entry({ slug: 'unrelated', topic: 'adhd' }),
  ];
  const n = need({ lanes: ['grief', 'caregiving'] });
  const first = selectCandidates(pool, n, tier('five-minutes'), 3);
  const again = selectCandidates(pool, n, tier('five-minutes'), 3);

  assert.deepEqual(first.map((e) => e.slug), ['grief-one', 'caregiving-one']);
  assert.deepEqual(first.map((e) => e.slug), again.map((e) => e.slug));
});

test('an out-of-lane entry is only ever a last resort, and only one of them', () => {
  const pool = [
    entry({ slug: 'a', topic: 'adhd' }),
    entry({ slug: 'b', topic: 'gratitude' }),
  ];
  const chosen = selectCandidates(pool, need({ lanes: ['grief'] }), tier('one-minute'), 3);
  assert.equal(chosen.length, 1, 'a need never dead-ends, but never guesses twice either');
});

test('matching skips entries that cannot carry the tier, and caps the choice', () => {
  const pool = [
    entry({ slug: 'a', topic: 'grief', journal_question: '' }),
    entry({ slug: 'b', topic: 'grief' }),
    entry({ slug: 'c', topic: 'grief' }),
    entry({ slug: 'd', topic: 'grief' }),
  ];
  const n = need({ lanes: ['grief'] });
  assert.deepEqual(
    selectCandidates(pool, n, tier('fifteen-minutes'), 3).map((e) => e.slug),
    ['b', 'c', 'd'],
  );
  assert.equal(selectCandidates(pool, n, tier('one-minute'), 2).length, 2);
});

// --- Which product a tier offers ---------------------------------------------

test('every tier names formats that exist in the catalog', () => {
  for (const t of TIERS) {
    assert.ok(t.formats?.length, `${t.slug} offers no format`);
    for (const kind of t.formats) {
      assert.ok(FORMAT_KINDS.includes(kind), `${t.slug} names unknown format "${kind}"`);
      assert.ok(
        PRODUCTS.some((p) => p.kind === kind),
        `${t.slug} names format "${kind}", which no product has`,
      );
    }
  }
});

test('a need may only reorder the formats its tier already allows', () => {
  for (const n of NEEDS) {
    if (!n.prefer_format) continue;
    assert.ok(FORMAT_KINDS.includes(n.prefer_format), n.slug);
    assert.ok(
      TIERS.some((t) => t.formats.includes(n.prefer_format)),
      `need "${n.slug}" prefers "${n.prefer_format}", which no tier allows`,
    );
  }
});

test('capacity decides the format: cards at a minute, a journal at fifteen', () => {
  const d = { topic: 'anxiety', secondary_topics: [], related_product_ids: [] };
  const n = need({ lanes: ['anxiety'] });

  assert.equal(formatForTier(d, tier('one-minute'), n).kind, 'scripture_cards');
  assert.equal(formatForTier(d, tier('five-minutes'), n).kind, 'first_steps');
  assert.equal(formatForTier(d, tier('fifteen-minutes'), n).kind, 'journal');

  // …and it comes from the series that matches the topic.
  assert.equal(formatForTier(d, tier('one-minute'), n).id, 'anxiety-scripture-cards');
});

test('a need can reorder within a tier but cannot escape it', () => {
  const d = { topic: 'learning-to-pray', secondary_topics: [], related_product_ids: [] };
  const praying = need({ lanes: ['learning-to-pray'], prefer_format: 'prayer_cards' });
  const other = need({ lanes: ['learning-to-pray'] });

  // Someone who came to pray is offered prayers to borrow, not verses to read.
  assert.equal(formatForTier(d, tier('one-minute'), praying).kind, 'prayer_cards');
  assert.equal(formatForTier(d, tier('one-minute'), other).kind, 'scripture_cards');

  // The preference is ignored at a tier that does not allow that format — a
  // need must never talk a visitor past the capacity she just named.
  assert.equal(formatForTier(d, tier('fifteen-minutes'), praying).kind, 'journal');
});

test("an entry's own topic outranks a secondary one when picking the series", () => {
  // Both the grief and caregiving kits answer this entry; its own topic wins.
  const d = { topic: 'grief', secondary_topics: ['caregiving'], related_product_ids: [] };
  const chosen = formatForTier(d, tier('five-minutes'), need({ lanes: ['grief'] }));
  assert.equal(chosen.series, 'grief');
});

test('a journey offers a free resource, one format, and its collection', () => {
  const d = {
    topic: 'anxiety',
    secondary_topics: [],
    related_product_ids: ['free-scripture-for-anxious-hearts'],
  };
  const ids = journeyProductIds(d, tier('one-minute'), need({ lanes: ['anxiety'] }));

  assert.deepEqual(ids, [
    'free-scripture-for-anxious-hearts',
    'anxiety-scripture-cards',
    'anxiety-collection',
  ]);
  // The format and its collection must be the same series, or the page offers
  // one topic's cards next to another topic's set.
  assert.equal(PRODUCT_BY_ID['anxiety-scripture-cards'].series, 'anxiety-collection'
    .replace('-collection', ''));
});

test('an entry page is never offered the five formats it cannot choose between', () => {
  // They all link to the same collection page, so listing them would be five
  // identical links. Only a journey, which knows the capacity, picks one.
  const d = { topic: 'anxiety', secondary_topics: [], related_product_ids: [] };
  for (const id of relatedProductIds(d, 99)) {
    assert.ok(!FORMAT_KINDS.includes(PRODUCT_BY_ID[id].kind), id);
  }
});

test('a reviewer who names a format outright still gets it', () => {
  const d = {
    topic: 'anxiety',
    secondary_topics: [],
    related_product_ids: ['anxiety-prayer-cards'],
  };
  // Present even though it is a format — but still behind the free resource,
  // because free-before-paid outranks a reviewer's ordering.
  assert.ok(relatedProductIds(d, 99).includes('anxiety-prayer-cards'));
  assert.equal(relatedProductIds(d, 99)[0], 'free-scripture-for-anxious-hearts');
  assert.equal(
    formatForTier(d, tier('one-minute'), need({ lanes: ['anxiety'] })).id,
    'anxiety-prayer-cards',
  );
});

test('every product in the catalog has a title, a real URL and known topics', () => {
  const topicSlugs = new Set(TOPICS.map((t) => t.slug));
  const ids = new Set();
  for (const p of PRODUCTS) {
    assert.ok(!ids.has(p.id), `duplicate product id ${p.id}`);
    ids.add(p.id);
    assert.ok(p.title?.trim(), p.id);
    assert.ok(p.blurb?.trim() && p.contents?.trim(), p.id);
    assert.match(p.url, /^https:\/\/simplifytoglorify\.com\//, p.id);
    assert.ok(p.topics.length > 0, p.id);
    for (const t of p.topics) {
      assert.ok(topicSlugs.has(t), `product ${p.id} references unknown topic "${t}"`);
    }
    assert.ok(KIND_LABEL[p.kind], `product ${p.id} has unlabelled kind "${p.kind}"`);
    assert.ok(KIND_PRIORITY[p.kind] !== undefined, `${p.id}: kind has no priority`);
  }
});

test('titles do not repeat the format their label already states', () => {
  // "Printable journal — Peace for an Anxious Heart Journal" is the stutter this
  // prevents. See the note at the top of src/config/products.mjs.
  for (const p of PRODUCTS.filter((x) => FORMAT_KINDS.includes(x.kind))) {
    assert.doesNotMatch(
      p.title,
      /\b(journal|devotional|cards|first steps|guide)\b$/i,
      `${p.id}: title ends with its own format`,
    );
  }
});

test('coverage reports a need that has nothing to offer', () => {
  const problems = checkJourneyCoverage(() => []);
  assert.equal(problems.length, NEEDS.length * TIERS.length);
  assert.match(problems[0], /has nothing to offer/);
});

test('coverage reports an entry that cannot carry the tier it was offered at', () => {
  const problems = checkJourneyCoverage(() => [entry({ slug: 'thin', small_step: '' })]);
  assert.ok(problems.some((p) => /"thin", which is missing: small_step/.test(p)));
});

// --- The shipped configuration ------------------------------------------------

test('the guided configuration passes its own checks', () => {
  assert.deepEqual(checkGuidedCopy(), []);
});

test('the crisis note names real help, diagnoses nobody, and sells nothing', () => {
  // The whole point of the note is the phone number. A rewrite that loses it
  // leaves a paragraph of sympathy and no way to reach a person.
  assert.match(SAFETY_NOTE.body, /\b988\b/);
  assert.match(SAFETY_NOTE.body, /emergency number/i);

  // It is the most-read copy the feature owns, so it is held to the same rule
  // as everything else a visitor reads.
  assert.deepEqual(findDiagnosisLanguage(SAFETY_NOTE.body), []);
  assert.deepEqual(findDiagnosisLanguage(SAFETY_NOTE.heading), []);

  // No product, and no promise about how things will turn out.
  assert.doesNotMatch(SAFETY_NOTE.body, /journal|devotional|printable|shop|collection/i);
  assert.doesNotMatch(SAFETY_NOTE.body, /will (get|be) better|heal|cure/i);
});

test('a crisis note that loses its number, or diagnoses, is reported', () => {
  assert.deepEqual(checkSafetyNote(), [], 'the shipped note passes');

  const softened = {
    heading: SAFETY_NOTE.heading,
    body: 'If today is hard, please reach out to someone you trust.',
  };
  assert.deepEqual(checkSafetyNote(softened), [
    'safety note body: must name a way to reach a person (988)',
  ]);

  const diagnosing = { heading: 'Help', body: 'You seem depressed. Call 988.' };
  assert.ok(checkSafetyNote(diagnosing).some((p) => /diagnosis language/.test(p)));
});

test('every need points at real topics and has a unique slug', () => {
  const topicSlugs = new Set(TOPICS.map((t) => t.slug));
  const seen = new Set();
  for (const n of NEEDS) {
    assert.ok(!seen.has(n.slug), `duplicate need slug ${n.slug}`);
    seen.add(n.slug);
    assert.match(n.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    for (const lane of n.lanes) {
      assert.ok(topicSlugs.has(lane), `need ${n.slug} references unknown topic "${lane}"`);
    }
  }
});

// --- The shipped content ------------------------------------------------------

const all = await loadAllEntries();
const live = all
  .map(({ data }) => data)
  .filter((d) => passesPublishGate(d))
  .sort(
    (a, b) =>
      new Date(b.featured_date ?? b.publish_date ?? b.updated_at ?? b.created_at ?? 0) -
      new Date(a.featured_date ?? a.publish_date ?? a.updated_at ?? a.created_at ?? 0),
  );

test('the library has published entries to build journeys from', () => {
  assert.ok(live.length > 0);
});

test('no entry uses diagnosis language anywhere a visitor can read it', () => {
  for (const { data } of all) {
    for (const block of journeyVisibleText(data)) {
      assert.deepEqual(findDiagnosisLanguage(block), [], `${data.slug}: ${block.slice(0, 60)}`);
    }
  }
});

test('every prayer follows the approved voice', () => {
  for (const { data } of all) {
    assert.deepEqual(checkPrayerVoice(data.prayer), [], data.slug);
    assert.ok(data.prayer.trim().endsWith(PRAYER_CLOSING));
  }
});

test('no entry slug collides with a route guided discovery owns', () => {
  for (const { data } of all) {
    assert.ok(!RESERVED_SLUGS.includes(data.slug), `${data.slug} is a reserved segment`);
  }
});

test('every journey path a visitor can take has content behind it', () => {
  const problems = checkJourneyCoverage((n, t) =>
    selectCandidates(live, n, t, MAX_JOURNEY_CHOICES),
  );
  assert.deepEqual(problems, []);
});

test('every product a matched entry references exists in the catalog', () => {
  for (const { data } of all) {
    for (const id of data.related_product_ids ?? []) {
      assert.ok(PRODUCT_BY_ID[id], `${data.slug} references unknown product "${id}"`);
    }
  }
});
