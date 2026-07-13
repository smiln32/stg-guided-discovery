// -----------------------------------------------------------------------------
// Automated tests for the subscriber/email flow. Run with: npm test
//
// Uses Node's built-in test runner (no extra dependencies), the local file
// store (HTT_DATA_DIR), and the mock provider — no network, no real email.
// Covers: signup validation, honeypot, dedupe, rate limiting, double opt-in
// (token + confirm endpoint), journey enrollment gating, the scheduled sender's
// confirmed-only gate, unsubscribe/preferences, provider no-fake-success
// guarantees, and the Pin exporter's publish gate.
// -----------------------------------------------------------------------------
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';

// Environment must be set before the modules under test are imported.
process.env.HTT_DATA_DIR = '.data-test';
process.env.EMAIL_CONFIRM_SECRET = 'test-secret-0123456789abcdef';
process.env.SITE_URL = 'https://example.test';
process.env.EMAIL_PROVIDER = 'mock';

const { handleSignup, handleUnsubscribe, handlePreferences, handleJourneyEnroll } =
  await import('../src/lib/email/index.mjs');
const { store } = await import('../src/lib/email/store.mjs');
const { confirmToken, verifyConfirmToken, confirmUrl } = await import('../src/lib/email/confirm.mjs');
const { normalizeSignup, cleanField } = await import('../src/lib/email/contract.mjs');
const { handler: confirmHandler } = await import('../netlify/functions/confirm.mjs');
const { handler: tickHandler } = await import('../netlify/functions/journey-tick.mjs');
const { zeptoMailProvider } = await import('../src/lib/email/providers.mjs');
const { passesPublishGate } = await import('../scripts/lib/entries.mjs');

const NOW = new Date().toISOString();
const signup = (raw, ip) => handleSignup(raw, { nowIso: NOW, ip });

await fs.rm('.data-test', { recursive: true, force: true });
after(async () => {
  await fs.rm('.data-test', { recursive: true, force: true });
});

// ---- input validation & sanitization -----------------------------------------

test('signup rejects a missing or invalid email', async () => {
  let r = await signup({ consent: 'yes' });
  assert.equal(r.statusCode, 400);
  assert.equal(r.body.field, 'email');

  r = await signup({ email: 'not-an-email', consent: 'yes' });
  assert.equal(r.statusCode, 400);
  assert.equal(r.body.field, 'email');
});

test('signup requires explicit consent', async () => {
  const r = await signup({ email: 'no-consent@example.test' });
  assert.equal(r.statusCode, 400);
  assert.equal(r.body.field, 'consent');
});

test('honeypot submissions pretend success and store nothing', async () => {
  const r = await signup({ email: 'bot@example.test', consent: 'yes', company: 'Totally Real LLC' });
  assert.equal(r.statusCode, 200);
  assert.equal(await store.find('bot@example.test'), null);
});

test('cleanField strips control characters, trims, and caps length', () => {
  assert.equal(cleanField('  hello' + '\u0000\u001F' + 'world  '), 'helloworld');
  assert.equal(cleanField('a'.repeat(500), 10), 'a'.repeat(10));
  assert.equal(cleanField(12345), '');
});

test('normalizeSignup drops unknown topics and defaults frequency to weekly', () => {
  const r = normalizeSignup(
    { email: 'norm@example.test', consent: 'yes', topic: 'not-a-topic', frequency: 'hourly' },
    NOW,
  );
  assert.equal(r.ok, true);
  assert.equal(r.subscriber.topic, undefined);
  assert.equal(r.subscriber.frequency, 'weekly');
  assert.equal(r.subscriber.status, 'pending');
});

// ---- signup, dedupe, rate limit -----------------------------------------------

test('signup stores a pending subscriber and derives segments', async () => {
  const r = await signup({ email: 'carla@example.test', consent: 'yes', topic: 'grief', source: 'test' });
  assert.equal(r.statusCode, 200);
  const sub = await store.find('carla@example.test');
  assert.equal(sub.status, 'pending');
  assert.ok(sub.segments.includes('topic:grief'));
});

test('a duplicate signup is refused with 409', async () => {
  const r = await signup({ email: 'carla@example.test', consent: 'yes' });
  assert.equal(r.statusCode, 409);
});

test('provider-reported duplicates map to 409 (mock "+exists" hook)', async () => {
  const r = await signup({ email: 'someone+exists@example.test', consent: 'yes' });
  assert.equal(r.statusCode, 409);
});

test('the ninth rapid attempt from one IP is rate limited', async () => {
  const ip = '203.0.113.9';
  for (let i = 1; i <= 8; i++) {
    const r = await signup({ email: `rate-${i}@example.test`, consent: 'yes' }, ip);
    assert.equal(r.statusCode, 200, `attempt ${i} should pass`);
  }
  const r = await signup({ email: 'rate-9@example.test', consent: 'yes' }, ip);
  assert.equal(r.statusCode, 429);
});

// ---- double opt-in --------------------------------------------------------------

test('confirm tokens verify only for the exact email and secret', () => {
  const email = 'carla@example.test';
  assert.ok(verifyConfirmToken(email, confirmToken(email)));
  assert.ok(!verifyConfirmToken(email, confirmToken('other@example.test')));
  assert.ok(!verifyConfirmToken(email, 'deadbeef'));
  assert.ok(confirmUrl(email).startsWith('https://example.test/.netlify/functions/confirm?'));
});

test('the confirm endpoint flips a pending subscriber to confirmed', async () => {
  const email = 'carla@example.test';
  const url = new URL(confirmUrl(email));
  const res = await confirmHandler({
    httpMethod: 'GET',
    queryStringParameters: Object.fromEntries(url.searchParams),
  });
  assert.equal(res.statusCode, 200);
  assert.equal((await store.find(email)).status, 'confirmed');
});

test('the confirm endpoint rejects a bad token and changes nothing', async () => {
  const email = 'rate-1@example.test';
  const res = await confirmHandler({
    httpMethod: 'GET',
    queryStringParameters: { email, token: 'ffff' },
  });
  assert.equal(res.statusCode, 400);
  assert.equal((await store.find(email)).status, 'pending');
});

// ---- journeys -------------------------------------------------------------------

test('journey enrollment is refused for a non-subscriber', async () => {
  const r = await handleJourneyEnroll(
    { email: 'stranger@example.test', journey: 'seven-days-for-an-anxious-heart' },
    { nowIso: NOW },
  );
  assert.equal(r.statusCode, 403);
});

test('an existing subscriber can enroll once, not twice', async () => {
  const raw = { email: 'carla@example.test', journey: 'seven-days-for-an-anxious-heart' };
  let r = await handleJourneyEnroll(raw, { nowIso: NOW });
  assert.equal(r.statusCode, 200);
  r = await handleJourneyEnroll(raw, { nowIso: NOW });
  assert.equal(r.statusCode, 409);
});

test('journey-tick sends only to confirmed subscribers and advances the day', async () => {
  // A pending subscriber enrolled in the same journey must be skipped.
  await signup({ email: 'pending@example.test', consent: 'yes' });
  await handleJourneyEnroll(
    { email: 'pending@example.test', journey: 'seven-days-for-an-anxious-heart' },
    { nowIso: NOW },
  );

  // Stub fetch so the tick "loads" a rendered email for every journey-day slug.
  const realFetch = globalThis.fetch;
  const { JOURNEYS } = await import('../src/config/email.mjs');
  const emails = Object.fromEntries(
    JOURNEYS.flatMap((j) => j.days).map((slug) => [slug, { subject: 'S', html: '<p>x</p>', text: 'x' }]),
  );
  globalThis.fetch = async () =>
    new Response(JSON.stringify(emails), { headers: { 'Content-Type': 'application/json' } });

  try {
    const res = await tickHandler({});
    assert.equal(res.statusCode, 200);
  } finally {
    globalThis.fetch = realFetch;
  }

  const journeys = await store.listJourneys();
  const confirmed = journeys['carla@example.test:seven-days-for-an-anxious-heart'];
  const pending = journeys['pending@example.test:seven-days-for-an-anxious-heart'];
  assert.equal(confirmed.current_day, 2, 'confirmed subscriber advances to day 2');
  assert.equal(confirmed.delivery_status, 'sent');
  assert.equal(pending.current_day, 1, 'unconfirmed subscriber must not be sent to');
});

// ---- unsubscribe & preferences ---------------------------------------------------

test('unsubscribe sets status and always answers gently', async () => {
  const r = await handleUnsubscribe({ email: 'carla@example.test' }, { nowIso: NOW });
  assert.equal(r.statusCode, 200);
  assert.equal((await store.find('carla@example.test')).status, 'unsubscribed');
});

test('an unsubscribed address cannot enroll in a journey', async () => {
  const r = await handleJourneyEnroll(
    { email: 'carla@example.test', journey: 'seven-days-of-learning-to-pray' },
    { nowIso: NOW },
  );
  assert.equal(r.statusCode, 403);
});

test('preferences update topic and frequency', async () => {
  const email = 'rate-2@example.test';
  const r = await handlePreferences({ email, topic: 'grief', frequency: 'daily' }, { nowIso: NOW });
  assert.equal(r.statusCode, 200);
  const sub = await store.find(email);
  assert.equal(sub.topic, 'grief');
  assert.equal(sub.frequency, 'daily');
});

// ---- providers never fake success -------------------------------------------------

test('zeptomail refuses to subscribe without EMAIL_CONFIRM_SECRET', async () => {
  const saved = process.env.EMAIL_CONFIRM_SECRET;
  delete process.env.EMAIL_CONFIRM_SECRET;
  try {
    const r = await zeptoMailProvider.subscribe({ email: 'x@example.test' });
    assert.equal(r.status, 'error');
    assert.match(r.message, /EMAIL_CONFIRM_SECRET/);
  } finally {
    process.env.EMAIL_CONFIRM_SECRET = saved;
  }
});

test('zeptomail reports missing credentials rather than pretending to send', async () => {
  const r = await zeptoMailProvider.subscribe({ email: 'x@example.test' });
  assert.equal(r.status, 'error');
  assert.match(r.message, /ZEPTOMAIL_TOKEN/);
});

// ---- publish gate ------------------------------------------------------------------

test('passesPublishGate enforces every condition', () => {
  const good = {
    status: 'published',
    content_review_status: 'approved',
    scripture_review_status: 'approved',
    scripture_verified: true,
    scripture_text: 'Jesus wept.',
  };
  assert.ok(passesPublishGate(good));
  assert.ok(!passesPublishGate({ ...good, status: 'draft' }));
  assert.ok(!passesPublishGate({ ...good, content_review_status: 'pending' }));
  assert.ok(!passesPublishGate({ ...good, scripture_review_status: 'in_review' }));
  assert.ok(!passesPublishGate({ ...good, scripture_verified: false }));
  assert.ok(
    !passesPublishGate({ ...good, scripture_text: '[VERIFIED NASB 2020 SCRIPTURE TEXT REQUIRED]' }),
  );
});
