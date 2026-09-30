/**
 * Rekap harian ProMan -> Telegram
 * ------------------------------------------------------------------
 * Dijalankan tiap pagi oleh GitHub Actions (.github/workflows/daily-recap.yml).
 * Membaca Firestore via REST API, lalu mengirim satu pesan rekap ke grup.
 *
 *   node scripts/send-daily-recap.mjs            # kirim
 *   node scripts/send-daily-recap.mjs --dry-run  # cetak saja, tidak kirim
 *
 * Autentikasi memakai OAuth token yang ditukar dari FIREBASE_TOKEN (refresh
 * token milik firebase-tools, sama dengan yang dipakai deploy). Jadi tidak
 * ada service-account.json yang perlu disimpan di repo.
 *
 * Zona waktu: Asia/Jakarta (WIB). "Hari ini" selalu dihitung di WIB, bukan
 * di zona waktu runner GitHub yang UTC.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || 'proman-83c57';
const BOT_TOKEN = process.env.VITE_TELEGRAM_BOT_TOKEN || '';
const CHAT_ID = process.env.VITE_TELEGRAM_CHAT_ID || '';
const FIREBASE_TOKEN = process.env.FIREBASE_TOKEN || '';
const DRY_RUN = process.argv.includes('--dry-run');

/** Maksimal judul tugas yang ditulis per orang per kategori. */
const MAX_TASKS_PER_PERSON = 5;
/** Batas Telegram per pesan. Kalau lewat, pesan dipecah. */
const TELEGRAM_LIMIT = 4096;

// Klien OAuth publik milik Firebase CLI. Dipakai hanya untuk menukar refresh
// token jadi access token; tidak granting akses apa pun sendiri.
const OAUTH_CLIENT_ID =
  process.env.FIREBASE_CLIENT_ID ||
  '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com';
const OAUTH_CLIENT_SECRET = process.env.FIREBASE_CLIENT_SECRET || 'j9iVZfS8kkCEFUPaAeJV0sAi';

const TIMEZONE = 'Asia/Jakarta';

const fail = (msg) => {
  console.error(`[recap] ${msg}`);
  process.exit(1);
};

// --- Autentikasi ---------------------------------------------------------
// FIREBASE_TOKEN adalah refresh token. Semua panggilan Firestore REST
// memerlukan access token berumur pendek, jadi tukar dulu setiap kali jalan.

async function getAccessToken() {
  if (!FIREBASE_TOKEN) {
    fail('FIREBASE_TOKEN kosong. Secret ini diisi dari cache firebase-tools oleh scripts/set-github-secrets.ps1');
  }
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: FIREBASE_TOKEN,
      client_id: OAUTH_CLIENT_ID,
      client_secret: OAUTH_CLIENT_SECRET,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    fail(`Tukar token gagal (HTTP ${res.status}): ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.access_token;
}

// --- Baca Firestore ------------------------------------------------------
// Field Firestore dibungkus typing: { stringValue: "..." }, { arrayValue: ... }
// dst. Buka bungkusnya sebelum dipakai.

function unwrap(value) {
  if (value === null || value === undefined) return undefined;
  if ('stringValue' in value) return value.stringValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('timestampValue' in value) return value.timestampValue;
  if ('nullValue' in value) return null;
  if ('arrayValue' in value) return (value.arrayValue?.values ?? []).map(unwrap);
  if ('mapValue' in value) {
    const out = {};
    for (const [k, v] of Object.entries(value.mapValue?.fields ?? {})) out[k] = unwrap(v);
    return out;
  }
  return value;
}

function docName(docId) {
  // ID bisa mengandung karakter yang harus di-encode di segment URL.
  return encodeURIComponent(docId);
}

async function readCollection(accessToken, collection) {
  const base =
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}` +
    `/databases/(default)/documents/${collection}`;

  const all = [];
  let pageToken = null;

  // Iterasi dengan pagination supaya tidak terpotong kalau data bertambah.
  do {
    const url = new URL(base);
    url.searchParams.set('pageSize', '300');
    if (pageToken) url.searchParams.set('pageToken', pageToken);

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      const body = await res.text();
      fail(`Baca ${collection} gagal (HTTP ${res.status}): ${body.slice(0, 200)}`);
    }
    const data = await res.json();
    for (const doc of data.documents ?? []) {
      const out = { id: doc.name.split('/').pop() };
      for (const [k, v] of Object.entries(doc.fields ?? {})) out[k] = unwrap(v);
      all.push(out);
    }
    pageToken = data.nextPageToken ?? null;
  } while (pageToken);

  return all;
}

// --- Tanggal -------------------------------------------------------------
// "Hari ini" harus dihitung di WIB. Kalau pakai toISOString() runner GitHub
// berjalan di UTC, maka pukul 01:00 WIB (= 18:00 UTC hari sebelumnya) akan
// salah dihitung sebagai hari yang lalu.

function todayInWIB() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/** Selisih hari antara dueDate (YYYY-MM-DD) dan hari ini, dalam WIB. */
function daysOverdue(dueDate, today) {
  if (!dueDate) return null;
  const a = Date.parse(`${dueDate}T00:00:00Z`);
  const b = Date.parse(`${today}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  return Math.round((b - a) / 86400000);
}

function formatTanggal(iso) {
  if (!iso) return '-';
  try {
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: TIMEZONE,
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());
  } catch {
    return iso;
  }
}

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

/**
 * Format tanggal ringkas dalam bahasa Indonesia, mis. "Rabu, 30 Sep 2026".
 *
 * Angka bulan diambil langsung dari Intl (bukan dicari lewat array), karena
 * 'en-GB' dengan month: '2-digit' menghasilkan "09" — bukan "Sep" — sehingga
 * pencarian berbasis nama selalu gagal dan bulan tercetak sebagai 0.
 */
function tanggalPendek(date = new Date()) {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIMEZONE,
    weekday: 'long',
    day: 'numeric',
    month: '2-digit',
    year: 'numeric',
  }).formatToParts(date);

  const get = (t) => fmt.find((p) => p.type === t)?.value ?? '';

  const weekdayEn = get('weekday');
  const idxHari = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    .indexOf(weekdayEn);

  const nomorBulan = Number(get('month')); // "09" -> 9
  const namaBulan = BULAN[nomorBulan - 1] ?? get('month');

  return {
    weekday: idxHari >= 0 ? HARI[idxHari] : weekdayEn,
    tanggal: `${get('day')} ${namaBulan} ${get('year')}`,
  };
}

// --- Penyusun rekap ------------------------------------------------------

const PRIORITY_EMOJI = { low: '🟢', medium: '🟡', high: '🟠', urgent: '🔴' };

/**
 * Kelompokkan tugas ke dalam bucket, dikelompokkan lagi per orang.
 * Orang yang sama bisa muncul di beberapa kategori — itu disengaja,
 * supaya yang terlambat terlihat jelas terpisah dari yang berjalan.
 */
function buildRecap({ tasks, users, projects }) {
  const today = todayInWIB();

  const userById = new Map(users.map((u) => [u.id, u]));
  const projectById = new Map(projects.map((p) => [p.id, p]));

  const open = tasks.filter((t) => t.status && t.status !== 'done');

  const buckets = {
    overdue: [],
    dueToday: [],
    unstarted: [],
    unassigned: [],
    inProgress: [],
  };

  for (const t of open) {
    const overdueBy = daysOverdue(t.dueDate, today);
    const assigneeIds = Array.isArray(t.assigneeIds) ? t.assigneeIds : [];

    const item = {
      id: t.id,
      title: t.title,
      priority: t.priority,
      dueDate: t.dueDate,
      overdueBy,
      projectName: projectById.get(t.projectId)?.name ?? null,
      assignees: assigneeIds
        .map((id) => userById.get(id)?.name)
        .filter(Boolean),
    };

    // Setiap tugas hanya boleh masuk satu kategori "urgensi", supaya tidak
    // tampil dua kali di pesan yang sama. Urutan dari yang paling mendesak:
    // belum ada assignee -> lewat tenggat -> jatuh tempo hari ini.
    //
    // Tanpa aturan ini, tugas tanpa assignee ikut terhitung "terlambat" dan
    // muncul dua kali: sekali di bawah nama orang (atau "Belum ada
    // assignee"), sekali lagi di kategori TELAMBAT.
    const hasAssignee = item.assignees.length > 0;

    if (!hasAssignee) {
      buckets.unassigned.push(item);
    } else if (overdueBy !== null && overdueBy > 0) {
      buckets.overdue.push(item);
    } else if (overdueBy === 0) {
      buckets.dueToday.push(item);
    }

    // Kategori status berdiri sendiri: satu tugas boleh muncul di sini dan
    // sekaligus di kategori urgensi, karena itu informasi yang berbeda.
    if (t.status === 'todo' || t.status === 'backlog') buckets.unstarted.push(item);
    if (t.status === 'in_progress') buckets.inProgress.push(item);
  }

  // Yang paling terlambat dulu, lalu berdasarkan prioritas.
  const PRIORITY_ORDER = { urgent: 0, high: 1, medium: 2, low: 3 };
  for (const list of Object.values(buckets)) {
    list.sort((a, b) => {
      const byDays = (b.overdueBy ?? -9999) - (a.overdueBy ?? -9999);
      if (byDays !== 0) return byDays;
      const pa = PRIORITY_ORDER[a.priority] ?? 9;
      const pb = PRIORITY_ORDER[b.priority] ?? 9;
      if (pa !== pb) return pa - pb;
      return String(a.title).localeCompare(String(b.title));
    });
  }

  return { today, buckets, openCount: open.length, totalCount: tasks.length };
}

/**
 * Render daftar tugas dalam satu bucket, dikelompokkan per orang.
 * Dibatasi MAX_TASKS_PER_PERSON supaya pesan tidak meledak kalau ada banyak
 * tugas menumpuk di satu orang.
 */
function renderBucket(items, { showProject = false, label = 'telat' } = {}) {
  const lines = [];
  const perPerson = new Map();
  const withoutAssignee = [];

  for (const item of items) {
    if (item.assignees.length === 0) {
      withoutAssignee.push(item);
      continue;
    }
    // Satu tugas bisa di-assign ke beberapa orang; cukup tampilkan sekali,
    // di grup orang pertama, supaya tidak dobel.
    const key = item.assignees[0];
    if (!perPerson.has(key)) perPerson.set(key, []);
    perPerson.get(key).push(item);
  }

  const people = [...perPerson.entries()].sort((a, b) => {
    const aMax = Math.max(...a[1].map((t) => t.overdueBy ?? -9999));
    const bMax = Math.max(...b[1].map((t) => t.overdueBy ?? -9999));
    if (aMax !== bMax) return bMax - aMax;
    return a[0].localeCompare(b[0]);
  });

  for (const [person, list] of people) {
    const shown = list.slice(0, MAX_TASKS_PER_PERSON);
    const hidden = list.length - shown.length;

    lines.push(`<b>${esc(person)}</b> <i>(${list.length})</i>`);
    for (const t of shown) {
      const prio = PRIORITY_EMOJI[t.priority] || '⚪';
      const parts = [`  ${prio} ${esc(t.title)}`];
      if (t.overdueBy !== null && t.overdueBy > 0) {
        parts.push(`<i>${label} ${t.overdueBy} hari</i>`);
      } else if (t.overdueBy === 0) {
        parts.push('<i>jatuh tempo hari ini</i>');
      } else if (t.dueDate) {
        parts.push(`<i>due ${esc(t.dueDate)}</i>`);
      }
      if (showProject && t.projectName) parts.push(`<i>· ${esc(t.projectName)}</i>`);
      lines.push(parts.join(' '));
    }
    if (hidden > 0) {
      lines.push(`  <i>…dan ${hidden} lainnya</i>`);
    }
    lines.push('');
  }

  if (withoutAssignee.length > 0) {
    lines.push(`<b>Belum ada assignee</b> <i>(${withoutAssignee.length})</i>`);
    for (const t of withoutAssignee.slice(0, MAX_TASKS_PER_PERSON)) {
      lines.push(`  ⚪ ${esc(t.title)}`);
    }
    if (withoutAssignee.length > MAX_TASKS_PER_PERSON) {
      lines.push(`  <i>…dan ${withoutAssignee.length - MAX_TASKS_PER_PERSON} lainnya</i>`);
    }
    lines.push('');
  }

  return lines;
}

function renderMessage(recap) {
  const { today, buckets, openCount, totalCount } = recap;
  const { weekday, tanggal } = tanggalPendek();

  const lines = [
    `📋 <b>Rekap ProMan</b>`,
    `<i>${esc(weekday)}, ${esc(tanggal)}</i>`,
    '',
  ];

  if (openCount === 0) {
    lines.push('🎉 Tidak ada tugas yang belum selesai. Semua beres!');
    return lines.join('\n');
  }

  if (buckets.overdue.length > 0) {
    lines.push(`🔴 <b>TERLAMBAT</b> <i>(${buckets.overdue.length})</i>`);
    lines.push(...renderBucket(buckets.overdue));
  }

  if (buckets.dueToday.length > 0) {
    lines.push(`⏰ <b>JATUH TEMPO HARI INI</b> <i>(${buckets.dueToday.length})</i>`);
    lines.push(...renderBucket(buckets.dueToday));
  }

  if (buckets.unassigned.length > 0) {
    lines.push(`⚠️ <b>BELUM ADA ASSIGNEE</b> <i>(${buckets.unassigned.length})</i>`);
    lines.push(...renderBucket(buckets.unassigned));
  }

  if (buckets.unstarted.length > 0) {
    lines.push(`📝 <b>BELUM DIMULAI</b> <i>(${buckets.unstarted.length})</i>`);
    // "telat 27 hari" sounds wrong for work nobody has started yet — the
    // deadline passed, but nobody slipped up. Say "seharusnya sudah" instead.
    lines.push(...renderBucket(buckets.unstarted, { label: 'seharusnya sudah' }));
  }

  if (buckets.inProgress.length > 0) {
    lines.push(`🔥 <b>SEDANG BERJALAN</b> <i>(${buckets.inProgress.length})</i>`);
    lines.push(...renderBucket(buckets.inProgress, { showProject: true }));
  }

  lines.push('─'.repeat(24));
  lines.push(
    `<i>${openCount} tugas belum selesai dari ${totalCount} total` +
      ` · ${buckets.overdue.length} terlambat</i>`,
  );

  return lines.join('\n');
}

/**
 * Telegram membatasi 4096 karakter per pesan. Kalau rekap melebihi itu,
 * potong di batas baris dan kirim sisanya sebagai pesan terpisah, dengan
 * penanda "(lanjutan)" supaya pembaca tahu ini bukan pesan duplikat.
 */
function splitMessage(text, limit = TELEGRAM_LIMIT) {
  if (text.length <= limit) return [text];

  const CONTINUED = '…\n<i>(lanjutan)</i>\n\n';
  const chunks = [];
  let rest = text;
  let isFirst = true;

  while (rest.length > limit) {
    // Ruang untuk penanda "(lanjutan)" harus dipotong dari anggaran, kalau
    // tidak bagian lanjutan bisa melewati limit dan ditolak Telegram.
    const budget = limit - CONTINUED.length - 8;
    let cut = rest.lastIndexOf('\n', budget);

    // Jangan pernah potong di tengah tag HTML. Kalau tidak ada baris baru
    // yang aman dalam anggaran, mundur ke posisi sebelum tag terakhir yang
    // belum ditutup.
    if (cut <= 0) {
      cut = budget;
      const lastOpen = rest.lastIndexOf('<', cut);
      const lastClose = rest.lastIndexOf('>', cut);
      if (lastOpen > lastClose) cut = lastOpen;
    }
    if (cut <= 0) cut = budget;

    const head = isFirst ? '' : CONTINUED;
    chunks.push(head + rest.slice(0, cut));
    isFirst = false;
    rest = rest.slice(cut).replace(/^\n+/, '');
  }

  if (rest) {
    chunks.push((isFirst ? '' : CONTINUED) + rest);
  }

  return chunks;
}

async function sendToTelegram(text) {
  const chunks = splitMessage(text);
  console.log(`[recap] ${chunks.length} pesan, panjang: ${chunks.map((c) => c.length).join(', ')}`);

  if (DRY_RUN) {
    console.log('\n================ DRY RUN ================\n');
    chunks.forEach((c, i) => console.log(`--- bagian ${i + 1}/${chunks.length} ---\n${c}\n`));
    return;
  }

  for (const [i, chunk] of chunks.entries()) {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: chunk,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      fail(`Kirim ke Telegram gagal di bagian ${i + 1} (HTTP ${res.status}): ${body.slice(0, 300)}`);
    }
    console.log(`[recap] bagian ${i + 1}/${chunks.length} terkirim`);
  }
}

// --- Main ----------------------------------------------------------------

async function main() {
  if (!DRY_RUN && (!BOT_TOKEN || !CHAT_ID)) {
    fail('VITE_TELEGRAM_BOT_TOKEN atau VITE_TELEGRAM_CHAT_ID kosong');
  }

  console.log(`[recap] project=${PROJECT_ID} hari(WIB)=${todayInWIB()} dry-run=${DRY_RUN}`);

  const accessToken = await getAccessToken();
  console.log('[recap] access token diperoleh');

  const [tasks, users, projects] = await Promise.all([
    readCollection(accessToken, 'tasks'),
    readCollection(accessToken, 'users'),
    readCollection(accessToken, 'projects'),
  ]);
  console.log(`[recap] terbaca: ${tasks.length} task, ${users.length} user, ${projects.length} project`);

  const recap = buildRecap({ tasks, users, projects });
  const message = renderMessage(recap);

  await sendToTelegram(message);
  console.log('[recap] selesai');
}

await main();
