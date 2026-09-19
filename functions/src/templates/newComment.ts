/**
 * Email template: New Comment
 * Sent when someone posts a comment on a task.
 */
import { baseLayout, row, statusBadge } from './baseLayout';

export interface NewCommentEmailParams {
  /** Task title */
  taskTitle: string;
  /** Project name */
  projectName: string;
  /** Comment author display name */
  authorName: string;
  /** Comment content (plain text) */
  commentContent: string;
  /** Task status */
  taskStatus: string;
  /** Absolute URL to the task */
  taskUrl: string;
  /** Assignee email addresses */
  assigneeEmails: string[];
}

export function buildNewCommentEmail(params: NewCommentEmailParams): {
  subject: string;
  html: string;
} {
  const { taskTitle, projectName, authorName, commentContent, taskStatus, taskUrl } = params;

  // Truncate long comments for the preview
  const snippet =
    commentContent.length > 300
      ? commentContent.slice(0, 300) + '…'
      : commentContent;

  const details = [
    row('📌 Tugas', `<strong>${taskTitle}</strong>`),
    row('📁 Project', projectName),
    row('📌 Status', statusBadge(taskStatus)),
    row('💬 Oleh', `<strong>${authorName}</strong>`),
  ].join('\n');

  const html = baseLayout({
    title: `💬 Komentar Baru: ${taskTitle}`,
    accent: '#3b82f6',
    body: `
      <table>${details}</table>
      <div style="margin:16px 0;padding:14px 16px;background:#f1f5f9;border-left:4px solid #3b82f6;border-radius:8px;font-size:13px;line-height:1.65;white-space:pre-wrap;">${escapeHtml(snippet)}</div>
      <div style="text-align:center;">
        <a href="${taskUrl}" class="btn" style="background:#3b82f6;">Buka Tugas & Lihat Komentar →</a>
      </div>
    `,
  });

  return { subject: `[ProMan] 💬 ${authorName} berkomentar di: ${taskTitle}`, html };
}

/** Minimal HTML-entity escaping. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
