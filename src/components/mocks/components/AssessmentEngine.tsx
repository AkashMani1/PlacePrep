'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Brain, Code2, ChevronRight, AlertCircle, BarChart, Zap, Plus } from 'lucide-react';
import { BentoCard } from '@/components/ui/Bento';
import { Button } from '@/components/ui/Button';
import { useMockStore } from '@/store/useMockStore';
import { toast } from 'sonner';

export function AssessmentEngine() {
  const { assessments, startAssessment, submissions, analytics, restoreAssessment } = useMockStore();
  const [activeTab, setActiveTab] = useState<'exams' | 'reports'>('exams');
  const [recoveryData, setRecoveryData] = useState<any>(null);

  useEffect(() => {
    try {
      const data = localStorage.getItem('placeprep-assessment-recovery');
      if (data) setRecoveryData(JSON.parse(data));
    } catch {}
  }, []);

  const COLORS: Record<string, string> = {
    TCS: 'from-blue-500 to-indigo-600',
    Amazon: 'from-orange-400 to-amber-600',
    Accenture: 'from-purple-500 to-violet-600',
    Cognizant: 'from-cyan-500 to-teal-600',
    Infosys: 'from-emerald-500 to-green-600',
    Wipro: 'from-rose-500 to-pink-600',
    Capgemini: 'from-sky-500 to-blue-600',
    Deloitte: 'from-amber-500 to-yellow-600',
  };

  const getColor = (tags: string[]) => {
    for (const tag of tags) {
      if (COLORS[tag]) return COLORS[tag];
    }
    return 'from-primary to-indigo-600';
  };

  // Compute real topic accuracy from submissions
  const topicStats = submissions.length > 0
    ? (() => {
        const topics: Record<string, { correct: number; total: number }> = {};
        submissions.forEach(sub => {
          const assessment = assessments.find(a => a.id === sub.assessmentId);
          if (!assessment?.questions) return;
          assessment.questions.forEach(q => {
            const topic = q.topic || q.type;
            if (!topics[topic]) topics[topic] = { correct: 0, total: 0 };
            topics[topic].total++;
            if (sub.telemetry) {
              // Approximate: if overall accuracy is known
              topics[topic].correct += sub.accuracy / 100;
            }
          });
        });
        return Object.entries(topics).map(([label, data]) => ({
          label,
          value: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
          color: label.includes('Quant') ? 'text-blue-500' : label.includes('DSA') || label.includes('coding') ? 'text-primary' : label.includes('Verbal') ? 'text-emerald-500' : 'text-amber-500',
        }));
      })()
    : [
        { label: 'Quantitative', value: 0, color: 'text-blue-500' },
        { label: 'Coding / DSA', value: 0, color: 'text-primary' },
        { label: 'Verbal', value: 0, color: 'text-emerald-500' },
        { label: 'Logical', value: 0, color: 'text-amber-500' },
      ];

  const handleStartAssessment = (examId: string) => {
    startAssessment(examId);
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        toast.info('Fullscreen recommended for the best experience.');
      });
    }
  };

  return (
    <div className="mt-20 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">Assessment Engine</h2>
          </div>
          <p className="text-sm font-medium text-muted-foreground tracking-tight max-w-xl">
            Simulate real hiring assessments with fullscreen immersion and sectional timing.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-black/40 p-2 rounded-[24px] border border-white/5 backdrop-blur-xl">
          <button
            onClick={() => setActiveTab('exams')}
            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
              activeTab === 'exams' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Exam Hall
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
              activeTab === 'reports' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Past Reports ({submissions.length})
          </button>
        </div>
      </div>

      {recoveryData && activeTab === 'exams' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 rounded-[24px] bg-amber-500/10 border border-amber-500/20 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest">Ongoing Assessment Detected</h3>
              <p className="text-[10px] font-medium text-amber-500/80">You have an unfinished assessment. Would you like to resume?</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => {
              localStorage.removeItem('placeprep-assessment-recovery');
              setRecoveryData(null);
            }} variant="secondary" className="text-rose-500 hover:text-rose-400">Discard</Button>
            <Button onClick={() => {
              restoreAssessment(recoveryData);
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
              }
              setRecoveryData(null);
            }} className="bg-amber-500 text-black hover:bg-amber-400">Resume Now</Button>
          </div>
        </motion.div>
      )}

      {activeTab === 'exams' ? (
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {assessments.map((exam, i) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="group relative rounded-[40px] border border-white/5 bg-card/40 backdrop-blur-3xl p-8 overflow-hidden shadow-2xl transition-all hover:border-primary/40"
              >
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${getColor(exam.companyTags)} opacity-10 blur-[50px] group-hover:opacity-20 transition-opacity`} />

                <div className="flex flex-col h-full gap-6 relative z-10">
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getColor(exam.companyTags)} flex items-center justify-center shadow-lg`}>
                      {exam.difficulty === 'Hard' ? <Code2 className="w-6 h-6 text-white" /> : <Brain className="w-6 h-6 text-white" />}
                    </div>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/10">
                      {exam.category}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-xl font-black tracking-tight text-foreground">{exam.title}</h3>
                    <p className="text-[10px] font-medium text-muted-foreground leading-relaxed">{exam.description}</p>
                    <div className="flex items-center gap-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-2">
                      <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-yellow-500" /> {exam.totalQuestions} Qs</span>
                      <span className="flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5 text-primary" /> {exam.durationMinutes}m</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartAssessment(exam.id)}
                    className="mt-auto w-full py-5 rounded-2xl bg-white/5 border border-white/10 text-foreground text-[11px] font-black uppercase tracking-[0.3em] hover:bg-primary hover:text-white hover:border-primary transition-all shadow-xl group/btn flex items-center justify-center gap-3"
                  >
                    Enter Simulation
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Telemetry */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <BentoCard className="bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent border-white/5 shadow-2xl h-full">
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <BarChart className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-foreground">Assessment IQ</h4>
                    <p className="text-[10px] font-semibold text-muted-foreground">
                      {submissions.length > 0 ? `Based on ${submissions.length} attempts` : 'Complete assessments to see stats'}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {topicStats.map((metric) => (
                    <div key={metric.label} className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <span className="text-muted-foreground">{metric.label}</span>
                        <span className={metric.color}>{metric.value}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${metric.value}%` }}
                          transition={{ duration: 1.5, ease: [0.32, 0.72, 0, 1] }}
                          className={`h-full bg-current ${metric.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-6 rounded-[28px] bg-indigo-500/5 border border-indigo-500/10">
                  <div className="flex items-center gap-3 mb-3">
                    <Zap className="w-4 h-4 text-indigo-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">
                      {submissions.length > 0 ? 'Adaptive Goal' : 'Get Started'}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground leading-relaxed">
                    {submissions.length > 0
                      ? `Your overall accuracy is ${analytics.avgAccuracy.toFixed(0)}%. ${
                          analytics.avgAccuracy < 70
                            ? 'Focus on fundamentals and timed practice.'
                            : 'Try harder assessments to push your limits.'
                        }`
                      : 'Take your first assessment to generate personalized insights and adaptive goals.'
                    }
                  </p>
                </div>
              </div>
            </BentoCard>
          </div>
        </div>
      ) : (
        /* Past Reports Tab */
        <div className="space-y-4">
          {submissions.length === 0 ? (
            <div className="py-20 text-center rounded-[48px] border-2 border-dashed border-white/5 bg-white/[0.02]">
              <BarChart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground opacity-40">
                No assessment reports yet
              </p>
            </div>
          ) : (
            [...submissions].reverse().map((sub, i) => {
              const assessment = assessments.find(a => a.id === sub.assessmentId);
              return (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-6 rounded-[28px] bg-card/40 border border-white/5 flex items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      sub.accuracy >= 80 ? 'bg-emerald-500/20 text-emerald-500' :
                      sub.accuracy >= 60 ? 'bg-primary/20 text-primary' :
                      'bg-rose-500/20 text-rose-500'
                    }`}>
                      <Target className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-foreground">{assessment?.title || 'Assessment'}</h4>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                        {new Date(sub.completedAt).toLocaleDateString()} • {Math.round(sub.timeSpentSeconds / 60)}m
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <span className={`text-2xl font-black tabular-nums ${
                        sub.accuracy >= 80 ? 'text-emerald-500' : sub.accuracy >= 60 ? 'text-primary' : 'text-rose-500'
                      }`}>
                        {sub.accuracy.toFixed(0)}%
                      </span>
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Accuracy</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black tabular-nums text-foreground">{sub.score}/{sub.maxScore}</span>
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Score</p>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
