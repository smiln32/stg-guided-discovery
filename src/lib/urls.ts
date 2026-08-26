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

  // Guided discovery. `help` is the visitor-facing entry point
  // ("Where do you need help today?"); the rest are steps within it.
  // These segments are reserved — see RESERVED_SLUGS in src/config/guided.mjs.
  help: `${BASE_PATH}/help/`,
  helpNeed: (need: string) => `${BASE_PATH}/help/${need}/`,
  /**
   * An alternate entry for the same need — the "is one of these closer?" links.
   * The entry a need opens by default has no URL of its own; it IS the
   * helpNeed() page. Only the alternates get a second segment.
   */
  helpNeedEntry: (need: string, slug: string) =>
    `${BASE_PATH}/help/${need}/${slug}/`,
};

/** Absolute URL for a site-relative path (for canonical and OG tags). */
export function absolute(path: string): string {
  const base = SITE_URL.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
