# stg-website-interactives — Handoff (2026-07-14)

Current state of the project and the exact remaining steps to launch.
For *how to operate* the system (add/approve/publish content, Pins, email),
see [owner-guide.md](owner-guide.md).

## Where things stand

**The system is engineering-complete.** All 12 audit findings fixed
(AUDIT-LOG.md, score 18/20), 21/21 tests pass, `npm run validate` and
`npm run build` are clean (68 pages).

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

### 3. Go live with email
Email currently runs in `mock` mode (logs only, sends nothing).
In Netlify set: `EMAIL_PROVIDER` (`zoho_campaigns` or `zeptomail`),
provider credentials, and `EMAIL_CONFIRM_SECRET` (any long random string —
double opt-in confirm links are signed with it). Details: `.env.example`
and the system guide §email.

### 4. Deploy (if this repo is the vehicle)
Connect the GitHub repo to Netlify — `netlify.toml` already configures
build, publish dir, functions, and the journey-tick cron. Set `SITE_URL`
and the email vars in the Netlify UI.

### 5. Nice-to-haves (not blockers)
- One more entry each for **grief**, **feeling-far-from-god**, and
  **patience** publishes those three archives.
- `npm run pins:export` renders Pin PNGs to `pin-exports/` for upload;
  every entry has pin copy marked `ready`.
- Site nav on the main site — deliberately untouched so far
  ("URL only for now").
- New brand logo/favicon (was promised, not yet received).
