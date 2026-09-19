import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { TaskCard } from '../tasks/TaskCard';
import { TaskStatus, TaskPriority } from '../../types';
import { Filter, Sparkles, X, FolderKanban, Users, Search, Layers } from 'lucide-react';

export const KanbanView: React.FC = () => {
  const {
    filteredTasks,
    setIsCreateModalOpen,
    setIsAIBreakdownModalOpen,
    users,
    projects,
    currentProject,
    currentProjectId,
    setCurrentProjectId,
    filters,
    setFilters,
    resetFilters,
    moveTaskStatus,
  } = useProject();

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const columns: { id: TaskStatus; label: string; color: string; badge: string }[] = [
    { id: 'backlog', label: 'Backlog', color: 'border-t-slate-500', badge: 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300' },
    { id: 'todo', label: 'To Do', color: 'border-t-sky-400', badge: 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300' },
    { id: 'in_progress', label: 'In Progress', color: 'border-t-amber-500', badge: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300' },
    { id: 'review', label: 'In Review', color: 'border-t-violet-400', badge: 'bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300' },
    { id: 'done', label: 'Done', color: 'border-t-emerald-500', badge: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' },
  ];

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      moveTaskStatus(taskId, status);
      setDraggedTaskId(null);
    }
  };

  const hasActiveFilters = Boolean(filters.searchQuery || filters.assigneeId || filters.priority || filters.status || filters.tag);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 sm:p-6 space-y-4 text-slate-800 dark:text-readable">
      {/* Top Filter & Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-1 shrink-0">
        {/* Filter Controls Group */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Project Scope Filter Dropdown */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white dark:bg-canvas border border-slate-200 dark:border-white/10 text-xs font-semibold shadow-xs">
            <FolderKanban className="w-3.5 h-3.5 text-emerald-600 dark:text-signal shrink-0" />
            <select
              value={currentProjectId}
              onChange={(e) => setCurrentProjectId(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-slate-800 dark:text-readable focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Project (Global Board)</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Assignee Filter Dropdown */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white dark:bg-canvas border border-slate-200 dark:border-white/10 text-xs shadow-xs">
            <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={filters.assigneeId || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, assigneeId: e.target.value || null }))}
              className="bg-transparent border-none text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="">Semua Anggota Tim</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          {/* Priority Filter Dropdown */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white dark:bg-canvas border border-slate-200 dark:border-white/10 text-xs shadow-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={filters.priority || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: (e.target.value as TaskPriority) || null }))}
              className="bg-transparent border-none text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="">Semua Prioritas</option>
              <option value="urgent">Urgent / Mendesak</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Search Input Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="Cari tugas / tags..."
              className="pl-8 pr-7 py-1.5 rounded-md bg-white dark:bg-canvas border border-slate-200 dark:border-white/10 text-xs text-slate-800 dark:text-readable placeholder-slate-400 input-sentinel shadow-xs"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-readable"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/70 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold transition"
            >
              <X className="w-3 h-3" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>


        {/* Total Count Badge */}
        <span className="text-xs text-slate-500 dark:text-muted font-mono hidden md:inline">
          Total: <strong>{filteredTasks.length}</strong> tiket
        </span>
      </div>

      {/* Kanban Board Columns Container */}
      <div className="flex-1 min-h-0 flex gap-3.5 overflow-x-auto pb-2 items-stretch" style={{ 
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        touchAction: 'pan-x'
      }}>
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`flex flex-col h-full min-w-[270px] sm:min-w-[290px] lg:flex-1 bg-slate-50 dark:bg-surface/70 backdrop-blur rounded-lg border border-slate-200 dark:border-white/8 border-t-[3px] ${col.color} p-3 transition shadow-xs`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/80 dark:border-white/8 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-readable">
                    {col.label}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${col.badge}`}>
                    {colTasks.length}
                  </span>
                </div>
              </div>

              {/* Tasks List Column Area */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5 min-h-[120px]" style={{ 
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain',
                touchAction: 'pan-y'
              }}>
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    className="cursor-grab active:cursor-grabbing transition-transform active:scale-[0.98]"
                  >
                    <TaskCard task={task} />
                  </div>
                ))}

                {colTasks.length === 0 && (
                  <div className="h-28 rounded-lg border border-dashed border-slate-300 dark:border-white/10 flex items-center justify-center text-slate-400 dark:text-muted text-xs">
                    Tidak ada tugas
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
