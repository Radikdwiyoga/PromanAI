import { Task, User, Subtask, ExecutiveSummary, CopilotMessage, TaskEffortEstimation, AISolutionAdvice } from '../types';
import { APP_FEATURES_KNOWLEDGE, HOW_TO_GUIDES } from '../data/copilotKnowledge';

export interface GeneratedBreakdown {
  title: string;
  description: string;
  domain: 'operations' | 'marketing' | 'hr' | 'finance' | 'technology' | 'event' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  subtasks: Omit<Subtask, 'id'>[];
  recommendedAssigneeId: string;
  rationale: string;
}

// 0. AI Smart Task Estimator & Auto-Due Date Simulator
export function simulateTaskEffortEstimation(
  title: string,
  description: string,
  assigneeId: string,
  startDateStr: string,
  users: User[]
): TaskEffortEstimation {
  const text = `${title} ${description}`.toLowerCase();
  
  let hours = 8;
  let complexity: TaskEffortEstimation['complexityLevel'] = 'Sedang';
  let rationale = '';

  if (
    text.includes('arsitektur') || 
    text.includes('migrasi') || 
    text.includes('keamanan') || 
    text.includes('audit') || 
    text.includes('ekspansi') || 
    text.includes('cabang') ||
    text.includes('infrastruktur') ||
    text.includes('rekrutmen massal')
  ) {
    hours = 32;
    complexity = 'Sangat Kompleks';
    rationale = 'Tugas mencakup analisis arsitektur mendalam, koordinasi kepatuhan sistem, dan dependensi kritis lintas divisi.';
  } else if (
    text.includes('backend') || 
    text.includes('database') || 
    text.includes('integrasi') || 
    text.includes('api') || 
    text.includes('rekrutmen') || 
    text.includes('kampanye') ||
    text.includes('refactor') ||
    text.includes('auth')
  ) {
    hours = 16;
    complexity = 'Kompleks';
    rationale = 'Memerlukan perancangan skema data, pengujian integrasi endpoint, penanganan error, dan validasi fungsional menyeluruh.';
  } else if (
    text.includes('desain') || 
    text.includes('ui') || 
    text.includes('frontend') || 
    text.includes('sop') || 
    text.includes('notula') ||
    text.includes('landing page') ||
    text.includes('konten')
  ) {
    hours = 8;
    complexity = 'Sedang';
    rationale = 'Membutuhkan implementasi antarmuka, penyesuaian komponen responsif, uji tampilan, dan review aset grafis.';
  } else {
    hours = 4;
    complexity = 'Rendah';
    rationale = 'Pekerjaan operasional standar dengan ruang lingkup yang terdefinisi jelas dan risiko dependensi minimal.';
  }

  // Calculate realistic due date (assuming 6-8 working hours/day, skipping Sundays)
  const start = startDateStr ? new Date(startDateStr) : new Date();
  const workDaysNeeded = Math.max(1, Math.ceil(hours / 6));
  const cur = new Date(start);
  let daysAdded = 0;
  while (daysAdded < workDaysNeeded) {
    cur.setDate(cur.getDate() + 1);
    // Skip Sunday (0)
    if (cur.getDay() !== 0) {
      daysAdded++;
    }
  }
  const suggestedDueDate = cur.toISOString().split('T')[0];

  const matchedAssignee = users.find(u => u.id === assigneeId) || users[0];

  return {
    estimatedHours: hours,
    complexityLevel: complexity,
    suggestedDueDate,
    recommendedAssigneeId: matchedAssignee?.id,
    rationale,
  };
}

// 0.5 AI Smart Troubleshooting & Solution Advisor Simulator
export function simulateAISolutionAdvice(task: Task, userQuestion?: string): AISolutionAdvice {
  const text = `${task.title} ${task.description} ${userQuestion || ''}`.toLowerCase();

  if (text.includes('auth') || text.includes('login') || text.includes('oauth') || text.includes('token') || text.includes('jwt') || text.includes('keamanan')) {
    return {
      id: `advice-${Date.now()}`,
      taskId: task.id,
      summaryDiagnosis: 'Modul Autentikasi & Otorisasi memerlukan kepatuhan standar keamanan token (JWT/OAuth2), penanganan status session expired, dan validasi role permission di sisi server.',
      actionSteps: [
        'Pastikan penyimpanan token menggunakan HttpOnly Cookie atau state memory yang aman dari serangan XSS.',
        'Implementasikan middleware verifikasi token pada setiap endpoint REST API / Firestore Security Rules.',
        'Sediakan mekanisme refresh token otomatis sebelum access token kedaluwarsa.',
        'Tambahkan logging audit untuk setiap percobaan login yang gagal atau aktivitas mencurigakan.'
      ],
      technicalTips: [
        'Gunakan library resmi seperti Firebase Auth SDK atau OAuth2 Provider standar.',
        'Hindari menyimpan data sensitif (password, secret key) di LocalStorage browser.',
        'Beri feedback error yang jelas bagi pengguna namun tidak membocorkan detail keamanan ke publik.'
      ],
      potentialPitfalls: [
        'Lupa menangani race condition saat multiple API request dikirim bersamaan dengan token expired.',
        'Tidak mencocokkan status verifikasi email/approval admin sebelum memberikan hak akses penuh.'
      ],
      suggestedNewSubtasks: [
        'Validasi format input email & kekuatan password di frontend & backend',
        'Uji coba skenario login token expired dan auto-logout',
        'Pengetesan hak akses role Super Admin vs Member Standar'
      ]
    };
  }

  if (text.includes('database') || text.includes('api') || text.includes('backend') || text.includes('server') || text.includes('endpoint')) {
    return {
      id: `advice-${Date.now()}`,
      taskId: task.id,
      summaryDiagnosis: 'Pembangunan API & Database membutuhkan arsitektur skema data yang efisien, indeks query optimal, dan penanganan exception terstruktur.',
      actionSteps: [
        'Rancang struktur payload request/response dengan validasi tipe data yang ketat.',
        'Tambahkan pagination dan filter query agar beban baca database tetap hemat & cepat.',
        'Gunakan blok Try-Catch terpusat dengan return status code HTTP yang standar (200, 400, 401, 404, 500).',
        'Lakukan pengujian endpoint menggunakan Postman / Automated Integration Tests.'
      ],
      technicalTips: [
        'Manfaatkan composite index di Firestore untuk query multidimensi.',
        'Gunakan asynchronous async/await untuk operasi I/O database.'
      ],
      potentialPitfalls: [
        'Query N+1 problem yang membebani kuota pembacaan database.',
        'Payload respon terlalu besar tanpa kompresi gzip.'
      ],
      suggestedNewSubtasks: [
        'Pembuatan skema validasi request schema',
        'Setup Firestore composite indexes',
        'Integration testing respon endpoint'
      ]
    };
  }

  if (text.includes('ui') || text.includes('frontend') || text.includes('desain') || text.includes('layout') || text.includes('mobile') || text.includes('responsif')) {
    return {
      id: `advice-${Date.now()}`,
      taskId: task.id,
      summaryDiagnosis: 'Pekerjaan Frontend UI menuntut konsistensi visual, adaptabilitas berbagai ukuran layar (Mobile / Desktop), serta interaksi pengguna yang intuitif.',
      actionSteps: [
        'Gunakan utility CSS Tailwind yang konsisten dengan palet warna tema (Dark/Light mode).',
        'Uji responsivitas pada viewport 360px (Mobile) hingga 1920px (Desktop Ultrawide).',
        'Sediakan indikator loading skeleton atau spinner saat data sedang diambil dari server.',
        'Pastikan elemen tombol dan input form memiliki area sentuh (touch target) minimal 44x44px di HP.'
      ],
      technicalTips: [
        'Gunakan flex-wrap dan overflow-x-auto untuk tabel dan tab navigasi panjang di HP.',
        'Manfaatkan Lucide React Icons untuk memperjelas aksi pengguna.'
      ],
      potentialPitfalls: [
        'Elemen fixed width (misal w-96) yang menyebabkan horizontal overflow/rusak di layar kecil.',
        'Kontras warna teks terlalu redup sehingga sulit dibaca di bawah sinar matahari.'
      ],
      suggestedNewSubtasks: [
        'Uji responsivitas di mode mobile device toolbar',
        'Pengecekan kontras warna tema terang dan gelap',
        'Validasi interaksi sentuh dan transisi animasi'
      ]
    };
  }

  // General Operations / Management Advice
  return {
    id: `advice-${Date.now()}`,
    taskId: task.id,
    summaryDiagnosis: 'Inisiatif operasional ini memerlukan koordinasi terpadu antar penanggung jawab, checklist SOP yang ketat, dan dokumentasi berkas yang transparan.',
    actionSteps: [
      'Identifikasi stakeholder utama dan buat matriks tanggung jawab (RACI).',
      'Susun timeline harian dengan batasan waktu yang terukur (Timeboxing).',
      'Lakukan sinkronisasi harian singkat (Daily Standup) untuk memantau kemajuan sub-tugas.',
      'Dokumentasikan seluruh kesepakatan dan hasil akhir dalam bentuk laporan resmi.'
    ],
    technicalTips: [
      'Gunakan fitur AI Task Breakdown jika ada sub-pekerjaan baru yang perlu didelegasikan.',
      'Cantumkan lampiran dokumen atau bukti kerja pada tiket tugas.'
    ],
    potentialPitfalls: [
      'Kurang komunikasi antar tim yang menyebabkan duplikasi pekerjaan.',
      'Tidak menetapkan kriteria penerimaan hasil kerja (Acceptance Criteria) yang jelas sejak awal.'
    ],
    suggestedNewSubtasks: [
      'Koordinasi awal dengan PIC terkait',
      'Verifikasi kepatuhan checklist SOP',
      'Penyusunan laporan penyelesaian akhir'
    ]
  };
}

// 1. Generalized AI Task Breakdown Generator
export function generateAITaskBreakdown(
  prompt: string, 
  users: User[], 
  domainFilter?: string
): GeneratedBreakdown {
  const p = prompt.toLowerCase();

  // 1. OPERASIONAL & EKSPANSI BISNIS
  if (
    domainFilter === 'operations' ||
    p.includes('cabang') || 
    p.includes('operasional') || 
    p.includes('gudang') || 
    p.includes('sop') || 
    p.includes('logistik') || 
    p.includes('rantai pasok') || 
    p.includes('kantor baru')
  ) {
    return {
      title: p.includes('cabang') ? 'Ekspansi Pembukaan Kantor Cabang Baru & Operasional Lapangan' : `Standardisasi & Eksekusi Operasional: ${prompt}`,
      description: 'Perencanaan menyeluruh pembukaan unit operasional baru, mencakup perizinan legalitas lokasi, pengadaan fasilitas & inventaris, standardisasi SOP harian, dan penyelarasan rantai pasok.',
      domain: 'operations',
      priority: 'high',
      tags: ['Operations', 'SOP', 'Logistics', 'Expansion', 'Facilities'],
      subtasks: [
        { title: 'Survei kelayakan lokasi, negosiasi sewa tempat & izin domisili usaha', completed: false, category: 'Legal' },
        { title: 'Pengadaan perlengkapan kantor, instalasi jaringan, & inventaris awal', completed: false, category: 'Logistics' },
        { title: 'Penyusunan & sosialisasi Standar Operasional Prosedur (SOP) cabang', completed: false, category: 'Operations' },
        { title: 'Alokasi anggaran operasional awal (OPEX) dan petty cash sistem', completed: false, category: 'Finance' },
        { title: 'Uji coba operasional (dry run) dan checklist kesiapan pembukaan', completed: false, category: 'Operations' },
      ],
      recommendedAssigneeId: getBestAssigneeForRole('Operations', users),
      rationale: 'Tugas ini menuntut koordinasi operasional fisik, vendor logistik, dan kepatuhan perizinan.',
    };
  }

  // 2. MARKETING, BRANDING & KAMPANYE
  if (
    domainFilter === 'marketing' ||
    p.includes('marketing') || 
    p.includes('kampanye') || 
    p.includes('iklan') || 
    p.includes('brand') || 
    p.includes('launching') || 
    p.includes('promo') ||
    p.includes('sosial media')
  ) {
    return {
      title: `Kampanye Peluncuran & Strategi Pemasaran: ${prompt}`,
      description: 'Eksekusi kampanye multi-channel terpadu untuk meningkatkan brand awareness, konversi pengguna baru, dan aktivasi media digital.',
      domain: 'marketing',
      priority: 'high',
      tags: ['Marketing', 'Brand', 'Campaign', 'GTM', 'Social Media'],
      subtasks: [
        { title: 'Penyusunan konsep kreatif, copywriting utama, dan visual guideline', completed: false, category: 'Design' },
        { title: 'Produksi aset grafis, video promosi pendek, dan materi iklan', completed: false, category: 'Design' },
        { title: 'Setup target audience digital ads (Google Ads, Meta, TikTok)', completed: false, category: 'Marketing' },
        { title: 'Kerjasama influencer, outreach media pers, & rilis berita pers', completed: false, category: 'Marketing' },
        { title: 'Monitoring metrik konversi (CTR, CPA) & optimasi pengeluaran iklan', completed: false, category: 'Finance' },
      ],
      recommendedAssigneeId: getBestAssigneeForRole('Marketing', users),
      rationale: 'Kebutuhan branding visual dan strategi akuisisi user cocok dengan tim Marketing & Design.',
    };
  }

  // 3. HR, REKRUTMEN & SDM
  if (
    domainFilter === 'hr' ||
    p.includes('hr') || 
    p.includes('rekrutmen') || 
    p.includes('karyawan') || 
    p.includes('onboarding') || 
    p.includes('training') ||
    p.includes('pelatihan')
  ) {
    return {
      title: `Inisiatif Rekrutmen & Pengembangan SDM: ${prompt}`,
      description: 'Program perekrutan terstruktur, penyaringan talenta terbaik, pelatihan kompetensi dasar, dan standarisasi onboarding karyawan baru.',
      domain: 'hr',
      priority: 'medium',
      tags: ['HR', 'Recruitment', 'People Ops', 'Training', 'Onboarding'],
      subtasks: [
        { title: 'Penyusunan Job Description, kualifikasi, & approval batas budget gaji', completed: false, category: 'HR' },
        { title: 'Publikasi lowongan kerja di portal karir & sourcing kandidat aktif', completed: false, category: 'HR' },
        { title: 'Proses wawancara HR, tes kompetensi teknis, & background check', completed: false, category: 'HR' },
        { title: 'Penerbitan surat penawaran kerja (Offering Letter) & tanda tangan kontrak', completed: false, category: 'Legal' },
        { title: 'Penyelenggaraan orientasi hari pertama & penyerahan aset kerja', completed: false, category: 'Operations' },
      ],
      recommendedAssigneeId: getBestAssigneeForRole('Human Resources', users),
      rationale: 'Fokus pada pengembangan talenta organisasi dan kepatuhan ketenagakerjaan.',
    };
  }

  // 4. IT, REKAYASA PERANGKAT LUNAK & SISTEM
  if (
    domainFilter === 'technology' ||
    p.includes('fitur') || 
    p.includes('api') || 
    p.includes('database') || 
    p.includes('backend') || 
    p.includes('frontend') || 
    p.includes('bug') || 
    p.includes('auth') || 
    p.includes('aplikasi') || 
    p.includes('web') ||
    p.includes('server')
  ) {
    return {
      title: `Implementasi Teknis & Rekayasa Software: ${prompt}`,
      description: 'Perancangan arsitektur sistem, implementasi antarmuka pengguna interaktif, pembangunan API backend yang aman, dan pengujian kualitas komprehensif.',
      domain: 'technology',
      priority: 'urgent',
      tags: ['Technology', 'Engineering', 'Frontend', 'Backend', 'QA'],
      subtasks: [
        { title: 'Rancang UI/UX wireframe komponen dan interaksi alur pengguna', completed: false, category: 'Design' },
        { title: 'Implementasi antarmuka frontend responsif & state management', completed: false, category: 'Frontend' },
        { title: 'Pembangunan skema database, API endpoints, dan validasi data', completed: false, category: 'Backend' },
        { title: 'Pengujian fungsionalitas menyeluruh (Unit & Integration Testing)', completed: false, category: 'QA' },
        { title: 'Deployment ke environment staging & verifikasi performa sistem', completed: false, category: 'Backend' },
      ],
      recommendedAssigneeId: getBestAssigneeForRole('Technology', users),
      rationale: 'Memerlukan keahlian teknis pemrograman, arsitektur data, dan pengujian software.',
    };
  }

  // Default Inisiatif Umum
  return {
    title: prompt.charAt(0).toUpperCase() + prompt.slice(1),
    description: `Penyusunan rencana kerja operasional dan eksekusi komprehensif untuk inisiatif "${prompt}" yang mencakup fase inisiasi, koordinasi lintas divisi, alokasi sumber daya, dan evaluasi hasil.`,
    domain: 'general',
    priority: 'medium',
    tags: ['Initiative', 'Operations', 'Execution', 'General'],
    subtasks: [
      { title: `Perencanaan ruang lingkup, KPI target keberhasilan, & timeline kerja`, completed: false, category: 'Operations' },
      { title: `Koordinasi sumber daya, vendor pendukung, & perlengkapan kerja`, completed: false, category: 'Logistics' },
      { title: `Eksekusi tahapan utama inisiatif dan sinkronisasi berkala tim`, completed: false, category: 'Operations' },
      { title: `Pengawasan anggaran, legalitas, & kepatuhan standar kualitas`, completed: false, category: 'Finance' },
      { title: `Evaluasi pencapaian hasil akhir dan dokumentasi laporan pertanggungjawaban`, completed: false, category: 'General' },
    ],
    recommendedAssigneeId: users[0]?.id || 'user-admin',
    rationale: 'Didelegasikan ke pimpinan proyek untuk mengorkestrasi eksekusi lintas bidang.',
  };
}

export function getBestAssigneeForRole(targetRoleKeyword: string, users: User[]): string {
  const matches = users.filter(u => 
    u.role.toLowerCase().includes(targetRoleKeyword.toLowerCase()) ||
    u.department.toLowerCase().includes(targetRoleKeyword.toLowerCase())
  );

  if (matches.length > 0) {
    matches.sort((a, b) => (a.allocatedHours / Math.max(1, a.capacityHours)) - (b.allocatedHours / Math.max(1, b.capacityHours)));
    return matches[0].id;
  }
  const sorted = [...users].sort((a, b) => (a.allocatedHours / Math.max(1, b.capacityHours)) - (b.allocatedHours / Math.max(1, b.capacityHours)));
  return sorted[0]?.id || 'user-admin';
}

export function calculateUserWorkloads(users: User[], tasks: Task[]): User[] {
  return users.map(user => {
    const activeTasks = tasks.filter(t => t.status !== 'done' && (t.assigneeIds || []).includes(user.id));
    const totalHours = activeTasks.length * 8;

    return {
      ...user,
      allocatedHours: totalHours,
    };
  });
}

export interface ProjectRiskSummary {
  overallScore: number;
  status: 'healthy' | 'warning' | 'critical';
  atRiskTasksCount: number;
  overloadedMembersCount: number;
  totalDelayPredictedDays: number;
  keyInsights: string[];
  recommendations: {
    taskId: string;
    taskTitle: string;
    riskScore: number;
    reason: string;
    suggestion: string;
    actionType: string;
    targetAssigneeId?: string;
    suggestedBufferDays?: number;
    predictedDelayDays?: number;
    isOverdue?: boolean;
    overdueDays?: number;
  }[];
}

export function analyzeProjectRisks(tasks: Task[], users: User[]): ProjectRiskSummary {
  const activeTasks = tasks.filter(t => t.status !== 'done');
  const userMap = new Map(users.map(u => [u.id, u]));
  
  const recommendations: ProjectRiskSummary['recommendations'] = [];
  let totalDelayDays = 0;
  let highRiskCount = 0;

  activeTasks.forEach(task => {
    let score = task.aiRisk?.riskScore || 0;
    let reason = task.aiRisk?.reason || '';
    let suggestion = task.aiRisk?.mitigationSuggestion || '';
    let delay = task.aiRisk?.predictedDelayDays || 0;

    // --- Overdue detection: detect tasks already past their dueDate ---
    let overdueDays = 0;
    let isOverdue = false;
    if (task.dueDate) {
      const today = new Date();
      const due = new Date(task.dueDate);
      if (due < today) {
        const msPerDay = 24 * 60 * 60 * 1000;
        overdueDays = Math.ceil((today.getTime() - due.getTime()) / msPerDay);
        if (overdueDays > 0) {
          isOverdue = true;
          delay = overdueDays;
          score = Math.max(score, 70);
          reason = `Tugas sudah melewati tenggat ${overdueDays} hari yang lalu.`;
          suggestion = `Segera pecahkan tugas ini menjadi sub-tugas yang lebih kecil dan realokasikan ke anggota tim dengan kapasitas tersedia.`;
        }
      }
    }

    if (!task.aiRisk && !isOverdue) {
      const primaryAssignee = userMap.get((task.assigneeIds || [])[0]);
      const isOverloaded = primaryAssignee && (primaryAssignee.allocatedHours > primaryAssignee.capacityHours);
      const isUrgent = task.priority === 'urgent';
      const isHigh = task.priority === 'high';

      if (isOverloaded && (isUrgent || isHigh)) {
        score = 80;
        reason = `Beban kerja ${primaryAssignee.name} mencapai ${primaryAssignee.allocatedHours}/${primaryAssignee.capacityHours} jam. Tenggat mendekati batas akhir.`;
        suggestion = 'Alihkan sebagian sub-tugas ke anggota tim dengan kapasitas lebih longgar atau tambah buffer.';
        delay = 3;
      } else if (isOverloaded) {
        score = 55;
        reason = `${primaryAssignee.name} memiliki kapasitas padat minggu ini.`;
        suggestion = 'Pantau perkembangan harian.';
        delay = 1;
      } else {
        score = 20;
        reason = 'Alokasi waktu dan kecepatan kerja dalam batas aman.';
        suggestion = 'Pertahankan jadwal saat ini.';
        delay = 0;
      }
    }

    if (score >= 60) {
      highRiskCount++;
      totalDelayDays += delay;
      recommendations.push({
        taskId: task.id,
        taskTitle: task.title,
        riskScore: score,
        reason: reason || 'Terdeteksi potensi keterlambatan pada tugas ini.',
        suggestion: suggestion || 'Pertimbangkan untuk menambah buffer waktu.',
        actionType: task.aiRisk?.actionType || 'extend_buffer',
        targetAssigneeId: task.aiRisk?.suggestedAssigneeId || users.find(u => u.allocatedHours < u.capacityHours)?.id,
        suggestedBufferDays: task.aiRisk?.suggestedBufferDays || 3,
        predictedDelayDays: delay,
        isOverdue: isOverdue,
        overdueDays: isOverdue ? overdueDays : 0,
      });
    }
  });

  const overloadedCount = users.filter(u => u.allocatedHours > u.capacityHours).length;
  
  let overallScore = 90;
  if (highRiskCount > 0) overallScore -= highRiskCount * 15;
  if (overloadedCount > 0) overallScore -= overloadedCount * 10;
  overallScore = Math.max(20, Math.min(100, overallScore));

  let status: ProjectRiskSummary['status'] = 'healthy';
  if (overallScore < 60) status = 'critical';
  else if (overallScore < 80) status = 'warning';

  return {
    overallScore,
    status,
    atRiskTasksCount: highRiskCount,
    overloadedMembersCount: overloadedCount,
    totalDelayPredictedDays: totalDelayDays,
    keyInsights: [
      `${highRiskCount} tugas membutuhkan perhatian manajerial segera.`,
      `${overloadedCount} anggota tim berada di atas batas kapasitas maksimal (100%).`,
      `Prediksi model akurasi menunjukkan potensi penghematan waktu hingga ${totalDelayDays * 8} jam dengan redistribusi.`,
    ],
    recommendations,
  };
}

export function generateExecutiveSummary(tasks: Task[], users: User[]): ExecutiveSummary {
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const riskInfo = analyzeProjectRisks(tasks, users);
  
  let health: ExecutiveSummary['overallHealth'] = 'On Track';
  if (riskInfo.status === 'critical') health = 'Delayed';
  else if (riskInfo.status === 'warning') health = 'At Risk';

  const highlights = [
    `Penyelesaian tugas mencapai ${doneTasks} dari total ${totalTasks} tiket (${completionRate}% selesai).`,
    `${inProgressTasks} tiket inisiatif utama saat ini sedang dalam proses eksekusi aktif.`,
    `Seluruh modul operasional dan sinkronisasi cloud real-time beroperasi stabil.`,
  ];

  const bottlenecks = riskInfo.recommendations.map(r => `${r.taskTitle}: ${r.reason}`);
  if (bottlenecks.length === 0) {
    bottlenecks.push('Tidak ditemukan bottleneck kritis pada periode saat ini.');
  }

  const recommendations = [
    'Pastikan review sub-tugas sebelum memindahkan tiket ke status Done.',
    'Redistribusikan tugas dari anggota yang overload (>40 jam) ke rekan tim lain.',
    'Gunakan tombol AI Task Breakdown untuk mempercepat pemecahan inisiatif baru.',
  ];

  const briefOverview = `Proyek berada dalam status **${health}** (${completionRate}% selesai). Seluruh inisiatif operasional dan teknis telah berjalan sesuai rencana. Tim saat ini sedang memfokuskan mitigasi beban kerja agar target pencapaian tetap sesuai jadwal.`;

  return {
    id: `summary-${Date.now()}`,
    projectId: 'proj-1',
    dateRange: 'Periode Berjalan (Agustus 2026)',
    generatedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    headline: `Laporan Eksekutif Status Proyek (${completionRate}% Selesai)`,
    overallHealth: health,
    completionRate,
    keyHighlights: highlights,
    bottlenecksAndRisks: bottlenecks,
    recommendationsForAlex: recommendations,
    stakeholderBriefForBudi: briefOverview,
  };
}

// 6. Intelligent Copilot Conversational Engine with Rich Natural Language Matching
export function queryProjectCopilot(query: string, tasks: Task[], users: User[]): CopilotMessage {
  const clean = query.toLowerCase().trim();
  const userMap = new Map(users.map(u => [u.id, u]));

  // 1. Admin & Backend Questions
  if (clean.includes('admin') || clean.includes('super admin') || clean.includes('spa admin') || clean.includes('sopo admin') || clean.includes('siapa admin')) {
    return {
      id: `copilot-${Date.now()}`,
      sender: 'assistant',
      content: `**Super Administrator Aplikasi:**\n\nNama Admin utama ProMan adalah **Radik Dwiyoga** (*Lead System & Technical Architect*).\n\nSuper Admin bertanggung jawab atas pengelolaan hak akses, verifikasi pendaftaran akun baru, konfigurasi sistem perusahaan, dan keamanan database.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: ['Buka Admin Settings', 'Siapa yang bertanggung jawab atas server backend?', 'Berapa jam kerja kantor?'],
      actionLink: {
        type: 'open_settings',
        payload: 'admin-settings',
        label: 'Buka Admin Settings',
      }
    };
  }

  if (clean.includes('backend') || clean.includes('server') || clean.includes('database') || clean.includes('api') || clean.includes('megang server')) {
    return {
      id: `copilot-${Date.now()}`,
      sender: 'assistant',
      content: `**Penanggung Jawab Server & Backend:**\n\nModul Server, Database Cloud Firestore, API Integrasi, dan Arsitektur Backend dipegang langsung oleh **Radik Dwiyoga** (*Super Administrator & Systems Engineer*).`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: ['Tugas Radik Dwiyoga', 'Siapa admin aplikasi?', 'Apa tugas paling mendesak?'],
    };
  }

  // 2. Office Hours / Jam Kerja
  if (clean.includes('jam masuk') || clean.includes('jam pulang') || clean.includes('jam kantor') || clean.includes('jam kerja') || clean.includes('jam krja') || clean.includes('kpn masuk') || clean.includes('office hour')) {
    return {
      id: `copilot-${Date.now()}`,
      sender: 'assistant',
      content: `**Jadwal Jam Kerja Kantor (Office Hours):**\n\n• **Jam Masuk:** Pukul \`08.00 WIB\` (Pagi)\n• **Jam Pulang:** Pukul \`17.00 WIB\` (Sore)\n• **Hari Kerja:** Senin s/d Jumat\n• **Batas Beban Normal:** Maksimal \`40 Jam/Minggu\` per anggota tim.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: ['Lihat kapasitas tim', 'Siapa yang overload?', 'Apa tugas saya?'],
      actionLink: {
        type: 'open_workload',
        payload: 'workload-view',
        label: 'Lihat Beban Kerja Tim',
      }
    };
  }

  // 3. Download Laporan / Auto-Summary Questions
  if (clean.includes('download') || clean.includes('unduh') || clean.includes('donlod') || clean.includes('pdf') || clean.includes('laporan') || clean.includes('summary') || clean.includes('ekspor')) {
    return {
      id: `copilot-${Date.now()}`,
      sender: 'assistant',
      content: `**Cara Mengunduh Laporan Status Proyek (Summary):**\n\n1. Buka menu **Auto-Status Summary** (bisa melalui navbar atau sidebar kiri).\n2. Pilih cakupan proyek (*Semua Project* atau *Project Tertentu*).\n3. Klik tombol **"Download PDF"** untuk cetak/simpan PDF resmi, atau **"Unduh Text (.txt)"** untuk berkas catatan ringkas.\n4. Anda juga bisa menekan tombol **"Salin Laporan"** untuk langsung mengirimkannya ke grup WhatsApp / Email.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: ['Buka Modal Ringkasan Status', 'Apa tugas paling mendesak?', 'Siapa yang overload?'],
      actionLink: {
        type: 'filter_status',
        payload: 'status-summary',
        label: 'Buka Ringkasan Status Eksekutif',
      }
    };
  }

  // 4. Invite / Pendaftaran User Baru
  if (clean.includes('daftar') || clean.includes('signup') || clean.includes('sign up') || clean.includes('undang') || clean.includes('tambah user') || clean.includes('user baru') || clean.includes('pending') || clean.includes('verifikasi')) {
    return {
      id: `copilot-${Date.now()}`,
      sender: 'assistant',
      content: `**Panduan Pendaftaran & Verifikasi Akun Baru:**\n\n1. **Pendaftaran Mandiri:** Karyawan dapat mendaftar langsung di halaman login via tab **"Daftar (Sign Up)"** dengan email perusahaan & password.\n2. **Status Menunggu (Pending):** Demi keamanan enterprise, akun baru berstatus *Menunggu Verifikasi* dan belum bisa login sebelum disetujui.\n3. **Verifikasi Admin:** Super Admin masuk ke menu **Admin Settings > Manajemen Pengguna & Password**, lalu klik tombol hijau **"Setujui"** pada antrean pendaftar baru.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: ['Buka Admin Settings', 'Siapa admin aplikasi?', 'Berapa jam kerja kantor?'],
      actionLink: {
        type: 'open_settings',
        payload: 'admin-settings',
        label: 'Buka Manajemen Pengguna',
      }
    };
  }

  // 5. Manajemen Project Questions (Kelola, Edit, Hapus)
  if (clean.includes('proyek') || clean.includes('project') || clean.includes('hapus project') || clean.includes('edit project') || clean.includes('tambah project') || clean.includes('bikin project')) {
    return {
      id: `copilot-${Date.now()}`,
      sender: 'assistant',
      content: `**Manajemen Project ProMan:**\n\n• **Penanggung Jawab:** Tim Project Management (PM).\n• **Cara Bikin Project Baru:** Buka menu **Daftar & Hub Project** di sidebar -> klik tombol **"+ Tambah Project Baru"**.\n• **Cara Edit/Hapus:** Pada kartu proyek di halaman *Daftar & Hub Project*, klik ikon **Pensil (Edit)** atau **Tempat Sampah (Hapus)**.\n• **Cakupan Global:** Pilih *"Semua Project (Global Board)"* pada dropdown navbar untuk memantau seluruh divisi sekaligus.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: ['Buka Daftar & Hub Project', 'Apa tugas paling mendesak?', 'Bantu pecah tugas dengan AI'],
      actionLink: {
        type: 'open_projects',
        payload: 'project-management',
        label: 'Buka Halaman Manajemen Project',
      }
    };
  }

  // 6. User Tasks Check (Formal & Slang)
  const targetUser = users.find(u => {
    const firstName = u.name.split(' ')[0].toLowerCase();
    const fullName = u.name.toLowerCase();
    return clean.includes(firstName) || clean.includes(fullName) || clean.includes(u.email.toLowerCase().split('@')[0]);
  });

  if (targetUser || clean.includes('tugas gw') || clean.includes('tugas gue') || clean.includes('tugas gua') || clean.includes('tugas saya') || clean.includes('task gw')) {
    const matchedUser = targetUser || users[0];
    const userTasks = tasks.filter(t => (t.assigneeIds || []).includes(matchedUser.id));
    const activeTasks = userTasks.filter(t => t.status !== 'done');
    const doneTasks = userTasks.filter(t => t.status === 'done');

    const taskListText = activeTasks.map((t, idx) => {
      const subtaskCount = (t.subtasks || []).length;
      const completedSubtaskCount = (t.subtasks || []).filter(s => s.completed).length;
      return `${idx + 1}. **${t.title}**\n   - Status: \`${t.status.toUpperCase()}\` | Prioritas: \`${t.priority.toUpperCase()}\`\n   - Tenggat: ${t.dueDate}\n   - Progress Sub-tugas: ${completedSubtaskCount}/${subtaskCount} Selesai`;
    }).join('\n\n');

    return {
      id: `copilot-${Date.now()}`,
      sender: 'assistant',
      content: `Daftar tugas untuk **${matchedUser.name}** (${matchedUser.role} - *${matchedUser.department}*):\n\n${taskListText || '- Semua tugas telah selesai (0 tugas aktif).'}\n\n**Beban Kerja:** ${matchedUser.allocatedHours}/${matchedUser.capacityHours} jam (${Math.round((matchedUser.allocatedHours / Math.max(1, matchedUser.capacityHours)) * 100)}% load).`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: ['Siapa yang mengalami overload?', 'Tampilkan tugas berisiko', 'Buatkan ringkasan status eksekutif'],
      relatedTaskIds: userTasks.map(t => t.id),
      actionLink: {
        type: 'open_workload',
        payload: 'workload-view',
        label: 'Buka Alokasi Sumber Daya',
      }
    };
  }

  // 7. Urgent / Deadline Queries
  if (clean.includes('mendesak') || clean.includes('urgent') || clean.includes('tertunda') || clean.includes('prioritas') || clean.includes('deadline') || clean.includes('mepet')) {
    const urgentTasks = tasks.filter(t => (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'done');
    const taskTitles = urgentTasks.map((t, idx) => `• **${t.title}**\n  - PIC: ${(t.assigneeIds || []).map(id => userMap.get(id)?.name || id).join(', ')}\n  - Status: \`${t.status.toUpperCase()}\` | Due: ${t.dueDate}`).join('\n\n');

    return {
      id: `copilot-${Date.now()}`,
      sender: 'assistant',
      content: `Ditemukan **${urgentTasks.length} tugas berprioritas mendesak / tinggi** yang sedang aktif:\n\n${taskTitles}\n\n*Rekomendasi AI:* Periksa dashboard prediksi risiko untuk mencegah keterlambatan penyelesaian sprint.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: ['Buka Dashboard Risiko', 'Siapa yang mengalami overload?', 'Tampilkan ringkasan status eksekutif'],
      relatedTaskIds: urgentTasks.map(t => t.id),
      actionLink: {
        type: 'open_risk',
        payload: 'risk-dashboard',
        label: 'Buka Dashboard Risiko',
      }
    };
  }

  // 8. Overload / Capacity Queries
  if (clean.includes('overload') || clean.includes('beban') || clean.includes('kapasitas') || clean.includes('burnout') || clean.includes('sibuk')) {
    const overloaded = users.filter(u => u.allocatedHours > u.capacityHours);
    const details = overloaded.map(u => `• **${u.name}** (${u.role}): **${u.allocatedHours} jam** / ${u.capacityHours} jam (**${Math.round((u.allocatedHours / u.capacityHours) * 100)}% load**)`).join('\n');

    return {
      id: `copilot-${Date.now()}`,
      sender: 'assistant',
      content: overloaded.length > 0 
        ? `**Peringatan Kelebihan Beban Kerja (Overload >100%):**\n\n${details}\n\n*Saran AI:* Alihkan sebagian sub-tugas ke rekan tim yang masih memiliki jam luang (<40 jam).`
        : `**Kapasitas Seimbang:** Beban kerja seluruh anggota tim saat ini berada dalam batas normal (<100%).`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: ['Buka Alokasi Sumber Daya', 'Apa tugas paling mendesak?', 'Buat ringkasan status'],
      actionLink: {
        type: 'open_workload',
        payload: 'workload-view',
        label: 'Lihat Alokasi Tim',
      }
    };
  }

  // 9. Password Management (Ubah / Reset / Lupa Password)
  if (clean.includes('password') || clean.includes('sandi') || clean.includes('lupa pass') || clean.includes('reset pass')) {
    if (clean.includes('lupa') || clean.includes('reset')) {
      return {
        id: `copilot-${Date.now()}`,
        sender: 'assistant',
        content: `**Cara Reset Password (Jika Lupa):**\n\n1. Di halaman login, klik tautan **"Lupa Password"**.\n2. Masukkan alamat email perusahaan yang terdaftar.\n3. Ikuti instruksi tautan pemulihan yang dikirimkan ke email Anda untuk membuat password baru.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: ['Bagaimana cara mengubah password saat login?', 'Siapa admin aplikasi?']
      };
    }
    return {
      id: `copilot-${Date.now()}`,
      sender: 'assistant',
      content: `**Cara Mengubah Password Akun:**\n\n1. Klik foto profil Anda di pojok kanan atas navbar.\n2. Pilih menu **"Pengaturan Akun"**.\n3. Masukkan password lama Anda, lalu ketikkan password baru yang diinginkan.\n4. Klik tombol **"Simpan Perubahan"** untuk mengonfirmasi.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: ['Bagaimana cara logout dari ProMan?', 'Bagaimana cara mengaktifkan mode gelap?']
    };
  }

  // 10. Login & Logout
  if (clean.includes('logout') || clean.includes('keluar') || clean.includes('sign out')) {
    return {
      id: `copilot-${Date.now()}`,
      sender: 'assistant',
      content: `**Cara Logout dari ProMan:**\n\n1. Klik foto profil Anda di pojok kanan atas navbar.\n2. Pilih opsi **"Keluar"** (Logout) pada menu dropdown yang muncul.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: ['Bagaimana cara login ke ProMan?', 'Siapa admin aplikasi?']
    };
  }

  if (clean.includes('login') || clean.includes('masuk ke proman') || clean.includes('cara masuk')) {
    return {
      id: `copilot-${Date.now()}`,
      sender: 'assistant',
      content: `**Cara Login ke ProMan:**\n\n1. Buka halaman utama aplikasi ProMan.\n2. Masukkan email dan password akun Anda yang sudah terverifikasi.\n3. Klik tombol **"Masuk"**.\n*(Jika belum memiliki akun, gunakan tab "Daftar" dan tunggu verifikasi admin).*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: ['Apa yang harus dilakukan jika lupa password?', 'Siapa admin aplikasi?']
    };
  }

  // 11. Dark Mode / Tema & Bahasa
  if (clean.includes('gelap') || clean.includes('dark') || clean.includes('tema')) {
    return {
      id: `copilot-${Date.now()}`,
      sender: 'assistant',
      content: `**Cara Mengaktifkan Mode Gelap (Dark Mode):**\n\n1. Klik foto profil Anda di pojok kanan atas navbar.\n2. Pilih **"Pengaturan Akun"**.\n3. Aktifkan toggle **"Mode Gelap"** untuk menyesuaikan tema antarmuka yang nyaman di mata.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: ['Bagaimana cara mengubah bahasa?', 'Apa saja fitur utama ProMan?']
    };
  }

  if (clean.includes('bahasa') || clean.includes('language')) {
    return {
      id: `copilot-${Date.now()}`,
      sender: 'assistant',
      content: `**Cara Mengubah Bahasa Aplikasi:**\n\n1. Klik foto profil Anda di pojok kanan atas navbar.\n2. Pilih **"Pengaturan Akun"**.\n3. Pada kolom **"Bahasa Aplikasi"**, pilih bahasa yang diinginkan (Bahasa Indonesia / English).\n4. Klik **"Simpan Perubahan"**.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: ['Bagaimana cara mengaktifkan mode gelap?', 'Apa itu ProMan?']
    };
  }

  // 12. Dokumentasi & Pusat Bantuan
  if (clean.includes('dokumentasi') || clean.includes('bantuan') || clean.includes('docs') || clean.includes('panduan')) {
    return {
      id: `copilot-${Date.now()}`,
      sender: 'assistant',
      content: `**Dokumentasi & Pusat Bantuan ProMan:**\n\n1. Klik foto profil Anda di pojok kanan atas navbar.\n2. Pilih **"Pusat Bantuan"** atau **"Documentation"** untuk melihat panduan lengkap sistem, tutorial Kanban, integrasi API, dan panduan operasional.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: ['Apa itu ProMan?', 'Bagaimana cara menggunakan AI Task Breakdown?']
    };
  }

  // 13. Definisi & Pengenalan ProMan
  if (clean.includes('apa itu proman') || clean.includes('tentang proman') || clean.includes('fungsi proman') || clean.includes('aplikasi apa')) {
    return {
      id: `copilot-${Date.now()}`,
      sender: 'assistant',
      content: `**Tentang Aplikasi ProMan:**\n\n**ProMan** adalah platform manajemen proyek enterprise modern yang dirancang khusus untuk mengoptimalkan alur kerja operasional tim. Dilengkapi papan Kanban interaktif, visualisasi Timeline/Gantt, dashboard prediksi risiko, pemantauan kapasitas beban kerja, serta asisten cerdas AI Copilot terintegrasi.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: ['Apa bedanya Admin dan Member?', 'Apa saja fitur utama ProMan?', 'Siapa admin aplikasi?']
    };
  }

  // 14. Hak Akses & Peran (Admin vs Member)
  if (clean.includes('hak akses') || clean.includes('beda admin') || clean.includes('perbedaan admin') || clean.includes('role') || clean.includes('member')) {
    return {
      id: `copilot-${Date.now()}`,
      sender: 'assistant',
      content: `**Perbedaan Hak Akses (Role) di ProMan:**\n\n• **Admin / Super Admin:** Memiliki akses penuh ke seluruh proyek, manajemen anggota & role, verifikasi pendaftaran akun, konfigurasi AI & privasi, serta pengaturan sistem global.\n• **Member / Tim Pelaksana:** Memiliki akses untuk melihat dan memperbarui status tiket tugas yang di-assign, menambahkan komentar/lampiran, dan memantau progres sprint proyek terkait.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: ['Bagaimana cara menambahkan pengguna baru?', 'Bagaimana cara mengedit role pengguna?']
    };
  }

  // 15. Manajemen Pengguna (Lihat User, Edit Role)
  if (clean.includes('semua pengguna') || clean.includes('daftar pengguna') || clean.includes('list user') || clean.includes('daftar tim') || clean.includes('edit role')) {
    return {
      id: `copilot-${Date.now()}`,
      sender: 'assistant',
      content: `**Manajemen Tim & Pengguna:**\n\n1. Klik ikon **Pengaturan (Roda Gigi)** di sidebar kiri.\n2. Pilih menu **"Manajemen Tim"**.\n3. Di halaman ini Anda dapat melihat daftar seluruh anggota, mengedit role (klik ikon pensil), atau menyesuaikan kapasitas jam kerja per minggu.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: ['Bagaimana cara menambahkan pengguna baru?', 'Siapa yang overload minggu ini?']
    };
  }

  // 16. Fitur AI (Breakdown & Predictive Risk)
  if (clean.includes('breakdown') || clean.includes('pecah tugas') || clean.includes('ai task')) {
    return {
      id: `copilot-${Date.now()}`,
      sender: 'assistant',
      content: `**Cara Menggunakan AI Task Breakdown:**\n\n1. Buka menu **AI Task Breakdown** di sidebar kiri atau tekan tombol AI pada modal pembuatan tugas.\n2. Masukkan inisiatif/tugas besar yang ingin dipecah (misal: *"Migrasi infrastruktur cloud"*).\n3. Klik **"Generate Tasks"** — AI akan secara otomatis memecahnya menjadi 4–6 sub-tugas terstruktur lengkap dengan estimasi dan penanggung jawab yang sesuai.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: ['Bantu pecah tugas baru dengan AI', 'Apa itu Predictive Risk Dashboard?']
    };
  }

  if (clean.includes('risk') || clean.includes('prediksi risiko') || clean.includes('predictive')) {
    return {
      id: `copilot-${Date.now()}`,
      sender: 'assistant',
      content: `**Predictive Risk & Delay Dashboard:**\n\nFitur ini secara otomatis memantau skor risiko keterlambatan tiket tugas berdasarkan kompleksitas, sisa waktu deadline, dan beban kerja PIC. Sistem memberikan rekomendasi mitigasi taktis (seperti redistribusi sub-tugas atau penambahan buffer waktu) agar sprint tetap on-track.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: ['Tampilkan tugas yang berisiko', 'Siapa yang mengalami overload?']
    };
  }

  // Default Assistant Introduction & Guide
  return {
    id: `copilot-${Date.now()}`,
    sender: 'assistant',
    content: `Saya adalah **ProMan AI Copilot**. Anda dapat bertanya dengan bahasa santai, singkatan, maupun formal:\n\n• **Struktur & Admin:** *"siapa admin aplikasi?"*, *"siapa yang megang backend?"*\n• **Jam Kerja:** *"jam kantor jam berapa?"*, *"masuk jam berapa pulang jam berapa?"*\n• **Cek Tugas Rekan:** *"tugas radik"*, *"tugas sarah"*, *"tugas gw apa aja?"*\n• **Download Laporan:** *"cara download laporan pdf?"*, *"gimana cara donlod summary?"*\n• **Manajemen Proyek:** *"cara bikin project baru?"*, *"cara hapus project?"*\n• **Pendaftaran Karyawan:** *"gimana cara daftar user baru?"*, *"kenapa akun saya pending?"*`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    suggestions: [
      'Siapa admin aplikasi?',
      'Siapa yang bertanggung jawab atas server backend?',
      'Berapa jam kerja kantor?',
      'Bagaimana cara download laporan proyek?',
      'Apa tugas paling mendesak?'
    ]
  };
}
