'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Video, TrendingUp, ChevronRight, MessageSquare, Trash2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { MockInterview } from '@/lib/types';

export default function InterviewHistoryPage() {
  const { state, deleteMock } = useApp();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const mocks = [...state.mocks].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="w-full animate-in fade-in zoom-in-95 duration-500 max-w-5xl mx-auto mt-12">
      <div className="px-2 mb-12">
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
