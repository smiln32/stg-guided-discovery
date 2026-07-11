// -----------------------------------------------------------------------------
// Timezone-aware date helpers.
//
// "Today" for the daily feature and rotation is resolved against the site's
// configured timezone (SITE_TIMEZONE), so an entry flips at local midnight
// rather than UTC midnight. Everything here is dependency-free.
// -----------------------------------------------------------------------------
import { SITE_TIMEZONE } from '../config/site.mjs';

/** Returns the calendar date parts for `date` as seen in the site timezone. */
export function partsInZone(
  date: Date,
  timeZone: string = SITE_TIMEZONE,
): { year: number; month: number; day: number } {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const [{ value: y }, , { value: m }, , { value: d }] = fmt.formatToParts(date);
  return { year: Number(y), month: Number(m), day: Number(d) };
}

/** ISO calendar date (YYYY-MM-DD) for `date` in the site timezone. */
export function isoDateInZone(date: Date, timeZone?: string): string {
  const { year, month, day } = partsInZone(date, timeZone);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * A stable integer day number for `date` in the site timezone. Used to make
 * evergreen rotation deterministic (same date always resolves the same entry
 * without needing server-side "last shown" state).
 */
export function dayNumberInZone(date: Date, timeZone?: string): number {
  const { year, month, day } = partsInZone(date, timeZone);
  // Days since the Unix epoch for this local calendar date.
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

/** True when two dates fall on the same calendar day in the site timezone. */
export function sameDayInZone(a: Date, b: Date, timeZone?: string): boolean {
  return isoDateInZone(a, timeZone) === isoDateInZone(b, timeZone);
}

/** Human-friendly date, e.g. "July 10, 2026", rendered in the site timezone. */
export function formatDisplayDate(date: Date, timeZone: string = SITE_TIMEZONE): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}
