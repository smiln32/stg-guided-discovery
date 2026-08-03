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
  PIN_SAVE_CLICKED: 'pin_save_clicked',
  PIN_IMAGE_OPENED: 'pin_image_opened',
  RELATED_ARTICLE_CLICKED: 'related_article_clicked',
  RELATED_PRODUCT_CLICKED: 'related_product_clicked',
  SEARCH_PERFORMED: 'search_performed',
  NO_SEARCH_RESULTS: 'no_search_results',
} as const;

export type AnalyticsEvent = (typeof EVENTS)[keyof typeof EVENTS];
