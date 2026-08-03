// -----------------------------------------------------------------------------
// Email rendering — turns an approved entry (or a welcome/journey step) into a
// {subject, preview, html, text} email. Table-based, inline-styled HTML for
// broad client support. Used by BOTH the preview pages and the real sender, so
// what you preview is what sends.
//
// The email is useful even if the reader never clicks: the Scripture, a short
// encouragement, and a prayer are all present in the body.
// -----------------------------------------------------------------------------
import { SITE_URL, BASE_PATH, BRAND } from '../../config/site.mjs';

const INK = '#383634';
const SOFT = '#5c5852';
const SAGE = '#b2c6b1';
const IVORY = '#fbf9f6';
const ACCENT = '#34505f';

function abs(path) {
  return `${SITE_URL.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}
function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
function firstParagraph(text, max = 320) {
  const p = String(text || '').split(/\n{2,}/)[0].replace(/\s+/g, ' ').trim();
  return p.length > max ? `${p.slice(0, max - 1).trimEnd()}…` : p;
}

/** Wrap body HTML in the branded email shell. */
function shell(previewText, innerHtml) {
  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:${IVORY};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(previewText)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${IVORY};">
<tr><td align="center" style="padding:24px 12px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e7e0d8;border-radius:14px;">
    <tr><td style="padding:28px 28px 8px;font-family:Georgia,serif;color:${INK};font-size:20px;">
      ${esc(BRAND.name)}
      <div style="font-family:Arial,sans-serif;font-size:12px;letter-spacing:1px;color:${SOFT};text-transform:uppercase;">${esc(BRAND.emailProgramName)}</div>
    </td></tr>
    ${innerHtml}
    <tr><td style="padding:20px 28px 28px;font-family:Arial,sans-serif;font-size:12px;color:${SOFT};line-height:1.6;border-top:1px solid #e7e0d8;">
      You are receiving ${esc(BRAND.emailProgramName)} because you subscribed at ${esc(SITE_URL.replace(/^https?:\/\//, ''))}.
      <br><a href="${abs(BASE_PATH + '/preferences/')}" style="color:${ACCENT};">Update preferences</a> ·
      <a href="${abs(BASE_PATH + '/unsubscribe/')}" style="color:${ACCENT};">Unsubscribe</a>
      <br>${esc(BRAND.name)} · Scripture is quoted with its translation noted and never altered.
    </td></tr>
  </table>
</td></tr></table></body></html>`;
}

/** Render the daily/ongoing encouragement email for an entry. */
export function renderEntryEmail(d, { greetingName } = {}) {
  const subject = d.email_subject || `${d.short_title} — a gentle word for today`;
  const preview = d.email_preview_text || firstParagraph(d.gentle_word, 90);
  const greeting = greetingName ? `Hello ${greetingName},` : 'Hello friend,';
  const opening = d.email_opening || '';
  const body = d.email_body || firstParagraph(d.gentle_word);
  const entryUrl = abs(`${BASE_PATH}/${d.slug}/`) + '?utm_source=email&utm_medium=gentle-note&utm_campaign=daily-encouragement';
  const cta = d.email_cta_text || 'Read the full encouragement';
  const oneThing = d.small_step || d.journal_question || '';

  const inner = `
    <tr><td style="padding:8px 28px 0;font-family:Arial,sans-serif;color:${INK};font-size:16px;line-height:1.7;">
      <p style="margin:16px 0 8px;">${esc(greeting)}</p>
      ${opening ? `<p style="margin:0 0 16px;">${esc(opening)}</p>` : ''}
      <table role="presentation" width="100%" style="background:${IVORY};border-left:4px solid ${SAGE};border-radius:8px;margin:8px 0 16px;">
        <tr><td style="padding:16px 18px;font-family:Georgia,serif;font-size:18px;color:${INK};line-height:1.6;">
          ${esc(d.scripture_text)}
          <div style="font-family:Arial,sans-serif;font-size:13px;color:${SOFT};margin-top:8px;font-weight:bold;">${esc(d.scripture_reference)} · ${esc(d.scripture_translation)}</div>
        </td></tr>
      </table>
      <p style="margin:0 0 16px;">${esc(body)}</p>
      <p style="margin:0 0 6px;font-family:Georgia,serif;color:${ACCENT};font-size:16px;">A prayer to borrow</p>
      <p style="margin:0 0 16px;font-style:italic;color:${SOFT};">${esc(firstParagraph(d.prayer, 400))}</p>
      ${oneThing ? `<p style="margin:0 0 16px;"><strong>One small thing:</strong> ${esc(oneThing)}</p>` : ''}
      <p style="margin:20px 0;">
        <a href="${entryUrl}" style="display:inline-block;background:${ACCENT};color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-family:Arial,sans-serif;font-size:15px;">${esc(cta)}</a>
      </p>
    </td></tr>`;

  const text = [
    greeting,
    opening,
    '',
    `"${d.scripture_text}"`,
    `— ${d.scripture_reference} (${d.scripture_translation})`,
    '',
    body,
    '',
    'A prayer to borrow:',
    firstParagraph(d.prayer, 400),
    oneThing ? `\nOne small thing: ${oneThing}` : '',
    '',
    `${cta}: ${entryUrl}`,
    '',
    `Update preferences: ${abs(BASE_PATH + '/preferences/')}`,
    `Unsubscribe: ${abs(BASE_PATH + '/unsubscribe/')}`,
  ]
    .filter((l) => l !== undefined)
    .join('\n');

  return { subject, preview, html: shell(preview, inner), text };
}

/** Render a welcome-series email (some steps pull Scripture from an entry). */
export function renderWelcomeEmail(step, entry) {
  const subject = step.subject;
  const preview = step.preview;
  const ctaUrl = abs(step.cta_path) + '?utm_source=email&utm_medium=welcome&utm_campaign=welcome-series';
  const scriptureBlock =
    entry
      ? `<table role="presentation" width="100%" style="background:${IVORY};border-left:4px solid ${SAGE};border-radius:8px;margin:8px 0 16px;">
          <tr><td style="padding:16px 18px;font-family:Georgia,serif;font-size:18px;color:${INK};line-height:1.6;">
          ${esc(entry.scripture_text)}
          <div style="font-family:Arial,sans-serif;font-size:13px;color:${SOFT};margin-top:8px;font-weight:bold;">${esc(entry.scripture_reference)} · ${esc(entry.scripture_translation)}</div>
          </td></tr></table>`
      : '';

  const inner = `
    <tr><td style="padding:8px 28px 0;font-family:Arial,sans-serif;color:${INK};font-size:16px;line-height:1.7;">
      <p style="margin:16px 0 12px;">${esc(step.purpose)}</p>
      ${scriptureBlock}
      <p style="margin:20px 0;">
        <a href="${ctaUrl}" style="display:inline-block;background:${ACCENT};color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-family:Arial,sans-serif;font-size:15px;">${esc(step.cta_text)}</a>
      </p>
    </td></tr>`;

  const text = `${step.purpose}\n\n${entry ? `"${entry.scripture_text}" — ${entry.scripture_reference} (${entry.scripture_translation})\n\n` : ''}${step.cta_text}: ${ctaUrl}`;
  return { subject, preview, html: shell(preview, inner), text };
}
