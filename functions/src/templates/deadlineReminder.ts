/**
 * Email template: Deadline Reminder
 * Sent 1 day before a task's due date.
 */
import { baseLayout, row, statusBadge, priorityBadge } from './baseLayout';
import { PRIORITY_COLORS } from '../config';

export interface DeadlineReminderEmailParams {
  /** Task title */
  taskTitle: string;
  /** Project name */
  projectName: string;
  /** Priority */
  priority: string;
  /** Due date (YYYY-MM-DD) */
  dueDate: string;
  /** Remaining days (1 = tomorrow) */
  remainingDays: number;
  /** Absolute URL to the task */
  taskUrl: string;
  /** Assignee email addresses */
  assigneeEmails: string[];
}

export function buildDeadlineReminderEmail(params: DeadlineReminderEmailParams): {
  subject: string;
  html: string;
} {
  const { taskTitle, projectName, priority, dueDate, remainingDays, taskUrl } = params;

  const urgency =
    remainingDays === 0
      ? '⏰ Tugas ini jatuh tempo HARI INI!'
      : remainingDays === 1
        ? '⚠️ Tugas ini jatuh tempo BESOK!'
        : `⚠️ Tugas ini jatuh tempo dalam ${remainingDays} hari`;

  const accentColor = PRIORITY_COLORS[priority] || '#f59e0b';

  const details = [
    row('📌 Judul', `<strong>${taskTitle}</strong>`),
    row('📁 Project', projectName),
    row('⚡ Prioritas', priorityBadge(priority)),
    row('📅 Tenggat', `<strong style="color:${accentColor};">${dueDate}</strong>`),
    row('⏳ Sisa Waktu', remainingDays === 0 ? '<strong style="color:#ef4444;">Hari ini</strong>' : `<strong>${remainingDays} hari lagi</strong>`),
  ].join('\n');

  const html = baseLayout({
    title: urgency,
    accent: accentColor,
    body: `
      <table>${details}</table>
      <div style="text-align:center;margin-top:6px;">
        <a href="${taskUrl}" class="btn" style="background:${accentColor};">Buka Tugas & Mulai Kerjakan →</a>
      </div>
    `,
  });

  return { subject: `[ProMan] ${urgency} — ${taskTitle}`, html };
}
