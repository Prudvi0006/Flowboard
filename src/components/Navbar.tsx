/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFlowStore } from '../store/flowStore';
import { Search, Bell, Sun, Moon, LogOut, CheckSquare, Zap, Activity, AlertTriangle, Sparkles, X, ChevronDown, Settings } from 'lucide-react';
import { Avatar } from './Avatar';

interface NavbarProps {
  onOpenNotifications: () => void;
  onOpenCommandPalette: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNotifications, onOpenCommandPalette }) => {
  const {
    user,
    logout,
    theme,
    toggleTheme,
    notifications,
    searchQuery,
    setSearchQuery,
    focusScore,
    workloadWarning,
    workflowBottleneck,
    setSidebarOpen,
    sidebarOpen,
    setActiveTab
  } = useFlowStore();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white/75 px-4 backdrop-blur-md transition-colors dark:border-neutral-800 dark:bg-neutral-900/75 sm:px-6">
      {/* Search Input Trigger & Breadcrumb */}
      <div className="flex flex-1 items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 lg:hidden"
          title="Toggle Sidebar"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Search Input supporting Command Palette CTA */}
        <div className="relative w-full max-w-md hidden md:block">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400 dark:text-neutral-500" />
          </div>
          <input
            type="text"
            placeholder="Search tasks, tags, boards... (Ctrl + K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClick={onOpenCommandPalette}
            className="w-full rounded-full border border-gray-200 bg-gray-50 py-1.5 pl-10 pr-4 text-xs font-normal text-gray-900 placeholder:text-gray-400 focus:border-neutral-900 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-600 dark:focus:border-neutral-700 dark:focus:bg-neutral-900 transition-all cursor-pointer"
          />
          <kbd className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[10px] text-gray-400 dark:text-neutral-600">
            <span className="font-sans">Ctrl K</span>
          </kbd>
        </div>

        {/* Mobile Search button */}
        <button
          onClick={onOpenCommandPalette}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-800 md:hidden"
          title="Search"
        >
          <Search className="h-5 w-5" />
        </button>
      </div>

      {/* Right Side Header Items */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Workload / Focus metrics indicator pills */}
        <div className="hidden items-center gap-3 lg:flex">
          {/* Smart Focus Score Gauge */}
          <div 
            className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 cursor-pointer"
            title="SaaS Focus Rating. Recalculated from completion timelines and checkpoint checklists."
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
            <span>Focus: </span>
            <span className="font-mono font-bold">{focusScore}</span>
          </div>

          {/* Active Workload Alert pill */}
          {workloadWarning?.isOverloaded && (
            <div 
              className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 animate-pulse cursor-pointer"
              title={workloadWarning.message}
            >
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              <span>Overloaded</span>
            </div>
          )}

          {/* Workflow bottleneck indicator */}
          {workflowBottleneck && (
            <div 
              className="flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 cursor-pointer"
              title={workflowBottleneck.message}
            >
              <Activity className="h-3.5 w-3.5 text-indigo-500 animate-spin" style={{ animationDuration: '4s' }} />
              <span>Bottleneck</span>
            </div>
          )}
        </div>

        {/* Global theme switcher */}
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 transition-colors"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </button>

        {/* Notifications trigger */}
        <button
          onClick={onOpenNotifications}
          className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 transition-colors"
          title="Notification Center"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900 text-[9px] font-bold text-white dark:bg-amber-500 dark:text-neutral-950">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Divider item */}
        <span className="h-6 w-px bg-gray-200 dark:bg-neutral-800" />

        {/* User Session Profile details */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 rounded-full p-1 text-left focus:outline-none hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Avatar name={user.name} avatar={user.avatar} size="sm" />
              <span className="hidden text-xs font-semibold text-gray-700 dark:text-neutral-300 sm:block">
                {user.name.split(' ')[0]}
              </span>
              <ChevronDown className="h-3 w-3 text-gray-500 dark:text-neutral-400 hidden sm:block" />
            </button>

            {showUserDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-50 cursor-default" 
                  onClick={() => setShowUserDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-200 bg-white p-1 shadow-lg z-50 dark:border-neutral-800 dark:bg-neutral-900">
                  <div className="px-3 py-2 border-b border-gray-100 dark:border-neutral-800">
                    <p className="text-xs font-bold text-gray-900 dark:text-neutral-100 truncate">{user.name}</p>
                    <p className="text-[10px] text-gray-400 dark:text-neutral-500 truncate mt-0.5">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      setActiveTab('settings');
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-gray-750 hover:bg-gray-100 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Workspace Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={() => {}} // fallback click
            className="rounded-full bg-neutral-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-all"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};
