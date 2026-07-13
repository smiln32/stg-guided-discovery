// Scheduled function — advances active seven-day journeys and daily sends.
// Runs on a cron (see `config.schedule`). For each due enrollment it sends the
// next day's email and advances the tracking state (spec §12D fields).
//
// Storage is durable on Netlify (the store uses Netlify Blobs there), so
// enrollments written by journey-enroll are visible here. Real delivery still
// requires a real provider (EMAIL_PROVIDER=zeptomail with credentials — the
// only provider with sendTransactional). Under the default mock it logs what
// it would send. Nothing here sends real email until you configure that — and
// never to an address that has not completed double opt-in.
import { JOURNEY_BY_SLUG } from '../../src/config/email.mjs';
import { SITE_URL, BASE_PATH } from '../../src/config/site.mjs';
import { store } from '../../src/lib/email/store.mjs';
import { getProvider } from '../../src/lib/email/providers.mjs';
import { initStore } from './lib/shared.mjs';

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

export const handler = async (event) => {
  initStore(event);
  const provider = getProvider();
  const emails = await loadEmails();
  const nowIso = new Date().toISOString();
  const now = Date.now();

  const journeys = await store.listJourneys();
  let sent = 0;
  let skipped = 0;

  for (const [key, enr] of Object.entries(journeys)) {
    if (enr.paused || enr.completion_status === 'completed') { skipped++; continue; }
    if (enr.next_eligible_at && new Date(enr.next_eligible_at).getTime() > now) { skipped++; continue; }

    // Double opt-in gate: nothing is ever sent to an address that has not
    // confirmed (status flips to 'confirmed' via the confirm function).
    const sub = await store.find(enr.subscriber);
    if (!sub || sub.status !== 'confirmed') { skipped++; continue; }

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
    await store.updateJourney(key, {
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
