'use client';

/* Developed by Akash Mani - PlacePrep Mobile SRS Flashcard Swiper */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Brain, CheckCheck, RotateCcw, AlertTriangle, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getDueForReview, getSrsStageLabel, getDaysOverdue } from '@/lib/srsUtils';
import { toast } from 'sonner';

const SWIPE_THRESHOLD = 80; // px to trigger action

interface FlashcardProps {
  problem: ReturnType<typeof getDueForReview>[number];
  onMastered: () => void;
  onRedo: () => void;
  isTop: boolean;
  index: number;
}

function Flashcard({ problem, onMastered, onRedo, isTop, index }: FlashcardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-18, 0, 18]);
  const opacity = useTransform(x, [-250, -100, 0, 100, 250], [0, 1, 1, 1, 0]);

  // Background color tint based on drag direction
  const masteredOpacity = useTransform(x, [0, SWIPE_THRESHOLD, SWIPE_THRESHOLD * 2], [0, 0.5, 1]);
  const redoOpacity = useTransform(x, [-SWIPE_THRESHOLD * 2, -SWIPE_THRESHOLD, 0], [1, 0.5, 0]);

  const overdueDays = getDaysOverdue(problem);
  const stageLabel = getSrsStageLabel(problem);
  const isOverdue = overdueDays > 0;

  const handleDragEnd = (_: any, info: { offset: { x: number } }) => {
    if (info.offset.x > SWIPE_THRESHOLD) {
      onMastered();
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      onRedo();
    }
  };

  if (!isTop) {
    // Background stacked cards (non-interactive)
    return (
      <motion.div
        className="[grid-area:1/1] min-h-[320px] rounded-[28px]"
        style={{
          background: 'hsl(var(--card))',
          border: '1px solid rgba(255,255,255,0.06)',
          scale: 1 - index * 0.04,
          y: index * 10,
          zIndex: 10 - index,
        }}
      />
    );
  }

  return (
    <motion.div
      className="[grid-area:1/1] cursor-grab touch-none active:cursor-grabbing"
      style={{ x, rotate, opacity, zIndex: 20 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: 'grabbing' }}
    >
      {/* Card body */}
      <div
        className="relative flex min-h-[320px] h-full select-none flex-col justify-between overflow-hidden rounded-[28px]"
        style={{
          background: 'hsl(var(--card))',
          border: isOverdue ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.3)',
        }}
      >
        {/* Dynamic swipe direction tint overlays */}
        <motion.div
          className="absolute inset-0 rounded-[28px] pointer-events-none"
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            opacity: masteredOpacity,
          }}
        />
        <motion.div
          className="absolute inset-0 rounded-[28px] pointer-events-none"
          style={{
            background: 'rgba(245, 158, 11, 0.15)',
            opacity: redoOpacity,
          }}
        />

        {/* Ambient top glow */}
        <div
          className="absolute top-0 left-[15%] w-[70%] h-[1px] pointer-events-none"
          style={{
            background: isOverdue
              ? 'linear-gradient(90deg, transparent, rgba(245,158,11,0.5), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(var(--primary-rgb),0.35), transparent)',
          }}
        />

        <div className="relative z-10 flex h-full min-w-0 flex-col gap-4 p-6">
          {/* Header */}
          <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
            <div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl"
              style={{
                background: isOverdue ? 'rgba(245,158,11,0.1)' : 'rgba(var(--primary-rgb),0.1)',
                border: isOverdue ? '1px solid rgba(245,158,11,0.2)' : '1px solid rgba(var(--primary-rgb),0.2)',
              }}
            >
              <Brain className={`w-5 h-5 ${isOverdue ? 'text-amber-400' : 'text-primary'}`} />
            </div>

            <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
              {isOverdue && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20">
                  <AlertTriangle className="w-3 h-3" />
                  {overdueDays}d overdue
                </span>
              )}
              <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 bg-white/[0.04] border border-white/[0.06]">
                {stageLabel}
              </span>
            </div>
          </div>

          {/* Problem name */}
          <div className="flex flex-1 flex-col justify-center min-w-0">
            <p className="line-clamp-3 break-words text-xl font-black leading-tight tracking-tight text-foreground [hyphens:auto] [overflow-wrap:anywhere]">
              {problem.name}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="max-w-full break-words rounded-xl border border-white/[0.06] bg-white/[0.04] px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 [overflow-wrap:anywhere]">
                {problem.topic}
              </span>
              {problem.difficulty && (
                <span
                  className="rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest"
                  style={{
                    color: problem.difficulty === 'Easy' ? '#10B981' : problem.difficulty === 'Medium' ? '#F59E0B' : '#EF4444',
                    background: problem.difficulty === 'Easy' ? 'rgba(16,185,129,0.1)' : problem.difficulty === 'Medium' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                    border: `1px solid ${problem.difficulty === 'Easy' ? 'rgba(16,185,129,0.2)' : problem.difficulty === 'Medium' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'}`,
                  }}
                >
                  {problem.difficulty}
                </span>
              )}
            </div>
          </div>

          {/* Swipe hints — fades when dragging */}
          <div className="flex items-center justify-between gap-4">
            <motion.div
              className="flex min-w-0 items-center gap-1.5 text-amber-400/50"
              style={{ opacity: useTransform(x, [-50, 0], [1, 0.4]) }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Re-do</span>
            </motion.div>
            <motion.div
              className="flex min-w-0 items-center gap-1.5 text-emerald-400/50"
              style={{ opacity: useTransform(x, [0, 50], [0.4, 1]) }}
            >
              <span className="text-[10px] font-black uppercase tracking-widest">Mastered</span>
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function MobileFlashcardSwiper() {
  const { state, updateProblem } = useApp();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const dueProblems = getDueForReview(state.problems).filter((p) => !dismissed.has(p.id));

  /**
   * OPTIMISTIC UI PATTERN
   * ─────────────────────────────────────────────────────────────────────────
   * Step 1: Immediately add the card ID to `dismissed` so it vanishes NOW.
   * Step 2: Call updateProblem (writes to localStorage via AppContext).
   * Step 3: If updateProblem throws (e.g. storage quota exceeded), roll back
   *         the dismissed state and show a toast — user can retry.
   *
   * Because updateProblem is synchronous (writes to localStorage, then triggers
   * a re-render via useLocalStorage), there is no async gap here. The UI is
   * always consistent. If you later swap localStorage for an API call, wrap
   * the API call in a try/catch below and rollback `dismissed` on failure.
   */
  const handleAction = useCallback(
    (id: string, status: 'Done' | 'Revisit') => {
      // ── Haptic feedback ──────────────────────────────────────────────────
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50); // 50ms vibration
      }

      // ── 1. Optimistic: hide the card immediately (zero-latency UI) ──
      setDismissed((prev) => new Set(Array.from(prev).concat(id)));

      try {
        // ── 2. Persist: update state in AppContext → localStorage ──
        updateProblem(id, { status });
      } catch (err) {
        // ── 3. Rollback: storage failed, re-show the card ──
        setDismissed((prev) => {
          const next = new Set(Array.from(prev));
          next.delete(id);
          return next;
        });
        toast.error('Failed to save. Please try again.', { duration: 3000 });
      }
    },
    [updateProblem]
  );

  const handleMastered = useCallback((id: string) => handleAction(id, 'Done'), [handleAction]);
  const handleRedo = useCallback((id: string) => handleAction(id, 'Revisit'), [handleAction]);

  if (dueProblems.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="md:hidden flex flex-col items-center justify-center py-12 gap-4"
      >
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <CheckCheck className="w-8 h-8 text-emerald-400" />
        </div>
        <div className="text-center">
          <p className="text-foreground font-black text-lg">All caught up!</p>
          <p className="text-muted-foreground text-sm mt-1">No reviews due today. 🎉</p>
        </div>
      </motion.div>
    );
  }

  const overdue = dueProblems.filter((p) => getDaysOverdue(p) > 0);
  // Show up to 3 stacked cards
  const visible = dueProblems.slice(0, 3);

  return (
    <div className="md:hidden flex flex-col gap-5">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Brain className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 className="text-foreground font-black text-sm uppercase tracking-tight">
              Review Queue
            </h2>
            <p className="text-muted-foreground text-[10px] font-medium mt-0.5">
              {overdue.length > 0 ? `${overdue.length} overdue` : `${dueProblems.length} due today`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">
            {dueProblems.length} Due
          </span>
        </div>
      </div>

      {/* Card Stack */}
      <div className="relative grid overflow-visible px-1 pb-6 pt-1 [grid-template-areas:'stack']">
        <AnimatePresence>
          {visible.map((problem, index) => (
            <Flashcard
              key={problem.id}
              problem={problem}
              isTop={index === 0}
              index={index}
              onMastered={() => handleMastered(problem.id)}
              onRedo={() => handleRedo(problem.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Tap-to-action buttons (backup for users who prefer tapping) */}
      <div className="flex gap-3">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => dueProblems[0] && handleRedo(dueProblems[0].id)}
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl font-black text-[11px] uppercase tracking-wider text-amber-400 active:scale-95 transition-transform touch-manipulation"
          style={{
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.2)',
            minHeight: 52,
          }}
        >
          <RotateCcw className="w-4 h-4" />
          Re-do
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => dueProblems[0] && handleMastered(dueProblems[0].id)}
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl font-black text-[11px] uppercase tracking-wider text-emerald-400 active:scale-95 transition-transform touch-manipulation"
          style={{
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.2)',
            minHeight: 52,
          }}
        >
          <CheckCheck className="w-4 h-4" />
          Mastered
        </motion.button>
      </div>

      {/* Remaining count */}
      {dueProblems.length > 3 && (
        <p className="text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
          +{dueProblems.length - 3} more in queue
        </p>
      )}
    </div>
  );
}
