/* Mock Hub Production Types — Akash Mani */

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

// ── Questions ──────────────────────────────────────────────────────────────
export interface MockQuestion {
  id: string;
  title: string;
  content: string;
  type: 'mcq' | 'coding' | 'aptitude';
  difficulty: Difficulty;
  tags: string[];
  company: string;
  topic: string;
  options: string[];          // Always 4 options for MCQ/aptitude
  correctAnswer: number;      // Index into options (0-3)
  solutionExplanation: string;
  estimatedTimeSeconds: number;
  videoUrl?: string;
  testCases?: { input: string; output: string }[];
}

// ── Assessments ────────────────────────────────────────────────────────────
export interface MockAssessment {
  id: string;
  title: string;
  category: string;
  description: string;
  durationMinutes: number;
  totalQuestions: number;
  difficulty: Difficulty;
  companyTags: string[];
  color?: string;
  sections: AssessmentSection[];
  questions: MockQuestion[];
}

export interface AssessmentSection {
  name: string;
  questionCount: number;
  timeLimitMinutes: number;
  type: 'mcq' | 'coding' | 'aptitude';
}

// ── Submissions ────────────────────────────────────────────────────────────
export interface MockSubmission {
  id: string;
  userId: string;
  assessmentId: string;
  assessmentTitle: string;
  score: number;
  maxScore: number;
  accuracy: number;
  timeSpentSeconds: number;
  answers: Record<string, number>;  // questionId -> selectedOption index
  flaggedQuestions: string[];
  telemetry: SubmissionTelemetry;
  aiFeedback?: AIFeedbackReport;
  completedAt: string;
}

export interface SubmissionTelemetry {
  hesitationPoints: number;
  speed: number;
  antiCheatWarnings: number;
  tabSwitches: number;
  avgTimePerQuestion: number;
}

export interface AIFeedbackReport {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  communicationScore: number;
  technicalScore: number;
  confidenceScore: number;
  readinessScore: number;
  recommendations: string[];
}

// ── Rooms ──────────────────────────────────────────────────────────────────
export interface MockRoom {
  id: string;
  createdBy: string;
  title: string;
  type: string;
  company: string;
  difficulty: Difficulty;
  duration: string;
  maxParticipants: number;
  status: 'open' | 'ongoing' | 'completed';
  isPrivate: boolean;
  roomCode?: string;
  rating: number;
  participants: RoomParticipant[];
  createdAt: string;
}

export interface RoomParticipant {
  userId: string;
  displayName: string;
  role: 'interviewer' | 'interviewee';
  isOnline: boolean;
}

// ── Leaderboard ────────────────────────────────────────────────────────────
export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  score: number;
  streak: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  rank: number;
  assessmentsCompleted: number;
  avgAccuracy: number;
}

// ── Notifications ──────────────────────────────────────────────────────────
export interface MockNotification {
  id: string;
  type: 'achievement' | 'alert' | 'social' | 'reminder';
  text: string;
  icon: string;
  color: string;
  timestamp: string;
  read: boolean;
}

// ── Analytics ──────────────────────────────────────────────────────────────
export interface UserAnalytics {
  totalMocks: number;
  avgAccuracy: number;
  avgSpeed: number;
  streak: number;
  bestStreak: number;
  pressureIndex: number;       // Calculated from performance under time pressure
  readinessScore: number;      // Overall placement readiness
  rank: number;
  tier: string;
  weakTopics: string[];
  strongTopics: string[];
  recentTrend: number;         // % change last 7 days
  companyReadiness: Record<string, number>; // company -> readiness %
  topicAccuracy: Record<string, number>;    // topic -> accuracy %
}

// ── Schedule ───────────────────────────────────────────────────────────────
export interface ScheduledSession {
  id: string;
  partnerId: string;
  partnerName: string;
  type: string;
  date: string;
  time: string;
  timezone: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  roomId?: string;
}

// ── Friends ────────────────────────────────────────────────────────────────
export interface Friend {
  userId: string;
  displayName: string;
  status: string;
  isOnline: boolean;
  lastActive: string;
}

// ── Squad ──────────────────────────────────────────────────────────────────
export interface Squad {
  id: string;
  name: string;
  memberCount: number;
  globalRank: number;
  members: { name: string; avatar?: string }[];
}
