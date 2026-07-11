// Scheduled function — advances active seven-day journeys and daily sends.
// Runs on a cron (see `config.schedule`). For each due enrollment it sends the
// next day's email and advances the tracking state (spec §12D fields).
//
// IMPORTANT: this is the scheduler skeleton. To actually deliver in production
// you need BOTH (a) a durable store (the default store is ephemeral on
// serverless — swap src/lib/email/store.mjs for Netlify Blobs or a DB) and (b) a
// real provider (EMAIL_PROVIDER=zeptomail or zoho_campaigns with credentials).
// Under the default mock it logs what it would send. Nothing here sends real
// email until you configure those — no fake success.
import { JOURNEY_BY_SLUG } from '../../src/config/email.mjs';
import { SITE_URL, BASE_PATH } from '../../src/config/site.mjs';
import { store } from '../../src/lib/email/store.mjs';
import { getProvider } from '../../src/lib/email/providers.mjs';

// Netlify cron: every day at 13:00 UTC. Adjust to your audience's morning.
export const config = { schedule: '0 13 * * *' };

async function loadEmails() {
  try {
    const res = await fetch(`${SITE_URL.replace(/\/$/, '')}${BASE_PATH}/emails.json`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('[journey-tick] could not load emails.json:', err.message);
  }
  return {};
}

export const handler = async () => {
  const provider = getProvider();
  const emails = await loadEmails();
  const nowIso = new Date().toISOString();
  const now = Date.now();

  // The default file store keeps enrollments under db.journeys. A durable store
  // must expose the same shape. We read via a private helper for the skeleton.
  const db = await store._dump?.();
  const journeys = db?.journeys || {};
  let sent = 0;
  let skipped = 0;

  for (const [key, enr] of Object.entries(journeys)) {
    if (enr.paused || enr.completion_status === 'completed') { skipped++; continue; }
    if (enr.next_eligible_at && new Date(enr.next_eligible_at).getTime() > now) { skipped++; continue; }

    const sub = await store.find(enr.subscriber);
    if (!sub || sub.status === 'unsubscribed') { skipped++; continue; }

    const journey = JOURNEY_BY_SLUG[enr.journey_id];
    if (!journey) { skipped++; continue; }
    const dayIndex = (enr.current_day || 1) - 1;
    const slug = journey.days[dayIndex];
    const email = slug && emails[slug];
    if (!email) { skipped++; continue; }

    if (typeof provider.sendTransactional === 'function') {
      await provider.sendTransactional({
        to: enr.subscriber,
        toName: sub.first_name,
        subject: `${journey.title} · Day ${enr.current_day}: ${email.subject}`,
        htmlBody: email.html,
        textBody: email.text,
      });
    } else {
      console.log(`[journey-tick] (mock) would send ${enr.journey_id} day ${enr.current_day} to ${enr.subscriber}`);
    }

    const nextDay = (enr.current_day || 1) + 1;
    const done = nextDay > journey.days.length;
    await store.updateJourney?.(key, {
      current_day: done ? journey.days.length : nextDay,
      last_email_sent: nowIso,
      delivery_status: 'sent',
      completion_status: done ? 'completed' : 'in_progress',
      next_eligible_at: done ? null : new Date(now + 86_400_000).toISOString(),
    });
    sent++;
  }

  const summary = `journey-tick: sent ${sent}, skipped ${skipped}`;
  console.log(summary);
  return { statusCode: 200, body: summary };
};
