// -----------------------------------------------------------------------------
// Subscriber data contract + validation/sanitization.
//
// This defines the shape every email provider must speak, and the server-side
// validation applied before ANY subscriber operation. Keeping it provider-
// agnostic means the site never depends on one ESP's field names.
// -----------------------------------------------------------------------------

import { EMAIL_TOPIC_VALUES, FREQUENCY_VALUES } from '../../config/email.mjs';

/**
 * @typedef {Object} Subscriber
 * @property {string} email            Normalized, lowercased.
 * @property {string} [first_name]
 * @property {string} [topic]          One of EMAIL_TOPIC_VALUES.
 * @property {string} [frequency]      One of FREQUENCY_VALUES.
 * @property {boolean} consent         Explicit opt-in (required true).
 * @property {string} [source]         Page/campaign the signup came from.
 * @property {string} [utm_campaign]
 * @property {string} [utm_content]    e.g. the Pinterest Pin type.
 * @property {string} status           'pending' | 'confirmed' | 'unsubscribed'
 * @property {string} consent_timestamp ISO string.
 * @property {string[]} segments       Derived, descriptive segments.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX = { email: 254, name: 80, generic: 120 };
// Strip ASCII control characters (0x00–0x1F and 0x7F). Built from escapes so the
// source contains no literal control bytes.
const CONTROL_CHARS = new RegExp('[\\u0000-\\u001F\\u007F]', 'g');

export function isValidEmail(email) {
  return typeof email === 'string' && email.length <= MAX.email && EMAIL_RE.test(email);
}

/** Trim, cap length, and strip ASCII control chars from a free-text field. */
export function cleanField(value, max = MAX.generic) {
  if (typeof value !== 'string') return '';
  return value.replace(CONTROL_CHARS, '').trim().slice(0, max);
}

/**
 * Validate + normalize a raw signup payload.
 * @returns {{ok: true, subscriber: Subscriber} | {ok: false, field: string, message: string}}
 */
export function normalizeSignup(raw, nowIso) {
  const email = cleanField(raw.email, MAX.email).toLowerCase();
  if (!email) return { ok: false, field: 'email', message: 'Please enter your email address.' };
  if (!isValidEmail(email))
    return { ok: false, field: 'email', message: 'That email address does not look quite right. Please check it.' };

  const consent =
    raw.consent === 'yes' || raw.consent === true || raw.consent === 'true' || raw.consent === 'on';
  if (!consent)
    return {
      ok: false,
      field: 'consent',
      message: 'Please check the box to confirm you would like to receive email.',
    };

  const topic = cleanField(raw.topic, 40);
  const frequency = cleanField(raw.frequency, 20);

  /** @type {Subscriber} */
  const subscriber = {
    email,
    first_name: cleanField(raw.first_name, MAX.name) || undefined,
    topic: EMAIL_TOPIC_VALUES.includes(topic) ? topic : undefined,
    frequency: FREQUENCY_VALUES.includes(frequency) ? frequency : 'weekly',
    consent: true,
    source: cleanField(raw.source, MAX.generic) || 'website',
    utm_campaign: cleanField(raw.utm_campaign, MAX.generic) || undefined,
    utm_content: cleanField(raw.utm_content, MAX.generic) || undefined,
    status: 'pending',
    consent_timestamp: nowIso,
    segments: [],
  };
  subscriber.segments = deriveSegments(subscriber);
  return { ok: true, subscriber };
}

/** Descriptive, non-invasive segments only. Never infers a diagnosis. */
export function deriveSegments(sub) {
  const segments = [];
  if (sub.topic) segments.push(`topic:${sub.topic}`);
  if (sub.frequency) segments.push(`frequency:${sub.frequency}`);
  if (sub.utm_campaign) segments.push(`campaign:${sub.utm_campaign}`);
  if (sub.utm_content) segments.push(`pin:${sub.utm_content}`);
  if (sub.source) segments.push(`source:${sub.source}`);
  return segments;
}

/** True if the honeypot was filled — treat as a bot, silently succeed. */
export function looksLikeBot(raw) {
  return Boolean(cleanField(raw.company, 200));
}
