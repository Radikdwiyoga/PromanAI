import type { Task, Comment, User } from '../types';

/**
 * Telegram Bot Notification Service (100% client-side, free)
 * ------------------------------------------------------------------
 * Uses the public Telegram Bot API directly from the browser.
 * No backend / Cloud Functions required — works on Firebase Spark plan.
 *
 * IMPORTANT: The bot token is embedded in the frontend bundle. For this
 * personal/small-team use case (notifications to a fixed chat) that is
 * acceptable, but do NOT use this pattern for sensitive or public-facing
 * bots where the token must stay secret.
 */

const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '';
const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID || '';

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

/** Return true when a bot token & chat id are configured in .env */
export const isTelegramEnabled = (): boolean => Boolean(BOT_TOKEN && CHAT_ID);

/** Escape text for Telegram Bot API HTML parse mode */
const esc = (s: string): string =>
  (s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const formatDate = (d?: string): string => {
  if (!d) return '-';
  try {
    return new Date(d).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return d;
  }
};

const STATUS_EMOJI: Record<string, string> = {
  backlog: '🗂️',
  todo: '📝',
  in_progress: '🔥',
  review: '👀',
  done: '✅',
};

const STATUS_LABEL: Record<string, string> = {
  backlog: 'Backlog',
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
};

const PRIORITY_EMOJI: Record<string, string> = {
  low: '🟢',
  medium: '🟡',
  high: '🟠',
  urgent: '🔴',
};

/**
 * Detailed result type for UI diagnostics
 */
export type TelegramSendResult = {
  success: boolean;
  error?: string;
  errorCode?: number;
};

/**
 * Low-level sender. Sends a message to the configured chat.
 * Returns true on success (fire-and-forget friendly).
 */
export const sendTelegramMessage = async (text: string): Promise<boolean> => {
  const result = await sendTelegramMessageDetailed(text);
  return result.success;
};

/**
 * Detailed sender that returns structured error info for the UI.
 */
export const sendTelegramMessageDetailed = async (text: string): Promise<TelegramSendResult> => {
  if (!isTelegramEnabled()) {
    const err = 'VITE_TELEGRAM_BOT_TOKEN atau VITE_TELEGRAM_CHAT_ID belum dikonfigurasi di .env';
    console.warn('[Telegram]', err);
    return { success: false, error: err };
  }
  try {
    const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
    const data = await response.json();
    if (!data.ok) {
      const errMsg = data.description || JSON.stringify(data);
      console.error('[Telegram] send failed:', errMsg);
      return { success: false, error: errMsg, errorCode: data.error_code };
    }
    return { success: true };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('[Telegram] send error:', errMsg);
    return { success: false, error: errMsg };
  }
};

/** Resolve assignee names from user ids */
const resolveAssigneeNames = (task: Task, users: User[]): string => {
  const names = (task.assigneeIds || [])
    .map(id => users.find(u => u.id === id)?.name)
    .filter(Boolean) as string[];
  return names.length > 0 ? names.join(', ') : 'Belum ditugaskan';
};

/**
 * Generate detailed change description for Telegram notifications
 * Shows line-by-line differences between old and new descriptions
 */
export const getDescriptionChanges = (
  oldDescription: string,
  newDescription: string,
  actorName: string,
  timestamp: string = new Date().toLocaleString('id-ID')
): string[] => {
  const lines: string[] = [];

  if (!oldDescription && newDescription) {
    // New description created
    lines.push(`📝 <i>Deskripsi dibuat oleh ${esc(actorName)} pada ${timestamp}</i>`);
    lines.push(`${esc(newDescription.slice(0, 500))}${newDescription.length > 500 ? '...' : ''}`);
    return lines;
  }

  if (oldDescription && !newDescription) {
    // Description removed
    lines.push(`📝 <i>Deskripsi dihapus oleh ${esc(actorName)} pada ${timestamp}</i>`);
    lines.push(`${esc(oldDescription.slice(0, 500))}${oldDescription.length > 500 ? '...' : ''}`);
    return lines;
  }

  if (!oldDescription && !newDescription) {
    return lines;
  }

  // Both descriptions exist, show detailed changes
  const oldLines = oldDescription.split('\n');
  const newLines = newDescription.split('\n');
  const maxLines = Math.max(oldLines.length, newLines.length);

  lines.push(`📝 <i>Deskripsi diperbarui oleh ${esc(actorName)} pada ${timestamp}</i>`);

  for (let i = 0; i < maxLines; i++) {
    const oldLine = oldLines[i] || '';
    const newLine = newLines[i] || '';

    if (oldLine !== newLine) {
      if (oldLine && !newLine) {
        // Line deleted
        lines.push(`➖ <i>Baris ${i + 1} dihapus: "${esc(oldLine)}"</i>`);
      } else if (!oldLine && newLine) {
        // Line added
        lines.push(`➕ <i>Baris ${i + 1} ditambahkan: "${esc(newLine)}"</i>`);
      } else {
        // Line modified
        lines.push(`🔄 <i>Baris ${i + 1} diubah:</i>`);
        lines.push(`   <i>dari: "${esc(oldLine)}"</i>`);
        lines.push(`   <i>menjadi: "${esc(newLine)}"</i>`);
      }
    }
  }

  if (oldDescription !== newDescription) {
    // Overall description summary
    const addedLines = newLines.filter((line, i) => i >= oldLines.length).join('\n');
    const removedLines = oldLines.filter((line, i) => i >= newLines.length).join('\n');

    if (addedLines) {
      lines.push(`➕ <i>Konten ditambahkan:</i> ${esc(addedLines.slice(0, 200))}${addedLines.length > 200 ? '...' : ''}`);
    }
    if (removedLines) {
      lines.push(`➖ <i>Konten dihapus:</i> ${esc(removedLines.slice(0, 200))}${removedLines.length > 200 ? '...' : ''}`);
    }
  }

  return lines;
};

/** ── High-level notification builders ─────────────────────────── */

export const sendTaskCreatedNotification = async (
  task: Task,
  actorName: string,
  users: User[],
): Promise<boolean> => {
  const lines = [
    `📋 <b>Task Baru Dibuat</b>`,
    ``,
    `🏷️ <b>${esc(task.title)}</b>`,
    `${PRIORITY_EMOJI[task.priority] || '⚪'} Prioritas: <b>${esc(task.priority)}</b>`,
    `${STATUS_EMOJI[task.status] || '•'} Status: <b>${esc(STATUS_LABEL[task.status] || task.status)}</b>`,
    `👤 Assignee: ${esc(resolveAssigneeNames(task, users))}`,
    `📅 Tenggat: ${formatDate(task.dueDate)}`,
    ``,
    `👤 Oleh: ${esc(actorName)}`,
  ];
  return sendTelegramMessage(lines.join('\n'));
};

export const sendTaskUpdatedNotification = async (
  task: Task,
  updates: Partial<Task>,
  actorName: string,
  users: User[],
): Promise<boolean> => {
  const changed: string[] = [];
  const enrichedDetails: string[] = [];

  // Check for changes with detailed descriptions
  if (updates.title) {
    changed.push(`🏷️ <b>Judul</b>: <b>${esc(updates.title)}</b>`);
    enrichedDetails.push(`📝 <i>Perubahan: dari "${esc(task.title)}" menjadi "${esc(updates.title)}"</i>`);
  }
  if (updates.priority) {
    changed.push(`${PRIORITY_EMOJI[updates.priority]} <b>Prioritas</b>: <b>${esc(updates.priority)}</b>`);
    enrichedDetails.push(`📊 <i>Prioritas diubah dari "${task.priority}" menjadi "${updates.priority}"</i>`);
  }
  if (updates.dueDate) {
    changed.push(`📅 <b>Tenggat Waktu</b>: <b>${formatDate(updates.dueDate)}</b>`);
    enrichedDetails.push(`📅 <i>Tenggat diubah dari "${formatDate(task.dueDate)}" menjadi "${formatDate(updates.dueDate)}"</i>`);
  }
  if (updates.assigneeIds) {
    const oldAssignees = resolveAssigneeNames({ ...task, assigneeIds: task.assigneeIds }, users);
    const newAssignees = resolveAssigneeNames({ ...task, assigneeIds: updates.assigneeIds }, users);
    changed.push(`👥 <b>Assignee</b>: <b>${esc(newAssignees)}</b>`);
    enrichedDetails.push(`👥 <i>Assignee diubah dari "${oldAssignees}" menjadi "${newAssignees}"</i>`);
  }
  if (updates.description) {
    const descriptionChanges = getDescriptionChanges(
      task.description || '', 
      updates.description,
      actorName
    );
    changed.push(`📝 <b>Deskripsi</b>: Diperbarui`);
    enrichedDetails.push(...descriptionChanges);
  }
  if (updates.subtasks) {
    changed.push(`🧩 <b>Subtasks</b>: Diperbarui (${updates.subtasks.length} total)`);
    enrichedDetails.push(`🧩 <i>Subtasks: ${updates.subtasks.filter(st => st.completed).length}/${updates.subtasks.length} selesai</i>`);
  }

  if (changed.length === 0) return false;

  const lines = [
    `✏️ <b>Notifikasi: Perubahan Tugas - ${new Date().toLocaleString('id-ID')}</b>`,
    ``,
    `📋 <b>Detail Tugas</b>`,
    `🏷️ <b>${esc(task.title)}</b>`,
    `${PRIORITY_EMOJI[task.priority] || '⚪'} <b>Prioritas Sekarang</b>: ${PRIORITY_EMOJI[task.priority] || '⚪'} <b>${esc(task.priority)}</b>`,
    `${STATUS_EMOJI[task.status] || '•'} <b>Status Sekarang</b>: ${STATUS_EMOJI[task.status] || '•'} <b>${esc(STATUS_LABEL[task.status] || task.status)}</b>`,
    `👤 <b>Assignee Sekarang</b>: ${esc(resolveAssigneeNames(task, users))}`,
    ``,
    `📊 <b>Perubahan Terjadi</b>`,
    ...changed,
    ``,
    enrichedDetails.length > 0 && [
      `📝 <b>Detail Perubahan</b>`,
      ...enrichedDetails,
      ``
    ].flat(),
    `👤 <b>Pelaksana</b>: ${esc(actorName)}`,
    `⏰ <b>Waktu Perubahan</b>: ${new Date().toLocaleString('id-ID')}`,
  ].flat().filter(Boolean);
  return sendTelegramMessage(lines.join('\n'));
};

export const sendTaskStatusNotification = async (
  task: Task,
  newStatus: string,
  actorName: string,
): Promise<boolean> => {
  const lines = [
    `${STATUS_EMOJI[newStatus] || '🔁'} <b>Status Task Berubah</b>`,
    ``,
    `🏷️ <b>${esc(task.title)}</b>`,
    `${STATUS_EMOJI[task.status] || '•'} ${esc(STATUS_LABEL[task.status] || task.status)}`,
    `  →  ${STATUS_EMOJI[newStatus] || '•'} <b>${esc(STATUS_LABEL[newStatus] || newStatus)}</b>`,
    ``,
    `👤 Oleh: ${esc(actorName)}`,
  ];
  return sendTelegramMessage(lines.join('\n'));
};

export const sendCommentNotification = async (
  task: Task,
  comment: Comment,
  actorName: string,
): Promise<boolean> => {
  const lines = [
    `💬 <b>Komentar Baru</b>`,
    ``,
    `🏷️ <b>${esc(task.title)}</b>`,
    `👤 ${esc(actorName)}:`,
    `${esc(comment.content.slice(0, 300))}`,
  ];
  return sendTelegramMessage(lines.join('\n'));
};

/** Test helper: send a simple ping to confirm the bot works (detailed for UI) */
export const sendTelegramTestMessage = (): Promise<TelegramSendResult> =>
  sendTelegramMessageDetailed('🟢 <b>ProMan Notification Bot</b> terhubung dengan sukses!');

/** Return current config status for display */
export const getTelegramConfigStatus = (): { configured: boolean; chatId: string; hasToken: boolean } => ({
  configured: isTelegramEnabled(),
  chatId: CHAT_ID || '(belum diatur)',
  hasToken: Boolean(BOT_TOKEN),
});
