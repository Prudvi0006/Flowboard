/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFlowStore } from '../store/flowStore';
import { Board, UserSessionSession } from '../types';
import { AvatarUploadZone } from '../components/AvatarUploadZone';
import { 
  User, 
  Lock, 
  Laptop, 
  Palette, 
  FolderKanban, 
  TrendingUp, 
  Check, 
  CheckCircle2, 
  ShieldAlert, 
  Trash2, 
  Plus, 
  X, 
  Copy, 
  Smartphone, 
  Globe, 
  ArrowUpRight, 
  Hourglass, 
  Target,
  Zap,
  Sliders,
  Sparkles,
  RefreshCw,
  Mail,
  Fingerprint
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    user,
    updateUser,
    theme,
    toggleTheme,
    boards,
    activeBoardId,
    setActiveBoardId,
    createBoard,
    tasks,
    focusScore
  } = useFlowStore();

  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'security' | 'appearance' | 'boards' | 'productivity'>('profile');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Profile Form States
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarInput, setAvatarInput] = useState(user?.avatar || '');

  React.useEffect(() => {
    setAvatarInput(user?.avatar || '');
  }, [user?.avatar]);

  // Pre-loaded stunning minimal/monochrome avatar preset options
  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', // Original
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150', // Monochrome warm portrait
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', // Monochrome clean tech
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', // Clean corporate
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150', // Clean creative
  ];

  // Security Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorInput, setTwoFactorInput] = useState(user?.twoFactorEnabled || false);

  // Board Form states
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editBoardName, setEditBoardName] = useState('');
  const [editBoardDesc, setEditBoardDesc] = useState('');
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDesc, setNewBoardDesc] = useState('');

  // Density and theme customization options
  const densityOptions = [
    { id: 'compact', name: 'Compact', desc: 'Dense padding & compact text' },
    { id: 'standard', name: 'Standard', desc: 'Balanced padding and layouts' },
    { id: 'spacious', name: 'Spacious', desc: 'Generous whitespace and comfort' }
  ] as const;

  const grayscaleOptions = [
    { id: 'zinc', name: 'Zinc Slate', accent: '#18181b', bg: 'bg-zinc-900 border-zinc-950' },
    { id: 'slate', name: 'Metal Slate', accent: '#0f172a', bg: 'bg-slate-900 border-slate-950' },
    { id: 'stone', name: 'Stone Grey', accent: '#1c1917', bg: 'bg-stone-900 border-stone-950' },
    { id: 'neutral', name: 'Nordic Charcoal', accent: '#171717', bg: 'bg-neutral-900 border-neutral-950' }
  ] as const;

  // Trigger Notifications inside local screen
  const triggerSuccess = (text: string) => {
    setSuccessMessage(text);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  // Profile Save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name,
      email,
      username: username.trim().toLowerCase(),
      bio,
      avatar: avatarInput
    });
    triggerSuccess('Profile information saved in cloud local vaults successfully.');
  };

  const handleSelectAvatarPreset = (url: string) => {
    setAvatarInput(url);
    updateUser({ avatar: url });
    triggerSuccess('Avatar updated instantly.');
  };

  // Password reset submit
  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Please fill out all simulated passwords fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    // Simulate API calls
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    triggerSuccess('Account login credentials rotated. Your password is secure.');
  };

  // Toggle 2FA
  const handleToggle2FA = (val: boolean) => {
    setTwoFactorInput(val);
    updateUser({ twoFactorEnabled: val });
    triggerSuccess(`Two-factor authorization (2FA) ${val ? 'enabled' : 'disabled'} for ${user?.email}.`);
  };

  // Session Revocation
  const handleRevokeSession = (sessId: string) => {
    if (user?.sessions) {
      const remaining = user.sessions.filter(s => s.id !== sessId);
      updateUser({ sessions: remaining });
      triggerSuccess('Linked device session has been invalidated & revoked.');
    }
  };

  // Board updates
  const handleStartEditBoard = (board: Board) => {
    setEditingBoardId(board.id);
    setEditBoardName(board.name);
    setEditBoardDesc(board.description);
  };

  const handleCreateBoardInSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;
    createBoard(newBoardName.trim(), newBoardDesc.trim());
    setNewBoardName('');
    setNewBoardDesc('');
    triggerSuccess(`Successfully provisioned board.`);
  };

  // Productivity metrics calculations
  const totalCompleted = tasks.filter(t => t.status === 'done').length;
  const totalTasks = tasks.length;
  const completionAcc = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 100;
  const totalEstHours = tasks.reduce((acc, curr) => acc + (curr.estimatedHours || 0), 0);
  const doneEstHours = tasks.filter(t => t.status === 'done').reduce((acc, curr) => acc + (curr.estimatedHours || 0), 0);

  const streakDays = 14; 
  const tasksSprints = tasks.filter(t => t.tags.includes('Sprint-1')).length;

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION WITH MODERN MONOCHROME SAAS STYLING */}
      <div>
        <h1 className="text-xl font-black tracking-tight text-neutral-900 dark:text-neutral-100 md:text-2xl">
          Workspace Settings
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
          Configure profile schemas, layout preferences, and remote session authentications.
        </p>
      </div>

      {/* FLOATING MICRO TOAST CARD */}
      {successMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-neutral-900/10 bg-white p-3.5 shadow-xl dark:border-neutral-800 dark:bg-neutral-900 animate-fade-in max-w-sm">
          <CheckCircle2 className="h-4.5 w-4.5 text-neutral-950 dark:text-neutral-50" />
          <p className="text-[11px] font-semibold text-neutral-950 dark:text-neutral-100">{successMessage}</p>
        </div>
      )}

      {/* SETTINGS PANELS LAYOUT CONTAINER: GRID LATERAL RAIL */}
      <div className="flex flex-col gap-6 md:flex-row items-start">
        
        {/* SIDE BAR BUTTON NAVIGATION BAR */}
        <div className="w-full md:w-56 shrink-0 space-y-1.5 rounded-2xl border border-neutral-100 bg-white p-2.5 dark:border-neutral-900 dark:bg-neutral-950">
          <p className="px-3 text-[10px] font-black uppercase tracking-wider text-neutral-400 dark:text-neutral-600 py-1.5">
            Settings Index
          </p>

          <button
            onClick={() => setActiveSubTab('profile')}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold select-none transition-all ${
              activeSubTab === 'profile'
                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 shadow-sm'
                : 'text-neutral-500 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-900'
            }`}
          >
            <User className="h-4 w-4 shrink-0" />
            <span>General Profile</span>
          </button>

          <button
            onClick={() => setActiveSubTab('appearance')}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold select-none transition-all ${
              activeSubTab === 'appearance'
                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 shadow-sm'
                : 'text-neutral-500 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-900'
            }`}
          >
            <Palette className="h-4 w-4 shrink-0" />
            <span>Appearance & Density</span>
          </button>

          <button
            onClick={() => setActiveSubTab('security')}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold select-none transition-all ${
              activeSubTab === 'security'
                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 shadow-sm'
                : 'text-neutral-500 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-900'
            }`}
          >
            <Lock className="h-4 w-4 shrink-0" />
            <span>Security & Sessions</span>
          </button>

          <button
            onClick={() => setActiveSubTab('boards')}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold select-none transition-all ${
              activeSubTab === 'boards'
                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 shadow-sm'
                : 'text-neutral-500 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-900'
            }`}
          >
            <FolderKanban className="h-4 w-4 shrink-0" />
            <span>Project Boards</span>
          </button>

          <button
            onClick={() => setActiveSubTab('productivity')}
            className={`flex h-8 w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold select-none transition-all ${
              activeSubTab === 'productivity'
                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 shadow-sm'
                : 'text-neutral-500 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-900'
            }`}
          >
            <TrendingUp className="h-4 w-4 shrink-0" />
            <span>Productivity Audit</span>
          </button>
        </div>

        {/* ACTIVE SETTINGS VIEWPORT CARD COMPONENT */}
        <div className="flex-1 w-full rounded-2xl border border-neutral-100 bg-white p-6 shadow-2xs dark:border-neutral-900 dark:bg-neutral-950">
          
          {/* --- TAB 1: USER PROFILE & GENERAL INFO --- */}
          {activeSubTab === 'profile' && (
            <div className="space-y-6">
              
              {/* Profile subheader */}
              <div className="border-b border-neutral-100 pb-4 dark:border-neutral-850">
                <h2 className="text-sm font-black text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                  General Profile Configuration
                </h2>
                <p className="text-[10px] text-neutral-400 font-bold mt-0.5 uppercase tracking-wider">
                  Your identity specifications in this workspace environment
                </p>
              </div>

              {/* Avatar Preset Grid selection and fine-tune cropping uploader */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-wider">
                  Workspace Avatar Profile Icon
                </label>
                <AvatarUploadZone />
              </div>

              {/* Basic Fields Form */}
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* FULL NAME */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-wider">
                      Collaborator full name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-neutral-250 bg-neutral-50/50 px-3 py-2 text-xs font-semibold focus:border-neutral-900 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                    />
                  </div>

                  {/* ACCOUNT USERNAME */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-wider">
                      Handle username
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs font-bold text-neutral-400 font-mono">@</span>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full rounded-xl border border-neutral-250 bg-neutral-50/50 pl-7 pr-3 py-2 text-xs font-semibold focus:border-neutral-900 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 focus:ring-0"
                      />
                    </div>
                  </div>
                </div>

                {/* ACCOUNT EMAIL */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-wider">
                    Contact Email schema
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-3.5 w-3.5 text-neutral-400" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-neutral-250 bg-neutral-50/50 pl-9 pr-3 py-2 text-xs font-semibold focus:border-neutral-900 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                    />
                  </div>
                </div>

                {/* SHORT ACCOUNT BIO */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-wider">
                    Collaborator Bio description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Briefly detail your roles..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full rounded-xl border border-neutral-250 bg-neutral-50/50 px-3 py-2 text-xs font-medium focus:border-neutral-900 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                  />
                </div>

                {/* Submits */}
                <div className="pt-4 border-t border-neutral-100 dark:border-neutral-850 flex justify-end">
                  <button
                    type="submit"
                    className="rounded-xl bg-neutral-900 px-5 py-2 text-xs font-black text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200 transition-all cursor-pointer shadow-xs"
                  >
                    Save Profile specs
                  </button>
                </div>
              </form>

            </div>
          )}

          {/* --- TAB 2: APPEARANCE & THEME & GENERAL LAYOUTS --- */}
          {activeSubTab === 'appearance' && (
            <div className="space-y-6">
              
              {/* Apperance subheader */}
              <div className="border-b border-neutral-100 pb-4 dark:border-neutral-850">
                <h2 className="text-sm font-black text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                  Appearance & Workspace Density
                </h2>
                <p className="text-[10px] text-neutral-400 font-bold mt-0.5 uppercase tracking-wider">
                  Scale visual interfaces, layout ratios, and themes
                </p>
              </div>

              {/* Active theme switcher */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-wider">
                  Active color mode scheme
                </label>
                
                <div className="grid grid-cols-2 gap-3 max-w-sm">
                  <button
                    onClick={() => theme === 'dark' && toggleTheme()}
                    className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all select-none ${
                      theme === 'light'
                        ? 'border-neutral-900 bg-neutral-50 dark:border-neutral-100'
                        : 'border-neutral-150 bg-white hover:bg-neutral-50 dark:border-neutral-850 dark:bg-neutral-950 dark:hover:bg-neutral-900'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-extrabold text-neutral-900 dark:text-neutral-150">Light Mode</p>
                      <p className="text-[9px] text-neutral-450 mt-0.5 font-semibold">Elegant professional white paper canvas</p>
                    </div>
                    {theme === 'light' && <Check className="h-4 w-4 text-neutral-950 shrink-0" />}
                  </button>

                  <button
                    onClick={() => theme === 'light' && toggleTheme()}
                    className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all select-none ${
                      theme === 'dark'
                        ? 'border-white bg-neutral-900 dark:border-neutral-700 dark:bg-neutral-900'
                        : 'border-neutral-150 bg-white hover:bg-neutral-50 dark:border-neutral-850 dark:bg-neutral-950 dark:hover:bg-neutral-900'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-extrabold text-neutral-900 dark:text-neutral-100">Dark Mode</p>
                      <p className="text-[9px] text-neutral-450 mt-0.5 font-semibold">Eye-safe obsidian midnight layout</p>
                    </div>
                    {theme === 'dark' && <Check className="h-4 w-4 text-white shrink-0" />}
                  </button>
                </div>
              </div>

              {/* Monochromatic Grayscale Presets Option */}
              <div className="space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-850">
                <label className="text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-wider">
                  Grayscale Accent theme customizer
                </label>
                <p className="text-[10px] text-neutral-400 leading-relaxed font-semibold">
                  Select a monochromatic slate grey preset to refine borders and focal checkpoints throughout your workspace menus.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {grayscaleOptions.map((opt) => {
                    const isSelected = (user?.grayAccent || 'zinc') === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          updateUser({ grayAccent: opt.id });
                          triggerSuccess(`Switched grayscale accent profile to ${opt.name}.`);
                        }}
                        className={`flex flex-col justify-between rounded-xl border p-3 text-left transition-all select-none ${
                          isSelected
                            ? 'border-neutral-900 bg-neutral-50/50 dark:border-white'
                            : 'border-neutral-200 hover:bg-neutral-50 dark:border-neutral-850 dark:hover:bg-neutral-900'
                        }`}
                      >
                        <span className="text-xs font-black text-neutral-900 dark:text-neutral-100">{opt.name}</span>
                        <div className="mt-3.5 flex items-center justify-between">
                          <span className={`h-4.5 w-4.5 rounded-full border ${opt.bg}`} />
                          {isSelected && <span className="text-[9px] font-extrabold font-mono text-neutral-900 dark:text-white">Active</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Density options selection */}
              <div className="space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-850">
                <label className="text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-wider">
                  Whitespace Density Controls
                </label>
                <p className="text-[10px] text-neutral-400 leading-relaxed font-semibold">
                  Fine-tune margin thresholds. Standard is optimized for screens, Compact displays more data cards inline.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {densityOptions.map((opt) => {
                    const isSelected = (user?.density || 'standard') === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          updateUser({ density: opt.id });
                          triggerSuccess(`Layout margins globally configured as ${opt.name}.`);
                        }}
                        className={`flex flex-col p-3 rounded-xl border text-left transition-all select-none ${
                          isSelected
                            ? 'border-neutral-900 bg-neutral-50/70 dark:border-white'
                            : 'border-neutral-200 hover:bg-neutral-50 dark:border-neutral-850 dark:hover:bg-neutral-900'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-black text-neutral-900 dark:text-neutral-100">{opt.name}</span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-neutral-950 dark:text-neutral-50" />}
                        </div>
                        <span className="text-[9px] text-neutral-450 mt-1 font-semibold leading-normal">{opt.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* --- TAB 3: ACCOUNT SECURITY & ACTIVE REMOTE DEVICES AUDIT --- */}
          {activeSubTab === 'security' && (
            <div className="space-y-6">
              
              {/* Security header info */}
              <div className="border-b border-neutral-100 pb-4 dark:border-neutral-850">
                <h2 className="text-sm font-black text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                  Security credentials & Active Sessions
                </h2>
                <p className="text-[10px] text-neutral-400 font-bold mt-0.5 uppercase tracking-wider">
                  Revoke unrecognized remote logins or change simulated passwords securely
                </p>
              </div>

              {/* Two-factor authentication toggle component */}
              <div className="rounded-xl border border-neutral-200/60 bg-neutral-50/40 p-4 dark:border-neutral-900 dark:bg-neutral-950/20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1 max-w-md">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-neutral-900 px-1.5 py-0.5 text-[9px] font-black uppercase text-white dark:bg-neutral-800">
                      <Fingerprint className="h-3 w-3" /> Recommended
                    </span>
                    <h3 className="text-xs font-black text-neutral-900 dark:text-neutral-150 mt-1 uppercase tracking-wider">
                      Two-factor validation authentication (2FA)
                    </h3>
                    <p className="text-[10px] text-neutral-450 leading-relaxed font-semibold">
                      Require an authentication seed token in addition to your email address key coordinates when validating claims.
                    </p>
                  </div>
                  
                  {/* Switch */}
                  <button
                    type="button"
                    onClick={() => handleToggle2FA(!twoFactorInput)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                      twoFactorInput ? 'bg-neutral-950 dark:bg-white' : 'bg-neutral-200 dark:bg-neutral-800'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white dark:bg-neutral-950 shadow-sm ring-0 transition duration-200 ease-in-out mt-0.5 ${
                        twoFactorInput ? 'translate-x-4.5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Simulated Change Password form */}
              <form onSubmit={handleSaveSecurity} className="space-y-3">
                <label className="text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-wider">
                  Rotate password keys
                </label>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <input
                    type="password"
                    placeholder="Current credential..."
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="rounded-xl border border-neutral-250 bg-neutral-50/50 px-3 py-1.5 text-xs font-semibold focus:border-neutral-900 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-900"
                  />
                  <input
                    type="password"
                    placeholder="New password key..."
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="rounded-xl border border-neutral-250 bg-neutral-50/50 px-3 py-1.5 text-xs font-semibold focus:border-neutral-900 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-900"
                  />
                  <input
                    type="password"
                    placeholder="Verify new credentials..."
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="rounded-xl border border-neutral-250 bg-neutral-50/50 px-3 py-1.5 text-xs font-semibold focus:border-neutral-900 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-900"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="rounded-xl border border-neutral-900 px-4 py-1.5 text-xs font-black text-neutral-950 hover:bg-neutral-50 dark:border-neutral-350 dark:text-neutral-100 dark:hover:bg-neutral-900 transition-all select-none cursor-pointer"
                  >
                    Rotate Password
                  </button>
                </div>
              </form>

              {/* Active Device Session Management List component */}
              <div className="space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-850">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-wider">
                    Linked session terminals
                  </label>
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[9px] font-mono font-bold dark:bg-neutral-900 dark:text-neutral-450">
                    {user?.sessions?.length || 0} Connected Devices
                  </span>
                </div>
                <p className="text-[10px] text-neutral-400 leading-relaxed font-semibold">
                  The following remote terminals currently hold persistent workspace access tokens to log comments or reorder cards. Revoke unrecognized instances instantly.
                </p>

                <div className="divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-200/70 dark:divide-neutral-900 dark:border-neutral-900/50">
                  {user?.sessions?.map((sess) => (
                    <div 
                      key={sess.id} 
                      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 bg-white dark:bg-neutral-955 transition-all text-xs font-medium text-neutral-800 dark:text-neutral-250 ${
                        sess.current ? 'bg-neutral-50/40 dark:bg-neutral-900/10' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="rounded-lg bg-neutral-100 p-2 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400">
                          {sess.device.includes('iPhone') ? <Smartphone className="h-4.5 w-4.5" /> : <Laptop className="h-4.5 w-4.5" />}
                        </span>
                        
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-extrabold text-[#111] dark:text-neutral-100 text-xs">{sess.device}</h4>
                            {sess.current && (
                              <span className="rounded bg-emerald-50 px-1 py-0.2 text-[8px] font-black uppercase text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 font-mono">
                                This Unit
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[10px] text-neutral-450 font-bold font-mono">
                            <span className="flex items-center gap-0.5"><Globe className="h-3 w-3" /> {sess.ip}</span>
                            <span>•</span>
                            <span>{sess.location}</span>
                            <span>•</span>
                            <span className="text-neutral-400 font-semibold">{sess.lastActive}</span>
                          </div>
                        </div>
                      </div>

                      {/* revoke action */}
                      {!sess.current && (
                        <button
                          onClick={() => handleRevokeSession(sess.id)}
                          className="self-end sm:self-center text-[10px] font-black text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded px-2.5 py-1 text-center border border-rose-100/10 transition-colors"
                          title="Invalidate login key"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  ))}
                  {(!user?.sessions || user.sessions.length === 0) && (
                    <div className="p-6 text-center text-neutral-405">
                      <p className="text-xs font-bold">No sessions listed</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* --- TAB 4: WORKSPACE & PROJECT BOARDS PREFERENCES --- */}
          {activeSubTab === 'boards' && (
            <div className="space-y-6">
              
              {/* Boards subheader */}
              <div className="border-b border-neutral-100 pb-4 dark:border-neutral-850">
                <h2 className="text-sm font-black text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                  Project Board Configurations
                </h2>
                <p className="text-[10px] text-neutral-400 font-bold mt-0.5 uppercase tracking-wider">
                  Update active board descriptions or destroy unused collections
                </p>
              </div>

              {/* Preconfigured selector for active Default Board index */}
              <div className="space-y-2 pt-1">
                <label className="text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-wider">
                  Primary default project board
                </label>
                <div className="relative max-w-sm">
                  <select
                    value={activeBoardId}
                    onChange={(e) => {
                      setActiveBoardId(e.target.value);
                      triggerSuccess('Active focus board swapped directory settings.');
                    }}
                    className="w-full rounded-xl border border-neutral-250 bg-neutral-50/50 py-1.5 pl-3 pr-8 text-xs font-black dark:border-neutral-800 dark:bg-neutral-900"
                  >
                    {boards.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Detailed custom listing of current boards with inline edit or deletion operations */}
              <div className="space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-850">
                <label className="text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-wider">
                  Manage Workspace collections
                </label>

                <div className="space-y-2.5">
                  {boards.map((board) => {
                    const isEditing = editingBoardId === board.id;
                    return (
                      <div
                        key={board.id}
                        className="rounded-xl border border-neutral-200/60 bg-neutral-50/5 p-3.5 dark:border-neutral-900 dark:bg-neutral-950/20"
                      >
                        {isEditing ? (
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={editBoardName}
                              onChange={(e) => setEditBoardName(e.target.value)}
                              className="w-full rounded-lg border border-neutral-250 bg-white px-2 py-1 text-xs font-extrabold focus:outline-none focus:border-neutral-950 dark:border-neutral-800 dark:bg-neutral-900"
                            />
                            <textarea
                              rows={2}
                              value={editBoardDesc}
                              onChange={(e) => setEditBoardDesc(e.target.value)}
                              className="w-full rounded-lg border border-neutral-250 bg-white px-2 py-1 text-xs font-normal focus:outline-none focus:border-neutral-950 dark:border-neutral-800 dark:bg-neutral-900"
                            />
                            <div className="flex justify-end gap-1.5 pt-1">
                              <button
                                onClick={() => setEditingBoardId(null)}
                                className="rounded px-2.5 py-1 text-[10px] font-bold text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => {
                                  // Update board via local storage directly or trigger simulation.
                                  // In store, setBoards stores it in localStorage which we can trigger!
                                  board.name = editBoardName.trim();
                                  board.description = editBoardDesc.trim();
                                  setEditingBoardId(null);
                                  triggerSuccess('Board metadata updated.');
                                }}
                                className="rounded bg-neutral-950 px-3 py-1 text-[10px] font-black text-white dark:bg-neutral-100 dark:text-neutral-950"
                              >
                                Commit
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-4 text-xs font-semibold">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-extrabold text-[#111] dark:text-neutral-100">{board.name}</h4>
                                {activeBoardId === board.id && (
                                  <span className="rounded bg-neutral-900 px-1 py-0.2 text-[8px] font-black text-white dark:bg-white dark:text-neutral-950 uppercase shrink-0 font-mono">
                                    Active Target
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 text-[10.5px] font-mono text-neutral-400 font-normal leading-relaxed">{board.description || 'No description provisioned.'}</p>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => handleStartEditBoard(board)}
                                className="text-[10px] font-black border border-neutral-200 rounded px-2 py-0.5 hover:bg-neutral-100 dark:border-neutral-850 dark:hover:bg-neutral-900 transition-colors"
                              >
                                Edit Specs
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Create Board Inline within Settings */}
              <form onSubmit={handleCreateBoardInSettings} className="space-y-3 pt-3 border-t border-neutral-105 dark:border-neutral-850">
                <label className="text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-wider">
                  Provision new custom project board
                </label>
                
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    placeholder="New Board Title..."
                    required
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    className="rounded-xl border border-neutral-250 bg-neutral-50/50 px-3 py-1.5 text-xs font-semibold focus:border-neutral-900 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-900"
                  />
                  <input
                    type="text"
                    placeholder="Brief description overview..."
                    value={newBoardDesc}
                    onChange={(e) => setNewBoardDesc(e.target.value)}
                    className="rounded-xl border border-neutral-250 bg-neutral-50/50 px-3 py-1.5 text-xs font-normal focus:border-neutral-900 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-900"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="rounded-xl bg-neutral-900 px-4 py-1.5 text-xs font-black text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200 transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create board</span>
                  </button>
                </div>
              </form>

            </div>
          )}

          {/* --- TAB 5: PRODUCTIVITY AUDIT & VELOCITY LOGS --- */}
          {activeSubTab === 'productivity' && (
            <div className="space-y-6">
              
              {/* Productivity header info */}
              <div className="border-b border-neutral-100 pb-4 dark:border-neutral-850">
                <h2 className="text-sm font-black text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                  Workspace Productivity Audit
                </h2>
                <p className="text-[10px] text-neutral-400 font-bold mt-0.5 uppercase tracking-wider">
                  Analyze check-off velocities and custom milestone accuracy scores
                </p>
              </div>

              {/* Bento Grid Metrics summaries */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* METRIC 1: FLOW SCORE */}
                <div className="rounded-xl border border-neutral-150 p-4 dark:border-neutral-850 bg-neutral-50/20 text-center space-y-1">
                  <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Productivity Index</span>
                  <div className="pt-1.5 flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-black tracking-tighter text-[#111] dark:text-neutral-100">{focusScore}</span>
                    <span className="text-[10px] font-mono font-bold text-neutral-400">/ 100</span>
                  </div>
                  <p className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 font-mono uppercase tracking-wide">Excellent Flow</p>
                </div>

                {/* METRIC 2: ACCURACY */}
                <div className="rounded-xl border border-neutral-150 p-4 dark:border-neutral-850 bg-neutral-50/20 text-center space-y-1">
                  <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Target completions</span>
                  <div className="pt-1.5 flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-black tracking-tighter text-[#111] dark:text-neutral-100">{completionAcc}%</span>
                  </div>
                  <p className="text-[9px] font-semibold text-neutral-400 font-mono uppercase tracking-wide">{totalCompleted} of {totalTasks} finished</p>
                </div>

                {/* METRIC 3: VELOCITY COUNT */}
                <div className="rounded-xl border border-neutral-150 p-4 dark:border-neutral-850 bg-neutral-50/20 text-center space-y-1">
                  <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Active Sprint Streak</span>
                  <div className="pt-1.5 flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-black tracking-tighter text-[#111] dark:text-neutral-100">{streakDays}</span>
                    <span className="text-[10px] font-mono font-bold text-neutral-400">days</span>
                  </div>
                  <p className="text-[9px] font-semibold text-rose-600 dark:text-rose-400 font-mono uppercase tracking-wide">🔥 High Streak Velocity</p>
                </div>

              </div>

              {/* Linear Milestone Hours track visualizer */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-wider">
                  <span>Sprint Estimate Track Quotient</span>
                  <span className="font-mono">{doneEstHours}h / {totalEstHours}h Logged ({totalEstHours > 0 ? Math.round(doneEstHours/totalEstHours*100) : 100}%)</span>
                </div>
                
                {/* Progress bar */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-850">
                  <div 
                    className="h-full bg-neutral-900 dark:bg-white rounded-full transition-all duration-500"
                    style={{ width: `${totalEstHours > 0 ? (doneEstHours / totalEstHours) * 100 : 100}%` }}
                  />
                </div>
              </div>

              {/* Monochromatic Week layout schedule grid */}
              <div className="space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-850">
                <label className="text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-500 tracking-wider">
                  Daily completion volume indices (Wk-26)
                </label>
                <p className="text-[10px] text-neutral-450 leading-normal font-semibold">
                  A geographic grid of active task checkoffs completed daily in the current sprint interval. Darker tiles indicate intense concentration days.
                </p>

                {/* Daily blocks */}
                <div className="grid grid-cols-7 gap-2 text-center">
                  {[
                    { day: 'Mon', count: 3, bg: 'bg-neutral-900 border-neutral-950 text-white' },
                    { day: 'Tue', count: 1, bg: 'bg-neutral-200 border-neutral-300 dark:bg-neutral-800 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200' },
                    { day: 'Wed', count: 4, bg: 'bg-neutral-950 border-neutral-950 text-white' },
                    { day: 'Thu', count: 0, bg: 'bg-neutral-50 border-neutral-100 dark:bg-neutral-905 dark:border-neutral-900 text-neutral-400' },
                    { day: 'Fri', count: 2, bg: 'bg-neutral-500 text-white' },
                    { day: 'Sat', count: 0, bg: 'bg-neutral-50 border-neutral-100 dark:bg-neutral-905 dark:border-neutral-900 text-neutral-400' },
                    { day: 'Sun', count: 1, bg: 'bg-neutral-200 border-neutral-300 dark:bg-neutral-800 dark:border-neutral-700 text-neutral-805 dark:text-neutral-200' }
                  ].map((d) => (
                    <div 
                      key={d.day} 
                      className={`rounded-xl border p-2.5 flex flex-col justify-between h-20 ${d.bg} shadow-3xs hover:scale-103 transition-transform select-none`}
                    >
                      <span className="text-[9px] uppercase font-black opacity-80 tracking-wide">{d.day}</span>
                      <div className="space-y-0.5">
                        <span className="block text-sm font-black tracking-tight">{d.count}</span>
                        <span className="block text-[8px] font-mono leading-none">items</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};
