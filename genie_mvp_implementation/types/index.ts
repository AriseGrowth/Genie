/*
 * Domain type definitions for Genie MVP.
 *
 * These interfaces define the core entities used throughout the
 * application. They are used both on the client and the server
 * for type safety. Do not include implementation details here.
 */

export type WorkspaceKind = 'personal' | 'business';

export interface Workspace {
  id: string;
  kind: WorkspaceKind;
  name: string;
}

export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';
export type TaskStatus = 'open' | 'in_progress' | 'done' | 'cancelled';

export interface Task {
  id: string;
  workspaceId: string;
  title: string;
  notes?: string;
  dueAt?: string; // ISO string
  priority: TaskPriority;
  status: TaskStatus;
  source: 'manual' | 'assistant' | 'meeting' | 'email';
  externalProvider?: string;
  externalRef?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type DraftStatus =
  | 'draft'
  | 'pending_approval'
  | 'sent'
  | 'rejected'
  | 'failed';

export interface EmailDraft {
  id: string;
  workspaceId: string;
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  body: string;
  status: DraftStatus;
  gmailDraftId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ActionItem {
  id: string;
  title: string;
  owner?: string;
  dueAt?: string;
  status?: TaskStatus;
}

export interface MeetingSummary {
  id: string;
  title: string;
  summary: string;
  decisions: string[];
  actionItems: ActionItem[];
  followupDraft?: {
    subject: string;
    body: string;
  };
}

export type ApprovalStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'failed'
  | 'expired';

export type ApprovalActionType =
  | 'send_email'
  | 'create_calendar_event'
  | 'update_calendar_event'
  | 'store_sensitive_memory';

export interface Approval {
  id: string;
  userId: string;
  workspaceId: string;
  actionType: ApprovalActionType;
  status: ApprovalStatus;
  payload: any;
  createdAt?: string;
  resolvedAt?: string;
}

export interface TodayBrief {
  date: string;
  workspaceKind: WorkspaceKind;
  topPriorities: string[];
  keyEvents: {
    title: string;
    start: string;
    end: string;
  }[];
  openTasks: {
    id: string;
    title: string;
    dueAt?: string;
    priority?: TaskPriority;
  }[];
  risks: string[];
  recommendedNextAction: string;
}