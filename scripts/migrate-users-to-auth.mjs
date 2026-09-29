/**
 * Migrasi user ProMan: Firestore (plaintext password) -> Firebase Auth
 *
 * LATAR BELAKANG
 * --------------
 * User yang dibuat lewat panel Admin (ProjectContext.createUser) hanya menulis
 * dokumen ke Firestore. Tidak pernah memanggil createUserWithEmailAndPassword,
 * jadi akunnya TIDAK ADA di Firebase Auth. Akibatnya mereka tidak bisa login
 * sama sekali, walaupun field `password` di dokumen terlihat benar.
 *
 * Script ini membuat akun Auth untuk user-user tersebut, memakai UID = document
 * ID yang sekarang, lalu menghapus field `password` dari Firestore.
 *
 * Kenapa UID dibiarkan sama dengan document ID:
 *   - Task, comment, dan activity_log mereferensikan user lewat field userId /
 *     assigneeIds. Kalau UID berubah, semua referensi itu putus.
 *
 * PASSWORD LAMA TIDAK BISA DIBACA ULANG
 *   - Firebase Auth menyimpan password sebagai bcrypt hash, jadi tidak bisa
 *     "dibaca balik". Script ini hanya bisa memakai password plaintext yang
 *     masih tersimpan di Firestore, dan hanya sekali ini.
 *   - Kalau field password sudah dihapus, user WAJIB reset password.
 *
 * CARA PAKAI
 *   1. Download service account JSON dari Firebase Console
 *      (Project Settings > Service accounts > Generate new private key)
 *    Simpan sebagai: service-account.json  (di root project, sudah di-gitignore)
 *
 *   2. Lihat dulu apa yang akan terjadi (tidak mengubah apa pun):
 *      node scripts/migrate-users-to-auth.mjs
 *
 *   3. Kalau sudah sesuai, jalankanMigrasi sungguhan:
 *      node scripts/migrate-users-to-auth.mjs --apply
 *
 *   4. Kalau ada user yang tidak punya password plaintext, daftarkan manual:
 *      node scripts/migrate-users-to-auth.mjs --list-missing
 */

import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const APPLY = process.argv.includes('--apply');
const LIST_MISSING = process.argv.includes('--list-missing');

// ---------------------------------------------------------------- credential

function loadServiceAccount() {
  const candidates = [
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    join(ROOT, 'service-account.json'),
    join(ROOT, 'serviceAccountKey.json'),
    join(ROOT, 'scripts', '.keys', 'service-account.json'),
  ].filter(Boolean);

  for (const path of candidates) {
    if (existsSync(path)) {
      const key = JSON.parse(readFileSync(path, 'utf8'));
      if (!key.private_key || !key.client_email) {
        throw new Error(`File ${path} bukan service account JSON yang valid.`);
      }
      return { key, path };
    }
  }

  console.error('\nERROR: Service account JSON tidak ditemukan.\n');
  console.error('Coba lokasi ini (urutan):');
  candidates.forEach((c) => console.error(`  - ${c}`));
  console.error('\nCara mendapatkannya:');
  console.error('  Firebase Console > Project Settings > Service accounts');
  console.error('  > Firebase Admin SDK > Generate new private key\n');
  process.exit(1);
}

const { key, path: keyPath } = loadServiceAccount();

const app = initializeApp({ credential: cert(key) });
const auth = getAuth(app);
const db = getFirestore(app);

console.log(`Credential : ${keyPath}`);
console.log(`Project    : ${key.project_id}`);
console.log(`Mode       : ${APPLY ? 'APPLY (menulis ke Firebase)' : 'DRY-RUN (tidak mengubah apa pun)'}`);
console.log('-'.repeat(72));

// ------------------------------------------------------------------ planning

const usersSnap = await db.collection('users').get();

const plan = {
  migrate: [],   // ada password plaintext, aman dimigrasikan
  existing: [],  // sudah punya akun Auth, cukup Pastikan UID sinkron
  noPassword: [],// tidak ada password plaintext -> harus reset manual
  duplicate: [], // email yang punya >1 dokumen, tidak bisa dimigrasikan apa adanya
};

// Hitung dokumen per email lebih dulu. Email dengan lebih dari satu dokumen tidak
// bisa dimigrasikan apa adanya: createUser akan ditolak karena email terpakai.
const docsByEmail = new Map();
for (const doc of usersSnap.docs) {
  const email = doc.data().email;
  if (!email) continue;
  const list = docsByEmail.get(email) ?? [];
  list.push(doc.id);
  docsByEmail.set(email, list);
}

for (const doc of usersSnap.docs) {
  const data = doc.data();
  const entry = {
    docId: doc.id,
    email: data.email,
    name: data.name,
    personaType: data.personaType,
    hasPasswordField: Object.prototype.hasOwnProperty.call(data, 'password'),
    passwordLength: typeof data.password === 'string' ? data.password.length : 0,
  };

  let authUser = null;
  try {
    authUser = await auth.getUserByEmail(entry.email);
  } catch (e) {
    if (e.code !== 'auth/user-not-found') throw e;
  }

  entry.authUid = authUser?.uid ?? null;

  if (authUser) {
    plan.existing.push(entry);
  } else if ((docsByEmail.get(entry.email) ?? []).length > 1) {
    entry.dupeDocs = docsByEmail.get(entry.email);
    plan.duplicate.push(entry);
  } else if (entry.hasPasswordField && entry.passwordLength > 0) {
    plan.migrate.push(entry);
  } else {
    plan.noPassword.push(entry);
  }
}

const line = (u) =>
  `  ${u.email.padEnd(32)} uid=${String(u.authUid ?? '(belum ada)').padEnd(28)} pw=${u.hasPasswordField ? u.passwordLength + ' kar' : 'TIDAK ADA'}`;

console.log(`\n[1] SUDAH PUNYA AKUN AUTH (${plan.existing.length}) — tidak perlu disentuh:`);
plan.existing.forEach((u) => console.log(line(u)));

console.log(`\n[2] PERLU DIMIGRASI — akun Auth belum ada, password plaintext tersedia (${plan.migrate.length}):`);
plan.migrate.forEach((u) => console.log(line(u)));

console.log(`\n[3] TIDAK BISA DIMIGRASI — tidak ada password plaintext (${plan.noPassword.length}):`);
plan.noPassword.forEach((u) => console.log(`  ${u.email}  -> harus reset password via email`));

console.log(`\n[4] EMAIL DUPLIKAT — ada >1 dokumen untuk email yang sama (${plan.duplicate.length}):`);
if (plan.duplicate.length === 0) {
  console.log('  (tidak ada)');
} else {
  plan.duplicate.forEach((u) => {
    console.log(`  ${u.email}`);
    u.dupeDocs.forEach((d) => console.log(`      doc: ${d}`));
    console.log('      -> tidak disentuh. Perlu keputusan manual: dokumen mana yang dipertahankan?');
  });
}

console.log(
  `\nRingkasan: ${plan.migrate.length} dimigrasikan, ${plan.existing.length} dilewati, ` +
  `${plan.duplicate.length} duplikat, ${plan.noPassword.length} butuh reset manual.`
);
console.log('-'.repeat(72));

if (LIST_MISSING) {
  if (plan.noPassword.length === 0) {
    console.log('\nTidak ada user yang butuh reset manual.');
  } else {
    console.log('\nDaftar email yang perlu reset password manual:');
    plan.noPassword.forEach((u) => console.log(`  - ${u.email}`));
  }
  process.exit(0);
}

if (!APPLY) {
  console.log('\nIni masih DRY-RUN. Tidak ada yang diubah.');
  console.log('Jalankan ulang dengan --apply untuk eksekusi migrasi.\n');
  process.exit(0);
}

// ------------------------------------------------------------------- execute

console.log('\nEksekusi migrasi...\n');
const result = { ok: [], failed: [], skipped: [] };

for (const u of plan.migrate) {
  try {
    const plaintext = usersSnap.docs.find((d) => d.id === u.docId).data().password;

    // Validasi panjang minimal yang diizinkan Firebase Auth.
    if (typeof plaintext !== 'string' || plaintext.length < 6) {
      throw new Error(`Password tidak valid (panjang ${String(plaintext).length}, min 6)`);
    }

    // UID dipaksa = document ID supaya referensi task/comment tidak putus.
    await auth.createUser({
      uid: u.docId,
      email: u.email,
      password: plaintext,
      displayName: u.name,
      emailVerified: true,
      disabled: false,
    });

    // Hapus field password dari Firestore. Field lain tidak disentuh.
    await db.collection('users').doc(u.docId).update({ password: FieldValue.delete() });

    result.ok.push(u.email);
    console.log(`  OK    ${u.email}  (uid=${u.docId}, password dihapus dari Firestore)`);
  } catch (e) {
    result.failed.push({ email: u.email, reason: e.message });
    console.log(`  FAIL  ${u.email}  -> ${e.message}`);
  }
}

console.log(`\nSelesai: ${result.ok.length} berhasil, ${result.failed.length} gagal.`);
if (result.failed.length > 0) {
  console.log('\nGagal:');
  result.failed.forEach((f) => console.log(`  - ${f.email}: ${f.reason}`));
}
if (plan.noPassword.length > 0) {
  console.log('\nMasih perlu reset manual via email:');
  plan.noPassword.forEach((u) => console.log(`  - ${u.email}`));
}
console.log('\nCATATAN: password lama tidak bisa dipulihkan. User yangpassword-nya');
console.log('salah / lupa harus pakai flow "Lupa Password" di halaman login.\n');
