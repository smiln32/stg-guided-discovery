// -----------------------------------------------------------------------------
// Central URL builders. Every internal link and canonical/OG URL comes from
// here so paths stay consistent and permanent.
// -----------------------------------------------------------------------------
import { SITE_URL, BASE_PATH } from '../config/site.mjs';

export const paths = {
  home: `${BASE_PATH}/`,
  topics: `${BASE_PATH}/topics/`,
  search: `${BASE_PATH}/search/`,
  entry: (slug: string) => `${BASE_PATH}/${slug}/`,
  topic: (slug: string) => `${BASE_PATH}/topics/${slug}/`,
};

/** Absolute URL for a site-relative path (for canonical and OG tags). */
export function absolute(path: string): string {
  const base = SITE_URL.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
