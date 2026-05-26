'use client';

/* Developed by Akash Mani - PlacePrep Mobile Top Bar */

import { motion } from 'framer-motion';
import { Target, Flame, Settings } from 'lucide-react';
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
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || state.userName || 'Engineer';
  const avatarUrl = user?.user_metadata?.avatar_url;
  const avatarInitial = (user?.user_metadata?.full_name || state.userName || 'S').charAt(0).toUpperCase();

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      className="md:hidden sticky top-0 z-40 w-full"
    >
      {/* Frosted glass bar */}
      <div
        className="relative flex items-center justify-between px-4 py-3"
        style={{
          background: 'hsl(var(--background) / 0.85)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 1px 0 rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.3)',
        }}
      >
        {/* Subtle ambient glow line at top */}
        <div className="absolute top-0 left-[15%] w-[70%] h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent pointer-events-none" />

        {/* Left — Logo */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 bg-primary/10 border border-primary/25 rounded-[14px] flex items-center justify-center shadow-lg shadow-primary/10 flex-shrink-0 relative">
            <div className="absolute inset-0 rounded-[14px] bg-primary/5 blur-lg" />
            <Target className="w-[18px] h-[18px] text-primary relative z-10" />
          </div>
          <div className="flex items-baseline gap-0.5 overflow-hidden">
            <span className="text-foreground font-black text-[17px] tracking-tighter leading-none">PLACE</span>
            <span className="text-primary font-black text-[17px] tracking-tighter leading-none">PREP</span>
          </div>
        </div>

        {/* Center / Right group */}
        <div className="flex items-center gap-2.5">
          {/* Streak Pill */}
          {streak > 0 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 20 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20"
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
            className="relative w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform touch-manipulation"
            style={{ minWidth: 36, minHeight: 36 }}
            aria-label="Open settings"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary via-primary/80 to-secondary flex items-center justify-center text-white font-black text-[13px] overflow-hidden border-2 border-white/10 shadow-md shadow-primary/20">
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
