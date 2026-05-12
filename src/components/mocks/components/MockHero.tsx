'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Video, Zap, Activity, ShieldCheck, TrendingUp, TrendingDown, Award } from 'lucide-react';
import { useMockStore } from '@/store/useMockStore';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const TIER_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  Diamond: { label: 'Diamond', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  Platinum: { label: 'Platinum', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  Gold:     { label: 'Gold',    color: 'text-amber-400', bg: 'bg-amber-500/10',  border: 'border-amber-500/20'  },
  Silver:   { label: 'Silver',  color: 'text-slate-400', bg: 'bg-slate-500/10',  border: 'border-slate-500/20'  },
  Bronze:   { label: 'Bronze',  color: 'text-orange-400',bg: 'bg-orange-700/10', border: 'border-orange-700/20' },
};

export function MockHero() {
  const router = useRouter();
  const { analytics, submissions, computeAnalytics } = useMockStore();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) computeAnalytics(user.id);
  }, [computeAnalytics, user?.id]);

  const { readinessScore, avgAccuracy, streak, pressureIndex, recentTrend } = analytics;
  const totalScore = submissions.reduce((s, sub) => s + sub.score, 0);
  const tier = totalScore >= 2500 ? 'Diamond' : totalScore >= 1500 ? 'Platinum' : totalScore >= 800 ? 'Gold' : totalScore >= 300 ? 'Silver' : 'Bronze';
  const tierCfg = TIER_CONFIG[tier];

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Interview Command</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
            Your Performance<br />Dashboard
          </h1>
        </div>

        {/* Tier Badge */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${tierCfg.bg} border ${tierCfg.border}`}>
          <Award className={`w-4 h-4 ${tierCfg.color}`} />
          <span className={`text-xs font-black uppercase tracking-widest ${tierCfg.color}`}>{tierCfg.label}</span>
        </div>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Readiness */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="col-span-2 md:col-span-1 p-5 rounded-[20px] bg-card/40 border border-white/8 backdrop-blur-xl relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-3">Readiness</p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black text-white tabular-nums">{readinessScore}%</span>
              {recentTrend !== 0 && (
                <span className={`mb-1 flex items-center gap-1 text-[10px] font-bold ${recentTrend > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {recentTrend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {recentTrend > 0 ? '+' : ''}{recentTrend.toFixed(1)}%
                </span>
              )}
            </div>
            <div className="mt-3 h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${readinessScore}%` }}
                transition={{ duration: 1.2, ease: [0.32, 0.72, 0, 1], delay: 0.2 }}
                className="h-full bg-primary rounded-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Accuracy */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.07 }}
          className="p-5 rounded-[20px] bg-card/40 border border-white/8 backdrop-blur-xl"
        >
          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-3">Avg Accuracy</p>
          <span className="text-4xl font-black text-emerald-400 tabular-nums">{avgAccuracy.toFixed(0)}%</span>
          <div className="mt-3 h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${avgAccuracy}%` }}
              transition={{ duration: 1.2, ease: [0.32, 0.72, 0, 1], delay: 0.3 }}
              className="h-full bg-emerald-500 rounded-full"
            />
          </div>
        </motion.div>

        {/* Streak */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.14 }}
          className="p-5 rounded-[20px] bg-card/40 border border-white/8 backdrop-blur-xl"
        >
          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-3">Session Streak</p>
          <div className="flex items-end gap-1.5">
            <span className="text-4xl font-black text-amber-400 tabular-nums">{streak}</span>
            <span className="text-sm font-bold text-muted-foreground mb-1">{streak === 1 ? 'day' : 'days'}</span>
          </div>
          <div className="flex gap-1 mt-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className={`flex-1 h-1 rounded-full ${i < streak ? 'bg-amber-500' : 'bg-white/5'}`} />
            ))}
          </div>
        </motion.div>

        {/* Pressure */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.21 }}
          className="p-5 rounded-[20px] bg-card/40 border border-white/8 backdrop-blur-xl"
        >
          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-3">Pressure IQ</p>
          <span className="text-4xl font-black text-sky-400 tabular-nums">{pressureIndex.toFixed(0)}%</span>
          <div className="mt-3 h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pressureIndex}%` }}
              transition={{ duration: 1.2, ease: [0.32, 0.72, 0, 1], delay: 0.4 }}
              className="h-full bg-sky-500 rounded-full"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
