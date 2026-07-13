// GET /.netlify/functions/confirm?email=...&token=...
// Completes double opt-in for the self-managed (ZeptoMail) path. The token is
// a stateless HMAC (see src/lib/email/confirm.mjs), so this works even if the
// pending record predates a store migration — a valid signed link is itself
// proof the confirmation email reached the address.
import { verifyConfirmToken } from '../../src/lib/email/confirm.mjs';
import { store } from '../../src/lib/email/store.mjs';
import { htmlResponse, nowIso, initStore } from './lib/shared.mjs';

export const handler = async (event) => {
  initStore(event);
  const params = event.queryStringParameters || {};
  const email = String(params.email || '').trim().toLowerCase();
  const token = String(params.token || '').trim();

  if (!verifyConfirmToken(email, token)) {
    return htmlResponse(400, {
      ok: false,
      heading: 'We could not confirm that',
      message:
        'This confirmation link does not look valid. Please use the link from your email, or sign up again and we will send a fresh one.',
    });
  }

  const when = nowIso();
  const updated = await store.setStatus(email, 'confirmed', when);
  if (!updated) {
    // The pending record is missing (e.g. written before the durable store
    // existed). The signed link proves the opt-in, so record it now.
    await store.upsert({
      email,
      status: 'confirmed',
      consent: true,
      consent_timestamp: when,
      segments: [],
    });
  }

  return htmlResponse(200, {
    ok: true,
    heading: 'You are confirmed',
    message:
      'Thank you — your subscription to A Gentle Note is confirmed. Your first note is on its way.',
  });
};
