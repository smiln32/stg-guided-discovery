// -----------------------------------------------------------------------------
// Pinterest Pin engine.
//
// One approved entry -> up to five ready-to-save Pins (Scripture, Encouragement,
// Prayer, Practical, Curiosity). This module is pure and dependency-free so it
// is shared by BOTH the on-page previews (src/pages/.../pins) and the Node PNG
// export script (scripts/export-pins.mjs) — previews and exports can never drift.
//
// Every Pin destination is the PERMANENT entry URL (never the rotating daily
// page), carrying UTM + Pin-type tracking, so a Pin still resolves years later.
//
// Working size is 1000 x 1500 (vertical 2:3). Text is wrapped conservatively and
// each Pin reports whether its content overflows the safe area so long Scripture
// or prayers can be caught before publishing.
// -----------------------------------------------------------------------------
import { SITE_URL, BASE_PATH, BRAND } from '../config/site.mjs';
import { TOPIC_BY_SLUG } from '../config/topics.mjs';
import { SCRIPTURE_PLACEHOLDER } from '../config/entry-fields.mjs';

export const PIN_W = 1000;
export const PIN_H = 1500;
const MARGIN = 96; // safe text margin on all sides
const CONTENT_W = PIN_W - MARGIN * 2;
const CX = PIN_W / 2;

// Vertical rhythm. The message (eyebrow → divider → text → reference) is
// composed as ONE centered cluster inside [MESSAGE_TOP, MESSAGE_BOTTOM]; the
// footer (brand + domain) is anchored below it. This keeps whitespace balanced
// and symmetric instead of letting the text float in a tall empty band.
const EYEBROW_TO_DIVIDER = 46;
const DIVIDER_TO_TEXT = 92;
const TEXT_TO_REF = 66;
const MESSAGE_TOP = 250;
const MESSAGE_BOTTOM = 1200;
const FOOTER_RULE_Y = 1288;
const BRAND_Y = 1352;

const ACCENT_FALLBACK = '#7b9fb3';
const INK = '#383634';
const IVORY = '#fbf9f6';
const SOFT = '#5c5852';

/** Approximate greedy word-wrap. Returns array of lines. */
function wrapText(text, fontSize, maxWidth = CONTENT_W, glyphRatio = 0.52) {
  const maxChars = Math.max(8, Math.floor(maxWidth / (fontSize * glyphRatio)));
  const words = String(text).replace(/\s+/g, ' ').trim().split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const candidate = line ? `${line} ${w}` : w;
    if (candidate.length > maxChars && line) {
      lines.push(line);
      line = w;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function firstSentences(text, max = 220) {
  const clean = String(text).replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastStop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('? '), cut.lastIndexOf('! '));
  return (lastStop > 60 ? cut.slice(0, lastStop + 1) : `${cut.trimEnd()}…`).trim();
}

/**
 * A Pinterest destination URL always points at the PERMANENT entry page (never
 * the rotating daily landing page) and carries UTM + Pin-type tracking so a Pin
 * pinned today still resolves correctly years from now.
 */
export function pinDestination(slug, pinType, campaign = 'hold-this-today') {
  const base = `${SITE_URL.replace(/\/$/, '')}${BASE_PATH}/${slug}/`;
  const q = new URLSearchParams({
    utm_source: 'pinterest',
    utm_medium: 'pin',
    utm_campaign: campaign,
    utm_content: pinType,
  });
  return `${base}?${q.toString()}`;
}

/**
 * Build the Pin set for an entry.
 * @param {object} data  Validated entry data.
 * @returns {Array} pins with copy, metadata, filename, destination, overflow.
 */
export function buildPins(data) {
  const topic = TOPIC_BY_SLUG[data.topic];
  const accent = topic?.accent || ACCENT_FALLBACK;
  const board = data.pinterest_board || topic?.title || 'Encouragement';
  const scriptureReady = data.scripture_text.trim() !== SCRIPTURE_PLACEHOLDER;

  const destination = (pinType) => pinDestination(data.slug, pinType);

  const filename = (pinType) =>
    `hold-this-today-${data.slug}-${pinType}-pin.png`.toLowerCase();

  const meta = (pinType, altFallback) => ({
    type: pinType,
    pin_title: data.pin_title || `${data.short_title} · ${BRAND.featureName}`,
    pin_description:
      data.pin_description ||
      `${firstSentences(data.gentle_word, 180)} — a gentle, Scripture-centered encouragement from ${BRAND.name}.`,
    alt_text: data.pin_alt_text || altFallback,
    board,
    destination: destination(pinType),
    filename: filename(pinType),
    accent,
  });

  /** @type {Array<any>} */
  const pins = [];

  // 1. Scripture Pin — the EXACT verse text, never a paraphrase, only when the
  // verified text is present (never a placeholder). pin_quote is intentionally
  // NOT used here so a Scripture-labeled Pin can never alter the verse.
  if (scriptureReady) {
    pins.push({
      ...meta('scripture', `Scripture card: ${data.scripture_reference}, ${data.scripture_translation}.`),
      eyebrow: 'Scripture',
      body: data.scripture_text,
      caption: `${data.scripture_reference} · ${data.scripture_translation}`,
      style: 'serif',
    });
  }

  // 2. Encouragement Pin — a standalone gentle-word excerpt (pin_quote is an
  // approved encouragement line; it carries no reference/translation label).
  pins.push({
    ...meta('encouragement', `Encouragement: ${data.short_title}.`),
    eyebrow: 'A gentle word',
    body: data.pin_quote || firstSentences(data.gentle_word, 240),
    caption: data.short_title,
    style: 'serif',
  });

  // 3. Prayer Pin
  if (data.prayer) {
    pins.push({
      ...meta('prayer', `A short prayer for ${topic?.title || data.topic}.`),
      eyebrow: 'A prayer to borrow',
      body: data.pin_prayer || firstSentences(data.prayer, 260),
      caption: '',
      style: 'italic',
    });
  }

  // 4. Practical Pin
  if (data.small_step || data.pin_practical_text) {
    pins.push({
      ...meta('practical', `One small step for ${topic?.title || data.topic}.`),
      eyebrow: 'One small step',
      body: data.pin_practical_text || data.small_step,
      caption: '',
      style: 'sans',
    });
  }

  // 5. Curiosity / entry-point Pin
  if (data.pin_curiosity_text) {
    pins.push({
      ...meta('curiosity', data.pin_curiosity_text),
      eyebrow: BRAND.featureName,
      body: data.pin_curiosity_text,
      caption: '',
      style: 'heading',
    });
  }

  return pins;
}

const FONT_BY_STYLE = {
  serif: "'Lora', Georgia, serif",
  italic: "'Lora', Georgia, serif",
  sans: "'Source Sans 3', system-ui, sans-serif",
  heading: "'Playfair Display', Georgia, serif",
};

/** Choose a body font size that fits, shrinking a little for long copy. */
function chooseFontSize(text, style) {
  const len = String(text).length;
  if (style === 'heading') return len > 90 ? 58 : len > 50 ? 68 : 82;
  if (len > 320) return 40;
  if (len > 220) return 46;
  if (len > 130) return 52;
  return 60;
}

// A small, symmetric botanical sprig (two mirrored leaves + seed). Symmetric by
// construction (the right leaf is the mirror of the left), so it always reads as
// balanced — the calm, restrained motif the brand calls for.
function sprig(cx, cy, accent) {
  const leaf = 'M0 0 C 4 -7 11 -10 18 -19 C 9 -9 4 -4 0 0 Z';
  return `<g transform="translate(${cx} ${cy})" fill="${accent}" opacity="0.9">
    <path d="${leaf}"/>
    <path d="${leaf}" transform="scale(-1,1)"/>
    <circle cx="0" cy="4" r="2.4"/>
  </g>`;
}

// A centered divider: two short hairlines flanking the sprig. Frames the message
// and gives the eye a clear path from the eyebrow down into the verse.
function dividerMotif(cx, cy, accent) {
  const gap = 30;
  const len = 74;
  return `<g opacity="0.85">
    <line x1="${cx - gap - len}" y1="${cy}" x2="${cx - gap}" y2="${cy}" stroke="${accent}" stroke-width="1.5"/>
    <line x1="${cx + gap}" y1="${cy}" x2="${cx + gap + len}" y2="${cy}" stroke="${accent}" stroke-width="1.5"/>
    ${sprig(cx, cy - 1, accent)}
  </g>`;
}

/**
 * Render a Pin to an SVG string (1000x1500). Identical output in browser preview
 * and PNG export. The message (eyebrow → divider → text → reference) is composed
 * as one optically-centered cluster with a fixed footer, so whitespace stays
 * balanced and the verse never floats. Returns { svg, overflow, lineCount }.
 */
export function renderPinSvg(pin) {
  const accent = pin.accent || ACCENT_FALLBACK;
  const fontFamily = FONT_BY_STYLE[pin.style] || FONT_BY_STYLE.serif;
  const italic = pin.style === 'italic' ? ' font-style="italic"' : '';
  const fontSize = chooseFontSize(pin.body, pin.style);
  const lineHeight = Math.round(fontSize * 1.4);
  const lines = wrapText(pin.body, fontSize);
  const textBlockH = lines.length * lineHeight;
  const hasCaption = Boolean(pin.caption);

  // Height of the whole message cluster, so we can center it as one unit.
  const EYEBROW_H = 30;
  const capH = hasCaption ? 32 : 0;
  const capGap = hasCaption ? TEXT_TO_REF : 0;
  const clusterH =
    EYEBROW_H + EYEBROW_TO_DIVIDER + DIVIDER_TO_TEXT + textBlockH + capGap + capH;

  const region = MESSAGE_BOTTOM - MESSAGE_TOP;
  const overflow = clusterH > region;
  // Optical centering, biased slightly upward (0.44) so it doesn't sit low.
  const clusterTop = MESSAGE_TOP + Math.max(0, (region - clusterH) * 0.44);

  const eyebrowY = clusterTop + EYEBROW_H; // baseline
  const dividerY = eyebrowY + EYEBROW_TO_DIVIDER;
  const textStart = dividerY + DIVIDER_TO_TEXT;

  let y = textStart + fontSize;
  const textLines = lines
    .map((ln) => {
      const el = `<text x="${CX}" y="${Math.round(y)}" text-anchor="middle" font-family="${fontFamily}"${italic} font-size="${fontSize}" fill="${INK}">${escapeXml(ln)}</text>`;
      y += lineHeight;
      return el;
    })
    .join('\n    ');

  const captionY = textStart + textBlockH + capGap;
  const caption = hasCaption
    ? `<text x="${CX}" y="${Math.round(captionY)}" text-anchor="middle" font-family="'Source Sans 3', sans-serif" font-size="27" letter-spacing="1.5" fill="${SOFT}">${escapeXml(pin.caption)}</text>`
    : '';

  return {
    overflow,
    lineCount: lines.length,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${PIN_W}" height="${PIN_H}" viewBox="0 0 ${PIN_W} ${PIN_H}" role="img" aria-label="${escapeXml(pin.alt_text)}">
  <rect width="${PIN_W}" height="${PIN_H}" fill="${IVORY}"/>
  <rect x="40" y="40" width="${PIN_W - 80}" height="${PIN_H - 80}" rx="6" fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.4"/>
  <text x="${CX}" y="${Math.round(eyebrowY)}" text-anchor="middle" font-family="'Source Sans 3', sans-serif" font-size="${EYEBROW_H - 2}" letter-spacing="6" fill="${SOFT}">${escapeXml(pin.eyebrow.toUpperCase())}</text>
  ${dividerMotif(CX, Math.round(dividerY), accent)}
  ${textLines}
  ${caption}
  <line x1="${CX - 26}" y1="${FOOTER_RULE_Y}" x2="${CX + 26}" y2="${FOOTER_RULE_Y}" stroke="${accent}" stroke-width="1.5" opacity="0.7"/>
  <text x="${CX}" y="${BRAND_Y}" text-anchor="middle" font-family="'Playfair Display', Georgia, serif" font-size="32" fill="${INK}">${escapeXml(BRAND.name)}</text>
</svg>`,
  };
}
