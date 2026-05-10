'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Clock, ShieldCheck, 
  AlertTriangle, Send, X, LayoutGrid, Timer
} from 'lucide-react';
import { useMockStore } from '@/store/useMockStore';
import { Button } from '@/components/ui/Button'; // Assuming existing Button component
import { toast } from 'sonner';

export function AssessmentPortal() {
  const { currentAssessment, isAssessmentActive, submitAssessment } = useMockStore();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [warnings, setWarnings] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (currentAssessment) {
      setTimeLeft(currentAssessment.durationMinutes * 60);
    }
  }, [currentAssessment]);

  useEffect(() => {
    if (timeLeft > 0 && isAssessmentActive) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && isAssessmentActive) {
      handleSubmit();
    }
  }, [timeLeft, isAssessmentActive]);

  // Anti-cheat: Fullscreen enforcement and visibility check
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isAssessmentActive) {
        setWarnings(prev => prev + 1);
        toast.warning('Warning: Navigating away from the assessment is logged.', {
          description: 'Repeated violations may lead to disqualification.'
        });
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isAssessmentActive) {
        toast.error('Assessment must be completed in fullscreen.');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isAssessmentActive]);

  const handleSubmit = async () => {
    if (!currentAssessment) return;
    
    const score = calculateScore(); // Dummy logic for now
    await submitAssessment({
      assessmentId: currentAssessment.id,
      userId: 'user-id', // Get from auth
      score,
      maxScore: currentAssessment.totalQuestions * 10,
      accuracy: (score / (currentAssessment.totalQuestions * 10)) * 100,
      timeSpentSeconds: (currentAssessment.durationMinutes * 60) - timeLeft,
      telemetry: {
        hesitationPoints: 0,
        speed: currentAssessment.totalQuestions / ((currentAssessment.durationMinutes * 60 - timeLeft) / 60),
        antiCheatWarnings: warnings
      }
    });
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const calculateScore = () => {
    // Basic scoring logic
    return Object.keys(answers).length * 10;
  };

  if (!currentAssessment || !isMounted) return null;

  const currentQuestion = currentAssessment.questions?.[currentQuestionIndex];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#050505] z-[200] flex flex-col font-sans selection:bg-primary/30"
    >
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="h-24 border-b border-white/5 px-12 flex items-center justify-between bg-black/40 backdrop-blur-3xl relative z-10">
        <div className="flex items-center gap-8">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-14 h-14 rounded-[20px] bg-primary/20 border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/20"
          >
            <ShieldCheck className="w-7 h-7 text-primary" />
          </motion.div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white uppercase flex items-center gap-3">
              {currentAssessment.title}
              <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-black text-primary">LIVE</span>
            </h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Hiring Simulator v2.0 • Secure Session</p>
          </div>
        </div>

        <div className="flex items-center gap-12">
          <motion.div 
            layout
            className="flex items-center gap-4 bg-white/5 px-8 py-4 rounded-[24px] border border-white/10 shadow-inner"
          >
            <Clock className={`w-5 h-5 ${timeLeft < 300 ? 'text-rose-500 animate-pulse' : 'text-primary'}`} />
            <span className={`text-2xl font-black tabular-nums ${timeLeft < 300 ? 'text-rose-500' : 'text-white'}`}>
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </span>
          </motion.div>
          <Button 
            onClick={handleSubmit}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white shadow-[0_20px_50px_rgba(var(--primary-rgb),0.3)]"
          >
            Submit Simulation
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-16 custom-scrollbar bg-gradient-to-b from-transparent to-black/20">
          <div className="max-w-4xl mx-auto space-y-16">
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-12"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="px-5 py-2 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      Module: {currentQuestion?.type || 'Core'}
                    </span>
                    <span className="px-5 py-2 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black text-primary uppercase tracking-widest">
                      Difficulty: {currentQuestion?.difficulty || 'Medium'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {warnings > 0 && (
                      <motion.span 
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="flex items-center gap-2 text-rose-500 text-[10px] font-black uppercase tracking-widest bg-rose-500/10 px-4 py-2 rounded-full border border-rose-500/20"
                      >
                        <AlertTriangle className="w-4 h-4" /> {warnings} Telemetry Alerts
                      </motion.span>
                    )}
                  </div>
                </div>

                <div className="space-y-10">
                  <div className="space-y-4">
                    <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px]">Challenge {currentQuestionIndex + 1}</span>
                    <h2 className="text-4xl font-black text-white leading-tight tracking-tight">
                      {currentQuestion?.title}
                    </h2>
                  </div>
                  
                  <div className="p-10 rounded-[40px] bg-white/[0.02] border border-white/5 backdrop-blur-sm shadow-inner">
                    <div className="prose prose-invert max-w-none text-muted-foreground leading-loose text-lg font-medium">
                      {currentQuestion?.content}
                    </div>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 gap-5 mt-12">
                    {[1, 2, 3, 4].map(i => (
                      <motion.button
                        key={i}
                        whileHover={{ x: 10, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                        onClick={() => setAnswers({...answers, [currentQuestion?.id as string]: i})}
                        className={`p-8 rounded-[32px] border text-left transition-all relative group overflow-hidden ${
                          answers[currentQuestion?.id as string] === i 
                            ? 'bg-primary/10 border-primary text-white shadow-2xl shadow-primary/10' 
                            : 'bg-white/5 border-white/5 text-muted-foreground hover:border-white/10'
                        }`}
                      >
                        {answers[currentQuestion?.id as string] === i && (
                          <motion.div 
                            layoutId="active-option"
                            className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none"
                          />
                        )}
                        <div className="flex items-center gap-6 relative z-10">
                          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-sm font-black transition-all ${
                            answers[currentQuestion?.id as string] === i ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'border-white/10 group-hover:border-white/20'
                          }`}>
                            {String.fromCharCode(64 + i)}
                          </div>
                          <span className="font-bold text-lg tracking-tight">Sample Option for Simulation {i}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Question Palette Sidebar */}
        <aside className="w-96 border-l border-white/5 bg-black/40 backdrop-blur-3xl p-10 flex flex-col gap-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground">Execution Flow</h3>
              <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest mt-1">Jump to any challenge</p>
            </div>
            <LayoutGrid className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className="grid grid-cols-4 gap-4 overflow-y-auto custom-scrollbar pr-2">
            {Array.from({ length: currentAssessment.totalQuestions }).map((_, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setCurrentQuestionIndex(i)}
                className={`aspect-square rounded-2xl flex items-center justify-center text-xs font-black transition-all relative overflow-hidden ${
                  currentQuestionIndex === i 
                    ? 'bg-primary text-white shadow-xl shadow-primary/30 ring-2 ring-primary ring-offset-4 ring-offset-black' 
                    : answers[currentAssessment.questions?.[i]?.id as string]
                    ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                    : 'bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10'
                }`}
              >
                {i + 1}
              </motion.button>
            ))}
          </div>

          <div className="mt-auto p-8 rounded-[40px] bg-white/5 border border-white/10 space-y-6">
            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-muted-foreground">
              <span>Simulation Progress</span>
              <span className="text-primary">{Math.round((Object.keys(answers).length / currentAssessment.totalQuestions) * 100)}%</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${(Object.keys(answers).length / currentAssessment.totalQuestions) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <div className="flex items-center gap-4 text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">
               <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /> Current</div>
               <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Answered</div>
               <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-white/20" /> Pending</div>
            </div>
          </div>
        </aside>
      </div>

      {/* Footer Controls */}
      <footer className="h-24 border-t border-white/5 px-16 flex items-center justify-between bg-black/60 backdrop-blur-xl relative z-10">
        <Button
          variant="secondary"
          size="lg"
          disabled={currentQuestionIndex === 0}
          onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
          className="flex items-center gap-3"
        >
          <ChevronLeft className="w-5 h-5" /> Previous Challenge
        </Button>

        <div className="flex items-center gap-10">
           <button className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground hover:text-white hover:tracking-[0.5em] transition-all duration-300">
              Flag for High Priority Review
           </button>
        </div>

        <Button
          size="lg"
          disabled={currentQuestionIndex === (currentAssessment.totalQuestions || 0) - 1}
          onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
          className="flex items-center gap-3 bg-white/10 hover:bg-white/20 text-white"
        >
          Next Challenge <ChevronRight className="w-5 h-5" />
        </Button>
      </footer>
    </motion.div>
  );
}
