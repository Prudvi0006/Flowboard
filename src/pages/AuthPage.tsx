/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFlowStore } from '../store/flowStore';
import { KeyRound, Mail, User, Eye, EyeOff, LayoutPanelLeft, Sparkles, CheckSquare, Zap, Target } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, register } = useFlowStore();
  const [view, setView] = useState<'login' | 'register' | 'forgot_password'>('login');
  
  // Form elements state
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorFeedback, setErrorFeedback] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorFeedback('');

    if (!email.trim() || !email.includes('@')) {
      setErrorFeedback('Please enter a valid developer email account.');
      return;
    }

    if (view === 'login') {
      login(email.trim(), name || 'Guest Developer', rememberMe);
    } else if (view === 'register') {
      if (!name.trim()) {
        setErrorFeedback('Full Name is required.');
        return;
      }
      register(email.trim(), name.trim());
    } else {
      // Forgot Password simulation
      setForgotSuccess(true);
    }
  };

  const handleGoogleOAuth = () => {
    // Simulate instantaneous Google OAuth sign-in with default account
    login('developer@flowboard.io', 'Guest Developer', true);
  };

  return (
    <div className="flex min-h-screen w-full items-stretch bg-gray-50/20 text-gray-900 transition-all dark:bg-neutral-950 dark:text-neutral-105">
      
      {/* LEFT DESIGN SIDEBAR BANNER OR LOGO */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-neutral-900 p-12 text-white dark:bg-neutral-950 dark:border-r dark:border-neutral-900 lg:flex">
        {/* Soft geometric accent lines */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-neutral-800 via-neutral-950 to-black opacity-90 z-0" />
        
        {/* Header Branding */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-neutral-950 font-black text-xl shadow-md border border-gray-150">
            F
          </div>
          <span className="text-lg font-black tracking-tight">FlowBoard</span>
        </div>

        {/* Feature Pitch Cards */}
        <div className="relative z-10 space-y-8 my-auto">
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
            Workload balancing & visual velocity metrics.
          </h1>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-lg bg-emerald-950 text-emerald-400">
                <CheckSquare className="h-3 w-3" />
              </span>
              <div>
                <p className="text-sm font-bold text-neutral-105">Smart Bottleneck detection</p>
                <p className="text-xs text-neutral-400 mt-1">FlowBoard analyzes active columns and raises workflow warnings when column sizes exceed safety capacities.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-lg bg-orange-950 text-orange-450">
                <Target className="h-3 w-3" />
              </span>
              <div>
                <p className="text-sm font-bold text-neutral-105">Interactive Gantt & Calendar indexer</p>
                <p className="text-xs text-neutral-400 mt-1">Drag task blocks directly inside monthly calendar columns to update estimates and keep milestones aligned.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-lg bg-indigo-950/70 text-indigo-400">
                <Zap className="h-3 w-3" />
              </span>
              <div>
                <p className="text-sm font-bold text-neutral-105">Focus scorecard analysis</p>
                <p className="text-xs text-neutral-400 mt-1">Earn scores dynamically by completing subtasks on time, keeping lists tidy, and resolving high-risk overdue alerts.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footnotes */}
        <div className="relative z-10 text-[11px] text-neutral-500 font-mono">
          © 2026 FlowBoard Workspace. Backed by sandboxed in-memory database persistence.
        </div>
      </div>

      {/* RIGHT AUTH GATEWAY CONTAINER */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:w-1/2">
        <div className="w-full max-w-sm space-y-6">
          
          {/* Header titles */}
          <div className="text-center">
            {/* Mobile Brand indicator */}
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-white font-extrabold text-lg lg:hidden shadow-sm dark:bg-white dark:text-neutral-950 mb-4">
              F
            </div>
            
            <h2 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-neutral-50">
              {view === 'login' && 'Sign in to workspace'}
              {view === 'register' && 'Create developer account'}
              {view === 'forgot_password' && 'Recover account access'}
            </h2>
            <p className="mt-1.5 text-xs text-gray-500 dark:text-neutral-400">
              {view === 'login' && 'Enter your developer credentials or credentials mock'}
              {view === 'register' && 'Get instant access to workload analytics and visual boards'}
              {view === 'forgot_password' && 'Introduce credentials registration email'}
            </p>
          </div>

          {/* Errors display */}
          {errorFeedback && (
            <div className="rounded-xl bg-rose-50/50 p-3 text-xs font-medium text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30">
              {errorFeedback}
            </div>
          )}

          {/* Success messages for Forgot */}
          {forgotSuccess && view === 'forgot_password' && (
            <div className="rounded-xl bg-emerald-50/50 p-3 pr-4 text-xs font-medium text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
              Email sent! A sandbox password reset URL was dispatched to your email address.
            </div>
          )}

          {/* MAIN ACTIONS FORM */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Full Name (Only for Register) */}
            {view === 'register' && (
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-neutral-500">
                  Full Name
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Guest Developer"
                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-xs text-gray-900 placeholder:text-gray-400 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50 dark:placeholder-neutral-600 dark:focus:border-neutral-700"
                  />
                </div>
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-neutral-500">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@flowboard.io"
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-xs text-gray-900 placeholder:text-gray-400 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50 dark:placeholder-neutral-600 dark:focus:border-neutral-700"
                />
              </div>
            </div>

            {/* Password (for Login and Register) */}
            {view !== 'forgot_password' && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-neutral-500">
                    Security Password
                  </span>
                  {view === 'login' && (
                    <button
                      type="button"
                      onClick={() => setView('forgot_password')}
                      className="text-[10px] font-bold text-neutral-900 hover:underline dark:text-neutral-400"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <KeyRound className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter key secrets"
                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-xs text-gray-900 placeholder:text-gray-400 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50 dark:placeholder-neutral-600 dark:focus:border-neutral-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-450 hover:text-gray-700 dark:text-neutral-500 dark:hover:text-neutral-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Remember Me selection */}
            {view === 'login' && (
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-neutral-900 focus:ring-neutral-900 dark:border-neutral-805 dark:bg-neutral-900"
                />
                <label htmlFor="remember-me" className="ml-2 text-xs font-medium text-gray-650 dark:text-neutral-400">
                  Keep me connected permanently (remember me)
                </label>
              </div>
            )}

            {/* Submissions Action */}
            <button
              type="submit"
              className="w-full rounded-xl bg-neutral-900 py-3 text-xs font-bold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 shadow-sm transition-all cursor-pointer"
            >
              {view === 'login' && 'Unlock Workspace'}
              {view === 'register' && 'Begin Sprint Planning'}
              {view === 'forgot_password' && 'Transmit recovery URL'}
            </button>
          </form>

          {/* Google OAuth simulation block */}
          {view !== 'forgot_password' && (
            <div className="space-y-4">
              <div className="relative flex items-center justify-center">
                <span className="absolute w-full border-t border-gray-200 dark:border-neutral-800" />
                <span className="relative bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:bg-neutral-950 dark:text-neutral-600">
                  Social Integration
                </span>
              </div>

              {/* Login with Google trigger */}
              <button
                type="button"
                onClick={handleGoogleOAuth}
                className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-gray-200 bg-white py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-350 dark:hover:bg-neutral-850 dark:hover:text-white transition-all cursor-pointer"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114a5.89 5.89 0 0 1-5.914-5.89 5.89 5.89 0 0 1 5.914-5.89c1.614 0 3.064.624 4.153 1.636l3.155-3.157C19.22 3.197 16.035 2 12.24 2 6.586 2 2 6.513 2 12s4.586 10 10.24 10c7.893 0 10.603-7.514 9.61-11.714H12.24z"
                  />
                </svg>
                <span>Authorize with Google Single Sign-In</span>
              </button>
            </div>
          )}

          {/* Subview redirection triggers */}
          <div className="text-center">
            {view === 'login' && (
              <p className="text-xs text-gray-500 dark:text-neutral-400">
                New user access request?{' '}
                <button
                  onClick={() => setView('register')}
                  className="font-bold text-neutral-900 hover:underline dark:text-neutral-350"
                >
                  Register new account
                </button>
              </p>
            )}
            {view === 'register' && (
              <p className="text-xs text-gray-500 dark:text-neutral-400">
                Already registered with us?{' '}
                <button
                  onClick={() => setView('login')}
                  className="font-bold text-neutral-900 hover:underline dark:text-neutral-350"
                >
                  Sign in instead
                </button>
              </p>
            )}
            {view === 'forgot_password' && (
              <button
                onClick={() => setView('login')}
                className="text-xs font-bold text-neutral-900 hover:underline dark:text-neutral-350"
              >
                Return to standard login panel
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
