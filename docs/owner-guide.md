# Owner's Guide

A plain-language guide to running the system. You do not need to be a programmer.
Most tasks are: edit a text file (or a spreadsheet), run one command, and deploy.

---

## The big idea

You write **one entry**. From that single approved entry, the system produces:

- a **permanent website page** that never changes address,
- the **daily feature** on `/hold-this-today/`,
- up to **five Pinterest Pins**,
- **email** content (daily note, welcome series, journeys),
- a place in the **topic library**, and
- a day inside a **seven-day journey**.

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

- Website page: `http://localhost:4321/hold-this-today/your-slug/`
- Pins (preview + metadata + overflow warnings): `.../hold-this-today/pins/your-slug/`
- Email: `.../hold-this-today/preview/email/your-slug/`
- All previews at once: `.../hold-this-today/preview/`

### 5. Schedule or publish

- **Publish now:** set `status: published`.
- **Schedule for a date:** set `status: scheduled` and `publish_date: 2026-08-01`.
- **Feature on a specific day:** set `featured_date: 2026-08-01`. On that date the
  daily page shows this entry.
- **Put in the evergreen rotation:** set `rotation_eligible: true` (and optionally
  `rotation_priority` — higher shows sooner). On days with nothing specifically
  scheduled, the daily page rotates through eligible entries, spreading topics out.

Then rebuild and deploy (commit + push; Netlify builds automatically).

### 6. Preview and export the Pins

- Preview: the `/hold-this-today/pins/your-slug/` page shows every Pin at full size
  with its title, description, alt text, board, destination URL, filename, and an
  **overflow check** (warns if the text is too long).
- Export PNGs:
  ```bash
  npm run pins:export                 # all live entries -> /pin-exports
  npm run pins:export -- your-slug     # just one entry
  ```
- Each Pin's destination is the **permanent** page with tracking added, so a Pin
  pinned today still works years from now.

> **Brand fonts on exports:** the website previews use the brand fonts perfectly.
> The exported PNGs use whatever fonts your computer has. To make exports match
> exactly, drop the brand `.ttf` font files into `src/assets/fonts/` and re-run the
> export.

### 7. Add an entry to an email sequence

- **Daily / ongoing note:** any live entry can be sent as a daily note; the content
  is generated automatically (preview it at `/preview/email/your-slug/`).
- **Welcome series:** edit `src/config/email.mjs` → `WELCOME_SERIES`. A step can
  point at an approved entry with `entrySlug` so its Scripture is included.

### 8. Create a seven-day journey

Edit `src/config/email.mjs` → `JOURNEYS`. Add an object like:

```js
{
  slug: 'seven-days-for-grief',
  title: 'Seven Days for Grief',
  topic: 'grief',
  description: 'A gentle week for sorrow.',
  days: [
    'when-the-grief-comes-in-waves',
    'a-gentle-place-to-begin',
    // ...seven approved entry slugs
  ],
}
```

Each day must be an **approved** entry's slug, so no unreviewed Scripture is ever
sent. A missing/unapproved slug is skipped with a warning rather than shown broken.
The journey page and enrollment form appear automatically at
`/hold-this-today/journeys/seven-days-for-grief/`.

### 9. Map related articles and products

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

### 10. Pause or archive an entry

- **Pause:** set `status: paused`. It drops out of the daily feature and rotation,
  and its page stops being built. (Because Pins may already point at it, prefer
  `archived` only when you truly want it gone.)
- **Archive:** set `status: archived`. Same effect; signals it is retired.

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

## Email setup (going live)

Out of the box, email is in **mock mode**: forms work, validation works, and the
site logs what it *would* send — but nothing is actually emailed. This is safe for
development. To send real email, set these in the Netlify UI (Site settings →
Environment variables), never in the code:

**Option A — Zoho Campaigns** (recommended for lists, segments, automations):
```
EMAIL_PROVIDER=zoho_campaigns
ZOHO_REGION=com
ZOHO_CLIENT_ID=...                  # from a Zoho OAuth self-client
ZOHO_CLIENT_SECRET=...
ZOHO_REFRESH_TOKEN=...              # access tokens are refreshed automatically
ZOHO_CAMPAIGNS_LIST_KEY=...
```

**Option B — ZeptoMail** (Zoho transactional send, self-managed list):
```
EMAIL_PROVIDER=zeptomail
ZOHO_REGION=com
ZEPTOMAIL_TOKEN=...
EMAIL_FROM_ADDRESS=hello@simplifytoglorify.com
EMAIL_FROM_NAME=Simplify to Glorify
EMAIL_CONFIRM_SECRET=...            # signs double opt-in links; 16+ chars
```

On the ZeptoMail path the system runs its own **double opt-in**: the signup email
contains a signed confirmation link, and nothing is ever sent to an address until
its owner clicks it (`netlify/functions/confirm.mjs` flips the subscriber to
`confirmed`). On the Zoho Campaigns path, Zoho runs its own confirmation flow.

> **Note on "Zoho Mail":** plain Zoho *Mail* (mailboxes) cannot manage a subscriber
> list or run drip sequences by itself. Use **Zoho Campaigns** for lists/automation,
> or **ZeptoMail** for sending with the built-in subscriber store.

**Automated journeys/drips** are driven by the scheduled function
`netlify/functions/journey-tick.mjs` (runs daily). Subscriber and enrollment data
is stored durably in **Netlify Blobs** automatically when the site runs on Netlify
(locally it falls back to a JSON file in `.data/`) — nothing to configure. Real
delivery needs `EMAIL_PROVIDER=zeptomail` with credentials; alternatively, let
Zoho Campaigns own the list and run the sequences as Zoho automations (then the
scheduled function is optional). Journey emails only go to **confirmed**
subscribers. Until a real provider is configured, no automated emails are sent —
the system never pretends an integration works when it does not.

---

## Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| Build fails: *"must be approved to go live"* | An entry is `published`/`scheduled` but a review field isn't `approved` or `scripture_verified` is false. Fix the review fields or set `status: draft`. |
| Build fails: *"Scripture is still a placeholder"* | Paste the verified verse text and set `scripture_verified: true`. |
| An entry doesn't appear anywhere | Its `status` isn't live, it's expired (`expiration_date`), or a review field isn't approved. Run `npm run validate`. |
| A topic has no page | It has fewer than the minimum entries. Add entries or lower `MIN_TOPIC_ENTRIES` in `src/config/topics.mjs`. |
| The daily page shows the "welcome" fallback | Nothing is featured for today and nothing is rotation-eligible. Set a `featured_date` or mark entries `rotation_eligible: true`. |
| Pin text looks cut off | The Pin page shows an overflow warning — shorten `pin_quote`/`pin_prayer`/etc. |
| Signup says "development mode" | `EMAIL_PROVIDER` is still `mock`. Set a real provider + credentials in Netlify. |
| CSV import rejected a row | Read the row-specific message it prints — usually a missing field, bad date, duplicate slug, or a "live" row with unverified Scripture. |

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
| `pin_*`, `pinterest_board`, `pinterest_status` | Pinterest copy + metadata. |
| `email_*` | Email copy + status + segment. |
| `related_entry_ids`, `related_articles`, `related_product_ids`, `related_resources` | Recommendations. |
| `seo_title`, `meta_description`, `canonical_url`, `social_*` | SEO/social. |
| `author`, `reviewed_by`, `content_review_status`, `scripture_review_status`, `last_reviewed_date`, `version`, `created_at`, `updated_at` | Governance. |
