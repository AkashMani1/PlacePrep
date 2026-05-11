'use client';

import { motion } from 'framer-motion';
import { Lightbulb, Zap, BookOpen, RotateCcw, ChevronRight, BarChart3, TrendingDown, Target } from 'lucide-react';
import { BentoCard } from '@/components/ui/Bento';
import { Button } from '@/components/ui/Button';
import { useMockStore } from '@/store/useMockStore';
import { SEED_ASSESSMENTS } from '@/lib/mockQuestions';
import { toast } from 'sonner';

export function MockRecommendations() {
  const { submissions, analytics, startAssessment } = useMockStore();

  // Derive recommendations from actual submission data
  const hasData = submissions.length > 0;

  // Find lowest-scoring assessment for retry
  const lowestSub = hasData
    ? [...submissions].sort((a, b) => a.accuracy - b.accuracy)[0]
    : null;
  const lowestAssessment = lowestSub
    ? SEED_ASSESSMENTS.find(a => a.id === lowestSub.assessmentId)
    : null;

  // Find un-attempted assessments
  const attemptedIds = new Set(submissions.map(s => s.assessmentId));
  const unAttempted = SEED_ASSESSMENTS.filter(a => !attemptedIds.has(a.id));

  // Derive weak area
  const weakArea = lowestSub && lowestAssessment
    ? `${lowestAssessment.companyTags[0] || ''} ${lowestAssessment.category}`
    : 'General aptitude areas';

  const weakAccuracy = lowestSub ? lowestSub.accuracy.toFixed(0) : '0';

  const handleRetry = () => {
    if (lowestSub) {
      startAssessment(lowestSub.assessmentId);
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      toast.info('Complete an assessment first to get retry recommendations.');
    }
  };

  const handleStudy = () => {
    if (unAttempted.length > 0) {
      startAssessment(unAttempted[0].id);
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      toast.info('You\'ve attempted all available assessments! Retry your weakest one.');
    }
  };

  const handleRoadmap = () => {
    toast.info(
      hasData
        ? `Recommended: ${analytics.avgAccuracy < 70 ? 'Focus on fundamentals with Easy/Medium assessments' : 'Challenge yourself with Hard assessments next week'}`
        : 'Complete your first assessment to generate a personalized roadmap.'
    );
  };

  const handleRecoveryPlan = () => {
    if (lowestSub) {
      handleRetry();
    } else {
      toast.info('No weak areas detected yet. Take an assessment to get started.');
    }
  };

  return (
    <div className="mt-32 space-y-10">
      <div className="px-2 space-y-2">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-amber-500" />
           </div>
           <h2 className="text-2xl font-black uppercase tracking-tight text-white">Hyper-Personalized Roadmap</h2>
        </div>
        <p className="text-sm font-medium text-muted-foreground tracking-tight">
          {hasData
            ? `Intelligence derived from your ${submissions.length} assessment${submissions.length > 1 ? 's' : ''} and performance gaps.`
            : 'Complete assessments to unlock personalized recommendations.'
          }
        </p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* ── Core Weakness ─────────────────────────────────────────── */}
        <div className="col-span-12 lg:col-span-4">
           <BentoCard className="bg-rose-500/5 border-rose-500/10 h-full p-8 flex flex-col gap-8 relative overflow-hidden">
              <div className="absolute top-[-10%] right-[-10%] opacity-10">
                 <TrendingDown className="w-40 h-40 text-rose-500" />
              </div>
              <div className="space-y-4 relative z-10">
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500">
                   {hasData ? 'Critical Gaps' : 'Awaiting Data'}
                 </span>
                 <h3 className="text-2xl font-black text-white leading-tight">
                   {hasData ? weakArea : 'Take Your First Assessment'}
                 </h3>
                 <p className="text-xs font-semibold text-muted-foreground leading-relaxed">
                   {hasData
                     ? `Your weakest performance was ${weakAccuracy}% accuracy on ${lowestAssessment?.title || 'an assessment'}. Focus here to improve.`
                     : 'Once you complete assessments, we\'ll identify your critical gaps and create a targeted recovery plan.'
                   }
                 </p>
              </div>

              <div className="mt-auto space-y-4 relative z-10">
                 {hasData && (
                   <div className="flex items-center gap-3 p-4 rounded-2xl bg-black/40 border border-white/5">
                     <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center">
                       <Zap className="w-4 h-4 text-rose-500" />
                     </div>
                     <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                       Priority: Retry {lowestAssessment?.companyTags[0] || 'Weak'} Section
                     </span>
                   </div>
                 )}
                 <Button
                   onClick={handleRecoveryPlan}
                   variant="primary"
                   className="w-full bg-rose-600 hover:bg-rose-500 shadow-rose-500/20"
                 >
                   {hasData ? 'Launch Recovery Plan' : 'Start First Assessment'}
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
                 <h4 className="text-lg font-black text-white uppercase tracking-tight">
                   {lowestAssessment ? lowestAssessment.title : 'Complete an assessment'}
                 </h4>
                 <p className="text-[11px] font-medium text-muted-foreground">
                   {lowestSub
                     ? `Your last attempt scored ${lowestSub.accuracy.toFixed(0)}%. Beat your previous score.`
                     : 'Take an assessment to unlock retry targets.'
                   }
                 </p>
              </div>
              <button
                onClick={handleRetry}
                className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-primary group-hover:gap-5 transition-all"
              >
                 Begin Retry <ChevronRight className="w-4 h-4" />
              </button>
           </div>

           <div className="p-8 rounded-[40px] bg-card/40 border border-white/5 backdrop-blur-3xl space-y-8 group hover:border-emerald-500/40 transition-all">
              <div className="flex items-center justify-between">
                 <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-emerald-500" />
                 </div>
                 <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground bg-white/5 px-3 py-1 rounded-full">
                   {unAttempted.length > 0 ? 'New Challenge' : 'All Done'}
                 </span>
              </div>
              <div className="space-y-2">
                 <h4 className="text-lg font-black text-white uppercase tracking-tight">
                   {unAttempted.length > 0 ? unAttempted[0].title : 'All Assessments Completed'}
                 </h4>
                 <p className="text-[11px] font-medium text-muted-foreground">
                   {unAttempted.length > 0
                     ? `${unAttempted[0].description} • ${unAttempted[0].totalQuestions} questions`
                     : 'Great work! Retry your weakest assessments to improve.'
                   }
                 </p>
              </div>
              <button
                onClick={handleStudy}
                className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 group-hover:gap-5 transition-all"
              >
                 {unAttempted.length > 0 ? 'Start Assessment' : 'Retry Weakest'} <ChevronRight className="w-4 h-4" />
              </button>
           </div>

           <div className="col-span-1 md:col-span-2 p-8 rounded-[40px] bg-gradient-to-r from-primary/10 to-indigo-500/10 border border-white/5 flex items-center justify-between group">
              <div className="flex items-center gap-8">
                 <div className="w-16 h-16 rounded-[24px] bg-white/5 border border-white/10 flex items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-primary" />
                 </div>
                 <div>
                    <h4 className="text-xl font-black text-white uppercase tracking-tight">Next-Week Simulation Roadmap</h4>
                    <p className="text-sm font-medium text-muted-foreground">
                      {hasData
                        ? `Based on ${analytics.avgAccuracy.toFixed(0)}% avg accuracy. ${analytics.avgAccuracy < 70 ? 'Focus on fundamentals.' : 'Ready for advanced challenges.'}`
                        : 'Complete assessments to generate your adaptive schedule.'
                      }
                    </p>
                 </div>
              </div>
              <Button onClick={handleRoadmap} variant="secondary" size="lg">View Roadmap</Button>
           </div>
        </div>
      </div>
    </div>
  );
}
