'use client';

import { useState } from 'react';
import { ChevronRight, Plus, Trash2, Check, Edit3, GitMerge, Target, ShieldCheck, Zap, BookOpen, Activity, Star } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { calcCurrentWeek } from '@/lib/utils';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { BentoCard, ActivityRing } from '@/components/ui/Bento';

// Premium Kinetic Physics
const magneticSpring = { type: 'spring', stiffness: 150, damping: 15, mass: 0.1 } as any;
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

const textReveal = {
  hidden: { opacity: 0, y: "100%" },
  visible: { opacity: 1, y: 0, transition: { ...smoothSpring, duration: 0.8 } }
};

const PHASE_CONFIG: Record<string, { badge: string; bg: string; bar: string; tint: string }> = {
  Ninja: { badge: 'border-secondary/30 text-secondary bg-secondary/10', bg: 'bg-secondary/5', bar: 'bg-secondary', tint: 'text-secondary' },
  Digital: { badge: 'border-primary/30 text-primary bg-primary/10', bg: 'bg-primary/5', bar: 'bg-primary', tint: 'text-primary' },
  Prime: { badge: 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10', bg: 'bg-emerald-500/5', bar: 'bg-emerald-500', tint: 'text-emerald-500' },
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
      whileHover={{ scale: 1.01, y: -2 }}
      transition={magneticSpring}
      className={`relative overflow-hidden rounded-[24px] bg-card/60 backdrop-blur-xl border transition-all duration-500 shadow-2xl ${
        isActive 
          ? 'border-primary/40 shadow-[0_10px_40px_rgba(var(--primary-rgb),0.15)]' 
          : 'border-border/50 dark:border-white/[0.04]'
      } ${isPast && pct === 100 ? 'opacity-70 grayscale-[0.2]' : ''}`}
    >
      {isActive && <div className="absolute inset-0 bg-primary/5 pointer-events-none" />}
      <button
        onClick={onToggle}
        className={`w-full flex items-center gap-6 px-8 py-6 text-left transition-all ${isExpanded ? 'bg-black/5 dark:bg-white/[0.02]' : 'hover:bg-black/5 dark:bg-white/[0.02]'}`}
      >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg flex-shrink-0 border transition-all shadow-lg ${
          isActive 
            ? 'bg-gradient-to-tr from-primary to-indigo-500 border-white/20 text-white shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)]' 
            : isPast ? 'bg-black/10 dark:bg-white/5 border-border/50 dark:border-white/10 text-muted-foreground' : 'bg-black/5 dark:bg-white/[0.02] border-border/50 dark:border-white/[0.05] text-muted-foreground/60'
        }`}>
          W{week.week}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1.5">
            <span className={`text-xl font-black tracking-tight ${isActive ? 'text-foreground' : 'text-foreground/90'}`}>
              Week {week.week}
            </span>
            <span className={`text-[10px] px-3 py-1 rounded-full border font-black tracking-widest uppercase ${phase.badge}`}>
              {week.phase}
            </span>
            {isActive && (
              <span className="text-[10px] px-3 py-1 rounded-full bg-emerald-500 text-white border border-emerald-400 font-black tracking-widest uppercase shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse">
                Active
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 opacity-90">
             <Target className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
             <p className={`text-sm font-semibold truncate tracking-tight ${isActive ? 'text-foreground' : 'text-muted-foreground/80'}`}>{week.focus}</p>
          </div>
        </div>

        <div className="flex items-center gap-8 flex-shrink-0">
          <div className="hidden sm:flex flex-col items-end gap-1.5 min-w-[100px]">
            <span className={`text-[11px] font-black tracking-widest uppercase ${pct === 100 ? 'text-emerald-500' : 'text-muted-foreground'}`}>{pct}% Done</span>
            <div className="w-24 h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden shadow-inner">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${pct}%` }}
                 transition={{ duration: 1, ease: [0.32, 0.72, 0, 1] }}
                 className={`h-full ${phase.bar} rounded-full`} 
               />
            </div>
          </div>
          <motion.div 
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={smoothSpring}
            className={`p-3 rounded-xl transition-colors duration-500 ${isExpanded ? 'bg-primary/20 text-primary' : 'bg-black/5 dark:bg-white/5 text-muted-foreground/40'}`}
          >
             <ChevronRight className="w-5 h-5" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={smoothSpring}
            className="border-t border-border/50 dark:border-white/[0.04] overflow-hidden"
          >
            <div className="px-8 py-8 space-y-8 bg-black/5 dark:bg-white/[0.01]">
              <div className="space-y-3">
                <p className="text-xs font-black tracking-[0.2em] text-muted-foreground/60 uppercase ml-1">Mission Focus</p>
                {editFocus ? (
                  <input
                    autoFocus
                    value={focusDraft}
                    onChange={(e) => setFocusDraft(e.target.value)}
                    onBlur={() => { updateWeekFocus(week.week, focusDraft); setEditFocus(false); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { updateWeekFocus(week.week, focusDraft); setEditFocus(false); } }}
                    className="w-full bg-background border border-primary/30 rounded-2xl px-5 py-4 text-base font-semibold text-foreground focus:outline-none shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]"
                  />
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => { setFocusDraft(week.focus); setEditFocus(true); }}
                    className="group bg-card/50 hover:bg-card transition-all p-5 rounded-2xl border border-border/50 dark:border-white/[0.04] shadow-md flex items-center justify-between text-left w-full"
                  >
                    <span className="text-base font-bold text-foreground leading-relaxed">{week.focus}</span>
                    <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-all">
                      <Edit3 className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </motion.button>
                )}
              </div>

              <div className="space-y-4">
                <p className="text-xs font-black tracking-[0.2em] text-muted-foreground/60 uppercase ml-1">Key Deliverables</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {week.tasks.map((task) => (
                    <motion.div 
                      key={task.id} 
                      layout
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={smoothSpring}
                      className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all shadow-md ${
                        task.done 
                          ? 'bg-emerald-500/10 border-emerald-500/20' 
                          : 'bg-card/50 border-border/50 dark:border-white/[0.04] hover:border-primary/30 hover:shadow-[0_10px_20px_rgba(var(--primary-rgb),0.05)]'
                      }`}
                    >
                      <button
                        onClick={() => toggleWeekTask(week.week, task.id)}
                        className={`w-7 h-7 rounded-[8px] border-2 flex items-center justify-center transition-all ${
                          task.done 
                            ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                            : 'border-muted-foreground/30 group-hover:border-primary/50'
                        }`}
                      >
                        {task.done && <Check className="w-4 h-4 text-white font-bold" />}
                      </button>
                      <span className={`text-base font-bold flex-1 leading-snug tracking-tight ${task.done ? 'line-through text-emerald-500/60' : 'text-foreground'}`}>
                        {task.label}
                      </span>
                      <button
                        onClick={() => deleteWeekTask(week.week, task.id)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-rose-500 transition-all p-2 rounded-lg hover:bg-rose-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                  
                  {adding ? (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 col-span-full">
                      <input
                        autoFocus
                        value={newTask}
                        placeholder="Add new objective..."
                        onChange={(e) => setNewTask(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddTask(); if (e.key === 'Escape') setAdding(false); }}
                        className="flex-1 bg-background border border-primary/30 rounded-2xl px-5 py-4 text-base font-semibold text-foreground focus:outline-none shadow-inner"
                      />
                      <motion.button whileTap={{ scale: 0.95 }} onClick={handleAddTask} className="px-6 py-4 bg-primary text-white shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] rounded-2xl text-[11px] font-black uppercase tracking-widest">Add</motion.button>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => setAdding(false)} className="px-6 py-4 bg-black/5 dark:bg-white/5 text-foreground hover:bg-black/10 dark:hover:bg-white/10 rounded-2xl transition-colors text-[11px] font-black uppercase tracking-widest">Cancel</motion.button>
                    </motion.div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setAdding(true)}
                      className="col-span-full py-5 border-2 border-dashed border-border/50 dark:border-white/[0.08] rounded-2xl flex items-center justify-center gap-3 text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all font-black text-[11px] uppercase tracking-widest"
                    >
                      <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center">
                        <Plus className="w-4 h-4" />
                      </div>
                      Add New Objective
                    </motion.button>
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
      className="grid grid-cols-12 gap-8 pb-24 relative"
    >
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
      
      {/* ── Massive Typography Header ── */}
      <div className="col-span-12 mb-4">
        <div className="overflow-hidden mb-4 flex items-center gap-4">
            <motion.div 
               initial={{ rotate: 90, scale: 0 }} 
               animate={{ rotate: 0, scale: 1 }} 
               transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
               className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-secondary to-primary flex items-center justify-center shadow-[0_0_40px_rgba(var(--secondary-rgb),0.4)]"
            >
               <GitMerge className="w-7 h-7 text-white" />
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/40 leading-[1.1]">
               <motion.span variants={textReveal} className="inline-block">Master</motion.span>{' '}
               <motion.span variants={textReveal} className="inline-block">Plan.</motion.span>
            </h1>
        </div>
        <motion.p variants={itemVariants} className="text-muted-foreground text-lg md:text-xl font-medium max-w-2xl tracking-tight pl-18">
          Strategic {(state.goalDurationMonths || 3) * 4}-week journey. Complete tasks, build momentum, and secure your target placement.
        </motion.p>
      </div>

      <BentoCard className="col-span-12 lg:col-span-8 overflow-hidden backdrop-blur-2xl bg-card/60 shadow-2xl border-white/10">
         <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10 py-4">
           <div className="max-w-md">
              <h2 className="text-4xl font-black text-foreground mb-4 tracking-tighter">Global Completion</h2>
              <p className="text-muted-foreground text-base font-semibold leading-relaxed">
                Stay focused. Small compounding daily actions yield explosive long-term results.
              </p>
           </div>
           
           <div className="flex gap-12 items-center justify-center bg-black/5 dark:bg-white/5 p-8 rounded-3xl border border-border/50 dark:border-white/5 shadow-inner">
              <div className="text-center group">
                 <motion.p 
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary to-indigo-500 mb-2 tabular-nums tracking-tighter"
                  >
                   {overallPct}<span className="text-3xl font-bold opacity-50 ml-1">%</span>
                 </motion.p>
              </div>
           </div>
         </div>
      </BentoCard>

      <BentoCard className="col-span-12 lg:col-span-4 backdrop-blur-2xl bg-card/60 shadow-2xl border-white/10" title="Strategic Vitals">
         <div className="flex items-center justify-center h-full py-6">
            <ActivityRing value={doneTasks} max={totalTasks} color="var(--primary)" label="Tasks Conquered" />
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
              <motion.div key={l} whileHover={{ y: -5, scale: 1.02 }} transition={magneticSpring}>
                <BentoCard className="group overflow-hidden backdrop-blur-xl bg-card/60 shadow-xl border-white/5">
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] px-4 py-1.5 rounded-full font-black tracking-widest uppercase border shadow-sm ${config.badge}`}>
                        {l} Tier
                      </span>
                      <span className={`text-4xl font-black ${config.tint} tabular-nums tracking-tighter`}>{p}%</span>
                    </div>
                    <div className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${p}%` }}
                        transition={{ duration: 1, ease: [0.32, 0.72, 0, 1] }}
                        className={`h-full ${config.bar} rounded-full`} 
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground font-black tracking-widest uppercase">{d} / {total} Targets Neutralized</p>
                  </div>
                </BentoCard>
              </motion.div>
            );
          })}
      </div>

      <div className="col-span-12 lg:col-span-9 space-y-8 mt-4">
         <div className="flex items-center gap-4 px-2">
            <div className="w-2 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" />
            <h3 className="text-xl font-black text-foreground uppercase tracking-[0.2em]">Operational Sequence</h3>
         </div>
         <div className="space-y-6">
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

      <div className="col-span-12 lg:col-span-3 space-y-8 mt-4">
         <motion.div whileHover={{ scale: 1.02 }} transition={magneticSpring}>
           <BentoCard title="Legend" icon={ShieldCheck} className="h-fit backdrop-blur-xl bg-card/60 shadow-2xl border-white/5">
              <div className="space-y-6 py-2">
                 {[
                   { label: 'Core Objective', icon: Zap, color: 'text-primary' },
                   { label: 'Secure Checkpoint', icon: Check, color: 'text-emerald-500' },
                   { label: 'Tier Milestone', icon: Star, color: 'text-secondary' },
                   { label: 'Resource Node', icon: BookOpen, color: 'text-indigo-400' },
                 ].map((item) => (
                   <div key={item.label} className="flex items-center gap-5 group/item cursor-default">
                     <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center border border-border/50 dark:border-white/10 group-hover/item:border-primary/40 group-hover/item:bg-primary/10 transition-all shadow-md">
                        <item.icon className={`w-5 h-5 ${item.color}`} />
                     </div>
                     <span className="text-sm font-bold text-muted-foreground group-hover/item:text-foreground transition-all">{item.label}</span>
                   </div>
                 ))}
              </div>
           </BentoCard>
         </motion.div>

         <motion.div whileHover={{ scale: 1.02 }} transition={magneticSpring}>
           <BentoCard className="aspect-square flex flex-col justify-center items-center text-center p-10 backdrop-blur-xl bg-card/60 shadow-2xl border-white/5 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
              <Activity className="w-16 h-16 text-primary opacity-20 mb-8" />
              <p className="text-xs font-black tracking-[0.3em] text-primary uppercase mb-4 shadow-sm">Philosopher's Stone</p>
              <p className="text-lg font-bold text-foreground italic leading-relaxed tracking-tight">"Obsession with consistency is the signature of excellence."</p>
           </BentoCard>
         </motion.div>
      </div>
    </motion.div>
  );
}
