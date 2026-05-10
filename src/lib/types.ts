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
  subtopic?: string;
  difficulty: Difficulty;
  platform: Platform;
  status: ProblemStatus;
  notes: string;
  addedAt: string;
  videoUrl?: string;
  readingUrl?: string;
  // ── SRS Fields (Spaced Repetition System) ──────────────────────────────
  srsNextReview?: string;    // ISO date: when to surface for review
  srsInterval?: number;      // current interval in days: 3, 7, or 21
  srsReviewCount?: number;   // total number of SRS review cycles completed
  srsLastReviewed?: string;  // ISO date of the last SRS review session
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
  // ── Advanced Analytics (Elite Feedback) ──────────────────────────────
  metrics?: {
    communication: number; // 0-100
    technical: number;     // 0-100
    behavioral: number;    // 0-100
    pressure: number;      // 0-100 (handling)
    confidence: number;    // 0-100
    clarity: number;       // 0-100
  };
  durationMinutes?: number;
  interviewerName?: string;
  rejectionTriggers?: string[]; // Likely causes for rejection
  strengths?: string[];
  weakZones?: string[];
}

export interface AssessmentRecord {
  id: string;
  title: string; // e.g. "Amazon OA Simulator", "TCS NQT Full Mock"
  category: 'Aptitude' | 'Technical' | 'Full';
  score: number;
  maxScore: number;
  percentile?: number;
  date: string;
  accuracy: number;
  avgTimePerQuestion: number;
  sections: {
    name: string;
    score: number;
    maxScore: number;
    timeSpent: number;
  }[];
}

export interface PeerSession {
  id: string;
  partnerName: string;
  role: 'Interviewer' | 'Interviewee';
  type: string;
  date: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  roomUrl?: string;
  roomId?: string;
}

export interface MockRoom {
  id: string;
  createdBy: string;
  title: string;
  type: string;
  company?: string;
  difficulty: Difficulty;
  maxParticipants: number;
  status: 'open' | 'ongoing' | 'completed';
  isPrivate: boolean;
  roomCode?: string;
  participants: {
    userId: string;
    fullName: string;
    role: 'interviewer' | 'interviewee';
  }[];
  createdAt: string;
}

export interface Question {
  id: string;
  title: string;
  content: string;
  type: 'mcq' | 'coding' | 'aptitude';
  difficulty: Difficulty;
  tags: string[];
  solutionExplanation?: string;
  testCases?: any;
}

export interface Assessment {
  id: string;
  title: string;
  category: string;
  description: string;
  durationMinutes: number;
  totalQuestions: number;
  difficulty: Difficulty;
  companyTags: string[];
  questions?: Question[];
}

export interface Submission {
  id: string;
  userId: string;
  assessmentId: string;
  score: number;
  maxScore: number;
  accuracy: number;
  timeSpentSeconds: number;
  telemetry: {
    hesitationPoints: number;
    speed: number; // Qs per minute
    antiCheatWarnings: number;
  };
  aiFeedback?: {
    summary: string;
    strengths: string[];
    weaknesses: string[];
    communicationScore: number;
  };
  completedAt: string;
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
  seenBadgeIds?: string[];   // IDs of badges whose unlock toast has already been shown
  assessments?: AssessmentRecord[];
  peerSessions?: PeerSession[];
}

// ── Badge System ──────────────────────────────────────────────────────────────
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;                            // Lucide icon name
  color: string;                           // Tailwind gradient class
  tier: BadgeTier;
  check: (state: AppState) => boolean;     // Pure unlock condition
}
