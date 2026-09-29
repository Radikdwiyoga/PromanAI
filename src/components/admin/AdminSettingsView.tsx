import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { User, SystemSettings } from '../../types';
import {
  Settings,
  Building2,
  Sparkles,
  ShieldCheck,
  Users,
  Activity,
  Plus,
  Edit3,
  Trash2,
  Save,
  RotateCcw,
  KeyRound,
  Eye,
  EyeOff,
  X,
  Check,
  Lock,
  Crown,
  AlertOctagon,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Camera,
  UserCheck,
  UserX,
  Clock,
  DatabaseBackup,
  FileSpreadsheet,
  Download,
  ShieldAlert
} from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';
import { sendTelegramTestMessage, getTelegramConfigStatus, TelegramSendResult } from '../../services/telegramService';
import { exportTasksToExcel, exportFullSystemBackup } from '../../services/backupService';


const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
];

// Password tidak pernah disimpan di Firestore, jadi tidak ada yang bisa
// ditampilkan di sini. User hanya bisa mengganti passwordnya sendiri lewat
// menu Profil > Ganti Password, atau melalui tautan reset ke email.

export const AdminSettingsView: React.FC = () => {
  const {
    systemSettings,
    updateSystemSettings,
    users,
    createUser,
    updateUser,
    deleteUser,
    activityLogs,
    tasks,
    projects,
    comments,
    showToast,
    isSuperAdmin,
    currentUser,
    setActiveView
  } = useProject();

  const [activeTab, setActiveTab] = useState<'general' | 'ai_privacy' | 'team_capacity' | 'audit_system' | 'backup'>('general');
  const [formSettings, setFormSettings] = useState<SystemSettings>(systemSettings);

  // User CRUD Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [userRole, setUserRole] = useState('IT Systems Engineer');
  const [userDepartment, setUserDepartment] = useState<User['department']>('Technology');
  const [userCapacity, setUserCapacity] = useState(40);
  const [userPersona, setUserPersona] = useState<User['personaType']>('Member');
  const [userStatus, setUserStatus] = useState<User['status']>('active');
  const [userAvatar, setUserAvatar] = useState(PRESET_AVATARS[0]);

  const pendingUsers = users.filter(u => u.status === 'pending');

  // Telegram Test State
  const [telegramTestResult, setTelegramTestResult] = useState<TelegramSendResult | null>(null);
  const [telegramTesting, setTelegramTesting] = useState(false);
  const tgConfig = getTelegramConfigStatus();

  // Protected View Guard
  if (!isSuperAdmin) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-slate-100/50 dark:bg-slate-950/70">
        <div className="w-16 h-16 rounded-3xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-500/30 shadow-lg">
          <AlertOctagon className="w-8 h-8" />
        </div>
        <div className="space-y-1 max-w-md">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Akses Dibatasi (Admin Only)</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Halaman pengaturan sistem hanya dapat diakses oleh akun dengan role **Super Admin**. Anda saat ini masuk sebagai <strong>{currentUser.name} ({currentUser.personaType})</strong>.
          </p>
        </div>
        <button
          onClick={() => setActiveView('kanban')}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Papan Proyek</span>
        </button>
      </div>
    );
  }

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemSettings(formSettings);
    showToast('Pengaturan sistem berhasil disimpan!', 'success');
  };

  const openAddUserModal = () => {
    setEditingUser(null);
    setUserName('');
    setUserEmail('');
    setUserPassword('');
    setUserRole('IT Systems Engineer');
    setUserDepartment('Technology');
    setUserCapacity(40);
    setUserPersona('Member');
    setUserStatus('active');
    setUserAvatar(PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)]);
    setShowPassword(false);
    setIsUserModalOpen(true);
  };

  const openEditUserModal = (u: User) => {
    setEditingUser(u);
    setUserName(u.name);
    setUserEmail(u.email);
    setUserPassword('');
    setUserRole(u.role);
    setUserDepartment(u.department);
    setUserCapacity(u.capacityHours);
    setUserPersona(u.personaType);
    setUserStatus(u.status || 'active');
    setUserAvatar(u.avatar);
    setShowPassword(false);
    setIsUserModalOpen(true);
  };

  const handleApproveUser = (userId: string) => {
    updateUser(userId, { status: 'active' });
    showToast('Akun berhasil disetujui & diaktifkan!', 'success');
  };

  const handleRejectUser = (userId: string) => {
    updateUser(userId, { status: 'rejected' });
    showToast('Pendaftaran akun telah ditolak.', 'info');
  };

  // ── Excel Backup Handlers ───────────────────────────────────────────────
  const handleExportTasks = () => {
    try {
      exportTasksToExcel(tasks, users, projects, systemSettings);
      showToast(`Backup ${tasks.length} tugas ke Excel berhasil diunduh!`, 'success');
    } catch (err) {
      console.error('Excel tasks export failed:', err);
      showToast('Gagal membuat backup Excel tugas. Coba lagi.', 'warning');
    }
  };

  const handleExportFullBackup = () => {
    try {
      exportFullSystemBackup({
        tasks,
        projects,
        users,
        comments,
        activityLogs,
        systemSettings,
      });
      showToast('Backup lengkap sistem (7 sheet) berhasil diunduh ke Excel!', 'success');
    } catch (err) {
      console.error('Excel full backup failed:', err);
      showToast('Gagal membuat backup Excel sistem. Coba lagi.', 'warning');
    }
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Ukuran foto maksimal 2MB', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setUserAvatar(reader.result);
          showToast('Foto profil berhasil dimuat!', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) return;

    if (!editingUser && userPassword.length < 6) {
      showToast('Password awal minimal 6 karakter!', 'warning');
      return;
    }

    setIsSavingUser(true);

    try {
      if (editingUser) {
        // Email sengaja tidak ikut diubah: email adalah identitas di Firebase
        // Auth. Mengubahnya di Firestore hanya akan membuat profil dan akun
        // Auth tidak cocok.
        updateUser(editingUser.id, {
          name: userName,
          role: userRole,
          department: userDepartment,
          capacityHours: userCapacity,
          personaType: userPersona,
          status: userStatus,
          avatar: userAvatar,
        });
      } else {
        await createUser({
          name: userName,
          email: userEmail,
          password: userPassword,
          role: userRole,
          department: userDepartment,
          capacityHours: userCapacity,
          personaType: userPersona,
          status: userStatus,
          avatar: userAvatar,
        });
      }
      setIsUserModalOpen(false);
    } catch (err: any) {
      console.error('Create user failed:', err);
      showToast(err?.message || 'Gagal membuat akun pengguna.', 'warning');
    } finally {
      setIsSavingUser(false);
    }
  };

  // Telegram Test Handler
  const handleTelegramTest = async () => {
    setTelegramTesting(true);
    setTelegramTestResult(null);
    try {
      const result = await sendTelegramTestMessage();
      setTelegramTestResult(result);
    } catch (err) {
      setTelegramTestResult({ success: false, error: err instanceof Error ? err.message : String(err) });
    } finally {
      setTelegramTesting(false);
    }
  };

  const tabs: { id: typeof activeTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'general', label: 'Umum & Perusahaan', icon: <Building2 className="w-4 h-4" /> },
    { id: 'ai_privacy', label: 'AI Engine & Privasi Data', icon: <Sparkles className="w-4 h-4" /> },
    {
      id: 'team_capacity',
      label: 'Manajemen Pengguna & Password',
      icon: <Users className="w-4 h-4" />,
      badge: pendingUsers.length > 0 ? pendingUsers.length : undefined
    },
    { id: 'audit_system', label: 'Audit Log & Sistem', icon: <Activity className="w-4 h-4" /> },
    { id: 'backup', label: 'Backup & Ekspor Data', icon: <DatabaseBackup className="w-4 h-4" /> },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-auto bg-slate-100/50 dark:bg-slate-950/70 text-slate-800 dark:text-slate-100 transition-colors touch-scroll-y">
      {/* Sticky Top Header & Tabs Section */}
      <div className="shrink-0 p-4 sm:p-6 pb-2 space-y-4 border-b border-slate-200 dark:border-slate-800/80 bg-slate-100/90 dark:bg-slate-950/95 backdrop-blur-md z-10">
        {/* Top Title Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-600" />
                <span>Admin &amp; System Settings Control Center</span>
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-500/30 flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-500" />
                <span>SUPER ADMIN</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pusat konfigurasi tata kelola enterprise: profil perusahaan, persetujuan pendaftaran akun, model AI, dan audit log.
            </p>
          </div>

          {/* Close / Return to Board Button */}
          <button
            onClick={() => setActiveView('kanban')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition shadow-xs active:scale-95"
            title="Tutup Pengaturan & Kembali ke Papan Proyek"
          >
            <X className="w-4 h-4 text-slate-400" />
            <span>Tutup</span>
          </button>
        </div>

        {/* Stable Navigation Tabs with Notification Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition shrink-0 shadow-xs relative ${activeTab === t.id
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20 ring-1 ring-emerald-400'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
            >
              {t.icon}
              <span>{t.label}</span>
              {t.badge !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold animate-pulse ${activeTab === t.id ? 'bg-white text-emerald-700' : 'bg-amber-500 text-white'
                  }`}>
                  {t.badge} Verifikasi
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Tab 1: General & Company */}
        {activeTab === 'general' && (
          <form onSubmit={handleSaveSettings} className="space-y-6 max-w-4xl animate-fade-in">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>Profil Organisasi / Perusahaan</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nama Perusahaan / Organisasi</label>
                  <input
                    type="text"
                    value={formSettings.companyName}
                    onChange={(e) => setFormSettings({ ...formSettings, companyName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Zona Waktu Operasional</label>
                  <select
                    value={formSettings.timezone}
                    onChange={(e) => setFormSettings({ ...formSettings, timezone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Asia/Jakarta">Asia/Jakarta (WIB - UTC+7)</option>
                    <option value="Asia/Makassar">Asia/Makassar (WITA - UTC+8)</option>
                    <option value="Asia/Jayapura">Asia/Jayapura (WIT - UTC+9)</option>
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition flex items-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Pengaturan Organisasi</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: AI Privacy & Security Architecture */}
        {activeTab === 'ai_privacy' && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm max-w-4xl animate-fade-in">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Konfigurasi ProMan AI &amp; Privasi Data</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Kredensial API Key dikelola secara aman melalui Environment Variables (<code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">.env</code>) yang diisolasi dari kode sumber.
              </p>
            </div>

            {/* Live LLM Provider Status */}
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Active Multi-LLM Provider Architecture</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Primary: Groq (<span className="font-mono">openai/gpt-oss-120b</span>) | Secondary: OpenRouter (<span className="font-mono">nemotron-3-super-120b</span>, <span className="font-mono">gemma-4-31b</span>) | Fallback: ProMan Local Heuristic Simulator
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-500/30">
                  ACTIVE
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Enterprise Data Zero-Retention Mode</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Prompt dan tiket data perusahaan tidak digunakan untuk pelatihan model publik.</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-bold border border-blue-300 dark:border-blue-500/30">
                  ENFORCED
                </span>
              </div>
            </div>

            {/* Security Note */}
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/30 text-xs space-y-1 text-slate-700 dark:text-slate-300">
              <div className="font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Catatan Arsitektur Keamanan:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600 dark:text-slate-400 pt-1">
                <li>Seluruh API Key disimpan di variabel environment (<code className="px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-800 font-mono">.env</code>) yang diabaikan oleh Git (<code className="px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-800 font-mono">.gitignore</code>) untuk mencegah kebocoran kredensial di repositori publik.</li>
                <li>Tidak ada nilai secret ter-hardcode di kode program. Kunci diakses secara dinamis saat runtime.</li>
                <li>Jika API Key tidak dikonfigurasi atau kuota habis, sistem secara otomatis beralih (<em>graceful degradation</em>) ke algoritma simulasi heuristik lokal tanpa menyebabkan error aplikasi.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 3: User Management & Approvals */}
        {activeTab === 'team_capacity' && (
          <div className="space-y-6 animate-fade-in">
            {/* PENDING APPROVALS QUEUE */}
            {pendingUsers.length > 0 && (
              <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-500/40 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 animate-pulse" />
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        Antrean Verifikasi Pendaftar Baru ({pendingUsers.length} Permintaan)
                      </h3>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">
                        Pengguna berikut telah mendaftar via halaman login dan membutuhkan persetujuan Super Admin untuk dapat mengakses sistem.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pendingUsers.map(u => (
                    <div
                      key={u.id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-500/30 flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <UserAvatar src={u.avatar} name={u.name} size="md" />
                        <div className="truncate">
                          <div className="font-bold text-slate-900 dark:text-white text-xs truncate">{u.name}</div>
                          <div className="text-[11px] text-slate-400 truncate">{u.email}</div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] px-2 py-0.2 rounded font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {u.department}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 tracking-widest">
                              ••••••
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleApproveUser(u.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-sm"
                          title="Setujui dan aktifkan akun"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Setujui</span>
                        </button>
                        <button
                          onClick={() => handleRejectUser(u.id)}
                          className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-xs transition"
                          title="Tolak pendaftaran"
                        >
                          <UserX className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MAIN USERS TABLE */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-300 uppercase tracking-wider">
                    Daftar Seluruh Pengguna ({users.length} Akun)
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Tambah pengguna manual, ubah status akun, atau perbarui kapasitas jam kerja. Password dikelola oleh Firebase Auth — user mengubahnya sendiri lewat tautan reset ke email.</p>
                </div>

                <button
                  onClick={openAddUserModal}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Anggota Baru</span>
                </button>
              </div>

              <div className="rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                      <th className="p-3.5">Nama &amp; Profil</th>
                      <th className="p-3.5">Status Akun</th>
                      <th className="p-3.5">Role / Jabatan</th>
                      <th className="p-3.5">Departemen</th>
                      <th className="p-3.5">Kapasitas (Jam/Mg)</th>
                      <th className="p-3.5">Persona Type</th>
                      <th className="p-3.5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                    {users.map(u => {
                      const status = u.status || 'active';

                      return (
                        <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                          <td className="p-3.5">
                            <div className="flex items-center gap-2.5">
                              <UserAvatar src={u.avatar} name={u.name} size="sm" />
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                                  <span>{u.name}</span>
                                  {u.personaType === 'Super Admin' && <Crown className="w-3 h-3 text-amber-500" />}
                                </div>
                                <div className="text-[10px] text-slate-400">{u.email}</div>
                              </div>
                            </div>
                          </td>

                          {/* Status Badge */}
                          <td className="p-3.5">
                            {status === 'active' && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                                Aktif
                              </span>
                            )}
                            {status === 'pending' && (
                              <button
                                onClick={() => handleApproveUser(u.id)}
                                className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 hover:bg-emerald-500 hover:text-white transition"
                                title="Klik untuk verifikasi & aktifkan"
                              >
                                Menunggu (Klik Setujui)
                              </button>
                            )}
                            {status === 'rejected' && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30">
                                Ditolak
                              </span>
                            )}
                          </td>

                          <td className="p-3.5 font-medium">{u.role}</td>
                          <td className="p-3.5">
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                              {u.department}
                            </span>
                          </td>
                          <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-slate-200">
                            {u.capacityHours} Jam/minggu
                          </td>
                          <td className="p-3.5">
                            <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-emerald-50 dark:bg-orange-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                              {u.personaType}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => openEditUserModal(u)}
                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                                title="Edit Pengguna & Password"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              {u.id !== currentUser.id && (
                                <button
                                  onClick={() => {
                                    const nama = u.name || u.email;
                                    const ok = window.confirm(
                                      `Nonaktifkan akun ${nama}?\n\n` +
                                      'Akun tidak akan bisa login lagi dan tidak bisa diaktifkan kembali dari panel ini. ' +
                                      'Tugas yang sudah ditugaskan ke user ini tetap tersimpan.'
                                    );
                                    if (ok) deleteUser(u.id);
                                  }}
                                  className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 transition"
                                  title="Nonaktifkan Pengguna"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Audit Logs */}
        {activeTab === 'audit_system' && (
          <div className="space-y-4 animate-fade-in">

            {/* ── Telegram Notification Diagnostics ── */}
            <div className="rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <span>✈️ Notifikasi Telegram</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  tgConfig.configured
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'
                }`}>
                  {tgConfig.configured ? 'Aktif' : 'Belum Aktif'}
                </span>
              </h3>

              {/* Config Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-500 dark:text-slate-400">Bot Token</span>
                  <p className={`mt-1 font-mono ${tgConfig.hasToken ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {tgConfig.hasToken ? '✓ Terdeteksi' : '✗ Belum diatur'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-500 dark:text-slate-400">Chat ID</span>
                  <p className={`mt-1 font-mono ${tgConfig.configured ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {tgConfig.chatId}
                  </p>
                </div>
              </div>

              {/* Test Button */}
              <button
                id="telegram-test-btn"
                onClick={handleTelegramTest}
                disabled={telegramTesting || !tgConfig.configured}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              >
                {telegramTesting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>✈️ Kirim Test Notifikasi</>
                )}
              </button>

              {/* Result Feedback */}
              {telegramTestResult && (
                <div className={`p-3 rounded-xl border text-xs font-semibold flex items-start gap-2 ${
                  telegramTestResult.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400'
                }`}>
                  <span className="mt-0.5">{telegramTestResult.success ? '✅' : '❌'}</span>
                  <div>
                    <p>{telegramTestResult.success ? 'Notifikasi berhasil terkirim! Cek Telegram Anda.' : `Gagal: ${telegramTestResult.error || 'Unknown error'}`}</p>
                    {telegramTestResult.errorCode && (
                      <p className="mt-1 text-[10px] opacity-70 font-mono">Error Code: {telegramTestResult.errorCode}</p>
                    )}
                  </div>
                </div>
              )}

              {!tgConfig.configured && (
                <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">
                  Untuk mengaktifkan, tambahkan VITE_TELEGRAM_BOT_TOKEN dan VITE_TELEGRAM_CHAT_ID di file .env, lalu rebuild aplikasi.
                </p>
              )}
            </div>

            {/* ── Activity Logs ── */}
            <div className="rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-300 uppercase tracking-wider">
                Riwayat Aktivitas &amp; Audit Log ({activityLogs.length} Entri)
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {activityLogs.map(log => (
                  <div key={log.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{log.action}: </span>
                      <span className="text-slate-600 dark:text-slate-300">{log.details}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Backup & Ekspor Data */}
        {activeTab === 'backup' && (
          <div className="space-y-4 animate-fade-in max-w-4xl">
            {/* Intro Card */}
            <div className="rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-500/30 shrink-0">
                  <DatabaseBackup className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Backup &amp; Ekspor Data ke Excel</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Unduh seluruh data ProMan ke format <strong className="text-slate-700 dark:text-slate-300">Microsoft Excel (.xlsx)</strong> — file dibuka langsung di Excel, Google Sheets, atau WPS. Gunakan secara rutin sebagai cadangan (backup) data operasional tim Anda.
                  </p>
                </div>
              </div>

              {/* Snapshot Counts */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
                {[
                  { label: 'Proyek', value: projects.length },
                  { label: 'Tugas', value: tasks.length },
                  { label: 'Pengguna', value: users.length },
                  { label: 'Komentar', value: comments.length },
                  { label: 'Aktivitas', value: activityLogs.length },
                ].map(stat => (
                  <div key={stat.label} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-center">
                    <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">{stat.value}</div>
                    <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Full System Backup Card */}
            <div className="rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <DatabaseBackup className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Backup Lengkap Sistem</h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Satu file Excel dengan <strong>7 sheet</strong>: Ringkasan, Tugas, Proyek, Pengguna, Komentar, Aktivitas Log, dan Pengaturan Sistem.
              </p>
              <button
                onClick={handleExportFullBackup}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Backup Lengkap (.xlsx)</span>
              </button>
            </div>

            {/* Tasks Only Card */}
            <div className="rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-teal-600" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Backup Tugas Saja</h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Fokus ekspor seluruh tugas dengan detail lengkap (status, prioritas, assignee, sub-tugas, risiko AI) — tanpa data pengguna/sistem.
              </p>
              <button
                onClick={handleExportTasks}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-xs font-bold text-white transition flex items-center gap-2 shadow-lg shadow-teal-500/20 active:scale-95 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Unduh Backup Tugas (.xlsx)</span>
              </button>
            </div>

            {/* Security Note */}
            <div className="flex items-start gap-2 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                <strong>Catatan keamanan:</strong> Field password akun pengguna TIDAK pernah disertakan dalam file backup. File Excel yang diunduh mengandung data operasional sensitif — simpan di tempat aman dan jangan bagikan secara publik.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal Add / Edit User with Avatar Upload & Presets */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in text-slate-800 dark:text-slate-100">
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/80">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {editingUser ? 'Edit Data, Foto & Password Anggota' : 'Tambah Anggota Tim Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUserSubmit} className="p-6 space-y-4 overflow-y-auto">
              {/* Avatar Upload & Selector Section */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Foto Profil Pengguna</span>
                </label>

                <div className="flex items-center gap-4">
                  {/* Live Avatar Preview */}
                  <UserAvatar src={userAvatar} name={userName || 'User'} size="xl" />

                  <div className="flex-1 space-y-2">
                    {/* Custom File Upload Button */}
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition active:scale-95">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Foto Sendiri</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFileUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-slate-400">JPG, PNG atau WebP (Maks 2MB)</p>
                  </div>
                </div>

                {/* Preset Avatars List */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Atau Pilih Avatar Bawaan:</span>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {PRESET_AVATARS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setUserAvatar(preset)}
                        className={`w-9 h-9 rounded-full overflow-hidden border-2 transition shrink-0 ${userAvatar === preset ? 'border-emerald-500 ring-2 ring-orange-500/40' : 'border-transparent opacity-70 hover:opacity-100'
                          }`}
                      >
                        <img src={preset} alt="preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Name Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nama Lengkap</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Contoh: Nama"
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* Email Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Perusahaan (Username Login)</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="nama@bitcorp.id"
                  readOnly={!!editingUser}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed"
                  required
                />
              </div>

              {/* Password — hanya untuk user baru. Password user yang sudah ada
                  tidak bisa diubah dari sini: itu hanya bisa lewat tautan reset
                  yang Firebase kirim ke email pemilik akun. */}
              {!editingUser && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Password Awal <span className="text-rose-500">*</span></span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      placeholder="Minimal 6 karakter..."
                      className="w-full p-2.5 pr-10 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Disampaikan ke user di luar aplikasi ini dan tidak disimpan di mana pun. Minta user segera menggantinya lewat menu &ldquo;Lupa Password&rdquo;.
                  </p>
                </div>
              )}

              {editingUser && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30">
                  <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                    Email dan password akun ini dikelola Firebase Auth. Untuk mengganti password, minta user klik <strong>&ldquo;Lupa Password&rdquo;</strong> di halaman login dan mengikuti tautan yang dikirım ke email mereka.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Jabatan / Role</label>
                  <input
                    type="text"
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value)}
                    placeholder="Contoh: Lead Architect"
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Departemen</label>
                  <select
                    value={userDepartment}
                    onChange={(e) => setUserDepartment(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Operations">Operations</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance">Finance</option>
                    <option value="Management">Management</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Kapasitas (Jam/Mg)</label>
                  <input
                    type="number"
                    value={userCapacity}
                    onChange={(e) => setUserCapacity(Number(e.target.value) || 40)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Persona Role</label>
                  <select
                    value={userPersona}
                    onChange={(e) => setUserPersona(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Project Manager (PM)">Project Manager (PM)</option>
                    <option value="Team Member">Team Member</option>
                    <option value="Operations Lead">Operations Lead</option>
                    <option value="Stakeholder">Stakeholder / Client</option>
                    <option value="Member">Member Standar</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Status Akun</label>
                  <select
                    value={userStatus}
                    onChange={(e) => setUserStatus(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none font-bold"
                  >
                    <option value="active">Aktif (Approved)</option>
                    <option value="pending">Menunggu Persetujuan</option>
                    <option value="rejected">Ditolak</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingUser}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-xs font-bold text-white shadow-lg shadow-emerald-500/20"
                >
                  {isSavingUser
                    ? 'Menyimpan...'
                    : editingUser ? 'Simpan Perubahan' : 'Tambah Anggota'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
