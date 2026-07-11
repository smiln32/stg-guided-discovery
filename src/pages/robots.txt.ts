// Dynamic robots.txt — allows crawling, points at the sitemap, and keeps
// working/preview surfaces out of the crawl.
import type { APIRoute } from 'astro';
import { absolute } from '../lib/urls';

export const GET: APIRoute = () => {
  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /hold-this-today/pins/',
    'Disallow: /hold-this-today/preview/',
    'Disallow: /hold-this-today/search',
    'Disallow: /hold-this-today/emails.json',
    'Disallow: /hold-this-today/search-index.json',
    '',
    `Sitemap: ${absolute('/sitemap-index.xml')}`,
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
