/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from 'react';
import { useFlowStore } from '../store/flowStore';
import { X, Check, Bell, RefreshCw, Trash2, Calendar, User, ArrowRight } from 'lucide-react';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearAllNotifications,
    setActiveTaskDetailId,
    setActiveTab
  } = useFlowStore();

  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNotificationClick = (taskId?: string, notifId?: string) => {
    if (notifId) {
      markNotificationRead(notifId);
    }
    if (taskId) {
      setActiveTaskDetailId(taskId);
      setActiveTab('kanban');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-gray-900/35 backdrop-blur-xs">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />

      <div 
        ref={drawerRef}
        className="relative z-10 flex h-full w-full max-w-sm flex-col border-l border-gray-150 bg-white shadow-2xl dark:border-neutral-850 dark:bg-neutral-900 duration-300 animate-slide-in-right"
      >
        {/* Header Block */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Bell className="h-4.5 w-4.5 text-gray-500 dark:text-neutral-400" />
            <span className="text-sm font-bold text-gray-900 dark:text-neutral-100">
              Notification Inbox
            </span>
          </div>
          <button 
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Toolbar of Drawer */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-2 dark:border-neutral-800 dark:bg-neutral-950/20">
          <span className="text-[10px] font-medium text-gray-400">
            {notifications.filter(n => !n.read).length} unread updates
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={markAllNotificationsRead}
              disabled={notifications.length === 0}
              className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white disabled:opacity-40"
            >
              <Check className="h-3 w-3" />
              <span>Mark all read</span>
            </button>
            <span className="h-3.5 w-px bg-gray-200 dark:bg-neutral-800" />
            <button
              onClick={clearAllNotifications}
              disabled={notifications.length === 0}
              className="flex items-center gap-1.5 text-[10px] font-semibold text-rose-500 hover:text-rose-600 disabled:opacity-40"
            >
              <Trash2 className="h-3 w-3" />
              <span>Clear inbox</span>
            </button>
          </div>
        </div>

        {/* Notification feed container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length > 0 ? (
            notifications.map((n) => {
              const iconMap = {
                assigned: User,
                due_soon: Calendar,
                mention: Bell,
                status_change: ArrowRight
              };
              const NotificationIcon = iconMap[n.type] || Bell;

              return (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n.taskId, n.id)}
                  className={`group relative flex items-start gap-3 rounded-xl border border-gray-100 p-3.5 transition-all cursor-pointer ${
                    n.read 
                      ? 'bg-white opacity-70 hover:opacity-100 border-gray-100 dark:bg-neutral-900 dark:border-neutral-850' 
                      : 'bg-neutral-50/70 border-neutral-200/50 hover:bg-neutral-50 dark:bg-neutral-850/40 dark:border-neutral-800'
                  }`}
                >
                  {/* Status Indicator circle for unread updates */}
                  {!n.read && (
                    <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-neutral-950 dark:bg-amber-500 animate-pulse" />
                  )}

                  {/* Icon Block */}
                  <div className={`mt-0.5 rounded-lg p-2 ${
                    n.type === 'due_soon' 
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-450' 
                      : n.type === 'assigned'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-450'
                        : 'bg-gray-100 text-gray-650 dark:bg-neutral-800 dark:text-neutral-350'
                  }`}>
                    <NotificationIcon className="h-4 w-4" />
                  </div>

                  {/* Message Frame */}
                  <div className="flex-1 pr-4">
                    <p className={`text-xs font-bold leading-normal ${
                      n.read ? 'text-gray-700 dark:text-neutral-300' : 'text-gray-900 dark:text-neutral-100'
                    }`}>
                      {n.title}
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-gray-500 dark:text-neutral-400">
                      {n.description}
                    </p>
                    <span className="mt-2 block text-[9px] text-gray-400 font-mono">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Immediate clean checkout indicator */}
                  {!n.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markNotificationRead(n.id);
                      }}
                      className="absolute right-3 bottom-3 hidden rounded bg-white px-1.5 py-0.5 text-[9px] font-bold text-gray-400 shadow-xs border border-gray-100 hover:text-gray-700 dark:border-neutral-800 dark:bg-neutral-950 group-hover:block"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <div className="rounded-full bg-gray-50 p-4 dark:bg-neutral-950">
                <Bell className="h-8 w-8 text-gray-300 dark:text-neutral-700" />
              </div>
              <p className="mt-3 text-xs font-bold text-gray-700 dark:text-neutral-350">All caught up!</p>
              <p className="mt-1.5 text-[10px] text-gray-400 dark:text-neutral-500">No unread notification alerts pending.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
