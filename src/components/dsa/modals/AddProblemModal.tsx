'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Target, Plus } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Difficulty, Platform, Problem } from '@/lib/types';
import ModalPortal from '@/components/ui/ModalPortal';

interface AddProblemModalProps {
  onClose: () => void;
  activeCategory: 'Aptitude' | 'DSA';
}

export default function AddProblemModal({ onClose, activeCategory }: AddProblemModalProps) {
  const { addProblem } = useApp();
  const [form, setForm] = useState<Omit<Problem, 'id' | 'addedAt'>>({
    name: '', 
    category: activeCategory, 
    topic: activeCategory === 'DSA' ? 'Arrays' : 'Quant: Percentages', 
    difficulty: 'Medium', 
    platform: activeCategory === 'DSA' ? 'LeetCode' : 'Other', 
    status: 'Todo', 
    notes: '', 
    isPriority: false,
  });

  const set = (k: keyof typeof form, v: string | boolean) => setForm((p) => ({ ...p, [k]: v }));

  const submit = () => {
    if (!form.name.trim() || !form.topic.trim()) return;
    addProblem({
      ...form,
      name: form.name.trim(),
      topic: form.topic.trim(),
      subtopic: form.subtopic?.trim() || undefined,
    });
    onClose();
  };

  return (
    <ModalPortal onClose={onClose}>
      <div className="bg-card border border-border/20 rounded-[32px] shadow-2xl w-full overflow-hidden">
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

          {activeCategory === 'Aptitude' && (
            <div>
              <label className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mb-3 block ml-1">Subtopic Group</label>
              <input
                value={form.subtopic || ''}
                onChange={(e) => set('subtopic', e.target.value)}
                placeholder="e.g. Linear and Parallel Arrangements + New Types"
                className="w-full bg-muted/40 border border-border/10 rounded-[20px] px-6 py-4 text-foreground text-sm font-bold focus:outline-none focus:border-primary transition-all"
              />
            </div>
          )}

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
              <p className="text-sm font-black text-foreground">Focus Flag</p>
              <p className="text-[10px] text-muted-foreground opacity-60 font-bold uppercase tracking-wider">Highlight items you want to revisit often</p>
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
             className="flex-[2] py-4 rounded-[20px] bg-primary text-white font-black uppercase tracking-[0.3em] text-[11px] shadow-[0_8px_24px_rgba(var(--primary-rgb),0.3)] hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
           >
             Add Problem
           </button>
        </div>
      </div>
    </ModalPortal>
  );
}
