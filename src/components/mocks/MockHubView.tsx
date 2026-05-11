'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, Video, X, Award, MessageSquare, 
  ChevronRight, Calendar, Target, ShieldCheck, Zap, BarChart3,
  Search, CheckCircle2, Save, PlayCircle,
  Activity, TrendingUp, Sparkles, Brain, Clock, Trash2
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { MockInterview } from '@/lib/types';
import { BentoCard } from '@/components/ui/Bento';

import dynamic from 'next/dynamic';
import { MockHero } from './components/MockHero';
import { MockArena } from './components/MockArena';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { AssessmentEngine } from './components/AssessmentEngine';
import { MockSocial } from './components/MockSocial';
import { MockRecommendations } from './components/MockRecommendations';
import { AssessmentResults } from './components/AssessmentResults';
import { MockNotifications } from './components/MockNotifications';
import { useMockStore } from '@/store/useMockStore';
import { toast } from 'sonner';

const AssessmentPortal = dynamic(() => import('./components/AssessmentPortal').then(mod => mod.AssessmentPortal), { ssr: false });
const InterviewRoom = dynamic(() => import('./components/InterviewRoom').then(mod => mod.InterviewRoom), { ssr: false });

//  Animation Variants 

const smoothSpring = { type: 'spring', stiffness: 100, damping: 20 } as any;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
  visible: { 
    opacity: 1, 
    y: 0,
    filter: 'blur(0px)',
    transition: smoothSpring
  }
};

//  Redesigned Modal 

function AddMockModal({ onClose }: { onClose: () => void }) {
  const { addMock } = useApp();
  const [form, setForm] = useState<Omit<MockInterview, 'id'>>({
    type: 'Technical (DSA)', score: 0, maxScore: 50, date: new Date().toISOString().split('T')[0], feedback: '',
  });
  const set = (k: keyof typeof form, v: string | number) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-3xl z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        transition={smoothSpring}
        className="bg-card/40 border border-white/10 rounded-[48px] shadow-[0_40px_120px_rgba(0,0,0,0.6)] w-full max-w-2xl overflow-hidden relative"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex items-center justify-between px-12 py-10 border-b border-white/5 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-primary/20 rounded-[20px] flex items-center justify-center border border-primary/30 shadow-lg shadow-primary/10">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-foreground font-black uppercase tracking-[0.2em] text-sm">Log Interview Intel</h2>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mt-1">Simulate. Record. Analyze.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"><X className="w-6 h-6" /></button>
        </div>
        
        <div className="p-12 space-y-10 relative z-10">
          <div className="grid grid-cols-2 gap-10">
            <div className="col-span-2">
              <label className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] mb-4 block ml-1">Engagement Type</label>
              <div className="grid grid-cols-2 gap-3">
                 {[
                    'Technical (DSA)', 'System Design', 'HR & Behavioral', 'Full Loop Simulation'
                 ].map(t => (
                    <button 
                      key={t}
                      onClick={() => set('type', t)}
                      className={`px-6 py-4 rounded-2xl border text-[11px] font-black uppercase tracking-widest transition-all ${
                         form.type === t ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 border-white/5 text-muted-foreground hover:border-white/10'
                      }`}
                    >
                       {t}
                    </button>
                 ))}
              </div>
            </div>

            <div className="col-span-1">
               <label className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] mb-4 block ml-1">Execution Accuracy (%)</label>
               <input type="number" value={form.score} onChange={(e) => set('score', Number(e.target.value))} min={0} max={100}
                className="w-full bg-black/40 border border-white/5 rounded-[20px] px-6 py-4 text-foreground text-lg font-black focus:outline-none focus:border-primary transition-all shadow-inner" />
            </div>
            <div className="col-span-1">
               <label className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] mb-4 block ml-1">Simulation Date</label>
               <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-[20px] px-6 py-4 text-foreground text-sm font-bold focus:outline-none focus:border-primary transition-all cursor-pointer shadow-inner" />
            </div>
          </div>

          <div>
            <label className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] mb-4 block ml-1">AI Debrief & Observations</label>
            <textarea value={form.feedback} onChange={(e) => set('feedback', e.target.value)} rows={4}
              placeholder="Detail your communication hurdles, technical gaps, and behavioral wins..."
              className="w-full bg-black/40 border border-white/5 rounded-[32px] px-8 py-6 text-foreground text-sm font-medium focus:outline-none focus:border-primary transition-all resize-none leading-relaxed placeholder:opacity-20 shadow-inner" />
          </div>
        </div>

        <div className="px-12 pb-12 pt-6 flex gap-6 relative z-10">
          <motion.button 
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => { addMock(form); onClose(); }}
            className="flex-1 py-6 rounded-[24px] bg-primary text-white text-[11px] font-black uppercase tracking-[0.4em] transition-all shadow-[0_20px_50px_rgba(var(--primary-rgb),0.3)] flex items-center justify-center gap-3">
            <Save className="w-5 h-5" /> Persist Execution Log
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

//  Main Dashboard 

export default function MockHubView() {
  const { state, deleteMock } = useApp();
  const { isAssessmentActive, activeRoom, lastSubmission, submissions, onlineCount } = useMockStore();
  const [showModal, setShowModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const mocks = [...state.mocks].sort((a, b) => b.date.localeCompare(a.date));
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); toast.success('Internet connection restored.'); };
    const handleOffline = () => { setIsOnline(false); toast.error('Working Offline', { description: 'Some features like matchmaking may be limited.' }); };
    
    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {isAssessmentActive && <AssessmentPortal />}
        {activeRoom && <InterviewRoom />}
        {lastSubmission && (
          <AssessmentResults 
            submission={lastSubmission} 
            onClose={() => useMockStore.setState({ lastSubmission: null })} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && <AddMockModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-[1600px] mx-auto px-4 pb-40"
      >
        <ErrorBoundary>
            <MockHero />
            <MockArena />
            <MockRecommendations />
            <AssessmentEngine />
            <MockSocial />
         </ErrorBoundary>
      
      <div className="col-span-12 flex flex-col md:flex-row items-center justify-between gap-8 py-10 mt-12 border-y border-white/5">
         <div className="flex items-center gap-6">
            <div className="flex -space-x-3">
               {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full bg-card border-2 border-background flex items-center justify-center overflow-hidden">
                     <div className="w-full h-full bg-gradient-to-br from-primary/40 to-indigo-600/40" />
                  </div>
               ))}
            </div>
            <div className="flex flex-col">
               <span className="text-[11px] font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-primary" /> Elite Pulse
                  {!isOnline && <span className="text-[9px] text-rose-500 ml-2 animate-pulse">(Offline Mode)</span>}
               </span>
               <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">{submissions.length} Assessments Completed</span>
            </div>
         </div>

         <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={smoothSpring}
            onClick={() => setShowModal(true)}
            className="group relative flex items-center gap-4 px-10 py-5 bg-foreground text-background rounded-[24px] text-[11px] font-black uppercase tracking-[0.4em] overflow-hidden"
          >
            <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10 flex items-center gap-4 group-hover:text-white transition-colors">
              <Plus className="w-5 h-5" /> 
              Trigger Mock Engagement
            </span>
          </motion.button>
      </div>
      
      <MockRecommendations />

      {/*  Historical Execution Logs  */}
      <div className="mt-32 space-y-12">
        <div className="px-2">
          <h2 className="text-2xl font-black uppercase tracking-tight text-foreground flex items-center gap-4">
             <Clock className="w-6 h-6 text-muted-foreground" />
             Historical Intelligence
          </h2>
          <p className="text-sm font-medium text-muted-foreground tracking-tight mt-1">Review past simulations to detect weak execution patterns.</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
           {mocks.length === 0 ? (
              <div className="py-32 text-center rounded-[48px] border-2 border-dashed border-white/5 bg-white/2">
                 <Video className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-10" />
                 <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground opacity-30">No execution logs retrieved</p>
              </div>
           ) : (
              mocks.map((mock, idx) => (
                <ExecutionLogCard 
                  key={mock.id} 
                  mock={mock} 
                  index={idx} 
                  total={mocks.length}
                  isExpanded={expandedId === mock.id}
                  onToggle={() => setExpandedId(expandedId === mock.id ? null : mock.id)}
                  onDelete={() => deleteMock(mock.id)}
                />
              ))
           )}
        </div>
      </div>

      <ErrorBoundary>
        <MockNotifications />
      </ErrorBoundary>
    </motion.div>
    </>
  );
}

function ExecutionLogCard({ mock, index, total, isExpanded, onToggle, onDelete }: { 
  mock: MockInterview, index: number, total: number, isExpanded: boolean, onToggle: () => void, onDelete: () => void 
}) {
  const accuracy = Math.round((mock.score / mock.maxScore) * 100);
  const statusColor = accuracy >= 80 ? 'text-emerald-500' : accuracy >= 60 ? 'text-primary' : 'text-rose-500';

  return (
    <motion.div
      layout
      className={`group rounded-[40px] border transition-all duration-500 overflow-hidden ${
        isExpanded ? 'bg-card/60 border-white/10 shadow-2xl' : 'bg-card/30 border-white/5 hover:border-white/10'
      }`}
    >
      <button onClick={onToggle} className="w-full px-10 py-10 flex items-center gap-8 text-left">
        <div className={`w-16 h-16 rounded-[24px] bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-500 ${isExpanded ? 'scale-90 rotate-6' : 'group-hover:scale-110'}`}>
           <TrendingUp className={`w-8 h-8 ${statusColor}`} />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Log #{total - index}</span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{mock.date}</span>
          </div>
          <h3 className="text-xl font-black tracking-tight text-foreground uppercase group-hover:text-primary transition-colors">{mock.type}</h3>
        </div>

        <div className="flex items-center gap-10">
          <div className="text-right">
             <span className={`text-4xl font-black ${statusColor} tracking-tighter tabular-nums`}>{accuracy}%</span>
             <span className="block text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Accuracy</span>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isExpanded ? 'bg-primary text-white rotate-180' : 'bg-white/5 text-muted-foreground'}`}>
             <ChevronRight className="w-6 h-6" />
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-10 pb-12 pt-4 bg-black/20"
          >
            <div className="h-px bg-white/5 mb-10" />
            <div className="grid grid-cols-12 gap-12">
               <div className="col-span-12 lg:col-span-8 space-y-6">
                  <div className="flex items-center gap-3">
                     <MessageSquare className="w-5 h-5 text-primary" />
                     <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground">Debrief Intelligence</h4>
                  </div>
                  <div className="p-8 rounded-[32px] bg-background border border-white/5 text-foreground/80 text-sm font-medium leading-relaxed italic shadow-inner">
                     "{mock.feedback || 'No deep intelligence recorded for this session.'}"
                  </div>
               </div>

               <div className="col-span-12 lg:col-span-4 flex flex-col justify-between items-end gap-10">
                  <div className="w-full p-8 rounded-[32px] bg-white/5 border border-white/10 flex flex-col items-center gap-4 text-center">
                     <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Hiring Probability</span>
                     <div className="flex items-end gap-1">
                        <span className={`text-6xl font-black ${statusColor} tracking-tighter`}>{Math.max(0, accuracy - 15)}%</span>
                        <span className="text-sm font-bold text-muted-foreground mb-2">est.</span>
                     </div>
                  </div>
                  <button 
                    onClick={onDelete}
                    className="flex items-center gap-3 px-8 py-4 rounded-2xl border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.3em]"
                  >
                     <Trash2 className="w-4 h-4" /> Purge Log
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
