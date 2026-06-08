/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: string;
}

export interface Comment {
  id: string;
  author: string;
  authorEmail: string;
  text: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string; // ISO format
  estimatedHours: number;
  tags: string[];
  assignee: string;
  assigneeEmail: string;
  checklist: ChecklistItem[];
  attachments: Attachment[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  taskId?: string;
  taskTitle?: string;
  text: string;
  user: string;
  userEmail: string;
  type: 'create' | 'status_change' | 'priority_change' | 'comment' | 'checklist' | 'edit' | 'delete' | 'duplicate';
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'assigned' | 'due_soon' | 'mention' | 'status_change';
  read: boolean;
  taskId?: string;
  createdAt: string;
}

export interface Board {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface UserSessionSession {
  id: string;
  device: string;
  ip: string;
  location: string;
  lastActive: string;
  current: boolean;
}

export interface UserSession {
  email: string;
  name: string;
  avatar?: string;
  rememberMe?: boolean;
  username?: string;
  bio?: string;
  twoFactorEnabled?: boolean;
  density?: 'compact' | 'standard' | 'spacious';
  grayAccent?: 'zinc' | 'slate' | 'stone' | 'neutral';
  sessions?: UserSessionSession[];
}
