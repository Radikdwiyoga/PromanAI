import * as functions from 'firebase-functions';

// Runtime config from firebase functions:config (or .runtimeconfig.json in emulator)
const runtimeConfig = functions.config();

export const EMAIL_CONFIG = {
  gmail: {
    user: runtimeConfig.gmail?.user || process.env.GMAIL_USER || '',
    appPassword:
      runtimeConfig.gmail?.app_password ||
      process.env.GMAIL_APP_PASSWORD ||
      '',
  },
  app: {
    name: 'ProMan AI',
    baseUrl:
      runtimeConfig.app?.base_url ||
      process.env.APP_BASE_URL ||
      'https://proman-83c57.web.app',
    supportEmail:
      runtimeConfig.app?.support_email ||
      process.env.SUPPORT_EMAIL ||
      '',
  },
};

// Status labels for display
export const STATUS_LABELS: Record<string, string> = {
  backlog: '📋 Backlog',
  todo: '📝 To Do',
  in_progress: '🚀 In Progress',
  review: '🔍 In Review',
  done: '✅ Done',
};

// Status colors for email HTML
export const STATUS_COLORS: Record<string, string> = {
  backlog: '#64748b',
  todo: '#f59e0b',
  in_progress: '#3b82f6',
  review: '#8b5cf6',
  done: '#10b981',
};

// Priority labels
export const PRIORITY_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: '🔴 Urgent',
};

export const PRIORITY_COLORS: Record<string, string> = {
  low: '#64748b',
  medium: '#f59e0b',
  high: '#f97316',
  urgent: '#ef4444',
};
