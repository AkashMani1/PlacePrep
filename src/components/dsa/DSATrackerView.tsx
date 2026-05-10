/* Developed by Akash Mani - Premium Study OS */
'use client';

import { useState, useMemo, memo } from 'react';
import { Target, Search, Zap, Activity, BookOpen, Star, AlertTriangle, ArrowUpDown, ChevronDown, Plus, LayoutGrid, List as ListIcon, Filter } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Problem, Difficulty, ProblemStatus } from '@/lib/types';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { BentoCard, ActivityRing } from '@/components/ui/Bento';
import { List } from 'react-window';
import React from 'react';

// Modular Component Imports
import ProblemItem from './components/ProblemItem';
import TopicHeader from './components/TopicHeader';
import AddProblemModal from './modals/AddProblemModal';
import EditProblemModal from './modals/EditProblemModal';

// Premium Linear Easing & Springs
const premiumEasing = [0.32, 0.72, 0, 1] as any;
const magneticSpring = { type: 'spring', stiffness: 150, damping: 15, mass: 0.1 } as any;
const smoothSpring = { type: 'spring', stiffness: 100, damping: 20 } as any;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 }
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

const SelectField = memo(function SelectField({
  label, className = '', selectClassName = '', children, ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; selectClassName?: string; }) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="mb-1.5 block text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground ml-1">{label}</span>}
      <div className="relative group">
        <select
          {...props}
          className={`w-full appearance-none rounded-2xl border border-white/10 bg-background px-6 py-4 pr-10 text-sm font-bold text-foreground outline-none transition-all focus:border-primary/50 shadow-inner ${selectClassName}`}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
      </div>
    </label>
  );
});

// Extracted Row Component for react-window to prevent recreation on every render
const VirtualRow = memo(({ index, style, flatList, updateProblem, deleteProblem, setEditingProblem, setCollapsedSubtopics, editingNote, setEditingNote, noteDraft, setNoteDraft }: any) => {
  const item = flatList[index];

  if (item.type === 'header') {
    return (
      <div style={style} className="pr-3">
        <TopicHeader
          topic={item.topic} count={item.count} solved={item.solved} variant={item.variant} collapsed={item.collapsed}
          onToggle={item.groupKey ? () => setCollapsedSubtopics((curr: any) => ({ ...curr, [item.groupKey!]: !curr[item.groupKey!] })) : undefined}
        />
      </div>
    );
  }

  return (
    <div style={style} className="px-1 pt-1 pb-4 pr-4">
      <motion.div whileHover={{ scale: 1.01, y: -2 }} transition={magneticSpring}>
        <ProblemItem
          problem={item.problem} onUpdate={updateProblem} onDelete={deleteProblem} onEdit={setEditingProblem}
          editingNote={editingNote} setEditingNote={setEditingNote} noteDraft={noteDraft} setNoteDraft={setNoteDraft}
        />
      </motion.div>
    </div>
  );
});

export default function DSATrackerView() {
  const { state, updateProblem, deleteProblem } = useApp();
  const [activeTab, setActiveTab] = useState<'Aptitude' | 'DSA'>('DSA');
  const [showModal, setShowModal] = useState(false);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  
  // Filters state
  const [search, setSearch] = useState('');
  const [filterTopic, setFilterTopic] = useState('All');
  const [filterDiff, setFilterDiff] = useState<Difficulty | 'All'>('All');
  const [filterStatus, setFilterStatus] = useState<ProblemStatus | 'All'>('All');
  const [sortKey, setSortKey] = useState<'name' | 'difficulty' | 'status' | 'addedAt'>('addedAt');
  const [sortAsc, setSortAsc] = useState(false);
  
  // UI State
  const [showFilters, setShowFilters] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [collapsedSubtopics, setCollapsedSubtopics] = useState<Record<string, boolean>>({});

  const tabProblems = state.problems.filter(p => p.category === activeTab);
  const uniqueTopics = useMemo(() => Array.from(new Set(tabProblems.map(p => p.topic))).sort(), [tabProblems]);

  const problems = useMemo(() => {
    let list = tabProblems;
    if (search) list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.topic.toLowerCase().includes(search.toLowerCase()) || p.subtopic?.toLowerCase().includes(search.toLowerCase()));
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
    if (activeTab === 'Aptitude') {
      const topicMap = new Map<string, Map<string, Problem[]>>();
      problems.forEach((problem) => {
        const subtopic = problem.subtopic || 'General';
        if (!topicMap.has(problem.topic)) topicMap.set(problem.topic, new Map<string, Problem[]>());
        const subtopicMap = topicMap.get(problem.topic)!;
        if (!subtopicMap.has(subtopic)) subtopicMap.set(subtopic, []);
        subtopicMap.get(subtopic)!.push(problem);
      });
      return Array.from(topicMap.entries()).map(([topic, subtopics]) => ({ topic, subtopics: Array.from(subtopics.entries()) }));
    }
    const map = new Map<string, Problem[]>();
    problems.forEach((problem) => {
      if (!map.has(problem.topic)) map.set(problem.topic, []);
      map.get(problem.topic)!.push(problem);
    });
    return Array.from(map.entries()).map(([topic, topicProblems]) => ({ topic, subtopics: [[topic, topicProblems]] as [string, Problem[]][] }));
  }, [activeTab, problems]);

  const flatList = useMemo(() => {
    const items: any[] = [];
    groupedProblems.forEach(({ topic, subtopics }) => {
      const topicCount = subtopics.reduce((total, [, topicProblems]) => total + topicProblems.length, 0);
      const topicSolved = subtopics.reduce((total, [, topicProblems]) => total + topicProblems.filter((problem) => problem.status === 'Done').length, 0);
      items.push({ type: 'header', topic, count: topicCount, solved: topicSolved, variant: 'topic' });
      subtopics.forEach(([subtopic, topicProblems]) => {
        const groupKey = `${activeTab}:${topic}:${subtopic}`;
        const collapsed = Boolean(collapsedSubtopics[groupKey]);
        const solved = topicProblems.filter((problem) => problem.status === 'Done').length;
        if (activeTab === 'Aptitude') items.push({ type: 'header', topic: subtopic, count: topicProblems.length, solved, variant: 'subtopic', groupKey, collapsed });
        if (activeTab === 'Aptitude' && collapsed) return;
        topicProblems.forEach((problem) => items.push({ type: 'problem', problem }));
      });
    });
    return items;
  }, [activeTab, collapsedSubtopics, groupedProblems]);

  const itemData = useMemo(() => ({
    flatList, updateProblem, deleteProblem, setEditingProblem, setCollapsedSubtopics, editingNote, setEditingNote, noteDraft, setNoteDraft
  }), [flatList, updateProblem, deleteProblem, setEditingProblem, setCollapsedSubtopics, editingNote, setEditingNote, noteDraft, setNoteDraft]);

  const stats = { total: tabProblems.length, done: tabProblems.filter((p) => p.status === 'Done').length };
  const masterPct = stats.total ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-12 gap-8 relative pb-24">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-500/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />

      <AnimatePresence>
        {showModal && <AddProblemModal onClose={() => setShowModal(false)} activeCategory={activeTab} />}
        {editingProblem && <EditProblemModal problem={editingProblem} onClose={() => setEditingProblem(null)} />}
      </AnimatePresence>

      {/* ── Massive Typography Header ── */}
      <div className="col-span-12 mb-4">
        <div className="overflow-hidden mb-4 flex items-center gap-4">
            <motion.div 
               initial={{ rotate: -90, scale: 0 }} 
               animate={{ rotate: 0, scale: 1 }} 
               transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
               className={`w-14 h-14 rounded-3xl bg-gradient-to-tr ${activeTab === 'DSA' ? 'from-primary to-indigo-500 shadow-[0_0_40px_rgba(var(--primary-rgb),0.4)]' : 'from-amber-500 to-orange-500 shadow-[0_0_40px_rgba(245,158,11,0.4)]'} flex items-center justify-center`}
            >
               <Target className="w-7 h-7 text-white" />
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/40 leading-[1.1]">
               <motion.span variants={textReveal} className="inline-block">Must Do</motion.span>{' '}
               <motion.span variants={textReveal} className="inline-block">List.</motion.span>
            </h1>
        </div>
        <motion.p variants={itemVariants} className="text-muted-foreground text-lg md:text-xl font-medium max-w-2xl tracking-tight pl-18">
          The ultimate execution tracker. Organize, execute, and bulletproof your DSA and Aptitude readiness in one place.
        </motion.p>
      </div>

      {/* Row 1: Hero & Readiness */}
      <BentoCard className="col-span-12 lg:col-span-8 overflow-hidden backdrop-blur-2xl bg-card/60 shadow-2xl border-white/10 relative !p-0">
        <div className={`absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t ${activeTab === 'DSA' ? 'from-primary/5' : 'from-amber-500/5'} to-transparent pointer-events-none`} />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10 px-10 py-8">
           <div className="max-w-md">
              <h2 className="text-4xl font-black text-foreground mb-4 leading-none tracking-tighter uppercase">FOCUS PROTOCOL</h2>
              <p className="text-muted-foreground text-base font-semibold leading-relaxed">
                 Active tracking pipeline. Managing <span className={`${activeTab === 'DSA' ? 'text-primary' : 'text-amber-500'} font-black transition-colors`}>{stats.total} entries</span>. 
                 Mastery level is at <span className={`${activeTab === 'DSA' ? 'text-primary' : 'text-amber-500'} font-black transition-colors`}>{masterPct}%</span>.
              </p>
           </div>
           
           <div className="flex gap-14 items-center bg-black/5 dark:bg-white/5 p-8 rounded-3xl border border-white/5 shadow-inner">
              <div className="text-center group">
                 <p className={`text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/60 mb-2 transition-all tabular-nums tracking-tighter group-hover:from-${activeTab === 'DSA' ? 'primary' : 'amber-400'} group-hover:to-${activeTab === 'DSA' ? 'indigo-500' : 'orange-500'}`}>{stats.done}</p>
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Completed</p>
              </div>
              <div className="w-px h-16 bg-border/50" />
              <div className="text-center group">
                 <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/60 mb-2 transition-all tabular-nums tracking-tighter">{stats.total - stats.done}</p>
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Pending</p>
              </div>
           </div>
        </div>
      </BentoCard>

      <BentoCard className="col-span-12 lg:col-span-4 backdrop-blur-2xl bg-card/60 shadow-2xl border-white/10" title="Mastery Accuracy">
         <div className="flex items-center justify-center h-full py-6">
            <ActivityRing value={stats.done} max={stats.total} color={activeTab === 'DSA' ? 'var(--primary)' : '#f59e0b'} label="Execution Rate" />
         </div>
      </BentoCard>

      {/* Segmented Control & Actions */}
      <div className="col-span-12 flex flex-col md:flex-row items-center justify-between gap-6 pb-2 mt-4">
         <div className="p-2 bg-card/60 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center gap-2 shadow-xl">
            {['DSA', 'Aptitude'].map((tab) => (
              <button
                key={tab} onClick={() => setActiveTab(tab as any)}
                className={`relative px-10 py-3.5 text-sm font-bold tracking-widest uppercase transition-all duration-300 flex items-center gap-3 rounded-xl z-10 ${
                  activeTab === tab ? 'text-white shadow-[0_5px_15px_rgba(0,0,0,0.3)]' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
              >
                {activeTab === tab && (
                  <motion.div layoutId="activeCategoryBg" className={`absolute inset-0 ${tab === 'DSA' ? 'bg-primary border-primary/50' : 'bg-amber-500 border-amber-500/50'} border rounded-xl -z-10`} transition={smoothSpring} />
                )}
                <span className="relative z-10 flex items-center gap-2.5">
                  {tab === 'DSA' ? <Zap className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                  {tab}
                </span>
              </button>
            ))}
         </div>

         <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={magneticSpring}
            onClick={() => setShowModal(true)} 
            className={`flex items-center gap-3 px-8 py-5 ${activeTab === 'DSA' ? 'bg-primary shadow-[0_10px_30px_rgba(var(--primary-rgb),0.4)]' : 'bg-amber-500 shadow-[0_10px_30px_rgba(245,158,11,0.4)]'} text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] transition-all`}
         >
            <Plus className="w-5 h-5" /> Add Problem
         </motion.button>
      </div>

      {/* Main List Area */}
      <div className="col-span-12 lg:col-span-9 space-y-8 mt-2">
         {/* Sleek Filter Bar */}
         <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-xl">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                 <input
                   value={search} onChange={(e) => setSearch(e.target.value)}
                   placeholder="Search problems, topics..."
                   className="w-full bg-card/80 backdrop-blur-xl border border-white/10 shadow-inner rounded-2xl py-5 pl-14 pr-6 text-base font-bold text-foreground focus:outline-none focus:border-primary/50 transition-all placeholder:opacity-40"
                 />
              </div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={magneticSpring} onClick={() => setShowFilters(!showFilters)} className={`ml-6 flex items-center gap-3 px-8 py-5 rounded-2xl border text-[11px] font-black tracking-[0.3em] uppercase transition-all shadow-lg ${showFilters ? 'bg-primary text-white border-primary/50' : 'bg-card/60 backdrop-blur-xl border-white/10 text-muted-foreground hover:text-foreground'}`}>
                <Filter className="w-4 h-4" /> Filters
              </motion.button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={smoothSpring} className="overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-8 rounded-[32px] bg-card/60 backdrop-blur-2xl border border-white/10 shadow-2xl">
                     <SelectField value={filterTopic} onChange={(e) => setFilterTopic(e.target.value)} label="Topic">
                        <option value="All">All Topics</option>
                        {uniqueTopics.map((t) => <option key={t}>{t}</option>)}
                     </SelectField>
                     <SelectField value={filterDiff} onChange={(e) => setFilterDiff(e.target.value as Difficulty | 'All')} label="Difficulty">
                        <option value="All">All Levels</option>
                        {['Easy', 'Medium', 'Hard'].map((d) => <option key={d}>{d}</option>)}
                     </SelectField>
                     <SelectField value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as ProblemStatus | 'All')} label="Status">
                        <option value="All">All Status</option>
                        {(['Todo', 'Done', 'Revisit'] as ProblemStatus[]).map((status) => <option key={status}>{status}</option>)}
                     </SelectField>
                     <SelectField value={sortKey} onChange={(e) => setSortKey(e.target.value as typeof sortKey)} label="Sort By">
                        <option value="addedAt">Date Added</option>
                        <option value="name">Name</option>
                        <option value="difficulty">Difficulty</option>
                        <option value="status">Status</option>
                     </SelectField>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
         </div>

         <AnimatePresence mode="popLayout">
            {problems.length === 0 ? (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-32 text-center border-2 border-dashed border-white/10 rounded-[48px] bg-card/20 backdrop-blur-sm">
                  <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-20" />
                  <p className="text-muted-foreground text-[13px] font-black uppercase tracking-[0.4em]">No entries found</p>
               </motion.div>
            ) : (
               <div className="h-[750px] w-full rounded-[40px] border border-white/10 bg-card/60 backdrop-blur-2xl p-6 relative shadow-2xl shadow-black/5">
                 <List
                   style={{ height: 702, width: '100%' }}
                   rowCount={flatList.length}
                   rowProps={itemData}
                   rowHeight={(index: number) => {
                     const item = flatList[index];
                     if (item.type === 'header') return item.variant === 'topic' ? 62 : 74;
                     return item.problem.category === 'Aptitude' ? 252 : 182;
                   }}
                   className="scrollbar-hide"
                   overscanCount={5}
                   rowComponent={VirtualRow as any}
                 />
               </div>
            )}
         </AnimatePresence>
      </div>

      {/* Right Sidebar */}
      <div className="col-span-12 lg:col-span-3 flex flex-col gap-8 mt-2">
         <motion.div whileHover={{ scale: 1.02 }} transition={magneticSpring}>
           <BentoCard title="Resource Allocation" icon={BookOpen} className="h-fit w-full backdrop-blur-2xl bg-card/60 shadow-2xl border-white/10">
              <div className="space-y-8 py-4">
                 {[
                   { label: 'Completed', count: stats.done, color: activeTab === 'DSA' ? 'text-primary' : 'text-amber-500', bg: activeTab === 'DSA' ? 'bg-primary' : 'bg-amber-500', total: stats.total },
                   { label: 'Pending Queue', count: stats.total - stats.done, color: 'text-muted-foreground', bg: 'bg-muted-foreground', total: stats.total },
                 ].map((item) => {
                   const percentage = item.total ? Math.round((item.count / item.total) * 100) : 0;
                   return (
                     <div key={item.label} className="space-y-4">
                        <div className="flex justify-between items-center">
                           <span className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/80 leading-none">{item.label}</span>
                           <span className={`text-xl font-black ${item.color} tabular-nums leading-none`}>{item.count}</span>
                        </div>
                        <div className="w-full h-2.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
                           <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 1, ease: premiumEasing }} className={`h-full ${item.bg} rounded-full`} />
                        </div>
                     </div>
                   );
                 })}
              </div>
           </BentoCard>
         </motion.div>

         <motion.div whileHover={{ scale: 1.02 }} transition={magneticSpring}>
           <BentoCard title="Topic Hierarchy" icon={LayoutGrid} className="relative overflow-hidden w-full backdrop-blur-2xl bg-card/60 shadow-2xl border-white/10">
              <div className="space-y-3 relative z-10 pt-4">
                 {uniqueTopics.length === 0 ? (
                   <p className="text-[11px] text-muted-foreground/60 font-black uppercase tracking-widest text-center py-10">No categories populated</p>
                 ) : (
                   uniqueTopics.slice(0, 8).map((t, i) => (
                      <motion.div 
                        key={t} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05, ...smoothSpring }}
                        className={`flex items-center justify-between gap-4 px-5 py-4 rounded-2xl bg-background border border-border/50 hover:border-${activeTab === 'DSA' ? 'primary/40' : 'amber-500/40'} hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-default group shadow-sm`}
                      >
                         <span className="text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors">{t}</span>
                         <Activity className={`w-4 h-4 ${activeTab === 'DSA' ? 'text-primary/40 group-hover:text-primary' : 'text-amber-500/40 group-hover:text-amber-500'} shrink-0 transition-all`} />
                      </motion.div>
                   ))
                 )}
                 {uniqueTopics.length > 8 && (
                   <p className="text-[10px] text-muted-foreground/60 font-black text-center pt-4 uppercase tracking-[0.3em]">+{uniqueTopics.length - 8} More</p>
                 )}
              </div>
           </BentoCard>
         </motion.div>
      </div>
    </motion.div>
  );
}
