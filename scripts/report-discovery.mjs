#!/usr/bin/env node
// Regenerate docs/destinations.md from the site's own matching.
//
//   npm run report:discovery
//
// This doc used to be tallied by hand. It went badly wrong the moment guided
// discovery changed shape: it still counted "9 needs x 3 tiers" after the tiers
// were removed, and reported 33 of 79 destinations reachable when the real
// figure had fallen to 14. A reference that quietly disagrees with the site is
// worse than no reference, so it is computed now.
//
// It runs the SAME functions the pages run -- selectCandidates and
// journeyProductIds out of guided-guards.mjs and product-match.mjs -- so it
// cannot drift from what a visitor can actually reach. It is a report, not a
// gate: nothing fails because of it.
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { NEEDS, TIERS, MAX_JOURNEY_CHOICES } from '../src/config/guided.mjs';
import { selectCandidates } from '../src/lib/guided-guards.mjs';
import { journeyProductIds } from '../src/lib/product-match.mjs';
import { PRODUCTS, FORMAT_KINDS, KIND_LABEL } from '../src/config/products.mjs';
import { loadAllEntries, passesPublishGate, ROOT } from './lib/entries.mjs';

const TIER = TIERS.find((t) => t.slug === 'fifteen-minutes');

const all = await loadAllEntries();
const effective = (d) =>
  new Date(d.featured_date ?? d.publish_date ?? d.updated_at ?? d.created_at ?? 0).getTime();
const live = all
  .map((e) => e.data)
  .filter(passesPublishGate)
  .sort((a, b) => effective(b) - effective(a));

// Walk every journey exactly as the pages do: each need opens its best match,
// and offers the rest as alternates. Every one of those is a page a visitor can
// reach, so every product any of them offers is reachable.
const reachable = new Set();
const journeys = [];
for (const need of NEEDS) {
  const candidates = selectCandidates(live, need, TIER, MAX_JOURNEY_CHOICES);
  const offered = new Set();
  for (const d of candidates) {
    journeyProductIds(d, { ...TIER, formats: [] }, need).forEach((id) => offered.add(id));
    (d.related_product_ids ?? []).forEach((id) => offered.add(id));
  }
  offered.forEach((id) => reachable.add(id));
  journeys.push({ need, candidates, offered: [...offered] });
}

const liveTopics = new Set(live.flatMap((d) => [d.topic, ...(d.secondary_topics ?? [])]));
const lanedTopics = new Set(NEEDS.flatMap((n) => n.lanes));

/** Why a destination cannot be reached — the fix differs for each. */
function reason(p) {
  if (!p.topics.some((t) => liveTopics.has(t))) return 'no published entry carries its topic — needs writing';
  if (!p.topics.some((t) => lanedTopics.has(t))) return 'no need points at its topic — one line of `lanes`';
  if (FORMAT_KINDS.includes(p.kind)) return 'journeys offer no individual formats — see the note below';
  return 'loses to another entry in every journey that could reach it';
}

const bySeries = new Map();
for (const p of PRODUCTS) {
  const key = p.series ?? '(free resources)';
  if (!bySeries.has(key)) bySeries.set(key, []);
  bySeries.get(key).push(p);
}

const formats = PRODUCTS.filter((p) => FORMAT_KINDS.includes(p.kind));
const formatsReachable = formats.filter((p) => reachable.has(p.id)).length;
const pageCount = journeys.reduce((n, j) => n + j.candidates.length, 0);
const stamp = new Intl.DateTimeFormat('en-CA', { dateStyle: 'short' }).format(new Date());

const out = [];
const w = (s = '') => out.push(s);

w('# Every destination, and whether a journey can reach it');
w();
w('> **Generated — do not edit by hand.** Run `npm run report:discovery` to refresh.');
w('> Produced by running the site\'s own [`selectCandidates`](../src/lib/guided-guards.mjs)');
w('> and [`journeyProductIds`](../src/lib/product-match.mjs) across every journey a');
w('> visitor can open, so it cannot disagree with what she actually sees.');
w();
w(`Taken ${stamp}, against ${live.length} published entries and ${NEEDS.length} needs`);
w(`(${pageCount} journey pages — each need opens one entry and offers the rest as alternates).`);
w('It is a reference, not a gate: nothing fails because of it. For what closes the');
w('gaps, see [topic coverage](topic-coverage.md).');
w();
w('## The count');
w();
w('| | Count |');
w('| --- | --- |');
w(`| **Reachable** | **${reachable.size}** |`);
w(`| Unreachable | ${PRODUCTS.length - reachable.size} |`);
w(`| **Total** | **${PRODUCTS.length}** |`);
w();
w(`**Not one of the ${formats.length} individual formats can be reached** — ${formatsReachable} of ${formats.length}.`);
w('The journal, the devotional, the Scripture cards, the prayer cards and the');
w('First Steps Guide have no pathway in any collection. This is not a content gap:');
w('journeys stopped choosing a format when the time tiers were removed, because a');
w('format used to be chosen against the capacity a visitor named and there is no');
w('longer a question to choose against. Everything reachable below is therefore a');
w('free PDF or a whole collection.');
w();
w('## By series');
w();
for (const [key, ps] of bySeries) {
  const got = ps.filter((p) => reachable.has(p.id));
  w(`### ${key} — ${got.length} of ${ps.length}`);
  w();
  for (const p of ps) {
    const ok = reachable.has(p.id);
    w(`- ${ok ? '**reachable**' : 'unreachable'} — ${p.title} *(${KIND_LABEL[p.kind] ?? p.kind})*` +
      (ok ? '' : ` — ${reason(p)}`));
  }
  w();
}
w('## What each need opens, and what it offers');
w();
w('| Need | Opens | Also offers as alternates | Destinations |');
w('| --- | --- | --- | --- |');
for (const j of journeys) {
  const [first, ...alts] = j.candidates;
  w(`| ${j.need.slug} | ${first?.slug ?? '—'} | ${alts.map((a) => a.slug).join(', ') || '—'} | ${j.offered.join(', ') || '—'} |`);
}
w();

const file = path.join(ROOT, 'docs', 'destinations.md');
await fs.writeFile(file, out.join('\n'), 'utf8');
console.log(`Wrote docs/destinations.md — ${reachable.size} of ${PRODUCTS.length} destinations reachable, ${formatsReachable} of ${formats.length} formats.`);
