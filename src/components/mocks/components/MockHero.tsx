'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Video, Zap, Activity, ShieldCheck, TrendingUp, TrendingDown } from 'lucide-react';
import { BentoCard, ActivityRing } from '@/components/ui/Bento';
import { useMockStore } from '@/store/useMockStore';
import { useAuth } from '@/context/AuthContext';

const textReveal = {
  hidden: { opacity: 0, y: "100%" },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20, duration: 0.8 } as any }
};

const TIER_NAMES: Record<string, string> = {
  Diamond: 'Diamond',
  Platinum: 'Platinum',
  Gold: 'Gold',
  Silver: 'Silver',
  Bronze: 'Bronze',
};

export function MockHero() {
  const { analytics, submissions, computeAnalytics } = useMockStore();
  const { user } = useAuth();

  // Recompute on mount
  useEffect(() => {
    if (user?.id) computeAnalytics(user.id);
  }, [computeAnalytics, user?.id]);

  const { readinessScore, avgAccuracy, streak, pressureIndex, recentTrend } = analytics;

  // Derive tier from submissions
  const totalScore = submissions.reduce((s, sub) => s + sub.score, 0);
  const tier = totalScore >= 2500 ? 'Diamond' : totalScore >= 1500 ? 'Platinum' : totalScore >= 800 ? 'Gold' : totalScore >= 300 ? 'Silver' : 'Bronze';

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
           <motion.div
             initial={{ rotate: -90, scale: 0 }}
             animate={{ rotate: 0, scale: 1 }}
             transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
             className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center shadow-[0_0_40px_rgba(var(--primary-rgb),0.4)]"
           >
             <Video className="w-7 h-7 text-white" />
           </motion.div>
           <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/40 leading-[1.1]">
              <motion.span initial="hidden" animate="visible" variants={textReveal} className="inline-block">Interview</motion.span>{' '}
              <motion.span initial="hidden" animate="visible" variants={textReveal} className="inline-block">Command.</motion.span>
           </h1>
        </div>
        <p className="text-muted-foreground text-sm md:text-base font-medium max-w-xl tracking-tight pl-2">
          Experience the pressure of real hiring cycles. Simulate, Analyze, and Master the final round.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <BentoCard className="col-span-12 lg:col-span-8 relative overflow-hidden bg-card/40 backdrop-blur-3xl border-white/5 group shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="w-48 h-48 text-primary" />
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 py-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-3">Readiness Status</h2>
                <div className="flex items-end gap-3">
                  <span className="text-5xl font-black tracking-tighter text-foreground">{readinessScore}%</span>
                  {recentTrend !== 0 && (
                    <span className={`${recentTrend > 0 ? 'text-emerald-500' : 'text-rose-500'} font-bold mb-2 flex items-center gap-1 text-xs`}>
                      {recentTrend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {recentTrend > 0 ? '+' : ''}{recentTrend.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-6 flex-wrap">
                <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                  <Zap className={`w-5 h-5 ${streak > 0 ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Session Streak</p>
                    <p className="text-sm font-bold text-foreground">{streak} {streak === 1 ? 'Day' : 'Days'}</p>
                  </div>
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                  <ShieldCheck className={`w-5 h-5 ${
                    tier === 'Diamond' ? 'text-cyan-500' :
                    tier === 'Platinum' ? 'text-indigo-500' :
                    tier === 'Gold' ? 'text-amber-500' :
                    'text-muted-foreground'
                  }`} />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mock Rank</p>
                    <p className="text-sm font-bold text-foreground">{TIER_NAMES[tier] || 'Unranked'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-4 bg-black/20 p-6 rounded-[32px] border border-white/5 shadow-inner">
               <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Execution Precision</span>
                  <span className="text-sm font-bold text-foreground">{avgAccuracy.toFixed(0)}%</span>
               </div>
               <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${avgAccuracy}%` }}
                    transition={{ duration: 1.5, ease: [0.32, 0.72, 0, 1] }}
                    className="h-full bg-gradient-to-r from-primary to-indigo-500"
                  />
               </div>
               <div className="flex items-center justify-between mt-2">
                  <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Pressure Tolerance</span>
                  <span className="text-sm font-bold text-foreground">{pressureIndex.toFixed(0)}%</span>
               </div>
               <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pressureIndex}%` }}
                    transition={{ duration: 1.5, ease: [0.32, 0.72, 0, 1], delay: 0.2 }}
                    className="h-full bg-gradient-to-r from-rose-500 to-orange-500"
                  />
               </div>
            </div>
          </div>
        </BentoCard>

        <BentoCard className="col-span-12 lg:col-span-4 bg-card/40 backdrop-blur-3xl border-white/5 shadow-2xl flex items-center justify-center py-10">
          <ActivityRing
            value={readinessScore}
            max={100}
            color="var(--primary)"
            label="Placement Readiness"
            size="lg"
          />
        </BentoCard>
      </div>
    </div>
  );
}
