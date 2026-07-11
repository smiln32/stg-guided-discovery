// -----------------------------------------------------------------------------
// Email orchestration — the single entry point the Netlify functions call.
// Ties together: validation (contract) -> provider (send/subscribe) -> store
// (dedupe/enrollment). Provider-agnostic, so swapping ESPs changes nothing here.
// -----------------------------------------------------------------------------
import { normalizeSignup, looksLikeBot, isValidEmail, cleanField } from './contract.mjs';
import { getProvider } from './providers.mjs';
import { store } from './store.mjs';

// Best-effort in-memory rate limit. NOTE: serverless instances don't share
// memory, so this only slows repeat hits on a warm instance. For strict limits
// use Netlify's built-in rate limiting or a shared store.
const HITS = new Map();
const WINDOW_MS = 60_000;
const MAX_HITS = 8;
function rateLimited(ip) {
  if (!ip) return false;
  const now = Date.now();
  const arr = (HITS.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  HITS.set(ip, arr);
  return arr.length > MAX_HITS;
}

/**
 * Handle a signup. Returns { statusCode, body } for the function to send.
 * @param {Record<string,any>} raw   Parsed form fields.
 * @param {{nowIso:string, ip?:string}} ctx
 */
export async function handleSignup(raw, { nowIso, ip }) {
  // Honeypot: pretend success so bots learn nothing.
  if (looksLikeBot(raw)) {
    return { statusCode: 200, body: { ok: true, message: 'Thank you.' } };
  }
  if (rateLimited(ip)) {
    return {
      statusCode: 429,
      body: {
        ok: false,
        message: 'That is a few too many tries in a moment. Please pause and try again shortly.',
      },
    };
  }

  const result = normalizeSignup(raw, nowIso);
  if (!result.ok) {
    return { statusCode: 400, body: { ok: false, field: result.field, message: result.message } };
  }
  const sub = result.subscriber;

  // Local dedupe (fast path; the ESP also dedupes).
  const existing = await store.find(sub.email);
  if (existing && existing.status !== 'unsubscribed') {
    return {
      statusCode: 409,
      body: {
        ok: false,
        message:
          'You are already subscribed — no need to sign up again. You can update your preferences anytime.',
      },
    };
  }

  const provider = getProvider();
  let providerResult;
  try {
    providerResult = await provider.subscribe(sub);
  } catch (err) {
    console.error('[email] provider error', err);
    providerResult = { status: 'error', message: '' };
  }

  if (providerResult.status === 'exists') {
    await store.upsert({ ...sub, status: 'confirmed' });
    return { statusCode: 409, body: { ok: false, message: providerResult.message } };
  }
  if (providerResult.status === 'error') {
    return {
      statusCode: 502,
      body: {
        ok: false,
        message:
          'We could not complete your subscription just now. Your information was not lost. Please try again in a moment.',
      },
    };
  }

  await store.upsert(sub);
  return {
    statusCode: 200,
    body: { ok: true, message: providerResult.message, segments: sub.segments },
  };
}

export async function handleUnsubscribe(raw, { nowIso }) {
  const email = cleanField(raw.email, 254).toLowerCase();
  if (!isValidEmail(email)) {
    return { statusCode: 400, body: { ok: false, message: 'Please enter a valid email address.' } };
  }
  const provider = getProvider();
  if (typeof provider.unsubscribe === 'function') {
    try {
      await provider.unsubscribe(email);
    } catch (err) {
      console.error('[email] unsubscribe error', err);
    }
  }
  await store.setStatus(email, 'unsubscribed', nowIso);
  return {
    statusCode: 200,
    body: {
      ok: true,
      message:
        'You have been unsubscribed. You will not receive further emails. You are always welcome back.',
    },
  };
}

export async function handlePreferences(raw, { nowIso }) {
  const email = cleanField(raw.email, 254).toLowerCase();
  if (!isValidEmail(email)) {
    return { statusCode: 400, body: { ok: false, message: 'Please enter a valid email address.' } };
  }
  const prefs = {
    topic: cleanField(raw.topic, 40) || undefined,
    frequency: cleanField(raw.frequency, 20) || undefined,
  };
  const provider = getProvider();
  if (typeof provider.updatePreferences === 'function') {
    try {
      await provider.updatePreferences(email, prefs);
    } catch (err) {
      console.error('[email] preferences error', err);
    }
  }
  await store.updatePreferences(email, prefs, nowIso);
  return {
    statusCode: 200,
    body: { ok: true, message: 'Your preferences have been updated. Thank you.' },
  };
}

export async function handleJourneyEnroll(raw, { nowIso }) {
  const email = cleanField(raw.email, 254).toLowerCase();
  const journey = cleanField(raw.journey, 80);
  if (!isValidEmail(email)) {
    return { statusCode: 400, body: { ok: false, message: 'Please enter a valid email address.' } };
  }
  if (!journey) {
    return { statusCode: 400, body: { ok: false, message: 'Please choose a journey.' } };
  }
  const res = await store.enrollJourney(email, journey, nowIso);
  if (res.status === 'already_enrolled') {
    return { statusCode: 409, body: { ok: false, message: 'You are already on this journey.' } };
  }
  return {
    statusCode: 200,
    body: { ok: true, message: 'You are enrolled. Day one is on its way.' },
  };
}
