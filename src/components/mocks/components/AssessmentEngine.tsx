import { motion } from 'framer-motion';
import { Target, Brain, Code2, ShieldCheck, ChevronRight, AlertCircle, BarChart, Zap, Plus } from 'lucide-react';
import { BentoCard } from '@/components/ui/Bento';
import { useApp } from '@/context/AppContext';
import { useEffect } from 'react';
import { useMockStore } from '@/store/useMockStore';

const ASSESSMENTS = [
  { id: 'tcs', title: 'TCS NQT Simulator', category: 'Campus Drive', questions: 80, time: '180m', difficulty: 'Medium', color: 'from-blue-500 to-indigo-600' },
  { id: 'amazon', title: 'Amazon OA Engine', category: 'FAANG OA', questions: 2, time: '90m', difficulty: 'Hard', color: 'from-orange-400 to-amber-600' },
  { id: 'accenture', title: 'Accenture Assessment', category: 'Campus Drive', questions: 90, time: '90m', difficulty: 'Easy', color: 'from-purple-500 to-violet-600' },
];

export function AssessmentEngine() {
  const { state } = useApp();
  const { assessments, startAssessment, fetchAssessments } = useMockStore();

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  // Use store assessments if available, else fallback to defaults
  const displayAssessments = assessments.length > 0 ? assessments : ASSESSMENTS;

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
           <div className="px-5 py-2 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20">
              Exam Hall
           </div>
           <div className="px-5 py-2 rounded-xl text-muted-foreground hover:text-foreground text-[10px] font-black uppercase tracking-[0.2em] transition-colors cursor-pointer">
              Past Reports
           </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* ── Active Simulators ────────────────────────────────────────── */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayAssessments.map((exam, i) => (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8 }}
              className="group relative rounded-[40px] border border-white/5 bg-card/40 backdrop-blur-3xl p-8 overflow-hidden shadow-2xl transition-all hover:border-primary/40"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${exam.color || 'from-primary to-indigo-600'} opacity-10 blur-[50px] group-hover:opacity-20 transition-opacity`} />
              
              <div className="flex flex-col h-full gap-6 relative z-10">
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${exam.color || 'from-primary to-indigo-600'} flex items-center justify-center shadow-lg`}>
                    {exam.title.toLowerCase().includes('coding') || exam.title.toLowerCase().includes('amazon') ? <Code2 className="w-6 h-6 text-white" /> : <Brain className="w-6 h-6 text-white" />}
                  </div>
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/10">
                    {exam.category}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-xl font-black tracking-tight text-foreground">{exam.title}</h3>
                  <div className="flex items-center gap-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-yellow-500" /> {exam.totalQuestions || (exam as any).questions} Qs</span>
                    <span className="flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5 text-primary" /> {exam.durationMinutes || (exam as any).time}</span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    if (typeof exam.id === 'string' && exam.id.length > 10) {
                      startAssessment(exam.id);
                    } else {
                      // Fallback for demo assessments
                      startAssessment('demo-id');
                    }
                    if (!document.fullscreenElement) {
                      document.documentElement.requestFullscreen();
                    }
                  }}
                  className="mt-auto w-full py-5 rounded-2xl bg-white/5 border border-white/10 text-foreground text-[11px] font-black uppercase tracking-[0.3em] hover:bg-primary hover:text-white hover:border-primary transition-all shadow-xl group/btn flex items-center justify-center gap-3"
                >
                  Enter Simulation
                  <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}

          {/* Add custom simulation placeholder */}
          <div className="rounded-[40px] border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-4 p-8 opacity-40 hover:opacity-100 hover:border-primary/40 transition-all cursor-pointer">
             <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
             </div>
             <p className="text-[11px] font-black uppercase tracking-widest text-white">Create Custom OA</p>
          </div>
        </div>

        {/* ── Telemetry & Adaptive Insights ────────────────────────────── */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
           <BentoCard className="bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent border-white/5 shadow-2xl h-full">
              <div className="space-y-8">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                       <BarChart className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                       <h4 className="text-sm font-black uppercase tracking-widest text-foreground">Assessment IQ</h4>
                       <p className="text-[10px] font-semibold text-muted-foreground">Adaptive test performance</p>
                    </div>
                 </div>

                 <div className="space-y-6">
                    {[
                       { label: 'Quant Proficiency', value: 82, color: 'text-blue-500' },
                       { label: 'Coding Velocity', value: 64, color: 'text-primary' },
                       { label: 'Verbal Precision', value: 91, color: 'text-emerald-500' },
                       { label: 'Logical Intensity', value: 77, color: 'text-amber-500' },
                    ].map((metric) => (
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
                       <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Adaptive Goal</span>
                    </div>
                    <p className="text-xs font-semibold text-muted-foreground leading-relaxed">
                       Your Coding Velocity is lagging. The next simulation will prioritize <span className="text-foreground">Time-Bound Hard DPs</span>.
                    </p>
                 </div>
              </div>
           </BentoCard>
        </div>
      </div>
    </div>
  );
}


