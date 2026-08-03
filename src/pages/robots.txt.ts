// Dynamic robots.txt — allows crawling, points at the sitemap, and keeps
// working/preview surfaces out of the crawl.
import type { APIRoute } from 'astro';
import { absolute } from '../lib/urls';
import { BASE_PATH } from '../config/site.mjs';

export const GET: APIRoute = () => {
  const body = [
    'User-agent: *',
    'Allow: /',
    `Disallow: ${BASE_PATH}/pins/`,
    `Disallow: ${BASE_PATH}/preview/`,
    `Disallow: ${BASE_PATH}/search`,
    `Disallow: ${BASE_PATH}/emails.json`,
    `Disallow: ${BASE_PATH}/search-index.json`,
    '',
    `Sitemap: ${absolute('/sitemap-index.xml')}`,
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
