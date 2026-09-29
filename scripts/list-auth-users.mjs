/**
 * Daftar seluruh akun Firebase Auth. Membantu membedakan "dokumen Firestore
 * dihapus" vs "user memang tidak pernah ada".
 *
 *   node scripts/list-auth-users.mjs
 */
import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
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
const auth = getAuth(app);

const all = [];
let page = await auth.listUsers(1000, undefined);

while (page) {
  all.push(...(page.users ?? []));
  if (all.length % 500 === 0) console.log(`  ...${all.length}`);
  page = page.pageToken ? await auth.listUsers(1000, page.pageToken) : null;
}

all.sort((a, b) => String(a.email).localeCompare(String(b.email)));

for (const u of all) {
  const t = u.metadata?.creationTime ?? '?';
  console.log(
    String(u.uid).padEnd(30) +
    String(u.email).padEnd(32) +
    String(t).padEnd(26) +
    (u.disabled ? 'DISABLED' : 'aktif')
  );
}

console.log(`\nTotal akun Auth: ${all.length}`);
