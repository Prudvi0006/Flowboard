/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FlowStoreProvider, useFlowStore } from './store/flowStore';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { CommandPalette } from './components/CommandPalette';
import { NotificationCenter } from './components/NotificationCenter';
import { TaskDetailDrawer } from './components/TaskDetailDrawer';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { KanbanPage } from './pages/KanbanPage';
import { CalendarPage } from './pages/CalendarPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';

function FlowBoardApp() {
  const { 
    user, 
    activeTab, 
    activeTaskDetailId, 
    setActiveTaskDetailId,
    sidebarOpen,
    setSidebarOpen 
  } = useFlowStore();

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // If the user has no session, render the Auth Page first
  if (!user) {
    return <AuthPage />;
  }

  // Determine container spacing based on density controls
  const density = user.density || 'standard';
  const densityContainerClass = 
    density === 'compact' ? 'px-2 py-3 max-w-7xl' :
    density === 'spacious' ? 'px-6 py-10 max-w-7xl' :
    'px-4 py-6 md:px-8 max-w-7xl';

  return (
    <div className={`flex h-screen w-full overflow-hidden bg-gray-50/20 text-gray-900 transition-colors dark:bg-neutral-950 dark:text-neutral-100 ${
      density === 'compact' ? 'text-xs' : density === 'spacious' ? 'text-sm' : 'text-xs md:text-sm'
    }`}>
      
      {/* 1. Collapsible Sidebar */}
      <Sidebar />

      {/* Mobile Drawer Backdrop when Sidebar is open */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-gray-950/20 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* 2. Main Area Frame */}
      <div className="flex flex-1 flex-col overflow-hidden">
        
        {/* Top Navbar Header */}
        <Navbar 
          onOpenNotifications={() => setNotificationOpen(true)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        />

        {/* Scrollable Workspace Viewports */}
        <main className={`flex-1 overflow-y-auto w-full mx-auto transition-all ${densityContainerClass}`}>
          {activeTab === 'dashboard' && <DashboardPage />}
          {activeTab === 'kanban' && <KanbanPage />}
          {activeTab === 'calendar' && <CalendarPage />}
          {activeTab === 'analytics' && <AnalyticsPage />}
          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* 3. Task details drawer overlay (slides out from the right) */}
      {activeTaskDetailId !== null && (
        <TaskDetailDrawer 
          taskId={activeTaskDetailId}
          onClose={() => setActiveTaskDetailId(null)}
        />
      )}

      {/* 4. Notification Inbox drawer */}
      <NotificationCenter 
        isOpen={notificationOpen}
        onClose={() => setNotificationOpen(false)}
      />

      {/* 5. Command Palette search overlay (Ctrl + K) */}
      <CommandPalette 
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <FlowStoreProvider>
      <FlowBoardApp />
    </FlowStoreProvider>
  );
}
