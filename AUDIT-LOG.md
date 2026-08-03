# App Audit Log — stg-website-interactives

_Last audited: 2026-07-13 (fixes applied same day) · Files reviewed: 32 of ~55 source files (all lib/, all scripts/, all netlify/functions/, config/, key pages) · Not covered: most .astro components (EntryArticle, ScriptureBlock, PinSaveGallery, SubscribeForm internals, Analytics, BaseLayout), global.css, preview/journeys/search page internals, docs/_

## Health
| Dimension | Score | Headline |
|---|---|---|
| Structure & Architecture | 4/4 | Exemplary layering: one visibility rule, one URL builder, one pin renderer shared by preview + export |
| Leanness | 4/4 | 5 runtime deps; field lists, statuses, and the Scripture placeholder now live in one shared module |
| Correctness & Robustness | 4/4 | All audit findings fixed; 21-test suite (`npm test`) covers the subscriber/email flow end-to-end |
| Best use of code | 3/4 | Idiomatic Astro content collections + Zod gate |
| Performance & Efficiency | 3/4 | Fully static, 49 pages in ~4s; no meaningful inefficiencies at this scale |
| **Total** | **18/20** | **excellent** |

Bands: 18–20 excellent · 14–17 good · 10–13 needs work · 6–9 poor · 0–5 critical.

Verified during audit: `npm run validate` passes (8 entries, 1 expected draft warning) and `npm run build` completes cleanly (49 pages).

## Open findings
| ID | Sev | Dimension | Location | Problem | Better approach |
|----|-----|-----------|----------|---------|-----------------|
| _none_ | | | | All audit findings resolved. Further headroom (19–20) is polish, not repair: CI running `npm test` + validate on push, and Lighthouse/a11y checks. | |

## Strengths worth preserving
- The publish gate is enforced in three layers (Zod `superRefine` fails the build, validate.mjs pre-checks, CSV importer refuses live rows) — unapproved Scripture genuinely cannot ship.
- Every public query flows through `getVisibleEntries`/`isVisible` — one visibility rule, no leaks; drafts are excluded from build, sitemap, and search index.
- One pin renderer (`src/lib/pins.mjs`) shared by browser previews and the PNG exporter — previews cannot drift from exports.
- Email providers never fake success; mock is the default and says so in its user-facing message.
- Timezone-aware daily rotation is deterministic and dependency-free; `.gitignore` correctly excludes dist/, pin-exports/, .data/, .env.

## Resolved
| ID | Sev | Location | What it was | Fixed on |
|----|-----|----------|-------------|----------|
| A-01 | High | src/lib/email/providers.mjs, netlify/functions/confirm.mjs | Double opt-in unimplemented on the ZeptoMail path. Fixed: signed HMAC confirm links (src/lib/email/confirm.mjs, EMAIL_CONFIRM_SECRET), a new confirm function that flips status to `confirmed`, journey-tick now sends only to confirmed subscribers, and the provider refuses to run without the secret. | 2026-07-13 |
| A-02 | High | src/lib/email/store.mjs | Store was ephemeral (`/tmp`) on Netlify so journeys could never deliver. Fixed: the store now has a Netlify Blobs backend (`htt-email` store, strong consistency, one blob per subscriber/enrollment) selected automatically on Netlify, with the JSON file kept for local dev; legacy handlers call `initStore(event)`; journey-tick uses a proper `listJourneys()` instead of the `_dump` hack. | 2026-07-13 |
| A-03 | High | src/lib/email/providers.mjs | Static Zoho access token expired ~1 hour after deploy. Fixed: the provider now refreshes tokens from ZOHO_REFRESH_TOKEN + ZOHO_CLIENT_ID/SECRET, caching in module scope and renewing 5 minutes early; the static token remains a documented testing-only fallback. | 2026-07-13 |
| A-04 | Medium | src/lib/email/index.mjs | Anyone could enroll any email address in a journey. Fixed: enrollment now requires an existing, not-unsubscribed subscriber (403 otherwise), and delivery is additionally gated on confirmed status by A-01. | 2026-07-13 |
| A-05 | Medium | src/config/entry-fields.mjs | Scripture placeholder defined in 3 places (pins.mjs, scripts/lib/entries.mjs, ScriptureBlock.astro) and the pin destination-URL builder in 2 (pins.mjs + an unused copy in urls.ts). Fixed: SCRIPTURE_PLACEHOLDER, statuses, and field lists moved to the shared src/config/entry-fields.mjs; `pinDestination()` is now a single exported function in pins.mjs; the unused urls.ts copy removed. | 2026-07-13 |
| A-06 | Medium | src/content.config.ts, src/config/entry-fields.mjs | CSV_COLUMNS hand-synced with the Zod schema — and already drifted: `exclusion_dates` was missing, so CSV import/export silently dropped it. Fixed: one shared field list, a build-time parity check that fails the build naming any mismatched field (verified: removing a column fails the build), exclusion_dates added to CSV columns with per-item date validation in validate/import and YYYY-MM-DD serialization in export, and the sample template regenerated. | 2026-07-13 |
| A-07 | Low | netlify/functions/lib/shared.mjs | `htmlResponse` interpolated heading/message into HTML unescaped. Fixed: both values (and the `<title>`) are escaped via a shared `escapeHtml()`. | 2026-07-13 |
| A-08 | Low | src/lib/email/index.mjs | Rate-limit map grew unbounded on warm instances. Fixed: stale IPs (window fully elapsed) are evicted on every call. | 2026-07-13 |
| A-09 | Low | scripts/export-pins.mjs, scripts/lib/entries.mjs | Pin exporter gated only on live status + placeholder. Fixed: new shared `passesPublishGate()` mirrors the full Zod gate (reviews approved + verified + no placeholder); verified the exporter now refuses the unapproved draft and still exports live entries. | 2026-07-13 |
| A-10 | Low | docs/master-build-prompt.txt | 39 KB master build prompt sat in the repo root. Fixed: `git mv` to docs/; no references needed updating. | 2026-07-13 |
| A-11 | Low | src/config/topics.mjs, src/lib/topics.ts, EntryArticle.astro, [slug].astro | `MIN_TOPIC_ENTRIES = 1` shipped thin one-entry archive pages. Fixed: raised to 3, added `isTopicPublished()`, and made every topic link degrade gracefully (chip becomes plain text, breadcrumb unlinks, "More on X" hides). Verified: built site contains zero links to unbuilt topic pages; topics index shows its calm empty state. Note: with only 7 entries no topic reaches 3 yet, so no archive pages build until content grows (lower to 2 if the library should appear sooner). | 2026-07-13 |
| A-12 | Low | scripts/import-csv.mjs | Invalid numbers (e.g. `rotation_priority=high`) silently became 0. Fixed: parsed as-is and rejected per-row unless a whole number; verified the row error is reported and nothing is written. | 2026-07-13 |

## History
- 2026-07-13: first audit — 12 findings (0 Critical / 3 High / 3 Medium / 6 Low), score 15/20.
- 2026-07-13: fixed A-01–A-04 (verified: smoke test of signup → enroll gate → confirm-token roundtrip → confirm endpoint → send gate; `npm run build` clean; all 6 functions bundle with esbuild). 8 findings open (0 High / 2 Medium / 6 Low), score 16/20.
- 2026-07-13: fixed A-05–A-06 (verified: validate + build clean, CSV export → dry-run import round-trip, pins:export, and the parity check demonstrably fails the build on a removed column). Found real drift in the process: `exclusion_dates` had been silently dropped from CSV import/export. 6 findings open (0 High / 0 Medium / 6 Low), score 17/20.
- 2026-07-13: fixed A-07–A-12 (verified: build clean at 34 pages — topic archives correctly absent below the new threshold with zero dangling links in dist; import-csv rejects bad numbers/dates; pin exporter enforces the full publish gate; validate + email smoke test pass). 0 findings open, score 17/20 — a committed test suite for the email flow is the remaining path to 18.
- 2026-07-13: added tests/email-flow.test.mjs (21 tests, Node's built-in runner, zero new dependencies) covering signup validation, honeypot, dedupe, rate limiting, double opt-in tokens + confirm endpoint, journey enrollment gating, the scheduled sender's confirmed-only gate (with a stubbed fetch), unsubscribe/preferences, provider no-fake-success guarantees, and the publish gate. `npm test` → 21/21 pass. Score 18/20.
