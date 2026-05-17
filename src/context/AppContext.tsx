/* Developed by Akash Mani - This site is developed by Akash Mani. Original watermark of Akash Mani. */
'use client';

import React, { createContext, useContext, useCallback, useEffect, useRef } from 'react';
import { AppState, Problem, MockInterview, WeekTask, StarStory, KnowledgeItem, DailyLog, KnowledgeCategory, CSSubcategory, ProjectRecord, DSASheetItem } from '@/lib/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAuth } from './AuthContext';
import { syncService } from '@/lib/syncService';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { scheduleForReview, clearSrsSchedule } from '@/lib/srsUtils';
import {
  DEFAULT_WEEKS,
  DEFAULT_MOCKS,
  DEFAULT_STARS,
  DEFAULT_KNOWLEDGE,
  HABIT_TEMPLATES,
  DEFAULT_HABIT_GROUPS,
} from '@/lib/defaultData';
import { KILL_LIST_PROBLEMS } from '@/lib/killListData';
import { DEFAULT_DSA_SHEET_ITEMS, mergeDsaSheetItems } from '@/lib/dsaSheetSeed';
import { today, generateId } from '@/lib/utils';

const INITIAL_STATE: AppState = {
  weeks: DEFAULT_WEEKS,
  problems: KILL_LIST_PROBLEMS,
  dsaSheetItems: DEFAULT_DSA_SHEET_ITEMS,
  mocks: DEFAULT_MOCKS,
  stars: DEFAULT_STARS,
  knowledgeBase: DEFAULT_KNOWLEDGE,
  dailyLogs: [],
  habitGroups: [
    {
      id: 'morning',
      title: 'Morning Block (2.5-3h)',
      items: [
        { id: 'm_watched', label: 'Study Theory', detail: 'Watched/Read Concepts' },
        { id: 'm_notes', label: 'Create Notes', detail: 'Made Prompts/Cheatsheets' },
        { id: 'm_understood', label: 'Concept Mastered', detail: 'Understood core logic deeply' },
      ]
    },
    {
      id: 'afternoon',
      title: 'AFTERNOON BLOCK',
      items: [
        { id: 'a_solved', label: 'Solve Problems', detail: 'Practiced 3-4 questions' },
        { id: 'a_submit', label: 'Submit Code', detail: 'Successfully submitted' },
        { id: 'a_review', label: 'Review Solutions', detail: 'Optimized and reviewed edges' },
      ]
    },
    {
      id: 'evening',
      title: 'EVENING REVIEW',
      items: [
        { id: 'e_noted', label: 'Daily Reflection', detail: 'Noted key learnings & mistakes' },
        { id: 'e_progress', label: 'Update Tracker', detail: 'Logged daily progress' },
        { id: 'e_plan', label: 'Plan Next Day', detail: 'Set goals for tomorrow' },
      ]
    }
  ],
  startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  userName: 'Student',
  targetRole: 'Software Engineer',
  goalDurationMonths: 3,
  sidebarCollapsed: false,
  projects: [],
  theme: 'dark',
};

interface AppContextType {
  state: AppState;
  initialized: boolean;
  cloudSyncing: boolean;

  // Profile
  updateProfile: (name: string, role: string, startDate: string, goalDurationMonths: number) => void;
  toggleSidebar: () => void;

  // Daily Log
  getTodayLog: () => DailyLog;
  toggleHabit: (habitId: string) => void;
  updateEnergy: (val: number) => void;
  updateConfidence: (val: number) => void;
  updateHours: (val: number) => void;
  updateDailyLog: (updates: Partial<DailyLog>) => void;

  // Roadmap
  toggleWeekTask: (week: number, taskId: string) => void;
  updateWeekFocus: (week: number, focus: string) => void;
  addWeekTask: (week: number, label: string) => void;
  deleteWeekTask: (week: number, taskId: string) => void;

  // DSA Problems
  addProblem: (p: Omit<Problem, 'id' | 'addedAt'>) => void;
  updateProblem: (id: string, updates: Partial<Problem>) => void;
  deleteProblem: (id: string) => void;
  addDsaSheetItem: (item: Omit<DSASheetItem, 'id'>) => void;
  updateDsaSheetItem: (id: string, updates: Partial<DSASheetItem>) => void;
  deleteDsaSheetItem: (id: string) => void;

  // Mocks
  addMock: (m: Omit<MockInterview, 'id'>) => void;
  updateMock: (id: string, updates: Partial<MockInterview>) => void;
  deleteMock: (id: string) => void;

  // Stars
  addStar: (s: Omit<StarStory, 'id'>) => void;
  updateStar: (id: string, updates: Partial<StarStory>) => void;
  deleteStar: (id: string) => void;

  // Knowledge Base
  updateKnowledgeItem: (id: string, answer: string) => void;
  addKnowledgeItem: (question: string, category: KnowledgeCategory, subcategory?: CSSubcategory) => void;
  deleteKnowledgeItem: (id: string) => void;
 
  // Projects
  addProject: (p: Omit<ProjectRecord, 'id' | 'readinessScore'>) => void;
  updateProject: (id: string, updates: Partial<ProjectRecord>) => void;
  deleteProject: (id: string) => void;

  // Habit Management
  addHabitItem: (groupId: string, label: string, detail: string) => void;
  updateHabitItem: (groupId: string, itemId: string, updates: Partial<{ label: string; detail: string }>) => void;
  deleteHabitItem: (groupId: string, itemId: string) => void;
  updateHabitGroupTitle: (groupId: string, title: string) => void;
 
  // Theme
  toggleTheme: () => void;
 
  // UI State (Transient)
  isSidebarHovered: boolean;
  setSidebarHovered: (val: boolean) => void;

  // Badge System
  markBadgesSeen: (ids: string[]) => void;

  // Utility
  touchToday: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState, initialized] = useLocalStorage<AppState>('placeprep_v5', INITIAL_STATE);
  const { user } = useAuth();
  const [cloudSyncing, setCloudSyncing] = React.useState(false);
  const [isSidebarHovered, setSidebarHovered] = React.useState(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoad = useRef(true);

  // 1. Initial Cloud Data Sync on Login
  useEffect(() => {
    if (user && initialized && isInitialLoad.current) {
      const loadCloudData = async () => {
        setCloudSyncing(true);
        const result = await syncService.fetchCloudState(user.id);
        
        if (result.success && (result.logs?.length || result.dsa?.length)) {
          setState(prev => {
            // Merge Daily Logs
            const mergedLogs = [...prev.dailyLogs];
            result.logs?.forEach(cloudLog => {
              const idx = mergedLogs.findIndex(l => l.date === cloudLog.log_date);
              const mappedLog: DailyLog = {
                date: cloudLog.log_date,
                completedHabits: Array.isArray(cloudLog.tasks) ? cloudLog.tasks : [],
                energy: cloudLog.productivity_score,
                confidence: parseInt(cloudLog.mood) || 6,
                hours: 0,
                struggles: cloudLog.content,
              };
              if (idx > -1) {
                // Only overwrite if cloud data is actually present
                mergedLogs[idx] = { ...mergedLogs[idx], ...mappedLog };
              } else {
                mergedLogs.push(mappedLog);
              }
            });

            // Merge DSA Sheet items
            const mergedDSA = [...(prev.dsaSheetItems || [])];
            result.dsa?.forEach(cloudDsa => {
              const idx = mergedDSA.findIndex(item => item.id === cloudDsa.problem_slug);
              if (idx > -1) {
                mergedDSA[idx] = {
                  ...mergedDSA[idx],
                  completed: cloudDsa.status === 'solved',
                  submissionDate: cloudDsa.submission_date,
                  revisionDate: cloudDsa.revision_date,
                  notes: cloudDsa.notes,
                };
              }
            });

            return {
              ...prev,
              dailyLogs: mergedLogs,
              dsaSheetItems: mergedDSA,
            };
          });
        }
        setCloudSyncing(false);
        isInitialLoad.current = false;
      };

      loadCloudData();
    }
  }, [user, initialized, setState]);

  // KB Migration: merge any new seed questions the user doesn't have yet (preserves answers)
  useEffect(() => {
    if (!initialized) return;
    setState((prev) => {
      const existing = prev.knowledgeBase || [];
      const existingIds = new Set(existing.map((k) => k.id));
      const newItems = DEFAULT_KNOWLEDGE.filter((k) => !existingIds.has(k.id));
      if (newItems.length === 0) return prev;
      return { ...prev, knowledgeBase: [...existing, ...newItems] };
    });
  }, [initialized, setState]);

  // Aptitude refresh: replace any stale must-do list data with the new PDF-derived seed.
  useEffect(() => {
    if (!initialized) return;
    setState((prev) => {
      const sameSeed =
        prev.problems.length === KILL_LIST_PROBLEMS.length &&
        prev.problems.every((problem, idx) => problem.id === KILL_LIST_PROBLEMS[idx].id);

      if (sameSeed) return prev;
      return { ...prev, problems: KILL_LIST_PROBLEMS };
    });
  }, [initialized, setState]);

  // DSA sheet refresh: merge local sheet items with the updated admin seed questions
  useEffect(() => {
    if (!initialized) return;
    setState((prev) => {
      const merged = mergeDsaSheetItems(prev.dsaSheetItems);
      const same =
        prev.dsaSheetItems &&
        prev.dsaSheetItems.length === merged.length &&
        prev.dsaSheetItems.every((item, idx) => 
          item.id === merged[idx].id && 
          item.section === merged[idx].section && 
          item.subgroup === merged[idx].subgroup && 
          item.title === merged[idx].title
        );

      if (same) return prev;
      return { ...prev, dsaSheetItems: merged };
    });
  }, [initialized, setState]);

  // Global Site Content Sync
  useEffect(() => {
    if (!initialized) return;
    
    const fetchGlobalQuestions = async () => {
      try {
        const { data, error } = await supabase.from('questions').select('*').in('assessment_id', [
          '11111111-1111-1111-1111-111111111111', // DSA
          '22222222-2222-2222-2222-222222222222', // Aptitude
          '33333333-3333-3333-3333-333333333333'  // KB
        ]);
        
        if (error || !data) return;
        
        setState(prev => {
          const dsaGlobal = data.filter(q => q.assessment_id === '11111111-1111-1111-1111-111111111111').map(q => ({
            id: q.id,
            name: q.title,
            category: 'DSA',
            topic: q.topic || 'General',
            subtopic: q.company || '',
            difficulty: q.difficulty || 'Medium',
            status: 'Todo',
            addedAt: new Date().toISOString(),
            link: q.content || '',
            videoLink: q.solution_explanation || ''
          }));

          const aptGlobal = data.filter(q => q.assessment_id === '22222222-2222-2222-2222-222222222222').map(q => ({
            id: q.id,
            name: q.title,
            category: 'Aptitude',
            topic: q.topic || 'General',
            subtopic: q.company || '',
            difficulty: q.difficulty || 'Medium',
            status: 'Todo',
            addedAt: new Date().toISOString(),
            link: q.content || '',
            videoLink: q.solution_explanation || ''
          }));
          
          const kbGlobal = data.filter(q => q.assessment_id === '33333333-3333-3333-3333-333333333333').map(q => ({
            id: q.id,
            question: q.title,
            answer: q.content || '',
            category: (q.topic as KnowledgeCategory) || 'Core Subjects',
            subcategory: (q.company as CSSubcategory) || 'OS'
          }));

          // Merge DSA & Aptitude (Preserve local progress!)
          const newProblems = [...prev.problems];
          [...dsaGlobal, ...aptGlobal].forEach(globalProb => {
            const idx = newProblems.findIndex(p => p.id === globalProb.id);
            if (idx === -1) {
              newProblems.push(globalProb as any);
            } else {
              // Keep user progress but update problem details
              newProblems[idx] = { ...newProblems[idx], name: globalProb.name, topic: globalProb.topic, subtopic: globalProb.subtopic, difficulty: globalProb.difficulty } as any;
            }
          });

          // Delete local problems that were deleted from global DB
          const globalProblemIds = [...dsaGlobal, ...aptGlobal].map(p => p.id);
          const filteredProblems = newProblems.filter(p => {
             // If this is a global problem (it's not generated by generateId() locally and not in the hardcoded seed), 
             // but it's no longer in the DB, we should remove it.
             // We can check if the ID is a valid UUID (which means it came from DB).
             const isUUID = p.id.length === 36 && p.id.split('-').length === 5;
             if (isUUID && !globalProblemIds.includes(p.id)) {
               return false; // Removed from DB
             }
             return true;
          });

          // Merge KB
          const newKB = [...(prev.knowledgeBase || [])];
          kbGlobal.forEach(globalKb => {
            const idx = newKB.findIndex(k => k.id === globalKb.id);
            if (idx === -1) {
              newKB.push(globalKb as any);
            } else {
              if (globalKb.answer && (!newKB[idx].answer || newKB[idx].answer === '')) {
                newKB[idx].answer = globalKb.answer;
              }
              newKB[idx].question = globalKb.question;
              newKB[idx].category = globalKb.category;
              newKB[idx].subcategory = globalKb.subcategory;
            }
          });
          
          const globalKbIds = kbGlobal.map(k => k.id);
          const filteredKB = newKB.filter(k => {
             const isUUID = k.id.length === 36 && k.id.split('-').length === 5;
             if (isUUID && !globalKbIds.includes(k.id)) return false;
             return true;
          });

          return {
            ...prev,
            problems: filteredProblems,
            knowledgeBase: filteredKB
          };
        });
      } catch(e) {}
    };
    
    fetchGlobalQuestions();
  }, [initialized, setState]);

  // 2. Debounced Cloud Backup on State Changes
  useEffect(() => {
    if (!user || isInitialLoad.current) return;

    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    
    syncTimeoutRef.current = setTimeout(async () => {
      setCloudSyncing(true);
      const result = await syncService.pushLocalState(user.id, state);
      setCloudSyncing(false);
    }, 5000); // 5 second debounce

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [state, user]);
 
  const mutate = useCallback((updater: (s: AppState) => AppState) => {
    setState((prev: AppState) => updater(prev));
  }, [setState]);

  // ── Theme Sync ────────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  const toggleTheme = useCallback(() => {
    mutate((s) => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }));
  }, [mutate]);

  // ── Profile ──────────────────────────────────────────────────────────────
  const updateProfile = useCallback((userName: string, targetRole: string, startDate: string, goalDurationMonths: number) => {
    mutate((s) => ({ ...s, userName, targetRole, startDate, goalDurationMonths }));
  }, [mutate]);

  const toggleSidebar = useCallback(() => {
    mutate((s) => ({ ...s, sidebarCollapsed: !s.sidebarCollapsed }));
  }, [mutate]);

  // ── Daily Log helpers ─────────────────────────────────────────────────────
  const getTodayLog = useCallback((): DailyLog => {
    const t = today();
    const existing = state.dailyLogs.find((l) => l.date === t);
    return {
      date: t,
      completedHabits: [],
      energy: 7,
      confidence: 6,
      hours: 0,
      problemsSolved: { easy: 0, medium: 0, hard: 0 },
      conceptsLearned: ['', '', ''],
      struggles: '',
      tomorrowPlan: { morning: '', afternoon: '' },
      ...existing,
    };
  }, [state.dailyLogs]);

  const upsertTodayLog = useCallback((updater: (log: DailyLog) => DailyLog) => {
    const t = today();
    mutate((s) => {
      const existing = s.dailyLogs.find((l) => l.date === t);
      const base: DailyLog = {
        date: t,
        completedHabits: [],
        energy: 7,
        confidence: 6,
        hours: 0,
        problemsSolved: { easy: 0, medium: 0, hard: 0 },
        conceptsLearned: ['', '', ''],
        struggles: '',
        tomorrowPlan: { morning: '', afternoon: '' },
        ...existing,
      };
      const updated = updater(base);
      const others = s.dailyLogs.filter((l) => l.date !== t);
      return { ...s, dailyLogs: [...others, updated] };
    });
  }, [mutate]);

  const toggleHabit = useCallback((habitId: string) => {
    upsertTodayLog((log) => {
      const has = log.completedHabits.includes(habitId);
      return {
        ...log,
        completedHabits: has
          ? log.completedHabits.filter((h) => h !== habitId)
          : [...log.completedHabits, habitId],
      };
    });
  }, [upsertTodayLog]);

  const updateEnergy = useCallback((val: number) => {
    upsertTodayLog((log) => ({ ...log, energy: val }));
  }, [upsertTodayLog]);

  const updateConfidence = useCallback((val: number) => {
    upsertTodayLog((log) => ({ ...log, confidence: val }));
  }, [upsertTodayLog]);

  const updateHours = useCallback((val: number) => {
    upsertTodayLog((log) => ({ ...log, hours: val }));
  }, [upsertTodayLog]);

  const updateDailyLog = useCallback((updates: Partial<DailyLog>) => {
    upsertTodayLog((log) => ({ ...log, ...updates }));
  }, [upsertTodayLog]);

  const touchToday = useCallback(() => {
    upsertTodayLog((log) => log);
  }, [upsertTodayLog]);

  // ── Roadmap ───────────────────────────────────────────────────────────────
  const toggleWeekTask = useCallback((week: number, taskId: string) => {
    mutate((s) => ({
      ...s,
      weeks: s.weeks.map((w) =>
        w.week === week
          ? { ...w, tasks: w.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)) }
          : w
      ),
    }));
  }, [mutate]);

  const updateWeekFocus = useCallback((week: number, focus: string) => {
    mutate((s) => ({ ...s, weeks: s.weeks.map((w) => w.week === week ? { ...w, focus } : w) }));
  }, [mutate]);

  const addWeekTask = useCallback((week: number, label: string) => {
    mutate((s) => ({
      ...s,
      weeks: s.weeks.map((w) =>
        w.week === week
          ? { ...w, tasks: [...w.tasks, { id: generateId(), label, done: false }] }
          : w
      ),
    }));
  }, [mutate]);

  const deleteWeekTask = useCallback((week: number, taskId: string) => {
    mutate((s) => ({
      ...s,
      weeks: s.weeks.map((w) =>
        w.week === week ? { ...w, tasks: w.tasks.filter((t) => t.id !== taskId) } : w
      ),
    }));
  }, [mutate]);

  // ── DSA Problems ──────────────────────────────────────────────────────────
  const addProblem = useCallback((p: Omit<Problem, 'id' | 'addedAt'>) => {
    mutate((s) => ({ ...s, problems: [{ ...p, id: generateId(), addedAt: today() }, ...s.problems] }));
  }, [mutate]);

  const updateProblem = useCallback((id: string, updates: Partial<Problem>) => {
    mutate((s) => ({
      ...s,
      problems: s.problems.map((p) => {
        if (p.id !== id) return p;
        const merged = { ...p, ...updates };
        // ── SRS Auto-Scheduling ────────────────────────────────────────────────
        // Auto-schedule review when status is 'Revisit' or difficulty set to 'Hard'
        if (updates.status === 'Revisit' || updates.difficulty === 'Hard') {
          return { ...merged, ...scheduleForReview(merged) };
        }
        // Clear SRS schedule when a problem in the queue is finally mastered
        if (updates.status === 'Done' && p.srsNextReview) {
          return { ...merged, ...clearSrsSchedule() };
        }
        return merged;
      }),
    }));
  }, [mutate]);

  const deleteProblem = useCallback((id: string) => {
    mutate((s) => ({ ...s, problems: s.problems.filter((p) => p.id !== id) }));
  }, [mutate]);

  const addDsaSheetItem = useCallback((item: Omit<DSASheetItem, 'id'>) => {
    mutate((s) => ({
      ...s,
      dsaSheetItems: [...(s.dsaSheetItems || DEFAULT_DSA_SHEET_ITEMS), { ...item, id: generateId(), source: 'user', hidden: false }],
    }));
  }, [mutate]);

  const updateDsaSheetItem = useCallback((id: string, updates: Partial<DSASheetItem>) => {
    mutate((s) => ({
      ...s,
      dsaSheetItems: (s.dsaSheetItems || DEFAULT_DSA_SHEET_ITEMS).map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  }, [mutate]);

  const deleteDsaSheetItem = useCallback((id: string) => {
    mutate((s) => ({
      ...s,
      dsaSheetItems: (s.dsaSheetItems || DEFAULT_DSA_SHEET_ITEMS)
        .map((item) => {
          if (item.id !== id) return item;
          if (item.source === 'admin') return { ...item, hidden: true };
          return null;
        })
        .filter(Boolean) as DSASheetItem[],
    }));
  }, [mutate]);

  // ── Mocks ──────────────────────────────────────────────────────────────────
  const addMock = useCallback((m: Omit<MockInterview, 'id'>) => {
    mutate((s) => ({ ...s, mocks: [{ ...m, id: generateId() }, ...s.mocks] }));
  }, [mutate]);

  const updateMock = useCallback((id: string, updates: Partial<MockInterview>) => {
    mutate((s) => ({ ...s, mocks: s.mocks.map((m) => (m.id === id ? { ...m, ...updates } : m)) }));
  }, [mutate]);

  const deleteMock = useCallback((id: string) => {
    mutate((s) => ({ ...s, mocks: s.mocks.filter((m) => m.id !== id) }));
  }, [mutate]);

  // ── Stars ──────────────────────────────────────────────────────────────────
  const addStar = useCallback((s: Omit<StarStory, 'id'>) => {
    mutate((state) => ({ ...state, stars: [{ ...s, id: generateId() }, ...state.stars] }));
  }, [mutate]);

  const updateStar = useCallback((id: string, updates: Partial<StarStory>) => {
    mutate((s) => ({ ...s, stars: s.stars.map((st) => (st.id === id ? { ...st, ...updates } : st)) }));
  }, [mutate]);

  const deleteStar = useCallback((id: string) => {
    mutate((s) => ({ ...s, stars: s.stars.filter((st) => st.id !== id) }));
  }, [mutate]);

  // ── Knowledge Base ────────────────────────────────────────────────────────
  const updateKnowledgeItem = useCallback((id: string, answer: string) => {
    mutate((s) => ({ ...s, knowledgeBase: (s.knowledgeBase || []).map((h) => (h.id === id ? { ...h, answer } : h)) }));
  }, [mutate]);

  const addKnowledgeItem = useCallback((question: string, category: KnowledgeCategory, subcategory?: CSSubcategory) => {
    mutate((s) => ({ ...s, knowledgeBase: [...(s.knowledgeBase || []), { id: generateId(), question, answer: '', category, subcategory }] }));
  }, [mutate]);

  const deleteKnowledgeItem = useCallback((id: string) => {
    mutate((s) => ({ ...s, knowledgeBase: (s.knowledgeBase || []).filter((h) => h.id !== id) }));
  }, [mutate]);
 
  // ── Projects ──────────────────────────────────────────────────────────────
  const addProject = useCallback((p: Omit<ProjectRecord, 'id' | 'readinessScore'>) => {
    mutate((s) => ({
      ...s,
      projects: [{ ...p, id: generateId(), readinessScore: 0 }, ...(s.projects || [])]
    }));
  }, [mutate]);
 
  const updateProject = useCallback((id: string, updates: Partial<ProjectRecord>) => {
    mutate((s) => ({
      ...s,
      projects: (s.projects || []).map((p) => (p.id === id ? { ...p, ...updates } : p))
    }));
  }, [mutate]);
 
  const deleteProject = useCallback((id: string) => {
    mutate((s) => ({
      ...s,
      projects: (s.projects || []).filter((p) => p.id !== id)
    }));
  }, [mutate]);

  // ── Habit Management ────────────────────────────────────────────────────────
  const addHabitItem = useCallback((groupId: string, label: string, detail: string) => {
    mutate((s) => {
      const currentGroups = s.habitGroups && s.habitGroups.length > 0 ? s.habitGroups : DEFAULT_HABIT_GROUPS;
      return {
        ...s,
        habitGroups: currentGroups.map((g) =>
          g.id === groupId ? { ...g, items: [...g.items, { id: generateId(), label, detail }] } : g
        ),
      };
    });
  }, [mutate]);

  const updateHabitItem = useCallback((groupId: string, itemId: string, updates: Partial<{ label: string; detail: string }>) => {
    mutate((s) => {
      const currentGroups = s.habitGroups && s.habitGroups.length > 0 ? s.habitGroups : DEFAULT_HABIT_GROUPS;
      return {
        ...s,
        habitGroups: currentGroups.map((g) =>
          g.id === groupId
            ? { ...g, items: g.items.map((it) => (it.id === itemId ? { ...it, ...updates } : it)) }
            : g
        ),
      };
    });
  }, [mutate]);

  const deleteHabitItem = useCallback((groupId: string, itemId: string) => {
    mutate((s) => {
      const currentGroups = s.habitGroups && s.habitGroups.length > 0 ? s.habitGroups : DEFAULT_HABIT_GROUPS;
      return {
        ...s,
        habitGroups: currentGroups.map((g) =>
          g.id === groupId ? { ...g, items: g.items.filter((it) => it.id !== itemId) } : g
        ),
      };
    });
  }, [mutate]);

  const updateHabitGroupTitle = useCallback((groupId: string, title: string) => {
    mutate((s) => {
      const currentGroups = s.habitGroups && s.habitGroups.length > 0 ? s.habitGroups : DEFAULT_HABIT_GROUPS;
      return {
        ...s,
        habitGroups: currentGroups.map((g) => (g.id === groupId ? { ...g, title } : g)),
      };
    });
  }, [mutate]);

  // ── Badge System ──────────────────────────────────────────────────────────────
  const markBadgesSeen = useCallback((ids: string[]) => {
    mutate((s) => ({
      ...s,
      seenBadgeIds: Array.from(new Set([...(s.seenBadgeIds ?? []), ...ids])),
    }));
  }, [mutate]);

  const value: AppContextType = {
    state,
    initialized,
    cloudSyncing,
    updateProfile,
    toggleSidebar,
    getTodayLog,
    toggleHabit,
    updateEnergy,
    updateConfidence,
    updateHours,
    updateDailyLog,
    toggleWeekTask,
    updateWeekFocus,
    addWeekTask,
    deleteWeekTask,
    addProblem,
    updateProblem,
    deleteProblem,
    addDsaSheetItem,
    updateDsaSheetItem,
    deleteDsaSheetItem,
    addMock,
    updateMock,
    deleteMock,
    addStar,
    updateStar,
    deleteStar,
    updateKnowledgeItem,
    addKnowledgeItem,
    deleteKnowledgeItem,
    addProject,
    updateProject,
    deleteProject,
    addHabitItem,
    updateHabitItem,
    deleteHabitItem,
    updateHabitGroupTitle,
    toggleTheme,
    markBadgesSeen,
    isSidebarHovered,
    setSidebarHovered,
    touchToday,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
