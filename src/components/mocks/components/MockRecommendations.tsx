'use client';

import { motion } from 'framer-motion';
import { Lightbulb, Zap, BookOpen, RotateCcw, ChevronRight, BarChart3, TrendingDown } from 'lucide-react';
import { BentoCard } from '@/components/ui/Bento';
import { Button } from '@/components/ui/Button';

export function MockRecommendations() {
  return (
    <div className="mt-32 space-y-10">
      <div className="px-2 space-y-2">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-amber-500" />
           </div>
           <h2 className="text-2xl font-black uppercase tracking-tight text-white">Hyper-Personalized Roadmap</h2>
        </div>
        <p className="text-sm font-medium text-muted-foreground tracking-tight">Intelligence derived from your last 3 assessment failures and interview gaps.</p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* ── Core Weakness ─────────────────────────────────────────── */}
        <div className="col-span-12 lg:col-span-4">
           <BentoCard className="bg-rose-500/5 border-rose-500/10 h-full p-8 flex flex-col gap-8 relative overflow-hidden">
              <div className="absolute top-[-10%] right-[-10%] opacity-10">
                 <TrendingDown className="w-40 h-40 text-rose-500" />
              </div>
              <div className="space-y-4 relative z-10">
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500">Critical Gaps</span>
                 <h3 className="text-2xl font-black text-white leading-tight">Dynamic Programming & Quant Velocity</h3>
                 <p className="text-xs font-semibold text-muted-foreground leading-relaxed">
                    You consistently spend 4.5+ minutes on DP-Hard questions and struggle with Quantitative Accuracy (62%).
                 </p>
              </div>

              <div className="mt-auto space-y-4 relative z-10">
                 <div className="flex items-center gap-3 p-4 rounded-2xl bg-black/40 border border-white/5">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center">
                       <Zap className="w-4 h-4 text-rose-500" />
                    </div>
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">Priority 1: Speed Drills</span>
                 </div>
                 <Button variant="primary" className="w-full bg-rose-600 hover:bg-rose-500 shadow-rose-500/20">
                    Launch Recovery Plan
                 </Button>
              </div>
           </BentoCard>
        </div>

        {/* ── Recommended Tasks ─────────────────────────────────────── */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="p-8 rounded-[40px] bg-card/40 border border-white/5 backdrop-blur-3xl space-y-8 group hover:border-primary/40 transition-all">
              <div className="flex items-center justify-between">
                 <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <RotateCcw className="w-6 h-6 text-primary" />
                 </div>
                 <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground bg-white/5 px-3 py-1 rounded-full">Retry Target</span>
              </div>
              <div className="space-y-2">
                 <h4 className="text-lg font-black text-white uppercase tracking-tight">TCS NQT Sectional: Quant</h4>
                 <p className="text-[11px] font-medium text-muted-foreground">Focus on Time-Bound Speed Math. Your last attempt was 14 mins over.</p>
              </div>
              <button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-primary group-hover:gap-5 transition-all">
                 Begin Retry <ChevronRight className="w-4 h-4" />
              </button>
           </div>

           <div className="p-8 rounded-[40px] bg-card/40 border border-white/5 backdrop-blur-3xl space-y-8 group hover:border-emerald-500/40 transition-all">
              <div className="flex items-center justify-between">
                 <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-emerald-500" />
                 </div>
                 <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground bg-white/5 px-3 py-1 rounded-full">Learning Path</span>
              </div>
              <div className="space-y-2">
                 <h4 className="text-lg font-black text-white uppercase tracking-tight">System Design: LLD Patterns</h4>
                 <p className="text-[11px] font-medium text-muted-foreground">Critical for your Meta/Amazon targets. Deep-dive into Singleton & Factory.</p>
              </div>
              <button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 group-hover:gap-5 transition-all">
                 Study Docs <ChevronRight className="w-4 h-4" />
              </button>
           </div>

           <div className="col-span-1 md:col-span-2 p-8 rounded-[40px] bg-gradient-to-r from-primary/10 to-indigo-500/10 border border-white/5 flex items-center justify-between group">
              <div className="flex items-center gap-8">
                 <div className="w-16 h-16 rounded-[24px] bg-white/5 border border-white/10 flex items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-primary" />
                 </div>
                 <div>
                    <h4 className="text-xl font-black text-white uppercase tracking-tight">Next-Week Simulation Roadmap</h4>
                    <p className="text-sm font-medium text-muted-foreground">Adaptive schedule generated based on your goal of 'Prime' placement.</p>
                 </div>
              </div>
              <Button variant="secondary" size="lg">View Roadmap</Button>
           </div>
        </div>
      </div>
    </div>
  );
}
