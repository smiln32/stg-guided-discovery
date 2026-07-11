// -----------------------------------------------------------------------------
// Topic helpers.
//
// A topic only gets a public archive page once it has at least MIN_TOPIC_ENTRIES
// visible entries, so we never ship empty/thin archive pages. Topics below the
// threshold stay unlisted (their intro still exists for when content grows).
// -----------------------------------------------------------------------------
import { TOPICS, TOPIC_BY_SLUG, MIN_TOPIC_ENTRIES, type Topic } from '../config/topics.mjs';
import { getVisibleEntries, buildNow, type Entry } from './entries';

export type { Topic };
export { TOPICS, TOPIC_BY_SLUG };

export interface TopicWithCount extends Topic {
  count: number;
  published: boolean;
}

/** Count visible entries per topic (primary + secondary). */
export async function topicCounts(now: Date = buildNow()): Promise<Map<string, number>> {
  const visible = await getVisibleEntries(now);
  const counts = new Map<string, number>();
  for (const t of TOPICS) counts.set(t.slug, 0);
  for (const e of visible) {
    const slugs = new Set([e.data.topic, ...e.data.secondary_topics]);
    for (const s of slugs) counts.set(s, (counts.get(s) ?? 0) + 1);
  }
  return counts;
}

/** All topics with counts; `published` marks those meeting the min threshold. */
export async function topicsWithCounts(now: Date = buildNow()): Promise<TopicWithCount[]> {
  const counts = await topicCounts(now);
  return TOPICS.map((t) => {
    const count = counts.get(t.slug) ?? 0;
    return { ...t, count, published: (t.alwaysPublish ?? false) || count >= MIN_TOPIC_ENTRIES };
  });
}

/** Only topics that should get a public archive page. */
export async function publishedTopics(now: Date = buildNow()): Promise<TopicWithCount[]> {
  return (await topicsWithCounts(now)).filter((t) => t.published);
}

export function topicTitle(slug: string): string {
  return TOPIC_BY_SLUG[slug]?.title ?? slug;
}

export function topicAccent(slug: string): string {
  return TOPIC_BY_SLUG[slug]?.accent ?? '#7b9fb3';
}
