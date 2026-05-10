'use client';

import { motion } from 'framer-motion';
import { History, CheckCheck, Sparkles, Activity } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { calcStreak, calcTotalHours, calcCurrentWeek, today } from '@/lib/utils';
import { BentoCard } from './components/Shared';
import { StreakPill } from './components/StreakWidgets';
import { DeploymentLogPanel } from './components/DeploymentLogPanel';
import { DSASheetProgressCard } from './components/DSASheetProgressCard';
import { DailyTaskChecklist } from './components/DailyTaskChecklist';
import { SRSReviewQueue } from './components/SRSReviewQueue';
import { BadgeVault } from './components/BadgeVault';

// Premium spring physics for tactile interaction
const magneticSpring = { type: 'spring', stiffness: 150, damping: 15, mass: 0.1 } as any;
const smoothSpring = { type: 'spring', stiffness: 100, damping: 20 } as any;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, filter: 'blur(10px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: smoothSpring }
};

const textReveal = {
  hidden: { opacity: 0, y: "100%" },
  visible: { opacity: 1, y: 0, transition: { ...smoothSpring, duration: 0.8 } }
};

export default function DashboardView() {
  const { state, initialized } = useApp();
  const { user } = useAuth();
  if (!initialized) return null;

  const streak = calcStreak(state.dailyLogs);
  const totalHours = calcTotalHours(state.dailyLogs);
  const dailyHours = state.dailyLogs.find(l => l.date === today())?.hours || 0;
  const currentWeek = calcCurrentWeek(state.startDate);
  const totalDone = state.problems.filter((p) => p.status === 'Done').length;
  const goalWeeks = (state.goalDurationMonths || 3) * 4;
  const progressPct = Math.min(100, Math.round((currentWeek / goalWeeks) * 100));

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || state.userName || 'Engineer';

  return (
    <div className="relative min-h-[calc(100vh-8rem)] w-full overflow-hidden pt-4 pb-24">
      {/* Subtle Grid Background for Texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-12 gap-8 relative z-10 max-w-7xl mx-auto"
      >
        {/* ── Oversized Kinetic Typography Hero ────────────────────────── */}
        <motion.div variants={itemVariants} className="col-span-12 mb-6">
          <div className="overflow-hidden mb-4 flex items-center gap-5">
             <motion.div 
                initial={{ rotate: -90, scale: 0 }} 
                animate={{ rotate: 0, scale: 1 }} 
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="w-14 h-14 rounded-3xl bg-primary flex items-center justify-center shadow-[0_0_40px_rgba(var(--primary-rgb),0.4)]"
             >
                <Sparkles className="w-7 h-7 text-white" />
             </motion.div>
             <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/50 leading-[1.1]">
                <motion.span variants={textReveal} className="inline-block">Welcome</motion.span>{' '}
                <motion.span variants={textReveal} className="inline-block">back,</motion.span>{' '}
                <motion.span variants={textReveal} className="inline-block text-primary">{firstName}.</motion.span>
             </h1>
          </div>
          <motion.p variants={itemVariants} className="text-muted-foreground text-xl md:text-2xl font-medium max-w-3xl tracking-tight pl-20">
            Your high-performance placement OS is synced. You are currently in <strong className="text-foreground">Week {currentWeek}</strong> of your sprint. Let's execute.
          </motion.p>
        </motion.div>

        {/* ── Magnetic Hero Stats Grid ─────────────────────────────────── */}
        <motion.div variants={itemVariants} className="col-span-12 lg:col-span-8">
           <motion.div 
             whileHover={{ y: -5 }} 
             transition={magneticSpring}
             className="h-full relative overflow-hidden rounded-[40px] bg-card border border-border/50 shadow-2xl p-1"
           >
              {/* Refined subtle top glow instead of muddy blur */}
              <div className="absolute top-0 left-[20%] w-[60%] h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/5 dark:from-white/[0.02] to-transparent pointer-events-none" />
              
              <div className="relative z-10 h-full p-8 md:p-10 flex flex-col justify-between gap-12">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/10 dark:border-white/10 backdrop-blur-md shadow-inner">
                    <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground">Live Telemetry</span>
                  </div>
                  <StreakPill />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {/* Stat Block 1 */}
                  <motion.div whileHover={{ scale: 1.05 }} transition={magneticSpring} className="group cursor-default flex flex-col">
                    <p className="text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground/60 mb-3 group-hover:text-primary transition-colors">Current Streak</p>
                    <p className="text-6xl font-black text-foreground tracking-tighter group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-b group-hover:from-foreground group-hover:to-foreground/50 transition-all">{streak}</p>
                  </motion.div>
                  {/* Stat Block 2 */}
                  <motion.div whileHover={{ scale: 1.05 }} transition={magneticSpring} className="group cursor-default flex flex-col">
                    <p className="text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground/60 mb-3 group-hover:text-primary transition-colors">Solved</p>
                    <p className="text-6xl font-black text-foreground tracking-tighter">{totalDone}</p>
                  </motion.div>
                  {/* Stat Block 3 */}
                  <motion.div whileHover={{ scale: 1.05 }} transition={magneticSpring} className="group cursor-default flex flex-col">
                    <p className="text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground/60 mb-3 group-hover:text-primary transition-colors">Hours Today</p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-6xl font-black text-foreground tracking-tighter">{dailyHours}</p>
                      <span className="text-xl font-bold text-muted-foreground/40">h</span>
                    </div>
                  </motion.div>
                  {/* Stat Block 4 */}
                  <motion.div whileHover={{ scale: 1.05 }} transition={magneticSpring} className="group cursor-default flex flex-col">
                    <p className="text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground/60 mb-3 group-hover:text-primary transition-colors">Completion</p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-6xl font-black text-foreground tracking-tighter">{progressPct}</p>
                      <span className="text-xl font-bold text-muted-foreground/40">%</span>
                    </div>
                  </motion.div>
                </div>
              </div>
           </motion.div>
        </motion.div>

        {/* ── DSA Progress Widget ──────────────────────────────────────── */}
        <motion.div variants={itemVariants} className="col-span-12 lg:col-span-4">
          <motion.div whileHover={{ y: -5, scale: 1.01 }} transition={magneticSpring} className="h-full">
            <DSASheetProgressCard />
          </motion.div>
        </motion.div>

        {/* ── SRS Review Queue ─────────────────────────────────────────── */}
        <motion.div variants={itemVariants} className="col-span-12">
          <SRSReviewQueue />
        </motion.div>

        {/* ── Deployment Log ────────────────────────────────────────────── */}
        <motion.div variants={itemVariants} className="col-span-12">
           <DeploymentLogPanel />
        </motion.div>

        {/* ── Daily Checklist ──────────────────────────────────────────── */}
        <motion.div variants={itemVariants} className="col-span-12">
          <motion.div whileHover={{ y: -5 }} transition={smoothSpring}>
            <BentoCard className="flex-1 overflow-hidden backdrop-blur-2xl bg-card/60 border-white/10 shadow-2xl" title="Daily Execution Plan" icon={CheckCheck}>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 pointer-events-none" />
              <DailyTaskChecklist />
            </BentoCard>
          </motion.div>
        </motion.div>

        {/* ── Achievement Vault ─────────────────────────────────────────── */}
        <motion.div variants={itemVariants} className="col-span-12">
          <BadgeVault />
        </motion.div>

      </motion.div>
    </div>
  );
}
