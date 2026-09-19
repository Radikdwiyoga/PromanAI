/**
 * Shared email template utilities — base layout and helpers for all ProMan notification emails.
 */

import { EMAIL_CONFIG, STATUS_LABELS, STATUS_COLORS } from '../config';

/** Encodes a colour + label into an inline-styled badge (used for status & priority). */
export function badge(label: string, color: string): string {
  return `<span style="display:inline-block;padding:3px 10px;border-radius:9999px;font-size:12px;font-weight:700;color:#fff;background:${color};letter-spacing:0.02em;">${label}</span>`;
}

/** Status badge — uses predefined status colours. */
export function statusBadge(status: string): string {
  return badge(STATUS_LABELS[status] || status, STATUS_COLORS[status] || '#64748b');
}

/**
 * Wraps HTML fragment into a complete email document with ProMan branding.
 * @param opts.title  – Headline shown in the hero banner
 * @param opts.body   – Inner HTML content
 * @param opts.accent – Banner accent colour (hex, default emerald)
 */
export function baseLayout(opts: {
  title: string;
  body: string;
  accent?: string;
}): string {
  const accent = opts.accent || '#10b981';
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${opts.title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    body{margin:0;padding:0;background:#f8fafc;font-family:'Inter',system-ui,-apple-system,sans-serif;color:#1e293b;}
    .wrapper{max-width:600px;margin:0 auto;}
    .banner{background:${accent};padding:32px 28px;border-radius:16px 16px 0 0;}
    .banner h1{margin:0;color:#fff;font-size:20px;font-weight:700;}
    .banner p{margin:6px 0 0;color:rgba(255,255,255,0.82);font-size:13px;}
    .card{background:#fff;padding:28px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 16px 16px;}
    .card table{width:100%;border-collapse:collapse;}
    .card td{padding:6px 0;vertical-align:top;font-size:13px;line-height:1.55;}
    .label{width:130px;color:#64748b;font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:0.03em;}
    .divider{border:none;border-top:1px solid #e2e8f0;margin:18px 0;}
    .btn{display:inline-block;background:${accent};color:#fff!important;text-decoration:none;padding:10px 22px;border-radius:10px;font-size:13px;font-weight:700;}
    .footer{padding:20px 28px;font-size:11px;color:#94a3b8;text-align:center;}
    .footer a{color:#94a3b8;}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="banner">
      <h1>${opts.title}</h1>
      <p>${EMAIL_CONFIG.app.name} Notification</p>
    </div>
    <div class="card">
      ${opts.body}
    </div>
    <div class="footer">
      &copy; ${year} ${EMAIL_CONFIG.app.name} &middot; Email ini dikirim secara otomatis &mdash; jangan balas.
    </div>
  </div>
</body>
</html>`;
}

/**
 * Render a row inside the details table.
 * @param label – left column text
 * @param value – right column HTML content
 */
export function row(label: string, value: string): string {
  return `<tr><td class="label">${label}</td><td>${value}</td></tr>`;
}

/**
 * Render a priority badge.
 */
export function priorityBadge(priority: string): string {
  const map: Record<string, { color: string; label: string }> = {
    low:    { color: '#64748b', label: 'Low' },
    medium: { color: '#f59e0b', label: 'Medium' },
    high:   { color: '#f97316', label: 'High' },
    urgent: { color: '#ef4444', label: '🔴 Urgent' },
  };
  const cfg = map[priority] || map.medium;
  return badge(cfg.label, cfg.color);
}
