// POST /.netlify/functions/preferences
import { handlePreferences } from '../../src/lib/email/index.mjs';
import { parseBody, wantsJson, jsonResponse, htmlResponse, nowIso } from './lib/shared.mjs';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return jsonResponse(405, { ok: false, message: 'Method not allowed.' });
  const raw = parseBody(event);
  const result = await handlePreferences(raw, { nowIso: nowIso() });
  if (wantsJson(event)) return jsonResponse(result.statusCode, result.body);
  return htmlResponse(result.statusCode, {
    ok: result.body.ok,
    heading: result.body.ok ? 'Preferences updated' : 'We could not update that',
    message: result.body.message,
  });
};
