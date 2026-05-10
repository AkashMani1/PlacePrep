'use client';

import { motion } from 'framer-motion';
import { Video, Zap, Activity, ShieldCheck, Target, TrendingUp } from 'lucide-react';
import { BentoCard, ActivityRing } from '@/components/ui/Bento';
import { useApp } from '@/context/AppContext';

const textReveal = {
  hidden: { opacity: 0, y: "100%" },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20, duration: 0.8 } as any }
};

export function MockHero() {
  const { state } = useApp();
  const mocks = state.mocks || [];
  const avgScore = mocks.length ? Math.round(mocks.reduce((s, m) => s + (m.score / m.maxScore) * 100, 0) / mocks.length) : 0;
  
  // Simulated readiness calculation
  const readiness = Math.min(100, Math.round((mocks.length / 10) * 50 + (avgScore / 100) * 50));
  const pressureIndex = 72; // Static for now, can be derived from latest mock metadata

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
           <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/40 leading-[1.1]">
              <motion.span initial="hidden" animate="visible" variants={textReveal} className="inline-block">Interview</motion.span>{' '}
              <motion.span initial="hidden" animate="visible" variants={textReveal} className="inline-block">Command.</motion.span>
           </h1>
        </div>
        <p className="text-muted-foreground text-lg md:text-xl font-medium max-w-2xl tracking-tight pl-2">
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
                  <span className="text-6xl font-black tracking-tighter text-foreground">{readiness}%</span>
                  <span className="text-emerald-500 font-bold mb-2 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" /> +12.4%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Session Streak</p>
                    <p className="text-sm font-bold text-foreground">4 Days</p>
                  </div>
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mock Rank</p>
                    <p className="text-sm font-bold text-foreground">Platinum IV</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-4 bg-black/20 p-6 rounded-[32px] border border-white/5 shadow-inner">
               <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Execution Precision</span>
                  <span className="text-sm font-bold text-foreground">{avgScore}%</span>
               </div>
               <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${avgScore}%` }}
                    transition={{ duration: 1.5, ease: [0.32, 0.72, 0, 1] }}
                    className="h-full bg-gradient-to-r from-primary to-indigo-500"
                  />
               </div>
               <div className="flex items-center justify-between mt-2">
                  <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Pressure Tolerance</span>
                  <span className="text-sm font-bold text-foreground">{pressureIndex}%</span>
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
            value={readiness} 
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
