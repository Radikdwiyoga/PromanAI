import * as XLSX from 'xlsx';
import {
  Task,
  Project,
  User,
  Comment,
  ActivityLog,
  SystemSettings,
  TaskStatus,
  TaskPriority,
} from '../types';

// ============================================================
// ProMan Backup Service — Ekspor Data ke Excel (.xlsx)
// ============================================================

const STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Selesai',
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Rendah',
  medium: 'Sedang',
  high: 'Tinggi',
  urgent: 'Urgent',
};

const PROJECT_STATUS_LABELS: Record<string, string> = {
  active: 'Aktif',
  planning: 'Perencanaan',
  on_hold: 'Ditunda',
  completed: 'Selesai',
};

const RISK_LABELS: Record<string, string> = {
  low: 'Rendah',
  medium: 'Sedang',
  high: 'Tinggi',
  critical: 'Kritis',
};

// ---------------- Helpers ----------------

const pad = (n: number) => String(n).padStart(2, '0');

const fmtDateTime = (value?: string): string => {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const fmtDate = (value?: string): string => {
  if (!value) return '';
  return value.slice(0, 10);
};

const buildUserMap = (users: User[]): Map<string, string> =>
  new Map(users.map(u => [u.id, u.name]));

const buildProjectMap = (projects: Project[]): Map<string, string> =>
  new Map(projects.map(p => [p.id, p.name]));

const listMembers = (ids: string[] | undefined, userMap: Map<string, string>): string =>
  (ids || []).map(id => userMap.get(id) || id).join(', ');

const listAssignees = (task: Task, userMap: Map<string, string>): string =>
  (task.assigneeIds || []).map(id => userMap.get(id) || id).join(', ');

const listTags = (tags: string[] | undefined): string => (tags || []).join(', ');

const subtaskSummary = (task: Task): string => {
  if (!task.subtasks || task.subtasks.length === 0) return 'Tidak ada';
  const done = task.subtasks.filter(st => st.completed).length;
  return `${done}/${task.subtasks.length}`;
};

const subtaskList = (task: Task): string => {
  if (!task.subtasks || task.subtasks.length === 0) return '';
  return task.subtasks
    .map(st => `${st.completed ? '✔' : '✘'} ${st.title}${st.category ? ` [${st.category}]` : ''}`)
    .join('\n');
};

const boolLabel = (value: unknown): string =>
  value === true ? 'Ya' : value === false ? 'Tidak' : '';

const timestampNow = (): string => fmtDateTime(new Date().toISOString());

const stamp = (): string => {
  const d = new Date();
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
};

// Kolom lebar: [{ wch: n }, ...]
const colWidths = (widths: number[]) => widths.map(wch => ({ wch }));

const applyAutoFilter = (ws: XLSX.WorkSheet) => {
  if (ws['!ref']) {
    ws['!autofilter'] = { ref: ws['!ref'] };
  }
};

// ---------------- Sheet Builders ----------------

const buildSummarySheet = (
  data: {
    tasks: Task[];
    projects: Project[];
    users: User[];
    comments: Comment[];
    activityLogs: ActivityLog[];
    systemSettings: Partial<SystemSettings>;
  },
): XLSX.WorkSheet => {
  const { tasks, projects, users, comments, activityLogs, systemSettings } = data;

  const countByStatus = (status: TaskStatus) => tasks.filter(t => t.status === status).length;
  const riskyTasks = tasks.filter(t => t.aiRisk && (t.aiRisk.riskLevel === 'high' || t.aiRisk.riskLevel === 'critical')).length;
  const totalEstimated = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
  const totalLogged = tasks.reduce((sum, t) => sum + (t.loggedHours || 0), 0);

  const rows: (string | number)[][] = [
    ['Field', 'Nilai'],
    ['Nama Aplikasi', 'ProMan AI'],
    ['Organisasi', systemSettings.companyName || ''],
    ['Waktu Backup', timestampNow()],
    [],
    ['Jumlah Proyek', projects.length],
    ['Jumlah Tugas', tasks.length],
    ['Jumlah Pengguna', users.length],
    ['Jumlah Komentar', comments.length],
    ['Jumlah Aktivitas Log', activityLogs.length],
    [],
    ['Tugas - Selesai (done)', countByStatus('done')],
    ['Tugas - Review', countByStatus('review')],
    ['Tugas - In Progress', countByStatus('in_progress')],
    ['Tugas - To Do', countByStatus('todo')],
    ['Tugas - Backlog', countByStatus('backlog')],
    [],
    ['Tugas Berisiko Tinggi/Kritis', riskyTasks],
    ['Total Estimasi Jam', totalEstimated],
    ['Total Jam Tercatat (Logged)', totalLogged],
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = colWidths([34, 18]);
  return ws;
};

const buildTasksSheet = (
  tasks: Task[],
  userMap: Map<string, string>,
  projectMap: Map<string, string>,
): XLSX.WorkSheet => {
  const header = [
    'ID Tugas',
    'Judul',
    'Deskripsi',
    'Status',
    'Prioritas',
    'Proyek',
    'Assignee(s)',
    'Tags',
    'Sub-Tugas (Selesai/Total)',
    'Daftar Sub-Tugas',
    'Tanggal Mulai',
    'Tenggat',
    'Estimasi (jam)',
    'Logged (jam)',
    'Level Risiko AI',
    'Skor Risiko',
    'Jumlah Komentar',
    'Dibuat',
    'Diperbarui',
  ];

  const rows: (string | number)[][] = [header];
  tasks.forEach(t => {
    rows.push([
      t.id,
      t.title,
      t.description || '',
      STATUS_LABELS[t.status] ?? t.status,
      PRIORITY_LABELS[t.priority] ?? t.priority,
      projectMap.get(t.projectId) || t.projectId,
      listAssignees(t, userMap),
      listTags(t.tags),
      subtaskSummary(t),
      subtaskList(t),
      fmtDate(t.startDate),
      fmtDate(t.dueDate),
      t.estimatedHours ?? 0,
      t.loggedHours ?? 0,
      t.aiRisk ? (RISK_LABELS[t.aiRisk.riskLevel] ?? t.aiRisk.riskLevel) : '',
      t.aiRisk ? t.aiRisk.riskScore : '',
      t.commentsCount ?? 0,
      fmtDateTime(t.createdAt),
      fmtDateTime(t.updatedAt),
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = colWidths([12, 42, 50, 12, 11, 30, 24, 24, 12, 60, 12, 12, 12, 12, 14, 12, 12, 18, 18]);
  applyAutoFilter(ws);
  return ws;
};

const buildProjectsSheet = (projects: Project[], userMap: Map<string, string>): XLSX.WorkSheet => {
  const header = ['ID Proyek', 'Nama', 'Deskripsi', 'Ikon', 'Folder', 'Domain', 'Status', 'Health Score', 'Tanggal Mulai', 'Target Selesai', 'Anggota'];
  const rows: (string | number)[][] = [header];
  projects.forEach(p => {
    rows.push([
      p.id,
      p.name,
      p.description || '',
      p.icon || '',
      p.folder || '',
      p.domain || '',
      PROJECT_STATUS_LABELS[p.status] ?? p.status,
      p.healthScore ?? 0,
      fmtDate(p.startDate),
      fmtDate(p.targetEndDate),
      listMembers(p.memberIds, userMap),
    ]);
  });
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = colWidths([12, 36, 50, 8, 20, 14, 14, 12, 14, 14, 40]);
  applyAutoFilter(ws);
  return ws;
};

const buildUsersSheet = (users: User[]): XLSX.WorkSheet => {
  const header = ['ID', 'Nama', 'Email', 'Role', 'Departemen', 'Persona', 'Kapasitas (jam)', 'Alokasi (jam)', 'Status Akun', 'Terdaftar'];
  const rows: (string | number)[][] = [header];
  users.forEach(u => {
    rows.push([
      u.id,
      u.name,
      u.email,
      u.role || '',
      u.department || '',
      u.personaType || '',
      u.capacityHours ?? 0,
      u.allocatedHours ?? 0,
      u.status || 'active',
      fmtDateTime(u.registeredAt),
    ]);
  });
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = colWidths([14, 26, 30, 26, 18, 22, 14, 14, 14, 18]);
  applyAutoFilter(ws);
  return ws;
};

const buildCommentsSheet = (
  comments: Comment[],
  userMap: Map<string, string>,
  taskMap: Map<string, string>,
): XLSX.WorkSheet => {
  const header = ['ID Komentar', 'ID Tugas', 'Tugas', 'Pengguna', 'Isi Komentar', 'Waktu'];
  const rows: (string)[][] = [header];
  comments.forEach(c => {
    rows.push([
      c.id,
      c.taskId || '',
      taskMap.get(c.taskId) || c.taskId || '',
      userMap.get(c.userId) || c.userId,
      c.content || '',
      fmtDateTime(c.createdAt),
    ]);
  });
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = colWidths([14, 12, 42, 26, 70, 18]);
  applyAutoFilter(ws);
  return ws;
};

const buildActivitySheet = (
  logs: ActivityLog[],
  userMap: Map<string, string>,
  taskMap: Map<string, string>,
  projectMap: Map<string, string>,
): XLSX.WorkSheet => {
  const header = ['ID Log', 'ID Tugas', 'Tugas', 'Proyek', 'Pengguna', 'Aksi', 'Detail', 'Waktu'];
  const rows: (string)[][] = [header];
  logs.forEach(l => {
    rows.push([
      l.id,
      l.taskId || '',
      taskMap.get(l.taskId || '') || '',
      projectMap.get(l.projectId) || l.projectId || '',
      userMap.get(l.userId) || l.userId,
      l.action || '',
      l.details || '',
      fmtDateTime(l.timestamp),
    ]);
  });
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = colWidths([16, 12, 42, 30, 26, 30, 60, 18]);
  applyAutoFilter(ws);
  return ws;
};

const SETTINGS_FIELD_LABELS: { key: keyof SystemSettings; label: string }[] = [
  { key: 'companyName', label: 'Nama Perusahaan / Organisasi' },
  { key: 'logoUrl', label: 'URL Logo' },
  { key: 'timezone', label: 'Zona Waktu Operasional' },
  { key: 'defaultWeeklyCapacityHours', label: 'Kapasitas Mingguan Default (jam)' },
  { key: 'aiModelEngine', label: 'Mesin AI Engine' },
  { key: 'aiModelVersion', label: 'Versi Model AI' },
  { key: 'aiRiskDelayThresholdDays', label: 'Ambang Deteksi Risiko Keterlambatan (hari)' },
  { key: 'autoRiskDetection', label: 'Deteksi Risiko Otomatis' },
  { key: 'aiDataPrivacyOptOut', label: 'Opt-Out Privasi Data AI' },
  { key: 'aiOptOut', label: 'AI Opt-Out' },
  { key: 'autoStatusSummaryInterval', label: 'Interval Ringkasan Status Otomatis' },
  { key: 'weeklySummaryDay', label: 'Hari Ringkasan Mingguan' },
  { key: 'syncLatencyTargetMs', label: 'Target Latensi Sinkronisasi (ms)' },
  { key: 'autoBackupEnabled', label: 'Backup Otomatis Aktif' },
  { key: 'retentionDays', label: 'Retensi Data (hari)' },
];

const buildSettingsSheet = (settings: SystemSettings): XLSX.WorkSheet => {
  const rows: (string | number)[][] = [['Pengaturan', 'Nilai']];
  SETTINGS_FIELD_LABELS.forEach(({ key, label }) => {
    const value = settings[key];
    if (value === undefined || value === null || value === '') return;
    rows.push([label, typeof value === 'boolean' ? boolLabel(value) : String(value)]);
  });
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = colWidths([44, 30]);
  return ws;
};

// ---------------- Public API ----------------

/**
 * Backup seluruh tugas ke satu file Excel (sheet Ringkasan + Tugas).
 * Aman untuk semua pengguna (tanpa data sensitif pengguna).
 */
export const exportTasksToExcel = (
  tasks: Task[],
  users: User[],
  projects: Project[],
  systemSettings?: SystemSettings,
): void => {
  const userMap = buildUserMap(users);
  const projectMap = buildProjectMap(projects);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    wb,
    buildSummarySheet({ tasks, projects, users, comments: [], activityLogs: [], systemSettings: systemSettings || {} }),
    'Ringkasan',
  );
  XLSX.utils.book_append_sheet(wb, buildTasksSheet(tasks, userMap, projectMap), 'Tugas');

  XLSX.writeFile(wb, `ProMan_Backup_Tugas_${stamp()}.xlsx`);
};

export interface FullBackupData {
  tasks: Task[];
  projects: Project[];
  users: User[];
  comments: Comment[];
  activityLogs: ActivityLog[];
  systemSettings: SystemSettings;
}

/**
 * Backup lengkap sistem ke satu file Excel multi-sheet:
 * Ringkasan, Tugas, Proyek, Pengguna, Komentar, Aktivitas, Pengaturan.
 *
 * Catatan keamanan: field password pengguna TIDAK pernah diekspor.
 */
export const exportFullSystemBackup = (data: FullBackupData): void => {
  const { tasks, projects, users, comments, activityLogs, systemSettings } = data;

  const userMap = buildUserMap(users);
  const projectMap = buildProjectMap(projects);
  const taskMap = new Map(tasks.map(t => [t.id, t.title]));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, buildSummarySheet(data), 'Ringkasan');
  XLSX.utils.book_append_sheet(wb, buildTasksSheet(tasks, userMap, projectMap), 'Tugas');
  XLSX.utils.book_append_sheet(wb, buildProjectsSheet(projects, userMap), 'Proyek');
  XLSX.utils.book_append_sheet(wb, buildUsersSheet(users), 'Pengguna');
  XLSX.utils.book_append_sheet(wb, buildCommentsSheet(comments, userMap, taskMap), 'Komentar');
  XLSX.utils.book_append_sheet(wb, buildActivitySheet(activityLogs, userMap, taskMap, projectMap), 'Aktivitas');
  XLSX.utils.book_append_sheet(wb, buildSettingsSheet(systemSettings), 'Pengaturan');

  XLSX.writeFile(wb, `ProMan_Backup_Sistem_${stamp()}.xlsx`);
};