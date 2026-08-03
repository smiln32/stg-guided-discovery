// -----------------------------------------------------------------------------
// Content schema + publish gating.
//
// This is the source of truth for what a valid master content entry looks like.
// Astro validates every entry file against this schema at build time, so a
// malformed or improperly-approved entry FAILS THE BUILD rather than shipping.
//
// Storage: one YAML file per entry in src/data/entries/. The filename (minus
// extension) is the entry id. Bulk create/update happens through the CSV
// importer (scripts/import-csv.mjs), which writes these same YAML files.
//
// Core safety rules encoded here:
//   • Scripture fields are required and never derived — the system only stores
//     what a human supplied and marked verified.
//   • An entry cannot be "published" or "scheduled" unless BOTH content review
//     and Scripture review are "approved". Attempting to do so fails the build.
// -----------------------------------------------------------------------------
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { TOPICS } from './config/topics.mjs';
import { DEFAULT_TRANSLATION } from './config/site.mjs';
import {
  ENTRY_STATUSES,
  REVIEW_STATUSES,
  LIVE_STATUSES,
  CSV_COLUMNS,
} from './config/entry-fields.mjs';

// Statuses and field lists live in src/config/entry-fields.mjs (plain .mjs so
// the Node CLI scripts share them); re-exported here for TS consumers.
export { ENTRY_STATUSES, REVIEW_STATUSES, LIVE_STATUSES };

const TOPIC_SLUGS = TOPICS.map((t) => t.slug) as [string, ...string[]];
const asEnum = (values: string[]) => z.enum(values as [string, ...string[]]);

// A descriptive link: keeps link text meaningful for accessibility/SEO instead
// of a bare URL. CSV serializes these as "Label|https://url".
const linkSchema = z.object({
  label: z.string().min(1),
  url: z.string().url(),
});

const reviewStatus = asEnum(REVIEW_STATUSES).default('pending');

const entryFields = z
    .object({
      // --- Identity & lifecycle ------------------------------------------
      // id is optional in the file; when omitted Astro uses the filename.
      id: z.string().optional(),
      status: asEnum(ENTRY_STATUSES).default('draft'),
      is_sample: z.boolean().default(false),

      publish_date: z.coerce.date().optional(),
      featured_date: z.coerce.date().optional(),
      expiration_date: z.coerce.date().optional(),
      rotation_eligible: z.boolean().default(false),
      rotation_priority: z.number().int().default(0),
      exclusion_dates: z.array(z.coerce.date()).default([]),

      // --- Discovery / taxonomy ------------------------------------------
      slug: z
        .string()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug must be kebab-case'),
      page_title: z.string().min(1),
      short_title: z.string().min(1),
      topic: z.enum(TOPIC_SLUGS),
      secondary_topics: z.array(z.enum(TOPIC_SLUGS)).default([]),
      audience: z.string().default('Christian women'),
      season_or_circumstance: z.string().optional(),
      keywords: z.array(z.string()).default([]),
      search_phrases: z.array(z.string()).default([]),

      // --- Scripture (never invented or altered by the system) -----------
      scripture_reference: z.string().min(1),
      scripture_text: z.string().min(1),
      scripture_translation: z.string().default(DEFAULT_TRANSLATION),
      scripture_verified: z.boolean().default(false),
      scripture_verification_notes: z.string().optional(),

      // --- The four gifts of an entry ------------------------------------
      gentle_word: z.string().min(1),
      prayer: z.string().min(1),
      journal_question: z.string().optional(),
      small_step: z.string().optional(),
      carry_phrase: z.string().optional(),

      // --- Pinterest -----------------------------------------------------
      pin_quote: z.string().optional(),
      pin_prayer: z.string().optional(),
      pin_practical_text: z.string().optional(),
      pin_curiosity_text: z.string().optional(),
      pin_title: z.string().optional(),
      pin_description: z.string().optional(),
      pin_alt_text: z.string().optional(),
      pinterest_board: z.string().optional(),
      pinterest_status: z
        .enum(['not_started', 'ready', 'scheduled', 'published'])
        .default('not_started'),
      pinterest_publish_date: z.coerce.date().optional(),

      // --- Email ---------------------------------------------------------
      email_subject: z.string().optional(),
      email_preview_text: z.string().optional(),
      email_opening: z.string().optional(),
      email_body: z.string().optional(),
      email_cta_text: z.string().optional(),
      email_status: z
        .enum(['not_started', 'ready', 'scheduled', 'sent'])
        .default('not_started'),
      email_send_date: z.coerce.date().optional(),
      email_segment: z.string().optional(),

      // --- Relationships -------------------------------------------------
      related_entry_ids: z.array(z.string()).default([]),
      related_articles: z.array(linkSchema).default([]),
      related_product_ids: z.array(z.string()).default([]),
      related_resources: z.array(linkSchema).default([]),

      // --- SEO / social --------------------------------------------------
      seo_title: z.string().optional(),
      meta_description: z.string().optional(),
      canonical_url: z.string().url().optional(),
      social_title: z.string().optional(),
      social_description: z.string().optional(),
      social_image: z.string().optional(),

      // --- Governance ----------------------------------------------------
      author: z.string().default('Simplify to Glorify'),
      reviewed_by: z.string().optional(),
      content_review_status: reviewStatus,
      scripture_review_status: reviewStatus,
      last_reviewed_date: z.coerce.date().optional(),
      version: z.number().int().default(1),
      created_at: z.coerce.date().optional(),
      updated_at: z.coerce.date().optional(),
    });

// ---- Schema ↔ CSV parity check (fails the build on drift) -------------------
// CSV_COLUMNS drives the import/export scripts. If a field exists in one list
// but not the other, a CSV round-trip would silently drop data — so refuse to
// build until they agree.
{
  const schemaKeys = Object.keys(entryFields.shape);
  const missingFromCsv = schemaKeys.filter((k) => !CSV_COLUMNS.includes(k));
  const unknownInCsv = CSV_COLUMNS.filter((k) => !schemaKeys.includes(k));
  if (missingFromCsv.length || unknownInCsv.length) {
    throw new Error(
      `Entry schema and CSV_COLUMNS (src/config/entry-fields.mjs) are out of sync.` +
        (missingFromCsv.length ? ` Missing from CSV_COLUMNS: ${missingFromCsv.join(', ')}.` : '') +
        (unknownInCsv.length ? ` In CSV_COLUMNS but not the schema: ${unknownInCsv.join(', ')}.` : ''),
    );
  }
}

// ---- Publish gate: the core safety invariant --------------------------------
const entrySchema = entryFields.superRefine((data, ctx) => {
      const isLive = (LIVE_STATUSES as readonly string[]).includes(data.status);
      if (!isLive) return;

      if (data.content_review_status !== 'approved') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Entry "${data.slug}" has status "${data.status}" but content_review_status is "${data.content_review_status}". It must be "approved" to go live.`,
          path: ['content_review_status'],
        });
      }
      if (data.scripture_review_status !== 'approved') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Entry "${data.slug}" has status "${data.status}" but scripture_review_status is "${data.scripture_review_status}". Scripture must be verified and approved to go live.`,
          path: ['scripture_review_status'],
        });
      }
      if (!data.scripture_verified) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Entry "${data.slug}" is going live but scripture_verified is false. Verify the exact ${data.scripture_translation} text first.`,
          path: ['scripture_verified'],
        });
      }
    });

const entries = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml,json}', base: './src/data/entries' }),
  schema: entrySchema,
});

export const collections = { entries };
