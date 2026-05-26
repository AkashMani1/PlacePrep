'use client';

/* Developed by Akash Mani - PlacePrep Mobile Dashboard Bento Grid */

import { motion } from 'framer-motion';
import { Flame, CheckCircle2, Clock, CalendarCheck, Sparkles, ArrowRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { calcStreak, calcTotalHours, calcCurrentWeek, today } from '@/lib/utils';
import Link from 'next/link';

const springConfig = { type: 'spring', stiffness: 300, damping: 25 } as any;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

const cellVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: springConfig },
};

interface BentoCellProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  unit?: string;
  accent: string;         // tailwind color string for glow/icon
  glowColor: string;      // rgba string for box-shadow glow
  span?: 'half' | 'full';
}

function BentoCell({ icon: Icon, label, value, unit, accent, glowColor, span = 'half' }: BentoCellProps) {
  return (
    <motion.div
      variants={cellVariants}
      whileTap={{ scale: 0.97 }}
      className={`relative flex min-w-0 flex-col justify-between gap-5 overflow-hidden rounded-[24px] p-5 ${
        span === 'full' ? 'col-span-2' : 'col-span-1'
      }`}
      style={{
        background: 'linear-gradient(180deg, hsl(var(--card) / 0.96) 0%, hsl(var(--card) / 0.88) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.05), 0 16px 40px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.04)',
        minHeight: 132,
      }}
    >
      {/* Ambient corner glow */}
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full"
        style={{ background: glowColor, filter: 'blur(20px)', opacity: 0.6 }}
      />

      {/* Top row: icon + label */}
      <div className="relative z-10 flex min-w-0 items-start justify-between gap-3">
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl"
          style={{
            background: glowColor.replace('0.6', '0.15'),
            border: `1px solid ${glowColor.replace('0.6', '0.25')}`,
          }}
        >
          <Icon className={`w-4 h-4 ${accent}`} />
        </div>
        <span
          className="line-clamp-2 min-w-0 break-words text-right text-[10px] font-black uppercase tracking-[0.18em] opacity-55 [hyphens:auto] [overflow-wrap:anywhere]"
          style={{ color: 'hsl(var(--muted-foreground))' }}
        >
          {label}
        </span>
      </div>

      {/* Bottom row: big number */}
      <div className="relative z-10 flex min-w-0 flex-wrap items-end gap-x-1 gap-y-2">
        <span
          className="min-w-0 font-black leading-none tabular-nums tracking-tight"
          style={{
            fontSize: 'clamp(1.8rem, 9vw, 2.6rem)',
            color: 'hsl(var(--foreground))',
            letterSpacing: '-0.04em',
          }}
        >
          {value}
        </span>
        {unit && (
          <span className="shrink-0 text-sm font-bold opacity-55" style={{ color: 'hsl(var(--muted-foreground))' }}>
            {unit}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export default function MobileDashboard() {
  const { state } = useApp();
  const { user } = useAuth();

  const streak = calcStreak(state.dailyLogs);
  const totalHours = calcTotalHours(state.dailyLogs);
  const dailyHours = state.dailyLogs.find((l) => l.date === today())?.hours || 0;
  const currentWeek = calcCurrentWeek(state.startDate);
  const goalWeeks = (state.goalDurationMonths || 3) * 4;
  const progressPct = Math.min(100, Math.round((currentWeek / goalWeeks) * 100));
  const totalDone = state.problems.filter((p) => p.status === 'Done').length;

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || state.userName || 'Engineer';

  // DSA Sheet progress
  const dsaItems = (state.dsaSheetItems || []).filter((item) => !item.hidden);
  const dsaSolved = dsaItems.filter((item) => item.completed).length;
  const dsaTotal = dsaItems.length;
  const dsaPct = dsaTotal > 0 ? Math.round((dsaSolved / dsaTotal) * 100) : 0;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="md:hidden flex min-w-0 flex-col gap-6 px-0 pb-2"
    >
      {/* Greeting */}
      <motion.div variants={cellVariants} className="flex min-w-0 items-center gap-4 px-1 pt-1">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[20px] border border-white/10 bg-primary shadow-[0_12px_28px_rgba(76,79,229,0.32)]">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <h1
            className="line-clamp-2 break-words font-black leading-tight tracking-tight [hyphens:auto] [overflow-wrap:anywhere]"
            style={{
              fontSize: 'clamp(1.4rem, 6vw, 1.8rem)',
              background: 'linear-gradient(135deg, hsl(var(--foreground)) 0%, hsl(var(--foreground)/0.6) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Hey, {firstName} 👋
          </h1>
          <p className="mt-1 line-clamp-2 break-words text-[11px] font-medium tracking-tight text-muted-foreground [hyphens:auto] [overflow-wrap:anywhere]">
            Week {currentWeek} · Keep the momentum going
          </p>
        </div>
      </motion.div>

      {/* 2×2 Bento Grid */}
      <div className="grid grid-cols-2 gap-3.5">
        <BentoCell
          icon={Flame}
          label="Streak"
          value={streak}
          unit="days"
          accent="text-amber-400"
          glowColor="rgba(245, 158, 11, 0.6)"
        />
        <BentoCell
          icon={CheckCircle2}
          label="Solved"
          value={totalDone}
          accent="text-emerald-400"
          glowColor="rgba(16, 185, 129, 0.6)"
        />
        <BentoCell
          icon={Clock}
          label="Today"
          value={dailyHours}
          unit="h"
          accent="text-sky-400"
          glowColor="rgba(56, 189, 248, 0.6)"
        />
        <BentoCell
          icon={CalendarCheck}
          label="Sprint"
          value={progressPct}
          unit="%"
          accent="text-violet-400"
          glowColor="rgba(167, 139, 250, 0.6)"
        />
      </div>

      {/* DSA Progress Bar — Compact */}
      <motion.div
        variants={cellVariants}
        className="relative overflow-hidden rounded-[24px] p-5"
        style={{
          background: 'linear-gradient(180deg, hsl(var(--card) / 0.96) 0%, hsl(var(--card) / 0.9) 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 1px 0 rgba(255,255,255,0.05), 0 18px 46px rgba(0,0,0,0.22)',
        }}
      >
        <div className="mb-4 flex min-w-0 items-center justify-between gap-3">
          <span className="line-clamp-2 min-w-0 break-words text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/70 [hyphens:auto] [overflow-wrap:anywhere]">
            DSA Sheet Progress
          </span>
          <Link
            href="/dsaSheet"
            className="flex shrink-0 items-center gap-1 text-[10px] font-black text-primary/75 transition-colors hover:text-primary"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="flex flex-col gap-4 min-[360px]:flex-row min-[360px]:items-center">
          <div className="flex min-w-0 flex-1 flex-col gap-2.5">
            {/* Segmented progress bars for Easy / Medium / Hard */}
            {[
              { label: 'Easy', color: '#10B981', solved: dsaItems.filter(i => i.difficulty === 'Easy' && i.completed).length, total: dsaItems.filter(i => i.difficulty === 'Easy').length },
              { label: 'Med', color: '#F59E0B', solved: dsaItems.filter(i => i.difficulty === 'Medium' && i.completed).length, total: dsaItems.filter(i => i.difficulty === 'Medium').length },
              { label: 'Hard', color: '#EF4444', solved: dsaItems.filter(i => i.difficulty === 'Hard' && i.completed).length, total: dsaItems.filter(i => i.difficulty === 'Hard').length },
            ].map((row) => (
              <div key={row.label} className="flex min-w-0 items-center gap-2.5">
                <span className="w-7 flex-shrink-0 text-[9px] font-black uppercase tracking-wider text-muted-foreground/55">
                  {row.label}
                </span>
                <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${row.total > 0 ? (row.solved / row.total) * 100 : 0}%` }}
                    transition={{ duration: 1.2, ease: [0.32, 0.72, 0, 1], delay: 0.4 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: row.color }}
                  />
                </div>
                <span className="w-10 flex-shrink-0 text-right text-[9px] font-black tabular-nums text-muted-foreground/55">
                  {row.solved}/{row.total}
                </span>
              </div>
            ))}
          </div>

          {/* Big % number */}
          <div className="flex flex-shrink-0 items-end justify-between gap-2 min-[360px]:flex-col min-[360px]:items-center">
            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-muted-foreground/55 min-[360px]:hidden">
              Overall
            </span>
            <span
              className="font-black tabular-nums leading-none"
              style={{
                fontSize: 'clamp(1.6rem, 7vw, 2rem)',
                color: 'hsl(var(--foreground))',
                letterSpacing: '-0.04em',
              }}
            >
              {dsaPct}
            </span>
            <span className="mt-0.5 text-[8px] font-black uppercase tracking-widest text-muted-foreground/50">%</span>
          </div>
        </div>
      </motion.div>

      {/* Quick-action pills */}
      <motion.div variants={cellVariants} className="grid grid-cols-3 gap-3">
        {[
          { href: '/roadmap', label: '🗺 Roadmap', color: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.2)' },
          { href: '/dsa', label: '✅ Must-Do', color: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
          { href: '/notes', label: '📚 Notes', color: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.2)' },
        ].map(({ href, label, color, border }) => (
          <Link
            key={href}
            href={href}
            className="flex min-w-0 items-center justify-center rounded-[20px] px-3 py-3.5 text-center text-[11px] font-black tracking-tight text-foreground/80 transition-transform touch-manipulation active:scale-95"
            style={{
              background: color,
              border: `1px solid ${border}`,
              minHeight: 48,
              boxShadow: '0 10px 28px rgba(0,0,0,0.12)',
            }}
          >
            <span className="line-clamp-2 break-words [overflow-wrap:anywhere]">{label}</span>
          </Link>
        ))}
      </motion.div>
    </motion.div>
  );
}
