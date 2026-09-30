# 🚀 ProMan — Intelligent Enterprise Project Management System

**ProMan** adalah platform manajemen proyek modern dan sistem tata kelola operasional berbasis AI (*ProMan AI*) dan real-time database (*Firebase Firestore & Auth*). Dirancang khusus untuk memonitor, mengalokasikan beban kerja, memitigasi risiko keterlambatan, dan mengotomasi breakdown inisiatif proyek dalam skala enterprise.

🌐 **Live URL**: [https://proman-83c57.web.app](https://proman-83c57.web.app)

---

## 📌 Daftar Isi
- [Fitur Utama](#-fitur-utama)
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [Kelebihan Aplikasi](#-kelebihan-aplikasi)
- [Kekurangan & Area Pengembangan](#-kekurangan--area-pengembangan)
- [Panduan Instalasi & Setup](#-panduan-instalasi--setup)
- [Pipeline Otomasi (GitHub Actions)](#-pipeline-otomasi-github-actions)
- [Struktur Direktori Proyek](#-struktur-direktori-proyek)
- [Akun Pengguna & Peran](#-akun-pengguna--peran)

---

## ✨ Fitur Utama

### 1. 📋 Multi-View Project Management
* **Papan Kanban Interaktif**: Drag-and-drop antar status (*Backlog, To Do, In Progress, In Review, Done*) dengan penghitungan sub-tugas otomatis.
* **Timeline Proyek & Gantt Chart Realtime**: Visualisasi durasi tugas, progress bar, ketergantungan, serta penyesuaian skala Harian (*Daily*) dan Mingguan (*Weekly*).
* **Kalender Proyek Realtime**: Jadwal tenggat dan milestone yang tersinkronisasi otomatis dengan waktu saat ini (`new Date()`).
* **Daftar & Tabel**: Tampilan terstruktur tabular dengan fitur sorting dinamis berdasarkan judul, prioritas, tenggat waktu, dan status.

### 2. 🤖 ProMan AI Intelligence Suite
* **AI Task Breakdown Engine**: Memecah ide/inisiatif operasional menjadi sub-tugas terstruktur, kategori departemen, estimasi jam kerja, dan rekomendasi PIC pelaksana secara instan.
* **AI Smart Estimator & Due Date**: Menganalisis judul & deskripsi tugas untuk memberikan rekomendasi tingkat kompleksitas (*Simple, Moderate, Complex*), jam kerja, dan tanggal deadline ideal.
* **AI Solution & Troubleshooting Advisor**: Konsultasi instan berbasis AI di dalam setiap tiket tugas saat terjadi kendala teknis/operasional.
* **Auto-Status Summary (Laporan Eksekutif)**: Ringkasan capaian proyek, analisis *bottleneck*, risiko delay, dan rekomendasi aksi yang dapat langsung dicetak atau diekspor ke PDF.
* **Project Copilot Assistant**: AI chatbot interaktif dengan pengetahuan kontekstual mengenai seluruh isi project, daftar tiket, dan anggota tim yang sedang aktif.

### 3. 🏢 Manajemen Multi-Project & Global Board
* **Global Board**: Melihat seluruh tugas lintas project secara komprehensif dalam satu papan kerja.
* **Project Induk**: Pengelolaan fleksibel daftar inisiatif/project sebagai induk dari seluruh tiket tugas.
* **Project Health Score**: Penilaian otomatis kesehatan proyek berbasis perbandingan progres dan risiko keterlambatan.

### 4. 👥 Manajemen Tim & Tata Kelola Enterprise
* **Super Admin Control Center**: Manajemen persetujuan akun (*pending approval*), penugasan role/jabatan, manajemen kapasitas jam kerja (*Capacity vs Allocated Hours*), dan privasi data AI.
* **Smart Resource / Beban Kerja**: Indikator beban kerja tim untuk mencegah kelebihan alokasi (*overload*) personel.
* **Keamanan Akun**: Password hanya tersimpan di Firebase Authentication (hash), tidak pernah ditulis ke Firestore. Firestore dilindungi *Security Rules* deny-by-default sehingga data tidak bisa dibaca tanpa login.
* **Inactivity Session Timeout**: Auto-logout cerdas setelah 10 menit tidak ada aktivitas pengguna demi menjaga keamanan workstation.
* **Auto-Hide Icon Sidebar**: Navigasi samping ringkas (*icon-only mode*) yang otomatis melebar saat di-*hover* dan dapat dikunci (*pin*).

### 5. 📨 Notifikasi Telegram Otomatis
* **Notifikasi Perubahan Real-Time**: Setiap pembuatan tugas, perubahan judul/prioritas/tenggat/assignee, pergantian status, dan komentar baru langsung diteruskan ke grup Telegram sebagai pesan ringkas.
* **Rekap Harian Terjadwal**: Tiap pagi Senin–Jumat pukul **08:00 WIB**, bot mengirim rekap kondisi pekerjaan ke grup tanpa perlu membuka aplikasi.
* **Isi Rekap** (diurutkan dari yang paling mendesak):
  1. **🔴 Terlambat** — tugas yang sudah melewati tenggat, dikelompokkan per assignee lengkap dengan jumlah hari keterlambatan
  2. **⏰ Jatuh Tempo Hari Ini**
  3. **⚠️ Belum Ada Assignee** — tugas yang belum ditugaskan ke siapa pun
  4. **📝 Belum Dimulai** — masih berstatus *To Do* / *Backlog*
  5. **🔥 Sedang Berjalan** — lengkap dengan nama project
* **Terjadwal Tanpa Server**: Rekap dikirim langsung dari pipeline CI, sehingga tetap terkirim meskipun tidak ada satu pun pengguna yang membuka aplikasi. Tidak memerlukan Cloud Functions maupun billing tambahan.

---

## 🛠 Teknologi yang Digunakan

| Kategori | Teknologi |
|---|---|
| **Frontend Framework** | React 19, TypeScript |
| **Build Tool & Bundler** | Vite 6 |
| **Styling & Theme** | Tailwind CSS v4, Lucide React Icons |
| **Backend & Database** | Firebase Firestore (Realtime Sync & NoSQL DB) |
| **Authentication** | Firebase Authentication (Local Persistence & Session Guard) |
| **AI & LLM Engine** | ProMan AI Engine (Integrasi Groq & OpenRouter API) |
| **Hosting & Deployment** | Firebase Hosting (Global CDN) |
| **Notifikasi** | Telegram Bot API (real-time & rekap harian terjadwal) |
| **CI/CD & Otomasi** | GitHub Actions (auto-deploy, health check, scheduled recap) |

---

## 🌟 Kelebihan Aplikasi

1. **Sinkronisasi Realtime Tanpa Refresh**  
   Menggunakan *Firestore Realtime Listeners (`onSnapshot`)* sehingga setiap perubahan status tugas, penambahan komentar, pembuatan project, atau update progres langsung terlihat oleh seluruh pengguna seketika.

2. **Dukungan AI Terintegrasi Penuh (Bukan Sekadar Chatbot)**  
   ProMan AI hadir langsung di alur kerja operasional: estimasi tugas saat pembuatan tiket, pemecahan tugas inisiatif besar, pemberian solusi kendala teknis, hingga penyusunan laporan mingguan/bulanan berformat eksekutif.

3. **Keamanan & Privasi Enterprise**  
   Dilengkapi *Inactivity Session Timeout (10 menit)*, proteksi approval akun baru oleh Super Admin, enkripsi sesi berbasis *local persistence*, serta autentikasi penuh berbasis Firebase Auth. Setiap akses Firestore diverifikasi ulang oleh *Security Rules* di sisi server, bukan hanya disembunyikan di antarmuka.

4. **Desain Modern, Responsif, & Ringan (Corporate Green)**  
   Antarmuka berstandar enterprise dengan tema hijau profesional, dukungan Dark/Light mode, transisi halus, serta *Auto-Hide Sidebar* yang memaksimalkan area kerja Kanban dan Gantt Chart.

5. **Mitigasi Risiko Proaktif (Predictive Risk Analysis)**  
   Sistem secara otomatis menghitung potensi keterlambatan (*delay prediction*) dan mendeteksi anggota tim yang mengalami *overload* jam kerja sebelum proyek mengalami hambatan nyata.

---

## ⚠️ Kekurangan & Area Pengembangan

1. **Ketergantungan pada Koneksi Internet & API Pihak Ketiga**  
   Fitur ProMan AI dan sinkronisasi data realtime memerlukan koneksi internet aktif serta API Key LLM yang valid. Belum tersedia mode offline (*offline cache with local queue sync*).

2. **Belum Ada Notifikasi Email (SMTP)**  
   Notifikasi real-time sudah berjalan ke Telegram (perubahan tugas, status, komentar, serta rekap harian terjadwal), namun belum tersedia kanal email maupun webhook Discord/Slack.

3. **Kustomisasi Role (RBAC) Masih Berbasis Preset**  
   Hak akses saat ini menggunakan 3 peran utama (*Super Admin, Project Manager, Member*). Fitur pembuatan hak akses kustom granular per-izin menu (*custom fine-grained RBAC*) dapat dikembangkan lebih lanjut.

4. **Integrasi File Storage Eksternal**  
   Lampiran tiket saat ini masih berupa data terstruktur/URL. Integrasi langsung dengan *Firebase Cloud Storage* atau *S3 bucket* untuk upload file besar (PDF, DOCX, ZIP > 50MB) dapat ditambahkan pada iterasi berikutnya.

---

## 💻 Panduan Instalasi & Setup

### Prasyarat
* Node.js v18+ atau v20+
* npm atau yarn

### Langkah Instalasi
1. **Clone repository**:
   ```bash
   git clone https://github.com/username/proman.git
   cd proman
   ```

2. **Install dependensi**:
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables (`.env`)**:
   Salin `.env.example` menjadi `.env` dan isi nilai-nilai sesuai project Firebase & API keys Anda:
   ```bash
   cp .env.example .env
   ```
   ```env
   # --- Firebase (dari Firebase Console → Project Settings) ---
   VITE_FIREBASE_API_KEY="your_firebase_api_key_here"
   VITE_FIREBASE_AUTH_DOMAIN="your_project_id.firebaseapp.com"
   VITE_FIREBASE_PROJECT_ID="your_project_id"
   VITE_FIREBASE_STORAGE_BUCKET="your_project_id.firebasestorage.app"
   VITE_FIREBASE_MESSAGING_SENDER_ID="your_messaging_sender_id"
   VITE_FIREBASE_APP_ID="your_app_id"
   VITE_FIREBASE_MEASUREMENT_ID="your_measurement_id"

   # --- AI / LLM API Keys (Groq & OpenRouter) ---
   VITE_GROQ_API_KEY="your_groq_api_key_here"
   VITE_OPENROUTER_API_KEY="your_openrouter_api_key_here"

   # --- Telegram Notification Bot (opsional) ---
   VITE_TELEGRAM_BOT_TOKEN="your_telegram_bot_token"
   VITE_TELEGRAM_CHAT_ID="your_telegram_chat_id"
   ```
   > ⚠️ **PENTING**: File `.env` berisi kredensial rahasia dan **tidak boleh di-commit** ke GitHub
   > (sudah otomatis di-ignore oleh `.gitignore`). Gunakan `.env.example` sebagai template publik.

4. **Jalankan Development Server**:
   ```bash
   npm run dev
   ```
   Akses aplikasi di browser melalui `http://localhost:5173`.

5. **Build untuk Produksi**:
   ```bash
   npm run build
   ```

6. **Deploy ke Firebase Hosting**:
   ```bash
   npx firebase deploy --only hosting
   ```

7. **Deploy otomatis lewat GitHub Actions** (opsional, sudah aktif di repo ini):
   Setiap `git push` ke branch `main` akan otomatis build dan deploy ke
   Firebase Hosting. Tidak perlu menjalankan perintah pada langkah 6 lagi.

   > ⚠️ **Build di CI membaca konfigurasi dari GitHub Secrets, bukan dari
   > `.env` lokal.** Mengubah `.env` di laptop tidak berpengaruh ke situs
   > sampai secret-nya diisi ulang:
   > ```powershell
   > powershell -NoProfile -ExecutionPolicy Bypass -File scripts/set-github-secrets.ps1
   > ```
   > Setelah itu baru `git push` untuk memicu deploy. Push ke branch selain
   > `main` tidak mengubah situs sampai di-merge ke `main`.

   Kalau build gagal, situs lama tetap hidup — deploy baru jalan setelah
   step build sukses.

---

## ⚙️ Pipeline Otomasi (GitHub Actions)

Repo ini memakai tiga workflow terpisah di `.github/workflows/`. Semuanya
berjalan di runner GitHub, jadi tidak ada server yang perlu selalu menyala.

| Workflow | Kapan Jalan | Fungsi |
|---|---|---|
| `deploy.yml` | Setiap `push` ke `main` | Build produksi lalu deploy ke Firebase Hosting |
| `ci-health.yml` | Senin 06:00 UTC (13:00 WIB) | Memeriksa secret, build, validasi token, dan kesehatan situs — **tanpa deploy** |
| `daily-recap.yml` | Senin–Jumat 01:00 UTC (08:00 WIB) | Mengirim rekap harian ke grup Telegram |

### Kenapa health check ada?

`FIREBASE_TOKEN` adalah *refresh token* yang secara resmi tidak punya tanggal
kedaluwarsa — jadi tidak ada yang bisa dipantau. Satu-satunya cara untuk tahu
masih valid adalah mencobanya. Health check melakukannya setiap minggu lewat
panggilan *read-only*, sehingga hosting tidak pernah tersentuh dan masalahnya
ketahuan lebih awal, bukan saat deploy penting sedang menunggu.

### Rekap harian Telegram

Divalidasi dengan mode *dry-run* yang tidak mengirim apa pun:

```powershell
# Lihat hasilnya tanpa kirim
& "C:\Program Files\GitHub CLI\gh.exe" workflow run daily-recap.yml `
  --repo Radikdwiyoga/PromanAI --field dry_run=true

# Kirim sekarang juga
& "C:\Program Files\GitHub CLI\gh.exe" workflow run daily-recap.yml `
  --repo Radikdwiyoga/PromanAI
```

Rekap yang lebih panjang dari batas 4096 karakter Telegram akan dipecah
otomatis pada batas baris (tidak pernah di tengah tag HTML) dan ditandai
*"(lanjutan)"*.

> ⚠️ **GitHub Actions tidak menjamin jadwal tepat pada menitnya.** Run bisa
> terlambat beberapa menit, dan kadang lebih lama saat server GitHub sedang
> ramai. Untuk jadwal yang harus presisi, opsi ini perlu digantikan *Cloud
> Scheduler* — yang menuntut upgrade billing ke plan Blaze.
>
> Selain itu, GitHub menonaktifkan jadwal otomatis pada repo yang tidak ada
> aktivitas selama 60 hari.

### Script Utilitas

| Script | Kegunaan |
|---|---|
| `scripts/set-github-secrets.ps1` | Mengisi GitHub Secrets dari `.env` lokal + token Firebase |
| `scripts/send-daily-recap.mjs` | Menyusun dan mengirim rekap harian (`--dry-run` untuk simulasi) |
| `scripts/migrate-users-to-auth.mjs` | Migrasi user lama ke Firebase Auth (dua tahap: dry-run lalu `--apply`) |
| `scripts/verify-migration.mjs` | Verifikasi UID Auth sinkron dengan dokumen Firestore |
| `scripts/strip-plaintext-passwords.mjs` | Menghapus field password plaintext dari Firestore |
| `scripts/disable-orphan-auth.mjs` | Menonaktifkan akun Auth yang dokumen `/users`-nya sudah hilang |
| `scripts/clean-dangling-refs.mjs` | Membersihkan referensi `assigneeIds`/`userId` yang menggantung |

---

## 📂 Struktur Direktori Proyek

```
src/
├── components/
│   ├── admin/          # Admin Settings & User Management
│   ├── ai/             # ProMan AI Suite (Breakdown, Copilot, Summarizer, Dashboards)
│   ├── auth/           # Login, Register, & Change Password Modal
│   ├── common/         # TechLogo, UserAvatar, Reusable Components
│   ├── layout/         # Navbar, Auto-Hide Sidebar, Toast
│   ├── projects/       # Project Management View & Modals
│   ├── tasks/          # Kanban TaskCard, TaskModal, CreateTaskModal
│   └── views/          # KanbanView, TimelineView, CalendarView, ListView
├── context/
│   ├── ProjectContext.tsx   # State Management & Realtime Sync Engine
│   └── ThemeContext.tsx     # Dark / Light Mode Provider
├── data/
│   ├── copilotKnowledge.ts  # ProMan AI Domain Knowledge Base
│   └── initialData.ts       # Mock Seeder & Initial Structures
├── services/
│   ├── authService.ts       # Firebase Authentication & Session Service
│   ├── firestoreService.ts  # Firestore CRUD & Realtime Subscriptions
│   ├── firebase.ts          # Firebase App Initialization & Persistence
│   ├── telegramService.ts   # Telegram Bot Notifications (realtime & rekap)
│   ├── backupService.ts     # Excel Export & System Backup
│   └── geminiService.ts     # ProMan AI Engine (LLM API Integrations)
├── types/
│   └── index.ts             # TypeScript Type Definitions & Interfaces
├── utils/
│   └── aiSimulator.ts       # Workload, Delay, & Risk Calculators
├── App.tsx                  # Core App Component & View Routing
├── index.css                # Global Tailwind CSS & Animations
└── main.tsx                 # Entry Point

.github/workflows/
├── deploy.yml               # Auto-deploy ke Firebase Hosting saat push
├── ci-health.yml            # Health check mingguan (read-only)
└── daily-recap.yml          # Rekap harian terjadwal ke Telegram

scripts/                     # Utilitas Admin SDK & otomasi (Node)
firestore.rules              # Security Rules (deny-by-default)
```

---

## 🔑 Akun Pengguna & Peran

ProMan tidak lagi menyediakan akun demo dengan password bawaan yang tertulis
di dokumen. Password hanya tersimpan di Firebase Authentication dalam bentuk
hash, dan tidak pernah disimpan di Firestore maupun di repository.

| Peran | Email Login | Akses Utama |
|---|---|---|
| **Super Admin** | `admin@bitcorp.id` | Tata Kelola Enterprise, Admin Settings, Approval User, Konfigurasi AI |
| **Team Member** | `radik.dwiyoga@bitcorp.id` | Papan Kanban, Kalender, Timeline, Copilot Assistant |

### Cara membuat akun baru

1. Buka halaman Register di aplikasi, lalu daftar memakai email korporat.
2. Akun berstatus *pending* sampai disetujui Super Admin di panel pengaturan.
3. Setelah disetujui, akun otomatis dibuat di Firebase Auth dan langsung
   bisa login.

> 💡 Email demo yang pernah ada di README versi sebelumnya
> (`*@perusahaan.id`) sudah dihapus dari Firestore. Password-nya tidak dapat
> dipulihkan — akun lama dibuat dengan password yang sudah dibuang, dan
> Akun Auth-nya sudah dinonaktifkan. Jika butuh akun demo untuk uji coba,
> daftarkan lewat halaman Register.

### Menghapus pengguna

Penghapusan pengguna bersifat *soft delete*: dokumen `/users` ditandai
`status: 'rejected'` dan akun Auth-nya dinonaktifkan. Ini disengaja —
klien tidak bisa menonaktifkan akun Firebase Auth secara langsung, sehingga
penghapusan permanen selalu meninggalkan akun yang masih bisa login. Data
historis (komentar, activity log) tetap referensial ke dokumen asli.

---

## 📄 Lisensi
Hak Cipta © 2026 **ProMan Enterprise Project Management**. Seluruh hak cipta dilindungi undang-undang.
