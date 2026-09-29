/**
 * Daftar semua dokumen di collection users, untuk memastikan tidak ada data
 * yang hilang. Hanya membaca.
 *
 *   node scripts/list-users.mjs
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

const snap = await db.collection('users').get();

console.log(`snap.size = ${snap.size}, docs.length = ${snap.docs.length}\n`);

const rows = snap.docs.map((d) => ({
  id: d.id,
  email: d.data().email ?? '<tidak ada email>',
  name: d.data().name ?? '',
  status: d.data().status ?? '<none>',
  persona: d.data().personaType ?? '<none>',
  hasPw: Object.prototype.hasOwnProperty.call(d.data(), 'password'),
}));

rows.sort((a, b) => String(a.email).localeCompare(String(b.email)));

for (const r of rows) {
  console.log(
    r.id.padEnd(30) +
    String(r.email).padEnd(32) +
    String(r.persona).padEnd(14) +
    String(r.status).padEnd(10) +
    (r.hasPw ? 'ADA PASSWORD' : '')
  );
}

console.log(`\nTotal: ${rows.length} dokumen.`);

for (const col of ['projects', 'tasks', 'comments', 'activity_logs']) {
  const s = await db.collection(col).get();
  console.log(`${col.padEnd(16)}: ${s.size}`);
}
