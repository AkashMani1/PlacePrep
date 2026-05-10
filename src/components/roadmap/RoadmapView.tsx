/* Developed by Akash Mani - Premium Roadmap View */
'use client';

import { useState } from 'react';
import { ChevronRight, Plus, Trash2, Check, Edit3, GitMerge, Target, ShieldCheck, Zap, BookOpen, Activity, Star } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { calcCurrentWeek } from '@/lib/utils';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { BentoCard, ActivityRing } from '@/components/ui/Bento';

// Premium Linear Easing
const premiumEasing = [0.32, 0.72, 0, 1];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: premiumEasing }
  }
};

const PHASE_CONFIG: Record<string, { badge: string; bg: string; bar: string; tint: string }> = {
  Ninja: { badge: 'border-secondary/20 text-secondary bg-secondary/10', bg: 'bg-secondary/5', bar: 'bg-secondary', tint: 'text-secondary' },
  Digital: { badge: 'border-primary/20 text-primary bg-primary/10', bg: 'bg-primary/5', bar: 'bg-primary', tint: 'text-primary' },
  Prime: { badge: 'border-emerald-500/20 text-emerald-500 bg-emerald-500/10', bg: 'bg-emerald-500/5', bar: 'bg-emerald-500', tint: 'text-emerald-500' },
};

const DEFAULT_PHASE = { badge: 'border-white/10 text-muted-foreground bg-white/5', bg: 'bg-white/5', bar: 'bg-white/20', tint: 'text-muted-foreground' };

function WeekCard({ week, isExpanded, onToggle }: {
  week: ReturnType<typeof useApp>['state']['weeks'][0];
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const { toggleWeekTask, addWeekTask, deleteWeekTask, updateWeekFocus, state } = useApp();
  const [newTask, setNewTask] = useState('');
  const [adding, setAdding] = useState(false);
  const [editFocus, setEditFocus] = useState(false);
  const [focusDraft, setFocusDraft] = useState(week.focus);

  const currentWeek = calcCurrentWeek(state.startDate);
  const done = week.tasks.filter((t) => t.done).length;
  const pct = week.tasks.length ? Math.round((done / week.tasks.length) * 100) : 0;
  
  // 🛡️ Fix for 'badge' undefined crash + fallback
  const phase = PHASE_CONFIG[week.phase] || DEFAULT_PHASE;
  
  const isActive = week.week === currentWeek;
  const isPast = week.week < currentWeek;

  const handleAddTask = () => {
    if (newTask.trim()) {
      addWeekTask(week.week, newTask.trim());
      setNewTask('');
      setAdding(false);
    }
  };

  return (
    <motion.div 
      variants={itemVariants}
      className={`relative overflow-hidden rounded-[24px] bg-[#121214] border transition-all duration-500 ${
        isActive 
          ? 'border-primary/40 bg-primary/[0.03] shadow-[0_8px_30px_rgba(var(--primary-rgb),0.1)]' 
          : 'border-white/[0.04]'
      } ${isPast && pct === 100 ? 'opacity-80' : ''}`}
    >
      <button
        onClick={onToggle}
        className={`w-full flex items-center gap-6 px-8 py-6 text-left transition-all ${isExpanded ? 'bg-white/[0.02]' : 'hover:bg-white/[0.02]'}`}
      >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 border transition-all ${
          isActive 
            ? 'bg-primary/20 border-primary/40 text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]' 
            : isPast ? 'bg-white/5 border-white/10 text-muted-foreground' : 'bg-white/[0.02] border-white/[0.05] text-muted-foreground/60'
        }`}>
          W{week.week}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1.5">
            <span className={`text-base font-semibold tracking-tight ${isActive ? 'text-foreground' : 'text-foreground/90'}`}>
              Week {week.week}
            </span>
            <span className={`text-[10px] px-2.5 py-1 rounded-full border font-semibold tracking-wide uppercase ${phase.badge}`}>
              {week.phase}
            </span>
            {isActive && (
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-semibold tracking-wide uppercase animate-pulse">
                Active
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 opacity-80">
             <Target className="w-3.5 h-3.5 text-muted-foreground/60" />
             <p className={`text-xs font-medium truncate tracking-tight ${isActive ? 'text-primary/80' : 'text-muted-foreground/80'}`}>{week.focus}</p>
          </div>
        </div>

        <div className="flex items-center gap-8 flex-shrink-0">
          <div className="hidden sm:flex flex-col items-end gap-1.5 min-w-[80px]">
            <span className={`text-[10px] font-semibold tracking-wider ${pct === 100 ? 'text-emerald-500' : 'text-muted-foreground/60'}`}>{pct}% COMPLETED</span>
            <div className="w-24 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${pct}%` }}
                 transition={{ duration: 1, ease: premiumEasing }}
                 className={`h-full ${phase.bar} rounded-full`} 
               />
            </div>
          </div>
          <div className={`p-2 rounded-xl transition-transform duration-500 ${isExpanded ? 'rotate-90 bg-white/5 text-primary' : 'text-muted-foreground/40'}`}>
             <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: premiumEasing }}
            className="border-t border-white/[0.04] overflow-hidden"
          >
            <div className="px-8 py-8 space-y-8 bg-white/[0.01]">
              <div className="space-y-3">
                <p className="text-[10px] font-semibold tracking-widest text-muted-foreground/60 uppercase ml-1">Mission Focus</p>
                {editFocus ? (
                  <input
                    autoFocus
                    value={focusDraft}
                    onChange={(e) => setFocusDraft(e.target.value)}
                    onBlur={() => { updateWeekFocus(week.week, focusDraft); setEditFocus(false); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { updateWeekFocus(week.week, focusDraft); setEditFocus(false); } }}
                    className="w-full bg-[#1A1A1C] border border-primary/30 rounded-xl px-5 py-3 text-sm text-foreground focus:outline-none shadow-xl shadow-primary/5"
                  />
                ) : (
                  <button
                    onClick={() => { setFocusDraft(week.focus); setEditFocus(true); }}
                    className="group bg-white/[0.02] hover:bg-white/[0.04] transition-all p-5 rounded-2xl border border-white/[0.04] flex items-center justify-between text-left w-full"
                  >
                    <span className="text-sm font-medium text-foreground/90 leading-relaxed">{week.focus}</span>
                    <Edit3 className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-all" />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-semibold tracking-widest text-muted-foreground/60 uppercase ml-1">Key Deliverables</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {week.tasks.map((task) => (
                    <motion.div 
                      key={task.id} 
                      layout
                      className={`group flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        task.done 
                          ? 'bg-emerald-500/[0.03] border-emerald-500/10 opacity-80' 
                          : 'bg-white/[0.02] border-white/[0.04] hover:border-primary/20'
                      }`}
                    >
                      <button
                        onClick={() => toggleWeekTask(week.week, task.id)}
                        className={`w-6 h-6 rounded-[6px] border-2 flex items-center justify-center transition-all ${
                          task.done 
                            ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                            : 'border-white/10 hover:border-primary/40'
                        }`}
                      >
                        {task.done && <Check className="w-3.5 h-3.5 text-white font-bold" />}
                      </button>
                      <span className={`text-sm font-medium flex-1 leading-snug tracking-tight ${task.done ? 'line-through text-muted-foreground/60' : 'text-foreground/90'}`}>
                        {task.label}
                      </span>
                      <button
                        onClick={() => deleteWeekTask(week.week, task.id)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-rose-500 transition-all p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                  
                  {adding ? (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 col-span-full">
                      <input
                        autoFocus
                        value={newTask}
                        placeholder="Add new objective..."
                        onChange={(e) => setNewTask(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddTask(); if (e.key === 'Escape') setAdding(false); }}
                        className="flex-1 bg-white/[0.02] border border-white/[0.1] border-dashed rounded-xl px-5 py-3 text-sm text-foreground focus:outline-none"
                      />
                      <button onClick={handleAddTask} className="px-5 py-3 bg-primary text-primary-foreground rounded-xl text-[10px] font-bold uppercase tracking-wider">Add</button>
                      <button onClick={() => setAdding(false)} className="px-5 py-3 text-muted-foreground/60 hover:text-foreground transition-colors text-[10px] font-bold uppercase tracking-wider">Cancel</button>
                    </motion.div>
                  ) : (
                    <button
                      onClick={() => setAdding(true)}
                      className="col-span-full py-4 border border-dashed border-white/[0.08] rounded-xl flex items-center justify-center gap-2.5 text-muted-foreground/60 hover:text-primary hover:border-primary/30 transition-all font-semibold text-[10px] uppercase tracking-wider bg-white/[0.01]"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add New Objective
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function RoadmapView() {
  const { state } = useApp();
  const currentWeek = calcCurrentWeek(state.startDate);
  const [expanded, setExpanded] = useState<number>(currentWeek);

  const totalTasks = state.weeks.reduce((s, w) => s + w.tasks.length, 0);
  const doneTasks = state.weeks.reduce((s, w) => s + w.tasks.filter((t) => t.done).length, 0);
  const overallPct = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-12 gap-8"
    >
      <BentoCard className="col-span-12 lg:col-span-8 overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent pointer-events-none" />
         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10 py-2">
           <div className="max-w-md">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]">
                 <GitMerge className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-3 tracking-tight leading-none">Deployment Roadmap</h2>
              <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                Strategic {(state.goalDurationMonths || 3) * 4}-week journey. Mastering <span className="text-secondary font-semibold">Technical Fundamentals</span> and scaling to <span className="text-primary font-semibold">Production-Grade Mastery</span>.
              </p>
           </div>
           
           <div className="flex gap-12 items-center">
              <div className="text-center group">
                 <motion.p 
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-6xl font-bold text-foreground mb-2 tabular-nums"
                  >
                   {overallPct}<span className="text-xl opacity-30 ml-1.5">%</span>
                 </motion.p>
                 <p className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground/60 uppercase">Global Completion</p>
              </div>
           </div>
         </div>
      </BentoCard>

      <BentoCard className="col-span-12 lg:col-span-4" title="Strategic Vitals">
         <div className="flex items-center justify-center h-full py-4">
            <ActivityRing value={doneTasks} max={totalTasks} color="var(--primary)" label="Task Alignment" />
         </div>
      </BentoCard>

      <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {(['Ninja', 'Digital', 'Prime'] as const).map((l) => {
            const config = PHASE_CONFIG[l] || DEFAULT_PHASE;
            const ws = state.weeks.filter((w) => w.phase === l);
            const d = ws.reduce((s, w) => s + w.tasks.filter((t) => t.done).length, 0);
            const total = ws.reduce((s, w) => s + w.tasks.length, 0);
            const p = total ? Math.round((d / total) * 100) : 0;
            
            return (
              <BentoCard key={l} className="group overflow-hidden">
                <div className="relative z-10 space-y-5">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] px-3 py-1 rounded-full font-semibold tracking-wide uppercase border ${config.badge}`}>
                      {l} Tier
                    </span>
                    <span className={`text-3xl font-bold ${config.tint} tabular-nums tracking-tighter`}>{p}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${p}%` }}
                      transition={{ duration: 1, ease: premiumEasing }}
                      className={`h-full ${config.bar} rounded-full`} 
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground/60 font-medium tracking-wider uppercase">{d} / {total} Targets Neutralized</p>
                </div>
              </BentoCard>
            );
          })}
      </div>

      <div className="col-span-12 lg:col-span-9 space-y-6">
         <div className="flex items-center gap-3 mb-6 px-1">
            <div className="w-1.5 h-6 bg-primary/40 rounded-full" />
            <h3 className="text-xs font-semibold text-foreground/80 uppercase tracking-widest">Operational Sequence</h3>
         </div>
         <div className="space-y-4">
            {state.weeks.map((week) => (
              <WeekCard
                key={week.week}
                week={week}
                isExpanded={expanded === week.week}
                onToggle={() => setExpanded(expanded === week.week ? 0 : week.week)}
              />
            ))}
         </div>
      </div>

      <div className="col-span-12 lg:col-span-3 space-y-8">
         <BentoCard title="Legend" icon={ShieldCheck} className="h-fit">
            <div className="space-y-6 py-1">
               {[
                 { label: 'Core Objective', icon: Zap, color: 'text-primary' },
                 { label: 'Secure Checkpoint', icon: Check, color: 'text-emerald-500' },
                 { label: 'Tier Milestone', icon: Star, color: 'text-secondary' },
                 { label: 'Resource Node', icon: BookOpen, color: 'text-indigo-400' },
               ].map((item) => (
                 <div key={item.label} className="flex items-center gap-4 group/item">
                   <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center border border-white/[0.05] group-hover/item:border-primary/20 transition-all">
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                   </div>
                   <span className="text-[13px] font-medium text-muted-foreground/80 group-hover/item:text-foreground transition-all">{item.label}</span>
                 </div>
               ))}
            </div>
         </BentoCard>

         <BentoCard className="aspect-square flex flex-col justify-center items-center text-center p-8">
            <Activity className="w-12 h-12 text-primary opacity-20 mb-6" />
            <p className="text-[10px] font-semibold tracking-widest text-muted-foreground/40 uppercase mb-3">Philosopher's Stone</p>
            <p className="text-sm font-medium text-foreground/80 italic leading-relaxed tracking-tight">"Obsession with consistency is the signature of excellence."</p>
         </BentoCard>
      </div>
    </motion.div>
  );
}
