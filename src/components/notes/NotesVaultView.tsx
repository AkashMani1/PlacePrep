/* Developed by Akash Mani - This site is developed by Akash Mani. Original watermark of Akash Mani. */
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
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { 
      duration: 0.6, 
      ease: 'easeOut'
    }
  }
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
      className="bg-card border border-border/20 rounded-[40px] p-10 space-y-10 relative overflow-hidden group hover:border-primary/30 transition-all shadow-2xl"
    >
      <div className="absolute -top-10 -right-10 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
         <Star className="w-24 h-24 text-primary" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
           <label className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] mb-3 block ml-1">Core Scenario</label>
           <select value={form.tag} onChange={(e) => set('tag', e.target.value)}
            className="w-full bg-muted/40 border border-border/10 rounded-[24px] px-6 py-4 text-foreground text-md font-bold focus:outline-none focus:border-primary/40 appearance-none transition-all cursor-pointer">
            {TAGS.map((t) => <option key={t} className="bg-card text-foreground">{t} Dynamic</option>)}
           </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {[
          { k: 'situation' as const, label: 'SITUATION', icon: Database, color: 'text-secondary', placeholder: 'Standardized context/background reporting...' },
          { k: 'task' as const, label: 'TASK', icon: Target, color: 'text-primary', placeholder: 'Specific project goals and requirements...' },
          { k: 'action' as const, label: 'ACTION', icon: Zap, color: 'text-primary', placeholder: 'Action items and implementation steps...' },
          { k: 'result' as const, label: 'RESULT', icon: ShieldCheck, color: 'text-emerald-500', placeholder: 'Quantified metrics and project outcomes...' },
        ].map(({ k, label, icon: Icon, color, placeholder }) => (
          <div key={k} className="space-y-4">
            <div className="flex items-center gap-3 mb-1 px-1">
               <div className={`p-2 rounded-lg bg-muted/40 border border-border/5 ${color}`}>
                  <Icon className="w-4 h-4" />
               </div>
               <label className="text-muted-foreground text-[11px] font-black uppercase tracking-[0.3em]">{label} CORE</label>
            </div>
            <textarea
              value={form[k]}
              onChange={(e) => set(k, e.target.value)}
              placeholder={placeholder}
              rows={4}
              className="w-full bg-muted/40 border border-border/10 rounded-[28px] px-6 py-5 text-foreground text-sm focus:outline-none focus:border-primary/40 resize-none transition-all placeholder:opacity-30 font-medium leading-relaxed"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-6 pt-6">
        <button onClick={onCancel} className="flex-1 py-5 rounded-[24px] border border-border/10 text-muted-foreground hover:text-foreground hover:bg-muted/40 text-[11px] font-black uppercase tracking-[0.3em] transition-all">Cancel</button>
        <button onClick={() => valid && onSave(form)} disabled={!valid}
          className="flex-[2] py-5 rounded-[24px] bg-primary text-foreground disabled:opacity-30 text-[11px] font-black uppercase tracking-[0.3em] transition-all shadow-[0_10px_30px_rgba(var(--primary-rgb),0.3)] hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3">
          <Save className="w-5 h-5" /> Commit to Vault
        </button>
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
      className="grid grid-cols-12 gap-10"
    >
      
      {/* Row 1: Hero & Density */}
      <BentoCard className="col-span-12 lg:col-span-8 overflow-hidden relative">
         <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/5 to-transparent pointer-events_none" />
         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10 py-4">
            <div className="max-w-md">
               <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center mb-8 border border-primary/30 shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]">
                  <Library className="w-7 h-7 text-primary" />
               </div>
               <h2 className="text-4xl font-black text-foreground mb-4 leading-none tracking-tight uppercase">KNOWLEDGE BASE</h2>
               <p className="text-muted-foreground text-md font-medium leading-relaxed">
                  Central repository for all placement preparation. Currently documenting <span className="text-primary font-black">{STORIES_COUNT} preparation stories</span> and 
                  <span className="text-primary font-black">{KB_COUNT} key study topics</span>.
               </p>
            </div>
            
            <div className="flex gap-14 items-center">
               <div className="text-center group">
                  <p className="text-6xl font-black text-foreground mb-4 group-hover:text-primary transition-all tabular-nums tracking-tighter">{STORIES_COUNT}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground underline underline-offset-[14px] decoration-primary/30 decoration-4">Action Plan</p>
               </div>
               <div className="text-center group">
                  <p className="text-6xl font-black text-foreground mb-4 group-hover:text-secondary transition-all tabular-nums tracking-tighter">{KB_COUNT}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground underline underline-offset-[14px] decoration-secondary/30 decoration-4">Topics</p>
               </div>
            </div>
         </div>
      </BentoCard>

      <BentoCard className="col-span-12 lg:col-span-4" title="Retention Analytics">
         <div className="flex items-center justify-center h-full py-4">
            <ActivityRing value={Math.min(100, STORIES_COUNT * 10 + KB_COUNT * 2)} max={100} color="var(--primary)" label="Overall Revision" />
         </div>
      </BentoCard>

      {/* Row 2: Navigation Segmented Control - Notion Style */}
      <div className="col-span-12 flex flex-col gap-4 pb-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/20 border border-border/5">
            {TABS.map(({ id, label, icon: Icon }) => (
               <button
                  key={id}
                  onClick={() => { setTab(id); setAddingKb(false); setEditKbId(null); setSelectedSubcat('All'); }}
                  className={`relative px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2.5 ${
                    tab === id 
                      ? 'text-primary' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/10'
                  }`}
               >
                  <Icon className="w-4 h-4" /> 
                  <span>{label}</span>
                  {tab === id && (
                    <motion.div 
                      layoutId="vaultTabIndicator"
                      className="absolute inset-0 bg-primary/10 border-b-2 border-primary rounded-lg -z-0"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
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
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => { setShowStarForm(true); setEditStarId(null); }}
                  className="w-full lg:w-auto flex items-center justify-center gap-4 px-10 py-5 bg-primary text-foreground rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] transition-all group shadow-[0_10px_30px_rgba(var(--primary-rgb),0.3)] hover:scale-[1.03] active:scale-95"
               >
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" /> 
                  ADD INTERVIEW STORY
               </motion.button>
             )
           ) : (
             !addingKb && (
               <motion.button
                  key="add-kb"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => setAddingKb(true)}
                  className="w-full lg:w-auto flex items-center justify-center gap-4 px-10 py-5 bg-card border border-border/10 text-foreground rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] transition-all group shadow-xl hover:border-secondary/40"
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
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-wrap gap-2"
            >
              {CS_SUBCATS.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubcat(sub)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] border transition-all duration-200 ${
                    selectedSubcat === sub
                      ? 'bg-secondary text-foreground border-secondary shadow-[0_4px_15px_rgba(var(--secondary-rgb),0.3)]'
                      : 'bg-muted/20 text-muted-foreground border-border/10 hover:border-secondary/30 hover:text-foreground'
                  }`}
                >
                  <span>{SUBCAT_ICONS[sub]}</span>
                  <span>{sub}</span>
                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] ${
                    selectedSubcat === sub ? 'bg-white/20' : 'bg-muted/40'
                  }`}>
                    {sub === 'All'
                      ? (state.knowledgeBase || []).filter(k => k.category === 'Core CS').length
                      : (state.knowledgeBase || []).filter(k => k.category === 'Core CS' && k.subcategory === sub).length
                    }
                  </span>
                </button>
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
                  <motion.div key={story.id} variants={itemVariants} className="group min-w-0">
                    {editStarId === story.id ? (
                      <StarForm
                        initial={story}
                        onSave={(s) => { updateStar(story.id, s); setEditStarId(null); }}
                        onCancel={() => setEditStarId(null)}
                      />
                    ) : (
                      <motion.div 
                        layout 
                        className={`bg-card border border-border/10 rounded-[40px] overflow-hidden hover:border-primary/30 transition-all shadow-xl shadow-black/5 ${isOpen ? 'ring-2 ring-primary/10' : ''}`}
                      >
                        <button onClick={() => setExpandedStar(isOpen ? null : story.id)} className="w-full flex items-center gap-8 px-10 py-10 text-left group/btn">
                           <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center border border-primary/30 bg-primary/10 text-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)] group-hover/btn:scale-110 transition-all duration-500`}>
                              <Star className="w-8 h-8" />
                           </div>
                           <div className="flex-1 min-w-0">
                              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60 block mb-2">{story.tag} Interview Story</span>
                              <h4 className="text-foreground text-2xl font-black tracking-tight line-clamp-1 uppercase group-hover/btn:text-primary transition-colors">{story.situation}</h4>
                           </div>
                           <div className={`p-4 rounded-2xl bg-muted/30 text-muted-foreground transition-all duration-500 ${isOpen ? 'rotate-180 text-primary bg-primary/10' : ''}`}>
                              <ChevronDown className="w-6 h-6" />
                           </div>
                        </button>

                        <AnimatePresence>
                          {isOpen && (
                            <motion.div 
                              layout
                              initial={{ opacity: 0, height: 0 }} 
                              animate={{ opacity: 1, height: 'auto' }} 
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            >
                               <div className="px-10 pb-12 pt-4 space-y-10">
                                  <div className="h-px bg-border/10 w-full" />
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                     {[
                                       { label: 'SITUATION REPORT', val: story.situation, color: 'text-secondary' },
                                       { label: 'PROJECT TASK', val: story.task, color: 'text-primary' },
                                       { label: 'KEY ACTION', val: story.action, color: 'text-primary' },
                                       { label: 'VERIFIED RESULT', val: story.result, color: 'text-emerald-500' },
                                     ].map(({ label, val, color }) => (
                                       <div key={label} className="space-y-4">
                                          <p className={`text-[10px] font-black uppercase tracking-[0.3em] opacity-60 ${color}`}>{label}</p>
                                          <p className="text-foreground text-sm leading-relaxed font-bold bg-muted/10 p-6 rounded-[28px] border border-border/5 shadow-inner min-h-[120px]">
                                             {val}
                                          </p>
                                       </div>
                                     ))}
                                  </div>
                                  <div className="flex gap-6 pt-6 px-1">
                                     <button onClick={() => setEditStarId(story.id)} className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-muted/40 border border-border/10 text-muted-foreground hover:text-foreground transition-all text-[11px] font-black uppercase tracking-[0.3em]"><Edit3 className="w-5 h-5" /> MODIFY RECORD</button>
                                     <button onClick={() => deleteStar(story.id)} className="flex items-center gap-3 px-8 py-4 rounded-2xl border border-rose-500/20 text-rose-500/60 hover:text-rose-500 hover:bg-rose-500/10 transition-all text-[11px] font-black uppercase tracking-[0.3em]"><Trash2 className="w-5 h-5" /> PURGE</button>
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
                  initial={{ opacity: 0, y: -20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-muted/40 border border-secondary/30 rounded-[40px] p-10 space-y-8 backdrop-blur-md"
                >
                  <div className="flex items-center gap-4 text-secondary mb-2">
                     <div className="p-3 bg-secondary/10 rounded-xl border border-secondary/20 shadow-[0_0_15px_rgba(var(--secondary-rgb),0.2)]">
                        <Terminal className="w-6 h-6" />
                     </div>
                     <span className="text-[11px] font-black uppercase tracking-[0.4em]">Topic Entry Setup</span>
                  </div>
                  <input
                    autoFocus
                    value={newKbQ}
                    onChange={(e) => setNewKbQ(e.target.value)}
                    placeholder="Identify specific topic category (e.g. Memory Management, API Design)..."
                    className="w-full bg-card/60 border border-border/20 rounded-[28px] px-8 py-5 text-foreground text-xl font-black focus:outline-none focus:border-secondary transition-all placeholder:opacity-20 shadow-inner"
                  />
                  <div className="flex gap-6">
                    <button onClick={() => { if (newKbQ.trim() && currentTabConfig.filter) { addKnowledgeItem(newKbQ.trim(), currentTabConfig.filter, tab === 'core' && selectedSubcat !== 'All' ? selectedSubcat as CSSubcategory : undefined); setNewKbQ(''); setAddingKb(false); } }}
                      className="px-10 py-5 bg-secondary text-foreground rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] shadow-[0_10px_30px_rgba(var(--secondary-rgb),0.2)] transition-all hover:scale-[1.03] active:scale-95">Save Topic</button>
                    <button onClick={() => { setAddingKb(false); setNewKbQ(''); }}
                      className="px-10 py-5 border border-border/10 text-muted-foreground hover:text-foreground rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] transition-all">Cancel setup</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {filteredKnowledge.map((qa) => (
                <motion.div key={qa.id} variants={itemVariants} className="bg-card border border-border/10 rounded-[40px] p-10 space-y-8 group/kb hover:border-secondary/40 transition-all shadow-xl shadow-black/5 relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-secondary/5 blur-[80px] opacity-0 group-hover/kb:opacity-100 transition-opacity duration-1000`} />
                  <div className="flex items-start justify-between gap-6 relative z-10">
                    <div className="flex items-start gap-5 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center border border-secondary/20 shadow-[0_0_10px_rgba(var(--secondary-rgb),0.1)] group-hover/kb:scale-110 transition-all duration-500 shrink-0">
                        <Terminal className="w-6 h-6 text-secondary" />
                      </div>
                      <div className="min-w-0">
                        {qa.subcategory && (
                          <span className="inline-flex items-center gap-1 mb-2 px-2.5 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-[9px] font-black uppercase tracking-[0.25em]">
                            {SUBCAT_ICONS[qa.subcategory]} {qa.subcategory}
                          </span>
                        )}
                        <h4 className="text-foreground text-lg font-black tracking-tight leading-snug uppercase">{qa.question}</h4>
                      </div>
                    </div>
                    <button onClick={() => deleteKnowledgeItem(qa.id)} className="p-3 text-muted-foreground hover:text-rose-500 bg-muted/40 hover:bg-rose-500/10 rounded-[14px] transition-all shrink-0"><Trash2 className="w-5 h-5" /></button>
                  </div>

                  {editKbId === qa.id ? (
                    <div className="space-y-6 relative z-10 transition-all">
                      <textarea
                        autoFocus
                        value={kbDraft}
                        onChange={(e) => setKbDraft(e.target.value)}
                        rows={8}
                        className="w-full bg-muted/60 border border-secondary/30 rounded-[28px] px-6 py-5 text-foreground text-[15px] focus:outline-none resize-none font-mono leading-relaxed shadow-inner"
                      />
                      <div className="flex gap-4">
                        <button onClick={() => { updateKnowledgeItem(qa.id, kbDraft); setEditKbId(null); }}
                          className="px-8 py-3 bg-secondary text-foreground rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-secondary/20 transition-all hover:scale-105 active:scale-95">Save Topic</button>
                        <button onClick={() => setEditKbId(null)} className="px-8 py-3 border border-border/10 text-muted-foreground rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:text-foreground transition-all">Discard</button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8 relative z-10">
                      <div className="bg-muted/20 rounded-[32px] p-8 border border-border/5 relative shadow-inner">
                        <p className="text-foreground text-[14px] leading-relaxed whitespace-pre-wrap font-bold opacity-80">
                          {qa.answer || 'EMPTY: No details provided for this topic. Update with notes immediately.'}
                        </p>
                      </div>
                      <button onClick={() => { setEditKbId(qa.id); setKbDraft(qa.answer); }}
                        className="flex items-center gap-3 text-muted-foreground hover:text-secondary transition-all text-[11px] font-black uppercase tracking-[0.3em] w-fit group/edit">
                        <div className="p-2 rounded-lg bg-muted/40 group-hover/edit:bg-secondary/10 border border-border/5 group-hover/edit:border-secondary/20 transition-all">
                           <Edit3 className="w-4 h-4" />
                        </div>
                        Update Topic Entry
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {filteredKnowledge.length === 0 && !addingKb && (
               <motion.div variants={itemVariants} className="text-center py-32 border-2 border-dashed border-border/10 rounded-[48px] bg-muted/5">
                  <Cpu className="w-16 h-16 text-muted-foreground mx-auto mb-8 opacity-10" />
                  <p className="text-muted-foreground text-[13px] font-black uppercase tracking-[0.4em]">No topic entries found in this category</p>
               </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
