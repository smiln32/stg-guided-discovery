// Static JSON search index, built once at build time. The search page fetches
// this and filters client-side — no server, works on any static host.
import type { APIRoute } from 'astro';
import { buildSearchIndex } from '../../lib/search';

export const GET: APIRoute = async () => {
  const index = await buildSearchIndex();
  return new Response(JSON.stringify(index), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
