import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Project } from '../../types';
import { 
  FolderKanban, 
  Plus, 
  Calendar, 
  Users, 
  Sparkles, 
  Trash2, 
  Edit3, 
  ArrowRight, 
  CheckCircle2, 
  Activity,
  X,
  Building2,
  TrendingUp,
  Code,
  Layers
} from 'lucide-react';

export const ProjectManagementView: React.FC = () => {
  const {
    projects,
    currentProject,
    setCurrentProjectId,
    createProject,
    updateProject,
    deleteProject,
    tasks,
    users,
    setActiveView,
    isSuperAdmin,
    isPM,
  } = useProject();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('📁');
  const [color, setColor] = useState('#6366f1');
  const [folder, setFolder] = useState('Inisiatif Utama');
  const [domain, setDomain] = useState<Project['domain']>('all');
  const [status, setStatus] = useState<Project['status']>('active');

  const [filterDomain, setFilterDomain] = useState<string>('all');

  const openCreateModal = () => {
    setEditingProject(null);
    setName('');
    setDescription('');
    setIcon('🚀');
    setColor('#6366f1');
    setFolder('Inisiatif Utama');
    setDomain('all');
    setStatus('active');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Project) => {
    setEditingProject(p);
    setName(p.name);
    setDescription(p.description);
    setIcon(p.icon);
    setColor(p.color);
    setFolder(p.folder);
    setDomain(p.domain);
    setStatus(p.status);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingProject) {
      updateProject(editingProject.id, {
        name,
        description,
        icon,
        color,
        folder,
        domain,
        status,
      });
    } else {
      createProject({
        name,
        description,
        icon,
        color,
        folder,
        domain,
        status,
        memberIds: users.slice(0, 3).map(u => u.id),
      });
    }
    setIsModalOpen(false);
  };

  const filteredProjects = projects.filter(p => {
    if (filterDomain === 'all') return true;
    return p.domain === filterDomain;
  });

  const domainIcons: Record<string, string> = {
    all: '🌐',
    operations: '🏢',
    marketing: '🎯',
    technology: '💻',
    hr: '👥',
    finance: '💰',
    event: '🎪',
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-100/50 dark:bg-slate-950/70 p-4 sm:p-6 space-y-6 text-slate-800 dark:text-slate-100 transition-colors touch-scroll-y">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-emerald-600" />
              <span>Halaman Manajemen & Daftar Project</span>
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-500/30">
              {projects.length} Project Aktif
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kelola seluruh inisiatif proyek operasional dan teknologi: tambah project baru, sesuaikan target jadwal, atau buka papan kerja.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('kanban')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition shadow-xs active:scale-95"
            title="Tutup & Kembali ke Papan Proyek"
          >
            <X className="w-4 h-4 text-slate-400" />
            <span>Tutup</span>
          </button>

          {(isSuperAdmin || isPM) && (
            <button
              onClick={openCreateModal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Project Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Domain Filters */}
      <div className="flex items-center gap-2 flex-wrap pb-1">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">Filter Bidang:</span>
        {['all', 'operations', 'marketing', 'technology', 'hr', 'finance'].map(d => (
          <button
            key={d}
            onClick={() => setFilterDomain(d)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
              filterDomain === d
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span className="mr-1.5">{domainIcons[d] || '📁'}</span>
            <span className="capitalize">{d === 'all' ? 'Semua Bidang' : d}</span>
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.map(proj => {
          const isCurrent = proj.id === currentProject.id;
          const projTasks = tasks.filter(t => t.projectId === proj.id);
          const activeTasks = projTasks.filter(t => t.status !== 'done').length;
          const completedTasks = projTasks.filter(t => t.status === 'done').length;
          const progress = projTasks.length > 0 ? Math.round((completedTasks / projTasks.length) * 100) : 0;

          return (
            <div
              key={proj.id}
              className={`rounded-3xl bg-white dark:bg-slate-900/90 border transition-all duration-200 p-5 shadow-sm hover:shadow-xl flex flex-col justify-between space-y-4 ${
                isCurrent 
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20 dark:ring-indigo-500/30' 
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Card Top */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-inner">
                      {proj.icon}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {proj.folder}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                            Aktif Sekarang
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1 leading-snug">
                        {proj.name}
                      </h3>
                    </div>
                  </div>

                  {(isSuperAdmin || isPM) && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(proj)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="Edit Project"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteProject(proj.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                        title="Hapus Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {proj.description}
                </p>
              </div>

              {/* Progress & Stats */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                    <span>Kemajuan Proyek ({progress}%)</span>
                    <span>{completedTasks}/{projTasks.length} Tugas Selesai</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5 font-medium text-[11px] text-slate-700 dark:text-slate-300">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{projTasks.length} Tugas Terdaftar</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                    {proj.status}
                  </span>
                </div>
              </div>

              {/* Action: Open Project Board */}
              <button
                onClick={() => {
                  setCurrentProjectId(proj.id);
                  setActiveView('kanban');
                }}
                className="w-full py-2 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 dark:hover:bg-indigo-600 text-slate-700 dark:text-slate-200 hover:text-white dark:hover:text-white text-xs font-bold transition flex items-center justify-center gap-2 group shadow-sm"
              >
                <span>Buka Papan Kerja Proyek</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition transform" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal Create / Edit Project */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/80">
              <div className="flex items-center gap-2.5">
                <FolderKanban className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {editingProject ? 'Edit Informasi Project' : 'Buat Project Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-1 space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Icon / Emoji</label>
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full p-2.5 text-center text-lg rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
                    maxLength={2}
                  />
                </div>
                <div className="col-span-3 space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nama Project <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: IT Security Assessment..."
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Deskripsi & Ruang Lingkup</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Jelaskan tujuan dan ruang lingkup inisiatif project ini..."
                  className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Bidang / Domain</label>
                  <select
                    value={domain}
                    onChange={(e) => setDomain(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="all">General / Multi-Disiplin</option>
                    <option value="operations">Operasional Bisnis</option>
                    <option value="marketing">Marketing & GTM</option>
                    <option value="technology">IT & Software</option>
                    <option value="hr">HR & Rekrutmen</option>
                    <option value="finance">Finance & Legal</option>
                    <option value="event">Event & Aktivasi</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Status Project</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="active">Active (Sedang Berjalan)</option>
                    <option value="planning">Planning (Perencanaan)</option>
                    <option value="on_hold">On Hold (Ditunda)</option>
                    <option value="completed">Completed (Selesai)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 cursor-pointer"
                >
                  {editingProject ? 'Simpan Perubahan' : 'Buat Project Sekarang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
