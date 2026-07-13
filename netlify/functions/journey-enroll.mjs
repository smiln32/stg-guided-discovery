// POST /.netlify/functions/journey-enroll
// Enrolls a subscriber in a seven-day journey (records tracking state; the
// scheduled function delivers each day). See scheduled/journey-tick.mjs.
import { handleJourneyEnroll } from '../../src/lib/email/index.mjs';
import { parseBody, wantsJson, jsonResponse, htmlResponse, nowIso, initStore } from './lib/shared.mjs';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return jsonResponse(405, { ok: false, message: 'Method not allowed.' });
  initStore(event);
  const raw = parseBody(event);
  const result = await handleJourneyEnroll(raw, { nowIso: nowIso() });
  if (wantsJson(event)) return jsonResponse(result.statusCode, result.body);
  return htmlResponse(result.statusCode, {
    ok: result.body.ok,
    heading: result.body.ok ? 'You are enrolled' : 'We could not enroll you',
    message: result.body.message,
  });
};
