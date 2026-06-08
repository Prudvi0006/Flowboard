/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useFlowStore } from '../store/flowStore';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle, Activity, Kanban } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const {
    tasks,
    focusScore,
    workflowBottleneck,
    workloadWarning
  } = useFlowStore();

  // 1. Bottleneck Analytics: column distribution
  const bottleneckData = [
    { name: 'Backlog', Tasks: tasks.filter(t => t.status === 'backlog').length },
    { name: 'To Do', Tasks: tasks.filter(t => t.status === 'todo').length },
    { name: 'In Progress', Tasks: tasks.filter(t => t.status === 'in_progress').length },
    { name: 'Review', Tasks: tasks.filter(t => t.status === 'review').length },
    { name: 'Completed', Tasks: tasks.filter(t => t.status === 'done').length }
  ];

  // 2. Focus score over time (Trends graph)
  // Let last point react live with active state calculations
  const focusTrendData = [
    { name: 'Wk-21', Score: 60 },
    { name: 'Wk-22', Score: 78 },
    { name: 'Wk-23', Score: 65 },
    { name: 'Wk-24', Score: 85 },
    { name: 'Wk-25', Score: 74 },
    { name: 'Wk-26', Score: focusScore } // Live bound!
  ];

  // 3. Task Completion by Priority levels
  const priorities = ['low', 'medium', 'high', 'critical'] as const;
  const priorityCompletionData = priorities.map(pri => {
    const total = tasks.filter(t => t.priority === pri).length;
    const completed = tasks.filter(t => t.priority === pri && t.status === 'done').length;
    return {
      name: pri.charAt(0).toUpperCase() + pri.slice(1),
      Completed: completed,
      Pending: total - completed
    };
  });

  // 4. Deadline Performance details
  const totalIncomplete = tasks.filter(t => t.status !== 'done');
  const overdueCount = tasks.filter(t => {
    if (t.status === 'done') return false;
    return new Date(t.dueDate).getTime() < Date.now();
  }).length;
  const completedCount = tasks.filter(t => t.status === 'done').length;

  const onTimeCount = Math.max(0, completedCount - overdueCount);
  const missedCount = overdueCount;

  const deadlinePieData = [
    { name: 'On-Time Completions', value: onTimeCount > 0 ? onTimeCount : 4, color: '#10b981' }, // fallbacks for mock aesthetic
    { name: 'Overdue Risks', value: missedCount > 0 ? missedCount : 1, color: '#f43f5e' }
  ];

  return (
    <div className="space-y-6">
      
      {/* ANALYTICS PAGE HEADER */}
      <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-neutral-100 md:text-2xl">
            SaaS Productivity Analytics
          </h1>
          <p className="text-xs text-gray-500 dark:text-neutral-450 font-medium">
            Monitor flow score quotients, analyze bottleneck risks, and audit focus metrics.
          </p>
        </div>
        <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
          Focus: <span className="font-mono font-bold">{focusScore}/100</span>
        </div>
      </div>

      {/* WARNING NOTICES */}
      {workflowBottleneck && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50/20 p-4 text-xs font-semibold text-rose-800 dark:border-rose-950/30 dark:bg-rose-950/10 dark:text-rose-450">
          <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />
          <div>
            <p className="font-bold">Active Bottleneck Diagnostics Alert</p>
            <p className="mt-1 leading-relaxed text-gray-600 dark:text-neutral-350">{workflowBottleneck.message}</p>
          </div>
        </div>
      )}

      {/* CHARTS GRID CONTAINER */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        
        {/* CHART 1: Focus Score Trend area */}
        <div className="rounded-2xl border border-gray-150 bg-white p-5 dark:border-neutral-850 dark:bg-neutral-900 shadow-3xs">
          <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-neutral-800">
            <div>
              <h3 className="text-xs font-black text-gray-900 dark:text-neutral-100 uppercase tracking-wide">
                Focus score velocity trends
              </h3>
              <p className="text-[10px] text-gray-400 font-medium mt-0.5">Productivity rating coordinates over current weeks milestone</p>
            </div>
            <Sparkles className="h-4.5 w-4.5 text-amber-500" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={focusTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-neutral-800" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} domain={[40, 100]} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#171717', 
                    borderRadius: '8px', 
                    border: 'none', 
                    color: '#f5f5f5',
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }} 
                />
                <Area type="monotone" dataKey="Score" stroke="#d97706" strokeWidth={2.5} fillOpacity={1} fill="url(#colorFocus)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Column Bottleneck analysis Bar Chart */}
        <div className="rounded-2xl border border-gray-150 bg-white p-5 dark:border-neutral-850 dark:bg-neutral-900 shadow-3xs">
          <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-neutral-800">
            <div>
              <h3 className="text-xs font-black text-gray-900 dark:text-neutral-100 uppercase tracking-wide">
                Column task distributions
              </h3>
              <p className="text-[10px] text-gray-400 font-medium mt-0.5">Detect column bloat (&gt;40% capacity threshold risks)</p>
            </div>
            <Activity className="h-4.5 w-4.5 text-indigo-500" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bottleneckData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-neutral-800" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#171717', 
                    borderRadius: '8px', 
                    border: 'none', 
                    color: '#f5f5f5',
                    fontSize: '11px'
                  }} 
                />
                <Bar dataKey="Tasks" fill="#171717" radius={[4, 4, 0, 0]} className="dark:fill-neutral-100" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 3: Sprint velocity by priority stacked bars */}
        <div className="rounded-2xl border border-gray-150 bg-white p-5 dark:border-neutral-850 dark:bg-neutral-900 shadow-3xs">
          <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-neutral-800">
            <div>
              <h3 className="text-xs font-black text-gray-900 dark:text-neutral-100 uppercase tracking-wide">
                Completions by Priority
              </h3>
              <p className="text-[10px] text-gray-400 font-medium mt-0.5">Ratio of completed tasks against remaining backlog items</p>
            </div>
            <TrendingUp className="h-4.5 w-4.5 text-emerald-500" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityCompletionData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-neutral-800" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#171717', 
                    borderRadius: '8px', 
                    border: 'none', 
                    color: '#f5f5f5',
                    fontSize: '11px'
                  }} 
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                <Bar dataKey="Completed" stackId="priority_stack" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Pending" stackId="priority_stack" fill="#e2e8f0" className="dark:fill-neutral-800" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 4: On-time vs late (Deadlines Compliance donut/pie) */}
        <div className="rounded-2xl border border-gray-150 bg-white p-5 dark:border-neutral-850 dark:bg-neutral-900 shadow-3xs">
          <div className="mb-4 flex items-center justify-between border-b border-gray-105 pb-3 dark:border-neutral-800">
            <div>
              <h3 className="text-xs font-black text-gray-900 dark:text-neutral-100 uppercase tracking-wide">
                Deadline compliance ratios
              </h3>
              <p className="text-[10px] text-gray-400 font-medium mt-0.5">Distribution of milestones resolved inside safety deadlines</p>
            </div>
          </div>

          <div className="flex h-64 items-center justify-center">
            <div className="h-full w-2/3">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#171717', 
                      borderRadius: '8px', 
                      border: 'none', 
                      color: '#f5f5f5',
                      fontSize: '11px'
                    }} 
                  />
                  <Pie
                    data={deadlinePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {deadlinePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* List indicators for Pie Chart */}
            <div className="w-1/3 space-y-3.5 pr-2">
              {deadlinePieData.map(d => (
                <div key={d.name} className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-neutral-350">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="truncate">{d.name.split(' ')[0]}</span>
                  </div>
                  <p className="text-[10px] font-mono font-bold text-gray-400 pl-4">{d.value} items total</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
