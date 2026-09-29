/**
 * Menghapus field `password` plaintext yang masih tertinggal di dokumen users.
 *
 * Kolom ini tidak lagi dipakai aplikasi (login memakai Firebase Auth), tapi
 * selama masih ada, field-nya bisa dibaca siapa pun yang punya akses baca ke
 * collection `users` — dan rules saat itu mengizinkan semua user yang login.
 *
 * Script ini aman diulang: dokumen tanpa field `password` dilewati.
 *
 *   node scripts/strip-plaintext-passwords.mjs
 */
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
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
  console.error('Letakkan di root project atau set GOOGLE_APPLICATION_CREDENTIALS.');
  process.exit(1);
}

const app = initializeApp({ credential: cert(JSON.parse(readFileSync(keyPath, 'utf8'))) });
const db = getFirestore(app);

const snap = await db.collection('users').get();

let stripped = 0;
for (const doc of snap.docs) {
  if (!Object.prototype.hasOwnProperty.call(doc.data(), 'password')) continue;
  await doc.ref.update({ password: FieldValue.delete() });
  console.log(`  ${doc.id.padEnd(28)} ${doc.data().email}  -> field password dihapus`);
  stripped++;
}

console.log(`\n${stripped} dokumen dibersihkan dari ${snap.size} total.`);
