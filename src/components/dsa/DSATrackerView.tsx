/* Developed by Akash Mani - This site is developed by Akash Mani. Original watermark of Akash Mani. */
'use client';

import { useState, useMemo } from 'react';
import { Plus, Target, Search, Zap, Activity, BookOpen, Star, AlertTriangle, ArrowUpDown, ChevronDown } from 'lucide-react';
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

function SelectField({
  label,
  className = '',
  selectClassName = '',
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  className?: string;
  selectClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/60">
          {label}
        </span>
      )}
      <div className="relative">
        <select
          {...props}
          className={`w-full appearance-none rounded-[18px] border border-border/10 bg-card/70 px-4 py-3 pr-11 text-sm font-black text-foreground outline-none transition-all focus:border-primary/40 focus:bg-card ${selectClassName}`}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
      </div>
    </label>
  );
}

// ── PERSONAL MUST-DO LIST View ────────────────────────────────────────────────────────

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
  const [collapsedSubtopics, setCollapsedSubtopics] = useState<Record<string, boolean>>({});

  const tabProblems = state.problems.filter(p => p.category === activeTab);
  const uniqueTopics = useMemo(() => Array.from(new Set(tabProblems.map(p => p.topic))).sort(), [tabProblems]);

  type FlatListItem =
    | { type: 'header'; topic: string; count: number; solved: number; variant: 'topic' | 'subtopic'; groupKey?: string; collapsed?: boolean }
    | { type: 'problem'; problem: Problem };

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

      return Array.from(topicMap.entries()).map(([topic, subtopics]) => ({
        topic,
        subtopics: Array.from(subtopics.entries()),
      }));
    }

    const map = new Map<string, Problem[]>();
    problems.forEach((problem) => {
      if (!map.has(problem.topic)) map.set(problem.topic, []);
      map.get(problem.topic)!.push(problem);
    });
    return Array.from(map.entries()).map(([topic, topicProblems]) => ({
      topic,
      subtopics: [[topic, topicProblems]] as [string, Problem[]][],
    }));
  }, [activeTab, problems]);

  const flatList = useMemo<FlatListItem[]>(() => {
    const items: FlatListItem[] = [];
    groupedProblems.forEach(({ topic, subtopics }) => {
      const topicCount = subtopics.reduce((total, [, topicProblems]) => total + topicProblems.length, 0);
      const topicSolved = subtopics.reduce((total, [, topicProblems]) => total + topicProblems.filter((problem) => problem.status === 'Done').length, 0);
      items.push({ type: 'header', topic, count: topicCount, solved: topicSolved, variant: 'topic' });
      subtopics.forEach(([subtopic, topicProblems]) => {
        const groupKey = `${activeTab}:${topic}:${subtopic}`;
        const collapsed = Boolean(collapsedSubtopics[groupKey]);
        const solved = topicProblems.filter((problem) => problem.status === 'Done').length;
        if (activeTab === 'Aptitude') {
          items.push({ type: 'header', topic: subtopic, count: topicProblems.length, solved, variant: 'subtopic', groupKey, collapsed });
        }
        if (activeTab === 'Aptitude' && collapsed) {
          return;
        }
        topicProblems.forEach((problem) => {
          items.push({ type: 'problem', problem });
        });
      });
    });
    return items;
  }, [activeTab, collapsedSubtopics, groupedProblems]);

  const stats = {
    total: tabProblems.length,
    done: tabProblems.filter((p) => p.status === 'Done').length,
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-12 gap-10"
    >
      <AnimatePresence>
        {showModal && <AddProblemModal onClose={() => setShowModal(false)} activeCategory={activeTab} />}
        {editingProblem && <EditProblemModal problem={editingProblem} onClose={() => setEditingProblem(null)} />}
      </AnimatePresence>

      {/* Hero Stats */}
      <BentoCard className="col-span-12 lg:col-span-8 overflow-hidden relative">
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10 py-4">
           <div className="max-w-md">
              <div className={`w-14 h-14 ${activeTab === 'DSA' ? 'bg-primary/20 border-primary/30 shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]' : 'bg-amber-500/20 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]'} rounded-2xl flex items-center justify-center mb-8 border transition-all duration-500`}>
                 <Target className={`w-7 h-7 ${activeTab === 'DSA' ? 'text-primary' : 'text-amber-500'}`} />
              </div>
              <h2 className="text-4xl font-black text-foreground mb-4 leading-none tracking-tight uppercase">MUST-DO LIST</h2>
              <p className="text-muted-foreground text-md font-medium leading-relaxed">
                 Active preparation pipeline. Currently tracking <span className={`${activeTab === 'DSA' ? 'text-primary' : 'text-amber-500'} font-black transition-colors`}>{stats.total} total problems</span>. 
                 Mastery level is currently at <span className={`${activeTab === 'DSA' ? 'text-primary' : 'text-amber-500'} font-black transition-colors`}>{Math.round((stats.done / stats.total) * 100 || 0)}% completed</span>.
              </p>
           </div>
           
           <div className="flex gap-14 items-center">
              <div className="text-center group">
                 <p className={`text-6xl font-black text-foreground mb-4 ${activeTab === 'DSA' ? 'group-hover:text-primary' : 'group-hover:text-amber-500'} transition-all tabular-nums tracking-tighter`}>{stats.done}</p>
                 <p className={`text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground underline underline-offset-[14px] ${activeTab === 'DSA' ? 'decoration-primary/30' : 'decoration-amber-500/30'} decoration-4 transition-all`}>Completed</p>
              </div>
              <div className="text-center group">
                 <p className={`text-6xl font-black text-foreground mb-4 ${activeTab === 'DSA' ? 'group-hover:text-primary' : 'group-hover:text-amber-500'} transition-all tabular-nums tracking-tighter`}>{stats.total - stats.done}</p>
                 <p className={`text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground underline underline-offset-[14px] ${activeTab === 'DSA' ? 'decoration-foreground/20' : 'decoration-amber-500/20'} decoration-4 transition-all`}>Pending</p>
              </div>
           </div>
        </div>
      </BentoCard>

      <BentoCard className="col-span-12 lg:col-span-4" title="Prep Accuracy">
         <div className="flex items-center justify-center h-full py-4">
            <ActivityRing value={stats.done} max={stats.total} color={activeTab === 'DSA' ? 'var(--primary)' : '#f59e0b'} label="Topic Mastery" />
         </div>
      </BentoCard>

      {/* Category Segmented Control - Premium Dock Style */}
      <div className="col-span-12 flex flex-col md:flex-row items-center justify-between gap-6 pb-10">
         <div className="p-1.5 bg-card/30 backdrop-blur-2xl border border-border/10 rounded-[26px] flex items-center gap-1 shadow-2xl">
            {['DSA', 'Aptitude'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`relative px-8 py-3.5 text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-3 rounded-[20px] group/btn ${
                  activeTab === tab 
                    ? 'text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activeCategoryBg"
                    className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-[20px] shadow-[0_8px_30px_rgba(var(--primary-rgb),0.15)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-3">
                  {tab === 'DSA' ? (
                    <Zap className={`w-4 h-4 transition-transform duration-500 ${activeTab === tab ? 'text-primary scale-110' : 'group-hover/btn:scale-110'}`} />
                  ) : (
                    <Activity className={`w-4 h-4 transition-transform duration-500 ${activeTab === tab ? 'text-primary scale-110' : 'group-hover/btn:scale-110'}`} />
                  )}
                  {tab}
                </span>
              </button>
            ))}
         </div>

         <div className="flex items-center gap-3">
           <button
              onClick={() => setShowModal(true)}
              className={`w-full md:w-auto flex items-center justify-center gap-4 px-10 py-5 ${activeTab === 'DSA' ? 'bg-primary shadow-[0_10px_30px_rgba(var(--primary-rgb),0.3)]' : 'bg-amber-500 shadow-[0_10px_30px_rgba(245,158,11,0.3)]'} text-white rounded-[24px] text-xs font-black uppercase tracking-[0.3em] transition-all group hover:scale-[1.02] active:scale-95`}
           >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" /> 
              TRACK NEW PROBLEM
           </button>

           <div className="hidden xl:flex items-center gap-1.5 p-1.5 bg-card/40 backdrop-blur-xl border border-border/10 rounded-[20px]">
              <div className="px-4 py-2 flex flex-col items-center border-r border-border/10">
                 <span className={`text-[10px] font-black ${activeTab === 'DSA' ? 'text-primary' : 'text-amber-500'} uppercase tracking-wider transition-colors`}>{stats.done}</span>
                 <span className="text-[8px] font-bold text-muted-foreground uppercase opacity-60">Solved</span>
              </div>
              <div className="px-4 py-2 flex flex-col items-center">
                 <span className="text-[10px] font-black text-foreground uppercase tracking-wider">{stats.total - stats.done}</span>
                 <span className="text-[8px] font-bold text-muted-foreground uppercase opacity-60">Left</span>
              </div>
           </div>
         </div>
      </div>

      {/* Main List Console */}
      <div className="col-span-12 lg:col-span-9 space-y-8">
         {/* Filters Bento */}
         <motion.div variants={itemVariants} className="rounded-[28px] border border-border/10 bg-card/70 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.18)] backdrop-blur-xl">
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
               <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${activeTab === 'DSA' ? 'border-primary/20 bg-primary/10 text-primary' : 'border-amber-500/20 bg-amber-500/10 text-amber-500'} transition-all`}>
                  <ArrowUpDown className="h-4 w-4" />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/60">List Controls</p>
                  <p className="text-sm font-black text-foreground">Search, filter, and sort your sheet</p>
               </div>
              </div>
              <button
                onClick={() => setSortAsc((current) => !current)}
                className={`inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-[16px] border ${activeTab === 'DSA' ? 'border-primary/15 bg-primary/10 text-primary hover:border-primary/35 hover:bg-primary/15' : 'border-amber-500/15 bg-amber-500/10 text-amber-500 hover:border-amber-500/35 hover:bg-amber-500/15'} px-4 text-[11px] font-black uppercase tracking-[0.12em] transition-all md:w-auto`}
              >
                <ArrowUpDown className="h-4 w-4" />
                {sortAsc ? 'Ascending' : 'Descending'}
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
               <label className="block md:col-span-2 xl:col-span-4">
                  <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/60">
                    Search
                  </span>
                  <div className="relative">
                     <Search className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
                     <input
                       value={search}
                       onChange={(e) => setSearch(e.target.value)}
                       placeholder="Search problems, topics, subtopics..."
                       className="w-full rounded-[18px] border border-border/10 bg-card/70 py-3 pl-12 pr-4 text-sm font-bold text-foreground outline-none transition-all focus:border-primary/40 focus:bg-card placeholder:opacity-30"
                     />
                  </div>
               </label>
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
               <SelectField value={sortKey} onChange={(e) => setSortKey(e.target.value as typeof sortKey)} label="Sort">
                  <option value="addedAt">Date Added</option>
                  <option value="name">Name</option>
                  <option value="difficulty">Difficulty</option>
                  <option value="status">Status</option>
               </SelectField>
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
                  <div className="h-[640px] w-full rounded-[32px] border border-border/10 bg-muted/5 p-2 relative">
                    {(() => {
                      const Row = ({ index, style }: { index: number, style: React.CSSProperties }) => {
                        const item = flatList[index];
                        if (item.type === 'header') {
                          return (
                            <div style={style}>
                              <TopicHeader
                                topic={item.topic}
                                count={item.count}
                                solved={item.solved}
                                variant={item.variant}
                                collapsed={item.collapsed}
                                onToggle={
                                  item.groupKey
                                    ? () => setCollapsedSubtopics((current) => ({ ...current, [item.groupKey!]: !current[item.groupKey!] }))
                                    : undefined
                                }
                              />
                            </div>
                          );
                        }
                        return (
                          <div style={style} className="px-2 pt-1 pb-4">
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
                          height={624}
                          itemCount={flatList.length}
                          itemSize={(index: number) => {
                            const item = flatList[index];
                            if (item.type === 'header') {
                              return item.variant === 'topic' ? 62 : 74;
                            }
                            return item.problem.category === 'Aptitude' ? 252 : 182;
                          }}
                          width="100%"
                          className="scrollbar-hide"
                        >
                          {Row}
                        </List>
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
                 { label: 'Completed', count: stats.done, color: activeTab === 'DSA' ? 'text-emerald-500' : 'text-amber-500', total: stats.total },
                 { label: 'Pending Problems', count: stats.total - stats.done, color: 'text-muted-foreground', total: stats.total },
               ].map((item) => {
                 const percentage = item.total ? Math.round((item.count / item.total) * 100) : 0;
                 return (
                   <div key={item.label} className="space-y-2">
                      <div className="flex justify-between items-center">
                         <span className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground opacity-60 leading-none">{item.label}</span>
                         <span className={`text-base font-black ${item.color} tabular-nums leading-none transition-colors`}>{item.count}</span>
                      </div>
                      <div className="w-full h-2 bg-muted/40 rounded-full overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }} 
                           animate={{ width: `${percentage}%` }} 
                           className={`h-full ${item.color.replace('text', 'bg')} rounded-full transition-colors`} 
                         />
                      </div>
                   </div>
                 );
               })}
            </div>
         </BentoCard>

         {/* Topic Overview */}
         <div className="bento-card !p-6 relative overflow-hidden group w-full">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="flex items-center gap-4 mb-5 relative z-10">
               <div className={`w-10 h-10 shrink-0 ${activeTab === 'DSA' ? 'bg-primary/20 border-primary/30' : 'bg-amber-500/20 border-amber-500/30'} rounded-[16px] flex items-center justify-center border shadow-lg group-hover:scale-105 transition-all`}>
                  <Star className={`w-5 h-5 ${activeTab === 'DSA' ? 'text-primary' : 'text-amber-500'}`} />
               </div>
               <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-muted-foreground opacity-60 leading-none mb-1">Topic Overview</p>
                  <p className="text-[13px] font-black text-foreground leading-none">Top sections in view</p>
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
                      className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-[14px] bg-muted/30 border border-border/10 hover:${activeTab === 'DSA' ? 'border-primary/30' : 'border-amber-500/30'} hover:bg-muted/50 transition-all group/item cursor-default`}
                    >
                       <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide truncate group-hover/item:text-foreground transition-colors">{t}</span>
                       <Activity className={`w-3.5 h-3.5 ${activeTab === 'DSA' ? 'text-primary' : 'text-amber-500'} shrink-0 opacity-20 group-hover/item:opacity-80 transition-opacity`} />
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
