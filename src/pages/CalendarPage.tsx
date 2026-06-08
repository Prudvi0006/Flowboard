/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFlowStore } from '../store/flowStore';
import { Task } from '../types';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  CheckCircle, 
  AlertCircle,
  HelpCircle,
  Hash
} from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const {
    tasks,
    updateTask,
    setActiveTaskDetailId,
    setActiveTab
  } = useFlowStore();

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  // Month date definitions
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // 1. Month Grid Generation
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 (Sunday) to 6 (Saturday)
  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const totalDaysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const daysGrid: Date[] = [];

  // Padding days from previous month
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    daysGrid.push(new Date(currentYear, currentMonth - 1, totalDaysInPrevMonth - i));
  }

  // Active days of current month
  for (let i = 1; i <= totalDaysInMonth; i++) {
    daysGrid.push(new Date(currentYear, currentMonth, i));
  }

  // Padding days for next month to complete 6-row standard calendar (42 cells)
  const remainingCells = 42 - daysGrid.length;
  for (let i = 1; i <= remainingCells; i++) {
    daysGrid.push(new Date(currentYear, currentMonth + 1, i));
  }

  // 2. Fetch tasks falling on precise dates (comparing year-month-day string format)
  const getTasksForDate = (date: Date) => {
    const dStr = date.toISOString().split('T')[0];
    return tasks.filter(t => t.dueDate === dStr);
  };

  const handlePrevRange = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    } else {
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() - 7);
      setCurrentDate(nextDate);
    }
  };

  const handleNextRange = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    } else {
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + 7);
      setCurrentDate(nextDate);
    }
  };

  // Switch view range or click to reschedule
  const handleDateClick = (date: Date) => {
    // Elegant redirect to create pre-configured task
    setActiveTab('kanban');
    // It would be great to pass date to creation prompt
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // 3. Week Grid Generation (Sunday to Saturday)
  const getWeekDays = (relativeDate: Date): Date[] => {
    const days: Date[] = [];
    const dayOfWeek = relativeDate.getDay();
    const sundayStr = new Date(relativeDate);
    sundayStr.setDate(relativeDate.getDate() - dayOfWeek);

    for (let i = 0; i < 7; i++) {
      const d = new Date(sundayStr);
      d.setDate(sundayStr.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDays = getWeekDays(currentDate);

  return (
    <div className="space-y-6">
      
      {/* CALENDAR PAGE HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-neutral-100 md:text-2xl">
            Interactive Calendar Schedule
          </h1>
          <p className="text-xs text-gray-500 dark:text-neutral-450 font-medium">
            Monitor deadlines, adjust milestone due dates, and schedule workload runs.
          </p>
        </div>

        {/* View Mode Selectors */}
        <div className="flex items-center rounded-xl bg-gray-100 p-1 dark:bg-neutral-900">
          <button
            onClick={() => setViewMode('month')}
            className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
              viewMode === 'month'
                ? 'bg-white text-neutral-950 dark:bg-neutral-805 dark:text-white'
                : 'text-gray-500 hover:text-gray-700 dark:text-neutral-400'
            }`}
          >
            Month View
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
              viewMode === 'week'
                ? 'bg-white text-neutral-950 dark:bg-neutral-805 dark:text-white'
                : 'text-gray-500 hover:text-gray-700 dark:text-neutral-400'
            }`}
          >
            Week View
          </button>
        </div>
      </div>

      {/* CALENDAR CONTROLLER BAR */}
      <div className="flex items-center justify-between rounded-2xl border border-gray-150 bg-white p-4 dark:border-neutral-850 dark:bg-neutral-905">
        <div className="flex items-center gap-3">
          <span className="rounded bg-neutral-950 p-2 text-white dark:bg-neutral-800">
            <CalendarIcon className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-black text-gray-900 dark:text-neutral-100 uppercase tracking-wide">
              {viewMode === 'month' ? `${monthNames[currentMonth]} ${currentYear}` : `Sprint Week of ${currentDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}`}
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
              Scheduling calendar indices
            </p>
          </div>
        </div>

        {/* Arrow navigators */}
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevRange}
            className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50 dark:border-neutral-800 dark:hover:bg-neutral-900 text-gray-600 dark:text-neutral-350"
            title="Backward range"
          >
            <ChevronLeft className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-bold hover:bg-gray-50 dark:border-neutral-800 dark:hover:bg-neutral-900 text-gray-600"
          >
            Today
          </button>
          <button
            onClick={handleNextRange}
            className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50 dark:border-neutral-800 dark:hover:bg-neutral-900 text-gray-600 dark:text-neutral-350"
            title="Forward range"
          >
            <ChevronRight className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* --- MONTH VIEW RENDER --- */}
      {viewMode === 'month' && (
        <div className="min-w-[650px] overflow-x-auto rounded-2xl border border-gray-150 bg-white shadow-3xs dark:border-neutral-850 dark:bg-neutral-900 p-1.5 space-y-1">
          {/* Calendar Weekday headers */}
          <div className="grid grid-cols-7 text-center border-b border-gray-100 pb-2 dark:border-neutral-800 pt-1.5">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <span key={day} className="text-[10px] font-black uppercase tracking-wider text-gray-450 dark:text-neutral-500">
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid cells */}
          <div className="grid grid-cols-7 grid-rows-6 gap-1.5 h-[500px]">
            {daysGrid.map((date, idx) => {
              const isCurrentMonthCell = date.getMonth() === currentMonth;
              const dateTasks = getTasksForDate(date);
              const isToday = date.toDateString() === new Date().toDateString();

              return (
                <div
                  key={idx}
                  onClick={() => handleDateClick(date)}
                  className={`group relative flex flex-col justify-between rounded-xl p-2 text-left border transition-all cursor-pointer ${
                    isCurrentMonthCell 
                      ? 'bg-white hover:bg-gray-50/50 dark:bg-neutral-900 border-gray-100 dark:border-neutral-850' 
                      : 'bg-gray-50/40 text-gray-350 border-gray-100 dark:bg-neutral-950/20 dark:border-neutral-900 opacity-40'
                  } ${isToday ? 'ring-2 ring-neutral-950 dark:ring-amber-500' : ''}`}
                >
                  {/* Date Number bubble */}
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-black font-mono ${
                      isToday 
                        ? 'text-neutral-950 dark:text-amber-400 font-extrabold' 
                        : 'text-gray-500 dark:text-neutral-400'
                    }`}>
                      {date.getDate()}
                    </span>
                    {dateTasks.length > 0 && (
                      <span className="h-1.5 w-1.5 rounded-full bg-neutral-950 dark:bg-amber-400" />
                    )}
                  </div>

                  {/* Task list inside this cell */}
                  <div className="mt-2.5 flex-1 space-y-1 overflow-y-auto max-h-[100px]">
                    {dateTasks.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTaskDetailId(t.id);
                        }}
                        className={`rounded border px-1.5 py-0.5 text-[9px] font-extrabold truncate uppercase ${
                          t.status === 'done' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900/30' 
                            : t.priority === 'critical'
                              ? 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-450 dark:border-rose-900/30'
                              : 'bg-neutral-50 border-neutral-100 dark:bg-neutral-800 dark:text-neutral-350 dark:border-neutral-850'
                        }`}
                        title={t.title}
                      >
                        {t.title}
                      </div>
                    ))}
                    {dateTasks.length > 2 && (
                      <div className="text-[9px] font-bold text-gray-400 pl-1">
                        + {dateTasks.length - 2} more...
                      </div>
                    )}
                  </div>

                  {/* Quick trigger to add task on specific day */}
                  <div className="absolute right-2 bottom-2 hidden group-hover:block transition-all">
                    <Plus className="h-3 w-3 text-gray-400 hover:text-gray-900" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- WEEK VIEW RENDER --- */}
      {viewMode === 'week' && (
        <div className="min-w-[650px] overflow-x-auto rounded-2xl border border-gray-150 bg-white p-4 dark:border-neutral-850 dark:bg-neutral-900 shadow-3xs">
          <div className="grid grid-cols-7 gap-3 h-[400px]">
            {weekDays.map((date, idx) => {
              const dateTasks = getTasksForDate(date);
              const isToday = date.toDateString() === new Date().toDateString();

              return (
                <div
                  key={idx}
                  onClick={() => handleDateClick(date)}
                  className={`flex flex-col justify-between rounded-2xl border border-gray-100 p-3.5 hover:bg-gray-50/50 cursor-pointer dark:border-neutral-800 dark:bg-neutral-900/50 ${
                    isToday ? 'ring-2 ring-neutral-900 dark:ring-amber-500 bg-neutral-50/20' : ''
                  }`}
                >
                  {/* Calendar week cell header */}
                  <div className="flex flex-col items-center border-b border-gray-100 pb-2 dark:border-neutral-800">
                    <span className="text-[10px] font-bold uppercase text-gray-400">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]}
                    </span>
                    <span className={`mt-1 text-sm font-black font-mono ${
                      isToday ? 'text-neutral-950 dark:text-amber-400 font-extrabold' : 'text-gray-850 dark:text-neutral-300'
                    }`}>
                      {date.getDate()}
                    </span>
                  </div>

                  {/* Tasks List for the Date Cell */}
                  <div className="mt-3 flex-1 overflow-y-auto space-y-2 max-h-[250px]">
                    {dateTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTaskDetailId(t.id);
                        }}
                        className="rounded-xl border border-gray-100 bg-white p-2.5 shadow-3xs hover:border-gray-300 dark:border-neutral-850 dark:bg-neutral-900 text-left transition-all"
                      >
                        <h4 className="text-[10px] font-extrabold text-gray-800 dark:text-neutral-200 line-clamp-2">
                          {t.title}
                        </h4>
                        
                        <div className="mt-2.5 flex items-center justify-between text-[8px] text-gray-400 font-bold uppercase">
                          <span>{t.priority}</span>
                          <span>{t.estimatedHours} hrs</span>
                        </div>
                      </div>
                    ))}
                    {dateTasks.length === 0 && (
                      <p className="text-center text-[9px] text-gray-400 pt-16">No milestones</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
