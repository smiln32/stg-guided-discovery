# stg-guided-discovery

A calm, Scripture-centered content system for **Simplify to Glorify**.
One approved content entry becomes a permanent page, a daily feature, a
topic-library entry, and a guided journey — all from a single reviewed source
of truth.

**This is not simplifytoglorify.com.** It is one feature module meant to be
added to that site. Everything it publishes lives under a single base path
(`/daily`, set by `BASE_PATH` in [`src/config/site.mjs`](src/config/site.mjs)),
and every internal link and canonical URL derives from it. The module owns no
other part of the site — no home page, no nav, no global styles beyond its own
pages. The bare root, [`src/pages/index.astro`](src/pages/index.astro), is only a
placeholder that forwards to `/daily/`; it exists so a standalone build has
something at `/`, and it goes away when the feature sits under a real site.

How it will attach to the main site is still open — see
[Adding it to the site](#adding-it-to-the-site).

Built with **Astro** (static output). No server and no database required; content
lives in version-controlled YAML files and is edited directly or via a validated
CSV importer.

> **New to running this?** Read [`docs/owner-guide.md`](docs/owner-guide.md)
> — a plain-language guide to adding, verifying, approving, scheduling, and
> publishing content.

## Quick start

```bash
npm install
npm run dev        # local dev server at http://localhost:4321
npm run build      # production build to dist/
npm run preview    # serve the built site locally
```

Open **/daily/** for today's encouragement, or **/daily/help/** for
"Where do you need help today?".

## Two ways in

- **/daily/** — today's encouragement, plus topic archives and search. For the
  visitor who came to read.
- **/daily/help/** — **guided discovery.** One gentle question, then as much or
  as little time as she has, and she is met with Scripture, a prayer, one small
  step, and a free resource where one exists. For the visitor who is not sure
  what she needs.

Guided discovery adds no content of its own. It is a matching layer over the
same approved entries, topics, and products the rest of the module uses, so
nothing is written twice and nothing can drift. See
[`src/config/guided.mjs`](src/config/guided.mjs).

## Content workflow

```bash
npm run validate                                   # check all entries + publish gate
npm test                                           # safeguards + journey coverage
npm run import:csv -- content/my-file.csv          # dry-run import preview
npm run import:csv -- content/my-file.csv --commit # write YAML entries
npm run export:csv                                 # back up all entries to CSV
```

A blank template is in [`content/sample-import-template.csv`](content/sample-import-template.csv).

## Key rules the system enforces

- **Scripture is never invented or altered.** It is stored exactly as supplied,
  always with its reference and translation.
- **Nothing publishes unless it is approved.** An entry cannot be `published` or
  `scheduled` unless both content review and Scripture review are `approved` and
  `scripture_verified` is true — otherwise the build fails with a clear message.
- **Permanent URLs.** Every entry has a stable `/daily/[slug]/` page. Inbound
  links always point there, never to the rotating daily page.
- **Drafts stay private.** Unapproved entries are not built and never appear in
  the sitemap.
- **No diagnosis language.** Nothing tells a visitor what she is or has. The
  check runs over every entry, and over the guided-discovery copy itself.
- **Prayers keep the approved voice.** Addressed to God, and finished.
- **A journey never opens onto a blank section.** A tier that promises a
  reflection will not open an entry that has none, and a need with nothing to
  offer fails validation rather than shipping a dead end.
- **Support is offered, never pushed.** Free resources come before paid ones
  everywhere, and no path requires a purchase to reach the end.
- **What is offered fits the capacity she named.** A visitor with a minute is
  shown printable cards, not a thirty-day journal that asks her to write daily.
  Each tier names the formats whose writing load suits it.
- **A way to reach a person is on every guided page.** The crisis note is
  checked for the same no-diagnosis rule as the rest of the copy, and validation
  fails if it ever loses its phone number.

## Project structure

```text
src/
  config/          site, topics, products, entry field lists, guided discovery
  content.config.ts  the entry schema + publish gate (Zod)
  data/entries/    one YAML file per entry (the source of truth)
  layouts/ components/  UI
  lib/             queries, daily resolver, search, guided matching + safeguards
  pages/           routes (daily, permanent, topics, search, help)
scripts/           validate, import-csv, export-csv
tests/             guided safeguards + journey coverage (node --test)
docs/              owner guide, discovery map, topic coverage, handoff
```

## Deciding what to write next

[`docs/topic-coverage.md`](docs/topic-coverage.md) lines the twenty topics up
against the entries and the shop series and shows where they do not meet — the
four collections guided discovery cannot reach because nothing is written for
them, the topics answered by a collection named for something else, and the
topics no guided answer points at. It also records what a new entry needs in
order to close a gap.

[`docs/discovery-map.md`](docs/discovery-map.md) is the flat reference behind it:
every topic, every entry point and every destination, and what each journey
actually opens and offers. Both are references, not gates — nothing fails
because of them.

## Configuration

Copy `.env.example` to `.env` (and set the same key in the Netlify UI).
`SITE_URL` is the only setting that matters, and it must be the origin the
feature is actually served from — canonical tags, Open Graph tags, and the
sitemap all derive from it. If the module ends up on a subdomain, `SITE_URL` is
that subdomain, not the main domain.

## Adding it to the site

**This decision has not been made yet.** The module builds and runs today as its
own static site, which is what makes it reviewable before the choice is settled;
that is a convenience, not the intended end state. Three routes:

| Route | What it means | What changes here |
| --- | --- | --- |
| **Subdomain** — `today.simplifytoglorify.com` | Own Netlify deploy. The main site links to it. | `SITE_URL` becomes the subdomain. Nothing else. Cross-domain, so it shares no SEO authority with the main site. |
| **Subpath** — `simplifytoglorify.com/daily/` | Still its own build; the main site proxies or rewrites `/daily/*` to it. | `SITE_URL` becomes the main domain. `BASE_PATH` already matches. Delete the placeholder root page — the main site owns `/`. |
| **Fold into the main repo** | Ported into the simplifytoglorify.com React codebase as pages there. | Largest job by far. The Astro build, the YAML content pipeline, and the validation gates in `scripts/` and `tests/` have to come along or be rebuilt — those gates are the product, not scaffolding. |

Until then, `netlify.toml` configures a **standalone build** (`npm run build` →
`dist`), which is useful for previews and review. Set `SITE_URL` in the Netlify
UI. Fully static — there is no server-side runtime.

The decision, and the history behind it, is tracked in
[`docs/HANDOFF.md`](docs/HANDOFF.md).
