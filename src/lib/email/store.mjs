// -----------------------------------------------------------------------------
// Subscriber store abstraction.
//
// For the self-managed (ZeptoMail/SMTP) path this holds subscribers, preference
// changes, and journey enrollment. The default implementation persists to a
// local JSON file for DEVELOPMENT ONLY. Serverless filesystems are ephemeral, so
// PRODUCTION MUST swap this for a durable store (Netlify Blobs, a database, or
// Zoho itself). Every method degrades gracefully if persistence is unavailable.
//
// When EMAIL_PROVIDER=zoho_campaigns, Zoho is the system of record and this
// store is optional (used only for local analytics/idempotency).
// -----------------------------------------------------------------------------
import { promises as fs } from 'node:fs';
import path from 'node:path';

const DATA_DIR = process.env.HTT_DATA_DIR || (process.env.NETLIFY ? '/tmp' : '.data');
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
    // In production with no writable/durable store this is expected — the ESP
    // remains the source of truth. Log once and continue.
    console.warn('[email:store] persistence unavailable:', err.message);
    return false;
  }
}

export const store = {
  async find(email) {
    const db = await readAll();
    return db.subscribers[email] || null;
  },

  /** Upsert a subscriber. Returns { existed }. */
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

  /** Return the whole store (used by the scheduled journey sender). */
  async _dump() {
    return readAll();
  },

  /** Patch a journey enrollment's tracking fields. */
  async updateJourney(key, patch) {
    const db = await readAll();
    if (!db.journeys[key]) return false;
    db.journeys[key] = { ...db.journeys[key], ...patch };
    await writeAll(db);
    return true;
  },

  /** Enroll a subscriber in a journey (spec §12D tracking fields). */
  async enrollJourney(email, journeySlug, whenIso) {
    const db = await readAll();
    const key = `${email}:${journeySlug}`;
    if (db.journeys[key] && db.journeys[key].status !== 'exited') {
      return { status: 'already_enrolled' };
    }
    db.journeys[key] = {
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
    await writeAll(db);
    return { status: 'enrolled' };
  },
};
