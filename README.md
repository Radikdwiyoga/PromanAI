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
- [Struktur Direktori Proyek](#-struktur-direktori-proyek)
- [Akun Demo & Role Pengguna](#-akun-demo--role-pengguna)

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
* **Keamanan & Privasi Password**: Masking password pengguna di panel admin dengan toggle buka/tutup independen.
* **Inactivity Session Timeout**: Auto-logout cerdas setelah 10 menit tidak ada aktivitas pengguna demi menjaga keamanan workstation.
* **Auto-Hide Icon Sidebar**: Navigasi samping ringkas (*icon-only mode*) yang otomatis melebar saat di-*hover* dan dapat dikunci (*pin*).

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

---

## 🌟 Kelebihan Aplikasi

1. **Sinkronisasi Realtime Tanpa Refresh**  
   Menggunakan *Firestore Realtime Listeners (`onSnapshot`)* sehingga setiap perubahan status tugas, penambahan komentar, pembuatan project, atau update progres langsung terlihat oleh seluruh pengguna seketika.

2. **Dukungan AI Terintegrasi Penuh (Bukan Sekadar Chatbot)**  
   ProMan AI hadir langsung di alur kerja operasional: estimasi tugas saat pembuatan tiket, pemecahan tugas inisiatif besar, pemberian solusi kendala teknis, hingga penyusunan laporan mingguan/bulanan berformat eksekutif.

3. **Keamanan & Privasi Enterprise**  
   Dilengkapi *Inactivity Session Timeout (10 menit)*, proteksi approval akun baru oleh Super Admin, enkripsi sesi berbasis *local persistence*, dan proteksi privasi password.

4. **Desain Modern, Responsif, & Ringan (Corporate Green)**  
   Antarmuka berstandar enterprise dengan tema hijau profesional, dukungan Dark/Light mode, transisi halus, serta *Auto-Hide Sidebar* yang memaksimalkan area kerja Kanban dan Gantt Chart.

5. **Mitigasi Risiko Proaktif (Predictive Risk Analysis)**  
   Sistem secara otomatis menghitung potensi keterlambatan (*delay prediction*) dan mendeteksi anggota tim yang mengalami *overload* jam kerja sebelum proyek mengalami hambatan nyata.

---

## ⚠️ Kekurangan & Area Pengembangan

1. **Ketergantungan pada Koneksi Internet & API Pihak Ketiga**  
   Fitur ProMan AI dan sinkronisasi data realtime memerlukan koneksi internet aktif serta API Key LLM yang valid. Belum tersedia mode offline (*offline cache with local queue sync*).

2. **Belum Ada Notifikasi Push / Email Eksternal**  
   Notifikasi penugasan tiket dan peringatan delay saat ini baru ditampilkan via *in-app toast* dan *activity logs*, belum terhubung ke email (SMTP) atau webhook Discord/Slack/Telegram.

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
│   ├── databaseService.ts   # Firestore CRUD & Realtime Subscriptions
│   ├── firebase.ts          # Firebase App Initialization & Persistence
│   └── geminiService.ts     # ProMan AI Engine (LLM API Integrations)
├── types/
│   └── index.ts             # TypeScript Type Definitions & Interfaces
├── utils/
│   └── aiSimulator.ts       # Workload, Delay, & Risk Calculators
├── App.tsx                  # Core App Component & View Routing
├── index.css                # Global Tailwind CSS & Animations
└── main.tsx                 # Entry Point
```

---

## 🔑 Akun Demo & Role Pengguna

| Role | Email Login | Password Default | Akses Utama |
|---|---|---|---|
| **Super Admin** | `admin@perusahaan.id` | `admin123` | Tata Kelola Enterprise, Admin Settings, Approval User, Konfigurasi AI |
| **Project Manager** | `alex@perusahaan.id` | `alex123` | Manajemen Project, Ekspor Laporan, Monitoring Beban Kerja Tim |
| **Senior Specialist** | `budi@perusahaan.id` | `budi123` | Papan Kanban, Kalender, Timeline, Task Troubleshooting |
| **Team Member** | `citra@perusahaan.id` | `citra123` | Papan Kanban, Filter Tugas Saya, Copilot Assistant |

---

## 📄 Lisensi
Hak Cipta © 2026 **ProMan Enterprise Project Management**. Seluruh hak cipta dilindungi undang-undang.
