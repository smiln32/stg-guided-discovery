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

// Pin destination URLs are built by pinDestination() in src/lib/pins.mjs — the
// single implementation shared by the on-site previews and the PNG exporter.
