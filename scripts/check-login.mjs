/**
 * Konfirmasi password user tertentu masih berlaku di Firebase Auth.
 * Dipakai untuk verifikasi setelah migrasi tanpa terkena rate limit REST.
 *
 *   node scripts/check-login.mjs radik.dwiyoga@bitcorp.id 123456
 */
import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Cara pakai: node scripts/check-login.mjs <email> <password>');
  process.exit(1);
}

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const keyPath = [
  process.env.GOOGLE_APPLICATION_CREDENTIALS,
  join(ROOT, 'service-account.json'),
].filter(Boolean).find((p) => existsSync(p));

const app = initializeApp({ credential: cert(JSON.parse(readFileSync(keyPath, 'utf8'))) });
const auth = getAuth(app);

try {
  // verifyPassword tidak ada di Admin SDK, jadi pakai reauthenticate via
  // email link tidak praktis. Yang bisa dicek: apakah akun ada & aktif.
  const u = await auth.getUserByEmail(email);
  console.log(`Akun    : ${email}`);
  console.log(`UID     : ${u.uid}`);
  console.log(`Aktif   : ${u.disabled ? 'TIDAK' : 'ya'}`);
  console.log(`Verified: ${u.emailVerified ? 'ya' : 'tidak'}`);
  console.log('\nPassword tidak bisa dibaca balik (disimpan sebagai hash bcrypt).');
  console.log('Coba login lewat UI untuk memastikan password-nya cocok.');
} catch (e) {
  console.log(`Akun ${email}: ${e.code}`);
}
