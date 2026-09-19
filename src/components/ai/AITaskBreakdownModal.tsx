import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { GeneratedBreakdown } from '../../utils/aiSimulator';
import { generateLiveAITaskBreakdown } from '../../services/geminiService';
import {
  Sparkles,
  X,
  Layers,
  CheckCircle2,
  Code,
  Palette,
  Server,
  ShieldCheck,
  Building2,
  Truck,
  TrendingUp,
  Users,
  DollarSign,
  Scale,
  ArrowRight
} from 'lucide-react';
import { SubtaskCategory } from '../../types';

export const AITaskBreakdownModal: React.FC = () => {
  const {
    isAIBreakdownModalOpen,
    setIsAIBreakdownModalOpen,
    applyAIBreakdown,
    users,
  } = useProject();

  const [prompt, setPrompt] = useState('Buka cabang operasional baru di Surabaya');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedBreakdown | null>(null);

  if (!isAIBreakdownModalOpen) return null;

  const handleGenerate = async (targetPrompt?: string) => {
    const textToUse = targetPrompt || prompt;
    if (!textToUse.trim()) return;

    setIsGenerating(true);
    setResult(null);

    try {
      const generated = await generateLiveAITaskBreakdown(textToUse, users);
      setResult(generated);
    } catch (e) {
      console.error('Error in task breakdown:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (!result) return;
    applyAIBreakdown(result);
    setIsAIBreakdownModalOpen(false);
    setResult(null);
  };

  const categoryIcons: Record<SubtaskCategory, React.ReactNode> = {
    Operations: <Building2 className="w-3.5 h-3.5 text-amber-500" />,
    Logistics: <Truck className="w-3.5 h-3.5 text-orange-500" />,
    Marketing: <TrendingUp className="w-3.5 h-3.5 text-pink-500" />,
    HR: <Users className="w-3.5 h-3.5 text-cyan-500" />,
    Finance: <DollarSign className="w-3.5 h-3.5 text-emerald-500" />,
    Legal: <Scale className="w-3.5 h-3.5 text-red-500" />,
    Frontend: <Code className="w-3.5 h-3.5 text-blue-500" />,
    Backend: <Server className="w-3.5 h-3.5 text-indigo-500" />,
    Design: <Palette className="w-3.5 h-3.5 text-purple-500" />,
    QA: <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />,
    General: <Layers className="w-3.5 h-3.5 text-slate-500" />,
  };

  const recommendedUser = users.find(u => u.id === result?.recommendedAssigneeId);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in text-slate-800 dark:text-slate-100">
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-50 dark:from-emerald-950/60 via-teal-50 dark:via-teal-950/40 to-white dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Sparkles className="w-4 h-4 text-white animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI Task Breakdown Engine</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 font-semibold">
                  ProMan AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Pecah inisiatif dan ide apapun menjadi langkah-langkah tugas terstruktur secara instan</p>
            </div>
          </div>
          <button
            onClick={() => setIsAIBreakdownModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Direct Prompt Input Box */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Masukkan Rencana / Ide / Kebutuhan Tugas:</span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">Bebas input operasional, teknologi, marketing, HR, logistik, dll.</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Contoh: Buka cabang operasional di Surabaya, atau Migrasi database ke PostgreSQL..."
                className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-inner"
                onKeyDown={(e) => { if (e.key === 'Enter') handleGenerate(); }}
              />
              <button
                onClick={() => handleGenerate()}
                disabled={isGenerating || !prompt.trim()}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700 hover:from-indigo-500 hover:to-pink-500 disabled:opacity-50 text-xs font-bold text-white transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 shrink-0"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>ProMan AI Menganalisis...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Pecah Tugas</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Result */}
          {result && (
            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950/70 border border-emerald-200 dark:border-emerald-500/30 space-y-4 animate-fade-in">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/20">
                      Domain: {result.domain.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">
                      Prioritas: {result.priority.toUpperCase()}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2">{result.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{result.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    {result.subtasks.length} Langkah Sub-tugas
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {result.tags.map((t, idx) => (
                  <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30 font-medium">
                    {t}
                  </span>
                ))}
              </div>

              {/* Subtasks List */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Rincian Langkah Sub-Tugas ({result.subtasks.length} Sub-tugas):
                </div>
                <div className="space-y-2">
                  {result.subtasks.map((st, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs shadow-sm"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                          {categoryIcons[st.category || 'General']}
                        </span>
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{st.title}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700 shrink-0">
                        {st.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assignee Recommendation */}
              {recommendedUser && (
                <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={recommendedUser.avatar} alt={recommendedUser.name} className="w-8 h-8 rounded-full object-cover border border-indigo-400" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Rekomendasi Penanggung Jawab: {recommendedUser.name}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-500/30">
                          {recommendedUser.role} ({recommendedUser.department})
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{result.rationale}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/80">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {result ? 'Klik tombol di kanan untuk memasukkan tugas ke papan' : 'Ketik inisiatif apa saja lalu klik Pecah Tugas'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAIBreakdownModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
            >
              Tutup
            </button>
            {result && (
              <button
                onClick={handleApply}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white transition flex items-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Tambahkan ke Papan Proyek (1-Click)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
