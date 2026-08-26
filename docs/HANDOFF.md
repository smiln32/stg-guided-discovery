# stg-guided-discovery — Handoff (updated 2026-08-26)

> **Read [What needs to be done](#what-needs-to-be-done) first.** It is the
> complete list, in priority order, marked for what blocks launch and what
> does not.

> **Latest changes (2026-08-26).** Guided discovery was rebuilt as a single
> full-page scroll, replacing the 1/5/15-minute tiers, then reviewed and
> repaired. Two silent breakages are fixed: the `?need=` deep link never fired,
> and the "is one of these closer?" links pointed at the page they were already
> on. Two sections that promised more than they delivered are gone — "A Longer
> Prayer", which reprinted the same prayer, and "The Scripture in Context",
> which restated a caption. The demonstration banner is cleared from all 15
> published entries. The documentation was corrected to describe the site that
> exists, and `docs/destinations.md` is now generated rather than hand-tallied.

Current state of the project and the exact remaining steps to launch.
For *how to operate* the system (add/approve/publish content), see
[owner-guide.md](owner-guide.md).

## Where things stand

**Green, and not deployed.** As of 2026-08-26: `npm run validate` clean with 2
warnings (the two unreviewed drafts), `npm test` 37/37, `npm run build` clean at
58 pages. All 12 original audit findings fixed (AUDIT-LOG.md, score 18/20).
Nothing has ever been deployed, and no URL on the live site points here yet.

| | |
| --- | --- |
| Entries | 17 — 15 published, 2 drafts |
| Pages built | 58, of which 28 are guided discovery under `/daily/help/` |
| Indexed | 28 URLs in the sitemap; everything under `/help/` except the entry point is `noindex` |
| Topic archives | 10 of 20 topics have the 3 entries an archive needs |
| Shop destinations reachable | 14 of 79 — see [item 1](#1-no-printable-is-reachable-from-any-journey) |
| Demonstration banner | cleared; the 2 drafts keep it, correctly |

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

**Content:** 17 entries — 15 live, 2 drafts
(`looking-for-the-light-in-the-middle-of-it`, `when-you-feel-far-from-god`).
10 topic archive pages build
(anxiety, overwhelm, exhaustion, caregiving, waiting, uncertainty,
learning-to-pray, trusting-god, hope, faith). Grief, feeling-far-from-god,
and patience are each **one entry away** from the 3-entry publish threshold.

**Links:** every related article, product, and free-resource link points at
real, live simplifytoglorify.com content — all 42 URLs verified returning
HTTP 200 on 2026-07-14. The product catalog (`src/config/products.mjs`)
mirrors the real shop: 12 topic collections + 7 free PDF resources.

**Shop mapping (verified 2026-08-04):** all twelve collections are the *same*
five-part printable kit — journal, devotional, Scripture cards, prayer cards,
and a seven-day First Steps Guide — differing only by topic. Each product link
now carries a `contents` line saying so, and a `kind`-driven label ("Printable
set") in place of the old generic "From the shop". Prices are deliberately not
mirrored into this repo: nothing reads the live store, so any price here would
go stale silently.

**Naming (2026-08-04):** the project was renamed `stg-website-interactives` →
`stg-guided-discovery` (package name, README, docs, config header comments).
Cosmetic only — no route, import, or config value depends on it.

## What needs to be done

Everything outstanding, in the order I would take it. Nothing here is broken:
`npm run validate`, `npm test` and `npm run build` are all clean today, and
nothing is deployed.

| # | What | Blocks launch? | Whose job |
| --- | --- | --- | --- |
| 1 | No printable is reachable from any journey | **Yes — commercially** | a decision, then ~1 line |
| 2 | Subdomain or subpath, then set `SITE_URL` | **Yes** | a decision |
| 3 | Deploy to Netlify | **Yes** | 20 minutes |
| 4 | Poetic verses still read as prose | No, but it is Scripture | data, ~9 entries |
| 5 | Confirm the site timezone | No | a one-line answer |
| 6 | Publish the two drafts | No | review |
| 7 | Write for the topics nothing reaches | No | writing |
| 8 | Page-design questions | No | decisions |
| 9 | Code cleanup | No | ~10 minutes |
| 10 | Logo and favicon | No | design |
| 11 | The care pathway — the listen-first redesign | No | design; the biggest piece |

---

### 1. No printable is reachable from any journey

**The most consequential open item, and the least obvious.** Guided discovery
offers a free PDF and a whole collection. It offers no individual printable at
all — not the journal, the devotional, the Scripture cards, the prayer cards or
the First Steps Guide, in any of the twelve collections. **0 of 60.**

Not a content gap; no amount of writing changes it. Each collection's five
printables used to be chosen against the capacity a visitor named — the
1/5/15-minute question. The page stopped asking, so `formatForTier` now receives
an empty `formats` list and returns nothing every time. It is one deliberately
commented line in
[`FullPageJourney.astro`](../src/components/FullPageJourney.astro).

It was left that way rather than quietly re-enabled, because "which printable
suits her?" needs something to be true about her, and the page no longer asks
anything. Three ways out:

- **Offer the ladder unconditionally.** First Steps first because it asks the
  least, cards alongside as complements, journal and devotional last because
  they ask most. No question needed; the order carries the meaning. Cheapest,
  and closest to the product-ladder thinking in the care pathway below.
- **Ask a different question** — not minutes but appetite, "how much do you want
  to take on?" That is the care pathway's own proposal, so decide it there
  rather than ahead of it.
- **Leave it.** Defensible: the collection page sells all five anyway, so no
  sale is lost, only specificity. But say so out loud if this is the choice,
  because as it stands it looks like an accident rather than a decision.

Reachability is generated — `npm run report:discovery` writes
[destinations.md](destinations.md). **14 of 79** destinations today.

### 2. Decide how this connects to simplifytoglorify.com, then set `SITE_URL`

**Owner's direction, 2026-08-26:** a separate page on the site, linked to from
any other page when she wants to send someone there. That rules out folding it
into the main React repo. It does not settle the remaining choice:

| | What it means | Cost |
| --- | --- | --- |
| **Subdomain** — `today.simplifytoglorify.com` | Its own Netlify deploy; the main site links to it | `SITE_URL` becomes the subdomain, nothing else changes. Separate origin, so it shares no search authority with the main domain |
| **Subpath** — `simplifytoglorify.com/daily/` | Its own build; the main site proxies `/daily/*` to it | `SITE_URL` becomes the main domain. `BASE_PATH` already matches. Delete [`src/pages/index.astro`](../src/pages/index.astro), the placeholder root |

`SITE_URL` must be the origin the pages are *actually served from* — canonical
tags, Open Graph tags and the sitemap all derive from it
([`site.mjs`](../src/config/site.mjs)). Point it at the main domain while serving
from a subdomain and every page advertises a canonical URL it does not live at:
it looks fine in a browser and quietly costs search visibility.

### 3. Deploy

Connect the repo to Netlify. [`netlify.toml`](../netlify.toml) already sets the
build command and publish directory, and it runs
`npm run validate && npm test && npm run build`, so every content gate and
guided safeguard must pass before anything ships. Set `SITE_URL` in the Netlify
UI. Fully static, no runtime, nothing else to configure.

### 4. Poetic verses still read as prose

**Half-fixed, which is worse than untouched, because it looks done.**
[`ScriptureBlock`](../src/components/ScriptureBlock.astro) carries
`white-space: pre-line` and renders `LORD` in small capitals correctly. But the
verses are still stored as folded scalars (`>-`), which strips the line breaks
before the CSS ever sees them. There is nothing left for `pre-line` to render.

So Psalm 23 still reads:

> …He guides me in the paths of righteousness **For** the sake of **His** name.

Those stray capitals are line-initial capitals from the printed poetry, folded
into a sentence. The fix is data, not code, and not a word of Scripture changes:
convert the poetic entries' `scripture_text` from `>-` to `|-` and keep the
printed line breaks. Psalms first — 23:1-3, 27:14, 34:18, 40:1, 46:10 — then
Isaiah 40:29 and 40:31, Lamentations 3:22-23, and Proverbs 3:5-6.

### 5. Confirm the site timezone

`SITE_TIMEZONE` was changed from `America/Denver` to `America/Chicago` during the
2026-08-26 rebuild. It decides when the daily entry flips. Worth one deliberate
confirmation that Chicago is right, because nothing else will ever catch it
being wrong.

### 6. Publish the two drafts

`looking-for-the-light-in-the-middle-of-it` and `when-you-feel-far-from-god` both
sit at `status: needs_scripture_verification` with both reviews pending. They
carry their NASB text already. They are the only two entries still flagged
`is_sample: true`, which is correct — they genuinely have not been reviewed, and
neither is built, so no visitor sees the banner. `npm run validate` lists them as
its only two warnings.

Publishing the first makes the **Gratitude Collection** reachable, the first of
the four unreachable collections to get there. Its `secondary_topics` is
currently `faith`; `hope` is arguably truer, since what the entry gives is hope
and gratitude is the door.

To publish either: review it, set `status: published` and both review statuses to
`approved`, then run `npm run approve -- <slug>`.

### 7. Write for the topics nothing reaches

Four collections cannot be reached because no published entry carries their
topic — **depression, chronic-pain, gratitude, adhd**. All four are already in a
need's lanes, so one entry each is enough and no code changes. Separately
`regret` has an entry but no need points at it, which is one line of `lanes` in
[`guided.mjs`](../src/config/guided.mjs).

A topic archive needs three entries to publish. One entry away: **grief** (2),
**feeling-far-from-god** (2), **patience** (2). Two away: **regret**,
**loneliness**, **forgiveness** (1 each).

See [topic-coverage.md](topic-coverage.md) for what a new entry needs in order to
close a gap, and [destinations.md](destinations.md) for the current counts.

### 8. Page-design questions on the guided page

Raised in review, none of them broken, all of them judgement calls:

- **The heading asks a question with nowhere to answer it.** Each need page is
  titled with its question — *"What has been on your heart lately?"* — and then
  answers itself with Scripture. That worked as an invitation before a choice;
  as the title of a page that immediately speaks, it reads like being asked and
  then talked over. The care pathway's text box would give it somewhere to go.
- **`carry_phrase` reads as a closing line, but three sections follow it.**
- **Scripture runs the full 68rem width** while the prose sections stop at
  48rem, so the verse gets the longest line on the page.

### 9. Code cleanup

- [`GuidedJourney.astro`](../src/components/GuidedJourney.astro) — the old
  tier-based component. Nothing imports it.
- `deeperUrl` and `deeperTier` on the `Journey` interface in
  [`guided.ts`](../src/lib/guided.ts) — declared, documented, never set.
- The test *"old tier route segments are not used in the current URL structure"*
  in [`guided.test.mjs`](../tests/guided.test.mjs) builds a string from a
  template literal, then asserts the template's own segments are absent from it.
  It cannot fail and guards nothing.
- Old `/daily/help/[need]/[tier]/` URLs 404. Probably fine — the whole `/help/`
  tree except the entry point has always been `noindex` on a feature that never
  launched, so there is likely nothing to preserve. If redirects are wanted, a
  `[[redirects]]` block in `netlify.toml` is the right shape: a real 301, not
  built pages.

### 10. Logo and favicon

A new brand logo and favicon were promised and never received.
[`public/favicon.svg`](../public/favicon.svg) is still the placeholder.

---

### 11. The care pathway (design, not yet built)

The owner's direction as of 2026-08-06, and the largest unbuilt piece. It is
last here because nothing else waits on it — but it is the one that decides
what this feature becomes, and item 1 above is really a part of it. The site
should **listen first**: she types what she is carrying into a text box, and gets
back an acknowledgement plus *"Are you experiencing any of these?"* — between one
and six options drawn only from real paths, always ending with "None of these".
Fewer options means more confidence, and showing that honestly is the point. She
picks one, and only then does the response come: understanding, faith
encouragement, one free resource and at most one paid one.

Three things this changes:

- **The topics are the shop's shape, not hers.** Route on the *emotional need*.
  Divorce, betrayal and marriage strain will never be collections and do not need
  to be; faith, trusting God and prayer are the honest answer, and that is where
  "None of these" leads.
- **The confirmation step is what makes it safe.** The site proposes and she
  confirms, so nothing is ever asserted about her without her agreement. Note
  that the acknowledgement language does *not* trip `DIAGNOSIS_PATTERNS` — that
  guard blocks "you seem / you appear / you are + condition", not "it makes sense
  that you'd feel…". The constraint is narrower than it looks.
- **The product ladder is capacity-of-appetite, not minutes-today.** First Steps
  first because it asks the least, journal and devotional last because they ask
  most, cards alongside as complements rather than substitutes. The old
  `TIERS` conflated "how many minutes do you have" with "how big a commitment do
  you want", which is how First Steps ended up offered to exactly one tier. The
  tiers went on 2026-08-26, taking the conflation and the format selection with
  them, so nothing answers either question now. That makes this the decision to
  take rather than a critique of what exists.

There is no text box on the page — the need question is asked in the heading and
nothing invites an answer. The promise that nothing she types is sent anywhere is
still made on `/daily/help/`, and is still true. If a box is ever added, that
promise has to be revisited honestly rather than quietly dropped.

---

## Where things stood before today

The sections below record how the project got here. They are history rather than
instructions; where something in them has been superseded it is marked.

## Guided discovery (integrated 2026-08-04)

The visitor-facing half of `stg-meet-me-where-i-am` now lives here, at
**`/daily/help/`**. It was integrated as a *layer*, not as a second
application: it owns no Scripture, no reflections, no prayers, no products and
no product URLs. Everything it shows is resolved from content this repo already
governs, so the approval and Scripture-verification gates apply to it
automatically and nothing is written twice.

### The flow

> **Superseded 2026-08-26.** The three capacity tiers described in this section
> were replaced by a single continuous page. What follows is current; the tier
> references further down this section are kept as a record of the original
> integration, not as a description of the site.

`/daily/help/` (need) → `/daily/help/[need]/` (the journey, one continuous page
she scrolls as far as she wants). Alternates get `/daily/help/[need]/[slug]/`;
the entry a need opens by default deliberately has no second URL, so there is
exactly one built page per entry a need can open. 28 pages under `/help/`, all
`noindex` except the `/daily/help/` entry point, and the sitemap filter agrees
with the meta tag.

The main site can also link straight in with `/daily/help/?need=comfort`, which
the entry page redirects client-side.

### What came across, and where it went

| From Meet Me Where I Am | Where it is now |
|---|---|
| 8 entry points | 9 needs in `src/config/guided.mjs`, merging the original 8 with the brief's "practical next step" |
| gentle question per journey | `question` on each need — free text, no form, no script, nothing stored |
| acknowledgments pool | `acknowledgment` on each need, one deterministic line (a static site cannot rotate per visitor, and rotation was never the point) |
| 1 / 5 / 15-minute tiers | `TIERS`, each declaring the entry fields it requires — **removed 2026-08-26**, see the note above |
| journey structure | `src/components/FullPageJourney.astro` (was `GuidedJourney.astro`, now unused) |
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

- ~~**Every tier includes the prayer.**~~ Moot since 2026-08-26: there are no
  tiers, and the single page shows the prayer along with everything else the
  entry carries.
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
  That inheritance is why the 2026-08-06 NASB swap needed no work here: the
  journeys render the same entries, so they picked up the new Scripture at the
  same moment every other surface did.
- **Nothing runs the gates at deploy time yet.** `netlify.toml` still runs only
  `npm run build`, which enforces the publish gate but not the guided
  safeguards. Changing the build command to
  `npm run validate && npm test && npm run build` would enforce all of them on
  every deploy. Left alone deliberately — that is a policy decision about
  whether a failing check should block a deploy.

### Verified (2026-08-06)

`npm run validate` clean — 17 entries, 9 needs × 3 tiers, **zero warnings** now
that both Scripture placeholders are gone · `npm test` 34/34 · `npm run build`
clean, 121 pages · zero dangling internal links across all 121 built pages ·
sitemap contains 28 URLs, exactly one of them under `/help/`.

Unrelated environment note: this machine runs Node 25, where Astro 5.6's
`dist/` cleanup uses a removed `fs.rmdirSync` option. A build into an existing
`dist/` can fail with `options.recursive is no longer supported`; `rm -rf dist`
first and it builds clean. Netlify (Node 20, per `netlify.toml`) is unaffected.

**Repo:** public GitHub repo `smiln32/stg-guided-discovery`, `main` branch (made
public 2026-08-02, renamed to match the project 2026-08-06). No credentials have
ever been committed — `.env` and `.env.*` are gitignored and only `.env.example`
is tracked.

**One branch, one history (2026-08-06).** A `product-clarity` branch had been
created automatically on 2026-08-04 during the project rename, and everything
since had been landing on it rather than on `main` — 20 commits' worth. It was
fast-forwarded into `main` and deleted, and the local remote URL was updated from
the pre-rename `stg-website-interactives.git`, which had been working only
through GitHub's redirect. `main` and `origin/main` are now in sync. There are no
other branches.

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
