'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, BookOpen, FolderTree, Pencil, Plus, RefreshCw, Search, Shield, Trash2 } from 'lucide-react';
import ModalPortal from '@/components/ui/ModalPortal';
import {
  createDsaSheetQuestionId,
  DsaSheetQuestionPayload,
  mapAdminRecordToSheetItem,
} from '@/lib/dsaSheetAdmin';
import { DSASheetItem, Difficulty } from '@/lib/types';

type AdminFormState = {
  title: string;
  section: string;
  subgroup: string;
  difficulty: Difficulty;
  practiceUrl: string;
  resourceLinks: string;
  videoUrl: string;
  companies: string;
  notes: string;
};

function parseCompanies(value: string) {
  return Array.from(
    new Set(
      value
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean)
    )
  );
}

function toFormState(item?: DSASheetItem): AdminFormState {
  return {
    title: item?.title || '',
    section: item?.section || '',
    subgroup: item?.subgroup || '',
    difficulty: item?.difficulty || 'Medium',
    practiceUrl: item?.practiceLinks[0] || '',
    resourceLinks: item?.resourceLinks.join('\n') || '',
    videoUrl: item?.videoUrl || '',
    companies: item?.companies.join(', ') || '',
    notes: item?.notes || '',
  };
}

function sortItems(items: DSASheetItem[]) {
  return [...items].sort((a, b) => {
    if (a.sectionOrder !== b.sectionOrder) {
      return a.sectionOrder - b.sectionOrder;
    }
    if (a.order !== b.order) {
      return a.order - b.order;
    }
    return a.title.localeCompare(b.title);
  });
}

interface DsaSheetAdminPanelProps {
  accessToken?: string;
  items: DSASheetItem[];
  onClose: () => void;
  onSync: (items: DSASheetItem[]) => void;
}

export default function DsaSheetAdminPanel({
  accessToken,
  items,
  onClose,
  onSync,
}: DsaSheetAdminPanelProps) {
  const [records, setRecords] = useState<DSASheetItem[]>(() => sortItems(items));
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(items[0]?.id ?? null);
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    const sorted = sortItems(items);
    setRecords(sorted);
    setSelectedId((current) => current && sorted.some((item) => item.id === current) ? current : (sorted[0]?.id ?? null));
  }, [items]);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return records;
    return records.filter((item) =>
      item.title.toLowerCase().includes(query) ||
      item.section.toLowerCase().includes(query) ||
      item.subgroup?.toLowerCase().includes(query) ||
      item.companies.some((company) => company.toLowerCase().includes(query))
    );
  }, [records, search]);

  const selectedItem = useMemo(
    () => filteredRecords.find((item) => item.id === selectedId) ?? records.find((item) => item.id === selectedId) ?? null,
    [filteredRecords, records, selectedId]
  );

  const [form, setForm] = useState<AdminFormState>(() => toFormState(selectedItem || undefined));

  useEffect(() => {
    setForm(toFormState(selectedItem || undefined));
  }, [selectedItem]);

  const sections = useMemo(() => Array.from(new Set(records.map((item) => item.section))).sort(), [records]);

  const updateForm = <K extends keyof AdminFormState>(key: K, value: AdminFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const callApi = async (url: string, init?: RequestInit) => {
    const response = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(init?.headers || {}),
      },
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || 'Request failed.');
    }
    return payload;
  };

  const syncRecords = (nextItems: DSASheetItem[], preferredId?: string | null) => {
    const sorted = sortItems(nextItems);
    setRecords(sorted);
    onSync(sorted);
    if (preferredId && sorted.some((item) => item.id === preferredId)) {
      setSelectedId(preferredId);
      return;
    }
    setSelectedId(sorted[0]?.id ?? null);
  };

  const loadLatest = () => {
    setIsWorking(true);
    setError('');

    callApi('/api/admin/dsa-sheet', { method: 'GET' })
      .then((payload) => {
        const nextItems = Array.isArray(payload.data) ? payload.data.map(mapAdminRecordToSheetItem) : [];
        syncRecords(nextItems, selectedId);
      })
      .catch((err: any) => {
        setError(err.message || 'Could not refresh admin data.');
      })
      .finally(() => {
        setIsWorking(false);
      });
  };

  const resetForNewQuestion = () => {
    setSelectedId(null);
    setForm(toFormState());
    setError('');
  };

  const buildPayload = (): DsaSheetQuestionPayload => {
    const normalizedSection = form.section.trim();
    const existingSection = records.find((item) => item.section === normalizedSection);
    const sectionOrder = existingSection?.sectionOrder ?? sections.length;
    const baseItems = records.filter((item) => item.id !== selectedItem?.id);
    const itemOrder =
      selectedItem && selectedItem.section === normalizedSection
        ? selectedItem.order
        : Math.max(-1, ...baseItems.filter((item) => item.section === normalizedSection).map((item) => item.order)) + 1;

    return {
      title: form.title.trim(),
      section: normalizedSection,
      subgroup: form.subgroup.trim() || null,
      difficulty: form.difficulty,
      practice_links: form.practiceUrl.trim() ? [form.practiceUrl.trim()] : [],
      resource_links: form.resourceLinks
        .split('\n')
        .map((value) => value.trim())
        .filter(Boolean),
      video_url: form.videoUrl.trim(),
      companies: parseCompanies(form.companies),
      notes: form.notes.trim() || null,
      section_order: sectionOrder,
      item_order: itemOrder,
    };
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.section.trim()) {
      setError('Question title and section are required.');
      return;
    }

    setIsWorking(true);
    setError('');

    const payload = buildPayload();
    const request = selectedItem
      ? callApi('/api/admin/dsa-sheet', {
          method: 'PATCH',
          body: JSON.stringify({ id: selectedItem.id, updates: payload }),
        })
      : callApi('/api/admin/dsa-sheet', {
          method: 'POST',
          body: JSON.stringify({ id: createDsaSheetQuestionId(), ...payload }),
        });

    request
      .then((result) => {
        const saved = mapAdminRecordToSheetItem(result.data);
        if (selectedItem) {
          const nextItems = records.map((item) => item.id === saved.id ? saved : item);
          syncRecords(nextItems, saved.id);
          return;
        }

        syncRecords([saved, ...records], saved.id);
      })
      .catch((err: any) => {
        setError(err.message || 'Could not save question.');
      })
      .finally(() => {
        setIsWorking(false);
      });
  };

  const handleDelete = (item: DSASheetItem) => {
    if (!confirm(`Delete "${item.title}" from the global DSA sheet? This will disappear for every user.`)) {
      return;
    }

    setIsWorking(true);
    setError('');

    callApi(`/api/admin/dsa-sheet?id=${encodeURIComponent(item.id)}`, { method: 'DELETE' })
      .then(() => {
        const nextItems = records.filter((record) => record.id !== item.id);
        syncRecords(nextItems);
      })
      .catch((err: any) => {
        setError(err.message || 'Could not delete question.');
      })
      .finally(() => {
        setIsWorking(false);
      });
  };

  const totalQuestions = records.length;
  const totalSections = sections.length;

  return (
    <ModalPortal onClose={onClose} maxWidth="1280px" maxHeight="92dvh">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full rounded-[32px] border border-border/30 bg-card shadow-2xl overflow-hidden"
      >
        <div className="border-b border-border/30 bg-muted/10 px-6 py-5 md:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-primary">
                <Shield className="h-3.5 w-3.5" />
                DSA Sheet Admin
              </div>
              <div>
                <h2 className="text-2xl font-black text-foreground">Manage global DSA questions</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add, edit, reorder by section automatically, or delete questions for every user from one place.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex">
              <div className="rounded-2xl border border-border/30 bg-background/60 px-4 py-3">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Questions</p>
                <p className="mt-1 text-2xl font-black text-foreground">{totalQuestions}</p>
              </div>
              <div className="rounded-2xl border border-border/30 bg-background/60 px-4 py-3">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Sections</p>
                <p className="mt-1 text-2xl font-black text-foreground">{totalSections}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid max-h-[80vh] grid-cols-1 xl:grid-cols-[420px_minmax(0,1fr)]">
          <div className="border-b border-border/30 xl:border-b-0 xl:border-r xl:border-border/30">
            <div className="space-y-4 p-6">
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search question or section"
                    className="w-full rounded-2xl border border-border/30 bg-muted/20 py-3 pl-11 pr-4 text-sm text-foreground focus:border-primary/40 focus:outline-none"
                  />
                </label>
                <button
                  onClick={loadLatest}
                  disabled={isWorking}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border/30 px-4 py-3 text-sm font-bold text-foreground transition-colors hover:bg-muted/20 disabled:opacity-60"
                >
                  <RefreshCw className={`h-4 w-4 ${isWorking ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={resetForNewQuestion}
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-black text-white shadow-[0_10px_20px_rgba(var(--primary-rgb),0.2)]"
                >
                  <Plus className="h-4 w-4" />
                  New Global Question
                </button>
              </div>

              <div className="space-y-3 overflow-y-auto pr-1 xl:max-h-[56vh]">
                {filteredRecords.map((item) => {
                  const isSelected = item.id === selectedId;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
                      className={`w-full rounded-[24px] border px-4 py-4 text-left transition-all ${
                        isSelected
                          ? 'border-primary/40 bg-primary/10 shadow-[0_10px_30px_rgba(var(--primary-rgb),0.12)]'
                          : 'border-border/25 bg-background/40 hover:border-border/45 hover:bg-muted/10'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="line-clamp-2 text-sm font-bold text-foreground">{item.title}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                            <span className="rounded-full bg-muted/40 px-2.5 py-1">{item.section}</span>
                            {item.subgroup ? <span>{item.subgroup}</span> : null}
                          </div>
                        </div>
                        <span className="rounded-full border border-border/20 bg-background/70 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-foreground">
                          {item.difficulty}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <FolderTree className="h-3.5 w-3.5" />
                          {item.sectionOrder + 1}.{item.order + 1}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <BookOpen className="h-3.5 w-3.5" />
                          {item.practiceLinks[0] ? 'Practice linked' : 'No practice link'}
                        </span>
                      </div>
                    </button>
                  );
                })}

                {filteredRecords.length === 0 ? (
                  <div className="rounded-[24px] border border-dashed border-border/30 bg-muted/10 px-5 py-10 text-center">
                    <p className="text-sm font-bold text-foreground">No questions match this search.</p>
                    <p className="mt-2 text-sm text-muted-foreground">Try another keyword or create a new global question.</p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="overflow-y-auto p-6 md:p-8">
            <div className="mx-auto max-w-3xl space-y-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-primary">
                    {selectedItem ? 'Edit Global Question' : 'Create Global Question'}
                  </p>
                  <h3 className="mt-2 text-2xl font-black text-foreground">
                    {selectedItem ? selectedItem.title : 'New question'}
                  </h3>
                </div>

                {selectedItem ? (
                  <button
                    onClick={() => handleDelete(selectedItem)}
                    disabled={isWorking}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm font-bold text-rose-500 transition-colors hover:bg-rose-500/15 disabled:opacity-60"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Global Question
                  </button>
                ) : null}
              </div>

              {error ? (
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-500">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <label className="md:col-span-2">
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Question title</span>
                  <input
                    value={form.title}
                    onChange={(event) => updateForm('title', event.target.value)}
                    className="w-full rounded-2xl border border-border/30 bg-muted/20 px-5 py-4 text-foreground focus:border-primary/40 focus:outline-none"
                    placeholder="Pair with Target Sum"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Section</span>
                  <input
                    list="dsa-admin-sections"
                    value={form.section}
                    onChange={(event) => updateForm('section', event.target.value)}
                    className="w-full rounded-2xl border border-border/30 bg-muted/20 px-5 py-4 text-foreground focus:border-primary/40 focus:outline-none"
                    placeholder="Two Pointers"
                  />
                  <datalist id="dsa-admin-sections">
                    {sections.map((section) => (
                      <option key={section} value={section} />
                    ))}
                  </datalist>
                </label>

                <label>
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Subgroup</span>
                  <input
                    value={form.subgroup}
                    onChange={(event) => updateForm('subgroup', event.target.value)}
                    className="w-full rounded-2xl border border-border/30 bg-muted/20 px-5 py-4 text-foreground focus:border-primary/40 focus:outline-none"
                    placeholder="Same Direction, Opposite Direction"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Difficulty</span>
                  <select
                    value={form.difficulty}
                    onChange={(event) => updateForm('difficulty', event.target.value as Difficulty)}
                    className="w-full rounded-2xl border border-border/30 bg-muted/20 px-5 py-4 text-foreground focus:border-primary/40 focus:outline-none"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </label>

                <label>
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Practice URL</span>
                  <input
                    value={form.practiceUrl}
                    onChange={(event) => updateForm('practiceUrl', event.target.value)}
                    className="w-full rounded-2xl border border-border/30 bg-muted/20 px-5 py-4 text-foreground focus:border-primary/40 focus:outline-none"
                    placeholder="https://leetcode.com/..."
                  />
                </label>

                <label>
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Video URL</span>
                  <input
                    value={form.videoUrl}
                    onChange={(event) => updateForm('videoUrl', event.target.value)}
                    className="w-full rounded-2xl border border-border/30 bg-muted/20 px-5 py-4 text-foreground focus:border-primary/40 focus:outline-none"
                    placeholder="https://youtube.com/..."
                  />
                </label>

                <label className="md:col-span-2">
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Companies</span>
                  <input
                    value={form.companies}
                    onChange={(event) => updateForm('companies', event.target.value)}
                    className="w-full rounded-2xl border border-border/30 bg-muted/20 px-5 py-4 text-foreground focus:border-primary/40 focus:outline-none"
                    placeholder="Amazon, Google, Microsoft"
                  />
                </label>

                <label className="md:col-span-2">
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Resource links</span>
                  <textarea
                    value={form.resourceLinks}
                    onChange={(event) => updateForm('resourceLinks', event.target.value)}
                    className="min-h-[120px] w-full rounded-2xl border border-border/30 bg-muted/20 px-5 py-4 text-foreground focus:border-primary/40 focus:outline-none"
                    placeholder="One link per line"
                  />
                </label>

                <label className="md:col-span-2">
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Admin notes</span>
                  <textarea
                    value={form.notes}
                    onChange={(event) => updateForm('notes', event.target.value)}
                    className="min-h-[120px] w-full rounded-2xl border border-border/30 bg-muted/20 px-5 py-4 text-foreground focus:border-primary/40 focus:outline-none"
                    placeholder="Hints, revision notes, or interview context shown on the sheet."
                  />
                </label>
              </div>

              <div className="rounded-[24px] border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-500">
                <div className="flex items-start gap-2">
                  <Pencil className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>Saving here updates the global DSA sheet content. User progress like completion, revision dates, and bookmarks stays personal.</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  onClick={resetForNewQuestion}
                  disabled={isWorking}
                  className="rounded-2xl border border-border/30 px-5 py-3 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
                >
                  Reset Form
                </button>
                <button
                  onClick={handleSave}
                  disabled={isWorking}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-black text-white shadow-[0_10px_20px_rgba(var(--primary-rgb),0.2)] disabled:opacity-60"
                >
                  {isWorking ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {selectedItem ? 'Save Changes' : 'Create Question'}
                </button>
                <button
                  onClick={onClose}
                  className="rounded-2xl border border-border/30 px-5 py-3 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
                >
                  Close Panel
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </ModalPortal>
  );
}
