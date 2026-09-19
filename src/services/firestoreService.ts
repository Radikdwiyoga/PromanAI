import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  onSnapshot, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  writeBatch 
} from 'firebase/firestore';
import { db } from './firebase';
import { Project, Task, User, Comment, ActivityLog, SystemSettings } from '../types';
import { 
  INITIAL_PROJECTS, 
  INITIAL_USERS, 
  INITIAL_TASKS, 
  INITIAL_COMMENTS, 
  INITIAL_ACTIVITY_LOGS, 
  INITIAL_SYSTEM_SETTINGS 
} from '../data/initialData';

// Collection references
const PROJECTS_COL = 'projects';
const TASKS_COL = 'tasks';
const USERS_COL = 'users';
const COMMENTS_COL = 'comments';
const ACTIVITY_LOGS_COL = 'activity_logs';
const SETTINGS_DOC = 'settings/system';

/**
 * Seed Firestore if database collections are empty
 */
export const seedDatabaseIfEmpty = async () => {
  try {
    const projectsSnapshot = await getDocs(collection(db, PROJECTS_COL));
    if (projectsSnapshot.empty) {
      console.log('Seeding initial data into Firestore...');
      const batch = writeBatch(db);

      // Seed Projects
      INITIAL_PROJECTS.forEach(project => {
        const ref = doc(db, PROJECTS_COL, project.id);
        batch.set(ref, project);
      });

      // Seed Users
      INITIAL_USERS.forEach(user => {
        const ref = doc(db, USERS_COL, user.id);
        batch.set(ref, user);
      });

      // Seed Tasks
      INITIAL_TASKS.forEach(task => {
        const ref = doc(db, TASKS_COL, task.id);
        batch.set(ref, task);
      });

      // Seed Comments
      INITIAL_COMMENTS.forEach(comment => {
        const ref = doc(db, COMMENTS_COL, comment.id);
        batch.set(ref, comment);
      });

      // Seed Activity Logs
      INITIAL_ACTIVITY_LOGS.forEach(log => {
        const ref = doc(db, ACTIVITY_LOGS_COL, log.id);
        batch.set(ref, log);
      });

      // Seed System Settings
      const settingsRef = doc(db, 'settings', 'system');
      batch.set(settingsRef, INITIAL_SYSTEM_SETTINGS);

      await batch.commit();
      console.log('Initial data seeded successfully.');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// ==================== REAL-TIME SUBSCRIBERS ====================

export const subscribeToProjects = (callback: (projects: Project[]) => void) => {
  const colRef = collection(db, PROJECTS_COL);
  return onSnapshot(colRef, (snapshot) => {
    const list: Project[] = [];
    snapshot.forEach(doc => {
      list.push(doc.data() as Project);
    });
    if (list.length > 0) callback(list);
  }, (error) => {
    console.error('Error subscribing to projects:', error);
  });
};

export const subscribeToTasks = (callback: (tasks: Task[]) => void) => {
  const colRef = collection(db, TASKS_COL);
  return onSnapshot(colRef, (snapshot) => {
    const list: Task[] = [];
    snapshot.forEach(doc => {
      list.push(doc.data() as Task);
    });
    callback(list);
  }, (error) => {
    console.error('Error subscribing to tasks:', error);
  });
};

export const subscribeToUsers = (callback: (users: User[]) => void) => {
  const colRef = collection(db, USERS_COL);
  return onSnapshot(colRef, (snapshot) => {
    const list: User[] = [];
    snapshot.forEach(doc => {
      list.push(doc.data() as User);
    });
    if (list.length > 0) callback(list);
  }, (error) => {
    console.error('Error subscribing to users:', error);
  });
};

export const subscribeToComments = (callback: (comments: Comment[]) => void) => {
  const q = query(collection(db, COMMENTS_COL), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const list: Comment[] = [];
    snapshot.forEach(doc => {
      list.push(doc.data() as Comment);
    });
    callback(list);
  }, (error) => {
    console.error('Error subscribing to comments:', error);
  });
};

export const subscribeToActivityLogs = (callback: (logs: ActivityLog[]) => void) => {
  const q = query(collection(db, ACTIVITY_LOGS_COL), orderBy('timestamp', 'desc'), limit(50));
  return onSnapshot(q, (snapshot) => {
    const list: ActivityLog[] = [];
    snapshot.forEach(doc => {
      list.push(doc.data() as ActivityLog);
    });
    callback(list);
  }, (error) => {
    console.error('Error subscribing to activity logs:', error);
  });
};

export const subscribeToSystemSettings = (callback: (settings: SystemSettings) => void) => {
  const docRef = doc(db, 'settings', 'system');
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as SystemSettings);
    }
  }, (error) => {
    console.error('Error subscribing to system settings:', error);
  });
};

// ==================== CRUD OPERATIONS ====================

// Projects
export const createProjectInDb = async (project: Project): Promise<void> => {
  await setDoc(doc(db, PROJECTS_COL, project.id), project);
};

export const updateProjectInDb = async (projectId: string, updates: Partial<Project>): Promise<void> => {
  await updateDoc(doc(db, PROJECTS_COL, projectId), updates);
};

export const deleteProjectInDb = async (projectId: string): Promise<void> => {
  await deleteDoc(doc(db, PROJECTS_COL, projectId));
};

// Tasks
export const createTaskInDb = async (task: Task): Promise<void> => {
  await setDoc(doc(db, TASKS_COL, task.id), task);
};

export const updateTaskInDb = async (taskId: string, updates: Partial<Task>): Promise<void> => {
  await updateDoc(doc(db, TASKS_COL, taskId), updates);
};

export const deleteTaskInDb = async (taskId: string): Promise<void> => {
  await deleteDoc(doc(db, TASKS_COL, taskId));
};

// Users
export const createUserInDb = async (user: User): Promise<void> => {
  await setDoc(doc(db, USERS_COL, user.id), user);
};

export const updateUserInDb = async (userId: string, updates: Partial<User>): Promise<void> => {
  await updateDoc(doc(db, USERS_COL, userId), updates);
};

export const deleteUserInDb = async (userId: string): Promise<void> => {
  await deleteDoc(doc(db, USERS_COL, userId));
};

// Comments & Logs
export const addCommentToDb = async (comment: Comment): Promise<void> => {
  await setDoc(doc(db, COMMENTS_COL, comment.id), comment);
};

export const addActivityLogInDb = async (log: ActivityLog): Promise<void> => {
  await setDoc(doc(db, ACTIVITY_LOGS_COL, log.id), log);
};

// Settings
export const updateSystemSettingsInDb = async (settings: Partial<SystemSettings>): Promise<void> => {
  await setDoc(doc(db, 'settings', 'system'), settings, { merge: true });
};
