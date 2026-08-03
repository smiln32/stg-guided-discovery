# stg-website-interactives

A calm, Scripture-centered content system for **Simplify to Glorify**.
One approved content entry becomes a permanent website page, a daily feature,
and a topic-library entry — all from a single reviewed source of truth.

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

Open **/daily/**.

## Content workflow

```bash
npm run validate                                   # check all entries + publish gate
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

## Project structure

```
src/
  config/          site, topics, products, entry field lists
  content.config.ts  the entry schema + publish gate (Zod)
  data/entries/    one YAML file per entry (the source of truth)
  layouts/ components/  UI
  lib/             queries, daily resolver, search
  pages/           routes (daily, permanent, topics, search)
scripts/           validate, import-csv, export-csv
docs/              owner guide + handoff
```

## Configuration

Copy `.env.example` to `.env` (and set the same key in the Netlify UI). The only
setting that matters for a normal deploy is `SITE_URL`.

## Deploy (Netlify)

Connect the repo; `netlify.toml` sets the build command (`npm run build`) and the
publish directory (`dist`). Set `SITE_URL` in the Netlify UI. The site is fully
static — there is no server-side runtime.
