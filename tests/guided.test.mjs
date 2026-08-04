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
  entrySectionsForTier,
} from '../src/config/guided.mjs';
import {
  findDiagnosisLanguage, checkPrayerVoice, entryMeetsTier, journeyVisibleText,
  checkGuidedCopy, checkJourneyCoverage, selectCandidates, laneRank, OUT_OF_LANE,
} from '../src/lib/guided-guards.mjs';
import { loadAllEntries, passesPublishGate } from '../scripts/lib/entries.mjs';
import { TOPICS } from '../src/config/topics.mjs';
import { PRODUCT_BY_ID } from '../src/config/products.mjs';

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
