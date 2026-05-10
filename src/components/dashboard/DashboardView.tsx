'use client';

import { motion } from 'framer-motion';
import { History, CheckCheck } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { calcStreak, calcTotalHours, calcCurrentWeek, today } from '@/lib/utils';

// Import extracted premium components
import { BentoCard } from './components/Shared';
import { StreakPill } from './components/StreakWidgets';
import { DeploymentLogPanel } from './components/DeploymentLogPanel';
import { DSASheetProgressCard } from './components/DSASheetProgressCard';
import { DailyTaskChecklist } from './components/DailyTaskChecklist';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

export default function DashboardView() {
  const { state, initialized } = useApp();
  if (!initialized) return null;

  const streak = calcStreak(state.dailyLogs);
  const totalHours = calcTotalHours(state.dailyLogs);
  const dailyHours = state.dailyLogs.find(l => l.date === today())?.hours || 0;
  const currentWeek = calcCurrentWeek(state.startDate);
  const totalDone = state.problems.filter((p) => p.status === 'Done').length;
  const goalWeeks = (state.goalDurationMonths || 3) * 4;
  const progressPct = Math.min(100, Math.round((currentWeek / goalWeeks) * 100));

  return (
    <div className="relative">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-12 gap-6 relative z-10"
      >
        {/* TOP ROW: Session Overview & DSA Sheet Progress */}
        <BentoCard className="col-span-12 lg:col-span-7 !p-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.03] to-transparent pointer-events-none" />
          <div className="relative z-10 h-full px-8 py-6 flex flex-col justify-between gap-6">
            
            <div className="space-y-4">
               <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                     <p className="text-muted-foreground text-xs font-semibold tracking-wide">Placement Portal</p>
                  </div>
                  <StreakPill />
               </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-black/5 dark:bg-white/[0.03] rounded-lg border border-border/50 dark:border-white/[0.05]">
                  <p className="text-primary text-[11px] font-semibold tracking-wider">Week {currentWeek} <span className="opacity-50">/ {(state.goalDurationMonths || 3) * 4}</span></p>
                </div>
                <div className="w-[1px] h-4 bg-white/[0.08] mx-1" />
                <div className="flex items-center gap-2 px-3 py-1.5 bg-black/5 dark:bg-white/[0.03] rounded-lg border border-border/50 dark:border-white/[0.05]">
                  <History className="w-3.5 h-3.5 text-indigo-400 opacity-80" />
                  <p className="text-foreground text-[11px] font-semibold tabular-nums">{totalHours.toFixed(0)}<span className="text-muted-foreground/60 text-[9px] ml-1.5">Hrs Logged</span></p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 md:gap-8 pt-4">
              <div className="group">
                <p className="text-[32px] font-bold text-foreground group-hover:text-primary transition-colors tabular-nums leading-none mb-1.5">{streak}</p>
                <p className="text-[10px] font-medium tracking-wide text-muted-foreground group-hover:text-foreground/80 transition-colors">Current Streak</p>
              </div>
              <div className="group">
                <p className="text-[32px] font-bold text-foreground group-hover:text-indigo-400 transition-colors tabular-nums leading-none mb-1.5">{totalDone}</p>
                <p className="text-[10px] font-medium tracking-wide text-muted-foreground group-hover:text-foreground/80 transition-colors">Problems Solved</p>
              </div>
              <div className="group">
                <p className="text-[32px] font-bold text-foreground transition-colors tabular-nums leading-none mb-1.5 group-hover:text-emerald-400">
                  {dailyHours}<span className="text-[14px] ml-1.5 text-muted-foreground/40 font-semibold group-hover:text-emerald-400/60 transition-colors">HR</span>
                </p>
                <p className="text-[10px] font-medium tracking-wide text-muted-foreground group-hover:text-foreground/80 transition-colors">Hours Today</p>
              </div>
              <div className="group">
                <p className="text-[32px] font-bold text-foreground/60 transition-colors tabular-nums leading-none mb-1.5 group-hover:text-foreground/90">{progressPct}%</p>
                <p className="text-[10px] font-medium tracking-wide text-muted-foreground group-hover:text-foreground/80 transition-colors">Goal Progress</p>
              </div>
            </div>

          </div>
        </BentoCard>

        <DSASheetProgressCard />

        <DeploymentLogPanel />

        {/* MAIN ROW: Workspace & Stats Sidebar */}
        <div className="col-span-12 flex flex-col gap-6">
          <BentoCard className="flex-1" title="Daily Execution Plan" icon={CheckCheck}>
            <DailyTaskChecklist />
          </BentoCard>
        </div>

      </motion.div>
    </div>
  );
}
