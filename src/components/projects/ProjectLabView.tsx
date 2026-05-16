'use client';

import { useState } from 'react';
import { 
  Plus, Trash2, Layers, X, Edit3, ChevronDown, ChevronRight, Save,
  Cpu, Zap, ShieldCheck, Target, ExternalLink, Github, Globe,
  Layout, Kanban, Database, BarChart3, AlertCircle, CheckCircle2,
  Trophy, MessageSquare, Briefcase
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { ProjectRecord, ProjectChallenge } from '@/lib/types';
import { BentoCard, ActivityRing } from '@/components/ui/Bento';
import ModalPortal from '@/components/ui/ModalPortal';

// ── Animation Variants ────────────────────────────────────────────────────────

const magneticSpring = { type: 'spring', stiffness: 150, damping: 15, mass: 0.1 } as any;
const smoothSpring = { type: 'spring', stiffness: 100, damping: 20 } as any;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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

// ── Project Modal Form ────────────────────────────────────────────────────────

function AddProjectModal({ onClose }: { onClose: () => void }) {
  const { addProject } = useApp();
  const [techInput, setTechInput] = useState('');
  const [form, setForm] = useState<Omit<ProjectRecord, 'id' | 'readinessScore' | 'challenges'>>({
    name: '',
    description: '',
    role: 'Full Stack Developer',
    techStack: [],
    metrics: [],
    status: 'Development',
  });

  const set = (k: keyof typeof form, v: any) => setForm((p) => ({ ...p, [k]: v }));
  
  const addTech = (t: string) => {
    const val = t.trim();
    if (val && !form.techStack.includes(val)) {
      set('techStack', [...form.techStack, val]);
      setTechInput('');
    }
  };

  const removeTech = (t: string) => {
    set('techStack', form.techStack.filter((x) => x !== t));
  };

  const save = () => {
    if (form.name && form.description) {
      addProject({ ...form, challenges: [] });
      onClose();
    }
  };

  return (
    <ModalPortal onClose={onClose}>
      <div className="bg-card/90 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-[0_30px_100px_rgba(0,0,0,0.5)] w-full overflow-hidden">
        <div className="flex items-center justify-between px-6 md:px-10 py-6 md:py-8 border-b border-border/10 bg-black/10 dark:bg-white/5 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/20 rounded-xl md:rounded-2xl flex items-center justify-center border border-primary/30 shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]">
              <Layers className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <h2 className="text-foreground font-black uppercase tracking-[0.2em] text-[11px] md:text-sm">New Project</h2>
          </div>
          <button onClick={onClose} className="p-2 md:p-3 rounded-xl md:rounded-2xl text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all"><X className="w-5 h-5 md:w-6 md:h-6" /></button>
        </div>
        
        <div className="p-6 md:p-10 space-y-8 max-h-[60vh] md:max-h-[70vh] overflow-y-auto custom-scrollbar bg-card/60">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <label className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mb-3 block ml-1">Project Title</label>
              <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. Distributed Task Orchestrator v2.0"
                className="w-full bg-background border border-border/10 rounded-2xl px-6 py-4 text-foreground text-md font-bold focus:outline-none focus:border-primary/50 transition-all placeholder:opacity-30 shadow-inner" />
            </div>

            <div className="md:col-span-2">
              <label className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mb-3 block ml-1">Project Summary</label>
              <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3}
                placeholder="Key highlights and core technical value of this project..."
                className="w-full bg-background border border-border/10 rounded-2xl px-6 py-4 text-foreground text-sm focus:outline-none focus:border-primary/50 resize-none transition-all placeholder:opacity-30 font-medium leading-relaxed shadow-inner" />
            </div>

            <div>
              <label className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mb-3 block ml-1">My Role</label>
              <input type="text" value={form.role} onChange={(e) => set('role', e.target.value)}
                className="w-full bg-background border border-border/10 rounded-2xl px-6 py-4 text-foreground text-sm font-bold focus:outline-none focus:border-primary/50 transition-all shadow-inner" />
            </div>

            <div>
              <label className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mb-3 block ml-1">Project Status</label>
              <select value={form.status} onChange={(e) => set('status', e.target.value)}
                className="w-full bg-background border border-border/10 rounded-2xl px-6 py-4 text-foreground text-sm font-bold focus:outline-none focus:border-primary/50 appearance-none transition-all cursor-pointer shadow-inner">
                <option value="Development" className="bg-card">Phase: In Development</option>
                <option value="Completed" className="bg-card">Phase: Optimization Ready</option>
                <option value="Live" className="bg-card">Phase: Live Operation</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mb-3 block ml-1">Tech Stack</label>
              <div className="flex flex-wrap gap-3 mb-4">
                <AnimatePresence>
                  {form.techStack.map((t) => (
                    <motion.span 
                      key={t}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-sm"
                    >
                      {t}
                      <button onClick={() => removeTech(t)} className="hover:text-foreground transition-all duration-300"><X className="w-3.5 h-3.5" /></button>
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={techInput} 
                  onChange={(e) => setTechInput(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && addTech(techInput)}
                  placeholder="Add technology (React, Go, AWS)..."
                  className="flex-1 bg-background border border-border/10 rounded-2xl px-6 py-4 text-foreground text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:opacity-30 font-medium shadow-inner" 
                />
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => addTech(techInput)} className="px-6 py-4 bg-muted/50 hover:bg-primary/20 text-foreground rounded-2xl transition-all border border-border/10 shadow-sm">
                  <Plus className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 md:gap-6 px-6 md:px-10 pb-6 md:pb-10 pt-4 md:pt-6 bg-black/10 dark:bg-white/5 backdrop-blur-xl">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClose} className="flex-1 py-4 md:py-5 rounded-xl md:rounded-[24px] border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/10 text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] transition-all">Cancel</motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={save}
            className="flex-[2] py-4 md:py-5 rounded-xl md:rounded-[24px] bg-primary text-white text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] transition-all shadow-[0_10px_30px_rgba(var(--primary-rgb),0.4)] flex items-center justify-center gap-3">
            <Save className="w-4 h-4 md:w-5 md:h-5" /> Commit
          </motion.button>
        </div>
      </div>
    </ModalPortal>
  );
}

// ── Challenge SAR Editor ──────────────────────────────────────────────────────

function ChallengeItem({ 
  challenge, 
  onUpdate, 
  onDelete 
}: { 
  challenge: ProjectChallenge; 
  onUpdate: (updates: Partial<ProjectChallenge>) => void;
  onDelete: () => void;
}) {
  return (
    <motion.div 
      variants={itemVariants}
      className="bg-card/80 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 space-y-8 group/item hover:border-primary/30 transition-all shadow-[0_15px_40px_rgba(0,0,0,0.2)]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center border border-secondary/20 shadow-inner">
              <MessageSquare className="w-5 h-5 text-secondary" />
           </div>
           <span className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground">Technical Implementation</span>
        </div>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onDelete} className="p-3 text-muted-foreground hover:text-rose-500 transition-all bg-black/5 dark:bg-white/5 hover:bg-rose-500/20 rounded-xl"><Trash2 className="w-5 h-5" /></motion.button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {[
          { k: 'problem' as const, label: 'SITUATION & CHALLENGE', icon: Layout, color: 'text-secondary' },
          { k: 'solution' as const, label: 'MY ACTIONS', icon: Zap, color: 'text-primary' },
          { k: 'result' as const, label: 'QUANTIFIED OUTCOME', icon: Trophy, color: 'text-emerald-500' },
        ].map(({ k, label, icon: Icon, color }) => (
          <div key={k} className="space-y-4">
            <div className="flex items-center gap-2 px-1">
               <div className={`p-2 rounded-lg bg-black/5 dark:bg-white/5 border border-white/10 ${color} shadow-sm`}>
                  <Icon className="w-3.5 h-3.5" />
               </div>
               <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${color}`}>{label}</span>
            </div>
            <textarea
              value={challenge[k]}
              onChange={(e) => onUpdate({ [k]: e.target.value })}
              placeholder={`Describe the ${k}...`}
              className="w-full bg-background border border-border/10 rounded-[24px] px-6 py-5 text-foreground text-sm focus:outline-none focus:border-primary/30 focus:bg-background resize-none min-h-[160px] font-medium leading-relaxed transition-all placeholder:opacity-30 shadow-inner"
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Main View ─────────────────────────────────────────────────────────────────

export default function ProjectLabView() {
  const { state, addProject, updateProject, deleteProject } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const projects = state.projects || [];
  const readinessCount = projects.filter(p => p.readinessScore >= 80).length;
  const avgReadiness = projects.length ? Math.round(projects.reduce((s, p) => s + p.readinessScore, 0) / projects.length) : 0;

  const addNewChallenge = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const newChallenge: ProjectChallenge = {
        id: Math.random().toString(36).substr(2, 9),
        problem: '',
        solution: '',
        result: ''
      };
      updateProject(projectId, { challenges: [...project.challenges, newChallenge] });
    }
  };

  const updateChallenge = (projectId: string, challengeId: string, updates: Partial<ProjectChallenge>) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const newChallenges = project.challenges.map(c => c.id === challengeId ? { ...c, ...updates } : c);
      const validChallenges = newChallenges.filter(c => c.problem && c.solution && c.result).length;
      const newReadiness = Math.min(100, (validChallenges * 25) + (project.techStack.length * 5) + (project.description ? 10 : 0));
      updateProject(projectId, { challenges: newChallenges, readinessScore: newReadiness });
    }
  };

  const deleteChallenge = (projectId: string, challengeId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      updateProject(projectId, { challenges: project.challenges.filter(c => c.id !== challengeId) });
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-12 gap-8 relative pb-24"
    >
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />

      <AnimatePresence>
        {showModal && <AddProjectModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>

      {/* ── Massive Typography Header ── */}
      <div className="col-span-12 mb-4">
        <div className="overflow-hidden mb-4 flex items-center gap-4">
            <motion.div 
               initial={{ rotate: -90, scale: 0 }} 
               animate={{ rotate: 0, scale: 1 }} 
               transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
               className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-secondary to-purple-500 flex items-center justify-center shadow-[0_0_40px_rgba(var(--secondary-rgb),0.4)]"
            >
               <Database className="w-7 h-7 text-white" />
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/40 leading-[1.1]">
               <motion.span variants={textReveal} className="inline-block">Project</motion.span>{' '}
               <motion.span variants={textReveal} className="inline-block">Lab.</motion.span>
            </h1>
        </div>
        <motion.p variants={itemVariants} className="text-muted-foreground text-lg md:text-xl font-medium max-w-2xl tracking-tight pl-18">
          Architect, document, and deploy. Turn your code repositories into high-impact portfolio pieces designed for interview success.
        </motion.p>
      </div>

      {/* Row 1: Hero & Readiness */}
      <BentoCard className="col-span-12 lg:col-span-8 overflow-hidden backdrop-blur-2xl bg-card/60 shadow-2xl border-white/10 relative">
         <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-secondary/5 to-transparent pointer-events-none" />
         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8 md:gap-10 py-4">
            <div className="max-w-md">
               <h2 className="text-2xl md:text-4xl font-black text-foreground mb-4 leading-none tracking-tighter uppercase">PORTFOLIO DEPLOYMENT</h2>
               <p className="text-muted-foreground text-[13px] md:text-base font-semibold leading-relaxed">
                  Comprehensive project portfolio. Currently maintaining <span className="text-secondary font-black">{projects.length} project modules</span>. 
               </p>
            </div>
            
            <div className="flex gap-10 md:gap-12 items-center justify-between md:justify-center bg-black/5 dark:bg-white/5 p-6 md:p-8 rounded-2xl md:rounded-3xl border border-white/5 shadow-inner">
               <div className="text-center group">
                  <p className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/60 mb-1 md:mb-2 transition-all tabular-nums tracking-tighter group-hover:from-secondary group-hover:to-purple-500">{projects.length}</p>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Map</p>
               </div>
               <div className="w-px h-12 md:h-16 bg-border/50" />
               <div className="text-center group">
                  <p className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/60 mb-1 md:mb-2 transition-all tabular-nums tracking-tighter group-hover:from-emerald-400 group-hover:to-emerald-600">{readinessCount}</p>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Ready</p>
               </div>
            </div>
         </div>
      </BentoCard>

      <BentoCard className="col-span-12 lg:col-span-4 backdrop-blur-2xl bg-card/60 shadow-2xl border-white/10" title="Reliability Index">
         <div className="flex items-center justify-center h-full py-6">
            <ActivityRing value={avgReadiness} max={100} color="var(--secondary)" label="Readiness Index" />
         </div>
      </BentoCard>

      {/* Row 2: Navigation & Action */}
      <div className="col-span-12 flex flex-col md:flex-row items-center justify-between gap-8 pb-2 mt-4">
         <div className="flex bg-card/60 backdrop-blur-2xl rounded-[28px] w-full md:w-auto border border-white/10 shadow-xl px-8 py-4">
            <div className="rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] text-foreground/80 flex items-center gap-3">
               <Kanban className="w-5 h-5 text-secondary animate-pulse" /> PORTFOLIO VIEW ENABLED
            </div>
         </div>

         <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={magneticSpring}
            onClick={() => setShowModal(true)}
            className="w-full md:w-auto flex items-center justify-center gap-4 px-10 py-5 bg-primary text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] transition-all group shadow-[0_10px_30px_rgba(var(--primary-rgb),0.4)]"
         >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" /> 
            ADD PROJECT
         </motion.button>
      </div>

      {/* Row 3: Projects Grid */}
      <div className="col-span-12 space-y-10 mt-2">
        {projects.length === 0 ? (
          <motion.div variants={itemVariants} className="py-40 text-center border-2 border-dashed border-white/10 rounded-[48px] bg-card/20 backdrop-blur-sm">
            <Cpu className="w-20 h-20 text-muted-foreground mx-auto mb-8 opacity-20" />
            <p className="text-muted-foreground text-[13px] font-black uppercase tracking-[0.4em]">No projects found</p>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowModal(true)} className="mt-10 bg-primary/20 border border-primary/30 text-primary px-10 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-lg">Add Your First Project</motion.button>
          </motion.div>
        ) : (
          projects.map((project) => {
            const isOpen = expandedId === project.id;
            const scoreColor = project.readinessScore >= 80 ? 'text-emerald-500' : project.readinessScore >= 40 ? 'text-primary' : 'text-muted-foreground';
            
            return (
              <motion.div 
                key={project.id} 
                layout 
                variants={itemVariants}
                whileHover={!isOpen ? { scale: 1.01, y: -2 } : {}}
                transition={smoothSpring}
                className={`bg-card/60 backdrop-blur-2xl border border-white/5 rounded-[40px] overflow-hidden hover:border-primary/40 transition-all shadow-xl ${isOpen ? 'ring-2 ring-primary/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)]' : ''}`}
              >
                <button onClick={() => setExpandedId(isOpen ? null : project.id)} className="w-full flex flex-col lg:flex-row lg:items-center gap-6 md:gap-10 px-6 md:px-10 py-8 md:py-10 text-left group">
                  <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[24px] flex items-center justify-center border border-primary/30 bg-primary/10 text-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)] group-hover:scale-110 group-hover:rotate-6 transition-all flex-shrink-0 duration-500`}>
                    <Cpu className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                       <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-80">{project.role}</span>
                       <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                       <span className={`text-[8px] md:text-[10px] px-3 py-1 rounded-full border font-black uppercase tracking-widest ${
                         project.status === 'Live' ? 'border-emerald-500/50 text-emerald-500 bg-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'border-white/10 text-muted-foreground bg-black/10 dark:bg-white/10'
                       }`}>{project.status}</span>
                    </div>
                    <h4 className="text-foreground text-xl md:text-4xl font-black tracking-tighter mb-4 group-hover:text-primary transition-colors uppercase">{project.name}</h4>
                    <div className="flex flex-wrap gap-2 md:gap-3">
                      {project.techStack.map(t => (
                        <span key={t} className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 py-1.5 bg-background rounded-lg border border-border/50 shadow-sm"># {t}</span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-start gap-8 md:gap-12 flex-shrink-0 lg:border-l border-white/10 lg:pl-12 pt-4 lg:pt-0">
                    <div className="text-center">
                       <motion.span 
                          animate={{ opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className={`text-3xl md:text-6xl font-black ${scoreColor} tabular-nums mb-1 block tracking-tighter`}
                        >
                         {project.readinessScore}%
                       </motion.span>
                       <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60">Ready</span>
                    </div>
                    <motion.div 
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={smoothSpring}
                      className={`p-3 md:p-4 rounded-xl md:rounded-2xl transition-all duration-500 ${isOpen ? 'text-primary bg-primary/20 shadow-inner' : 'bg-black/5 dark:bg-white/5 text-muted-foreground'}`}
                    >
                       <ChevronDown className="w-5 h-5 md:w-6 md:h-6" />
                    </motion.div>
                  </div>
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
                      <div className="px-10 pb-12 pt-4 space-y-12 bg-black/5 dark:bg-white/[0.02]">
                        <div className="h-px bg-border/50 w-full" />
                        
                        {/* Description & Links */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                           <div className="lg:col-span-8 space-y-6">
                              <h5 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-3 ml-1">
                                 <Layout className="w-5 h-5 text-primary" /> System Architecture Overview
                              </h5>
                              <p className="text-foreground text-[15px] leading-relaxed font-medium bg-background p-8 rounded-[32px] border border-border/50 shadow-inner">
                                 {project.description}
                              </p>
                           </div>
                           <div className="lg:col-span-4 space-y-8">
                              <div className="space-y-4">
                                 <h5 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Resource Handshake</h5>
                                 <div className="space-y-4">
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full h-[72px] flex items-center justify-between px-6 rounded-[24px] bg-background border border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-all group/link shadow-md">
                                       <div className="flex items-center gap-4">
                                          <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center border border-white/10 group-hover/link:bg-primary/20 group-hover/link:border-primary/30 transition-all shadow-sm">
                                             <Github className="w-5 h-5 text-muted-foreground group-hover/link:text-primary transition-colors" />
                                          </div>
                                          <span className="text-[11px] font-black uppercase tracking-widest text-foreground">View Repository</span>
                                       </div>
                                       <ExternalLink className="w-4 h-4 text-muted-foreground" />
                                    </motion.button>
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full h-[72px] flex items-center justify-between px-6 rounded-[24px] bg-background border border-border/50 hover:border-secondary/40 hover:bg-secondary/5 transition-all group/link shadow-md">
                                       <div className="flex items-center gap-4">
                                          <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center border border-white/10 group-hover/link:bg-secondary/20 group-hover/link:border-secondary/30 transition-all shadow-sm">
                                             <Globe className="w-5 h-5 text-muted-foreground group-hover/link:text-secondary transition-colors" />
                                          </div>
                                          <span className="text-[11px] font-black uppercase tracking-widest text-foreground">Operational Endpoint</span>
                                       </div>
                                       <ExternalLink className="w-4 h-4 text-muted-foreground" />
                                    </motion.button>
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* Challenges Section */}
                        <div className="space-y-8">
                           <div className="flex items-center justify-between px-1">
                              <h5 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-3">
                                 <Briefcase className="w-5 h-5 text-primary" /> Interview Scenario Analysis (STAR)
                              </h5>
                              <motion.button 
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                onClick={() => addNewChallenge(project.id)}
                                className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-primary shadow-[0_10px_20px_rgba(var(--primary-rgb),0.3)] text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                              >
                                 <Plus className="w-4 h-4" /> Log Scenario
                              </motion.button>
                           </div>
                           
                           {project.challenges.length === 0 ? (
                              <div className="bg-background border-2 border-dashed border-border/50 rounded-[40px] py-20 text-center shadow-inner">
                                 <p className="text-muted-foreground text-[13px] font-bold uppercase tracking-[0.2em] leading-relaxed opacity-60">No project modules documented yet.<br />Add project modules for interview preparation.</p>
                              </div>
                           ) : (
                              <div className="grid grid-cols-1 gap-10">
                                 {project.challenges.map((challenge) => (
                                    <ChallengeItem 
                                       key={challenge.id} 
                                       challenge={challenge} 
                                       onUpdate={(upd) => updateChallenge(project.id, challenge.id, upd)}
                                       onDelete={() => deleteChallenge(project.id, challenge.id)}
                                    />
                                 ))}
                              </div>
                           )}
                        </div>

                        {/* Footer Actions */}
                        <div className="flex items-center gap-6 pt-6 px-1">
                           <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => deleteProject(project.id)} className="flex items-center gap-3 px-8 py-5 rounded-2xl border border-rose-500/20 text-rose-500 hover:text-white hover:bg-rose-500 transition-all text-[11px] font-black uppercase tracking-[0.3em] shadow-lg"><Trash2 className="w-4 h-4" /> DELETE PROJECT</motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
