/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useFlowStore } from '../store/flowStore';
import { TaskPriority, TaskStatus } from '../types';
import { 
  X, 
  Trash2, 
  CheckSquare, 
  Paperclip, 
  MessageSquare, 
  Calendar,
  Clock,
  User,
  AlertCircle,
  Plus,
  Send,
  MoreVertical,
  CheckCircle,
  Copy,
  FolderMinus,
  Check
} from 'lucide-react';

interface TaskDetailDrawerProps {
  taskId: string | null;
  onClose: () => void;
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({ taskId, onClose }) => {
  const {
    tasks,
    user,
    updateTask,
    deleteTask,
    duplicateTask,
    archiveTask,
    addChecklistItem,
    toggleChecklistItem,
    deleteChecklistItem,
    addComment,
    addAttachment,
    deleteAttachment
  } = useFlowStore();

  const task = tasks.find(t => t.id === taskId);
  
  const [descInput, setDescInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [newChecklistText, setNewChecklistText] = useState('');
  const [commentText, setCommentText] = useState('');
  
  // Custom mock attachments inputs
  const [showAttachForm, setShowAttachForm] = useState(false);
  const [mockFileName, setMockFileName] = useState('');
  const [mockFileType, setMockFileType] = useState('application/pdf');

  // Load task state variables on draft load
  useEffect(() => {
    if (task) {
      setTitleInput(task.title);
      setDescInput(task.description);
    }
  }, [task?.id]);

  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (taskId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [taskId]);

  if (!task) return null;

  // Handle title & description update
  const handleTitleBlur = () => {
    if (titleInput.trim() && titleInput !== task.title) {
      updateTask(task.id, { title: titleInput.trim() });
    }
  };

  const handleDescBlur = () => {
    if (descInput !== task.description) {
      updateTask(task.id, { description: descInput });
    }
  };

  // Add checklist milestone
  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    addChecklistItem(task.id, newChecklistText.trim());
    setNewChecklistText('');
  };

  // Send comment thread
  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(task.id, commentText.trim());
    setCommentText('');
  };

  // Mock Upload Attachment
  const handleAttachSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mockFileName.trim()) return;
    const size = `${(Math.random() * 5 + 1).toFixed(1)} MB`;
    addAttachment(task.id, mockFileName.trim(), mockFileType, size);
    setMockFileName('');
    setShowAttachForm(false);
  };

  // Checklist statistics
  const totalCheckItems = task.checklist.length;
  const doneCheckItems = task.checklist.filter(c => c.completed).length;
  const checklistPercentage = totalCheckItems > 0 ? Math.round((doneCheckItems / totalCheckItems) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-gray-950/20 backdrop-blur-xs">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />

      <div 
        ref={drawerRef}
        className="relative z-10 flex h-full w-full max-w-xl flex-col border-l border-gray-150 bg-white shadow-2xl dark:border-neutral-850 dark:bg-neutral-900 duration-300 animate-slide-in-right"
      >
        {/* Top Drawer Controls toolbar */}
        <div className="flex h-16 items-center justify-between border-b border-gray-250 px-6 dark:border-neutral-800">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-neutral-500 font-semibold uppercase tracking-wider">
            <span>FlowBoard Task Vault</span>
            <span>/</span>
            <span className="font-mono">{task.id}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Actions Panel */}
            <button
              onClick={() => {
                duplicateTask(task.id);
                onClose();
              }}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-850"
              title="Duplicate Task copy"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                archiveTask(task.id);
                onClose();
              }}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-850"
              title="Archive Task data"
            >
              <FolderMinus className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                deleteTask(task.id);
                onClose();
              }}
              className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              title="Permanently Delete Task"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <span className="h-5 w-px bg-gray-200 dark:bg-neutral-800 mx-1" />
            <button 
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-650 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content columns split */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Main Title input (Autosaving) */}
          <div>
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleTitleBlur}
              className="w-full border-0 bg-transparent p-0 text-xl font-black text-gray-900 focus:outline-none focus:ring-0 dark:text-neutral-100"
              placeholder="Task title..."
            />
          </div>

          {/* Metadata Parameters section */}
          <div className="grid grid-cols-2 gap-4 rounded-xl bg-gray-50/50 p-4 dark:bg-neutral-950/30 border border-gray-100/40 dark:border-neutral-850">
            {/* Status Grid */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-neutral-500 flex items-center gap-1">
                Col Status
              </span>
              <select
                value={task.status}
                onChange={(e) => updateTask(task.id, { status: e.target.value as TaskStatus })}
                className="w-full rounded-lg border border-gray-200 bg-white py-1 pl-2 pr-4 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
              >
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">In Review</option>
                <option value="done">Completed</option>
              </select>
            </div>

            {/* Priority Section */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-neutral-500 flex items-center gap-1">
                Priority
              </span>
              <select
                value={task.priority}
                onChange={(e) => updateTask(task.id, { priority: e.target.value as TaskPriority })}
                className="w-full rounded-lg border border-gray-200 bg-white py-1 pl-2 pr-4 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="critical">Critical priority</option>
              </select>
            </div>

            {/* Due Date block */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-neutral-500 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Due Date
              </span>
              <input
                type="date"
                value={task.dueDate}
                onChange={(e) => updateTask(task.id, { dueDate: e.target.value })}
                className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
              />
            </div>

            {/* Estimated Hours block */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-neutral-500 flex items-center gap-1">
                <Clock className="h-3 w-3" /> Estimate
              </span>
              <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg dark:border-neutral-800 dark:bg-neutral-900 px-2">
                <input
                  type="number"
                  value={task.estimatedHours}
                  min={1}
                  max={120}
                  onChange={(e) => updateTask(task.id, { estimatedHours: Number(e.target.value) || 1 })}
                  className="w-full border-0 bg-transparent py-1 text-xs font-bold text-gray-700 focus:outline-none focus:ring-0 dark:text-neutral-300"
                />
                <span className="text-[10px] font-bold text-gray-400 dark:text-neutral-500">hrs</span>
              </div>
            </div>

            {/* Assignee Selection */}
            <div className="space-y-1 col-span-2">
              <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-neutral-500 flex items-center gap-1">
                <User className="h-3 w-3" /> Assignee
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={task.assignee}
                  onChange={(e) => updateTask(task.id, { assignee: e.target.value })}
                  placeholder="Type Full Name"
                  className="w-1/2 rounded-lg border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
                />
                <input
                  type="email"
                  value={task.assigneeEmail}
                  onChange={(e) => updateTask(task.id, { assigneeEmail: e.target.value })}
                  placeholder="assignee.dev@gmail.com"
                  className="w-1/2 rounded-lg border border-gray-200 bg-white px-3 py-1 text-xs font-normal text-gray-500 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"
                />
              </div>
            </div>
          </div>

          {/* Description Markdown editor (Autosaving) */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500">
              Description Revisions
            </h3>
            <textarea
              value={descInput}
              onChange={(e) => setDescInput(e.target.value)}
              onBlur={handleDescBlur}
              rows={4}
              placeholder="Provide a granular definition or checklist logs for user executions..."
              className="w-full rounded-xl border border-gray-250 bg-white px-3.5 py-2.5 text-xs font-medium text-gray-700 placeholder-gray-400 focus:outline-none focus:border-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:placeholder-neutral-600 transition-colors"
            />
          </div>

          {/* CHECKLIST MANAGERS SECTION */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500">
                Checklist checkpoints
              </h3>
              <p className="text-[10px] font-bold text-gray-500 font-mono">
                {doneCheckItems}/{totalCheckItems} ({checklistPercentage}%)
              </p>
            </div>

            {/* Checklist Mini bar */}
            {totalCheckItems > 0 && (
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-neutral-800">
                <div 
                  className="h-full bg-neutral-900 dark:bg-amber-400 transition-all duration-300"
                  style={{ width: `${checklistPercentage}%` }}
                />
              </div>
            )}

            {/* Checklist Items list */}
            <div className="space-y-1">
              {task.checklist.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 text-xs hover:bg-gray-50 dark:border-neutral-800 dark:hover:bg-neutral-950/20"
                >
                  <label className="flex items-center gap-2.5 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => toggleChecklistItem(task.id, item.id)}
                      className="h-4 w-4 rounded border-gray-300 text-neutral-900 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-800"
                    />
                    <span className={`font-semibold ${item.completed ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-neutral-300'}`}>
                      {item.title}
                    </span>
                  </label>
                  <button
                    onClick={() => deleteChecklistItem(task.id, item.id)}
                    className="text-gray-400 hover:text-rose-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Checklist Forms */}
            <form onSubmit={handleAddChecklist} className="flex gap-2">
              <input
                type="text"
                placeholder="Add sub-task milestone..."
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-900 focus:outline-none focus:border-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
              />
              <button
                type="submit"
                className="rounded-lg bg-neutral-900 px-3.5 text-xs font-bold text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200"
              >
                Add
              </button>
            </form>
          </div>

          {/* ATTACHMENT SECTION (Simulation) */}
          <div className="space-y-3.5 border-t border-gray-100 pt-5 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500">
                Attachments
              </h3>
              <button
                onClick={() => setShowAttachForm(!showAttachForm)}
                className="flex items-center gap-1 text-[11px] font-bold text-neutral-900 hover:underline dark:text-neutral-300"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Attach documents</span>
              </button>
            </div>

            {showAttachForm && (
              <form onSubmit={handleAttachSubmit} className="rounded-xl border border-gray-150 bg-gray-50/50 p-3 dark:border-neutral-850 dark:bg-neutral-900/50 space-y-2">
                <input
                  type="text"
                  placeholder="Document filename (e.g. system_logs.pdf)"
                  value={mockFileName}
                  onChange={(e) => setMockFileName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-900 focus:outline-none focus:border-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50"
                />
                <div className="flex gap-2">
                  <select
                    value={mockFileType}
                    onChange={(e) => setMockFileType(e.target.value)}
                    className="w-1/2 rounded-lg border border-gray-200 bg-white py-1.5 pl-2 pr-4 text-xs font-semibold text-gray-705 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
                  >
                    <option value="application/pdf">PDF File</option>
                    <option value="image/png">PNG Screenshot</option>
                    <option value="text/plain">Text Output</option>
                  </select>
                  <div className="flex w-1/2 justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowAttachForm(false)}
                      className="rounded-lg px-2 text-xs text-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-neutral-900 px-3 text-xs font-bold text-white dark:bg-neutral-100 dark:text-neutral-950"
                    >
                      Attach
                    </button>
                  </div>
                </div>
              </form>
            )}

            <div className="grid grid-cols-2 gap-2">
              {task.attachments.length > 0 ? (
                task.attachments.map(file => (
                  <div
                    key={file.id}
                    className="flex items-center gap-2 rounded-xl border border-gray-150 p-2 text-xs hover:bg-gray-50 dark:border-neutral-800 dark:hover:bg-neutral-950/20"
                  >
                    <Paperclip className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    <div className="flex-1 truncate">
                      <p className="truncate font-bold text-gray-800 dark:text-neutral-300">{file.name}</p>
                      <p className="text-[10px] text-gray-400 dark:text-neutral-500 leading-normal">{file.size}</p>
                    </div>
                    <button
                      onClick={() => deleteAttachment(task.id, file.id)}
                      className="text-gray-400 hover:text-rose-500"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="col-span-2 text-[10px] text-gray-400 leading-relaxed dark:text-neutral-500">No attachments linked with the task card.</p>
              )}
            </div>
          </div>

          {/* COMMENTS LOG THREAD */}
          <div className="space-y-4 border-t border-gray-100 pt-5 dark:border-neutral-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500">
              Activity & Comments
            </h3>

            {/* Comments input form */}
            <form onSubmit={handleSendComment} className="flex gap-2">
              <input
                type="text"
                placeholder="Leave review comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-900 focus:outline-none focus:border-neutral-900 dark:border-neutral-850 dark:bg-neutral-950 dark:text-neutral-100"
              />
              <button
                type="submit"
                className="rounded-lg bg-neutral-900 px-3 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>

            {/* Comment Log Items */}
            <div className="space-y-3">
              {task.comments.length > 0 ? (
                task.comments.slice().reverse().map(comment => (
                  <div key={comment.id} className="rounded-xl bg-gray-50/50 p-3 text-xs dark:bg-neutral-950/20 border border-gray-50 dark:border-neutral-900">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-gray-800 dark:text-neutral-300">{comment.author}</div>
                        <span className="text-[10px] text-gray-400">({comment.authorEmail})</span>
                      </div>
                      <span className="text-[9px] text-gray-400 font-mono">
                        {new Date(comment.createdAt).toLocaleDateString()} {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[11px] text-gray-600 dark:text-neutral-400 leading-relaxed font-normal">
                      {comment.text}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-gray-400 leading-relaxed dark:text-neutral-500">No review conversations logged yet.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
