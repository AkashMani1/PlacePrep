/* Developed by Akash Mani - This site is developed by Akash Mani. Original watermark of Akash Mani. */
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type ProblemStatus = 'Todo' | 'Done' | 'Revisit';
export type Platform = 'LeetCode' | 'GFG' | 'CodeVita' | 'Other';
export type Phase = 'Ninja' | 'Digital' | 'Prime';
export type DSASheetSource = 'admin' | 'user';

export interface Problem {
  id: string;
  name: string;
  category: 'Aptitude' | 'DSA';
  isPriority?: boolean;
  topic: string;
  difficulty: Difficulty;
  platform: Platform;
  status: ProblemStatus;
  notes: string;
  addedAt: string;
  videoUrl?: string;
}

export interface DSASheetItem {
  id: string;
  section: string;
  subgroup?: string;
  sectionOrder: number;
  order: number;
  title: string;
  difficulty: Difficulty;
  practiceLinks: string[];
  resourceLinks: string[];
  videoUrl: string;
  companies: string[];
  notes?: string;
  completed: boolean;
  submissionDate?: string;
  revisionDate?: string;
  revisionPhase?: number;
  saved: boolean;
  source?: DSASheetSource;
  hidden?: boolean;
}

export interface MockInterview {
  id: string;
  type: string;
  score: number;
  maxScore: number;
  date: string;
  feedback: string;
}

export interface WeekTask {
  id: string;
  label: string;
  done: boolean;
}

export interface WeekPlan {
  week: number;
  phase: Phase;
  focus: string;
  tasks: WeekTask[];
}

export interface StarStory {
  id: string;
  tag: string;
  situation: string;
  task: string;
  action: string;
  result: string;
}

export type KnowledgeCategory = 'HR' | 'Core CS' | 'Aptitude';
export type CSSubcategory = 'OOPs' | 'Java' | 'DBMS' | 'Data Structures' | 'C Programming' | 'Algorithms' | 'Computer Networks' | 'Operating Systems' | 'General';

export interface KnowledgeItem {
  id: string;
  question: string;
  answer: string;
  category: KnowledgeCategory;
  subcategory?: CSSubcategory;
}

export interface DailyLog {
  date: string;
  completedHabits: string[];
  energy: number;
  confidence: number;
  hours: number;
  problemsSolved?: { easy: number; medium: number; hard: number };
  conceptsLearned?: string[];
  struggles?: string;
  tomorrowPlan?: { morning: string; afternoon: string };
}
 
export interface ProjectChallenge {
  id: string;
  problem: string;
  solution: string;
  result: string;
}

export interface ProjectRecord {
  id: string;
  name: string;
  description: string;
  role: string;
  techStack: string[];
  challenges: ProjectChallenge[];
  metrics: string[];
  repoUrl?: string;
  liveUrl?: string;
  status: 'Development' | 'Completed' | 'Live';
  readinessScore: number; // 0-100
}

export interface HabitItem {
  id: string;
  label: string;
  detail: string;
}

export interface HabitGroup {
  id: string;
  title: string;
  items: HabitItem[];
}

export interface AppState {
  weeks: WeekPlan[];
  problems: Problem[];
  dsaSheetItems?: DSASheetItem[];
  mocks: MockInterview[];
  stars: StarStory[];
  knowledgeBase: KnowledgeItem[];
  dailyLogs: DailyLog[];
  habitGroups: HabitGroup[];
  startDate: string; // ISO string when user started
  userName: string;
  targetRole: string;
  goalDurationMonths: number;
  sidebarCollapsed?: boolean;
  projects?: ProjectRecord[];
  theme?: 'light' | 'dark';
}
