import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Task } from '../../types';
import { ArrowUpDown, AlertTriangle, Plus } from 'lucide-react';

export const ListView: React.FC = () => {
  const { filteredTasks, setSelectedTaskId, users, setIsCreateModalOpen } = useProject();
  const [sortField, setSortField] = useState<keyof Task>('dueDate');
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (field: keyof Task) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const valA = a[sortField] || '';
    const valB = b[sortField] || '';
    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const priorityBadges = {
    low: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
    medium: 'bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-500/30',
    high: 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
    urgent: 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30 font-bold',
  };

  const statusBadges = {
    backlog: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
    todo: 'bg-sky-50 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-500/30',
    in_progress: 'bg-amber-50 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
    review: 'bg-violet-50 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-500/30',
    done: 'bg-emerald-50 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 sm:p-6 space-y-4 text-slate-800 dark:text-readable transition-colors">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3 shrink-0 pb-1">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-readable">Daftar &amp; Tabel Tugas</h2>
          <p className="text-xs text-slate-500 dark:text-muted">Total {sortedTasks.length} tugas ditemukan</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-signal hover:bg-signal-active text-xs font-semibold text-canvas transition shadow-sm elevated-tray"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Tugas Baru</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="flex-1 min-h-0 bg-white dark:bg-surface/70 backdrop-blur border border-slate-200 dark:border-white/8 rounded-lg overflow-hidden shadow-sm flex flex-col elevated-tray">
        <div className="flex-1 overflow-x-auto overflow-y-auto" style={{ 
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          touchAction: 'pan-x pan-y'
        }}>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/8 bg-slate-50 dark:bg-canvas/60 text-slate-500 dark:text-muted font-mono font-bold uppercase tracking-wider sticky top-0 z-10">
                <th className="p-3.5 w-12 text-center">#</th>
                <th className="p-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-readable" onClick={() => handleSort('title')}>
                  <div className="flex items-center gap-1.5">
                    <span>Judul Tugas</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-readable" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-readable" onClick={() => handleSort('priority')}>
                  <div className="flex items-center gap-1.5">
                    <span>Prioritas</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3.5">Assignee</th>
                <th className="p-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-readable" onClick={() => handleSort('dueDate')}>
                  <div className="flex items-center gap-1.5">
                    <span>Tenggat</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3.5">Sub-tugas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/6 text-slate-700 dark:text-slate-300">
              {sortedTasks.map((task, idx) => {
                const assignee = users.find(u => u.id === task.assigneeIds[0]);
                const completedSubtasks = (task.subtasks || []).filter(s => s.completed).length;
                const totalSubtasks = (task.subtasks || []).length;

                return (
                  <tr
                    key={task.id}
                    className="hover:bg-slate-50 dark:hover:bg-white/4 transition cursor-pointer"
                    onClick={() => setSelectedTaskId(task.id)}
                  >
                    <td className="p-3.5 text-center font-mono text-slate-400 text-[11px]">{idx + 1}</td>
                    <td className="p-3.5 font-semibold text-slate-900 dark:text-readable">
                      <div className="flex items-center gap-2">
                        <span>{task.title}</span>
                        {task.aiRisk && task.aiRisk.riskLevel === 'high' && (
                          <span title={task.aiRisk.reason}>
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono uppercase border ${statusBadges[task.status]}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono uppercase border ${priorityBadges[task.priority]}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {assignee ? (
                        <div className="flex items-center gap-2">
                          <img src={assignee.avatar} alt={assignee.name} className="w-5 h-5 rounded-full object-cover" />
                          <span className="truncate max-w-[120px]">{assignee.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-500 dark:text-muted">
                      {task.dueDate}
                    </td>
                    <td className="p-3.5">
                      {totalSubtasks > 0 ? (
                        <span className="font-mono text-[11px] text-info dark:text-info font-semibold">
                          {completedSubtasks}/{totalSubtasks}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
