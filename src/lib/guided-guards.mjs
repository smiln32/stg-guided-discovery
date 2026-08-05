// -----------------------------------------------------------------------------
// Content-quality safeguards for guided discovery.
//
// These are the checks the "Meet Me Where I Am" QA gate performed, rewritten
// against this repo's content model. Plain .mjs on purpose: `npm run validate`
// (Node) and the Astro build both import this, so a rule can never be enforced
// in one place and not the other.
//
// What is NOT re-implemented here, because this repo already enforces it more
// strictly than the imported gate did:
//
//   • "No invented or altered Scripture" — Scripture is only ever stored, never
//     derived. See src/content.config.ts.
//   • "Scripture must remain verified" — an entry cannot reach a live status
//     without scripture_verified + both reviews approved (Zod superRefine,
//     validate.mjs, and isVisible()). The guided matcher only ever sees entries
//     that already passed all three.
//
// What IS re-implemented here:
//
//   • no diagnosis language
//   • prayers follow the approved voice and format
//   • reflections and prayers are complete before a journey can be published
//   • every journey path has the content its tier promises
//
// Deliberately NOT automated (they were human review steps in the original gate
// too, for good reasons):
//
//   • Divine pronoun capitalization. Lowercase "he/him/his" legitimately refers
//     to Peter, Elijah, Naomi and others. No regex separates those from a
//     lowercase divine pronoun without failing clean writing.
//   • "A reflection says what the passage reveals about God before what it
//     means for the reader." That is a semantic ordering rule.
// -----------------------------------------------------------------------------
import {
  NEEDS,
  TIERS,
  TIER_BY_SLUG,
  DIAGNOSIS_PATTERNS,
  PRAYER_OPENINGS,
  PRAYER_CLOSING,
  SAFETY_NOTE,
} from '../config/guided.mjs';

const text = (v) => (typeof v === 'string' ? v : v == null ? '' : String(v));

/**
 * Every diagnosis phrase found in a block of text.
 * @returns {string[]} the matched phrases, verbatim
 */
export function findDiagnosisLanguage(value) {
  const s = text(value);
  const hits = [];
  for (const pattern of DIAGNOSIS_PATTERNS) {
    const m = s.match(pattern);
    if (m) hits.push(m[0]);
  }
  return hits;
}

/**
 * Does this prayer follow the approved voice?
 * A prayer addresses God by name at the start and is finished ("Amen.").
 * @returns {string[]} problems; empty means it passes
 */
export function checkPrayerVoice(value) {
  const s = text(value).trim();
  const problems = [];
  if (!s) return ['prayer is empty'];

  const opensWithAddress = PRAYER_OPENINGS.some((address) =>
    // "Lord," / "Lord Jesus," / "God, ..." — the address, then a comma.
    new RegExp(`^${address.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*,`, 'i').test(s),
  );
  if (!opensWithAddress) {
    problems.push(
      `prayer must open by addressing God (one of: ${PRAYER_OPENINGS.join(', ')}) followed by a comma`,
    );
  }
  if (!s.endsWith(PRAYER_CLOSING)) {
    problems.push(`prayer must close "${PRAYER_CLOSING}"`);
  }
  return problems;
}

/** The entry fields a tier promises a visitor. */
export function tierRequirements(tierSlug) {
  return TIER_BY_SLUG[tierSlug]?.requires ?? [];
}

/**
 * Can this entry carry a journey at this tier? An entry that would render a
 * blank "A Gentle Word for Today" or a missing next step is never offered.
 * @returns {{ok: boolean, missing: string[]}}
 */
export function entryMeetsTier(data, tierSlug) {
  const missing = tierRequirements(tierSlug).filter(
    (field) => text(data?.[field]).trim() === '',
  );
  return { ok: missing.length === 0, missing };
}

// ---- Matching (shared so the validator and the build cannot disagree) --------

/** An entry that matches none of a need's lanes. */
export const OUT_OF_LANE = Number.MAX_SAFE_INTEGER;

/**
 * How well an entry fits a need, lower is better.
 *
 * Every entry whose MAIN topic is in the lanes comes first, in lane order — so
 * "I need comfort" reaches grief before it reaches caregiving. Entries that only
 * touch a lane through a secondary topic come after all of those, again in lane
 * order. Entries outside every lane sort last; they are still eligible, because
 * a need must never dead-end, but see selectCandidates for how sparingly they
 * are used.
 */
export function laneRank(data, lanes) {
  const primary = lanes.indexOf(data.topic);
  if (primary !== -1) return primary;

  const secondary = (data.secondary_topics ?? [])
    .map((t) => lanes.indexOf(t))
    .filter((i) => i !== -1);
  // Offset by the number of lanes so no secondary match can ever outrank a
  // primary one, however long the lane list grows.
  if (secondary.length) return lanes.length + Math.min(...secondary);

  return OUT_OF_LANE;
}

/**
 * Pick the entries a need + tier opens, best fit first.
 *
 * `ordered` is every publicly visible entry, already in the library's own
 * preference order (newest effective date first) — that order is the stable
 * tie-break, so the same answers always open the same journey. Nothing here is
 * random and nothing is scored against the visitor.
 *
 * Entries outside every lane are held back. A visitor asked to choose between
 * two or three things should not be shown something unrelated to what she said
 * she needed — so an out-of-lane entry appears only as a single fallback, and
 * only when the lanes turned up nothing at all. A need must never dead-end, but
 * it also must never look like it guessed.
 *
 * This runs on plain entry data, which is why both `npm run validate` (reading
 * YAML in Node) and the Astro build (reading the content collection) can call
 * it. A coverage check that used different matching from the real site would be
 * worse than no check at all.
 */
export function selectCandidates(ordered, need, tier, max) {
  const ranked = ordered
    .map((data, index) => ({ data, index, rank: laneRank(data, need.lanes) }))
    .filter(({ data }) => entryMeetsTier(data, tier.slug).ok)
    .sort(
      (a, b) =>
        a.rank - b.rank ||
        (b.data.rotation_priority ?? 0) - (a.data.rotation_priority ?? 0) ||
        a.index - b.index,
    );

  const inLane = ranked.filter((r) => r.rank < OUT_OF_LANE);
  const chosen = inLane.length ? inLane : ranked.slice(0, 1);
  return chosen.slice(0, max).map(({ data }) => data);
}

/**
 * Everything visitor-facing that a journey can render from one entry.
 * Used by the diagnosis sweep so the check covers the words a visitor actually
 * reads, not the whole YAML file.
 */
export function journeyVisibleText(data) {
  return [
    data?.page_title,
    data?.short_title,
    data?.season_or_circumstance,
    data?.gentle_word,
    data?.prayer,
    data?.journal_question,
    data?.small_step,
    data?.carry_phrase,
  ]
    .map(text)
    .filter(Boolean);
}

/**
 * The guided configuration checks itself: every need label, question and
 * acknowledgment, and every tier label and blurb, is visitor-facing copy and is
 * held to the same no-diagnosis rule as entry content.
 * @returns {string[]} problems; empty means it passes
 */
export function checkGuidedCopy() {
  const problems = [];
  for (const need of NEEDS) {
    for (const [field, value] of Object.entries({
      label: need.label,
      question: need.question,
      acknowledgment: need.acknowledgment,
    })) {
      for (const hit of findDiagnosisLanguage(value)) {
        problems.push(`need "${need.slug}" ${field}: diagnosis language "${hit}"`);
      }
    }
    if (!need.lanes?.length) {
      problems.push(`need "${need.slug}": has no topic lanes, so it can never match an entry`);
    }
  }
  for (const tier of TIERS) {
    for (const [field, value] of Object.entries({ label: tier.label, blurb: tier.blurb })) {
      for (const hit of findDiagnosisLanguage(value)) {
        problems.push(`tier "${tier.slug}" ${field}: diagnosis language "${hit}"`);
      }
    }
  }
  problems.push(...checkSafetyNote());
  return problems;
}

/**
 * The crisis note is on every guided page, so it is the most-read copy the
 * feature owns — and the only copy whose failure mode is someone not reaching
 * help. It is held to the same no-diagnosis rule as everything else, and to one
 * rule of its own: it must still contain a way to reach a person. A well-meant
 * rewrite that softens the paragraph into sympathy and drops the number is the
 * exact failure this catches.
 *
 * @returns {string[]} problems; empty means it passes
 */
export function checkSafetyNote(note = SAFETY_NOTE) {
  const problems = [];
  for (const [field, value] of Object.entries(note ?? {})) {
    for (const hit of findDiagnosisLanguage(value)) {
      problems.push(`safety note ${field}: diagnosis language "${hit}"`);
    }
  }
  if (!/\b988\b/.test(text(note?.body))) {
    problems.push('safety note body: must name a way to reach a person (988)');
  }
  return problems;
}

/**
 * Coverage: can every need offer a real journey at every tier?
 *
 * This is the class of problem a row-by-row check cannot see — each entry is
 * individually fine, but a visitor still reaches a dead end because a need's
 * lanes and the tier's requirements disagree. `resolve` is supplied by the
 * caller so this works both in Node (validate.mjs, reading YAML) and in Astro.
 *
 * @param {(need: object, tier: object) => object[]} resolve
 *        returns the entries that need+tier would offer
 * @returns {string[]} problems; empty means every path has content
 */
export function checkJourneyCoverage(resolve) {
  const problems = [];
  for (const need of NEEDS) {
    for (const tier of TIERS) {
      const offered = resolve(need, tier) ?? [];
      if (offered.length === 0) {
        problems.push(
          `need "${need.slug}" at the ${tier.minutes}-minute tier has nothing to offer ` +
            `(no approved entry in lanes [${need.lanes.join(', ')}] has all of: ${tier.requires.join(', ')})`,
        );
        continue;
      }
      for (const data of offered) {
        const { ok, missing } = entryMeetsTier(data, tier.slug);
        if (!ok) {
          problems.push(
            `need "${need.slug}" at the ${tier.minutes}-minute tier offers "${data.slug}", ` +
              `which is missing: ${missing.join(', ')}`,
          );
        }
      }
    }
  }
  return problems;
}
