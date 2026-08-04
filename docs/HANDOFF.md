# stg-guided-discovery — Handoff (updated 2026-08-04)

> **Latest change (2026-08-04):** guided discovery — the "Where do you need help
> today?" entry point from `stg-meet-me-where-i-am` — is integrated. See
> [Guided discovery](#guided-discovery-integrated-2026-08-04) below.

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

**Shop mapping (verified 2026-08-04):** all twelve collections are the *same*
five-part printable kit — journal, devotional, Scripture cards, prayer cards,
and a seven-day First Steps guide — differing only by topic. Each product link
now carries a `contents` line saying so, and a `kind`-driven label ("Printable
set") in place of the old generic "From the shop". Prices are deliberately not
mirrored into this repo: nothing reads the live store, so any price here would
go stale silently.

**Naming (2026-08-04):** the project was renamed `stg-website-interactives` →
`stg-guided-discovery` (package name, README, docs, config header comments).
Cosmetic only — no route, import, or config value depends on it.

## Guided discovery (integrated 2026-08-04)

The visitor-facing half of `stg-meet-me-where-i-am` now lives here, at
**`/daily/help/`**. It was integrated as a *layer*, not as a second
application: it owns no Scripture, no reflections, no prayers, no products and
no product URLs. Everything it shows is resolved from content this repo already
governs, so the approval and Scripture-verification gates apply to it
automatically and nothing is written twice.

### The flow

`/daily/help/` (need) → `/daily/help/[need]/` (one gentle question + how much
time) → `/daily/help/[need]/[tier]/` (the journey). Alternates get
`/daily/help/[need]/[tier]/[slug]/`; the default match deliberately has no
second URL, so there is exactly one built page per journey. 91 pages, all
`noindex` except the `/daily/help/` entry point, and the sitemap filter agrees
with the meta tag.

### What came across, and where it went

| From Meet Me Where I Am | Where it is now |
|---|---|
| 8 entry points | 9 needs in `src/config/guided.mjs`, merging the original 8 with the brief's "practical next step" |
| gentle question per journey | `question` on each need — free text, no form, no script, nothing stored |
| acknowledgments pool | `acknowledgment` on each need, one deterministic line (a static site cannot rotate per visitor, and rotation was never the point) |
| 1 / 5 / 15-minute tiers | `TIERS`, each declaring the entry fields it requires |
| journey structure | `src/components/GuidedJourney.astro` |
| passages / reflections / prayers / small steps | **not imported** — these are `scripture_text`, `gentle_word`, `prayer`, `small_step` on entries here, already verified and approved. The imported CSVs were an unverified parallel library. |
| `resource_paths.csv` | **not imported** — its 17 URLs were placeholders (`/products/peace-for-an-anxious-heart`) that do not exist on the live store. `src/config/products.mjs` is the real, verified mapping and is what journeys use. |
| `qa_gate.py` checks | `src/lib/guided-guards.mjs`, run by `npm run validate` and `npm test` |
| `journeys.csv` accent colours | **not imported** — topic accents in `src/config/topics.mjs` already serve this |
| `journey-engine.types.ts`, `MeetMeWhereIAm.tsx`, `build_csvs.py` | **not imported** — Next.js/React and a CSV compiler; this is a static Astro site with a content collection |

### Deliberately left behind

- **Story connections** (Hannah, Peter, Hagar…) and **Today's Invitation**.
  Both are good, and neither is in the integration brief's journey structure.
  Adding them would have meant a new body of unreviewed content with its own
  approval gate. `carry_phrase` already closes a journey. They remain available
  in the source repo if they are ever wanted.
- **Return greetings** for repeat visitors. They require a stored flag on the
  visitor's device. Nothing here stores anything, and the brief did not ask for
  it; keeping that true was worth more than the greeting.
- **The literal prayer format** `"Dear Father," … "In Jesus' name, Amen."` The
  brief says prayers must follow *the approved voice and format* — and the
  approved voice in this library addresses God directly by name and closes
  `Amen.` Enforcing the imported strings would have failed all sixteen reviewed
  entries. The rule the original protected is enforced; the house style is this
  library's. See `PRAYER_OPENINGS` in `src/config/guided.mjs`.
- **The ASCII-only / no-em-dash rule.** That was a CSV-pipeline constraint.
  This repo's approved content uses em dashes throughout.

### Notable decisions

- **Every tier includes the prayer.** The original omitted the reflection *and*
  the prayer at one minute; the brief's journey structure lists a prayer. Since
  a prayer reads in seconds and "I need to pray" is one of the nine needs, the
  one-minute tier drops only the reflection.
- **Matching never guesses twice.** An entry outside a need's topic lanes can be
  a single fallback so a need never dead-ends, but it is never offered as one of
  the "is this closer to what you are carrying?" choices.
- **Guided pages are `noindex`.** They recombine content whose canonical home is
  `/daily/[slug]/`. The entry point itself is indexable.

### Two things to know

- **Scripture verification is inherited, not re-implemented.** A journey can
  only ever open an entry that already passed `isVisible()` — live status, both
  reviews approved, `scripture_verified: true`, not expired. No separate check
  was added, because a second copy of that rule could disagree with the first.
  Note this means guided discovery currently shows the same sample WEB text as
  the rest of the site; replacing it with NASB 2020 (launch step 2 below) fixes
  every surface at once, journeys included. Nothing extra to do there.
- **Nothing runs the gates at deploy time yet.** `netlify.toml` still runs only
  `npm run build`, which enforces the publish gate but not the guided
  safeguards. Changing the build command to
  `npm run validate && npm test && npm run build` would enforce all of them on
  every deploy. Left alone deliberately — that is a policy decision about
  whether a failing check should block a deploy.

### Verified

`npm run validate` clean (16 entries, 9 needs × 3 tiers, 1 expected draft
warning) · `npm test` 21/21 · `npm run build` clean, 121 pages · zero dangling
internal links across all 121 built pages · sitemap contains 28 URLs, exactly
one of them under `/help/`.

Unrelated environment note: this machine runs Node 25, where Astro 5.6's
`dist/` cleanup uses a removed `fs.rmdirSync` option. A build into an existing
`dist/` can fail with `options.recursive is no longer supported`; `rm -rf dist`
first and it builds clean. Netlify (Node 20, per `netlify.toml`) is unaffected.

**Repo:** public GitHub repo `smiln32/stg-website-interactives`, main branch
(made public 2026-08-02). No credentials have ever been committed — `.env` and
`.env.*` are gitignored and only `.env.example` is tracked. **The GitHub repo
has not been renamed** to match the project — do that, then update this line
and the local remote.

## Unmerged branch: `product-clarity`

Not yet merged to `main`:

| Commit | What |
| --- | --- |
| `ba9f12a` | Rename to `stg-guided-discovery` |
| `0aeba27` | Product `contents` + `KIND_LABEL`; rewritten collection blurbs |
| `c86f58c` | Removed two related-article links — **reverted, see below** |
| `03d5567` | Revert of `c86f58c` |

To merge: `git checkout main && git merge --ff-only product-clarity`.

### The article/PDF decision, settled 2026-08-04

`c86f58c` was a mistake and has been reverted. Two entries showed the same
*title* twice in "You may also find this helpful" — once as an Article, once as
the free PDF — and the duplicate-looking title was treated as redundancy. It was
not. Verified 2026-08-04 by fetching all four URLs:

| Title | `/blog/` post | `/resources/` PDF |
| --- | --- | --- |
| How to Grieve Without a Timeline | ~1,200–1,400 word essay | 13-page printable guide |
| When You're Too Tired to Pray | ~1,200–1,500 word article | 11-page printable devotional |

They are different resources, and **neither blog page links to its own PDF** —
so this app is the only place a reader meets both. Both links are back on
`when-the-grief-comes-in-waves` and `for-the-tiredness-sleep-does-not-fix`.

The revert alone would have reintroduced the confusion that prompted the
deletion, so the labels now carry the difference. The handoff previously
suggested relabelling by *action* ("Read the post" / "Download"), but that
contradicts the principle `0aeba27` had just established one commit earlier —
a label says what a thing **is**, not what you do with it. So the labels name
the **format** instead, which separates the pair just as well and keeps one
principle rather than two:

- `KIND_LABEL.free`: "Free" → **"Free PDF"**
- the seven free resources dropped the "(free PDF)" suffix from their titles,
  which now stuttered against the label

A reader on the grief entry now sees:

```text
ARTICLE        How to Grieve Without a Timeline
ARTICLE        What Grief Actually Needs From You
FREE PDF       How to Grieve Without a Timeline
               — A gentle companion for sorrow that keeps its own time.
               A free printable PDF. No sign-up.
PRINTABLE SET  Grief Collection
               — For loss that is still close, and for the long days after it.
               Five printables — journal, devotional, Scripture cards, …
```

Same topic, two formats, told apart at a glance — and the blurb and contents
line that only the PDF carries do the rest. Guided-discovery journeys render the
same list through the same `<RelatedContent>`, so they inherit this too.

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
