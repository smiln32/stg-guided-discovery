// Build-time map of slug -> rendered email {subject, preview, html, text}.
// Consumed by the scheduled journey/daily sender so it never has to re-implement
// rendering. Not linked anywhere and disallowed in robots.txt.
import type { APIRoute } from 'astro';
import { getVisibleEntries } from '../../lib/entries';
import { renderEntryEmail } from '../../lib/email/render.mjs';

export const GET: APIRoute = async () => {
  const entries = await getVisibleEntries();
  const map: Record<string, unknown> = {};
  for (const e of entries) {
    map[e.data.slug] = renderEntryEmail(e.data);
  }
  return new Response(JSON.stringify(map), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
};
