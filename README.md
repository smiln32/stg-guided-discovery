<p align="center">
  <img src="docs/readme/hero.svg" alt="Simplify to Glorify Guided Discovery — a calm Scripture-centered path for women who may not know where to begin" width="100%">
</p>

# STG Guided Discovery

**A calm, Scripture-centered content system for [Simplify to Glorify](https://simplifytoglorify.com).**

One approved content entry can become a permanent page, a daily feature, a topic-library entry, and part of a guided journey — without creating four separate versions of the same message.

> **In plain English:** this is the part of Simplify to Glorify designed for the woman who arrives thinking, *“I know I need something, but I do not know what I need.”* Guided Discovery helps her name what she is carrying and gently connects her with appropriate Scripture-centered encouragement and resources.

This repository is **not the main Simplify to Glorify website**. It is a self-contained feature module intended to live with that site. Everything it publishes sits beneath `/daily`.

---

## What it does

There are two ways into the experience:

| Entry point | Best for | What happens |
| --- | --- | --- |
| **`/daily/`** | A visitor who came to read | She sees today's encouragement and can browse topic archives or search. |
| **`/daily/help/`** | A visitor who is not sure what she needs | She names what she is carrying and follows a continuous path through Scripture, prayer, one small step, and relevant resources. |

Guided Discovery does **not** create a second library of content. It is a matching layer over the same reviewed entries, topics, and products used by the rest of the module. That keeps the system from drifting into multiple slightly different versions of the same guidance.

---

## The visitor experience

A Guided Discovery journey is intentionally simple:

```text
I need help
   ↓
What feels closest to what I am carrying?
   ↓
A matched, approved encouragement
   ↓
Scripture
   ↓
Prayer
   ↓
One small step
   ↓
A free resource, when one exists
   ↓
Optional related collection
```

The visitor does not need to understand the site's categories, product names, or navigation first. The system does that translation for her.

---

## One source of truth

Each approved content entry lives as a YAML file in `src/data/entries/`.

From that one entry, the system can create or support:

- a permanent `/daily/[slug]/` page
- the rotating daily feature
- topic archives and search
- Guided Discovery matching
- related free resources
- optional paid collections

That means content is **written once, reviewed once, and reused consistently**.

---

## Built-in guardrails

<p align="center">
  <img src="docs/readme/guardrails.svg" alt="Guided Discovery guardrails: Scripture verified, human approved, free before paid, and no dead ends" width="100%">
</p>

The system enforces a few non-negotiables before content reaches a visitor:

- **Scripture is never invented or altered.** It is stored exactly as supplied, always with its reference and translation.
- **Nothing publishes unless it is approved.** Published or scheduled entries must pass both content review and Scripture review, with `scripture_verified: true`.
- **Drafts stay private.** Unapproved entries are not built and do not appear in the sitemap.
- **No diagnosis language.** The system checks both content entries and Guided Discovery copy so the site does not tell a visitor what she “has” or “is.”
- **Prayers keep the approved voice.** They are addressed to God and remain within the established style.
- **A journey cannot open onto an empty section.** Missing required content causes validation to fail instead of shipping a dead end.
- **Free resources come before paid products.** No visitor has to purchase something to complete a path.
- **A way to reach a person remains available.** The guided pages retain the crisis-support note and phone number.

---

## Content workflow

```bash
npm install
npm run dev
npm run build
npm run preview

npm run validate
npm test
npm run approve -- my-slug
npm run import:csv -- content/my-file.csv
npm run import:csv -- content/my-file.csv --commit
npm run export:csv
npm run report:discovery
```

A blank import template lives at:

`content/sample-import-template.csv`

---

## Project structure

```text
src/
  config/             site, topics, products, entry field lists, guided discovery
  content.config.ts   entry schema + publish gate
  data/entries/       one YAML file per approved content entry
  layouts/            page layouts
  components/         reusable UI
  lib/                queries, daily resolver, search, matching + safeguards
  pages/              daily, permanent, topic, search, and help routes

scripts/               validation, approval, reports, CSV import/export
tests/                 safeguards + journey coverage
docs/                  owner guide, maps, coverage, handoff notes
```

---

## Useful docs

| Document | What it helps with |
| --- | --- |
| [`docs/owner-guide.md`](docs/owner-guide.md) | Plain-language guide for adding, verifying, approving, scheduling, and publishing content |
| [`docs/topic-coverage.md`](docs/topic-coverage.md) | Shows where topics, entries, and shop collections do or do not line up |
| [`docs/discovery-map.md`](docs/discovery-map.md) | Flat reference of entry points, topics, destinations, and journeys |
| [`docs/destinations.md`](docs/destinations.md) | Generated destination report based on the same matching logic the site uses |
| [`docs/HANDOFF.md`](docs/HANDOFF.md) | Integration history and unresolved deployment decisions |

---

## Deciding what to write next

`docs/topic-coverage.md` helps reveal gaps between the topics the site wants to support and the content/products that currently exist.

`docs/discovery-map.md` shows every topic, entry point, and destination.

`docs/destinations.md` is generated by:

```bash
npm run report:discovery
```

Because it is generated from the same matching logic the pages use, it is much less likely to drift from the actual visitor experience.

---

## Configuration

Copy `.env.example` to `.env`.

`SITE_URL` is the important setting. It must match the origin where this feature is actually served because canonical URLs, Open Graph URLs, and the sitemap all derive from it.

---

## Adding it to Simplify to Glorify

The final integration route is still open.

| Route | What it means |
| --- | --- |
| **Subdomain** — `today.simplifytoglorify.com` | Separate Netlify deploy; the main site links to it |
| **Subpath** — `simplifytoglorify.com/daily/` | Separate build served beneath the main domain |
| **Fold into the main repo** | Port the feature directly into the main Simplify to Glorify codebase |

For now, `netlify.toml` supports a standalone static build for review and preview.

---

## Brand palette

| Role | Hex |
| --- | --- |
| Ivory | `#fbf9f6` |
| Sage | `#b2c6b1` |
| Lavender | `#c6b5c8` |
| Slate Blue | `#7b9fb3` |
| Tan-Rose | `#e6d7d3` |
| Light Gray | `#c4c4c4` |
| Charcoal | `#404040` |

---

<p align="center">
  <strong>Simplify to Glorify</strong><br>
  Scripture-guided resources for women in tender seasons.
</p>
