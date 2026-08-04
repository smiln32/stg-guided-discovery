# stg-guided-discovery — Handoff (updated 2026-08-03)

Current state of the project and the exact remaining steps to launch.
For *how to operate* the system (add/approve/publish content), see
[owner-guide.md](owner-guide.md).

## Where things stand

**The system is engineering-complete.** All 12 audit findings fixed
(AUDIT-LOG.md, score 18/20); `npm run validate` and `npm run build` are clean.

**Scope (2026-08-03):** both distribution modules were removed from this repo.

- *Email/subscriber* — signup forms, provider integrations, double opt-in, the
  subscriber store, the seven-day journey pages and sender, the email previews,
  the `email_*` entry fields, and the Netlify Functions behind them.
- *Pinterest* — the pin builder/SVG renderer, the "Save This Encouragement"
  gallery, the per-entry Pin preview pages, the `pins:export` PNG exporter, and
  the `pin_*` / `pinterest_*` entry fields.

What remains is a purely static content site: permanent entry pages, the daily
feature with its rotation, topic archives, and client-side search. Both extracted
modules are kept offline outside this repo. The entry schema
(`src/content.config.ts`) and `CSV_COLUMNS` (`src/config/entry-fields.mjs`) each
carry a comment listing exactly which fields belonged to each module, should
either ever be reconnected.

**Content:** 15 published entries + 1 draft. 10 topic archive pages build
(anxiety, overwhelm, exhaustion, caregiving, waiting, uncertainty,
learning-to-pray, trusting-god, hope, faith). Grief, feeling-far-from-god,
and patience are each **one entry away** from the 3-entry publish threshold.

**Links:** every related article, product, and free-resource link points at
real, live simplifytoglorify.com content — all 42 URLs verified returning
HTTP 200 on 2026-07-14. The product catalog (`src/config/products.mjs`)
mirrors the real shop: 12 topic collections + 7 free PDF resources.

**Repo:** public GitHub repo `smiln32/stg-website-interactives`, main branch
(made public 2026-08-02). No credentials have ever been committed — `.env` and
`.env.*` are gitignored and only `.env.example` is tracked.

## Remaining launch steps (in order)

### 1. Decide how this connects to simplifytoglorify.com (strategic — decide first)
This repo is the one codebase for the feature — standalone Astro site,
deployable to Netlify on its own. Remaining choice is how it connects to the
main site: a plain link, a subdomain (e.g. `today.simplifytoglorify.com`), or
folding it into the main site's repo later.

(Note: an earlier, separate attempt ported this into the main
simplifytoglorify.com repo as a React branch. That branch was never merged
and is tracked separately — it does not affect this repo or this decision.)

### 2. Replace sample Scripture with NASB 2020 (content owner must supply)
All 15 published entries use public-domain WEB text and are flagged
`is_sample: true` (which shows a "demonstration content" banner site-wide).
Supply the exact NASB 2020 wording for these 16 references — the text must
come from a licensed copy, not be generated or scraped:

| Entry | Reference |
|---|---|
| a-gentle-place-to-begin | Psalm 46:10 |
| when-you-are-worried-about-what-comes-next | Matthew 6:34 |
| for-the-caregiver-who-is-running-on-empty | Matthew 11:28 |
| when-the-waiting-feels-too-long | Psalm 27:14 |
| when-the-grief-comes-in-waves | Psalm 34:18 |
| for-the-thing-you-cannot-undo | Lamentations 3:22-23 |
| when-you-dont-know-what-to-pray | Romans 8:26 |
| when-the-worry-will-not-quiet | Philippians 4:6-7 |
| when-the-list-is-longer-than-the-day | Psalm 23:1-3 |
| when-you-cannot-see-the-way-forward | Proverbs 3:5-6 |
| for-the-tiredness-sleep-does-not-fix | Isaiah 40:29 |
| when-your-faith-feels-small | Mark 9:24 |
| strength-for-the-long-wait | Isaiah 40:31 |
| when-the-same-prayer-has-no-answer-yet | Psalm 40:1 |
| comfort-for-the-comforter | 2 Corinthians 1:3-4 |
| _draft-when-you-feel-far-from-god (draft) | James 4:8 |

Per entry, once the real text is in: update `scripture_text`,
`scripture_translation`, `scripture_verification_notes`; review the whole
entry; set `reviewed_by` to the real reviewer; set `is_sample: false`.
The draft additionally needs `status: published` and approvals
(see the checklist at the top of its file).

### 3. Deploy (if this repo is the vehicle)
Connect the GitHub repo to Netlify — `netlify.toml` already configures the
build command and publish directory. Set `SITE_URL` in the Netlify UI. There
is nothing else to configure; the site is fully static.

### 4. Nice-to-haves (not blockers)
- One more entry each for **grief**, **feeling-far-from-god**, and
  **patience** publishes those three archives.
- Site nav on the main site — deliberately untouched so far
  ("URL only for now").
- New brand logo/favicon (was promised, not yet received).
