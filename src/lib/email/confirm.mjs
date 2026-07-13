// -----------------------------------------------------------------------------
// Double opt-in confirmation tokens (self-managed / ZeptoMail path).
//
// A confirmation link carries an HMAC of the (lowercased) email address signed
// with EMAIL_CONFIRM_SECRET. The confirm function verifies it statelessly — no
// token table, nothing expires by design (the link only ever confirms the
// address it was sent to, so a late click is still a valid confirmation), and
// links cannot be forged without the secret.
//
// When EMAIL_PROVIDER=zoho_campaigns this module is unused: Zoho runs its own
// confirmation flow and is the system of record.
// -----------------------------------------------------------------------------
import { createHmac, timingSafeEqual } from 'node:crypto';
import { SITE_URL } from '../../config/site.mjs';

function secret() {
  return (typeof process !== 'undefined' && process.env && process.env.EMAIL_CONFIRM_SECRET) || '';
}

export function confirmSecretConfigured() {
  return secret().length >= 16;
}

export function confirmToken(email) {
  return createHmac('sha256', secret()).update(String(email).toLowerCase()).digest('hex');
}

export function verifyConfirmToken(email, token) {
  if (!confirmSecretConfigured() || !email || !token) return false;
  const expected = Buffer.from(confirmToken(email), 'utf8');
  const given = Buffer.from(String(token), 'utf8');
  return expected.length === given.length && timingSafeEqual(expected, given);
}

/** Absolute URL the subscriber clicks to confirm their subscription. */
export function confirmUrl(email) {
  const base = SITE_URL.replace(/\/$/, '');
  const q = new URLSearchParams({
    email: String(email).toLowerCase(),
    token: confirmToken(email),
  });
  return `${base}/.netlify/functions/confirm?${q.toString()}`;
}
