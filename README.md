# stg-guided-discovery

A calm, Scripture-centered content system for **Simplify to Glorify**.
One approved content entry becomes a permanent website page, a daily feature,
a topic-library entry, and a guided journey — all from a single reviewed source
of truth.

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
same approved entries, topics, and products the rest of the site uses, so
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
docs/              owner guide, topic coverage, handoff
```

## Deciding what to write next

[`docs/topic-coverage.md`](docs/topic-coverage.md) lines the twenty topics up
against the entries and the shop series and shows where they do not meet — the
topics answered by a collection named for something else, the series with nothing
written for them, and the topics no guided answer can reach. It is a reference,
not a gate: nothing fails because of it.

## Configuration

Copy `.env.example` to `.env` (and set the same key in the Netlify UI). The only
setting that matters for a normal deploy is `SITE_URL`.

## Deploy (Netlify)

Connect the repo; `netlify.toml` sets the build command (`npm run build`) and the
publish directory (`dist`). Set `SITE_URL` in the Netlify UI. The site is fully
static — there is no server-side runtime.
