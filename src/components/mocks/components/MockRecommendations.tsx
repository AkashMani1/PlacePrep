'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, RotateCcw, BookOpen, TrendingDown, ChevronRight, BarChart3 } from 'lucide-react';
import { useMockStore } from '@/store/useMockStore';
import { SEED_ASSESSMENTS } from '@/lib/mockQuestions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function MockRecommendations() {
  const router = useRouter();
  const { submissions, analytics, startAssessment } = useMockStore();

  const hasData = submissions.length > 0;
  const lowestSub = hasData ? [...submissions].sort((a, b) => a.accuracy - b.accuracy)[0] : null;
  const lowestAssessment = lowestSub ? SEED_ASSESSMENTS.find(a => a.id === lowestSub.assessmentId) : null;
  const attemptedIds = new Set(submissions.map(s => s.assessmentId));
  const unAttempted = SEED_ASSESSMENTS.filter(a => !attemptedIds.has(a.id));

  const handleRetry = () => {
    if (lowestSub) {
      startAssessment(lowestSub.assessmentId);
      if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
    } else {
      toast.info('Complete an assessment first to get retry recommendations.');
    }
  };

  const handleStudy = () => {
    if (unAttempted.length > 0) {
      startAssessment(unAttempted[0].id);
      if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
    } else {
      toast.info("You've attempted all assessments! Retry your weakest one.");
    }
  };

  if (!hasData) return null;

  return (
    <div className="space-y-5 mt-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Lightbulb className="w-4 h-4 text-amber-400" />
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Personalized Recommendations</h3>
        <div className="flex-1 h-px bg-white/5" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Weakest Area */}
        <div className="p-5 rounded-[20px] bg-rose-500/[0.06] border border-rose-500/15 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/15 flex items-center justify-center shrink-0">
              <TrendingDown className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-rose-400/80 mb-1">Critical Gap</p>
              <h4 className="text-sm font-black text-white leading-tight">
                {lowestAssessment?.title || 'Needs Assessment'}
              </h4>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground/60 font-medium leading-relaxed">
            {lowestSub
              ? `${lowestSub.accuracy.toFixed(0)}% accuracy. Focus here to improve your weakest area.`
              : 'No weak areas detected yet.'
            }
          </p>
          <button
            onClick={handleRetry}
            className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-300 transition-colors"
          >
            Launch Recovery Plan <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Next Recommended */}
        <div className="p-5 rounded-[20px] bg-emerald-500/[0.06] border border-emerald-500/15 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400/80 mb-1">
                {unAttempted.length > 0 ? 'New Challenge' : 'All Completed'}
              </p>
              <h4 className="text-sm font-black text-white leading-tight">
                {unAttempted.length > 0 ? unAttempted[0].title : 'All Assessments Done'}
              </h4>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground/60 font-medium leading-relaxed">
            {unAttempted.length > 0
              ? `${unAttempted[0].totalQuestions} questions · ${unAttempted[0].durationMinutes}m`
              : 'Great work! Retry your weakest to improve.'
            }
          </p>
          <button
            onClick={handleStudy}
            className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            {unAttempted.length > 0 ? 'Start Assessment' : 'Retry Weakest'} <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Roadmap */}
        <div className="p-5 rounded-[20px] bg-primary/[0.06] border border-primary/15 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
              <BarChart3 className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-primary/80 mb-1">Weekly Roadmap</p>
              <h4 className="text-sm font-black text-white leading-tight">Adaptive Schedule</h4>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground/60 font-medium leading-relaxed">
            {analytics.avgAccuracy < 70
              ? 'Focused on Easy + Medium to build fundamentals this week.'
              : 'Ready for Hard assessments. Push your placement readiness to 90%+.'
            }
          </p>
          <button
            onClick={() => toast.info(analytics.avgAccuracy < 70 ? 'Focus on fundamentals first.' : 'Try harder assessments next!')}
            className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
          >
            View Roadmap <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
