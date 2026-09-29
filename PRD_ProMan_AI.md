# Product Requirement Document (PRD): ProMan-AI

> **Status Dokumen:** Aktif — diselaraskan dengan implementasi aplikasi saat ini (iterasi MVP).
> **Tanggal Pembaruan:** 23 September 2026

---

## 1. Ringkasan Eksekutif

**ProMan-AI** adalah aplikasi manajemen proyek enterprise berbasis web yang berjalan *real-time* di atas **Firebase (Firestore + Auth + Hosting)** dengan mesin kecerdasan buatan (AI) yang sudah terintegrasi langsung di dalam alur kerja. Aplikasi ini mengotomatisasi pekerjaan administratif berulang (estimasi tugas, pemecahan inisiatif, ringkasan status eksekutif), memprediksi risiko keterlambatan proyek, dan memberikan rekomendasi cerdas untuk alokasi beban kerja tim.

Saat ini ProMan-AI telah diimplementasikan sebagai **MVP fungsional penuh** dengan papan Kanban, Timeline/Gantt, Kalender, Daftar & Tabel, dashboard risiko prediktif, alokasi sumber daya cerdas, ringkasan eksekutif otomatis, serta asisten chat AI (**Project Copilot**). Seluruh fitur AI bekerja melalui arsitektur **multi-LLM provider** (Groq + OpenRouter) dengan *fallback* ke simulator heuristik lokal sehingga aplikasi tetap berfungsi meskipun tidak ada API key. Notifikasi terintegrasi dengan **Telegram Bot** dan **Email (via Cloud Functions)**.

**Status layanan:** Aplikasi telah di-deploy ke Firebase Hosting (`https://proman-83c57.web.app`) dengan CI/CD otomatis melalui GitHub Actions.

---

## 2. Visi & Tujuan Produk

*   **Visi:** Menjadi asisten manajerial paling cerdas yang memberdayakan tim untuk berkolaborasi tanpa hambatan dan menyelesaikan proyek secara presisi.
*   **Tujuan Bisnis:**
    *   Mengakuisisi 50.000 Pengguna Aktif Bulanan (MAU) dalam 12 bulan pertama.
    *   Mengurangi waktu perencanaan proyek dan pembuatan laporan pengguna hingga 40% melalui otomasi AI.
*   **Tujuan Pengguna:** Membantu pengguna menghindari *burnout* (melalui pemantauan beban kerja), mendeteksi *bottleneck* (hambatan) sejak dini (melalui dashboard risiko), dan mempermudah pendelegasian tugas secara adil (melalui rekomendasi assignee cerdas).

---

## 3. Persona Pengguna

Aplikasi mengimplementasikan model persona berikut (tersedia sebagai profil demo di dalam sistem):

| Persona | Peran & Kebutuhan | Titik Nyeri (Pain Points) |
| :--- | :--- | :--- |
| **Super Admin** | Mengelola seluruh sistem: verifikasi pendaftaran akun, manajemen pengguna & password, konfigurasi perusahaan, pengaturan AI & privasi, dan meninjau audit log. | Menghabiskan waktu untuk pekerjaan administrasi akun dan konfigurasi yang berulang. |
| **Alex — Project Manager (PM)** | Membutuhkan visibilitas menyeluruh terhadap *timeline*, anggaran, risiko, dan beban kerja tim; membuat proyek baru. | Kehabisan waktu untuk membuat laporan rutin; sering terkejut oleh penundaan tugas yang tidak terdeteksi. |
| **Sarah — Team Member** | Menginginkan kejelasan tugas, prioritas yang terarah, estimasi beban kerja, dan bantuan solusi teknis dari AI. | Sering menerima tugas besar yang kurang spesifik; beban kerja kadang tidak merata (overload). |
| **Budi — Stakeholder/Klien** | Membutuhkan *update* tingkat tinggi (ringkasan eksekutif) tentang status proyek yang siap dibagikan. | Tidak punya waktu untuk membaca ratusan tiket teknis di papan Kanban. |
| **Rian — Operations Lead** | Memantau operasional lapangan/logistik, kapasitas tim, dan tenggat proyek operasional. | Kesulitan melacak progres operasional multi-lokasi dan mendeteksi keterlambatan dini. |

---

## 4. Fitur Utama & Fungsionalitas

### A. Autentikasi & Manajemen Akun

| Fitur | Status | Detail Implementasi |
| :--- | :--- | :--- |
| **Login (Sign In)** | ✅ Terimplementasi | Autentikasi email/password via **Firebase Auth** dengan session persistence (browser). Mendukung akun demo. Pesan error detail (password salah, email belum terdaftar, akun pending/ditolak). |
| **Pendaftaran (Sign Up)** | ✅ Terimplementasi | Registrasi mandiri dengan nama, email perusahaan, departemen, jabatan, dan password. Akun baru berstatus **Pending** hingga disetujui Super Admin. |
| **Lupa/Reset Password** | ✅ Terimplementasi | Reset password langsung (Firestore) + inisiasi email reset via Firebase Auth. |
| **Ganti Password** | ✅ Terimplementasi | Re-autentikasi Firebase, validasi password lama, *password strength meter* (Lemah/Cukup/Kuat/Sangat Kuat), dan sinkronisasi ke Firestore. |
| **Verifikasi Akun Pending** | ✅ Terimplementasi | Antrean pendaftar baru di Admin Settings dengan tombol **Setujui** / **Tolak**. |
| **Session Timeout Otomatis** | ✅ Terimplementasi | Auto-logout setelah **10 menit tidak ada aktivitas** dengan peringatan toast. |
| **Manajemen Profil Pengguna** | ✅ Terimplementasi | CRUD pengguna oleh Super Admin: foto (upload custom maks. 2MB atau preset), role, departemen, kapasitas jam/minggu, persona type, status akun. |

### B. Fitur Manajemen Proyek Inti (Core)

1.  **Manajemen Tugas**
    *   **Status tugas:** `Backlog → To Do → In Progress → Review → Done`.
    *   **Prioritas:** `Low / Medium / High / Urgent`.
    *   **Assignee:** mendukung banyak penanggung jawab (*multiple assignees*) per tugas.
    *   **Sub-tugas:** checklist dengan kategori (Frontend, Backend, Design, QA, Operations, Logistics, Marketing, HR, Finance, Legal, General).
    *   **Tag/Label, tanggal mulai, tenggat, estimasi jam kerja**, dan deskripsi rinci.
    *   **Komentar & catatan progres** per tugas dengan riwayat penulis dan waktu.
    *   **Lampiran (Attachment):** model data tersedia dan ditampilkan di detail tugas (upload file cloud belum termasuk MVP).

2.  **Multi-Tampilan (Views)**
    *   **Papan Kanban** dengan **drag & drop** antar kolom status.
    *   **Timeline & Gantt Chart** dengan *zoom* Harian/Mingguan, highlight hari ini, indikator risiko AI (⚠️ estimasi delay) pada bar Gantt.
    *   **Kalender Proyek** (bulanan) menampilkan rentang tanggal tugas, chip berwarna sesuai prioritas, dan indikator risiko.
    *   **Daftar & Tabel** dengan kolom yang dapat diurutkan (judul, status, prioritas, tenggat).

3.  **Manajemen Proyek & Global Board**
    *   **CRUD Project** (buat, edit, hapus) — dibatasi untuk Super Admin & PM.
    *   **Bidang/Domain proyek:** Technology, Operations, Marketing, HR, Finance, Event, dan General/Multi-disiplin.
    *   **Status proyek:** Active, Planning, On Hold, Completed.
    *   **Project Health Score (0–100)** dengan progress bar (% tugas selesai).
    *   **Global Board ("Semua Project")** untuk memantau seluruh portofolio lintas proyek sekaligus, lengkap dengan *Global Health*.
    *   Pemfilteran tugas: pencarian (judul/deskripsi/tag), assignee, prioritas, status, dan *Quick Filters* di sidebar ("Tugas Saya", "Prioritas Urgent").

4.  **Ruang Kolaborasi**
    *   Kolom komentar pada setiap tugas.
    *   *Attachment* ditampilkan pada kartu tugas & detail tugas.
    *   **Catatan:** *@mention* pada komentar belum memiliki UI khusus (model data `mentions` sudah disiapkan).

### C. Fitur Berbasis AI (AI-Powered) — *USP Aplikasi*

Seluruh fitur AI berjalan melalui **multi-LLM provider chain**: **Groq** (primary) → **OpenRouter** (secondary) → **ProMan Local Heuristic Simulator** (fallback). Dengan demikian fitur AI selalu responsif bahkan saat API key tidak dikonfigurasi.

1.  **AI Task Breakdown Engine (Pemecah Tugas Otomatis)**
    *   ✅ **Terimplementasi.** Pengguna memasukkan *prompt* singkat (contoh: "Buka cabang operasional baru di Surabaya", "Buatkan fitur login menggunakan Google").
    *   AI mengklasifikasikan domain (Operations, Marketing, HR, Technology, Finance, dsb.), menyusun 4–6 sub-tugas terstruktur dengan kategori, menetapkan prioritas, tag, dan **merekomendasikan penanggung jawab** paling sesuai (berdasarkan role & beban kerja).
    *   Hasil dapat langsung **ditambahkan ke papan proyek (1-click)**.

2.  **AI Smart Task Estimator & Auto Due-Date (Estimasi Jam Kerja)**
    *   ✅ **Terimplementasi.** Saat membuat/mengedit tugas, AI memperkirakan jam kerja riil, tingkat kompleksitas (Rendah/Sedang/Kompleks/Sangat Kompleks), dan **due date realistis** (memperhitungkan jam kerja 6–8 jam/hari, melewati hari Minggu) beserta alasan analisisnya.

3.  **AI Solution & Troubleshooting Advisor (Pemecah Masalah Teknis)**
    *   ✅ **Terimplementasi.** Pada detail tugas, AI memberikan diagnosis, langkah solusi, tips teknis, potensi jebakan, dan sub-tugas rekomendasi; dapat **ditambahkan ke sub-tugas** atau **diposting ke komentar tiket** (1-click).

4.  **Predictive Risk & Delay Analysis (Deteksi Risiko Dini)**
    *   ✅ **Terimplementasi.** Dashboard "Predictive Risk & Delay Analysis" menampilkan:
        *   **Status risiko keseluruhan** (Healthy/Warning/Critical) dengan skor /100.
        *   4 KPI: jumlah tugas berisiko tinggi, estimasi keterlambatan (hari kerja), anggota overload (>100%), dan akurasi model prediksi (±92%).
        *   Kartu risiko per tugas dengan alasan + **rekomendasi mitigasi 1-click**: *Alihkan ke anggota lain*, *Pecahkan tugas*, *Kurangi lingkup*, atau *Setujui buffer +N hari*.
        *   Deteksi **overdue** (tugas melewati tenggat) otomatis.

5.  **Smart Resource Allocation (Alokasi Beban Kerja Cerdas)**
    *   ✅ **Terimplementasi.** Halaman "Smart Resource Allocation & Workload Planner" menampilkan kartu kapasitas per anggota tim: bar beban kerja (berwarna: hijau/amber/merah), peringatan *overload (>100%) / burn-out*, daftar tugas aktif yang dapat diklik.
    *   Saat pembuatan tugas, sistem menyarankan **assignee dengan beban terendah** ("Saran Beban").

6.  **Auto-Status Summarization (Pembuatan Laporan Instan)**
    *   ✅ **Terimplementasi.** Modal "Auto-Status Summarization" menghasilkan laporan eksekutif (headline, status kesehatan, % selesai, pencapaian, hambatan & mitigasi, rekomendasi) dalam Bahasa Indonesia.
    *   Cakupan dapat dipilih (**Semua Project** atau proyek tertentu) dan dapat *di-regenerate*.
    *   **Ekspor laporan:** Unduh teks (`.txt`), **Download PDF** (via dialog cetak), dan **Salin Laporan** ke clipboard — siap dikirim ke Stakeholder.

7.  **Project Copilot (Asisten Chat AI)**
    *   ✅ **Terimplementasi.** *Chatbot* interaktif (drawer) dengan akses data proyek real-time. Mampu menjawab: "Apa tugas paling mendesak?", "Siapa yang overload?", "Tugas radik apa aja?", panduan cara pakai aplikasi, dan lain-lain.
    *   Mendukung **action links** (buka dashboard risiko, buka alokasi sumber daya, buka ringkasan status) dan **suggestion chips** untuk pertanyaan cepat.

### D. Notifikasi & Integrasi

| Integrasi | Status | Detail |
| :--- | :--- | :--- |
| **Telegram Bot** | ✅ Terimplementasi (client-side, gratis) | Notifikasi otomatis: tugas dibuat, tugas diperbarui (dengan *diff* deskripsi mendetail), status dipindahkan, komentar baru. Konfigurasi via env `VITE_TELEGRAM_BOT_TOKEN` & `VITE_TELEGRAM_CHAT_ID`; tersedia tombol "Kirim Test Notifikasi" di Admin Settings. |
| **Email (Firebase Cloud Functions)** | ✅ Terimplementasi | Trigger Firestore mengirim email via SMTP (Nodemailer/Gmail): **tugas di-assign**, **tugas diperbarui** (status/prioritas/tenggat), **komentar baru**, dan **reminder deadline harian** (Pub/Sub terjadwal 08:00 WIB) untuk tugas yang jatuh tempo ≤ 2 hari. |
| Slack / MS Teams / GitHub / Google Drive | ⏳ Belum terimplementasi | Masuk *backlog* roadmap (lihat Bagian 7). |

### E. Admin & Tata Kelola (Super Admin)

1.  **Pengaturan Umum & Perusahaan:** nama organisasi, zona waktu operasional.
2.  **AI Engine & Privasi Data:**
    *   Arsitektur **multi-LLM provider**: Groq (primary), OpenRouter (secondary), Local Heuristic Simulator (fallback) — penjelasan status aktif.
    *   **Enterprise Data Zero-Retention Mode:** data/prompt pengguna **tidak digunakan** untuk melatih model publik (diberlakukan otomatis, bukan opt-in).
3.  **Manajemen Pengguna & Password:** antrean verifikasi pendaftar, tabel seluruh pengguna (status, password tersembunyi dengan toggle lihat, role, departemen, kapasitas, persona), tambah/edit/hapus anggota, upload foto.
4.  **Audit Log & Sistem:** riwayat aktivitas & audit log aplikasi, status konfigurasi notifikasi Telegram.

### F. Pengalaman Pengguna (UI/UX)

*   **Tema Dark/Light** dengan persistensi preferensi (default: dark).
*   Sidebar **auto-hide/icon-only** dengan fitur *pin*; desain responsif (mobile drawer).
*   Bahasa antarmuka: **Bahasa Indonesia**.
*   Desain sistem *Sentinel* (dark slate + emerald neon, JetBrains Mono untuk data teknis).
*   Toast notifikasi untuk umpan balik aksi.

---

## 5. Kebutuhan Non-Fungsional (Teknis & Privasi)

| Kebutuhan | Status / Target | Detail |
| :--- | :--- | :--- |
| **Sinkronisasi Real-time** | ✅ Terimplementasi | Firestore `onSnapshot` (proyek, tugas, pengguna, komentar, audit log, settings) — semua pembaruan tersinkron antar pengguna secara langsung. Target latensi sinkronisasi: **≤ 240ms** (configurable via `syncLatencyTargetMs`). |
| **Privasi & Keamanan Data (AI)** | ✅ Terimplementasi | Mode **zero-retention** diberlakukan: data proyek tidak dipakai untuk melatih model publik. API key AI tidak di-hardcode (env var + localStorage opsional). |
| **Arsitektur AI Resilient** | ✅ Terimplementasi | Fallback berantai Groq → OpenRouter → simulator lokal, sehingga fitur AI tetap berfungsi tanpa koneksi LLM eksternal. |
| **Autentikasi & RBAC** | ✅ Terimplementasi | Firebase Auth; hak akses berbasis persona: Super Admin (akses penuh), PM (kelola proyek), Member/Stakeholder (lihat & update tugasnya). |
| **Notifikasi** | ✅ Terimplementasi | Telegram Bot (client) + Email (Cloud Functions). |
| **CI/CD & Deployment** | ✅ Terimplementasi | GitHub Actions → build → Firebase Hosting. |
| **Performa Frontend** | ✅ | React 19 + TypeScript + Vite; desain optimasi mobile (pan-y, overscroll contained). |
| **Integrasi Eksternal** | ⏳ Parsial | Telegram & Email aktif; Slack/Teams/GitHub belum tersedia. |

---

## 6. Metrik Keberhasilan (Success Metrics)

Metrik berikut dipantau untuk mengukur dampak fitur:

*   **Adopsi AI:** Persentase tugas dan proyek yang dibuat menggunakan fitur *AI Task Breakdown* (> 35%).
*   **Retensi Jangka Panjang:** Tingkat *churn* pengguna berbayar di bawah 3% per bulan.
*   **Akurasi Prediksi:** Akurasi model AI dalam memprediksi *delay* proyek dengan margin error maksimal **15%** (dashboard menampilkan akurasi model ±92% saat ini).
*   **Efisiensi PM:** Frekuensi penggunaan fitur *Auto-Status Summarization* per minggu oleh setiap manajer proyek.
*   **Kesehatan Tim:** Penurunan jumlah anggota *overload (>100%)* setelah penggunaan Smart Resource Allocation.

---

## 7. Status Implementasi vs. Peta Jalan (Roadmap)

### ✅ Telah Terimplementasi (MVP + Iterasi Lanjutan)
- Fitur manajemen proyek inti: Kanban (drag & drop), Timeline/Gantt, Kalender, Daftar & Tabel.
- Manajemen proyek multi-domain + Global Board + Health Score.
- CRUD tugas, sub-tugas, komentar, tag, prioritas, multiple assignee.
- Autentikasi lengkap (login, registrasi + pending approval, reset & ganti password, session timeout).
- Seluruh fitur AI inti: **Task Breakdown, Smart Estimator, Solution Advisor, Predictive Risk, Smart Resource Allocation, Auto-Status Summary (ekspor PDF/TXT/Salin), Project Copilot.**
- Admin Settings (perusahaan, AI & privasi, manajemen pengguna, audit log).
- Notifikasi **Telegram Bot** dan **Email (Cloud Functions)** + reminder deadline harian.
- Dark/Light mode, desain responsif, CI/CD.

### 🚧 Sedang Berjalan / Backlog
- **Fase Integrasi Lanjutan:** Slack/Microsoft Teams (notifikasi), GitHub/GitLab (sinkronisasi status kode), Google Drive (lampiran cloud).
- **Upload lampiran file cloud** (Firebase Storage) pada tugas.
- **@mention** aktif pada komentar.
- Expand Cloud Functions deployment pada CI/CD workflow (saat ini di-comment).

### 🔮 Rencana Masa Depan (Fase 3+)
- **Voice-to-Task:** mengubah rekaman rapat langsung menjadi delegasi tugas proyek.
- **Alokasi anggaran otomatis** berbasis prediksi AI.
- **Offline mode** dan notifikasi *push* (web/mobile).
- Hirarki **Workspace** penuh (saat ini hanya Project + Folder).

---

## 8. Teknologi & Arsitektur

| Lapisan | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite 6, Tailwind CSS v4, Lucide Icons, date-fns, clsx/tailwind-merge | SPA responsif, mode dark/light. |
| **Backend-as-a-Service** | Firebase (Auth, Firestore, Hosting, Cloud Functions) | Realtime sync via Firestore subscriptions. |
| **AI Engine** | Multi-LLM provider: **Groq** (`openai/gpt-oss-120b`) → **OpenRouter** (free models) → **Local Heuristic Simulator** | Fallback berantai; output JSON terstruktur. |
| **Notifikasi** | Telegram Bot API (client-side) + Nodemailer/Gmail SMTP (Cloud Functions) | Task lifecycle notifications + reminder deadline. |
| **CI/CD** | GitHub Actions | Deploy ke Firebase Hosting otomatis. |
| **Environment** | `.env` (VITE_FIREBASE_*, VITE_GROQ_API_KEY, VITE_OPENROUTER_API_KEY, VITE_TELEGRAM_*) | API key tidak di-commit ke repo. |