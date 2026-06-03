/* Developed by Akash Mani - PlacePrep Premium OS */
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Cloud, ShieldCheck, RefreshCw, Trophy, Lock, AlertTriangle } from 'lucide-react';

const GOOGLE_ICON = (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const BENEFITS = [
  {
    icon: <Cloud className="w-4 h-4 text-blue-400" />,
    title: 'Cloud Backup',
    desc: 'Your 90-day progress syncs automatically — never lose a solved problem.',
  },
  {
    icon: <RefreshCw className="w-4 h-4 text-emerald-400" />,
    title: 'Multi-Device Sync',
    desc: 'Switch between laptop and phone — everything stays in sync.',
  },
  {
    icon: <Trophy className="w-4 h-4 text-amber-400" />,
    title: 'Streak Protection',
    desc: 'Your daily streaks and habit logs are preserved across sessions.',
  },
  {
    icon: <ShieldCheck className="w-4 h-4 text-violet-400" />,
    title: 'Secure & Private',
    desc: 'Only your Google account has access to your personal data.',
  },
];

export default function LoginGateModal() {
  const {
    shouldShowLoginGate,
    signInWithGoogle,
    snoozeLoginGate,
    snoozeCount,
    maxSnoozeCount,
    daysSinceFirstVisit,
    gracePeriodDays,
  } = useAuth();

  const [signing, setSigning] = useState(false);
  const [snoozed, setLocalSnoozed] = useState(false);

  if (!shouldShowLoginGate || snoozed) return null;

  const progressPct = Math.min(100, Math.round((daysSinceFirstVisit / gracePeriodDays) * 100));

  const handleSignIn = async () => {
    setSigning(true);
    await signInWithGoogle();
    setSigning(false);
  };

  const handleSnooze = () => {
    const ok = snoozeLoginGate();
    if (ok) setLocalSnoozed(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        key="login-gate-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.18) 0%, rgba(8,8,8,0.97) 70%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* Animated ambient orbs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.4, 0.25] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)',
            }}
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(168,85,247,0.25) 0%, transparent 70%)',
            }}
          />
        </div>

        {/* Modal card */}
        <motion.div
          key="login-gate-card"
          initial={{ opacity: 0, y: 32, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md rounded-3xl overflow-hidden"
          style={{
            background:
              'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow:
              '0 0 0 1px rgba(99,102,241,0.2), 0 40px 80px rgba(0,0,0,0.7), 0 0 100px rgba(99,102,241,0.15)',
          }}
        >
          {/* Top gradient stripe */}
          <div
            aria-hidden="true"
            className="absolute top-0 inset-x-0 h-[2px]"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(99,102,241,0.8), rgba(168,85,247,0.8), transparent)',
            }}
          />

          <div className="px-8 pt-10 pb-8 flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col items-center gap-3 text-center">
              {/* Pulsing lock icon */}
              <motion.div
                animate={{ boxShadow: ['0 0 0 0 rgba(239,68,68,0)', '0 0 0 16px rgba(239,68,68,0)'] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-1"
              >
                <AlertTriangle className="w-7 h-7 text-red-400" />
              </motion.div>

              <h2 className="text-2xl font-black tracking-tight text-white leading-tight">
                Your progress isn't safe yet
              </h2>
              <p className="text-sm text-white/50 leading-relaxed max-w-xs">
                You've been using PlacePrep for{' '}
                <span className="text-white/80 font-semibold">
                  {daysSinceFirstVisit} {daysSinceFirstVisit === 1 ? 'day' : 'days'}
                </span>
                . All your data only exists on this device — one browser clear and it's gone.
              </p>
            </div>

            {/* Grace period used-up bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider">
                <span className="text-white/40">Free grace period</span>
                <span className="text-red-400">
                  {daysSinceFirstVisit} / {gracePeriodDays} days used
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                  className="h-full rounded-full"
                  style={{
                    background:
                      progressPct >= 100
                        ? 'linear-gradient(90deg, #ef4444, #f97316)'
                        : 'linear-gradient(90deg, #6366f1, #a855f7)',
                  }}
                />
              </div>
            </div>

            {/* Benefits list */}
            <div className="grid grid-cols-2 gap-2">
              {BENEFITS.map((b) => (
                <div
                  key={b.title}
                  className="rounded-xl p-3 flex flex-col gap-1.5"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="flex items-center gap-1.5">
                    {b.icon}
                    <span className="text-[11px] font-bold text-white/80 tracking-tight">{b.title}</span>
                  </div>
                  <p className="text-[10px] text-white/40 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>

            {/* CTA — Google Sign In */}
            <motion.button
              id="login-gate-google-btn"
              onClick={handleSignIn}
              disabled={signing}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-3 h-12 rounded-2xl font-bold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: signing
                  ? 'rgba(255,255,255,0.1)'
                  : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,240,255,0.95) 100%)',
                color: '#1a1a2e',
                boxShadow: signing ? 'none' : '0 4px 24px rgba(99,102,241,0.3)',
              }}
            >
              {signing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                >
                  <RefreshCw className="w-4 h-4 text-white/60" />
                </motion.div>
              ) : (
                GOOGLE_ICON
              )}
              <span>{signing ? 'Redirecting…' : 'Continue with Google — it\'s free'}</span>
            </motion.button>

            {/* Snooze link — shown while skips remain, hard-block message when exhausted */}
            {snoozeCount < maxSnoozeCount ? (
              <button
                id="login-gate-snooze-btn"
                onClick={handleSnooze}
                className="flex flex-col items-center gap-0.5 text-center cursor-pointer group"
              >
                <span className="text-[11px] text-white/40 group-hover:text-white/70 transition-colors font-medium underline underline-offset-2">
                  Remind me tomorrow
                </span>
                <span className="text-[10px] text-white/20 group-hover:text-white/40 transition-colors">
                  {maxSnoozeCount - snoozeCount} of {maxSnoozeCount} skip{maxSnoozeCount - snoozeCount !== 1 ? 's' : ''} remaining
                </span>
              </button>
            ) : (
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-white/25">
                <Lock className="w-3 h-3" />
                <span>No skips left — Google login is required to continue</span>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
