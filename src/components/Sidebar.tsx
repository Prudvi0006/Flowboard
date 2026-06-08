/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFlowStore } from '../store/flowStore';
import { Board } from '../types';
import { 
  LayoutDashboard, 
  Trello, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  FolderKanban, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Inbox,
  Workflow,
  PlusCircle,
  Hash,
  Activity,
  Settings
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    boards,
    activeBoardId,
    setActiveBoardId,
    createBoard,
    tasks,
    sidebarOpen,
    setSidebarOpen,
    theme
  } = useFlowStore();

  const [showAddBoard, setShowAddBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDesc, setNewBoardDesc] = useState('');

  // Count active tasks for indicators
  const backlogCount = tasks.filter(t => t.status === 'backlog').length;
  const activeCount = tasks.filter(t => t.status === 'todo' || t.status === 'in_progress' || t.status === 'review').length;
  const doneCount = tasks.filter(t => t.status === 'done').length;

  const handleCreateBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;
    const board = createBoard(newBoardName.trim(), newBoardDesc.trim());
    setNewBoardName('');
    setNewBoardDesc('');
    setShowAddBoard(false);
    setActiveBoardId(board.id);
  };

  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'kanban', name: 'Kanban Board', icon: Trello, badge: activeCount > 0 ? activeCount : null },
    { id: 'calendar', name: 'Calendar Schedule', icon: CalendarIcon, badge: null },
    { id: 'analytics', name: 'Performance Analytics', icon: TrendingUp, badge: null },
    { id: 'settings', name: 'Workspace Settings', icon: Settings, badge: null }
  ] as const;

  if (!sidebarOpen) {
    return (
      <aside className="hidden h-screen w-16 flex-col items-center border-r border-gray-100 bg-white py-4 text-center dark:border-neutral-900 dark:bg-neutral-950 transition-all duration-300 lg:flex z-40">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-black text-lg shadow-sm">
          F
        </div>
        
        <div className="mt-8 flex flex-1 flex-col gap-5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={item.name}
                className={`relative rounded-xl p-3 transition-all ${
                  isActive
                    ? 'bg-neutral-150 text-neutral-950 dark:bg-neutral-800 dark:text-neutral-50'
                    : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600 dark:text-neutral-500 dark:hover:bg-neutral-900/50'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.badge !== null && (
                  <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-neutral-900 dark:bg-amber-500" />
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-xl p-2.5 text-gray-400 hover:bg-gray-50 dark:text-neutral-500 dark:hover:bg-neutral-900/50"
          title="Expand Sidebar"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </aside>
    );
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col border-r border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 transition-all duration-300 lg:static lg:translate-x-0">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6 dark:border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white font-extrabold text-sm dark:bg-white dark:text-neutral-950 shadow-sm border border-neutral-700/20">
            F
          </div>
          <span className="text-sm font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            FlowBoard<span className="text-gray-400 dark:text-neutral-600 font-normal">.io</span>
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="hidden rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-neutral-500 dark:hover:bg-neutral-900 lg:block"
          title="Minimize Sidebar"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-600 mb-2">
            Workspace
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </div>
                {item.badge !== null && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                    isActive 
                      ? 'bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100' 
                      : 'bg-gray-100 text-gray-600 dark:bg-neutral-900 dark:text-neutral-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Boards Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-600 mb-2">
            <span>Project Boards</span>
            <button
              onClick={() => setShowAddBoard(!showAddBoard)}
              className="text-gray-400 hover:text-gray-700 dark:text-neutral-500 dark:hover:text-neutral-200"
              title="Add New Board"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {showAddBoard && (
            <form onSubmit={handleCreateBoard} className="mb-3 rounded-xl border border-gray-100 bg-gray-50/50 p-2.5 dark:border-neutral-800 dark:bg-neutral-900/50 space-y-2">
              <input
                type="text"
                placeholder="Board title..."
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs font-medium focus:outline-none focus:border-neutral-900 dark:border-neutral-850 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:border-neutral-600"
              />
              <input
                type="text"
                placeholder="Optional description..."
                value={newBoardDesc}
                onChange={(e) => setNewBoardDesc(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs font-normal focus:outline-none focus:border-neutral-900 dark:border-neutral-850 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:border-neutral-600"
              />
              <div className="flex justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowAddBoard(false)}
                  className="rounded px-2.5 py-1 text-[10px] font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-850"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-neutral-900 px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200"
                >
                  Create
                </button>
              </div>
            </form>
          )}

          <div className="space-y-0.5">
            {boards.map((board) => {
              const isActive = activeBoardId === board.id;
              return (
                <button
                  key={board.id}
                  onClick={() => setActiveBoardId(board.id)}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-all text-left ${
                    isActive
                      ? 'bg-neutral-100 text-neutral-900 font-bold dark:bg-neutral-900 dark:text-white'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900/50 dark:hover:text-neutral-200'
                  }`}
                  title={board.description}
                >
                  <Hash className={`h-3.5 w-3.5 ${isActive ? 'text-neutral-900 dark:text-neutral-200' : 'text-gray-400'}`} />
                  <span className="truncate">{board.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sidebar Footer Stats display */}
      <div className="border-t border-gray-200 p-4 dark:border-neutral-800">
        <div className="rounded-xl bg-orange-50/50 p-3.5 dark:bg-amber-950/10 border border-orange-100/30 dark:border-amber-950/20">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-orange-100 dark:bg-amber-950 text-orange-600 dark:text-amber-400 text-[10px] font-bold">
              <Sparkles className="h-3 w-3" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400">
              Flow Score
            </span>
          </div>
          <p className="mt-2 text-xs font-normal text-gray-500 dark:text-neutral-400 leading-relaxed">
            Your current productivity index is thriving. Keep checking off subtasks!
          </p>
        </div>
      </div>
    </aside>
  );
};
