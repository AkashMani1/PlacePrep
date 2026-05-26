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
      className={`relative overflow-hidden rounded-[22px] flex flex-col justify-between p-4 ${
        span === 'full' ? 'col-span-2' : 'col-span-1'
      }`}
      style={{
        background: 'hsl(var(--card))',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: `0 0 0 0.5px rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05)`,
        minHeight: 110,
      }}
    >
      {/* Ambient corner glow */}
      <div
        className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none"
        style={{ background: glowColor, filter: 'blur(20px)', opacity: 0.6 }}
      />

      {/* Top row: icon + label */}
      <div className="flex items-center justify-between relative z-10">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{
            background: glowColor.replace('0.6', '0.15'),
            border: `1px solid ${glowColor.replace('0.6', '0.25')}`,
          }}
        >
          <Icon className={`w-4 h-4 ${accent}`} />
        </div>
        <span
          className="text-[9px] font-black uppercase tracking-[0.18em] opacity-40"
          style={{ color: 'hsl(var(--muted-foreground))' }}
        >
          {label}
        </span>
      </div>

      {/* Bottom row: big number */}
      <div className="flex items-baseline gap-1 relative z-10 mt-2">
        <span
          className="font-black leading-none tabular-nums"
          style={{
            fontSize: 'clamp(1.8rem, 9vw, 2.6rem)',
            color: 'hsl(var(--foreground))',
            letterSpacing: '-0.04em',
          }}
        >
          {value}
        </span>
        {unit && (
          <span className="text-sm font-bold opacity-40" style={{ color: 'hsl(var(--muted-foreground))' }}>
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
      className="md:hidden flex flex-col gap-4 px-1 pb-2"
    >
      {/* Greeting */}
      <motion.div variants={cellVariants} className="flex items-center gap-3 pt-1">
        <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 flex-shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1
            className="font-black tracking-tight leading-tight"
            style={{
              fontSize: 'clamp(1.4rem, 6vw, 1.8rem)',
              background: 'linear-gradient(135deg, hsl(var(--foreground)) 0%, hsl(var(--foreground)/0.6) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Hey, {firstName} 👋
          </h1>
          <p className="text-[11px] font-semibold text-muted-foreground mt-0.5 tracking-tight">
            Week {currentWeek} · Keep the momentum going
          </p>
        </div>
      </motion.div>

      {/* 2×2 Bento Grid */}
      <div className="grid grid-cols-2 gap-3">
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
        className="relative overflow-hidden rounded-[22px] p-4"
        style={{
          background: 'hsl(var(--card))',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/60">
            DSA Sheet Progress
          </span>
          <Link
            href="/dsaSheet"
            className="flex items-center gap-1 text-[10px] font-black text-primary/70 hover:text-primary transition-colors"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 flex flex-col gap-2">
            {/* Segmented progress bars for Easy / Medium / Hard */}
            {[
              { label: 'Easy', color: '#10B981', solved: dsaItems.filter(i => i.difficulty === 'Easy' && i.completed).length, total: dsaItems.filter(i => i.difficulty === 'Easy').length },
              { label: 'Med', color: '#F59E0B', solved: dsaItems.filter(i => i.difficulty === 'Medium' && i.completed).length, total: dsaItems.filter(i => i.difficulty === 'Medium').length },
              { label: 'Hard', color: '#EF4444', solved: dsaItems.filter(i => i.difficulty === 'Hard' && i.completed).length, total: dsaItems.filter(i => i.difficulty === 'Hard').length },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground/50 w-6 flex-shrink-0">
                  {row.label}
                </span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${row.total > 0 ? (row.solved / row.total) * 100 : 0}%` }}
                    transition={{ duration: 1.2, ease: [0.32, 0.72, 0, 1], delay: 0.4 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: row.color }}
                  />
                </div>
                <span className="text-[9px] font-black text-muted-foreground/50 tabular-nums w-10 text-right flex-shrink-0">
                  {row.solved}/{row.total}
                </span>
              </div>
            ))}
          </div>

          {/* Big % number */}
          <div className="flex flex-col items-center flex-shrink-0">
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
            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 mt-0.5">%</span>
          </div>
        </div>
      </motion.div>

      {/* Quick-action pills */}
      <motion.div variants={cellVariants} className="flex gap-2.5">
        {[
          { href: '/roadmap', label: '🗺 Roadmap', color: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.2)' },
          { href: '/dsa', label: '✅ Must-Do', color: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
          { href: '/notes', label: '📚 Notes', color: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.2)' },
        ].map(({ href, label, color, border }) => (
          <Link
            key={href}
            href={href}
            className="flex-1 flex items-center justify-center py-3 rounded-2xl text-[11px] font-black tracking-tight text-foreground/80 active:scale-95 transition-transform touch-manipulation"
            style={{
              background: color,
              border: `1px solid ${border}`,
              minHeight: 48,
            }}
          >
            {label}
          </Link>
        ))}
      </motion.div>
    </motion.div>
  );
}
