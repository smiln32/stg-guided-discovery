// Shared helpers for the subscriber-facing Netlify Functions.
// (In a subdirectory so Netlify does not expose it as its own endpoint.)
import { connectLambda } from '@netlify/blobs';

/**
 * Wire up Netlify Blobs for legacy handler-style functions. Older runtimes
 * pass Blobs credentials in the event payload (event.blobs) and need
 * connectLambda; newer runtimes set NETLIFY_BLOBS_CONTEXT automatically and
 * this is a no-op. Safe to call locally (plain node / netlify dev).
 * Call this at the top of every handler that touches the store.
 */
export function initStore(event) {
  try {
    if (event && event.blobs) connectLambda(event);
  } catch (err) {
    console.warn('[store] blobs init skipped:', err.message);
  }
}

/** Parse a urlencoded or JSON request body into a plain object. */
export function parseBody(event) {
  const type = (event.headers?.['content-type'] || event.headers?.['Content-Type'] || '').toLowerCase();
  let body = event.body || '';
  if (event.isBase64Encoded) body = Buffer.from(body, 'base64').toString('utf8');
  try {
    if (type.includes('application/json')) return JSON.parse(body || '{}');
    // Default: urlencoded (both the no-JS form POST and the enhanced fetch).
    return Object.fromEntries(new URLSearchParams(body));
  } catch {
    return {};
  }
}

/** Does the caller want a JSON response (fetch) vs. an HTML page (no-JS)? */
export function wantsJson(event) {
  const accept = (event.headers?.accept || event.headers?.Accept || '').toLowerCase();
  const type = (event.headers?.['content-type'] || event.headers?.['Content-Type'] || '').toLowerCase();
  return accept.includes('application/json') || type.includes('application/json');
}

export function getClientIp(event) {
  return (
    event.headers?.['x-nf-client-connection-ip'] ||
    (event.headers?.['x-forwarded-for'] || '').split(',')[0].trim() ||
    undefined
  );
}

export function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
    body: JSON.stringify(body),
  };
}

/** Escape a string for safe interpolation into HTML text content. */
export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** A calm, self-contained confirmation/error page for no-JS submissions. */
export function htmlResponse(statusCode, { heading: rawHeading, message: rawMessage, ok }) {
  const back = '/hold-this-today/';
  const color = ok ? '#33613a' : '#7a3030';
  const bg = ok ? '#eef5ee' : '#fbeeee';
  // All current messages are server-authored, but escape anyway so a future
  // pass-through of provider/user text can never inject markup.
  const heading = escapeHtml(rawHeading);
  const message = escapeHtml(rawMessage);
  return {
    statusCode,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    body: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${heading}</title>
<style>
  body{font-family:'Source Sans 3',system-ui,sans-serif;background:#fbf9f6;color:#383634;
    margin:0;display:grid;min-height:100vh;place-items:center;padding:1.5rem;line-height:1.6}
  .box{max-width:34rem;background:#fff;border:1px solid #e7e0d8;border-radius:14px;
    padding:2rem;box-shadow:0 8px 24px rgba(64,64,64,.06)}
  h1{font-family:Georgia,serif;font-size:1.6rem;margin:0 0 .5rem}
  .status{background:${bg};color:${color};border-radius:8px;padding:.75rem 1rem;margin:1rem 0}
  a{display:inline-block;margin-top:.5rem;color:#34505f}
</style></head><body>
  <div class="box">
    <h1>${heading}</h1>
    <p class="status">${message}</p>
    <a href="${back}">← Return to Hold This Today</a>
  </div>
</body></html>`,
  };
}

export function nowIso() {
  return new Date().toISOString();
}
