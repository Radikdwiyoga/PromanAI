/**
 * Membaca activity_logs untuk melihat aksi terakhir yang tercatat di aplikasi.
 * Hanya membaca.
 *
 *   node scripts/inspect-activity.mjs
 */
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const keyPath = [
  process.env.GOOGLE_APPLICATION_CREDENTIALS,
  join(ROOT, 'service-account.json'),
].filter(Boolean).find((p) => existsSync(p));

if (!keyPath) {
  console.error('service-account.json tidak ditemukan.');
  process.exit(1);
}

const app = initializeApp({ credential: cert(JSON.parse(readFileSync(keyPath, 'utf8'))) });
const db = getFirestore(app);

const logs = await db.collection('activity_logs').get();
const rows = logs.docs.map((d) => ({
  id: d.id,
  ...d.data(),
  _create: d.createTime?.toDate()?.toISOString() ?? '?',
  _update: d.updateTime?.toDate()?.toISOString() ?? '?',
}));

rows.sort((a, b) => String(b._update).localeCompare(String(a._update)));

for (const r of rows) {
  console.log(`${r._update}  ${String(r.type ?? r.action ?? '?').padEnd(22)} ${String(r.description ?? r.message ?? r.text ?? '').slice(0, 90)}`);
}

console.log('\n--- projects ---');
const projects = await db.collection('projects').get();
for (const d of projects.docs) {
  console.log(`${d.id.padEnd(26)} ${d.createTime.toDate().toISOString()}  ${d.data().name ?? ''}`);
}

console.log('\n--- settings/system ---');
const s = await db.collection('settings').doc('system').get();
if (s.exists) {
  console.log('createTime:', s.createTime.toDate().toISOString());
  console.log('updateTime:', s.updateTime.toDate().toISOString());
} else {
  console.log('(tidak ada)');
}
