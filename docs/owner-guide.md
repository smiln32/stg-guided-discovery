# Owner's Guide

A plain-language guide to running the system. You do not need to be a programmer.
Most tasks are: edit a text file (or a spreadsheet), run one command, and deploy.

---

## The big idea

This system is one **section** of Simplify to Glorify, not the whole website.
Everything it makes lives under `/daily/`. The rest of the site — the home page,
the shop, the nav — is somewhere else and is not affected by anything you do
here.

You write **one entry**. From that single approved entry, the system produces:

- a **permanent page** that never changes address,
- the **daily feature** on `/daily/`,
- a place in the **topic library**,
- an entry in the search index, and
- a **guided journey** for the visitor who says what she needs on
  `/daily/help/` (see *Guided discovery* below).

The system will **format, schedule, and distribute** approved content — but it
will never write theology, invent Scripture, change a verse, or publish anything
that has not been reviewed and approved.

---

## Where content lives

Each entry is one file in **`src/data/entries/`**, ending in `.yaml`. The file is
plain text with labeled fields. You can edit it in any text editor. You can also
prepare many entries in a spreadsheet and import them (see *Bulk import* below).

The full list of fields and what they mean is at the end of this guide.

---

## The status + review flow

Every entry has three important gates:

| Field | Meaning |
|---|---|
| `status` | `draft` → `needs_content_review` → `needs_scripture_verification` → `approved` → `scheduled`/`published` → `paused`/`archived` |
| `content_review_status` | `pending` / `in_review` / `approved` / `changes_requested` |
| `scripture_review_status` | same options, for the verse specifically |
| `scripture_verified` | `true` only after you confirm the exact verse text |

**An entry will only go live when `status` is `published` (or `scheduled`) AND both
review fields are `approved` AND `scripture_verified: true`.** If you try to publish
without these, the build stops and tells you exactly what is missing. This is the
safety net — it is meant to catch you.

---

## Everyday tasks

Open a terminal in the project folder for the commands below.

### 1. Add an entry

1. Copy an existing file in `src/data/entries/` (e.g.
   `when-the-waiting-feels-too-long.yaml`) to a new name, like
   `when-you-cannot-sleep.yaml`.
2. Change `id` and `slug` to match the new file name (lowercase, words-joined-by-hyphens).
3. Fill in the fields: `page_title`, `short_title`, `topic`, the Scripture, the
   gentle word, the prayer, the question, and the small step.
4. Leave `status: draft` for now.

### 2. Verify Scripture

1. Paste the **exact** verse text into `scripture_text`, matching the translation
   in `scripture_translation` (default is NASB 2020).
2. Confirm it word-for-word against a trusted copy of that translation.
3. Set `scripture_verified: true` and `scripture_review_status: approved`.

> Never guess wording. If you are not ready, leave the placeholder
> `[VERIFIED NASB 2020 SCRIPTURE TEXT REQUIRED]` in place — the system will keep the
> entry unpublished and remind you.

### 3. Approve the content

When the gentle word, prayer, question, and step read the way you want:
set `content_review_status: approved` and `reviewed_by` to your name.

### 4. Preview before publishing

```bash
npm run validate        # fast check: lists anything missing or blocking
npm run dev             # opens a local site; visit the pages below
```

- Website page: `http://localhost:4321/daily/your-slug/`
- The daily feature: `http://localhost:4321/daily/`
- Its topic archive: `.../daily/topics/your-topic/`

### 5. Schedule or publish

- **Publish now:** set `status: published`.
- **Schedule for a date:** set `status: scheduled` and `publish_date: 2026-08-01`.
- **Feature on a specific day:** set `featured_date: 2026-08-01`. On that date the
  daily page shows this entry.
- **Put in the evergreen rotation:** set `rotation_eligible: true` (and optionally
  `rotation_priority` — higher shows sooner). On days with nothing specifically
  scheduled, the daily page rotates through eligible entries, spreading topics out.

Then rebuild and deploy (commit + push; Netlify builds automatically).

### 6. Map related articles and products

In the entry file:

```yaml
related_entry_ids:
  - another-entry-slug
related_articles:
  - label: "A helpful article title"
    url: https://simplifytoglorify.com/blog/whatever
related_product_ids:
  - caregiving-collection           # ids from src/config/products.mjs
```

Products are defined in `src/config/products.mjs` (title, URL, kind, blurb, topics).
Free content and downloads are always offered before paid products.

### 7. Pause or archive an entry

- **Pause:** set `status: paused`. It drops out of the daily feature and rotation,
  and its page stops being built. (Because outside links may already point at it,
  prefer `archived` only when you truly want it gone.)
- **Archive:** set `status: archived`. Same effect; signals it is retired.

---

## Guided discovery ("Where do you need help today?")

Some visitors arrive knowing what they want to read. Others arrive tired and are
not sure. `/daily/help/` is for the second kind.

### What she experiences

1. **"Where do you need help today?"** — nine plain answers (*I need comfort. /
   I need steadiness. / I need clarity. / I need encouragement. / I need to
   pray. / I need one practical next step. / I need hope. / I want to spend time
   with God. / I don't know where to begin.*)
2. **One gentle question**, open-ended, with a box she may write in or skip.
   Nothing she types is sent, saved, or analyzed — the box has no form behind
   it and no script attached. It is there because naming something helps, not
   because the system wants it.
3. **"How much do you have in you right now?"** — about a minute, five minutes,
   or fifteen.
4. **A journey**: a line that receives what she may be carrying, then one of
   your published entries — its Scripture, its prayer, its small step, and (at
   the longer tiers) its gentle word and its question — followed by a free
   resource where one exists, related printables, and somewhere to go next.

### What it does *not* do

It never diagnoses her, never scores her, never keeps a record, and never asks
her to buy anything to reach the end. Every path ends with Scripture, a prayer,
and one small step whether or not she ever clicks a product.

### What you control

Everything a journey shows comes from content you already manage:

| The journey shows | It comes from |
|---|---|
| the Scripture, prayer, gentle word, question, small step, carry phrase | the entry file, unchanged |
| which entries a need can reach | the need's **lanes** (topic slugs) in `src/config/guided.mjs` |
| the free resource and the printables | `src/config/products.mjs`, free things always first |
| whether an entry can appear at all | the same approval gates as every other page |

**You do not write journey content.** Improving a journey means improving an
entry, or pointing a need at a different topic.

### Adding or changing a need

Open `src/config/guided.mjs` and edit the `NEEDS` list. Each one has:

```yaml
slug:            comfort            # the URL segment; permanent once shared
label:           "I need comfort."  # what she clicks
short:           Comfort            # used in headings and breadcrumbs
question:        "What has been on your heart lately?"
acknowledgment:  "There is no wrong way to grieve..."
lanes:           [grief, loneliness, chronic-pain, caregiving, depression]
```

`lanes` are topic slugs from `src/config/topics.mjs`, **most relevant first**.
The system walks them in order, preferring an entry whose main topic is early in
the list. Then run:

```bash
npm run validate      # confirms every need can still offer a real journey
npm test              # confirms the safeguards still hold
```

If a need has no entry to offer at some length of time, validation **fails and
says so** rather than shipping a dead end. The fix is usually to add a topic to
that need's lanes, or to publish an entry in one of them.

### The safeguards that run on your content

These run on every entry, published or not, in `npm run validate` and `npm test`:

| Check | What it protects |
|---|---|
| No diagnosis language | Nothing tells a visitor what she *is* or *has* — "you seem", "you appear", "you are anxious", "you're depressed" and the like are rejected. Ordinary writing like "when you have carried more than one person was meant to carry" is fine. |
| Prayer voice | A prayer opens by addressing God (*God,* / *Father,* / *Lord,* / *Jesus,* / *Holy Spirit,* / *Father of mercies,* …) and closes *Amen.* |
| Reflection and prayer complete | An entry missing its gentle word is never opened at a length that promises one; one missing its small step is never opened at all. |
| Journey coverage | Every need, at every length, has something real behind it. |
| Reserved slugs | An entry may not use the slug `help`, `topics` or `search` — those are routes. |

Two things stay **human** review steps, deliberately, because no automatic check
can do them honestly: capitalizing divine pronouns (lowercase *he* often means
Peter or Elijah), and making sure a reflection says what the passage reveals
about God before what it means for the reader.

---

## Bulk import (spreadsheets)

1. Start from `content/sample-import-template.csv` (open in Excel or Google Sheets —
   it is UTF-8 with a BOM, so Excel keeps special characters).
2. One row per entry. For list fields use semicolons (`overwhelm; uncertainty`).
   For article/resource links use `Label|https://url` and separate multiple with
   ` ;; `.
3. Save as CSV and preview the import (safe — writes nothing):
   ```bash
   npm run import:csv -- content/your-file.csv
   ```
4. If it looks right, write the files:
   ```bash
   npm run import:csv -- content/your-file.csv --commit
   ```
The importer preserves your Scripture text exactly, rejects duplicate slugs/ids,
flags bad dates and missing fields, and will not import anything marked "live"
while its Scripture is still a placeholder.

Back up everything to a spreadsheet anytime with `npm run export:csv`.

---

## Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| Build fails: *"must be approved to go live"* | An entry is `published`/`scheduled` but a review field isn't `approved` or `scripture_verified` is false. Fix the review fields or set `status: draft`. |
| Build fails: *"Scripture is still a placeholder"* | Paste the verified verse text and set `scripture_verified: true`. |
| An entry doesn't appear anywhere | Its `status` isn't live, it's expired (`expiration_date`), or a review field isn't approved. Run `npm run validate`. |
| A topic has no page | It has fewer than the minimum entries. Add entries or lower `MIN_TOPIC_ENTRIES` in `src/config/topics.mjs`. |
| The daily page shows the "welcome" fallback | Nothing is featured for today and nothing is rotation-eligible. Set a `featured_date` or mark entries `rotation_eligible: true`. |
| CSV import rejected a row | Read the row-specific message it prints — usually a missing field, bad date, duplicate slug, or a "live" row with unverified Scripture. |
| Validate fails: *"has nothing to offer"* | A need in `src/config/guided.mjs` has no published entry in its lanes that is complete enough for that length of time. Add a topic to its `lanes`, or publish an entry in one of them. |
| Validate fails: *"diagnosis language"* | An entry tells the reader what she is or has. Say what is true about God or the moment instead. |
| Validate fails: *"prayer must open/close"* | The prayer does not address God at the start, or does not end `Amen.` |

---

## Entry field reference

| Field | Notes |
|---|---|
| `id`, `slug` | Kebab-case; usually the same. `slug` is the permanent URL. |
| `status` | Lifecycle (see status flow above). |
| `is_sample` | `true` shows a "demonstration content" banner. Set `false` for real content. |
| `publish_date`, `featured_date`, `expiration_date` | Dates (`YYYY-MM-DD`). |
| `rotation_eligible`, `rotation_priority`, `exclusion_dates` | Evergreen rotation controls. |
| `page_title`, `short_title` | Long title for the page; short title for cards/lists. |
| `topic`, `secondary_topics` | From `src/config/topics.mjs`. |
| `audience`, `season_or_circumstance`, `keywords`, `search_phrases` | Discovery/search. |
| `scripture_reference`, `scripture_text`, `scripture_translation`, `scripture_verified`, `scripture_verification_notes` | The verse — never altered by the system. |
| `gentle_word`, `prayer`, `journal_question`, `small_step`, `carry_phrase` | The four gifts. |
| `related_entry_ids`, `related_articles`, `related_product_ids`, `related_resources` | Recommendations. |
| `seo_title`, `meta_description`, `canonical_url`, `social_*` | SEO/social. |
| `author`, `reviewed_by`, `content_review_status`, `scripture_review_status`, `last_reviewed_date`, `version`, `created_at`, `updated_at` | Governance. |
