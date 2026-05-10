'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, BookMarked, ExternalLink, BookOpen, Pencil, Trash2, ChevronDown } from 'lucide-react';
import { Problem, Difficulty, ProblemStatus } from '@/lib/types';
import { getReferenceUrl, getPlatformLabel } from '@/lib/referenceLinks';

const itemVariants = {
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

interface ProblemItemProps {
  problem: Problem;
  onUpdate: (id: string, p: Partial<Problem>) => void;
  onDelete: (id: string) => void;
  onEdit: (p: Problem) => void;
  editingNote: string | null;
  setEditingNote: (id: string | null) => void;
  noteDraft: string;
  setNoteDraft: (v: string) => void;
}

const ProblemItem = memo(({ 
  problem, 
  onUpdate, 
  onDelete,
  onEdit,
  editingNote, 
  setEditingNote,
  noteDraft,
  setNoteDraft
}: ProblemItemProps) => {
  const isDone = problem.status === 'Done';
  const isAptitude = problem.category === 'Aptitude';
  const hasNotes = problem.notes.trim().length > 0;
  const fallbackUrl = getReferenceUrl(problem.name, problem.category, problem.topic);
  const videoUrl = isAptitude ? problem.videoUrl : undefined;
  const readingUrl = isAptitude ? (problem.readingUrl || fallbackUrl) : undefined;
  const practiceUrl = isAptitude ? undefined : (problem.videoUrl || fallbackUrl);
  const practiceLabel = practiceUrl ? getPlatformLabel(practiceUrl) : null;

  return (
    <motion.div 
      variants={itemVariants}
      whileHover={{ y: -4, scale: 1.002 }}
      className="group/card relative flex h-full flex-col overflow-hidden rounded-[28px] border border-border/10 bg-card/75 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.18)] transition-all hover:border-primary/30 hover:bg-card/90"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
      <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/40 via-transparent to-primary/40 rounded-[28px] opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 -z-10 blur-[1px]" />
      
      {isDone && (
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
      )}
      <div className="relative z-10 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-4">
           <div className={`mt-0.5 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[18px] border transition-all duration-500 ${
              isDone ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-muted/40 border-border/10 text-muted-foreground'
           }`}>
              {isDone ? <ShieldCheck className="h-5 w-5" /> : isAptitude ? <BookMarked className="h-5 w-5" /> : <ExternalLink className="h-5 w-5" />}
           </div>
           <div className="min-w-0 flex-1">
              <div className="mb-3 flex items-start gap-3">
                 <h4 className={`max-w-4xl text-[15px] font-bold leading-[1.52] md:text-[16px] ${isDone ? 'text-muted-foreground/50 line-through decoration-muted-foreground/40' : 'text-foreground/90'}`}>{problem.name}</h4>
              </div>
              <div className="mb-3 flex flex-wrap items-center gap-2.5">
                {isAptitude ? (
                  <>
                    {readingUrl && (
                      <a
                        href={readingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.13em] text-amber-400 transition-all hover:bg-amber-500/20 hover:border-amber-500/50"
                      >
                        <BookOpen className="w-3 h-3" />
                        Read Material
                      </a>
                    )}
                    {videoUrl && (
                      <a
                        href={videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/25 bg-rose-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.13em] text-rose-400 transition-all hover:bg-rose-500/20 hover:border-rose-500/50"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Video Solution
                      </a>
                    )}
                  </>
                ) : practiceUrl ? (
                  <a
                    href={practiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-primary/25 bg-primary/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.13em] text-primary transition-all hover:bg-primary/20 hover:border-primary/50"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {problem.videoUrl ? 'Watch — YouTube' : `Solve — ${practiceLabel}`}
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-border/10 text-muted-foreground/30 bg-muted/10">
                    {isAptitude ? <BookOpen className="w-3 h-3" /> : <ExternalLink className="w-3 h-3" />}
                    {isAptitude ? 'Links Pending' : 'Practice Link'}
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
              ) : hasNotes ? (
                 <p onClick={() => { setEditingNote(problem.id); setNoteDraft(problem.notes); }} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all cursor-pointer max-w-4xl italic opacity-60 hover:opacity-100 whitespace-pre-wrap leading-relaxed">
                    {problem.notes}
                 </p>
              ) : (
                <button
                  onClick={() => { setEditingNote(problem.id); setNoteDraft(problem.notes); }}
                  className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground/45 transition-colors hover:text-primary"
                >
                  Add topic note
                </button>
              )}
           </div>
        </div>
        <div className="flex flex-col gap-3 xl:w-[230px] xl:flex-shrink-0">
           <span className={`text-[10px] font-black uppercase tracking-[0.18em] px-4 py-2 rounded-xl border ${DIFF_COLORS[problem.difficulty]}`}>
              {problem.difficulty} TIER
           </span>
           <SelectField
             aria-label="Update problem status"
             value={problem.status}
             onChange={(e) => onUpdate(problem.id, { status: e.target.value as ProblemStatus })}
             className="w-full"
             selectClassName={`text-[10px] uppercase tracking-[0.16em] shadow-sm ${STATUS_COLORS[problem.status]}`}
           >
             {(['Todo', 'Done', 'Revisit'] as ProblemStatus[]).map((s) => (
               <option key={s} value={s} className="bg-card text-foreground">
                 {s} Status
               </option>
             ))}
           </SelectField>
           <div className="flex items-center gap-3 xl:justify-end opacity-100 xl:opacity-0 xl:group-hover/card:opacity-100 transition-all duration-300">
              <button onClick={() => onEdit(problem)} className="p-3 bg-primary/10 text-primary/60 hover:text-primary hover:bg-primary/20 rounded-xl transition-all border border-transparent hover:border-primary/30" title="Edit problem">
                 <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => onDelete(problem.id)} className="p-3 bg-rose-500/10 text-rose-500/60 hover:text-rose-500 hover:bg-rose-500/20 rounded-xl transition-all border border-transparent hover:border-rose-500/30" title="Delete problem">
                 <Trash2 className="w-4 h-4" />
              </button>
           </div>
        </div>
      </div>
    </motion.div>
  );
});

ProblemItem.displayName = 'ProblemItem';

export default ProblemItem;
