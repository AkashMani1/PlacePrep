import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Assessment, Question, Submission } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { SEED_ASSESSMENTS } from '@/lib/mockQuestions';
import { toast } from 'sonner';

// ── Types ────────────────────────────────────────────────────────────────

interface MockRoom {
  id: string;
  title: string;
  type: string;
  company: string;
  difficulty: string;
  duration: string;
  participants: { userId: string; displayName: string; role: string; isOnline?: boolean }[];
  rating: number;
  status: string;
}

interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  score: number;
  streak: number;
  tier: string;
  isCurrentUser: boolean;
}

interface UserAnalytics {
  totalMocks: number;
  avgAccuracy: number;
  streak: number;
  bestStreak: number;
  pressureIndex: number;
  readinessScore: number;
  recentTrend: number;
  topicAccuracy: Record<string, number>;
  weakTopics: string[];
  strongTopics: string[];
}

interface ScheduledSession {
  id: string;
  partnerName: string;
  type: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

interface Friend {
  userId: string;
  displayName: string;
  status: string;
  isOnline: boolean;
}

interface MockNotification {
  id: string;
  type: 'achievement' | 'alert' | 'social' | 'reminder';
  text: string;
  icon: string;
  color: string;
  timestamp: string;
  read: boolean;
}

// ── State ────────────────────────────────────────────────────────────────

interface MockState {
  // Room state
  activeRoom: MockRoom | null;
  availableRooms: MockRoom[];
  isLoadingRooms: boolean;

  // Assessment state
  assessments: Assessment[];
  currentAssessment: Assessment | null;
  isAssessmentActive: boolean;
  lastSubmission: Submission | null;
  assessmentAnswers: Record<string, number>;
  flaggedQuestions: string[];
  isLoadingAssessments: boolean;
  isSubmittingAssessment: boolean;

  // Analytics
  analytics: UserAnalytics;
  submissions: Submission[];

  // Leaderboard
  leaderboard: LeaderboardEntry[];
  isLoadingLeaderboard: boolean;

  // Social
  friends: Friend[];
  scheduledSessions: ScheduledSession[];
  notifications: MockNotification[];
  onlineCount: number;

  // Matchmaking
  isMatchmaking: boolean;
  matchmakingStatus: string;

  // Actions
  fetchRooms: () => Promise<void>;
  createRoom: (room: Partial<MockRoom>) => Promise<void>;
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: () => void;

  fetchAssessments: () => Promise<void>;
  startAssessment: (assessmentId: string) => void;
  setAnswer: (questionId: string, optionIndex: number) => void;
  toggleFlag: (questionId: string) => void;
  restoreAssessment: (recoveryData: any) => void;
  submitAssessment: (userId: string, timeSpent: number, warnings: number) => void;

  computeAnalytics: (userId: string) => void;
  computeLeaderboard: () => void;

  startMatchmaking: (userId: string, displayName: string) => void;
  cancelMatchmaking: (userId: string) => void;

  addScheduledSession: (session: Omit<ScheduledSession, 'id'>) => void;
  cancelSession: (sessionId: string) => void;

  addNotification: (n: Omit<MockNotification, 'id' | 'timestamp' | 'read'>) => void;
  dismissNotification: (id: string) => void;
}

// ── Helper: generate AI feedback locally ─────────────────────────────────

function generateLocalFeedback(score: number, maxScore: number, accuracy: number) {
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (accuracy >= 80) strengths.push('Strong accuracy fundamentals');
  if (accuracy >= 90) strengths.push('Exceptional precision under pressure');
  if (accuracy >= 60 && accuracy < 80) strengths.push('Solid foundational knowledge');
  if (accuracy < 60) weaknesses.push('Accuracy needs significant improvement');
  if (accuracy < 40) weaknesses.push('Core concepts require revision');

  if (strengths.length === 0) strengths.push('Completed assessment under timed conditions');
  if (weaknesses.length === 0) weaknesses.push('Minor optimization gaps in speed');

  return {
    summary: accuracy >= 80
      ? `Excellent performance with ${accuracy.toFixed(0)}% accuracy. You demonstrate strong command of the tested topics.`
      : accuracy >= 60
      ? `Good attempt with ${accuracy.toFixed(0)}% accuracy. Focus on weak areas to reach placement readiness.`
      : `Your accuracy of ${accuracy.toFixed(0)}% indicates gaps in fundamentals. Prioritize revision and practice.`,
    strengths,
    weaknesses,
    communicationScore: Math.min(100, Math.round(accuracy * 0.9 + 10)),
    technicalScore: Math.round(accuracy),
    confidenceScore: Math.min(100, Math.round(accuracy * 0.85 + 15)),
    readinessScore: Math.round(accuracy * 0.8),
    recommendations: [
      accuracy < 70 ? 'Focus on timed practice sessions' : 'Attempt harder difficulty levels',
      'Review incorrect answers and study explanations',
    ],
  };
}

// ── Store ────────────────────────────────────────────────────────────────

export const useMockStore = create<MockState>()(
  persist(
    (set, get) => ({
      activeRoom: null,
      availableRooms: [],
      isLoadingRooms: false,

      assessments: SEED_ASSESSMENTS,
      currentAssessment: null,
      isAssessmentActive: false,
      lastSubmission: null,
      assessmentAnswers: {},
      flaggedQuestions: [],
      isLoadingAssessments: false,
      isSubmittingAssessment: false,

      analytics: {
        totalMocks: 0, avgAccuracy: 0, streak: 0, bestStreak: 0,
        pressureIndex: 0, readinessScore: 0, recentTrend: 0,
        topicAccuracy: {}, weakTopics: [], strongTopics: [],
      },
      submissions: [],

      leaderboard: [],
      isLoadingLeaderboard: false,

      friends: [],
      scheduledSessions: [],
      notifications: [],
      onlineCount: 0,

      isMatchmaking: false,
      matchmakingStatus: '',

      // ── Room Actions ───────────────────────────────────────────────────

      fetchRooms: async () => {
        set({ isLoadingRooms: true });
        try {
          const { data, error } = await supabase
            .from('mock_rooms')
            .select('*')
            .eq('status', 'open');

          if (data && !error && data.length > 0) {
            set({ availableRooms: data as any, isLoadingRooms: false });
          } else {
            set({ availableRooms: [], isLoadingRooms: false });
          }
        } catch {
          set({ availableRooms: [], isLoadingRooms: false });
        }
      },

      createRoom: async (roomData) => {
        const newRoom: MockRoom = {
          id: crypto.randomUUID(),
          title: roomData.title || 'New Session',
          type: roomData.type || 'Technical (DSA)',
          company: roomData.company || 'General',
          difficulty: roomData.difficulty || 'Medium',
          duration: '45m',
          maxParticipants: 4,
          participants: [{ userId: 'local', displayName: 'You', role: 'interviewer', isOnline: true }],
          rating: 0,
          status: 'open',
          ...roomData,
        } as MockRoom;

        try {
          await supabase.from('mock_rooms').insert([newRoom]);
        } catch { /* offline mode */ }

        set({ activeRoom: newRoom });
        toast.success('Room created successfully');
      },

      joinRoom: async (roomId) => {
        const rooms = get().availableRooms;
        const room = rooms.find(r => r.id === roomId);

        if (room) {
          set({ activeRoom: room });
        } else {
          // Create a local room representation
          set({
            activeRoom: {
              id: roomId,
              title: 'Live Mock Session',
              type: 'Technical (DSA)',
              company: 'General',
              difficulty: 'Medium',
              duration: '45m',
              participants: [{ userId: 'local', displayName: 'You', role: 'interviewee', isOnline: true }],
              rating: 0,
              status: 'ongoing',
            } as MockRoom,
          });
        }
        toast.success('Joined room');
      },

      leaveRoom: () => {
        set({ activeRoom: null });
        toast.info('Left the room');
      },

      // ── Assessment Actions ─────────────────────────────────────────────

      fetchAssessments: async () => {
        set({ isLoadingAssessments: true });
        try {
          const { data, error } = await supabase.from('assessments').select('*, questions(*)');
          if (data && !error && data.length > 0) {
            set({ assessments: data as any, isLoadingAssessments: false });
          } else {
            set({ assessments: SEED_ASSESSMENTS, isLoadingAssessments: false });
          }
        } catch {
          set({ assessments: SEED_ASSESSMENTS, isLoadingAssessments: false });
        }
      },

      startAssessment: (assessmentId) => {
        const assessments = get().assessments;
        const exam = assessments.find(a => a.id === assessmentId) || SEED_ASSESSMENTS.find(a => a.id === assessmentId) || SEED_ASSESSMENTS[0];
        set({
          currentAssessment: exam,
          isAssessmentActive: true,
          assessmentAnswers: {},
          flaggedQuestions: [],
        });
      },

      restoreAssessment: (recoveryData) => {
        const assessment = SEED_ASSESSMENTS.find(a => a.id === recoveryData.assessmentId);
        if (assessment) {
          set({
            currentAssessment: assessment,
            isAssessmentActive: true,
            assessmentAnswers: recoveryData.answers || {},
            flaggedQuestions: recoveryData.flagged || [],
          });
          toast.success('Assessment session recovered.');
        } else {
          toast.error('Could not find the original assessment.');
        }
      },

      setAnswer: (questionId, optionIndex) => {
        set(s => ({
          assessmentAnswers: { ...s.assessmentAnswers, [questionId]: optionIndex },
        }));
      },

      toggleFlag: (questionId) => {
        set(s => ({
          flaggedQuestions: s.flaggedQuestions.includes(questionId)
            ? s.flaggedQuestions.filter(id => id !== questionId)
            : [...s.flaggedQuestions, questionId],
        }));
      },

      submitAssessment: async (userId, timeSpent, warnings) => {
        const { currentAssessment, assessmentAnswers } = get();
        if (!currentAssessment) return;

        set({ isSubmittingAssessment: true });
        // Save to persistent submissions array optimistically for immediate UI? No, wait for server.
        try {
          const response = await fetch('/api/grade-assessment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              assessmentId: currentAssessment.id,
              answers: assessmentAnswers,
              timeSpentSeconds: timeSpent,
              warnings,
            }),
          });

          if (!response.ok) {
            throw new Error('Server grading failed');
          }

          const { submission } = await response.json();

          // Also fetch AI feedback asynchronously
          fetch('/api/ai-feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'assessment', data: submission })
          }).then(res => res.json()).then(aiRes => {
            // Update submission with AI feedback
            const updatedSubmission = { ...submission, aiFeedback: aiRes };
            set(s => ({
              submissions: s.submissions.map(sub => sub.id === submission.id ? updatedSubmission : sub),
              lastSubmission: updatedSubmission
            }));
          }).catch(console.error);

          const subs = [...get().submissions, submission];

          set({
            isAssessmentActive: false,
            currentAssessment: null,
            assessmentAnswers: {},
            flaggedQuestions: [],
            lastSubmission: submission,
            submissions: subs,
            isSubmittingAssessment: false,
          });

          // Trigger server-side analytics refresh
          get().computeAnalytics(userId);
          get().computeLeaderboard();

          toast.success('Assessment graded and saved securely!');
        } catch (err) {
          console.error(err);
          set({ isSubmittingAssessment: false });
          toast.error('Failed to submit assessment to server. Please check your connection.', { duration: 5000 });
        }
      },

      // ── Analytics ──────────────────────────────────────────────────────

      computeAnalytics: async (userId: string) => {
        try {
          const response = await fetch(`/api/analytics?userId=${userId}`);
          if (!response.ok) throw new Error('Failed to fetch analytics');
          const analytics = await response.json();
          set({ analytics });
        } catch (error) {
          console.error('Analytics error:', error);
          // Do not fallback to local spoofable data!
        }
      },

      computeLeaderboard: async () => {
        set({ isLoadingLeaderboard: true });
        try {
          const response = await fetch('/api/leaderboard');
          if (!response.ok) throw new Error('Failed to fetch leaderboard');
          const { leaderboard } = await response.json();
          const mappedLeaderboard = leaderboard.map((e: any) => ({
            ...e,
            id: e.userId
          }));
          set({ leaderboard: mappedLeaderboard, isLoadingLeaderboard: false });
        } catch (error) {
          console.error('Leaderboard error:', error);
          set({ isLoadingLeaderboard: false });
          // Do not fallback to fake data!
        }
      },

      // ── Matchmaking ────────────────────────────────────────────────────

      startMatchmaking: async (userId: string, displayName: string) => {
        set({ isMatchmaking: true, matchmakingStatus: 'Joining queue...' });

        // 1. Join queue in Supabase
        const { error } = await supabase.from('matchmaking_queue').insert([{
          user_id: userId,
          display_name: displayName,
          role: 'interviewee', // Simplified role for now
          company: 'General',
        }]);

        if (error) {
          console.warn('Matchmaking DB error (table might be missing):', error.message);
          set({ matchmakingStatus: 'Simulating peer discovery (DB Table Missing)...' });
          
          // Simulation Fallback for Demo/Audit
          setTimeout(() => {
            const mockRoom = {
              id: crypto.randomUUID(),
              title: 'Simulated Interview Room',
              type: 'Technical (DSA)',
              status: 'active',
              created_at: new Date().toISOString(),
              participants: [
                { userId: userId, displayName: displayName, role: 'interviewee' },
                { userId: 'simulated-peer', displayName: 'FAANG Interviewer (AI)', role: 'interviewer' }
              ]
            };
            set({
              isMatchmaking: false,
              matchmakingStatus: '',
              activeRoom: mockRoom as any
            });
            toast.success('Simulated peer found! Entering room...');
          }, 5000);
          return;
        }

        set({ matchmakingStatus: 'Searching for peers...' });

        // 2. Subscribe to mock_rooms to detect when a room is created for this user
        const channel = supabase.channel(`matchmaking:${userId}`)
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'mock_rooms',
          }, (payload) => {
            // Check if this new room has us as a participant
            supabase.from('room_participants')
              .select('*')
              .eq('room_id', payload.new.id)
              .eq('user_id', userId)
              .then(async ({ data: partData }) => {
                if (partData && partData.length > 0) {
                  // Fetch all participants for this room
                  const { data: allParticipants } = await supabase
                    .from('room_participants')
                    .select('user_id, display_name, role')
                    .eq('room_id', payload.new.id);

                  // We got matched!
                  set({
                    isMatchmaking: false,
                    matchmakingStatus: '',
                    activeRoom: {
                      ...payload.new,
                      participants: (allParticipants || []).map(p => ({
                        userId: p.user_id,
                        displayName: p.display_name,
                        role: p.role
                      }))
                    } as any,
                  });
                  supabase.removeChannel(channel);
                  toast.success('Match found! Entering room...');
                }
              });
          })
          .subscribe();

        // 3. Fallback edge case: if we don't get matched in 30s, cancel queue
        setTimeout(async () => {
          const state = get();
          if (state.isMatchmaking) {
            await supabase.from('matchmaking_queue').delete().eq('user_id', userId);
            supabase.removeChannel(channel);
            set({ isMatchmaking: false, matchmakingStatus: '' });
            toast.error('No peers found. Please try again later.');
          }
        }, 30000);
      },

      cancelMatchmaking: async (userId: string) => {
        set({ isMatchmaking: false, matchmakingStatus: '' });
        await supabase.from('matchmaking_queue').delete().eq('user_id', userId);
        toast.info('Matchmaking cancelled');
      },

      // ── Scheduling ─────────────────────────────────────────────────────

      addScheduledSession: (session) => {
        const newSession = { ...session, id: crypto.randomUUID() };
        set(s => ({ scheduledSessions: [...s.scheduledSessions, newSession] }));
        toast.success('Session scheduled');
      },

      cancelSession: (sessionId) => {
        set(s => ({
          scheduledSessions: s.scheduledSessions.map(ss =>
            ss.id === sessionId ? { ...ss, status: 'cancelled' as const } : ss
          ),
        }));
        toast.info('Session cancelled');
      },

      // ── Notifications ──────────────────────────────────────────────────

      addNotification: (n) => {
        const notification: MockNotification = {
          ...n,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          read: false,
        };
        set(s => ({ notifications: [notification, ...s.notifications].slice(0, 50) }));
      },

      dismissNotification: (id) => {
        set(s => ({
          notifications: s.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },
    }),
    {
      name: 'placeprep-mock-hub',
      partialize: (state) => ({
        submissions: state.submissions,
        analytics: state.analytics,
        leaderboard: state.leaderboard,
        scheduledSessions: state.scheduledSessions,
        notifications: state.notifications,
        friends: state.friends,
      }),
    }
  )
);
