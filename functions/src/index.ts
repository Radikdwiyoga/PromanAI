/**
 * ProMan-AI Cloud Functions — Email Notification Triggers
 *
 * Triggers:
 *   1. onTaskUpdate    – fires when a task document is updated in Firestore
 *   2. onCommentCreate – fires when a new comment document is created
 *   3. checkDeadlines  – scheduled function that checks for upcoming deadlines daily
 */
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import { sendEmail } from './services/emailService';
import { buildTaskUpdateEmail } from './templates/taskUpdate';
import { buildNewCommentEmail } from './templates/newComment';
import { buildTaskAssignedEmail } from './templates/taskAssigned';
import { buildDeadlineReminderEmail } from './templates/deadlineReminder';
import { EMAIL_CONFIG, STATUS_LABELS } from './config';

// ─── Initialize Firebase Admin ───────────────────────────────────────────────
admin.initializeApp();
const db = admin.firestore();

// ─── Types ───────────────────────────────────────────────────────────────────

interface FirestoreTask {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assigneeIds: string[];
  tags: string[];
  startDate: string;
  dueDate: string;
  estimatedHours?: number;
  loggedHours?: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
}

interface FirestoreComment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
  mentions?: string[];
}

interface FirestoreUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  department: string;
}

interface FirestoreProject {
  id: string;
  name: string;
  description: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Resolve an array of user IDs to their Firestore documents. */
async function resolveUsers(userIds: string[]): Promise<FirestoreUser[]> {
  if (!userIds || userIds.length === 0) return [];

  // Firestore `in` query supports max 30 items per query
  const chunks: string[][] = [];
  for (let i = 0; i < userIds.length; i += 30) {
    chunks.push(userIds.slice(i, i + 30));
  }

  const users: FirestoreUser[] = [];
  for (const chunk of chunks) {
    const snap = await db
      .collection('users')
      .where('__name__', 'in', chunk)
      .get();
    snap.forEach((doc) => users.push(doc.data() as FirestoreUser));
  }
  return users;
}

/** Get a single document by collection + id. */
async function getDoc<T>(collection: string, id: string): Promise<T | null> {
  const snap = await db.collection(collection).doc(id).get();
  return snap.exists ? (snap.data() as T) : null;
}

/** Build the task URL for the email CTA. */
function taskUrl(taskId: string, projectId: string): string {
  const base = EMAIL_CONFIG.app.baseUrl || 'https://proman-83c57.web.app';
  return `${base}/project/${projectId}?task=${taskId}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. ON TASK UPDATE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Triggers when a task document in the `tasks` collection is updated.
 *
 * Sends emails for:
 *   - Status change
 *   - Assignee change (new assignees get notified)
 *   - Due date change
 */
export const onTaskUpdate = functions.firestore
  .document('tasks/{taskId}')
  .onUpdate(async (change, context) => {
    const taskId = context.params.taskId;
    const before = change.before.data() as FirestoreTask;
    const after = change.after.data() as FirestoreTask;

    // Skip if no meaningful change
    const statusChanged = before.status !== after.status;
    const assigneesChanged =
      JSON.stringify(before.assigneeIds?.sort()) !==
      JSON.stringify(after.assigneeIds?.sort());
    const dueDateChanged = before.dueDate !== after.dueDate;
    const priorityChanged = before.priority !== after.priority;

    if (!statusChanged && !assigneesChanged && !dueDateChanged && !priorityChanged) {
      console.log(`Task ${taskId}: No notification-worthy change detected, skipping.`);
      return;
    }

    try {
      // Resolve project name
      const project = await getDoc<FirestoreProject>('projects', after.projectId);
      const projectName = project?.name || 'Unknown Project';

      // ── Case 1: Assignees changed → notify newly added assignees ──
      if (assigneesChanged) {
        const oldSet = new Set(before.assigneeIds || []);
        const newAssignees = (after.assigneeIds || []).filter(
          (id: string) => !oldSet.has(id)
        );

        if (newAssignees.length > 0) {
          const users = await resolveUsers(newAssignees);
          for (const user of users) {
            if (!user.email) {
              console.warn(`User ${user.id} has no email, skipping notification.`);
              continue;
            }
            const { subject, html } = buildTaskAssignedEmail({
              taskTitle: after.title,
              taskDescription: after.description,
              projectName,
              status: after.status,
              priority: after.priority,
              dueDate: after.dueDate,
              assignedByName: 'Project Manager',
              taskUrl: taskUrl(taskId, after.projectId),
              assigneeEmail: user.email,
            });

            await sendEmail({
              to: [user.email],
              subject,
              html,
            });
            console.log(`Task assigned email sent to ${user.email} for task ${taskId}`);
          }
        }
      }

      // ── Case 2: Status / priority / due date changed → notify existing assignees ──
      if (statusChanged || priorityChanged || dueDateChanged) {
        // Filter out the "doer" (the person who made the change) by checking activity logs
        const recentLog = await db
          .collection('activity_logs')
          .where('taskId', '==', taskId)
          .orderBy('timestamp', 'desc')
          .limit(1)
          .get();

        let changedByUserId = '';
        let changedByName = 'Someone';
        if (!recentLog.empty) {
          const logData = recentLog.docs[0].data();
          changedByUserId = logData.userId;
          const changer = await getDoc<FirestoreUser>('users', changedByUserId);
          changedByName = changer?.name || 'Someone';
        }

        // Notify all assignees EXCEPT the person who made the change
        const notifyUserIds = (after.assigneeIds || []).filter(
          (id: string) => id !== changedByUserId
        );

        const users = await resolveUsers(notifyUserIds);
        const recipientEmails = users
          .filter((u) => u.email)
          .map((u) => u.email);

        if (recipientEmails.length > 0) {
          const { subject, html } = buildTaskUpdateEmail({
            taskTitle: after.title,
            taskDescription: after.description,
            projectName,
            oldStatus: before.status,
            newStatus: after.status,
            priority: after.priority,
            dueDate: after.dueDate,
            changedByName,
            taskUrl: taskUrl(taskId, after.projectId),
            assigneeEmails: recipientEmails,
          });

          await sendEmail({
            to: recipientEmails,
            subject,
            html,
          });
          console.log(
            `Task update email sent to ${recipientEmails.length} recipients for task ${taskId}`
          );
        }
      }
    } catch (error) {
      console.error(`Error in onTaskUpdate for task ${taskId}:`, error);
    }
  });

// ─────────────────────────────────────────────────────────────────────────────
// 2. ON COMMENT CREATE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Triggers when a new comment document is created in the `comments` collection.
 * Sends an email to all task assignees (except the comment author).
 */
export const onCommentCreate = functions.firestore
  .document('comments/{commentId}')
  .onCreate(async (snap, context) => {
    const comment = snap.data() as FirestoreComment;
    const commentId = context.params.commentId;

    try {
      // Get the task
      const task = await getDoc<FirestoreTask>('tasks', comment.taskId);
      if (!task) {
        console.warn(`Comment ${commentId}: Parent task ${comment.taskId} not found, skipping.`);
        return;
      }

      // Get the project
      const project = await getDoc<FirestoreProject>('projects', task.projectId);
      const projectName = project?.name || 'Unknown Project';

      // Get the comment author
      const author = await getDoc<FirestoreUser>('users', comment.userId);
      const authorName = author?.name || 'Someone';

      // Notify assignees EXCEPT the comment author
      const notifyUserIds = (task.assigneeIds || []).filter(
        (id: string) => id !== comment.userId
      );

      const users = await resolveUsers(notifyUserIds);
      const recipientEmails = users
        .filter((u) => u.email)
        .map((u) => u.email);

      if (recipientEmails.length === 0) {
        console.log(`Comment ${commentId}: No assignees to notify, skipping.`);
        return;
      }

      const { subject, html } = buildNewCommentEmail({
        taskTitle: task.title,
        projectName,
        authorName,
        commentContent: comment.content,
        taskStatus: task.status,
        taskUrl: taskUrl(comment.taskId, task.projectId),
        assigneeEmails: recipientEmails,
      });

      await sendEmail({
        to: recipientEmails,
        subject,
        html,
      });
      console.log(
        `New comment email sent to ${recipientEmails.length} recipients for task ${comment.taskId}`
      );
    } catch (error) {
      console.error(`Error in onCommentCreate for comment ${commentId}:`, error);
    }
  });

// ─────────────────────────────────────────────────────────────────────────────
// 3. DEADLINE REMINDER (Scheduled)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Runs daily at 08:00 WIB (01:00 UTC).
 * Checks all non-done tasks and sends reminders for tasks due within 1-2 days.
 */
export const checkDeadlines = functions.pubsub
  .schedule('0 1 * * *') // 01:00 UTC = 08:00 WIB
  .timeZone('Asia/Jakarta')
  .onRun(async () => {
    console.log('Running daily deadline check…');

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

    // "Tomorrow" and "day after tomorrow"
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const dayAfter = new Date(now);
    dayAfter.setDate(dayAfter.getDate() + 2);
    const dayAfterStr = dayAfter.toISOString().split('T')[0];

    try {
      // Get all tasks that are NOT done
      const tasksSnap = await db
        .collection('tasks')
        .where('status', '!=', 'done')
        .get();

      for (const taskDoc of tasksSnap.docs) {
        const task = taskDoc.data() as FirestoreTask;

        if (!task.dueDate) continue;

        // Calculate remaining days
        const dueDate = new Date(task.dueDate + 'T00:00:00');
        const diffMs = dueDate.getTime() - now.getTime();
        const remainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        // Only send for tasks due today, tomorrow, or day after tomorrow
        if (remainingDays < 0 || remainingDays > 2) continue;

        // Resolve project
        const project = await getDoc<FirestoreProject>('projects', task.projectId);
        const projectName = project?.name || 'Unknown Project';

        // Get assignee emails
        const users = await resolveUsers(task.assigneeIds || []);
        const recipientEmails = users
          .filter((u) => u.email)
          .map((u) => u.email);

        if (recipientEmails.length === 0) continue;

        const { subject, html } = buildDeadlineReminderEmail({
          taskTitle: task.title,
          projectName,
          priority: task.priority,
          dueDate: task.dueDate,
          remainingDays,
          taskUrl: taskUrl(task.id, task.projectId),
          assigneeEmails: recipientEmails,
        });

        await sendEmail({
          to: recipientEmails,
          subject,
          html,
        });
        console.log(
          `Deadline reminder sent for task "${task.title}" (${remainingDays} day(s) left)`
        );
      }

      console.log('Deadline check complete.');
    } catch (error) {
      console.error('Error in checkDeadlines:', error);
    }
  });
