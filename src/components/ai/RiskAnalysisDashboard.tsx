import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { analyzeProjectRisks } from '../../utils/aiSimulator';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  Activity, 
  Sparkles, 
  ArrowRight,
  X
} from 'lucide-react';

export const RiskAnalysisDashboard: React.FC = () => {
  const { tasks, users, applyRiskMitigation, setSelectedTaskId, currentProject, setActiveView } = useProject();
  const riskSummary = analyzeProjectRisks(tasks, users);

  const statusColors = {
    healthy: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-500/30',
    warning: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-500/30',
    critical: 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-500/30',
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-100/50 dark:bg-slate-950/70 p-4 sm:p-6 space-y-6 text-slate-800 dark:text-slate-100 transition-colors touch-scroll-y">
      {/* Top Banner: PRD Badge & Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <span>Predictive Risk &amp; Delay Analysis Dashboard</span>
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 font-semibold">
              PRD AI USP #2
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            AI memantau laju penyelesaian tugas anggota tim, mendeteksi bottleneck sejak dini, dan memberikan rekomendasi mitigasi keterlambatan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Global Health Score Badge */}
          <div className={`px-4 py-2 rounded-2xl border flex items-center gap-3 shadow-sm ${statusColors[riskSummary.status]}`}>
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold tracking-wider">Status Risiko Proyek</div>
              <div className="text-sm font-extrabold">{riskSummary.status.toUpperCase()} ({riskSummary.overallScore}/100)</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/80 dark:bg-black/40 flex items-center justify-center font-mono font-bold text-sm shadow-inner">
              {riskSummary.overallScore}%
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setActiveView('kanban')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition shadow-xs active:scale-95"
            title="Tutup & Kembali ke Papan Proyek"
          >
            <X className="w-4 h-4 text-slate-400" />
            <span>Tutup</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: At-Risk Tasks */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Tugas Berisiko Tinggi</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
            {riskSummary.atRiskTasksCount} <span className="text-xs text-slate-500 font-normal">tiket</span>
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            Membutuhkan tindakan pencegahan PM
          </div>
        </div>

        {/* Card 2: Cumulative Predicted Delay */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Estimasi Keterlambatan</span>
            <Clock className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
            ~{riskSummary.totalDelayPredictedDays} <span className="text-xs text-slate-500 font-normal">hari kerja</span>
          </div>
          <div className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
            Jika tidak dilakukan redistribusi tugas
          </div>
        </div>

        {/* Card 3: Overloaded Members */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Anggota Overload (&gt;100%)</span>
            <Activity className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
            {riskSummary.overloadedMembersCount} <span className="text-xs text-slate-500 font-normal">orang</span>
          </div>
          <div className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
            Alokasi jam melebihi kapasitas sprint
          </div>
        </div>

        {/* Card 4: Model Accuracy */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Akurasi Model Prediksi</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
            92.4% <span className="text-xs text-slate-500 font-normal">(Margin &lt;15%)</span>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            Memenuhi target Success Metrics PRD
          </div>
        </div>
      </div>

      {/* Actionable Risk Alerts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Peringatan Risiko Terdeteksi &amp; Saran Mitigasi AI</span>
          </h3>
          <span className="text-[11px] text-slate-500">
            Klik tombol mitigasi untuk menerapkan aksi langsung
          </span>
        </div>

        {riskSummary.recommendations.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center space-y-2 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center font-bold">
              ?
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Semua Tugas Berjalan Aman</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Tidak ada risiko keterlambatan kritis terdeteksi pada project "{currentProject.name}". Beban kerja tim dalam batas wajar.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {riskSummary.recommendations.map(rec => {
              const suggestedAssignee = users.find(u => u.id === rec.targetAssigneeId);

              return (
                <div 
                  key={rec.taskId} 
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition"
                >
                  {/* Task Header & Risk Meter */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">
                          Skor Risiko: {rec.riskScore}/100
                        </span>
                        {rec.isOverdue && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-500/30">
                          ⚠️ {rec.overdueDays} Hari Terlambat
                          </span>
                        )}
                        {rec.predictedDelayDays && rec.predictedDelayDays > 0 && !rec.isOverdue && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-500/20 text-orange-800 dark:text-orange-300 border border-orange-300 dark:border-orange-500/30">
                          Estimasi delay: {rec.predictedDelayDays} hari
                          </span>
                        )}
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white hover:text-emerald-700 cursor-pointer" onClick={() => setSelectedTaskId(rec.taskId)}>
                          {rec.taskTitle}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {rec.reason}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedTaskId(rec.taskId)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition shrink-0"
                    >
                      Buka Detail
                    </button>
                  </div>

                  {/* Mitigation Actions Box */}
                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                      <div className="text-xs text-slate-800 dark:text-slate-200">
                        <span className="font-bold">Rekomendasi AI: </span>
                        <span>{rec.suggestion}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {rec.actionType === 'reassign' && suggestedAssignee && (
                        <button
                          onClick={() => applyRiskMitigation(rec.taskId, 'reassign', suggestedAssignee.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-md shadow-indigo-500/20 transition flex items-center gap-1.5"
                        >
                          <span>Alihkan ke {suggestedAssignee.name.split(' ')[0]} (1-Click)</span>
                        </button>
                      )}

                      {rec.actionType === 'split_task' && (
                        <button
                          onClick={() => applyRiskMitigation(rec.taskId, 'split_task')}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-xs font-bold text-white shadow-md shadow-amber-500/20 transition flex items-center gap-1.5"
                        >
                          <span>Pecahkan Tugas (1-Click)</span>
                        </button>
                      )}

                      {rec.actionType === 'reduce_scope' && (
                        <button
                          onClick={() => applyRiskMitigation(rec.taskId, 'reduce_scope')}
                          className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-xs font-bold text-white shadow-md shadow-violet-500/20 transition flex items-center gap-1.5"
                        >
                          <span>Kurangi Lingkup</span>
                        </button>
                      )}

                      {(rec.actionType === 'extend_buffer' || rec.actionType === 'reduce_scope') && (
                        <button
                          onClick={() => applyRiskMitigation(rec.taskId, 'extend_buffer', undefined, rec.suggestedBufferDays || 3)}
                          className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition flex items-center gap-1.5 shadow-sm"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Setujui Buffer (+{rec.suggestedBufferDays || 3} Hari)</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
