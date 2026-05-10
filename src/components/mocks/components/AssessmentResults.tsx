'use client';

import { motion } from 'framer-motion';
import { 
  Trophy, Target, Clock, Zap, CheckCircle2, 
  AlertCircle, BarChart3, ChevronRight, Share2, Download, X 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Submission } from '@/lib/types';

interface AssessmentResultsProps {
  submission: Submission;
  onClose: () => void;
}

export function AssessmentResults({ submission, onClose }: AssessmentResultsProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[500] bg-[#050505]/80 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8 overflow-y-auto custom-scrollbar"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 40 }}
        className="max-w-6xl w-full bg-[#0a0a0a] border border-white/10 rounded-[40px] md:rounded-[60px] shadow-[0_40px_120px_rgba(0,0,0,0.8)] overflow-hidden relative my-auto"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-30 pointer-events-none" />
        
        {/* Header */}
        <div className="p-8 md:p-14 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-[28px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-2xl shadow-emerald-500/20">
              <Trophy className="w-8 h-8 md:w-10 md:h-10 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase leading-none">Simulation Complete</h2>
              <p className="text-[10px] md:text-xs font-black text-emerald-500/60 uppercase tracking-[0.4em] mt-3">Telemetry Analysis Processed Successfully</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="secondary" size="md" className="gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10">
                <Share2 className="w-4 h-4" /> Share
             </Button>
             <Button variant="secondary" size="md" className="gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10">
                <Download className="w-4 h-4" /> PDF Report
             </Button>
             <button onClick={onClose} className="p-3 rounded-full bg-white/5 border border-white/10 text-muted-foreground hover:text-white transition-all ml-2">
                <X className="w-5 h-5" />
             </button>
          </div>
        </div>

        <div className="p-12 grid grid-cols-12 gap-12 relative z-10">
          {/* Main Stats */}
          <div className="col-span-12 lg:col-span-8 space-y-12">
            <div className="grid grid-cols-3 gap-6">
              {[
                { label: 'Total Score', value: `${submission.score}/${submission.maxScore}`, icon: Target, color: 'text-primary' },
                { label: 'Accuracy', value: `${Math.round(submission.accuracy)}%`, icon: CheckCircle2, color: 'text-emerald-500' },
                { label: 'Velocity', value: `${submission.telemetry.speed.toFixed(1)} Q/m`, icon: Zap, color: 'text-amber-500' },
              ].map((stat) => (
                <div key={stat.label} className="p-5 md:p-7 rounded-[32px] bg-white/5 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                  </div>
                  <p className="text-2xl font-black text-white tabular-nums tracking-tighter">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-3">
                <BarChart3 className="w-4 h-4" /> AI Performance Debrief
              </h3>
              <div className="p-10 rounded-[40px] bg-black/40 border border-white/5 shadow-inner">
                <div className="prose prose-invert max-w-none space-y-6">
                  <p className="text-lg font-medium leading-relaxed text-foreground/80">
                    {submission.aiFeedback?.summary || "Your performance indicates strong foundational knowledge, but high hesitation in the technical section impacted your velocity."}
                  </p>
                  <div className="grid grid-cols-2 gap-8 mt-8">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Strengths</h4>
                      <ul className="space-y-2">
                        {(submission.aiFeedback?.strengths || ['Quantitative Precision', 'Pattern Recognition']).map(s => (
                          <li key={s} className="flex items-center gap-3 text-xs font-bold text-white">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Growth Areas</h4>
                      <ul className="space-y-2">
                        {(submission.aiFeedback?.weaknesses || ['Coding Velocity', 'Time Management']).map(w => (
                          <li key={w} className="flex items-center gap-3 text-xs font-bold text-white">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Insights */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            <div className="p-8 rounded-[40px] bg-primary/10 border border-primary/20 space-y-6">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-primary" />
                <h4 className="text-sm font-black uppercase tracking-widest text-primary">Placement IQ</h4>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-6xl font-black text-white tracking-tighter">
                   {Math.round(submission.accuracy * 0.8 + (submission.aiFeedback?.communicationScore || 70) * 0.2)}
                </span>
                <span className="text-sm font-bold text-primary mb-2">/100</span>
              </div>
              <p className="text-[10px] font-semibold text-primary/70 leading-relaxed uppercase tracking-wider">
                Predicted Hiring Probability: <span className="text-white">84.2%</span> for Tier-1 Companies.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-2">Telemetry Warnings</h4>
              <div className="p-5 rounded-[24px] bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className={`w-4 h-4 ${submission.telemetry.antiCheatWarnings > 0 ? 'text-rose-500' : 'text-emerald-500'}`} />
                  <span className="text-[10px] font-bold text-white">Focus Disruptions</span>
                </div>
                <span className="text-[10px] font-black text-muted-foreground">{submission.telemetry.antiCheatWarnings}</span>
              </div>
              <div className="p-5 rounded-[24px] bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px] font-bold text-white">Hesitation Points</span>
                </div>
                <span className="text-[10px] font-black text-muted-foreground">{submission.telemetry.hesitationPoints}</span>
              </div>
            </div>

            <Button 
              onClick={onClose} 
              className="w-full py-5 rounded-[20px] bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.4em] shadow-[0_20px_40px_rgba(var(--primary-rgb),0.2)] mt-auto"
            >
               Back to Hub
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
