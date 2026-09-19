import React from 'react';
import { Task, TaskStatus } from '../../types';
import { useProject } from '../../context/ProjectContext';
import { 
  Calendar, 
  CheckSquare, 
  MessageSquare, 
  Paperclip, 
  AlertTriangle, 
  ArrowRight
} from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';

interface TaskCardProps {
  task: Task;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const { setSelectedTaskId, users, moveTaskStatus } = useProject();

  const primaryAssignee = users.find(u => u.id === task.assigneeIds[0]);
  const isAssigneeOverloaded = primaryAssignee ? primaryAssignee.allocatedHours > primaryAssignee.capacityHours : false;

  const priorityColors = {
    low: 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600',
    medium: 'bg-sky-50 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-500/30',
    high: 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
    urgent: 'bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30 font-bold',
  };

  const completedSubtasks = task.subtasks.filter(st => st.completed).length;
  const subtasksTotal = task.subtasks.length;
  const subtaskProgress = subtasksTotal > 0 ? Math.round((completedSubtasks / subtasksTotal) * 100) : 0;

  const getNextStatus = (current: TaskStatus): TaskStatus | null => {
    switch (current) {
      case 'backlog': return 'todo';
      case 'todo': return 'in_progress';
      case 'in_progress': return 'review';
      case 'review': return 'done';
      case 'done': return null;
    }
  };

  const nextStatus = getNextStatus(task.status);

  return (
    <div
      onClick={() => setSelectedTaskId(task.id)}
      className="group relative rounded-lg bg-white dark:bg-surface/90 hover:bg-white dark:hover:bg-surface border border-slate-200 dark:border-white/8 hover:border-emerald-500/50 dark:hover:border-signal/40 p-3.5 transition-all duration-200 shadow-sm dark:shadow-black/20 hover:shadow-lg dark:hover:shadow-emerald-500/5 cursor-pointer flex flex-col justify-between space-y-3"
    >
      {/* Top Header: Priority Badge & AI Risk Indicator */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider font-bold font-mono border ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
          {task.tags.slice(0, 2).map((tag, idx) => (
            <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
              {tag}
            </span>
          ))}
        </div>

        {/* AI Predictive Risk Icon */}
        {task.aiRisk && task.aiRisk.riskLevel === 'high' && (
          <div 
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 text-[10px] font-bold"
            title={`Peringatan Risiko: ${task.aiRisk.reason}`}
          >
            <AlertTriangle className="w-3 h-3 text-rose-500 animate-pulse" />
            <span>Delay ~{task.aiRisk.predictedDelayDays}h</span>
          </div>
        )}
      </div>

      {/* Task Title & Description */}
      <div className="space-y-1">
        <h4 className="text-xs font-bold text-slate-900 dark:text-readable leading-snug group-hover:text-emerald-600 dark:group-hover:text-signal transition">
          {task.title}
        </h4>
        {task.description && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* Subtasks Progress Bar */}
      {subtasksTotal > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <CheckSquare className="w-3 h-3 text-slate-400" />
              <span>{completedSubtasks}/{subtasksTotal} Sub-tugas</span>
            </span>
            <span className="font-mono font-bold text-slate-600 dark:text-slate-300">{subtaskProgress}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-white/6 rounded-full h-1 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                subtaskProgress === 100 
                  ? 'bg-emerald-500' 
                  : subtaskProgress >= 50 
                  ? 'bg-emerald-500/70' 
                  : 'bg-sky-500'
              }`}
              style={{ width: `${subtaskProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer Info: Due Date, Comments, Assignees */}
      <div className="pt-2 border-t border-slate-100 dark:border-white/6 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          {/* Due date */}
          <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>{task.dueDate}</span>
          </div>

          {/* Comments count */}
          {task.commentsCount > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-slate-600 dark:text-slate-400">
              <MessageSquare className="w-3 h-3 text-slate-400" />
              <span>{task.commentsCount}</span>
            </div>
          )}

          {/* Attachments */}
          {task.attachments.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-slate-600 dark:text-slate-400">
              <Paperclip className="w-3 h-3 text-slate-400" />
              <span>{task.attachments.length}</span>
            </div>
          )}
        </div>

        {/* Assignees & Quick Advance Status */}
        <div className="flex items-center gap-1.5">
          {nextStatus && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                moveTaskStatus(task.id, nextStatus);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded-md bg-emerald-50 dark:bg-emerald-600/20 hover:bg-emerald-600 text-emerald-600 dark:text-emerald-300 hover:text-white transition text-[10px] flex items-center gap-0.5"
              title={`Pindahkan ke ${nextStatus.toUpperCase()}`}
            >
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          {/* Assignee Avatar with fail-safe fallback */}
          {primaryAssignee && (
            <UserAvatar 
              src={primaryAssignee.avatar} 
              name={primaryAssignee.name} 
              size="xs" 
            />
          )}
        </div>
      </div>
    </div>
  );
};
