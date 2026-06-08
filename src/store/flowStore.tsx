/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority, ChecklistItem, Attachment, Comment, Activity, Notification, Board, UserSession } from '../types';

interface FlowStoreContextType {
  // Authentication & Session
  user: UserSession | null;
  login: (email: string, name: string, rememberMe: boolean) => void;
  logout: () => void;
  register: (email: string, name: string) => void;
  updateUser: (updates: Partial<UserSession>) => void;

  // Active UI Tabs
  activeTab: 'dashboard' | 'kanban' | 'calendar' | 'analytics' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'kanban' | 'calendar' | 'analytics' | 'settings') => void;

  // Themes
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Boards
  boards: Board[];
  activeBoardId: string;
  setActiveBoardId: (id: string) => void;
  createBoard: (name: string, description: string) => Board;
  updateBoard: (id: string, updates: Partial<Board>) => void;
  deleteBoard: (id: string) => void;
  setBoards: React.Dispatch<React.SetStateAction<Board[]>>;

  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'checklist' | 'attachments'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  duplicateTask: (id: string) => void;
  archiveTask: (id: string) => void;

  // Checklist Actions
  addChecklistItem: (taskId: string, title: string) => void;
  toggleChecklistItem: (taskId: string, itemId: string) => void;
  deleteChecklistItem: (taskId: string, itemId: string) => void;

  // Comment Actions
  addComment: (taskId: string, text: string) => void;

  // Attachment Actions
  addAttachment: (taskId: string, name: string, type: string, size: string) => void;
  deleteAttachment: (taskId: string, attachmentId: string) => void;

  // Notifications
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearAllNotifications: () => void;

  // Activity Timeline
  activities: Activity[];

  // Global search input
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Sidebar state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Create Task dialog / Drawer state
  activeTaskDetailId: string | null;
  setActiveTaskDetailId: (id: string | null) => void;

  // Smart Analytics (computed on demand)
  focusScore: number;
  workloadWarning: { activeCount: number; isOverloaded: boolean; message: string } | null;
  workflowBottleneck: { column: string; percentage: number; message: string } | null;
  deadlineRisks: { task: Task; risk: 'overdue' | 'high_risk' }[];
}

const FlowStoreContext = createContext<FlowStoreContextType | undefined>(undefined);

// Initial professional mock data to make FlowBoard instantly rich and usable.
const INITIAL_TASKS: Task[] = [
  {
    id: 't-1',
    title: 'Migrate database queries to Prisma pooler limits',
    description: 'Postgres server is feeling heavy on pool execution queries. We need to introduce pgBouncer credentials or configure Prisma middleware connections to pool properly under 40 user concurrency.',
    status: 'backlog',
    priority: 'high',
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days out
    estimatedHours: 8,
    tags: ['Database', 'Prisma', 'Infra'],
    assignee: 'Alex Mercer',
    assigneeEmail: 'alex.mercer@gmail.com',
    checklist: [
      { id: 'c1', title: 'Audit current active connections in Cloud SQL pool', completed: true },
      { id: 'c2', title: 'Install and verify pgBouncer locally in staging setup', completed: false },
      { id: 'c3', title: 'Run telemetry stress tests on concurrent reads', completed: false }
    ],
    attachments: [
      { id: 'a1', name: 'pool_bottleneck_log.txt', type: 'text/plain', size: '14.2 KB', url: '#' }
    ],
    comments: [
      { id: 'co1', author: 'Prudhvi', authorEmail: 'prudhvimenapati@gmail.com', text: 'This was flagged during our cloud deployment tests last Friday. Let us prioritize this.', createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString() }
    ],
    boardId: 'b-default',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
  },
  {
    id: 't-2',
    title: 'Polish interactive dragging with Framer Motion layout transitions',
    description: 'Provide beautiful smooth layout animations when moving columns, cards, and submenus. Avoid flickering by animating using motion layoutId bindings and custom easing.',
    status: 'todo',
    priority: 'medium',
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 4 days out
    estimatedHours: 4,
    tags: ['UI UX', 'Tailwind', 'Animations'],
    assignee: 'Sarah Lin',
    assigneeEmail: 'sarah.lin@gmail.com',
    checklist: [
      { id: 'c4', title: 'Add slide-in keyframes for task detail panels', completed: true },
      { id: 'c5', title: 'Test touch gesture responsiveness on tablet view', completed: true }
    ],
    attachments: [],
    comments: [],
    boardId: 'b-default',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 't-3',
    title: 'Configure JWT authorization hooks & secure Google OAuth handlers',
    description: 'Write complete middleware hooks for session validation. Inject Google tokens natively so users can claim their accounts. Save refresh tokens using httpOnly cookies.',
    status: 'in_progress',
    priority: 'critical',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // tomorrow
    estimatedHours: 12,
    tags: ['Security', 'OAuth', 'Backend'],
    assignee: 'Marcus Vance',
    assigneeEmail: 'marcus.v@gmail.com',
    checklist: [
      { id: 'c6', title: 'Implement Express authorization headers middleware', completed: true },
      { id: 'c7', title: 'Configure client-side secure localStorage session wrapper', completed: true },
      { id: 'c8', title: 'Verify Google Client ID matching and safety validation', completed: false },
      { id: 'c9', title: 'Setup password reset hashes via SMTP nodemailer integrations', completed: false }
    ],
    attachments: [],
    comments: [
      { id: 'co2', author: 'Sarah Lin', authorEmail: 'sarah.lin@gmail.com', text: 'I am halfway through designing the login screens! Connecting state shortly.', createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString() }
    ],
    boardId: 'b-default',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 't-4',
    title: 'Define full-stack schema migrations inside src/db/schema.ts',
    description: 'We need columns for workspace indexing, board layouts, checklist item configurations, and tags support. Align fields perfectly with the PostgreSQL definitions to support analytics reporting.',
    status: 'review',
    priority: 'medium',
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 day overdue!
    estimatedHours: 6,
    tags: ['Database', 'Drizzle', 'Sprint-1'],
    assignee: 'Alex Mercer',
    assigneeEmail: 'alex.mercer@gmail.com',
    checklist: [
      { id: 'c10', title: 'Add schema.ts relational foreign keys indicators', completed: true },
      { id: 'c11', title: 'Generate migration scripts inside migrations/ folder', completed: true }
    ],
    attachments: [],
    comments: [],
    boardId: 'b-default',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 't-5',
    title: 'Refactor Tailwind responsive prefix declarations for ultra-wide monitors',
    description: 'The layout currently stretches past 1600px, which isolates task cards in wide margins. Fix the grid columns bounds with max-w-7xl and fluid alignment flexbox.',
    status: 'done',
    priority: 'low',
    dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // in past, but done
    estimatedHours: 3,
    tags: ['UI UX', 'Tailwind'],
    assignee: 'Sarah Lin',
    assigneeEmail: 'sarah.lin@gmail.com',
    checklist: [
      { id: 'c12', title: 'Add max-h-screen wrappers to main workspace view', completed: true }
    ],
    attachments: [],
    comments: [],
    boardId: 'b-default',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 't-6',
    title: 'Stress-test applet state persistence on offline hot reloads',
    description: 'Test that state modifications auto-sync with indexed localStorage structures. Set up graceful state recovery timers so browser refreshes recover in-progress checklist items without disruption.',
    status: 'done',
    priority: 'medium',
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    estimatedHours: 5,
    tags: ['Performance', 'Testing'],
    assignee: 'Prudhvi',
    assigneeEmail: 'prudhvimenapati@gmail.com',
    checklist: [
      { id: 'c13', title: 'Mock storage write failures on mobile emulator', completed: true },
      { id: 'c14', title: 'Confirm JSON integrity verification triggers', completed: true }
    ],
    attachments: [],
    comments: [
      { id: 'co3', author: 'Marcus Vance', authorEmail: 'marcus.v@gmail.com', text: 'Flawless loading times after applying local storage compression caches!', createdAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString() }
    ],
    boardId: 'b-default',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_BOARDS: Board[] = [
  { id: 'b-default', name: 'Engineering Roadmap', description: 'Core product features, sprints, tech-debt tasks, and telemetry setups', createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'b-school', name: 'Design Language Refinement', description: 'Sprint reviews for style manuals, typographies, and branding mockups', createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() }
];

const INITIAL_ACTIVITIES: Activity[] = [
  { id: 'act-1', text: 'Created FlowBoard Workspace', user: 'System', userEmail: 'system@flowboard.dev', type: 'create', createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'act-2', taskId: 't-3', taskTitle: 'Configure JWT authorization hooks & secure Google OAuth handlers', text: 'Moved task status to In Progress', user: 'Marcus Vance', userEmail: 'marcus.v@gmail.com', type: 'status_change', createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString() },
  { id: 'act-3', taskId: 't-1', taskTitle: 'Migrate database queries to Prisma pooler limits', text: 'Added comment: "This was flagged during our cloud deployment tests..."', user: 'Prudhvi', userEmail: 'prudhvimenapati@gmail.com', type: 'comment', createdAt: new Date(Date.now() - 3600 * 1000 * 3).toISOString() }
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 'n-1', title: 'Task assigned to you', description: 'Marcus Vance assigned "Migrate database queries to Prisma pooler limits" to you.', type: 'assigned', read: false, taskId: 't-1', createdAt: new Date(Date.now() - 3600 * 1000 * 3).toISOString() },
  { id: 'n-2', title: 'Task overdue!', description: 'Task "Define full-stack schema migrations inside src/db/schema.ts" is overdue.', type: 'due_soon', read: false, taskId: 't-4', createdAt: new Date(Date.now() - 3600 * 1000).toISOString() }
];

export const FlowStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- 1. State declarations ---
  const [user, setUser] = useState<UserSession | null>(() => {
    const cached = localStorage.getItem('fb_user');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed) {
          if (!parsed.sessions || parsed.sessions.length === 0) {
            parsed.sessions = [
              { id: 'sess-1', device: 'Chrome MacOS Ventura (Chrome 124)', ip: '192.168.1.45', location: 'San Francisco, USA', lastActive: 'Active now', current: true },
              { id: 'sess-2', device: 'Safari iPhone 15 Pro Max', ip: '172.56.21.99', location: 'New York, USA', lastActive: '2 hours ago', current: false },
              { id: 'sess-3', device: 'Brave Windows 11 Desktop', ip: '64.233.160.23', location: 'Austin, USA', lastActive: '3 days ago', current: false }
            ];
          }
          if (!parsed.username) {
            parsed.username = parsed.email ? parsed.email.split('@')[0] : 'prudhvi';
          }
          if (!parsed.bio) {
            parsed.bio = 'SaaS Builder & Workflow Designer. Building FlowBoard.';
          }
          if (!parsed.density) {
            parsed.density = 'standard';
          }
          if (!parsed.grayAccent) {
            parsed.grayAccent = 'zinc';
          }
          return parsed;
        }
      } catch (e) {
        // Safe fallback
      }
    }
    return {
      email: 'prudhvimenapati@gmail.com',
      name: 'Prudhvi Menapati',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      username: 'prudhvi',
      bio: 'SaaS Builder & Workflow Designer. Building FlowBoard.',
      twoFactorEnabled: false,
      density: 'standard',
      grayAccent: 'zinc',
      sessions: [
        { id: 'sess-1', device: 'Chrome MacOS Ventura (Chrome 124)', ip: '192.168.1.45', location: 'San Francisco, USA', lastActive: 'Active now', current: true },
        { id: 'sess-2', device: 'Safari iPhone 15 Pro Max', ip: '172.56.21.99', location: 'New York, USA', lastActive: '2 hours ago', current: false },
        { id: 'sess-3', device: 'Brave Windows 11 Desktop', ip: '64.233.160.23', location: 'Austin, USA', lastActive: '3 days ago', current: false }
      ]
    };
  });

  const [activeTab, setActiveTabState] = useState<'dashboard' | 'kanban' | 'calendar' | 'analytics' | 'settings'>(() => {
    return (localStorage.getItem('fb_active_tab') as any) || 'dashboard';
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const cached = localStorage.getItem('fb_theme');
    if (cached) return cached as 'light' | 'dark';
    return 'light'; // Default to light theme
  });

  const [boards, setBoards] = useState<Board[]>(() => {
    const cached = localStorage.getItem('fb_boards');
    return cached ? JSON.parse(cached) : INITIAL_BOARDS;
  });

  const [activeBoardId, setActiveBoardId] = useState<string>(() => {
    const cached = localStorage.getItem('fb_active_board');
    return cached || 'b-default';
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const cached = localStorage.getItem('fb_tasks');
    return cached ? JSON.parse(cached) : INITIAL_TASKS;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const cached = localStorage.getItem('fb_notifications');
    return cached ? JSON.parse(cached) : INITIAL_NOTIFICATIONS;
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    const cached = localStorage.getItem('fb_activities');
    return cached ? JSON.parse(cached) : INITIAL_ACTIVITIES;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTaskDetailId, setActiveTaskDetailId] = useState<string | null>(null);

  // --- 2. Persist state on change ---
  useEffect(() => {
    localStorage.setItem('fb_user', user ? JSON.stringify(user) : '');
  }, [user]);

  useEffect(() => {
    const root = window.document.documentElement;
    const themes = ['theme-zinc', 'theme-slate', 'theme-stone', 'theme-neutral'];
    themes.forEach(t => root.classList.remove(t));
    const accent = user?.grayAccent || 'zinc';
    root.classList.add(`theme-${accent}`);
  }, [user?.grayAccent]);

  useEffect(() => {
    localStorage.setItem('fb_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('fb_theme', theme);
    // Apply styling class to body
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    localStorage.setItem('fb_boards', JSON.stringify(boards));
  }, [boards]);

  useEffect(() => {
    localStorage.setItem('fb_active_board', activeBoardId);
  }, [activeBoardId]);

  useEffect(() => {
    localStorage.setItem('fb_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('fb_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('fb_activities', JSON.stringify(activities));
  }, [activities]);

  const setActiveTab = (tab: 'dashboard' | 'kanban' | 'calendar' | 'analytics' | 'settings') => {
    setActiveTabState(tab);
  };

  // --- 3. Compute Smart Analytics & Indicators ---
  // Get tasks specific to the currently active board
  const boardTasks = tasks.filter(t => t.boardId === activeBoardId || (!t.boardId && activeBoardId === 'b-default'));

  // Workload Warning: Active tasks (todo, in_progress, review) > 5
  const activeTasks = boardTasks.filter(t => t.status === 'todo' || t.status === 'in_progress' || t.status === 'review');
  const totalIncomplete = boardTasks.filter(t => t.status !== 'done').length;
  const isOverloaded = activeTasks.length > 5;
  const workloadWarning = {
    activeCount: activeTasks.length,
    isOverloaded,
    message: isOverloaded 
      ? `Workload Alert: You currently have ${activeTasks.length} active tasks. Consider prioritizing or completing current actions before adding new tasks.` 
      : `High performance alignment. You have ${activeTasks.length} active tasks.`
  };

  // Bottleneck Detection: If one column contains > 40% of all tasks (if there are > 2 tasks total)
  let workflowBottleneck = null;
  if (boardTasks.length > 2) {
    const statuses: TaskStatus[] = ['backlog', 'todo', 'in_progress', 'review', 'done'];
    const total = boardTasks.length;
    for (const st of statuses) {
      const countInStatus = boardTasks.filter(t => t.status === st).length;
      const pct = (countInStatus / total) * 100;
      if (pct > 40 && st !== 'done') {
        const readableStatus = st === 'in_progress' ? 'In Progress' : st.charAt(0).toUpperCase() + st.slice(1);
        workflowBottleneck = {
          column: st,
          percentage: Math.round(pct),
          message: `Workflow Bottleneck Detected: "${readableStatus}" contains ${Math.round(pct)}% of all workspace projects (${countInStatus}/${total}). Drag items forward to resolve.`
        };
        break;
      }
    }
  }

  // Deadline Risk Analysis
  // elapsedTime / estimatedTime? Wait, we can analyze tasks with due dates in relation to current time
  const deadlineRisks = boardTasks
    .filter(t => t.status !== 'done')
    .map(t => {
      const due = new Date(t.dueDate).getTime();
      const now = Date.now();
      const isOverdue = now > due;
      const isNearRisk = !isOverdue && (due - now) < (2 * 24 * 60 * 60 * 1000); // within 48 hours for high risk
      
      let risk: 'overdue' | 'high_risk' | null = null;
      if (isOverdue) risk = 'overdue';
      else if (isNearRisk) risk = 'high_risk';
      
      return { task: t, risk };
    })
    .filter((r): r is { task: Task; risk: 'overdue' | 'high_risk' } => r.risk !== null);

  // Focus Score calculation (0 - 100):
  // Completion rate (60%) + Checklist Completion Rate (30%) + Activity weight (10%) - Overdue Penalty
  let focusScore = 85; // baseline default
  if (boardTasks.length > 0) {
    const doneTasks = boardTasks.filter(t => t.status === 'done').length;
    const completionRate = (doneTasks / boardTasks.length) * 100;

    // Checklist completion
    let totalChecklistItems = 0;
    let completedChecklistItems = 0;
    boardTasks.forEach(t => {
      totalChecklistItems += t.checklist.length;
      completedChecklistItems += t.checklist.filter(c => c.completed).length;
    });
    const checklistRate = totalChecklistItems > 0 ? (completedChecklistItems / totalChecklistItems) * 100 : 100;

    // Overdue reduction
    const overdueCount = deadlineRisks.filter(r => r.risk === 'overdue').length;

    const baseScore = (completionRate * 0.6) + (checklistRate * 0.4);
    const penalty = overdueCount * 12;
    focusScore = Math.max(0, Math.min(100, Math.round(baseScore - penalty)));
  }

    // Overdue reduction
    const overdueCount = deadlineRisks.filter(r => r.risk === 'overdue').length;

    const baseScore = (completionRate * 0.6) + (checklistRate * 0.4);
    const penalty = overdueCount * 12;
    focusScore = Math.max(0, Math.min(100, Math.round(baseScore - penalty)));
  }

  // --- 4. Store Actions ---
  const login = (email: string, name: string, rememberMe: boolean) => {
    const randomAvatar = `https://images.unsplash.com/photo-${1500000005000 + Math.floor(Math.random() * 900000)}?auto=format&fit=crop&q=80&w=150`;
    const newSession: UserSession = {
      email,
      name,
      avatar: randomAvatar,
      rememberMe,
      username: email.split('@')[0],
      bio: 'SaaS Builder & Workflow Designer. Building FlowBoard.',
      twoFactorEnabled: false,
      density: 'standard',
      grayAccent: 'zinc',
      sessions: [
        { id: 'sess-1', device: 'Chrome MacOS Ventura (Chrome 124)', ip: '192.168.1.45', location: 'San Francisco, USA', lastActive: 'Active now', current: true },
        { id: 'sess-2', device: 'Safari iPhone 15 Pro Max', ip: '172.56.21.99', location: 'New York, USA', lastActive: '2 hours ago', current: false },
        { id: 'sess-3', device: 'Brave Windows 11 Desktop', ip: '64.233.160.23', location: 'Austin, USA', lastActive: '3 days ago', current: false }
      ]
    };
    setUser(newSession);

    // Logging action
    const newAct: Activity = {
      id: `act-log-${Date.now()}`,
      text: `Logged in as ${name}`,
      user: name,
      userEmail: email,
      type: 'create',
      createdAt: new Date().toISOString()
    };
    setActivities(prev => [newAct, ...prev]);

    // Add visual intro notification
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      title: 'Welcome to FlowBoard!',
      description: `Success: Authenticated as ${name}. Enjoy task scheduling and visual bottleneck tracking.`,
      type: 'assigned',
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const register = (email: string, name: string) => {
    login(email, name, true);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fb_user');
    setActiveTaskDetailId(null);
  };

  const updateUser = (updates: Partial<UserSession>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  };

  const createBoard = (name: string, description: string): Board => {
    const newBoard: Board = {
      id: `b-${Date.now()}`,
      name,
      description,
      createdAt: new Date().toISOString()
    };
    setBoards(prev => [...prev, newBoard]);
    setActiveBoardId(newBoard.id);

    // Log Activity
    const newAct: Activity = {
      id: `act-b-${Date.now()}`,
      text: `Created new project board "${name}"`,
      user: user?.name || 'Anonymous',
      userEmail: user?.email || 'anon@anon.com',
      type: 'create',
      createdAt: new Date().toISOString()
    };
    setActivities(prev => [newAct, ...prev]);

    return newBoard;
  };

  const updateBoard = (id: string, updates: Partial<Board>) => {
    setBoards(prev => prev.map(b => {
      if (b.id === id) {
        return { ...b, ...updates };
      }
      return b;
    }));

    // Log Activity
    const matching = boards.find(b => b.id === id);
    if (matching) {
      const newAct: Activity = {
        id: `act-b-up-${Date.now()}`,
        text: `Updated board "${updates.name || matching.name}" details`,
        user: user?.name || 'Anonymous',
        userEmail: user?.email || 'anon@anon.com',
        type: 'edit',
        createdAt: new Date().toISOString()
      };
      setActivities(prev => [newAct, ...prev]);
    }
  };

  const deleteBoard = (id: string) => {
    if (boards.length <= 1) return; // cannot delete last board
    const boardToDelete = boards.find(b => b.id === id);
    if (!boardToDelete) return;

    setBoards(prev => prev.filter(b => b.id !== id));
    // Clean up tasks belonging to this board (include legacy check)
    setTasks(prev => prev.filter(t => t.boardId !== id && !(t.boardId === undefined && id === 'b-default')));

    // If active board is deleted, set fallback
    if (activeBoardId === id) {
      const remaining = boards.filter(b => b.id !== id);
      if (remaining.length > 0) {
        setActiveBoardId(remaining[0].id);
      }
    }

    // Log Activity
    const newAct: Activity = {
      id: `act-b-del-${Date.now()}`,
      text: `Deleted project board "${boardToDelete.name}" and associated tasks`,
      user: user?.name || 'Anonymous',
      userEmail: user?.email || 'anon@anon.com',
      type: 'delete',
      createdAt: new Date().toISOString()
    };
    setActivities(prev => [newAct, ...prev]);
  };

  // Tasks actions
  const addTask = (taskInput: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'checklist' | 'attachments'>) => {
    const newTask: Task = {
      ...taskInput,
      id: `task-${Date.now()}`,
      checklist: [],
      comments: [],
      attachments: [],
      boardId: activeBoardId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTasks(prev => [newTask, ...prev]);

    // Active board activity log
    const newAct: Activity = {
      id: `act-t-${Date.now()}`,
      taskId: newTask.id,
      taskTitle: newTask.title,
      text: `Created task "${newTask.title}" under columns`,
      user: user?.name || 'Guest User',
      userEmail: user?.email || 'guest@flowboard.dev',
      type: 'create',
      createdAt: new Date().toISOString()
    };
    setActivities(prev => [newAct, ...prev]);

    // Check if user is assigned
    if (newTask.assigneeEmail === user?.email) {
      const newNotif: Notification = {
        id: `n-${Date.now()}`,
        title: 'New task assigned',
        description: `You have been assigned "${newTask.title}" due by ${newTask.dueDate}.`,
        type: 'assigned',
        read: false,
        taskId: newTask.id,
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [newNotif, ...prev]);
    }

    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    let oldStatus: TaskStatus | undefined;
    let newStatus: TaskStatus | undefined;
    let oldPriority: TaskPriority | undefined;
    let newPriority: TaskPriority | undefined;

    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        oldStatus = t.status;
        newStatus = updates.status;
        oldPriority = t.priority;
        newPriority = updates.priority;

        return {
          ...t,
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    }));

    // Detect state alterations for Activity reporting
    const matchingTask = tasks.find(t => t.id === id);
    if (matchingTask) {
      if (newStatus && oldStatus !== newStatus) {
        const act: Activity = {
          id: `act-st-${Date.now()}`,
          taskId: id,
          taskTitle: matchingTask.title,
          text: `Moved task state from ${oldStatus} to ${newStatus}`,
          user: user?.name || 'Anonymous',
          userEmail: user?.email || '',
          type: 'status_change',
          createdAt: new Date().toISOString()
        };
        setActivities(prev => [act, ...prev]);

        // Push notification of status change
        const notif: Notification = {
          id: `n-st-${Date.now()}`,
          title: 'Task state changed',
          description: `Task "${matchingTask.title}" transitioned to "${newStatus}"`,
          type: 'status_change',
          read: false,
          taskId: id,
          createdAt: new Date().toISOString()
        };
        setNotifications(prev => [notif, ...prev]);
      }

      if (newPriority && oldPriority !== newPriority) {
        const act: Activity = {
          id: `act-pr-${Date.now()}`,
          taskId: id,
          taskTitle: matchingTask.title,
          text: `Updated priority level from ${oldPriority} to ${newPriority}`,
          user: user?.name || 'Anonymous',
          userEmail: user?.email || '',
          type: 'priority_change',
          createdAt: new Date().toISOString()
        };
        setActivities(prev => [act, ...prev]);
      }

      // Check generic updates like editing names
      if (updates.title && updates.title !== matchingTask.title) {
        const act: Activity = {
          id: `act-ed-${Date.now()}`,
          taskId: id,
          taskTitle: updates.title,
          text: `Renamed task: "${matchingTask.title}" ➔ "${updates.title}"`,
          user: user?.name || 'Anonymous',
          userEmail: user?.email || '',
          type: 'edit',
          createdAt: new Date().toISOString()
        };
        setActivities(prev => [act, ...prev]);
      }
    }
  };

  const deleteTask = (id: string) => {
    const deletedTask = tasks.find(t => t.id === id);
    setTasks(prev => prev.filter(t => t.id !== id));
    if (activeTaskDetailId === id) {
      setActiveTaskDetailId(null);
    }

    if (deletedTask) {
      const act: Activity = {
        id: `act-del-${Date.now()}`,
        text: `Deleted task "${deletedTask.title}"`,
        user: user?.name || 'Guest User',
        userEmail: user?.email || '',
        type: 'delete',
        createdAt: new Date().toISOString()
      };
      setActivities(prev => [act, ...prev]);
    }
  };

  const duplicateTask = (id: string) => {
    const taskToDup = tasks.find(t => t.id === id);
    if (taskToDup) {
      const duplicated: Task = {
        ...taskToDup,
        id: `task-dup-${Date.now()}`,
        title: `${taskToDup.title} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        comments: [], // Fresh details
        checklist: taskToDup.checklist.map(c => ({ ...c, id: `c-dup-${Math.random()}` })),
        attachments: []
      };
      setTasks(prev => [duplicated, ...prev]);

      const act: Activity = {
        id: `act-dup-${Date.now()}`,
        taskId: duplicated.id,
        taskTitle: duplicated.title,
        text: `Duplicated task "${taskToDup.title}" as copy`,
        user: user?.name || 'Guest User',
        userEmail: user?.email || '',
        type: 'duplicate',
        createdAt: new Date().toISOString()
      };
      setActivities(prev => [act, ...prev]);
    }
  };

  const archiveTask = (id: string) => {
    // Treat archiving as moving to backlog, or we could filter out. Simple way is deleting/moving!
    // Let's just adjust status to 'backlog' or delete. The prompt mentions archive, let's delete but flag
    // We already have a rich deleteTask. Let's just remove it and log "Archived task".
    const taskToArch = tasks.find(t => t.id === id);
    setTasks(prev => prev.filter(t => t.id !== id));
    if (activeTaskDetailId === id) setActiveTaskDetailId(null);

    if (taskToArch) {
      const act: Activity = {
        id: `act-arc-${Date.now()}`,
        text: `Archived task "${taskToArch.title}" into database vault`,
        user: user?.name || 'Guest',
        userEmail: user?.email || '',
        type: 'delete',
        createdAt: new Date().toISOString()
      };
      setActivities(prev => [act, ...prev]);
    }
  };

  // Checklist Actions
  const addChecklistItem = (taskId: string, title: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const newItem: ChecklistItem = {
          id: `c-item-${Date.now()}`,
          title,
          completed: false
        };
        return {
          ...t,
          checklist: [...t.checklist, newItem],
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    }));

    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const act: Activity = {
        id: `act-chk-${Date.now()}`,
        taskId,
        taskTitle: task.title,
        text: `Added checklist milestone: "${title}"`,
        user: user?.name || 'User',
        userEmail: user?.email || '',
        type: 'checklist',
        createdAt: new Date().toISOString()
      };
      setActivities(prev => [act, ...prev]);
    }
  };

  const toggleChecklistItem = (taskId: string, itemId: string) => {
    let resolvedItemTitle = '';
    let targetCompletion = false;

    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const nextChecklist = t.checklist.map(c => {
          if (c.id === itemId) {
            resolvedItemTitle = c.title;
            targetCompletion = !c.completed;
            return { ...c, completed: !c.completed };
          }
          return c;
        });
        return {
          ...t,
          checklist: nextChecklist,
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    }));

    const task = tasks.find(t => t.id === taskId);
    if (task && resolvedItemTitle) {
      const act: Activity = {
        id: `act-chktg-${Date.now()}`,
        taskId,
        taskTitle: task.title,
        text: `${targetCompletion ? 'Completed' : 'Reopened'} checklist item "${resolvedItemTitle}"`,
        user: user?.name || 'User',
        userEmail: user?.email || '',
        type: 'checklist',
        createdAt: new Date().toISOString()
      };
      setActivities(prev => [act, ...prev]);
    }
  };

  const deleteChecklistItem = (taskId: string, itemId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          checklist: t.checklist.filter(c => c.id !== itemId),
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    }));
  };

  // Comment Actions
  const addComment = (taskId: string, text: string) => {
    if (!text.trim()) return;

    const newComment: Comment = {
      id: `co-${Date.now()}`,
      author: user?.name || 'Guest Critic',
      authorEmail: user?.email || 'guest@flowboard.dev',
      text,
      createdAt: new Date().toISOString()
    };

    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          comments: [...t.comments, newComment],
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    }));

    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const act: Activity = {
        id: `act-com-${Date.now()}`,
        taskId,
        taskTitle: task.title,
        text: `Submitted inline review: "${text.substring(0, 45)}${text.length > 45 ? '...' : ''}"`,
        user: user?.name || 'Guest Critic',
        userEmail: user?.email || '',
        type: 'comment',
        createdAt: new Date().toISOString()
      };
      setActivities(prev => [act, ...prev]);
    }
  };

  // Attachment Actions
  const addAttachment = (taskId: string, name: string, type: string, size: string) => {
    const newAttach: Attachment = {
      id: `att-${Date.now()}`,
      name,
      type,
      size,
      url: '#'
    };

    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          attachments: [...t.attachments, newAttach],
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    }));

    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const act: Activity = {
        id: `act-att-${Date.now()}`,
        taskId,
        taskTitle: task.title,
        text: `Uploaded attachment document: ${name}`,
        user: user?.name || 'User',
        userEmail: user?.email || '',
        type: 'edit',
        createdAt: new Date().toISOString()
      };
      setActivities(prev => [act, ...prev]);
    }
  };

  const deleteAttachment = (taskId: string, attachmentId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          attachments: t.attachments.filter(a => a.id !== attachmentId),
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    }));
  };

  // Notification Actions
  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <FlowStoreContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        updateUser,
        activeTab,
        setActiveTab,
        theme,
        toggleTheme,
        boards,
        activeBoardId,
        setActiveBoardId,
        createBoard,
        updateBoard,
        deleteBoard,
        setBoards,
        tasks,
        addTask,
        updateTask,
        deleteTask,
        duplicateTask,
        archiveTask,
        addChecklistItem,
        toggleChecklistItem,
        deleteChecklistItem,
        addComment,
        addAttachment,
        deleteAttachment,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        clearAllNotifications,
        activities,
        searchQuery,
        setSearchQuery,
        sidebarOpen,
        setSidebarOpen,
        activeTaskDetailId,
        setActiveTaskDetailId,
        focusScore,
        workloadWarning,
        workflowBottleneck,
        deadlineRisks
      }}
    >
      {children}
    </FlowStoreContext.Provider>
  );
};

export const useFlowStore = () => {
  const context = useContext(FlowStoreContext);
  if (context === undefined) {
    throw new Error('useFlowStore must be used within a FlowStoreProvider');
  }
  return context;
};
