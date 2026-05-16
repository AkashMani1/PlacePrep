'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Pencil } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Difficulty, Platform, Problem } from '@/lib/types';
import ModalPortal from '@/components/ui/ModalPortal';

interface EditProblemModalProps {
  problem: Problem;
  onClose: () => void;
}

export default function EditProblemModal({ problem, onClose }: EditProblemModalProps) {
  const { updateProblem } = useApp();
  const [form, setForm] = useState<Omit<Problem, 'id' | 'addedAt'>>({
    name: problem.name,
    category: problem.category,
    topic: problem.topic,
    subtopic: problem.subtopic,
    difficulty: problem.difficulty,
    platform: problem.platform,
    status: problem.status,
    notes: problem.notes,
    isPriority: problem.isPriority ?? false,
    videoUrl: problem.videoUrl,
    readingUrl: problem.readingUrl,
  });

  const set = (k: keyof typeof form, v: string | boolean) => setForm((p) => ({ ...p, [k]: v }));

  const submit = () => {
    if (!form.name.trim() || !form.topic.trim()) return;
    updateProblem(problem.id, {
      ...form,
      name: form.name.trim(),
      topic: form.topic.trim(),
      subtopic: form.subtopic?.trim() || undefined,
    });
    onClose();
  };

  const isAptitude = problem.category === 'Aptitude';

  return (
    <ModalPortal onClose={onClose}>
      <div className="bg-card border border-border/20 rounded-[32px] shadow-2xl w-full overflow-hidden">
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

          {isAptitude && (
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
              <p className="text-sm font-black text-foreground">Focus Flag</p>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider opacity-60">Highlight items you want to revisit often</p>
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
            className="flex-[2] py-4 rounded-[20px] bg-amber-500 text-white font-black uppercase tracking-[0.3em] text-[11px] shadow-[0_8px_24px_rgba(245,158,11,0.3)] hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Save Changes
          </button>
        </div>
      </div>
    </ModalPortal>
  );
}
