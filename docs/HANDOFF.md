# stg-guided-discovery — Handoff (updated 2026-08-06)

> **Latest change (2026-08-06):** all seventeen entries now carry **NASB 2020**
> Scripture in place of the demonstration WEB text, and everything has been
> merged to `main` and pushed. The entries are still flagged `is_sample: true`,
> so every page still shows a demonstration banner — see
> [What is open](#what-is-open) for that and the rest.

> **2026-08-04:** guided discovery — the "Where do you need help today?" entry
> point from `stg-meet-me-where-i-am` — is integrated. See
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

## Remaining launch steps (in order)

### 1. Decide how this connects to simplifytoglorify.com (strategic — decide first)
This repo is the one codebase for the feature. It is an **add-on module, not a
website** — everything it owns lives under `/daily`, and it builds standalone
only so it can be previewed and reviewed before this is settled. Remaining
choice is how it connects to the main site: a plain link, a subdomain (e.g.
`today.simplifytoglorify.com`), a proxied subpath at `simplifytoglorify.com/daily/`,
or folding it into the main site's repo later. The trade-offs are tabled in the
README under *Adding it to the site*.

Two things bear on that decision:

**`SITE_URL` must be the origin the feature is actually served from.** Canonical
tags, Open Graph tags, and the sitemap all derive from it
([`src/config/site.mjs`](../src/config/site.mjs)). Point it at the main domain
while the pages are served from a subdomain and every page advertises a
canonical URL it does not live at — the kind of error that looks fine in a
browser and quietly costs search visibility. Whichever route is chosen, set this
first.

**The routes are not equally expensive.** `BASE_PATH` is already `/daily`, so the
proxied subpath is nearly free — delete the placeholder root
([`src/pages/index.astro`](../src/pages/index.astro)), let the main site own `/`,
and every internal link already resolves. The subdomain is almost as cheap but is
a separate origin, so it shares no search authority with the main domain. Folding
into the React repo is the expensive one, and not because of the pages: the
publish gate, the no-diagnosis check, and the journey-coverage tests in
[`scripts/`](../scripts/) and [`tests/`](../tests/) are the product here, not
scaffolding around it. They have to come along or be rebuilt, and a port that
drops them ships the content without the guarantees that made it safe to ship.

(Note: an earlier, separate attempt ported this into the main
simplifytoglorify.com repo as a React branch. That branch was never merged
and is tracked separately — it does not affect this repo or this decision.)

### 2. Scripture — done 2026-08-06; the sample flags are not
All seventeen entries now carry NASB 2020, retrieved from Bible Gateway
(`version=NASB`) and checked against 2020 markers rather than 1995 ones — *Stop
striving* not *Cease striving*, *weary and burdened* not *heavy-laden*, *I will
not be in need* not *I shall not want*. Both placeholders are gone and validate
reports no warnings.

Two things about that swap are worth carrying forward. The first retrieval
silently flattened the small-capital divine name to "Lord" in seven verses; they
were re-fetched with an explicit instruction and now read `LORD`. **That is the
failure mode any summarising fetch introduces into Scripture** — assume it will
happen again and check for it. And poetic line-initial capitals were kept as
printed rather than lowercased to read as prose, which is why Psalm 23 currently
renders as *"…in the paths of righteousness For the sake of His name."* Folding
poetry into prose is this repo's existing convention; rewording the verse to suit
it is not. The fix is rendering, not editing — see
[What is open](#what-is-open).

**Still outstanding from this step:** every entry is still `is_sample: true`, so
[EntryArticle](../src/components/EntryArticle.astro) shows *"Demonstration
content. This sample entry is not yet reviewed for publication."* on all 17
pages, and 15 still name `Sample Reviewer (demonstration)` in `reviewed_by`. The
verses are real; the governance metadata is still scaffolding from the original
build. Per entry: review it, set `reviewed_by` to the real reviewer, set
`is_sample: false`.

The references, for the record:

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
| looking-for-the-light-in-the-middle-of-it (draft) | 1 Thessalonians 5:18 |

Both drafts additionally need `status: published` and approvals — see
[What is open](#what-is-open).

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

## What is open

Everything below is decided-but-undone or awaiting a decision. Nothing here is
broken; the build is green.

### Clear the demonstration flags

The largest gap between what the site *is* and what it *says it is*. All 17
entries carry `is_sample: true` and 15 name `Sample Reviewer (demonstration)`.
The Scripture is real now; the banner still says it isn't. See launch step 2.

### Publish the gratitude entry

`looking-for-the-light-in-the-middle-of-it` has its NASB text but sits at
`status: needs_scripture_verification` with both reviews pending, so it is not
live. Publishing it makes the **Gratitude Collection** reachable — the first of
the four unreachable collections to get there. Its `secondary_topics` is
currently `faith`; `hope` is arguably truer, since what the entry gives is hope
and gratitude is the door. See [topic-coverage.md](topic-coverage.md).

### Two ScriptureBlock rendering fixes

Both live in [ScriptureBlock.astro](../src/components/ScriptureBlock.astro) and
want doing together, because the Psalms are where both problems appear.

1. **Small-caps `LORD`.** NASB sets the divine name in small capitals. The YAML
   should keep plain `LORD` — searchable, copy-pasteable, survives the CSV round
   trip — and the component should wrap `\bLORD\b` in a span styled
   `text-transform: lowercase; font-variant: small-caps`. Unicode small-cap
   characters would look right and break search and screen readers.
2. **Poetic line breaks.** Store the poetic verses as `|-` block scalars and add
   `white-space: pre-line` to `.scripture__text`. This is what fixes the stray
   mid-sentence capitals without touching a word of Scripture.

### 46 of 79 destinations cannot be reached

Full breakdown in [destinations.md](destinations.md); the map of topics, entry
points and destinations is in [discovery-map.md](discovery-map.md). Three causes
needing three different fixes:

| Cause | Count | Fix |
| --- | --- | --- |
| No entry carries the topic | 24 | writing — depression, chronic-pain, gratitude, adhd |
| Loses a tie-break | 16 | a sort rule; no writing at all |
| No need points at it | 6 | one line of `lanes` — regret |

**The devotional has no pathway in any of the twelve collections.** It loses to
the journal at the fifteen-minute tier every time, in the six collections that
are reachable, and the other six are unreachable anyway. It is the only format
that is nowhere on the site.

### The care pathway (design, not yet built)

The owner's direction as of 2026-08-06, and the largest open piece. The site
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
  most, cards alongside as complements rather than substitutes. The current
  `TIERS` conflate "how many minutes do you have" with "how big a commitment do
  you want", which is how First Steps ended up offered to exactly one tier.

The current text box is deliberately inert and its copy promises she is never
read. That promise has to be revisited honestly, not quietly dropped.
