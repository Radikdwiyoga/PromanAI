/**
 * Menonaktifkan akun Firebase Auth yang dokumen /users-nya sudah dihapus.
 *
 * Kenapa ini perlu: menghapus dokumen di Firestore tidak menghapus akun Auth.
 * Akunnya tetap hidup dan bisa lolos authenticate. Dulu `loginWithFirebase`
 * juga membuat ulang profil otomatis untuk UID yang dokumennya hilang, jadi
 * user yang supposedly "dihapus" bisa langsung masuk lagi. Sekarang login
 * sudah ditolak, tapi menonaktifkan akunnya tetap perlu supaya tidak ada
 * akun yatim yang bisa diaktifkan ulang.
 *
 * Aman diulang. Default dry-run; tambahkan --apply untuk benar-benar menulis.
 *
 *   node scripts/disable-orphan-auth.mjs
 *   node scripts/disable-orphan-auth.mjs --apply
 */
import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const APPLY = process.argv.includes('--apply');

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
const auth = getAuth(app);
const db = getFirestore(app);

// Dokumen user yang ada (= UID yang sah).
const valid = new Set();
const users = await db.collection('users').get();
for (const d of users.docs) valid.add(d.id);

const orphans = [];
let page = await auth.listUsers(1000);
while (page) {
  for (const u of page.users ?? []) {
    if (!valid.has(u.uid)) orphans.push(u);
  }
  page = page.pageToken ? await auth.listUsers(1000, page.pageToken) : null;
}

console.log(`Credential : ${keyPath}`);
console.log(`Mode       : ${APPLY ? 'APPLY (menonaktifkan akun)' : 'DRY-RUN (tidak mengubah apa pun)'}`);
console.log(`User sah   : ${valid.size}`);
console.log(`\nAkun tanpa dokumen /users (${orphans.length}):\n`);

if (orphans.length === 0) {
  console.log('  (tidak ada — semua akun punya dokumen)');
  process.exit(0);
}

for (const u of orphans) {
  const state = u.disabled ? 'sudah nonaktif' : 'AKTIF';
  console.log(`  ${String(u.email).padEnd(32)} uid=${u.uid}  ${state}`);
  if (APPLY && !u.disabled) {
    await auth.updateUser(u.uid, { disabled: true });
    console.log('      -> dinonaktifkan');
  }
}

console.log(
  APPLY
    ? `\nSelesai: ${orphans.filter((u) => !u.disabled).length} akun dinonaktifkan.`
    : '\nIni masih DRY-RUN. Jalankan ulang dengan --apply untuk menonaktifkan akun-akun ini.'
);
