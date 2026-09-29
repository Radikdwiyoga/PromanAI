import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { 
  Task, 
  Project, 
  User, 
  Comment, 
  ActivityLog, 
  TaskStatus, 
  TaskPriority, 
  ExecutiveSummary, 
  CopilotMessage, 
  SystemSettings 
} from '../types';
import { 
  INITIAL_PROJECTS, 
  INITIAL_USERS, 
  INITIAL_TASKS, 
  INITIAL_COMMENTS, 
  INITIAL_ACTIVITY_LOGS,
  INITIAL_SYSTEM_SETTINGS
} from '../data/initialData';
import { calculateUserWorkloads, generateExecutiveSummary, GeneratedBreakdown } from '../utils/aiSimulator';
import { 
  seedDatabaseIfEmpty,
  subscribeToProjects,
  subscribeToTasks,
  subscribeToUsers,
  subscribeToComments,
  subscribeToActivityLogs,
  subscribeToSystemSettings,
  createProjectInDb,
  updateProjectInDb,
  deleteProjectInDb,
  createTaskInDb,
  updateTaskInDb,
  deleteTaskInDb,
  createUserInDb,
  updateUserInDb,
  addCommentToDb,
  addActivityLogInDb,
  updateSystemSettingsInDb
} from '../services/firestoreService';
import {
  createAuthAccount,
  getUserProfileFromDb,
  logoutFromFirebase,
  subscribeToAuthChanges,
} from '../services/authService';
import { generateLiveExecutiveSummary, queryLiveProjectCopilot } from '../services/geminiService';
import { 
  sendTaskCreatedNotification, 
  sendTaskUpdatedNotification, 
  sendTaskStatusNotification, 
  sendCommentNotification
} from '../services/telegramService';

export type ActiveView = 
  | 'kanban' 
  | 'timeline' 
  | 'calendar' 
  | 'list' 
  | 'project_management'
  | 'risk_dashboard' 
  | 'resource_allocation' 
  | 'admin_settings';

interface FilterState {
  searchQuery: string;
  assigneeId: string | null;
  priority: TaskPriority | null;
  status: TaskStatus | null;
  tag: string | null;
}

interface ProjectContextType {
  // Authentication
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  isSuperAdmin: boolean;
  isPM: boolean;

  // System Settings & Company
  systemSettings: SystemSettings;
  updateSystemSettings: (newSettings: Partial<SystemSettings>) => void;

  // Projects CRUD
  projects: Project[];
  currentProject: Project;
  currentProjectId: string;
  setCurrentProjectId: (id: string) => void;
  createProject: (projectData: Omit<Project, 'id' | 'healthScore'>) => Project;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;

  // Users CRUD
  users: User[];
  currentUser: User;
  setCurrentUserId: (id: string) => void;
  createUser: (userData: Omit<User, 'id' | 'allocatedHours'> & { password: string }) => Promise<User>;
  updateUser: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => Promise<void>;
  
  // Tasks & Details
  tasks: Task[];
  filteredTasks: Task[];
  selectedTask: Task | null;
  setSelectedTaskId: (id: string | null) => void;
  
  // Comments & Logs
  comments: Comment[];
  activityLogs: ActivityLog[];
  
  // View & Filters
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  
  // Task Actions
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'commentsCount'>) => Task;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  moveTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string, category?: string) => void;
  addComment: (taskId: string, content: string) => void;

  // AI Triggers & Modals State
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  isAIBreakdownModalOpen: boolean;
  setIsAIBreakdownModalOpen: (open: boolean) => void;
  isSummaryModalOpen: boolean;
  setIsSummaryModalOpen: (open: boolean) => void;
  isCopilotOpen: boolean;
  setIsCopilotOpen: (open: boolean) => void;
  isChangePasswordModalOpen: boolean;
  setIsChangePasswordModalOpen: (open: boolean) => void;
  
  // AI Operations
  applyAIBreakdown: (breakdown: GeneratedBreakdown) => Task;
  applyRiskMitigation: (taskId: string, actionType: string, targetAssigneeId?: string, bufferDays?: number) => void;
  executiveSummary: ExecutiveSummary;
  refreshExecutiveSummary: () => void;
  
  // Copilot Chat
  copilotMessages: CopilotMessage[];
  sendCopilotQuery: (query: string) => void;
  
  // Toast Notifications
  toastMessage: { text: string; type: 'success' | 'info' | 'warning' } | null;
  showToast: (text: string, type?: 'success' | 'info' | 'warning') => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string>('user-admin');

  const [systemSettings, setSystemSettings] = useState<SystemSettings>(INITIAL_SYSTEM_SETTINGS);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [currentProjectId, setCurrentProjectId] = useState<string>('all');
  const [rawUsers, setRawUsers] = useState<User[]>(INITIAL_USERS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_ACTIVITY_LOGS);
  
  const [activeView, setActiveView] = useState<ActiveView>('kanban');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isAIBreakdownModalOpen, setIsAIBreakdownModalOpen] = useState<boolean>(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState<boolean>(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState<boolean>(false);

  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Pantau status autentikasi Firebase (selalu aktif, termasuk saat restore sesi)
  //
  // Auth listener harus jalan sejak app mount supaya sesi yang masih tersimpan
  // di localStorage langsung di-restore tanpa perlu login ulang.
  //
  // Sesi TIDAK langsung dipercaya begitu saja. `onAuthStateChanged` bisa memunculkan
  // user dari cache local tanpa contacts server, jadi user yang sudah dinonaktifkan
  // (documen /users-nya dihapus atau statusnya 'rejected') bisa lolos hanya
  // karena masih punya sesi tersimpan. Karena itu profil selalu diverifikasi ke
  // Firestore, dan kalau tidak valid sesinya langsung di-putuskan.
  useEffect(() => {
    return subscribeToAuthChanges(async (fbUser) => {
      if (!fbUser) {
        setIsAuthenticated(false);
        return;
      }

      const profile = await getUserProfileFromDb(fbUser.uid);

      if (!profile) {
        // Akun ada di Auth tapi sudah tidak aktif di aplikasi.
        await logoutFromFirebase().catch(() => {});
        setCurrentUserId(fbUser.uid);
        setIsAuthenticated(false);
        showToast('Akun ini telah dinonaktifkan. Silakan hubungi Super Admin.', 'warning');
        return;
      }

      if (profile.status === 'pending' || profile.status === 'rejected') {
        await logoutFromFirebase().catch(() => {});
        setCurrentUserId(fbUser.uid);
        setIsAuthenticated(false);
        showToast(
          profile.status === 'pending'
            ? 'Akun Anda masih menunggu persetujuan Super Admin.'
            : 'Akun ini telah dinonaktifkan. Silakan hubungi Super Admin.',
          'warning'
        );
        return;
      }

      setCurrentUserId(fbUser.uid);
      setIsAuthenticated(true);
    });
  }, []);

  // 2. Seeder & Real-Time Sync — HANYA setelah terautentikasi
  //
  // Firestore rules menolak semua akses anonim, jadi subscription dan seeding
  // harus ditunda sampai ada sesi login. Jika tidak, onSnapshot akan
  // langsung error PERMISSION_DENIED dan data tidak pernah ter-load.
  useEffect(() => {
    if (!isAuthenticated) return;

    // Seed butuh hak Super Admin, jadi hanya dicoba setelah user doc tersedia.
    seedDatabaseIfEmpty();

    const unsubProjects = subscribeToProjects((loadedProjects) => {
      setProjects(loadedProjects);
    });

    const unsubTasks = subscribeToTasks((loadedTasks) => {
      setTasks(loadedTasks);
    });

    const unsubUsers = subscribeToUsers((loadedUsers) => {
      setRawUsers(loadedUsers);
    });

    const unsubComments = subscribeToComments((loadedComments) => {
      setComments(loadedComments);
    });

    const unsubLogs = subscribeToActivityLogs((loadedLogs) => {
      setActivityLogs(loadedLogs);
    });

    const unsubSettings = subscribeToSystemSettings((loadedSettings) => {
      setSystemSettings(loadedSettings);
    });

    return () => {
      unsubProjects();
      unsubTasks();
      unsubUsers();
      unsubComments();
      unsubLogs();
      unsubSettings();
    };
  }, [isAuthenticated]);

  const login = (user: User) => {
    setCurrentUserId(user.id);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await logoutFromFirebase();
    } catch (e) {
      console.warn('Firebase logout notice:', e);
    }
    setIsAuthenticated(false);
    showToast('Anda telah keluar dari sesi.', 'info');
  };

  // ── Inactivity Session Timeout (10 menit) ──────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;

    const TIMEOUT_MS = 10 * 60 * 1000; // 10 menit
    let timer: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        logout();
        showToast('Sesi berakhir karena tidak ada aktivitas selama 10 menit.', 'warning');
      }, TIMEOUT_MS);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer(); // start timer immediately

    return () => {
      clearTimeout(timer);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const updateSystemSettings = (newSettings: Partial<SystemSettings>) => {
    setSystemSettings(prev => ({ ...prev, ...newSettings }));
    updateSystemSettingsInDb(newSettings);
  };

  const users = useMemo(() => {
    return calculateUserWorkloads(rawUsers, tasks);
  }, [rawUsers, tasks]);

  const currentProject: Project = useMemo(() => {
    if (currentProjectId === 'all') {
      return {
        id: 'all',
        name: 'Semua Project (Global Board)',
        description: 'Tampilan seluruh tiket dan inisiatif dari semua proyek enterprise',
        icon: '🌐',
        color: '#f97316',
        folder: 'Enterprise',
        domain: 'all',
        status: 'active',
        startDate: '2026-08-01',
        targetEndDate: '2027-12-31',
        healthScore: 92,
        memberIds: [],
      };
    }
    return projects.find(p => p.id === currentProjectId) || projects[0] || INITIAL_PROJECTS[0];
  }, [projects, currentProjectId]);

  const currentUser = useMemo(() => {
    return users.find(u => u.id === currentUserId || u.email === currentUserId) || users[0] || INITIAL_USERS[0];
  }, [users, currentUserId]);

  const isSuperAdmin = currentUser.personaType === 'Super Admin';
  const isPM = currentUser.personaType === 'Alex (PM)';

  const selectedTask = useMemo(() => {
    if (!selectedTaskId) return null;
    return tasks.find(t => t.id === selectedTaskId) || null;
  }, [tasks, selectedTaskId]);

  // Filters
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    assigneeId: null,
    priority: null,
    status: null,
    tag: null,
  });

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      assigneeId: null,
      priority: null,
      status: null,
      tag: null,
    });
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (currentProjectId !== 'all' && t.projectId !== currentProjectId) return false;
      
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesDesc = (t.description || '').toLowerCase().includes(q);
        const matchesTag = (t.tags || []).some(tag => tag.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesTag) return false;
      }

      if (filters.assigneeId && !(t.assigneeIds || []).includes(filters.assigneeId)) {
        return false;
      }

      if (filters.priority && t.priority !== filters.priority) {
        return false;
      }

      if (filters.status && t.status !== filters.status) {
        return false;
      }

      return true;
    });
  }, [tasks, currentProjectId, filters]);

  // CRUD Operations
  const createProject = (projectData: Omit<Project, 'id' | 'healthScore'>) => {
    const newProj: Project = {
      ...projectData,
      id: `proj-${Date.now()}`,
      healthScore: 90,
    };
    setProjects(prev => [newProj, ...prev]);
    createProjectInDb(newProj);
    setCurrentProjectId(newProj.id);
    showToast(`Project "${newProj.name}" berhasil dibuat!`, 'success');
    return newProj;
  };

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updates } : p));
    updateProjectInDb(projectId, updates);
    showToast('Data project berhasil diperbarui!', 'success');
  };

  const deleteProject = (projectId: string) => {
    if (projects.length <= 1) {
      showToast('Minimal harus ada 1 project dalam sistem!', 'warning');
      return;
    }
    setProjects(prev => prev.filter(p => p.id !== projectId));
    deleteProjectInDb(projectId);
    if (currentProjectId === projectId) {
      setCurrentProjectId('all');
    }
    showToast('Project berhasil dihapus!', 'info');
  };

  const createUser = async (userData: Omit<User, 'id' | 'allocatedHours' | 'password'> & { password: string }) => {
    // Akun harus dibuat di Firebase Auth DULU. Kalau dokumen Firestore lebih dulu,
    // user akan punya profil tapi tidak bisa login sama sekali — persis kondisi
    // yang membuat 14 user lama tidak bisa masuk sebelum dimigrasi.
    const authUid = await createAuthAccount(userData.email, userData.password);

    const { password, ...profileData } = userData;
    const newUser: User = {
      ...profileData,
      id: authUid,
      allocatedHours: 0,
    };

    await createUserInDb(newUser);
    setRawUsers(prev => [...prev, newUser]);
    showToast(`Pengguna ${newUser.name} berhasil ditambahkan!`, 'success');
    return newUser;
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    setRawUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    updateUserInDb(userId, updates);
    showToast('Data pengguna berhasil diperbarui!', 'success');
  };

  /**
   * Menonaktifkan pengguna.
   *
   * Ini SENGAJA tidak hard-delete. Akun Firebase Auth tidak bisa dinonaktifkan
   * dari sisi client (butuh Admin SDK / Cloud Function), jadi dokumen yang
   * dihapus di Firestore akan meninggalkan akun Auth yang masih hidup —
   * pemegangnya tetap bisa login. Dan sebelumnya `loginWithFirebase` membuat
   * ulang profil otomatis untuk UID yang dokumennya hilang, sehingga user
   * yang "dihapus" bisa langsung masuk lagi.
   *
   * Sekarang: dokumen tetap ada tapi status-nya 'rejected', dan login
   * memblokir status tersebut. Efeknya sama seperti dihapus dari sisi user,
   * tapi tidak meninggalkan pintu masuk terbuka.
   */
  const deleteUser = async (userId: string) => {
    if (userId === currentUser.id) {
      showToast('Tidak dapat menonaktifkan akun Anda sendiri!', 'warning');
      return;
    }

    const target = rawUsers.find(u => u.id === userId);
    if (!target) return;

    try {
      await updateUserInDb(userId, {
        status: 'rejected',
        disabledAt: new Date().toISOString(),
      });
      setRawUsers(prev =>
        prev.map(u => (u.id === userId ? { ...u, status: 'rejected' as const } : u))
      );
      showToast(`${target.name} dinonaktifkan. Akunnya tidak bisa login lagi.`, 'info');
    } catch (e) {
      console.error('Gagal menonaktifkan pengguna:', e);
      showToast('Gagal menonaktifkan pengguna. Coba lagi.', 'warning');
    }
  };

  const createTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'commentsCount'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      commentsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
    createTaskInDb(newTask);
    showToast(`Tugas "${newTask.title}" berhasil dibuat!`, 'success');
    // Telegram notification (fire-and-forget)
    sendTaskCreatedNotification(newTask, currentUser.name, users)
      .catch(err => console.warn('[Telegram] createTask notification failed:', err));
    return newTask;
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t));
    updateTaskInDb(taskId, updates);
    // Telegram notification (fire-and-forget)
    const targetTask = tasks.find(t => t.id === taskId);
    if (targetTask) {
      sendTaskUpdatedNotification({ ...targetTask, ...updates }, updates, currentUser.name, users)
        .catch(err => console.warn('[Telegram] updateTask notification failed:', err));
    }
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    deleteTaskInDb(taskId);
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
    }
    showToast('Tugas berhasil dihapus.', 'info');
  };

  const moveTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, status: newStatus, updatedAt: new Date().toISOString() };
      }
      return t;
    }));
    updateTaskInDb(taskId, { status: newStatus });
    // Telegram notification (fire-and-forget)
    const targetTask = tasks.find(t => t.id === taskId);
    if (targetTask) {
      sendTaskStatusNotification(targetTask, newStatus, currentUser.name)
        .catch(err => console.warn('[Telegram] statusChange notification failed:', err));
    }
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return;

    const updatedSubtasks = targetTask.subtasks.map(st => 
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );

    updateTask(taskId, { subtasks: updatedSubtasks });
  };

  const addSubtask = (taskId: string, title: string, category: string = 'General') => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return;

    const newSubtask = {
      id: `sub-${Date.now()}`,
      title,
      completed: false,
      category: category as any,
    };

    updateTask(taskId, { subtasks: [...targetTask.subtasks, newSubtask] });
  };

  const addComment = (taskId: string, content: string) => {
    const newComment: Comment = {
      id: `comm-${Date.now()}`,
      taskId,
      userId: currentUser.id,
      content,
      createdAt: new Date().toISOString(),
    };
    setComments(prev => [...prev, newComment]);
    addCommentToDb(newComment);

    const targetTask = tasks.find(t => t.id === taskId);
    if (targetTask) {
      updateTask(taskId, { commentsCount: (targetTask.commentsCount || 0) + 1 });
      // Telegram notification (fire-and-forget)
      sendCommentNotification(targetTask, newComment, currentUser.name)
        .catch(err => console.warn('[Telegram] comment notification failed:', err));
    }
  };

  const applyAIBreakdown = (breakdown: GeneratedBreakdown): Task => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      projectId: currentProjectId === 'all' ? (projects[0]?.id || 'proj-1') : currentProjectId,
      title: breakdown.title,
      description: breakdown.description,
      status: 'todo',
      priority: breakdown.priority,
      assigneeIds: [breakdown.recommendedAssigneeId],
      startDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      tags: breakdown.tags,
      subtasks: breakdown.subtasks.map((st, i) => ({
        id: `sub-${Date.now()}-${i}`,
        title: st.title,
        completed: false,
        category: st.category,
      })),
      attachments: [],
      commentsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTasks(prev => [newTask, ...prev]);
    createTaskInDb(newTask);
    showToast(`AI Berhasil Memecah & Menjadwalkan: "${newTask.title}"`, 'success');
    return newTask;
  };

  const applyRiskMitigation = (taskId: string, actionType: string, targetAssigneeId?: string, bufferDays: number = 3) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (actionType === 'reassign' && targetAssigneeId) {
      updateTask(taskId, { assigneeIds: [targetAssigneeId] });
      const newAssignee = users.find(u => u.id === targetAssigneeId);
      showToast(`Tugas "${task.title}" berhasil dialihkan ke ${newAssignee?.name || 'rekan tim'}.`, 'success');
    } else if (actionType === 'split_task') {
      // Split the task into 2-3 smaller subtasks derived from the task title/description
      const splitTitles: string[] = [];
      const baseTitle = task.title;
      if (task.description) {
        // Try to derive subtask titles from description lines (bullet or numbered)
        const descLines = task.description
          .split(/\n/)
          .map(l => l.trim())
          .filter(l => l && l.length > 0 && !l.toLowerCase().startsWith('catatan'));
        if (descLines.length >= 2) {
          splitTitles.push(...descLines.slice(0, 3));
        }
      }
      // Fallback: generate generic subtask titles from the task title
      if (splitTitles.length === 0) {
        const parts = baseTitle.split(/[,\/]/).map(p => p.trim()).filter(p => p.length > 0);
        if (parts.length >= 2) {
          splitTitles.push(...parts.slice(0, 3));
        } else {
          splitTitles.push(`${baseTitle} - Bagian 1`, `${baseTitle} - Bagian 2`);
        }
      }
      const newSubtasks = splitTitles.slice(0, 3).map((stTitle, i) => ({
        id: `sub-${Date.now()}-${i}`,
        title: stTitle,
        completed: false,
        category: 'General' as any,
      }));
      updateTask(taskId, { subtasks: [...(task.subtasks || []), ...newSubtasks] });
      showToast(`Tugas "${task.title}" berhasil dipecah menjadi ${newSubtasks.length} sub-tugas.`, 'success');
    } else if (actionType === 'reduce_scope') {
      // Reduce scope: extend due date by 1 day as a minimal buffer
      const currentDue = new Date(task.dueDate || new Date());
      currentDue.setDate(currentDue.getDate() + 1);
      const newDueDate = currentDue.toISOString().slice(0, 10);
      updateTask(taskId, { dueDate: newDueDate });
      showToast(`Lingkup tugas "${task.title}" berhasil dikurangi. Tenggat disesuaikan +1 hari.`, 'success');
    } else {
      const currentDue = new Date(task.dueDate || new Date());
      currentDue.setDate(currentDue.getDate() + bufferDays);
      const newDueDate = currentDue.toISOString().slice(0, 10);
      updateTask(taskId, { dueDate: newDueDate });
      showToast(`Tenggat tugas "${task.title}" berhasil diperpanjang +${bufferDays} hari.`, 'success');
    }
  };

  const [executiveSummary, setExecutiveSummary] = useState<ExecutiveSummary>(() => generateExecutiveSummary(INITIAL_TASKS, INITIAL_USERS));

  const refreshExecutiveSummary = async () => {
    showToast('Sedang merefresh analisis AI...', 'info');
    const result = await generateLiveExecutiveSummary(filteredTasks, users, currentProject);
    setExecutiveSummary(result);
    showToast('Laporan eksekutif berhasil diperbarui!', 'success');
  };

  const [copilotMessages, setCopilotMessages] = useState<CopilotMessage[]>([
    {
      id: 'copilot-init',
      sender: 'assistant',
      content: `Halo! Saya ProMan AI Copilot. Saya siap membantu mengelola proyek, menganalisis risiko keterlambatan, atau memantau tugas tim Anda.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        'Apa tugas paling mendesak?',
        'Siapa yang mengalami overload?',
        'Buatkan ringkasan status eksekutif',
        'Bantu pecah tugas baru'
      ]
    }
  ]);

  const sendCopilotQuery = async (queryText: string) => {
    const userMsg: CopilotMessage = {
      id: `copilot-u-${Date.now()}`,
      sender: 'user',
      content: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setCopilotMessages(prev => [...prev, userMsg]);

    try {
      const botReply = await queryLiveProjectCopilot(queryText, tasks, users);
      setCopilotMessages(prev => [...prev, botReply]);
    } catch (e) {
      console.error('Copilot error:', e);
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        isSuperAdmin,
        isPM,
        systemSettings,
        updateSystemSettings,
        projects,
        currentProject,
        currentProjectId,
        setCurrentProjectId,
        createProject,
        updateProject,
        deleteProject,
        users,
        currentUser,
        setCurrentUserId,
        createUser,
        updateUser,
        deleteUser,
        tasks,
        filteredTasks,
        selectedTask,
        setSelectedTaskId,
        comments,
        activityLogs,
        activeView,
        setActiveView,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        filters,
        setFilters,
        resetFilters,
        createTask,
        updateTask,
        deleteTask,
        moveTaskStatus,
        toggleSubtask,
        addSubtask,
        addComment,
        isCreateModalOpen,
        setIsCreateModalOpen,
        isAIBreakdownModalOpen,
        setIsAIBreakdownModalOpen,
        isSummaryModalOpen,
        setIsSummaryModalOpen,
        isCopilotOpen,
        setIsCopilotOpen,
        isChangePasswordModalOpen,
        setIsChangePasswordModalOpen,
        applyAIBreakdown,
        applyRiskMitigation,
        executiveSummary,
        refreshExecutiveSummary,
        copilotMessages,
        sendCopilotQuery,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
