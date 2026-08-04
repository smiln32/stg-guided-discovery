// -----------------------------------------------------------------------------
// Analytics event vocabulary (spec §22).
//
// These are the ONLY events the site emits. They are intentionally coarse and
// non-invasive — no diagnosis is ever inferred from behavior. The client
// dispatcher (Analytics.astro) respects Do-Not-Track and is a no-op unless a
// sink (window.dataLayer, or your own listener on `htt:event`) is present.
// -----------------------------------------------------------------------------
export const EVENTS = {
  ENTRY_VIEWED: 'entry_viewed',
  TOPIC_SELECTED: 'topic_selected',
  RELATED_ARTICLE_CLICKED: 'related_article_clicked',
  RELATED_PRODUCT_CLICKED: 'related_product_clicked',
  SEARCH_PERFORMED: 'search_performed',
  NO_SEARCH_RESULTS: 'no_search_results',

  // Guided discovery. These record which door was opened and how much time was
  // asked for — never what a visitor wrote, and never anything inferred about
  // them. The free-text box on the need page is not instrumented at all.
  GUIDED_NEED_SELECTED: 'guided_need_selected',
  GUIDED_TIER_SELECTED: 'guided_tier_selected',
  GUIDED_ENTRY_SWITCHED: 'guided_entry_switched',
  GUIDED_WENT_DEEPER: 'guided_went_deeper',
} as const;

export type AnalyticsEvent = (typeof EVENTS)[keyof typeof EVENTS];
