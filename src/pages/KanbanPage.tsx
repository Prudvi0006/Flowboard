/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFlowStore } from '../store/flowStore';
import { Task, TaskStatus, TaskPriority } from '../types';
import { 
  Plus, 
  Search, 
  Trash2, 
  Copy, 
  FolderMinus, 
  CheckSquare, 
  Clock, 
  User, 
  ChevronRight, 
  Filter, 
  Calendar, 
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  X,
  FileText,
  Workflow
} from 'lucide-react';

export const KanbanPage: React.FC = () => {
  const {
    user,
    tasks,
    addTask,
    updateTask,
    deleteTask,
    duplicateTask,
    archiveTask,
    setActiveTaskDetailId,
    boards,
    activeBoardId,
    searchQuery,
    setSearchQuery,
    workflowBottleneck,
    workloadWarning
  } = useFlowStore();

  const board = boards.find(b => b.id === activeBoardId);

  // Quick state overrides
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(null);

  // Create Task Form States
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState(() => {
    // default to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [newTaskHours, setNewTaskHours] = useState(4);
  const [newTaskTags, setNewTaskTags] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState(user?.name || 'Guest Developer');
  const [newTaskEmail, setNewTaskEmail] = useState(user?.email || 'developer@flowboard.io');

  // 1. Column structures
  const columns: { id: TaskStatus; name: string; color: string; hoverColor: string }[] = [
    { id: 'backlog', name: 'Backlog', color: 'border-t-slate-400 bg-slate-50/25', hoverColor: 'bg-slate-50' },
    { id: 'todo', name: 'To Do', color: 'border-t-blue-500 bg-blue-50/15', hoverColor: 'bg-blue-50/30' },
    { id: 'in_progress', name: 'In Progress', color: 'border-t-indigo-500 bg-indigo-50/15', hoverColor: 'bg-indigo-50/30' },
    { id: 'review', name: 'Review', color: 'border-t-amber-500 bg-amber-50/15', hoverColor: 'bg-amber-50/30' },
    { id: 'done', name: 'Completed', color: 'border-t-emerald-500 bg-emerald-50/15', hoverColor: 'bg-emerald-50/30' }
  ];

  // 2. Filter logic
  const filteredTasks = tasks.filter(t => {
    const boardMatch = t.boardId === activeBoardId || (!t.boardId && activeBoardId === 'b-default');
    if (!boardMatch) return false;

    // Search query matches title/description/tags/assignee
    const query = searchQuery.toLowerCase().trim();
    const queryMatch = query === '' || (
      t.title.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query) ||
      t.assignee.toLowerCase().includes(query) ||
      t.tags.some(tag => tag.toLowerCase().includes(query))
    );

    // Priority Match
    const priorityMatch = filterPriority === 'all' || t.priority === filterPriority;

    // Tag Match
    const tagMatch = filterTag === 'all' || t.tags.some(tag => tag.toLowerCase() === filterTag.toLowerCase());

    return queryMatch && priorityMatch && tagMatch;
  });

  // Calculate unique tags from active board tasks for filter options
  const boardTasksOnly = tasks.filter(t => t.boardId === activeBoardId || (!t.boardId && activeBoardId === 'b-default'));
  const allUiTags = Array.from(new Set(boardTasksOnly.flatMap(t => t.tags)));

  // 3. Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string, currentStatus: string) => {
    e.dataTransfer.setData('task_id', taskId);
    e.dataTransfer.setData('source_status', currentStatus);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (draggedOverColumn !== columnId) {
      setDraggedOverColumn(columnId);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    setDraggedOverColumn(null);

    const taskId = e.dataTransfer.getData('task_id');
    const sourceStatus = e.dataTransfer.getData('source_status');

    if (taskId && sourceStatus !== targetStatus) {
      updateTask(taskId, { status: targetStatus });
    }
  };

  // 4. Form Submission trigger
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    // Parse tag items
    const parsedTags = newTaskTags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    addTask({
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim(),
      status: 'todo', // default start column
      priority: newTaskPriority,
      dueDate: newTaskDueDate,
      estimatedHours: Number(newTaskHours) || 4,
      tags: parsedTags.length > 0 ? parsedTags : ['Sprint-1'],
      assignee: newTaskAssignee.trim() || user?.name || 'Guest Developer',
      assigneeEmail: newTaskEmail.trim() || user?.email || 'developer@flowboard.io'
    });

    // Reset fields
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskPriority('medium');
    setNewTaskHours(4);
    setNewTaskTags('');
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* KANBAN BOARD HEADER INFO */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-neutral-100 md:text-2xl flex items-center gap-2">
            <input
              type="text"
              value={board?.name || 'Workspace Sprint'}
              onChange={() => {}} // simulated title switch
              className="bg-transparent border-0 font-extrabold p-0 focus:outline-none focus:ring-0 text-gray-900 dark:text-neutral-100 cursor-default"
              title="Board Name details"
            />
          </h1>
          <p className="text-xs text-gray-500 dark:text-neutral-450 font-medium">
            {board?.description || 'Build modular full-stack capabilities synced with local storages.'}
          </p>
        </div>

        {/* Create Task Floating CTA */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 transition-all shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Task Card</span>
        </button>
      </div>

      {/* SEARCH / FILTERS BAR ROW */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-150 bg-white p-4 dark:border-neutral-850 dark:bg-neutral-900 sm:flex-row sm:items-center justify-between">
        
        {/* Instant filter query inputs */}
        <div className="relative w-full max-w-xs">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Filter current board cards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-1.5 pl-9 pr-3 text-xs font-medium focus:border-neutral-900 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
          />
        </div>

        {/* Advanced Priority and Tags inline filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Priority filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-gray-400" />
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="rounded-lg border border-gray-250 bg-white py-1 px-2 text-xs font-semibold text-gray-750 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          {/* Tags filter */}
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="rounded-lg border border-gray-250 bg-white py-1 px-2 text-xs font-semibold text-gray-750 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400"
          >
            <option value="all">All Tags</option>
            {allUiTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KANBAN BOARD FLEX COLUMNS */}
      <div className="flex gap-4 overflow-x-auto pb-4 w-full h-[calc(100vh-285px)] min-h-[500px] items-stretch pr-2">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter(t => t.status === col.id);
          const isOverloadedCol = workloadWarning?.isOverloaded && (col.id === 'todo' || col.id === 'in_progress');
          const isBottleneckCol = workflowBottleneck?.column === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`flex flex-col rounded-2xl border-t-2 p-4 transition-all duration-200 min-w-[280px] w-[280px] md:min-w-[300px] md:w-[300px] h-full ${
                col.id === 'backlog' ? 'border-t-slate-400 bg-slate-50/50 dark:bg-neutral-900/40' :
                col.id === 'todo' ? 'border-t-blue-500 bg-blue-50/30 dark:bg-neutral-900/40' :
                col.id === 'in_progress' ? 'border-t-indigo-500 bg-indigo-50/30 dark:bg-neutral-900/40' :
                col.id === 'review' ? 'border-t-amber-500 bg-amber-50/30 dark:bg-neutral-900/40' :
                'border-t-emerald-500 bg-emerald-50/30 dark:bg-neutral-900/40'
              } ${
                draggedOverColumn === col.id ? 'border-2 border-dashed border-neutral-400 dark:border-neutral-700 bg-gray-100/50 dark:bg-neutral-800/50' : ''
              }`}
            >
              {/* Column Header meta */}
              <div className="mb-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black tracking-tight text-gray-900 dark:text-neutral-100 uppercase">
                    {col.name}
                  </span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-650 dark:bg-neutral-850 dark:text-neutral-400">
                    {colTasks.length}
                  </span>
                </div>

                {/* Warning indicators block */}
                {isBottleneckCol && (
                  <span 
                    className="flex h-4 w-4 items-center justify-center rounded bg-amber-100 text-amber-700 text-[10px]"
                    title={workflowBottleneck.message}
                  >
                    ⚠️
                  </span>
                )}
              </div>

              {/* Tasks List inside Column */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                {colTasks.length > 0 ? (
                  colTasks.map((t) => {
                    const totalChecks = t.checklist.length;
                    const doneChecks = t.checklist.filter(c => c.completed).length;

                    return (
                      <div
                        key={t.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, t.id, t.status)}
                        onClick={() => setActiveTaskDetailId(t.id)}
                        className="group relative rounded-xl border border-gray-150 bg-white p-3.5 shadow-2xs hover:shadow-xs hover:border-gray-350 dark:border-neutral-850 dark:bg-neutral-900 transition-all cursor-pointer select-none active:cursor-grabbing"
                      >
                        {/* Task Priority Level row */}
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] font-black uppercase rounded-md px-1.5 py-0.5 tracking-wide ${
                            t.priority === 'critical' ? 'bg-red-50 text-red-650 dark:bg-rose-950/20 dark:text-rose-450' :
                            t.priority === 'high' ? 'bg-orange-50 text-orange-650 dark:bg-orange-950/20 dark:text-orange-450' :
                            t.priority === 'medium' ? 'bg-blue-50 text-blue-650 dark:bg-blue-950/20 dark:text-blue-450' :
                            'bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-neutral-400'
                          }`}>
                            {t.priority}
                          </span>

                          <span className="text-[9px] font-bold font-mono text-gray-400 shrink-0">
                            ID: {t.id}
                          </span>
                        </div>

                        {/* Title details */}
                        <h4 className="mt-2.5 text-xs font-extrabold text-gray-900 dark:text-neutral-100 leading-snug group-hover:underline">
                          {t.title}
                        </h4>

                        {/* Checklist progress and clocks metadata */}
                        <div className="mt-3.5 flex flex-wrap items-center gap-2 text-[10px] text-gray-450">
                          {/* Checklist fraction indicators */}
                          {totalChecks > 0 && (
                            <span className="flex items-center gap-1 font-semibold leading-normal bg-emerald-50/50 dark:bg-emerald-950/15 px-1.5 py-0.5 rounded text-emerald-700 dark:text-emerald-400">
                              <CheckSquare className="h-3 w-3" />
                              <span>{doneChecks}/{totalChecks} ({Math.round(doneChecks/totalChecks*100)}%)</span>
                            </span>
                          )}

                          {/* Est clocks hours */}
                          <span className="flex items-center gap-1 font-semibold">
                            <Clock className="h-3.5 w-3.5 text-gray-300" />
                            <span>{t.estimatedHours}h</span>
                          </span>
                        </div>

                        {/* Tag list identifiers */}
                        {t.tags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {t.tags.slice(0, 3).map(tag => (
                              <span 
                                key={tag} 
                                className="rounded-md bg-gray-55 px-1.5 py-0.5 text-[9px] font-extrabold text-gray-450 uppercase dark:bg-neutral-800 dark:text-neutral-450"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Divider space */}
                        <div className="my-3 border-t border-gray-100 dark:border-neutral-850" />

                        {/* Assignee Initial Circle */}
                        <div className="flex items-center justify-between text-[10px]">
                          <div className="flex items-center gap-1.5 text-gray-550 dark:text-neutral-350 font-semibold truncate pr-4">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-[9px] font-bold text-white dark:bg-neutral-700 text-center">
                              {t.assignee.charAt(0)}
                            </span>
                            <span className="truncate">{t.assignee}</span>
                          </div>
                          
                          <span className="text-[9px] font-bold text-gray-400 dark:text-neutral-500 font-mono">
                            {new Date(t.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>

                        {/* Quick Toolbar (Hover trigger controls) */}
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-white p-1 rounded-md shadow-xs opacity-0 group-hover:opacity-100 transition-opacity dark:bg-neutral-900">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateTask(t.id);
                            }}
                            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-neutral-800"
                            title="Duplicate Card"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              archiveTask(t.id);
                            }}
                            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-neutral-800"
                            title="Archive Card"
                          >
                            <FolderMinus className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTask(t.id);
                            }}
                            className="rounded p-1 text-rose-500 hover:bg-rose-50"
                            title="Delete Card"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>

                      </div>
                    );
                  })
                ) : (
                  <div className="flex h-36 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 text-center text-gray-400 dark:border-neutral-800 dark:text-neutral-500 bg-white/10">
                    <p className="text-[10px] font-bold">Column empty</p>
                    <p className="text-[9px] mt-0.5">Drag cards here</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE TASK MODAL DIALOG */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/20 p-4 backdrop-blur-xs">
          <div className="fixed inset-0" onClick={() => setShowCreateModal(false)} />
          
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-2xl dark:border-neutral-850 dark:bg-neutral-900">
            {/* Modal Title header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-neutral-800">
              <h3 className="text-sm font-bold text-gray-900 dark:text-neutral-100">
                Create a New Task Card
              </h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-800"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Actions form */}
            <form onSubmit={handleCreateTask} className="mt-4 space-y-4">
              {/* Title input */}
              <div className="space-y-1">
                <input
                  type="text"
                  required
                  placeholder="Task title (e.g. Optimize Prisma database indices)"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50"
                />
              </div>

              {/* Description Input */}
              <div className="space-y-1">
                <textarea
                  placeholder="Granular definitions, checklist logs..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50"
                />
              </div>

              {/* Priority & Estimates block split columns */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gray-450">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                    className="w-full rounded-lg border border-gray-200 bg-white py-1.5 pl-2 pr-4 text-xs font-semibold text-gray-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gray-450">Estimate (Hrs)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newTaskHours}
                    onChange={(e) => setNewTaskHours(Number(e.target.value) || 4)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50"
                  />
                </div>
              </div>

              {/* Due Date details */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-450">Due Date</label>
                <input
                  type="date"
                  required
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50"
                />
              </div>

              {/* Tag definitions */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-450">Tags (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="Backend, Infra, Performance"
                  value={newTaskTags}
                  onChange={(e) => setNewTaskTags(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50"
                />
              </div>

              {/* Assignee details */}
              <div className="grid grid-cols-2 gap-3 border-t border-gray-50 pt-3 dark:border-neutral-800">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gray-450">Assignee Name</label>
                  <input
                    type="text"
                    required
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs font-semibold text-gray-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gray-450">Assignee Email</label>
                  <input
                    type="email"
                    required
                    value={newTaskEmail}
                    onChange={(e) => setNewTaskEmail(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs font-normal text-gray-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="mt-5 flex justify-end gap-2 border-t border-gray-50 pt-3 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg px-3 py-2 text-xs font-semibold text-gray-400 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-neutral-900 px-4 py-2 text-xs font-bold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950"
                >
                  Create Board Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
