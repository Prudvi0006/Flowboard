/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useFlowStore } from '../store/flowStore';
import { Task } from '../types';
import { 
  CheckCircle, 
  Calendar, 
  AlertTriangle, 
  ClipboardList, 
  Activity, 
  ArrowUpRight, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  User,
  ExternalLink 
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const {
    tasks,
    activities,
    focusScore,
    workloadWarning,
    workflowBottleneck,
    deadlineRisks,
    setActiveTaskDetailId,
    setActiveTab,
    user,
    activeBoardId
  } = useFlowStore();

  // 1. Calculate General Aggregations
  const boardTasks = tasks.filter(t => t.boardId === activeBoardId || (!t.boardId && activeBoardId === 'b-default'));
  const totalCount = boardTasks.length;
  const completedCount = boardTasks.filter(t => t.status === 'done').length;
  const activeCount = boardTasks.filter(t => t.status === 'todo' || t.status === 'in_progress' || t.status === 'review').length;
  
  const nowTime = new Date().getTime();
  const overdueCount = boardTasks.filter(t => {
    if (t.status === 'done') return false;
    return new Date(t.dueDate).getTime() < nowTime;
  }).length;

  // 2. Fetch future upcoming deadlines (limit to 4)
  const upcomingTasks = boardTasks
    .filter(t => t.status !== 'done')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  // 3. Format Date
  const formatDateString = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleOpenTask = (id: string) => {
    setActiveTaskDetailId(id);
    setActiveTab('kanban'); // Shift to board view
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic Header Greeting */}
      <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-neutral-100 md:text-2xl">
            Welcome back, {user ? user.name.split(' ')[0] : 'Developer'}
          </h1>
          <p className="text-xs text-gray-500 dark:text-neutral-400 font-medium">
            Here is a smart overview of your flow indicators and milestone safety limits.
          </p>
        </div>
        <div className="text-right text-[11px] font-semibold text-gray-400 dark:text-neutral-500 font-mono">
          Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC
        </div>
      </div>

      {/* METRIC HIGHLIGHT CARDS ROW */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {/* Total Tasks */}
        <div className="rounded-2xl border border-gray-150 bg-white p-4 dark:border-neutral-850 dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-505">
              Total Backlog
            </span>
            <span className="rounded-lg bg-gray-55 px-2 py-1 text-gray-500 dark:bg-neutral-800 dark:text-neutral-400">
              <ClipboardList className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900 dark:text-neutral-50">{totalCount}</span>
            <span className="text-[10px] text-gray-400">items</span>
          </div>
        </div>

        {/* Active Tasks */}
        <div className="rounded-2xl border border-gray-150 bg-white p-4 dark:border-neutral-850 dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-505">
              Active Sprint
            </span>
            <span className="rounded-lg bg-gray-55 px-2 py-1 text-gray-500 dark:bg-neutral-850 dark:text-neutral-400">
              <Activity className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900 dark:text-neutral-55">{activeCount}</span>
            <span className="text-[10px] text-gray-400">in flight</span>
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="rounded-2xl border border-gray-150 bg-white p-4 dark:border-neutral-850 dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-505">
              Completions
            </span>
            <span className="rounded-lg bg-emerald-50 px-2 py-1 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
              <CheckCircle className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900 dark:text-neutral-50">{completedCount}</span>
            <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-450 flex items-center">
              {totalCount > 0 ? Math.round((completedCount / totalCount) * 10) * 10 : 0}% rate
            </p>
          </div>
        </div>

        {/* Overdue/Near Risk Tasks */}
        <div className="rounded-2xl border border-gray-150 bg-white p-4 dark:border-neutral-850 dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-505">
              Overdue Risks
            </span>
            <span className={`rounded-lg px-2 py-1 ${overdueCount > 0 ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400' : 'bg-gray-55 text-gray-400'}`}>
              <AlertTriangle className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className={`text-2xl font-black ${overdueCount > 0 ? 'text-rose-650 dark:text-rose-450' : 'text-gray-900 dark:text-neutral-50'}`}>{overdueCount}</span>
            <span className="text-[10px] text-gray-400">unresolved</span>
          </div>
        </div>
      </div>

      {/* SMART ALERT DIAGNOSTIC CARD */}
      {(workloadWarning?.isOverloaded || workflowBottleneck) && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {workloadWarning?.isOverloaded && (
            <div className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50/45 p-4 text-xs font-medium text-amber-850 dark:border-amber-950/30 dark:bg-amber-950/10 dark:text-amber-400 shadow-2xs">
              <AlertTriangle className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5 animate-bounce" />
              <div>
                <p className="font-bold">Workload Threshold Exhaustion</p>
                <p className="mt-1 leading-relaxed text-gray-600 dark:text-neutral-350">{workloadWarning.message}</p>
                <button
                  onClick={() => setActiveTab('kanban')}
                  className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-neutral-900 hover:underline dark:text-amber-300"
                >
                  <span>Optimize workspace drag order</span>
                  <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}

          {workflowBottleneck && (
            <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 text-xs font-medium text-indigo-850 dark:border-indigo-950/30 dark:bg-indigo-950/10 dark:text-indigo-400 shadow-2xs">
              <Activity className="h-4.5 w-4.5 text-indigo-500 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <p className="font-bold">Workflow Bottleneck Analysis</p>
                <p className="mt-1 leading-relaxed text-gray-650 dark:text-neutral-350">{workflowBottleneck.message}</p>
                <button
                  onClick={() => setActiveTab('kanban')}
                  className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-neutral-900 hover:underline dark:text-indigo-300"
                >
                  <span>Inspect columns flow</span>
                  <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PRODUCTIVITY METER BOARD GRID SPLIT */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Side: Circular Focus Rating Card */}
        <div className="flex flex-col justify-between rounded-2xl border border-gray-150 bg-white p-5 dark:border-neutral-850 dark:bg-neutral-900">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500">
                Focus Score quotient
              </h3>
              <Sparkles className="h-4 w-4 text-emerald-500" />
            </div>
            
            {/* Massive dynamic rating number */}
            <div className="mt-6 flex flex-col items-center justify-center text-center">
              <div className="relative flex h-32 w-32 items-center justify-center">
                {/* SVG Circle indicator */}
                <svg className="absolute inset-0 h-full w-full rotate-270 transform">
                  <circle
                    className="text-gray-100 dark:text-neutral-800"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="52"
                    cx="64"
                    cy="64"
                  />
                  <circle
                    className="text-neutral-900 dark:text-amber-400"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 52}
                    strokeDashoffset={2 * Math.PI * 52 * (1 - focusScore / 100)}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="52"
                    cx="64"
                    cy="64"
                  />
                </svg>
                <div className="text-center">
                  <span className="text-3xl font-black text-gray-900 dark:text-neutral-50">{focusScore}</span>
                  <span className="block text-[10px] text-gray-400 font-bold uppercase mt-0.5">Focus</span>
                </div>
              </div>

              <div className="mt-5 space-y-1.5">
                <p className="text-xs font-bold text-gray-800 dark:text-neutral-200">
                  {focusScore >= 80 ? 'Highly Optimised Focus' : focusScore >= 50 ? 'Steady Execution Rate' : 'Interrupted Velocity'}
                </p>
                <p className="max-w-[200px] text-[11px] text-gray-400 leading-normal">
                  Quotient score based on completed subtasks, overdue penalties, and context-switching rates.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-100 pt-4 dark:border-neutral-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-medium text-gray-500">
              <span>Task checklist rate</span>
              <span className="font-mono">{boardTasks.length > 0 ? Math.round((completedCount / boardTasks.length) * 100) : 0}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-neutral-800 overflow-hidden">
              <div 
                className="h-full bg-neutral-900 dark:bg-amber-400"
                style={{ width: `${boardTasks.length > 0 ? (completedCount / boardTasks.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center Side: Upcoming Deadlines */}
        <div className="rounded-2xl border border-gray-150 bg-white p-5 dark:border-neutral-850 dark:bg-neutral-900 lg:col-span-1">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-neutral-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500">
              Milestone Deadlines
            </h3>
            <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">
              {upcomingTasks.length} pending
            </span>
          </div>

          <div className="mt-4 space-y-3.5">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map((t) => {
                const isOverdue = new Date(t.dueDate).getTime() < nowTime;
                return (
                  <div 
                    key={t.id}
                    onClick={() => handleOpenTask(t.id)}
                    className="group flex flex-col justify-between rounded-xl border border-gray-100/70 p-3 hover:bg-neutral-50/50 cursor-pointer dark:border-neutral-850 dark:hover:bg-neutral-950/30 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <p className="text-xs font-extrabold text-gray-900 dark:text-neutral-200 truncate pr-2 group-hover:underline">
                        {t.title}
                      </p>
                      <span className={`text-[9px] font-bold uppercase rounded px-1.5 py-0.5 ${
                        t.priority === 'critical' ? 'bg-red-50 text-red-650 dark:bg-red-950/20 dark:text-red-450' : 'bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-neutral-400'
                      }`}>
                        {t.priority}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[10px] text-gray-400">
                      <span className="flex items-center gap-1 font-semibold">
                        <Clock className="h-3.5 w-3.5 text-gray-300" />
                        <span>Estimate: {t.estimatedHours} hrs</span>
                      </span>
                      <span className={`font-bold font-mono ${isOverdue ? 'text-rose-600 animate-pulse' : 'text-gray-500'}`}>
                        {isOverdue ? 'OVERDUE' : `Due ${formatDateString(t.dueDate)}`}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex h-56 flex-col items-center justify-center text-center">
                <p className="text-xs font-bold text-gray-600 dark:text-neutral-401">A clean schedule.</p>
                <p className="text-[10px] text-gray-400 mt-1">No upcoming milestones due shortly.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Timeline Activity Feed */}
        <div className="rounded-2xl border border-gray-150 bg-white p-5 dark:border-neutral-850 dark:bg-neutral-900">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-neutral-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500">
              Workspace activity audit
            </h3>
            <span className="text-[10px] font-semibold text-gray-400">Audit logs</span>
          </div>

          <div className="mt-4 h-72 overflow-y-auto pr-1 space-y-4">
            {activities.length > 0 ? (
              activities.map((act) => (
                <div key={act.id} className="relative flex gap-3.5 pl-2 text-xs">
                  {/* Timeline branch line connector */}
                  <span className="absolute top-2 left-[15px] bottom-[-20px] w-px bg-gray-100 dark:bg-neutral-800" />
                  
                  {/* Icon Bullet */}
                  <div className="relative z-10 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-50 border border-gray-100 dark:bg-neutral-950 dark:border-neutral-800 text-[10px] font-bold">
                    {act.type === 'create' && '➕'}
                    {act.type === 'status_change' && '🔄'}
                    {act.type === 'comment' && '💬'}
                    {act.type === 'checklist' && '☑️'}
                    {act.type === 'priority_change' && '⚠️'}
                    {act.type === 'delete' && '🗑️'}
                    {act.type === 'edit' && '✏️'}
                  </div>

                  {/* Log descriptions */}
                  <div className="flex-1 pb-1">
                    <p className="font-semibold text-gray-800 dark:text-neutral-300">
                      {act.user === user?.name ? 'You' : act.user}{' '}
                      <span className="font-normal text-gray-500 dark:text-neutral-450">{act.text}</span>
                    </p>
                    {act.taskTitle && (
                      <button
                        onClick={() => act.taskId && handleOpenTask(act.taskId)}
                        className="mt-1 text-[10px] font-bold text-neutral-900 hover:underline hover:text-neutral-750 dark:text-amber-400 block text-left"
                      >
                        Task: "{act.taskTitle}"
                      </button>
                    )}
                    <span className="mt-1 block text-[9px] text-gray-400 font-mono">
                      {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-xs text-gray-400 pt-12">No workspace audits documented yet.</p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
