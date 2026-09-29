/**
 * Membersihkan referensi yang menunjuk user yang sudah tidak ada lagi.
 *
 * Setelah user dihapus, task/comment/activity log lama masih menyimpan UID-nya.
 * UI biasanya menampilkan ini sebagai nama kosong. Script ini membuang UID dari
 * assigneeIds, dan menandai comment/log yang orphaned supaya tidak menampilkan
 * penulis kosong. Isi komentar dan log tidak dihapus, hanya dirapikan.
 *
 * Aman diulang.
 *
 *   node scripts/clean-dangling-refs.mjs
 *   node scripts/clean-dangling-refs.mjs --apply
 */
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
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
const db = getFirestore(app);

const valid = new Set();
const users = await db.collection('users').get();
for (const d of users.docs) valid.add(d.id);

console.log(`Mode   : ${APPLY ? 'APPLY' : 'DRY-RUN'}`);
console.log(`User   : ${valid.size}\n`);

let changes = 0;

// Task: buang UID yang tidak dikenal dari assigneeIds.
const tasks = await db.collection('tasks').get();
for (const d of tasks.docs) {
  const t = d.data();
  const ids = Array.isArray(t.assigneeIds) ? t.assigneeIds : [];
  const kept = ids.filter((uid) => valid.has(uid));
  if (kept.length === ids.length) continue;

  changes++;
  console.log(`  task ${d.id} "${t.title ?? ''}"`);
  console.log(`      assigneeIds: [${ids.join(', ')}]`);
  console.log(`      ->          [${kept.join(', ')}]`);
  if (APPLY) await d.ref.update({ assigneeIds: kept });
}

// Comment & activity log: tandai penulisnya sebagai "(akun dihapus)" supaya UI
// tidak menampilkan kotak kosong. Isi komentar sendiri tidak diubah.
for (const col of ['comments', 'activity_logs']) {
  const snap = await db.collection(col).get();
  for (const d of snap.docs) {
    const data = d.data();
    if (!data.userId || valid.has(data.userId)) continue;

    changes++;
    console.log(`  ${col} ${d.id} -> userId ${data.userId} tidak ada`);
    if (APPLY) {
      await d.ref.update({
        userId: FieldValue.delete(),
        orphanedAuthor: true,
      });
    }
  }
}

console.log(
  APPLY
    ? `\nSelesai: ${changes} dokumen dirapikan.`
    : `\n${changes} dokumen perlu dirapikan. Jalankan ulang dengan --apply.`
);
