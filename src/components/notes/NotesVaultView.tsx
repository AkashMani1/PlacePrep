'use client';

import { useState } from 'react';
import { 
  Plus, Trash2, Library, X, Edit3, ChevronDown, ChevronRight, Save,
  Star, ShieldCheck, Database, Zap, BookOpen, Brain, Fingerprint,
  PenTool, Eye, Search, Layers, Activity, Lock, Unlock, Terminal,
  Cpu, LayoutDashboard, Target
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { StarStory, KnowledgeCategory, CSSubcategory } from '@/lib/types';
import { BentoCard, ActivityRing } from '@/components/ui/Bento';

// ── Animation Variants ────────────────────────────────────────────────────────

const magneticSpring = { type: 'spring', stiffness: 150, damping: 15, mass: 0.1 } as any;
const smoothSpring = { type: 'spring', stiffness: 100, damping: 20 } as any;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
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

// ── STAR Story Form ────────────────────────────────────────────────────────────

function StarForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<StarStory>;
  onSave: (s: Omit<StarStory, 'id'>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    tag: initial?.tag ?? 'Leadership',
    situation: initial?.situation ?? '',
    task: initial?.task ?? '',
    action: initial?.action ?? '',
    result: initial?.result ?? '',
  });
  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const valid = form.situation && form.task && form.action && form.result;

  const TAGS = ['Leadership', 'Problem Solving', 'Teamwork', 'Innovation', 'Conflict Resolution', 'Failure & Learning', 'Initiative'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={smoothSpring}
      className="bg-card/80 backdrop-blur-2xl border border-white/10 rounded-[40px] p-10 space-y-10 relative overflow-hidden group hover:border-primary/40 transition-all shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
    >
      <div className="absolute -top-10 -right-10 p-12 opacity-5 group-hover:opacity-20 transition-opacity duration-700">
         <Star className="w-24 h-24 text-primary" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
        <div>
           <label className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] mb-3 block ml-1">Core Scenario</label>
           <select value={form.tag} onChange={(e) => set('tag', e.target.value)}
            className="w-full bg-background border border-border/10 rounded-[24px] px-6 py-4 text-foreground text-md font-bold focus:outline-none focus:border-primary/40 appearance-none transition-all cursor-pointer shadow-inner">
            {TAGS.map((t) => <option key={t} className="bg-card text-foreground">{t} Dynamic</option>)}
           </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10">
        {[
          { k: 'situation' as const, label: 'SITUATION', icon: Database, color: 'text-secondary', placeholder: 'Standardized context/background reporting...' },
          { k: 'task' as const, label: 'TASK', icon: Target, color: 'text-primary', placeholder: 'Specific project goals and requirements...' },
          { k: 'action' as const, label: 'ACTION', icon: Zap, color: 'text-primary', placeholder: 'Action items and implementation steps...' },
          { k: 'result' as const, label: 'RESULT', icon: ShieldCheck, color: 'text-emerald-500', placeholder: 'Quantified metrics and project outcomes...' },
        ].map(({ k, label, icon: Icon, color, placeholder }) => (
          <div key={k} className="space-y-4">
            <div className="flex items-center gap-3 mb-1 px-1">
               <div className={`p-2 rounded-lg bg-black/5 dark:bg-white/5 border border-border/50 ${color} shadow-sm`}>
                  <Icon className="w-4 h-4" />
               </div>
               <label className="text-muted-foreground text-[11px] font-black uppercase tracking-[0.3em]">{label} CORE</label>
            </div>
            <textarea
              value={form[k]}
              onChange={(e) => set(k, e.target.value)}
              placeholder={placeholder}
              rows={4}
              className="w-full bg-background border border-border/10 rounded-[28px] px-6 py-5 text-foreground text-sm focus:outline-none focus:border-primary/40 resize-none transition-all placeholder:opacity-30 font-medium leading-relaxed shadow-inner"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-6 pt-6 relative z-10">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onCancel} className="flex-1 py-5 rounded-[24px] border border-white/10 text-muted-foreground hover:text-foreground hover:bg-black/10 dark:hover:bg-white/10 text-[11px] font-black uppercase tracking-[0.3em] transition-all">Cancel</motion.button>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => valid && onSave(form)} disabled={!valid}
          className="flex-[2] py-5 rounded-[24px] bg-primary text-white disabled:opacity-30 text-[11px] font-black uppercase tracking-[0.3em] transition-all shadow-[0_10px_30px_rgba(var(--primary-rgb),0.4)] flex items-center justify-center gap-3">
          <Save className="w-5 h-5" /> Commit to Vault
        </motion.button>
      </div>
    </motion.div>
  );
}

// ── Knowledge Base ─────────────────────────────────────────────────────────────

export default function NotesVaultView() {
  const { state, addStar, updateStar, deleteStar, updateKnowledgeItem, addKnowledgeItem, deleteKnowledgeItem } = useApp();
  const [tab, setTab] = useState<'star' | 'hr' | 'core' | 'aptitude'>('star');
  
  // STAR specific state
  const [showStarForm, setShowStarForm] = useState(false);
  const [editStarId, setEditStarId] = useState<string | null>(null);
  const [expandedStar, setExpandedStar] = useState<string | null>(null);
  
  // Knowledge Base specific state
  const [editKbId, setEditKbId] = useState<string | null>(null);
  const [kbDraft, setKbDraft] = useState('');
  const [newKbQ, setNewKbQ] = useState('');
  const [addingKb, setAddingKb] = useState(false);
  const [selectedSubcat, setSelectedSubcat] = useState<CSSubcategory | 'All'>('All');

  const CS_SUBCATS: Array<CSSubcategory | 'All'> = ['All', 'OOPs', 'Java', 'DBMS', 'Data Structures', 'C Programming', 'Algorithms', 'Computer Networks', 'Operating Systems'];

  const SUBCAT_ICONS: Record<string, string> = {
    'All': '🗂️', 'OOPs': '🔷', 'Java': '☕', 'DBMS': '🗄️',
    'Data Structures': '🌲', 'C Programming': '⚙️', 'Algorithms': '📐',
    'Computer Networks': '🌐', 'Operating Systems': '💻',
  };

  const TABS = [
     { id: 'star' as const, label: 'STAR Stories', icon: Star },
    { id: 'core' as const, label: 'Computer Science', filter: 'Core CS' as KnowledgeCategory, icon: Cpu },
    { id: 'aptitude' as const, label: 'Aptitude Hub', filter: 'Aptitude' as KnowledgeCategory, icon: Activity },
    { id: 'hr' as const, label: 'HR Interview', filter: 'HR' as KnowledgeCategory, icon: Fingerprint },
  ];

  const currentTabConfig = TABS.find((t) => t.id === tab);
  const filteredKnowledge = currentTabConfig?.filter
    ? (state.knowledgeBase || []).filter((k) => {
        if (k.category !== currentTabConfig.filter) return false;
        if (tab === 'core' && selectedSubcat !== 'All') return k.subcategory === selectedSubcat;
        return true;
      })
    : [];

  const STORIES_COUNT = state.stars.length;
  const KB_COUNT = (state.knowledgeBase || []).length;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-12 gap-8 relative pb-24"
    >
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />

      {/* ── Massive Typography Header ── */}
      <div className="col-span-12 mb-4">
        <div className="overflow-hidden mb-4 flex items-center gap-4">
            <motion.div 
               initial={{ rotate: -90, scale: 0 }} 
               animate={{ rotate: 0, scale: 1 }} 
               transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
               className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center shadow-[0_0_40px_rgba(var(--primary-rgb),0.4)]"
            >
               <Library className="w-7 h-7 text-white" />
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/40 leading-[1.1]">
               <motion.span variants={textReveal} className="inline-block">Notes</motion.span>{' '}
               <motion.span variants={textReveal} className="inline-block">Vault.</motion.span>
            </h1>
        </div>
        <motion.p variants={itemVariants} className="text-muted-foreground text-lg md:text-xl font-medium max-w-2xl tracking-tight pl-18">
          The ultimate intelligence repository. Secure your behavioral stories and deep CS concepts in one unshakeable framework.
        </motion.p>
      </div>
      
      {/* Row 1: Hero & Density */}
      <BentoCard className="col-span-12 lg:col-span-8 overflow-hidden backdrop-blur-2xl bg-card/60 shadow-2xl border-white/10 relative">
         <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10 py-4">
            <div className="max-w-md">
               <h2 className="text-4xl font-black text-foreground mb-4 leading-none tracking-tighter uppercase">KNOWLEDGE BASE</h2>
               <p className="text-muted-foreground text-base font-semibold leading-relaxed">
                  Central repository for all placement preparation. Currently documenting <span className="text-primary font-black">{STORIES_COUNT} preparation stories</span> and 
                  <span className="text-secondary font-black"> {KB_COUNT} key study topics</span>.
               </p>
            </div>
            
            <div className="flex gap-14 items-center bg-black/5 dark:bg-white/5 p-8 rounded-3xl border border-white/5 shadow-inner">
               <div className="text-center group">
                  <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/60 mb-2 transition-all tabular-nums tracking-tighter group-hover:from-primary group-hover:to-indigo-500">{STORIES_COUNT}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Action Plan</p>
               </div>
               <div className="w-px h-16 bg-border/50" />
               <div className="text-center group">
                  <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/60 mb-2 transition-all tabular-nums tracking-tighter group-hover:from-secondary group-hover:to-purple-500">{KB_COUNT}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Topics</p>
               </div>
            </div>
         </div>
      </BentoCard>

      <BentoCard className="col-span-12 lg:col-span-4 backdrop-blur-2xl bg-card/60 shadow-2xl border-white/10" title="Retention Analytics">
         <div className="flex items-center justify-center h-full py-6">
            <ActivityRing value={Math.min(100, STORIES_COUNT * 10 + KB_COUNT * 2)} max={100} color="var(--primary)" label="Overall Revision" />
         </div>
      </BentoCard>

      {/* Row 2: Navigation Segmented Control - Notion Style */}
      <div className="col-span-12 flex flex-col gap-6 pb-6 mt-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-2 p-2 rounded-2xl bg-card/60 backdrop-blur-xl border border-white/10 shadow-xl">
            {TABS.map(({ id, label, icon: Icon }) => (
               <button
                  key={id}
                  onClick={() => { setTab(id); setAddingKb(false); setEditKbId(null); setSelectedSubcat('All'); }}
                  className={`relative px-6 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-3 z-10 ${
                    tab === id 
                      ? 'text-white shadow-[0_5px_15px_rgba(var(--primary-rgb),0.3)]' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  }`}
               >
                  <Icon className="w-4 h-4" /> 
                  <span>{label}</span>
                  {tab === id && (
                    <motion.div 
                      layoutId="vaultTabIndicator"
                      className="absolute inset-0 bg-primary border border-primary/50 rounded-xl -z-10"
                      transition={smoothSpring}
                    />
                  )}
               </button>
            ))}
         </div>

         <AnimatePresence mode="wait">
           {tab === 'star' ? (
             !showStarForm && (
               <motion.button
                  key="add-star"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={magneticSpring}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => { setShowStarForm(true); setEditStarId(null); }}
                  className="w-full lg:w-auto flex items-center justify-center gap-4 px-10 py-5 bg-primary text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] transition-all group shadow-[0_10px_30px_rgba(var(--primary-rgb),0.4)]"
               >
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" /> 
                  ADD INTERVIEW STORY
               </motion.button>
             )
           ) : (
             !addingKb && (
               <motion.button
                  key="add-kb"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={magneticSpring}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => setAddingKb(true)}
                  className="w-full lg:w-auto flex items-center justify-center gap-4 px-10 py-5 bg-card/80 backdrop-blur-xl border border-white/10 text-foreground rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] transition-all group shadow-xl hover:border-secondary/50"
               >
                  <Plus className="w-5 h-5 text-secondary group-hover:rotate-90 transition-transform duration-500" /> 
                  ADD TOPIC ENTRY
               </motion.button>
             )
           )}
         </AnimatePresence>
        </div>

        {/* Subcategory filter pills — only for Computer Science tab */}
        <AnimatePresence>
          {tab === 'core' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={smoothSpring}
              className="flex flex-wrap gap-3"
            >
              {CS_SUBCATS.map((sub) => (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  key={sub}
                  onClick={() => setSelectedSubcat(sub)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] border transition-all duration-300 ${
                    selectedSubcat === sub
                      ? 'bg-secondary text-white border-secondary shadow-[0_10px_20px_rgba(var(--secondary-rgb),0.4)]'
                      : 'bg-card/60 backdrop-blur-xl text-muted-foreground border-white/5 hover:border-secondary/50 hover:text-foreground shadow-lg'
                  }`}
                >
                  <span className="text-base">{SUBCAT_ICONS[sub]}</span>
                  <span>{sub}</span>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    selectedSubcat === sub ? 'bg-white/20 text-white' : 'bg-black/10 dark:bg-white/10 text-muted-foreground'
                  }`}>
                    {sub === 'All'
                      ? (state.knowledgeBase || []).filter(k => k.category === 'Core CS').length
                      : (state.knowledgeBase || []).filter(k => k.category === 'Core CS' && k.subcategory === sub).length
                    }
                  </span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content Area */}
      <div className="col-span-12 space-y-10">
        
        {/* STAR Stories Implementation */}
        {tab === 'star' && (
          <div className="space-y-8">
            <AnimatePresence>
              {showStarForm && editStarId === null && (
                <StarForm onSave={(s) => { addStar(s); setShowStarForm(false); }} onCancel={() => setShowStarForm(false)} />
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
              {state.stars.map((story) => {
                const isOpen = expandedStar === story.id;
                return (
                  <motion.div key={story.id} variants={itemVariants} className="group min-w-0" whileHover={!isOpen ? { scale: 1.02, y: -5 } : {}} transition={magneticSpring}>
                    {editStarId === story.id ? (
                      <StarForm
                        initial={story}
                        onSave={(s) => { updateStar(story.id, s); setEditStarId(null); }}
                        onCancel={() => setEditStarId(null)}
                      />
                    ) : (
                      <motion.div 
                        layout 
                        className={`bg-card/60 backdrop-blur-2xl border border-white/5 rounded-[40px] overflow-hidden hover:border-primary/40 transition-all shadow-xl ${isOpen ? 'ring-2 ring-primary/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)]' : ''}`}
                      >
                        <button onClick={() => setExpandedStar(isOpen ? null : story.id)} className="w-full flex items-center gap-8 px-10 py-10 text-left group/btn">
                           <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center border border-primary/30 bg-primary/10 text-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)] group-hover/btn:scale-110 group-hover/btn:rotate-6 transition-all duration-500`}>
                              <Star className="w-8 h-8" />
                           </div>
                           <div className="flex-1 min-w-0">
                              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-80 block mb-2">{story.tag} Interview Story</span>
                              <h4 className="text-foreground text-2xl font-black tracking-tighter line-clamp-1 uppercase group-hover/btn:text-primary transition-colors">{story.situation}</h4>
                           </div>
                           <motion.div 
                             animate={{ rotate: isOpen ? 180 : 0 }}
                             transition={smoothSpring}
                             className={`p-4 rounded-2xl transition-all duration-500 ${isOpen ? 'text-primary bg-primary/20 shadow-inner' : 'bg-black/5 dark:bg-white/5 text-muted-foreground'}`}
                           >
                              <ChevronDown className="w-6 h-6" />
                           </motion.div>
                        </button>

                        <AnimatePresence>
                          {isOpen && (
                            <motion.div 
                              layout
                              initial={{ opacity: 0, height: 0 }} 
                              animate={{ opacity: 1, height: 'auto' }} 
                              exit={{ opacity: 0, height: 0 }}
                              transition={smoothSpring}
                            >
                               <div className="px-10 pb-12 pt-4 space-y-10 bg-black/5 dark:bg-white/[0.02]">
                                  <div className="h-px bg-border/50 w-full" />
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                     {[
                                       { label: 'SITUATION REPORT', val: story.situation, color: 'text-secondary' },
                                       { label: 'PROJECT TASK', val: story.task, color: 'text-primary' },
                                       { label: 'KEY ACTION', val: story.action, color: 'text-primary' },
                                       { label: 'VERIFIED RESULT', val: story.result, color: 'text-emerald-500' },
                                     ].map(({ label, val, color }) => (
                                       <div key={label} className="space-y-4">
                                          <p className={`text-[10px] font-black uppercase tracking-[0.3em] opacity-80 ${color}`}>{label}</p>
                                          <p className="text-foreground text-sm leading-relaxed font-bold bg-background p-6 rounded-[28px] border border-border/50 shadow-inner min-h-[120px]">
                                             {val}
                                          </p>
                                       </div>
                                     ))}
                                  </div>
                                  <div className="flex gap-6 pt-6 px-1">
                                     <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setEditStarId(story.id)} className="flex items-center gap-3 px-8 py-5 rounded-2xl bg-card border border-white/10 text-muted-foreground hover:text-white hover:bg-white/10 transition-all text-[11px] font-black uppercase tracking-[0.3em] shadow-lg"><Edit3 className="w-5 h-5" /> MODIFY RECORD</motion.button>
                                     <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => deleteStar(story.id)} className="flex items-center gap-3 px-8 py-5 rounded-2xl border border-rose-500/20 text-rose-500 hover:text-white hover:bg-rose-500 transition-all text-[11px] font-black uppercase tracking-[0.3em] shadow-lg"><Trash2 className="w-5 h-5" /> PURGE</motion.button>
                                  </div>
                               </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </motion.div>
                );
               })}
            </div>
          </div>
        )}

        {/* Knowledge Base Tabs Terminal Implementation */}
        {tab !== 'star' && currentTabConfig && (
          <div className="space-y-10">
            <AnimatePresence>
              {addingKb && (
                <motion.div 
                  initial={{ opacity: 0, y: -20, filter: 'blur(10px)' }} 
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} 
                  exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                  transition={smoothSpring}
                  className="bg-card/80 border border-secondary/30 rounded-[40px] p-10 space-y-8 backdrop-blur-2xl shadow-[0_20px_60px_rgba(var(--secondary-rgb),0.2)]"
                >
                  <div className="flex items-center gap-4 text-secondary mb-2">
                     <div className="p-3 bg-secondary/10 rounded-2xl border border-secondary/20 shadow-[0_0_20px_rgba(var(--secondary-rgb),0.3)]">
                        <Terminal className="w-6 h-6" />
                     </div>
                     <span className="text-[11px] font-black uppercase tracking-[0.4em]">Topic Entry Setup</span>
                  </div>
                  <input
                    autoFocus
                    value={newKbQ}
                    onChange={(e) => setNewKbQ(e.target.value)}
                    placeholder="Identify specific topic category (e.g. Memory Management, API Design)..."
                    className="w-full bg-background border border-border/20 rounded-[28px] px-8 py-6 text-foreground text-xl font-black focus:outline-none focus:border-secondary transition-all placeholder:opacity-30 shadow-inner"
                  />
                  <div className="flex gap-6">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { if (newKbQ.trim() && currentTabConfig.filter) { addKnowledgeItem(newKbQ.trim(), currentTabConfig.filter, tab === 'core' && selectedSubcat !== 'All' ? selectedSubcat as CSSubcategory : undefined); setNewKbQ(''); setAddingKb(false); } }}
                      className="px-10 py-5 bg-secondary text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] shadow-[0_10px_30px_rgba(var(--secondary-rgb),0.4)] transition-all">Save Topic</motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setAddingKb(false); setNewKbQ(''); }}
                      className="px-10 py-5 border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] transition-all">Cancel setup</motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
              {filteredKnowledge.map((qa) => (
                <motion.div key={qa.id} variants={itemVariants} whileHover={editKbId !== qa.id ? { scale: 1.02, y: -5 } : {}} transition={magneticSpring} className="bg-card/60 backdrop-blur-2xl border border-white/5 rounded-[40px] p-10 space-y-8 group/kb hover:border-secondary/40 transition-all shadow-xl shadow-black/5 relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-48 h-48 bg-secondary/10 blur-[100px] opacity-0 group-hover/kb:opacity-100 transition-opacity duration-1000`} />
                  <div className="flex items-start justify-between gap-6 relative z-10">
                    <div className="flex items-start gap-5 flex-1 min-w-0">
                      <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center border border-secondary/30 shadow-[0_0_20px_rgba(var(--secondary-rgb),0.2)] group-hover/kb:scale-110 group-hover/kb:rotate-6 transition-all duration-500 shrink-0">
                        <Terminal className="w-7 h-7 text-secondary" />
                      </div>
                      <div className="min-w-0">
                        {qa.subcategory && (
                          <span className="inline-flex items-center gap-1.5 mb-3 px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/30 text-secondary text-[10px] font-black uppercase tracking-[0.3em] shadow-sm">
                            <span className="text-sm">{SUBCAT_ICONS[qa.subcategory]}</span> {qa.subcategory}
                          </span>
                        )}
                        <h4 className="text-foreground text-2xl font-black tracking-tighter leading-snug uppercase">{qa.question}</h4>
                      </div>
                    </div>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => deleteKnowledgeItem(qa.id)} className="p-4 text-muted-foreground hover:text-rose-500 bg-black/5 dark:bg-white/5 hover:bg-rose-500/20 rounded-2xl transition-all shrink-0"><Trash2 className="w-5 h-5" /></motion.button>
                  </div>

                  {editKbId === qa.id ? (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-6 relative z-10 transition-all">
                      <textarea
                        autoFocus
                        value={kbDraft}
                        onChange={(e) => setKbDraft(e.target.value)}
                        rows={8}
                        className="w-full bg-background border border-secondary/40 rounded-[28px] px-6 py-6 text-foreground text-[15px] focus:outline-none resize-none font-mono leading-relaxed shadow-inner"
                      />
                      <div className="flex gap-4">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { updateKnowledgeItem(qa.id, kbDraft); setEditKbId(null); }}
                          className="px-8 py-4 bg-secondary text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-[0_10px_20px_rgba(var(--secondary-rgb),0.3)] transition-all">Save Topic</motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setEditKbId(null)} className="px-8 py-4 border border-white/10 text-muted-foreground rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:text-foreground hover:bg-white/10 transition-all shadow-lg">Discard</motion.button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="space-y-8 relative z-10">
                      <div className="bg-background rounded-[32px] p-8 border border-border/50 relative shadow-inner">
                        <p className="text-foreground text-[15px] leading-relaxed whitespace-pre-wrap font-bold opacity-90">
                          {qa.answer || 'EMPTY: No details provided for this topic. Update with notes immediately.'}
                        </p>
                      </div>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setEditKbId(qa.id); setKbDraft(qa.answer); }}
                        className="flex items-center gap-4 text-muted-foreground hover:text-secondary transition-all text-[11px] font-black uppercase tracking-[0.3em] w-fit group/edit">
                        <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 group-hover/edit:bg-secondary/20 border border-border/50 group-hover/edit:border-secondary/30 transition-all shadow-sm">
                           <Edit3 className="w-5 h-5" />
                        </div>
                        Update Topic Entry
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {filteredKnowledge.length === 0 && !addingKb && (
               <motion.div variants={itemVariants} className="text-center py-40 border-2 border-dashed border-white/10 rounded-[48px] bg-card/20 backdrop-blur-sm">
                  <Cpu className="w-20 h-20 text-muted-foreground mx-auto mb-8 opacity-20" />
                  <p className="text-muted-foreground text-[13px] font-black uppercase tracking-[0.4em]">No topic entries found in this category</p>
               </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
