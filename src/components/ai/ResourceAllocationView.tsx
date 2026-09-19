import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { Users2, AlertTriangle, Building2, X } from 'lucide-react';

export const ResourceAllocationView: React.FC = () => {
  const { users, tasks, setSelectedTaskId, setActiveView } = useProject();

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-100/50 dark:bg-slate-950/70 p-4 sm:p-6 space-y-6 text-slate-800 dark:text-slate-100 transition-colors touch-scroll-y">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users2 className="w-5 h-5 text-emerald-600" />
              <span>Smart Resource Allocation &amp; Workload Planner</span>
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 font-semibold">
              PRD AI USP #3
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            AI menganalisis kapasitas kerja tim, mencegah burnout &amp; kelebihan beban (overload), serta merekomendasikan pendelegasian tugas secara adil.
          </p>
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

      {/* Team Capacity Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(user => {
          const userTasks = tasks.filter(t => t.status !== 'done' && t.assigneeIds.includes(user.id));
          const loadPercentage = Math.round((user.allocatedHours / Math.max(1, user.capacityHours)) * 100);
          const isOverloaded = loadPercentage > 100;
          const isNearFull = loadPercentage >= 80 && loadPercentage <= 100;

          return (
            <div
              key={user.id}
              className={`p-5 rounded-3xl bg-white dark:bg-slate-900/90 border transition shadow-sm flex flex-col justify-between space-y-4 ${
                isOverloaded 
                  ? 'border-rose-300 dark:border-rose-500/40 shadow-rose-100 dark:shadow-rose-950/20' 
                  : isNearFull 
                  ? 'border-amber-300 dark:border-amber-500/30' 
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* User Info Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                    {isOverloaded && (
                      <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-rose-500 text-white" title="Overload">
                        <AlertTriangle className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{user.role}</p>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-semibold mt-0.5 inline-block">
                      {user.department}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-lg ${
                    isOverloaded ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-600/40' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    {loadPercentage}%
                  </span>
                </div>
              </div>

              {/* Workload Capacity Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                  <span>Beban Tugas Aktif:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{userTasks.length} Tugas ({user.allocatedHours} Jam)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOverloaded ? 'bg-rose-500' : isNearFull ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, loadPercentage)}%` }}
                  />
                </div>
                {isOverloaded && (
                  <p className="text-[10px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1 pt-0.5">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>Beban tugas melebihi kapasitas normal mingguan. Berisiko burnout!</span>
                  </p>
                )}
              </div>

              {/* Active Tasks Assigned */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Tugas Aktif ({userTasks.length})</span>
                  <span className="text-[9px] text-slate-500 font-normal">Klik untuk lihat</span>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto pr-1 touch-scroll-y">
                  {userTasks.map(t => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTaskId(t.id)}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 text-xs text-slate-700 dark:text-slate-300 cursor-pointer flex items-center justify-between gap-2 transition"
                    >
                      <span className="truncate text-[11px] font-medium">{t.title}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-white dark:bg-slate-800 text-slate-500 shrink-0 uppercase">{t.status}</span>
                    </div>
                  ))}
                  {userTasks.length === 0 && (
                    <p className="text-[10px] text-slate-400 italic py-1">Tidak ada tugas aktif.</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
