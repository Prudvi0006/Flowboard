/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useFlowStore } from '../store/flowStore';
import { 
  Search, 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  Trello, 
  TrendingUp, 
  Sun, 
  Moon, 
  Plus, 
  X,
  FileText,
  User,
  Hash
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const {
    activeTab,
    setActiveTab,
    theme,
    toggleTheme,
    tasks,
    boards,
    setActiveBoardId,
    setActiveTaskDetailId
  } = useFlowStore();

  const [search, setSearch] = useState('');
  const overlayRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Key event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter tasks based on query
  const filteredTasks = search.trim() === '' 
    ? tasks.slice(0, 3) 
    : tasks.filter(t => 
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())) ||
        t.assignee.toLowerCase().includes(search.toLowerCase())
      );

  // Filter boards
  const filteredBoards = search.trim() === ''
    ? boards.slice(0, 2)
    : boards.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

  const handleNavigate = (tab: 'dashboard' | 'kanban' | 'calendar' | 'analytics') => {
    setActiveTab(tab);
    onClose();
  };

  const handleSelectTask = (taskId: string) => {
    setActiveTaskDetailId(taskId);
    setActiveTab('kanban'); // Navigate to board automatically
    onClose();
  };

  const handleSelectBoard = (boardId: string) => {
    setActiveBoardId(boardId);
    setActiveTab('kanban');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center bg-gray-900/50 p-4 pt-[10vh] backdrop-blur-sm dark:bg-black/65"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      ref={overlayRef}
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl dark:border-neutral-850 dark:bg-neutral-900 transition-all">
        {/* Search Header */}
        <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3.5 dark:border-neutral-800">
          <Search className="h-5 w-5 text-gray-400 dark:text-neutral-500" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none dark:text-neutral-100 dark:placeholder-neutral-600"
          />
          <button 
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Command Body */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-4">
          
          {/* Navigation Commands */}
          {search.trim() === '' && (
            <div>
              <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-600">
                Navigation
              </p>
              <div className="space-y-0.5">
                <button
                  onClick={() => handleNavigate('dashboard')}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:text-neutral-300 dark:hover:bg-neutral-800 text-left"
                >
                  <LayoutDashboard className="h-4 w-4 text-gray-400" />
                  <span>Go to Dashboard</span>
                </button>
                <button
                  onClick={() => handleNavigate('kanban')}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:text-neutral-300 dark:hover:bg-neutral-800 text-left"
                >
                  <Trello className="h-4 w-4 text-gray-400" />
                  <span>Go to Kanban Board</span>
                </button>
                <button
                  onClick={() => handleNavigate('calendar')}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:text-neutral-300 dark:hover:bg-neutral-800 text-left"
                >
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                  <span>Go to Calendar Schema</span>
                </button>
                <button
                  onClick={() => handleNavigate('analytics')}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:text-neutral-300 dark:hover:bg-neutral-800 text-left"
                >
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                  <span>Go to Performance Analytics</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {search.trim() === '' && (
            <div>
              <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-600">
                Quick Preferences
              </p>
              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    toggleTheme();
                    onClose();
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:text-neutral-300 dark:hover:bg-neutral-800 text-left"
                >
                  {theme === 'light' ? (
                    <>
                      <Moon className="h-4 w-4 text-gray-400" />
                      <span>Switch to Obsidian Dark Editor</span>
                    </>
                  ) : (
                    <>
                      <Sun className="h-4 w-4 text-gray-400" />
                      <span>Switch to Slate Cream Light Editor</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setActiveTab('kanban');
                    onClose();
                    // State triggers task creation window
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:text-neutral-300 dark:hover:bg-neutral-800 text-left"
                >
                  <Plus className="h-4 w-4 text-gray-400" />
                  <span>Create a New Task Draft</span>
                </button>
              </div>
            </div>
          )}

          {/* Search Result Tasks */}
          <div>
            <div className="flex items-center justify-between px-3 py-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-600">
                {search.trim() === '' ? 'Recent Active Tasks' : 'Search Tasks Results'}
              </span>
              <span className="text-[9px] font-medium text-gray-400">{filteredTasks.length} found</span>
            </div>
            
            <div className="space-y-0.5 animate-fade-in">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTask(t.id)}
                    className="flex w-full items-start gap-3 rounded-lg px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 dark:text-neutral-300 dark:hover:bg-neutral-800 text-left"
                  >
                    <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                    <div className="flex-1 truncate">
                      <p className="font-semibold text-gray-900 truncate dark:text-neutral-100">{t.title}</p>
                      <p className="text-[10px] text-gray-400 dark:text-neutral-500 truncate mt-0.5">
                        {t.status.toUpperCase()} • Priority: {t.priority} • Assigned: {t.assignee}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <p className="px-3 py-2 text-[11px] text-gray-400 dark:text-neutral-600">No active tasks found matching keywords.</p>
              )}
            </div>
          </div>

          {/* Boards matches */}
          <div>
            <div className="flex items-center justify-between px-3 py-1.5 border-t border-gray-100/30 pt-3 dark:border-neutral-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-600">
                {search.trim() === '' ? 'Featured Boards' : 'Search Boards Results'}
              </span>
            </div>
            <div className="space-y-0.5">
              {filteredBoards.map(board => (
                <button
                  key={board.id}
                  onClick={() => handleSelectBoard(board.id)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 dark:text-neutral-300 dark:hover:bg-neutral-800 text-left"
                >
                  <Hash className="h-4 w-4 text-gray-400" />
                  <div className="flex-1 truncate">
                    <p className="font-semibold text-gray-900 dark:text-neutral-100 truncate">{board.name}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Command Footer hints */}
        <div className="flex items-center justify-between border-t border-gray-150 bg-gray-50/50 px-4 py-2 text-[10px] text-gray-400 dark:border-neutral-800 dark:bg-neutral-950/40">
          <span>Use <kbd className="rounded border border-gray-200 bg-white px-1 dark:border-neutral-800 dark:bg-neutral-900 text-gray-500">ESC</kbd> to exit draft</span>
          <span className="flex items-center gap-1">Press ⏎ to open detail drawer</span>
        </div>
      </div>
    </div>
  );
};
