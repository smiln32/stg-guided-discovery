// -----------------------------------------------------------------------------
// Single source of truth for entry field lists and lifecycle constants, shared
// by the Zod schema (src/content.config.ts), the CSV import/export scripts, the
// validator, the Pin engine, and the UI.
//
// content.config.ts verifies at build time that its schema keys match
// CSV_COLUMNS exactly, so a field added in one place can no longer silently
// drop out of CSV import/export. Plain .mjs so both Astro (TS) and the Node
// scripts can import it.
// -----------------------------------------------------------------------------

export const ENTRY_STATUSES = [
  'draft',
  'needs_content_review',
  'needs_scripture_verification',
  'approved',
  'scheduled',
  'published',
  'paused',
  'archived',
];

export const REVIEW_STATUSES = ['pending', 'in_review', 'approved', 'changes_requested'];

// Statuses that make an entry publicly live (built as an indexable page and
// eligible for the daily feature / rotation).
export const LIVE_STATUSES = ['published', 'scheduled'];

// The exact placeholder a drafted entry carries until the verified verse text
// is pasted in. Anything containing it is blocked from going live.
export const SCRIPTURE_PLACEHOLDER = '[VERIFIED NASB 2020 SCRIPTURE TEXT REQUIRED]';

// The full column order used for CSV import/export. Checked against the Zod
// schema keys at build time — see content.config.ts.
export const CSV_COLUMNS = [
  'id', 'status', 'is_sample', 'publish_date', 'featured_date', 'expiration_date',
  'rotation_eligible', 'rotation_priority', 'exclusion_dates', 'slug', 'page_title',
  'short_title', 'topic', 'secondary_topics', 'audience', 'season_or_circumstance',
  'keywords', 'search_phrases', 'scripture_reference', 'scripture_text',
  'scripture_translation', 'scripture_verified', 'scripture_verification_notes',
  'gentle_word', 'prayer', 'journal_question', 'small_step', 'carry_phrase',
  'pin_quote', 'pin_prayer', 'pin_practical_text', 'pin_curiosity_text',
  'pin_title', 'pin_description', 'pin_alt_text', 'pinterest_board',
  'pinterest_status', 'pinterest_publish_date', 'email_subject',
  'email_preview_text', 'email_opening', 'email_body', 'email_cta_text',
  'email_status', 'email_send_date', 'email_segment', 'related_entry_ids',
  'related_articles', 'related_product_ids', 'related_resources', 'seo_title',
  'meta_description', 'canonical_url', 'social_title', 'social_description',
  'social_image', 'author', 'reviewed_by', 'content_review_status',
  'scripture_review_status', 'last_reviewed_date', 'version', 'created_at',
  'updated_at',
];

// Fields that are arrays of plain strings (CSV: semicolon-separated).
export const LIST_FIELDS = new Set([
  'secondary_topics', 'keywords', 'search_phrases', 'related_entry_ids',
  'related_product_ids', 'exclusion_dates',
]);
// List fields whose items must each be a valid date (CSV: "2026-12-24; 2026-12-25").
export const DATE_LIST_FIELDS = new Set(['exclusion_dates']);
// Fields that are arrays of {label,url} (CSV: "Label|url ;; Label|url").
export const LINK_FIELDS = new Set(['related_articles', 'related_resources']);
export const BOOL_FIELDS = new Set(['is_sample', 'rotation_eligible', 'scripture_verified']);
export const NUMBER_FIELDS = new Set(['rotation_priority', 'version']);
