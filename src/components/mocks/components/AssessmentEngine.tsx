'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Brain, Code2, Clock, Zap, BarChart3, ChevronRight, ChevronLeft, AlertCircle, Building2, Folder } from 'lucide-react';
import { useMockStore } from '@/store/useMockStore';
import { toast } from 'sonner';

const COMPANY_COLORS: Record<string, string> = {
  TCS: 'from-blue-500 to-indigo-600',
  Amazon: 'from-orange-400 to-amber-600',
  Accenture: 'from-purple-500 to-violet-600',
  Cognizant: 'from-cyan-500 to-teal-600',
  Infosys: 'from-emerald-500 to-green-600',
  Wipro: 'from-rose-500 to-pink-600',
  Capgemini: 'from-sky-500 to-blue-600',
  Deloitte: 'from-amber-500 to-yellow-600',
};

function getColor(tags: string[]) {
  for (const tag of tags) {
    if (COMPANY_COLORS[tag]) return COMPANY_COLORS[tag];
  }
  return 'from-primary to-indigo-600';
}

function getCompanyColor(company: string) {
  return COMPANY_COLORS[company] || 'from-primary to-indigo-600';
}

const DIFF_STYLES: Record<string, string> = {
  Easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Hard: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
};

export function AssessmentEngine() {
  const router = useRouter();
  const { assessments, fetchAssessments, startAssessment, submissions, analytics, restoreAssessment } = useMockStore();
  const [activeTab, setActiveTab] = useState<'exams' | 'reports'>('exams');
  
  // Hierarchical view state
  const [hubView, setHubView] = useState<'companies' | 'assignments'>('companies');
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  const [recoveryData, setRecoveryData] = useState<any>(null);

  useEffect(() => {
    fetchAssessments();
    try {
      const data = localStorage.getItem('placeprep-assessment-recovery');
      if (data) setRecoveryData(JSON.parse(data));
    } catch {}
  }, [fetchAssessments]);

  const handleStartAssessment = (examId: string) => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        toast.info('Fullscreen recommended for the best experience.');
      });
    }
    router.push(`/mockhub/assessment/${examId}`);
  };

  // Derive unique companies from assessments
  const companies = Array.from(new Set(
    assessments.flatMap(a => Array.isArray(a.companyTags) ? a.companyTags : ((a as any).company_tags || []))
  )).sort();

  const companyAssessments = assessments.filter(a => {
    const tags = Array.isArray(a.companyTags) ? a.companyTags : ((a as any).company_tags || []);
    return tags.includes(selectedCompany);
  });

  // Compute topic stats
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
            topics[topic].correct += sub.accuracy / 100;
          });
        });
        return Object.entries(topics).map(([label, data]) => ({
          label,
          value: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
        }));
      })()
    : [
        { label: 'Quantitative', value: 0 },
        { label: 'Coding / DSA', value: 0 },
        { label: 'Verbal', value: 0 },
        { label: 'Logical', value: 0 },
      ];

  return (
    <div className="space-y-8 mt-12">

      {/* Section Header + Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Target className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-black tracking-tight text-white">Assessment Engine</h2>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/8">
          {(['exams', 'reports'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-200 ${
                activeTab === tab
                  ? 'text-white'
                  : 'text-muted-foreground hover:text-white/80'
              }`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="engine-tab-pill"
                  className="absolute inset-0 bg-primary rounded-lg"
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
              <span className="relative z-10">
                {tab === 'exams' ? 'Exam Hall' : `Reports (${submissions.length})`}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Recovery Banner */}
      <AnimatePresence>
        {recoveryData && activeTab === 'exams' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-4 p-4 rounded-2xl bg-amber-500/8 border border-amber-500/20"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-amber-400 uppercase tracking-widest">Session Recovery Available</p>
              <p className="text-[10px] text-amber-400/70 font-medium mt-0.5">Unfinished assessment detected — resume or discard.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { localStorage.removeItem('placeprep-assessment-recovery'); setRecoveryData(null); }}
                className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                Discard
              </button>
              <button
                onClick={() => {
                  restoreAssessment(recoveryData);
                  if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
                  setRecoveryData(null);
                }}
                className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-amber-500 text-black hover:bg-amber-400 transition-colors"
              >
                Resume
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {activeTab === 'exams' ? (
          <motion.div
            key="exams"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-5"
          >
            {/* Main Content Area (Companies or Assignments) */}
            <div className="lg:col-span-2 space-y-4">
              
              <AnimatePresence mode="wait">
                {/* TIER 1: COMPANIES */}
                {hubView === 'companies' && (
                  <motion.div
                    key="companies"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Building2 className="w-5 h-5 text-primary" />
                      <h3 className="font-bold text-lg text-white">Select Company</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {companies.map((company, i) => {
                        const count = assessments.filter(a => {
                          const tags = Array.isArray(a.companyTags) ? a.companyTags : ((a as any).company_tags || []);
                          return tags.includes(company);
                        }).length;
                        return (
                          <motion.div
                            key={company}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06, ease: [0.32, 0.72, 0, 1] }}
                            onClick={() => { setSelectedCompany(company); setHubView('assignments'); }}
                            className="group relative flex items-center p-5 rounded-[20px] border border-white/8 bg-card/40 backdrop-blur-xl cursor-pointer hover:border-white/20 transition-all duration-300 overflow-hidden"
                          >
                            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${getCompanyColor(company)} opacity-[0.05] blur-2xl group-hover:opacity-[0.1] transition-opacity`} />
                            
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getCompanyColor(company)} flex items-center justify-center shadow-lg shrink-0 mr-4`}>
                              <Building2 className="w-6 h-6 text-white" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-black text-white truncate">{company}</h3>
                              <p className="text-[10px] text-muted-foreground/70 font-bold uppercase tracking-widest mt-0.5">{count} Assignments Available</p>
                            </div>
                            
                            <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-white transition-colors" />
                          </motion.div>
                        );
                      })}
                      {companies.length === 0 && (
                        <div className="col-span-full py-20 text-center text-muted-foreground italic border border-dashed border-white/8 rounded-[20px]">
                          No companies found. Admins can create companies from the dashboard.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* TIER 2: ASSIGNMENTS */}
                {hubView === 'assignments' && (
                  <motion.div
                    key="assignments"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-4 mb-2">
                      <button 
                        onClick={() => setHubView('companies')} 
                        className="p-2 hover:bg-white/5 rounded-xl transition-colors flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-white"
                      >
                        <ChevronLeft className="w-4 h-4" /> Back to Companies
                      </button>
                    </div>

                    <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getCompanyColor(selectedCompany!)} flex items-center justify-center shadow-lg`}>
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-white">{selectedCompany}</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Available Assignments</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {companyAssessments.map((exam, i) => {
                        const tags = Array.isArray(exam.companyTags) ? exam.companyTags : ((exam as any).company_tags || []);
                        return (
                          <motion.div
                            key={exam.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06, ease: [0.32, 0.72, 0, 1] }}
                            className="group relative flex flex-col rounded-[20px] border border-white/8 bg-card/40 backdrop-blur-xl p-5 overflow-hidden hover:border-white/15 transition-all duration-200"
                          >
                            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${getColor(tags)} opacity-[0.07] blur-2xl pointer-events-none`} />

                            <div className="flex items-start justify-between mb-4 relative z-10">
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getColor(tags)} flex items-center justify-center shadow-lg`}>
                                  {exam.difficulty === 'Hard'
                                    ? <Code2 className="w-4 h-4 text-white" />
                                    : <Folder className="w-4 h-4 text-white" />
                                  }
                                </div>
                                <div>
                                  <h3 className="text-sm font-black text-white tracking-tight leading-tight">Assignment {i + 1}</h3>
                                  <p className="text-[10px] text-muted-foreground/70 font-medium leading-relaxed truncate max-w-[120px]">{exam.title}</p>
                                </div>
                              </div>
                              <span className={`px-2.5 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest ${DIFF_STYLES[exam.difficulty] || DIFF_STYLES.Medium}`}>
                                {exam.difficulty}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-4 relative z-10">
                              <span className="flex items-center gap-1">
                                <Zap className="w-3 h-3 text-amber-500/60" />
                                {exam.totalQuestions || 0} questions
                              </span>
                              <span className="w-1 h-1 rounded-full bg-white/10" />
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {exam.durationMinutes || 60}m
                              </span>
                            </div>

                            <button
                              onClick={() => handleStartAssessment(exam.id)}
                              className="relative z-10 w-full py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground hover:bg-primary hover:text-white hover:border-primary group/btn transition-all duration-200 flex items-center justify-center gap-2 mt-auto"
                            >
                              Begin Assessment
                              <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                            </button>
                          </motion.div>
                        );
                      })}
                      {companyAssessments.length === 0 && (
                        <div className="col-span-full py-10 text-center text-muted-foreground italic border border-dashed border-white/8 rounded-[20px]">
                          No assignments found for {selectedCompany}.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* Topic Performance Sidebar */}
            <div className="space-y-4">
              <div className="p-5 rounded-[20px] bg-card/40 border border-white/8 backdrop-blur-xl space-y-5">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Topic Accuracy</p>
                </div>

                <div className="space-y-4">
                  {topicStats.slice(0, 6).map((topic) => (
                    <div key={topic.label} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-muted-foreground/70 truncate pr-2">{topic.label}</span>
                        <span className={`text-[10px] font-black tabular-nums ${
                          topic.value >= 70 ? 'text-emerald-400' : topic.value >= 50 ? 'text-amber-400' : 'text-rose-400'
                        }`}>{topic.value}%</span>
                      </div>
                      <div className="h-1 w-full bg-white/[0.04] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${topic.value}%` }}
                          transition={{ duration: 1, ease: [0.32, 0.72, 0, 1], delay: 0.2 }}
                          className={`h-full rounded-full ${
                            topic.value >= 70 ? 'bg-emerald-500' : topic.value >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {submissions.length === 0 && (
                  <p className="text-[9px] text-muted-foreground/40 font-medium text-center py-2">
                    Complete assessments to see your topic accuracy
                  </p>
                )}
              </div>

              {/* Adaptive Goal */}
              <div className="p-5 rounded-[20px] bg-primary/[0.06] border border-primary/15 space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">Adaptive Goal</p>
                </div>
                <p className="text-xs text-muted-foreground/70 font-medium leading-relaxed">
                  {submissions.length > 0
                    ? analytics.avgAccuracy < 70
                      ? `Your accuracy is ${analytics.avgAccuracy.toFixed(0)}%. Focus on Easy/Medium assessments to build fundamentals.`
                      : `Strong at ${analytics.avgAccuracy.toFixed(0)}%. Push harder with Hard-difficulty assessments.`
                    : 'Take your first assessment to generate personalized adaptive goals and topic breakdowns.'
                  }
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Past Reports */
          <motion.div
            key="reports"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {submissions.length === 0 ? (
              <div className="py-20 text-center rounded-[20px] border border-dashed border-white/8">
                <BarChart3 className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">No reports yet</p>
              </div>
            ) : (
              [...submissions].reverse().map((sub, i) => {
                const assessment = assessments.find(a => a.id === sub.assessmentId);
                const accColor = sub.accuracy >= 80 ? 'text-emerald-400' : sub.accuracy >= 60 ? 'text-amber-400' : 'text-rose-400';
                return (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-4 p-4 rounded-[16px] bg-card/40 border border-white/8 hover:bg-white/[0.03] transition-colors"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      sub.accuracy >= 80 ? 'bg-emerald-500/10' : sub.accuracy >= 60 ? 'bg-amber-500/10' : 'bg-rose-500/10'
                    }`}>
                      <Target className={`w-4 h-4 ${accColor}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-white truncate">{assessment?.title || 'Assessment'}</p>
                      <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest mt-0.5">
                        {new Date(sub.completedAt).toLocaleDateString()} · {Math.round(sub.timeSpentSeconds / 60)}m
                      </p>
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-right">
                        <p className={`text-xl font-black tabular-nums ${accColor}`}>{sub.accuracy.toFixed(0)}%</p>
                        <p className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest">accuracy</p>
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-black text-white tabular-nums">{sub.score}/{sub.maxScore}</p>
                        <p className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest">score</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
