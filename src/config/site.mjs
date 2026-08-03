// -----------------------------------------------------------------------------
// Site-wide configuration.
//
// This is the single place to change the domain, timezone, and default
// translation. It is imported by astro.config.mjs (build) and by pages/scripts
// at runtime, so it must stay dependency-free (plain .mjs).
// -----------------------------------------------------------------------------

// The public base URL of the site. Canonical URLs, the sitemap, Pinterest
// destination URLs, and Open Graph tags all derive from this. Set this to the
// real domain before the first production deploy. On Netlify you can also set
// SITE_URL as an environment variable; that wins if present.
export const SITE_URL =
  (typeof process !== 'undefined' && process.env && process.env.SITE_URL) ||
  'https://simplifytoglorify.com';

// Base path where the whole feature lives. Every internal link, canonical URL,
// and Pin destination derives from this via src/lib/urls.ts.
export const BASE_PATH = '/daily';

// The site's operating timezone. Daily scheduling and rotation resolve "today"
// against this zone so an entry flips at local midnight, not UTC midnight.
// Use an IANA name. Change to the brand's home timezone.
export const SITE_TIMEZONE = 'America/Denver';

// Default Scripture translation for new entries. The system NEVER alters or
// invents Scripture; this only sets the default label expected during review.
export const DEFAULT_TRANSLATION = 'NASB 2020';

export const BRAND = {
  name: 'Simplify to Glorify',
  tagline:
    'One Scripture, one gentle encouragement, one prayer, and one small step for today.',
};

// Established Simplify to Glorify palette. Mirrored in CSS custom properties in
// src/styles/global.css — change both if the brand palette ever shifts.
export const PALETTE = {
  ivory: '#fbf9f6',
  sage: '#b2c6b1',
  lavender: '#c6b5c8',
  slate: '#7b9fb3',
  warmNeutral: '#e6d7d3',
  lightGray: '#c4c4c4',
  charcoal: '#404040',
};
