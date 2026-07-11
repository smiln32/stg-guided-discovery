// POST /.netlify/functions/unsubscribe
import { handleUnsubscribe } from '../../src/lib/email/index.mjs';
import { parseBody, wantsJson, jsonResponse, htmlResponse, nowIso } from './lib/shared.mjs';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return jsonResponse(405, { ok: false, message: 'Method not allowed.' });
  const raw = parseBody(event);
  const result = await handleUnsubscribe(raw, { nowIso: nowIso() });
  if (wantsJson(event)) return jsonResponse(result.statusCode, result.body);
  return htmlResponse(result.statusCode, {
    ok: result.body.ok,
    heading: result.body.ok ? 'You are unsubscribed' : 'We could not do that',
    message: result.body.message,
  });
};
