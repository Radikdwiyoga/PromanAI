/**
 * Mencari referensi yang menggantung: user yang dihapus dari /users tapi masih
 * dirujuk oleh task (assigneeIds) atau comment (userId). Hanya membaca.
 *
 *   node scripts/check-dangling-refs.mjs
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

const userIds = new Set();
const emailById = new Map();
const users = await db.collection('users').get();
for (const d of users.docs) {
  userIds.add(d.id);
  emailById.set(d.id, d.data().email ?? d.id);
}

const problems = [];

const tasks = await db.collection('tasks').get();
for (const d of tasks.docs) {
  const t = d.data();
  const ids = Array.isArray(t.assigneeIds) ? t.assigneeIds : [];
  for (const uid of ids) {
    if (!userIds.has(uid)) {
      problems.push(`task ${d.id} "${t.title ?? ''}" -> assignee ${uid} tidak ada`);
    }
  }
  if (t.userId && !userIds.has(t.userId)) {
    problems.push(`task ${d.id} "${t.title ?? ''}" -> creator ${t.userId} tidak ada`);
  }
}

const comments = await db.collection('comments').get();
for (const d of comments.docs) {
  const c = d.data();
  if (c.userId && !userIds.has(c.userId)) {
    problems.push(`comment ${d.id} -> author ${c.userId} tidak ada`);
  }
}

const logs = await db.collection('activity_logs').get();
for (const d of logs.docs) {
  const l = d.data();
  if (l.userId && !userIds.has(l.userId)) {
    problems.push(`activity_log ${d.id} -> actor ${l.userId} tidak ada`);
  }
}

console.log(`User valid : ${userIds.size}`);
console.log(`Task       : ${tasks.size}`);
console.log(`Comment    : ${comments.size}`);
console.log(`Log        : ${logs.size}`);
console.log(`\nReferensi menggantung: ${problems.length}`);
problems.forEach((p) => console.log('  ' + p));
