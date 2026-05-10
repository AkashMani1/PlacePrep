/* Developed by Akash Mani - This site is developed by Akash Mani. Original watermark of Akash Mani. */
'use client';

import { FormEvent, useDeferredValue, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bookmark,
  BookmarkCheck,
  BookMarked,
  ChevronDown,
  ChevronUp,
  Circle,
  Code2,
  ExternalLink,
  Pencil,
  PlayCircle,
  Plus,
  Search,
  Trash2,
  CheckCircle2,
  Link2,
  Calendar,
  History,
  TrendingUp,
  RotateCcw,
  BrainCircuit,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { DSASheetItem, Difficulty } from '@/lib/types';
import { today, addDays, formatDisplayDate } from '@/lib/utils';

// Premium Kinetic Physics
const magneticSpring = { type: 'spring', stiffness: 150, damping: 15, mass: 0.1 } as any;
const smoothSpring = { type: 'spring', stiffness: 100, damping: 20 } as any;

const textReveal = {
  hidden: { opacity: 0, y: "100%" },
  visible: { opacity: 1, y: 0, transition: { ...smoothSpring, duration: 0.8 } }
};

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1T5-nGsJ9WNwna44e9WWRD0jlZIT5KxVOGvylcvvVrY8/edit?gid=0#gid=0';

const DIFFICULTY_STYLE: Record<Difficulty, string> = {
  Easy: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300',
  Medium: 'bg-amber-500/15 text-amber-600 dark:text-amber-300',
  Hard: 'bg-rose-500/15 text-rose-600 dark:text-rose-300',
};

const HERO_USERS = ['User 1', 'User 2', 'User 3', 'User 4'];

const SRS_INTERVALS: Record<Difficulty, number[]> = {
  Easy: [2, 7, 15, 30, 60, 120, 180],
  Medium: [1, 3, 7, 14, 30, 60, 90],
  Hard: [1, 2, 4, 7, 14, 21, 30, 60]
};

type FormState = {
  title: string;
  section: string;
  subgroup: string;
  difficulty: Difficulty;
  practiceUrl: string;
  resourceLinks: string;
  videoUrl: string;
  companies: string;
  submissionDate: string;
  revisionDate: string;
  notes: string;
};

function NoteEditor({
  item,
  onClose,
  onSave,
}: {
  item: DSASheetItem;
  onClose: () => void;
  onSave: (value: string) => void;
}) {
  const [value, setValue] = useState(item.notes || '');

  return (
    <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-xl rounded-[28px] border border-border/30 bg-card overflow-hidden shadow-2xl"
      >
        <div className="px-7 py-5 border-b border-border/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl border border-border/30 bg-muted/20 flex items-center justify-center text-foreground">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-black text-foreground">Question Notes</p>
              <p className="text-xs text-muted-foreground mt-1">{item.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-2xl border border-border/30 px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground">
            Close
          </button>
        </div>

        <div className="p-7">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Write trigger points, approach hints, edge cases, or what you want to remember next time..."
            className="w-full min-h-[220px] rounded-[24px] bg-muted/20 border border-border/30 px-5 py-4 text-sm leading-7 text-foreground focus:outline-none focus:border-primary/40"
          />
        </div>

        <div className="px-7 py-5 border-t border-border/30 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-2xl border border-border/30 px-5 py-3 text-sm font-bold text-muted-foreground hover:text-foreground">Cancel</button>
          <button
            onClick={() => {
              onSave(value);
              onClose();
            }}
            className="rounded-2xl bg-primary px-5 py-3 text-sm font-black text-white"
          >
            Save Note
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function NoteButton({
  item,
  onClick,
}: {
  item: DSASheetItem;
  onClick: () => void;
}) {
  const hasNote = Boolean(item.notes?.trim());

  return (
    <button
      onClick={onClick}
      title={hasNote ? 'View or edit note' : 'Add note'}
      className={`relative w-12 h-12 rounded-full border flex items-center justify-center transition-colors ${
        hasNote
          ? 'border-[#ff7a59]/40 bg-[#ff7a59]/10 text-[#ff7a59]'
          : 'border-border/30 bg-muted/20 text-muted-foreground hover:border-[#ff7a59]/30 hover:text-foreground'
      }`}
    >
      <BookMarked className="w-4 h-4" />
      {hasNote ? <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-card" /> : null}
    </button>
  );
}

function normalizeCompanyName(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

const COMPANY_DOMAIN_MAP: Record<string, string> = {
  amazon: 'amazon.com',
  microsoft: 'microsoft.com',
  google: 'google.com',
  tcs: 'tcs.com',
  'tata consultancy services': 'tcs.com',
  infosys: 'infosys.com',
  wipro: 'wipro.com',
  accenture: 'accenture.com',
  cognizant: 'cognizant.com',
  ibm: 'ibm.com',
  oracle: 'oracle.com',
  adobe: 'adobe.com',
  flipkart: 'flipkart.com',
  uber: 'uber.com',
  meta: 'meta.com',
  facebook: 'facebook.com',
  apple: 'apple.com',
  netflix: 'netflix.com',
  zoho: 'zoho.com',
  samsung: 'samsung.com',
  paypal: 'paypal.com',
  deloitte: 'deloitte.com',
  capgemini: 'capgemini.com',
  hcl: 'hcltech.com',
  techmahindra: 'techmahindra.com',
};

function getCompanyLogoUrl(company: string) {
  const normalized = normalizeCompanyName(company).toLowerCase();
  const domain = COMPANY_DOMAIN_MAP[normalized];
  if (!domain) return '';
  return `https://www.google.com/s2/favicons?sz=128&domain_url=https://${domain}`;
}

function isYouTubeUrl(url: string) {
  return /youtube\.com|youtu\.be/i.test(url);
}

function getPlatformLogoUrl(url: string) {
  if (!url) return '';
  let domain = '';
  try {
    const host = new URL(url).hostname.replace('www.', '');
    domain = host;
  } catch (e) {
    if (url.includes('leetcode')) domain = 'leetcode.com';
    else if (url.includes('geeksforgeeks')) domain = 'geeksforgeeks.org';
    else if (url.includes('interviewbit')) domain = 'interviewbit.com';
    else if (url.includes('hackerrank')) domain = 'hackerrank.com';
    else if (url.includes('codeforces')) domain = 'codeforces.com';
    else if (url.includes('codechef')) domain = 'codechef.com';
  }
  
  if (!domain) return '';
  return `https://www.google.com/s2/favicons?sz=64&domain_url=https://${domain}`;
}

function parseCompanyList(value: string) {
  return Array.from(
    new Set(
      value
        .split(',')
        .map(normalizeCompanyName)
        .filter(Boolean)
    )
  );
}

function normalizeGroupLabel(value: string) {
  return value.trim().toLowerCase();
}

function isExternalUrl(value: string) {
  return /^https?:\/\//.test(value);
}

function toFormState(item?: DSASheetItem): FormState {
  return {
    title: item?.title || '',
    section: item?.section || '',
    subgroup: item?.subgroup || '',
    difficulty: item?.difficulty || 'Medium',
    practiceUrl: item?.practiceLinks[0] || '',
    resourceLinks: item?.resourceLinks.join('\n') || '',
    videoUrl: item?.videoUrl || '',
    companies: item?.companies.join(', ') || '',
    submissionDate: item?.submissionDate?.split('T')[0] || '',
    revisionDate: item?.revisionDate?.split('T')[0] || '',
    notes: item?.notes || '',
  };
}

function getCompanyMonogram(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
}

function CompanyBadge({ company }: { company: string }) {
  const logoUrl = getCompanyLogoUrl(company);

  if (logoUrl) {
    return (
      <div title={company} className="w-10 h-10 shrink-0 rounded-full border-2 border-background bg-white overflow-hidden flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
        <img
          src={logoUrl}
          alt={company}
          className="w-6 h-6 object-contain"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
            const fallback = event.currentTarget.nextElementSibling as HTMLElement | null;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
        <div className="hidden w-full h-full items-center justify-center text-[11px] font-black text-[#111319]">
          {getCompanyMonogram(company)}
        </div>
      </div>
    );
  }

  return (
    <div title={company} className="w-10 h-10 shrink-0 rounded-full border-2 border-background bg-white text-[#111319] flex items-center justify-center text-[11px] font-black shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
      {getCompanyMonogram(company)}
    </div>
  );
}

function ProgressRing({ progress }: { progress: number }) {
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      <svg className="w-48 h-48 -rotate-90">
        <circle cx="96" cy="96" r={radius} fill="none" stroke="rgba(128,128,128,0.15)" strokeWidth="14" />
        <circle
          cx="96"
          cy="96"
          r={radius}
          fill="none"
          stroke="rgb(16 185 129)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-black text-emerald-500 dark:text-emerald-400">{progress}%</span>
        <span className="text-[11px] tracking-[0.28em] uppercase text-muted-foreground font-black mt-2">Progress</span>
      </div>
    </div>
  );
}

function DifficultyTracker({ stats }: { stats: any }) {
  const levels = [
    { label: 'Easy', solved: stats.solvedEasy, total: stats.easy, color: '#10b981' },
    { label: 'Medium', solved: stats.solvedMedium, total: stats.medium, color: '#f59e0b' },
    { label: 'Hard', solved: stats.solvedHard, total: stats.hard, color: '#f43f5e' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      {levels.map((level) => {
        const progress = Math.round((level.solved / level.total) * 100 || 0);
        return (
          <div key={level.label} className="flex items-center gap-3 min-w-[120px]">
            <div className="flex flex-col gap-1 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground/60">{level.label}</span>
                <span className="text-[10px] font-black text-foreground/80 tabular-nums">{level.solved}/{level.total}</span>
              </div>
              <div className="h-1 rounded-full bg-muted/20 overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="absolute inset-y-0 left-0 rounded-full shadow-[0_0_8px_rgba(var(--color-rgb),0.4)]"
                  style={{ backgroundColor: level.color }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SheetEditor({
  item,
  sections,
  onSave,
  onClose,
}: {
  item?: DSASheetItem;
  sections: string[];
  onSave: (form: FormState) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<FormState>(() => toFormState(item));

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim() || !form.section.trim()) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <motion.form
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        onSubmit={submit}
        className="w-full max-w-3xl max-h-[90vh] rounded-[30px] border border-border/30 bg-card overflow-hidden flex flex-col shadow-2xl"
      >
        <div className="px-8 py-6 border-b border-border/30 flex items-center justify-between sticky top-0 bg-card z-10">
          <div>
            <p className="text-[11px] font-black tracking-[0.28em] uppercase text-primary">DSA Sheet</p>
            <h2 className="text-2xl font-black text-foreground mt-2">{item ? 'Edit Question' : 'Add Question'}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-2xl border border-border/30 px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground">
            Close
          </button>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-5 overflow-y-auto">
          <label className="md:col-span-2">
            <span className="block text-[11px] uppercase tracking-[0.24em] text-muted-foreground font-black mb-2">Problem</span>
            <input value={form.title} onChange={(e) => update('title', e.target.value)} className="w-full rounded-2xl bg-muted/20 border border-border/30 px-5 py-4 text-foreground focus:outline-none focus:border-primary/40" />
          </label>

          <label>
            <span className="block text-[11px] uppercase tracking-[0.24em] text-muted-foreground font-black mb-2">Section</span>
            <input list="dsa-sections" value={form.section} onChange={(e) => update('section', e.target.value)} className="w-full rounded-2xl bg-muted/20 border border-border/30 px-5 py-4 text-foreground focus:outline-none focus:border-primary/40" />
            <datalist id="dsa-sections">
              {sections.map((section) => (
                <option key={section} value={section} />
              ))}
            </datalist>
          </label>

          <label>
            <span className="block text-[11px] uppercase tracking-[0.24em] text-muted-foreground font-black mb-2">Sub Topic</span>
            <input value={form.subgroup} onChange={(e) => update('subgroup', e.target.value)} className="w-full rounded-2xl bg-muted/20 border border-border/30 px-5 py-4 text-foreground focus:outline-none focus:border-primary/40" placeholder="Traversal, 2 Heaps, Mirror and Symmetry..." />
          </label>

          <label>
            <span className="block text-[11px] uppercase tracking-[0.24em] text-muted-foreground font-black mb-2">Difficulty</span>
            <select value={form.difficulty} onChange={(e) => update('difficulty', e.target.value as Difficulty)} className="w-full rounded-2xl bg-muted/20 border border-border/30 px-5 py-4 text-foreground focus:outline-none focus:border-primary/40">
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </label>

          <label>
            <span className="block text-[11px] uppercase tracking-[0.24em] text-muted-foreground font-black mb-2">Practice URL</span>
            <input value={form.practiceUrl} onChange={(e) => update('practiceUrl', e.target.value)} className="w-full rounded-2xl bg-muted/20 border border-border/30 px-5 py-4 text-foreground focus:outline-none focus:border-primary/40" placeholder="https://leetcode.com/..." />
          </label>

          <label>
            <span className="block text-[11px] uppercase tracking-[0.24em] text-muted-foreground font-black mb-2">Video URL</span>
            <input value={form.videoUrl} onChange={(e) => update('videoUrl', e.target.value)} className="w-full rounded-2xl bg-muted/20 border border-border/30 px-5 py-4 text-foreground focus:outline-none focus:border-primary/40" placeholder="https://youtube.com/..." />
          </label>

          <label>
            <span className="block text-[11px] uppercase tracking-[0.24em] text-muted-foreground font-black mb-2">Submission Date</span>
            <input type="date" value={form.submissionDate} onChange={(e) => update('submissionDate', e.target.value)} className="w-full rounded-2xl bg-muted/20 border border-border/30 px-5 py-4 text-foreground focus:outline-none focus:border-primary/40" />
          </label>

          <label>
            <span className="block text-[11px] uppercase tracking-[0.24em] text-muted-foreground font-black mb-2">Revision Date</span>
            <input type="date" value={form.revisionDate} onChange={(e) => update('revisionDate', e.target.value)} className="w-full rounded-2xl bg-muted/20 border border-border/30 px-5 py-4 text-foreground focus:outline-none focus:border-primary/40" />
          </label>

          <label className="md:col-span-2">
            <span className="block text-[11px] uppercase tracking-[0.24em] text-muted-foreground font-black mb-2">Resource Links</span>
            <textarea value={form.resourceLinks} onChange={(e) => update('resourceLinks', e.target.value)} className="w-full min-h-[110px] rounded-2xl bg-muted/20 border border-border/30 px-5 py-4 text-foreground focus:outline-none focus:border-primary/40" placeholder="One link per line" />
          </label>

          <label className="md:col-span-2">
            <span className="block text-[11px] uppercase tracking-[0.24em] text-muted-foreground font-black mb-2">Notes</span>
            <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} className="w-full min-h-[96px] rounded-2xl bg-muted/20 border border-border/30 px-5 py-4 text-foreground focus:outline-none focus:border-primary/40" placeholder="Personal notes or admin hints" />
          </label>
        </div>

        <div className="px-8 py-6 border-t border-border/30 flex justify-end gap-3 sticky bottom-0 bg-card z-10">
          <button type="button" onClick={onClose} className="rounded-2xl border border-border/30 px-5 py-3 text-sm font-bold text-muted-foreground hover:text-foreground">Cancel</button>
          <button type="submit" className="rounded-2xl bg-primary px-5 py-3 text-sm font-black text-white">Save</button>
        </div>
      </motion.form>
    </div>
  );
}

export default function DSASheetView() {
  const { state, addDsaSheetItem, updateDsaSheetItem, deleteDsaSheetItem } = useApp();
  const items = (state.dsaSheetItems || []).filter((item) => !item.hidden);

  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'All'>('All');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [savedOnly, setSavedOnly] = useState(false);
  const [revisionDueOnly, setRevisionDueOnly] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [editingItem, setEditingItem] = useState<DSASheetItem | null>(null);
  const [noteItem, setNoteItem] = useState<DSASheetItem | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const deferredSearch = useDeferredValue(search);

  const sections = useMemo(() => {
    return Array.from(new Set(items.map((item) => item.section))).sort((a, b) => {
      const aOrder = items.find((item) => item.section === a)?.sectionOrder ?? 0;
      const bOrder = items.find((item) => item.section === b)?.sectionOrder ?? 0;
      return aOrder - bOrder;
    });
  }, [items]);

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        const query = deferredSearch.trim().toLowerCase();
        const matchesSearch =
          !query ||
          item.title.toLowerCase().includes(query) ||
          item.section.toLowerCase().includes(query) ||
          item.notes?.toLowerCase().includes(query) ||
          item.companies.some((company) => company.toLowerCase().includes(query));

        return (
          matchesSearch &&
          (difficultyFilter === 'All' || item.difficulty === difficultyFilter) &&
          (sectionFilter === 'All' || item.section === sectionFilter) &&
          (!savedOnly || item.saved) &&
          (!revisionDueOnly || (item.completed && item.revisionDate && item.revisionDate.split('T')[0] <= today()))
        );
      })
      .sort((a, b) => (a.sectionOrder === b.sectionOrder ? a.order - b.order : a.sectionOrder - b.sectionOrder));
  }, [deferredSearch, difficultyFilter, items, savedOnly, sectionFilter, revisionDueOnly]);

  const groupedItems = useMemo(() => {
    const map = new Map<string, DSASheetItem[]>();
    for (const item of filteredItems) {
      if (!map.has(item.section)) map.set(item.section, []);
      map.get(item.section)!.push(item);
    }
    return Array.from(map.entries());
  }, [filteredItems]);

  const stats = useMemo(() => {
    const total = items.length;
    const completed = items.filter((item) => item.completed).length;
    const easy = items.filter((item) => item.difficulty === 'Easy').length;
    const medium = items.filter((item) => item.difficulty === 'Medium').length;
    const hard = items.filter((item) => item.difficulty === 'Hard').length;
    
    const solvedEasy = items.filter((item) => item.completed && item.difficulty === 'Easy').length;
    const solvedMedium = items.filter((item) => item.completed && item.difficulty === 'Medium').length;
    const solvedHard = items.filter((item) => item.completed && item.difficulty === 'Hard').length;
    
    const progress = Math.round((completed / total) * 100 || 0);
    return { 
      total, completed, 
      easy, medium, hard, 
      solvedEasy, solvedMedium, solvedHard,
      progress 
    };
  }, [items]);

  const openCreate = () => {
    setEditingItem(null);
    setShowEditor(true);
  };

  const openEdit = (item: DSASheetItem) => {
    setEditingItem(item);
    setShowEditor(true);
  };

  const closeEditor = () => {
    setEditingItem(null);
    setShowEditor(false);
  };

  const handleSave = (form: FormState) => {
    const resourceLinks = form.resourceLinks
      .split('\n')
      .map((value) => value.trim())
      .filter(Boolean);

    const payload = {
      title: form.title.trim(),
      section: form.section.trim(),
      subgroup: form.subgroup.trim() || undefined,
      sectionOrder: items.find((item) => item.section === form.section)?.sectionOrder ?? sections.length,
      order:
        editingItem && editingItem.section === form.section
          ? editingItem.order
          : Math.max(-1, ...items.filter((item) => item.section === form.section).map((item) => item.order)) + 1,
      difficulty: form.difficulty,
      practiceLinks: form.practiceUrl.trim() ? [form.practiceUrl.trim()] : [],
      resourceLinks,
      videoUrl: form.videoUrl.trim(),
      companies: parseCompanyList(form.companies),
      submissionDate: form.submissionDate,
      revisionDate: form.revisionDate,
      revisionPhase: editingItem?.revisionPhase ?? 0,
      notes: form.notes.trim(),
      completed: editingItem?.completed ?? false,
      saved: editingItem?.saved ?? false,
      source: editingItem?.source ?? 'user',
      hidden: false,
    } satisfies Omit<DSASheetItem, 'id'>;

    if (editingItem) {
      updateDsaSheetItem(editingItem.id, payload);
    } else {
      addDsaSheetItem(payload);
    }

    closeEditor();
  };

  return (
    <div className="space-y-8">
      {showEditor && <SheetEditor item={editingItem || undefined} sections={sections} onSave={handleSave} onClose={closeEditor} />}
      {noteItem && (
        <NoteEditor
          item={noteItem}
          onClose={() => setNoteItem(null)}
          onSave={(value) => updateDsaSheetItem(noteItem.id, { notes: value })}
        />
      )}

      <motion.section 
        initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={smoothSpring}
        className="rounded-[38px] border border-border/20 bg-card/60 backdrop-blur-2xl overflow-hidden relative shadow-2xl group"
      >
        {/* Animated Accent Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-[#ff7a59]/20 blur-[100px] rounded-full" />
        </div>
        
        <div className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] blend-overlay" />
        
        <div className="relative z-10 px-8 md:px-12 py-7 md:py-9">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 md:gap-10">
            
            {/* Left: Branding & Performance */}
            <div className="flex-1 space-y-7">
               <div className="flex items-center flex-wrap gap-4">
                 <motion.div 
                    initial={{ rotate: -90, scale: 0 }} 
                    animate={{ rotate: 0, scale: 1 }} 
                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#ff7a59] to-[#ff4d24] flex items-center justify-center shadow-[0_0_30px_rgba(255,122,89,0.4)]"
                 >
                    <BookMarked className="w-6 h-6 text-white" />
                 </motion.div>
                 <h2 className="text-4xl md:text-5xl leading-[1.1] font-black tracking-tighter text-foreground flex items-center flex-wrap gap-3">
                   <motion.span variants={textReveal} initial="hidden" animate="visible" className="bg-gradient-to-r from-[#ff7a59] to-[#ff4d24] bg-clip-text text-transparent inline-block">DSA Sheet</motion.span>
                   <span className="opacity-40 font-medium text-[24px] md:text-[32px] tracking-tight">Most Important Interview Questions</span>
                 </h2>
               </div>

               <div className="flex flex-wrap items-end gap-x-14 gap-y-8">
                  {/* Progress Block */}
                  <div className="space-y-4">
                     <div className="flex items-center gap-3">
                        <div className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-2">
                           <span className="text-[11px] font-black text-primary uppercase tracking-[0.2em]">Solved Progress</span>
                        </div>
                        <span className="text-lg font-black text-foreground tabular-nums tracking-tighter">{stats.completed}/{stats.total} <span className="text-muted-foreground font-semibold opacity-60 text-sm ml-1">Total Questions</span></span>
                     </div>
                     <DifficultyTracker stats={stats} />
                  </div>

                  {/* Community Stats */}
                  <div className="flex flex-col gap-3 py-1 px-5 border-l border-border/10">
                    <div className="flex -space-x-3">
                      {HERO_USERS.map((label, index) => (
                        <div
                          key={label}
                          title={label}
                          className={`w-10 h-10 rounded-full border-4 border-background flex items-center justify-center font-black text-xs shadow-lg transition-transform hover:-translate-y-1 ${
                            index === 0 ? 'bg-[#c084fc] text-white' : index === 1 ? 'bg-[#f9a8d4] text-[#111319]' : index === 2 ? 'bg-[#86efac] text-[#111319]' : 'bg-[#fbbf24] text-[#111319]'
                          }`}
                        >
                          {label.split(' ').map((part) => part[0]).join('')}
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2 mt-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                      <span className="text-foreground">{Math.max(372, stats.total + 121)}+</span> solving now
                    </p>
                  </div>
               </div>
            </div>

            {/* Right: Actions */}
            <div className="flex flex-wrap lg:flex-nowrap gap-4 shrink-0 lg:self-start mt-2 lg:mt-0">
               <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={openCreate} className="group flex items-center gap-2.5 rounded-[24px] bg-primary px-7 py-5 text-sm font-black text-white shadow-[0_10px_20px_rgba(var(--primary-rgb),0.2)] transition-all">
                  <Plus className="w-5 h-5" />
                  <span>Add Question</span>
               </motion.button>
               <motion.a whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} href={SHEET_URL} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 rounded-[24px] bg-card border border-border/30 px-7 py-5 text-sm font-black text-foreground shadow-lg hover:border-primary/30 transition-all">
                  <Link2 className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span>Source Sheet</span>
               </motion.a>
               <motion.button 
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setSavedOnly((prev) => !prev)} 
                  className={`flex items-center gap-2.5 rounded-[24px] border px-7 py-5 text-sm font-black shadow-lg transition-all ${
                    savedOnly 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)]' 
                      : 'bg-card border-border/30 text-foreground hover:border-[#ff7a59]/30'
                  }`}
               >
                  <BookmarkCheck className={`w-5 h-5 ${savedOnly ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                  <span>Saved</span>
               </motion.button>
            </div>
          </div>
        </div>
      </motion.section>


      <div className="rounded-[30px] border border-border/30 bg-card p-5 md:p-6 shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_repeat(3,auto)] gap-4">
          <label className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search problem, dates, notes, section"
              className="w-full rounded-2xl bg-muted/20 border border-border/30 pl-11 pr-4 py-3.5 text-foreground focus:outline-none focus:border-[#ff7a59]/40"
            />
          </label>

          <select value={difficultyFilter} onChange={(event) => setDifficultyFilter(event.target.value as Difficulty | 'All')} className="rounded-2xl bg-muted/20 border border-border/30 px-4 py-3.5 text-foreground focus:outline-none focus:border-[#ff7a59]/40">
            <option value="All">All levels</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select value={sectionFilter} onChange={(event) => setSectionFilter(event.target.value)} className="rounded-2xl bg-muted/20 border border-border/30 px-4 py-3.5 text-foreground focus:outline-none focus:border-[#ff7a59]/40">
            <option value="All">All sections</option>
            {sections.map((section) => (
              <option key={section} value={section}>{section}</option>
            ))}
          </select>

          <div className="flex items-center gap-3">
            <button onClick={() => setSavedOnly((prev) => !prev)} className={`flex-1 lg:flex-none rounded-2xl px-5 py-3.5 text-[13px] font-bold border transition-all ${savedOnly ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-border/30 text-muted-foreground hover:text-foreground hover:bg-muted/10'}`}>
              Saved Questions
            </button>

            <button onClick={() => setRevisionDueOnly((prev) => !prev)} className={`flex-1 lg:flex-none rounded-2xl px-5 py-3.5 text-[13px] font-bold border transition-all ${revisionDueOnly ? 'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.1)]' : 'border-border/30 text-muted-foreground hover:text-foreground hover:bg-muted/10'}`}>
              Revision Questions
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {groupedItems.map(([section, sectionItems]) => {
          const collapsed = collapsedSections[section];
          const solved = sectionItems.filter((item) => item.completed).length;

          return (
            <div key={section} className="rounded-[30px] border border-border/30 bg-card overflow-hidden shadow-md">
              <button onClick={() => setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }))} className="w-full px-6 py-4.5 flex items-center justify-between gap-4 text-left">
                <div>
                  <p className="text-[18px] md:text-[20px] font-bold tracking-[-0.02em] text-[#ff7a59]">{section}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[15px] md:text-[16px] font-semibold text-muted-foreground">{solved}/{sectionItems.length}</span>
                  {collapsed ? <ChevronDown className="w-4 h-4 text-[#ff7a59]" /> : <ChevronUp className="w-4 h-4 text-[#ff7a59]" />}
                </div>
              </button>

              {!collapsed && (
                <div className="px-4 md:px-6 pb-6">
                  <div className="w-full">
                  <div className="hidden lg:grid grid-cols-[44px_minmax(160px,2fr)_72px_72px_72px_110px_115px_56px_56px] gap-3 px-4 py-3.5 border border-border/30 bg-muted/20 text-foreground text-[11px] font-bold rounded-t-[18px] uppercase tracking-[0.12em]">
                    <span></span>
                    <span>Problem</span>
                    <span>Youtube</span>
                    <span>Practice</span>
                    <span>Level</span>
                    <span>Submitted</span>
                    <span>Revision</span>
                    <span>Notes</span>
                    <span>Save</span>
                  </div>

                  <div className="space-y-0 border-x border-b border-border/30 rounded-b-[18px] overflow-hidden">
                    {(() => {
                      const grouped = sectionItems.reduce<Record<string, DSASheetItem[]>>((acc, item) => {
                        const key = item.subgroup?.trim() || '__ungrouped__';
                        if (!acc[key]) acc[key] = [];
                        acc[key].push(item);
                        return acc;
                      }, {});
                      const entries = Object.entries(grouped);
                      const meaningfulSubgroups = entries.filter(([name]) => name !== '__ungrouped__' && normalizeGroupLabel(name) !== normalizeGroupLabel(section));
                      const shouldShowSubgroups = meaningfulSubgroups.length > 0;

                      return entries.map(([subgroup, subgroupItems], subgroupIndex) => (
                        <div key={`${section}-${subgroup}`}>
                          {shouldShowSubgroups && subgroup !== '__ungrouped__' ? (
                            <div className={`px-5 py-3.5 bg-muted/30 ${subgroupIndex > 0 ? 'border-t border-border/30' : ''}`}>
                              <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{subgroup}</p>
                            </div>
                          ) : subgroupIndex > 0 && shouldShowSubgroups ? (
                            <div className="border-t border-border/30" />
                          ) : null}
                          {subgroupItems.map((item) => {
                          return (
                            <div key={item.id} className="grid grid-cols-1 lg:grid-cols-[44px_minmax(160px,2fr)_72px_72px_72px_110px_115px_56px_56px] gap-3 items-center px-4 py-3.5 border-t border-border/20 bg-muted/5 hover:bg-muted/10 transition-colors">
                          <button 
                            onClick={() => {
                              const isCompleting = !item.completed;
                              const subDate = isCompleting ? today() : '';
                              let revDate = item.revisionDate || '';
                              let revPhase = item.revisionPhase || 0;
                              
                              if (isCompleting && !item.revisionDate) {
                                revPhase = 0;
                                revDate = addDays(subDate, SRS_INTERVALS[item.difficulty][0]);
                              } else if (isCompleting && item.revisionDate && item.revisionDate.split('T')[0] <= today()) {
                                // Background SRS Trigger on toggle
                                revPhase = Math.min(revPhase + 1, SRS_INTERVALS[item.difficulty].length - 1);
                                revDate = addDays(subDate, SRS_INTERVALS[item.difficulty][revPhase]);
                              }
                              
                              updateDsaSheetItem(item.id, { 
                                completed: isCompleting, 
                                submissionDate: subDate, 
                                revisionDate: revDate,
                                revisionPhase: revPhase
                              });
                            }} 
                            className="w-10 h-10 rounded-full border border-border/30 flex items-center justify-center text-muted-foreground hover:text-foreground"
                          >
                            {item.completed ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5" />}
                          </button>

                          <div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <p className={`text-[14px] md:text-[15px] font-semibold leading-[1.45] tracking-[-0.01em] ${item.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{item.title}</p>
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.04em] ${item.source === 'admin' ? 'bg-muted/40 text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                                {item.source === 'admin' ? 'Suggested' : 'Custom'}
                              </span>
                            </div>
                            <div className="mt-2.5 flex gap-2">
                              <button onClick={() => openEdit(item)} className="rounded-xl border border-border/30 p-2 text-muted-foreground hover:text-foreground">
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button onClick={() => deleteDsaSheetItem(item.id)} className="rounded-xl border border-border/30 p-2 text-muted-foreground hover:text-rose-500">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="flex lg:justify-center">
                            {item.videoUrl ? (
                              <a
                                href={item.videoUrl}
                                target="_blank"
                                rel="noreferrer"
                                title="Open video link"
                                className="w-10 h-10 rounded-full border border-red-500/30 bg-red-500/12 text-red-500 dark:text-red-300 hover:bg-red-500/18 flex items-center justify-center transition-colors"
                              >
                                <PlayCircle className="w-5 h-5" />
                              </a>
                            ) : (
                              <button onClick={() => openEdit(item)} className="w-10 h-10 rounded-full border border-dashed border-border/30 flex items-center justify-center text-muted-foreground hover:bg-muted/10">
                                <Plus className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          <div className="flex lg:justify-center">
                            {item.practiceLinks[0] ? (
                              <a href={item.practiceLinks[0]} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-border/30 flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors group/link overflow-hidden shadow-sm">
                                {(() => {
                                  const logoUrl = getPlatformLogoUrl(item.practiceLinks[0]);
                                  if (logoUrl) {
                                    return (
                                      <img 
                                        src={logoUrl} 
                                        alt="Platform" 
                                        className="w-5 h-5 object-contain group-hover/link:scale-110 transition-transform" 
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                          if (fallback) fallback.style.display = 'block';
                                        }}
                                      />
                                    );
                                  }
                                  return <Code2 className="w-5 h-5 text-muted-foreground group-hover/link:text-foreground" />;
                                })()}
                                <Code2 className="w-5 h-5 text-muted-foreground group-hover/link:text-foreground hidden" />
                              </a>
                            ) : (
                              <button onClick={() => openEdit(item)} className="w-10 h-10 rounded-full border border-dashed border-border/30 flex items-center justify-center text-muted-foreground">
                                <ExternalLink className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          <div>
                            <span className={`inline-flex rounded-full px-2.5 py-1.5 text-[11px] font-bold ${DIFFICULTY_STYLE[item.difficulty]}`}>{item.difficulty}</span>
                          </div>

                          <div className="flex items-center gap-2">
                             <div className="relative group px-3 py-1.5 rounded-xl border border-emerald-500/10 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all cursor-pointer flex items-center gap-2 min-w-[110px]">
                               <History className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 pointer-events-none shrink-0" />
                               <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 pointer-events-none whitespace-nowrap">
                                 {formatDisplayDate(item.submissionDate) || 'Pending'}
                               </span>
                               <input 
                                 type="date" 
                                 value={item.submissionDate?.split('T')[0] || ''} 
                                 onChange={(e) => {
                                   const newSubDate = e.target.value;
                                   let revPhase = item.revisionPhase || 0;
                                   let revDate = item.revisionDate || '';
                                   
                                   // Background SRS Engine
                                   if (item.completed && newSubDate && revDate && revDate.split('T')[0] <= today()) {
                                     revPhase = Math.min(revPhase + 1, SRS_INTERVALS[item.difficulty].length - 1);
                                     revDate = addDays(newSubDate, SRS_INTERVALS[item.difficulty][revPhase]);
                                   }
                                   
                                   updateDsaSheetItem(item.id, { 
                                     submissionDate: newSubDate,
                                     revisionPhase: revPhase,
                                     revisionDate: revDate
                                   });
                                 }}
                                 onClick={(e) => {
                                   try {
                                     (e.currentTarget as any).showPicker();
                                   } catch (err) {}
                                 }}
                                 className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                               />
                             </div>
                          </div>

                          <div className="flex flex-col gap-1.5 min-w-[110px]">
                               <div className="relative group px-3 py-1.5 rounded-xl border border-primary/10 bg-primary/5 hover:bg-primary/10 transition-all cursor-pointer flex items-center justify-between gap-2">
                                 <div className="flex items-center gap-1.5 hidden lg:flex">
                                   <Calendar className="w-3 h-3 text-primary pointer-events-none shrink-0" />
                                   <span className="text-[10px] font-bold text-primary pointer-events-none whitespace-nowrap">
                                     {formatDisplayDate(item.revisionDate) || '---'}
                                   </span>
                                 </div>
                                 {(item.revisionPhase ?? 0) > 0 && (
                                    <span className="text-[8.5px] font-black uppercase bg-primary/20 text-primary px-1.5 py-0.5 rounded-[4px] pointer-events-none shrink-0" title={`Mastery Level ${item.revisionPhase}`}>
                                       LVL {item.revisionPhase}
                                    </span>
                                 )}
                                 <input 
                                   type="date" 
                                   value={item.revisionDate?.split('T')[0] || ''} 
                                   onChange={(e) => updateDsaSheetItem(item.id, { revisionDate: e.target.value })}
                                   onClick={(e) => {
                                     try {
                                       (e.currentTarget as any).showPicker();
                                     } catch (err) {}
                                   }}
                                   className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                 />
                               </div>
                          </div>

                          <div className="flex lg:justify-center">
                            <NoteButton item={item} onClick={() => setNoteItem(item)} />
                          </div>

                          <div>
                            <button onClick={() => updateDsaSheetItem(item.id, { saved: !item.saved })} className="w-10 h-10 rounded-xl border border-border/30 flex items-center justify-center text-muted-foreground hover:text-foreground">
                              {item.saved ? <BookmarkCheck className="w-5 h-5 text-primary" /> : <Bookmark className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                          );
                        })}
                      </div>
                    ));
                    })()}
                  </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {!groupedItems.length ? (
          <div className="rounded-[30px] border border-dashed border-border/30 bg-muted/10 py-16 text-center">
            <p className="text-2xl font-black text-foreground">No matching questions found</p>
            <p className="text-muted-foreground mt-2">Try another filter or add a new personal question.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
