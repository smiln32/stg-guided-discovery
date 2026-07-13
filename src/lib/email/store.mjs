// -----------------------------------------------------------------------------
// Subscriber store abstraction.
//
// For the self-managed (ZeptoMail/SMTP) path this holds subscribers, preference
// changes, and journey enrollment. Two backends behind one interface:
//
//   • Netlify Blobs (production + `netlify dev`) — durable, shared across
//     function instances, so enrollments written by journey-enroll are visible
//     to the scheduled journey-tick. One blob per subscriber / enrollment.
//   • Local JSON file (plain-node dev, scripts) — .data/subscribers.json.
//
// The backend is picked automatically: Blobs whenever a Netlify runtime is
// detected, the file otherwise. Legacy handler-style functions must call
// initStore(event) (see netlify/functions/lib/shared.mjs) before first use so
// Blobs credentials from the event payload are wired up on older runtimes.
//
// When EMAIL_PROVIDER=zoho_campaigns, Zoho is the system of record and this
// store supplements it (dedupe, journey tracking).
// -----------------------------------------------------------------------------
import { promises as fs } from 'node:fs';
import path from 'node:path';

// ---------- local JSON-file backend (dev only) --------------------------------
const DATA_DIR = process.env.HTT_DATA_DIR || '.data';
const FILE = path.join(DATA_DIR, 'subscribers.json');

async function readAll() {
  try {
    const raw = await fs.readFile(FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { subscribers: {}, journeys: {} };
  }
}

async function writeAll(db) {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(db, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.warn('[email:store] persistence unavailable:', err.message);
    return false;
  }
}

const fileBackend = {
  async find(email) {
    const db = await readAll();
    return db.subscribers[email] || null;
  },

  async upsert(sub) {
    const db = await readAll();
    const existed = Boolean(db.subscribers[sub.email]);
    db.subscribers[sub.email] = {
      ...(db.subscribers[sub.email] || {}),
      ...sub,
      updated_at: sub.consent_timestamp,
    };
    await writeAll(db);
    return { existed };
  },

  async setStatus(email, status, whenIso) {
    const db = await readAll();
    if (db.subscribers[email]) {
      db.subscribers[email].status = status;
      db.subscribers[email].updated_at = whenIso;
      await writeAll(db);
      return true;
    }
    return false;
  },

  async updatePreferences(email, prefs, whenIso) {
    const db = await readAll();
    const existing = db.subscribers[email];
    if (!existing) return false;
    db.subscribers[email] = { ...existing, ...prefs, updated_at: whenIso };
    await writeAll(db);
    return true;
  },

  /** All journey enrollments as { "email:journey-slug": enrollment }. */
  async listJourneys() {
    const db = await readAll();
    return db.journeys || {};
  },

  async updateJourney(key, patch) {
    const db = await readAll();
    if (!db.journeys[key]) return false;
    db.journeys[key] = { ...db.journeys[key], ...patch };
    await writeAll(db);
    return true;
  },

  async enrollJourney(email, journeySlug, whenIso) {
    const db = await readAll();
    const key = `${email}:${journeySlug}`;
    if (db.journeys[key] && db.journeys[key].status !== 'exited') {
      return { status: 'already_enrolled' };
    }
    db.journeys[key] = newEnrollment(email, journeySlug, whenIso);
    await writeAll(db);
    return { status: 'enrolled' };
  },
};

// ---------- Netlify Blobs backend (production) --------------------------------
const SUB_PREFIX = 'subscribers/';
const JOURNEY_PREFIX = 'journeys/';

let blobStorePromise;
async function blobs() {
  if (!blobStorePromise) {
    blobStorePromise = import('@netlify/blobs').then(({ getStore }) =>
      // Strong consistency so dedupe/confirm/unsubscribe read their own writes.
      getStore({ name: 'htt-email', consistency: 'strong' }),
    );
  }
  return blobStorePromise;
}

const blobBackend = {
  async find(email) {
    const s = await blobs();
    return (await s.get(SUB_PREFIX + email, { type: 'json' })) || null;
  },

  async upsert(sub) {
    const s = await blobs();
    const key = SUB_PREFIX + sub.email;
    const existing = await s.get(key, { type: 'json' });
    await s.setJSON(key, {
      ...(existing || {}),
      ...sub,
      updated_at: sub.consent_timestamp,
    });
    return { existed: Boolean(existing) };
  },

  async setStatus(email, status, whenIso) {
    const s = await blobs();
    const key = SUB_PREFIX + email;
    const existing = await s.get(key, { type: 'json' });
    if (!existing) return false;
    await s.setJSON(key, { ...existing, status, updated_at: whenIso });
    return true;
  },

  async updatePreferences(email, prefs, whenIso) {
    const s = await blobs();
    const key = SUB_PREFIX + email;
    const existing = await s.get(key, { type: 'json' });
    if (!existing) return false;
    await s.setJSON(key, { ...existing, ...prefs, updated_at: whenIso });
    return true;
  },

  async listJourneys() {
    const s = await blobs();
    const out = {};
    for await (const page of s.list({ prefix: JOURNEY_PREFIX, paginate: true })) {
      for (const blob of page.blobs) {
        const enr = await s.get(blob.key, { type: 'json' });
        if (enr) out[blob.key.slice(JOURNEY_PREFIX.length)] = enr;
      }
    }
    return out;
  },

  async updateJourney(key, patch) {
    const s = await blobs();
    const existing = await s.get(JOURNEY_PREFIX + key, { type: 'json' });
    if (!existing) return false;
    await s.setJSON(JOURNEY_PREFIX + key, { ...existing, ...patch });
    return true;
  },

  async enrollJourney(email, journeySlug, whenIso) {
    const s = await blobs();
    const key = `${email}:${journeySlug}`;
    const existing = await s.get(JOURNEY_PREFIX + key, { type: 'json' });
    if (existing && existing.status !== 'exited') {
      return { status: 'already_enrolled' };
    }
    await s.setJSON(JOURNEY_PREFIX + key, newEnrollment(email, journeySlug, whenIso));
    return { status: 'enrolled' };
  },
};

function newEnrollment(email, journeySlug, whenIso) {
  return {
    journey_id: journeySlug,
    subscriber: email,
    enrolled_at: whenIso,
    current_day: 1,
    delivery_status: 'pending',
    completion_status: 'in_progress',
    paused: false,
    exit_reason: null,
    last_email_sent: null,
    next_eligible_at: whenIso,
  };
}

// ---------- backend selection --------------------------------------------------
function usingBlobs() {
  if (process.env.HTT_DATA_DIR) return false; // explicit file-store override
  return Boolean(
    process.env.NETLIFY ||
      process.env.NETLIFY_DEV ||
      process.env.NETLIFY_BLOBS_CONTEXT,
  );
}

function backend() {
  return usingBlobs() ? blobBackend : fileBackend;
}

export const store = {
  find: (...a) => backend().find(...a),
  upsert: (...a) => backend().upsert(...a),
  setStatus: (...a) => backend().setStatus(...a),
  updatePreferences: (...a) => backend().updatePreferences(...a),
  listJourneys: (...a) => backend().listJourneys(...a),
  updateJourney: (...a) => backend().updateJourney(...a),
  enrollJourney: (...a) => backend().enrollJourney(...a),
};
