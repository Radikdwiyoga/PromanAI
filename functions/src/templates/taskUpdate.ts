/**
 * Email template: Task Updated
 * Sent when a task's status or other fields change.
 */
import { baseLayout, row, statusBadge, priorityBadge } from './baseLayout';
import { EMAIL_CONFIG, STATUS_COLORS } from '../config';

export interface TaskUpdateEmailParams {
  /** Task title */
  taskTitle: string;
  /** Task description (optional) */
  taskDescription?: string;
  /** Project name */
  projectName: string;
  /** Previous status key */
  oldStatus: string;
  /** New status key */
  newStatus: string;
  /** Current priority */
  priority: string;
  /** Due date (YYYY-MM-DD) */
  dueDate?: string;
  /** Who made the change */
  changedByName: string;
  /** Absolute URL to the task */
  taskUrl: string;
  /** List of assignee email addresses */
  assigneeEmails: string[];
}

export function buildTaskUpdateEmail(params: TaskUpdateEmailParams): {
  subject: string;
  html: string;
} {
  const { taskTitle, projectName, oldStatus, newStatus, priority, dueDate, changedByName, taskUrl, assigneeEmails } = params;

  const statusChanged = oldStatus !== newStatus;
  const headline = statusChanged
    ? `📌 Status Tugas Diubah: ${taskTitle}`
    : `📝 Tugas Diperbarui: ${taskTitle}`;

  const details = [
    row('📌 Judul', `<strong>${taskTitle}</strong>`),
    row('📁 Project', projectName),
    statusChanged
      ? row('🔄 Status', `${statusBadge(oldStatus)} &nbsp;→&nbsp; ${statusBadge(newStatus)}`)
      : row('📌 Status', statusBadge(newStatus)),
    row('⚡ Prioritas', priorityBadge(priority)),
    dueDate ? row('📅 Tenggat', `<strong>${dueDate}</strong>`) : '',
    row('👤 Diubah oleh', changedByName),
  ]
    .filter(Boolean)
    .join('\n');

  const html = baseLayout({
    title: headline,
    accent: STATUS_COLORS[newStatus] || '#10b981',
    body: `
      <table>${details}</table>
      <hr class="divider" />
      <div style="text-align:center;">
        <a href="${taskUrl}" class="btn">Lihat Detail Tugas →</a>
      </div>
    `,
  });

  return { subject: `[ProMan] ${headline}`, html };
}
