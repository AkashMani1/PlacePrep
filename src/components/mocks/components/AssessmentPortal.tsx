'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Clock, ShieldCheck,
  AlertTriangle, X, LayoutGrid, Flag, CheckCircle2
} from 'lucide-react';
import { useMockStore } from '@/store/useMockStore';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export function AssessmentPortal() {
  const { user } = useAuth();
  const {
    currentAssessment, isAssessmentActive, submitAssessment,
    assessmentAnswers, flaggedQuestions, setAnswer, toggleFlag,
    isSubmittingAssessment,
  } = useMockStore();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [warnings, setWarnings] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  // ── Stable timer with useRef (fixes C7) ─────────────────────────────
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const durationRef = useRef<number>(0);

  useEffect(() => { setIsMounted(true); }, []);

  // Initialize timer once when assessment starts
  useEffect(() => {
    if (!currentAssessment || !isAssessmentActive) return;

    const totalSeconds = currentAssessment.durationMinutes * 60;
    durationRef.current = totalSeconds;
    startTimeRef.current = Date.now();
    setTimeLeft(totalSeconds);

    // Single stable interval
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = Math.max(0, durationRef.current - elapsed);
      setTimeLeft(remaining);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentAssessment?.id, isAssessmentActive]);

  // Lock body scroll when overlay is active
  useEffect(() => {
    if (isAssessmentActive) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isAssessmentActive]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeLeft === 0 && isAssessmentActive && currentAssessment) {
      handleSubmit();
    }
  }, [timeLeft]);

  // ── Anti-cheat ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAssessmentActive) return;

    const handleVisibility = () => {
      if (document.hidden) {
        setWarnings(w => w + 1);
        toast.warning('Tab switch detected and logged.', {
          description: 'Repeated violations may affect your score.',
        });
      }
    };

    const handleFullscreen = () => {
      if (!document.fullscreenElement && isAssessmentActive) {
        toast.error('Please return to fullscreen mode.');
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    document.addEventListener('fullscreenchange', handleFullscreen);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      document.removeEventListener('fullscreenchange', handleFullscreen);
    };
  }, [isAssessmentActive]);

  // ── Autosave to localStorage every 30s ──────────────────────────────
  useEffect(() => {
    if (!isAssessmentActive) return;
    const autosave = setInterval(() => {
      try {
        localStorage.setItem('placeprep-assessment-recovery', JSON.stringify({
          assessmentId: currentAssessment?.id,
          answers: assessmentAnswers,
          flagged: flaggedQuestions,
          questionIndex: currentQuestionIndex,
          startTime: startTimeRef.current,
          warnings,
        }));
      } catch {}
    }, 30000);
    return () => clearInterval(autosave);
  }, [isAssessmentActive, assessmentAnswers, flaggedQuestions, currentQuestionIndex, warnings]);

  const handleSubmit = useCallback(() => {
    if (!currentAssessment) return;

    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const userId = user?.id || 'anonymous-' + Date.now();

    if (timerRef.current) clearInterval(timerRef.current);

    submitAssessment(userId, timeSpent, warnings);

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    // Clean up recovery data
    localStorage.removeItem('placeprep-assessment-recovery');
  }, [currentAssessment, user, warnings, submitAssessment]);

  if (!currentAssessment || !isMounted) return null;

  const questions = currentAssessment.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(assessmentAnswers).length;
  const totalQ = questions.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#050505] z-[9999] flex flex-col font-sans selection:bg-primary/30"
    >
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="h-20 md:h-24 border-b border-white/5 px-4 md:px-12 flex items-center justify-between bg-black/40 backdrop-blur-3xl relative z-10">
        <div className="flex items-center gap-4 md:gap-8">
          <div className="w-10 h-10 md:w-14 md:h-14 rounded-[16px] md:rounded-[20px] bg-primary/20 border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/20">
            <ShieldCheck className="w-5 h-5 md:w-7 md:h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-sm md:text-xl font-black tracking-tight text-white uppercase flex items-center gap-3">
              {currentAssessment.title}
              <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-black text-primary">LIVE</span>
            </h1>
            <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
              {answeredCount}/{totalQ} answered • {flaggedQuestions.length} flagged
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-12">
          <div className="flex items-center gap-3 md:gap-4 bg-white/5 px-4 md:px-8 py-3 md:py-4 rounded-[16px] md:rounded-[24px] border border-white/10 shadow-inner">
            <Clock className={`w-4 h-4 md:w-5 md:h-5 ${timeLeft < 300 ? 'text-rose-500 animate-pulse' : 'text-primary'}`} />
            <span className={`text-lg md:text-2xl font-black tabular-nums ${timeLeft < 300 ? 'text-rose-500' : 'text-white'}`}>
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </span>
          </div>
          <Button
            onClick={handleSubmit}
            size="md"
            disabled={isSubmittingAssessment}
            className="bg-primary hover:bg-primary/90 text-white shadow-[0_20px_50px_rgba(var(--primary-rgb),0.3)] text-[10px] md:text-[11px] min-w-[100px]"
          >
            {isSubmittingAssessment ? (
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Wait...
              </span>
            ) : (
              'Submit'
            )}
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-16 custom-scrollbar bg-gradient-to-b from-transparent to-black/20">
          <div className="max-w-4xl mx-auto space-y-12 md:space-y-16">
            <AnimatePresence mode="wait">
              {currentQuestion ? (
                <motion.div
                  key={currentQuestionIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8 md:space-y-12"
                >
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        {currentQuestion.type}
                      </span>
                      <span className={`px-4 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${
                        currentQuestion.difficulty === 'Hard' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                        currentQuestion.difficulty === 'Medium' ? 'bg-primary/10 text-primary border-primary/20' :
                        'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      }`}>
                        {currentQuestion.difficulty}
                      </span>
                      {currentQuestion.company && (
                        <span className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black text-primary uppercase tracking-widest">
                          {currentQuestion.company}
                        </span>
                      )}
                    </div>
                    {warnings > 0 && (
                      <span className="flex items-center gap-2 text-rose-500 text-[10px] font-black uppercase tracking-widest bg-rose-500/10 px-4 py-2 rounded-full border border-rose-500/20">
                        <AlertTriangle className="w-4 h-4" /> {warnings} alerts
                      </span>
                    )}
                  </div>

                  <div className="space-y-8 md:space-y-10">
                    <div className="space-y-3">
                      <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px]">Question {currentQuestionIndex + 1}</span>
                      <h2 className="text-2xl md:text-4xl font-black text-white leading-tight tracking-tight">{currentQuestion.title}</h2>
                    </div>

                    <div className="p-6 md:p-10 rounded-[28px] md:rounded-[40px] bg-white/[0.02] border border-white/5 backdrop-blur-sm shadow-inner">
                      <div className="prose prose-invert max-w-none text-muted-foreground leading-loose text-base md:text-lg font-medium">
                        {currentQuestion.content}
                      </div>
                    </div>

                    {/* Real Options */}
                    <div className="grid grid-cols-1 gap-4 md:gap-5 mt-8 md:mt-12">
                      {(currentQuestion.options || []).map((option, i) => (
                        <motion.button
                          key={i}
                          whileHover={{ x: 8, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                          onClick={() => setAnswer(currentQuestion.id, i)}
                          className={`p-5 md:p-8 rounded-[24px] md:rounded-[32px] border text-left transition-all relative group overflow-hidden ${
                            assessmentAnswers[currentQuestion.id] === i
                              ? 'bg-primary/10 border-primary text-white shadow-2xl shadow-primary/10'
                              : 'bg-white/5 border-white/5 text-muted-foreground hover:border-white/10'
                          }`}
                        >
                          {assessmentAnswers[currentQuestion.id] === i && (
                            <motion.div
                              layoutId="active-option"
                              className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none"
                            />
                          )}
                          <div className="flex items-center gap-4 md:gap-6 relative z-10">
                            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl border flex items-center justify-center text-sm font-black transition-all shrink-0 ${
                              assessmentAnswers[currentQuestion.id] === i
                                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                                : 'border-white/10 group-hover:border-white/20'
                            }`}>
                              {String.fromCharCode(65 + i)}
                            </div>
                            <span className="font-bold text-sm md:text-lg tracking-tight">{option}</span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="py-32 text-center">
                  <p className="text-muted-foreground text-sm">No question data available for this index.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Question Palette Sidebar */}
        <aside className="hidden md:flex w-80 lg:w-96 border-l border-white/5 bg-black/40 backdrop-blur-3xl p-6 lg:p-10 flex-col gap-8 lg:gap-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground">Execution Flow</h3>
              <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest mt-1">Jump to any challenge</p>
            </div>
            <LayoutGrid className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className="grid grid-cols-4 gap-3 lg:gap-4 overflow-y-auto custom-scrollbar pr-2">
            {questions.map((q, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setCurrentQuestionIndex(i)}
                className={`aspect-square rounded-xl lg:rounded-2xl flex items-center justify-center text-xs font-black transition-all relative overflow-hidden ${
                  currentQuestionIndex === i
                    ? 'bg-primary text-white shadow-xl shadow-primary/30 ring-2 ring-primary ring-offset-2 ring-offset-black'
                    : assessmentAnswers[q.id] !== undefined
                    ? flaggedQuestions.includes(q.id)
                      ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                    : flaggedQuestions.includes(q.id)
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    : 'bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10'
                }`}
              >
                {i + 1}
              </motion.button>
            ))}
          </div>

          <div className="mt-auto p-6 lg:p-8 rounded-[28px] lg:rounded-[40px] bg-white/5 border border-white/10 space-y-5 lg:space-y-6">
            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-muted-foreground">
              <span>Progress</span>
              <span className="text-primary">{totalQ > 0 ? Math.round((answeredCount / totalQ) * 100) : 0}%</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${totalQ > 0 ? (answeredCount / totalQ) * 100 : 0}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <div className="flex items-center gap-3 text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest flex-wrap">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /> Current</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Answered</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500" /> Flagged</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-white/20" /> Pending</div>
            </div>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="h-16 md:h-24 border-t border-white/5 px-4 md:px-16 flex items-center justify-between bg-black/60 backdrop-blur-xl relative z-10">
        <Button
          variant="secondary"
          size="md"
          disabled={currentQuestionIndex === 0}
          onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" /> <span className="hidden md:inline">Previous</span>
        </Button>

        <button
          onClick={() => currentQuestion && toggleFlag(currentQuestion.id)}
          className={`flex items-center gap-2 md:gap-3 text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] transition-all duration-300 px-4 py-2 rounded-xl ${
            currentQuestion && flaggedQuestions.includes(currentQuestion.id)
              ? 'text-amber-500 bg-amber-500/10 border border-amber-500/20'
              : 'text-muted-foreground hover:text-amber-500'
          }`}
        >
          <Flag className="w-4 h-4" />
          {currentQuestion && flaggedQuestions.includes(currentQuestion.id) ? 'Flagged' : 'Flag for Review'}
        </button>

        <Button
          size="md"
          disabled={currentQuestionIndex === totalQ - 1}
          onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white"
        >
          <span className="hidden md:inline">Next</span> <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
        </Button>
      </footer>
    </motion.div>
  );
}
