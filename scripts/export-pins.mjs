#!/usr/bin/env node
// Render every approved entry's Pins to 1000x1500 PNG files.
//   npm run pins:export                  # all live entries -> /pin-exports
//   npm run pins:export -- my-slug        # just one entry
//
// Uses the SAME renderer as the on-site previews (src/lib/pins.mjs), so exports
// match previews. Fonts: resvg uses system fonts, plus any .ttf/.otf you drop in
// src/assets/fonts (recommended: the brand fonts, so exported typography matches
// the browser exactly). Without them, resvg substitutes a system face — layout,
// color, and text are still correct.
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import { loadAllEntries, ROOT, PLACEHOLDER, LIVE_STATUSES } from './lib/entries.mjs';
import { buildPins, renderPinSvg, PIN_W } from '../src/lib/pins.mjs';

const only = process.argv.slice(2).find((a) => !a.startsWith('--'));
const OUT = path.join(ROOT, 'pin-exports');
const FONT_DIR = path.join(ROOT, 'src', 'assets', 'fonts');

let fontFiles = [];
try {
  const files = await fs.readdir(FONT_DIR);
  fontFiles = files.filter((f) => /\.(ttf|otf)$/i.test(f)).map((f) => path.join(FONT_DIR, f));
} catch {
  // No bundled fonts — resvg falls back to system fonts.
}

const entries = (await loadAllEntries())
  .map((x) => x.data)
  .filter((d) => LIVE_STATUSES.has(d.status) && !String(d.scripture_text).includes(PLACEHOLDER))
  .filter((d) => !only || d.slug === only);

if (entries.length === 0) {
  console.error(only ? `No live entry with slug "${only}".` : 'No live entries to export.');
  process.exit(1);
}

await fs.mkdir(OUT, { recursive: true });
let count = 0;
let overflowCount = 0;

for (const d of entries) {
  const pins = buildPins(d);
  for (const pin of pins) {
    const { svg, overflow, lineCount } = renderPinSvg(pin);
    if (overflow) {
      overflowCount++;
      console.warn(`  ⚠ ${pin.filename}: ${lineCount} lines may be tight — check for clipping.`);
    }
    const resvg = new Resvg(svg, {
      fitTo: { mode: 'width', value: PIN_W },
      font: { loadSystemFonts: true, fontFiles, defaultFontFamily: 'Georgia' },
    });
    const png = resvg.render().asPng();
    const file = path.join(OUT, pin.filename);
    await fs.writeFile(file, png);
    count++;
    console.log(`  ✓ ${pin.filename}`);
  }
}

console.log(`\nExported ${count} Pin PNG(s) from ${entries.length} entr${entries.length === 1 ? 'y' : 'ies'} to /pin-exports.`);
if (!fontFiles.length) {
  console.log('Note: no brand fonts found in src/assets/fonts — resvg used a system font. Add the brand .ttf files there for exact typography.');
}
if (overflowCount) console.log(`${overflowCount} Pin(s) flagged for possible overflow — review those before publishing.`);
