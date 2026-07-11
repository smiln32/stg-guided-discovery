// -----------------------------------------------------------------------------
// Structured data builders. Only emit schema that accurately applies — no fake
// review/medical/FAQ/product schema. Entries are short devotional articles, so
// BlogPosting + BreadcrumbList are the honest, valid choices.
// -----------------------------------------------------------------------------
import { BRAND } from '../config/site.mjs';
import { absolute } from './urls';
import type { EntryData } from './entries';

export function entryJsonLd(data: EntryData, path: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: data.page_title,
    description: data.meta_description || data.short_title,
    url: absolute(path),
    mainEntityOfPage: absolute(path),
    inLanguage: 'en',
    author: { '@type': 'Organization', name: data.author || BRAND.name },
    publisher: { '@type': 'Organization', name: BRAND.name },
    ...(data.publish_date ? { datePublished: data.publish_date.toISOString() } : {}),
    ...(data.updated_at ? { dateModified: data.updated_at.toISOString() } : {}),
    ...(data.social_image ? { image: absolute(data.social_image) } : {}),
    about: data.topic,
    citation: `${data.scripture_reference} (${data.scripture_translation})`,
  };
}

export function breadcrumbJsonLd(
  crumbs: { label: string; href?: string }[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: absolute(c.href) } : {}),
    })),
  };
}

export function itemListJsonLd(
  name: string,
  items: { url: string; name: string }[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: absolute(it.url),
      name: it.name,
    })),
  };
}
