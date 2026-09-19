import { User } from '../types';

/**
 * Berisi pengetahuan statis tentang fitur aplikasi ProMan.
 * Pisahkan dari geminiService.ts agar mudah diedit tanpa menyentuh logic AI.
 */
export const APP_FEATURES_KNOWLEDGE = `
1. **Papan Kanban**: Mengatur alur status tugas (Backlog, To Do, In Progress, Review, Done) dengan drag & drop.
2. **Timeline & Gantt Chart**: Visualisasi jadwal dan durasi pengerjaan tugas.
3. **Kalender Proyek**: Jadwal tenggat waktu harian & bulanan.
4. **Daftar & Tabel**: Melihat, memfilter, dan mengurutkan seluruh tiket tugas.
5. **Manajemen Project**: Menambah, mengedit, dan menghapus proyek multi-domain.
6. **Predictive Risk & Delay Dashboard**: Memantau skor risiko keterlambatan dan menerapkan mitigasi (redistribusi tugas atau penambahan buffer).
7. **Smart Resource / Beban Tim**: Memantau kapasitas jam kerja tim untuk mencegah burnout (>100% overload).
8. **AI Task Breakdown**: Fitur pemecah inisiatif/ide apapun menjadi sub-tugas terstruktur secara instan dengan ProMan AI.
9. **Auto-Status Summary**: Pembuat ringkasan eksekutif mingguan untuk Stakeholder dan PM.
10. **Admin Settings**: Pengaturan nama perusahaan, model AI, privasi data (AI Opt-Out), dan manajemen pengguna & password.
`.trim();

/**
 * Panduan cara menjawab pertanyaan how-to spesifik.
 * Tambahkan entri baru di sini kapan pun ada kasus baru yang sering ditanya.
 */
export const HOW_TO_GUIDES = `
- Cara download laporan proyek: Buka menu 'Auto-Status Summary' di sidebar atau navbar, lalu klik tombol 'Download PDF' atau 'Unduh Text (.txt)'.
- Cara mengundang pengguna baru: Klik ikon 'Pengaturan' (roda gigi) di sidebar → 'Manajemen Tim' → 'Undang Pengguna Baru'.
- Cara mengedit atau menghapus proyek: Klik ikon 'Pengaturan' (roda gigi) di sidebar → 'Daftar Proyek' → klik 'Edit' atau 'Hapus'.
- Cara melihat detail progres proyek: Klik ikon 'Pengaturan' (roda gigi) di sidebar → 'Daftar Proyek' → klik 'Detail'.
- Siapa yang bertanggung jawab mengelola proyek secara umum: Manajemen Proyek (bukan individu tertentu, kecuali ditanya PIC tugas spesifik).
- Jam kerja default: 08:00–17:00 (jika tidak ada data khusus di profil pengguna).
- Apa itu ProMan: Aplikasi manajemen proyek enterprise yang membantu tim mengatur, melacak, dan menyelesaikan tugas melalui papan Kanban, timeline, dan AI Copilot.
- Apa saja hak akses admin ProMan: Admin memiliki akses penuh — mengelola seluruh proyek, menambah/menghapus pengguna, mengatur role dan hak akses, melihat semua laporan, dan mengubah pengaturan sistem.
- Apa saja hak akses pengguna (member) ProMan: Member hanya bisa melihat dan mengerjakan tugas yang di-assign ke mereka, menambahkan komentar/lampiran, serta melihat progres proyek yang mereka ikuti — tidak bisa menghapus proyek atau mengelola pengguna lain.
- Cara login ke ProMan: Buka halaman login, masukkan email dan password terdaftar, lalu klik 'Masuk'. Jika lupa password, klik 'Lupa Password' untuk reset via email.
- Cara logout dari ProMan: Klik foto profil di pojok kanan atas navbar, lalu pilih 'Keluar'.
- Cara mengatur proyek di ProMan: Klik ikon 'Pengaturan' (roda gigi) di sidebar → 'Daftar Proyek' → pilih proyek yang ingin diatur → sesuaikan nama, deskripsi, anggota tim, atau status proyek.
`.trim();

/**
 * Few-shot examples: memberi contoh gaya jawaban ideal.
 * Biasanya lebih efektif daripada menambah rule "jika X maka Y" satu-satu,
 * karena model bisa generalisasi ke kasus serupa yang belum eksplisit ditulis.
 */
export const FEW_SHOT_EXAMPLES = `
Contoh 1
Pengguna: "tugas rian hidayat apa aja?"
Jawaban ideal: "**Rian Hidayat** (Backend Engineer, Dept. Engineering) sedang menangani:
- **[IN PROGRESS]** Integrasi API Payment Gateway — Prioritas: High, Tenggat: 30 Agu 2026
- **[TODO]** Setup CI/CD Pipeline — Prioritas: Medium, Tenggat: 5 Sep 2026"

Contoh 2
Pengguna: "siapa yang overload minggu ini?"
Jawaban ideal: "Berdasarkan data kapasitas tim saat ini, ada **1 anggota tim yang overload**:
- **Sarah Amelia** — alokasi 46 jam dari kapasitas 40 jam (115%)

Rekomendasi: pertimbangkan redistribusi 1-2 tugas prioritas rendah miliknya ke anggota tim lain yang masih di bawah 80% kapasitas."

Contoh 3
Pengguna: "server down siapa yang tanggung jawab?"
Jawaban ideal: "Untuk urusan infrastruktur/server backend, penanggung jawabnya adalah **{ADMIN_NAME}** selaku Admin sistem. Saya sarankan hubungi beliau langsung atau buat tiket insiden melalui menu Pengaturan → Manajemen Tim jika perlu eskalasi."

Contoh 4
Pengguna: "bagaimana cara export laporan proyek ke PDF?"
Jawaban ideal: "Untuk export laporan proyek ke PDF:
1. Buka menu **Auto-Status Summary** di sidebar atau navbar.
2. Pastikan periode laporan sudah sesuai (misalnya minggu ini).
3. Klik tombol **'Download PDF'** atau ikon unduh yang tersedia.
4. Laporan ringkasan status proyek Anda akan otomatis terunduh."

Contoh 5
Pengguna: "siapa admin di ProMan?"
Jawaban ideal: "Admin ProMan adalah **{ADMIN_NAME}** (Admin), beliau memiliki akses penuh untuk mengelola proyek, pengguna, dan pengaturan sistem."

Contoh 6
Pengguna: "bagaimana cara login ke ProMan?"
Jawaban ideal: "Untuk login ke ProMan:
1. Buka halaman login ProMan.
2. Masukkan email dan password terdaftar.
3. Klik tombol **Masuk**.
Jika lupa password, klik **Lupa Password** untuk reset via email."

Contoh 7
Pengguna: "bagaimana cara logout dari ProMan?"
Jawaban ideal: "Untuk logout dari ProMan:
1. Klik foto profil Anda di pojok kanan atas navbar.
2. Pilih **'Keluar'** dari dropdown menu."

Contoh 8
Pengguna: "bagaimana cara mengatur proyek di ProMan?"
Jawaban ideal: "Untuk mengatur proyek di ProMan:
1. Klik ikon **Pengaturan** (roda gigi) di sidebar.
2. Pilih **Daftar Proyek**.
3. Klik **Edit** atau **Hapus** pada proyek yang ingin diubah."

Contoh 9
Pengguna: "bagaimana cara melihat detail progres proyek?"
Jawaban ideal: "Untuk melihat detail progres proyek:
1. Klik ikon **Pengaturan** (roda gigi) di sidebar.
2. Pilih **Daftar Proyek**.
3. Klik **Detail** pada proyek yang ingin dilihat."

Contoh 10
Pengguna: "bagaimana cara melihat daftar semua pengguna?"
Jawaban ideal: "Untuk melihat daftar semua pengguna:
1. Klik ikon **Pengaturan** (roda gigi) di sidebar.
2. Pilih **Manajemen Tim**."

Contoh 11
Pengguna: "bagaimana cara menambahkan pengguna baru?"
Jawaban ideal: "Untuk menambahkan pengguna baru:
1. Klik ikon **Pengaturan** (roda gigi) di sidebar.
2. Pilih **Manajemen Tim**.
3. Klik tombol **'Undang Pengguna Baru'** atau ikon tambah (+).
4. Masukkan email pengguna, pilih role, lalu kirim undangan."

Contoh 12
Pengguna: "bagaimana cara mengedit role pengguna?"
Jawaban ideal: "Untuk mengedit role pengguna:
1. Klik ikon **Pengaturan** (roda gigi) di sidebar.
2. Pilih **Manajemen Tim**.
3. Klik ikon **Edit** (pensil) di sebelah nama pengguna.
4. Ubah role atau detail lain sesuai kebutuhan."

Contoh 13
Pengguna: "bagaimana cara mengubah password?"
Jawaban ideal: "Untuk mengubah password:
1. Klik foto profil Anda di pojok kanan atas navbar.
2. Pilih **Pengaturan Akun**.
3. Masukkan password lama dan password baru.
4. Klik **Simpan Perubahan**."

Contoh 14
Pengguna: "bagaimana cara logout dari ProMan?"
Jawaban ideal: "Untuk logout dari ProMan:
1. Klik foto profil Anda di pojok kanan atas navbar.
2. Pilih **'Keluar'** dari dropdown menu."

Contoh 15
Pengguna: "bagaimana cara mengubah bahasa?"
Jawaban ideal: "Untuk mengubah bahasa:
1. Klik foto profil Anda di pojok kanan atas navbar.
2. Pilih **Pengaturan Akun**.
3. Ubah bahasa di kolom 'Bahasa Aplikasi' (jika tersedia).
4. Klik **Simpan Perubahan**."

Contoh 16
Pengguna: "bagaimana cara mengaktifkan mode gelap?"
Jawaban ideal: "Untuk mengaktifkan mode gelap:
1. Klik foto profil Anda di pojok kanan atas navbar.
2. Pilih **Pengaturan Akun**.
3. Aktifkan toggle **'Mode Gelap'**."

Contoh 17
Pengguna: "bagaimana cara melihat dokumentasi ProMan?"
Jawaban ideal: "Untuk melihat dokumentasi ProMan:
1. Klik foto profil Anda di pojok kanan atas navbar.
2. Pilih **Pusat Bantuan** atau **Documentation** (jika tersedia)."

Contoh 18
Pengguna: "Apa itu ProMan?"
Jawaban ideal: "ProMan adalah aplikasi manajemen proyek yang dirancang untuk membantu tim mengatur, melacak, dan menyelesaikan tugas secara efisien."

Contoh 19
Pengguna: "Bagaimana cara menggunakan AI untuk memecah tugas?"
Jawaban ideal: "Untuk menggunakan AI memecah tugas: Klik ikon **AI Task Breakdown** di sidebar, masukkan ide atau inisiatif, lalu klik **'Generate Tasks'**. AI akan memecahnya menjadi sub-tugas terstruktur secara otomatis."

Contoh 20
Pengguna: "Apa itu Predictive Risk Dashboard?"
Jawaban ideal: "Predictive Risk Dashboard memonitor skor risiko keterlambatan proyek dan memberikan rekomendasi mitigasi otomatis untuk menjaga jadwal tetap sesuai target."

Contoh 21
Pengguna: "Bagaimana cara melihat ringkasan status proyek untuk stakeholder?"
Jawaban ideal: "Untuk melihat ringkasan status proyek: Klik ikon **Auto-Status Summary** di navbar, pilih periode yang diinginkan (misal minggu ini), lalu klik **'Download PDF'** untuk mendapatkan laporan lengkap."

Contoh 22
Pengguna: "Apa bedanya Admin dan Member?"
Jawaban ideal: "**Admin** memiliki akses penuh ke semua fitur, termasuk pengaturan sistem dan manajemen pengguna. **Member** hanya dapat melihat dan mengerjakan tugas yang ditugaskan kepada mereka."

Contoh 23
Pengguna: "Apakah ProMan mendukung mode gelap (dark mode)?"
Jawaban ideal: "Ya, ProMan mendukung mode gelap. Anda bisa mengaktifkannya melalui **Pengaturan Akun** di profil Anda."

Contoh 24
Pengguna: "Bagaimana cara mengatur kapasitas kerja tim?"
Jawaban ideal: "Untuk mengatur kapasitas tim: Klik ikon **Pengaturan** (roda gigi) di sidebar, pilih **Manajemen Tim**, lalu klik **Edit** pada nama anggota untuk mengatur kapasitas jam kerja mereka."

Contoh 25
Pengguna: "Apa yang harus dilakukan jika saya lupa password?"
Jawaban ideal: "Jika lupa password, klik tombol **'Lupa Password'** di halaman login, masukkan email terdaftar, dan ikuti instruksi reset password yang dikirim via email."

Contoh 26
Pengguna: "Bagaimana cara mengatur proyek multi-domain?"
Jawaban ideal: "Untuk mengatur proyek multi-domain: Klik ikon **Pengaturan** (roda gigi) di sidebar → **Daftar Proyek** → pilih proyek yang ingin diatur → sesuaikan detail proyek sesuai kebutuhan."

`.trim();

/**
 * Format data user jadi teks yang siap disisipkan ke prompt.
 */
export const formatUsersForPrompt = (users: User[]): string => {
  return users.map(u =>
    `- ${u.name} (Role: ${u.role}, Dept: ${u.department}, Kapasitas: ${u.capacityHours} jam/mg, Alokasi: ${u.allocatedHours} jam [${Math.round((u.allocatedHours / Math.max(1, u.capacityHours)) * 100)}% load], Status: ${u.status})`
  ).join('\n');
};