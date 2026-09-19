import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { X, Plus, Sparkles, FolderKanban, Clock, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { TaskPriority, TaskStatus, TaskEffortEstimation } from '../../types';
import { estimateLiveTaskEffortAndDueDate } from '../../services/geminiService';

export const CreateTaskModal: React.FC = () => {
  const {
    isCreateModalOpen,
    setIsCreateModalOpen,
    createTask,
    projects,
    currentProject,
    users,
    showToast,
  } = useProject();

  const [targetProjectId, setTargetProjectId] = useState(currentProject.id);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [assigneeId, setAssigneeId] = useState(users[0]?.id || 'user-1');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['Operasional', 'Sprint 1']);
  const [estimatedHours, setEstimatedHours] = useState<number>(8);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(todayStr);
  
  const defaultDue = new Date();
  defaultDue.setDate(defaultDue.getDate() + 7);
  const [dueDate, setDueDate] = useState(defaultDue.toISOString().split('T')[0]);

  // AI Task Estimator State
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimation, setEstimation] = useState<TaskEffortEstimation | null>(null);

  if (!isCreateModalOpen) return null;

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleRunAIEstimate = async () => {
    if (!title.trim()) {
      showToast('Ketik judul tugas terlebih dahulu sebelum meminta estimasi AI', 'warning');
      return;
    }

    setIsEstimating(true);
    try {
      const result = await estimateLiveTaskEffortAndDueDate(
        title, 
        description, 
        assigneeId, 
        startDate, 
        users
      );
      setEstimation(result);
      showToast('AI berhasil memprediksi estimasi jam kerja & due date!', 'success');
    } catch (e) {
      console.error('Error estimating task:', e);
      showToast('Gagal memproses estimasi AI', 'warning');
    } finally {
      setIsEstimating(false);
    }
  };

  const handleApplyEstimation = () => {
    if (!estimation) return;
    setEstimatedHours(estimation.estimatedHours);
    setDueDate(estimation.suggestedDueDate);
    showToast(`Estimasi diterapkan: ${estimation.estimatedHours} Jam (Due: ${estimation.suggestedDueDate})`, 'success');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Judul tugas wajib diisi', 'warning');
      return;
    }

    createTask({
      projectId: targetProjectId || currentProject.id,
      title,
      description,
      status,
      priority,
      assigneeIds: [assigneeId],
      tags,
      startDate,
      dueDate,
      estimatedHours,
      subtasks: [
        { id: `st-init-1`, title: 'Perencanaan & persiapan eksekusi', completed: false, category: 'Operations' },
        { id: `st-init-2`, title: 'Pelaksanaan dan validasi hasil', completed: false, category: 'General' },
      ],
      attachments: [],
    });

    setIsCreateModalOpen(false);
    setTitle('');
    setDescription('');
    setEstimation(null);
  };

  const optimalAssignee = [...users].sort((a, b) => (a.allocatedHours / Math.max(1, a.capacityHours)) - (b.allocatedHours / Math.max(1, b.capacityHours)))[0];

  const getComplexityColor = (level: string) => {
    switch (level) {
      case 'Rendah': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30';
      case 'Sedang': return 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-500/30';
      case 'Kompleks': return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-500/30';
      case 'Sangat Kompleks': return 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-500/30';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Buat Tugas Baru</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Tambahkan tiket tugas dengan AI Smart Estimator</p>
            </div>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Target Project Dropdown */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FolderKanban className="w-3.5 h-3.5 text-emerald-600" />
              <span>Pilih Project Tujuan <span className="text-rose-500">*</span></span>
            </label>
            <select
              value={targetProjectId}
              onChange={(e) => setTargetProjectId(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-emerald-500"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.icon} {p.name} ({p.domain.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Title with Quick AI Estimator Button */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Judul Tugas <span className="text-rose-500">*</span></label>
              <button
                type="button"
                onClick={handleRunAIEstimate}
                disabled={isEstimating || !title.trim()}
                className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:text-orange-700 dark:hover:text-orange-300 disabled:opacity-50 transition"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isEstimating ? 'animate-spin' : 'animate-pulse'}`} />
                <span>{isEstimating ? 'AI Menganalisis...' : '? AI Estimasi Jam & Due Date'}</span>
              </button>
            </div>
            <input
              type="text"
              placeholder="Contoh: Implementasi Sistem Autentikasi OAuth2 & Role Permission..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition font-medium"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Deskripsi & Ruang Lingkup</label>
            <textarea
              placeholder="Jelaskan kebutuhan, rincian instruksi kerja, atau kriteria penyelesaian..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition resize-none"
            />
          </div>

          {/* ?? AI SMART ESTIMATOR PREDICTION CARD */}
          {estimation && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/50 to-emerald-50/20 dark:from-orange-950/30 dark:via-slate-900 dark:to-orange-950/20 border border-emerald-200 dark:border-emerald-500/30 shadow-sm space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-emerald-600 text-white">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Rekomendasi Estimasi ProMan AI</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getComplexityColor(estimation.complexityLevel)}`}>
                  {estimation.complexityLevel}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400">Estimasi Waktu</div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100">{estimation.estimatedHours} Jam Kerja (~{Math.ceil(estimation.estimatedHours / 8)} Hari)</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400">Target Due Date Realistis</div>
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{estimation.suggestedDueDate}</div>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-300 italic bg-white/60 dark:bg-black/30 p-2.5 rounded-xl border border-orange-100 dark:border-emerald-500/20">
                ?? <span className="font-semibold text-emerald-700 dark:text-emerald-400">Analisis AI:</span> {estimation.rationale}
              </p>

              <button
                type="button"
                onClick={handleApplyEstimation}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-md shadow-emerald-500/25 transition active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Terapkan Estimasi ke Formulir</span>
              </button>
            </div>
          )}

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Status Awal</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Prioritas</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent ??</option>
              </select>
            </div>
          </div>

          {/* Assignee Selection with AI recommendation */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Penerima Tugas (Assignee)</label>
              {optimalAssignee && (
                <button
                  type="button"
                  onClick={() => setAssigneeId(optimalAssignee.id)}
                  className="text-[10px] text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Saran Beban: {optimalAssignee.name}</span>
                </button>
              )}
            </div>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            >
              {users.map(u => {
                const isOverload = u.allocatedHours > u.capacityHours;
                return (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role}) — {u.department} {isOverload ? '?? (Overload)' : '?'}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Dates & Estimated Hours */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Mulai</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tenggat (Due)</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Estimasi Jam</label>
              <input
                type="number"
                min={1}
                max={200}
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value) || 8)}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none font-bold"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tags / Label</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Tambah tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
              >
                Tambah
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30 text-orange-700 dark:text-orange-300 flex items-center gap-1 font-medium"
                >
                  <span>{tag}</span>
                  <button type="button" onClick={() => handleRemoveTag(tag)} className="text-emerald-500 hover:text-emerald-700 dark:hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-xs font-bold text-white transition shadow-lg shadow-emerald-500/25 active:scale-95"
            >
              Buat Tugas Sekarang
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
