// POST /.netlify/functions/subscribe
// Handles "A Gentle Note" signups. Works for both the enhanced fetch (JSON in)
// and the no-JavaScript native form POST (returns a calm HTML page).
import { handleSignup } from '../../src/lib/email/index.mjs';
import { parseBody, wantsJson, getClientIp, jsonResponse, htmlResponse, nowIso, initStore } from './lib/shared.mjs';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { ok: false, message: 'Method not allowed.' });
  }
  initStore(event);
  const raw = parseBody(event);
  const result = await handleSignup(raw, { nowIso: nowIso(), ip: getClientIp(event) });

  if (wantsJson(event)) return jsonResponse(result.statusCode, result.body);

  const ok = result.body.ok;
  return htmlResponse(result.statusCode, {
    ok,
    heading: ok ? 'Thank you' : 'We could not finish that',
    message: result.body.message,
  });
};
