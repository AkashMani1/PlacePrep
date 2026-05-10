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

// Premium Linear Easing
const premiumEasing = [0.32, 0.72, 0, 1] as any;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: premiumEasing }
  }
};

const SelectField = memo(function SelectField({
  label, className = '', selectClassName = '', children, ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; selectClassName?: string; }) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="mb-1.5 block text-[11px] font-semibold tracking-widest uppercase text-muted-foreground/60">{label}</span>}
      <div className="relative group">
        <select
          {...props}
          className={`w-full appearance-none rounded-xl border border-border/50 dark:border-white/[0.05] bg-black/5 dark:bg-white/[0.02] px-4 py-2.5 pr-10 text-sm font-medium text-foreground outline-none transition-all focus:border-primary/40 focus:bg-black/5 dark:bg-white/[0.04] hover:bg-black/5 dark:bg-white/[0.04] ${selectClassName}`}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors" />
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
      <ProblemItem
        problem={item.problem} onUpdate={updateProblem} onDelete={deleteProblem} onEdit={setEditingProblem}
        editingNote={editingNote} setEditingNote={setEditingNote} noteDraft={noteDraft} setNoteDraft={setNoteDraft}
      />
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
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-12 gap-8">
      <AnimatePresence>
        {showModal && <AddProblemModal onClose={() => setShowModal(false)} activeCategory={activeTab} />}
        {editingProblem && <EditProblemModal problem={editingProblem} onClose={() => setEditingProblem(null)} />}
      </AnimatePresence>

      <BentoCard className="col-span-12 lg:col-span-8 overflow-hidden !p-0">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.03] to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10 px-8 py-6">
           <div className="max-w-md">
              <div className={`w-12 h-12 ${activeTab === 'DSA' ? 'bg-primary/10 border-primary/20' : 'bg-amber-500/10 border-amber-500/20'} rounded-2xl flex items-center justify-center mb-6 border transition-all duration-500`}>
                 <Target className={`w-6 h-6 ${activeTab === 'DSA' ? 'text-primary' : 'text-amber-500'}`} />
              </div>
              <h2 className="text-3xl font-semibold text-foreground mb-3 tracking-tight">Focus Protocol</h2>
              <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                 Active tracking pipeline. Managing <span className={`${activeTab === 'DSA' ? 'text-primary' : 'text-amber-500'} font-semibold transition-colors`}>{stats.total} entries</span>. 
                 Mastery level is at <span className={`${activeTab === 'DSA' ? 'text-primary' : 'text-amber-500'} font-semibold transition-colors`}>{masterPct}%</span>.
              </p>
           </div>
           
           <div className="flex gap-12 items-center pt-4 md:pt-0">
              <div className="text-center">
                 <p className={`text-[40px] font-bold text-foreground mb-1 tabular-nums tracking-tighter`}>{stats.done}</p>
                 <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Completed</p>
              </div>
              <div className="text-center">
                 <p className="text-[40px] font-bold text-foreground mb-1 tabular-nums tracking-tighter">{stats.total - stats.done}</p>
                 <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Pending</p>
              </div>
           </div>
        </div>
      </BentoCard>

      <BentoCard className="col-span-12 lg:col-span-4" title="Mastery Accuracy">
         <div className="flex items-center justify-center h-full py-4">
            <ActivityRing value={stats.done} max={stats.total} color={activeTab === 'DSA' ? 'var(--primary)' : '#f59e0b'} label="Execution Rate" />
         </div>
      </BentoCard>

      {/* Segmented Control & Actions */}
      <div className="col-span-12 flex flex-col md:flex-row items-center justify-between gap-6 pb-2 pt-2">
         <div className="p-1 bg-[#1A1A1C] border border-border/50 dark:border-white/[0.04] rounded-2xl flex items-center gap-1">
            {['DSA', 'Aptitude'].map((tab) => (
              <button
                key={tab} onClick={() => setActiveTab(tab as any)}
                className={`relative px-8 py-2.5 text-xs font-semibold tracking-wide transition-all duration-300 flex items-center gap-2.5 rounded-xl ${
                  activeTab === tab ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {activeTab === tab && (
                  <motion.div layoutId="activeCategoryBg" className="absolute inset-0 bg-black/5 dark:bg-white/[0.04] border border-white/[0.08] rounded-xl shadow-sm" transition={{ duration: 0.4, ease: premiumEasing }} />
                )}
                <span className="relative z-10 flex items-center gap-2.5">
                  {tab === 'DSA' ? <Zap className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                  {tab}
                </span>
              </button>
            ))}
         </div>

         <button onClick={() => setShowModal(true)} className="flex items-center gap-2.5 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95">
            <Plus className="w-4 h-4" /> Add Problem
         </button>
      </div>

      {/* Main List Area */}
      <div className="col-span-12 lg:col-span-9 space-y-6">
         {/* Sleek Filter Bar */}
         <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                 <input
                   value={search} onChange={(e) => setSearch(e.target.value)}
                   placeholder="Search problems, topics..."
                   className="w-full bg-card border border-border/50 dark:border-white/[0.04] rounded-xl py-2.5 pl-11 pr-4 text-sm font-medium text-foreground focus:outline-none focus:border-primary/40 focus:bg-black/5 dark:bg-white/[0.02] transition-colors"
                 />
              </div>
              <button onClick={() => setShowFilters(!showFilters)} className={`ml-4 flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[11px] font-semibold tracking-wide uppercase transition-colors ${showFilters ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-black/5 dark:bg-white/[0.02] border-border/50 dark:border-white/[0.04] text-muted-foreground hover:bg-black/5 dark:bg-white/[0.04]'}`}>
                <Filter className="w-3.5 h-3.5" /> Filters
              </button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: premiumEasing }} className="overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-card border border-border/50 dark:border-white/[0.04]">
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
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-24 text-center border border-dashed border-white/[0.08] rounded-[24px] bg-white/[0.01]">
                  <AlertTriangle className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-muted-foreground/60 text-xs font-semibold uppercase tracking-widest">No entries found</p>
               </motion.div>
            ) : (
               <div className="h-[650px] w-full rounded-[24px] border border-border/50 dark:border-white/[0.04] bg-card p-3 relative shadow-inner">
                 <List
                   style={{ height: 626, width: '100%' }}
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
      <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
         <BentoCard title="Resource Allocation" icon={BookOpen} className="h-fit w-full">
            <div className="space-y-6 py-2">
               {[
                 { label: 'Completed', count: stats.done, color: activeTab === 'DSA' ? 'text-primary' : 'text-amber-500', bg: activeTab === 'DSA' ? 'bg-primary' : 'bg-amber-500', total: stats.total },
                 { label: 'Pending Queue', count: stats.total - stats.done, color: 'text-muted-foreground', bg: 'bg-muted-foreground', total: stats.total },
               ].map((item) => {
                 const percentage = item.total ? Math.round((item.count / item.total) * 100) : 0;
                 return (
                   <div key={item.label} className="space-y-2">
                      <div className="flex justify-between items-center">
                         <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 leading-none">{item.label}</span>
                         <span className={`text-sm font-bold ${item.color} tabular-nums leading-none`}>{item.count}</span>
                      </div>
                      <div className="w-full h-1.5 bg-black/5 dark:bg-white/[0.05] rounded-full overflow-hidden">
                         <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 1, ease: premiumEasing }} className={`h-full ${item.bg} rounded-full`} />
                      </div>
                   </div>
                 );
               })}
            </div>
         </BentoCard>

         <BentoCard title="Topic Hierarchy" icon={LayoutGrid} className="relative overflow-hidden w-full">
            <div className="space-y-1.5 relative z-10 pt-2">
               {uniqueTopics.length === 0 ? (
                 <p className="text-[11px] text-muted-foreground/40 font-medium text-center py-4">No categories populated</p>
               ) : (
                 uniqueTopics.slice(0, 6).map((t, i) => (
                    <motion.div 
                      key={t} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05, ease: premiumEasing }}
                      className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-black/5 dark:bg-white/[0.02] border border-border/50 dark:border-white/[0.04] hover:bg-black/5 dark:bg-white/[0.04] transition-all cursor-default group`}
                    >
                       <span className="text-xs font-medium text-muted-foreground/80 truncate group-hover:text-foreground transition-colors">{t}</span>
                       <Activity className={`w-3.5 h-3.5 ${activeTab === 'DSA' ? 'text-primary/40' : 'text-amber-500/40'} shrink-0 group-hover:text-opacity-100 transition-opacity`} />
                    </motion.div>
                 ))
               )}
               {uniqueTopics.length > 6 && (
                 <p className="text-[10px] text-muted-foreground/40 font-semibold text-center pt-2 uppercase tracking-widest">+{uniqueTopics.length - 6} More</p>
               )}
            </div>
         </BentoCard>
      </div>
    </motion.div>
  );
}
