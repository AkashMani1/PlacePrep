'use client';

/* Developed by Akash Mani - PlacePrep Mobile Top Bar */

import { motion } from 'framer-motion';
import { Target, Flame } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { calcStreak } from '@/lib/utils';

interface MobileTopBarProps {
  onSettingsOpen: () => void;
}

export default function MobileTopBar({ onSettingsOpen }: MobileTopBarProps) {
  const { state } = useApp();
  const { user } = useAuth();

  const streak = calcStreak(state.dailyLogs);
  const avatarUrl = user?.user_metadata?.avatar_url;
  const avatarInitial = (user?.user_metadata?.full_name || state.userName || 'S').charAt(0).toUpperCase();

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      className="safe-top md:hidden sticky top-0 z-[50] w-full"
    >
      {/* Frosted glass bar */}
      <div
        className="relative flex min-h-[72px] items-center justify-between gap-3 px-4 pb-3 pt-3"
        style={{
          background: 'linear-gradient(180deg, hsl(var(--background) / 0.92) 0%, hsl(var(--background) / 0.72) 100%)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 1px 0 rgba(255,255,255,0.06), 0 14px 40px rgba(0,0,0,0.24)',
        }}
      >
        {/* Subtle ambient glow line at top */}
        <div className="absolute top-0 left-[15%] w-[70%] h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent pointer-events-none" />

        {/* Left — Logo */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[16px] border border-white/10 bg-white/[0.04] shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
            <div className="absolute inset-0 rounded-[14px] bg-primary/5 blur-lg" />
            <Target className="w-[18px] h-[18px] text-primary relative z-10" />
          </div>
          <div className="min-w-0">
            <div className="flex min-w-0 items-baseline gap-0.5 overflow-hidden">
              <span className="truncate text-[17px] font-black leading-none tracking-tight text-foreground">PLACE</span>
              <span className="truncate text-[17px] font-black leading-none tracking-tight text-primary">PREP</span>
            </div>
            <p className="truncate pt-1 text-[11px] font-medium tracking-tight text-muted-foreground">
              Premium placement prep OS
            </p>
          </div>
        </div>

        {/* Center / Right group */}
        <div className="flex shrink-0 items-center gap-2.5">
          {/* Streak Pill */}
          {streak > 0 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 20 }}
              className="hidden min-[360px]:flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/12 px-3 py-1.5 shadow-[0_8px_24px_rgba(245,158,11,0.12)]"
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-amber-400 font-black text-[12px] tabular-nums leading-none">
                {streak}
              </span>
            </motion.div>
          )}

          {/* Avatar → Settings */}
          <button
            onClick={onSettingsOpen}
            className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] active:scale-95 transition-transform touch-manipulation shadow-[0_8px_20px_rgba(0,0,0,0.18)]"
            style={{ minWidth: 36, minHeight: 36 }}
            aria-label="Open settings"
          >
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-gradient-to-tr from-primary via-primary/80 to-secondary text-[13px] font-black text-white shadow-[0_8px_24px_rgba(76,79,229,0.28)]">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span>{avatarInitial}</span>
              )}
            </div>
          </button>
        </div>
      </div>
    </motion.header>
  );
}
