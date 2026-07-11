// -----------------------------------------------------------------------------
// Search index builder.
//
// Produces a small JSON document of visible entries that the client-side search
// page fetches and filters. Keeping search client-side (over a static JSON file)
// means no server, fast results, and it works on any static host.
// -----------------------------------------------------------------------------
import { getVisibleEntries, buildNow, type Entry } from './entries';
import { paths } from './urls';
import { topicTitle } from './topics';

export interface SearchRecord {
  slug: string;
  url: string;
  title: string;
  topic: string;
  topicTitle: string;
  topics: string[];
  reference: string;
  circumstance: string;
  excerpt: string;
  keywords: string[];
  phrases: string[];
}

function excerpt(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}

export function toSearchRecord(entry: Entry): SearchRecord {
  const d = entry.data;
  return {
    slug: d.slug,
    url: paths.entry(d.slug),
    title: d.short_title,
    topic: d.topic,
    topicTitle: topicTitle(d.topic),
    topics: [d.topic, ...d.secondary_topics],
    reference: d.scripture_reference,
    circumstance: d.season_or_circumstance ?? '',
    excerpt: excerpt(d.gentle_word),
    keywords: d.keywords,
    phrases: d.search_phrases,
  };
}

export async function buildSearchIndex(now: Date = buildNow()): Promise<SearchRecord[]> {
  const visible = await getVisibleEntries(now);
  return visible.map(toSearchRecord);
}
