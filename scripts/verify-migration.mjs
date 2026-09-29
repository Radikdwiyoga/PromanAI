/**
 * Verifikasi hasil migrasi: cek akun Auth via Admin SDK (bukan REST, jadi tidak
 * terkena rate limit percobaan login).
 *
 *   node scripts/verify-migration.mjs
 */
import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const keyPath = [
  process.env.GOOGLE_APPLICATION_CREDENTIALS,
  join(ROOT, 'service-account.json'),
].filter(Boolean).find((p) => existsSync(p));

if (!keyPath) { console.error('service-account.json tidak ditemukan'); process.exit(1); }

const app = initializeApp({ credential: cert(JSON.parse(readFileSync(keyPath, 'utf8'))) });
const auth = getAuth(app);
const db = getFirestore(app);

const usersSnap = await db.collection('users').get();
const rows = [];
let stillHasPassword = 0;

for (const doc of usersSnap.docs) {
  const d = doc.data();
  const hasPw = Object.prototype.hasOwnProperty.call(d, 'password');
  if (hasPw) stillHasPassword++;

  let authUser = null;
  try { authUser = await auth.getUserByEmail(d.email); }
  catch (e) { if (e.code !== 'auth/user-not-found') throw e; }

  rows.push({
    email: d.email,
    docId: doc.id,
    authUid: authUser?.uid ?? null,
    uidMatch: authUser ? (authUser.uid === doc.id ? 'YA' : 'TIDAK') : '-',
    passwordField: hasPw ? 'MASIH ADA' : 'sudah dihapus',
    disabled: authUser?.disabled === true ? 'YA' : 'tidak',
  });
}

rows.sort((a, b) => a.email.localeCompare(b.email));

console.log('email'.padEnd(32) + 'uid match'.padEnd(12) + 'password field'.padEnd(18) + 'status');
console.log('-'.repeat(78));
for (const r of rows) {
  console.log(
    r.email.padEnd(32) +
    (r.authUid ? r.uidMatch.padEnd(12) : 'TIDAK ADA  ') +
    r.passwordField.padEnd(18) +
    (r.authUid ? 'akun Auth aktif' : 'belum punya akun')
  );
}

const withAuth = rows.filter((r) => r.authUid).length;
const without = rows.filter((r) => !r.authUid).length;
const mismatch = rows.filter((r) => r.authUid && r.uidMatch === 'TIDAK').length;

console.log('-'.repeat(78));
console.log(`Total dokumen        : ${rows.length}`);
console.log(`Punya akun Auth      : ${withAuth}`);
console.log(`Belum punya akun Auth: ${without}`);
console.log(`UID tidak sinkron    : ${mismatch}`);
console.log(`Field password sisa  : ${stillHasPassword}`);
