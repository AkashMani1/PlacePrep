/* Developed by Akash Mani - This site is developed by Akash Mani. Original watermark of Akash Mani. */
'use client';

import { useState, useMemo } from 'react';
import { Plus, Trash2, Pencil, Target, Search, X, ShieldCheck, Zap, Activity, BookOpen, Star, AlertTriangle, ExternalLink, LayoutGrid, BookMarked } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Problem, Difficulty, ProblemStatus, Platform } from '@/lib/types';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { BentoCard, ActivityRing } from '@/components/ui/Bento';
import { List } from 'react-window';
import React, { memo } from 'react';
import { getReferenceUrl, getPlatformLabel } from '@/lib/referenceLinks';

// ── Animation Variants ────────────────────────────────────────────────────────

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { 
      duration: 0.4, 
      ease: 'easeOut'
    }
  }
};

const DIFF_COLORS: Record<Difficulty, string> = {
  Easy: 'text-secondary bg-secondary/10 border-secondary/20',
  Medium: 'text-primary bg-primary/10 border-primary/20',
  Hard: 'text-foreground bg-primary/40 border-primary/50 shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]',
};

const STATUS_COLORS: Record<ProblemStatus, string> = {
  Done: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
  Revisit: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
  Todo: 'text-muted-foreground bg-muted/20 border-border/10',
};

// ── Sub-components for Virtualization ────────────────────────────────────────

const ProblemItem = memo(({ 
  problem, 
  onUpdate, 
  onDelete,
  onEdit,
  editingNote, 
  setEditingNote,
  noteDraft,
  setNoteDraft
}: { 
  problem: Problem, 
  onUpdate: (id: string, p: Partial<Problem>) => void,
  onDelete: (id: string) => void,
  onEdit: (p: Problem) => void,
  editingNote: string | null,
  setEditingNote: (id: string | null) => void,
  noteDraft: string,
  setNoteDraft: (v: string) => void
}) => {
  const isDone = problem.status === 'Done';
  
  const refUrl = problem.videoUrl || getReferenceUrl(problem.name, problem.category, problem.topic);
  const platformLabel = problem.videoUrl ? 'YouTube' : refUrl ? getPlatformLabel(refUrl) : null;
  const isAptitude = problem.category === 'Aptitude';

  return (
    <motion.div 
      variants={itemVariants}
      whileHover={{ scale: 1.002 }}
      className="bento-card !p-5 hover:border-primary/30 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6 group/card relative overflow-hidden h-full"
    >
      {isDone && (
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
      )}
      <div className="flex items-start gap-6 flex-1 min-w-0 relative z-10">
         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border transition-all duration-500 ${
            isDone ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-muted/40 border-border/10 text-muted-foreground'
         }`}>
            {isDone ? <ShieldCheck className="w-7 h-7" /> : isAptitude ? <BookMarked className="w-7 h-7" /> : <ExternalLink className="w-7 h-7" />}
         </div>
         <div className="flex-1 min-w-0">
            <div className="flex items-center gap-4 mb-2 flex-wrap">
               <h4 className={`text-xl font-black tracking-tight truncate ${isDone ? 'text-muted-foreground/50' : 'text-foreground'}`}>{problem.name}</h4>
               {problem.isPriority && (
                  <span className="bg-rose-500/10 text-rose-500 border border-rose-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">High Priority</span>
               )}
            </div>
            {/* Reference Link Row */}
            <div className="flex items-center gap-3 flex-wrap mb-1">
              {refUrl ? (
                <a
                  href={refUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all hover:scale-105 active:scale-95 ${
                    isAptitude
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/50'
                      : 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 hover:border-primary/50'
                  }`}
                >
                  {isAptitude ? <BookOpen className="w-3 h-3" /> : <ExternalLink className="w-3 h-3" />}
                  {problem.videoUrl ? `Watch — ${platformLabel}` : isAptitude ? `Read — ${platformLabel}` : `Solve — ${platformLabel}`}
                </a>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-border/10 text-muted-foreground/30 bg-muted/10">
                  {isAptitude ? <BookOpen className="w-3 h-3" /> : <ExternalLink className="w-3 h-3" />}
                  {isAptitude ? 'Reading Material' : 'Practice Link'}
                </span>
              )}
            </div>
            {editingNote === problem.id ? (
               <input
                 autoFocus value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)}
                 onBlur={() => { onUpdate(problem.id, { notes: noteDraft }); setEditingNote(null); }}
                 onKeyDown={(e) => { if (e.key === 'Enter') { onUpdate(problem.id, { notes: noteDraft }); setEditingNote(null); } }}
                 className="w-full bg-muted/50 border border-primary/30 rounded-xl px-4 py-2.5 text-sm font-bold text-foreground focus:outline-none"
               />
            ) : (
               <p onClick={() => { setEditingNote(problem.id); setNoteDraft(problem.notes); }} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all cursor-pointer truncate max-w-xl italic opacity-60 hover:opacity-100">
                  {problem.notes || '+ Add Topic Note'}
               </p>
            )}
         </div>
      </div>

      <div className="flex flex-wrap items-center gap-6 lg:gap-10 relative z-10">
         <span className={`text-[11px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl border ${DIFF_COLORS[problem.difficulty]}`}>
            {problem.difficulty} TIER
         </span>
         
         <div className="flex items-center">
            <select 
              value={problem.status} onChange={(e) => onUpdate(problem.id, { status: e.target.value as ProblemStatus })}
              className={`text-[11px] font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-xl border bg-card/60 backdrop-blur-sm cursor-pointer transition-all shadow-sm ${STATUS_COLORS[problem.status]}`}
            >
               {(['Todo', 'Done', 'Revisit'] as ProblemStatus[]).map(s => <option key={s} value={s} className="bg-card text-foreground">{s} Status</option>)}
            </select>
         </div>

         <div className="flex items-center gap-3 opacity-0 group-hover/card:opacity-100 transition-all duration-300">
            <button onClick={() => onEdit(problem)} className="p-3 bg-primary/10 text-primary/60 hover:text-primary hover:bg-primary/20 rounded-xl transition-all border border-transparent hover:border-primary/30" title="Edit problem">
               <Pencil className="w-4 h-4" />
            </button>
            <button onClick={() => onDelete(problem.id)} className="p-3 bg-rose-500/10 text-rose-500/60 hover:text-rose-500 hover:bg-rose-500/20 rounded-xl transition-all border border-transparent hover:border-rose-500/30" title="Delete problem">
               <Trash2 className="w-4 h-4" />
            </button>
         </div>
      </div>
    </motion.div>
  );
});

ProblemItem.displayName = 'ProblemItem';

const TopicHeader = memo(({ topic, count }: { topic: string, count: number }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-center gap-4 px-4 py-2 mt-8 mb-4 sticky top-0 bg-background/80 backdrop-blur-md z-20"
  >
     <div className="w-2.5 h-8 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]" />
     <span className="text-sm font-black text-foreground uppercase tracking-[0.3em]">{topic} <span className="opacity-30 ml-2 font-bold">[{count} PROBLEMS]</span></span>
  </motion.div>
));

TopicHeader.displayName = 'TopicHeader';

// ── Add Problem Modal ─────────────────────────────────────────────────────────

function AddProblemModal({ onClose, activeCategory }: { onClose: () => void, activeCategory: 'Aptitude' | 'DSA' }) {
  const { addProblem } = useApp();
  const [form, setForm] = useState<Omit<Problem, 'id' | 'addedAt'>>({
    name: '', category: activeCategory, topic: activeCategory === 'DSA' ? 'Arrays' : 'Quant: Percentages', difficulty: 'Medium', platform: activeCategory === 'DSA' ? 'LeetCode' : 'Other', status: 'Todo', notes: '', isPriority: false,
  });

  const set = (k: keyof typeof form, v: string | boolean) => setForm((p) => ({ ...p, [k]: v }));

  const submit = () => {
    if (!form.name.trim() || !form.topic.trim()) return;
    addProblem(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-card border border-border/20 rounded-[32px] shadow-2xl w-full max-w-lg my-auto"
      >
        <div className="flex items-center justify-between px-10 py-8 border-b border-border/10 bg-muted/20">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30 shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]">
                <Target className="w-6 h-6 text-primary" />
             </div>
             <h2 className="text-foreground font-black uppercase tracking-[0.2em] text-sm">Add New Problem</h2>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-muted/50 rounded-2xl transition-all">
            <X className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>
        
        <div className="px-8 py-6 space-y-5">
          <div>
            <label className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mb-3 block ml-1">Problem Title</label>
            <input
              autoFocus value={form.name} onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. 4Sum, LRU Cache, Number System Phase 1..."
              className="w-full bg-muted/40 border border-border/10 rounded-[20px] px-6 py-4 text-foreground text-md font-bold focus:outline-none focus:border-primary transition-all placeholder:opacity-30"
            />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="col-span-1">
              <label className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mb-3 block ml-1">Difficulty Tier</label>
              <select value={form.difficulty} onChange={(e) => set('difficulty', e.target.value as Difficulty)}
                className="w-full bg-muted/40 border border-border/10 rounded-[20px] px-6 py-4 text-foreground text-sm font-bold focus:outline-none focus:border-primary appearance-none cursor-pointer">
                {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((d) => <option key={d} className="bg-card text-foreground">{d} Level</option>)}
              </select>
            </div>
            <div className="col-span-1">
               <label className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mb-3 block ml-1">Practice Platform</label>
               <select value={form.platform} onChange={(e) => set('platform', e.target.value as Platform)}
                 className="w-full bg-muted/40 border border-border/10 rounded-[20px] px-6 py-4 text-foreground text-sm font-bold focus:outline-none focus:border-primary appearance-none cursor-pointer">
                 {(['LeetCode', 'GFG', 'CodeVita', 'Other'] as Platform[]).map((p) => <option key={p} className="bg-card text-foreground">{p} Format</option>)}
               </select>
            </div>
          </div>

          <div>
             <label className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mb-3 block ml-1">Sector / Topic</label>
             <input value={form.topic} onChange={(e) => set('topic', e.target.value)} placeholder="e.g. Dynamic Programming, Graph Theory..."
               className="w-full bg-muted/40 border border-border/10 rounded-[20px] px-6 py-4 text-foreground text-sm font-bold focus:outline-none focus:border-primary transition-all" />
          </div>

          <div>
            <label className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mb-3 block ml-1">Notes & Solution Logic</label>
            <textarea
              value={form.notes} onChange={(e) => set('notes', e.target.value)}
              placeholder="Record the core algorithmic logic or key blockers encountered..."
              rows={2}
              className="w-full bg-muted/40 border border-border/10 rounded-[20px] px-5 py-4 text-foreground text-sm font-medium focus:outline-none focus:border-primary transition-all resize-none leading-relaxed placeholder:opacity-30"
            />
          </div>
          <div className="flex items-center justify-between px-4 py-3 bg-rose-500/5 border border-rose-500/20 rounded-[16px]">
            <div>
              <p className="text-sm font-black text-foreground">High Priority</p>
              <p className="text-[10px] text-muted-foreground opacity-60 font-bold uppercase tracking-wider">Flag as must-do before placement</p>
            </div>
            <button onClick={() => set('isPriority', !form.isPriority)} className={`w-11 h-6 rounded-full transition-all duration-300 relative ${form.isPriority ? 'bg-rose-500' : 'bg-muted/60'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${form.isPriority ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        </div>

        <div className="bg-muted/20 px-8 py-6 flex gap-4">
           <button onClick={onClose} className="flex-1 py-4 rounded-[20px] border border-border/10 text-muted-foreground font-black uppercase tracking-[0.3em] text-[11px] hover:text-foreground hover:bg-muted/40 transition-all">Cancel</button>
           <button 
             onClick={submit} disabled={!form.name.trim() || !form.topic.trim()}
             className="flex-[2] py-4 rounded-[20px] bg-primary text-foreground font-black uppercase tracking-[0.3em] text-[11px] shadow-[0_8px_24px_rgba(var(--primary-rgb),0.3)] hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
           >
             Add Problem
           </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Edit Problem Modal ────────────────────────────────────────────────────────

function EditProblemModal({ problem, onClose }: { problem: Problem, onClose: () => void }) {
  const { updateProblem } = useApp();
  const [form, setForm] = useState<Omit<Problem, 'id' | 'addedAt'>>({
    name: problem.name,
    category: problem.category,
    topic: problem.topic,
    difficulty: problem.difficulty,
    platform: problem.platform,
    status: problem.status,
    notes: problem.notes,
    isPriority: problem.isPriority ?? false,
  });

  const set = (k: keyof typeof form, v: string | boolean) => setForm((p) => ({ ...p, [k]: v }));

  const submit = () => {
    if (!form.name.trim() || !form.topic.trim()) return;
    updateProblem(problem.id, form);
    onClose();
  };

  const isAptitude = problem.category === 'Aptitude';

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-card border border-border/20 rounded-[32px] shadow-2xl w-full max-w-lg my-auto"
      >
        <div className="flex items-center justify-between px-10 py-8 border-b border-border/10 bg-muted/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center border border-amber-500/30">
              <Pencil className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-foreground font-black uppercase tracking-[0.2em] text-sm">Edit Problem</h2>
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider opacity-60">{problem.category} — {problem.topic}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-muted/50 rounded-2xl transition-all">
            <X className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>

        <div className="px-8 py-6 space-y-5">
          {/* Name */}
          <div>
            <label className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mb-3 block ml-1">Problem Title</label>
            <input
              autoFocus value={form.name} onChange={(e) => set('name', e.target.value)}
              placeholder="Problem name..."
              className="w-full bg-muted/40 border border-border/10 rounded-[20px] px-6 py-4 text-foreground text-md font-bold focus:outline-none focus:border-primary transition-all placeholder:opacity-30"
            />
          </div>

          {/* Topic */}
          <div>
            <label className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mb-3 block ml-1">{isAptitude ? 'Aptitude Topic' : 'DSA Topic'}</label>
            <input value={form.topic} onChange={(e) => set('topic', e.target.value)}
              placeholder={isAptitude ? 'e.g. Quant: Percentages' : 'e.g. Arrays, Dynamic Programming...'}
              className="w-full bg-muted/40 border border-border/10 rounded-[20px] px-6 py-4 text-foreground text-sm font-bold focus:outline-none focus:border-primary transition-all" />
          </div>

          {/* Difficulty + Platform */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mb-3 block ml-1">Difficulty</label>
              <select value={form.difficulty} onChange={(e) => set('difficulty', e.target.value as Difficulty)}
                className="w-full bg-muted/40 border border-border/10 rounded-[20px] px-6 py-4 text-foreground text-sm font-bold focus:outline-none focus:border-primary appearance-none cursor-pointer">
                {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((d) => <option key={d} className="bg-card text-foreground">{d} Level</option>)}
              </select>
            </div>
            <div>
              <label className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mb-3 block ml-1">Platform</label>
              <select value={form.platform} onChange={(e) => set('platform', e.target.value as Platform)}
                className="w-full bg-muted/40 border border-border/10 rounded-[20px] px-6 py-4 text-foreground text-sm font-bold focus:outline-none focus:border-primary appearance-none cursor-pointer">
                {(['LeetCode', 'GFG', 'CodeVita', 'Other'] as Platform[]).map((p) => <option key={p} className="bg-card text-foreground">{p}</option>)}
              </select>
            </div>
          </div>

          {/* Priority toggle */}
          <div className="flex items-center justify-between px-5 py-4 bg-rose-500/5 border border-rose-500/20 rounded-[20px]">
            <div>
              <p className="text-sm font-black text-foreground">High Priority</p>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider opacity-60">Mark as must-do before placement</p>
            </div>
            <button
              onClick={() => set('isPriority', !form.isPriority)}
              className={`w-12 h-6 rounded-full transition-all duration-300 relative ${
                form.isPriority ? 'bg-rose-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]' : 'bg-muted/60'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${
                form.isPriority ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>

          {/* Notes */}
          <div>
            <label className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mb-3 block ml-1">Notes & Solution Logic</label>
            <textarea
              value={form.notes} onChange={(e) => set('notes', e.target.value)}
              placeholder="Record the core logic or key blockers..."
              rows={3}
              className="w-full bg-muted/40 border border-border/10 rounded-[24px] px-6 py-5 text-foreground text-sm font-medium focus:outline-none focus:border-primary transition-all resize-none leading-relaxed placeholder:opacity-30"
            />
          </div>
        </div>

        <div className="bg-muted/20 px-8 py-6 flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 rounded-[20px] border border-border/10 text-muted-foreground font-black uppercase tracking-[0.3em] text-[11px] hover:text-foreground hover:bg-muted/40 transition-all">Cancel</button>
          <button
            onClick={submit} disabled={!form.name.trim() || !form.topic.trim()}
            className="flex-[2] py-4 rounded-[20px] bg-amber-500 text-foreground font-black uppercase tracking-[0.3em] text-[11px] shadow-[0_8px_24px_rgba(245,158,11,0.3)] hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── PERSONAL DSA SHEET View ────────────────────────────────────────────────────────

export default function DSATrackerView() {
  const { state, updateProblem, deleteProblem } = useApp();
  const [activeTab, setActiveTab] = useState<'Aptitude' | 'DSA'>('DSA');
  const [showModal, setShowModal] = useState(false);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  const [search, setSearch] = useState('');
  const [filterTopic, setFilterTopic] = useState('All');
  const [filterDiff, setFilterDiff] = useState<Difficulty | 'All'>('All');
  const [filterStatus, setFilterStatus] = useState<ProblemStatus | 'All'>('All');
  const [sortKey, setSortKey] = useState<'name' | 'difficulty' | 'status' | 'addedAt'>('addedAt');
  const [sortAsc, setSortAsc] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');

  const tabProblems = state.problems.filter(p => p.category === activeTab);
  const uniqueTopics = useMemo(() => Array.from(new Set(tabProblems.map(p => p.topic))).sort(), [tabProblems]);

  type FlatListItem =
    | { type: 'header'; topic: string; count: number }
    | { type: 'problem'; problem: Problem };

  const problems = useMemo(() => {
    let list = tabProblems;
    if (search) list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.topic.toLowerCase().includes(search.toLowerCase()));
    if (filterTopic !== 'All') list = list.filter((p) => p.topic === filterTopic);
    if (filterDiff !== 'All') list = list.filter((p) => p.difficulty === filterDiff);
    if (filterStatus !== 'All') list = list.filter((p) => p.status === filterStatus);
    
    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'addedAt') cmp = a.addedAt.localeCompare(b.addedAt);
      else if (sortKey === 'difficulty') cmp = (a.difficulty === 'Easy' ? 0 : a.difficulty === 'Medium' ? 1 : 2) - (b.difficulty === 'Easy' ? 0 : b.difficulty === 'Medium' ? 1 : 2);
      else if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortKey === 'status') cmp = a.status.localeCompare(b.status);
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [tabProblems, search, filterTopic, filterDiff, filterStatus, sortKey, sortAsc]);

  const groupedProblems = useMemo(() => {
    const map = new Map<string, typeof problems>();
    problems.forEach(p => {
      if (!map.has(p.topic)) map.set(p.topic, []);
      map.get(p.topic)!.push(p);
    });
    return Array.from(map.entries());
  }, [problems]);

  const flatList = useMemo<FlatListItem[]>(() => {
    const items: FlatListItem[] = [];
    groupedProblems.forEach(([topic, groupProps]) => {
      items.push({ type: 'header', topic, count: groupProps.length });
      groupProps.forEach((problem) => {
        items.push({ type: 'problem', problem });
      });
    });
    return items;
  }, [groupedProblems]);

  const stats = {
    total: tabProblems.length,
    done: tabProblems.filter((p) => p.status === 'Done').length,
    prio: tabProblems.filter((p) => p.isPriority && p.status !== 'Done').length,
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-12 gap-10"
    >
      {showModal && <AddProblemModal onClose={() => setShowModal(false)} activeCategory={activeTab} />}
      {editingProblem && <EditProblemModal problem={editingProblem} onClose={() => setEditingProblem(null)} />}

      {/* Hero Stats */}
      <BentoCard className="col-span-12 lg:col-span-8 overflow-hidden relative">
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10 py-4">
           <div className="max-w-md">
              <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center mb-8 border border-primary/30 shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]">
                 <Target className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-4xl font-black text-foreground mb-4 leading-none tracking-tight uppercase">PERSONAL DSA SHEET</h2>
              <p className="text-muted-foreground text-md font-medium leading-relaxed">
                 Active preparation pipeline. Currently tracking <span className="text-primary font-black">{stats.total} total problems</span>. 
                 Mastery level is currently at <span className="text-primary font-black">{Math.round((stats.done / stats.total) * 100 || 0)}% completed</span>.
              </p>
           </div>
           
           <div className="flex gap-14 items-center">
              <div className="text-center group">
                 <p className="text-6xl font-black text-foreground mb-4 group-hover:text-primary transition-all tabular-nums tracking-tighter">{stats.done}</p>
                 <p className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground underline underline-offset-[14px] decoration-primary/30 decoration-4">Completed</p>
              </div>
              <div className="text-center group">
                 <p className="text-6xl font-black text-foreground mb-4 group-hover:text-amber-500 transition-all tabular-nums tracking-tighter">{stats.prio}</p>
                 <p className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground underline underline-offset-[14px] decoration-amber-500/30 decoration-4">High Risk</p>
              </div>
           </div>
        </div>
      </BentoCard>

      <BentoCard className="col-span-12 lg:col-span-4" title="Prep Accuracy">
         <div className="flex items-center justify-center h-full py-4">
            <ActivityRing value={stats.done} max={stats.total} color="var(--primary)" label="Topic Mastery" />
         </div>
      </BentoCard>

      {/* Category Segmented Control - Notion Style */}
      <div className="col-span-12 flex flex-col md:flex-row items-center justify-between gap-6 pb-6">
         <div className="flex items-center gap-8 border-b border-border/5 w-full md:w-auto">
            {['DSA', 'Aptitude'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`relative pb-4 px-2 text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-200 flex items-center gap-2.5 ${
                  activeTab === tab 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'DSA' ? <Zap className="w-3.5 h-3.5" /> : <Activity className="w-3.5 h-3.5" />}
                <span>{tab}</span>
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
         </div>

         <button
            onClick={() => setShowModal(true)}
            className="w-full md:w-auto flex items-center justify-center gap-4 px-10 py-5 bg-card border border-border/10 hover:border-primary/40 text-foreground rounded-[24px] text-xs font-black uppercase tracking-[0.3em] transition-all group shadow-xl"
         >
            <Plus className="w-5 h-5 text-primary group-hover:rotate-90 transition-transform duration-500" /> 
            TRACK NEW PROBLEM
         </button>
      </div>

      {/* Main List Console */}
      <div className="col-span-12 lg:col-span-9 space-y-8">
         {/* Filters Bento */}
         <motion.div variants={itemVariants} className="bento-card !p-6 bg-muted/10 backdrop-blur-sm">
            <div className="flex flex-col xl:flex-row gap-6 items-center">
               <div className="relative flex-1 w-full">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground opacity-40" />
                  <input
                    value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search problems..."
                    className="w-full bg-card/60 border border-border/10 rounded-[18px] pl-14 pr-6 py-4 text-foreground text-sm font-bold focus:outline-none focus:border-primary/40 placeholder:opacity-30"
                  />
               </div>
               <div className="flex gap-4 w-full xl:w-auto">
                  <select value={filterTopic} onChange={(e) => setFilterTopic(e.target.value)}
                    className="bg-card/60 border border-border/10 rounded-[18px] px-6 py-4 text-muted-foreground text-[11px] font-black uppercase tracking-[0.2em] focus:outline-none focus:border-primary/40 appearance-none flex-1 min-w-[160px] cursor-pointer">
                    <option value="All">Sector: Global</option>
                    {uniqueTopics.map((t) => <option key={t}>{t}</option>)}
                  </select>
                  <select value={filterDiff} onChange={(e) => setFilterDiff(e.target.value as Difficulty | 'All')}
                    className="bg-card/60 border border-border/10 rounded-[18px] px-6 py-4 text-muted-foreground text-[11px] font-black uppercase tracking-[0.2em] focus:outline-none focus:border-primary/40 appearance-none flex-1 min-w-[160px] cursor-pointer"
                  >
                    <option value="All">Tier: Dynamic</option>
                    {['Easy', 'Medium', 'Hard'].map((d) => <option key={d}>{d} Alert</option>)}
                  </select>
               </div>
            </div>
         </motion.div>

         {/* Problem Bento List */}
         <div className="space-y-6">
            <AnimatePresence mode="popLayout">
               {problems.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-32 text-center border-2 border-dashed border-border/10 rounded-[40px] bg-muted/5"
                  >
                     <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-10" />
                     <p className="text-muted-foreground text-[13px] font-black uppercase tracking-[0.4em]">No problems found in this category</p>
                  </motion.div>
               ) : (
                  <div className="h-[600px] w-full border border-border/10 rounded-[32px] overflow-hidden bg-muted/5 relative">
                    {(() => {
                      const Row = ({ index, style }: { index: number, style: React.CSSProperties }) => {
                        const item = flatList[index];
                        if (item.type === 'header') {
                          return (
                            <div style={style}>
                              <TopicHeader topic={item.topic} count={item.count} />
                            </div>
                          );
                        }
                        return (
                          <div style={style} className="px-2 pt-1 pb-3">
                            <ProblemItem
                              problem={item.problem}
                              onUpdate={updateProblem}
                              onDelete={deleteProblem}
                              onEdit={setEditingProblem}
                              editingNote={editingNote}
                              setEditingNote={setEditingNote}
                              noteDraft={noteDraft}
                              setNoteDraft={setNoteDraft}
                            />
                          </div>
                        );
                      };

                      return (
                        <List
                          rowCount={flatList.length}
                          rowHeight={(index: number) => flatList[index].type === 'header' ? 72 : 152}
                          style={{ height: 600, width: '100%' }}
                          className="scrollbar-hide"
                          rowComponent={Row as any}
                          rowProps={{} as any}
                        />
                      );
                    })()}
                  </div>
               )}
            </AnimatePresence>
         </div>
      </div>

      {/* Sidebar Metrics */}
      <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
         <BentoCard title="Study Load" icon={BookOpen} className="h-fit w-full">
            <div className="space-y-5 py-2">
               {[
                 { label: 'Completed', count: stats.done, color: 'text-emerald-500', total: stats.total },
                 { label: 'High Priority', count: stats.prio, color: 'text-primary', total: stats.total },
                 { label: 'Pending Problems', count: stats.total - stats.done, color: 'text-muted-foreground', total: stats.total },
               ].map((item) => {
                 const percentage = item.total ? Math.round((item.count / item.total) * 100) : 0;
                 return (
                   <div key={item.label} className="space-y-2">
                      <div className="flex justify-between items-center">
                         <span className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground opacity-60 leading-none">{item.label}</span>
                         <span className={`text-base font-black ${item.color} tabular-nums leading-none`}>{item.count}</span>
                      </div>
                      <div className="w-full h-2 bg-muted/40 rounded-full overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }} 
                           animate={{ width: `${percentage}%` }} 
                           className={`h-full ${item.color.replace('text', 'bg')} rounded-full`} 
                         />
                      </div>
                   </div>
                 );
               })}
            </div>
         </BentoCard>

         {/* Elite Mastery — High Priority Topics */}
         <div className="bento-card !p-6 relative overflow-hidden group w-full">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="flex items-center gap-4 mb-5 relative z-10">
               <div className="w-10 h-10 shrink-0 bg-primary/20 rounded-[16px] flex items-center justify-center border border-primary/30 shadow-lg group-hover:scale-105 transition-transform">
                  <Star className="w-5 h-5 text-primary" />
               </div>
               <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-muted-foreground opacity-60 leading-none mb-1">Elite Mastery</p>
                  <p className="text-[13px] font-black text-foreground leading-none">High Priority Topics</p>
               </div>
            </div>

            {/* Topic list */}
            <div className="space-y-2.5 relative z-10">
               {uniqueTopics.length === 0 ? (
                 <p className="text-[11px] text-muted-foreground opacity-40 font-bold text-center py-4">No topics yet</p>
               ) : (
                 uniqueTopics.slice(0, 5).map((t, i) => (
                    <motion.div 
                      key={t}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-[14px] bg-muted/30 border border-border/10 hover:border-primary/30 hover:bg-muted/50 transition-all group/item cursor-default"
                    >
                       <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide truncate group-hover/item:text-foreground transition-colors">{t}</span>
                       <LayoutGrid className="w-3.5 h-3.5 text-primary shrink-0 opacity-20 group-hover/item:opacity-80 transition-opacity" />
                    </motion.div>
                 ))
               )}
               {uniqueTopics.length > 5 && (
                 <p className="text-[10px] text-muted-foreground/40 font-bold text-center pt-1">+{uniqueTopics.length - 5} more topics</p>
               )}
            </div>
         </div>
      </div>
    </motion.div>
  );
}
