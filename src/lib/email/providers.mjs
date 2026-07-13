// -----------------------------------------------------------------------------
// Email provider implementations. Each speaks the same small interface:
//   subscribe(subscriber) -> { status: 'ok' | 'exists' | 'error', message }
//
// • mock            — default. Logs and never sends. Safe for dev/preview.
// • zoho_campaigns  — REAL Zoho Campaigns list subscribe (needs env creds).
// • zeptomail       — REAL ZeptoMail transactional send for confirm/welcome
//                     (needs env creds); list/journey state lives in your store.
//
// Nothing here pretends to work: if a real provider is selected without
// credentials, it returns a clear error rather than a fake success.
// -----------------------------------------------------------------------------

import { confirmSecretConfigured, confirmUrl } from './confirm.mjs';

const env = (k) => (typeof process !== 'undefined' && process.env ? process.env[k] : undefined);

// ---- mock -------------------------------------------------------------------
export const mockProvider = {
  name: 'mock',
  async subscribe(sub) {
    // Deterministic test hook: an address containing "+exists" simulates a
    // duplicate so the "already subscribed" path can be exercised in dev.
    if (sub.email.includes('+exists')) {
      return { status: 'exists', message: 'Already subscribed (mock).' };
    }
    console.log('[email:mock] subscribe', JSON.stringify({ ...sub, consent: true }));
    if (confirmSecretConfigured()) {
      // Dev affordance: print the double opt-in link so the confirm flow can be
      // exercised locally without a real email.
      console.log('[email:mock] confirm link:', confirmUrl(sub.email));
    }
    return {
      status: 'ok',
      message:
        'Thank you. (Development mode: no email was actually sent. Connect a provider to go live.)',
    };
  },
  async unsubscribe(email) {
    console.log('[email:mock] unsubscribe', email);
    return { status: 'ok', message: 'You have been unsubscribed (mock).' };
  },
  async updatePreferences(email, prefs) {
    console.log('[email:mock] updatePreferences', email, JSON.stringify(prefs));
    return { status: 'ok', message: 'Preferences updated (mock).' };
  },
};

// ---- Zoho OAuth access-token refresh ----------------------------------------
// Zoho access tokens expire after ~1 hour, so the provider refreshes them
// itself from ZOHO_REFRESH_TOKEN + ZOHO_CLIENT_ID/SECRET and caches the result
// in module scope (shared across warm invocations, refreshed 5 minutes early).
// A static ZOHO_CAMPAIGNS_ACCESS_TOKEN still works as a fallback for quick
// manual testing, but on its own it goes stale within the hour.
let zohoTokenCache = { value: null, expiresAt: 0 };

async function zohoAccessToken() {
  const refresh = env('ZOHO_REFRESH_TOKEN');
  const clientId = env('ZOHO_CLIENT_ID');
  const clientSecret = env('ZOHO_CLIENT_SECRET');
  if (refresh && clientId && clientSecret) {
    if (zohoTokenCache.value && Date.now() < zohoTokenCache.expiresAt) {
      return zohoTokenCache.value;
    }
    const region = env('ZOHO_REGION') || 'com';
    const res = await fetch(`https://accounts.zoho.${region}/oauth/v2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refresh,
        client_id: clientId,
        client_secret: clientSecret,
      }).toString(),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.access_token) {
      zohoTokenCache = {
        value: data.access_token,
        expiresAt: Date.now() + (Number(data.expires_in) || 3600) * 1000 - 300_000,
      };
      return zohoTokenCache.value;
    }
    throw new Error(`Zoho token refresh failed: ${data.error || `HTTP ${res.status}`}`);
  }
  return env('ZOHO_CAMPAIGNS_ACCESS_TOKEN') || null;
}

// ---- Zoho Campaigns ---------------------------------------------------------
// Uses the "List Subscribe" JSON API with an auto-refreshed OAuth token (above).
// Docs: https://www.zoho.com/campaigns/help/developers/
export const zohoCampaignsProvider = {
  name: 'zoho_campaigns',
  async subscribe(sub) {
    const listKey = env('ZOHO_CAMPAIGNS_LIST_KEY');
    const region = env('ZOHO_REGION') || 'com'; // com, eu, in, com.au...
    let token;
    try {
      token = await zohoAccessToken();
    } catch (err) {
      return { status: 'error', message: err.message };
    }
    if (!token || !listKey) {
      return {
        status: 'error',
        message:
          'Zoho Campaigns is selected but credentials are missing: set ZOHO_REFRESH_TOKEN + ZOHO_CLIENT_ID + ZOHO_CLIENT_SECRET (recommended) and ZOHO_CAMPAIGNS_LIST_KEY.',
      };
    }
    const contactInfo = {
      'Contact Email': sub.email,
      ...(sub.first_name ? { 'First Name': sub.first_name } : {}),
    };
    const url = new URL(`https://campaigns.zoho.${region}/api/v1.1/json/listsubscribe`);
    url.searchParams.set('resfmt', 'JSON');
    url.searchParams.set('listkey', listKey);
    url.searchParams.set('contactinfo', JSON.stringify(contactInfo));
    // Topic/segment can drive a Zoho segment or a custom field / topic list.
    if (sub.topic) url.searchParams.set('topic_id', sub.topic);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Zoho-oauthtoken ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      // Zoho returns code "0" on success; "2103"/others indicate already-subscribed.
      const code = String(data.code ?? '');
      if (res.ok && (code === '0' || /success/i.test(data.status || ''))) {
        return { status: 'ok', message: 'Please check your inbox to confirm your subscription.' };
      }
      if (/already/i.test(data.message || '')) {
        return { status: 'exists', message: 'You are already subscribed.' };
      }
      return { status: 'error', message: data.message || 'Zoho Campaigns rejected the request.' };
    } catch (err) {
      return { status: 'error', message: `Zoho Campaigns request failed: ${err.message}` };
    }
  },
};

// ---- ZeptoMail (Zoho transactional) ----------------------------------------
// For a self-managed list + Zoho SMTP/ZeptoMail sending. This sends the
// confirmation/welcome email; storing the subscriber + double opt-in + journey
// scheduling is your store's job (see store.mjs and the scheduled function).
export const zeptoMailProvider = {
  name: 'zeptomail',
  async sendTransactional({ to, toName, subject, htmlBody, textBody }) {
    const token = env('ZEPTOMAIL_TOKEN');
    const from = env('EMAIL_FROM_ADDRESS');
    const fromName = env('EMAIL_FROM_NAME') || 'Simplify to Glorify';
    const region = env('ZOHO_REGION') || 'com';
    if (!token || !from) {
      return { status: 'error', message: 'ZeptoMail is selected but ZEPTOMAIL_TOKEN / EMAIL_FROM_ADDRESS are not set.' };
    }
    try {
      const res = await fetch(`https://api.zeptomail.${region}/v1.1/email`, {
        method: 'POST',
        headers: { Authorization: token, 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          from: { address: from, name: fromName },
          to: [{ email_address: { address: to, name: toName || '' } }],
          subject,
          htmlbody: htmlBody,
          textbody: textBody,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) return { status: 'ok', message: 'Email sent.' };
      return { status: 'error', message: data.message || 'ZeptoMail rejected the request.' };
    } catch (err) {
      return { status: 'error', message: `ZeptoMail request failed: ${err.message}` };
    }
  },
  async subscribe(sub) {
    // With a self-managed list, "subscribe" means: persist (store) + send a
    // double opt-in confirmation. Persisting is delegated to the store layer by
    // the function; here we just send the confirmation email. The link is a
    // signed token (src/lib/email/confirm.mjs) that the confirm function
    // verifies and flips the subscriber to "confirmed" — nothing sends to an
    // address until that happens.
    if (!confirmSecretConfigured()) {
      return {
        status: 'error',
        message:
          'ZeptoMail double opt-in requires EMAIL_CONFIRM_SECRET (at least 16 characters) to be set.',
      };
    }
    const link = confirmUrl(sub.email);
    const confirm = await this.sendTransactional({
      to: sub.email,
      toName: sub.first_name,
      subject: 'Please confirm your gentle note',
      htmlBody:
        `<p>Thank you for subscribing to A Gentle Note.</p>` +
        `<p><a href="${link}">Please confirm your email</a> to begin receiving encouragement.</p>` +
        `<p>If the link does not work, copy and paste this address into your browser:<br>${link}</p>` +
        `<p>If you did not request this, you can simply ignore this email — nothing will be sent to you.</p>`,
      textBody:
        'Thank you for subscribing to A Gentle Note.\n\n' +
        `Please confirm your email to begin receiving encouragement:\n${link}\n\n` +
        'If you did not request this, you can simply ignore this email — nothing will be sent to you.',
    });
    if (confirm.status === 'ok') {
      return { status: 'ok', message: 'Please check your inbox to confirm your subscription.' };
    }
    return confirm;
  },
};

export function getProvider() {
  const choice = (env('EMAIL_PROVIDER') || 'mock').toLowerCase();
  switch (choice) {
    case 'zoho_campaigns':
      return zohoCampaignsProvider;
    case 'zeptomail':
    case 'zoho_smtp':
      return zeptoMailProvider;
    case 'mock':
    default:
      return mockProvider;
  }
}
