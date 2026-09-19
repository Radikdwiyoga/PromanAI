import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { 
  X, 
  CheckSquare, 
  MessageSquare, 
  Paperclip, 
  Calendar, 
  User as UserIcon, 
  Tag, 
  Trash2, 
  Send, 
  Plus, 
  Sparkles,
  FolderKanban,
  Clock,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  AlertTriangle,
  Copy,
  Layers,
  Save,
  Check
} from 'lucide-react';
import { TaskPriority, TaskStatus, TaskEffortEstimation, AISolutionAdvice } from '../../types';
import { estimateLiveTaskEffortAndDueDate, getLiveAISolutionAdvice } from '../../services/geminiService';

export const TaskModal: React.FC = () => {
  const {
    selectedTask,
    setSelectedTaskId,
    updateTask,
    deleteTask,
    moveTaskStatus,
    toggleSubtask,
    addSubtask,
    addComment,
    comments,
    users,
    projects,
    currentUser,
    applyRiskMitigation,
    setIsCopilotOpen,
    showToast,
  } = useProject();

  // Form State for Editable Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assigneeId, setAssigneeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState<number>(8);
  const [isSaving, setIsSaving] = useState(false);

  // Subtask and Comment state
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newSubtaskCategory, setNewSubtaskCategory] = useState<any>('General');
  const [newCommentText, setNewCommentText] = useState('');

  // AI Task Estimator State
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimation, setEstimation] = useState<TaskEffortEstimation | null>(null);

  // AI Solution Advisor State
  const [isAskingAdvisor, setIsAskingAdvisor] = useState(false);
  const [advisorQuestion, setAdvisorQuestion] = useState('');
  const [solutionAdvice, setSolutionAdvice] = useState<AISolutionAdvice | null>(null);

  // Sync state when selectedTask changes
  useEffect(() => {
    if (selectedTask) {
      setTitle(selectedTask.title || '');
      setDescription(selectedTask.description || '');
      setProjectId(selectedTask.projectId || (projects[0]?.id || ''));
      setStatus(selectedTask.status || 'todo');
      setPriority(selectedTask.priority || 'medium');
      setAssigneeId(selectedTask.assigneeIds?.[0] || '');
      setStartDate(selectedTask.startDate || '');
      setDueDate(selectedTask.dueDate || '');
      setEstimatedHours(selectedTask.estimatedHours || 8);
      setEstimation(null);
      setSolutionAdvice(null);
    }
  }, [selectedTask?.id]);

  if (!selectedTask) return null;

  const isDirty = 
    title !== selectedTask.title ||
    description !== (selectedTask.description || '') ||
    projectId !== selectedTask.projectId ||
    status !== selectedTask.status ||
    priority !== selectedTask.priority ||
    assigneeId !== (selectedTask.assigneeIds?.[0] || '') ||
    startDate !== selectedTask.startDate ||
    dueDate !== selectedTask.dueDate ||
    estimatedHours !== (selectedTask.estimatedHours || 8);

  const taskComments = comments.filter(c => c.taskId === selectedTask.id);
  const currentProject = projects.find(p => p.id === projectId) || projects.find(p => p.id === selectedTask.projectId);

  const handleSaveChanges = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      showToast('Judul tugas tidak boleh kosong', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      updateTask(selectedTask.id, {
        title: title.trim(),
        description: description.trim(),
        projectId,
        status,
        priority,
        assigneeIds: assigneeId ? [assigneeId] : [],
        startDate,
        dueDate,
        estimatedHours: Number(estimatedHours) || 8,
      });
      showToast('Perubahan tugas berhasil disimpan!', 'success');
    } catch (err) {
      console.error('Error saving task:', err);
      showToast('Gagal menyimpan perubahan tugas', 'warning');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    addSubtask(selectedTask.id, newSubtaskTitle, newSubtaskCategory);
    setNewSubtaskTitle('');
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    addComment(selectedTask.id, newCommentText);
    setNewCommentText('');
  };

  const handleReEstimate = async () => {
    setIsEstimating(true);
    try {
      const result = await estimateLiveTaskEffortAndDueDate(
        title,
        description,
        assigneeId || users[0]?.id || '',
        startDate,
        users
      );
      setEstimation(result);
      showToast('AI berhasil menganalisis ulang estimasi tugas!', 'success');
    } catch (e) {
      console.error('Error in re-estimating:', e);
      showToast('Gagal memproses estimasi AI', 'warning');
    } finally {
      setIsEstimating(false);
    }
  };

  const handleApplyEstimation = () => {
    if (!estimation) return;
    setDueDate(estimation.suggestedDueDate);
    setEstimatedHours(estimation.estimatedHours);
    showToast(`Estimasi diterapkan: ${estimation.estimatedHours} Jam (Due: ${estimation.suggestedDueDate}) - Klik Simpan untuk memperbarui.`, 'success');
  };

  const handleGetSolutionAdvice = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsAskingAdvisor(true);
    try {
      const advice = await getLiveAISolutionAdvice({
        ...selectedTask,
        title,
        description,
        projectId,
        status,
        priority,
        assigneeIds: assigneeId ? [assigneeId] : [],
        startDate,
        dueDate,
      }, advisorQuestion);
      setSolutionAdvice(advice);
      showToast('Solusi AI berhasil dibuat!', 'success');
    } catch (err) {
      console.error('Error fetching solution advice:', err);
      showToast('Gagal memuat solusi AI', 'warning');
    } finally {
      setIsAskingAdvisor(false);
    }
  };

  const handleAddAdviceToSubtasks = () => {
    if (!solutionAdvice || !solutionAdvice.suggestedNewSubtasks) return;
    solutionAdvice.suggestedNewSubtasks.forEach((st) => {
      addSubtask(selectedTask.id, st, 'General');
    });
    showToast(`Berhasil menambahkan ${solutionAdvice.suggestedNewSubtasks.length} sub-tugas rekomendasi AI!`, 'success');
  };

  const handlePostAdviceToComments = () => {
    if (!solutionAdvice) return;
    const commentBody = `💡 **Rekomendasi Solusi AI:**\n${solutionAdvice.summaryDiagnosis}\n\n**Langkah Tindak Lanjut:**\n${solutionAdvice.actionSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
    addComment(selectedTask.id, commentBody);
    showToast('Rangkuman solusi AI telah diposting ke komentar tiket!', 'success');
  };

  const priorityOptions: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];
  const statusOptions: { value: TaskStatus; label: string }[] = [
    { value: 'backlog', label: 'Backlog' },
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'review', label: 'In Review' },
    { value: 'done', label: 'Done' },
  ];

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
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in text-slate-800 dark:text-slate-100">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/80 rounded-t-3xl">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Project Quick Selector in Header */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-600/10 border border-emerald-200 dark:border-emerald-500/20 text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <FolderKanban className="w-3.5 h-3.5" />
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="bg-transparent text-xs font-bold text-emerald-700 dark:text-emerald-400 focus:outline-none cursor-pointer"
                title="Pilih / Ubah Project Terkait"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id} className="text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900">
                    {p.icon} {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Selector */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {statusOptions.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            {/* Priority Selector */}
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {priorityOptions.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            {/* Header Save Button */}
            <button
              onClick={() => handleSaveChanges()}
              disabled={isSaving || !isDirty}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95 ${
                isDirty 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25 ring-2 ring-orange-400/40 animate-pulse' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 opacity-60 cursor-not-allowed'
              }`}
              title={isDirty ? 'Klik untuk menyimpan perubahan' : 'Tidak ada perubahan baru'}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Menyimpan...' : (isDirty ? 'Simpan' : 'Tersimpan')}</span>
            </button>

            <button
              onClick={() => deleteTask(selectedTask.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
              title="Hapus Tugas"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedTaskId(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Editable Title */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Judul Tugas</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Judul tugas..."
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700 rounded-2xl text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition shadow-inner"
              />
            </div>

            {/* Editable Description */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Deskripsi Tugas</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition leading-relaxed resize-y min-h-[80px]"
                placeholder="Tambahkan rincian instruksi, dependensi, atau standar operasional..."
              />
            </div>

            {/* 🌟 AI SMART TROUBLESHOOTING & SOLUTION ADVISOR */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-amber-500/10 via-teal-500/5 to-slate-50 dark:from-orange-950/30 dark:via-slate-900/60 dark:to-slate-950 border border-emerald-200 dark:border-emerald-500/30 space-y-3.5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-emerald-600 text-white shadow-xs">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>AI Solution & Troubleshooting Advisor</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-600/20 text-emerald-800 dark:text-emerald-300 font-bold border border-orange-300 dark:border-emerald-500/30">
                        PROMAN AI
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Dapatkan rekomendasi solusi langkah-demi-langkah jika mengalami kendala/kebuntuan</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleGetSolutionAdvice()}
                  disabled={isAskingAdvisor}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-sm shadow-emerald-500/20 transition active:scale-95 disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isAskingAdvisor ? 'animate-spin' : ''}`} />
                  <span>{isAskingAdvisor ? 'Menganalisis Solusi...' : 'Tanyakan Solusi AI'}</span>
                </button>
              </div>

              {/* Optional Custom Question Input */}
              <form onSubmit={handleGetSolutionAdvice} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ketik pertanyaan / kendala spesifik (misal: 'Error connection timeout' atau 'Format SOP')..."
                  value={advisorQuestion}
                  onChange={(e) => setAdvisorQuestion(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                />
                <button
                  type="submit"
                  disabled={isAskingAdvisor}
                  className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition"
                >
                  Tanya
                </button>
              </form>

              {/* Display Result Advice */}
              {solutionAdvice && (
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-500/30 space-y-3 animate-fade-in text-xs">
                  {/* Diagnosis */}
                  <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    🔍 <strong className="text-emerald-700 dark:text-emerald-400">Diagnosis AI:</strong> {solutionAdvice.summaryDiagnosis}
                  </div>

                  {/* Action Steps */}
                  <div className="space-y-1.5">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Rencana Langkah Solusi (Step-by-Step):</span>
                    </div>
                    <div className="space-y-1 pl-1">
                      {solutionAdvice.actionSteps.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                          <span className="font-bold text-emerald-700 dark:text-emerald-400 shrink-0">{idx + 1}.</span>
                          <span className="text-slate-700 dark:text-slate-300">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Technical Tips & Pitfalls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {solutionAdvice.technicalTips && solutionAdvice.technicalTips.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] flex items-center gap-1">
                          ⚙️ Tips Teknis & Best Practices:
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-[10px] text-slate-600 dark:text-slate-400">
                          {solutionAdvice.technicalTips.map((tip, i) => (
                            <li key={i}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {solutionAdvice.potentialPitfalls && solutionAdvice.potentialPitfalls.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/20 space-y-1">
                        <span className="font-bold text-rose-700 dark:text-rose-300 text-[11px] flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Hal yang Harus Dihindari:</span>
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-[10px] text-rose-600 dark:text-rose-400">
                          {solutionAdvice.potentialPitfalls.map((pit, i) => (
                            <li key={i}>{pit}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* 1-Click Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {solutionAdvice.suggestedNewSubtasks && solutionAdvice.suggestedNewSubtasks.length > 0 && (
                      <button
                        type="button"
                        onClick={handleAddAdviceToSubtasks}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-600/20 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-600/30 text-xs font-bold transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambahkan {solutionAdvice.suggestedNewSubtasks.length} Sub-Tugas Rekomendasi</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handlePostAdviceToComments}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold transition"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Post Solusi ke Komentar Tiket</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* AI Predictive Risk Card (if risk exists) */}
            {selectedTask.aiRisk && (
              <div className={`p-4 rounded-2xl border ${
                selectedTask.aiRisk.riskScore >= 60 
                  ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-500/40 text-amber-900 dark:text-amber-100' 
                  : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-100'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>AI Risk & Delay Prediction ({selectedTask.aiRisk.riskLevel.toUpperCase()})</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/10 dark:bg-black/40 border border-black/10 dark:border-white/10">
                    Skor: {selectedTask.aiRisk.riskScore}/100
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 mb-2 leading-relaxed">
                  {selectedTask.aiRisk.reason}
                </p>
                <div className="p-2.5 rounded-xl bg-white/60 dark:bg-black/30 border border-black/5 dark:border-white/5 text-xs text-orange-700 dark:text-orange-200 flex items-start gap-2 mb-3">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 shrink-0">💡 Saran AI:</span>
                  <span>{selectedTask.aiRisk.mitigationSuggestion}</span>
                </div>

                {selectedTask.aiRisk.isActionable && (
                  <div className="flex items-center gap-2 pt-1">
                    {selectedTask.aiRisk.suggestedAssigneeId && (
                      <button
                        onClick={() => applyRiskMitigation(selectedTask.id, 'reassign', selectedTask.aiRisk?.suggestedAssigneeId)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white transition flex items-center gap-1.5 shadow-sm"
                      >
                        <UserIcon className="w-3.5 h-3.5" />
                        <span>Alihkan ke {users.find(u => u.id === selectedTask.aiRisk?.suggestedAssigneeId)?.name || 'Rekan Tim'}</span>
                      </button>
                    )}
                    <button
                      onClick={() => applyRiskMitigation(selectedTask.id, 'extend_buffer', undefined, 3)}
                      className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition flex items-center gap-1.5"
                    >
                      <span>Tambah Buffer +3 Hari</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Subtasks Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Daftar Sub-Tugas ({selectedTask.subtasks.filter(s => s.completed).length}/{selectedTask.subtasks.length})
                  </h3>
                </div>
              </div>

              {/* Subtasks List */}
              <div className="space-y-1.5">
                {selectedTask.subtasks.map((st) => (
                  <div
                    key={st.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                      st.completed 
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-slate-500 line-through' 
                        : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <label className="flex items-center gap-3 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={st.completed}
                        onChange={() => toggleSubtask(selectedTask.id, st.id)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs">{st.title}</span>
                    </label>
                    {st.category && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {st.category}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Subtask Form */}
              <form onSubmit={handleAddSubtask} className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Tambah sub-tugas baru..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
                <select
                  value={newSubtaskCategory}
                  onChange={(e) => setNewSubtaskCategory(e.target.value)}
                  className="px-2 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value="General">General</option>
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Design">Design</option>
                  <option value="Operations">Operations</option>
                  <option value="QA">QA</option>
                  <option value="Marketing">Marketing</option>
                </select>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah</span>
                </button>
              </form>
            </div>

            {/* Comments & Activity Stream */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Komentar & Catatan Progres ({taskComments.length})
                </h3>
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handleAddComment} className="space-y-2">
                <div className="relative">
                  <textarea
                    rows={3}
                    placeholder="Tulis update progres atau koordinasi tim... (Tekan Enter untuk membuat baris baru)"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                        handleAddComment(e);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition leading-relaxed resize-y min-h-[72px]"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] text-slate-400">
                    💡 Tip: <strong>Enter</strong> untuk baris baru, <strong>Ctrl + Enter</strong> untuk kirim cepat.
                  </span>
                  <button
                    type="submit"
                    disabled={!newCommentText.trim()}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-xs font-bold text-white transition flex items-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim Komentar</span>
                  </button>
                </div>
              </form>

              {/* Comment Thread */}
              <div className="space-y-2.5">
                {taskComments.map((com) => {
                  const author = users.find(u => u.id === com.userId);
                  return (
                    <div key={com.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 dark:text-white">{author?.name || 'Anggota Tim'}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{com.createdAt}</span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-words">{com.content}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Metadata, Project Switcher, AI Estimator & Actions (1/3 width) */}
          <div className="space-y-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
            {/* 🌟 EDITABLE PROJECT SELECTOR */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <FolderKanban className="w-3.5 h-3.5 text-emerald-600" />
                <span>Project Terkait</span>
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 shadow-xs cursor-pointer"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.icon} {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Assignee Selection */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>Penerima Tugas (Assignee)</span>
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="">-- Belum Ditentukan --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Dates & Estimated Hours */}
            <div className="space-y-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>Tanggal Mulai</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>Tenggat Waktu (Due)</span>
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Estimasi Jam Kerja</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(Number(e.target.value) || 8)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            {/* 🌟 AI SMART ESTIMATOR CARD INSIDE MODAL */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <button
                type="button"
                onClick={handleReEstimate}
                disabled={isEstimating}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition active:scale-95 disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isEstimating ? 'animate-spin' : ''}`} />
                <span>{isEstimating ? 'AI Menganalisis...' : '✨ AI Estimasi Jam & Due Date'}</span>
              </button>

              {estimation && (
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-500/30 space-y-2 animate-fade-in shadow-sm">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-700 dark:text-slate-200">Saran AI:</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold border ${getComplexityColor(estimation.complexityLevel)}`}>
                      {estimation.complexityLevel}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                    <div>⏱️ **Estimasi:** {estimation.estimatedHours} Jam</div>
                    <div>📅 **Target Due:** <span className="text-emerald-600 dark:text-emerald-400 font-bold">{estimation.suggestedDueDate}</span></div>
                    <div className="italic text-[10px] text-slate-500 dark:text-slate-400 pt-1">💡 {estimation.rationale}</div>
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyEstimation}
                    className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Terapkan ke Form</span>
                  </button>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Tag className="w-3 h-3 text-slate-400" />
                <span>Tags / Label</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {selectedTask.tags.map((tag, idx) => (
                  <span key={idx} className="text-xs px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Attachments */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Paperclip className="w-3 h-3 text-slate-400" />
                <span>Lampiran ({selectedTask.attachments.length})</span>
              </label>
              {selectedTask.attachments.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic">Tidak ada lampiran file.</p>
              ) : (
                <div className="space-y-1">
                  {selectedTask.attachments.map(att => (
                    <div key={att.id} className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs truncate">
                      <div className="font-medium truncate">{att.name}</div>
                      <div className="text-[10px] text-slate-400">{att.size} • {att.uploadedAt}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Copilot Deep Query */}
            <button
              onClick={() => {
                setSelectedTaskId(null);
                setIsCopilotOpen(true);
              }}
              className="w-full py-2.5 px-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-orange-950/70 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tanyakan Tugas Ini ke Copilot</span>
            </button>
          </div>
        </div>

        {/* 🌟 MODAL STICKY FOOTER: CONFIRMATION & SAVE ACTION BAR */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex flex-wrap items-center justify-between gap-3 rounded-b-3xl">
          <div className="flex items-center gap-2">
            {isDirty ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800/50 animate-fade-in">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Ada perubahan yang belum disimpan</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
                <Check className="w-3.5 h-3.5" />
                <span>Semua data tersimpan</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setSelectedTaskId(null)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
            >
              Tutup
            </button>

            <button
              type="button"
              onClick={() => handleSaveChanges()}
              disabled={isSaving || !isDirty}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md active:scale-95 ${
                isDirty
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25 ring-2 ring-orange-400/50 animate-pulse'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 border border-slate-300 dark:border-slate-700 opacity-60 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan Perubahan...' : 'Simpan Perubahan Tugas'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
