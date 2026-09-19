/**
 * Email template: Task Assigned
 * Sent when a task is assigned to a user.
 */
import { baseLayout, row, statusBadge, priorityBadge } from './baseLayout';

export interface TaskAssignedEmailParams {
  /** Task title */
  taskTitle: string;
  /** Task description */
  taskDescription?: string;
  /** Project name */
  projectName: string;
  /** Current status */
  status: string;
  /** Priority */
  priority: string;
  /** Due date */
  dueDate?: string;
  /** Who assigned the task */
  assignedByName: string;
  /** Absolute URL to the task */
  taskUrl: string;
  /** Assignee email address */
  assigneeEmail: string;
}

export function buildTaskAssignedEmail(params: TaskAssignedEmailParams): {
  subject: string;
  html: string;
} {
  const { taskTitle, taskDescription, projectName, status, priority, dueDate, assignedByName, taskUrl } = params;

  const details = [
    row('📌 Judul', `<strong>${taskTitle}</strong>`),
    row('📁 Project', projectName),
    row('📌 Status', statusBadge(status)),
    row('⚡ Prioritas', priorityBadge(priority)),
    dueDate ? row('📅 Tenggat', `<strong>${dueDate}</strong>`) : '',
    row('👤 Ditugaskan oleh', assignedByName),
  ]
    .filter(Boolean)
    .join('\n');

  const descBlock = taskDescription
    ? `<div style="margin:14px 0;padding:12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;font-size:12px;line-height:1.6;color:#475569;">${escapeHtml(taskDescription.slice(0, 500))}${taskDescription.length > 500 ? '…' : ''}</div>`
    : '';

  const html = baseLayout({
    title: `🎯 Tugas Baru: ${taskTitle}`,
    accent: '#8b5cf6',
    body: `
      <table>${details}</table>
      ${descBlock}
      <div style="text-align:center;margin-top:6px;">
        <a href="${taskUrl}" class="btn" style="background:#8b5cf6;">Mulai Kerjakan Tugas Ini →</a>
      </div>
    `,
  });

  return { subject: `[ProMan] 🎯 Kamu ditugaskan: ${taskTitle}`, html };
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
