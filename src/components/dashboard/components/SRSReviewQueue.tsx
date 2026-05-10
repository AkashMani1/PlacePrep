'use client';

/* Developed by Akash Mani - SRS Review Queue Widget */

import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, CheckCheck, RotateCcw, AlertTriangle, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getDueForReview, getSrsStageLabel, getDaysOverdue } from '@/lib/srsUtils';

const smoothSpring = { type: 'spring', stiffness: 100, damping: 20 } as any;
const magneticSpring = { type: 'spring', stiffness: 150, damping: 15, mass: 0.1 } as any;

export const SRSReviewQueue = memo(function SRSReviewQueue() {
  const { state, updateProblem } = useApp();

  const dueProblems = getDueForReview(state.problems);
  const overdue = dueProblems.filter((p) => getDaysOverdue(p) > 0);

  if (dueProblems.length === 0) return null;

  const SHOW_MAX = 5;
  const visible = dueProblems.slice(0, SHOW_MAX);
  const overflow = dueProblems.length - SHOW_MAX;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={smoothSpring}
      className="relative overflow-hidden rounded-[40px] border border-amber-500/20 bg-card/60 backdrop-blur-2xl shadow-2xl shadow-amber-500/5 p-8"
    >
      {/* Ambient glow */}
      <div className="absolute top-0 left-[15%] w-[70%] h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-inner">
              <Brain className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-foreground font-black text-base uppercase tracking-tight">
                  Spaced Repetition Queue
                </h3>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest">
                  {overdue.length > 0 && (
                    <AlertTriangle className="w-3 h-3 animate-pulse" />
                  )}
                  {dueProblems.length} Due
                </span>
              </div>
              <p className="text-muted-foreground text-xs font-medium mt-0.5">
                {overdue.length > 0
                  ? `${overdue.length} overdue — review now to retain memory.`
                  : 'These problems are scheduled for review today.'}
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-black/5 dark:bg-white/5 rounded-2xl border border-white/5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500/60" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">SM-2 Algorithm</span>
          </div>
        </div>

        {/* Problem Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {visible.map((problem, i) => {
              const overdueDays = getDaysOverdue(problem);
              const stageLabel = getSrsStageLabel(problem);
              const isOverdue = overdueDays > 0;

              return (
                <motion.div
                  key={problem.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  transition={{ ...smoothSpring, delay: i * 0.04 }}
                  className={`relative p-5 rounded-[24px] border bg-card/80 backdrop-blur flex flex-col gap-4 shadow-lg ${
                    isOverdue
                      ? 'border-amber-500/30 shadow-amber-500/5'
                      : 'border-border/30'
                  }`}
                >
                  {/* Overdue badge */}
                  {isOverdue && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 text-[9px] font-black uppercase tracking-widest border border-amber-500/20">
                      {overdueDays}d overdue
                    </span>
                  )}

                  <div className="flex flex-col gap-1 pr-16">
                    <p className="text-foreground text-sm font-bold leading-snug line-clamp-2">
                      {problem.name}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      <span className="px-2.5 py-1 rounded-lg bg-muted/30 text-muted-foreground text-[10px] font-black uppercase tracking-widest border border-border/20">
                        {problem.topic}
                      </span>
                      <span className="text-[10px] font-bold text-amber-500/70">{stageLabel}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 mt-auto">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      transition={magneticSpring}
                      onClick={() => updateProblem(problem.id, { status: 'Done' })}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-wider hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mastered
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      transition={magneticSpring}
                      onClick={() => updateProblem(problem.id, { status: 'Revisit' })}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-wider hover:bg-amber-500/20 hover:border-amber-500/40 transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Re-do
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Overflow indicator */}
        {overflow > 0 && (
          <p className="text-center text-[11px] font-black uppercase tracking-widest text-muted-foreground/50 pt-2">
            + {overflow} more in queue — visit Must-Do List to see all
          </p>
        )}
      </div>
    </motion.div>
  );
});
