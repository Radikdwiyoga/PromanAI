export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type SubtaskCategory = 
  | 'Frontend' 
  | 'Backend' 
  | 'Design' 
  | 'QA' 
  | 'Operations' 
  | 'Logistics' 
  | 'Marketing' 
  | 'HR' 
  | 'Finance' 
  | 'Legal' 
  | 'General';

export type PersonaType = 
  | 'Super Admin' 
  | 'Project Manager (PM)' 
  | 'Team Member' 
  | 'Stakeholder' 
  | 'Operations Lead' 
  | 'Member'
  | 'Alex (PM)' 
  | 'Sarah (Team)' 
  | 'Budi (Stakeholder)' 
  | 'Rian (Operations)';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar: string;
  role: string;
  department: 'Management' | 'Technology' | 'Operations' | 'Marketing' | 'Human Resources' | 'Finance' | 'Executive';
  capacityHours: number;
  allocatedHours: number;
  personaType: PersonaType;
  status?: 'active' | 'pending' | 'rejected';
  /** Diisi saat akun dinonaktifkan Super Admin dari panel pengaturan. */
  disabledAt?: string;
  registeredAt?: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  category?: SubtaskCategory;
  assigneeId?: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
  mentions?: string[];
  attachments?: Attachment[];
}

export interface ActivityLog {
  id: string;
  taskId?: string;
  projectId: string;
  userId: string;
  action: string;
  details?: string;
  timestamp: string;
}

export interface AIRiskAnalysis {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  predictedDelayDays: number;
  reason: string;
  mitigationSuggestion: string;
  isActionable: boolean;
  actionType?: 'reassign' | 'extend_buffer' | 'split_task' | 'reduce_scope';
  suggestedAssigneeId?: string;
  suggestedBufferDays?: number;
}

export interface TaskEffortEstimation {
  estimatedHours: number;
  complexityLevel: 'Rendah' | 'Sedang' | 'Kompleks' | 'Sangat Kompleks';
  suggestedDueDate: string;
  recommendedAssigneeId?: string;
  rationale: string;
  suggestedSubtasks?: { title: string; category?: SubtaskCategory }[];
}

export interface AISolutionAdvice {
  id: string;
  taskId: string;
  summaryDiagnosis: string;
  actionSteps: string[];
  technicalTips?: string[];
  potentialPitfalls?: string[];
  suggestedNewSubtasks?: string[];
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeIds: string[];
  tags: string[];
  startDate: string;
  dueDate: string;
  estimatedHours?: number;
  loggedHours?: number;
  subtasks: Subtask[];
  attachments: Attachment[];
  commentsCount: number;
  aiRisk?: AIRiskAnalysis;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  folder: string;
  domain: 'all' | 'technology' | 'operations' | 'marketing' | 'hr' | 'finance' | 'event';
  startDate?: string;
  targetEndDate?: string;
  status: 'active' | 'planning' | 'on_hold' | 'completed';
  healthScore: number;
  memberIds: string[];
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestions?: string[];
  relatedTaskIds?: string[];
  actionLink?: {
    type: 'view_task' | 'open_risk' | 'open_workload' | 'filter_status' | 'open_settings' | 'open_projects';
    payload: string;
    label: string;
  };
}

export interface ExecutiveSummary {
  id: string;
  projectId: string;
  dateRange: string;
  generatedAt: string;
  headline: string;
  overallHealth: 'On Track' | 'At Risk' | 'Delayed';
  completionRate: number;
  keyHighlights: string[];
  bottlenecksAndRisks: string[];
  recommendationsForAlex: string[];
  stakeholderBriefForBudi: string;
}

export interface SystemSettings {
  companyName: string;
  logoUrl?: string;
  timezone: string;
  defaultWeeklyCapacityHours?: number;
  aiModelEngine?: string;
  aiRiskDelayThresholdDays?: number;
  aiDataPrivacyOptOut?: boolean;
  autoStatusSummaryInterval?: string;
  syncLatencyTargetMs?: number;
  autoBackupEnabled?: boolean;
  aiOptOut?: boolean;
  aiModelVersion?: string;
  autoRiskDetection?: boolean;
  weeklySummaryDay?: string;
  retentionDays?: number;
}
