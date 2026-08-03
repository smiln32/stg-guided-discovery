// -----------------------------------------------------------------------------
// Daily entry resolver.
//
// Decides which entry the landing page (BASE_PATH) shows for a given day,
// with a defined, never-blank fallback chain:
//   1. An entry explicitly featured for today's date.
//   2. The next eligible evergreen entry in a deterministic rotation.
//   3. The most recently published active entry.
//   4. A clearly-marked default welcome entry.
//
// Rotation is deterministic per calendar day so a static build produces a
// stable result without server-side "last shown" state, while still spreading
// entries out and avoiding the same topic on consecutive days where possible.
// -----------------------------------------------------------------------------
import type { Entry } from './entries';
import { getVisibleEntries, buildNow } from './entries';
import { dayNumberInZone, sameDayInZone } from './datetime';

export type DailySource = 'scheduled' | 'rotation' | 'latest' | 'welcome';

export interface DailyResult {
  entry: Entry | null;
  source: DailySource;
}

/** Entries eligible to appear in the evergreen rotation pool. */
function rotationPool(entries: Entry[]): Entry[] {
  return entries
    .filter((e) => e.data.rotation_eligible)
    .sort((a, b) => {
      // Higher manual priority first, then a stable id tiebreak.
      const p = (b.data.rotation_priority ?? 0) - (a.data.rotation_priority ?? 0);
      return p !== 0 ? p : a.id.localeCompare(b.id);
    });
}

function isExcludedToday(entry: Entry, now: Date): boolean {
  return entry.data.exclusion_dates.some((d) => sameDayInZone(d, now));
}

/**
 * Deterministically pick a rotation entry for `now`, nudging away from
 * repeating yesterday's topic when an alternative exists.
 */
function pickFromRotation(pool: Entry[], now: Date): Entry | null {
  const eligible = pool.filter((e) => !isExcludedToday(e, now));
  if (eligible.length === 0) return null;

  const today = dayNumberInZone(now);
  const idx = ((today % eligible.length) + eligible.length) % eligible.length;
  const chosen = eligible[idx];

  // Topic spacing: if yesterday's deterministic pick shares this topic and a
  // different-topic option exists, shift by one.
  const yesterdayIdx =
    (((today - 1) % eligible.length) + eligible.length) % eligible.length;
  const yesterday = eligible[yesterdayIdx];
  if (
    eligible.length > 1 &&
    yesterday &&
    yesterday.data.topic === chosen.data.topic
  ) {
    const alt = eligible[(idx + 1) % eligible.length];
    if (alt && alt.data.topic !== chosen.data.topic) return alt;
  }
  return chosen;
}

export async function resolveDailyEntry(now: Date = buildNow()): Promise<DailyResult> {
  const visible = await getVisibleEntries(now);

  // 1. Explicitly featured for today.
  const featured = visible.find(
    (e) => e.data.featured_date && sameDayInZone(e.data.featured_date, now),
  );
  if (featured) return { entry: featured, source: 'scheduled' };

  // 2. Evergreen rotation.
  const rotated = pickFromRotation(rotationPool(visible), now);
  if (rotated) return { entry: rotated, source: 'rotation' };

  // 3. Most recently published active entry (visible list is newest-first).
  if (visible.length > 0) return { entry: visible[0], source: 'latest' };

  // 4. Clearly-marked default welcome entry (a visible entry tagged welcome, if
  // present) — otherwise null, and the page renders a calm built-in welcome.
  const welcome = visible.find((e) => e.data.keywords.includes('welcome'));
  return { entry: welcome ?? null, source: 'welcome' };
}
