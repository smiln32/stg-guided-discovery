// -----------------------------------------------------------------------------
// Central URL builders. Every internal link and canonical/OG/Pin URL comes from
// here so paths stay consistent and permanent.
// -----------------------------------------------------------------------------
import { SITE_URL, BASE_PATH } from '../config/site.mjs';

export const paths = {
  home: `${BASE_PATH}/`,
  topics: `${BASE_PATH}/topics/`,
  search: `${BASE_PATH}/search/`,
  subscribe: `${BASE_PATH}/subscribe/`,
  preferences: `${BASE_PATH}/preferences/`,
  unsubscribe: `${BASE_PATH}/unsubscribe/`,
  journeys: `${BASE_PATH}/journeys/`,
  entry: (slug: string) => `${BASE_PATH}/${slug}/`,
  topic: (slug: string) => `${BASE_PATH}/topics/${slug}/`,
  pins: (slug: string) => `${BASE_PATH}/pins/${slug}/`,
  journey: (slug: string) => `${BASE_PATH}/journeys/${slug}/`,
};

/** Absolute URL for a site-relative path (for canonical, OG, Pin destinations). */
export function absolute(path: string): string {
  const base = SITE_URL.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * A Pinterest destination URL always points at the PERMANENT entry page (never
 * the rotating daily landing page) and carries UTM + Pin-type tracking so a Pin
 * pinned today still resolves correctly years from now.
 */
export function pinDestination(
  slug: string,
  pinType: string,
  campaign = 'hold-this-today',
): string {
  const url = new URL(absolute(paths.entry(slug)));
  url.searchParams.set('utm_source', 'pinterest');
  url.searchParams.set('utm_medium', 'pin');
  url.searchParams.set('utm_campaign', campaign);
  url.searchParams.set('utm_content', pinType);
  return url.toString();
}
