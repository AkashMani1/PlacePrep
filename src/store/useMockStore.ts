import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Assessment, Question, Submission } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { SEED_ASSESSMENTS } from '@/lib/mockQuestions';
import { toast } from 'sonner';

// ── Connection health tracker ─────────────────────────────────
let _dbHealthy = true;
const setDbHealth = (healthy: boolean) => { _dbHealthy = healthy; };
export const isDbHealthy = () => _dbHealthy;

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
  myCreatedRooms: string[];
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
  createRoom: (room: Partial<MockRoom>) => Promise<string>;
  deleteRoom: (roomId: string) => Promise<void>;
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
      myCreatedRooms: [],
      isLoadingRooms: false,

      assessments: [],
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
            .select('*, room_participants(*)')
            .eq('status', 'waiting')
            .order('created_at', { ascending: false })
            .limit(20);

          setDbHealth(!error);
          set({ availableRooms: (data as any) ?? [], isLoadingRooms: false });
        } catch {
          setDbHealth(false);
          set({ availableRooms: [], isLoadingRooms: false });
        }
      },

      createRoom: async (roomData) => {
        const roomId = crypto.randomUUID();
        const newRoom: MockRoom = {
          id: roomId,
          title: roomData.title || 'New Session',
          type: roomData.type || 'Technical (DSA)',
          company: roomData.company || 'General',
          difficulty: roomData.difficulty || 'Medium',
          duration: '45m',
          participants: [],
          rating: 0,
          status: 'waiting',
          ...roomData,
        } as MockRoom;

        if (_dbHealthy) {
          const { error } = await supabase.from('mock_rooms').insert([{
            id: roomId,
            title: newRoom.title,
            type: newRoom.type,
            difficulty: newRoom.difficulty,
            company: newRoom.company,
            status: 'waiting',
          }]);
          if (error) {
            console.warn('Room creation DB error:', error.message);
            toast.warning('Room created locally — DB sync failed. Check connection.');
          }
        }

        set((s) => ({
          activeRoom: newRoom,
          myCreatedRooms: [...s.myCreatedRooms, roomId]
        }));
        return roomId;
      },

      deleteRoom: async (roomId) => {
        if (_dbHealthy) {
          const { error } = await supabase.from('mock_rooms').delete().eq('id', roomId);
          if (error) {
            console.warn('Room deletion DB error:', error.message);
            toast.error('Failed to delete room from server.');
          }
        }
        set((s) => ({
          availableRooms: s.availableRooms.filter(r => r.id !== roomId),
          myCreatedRooms: s.myCreatedRooms.filter(id => id !== roomId),
          activeRoom: s.activeRoom?.id === roomId ? null : s.activeRoom
        }));
        toast.success('Room deleted successfully.');
      },

      joinRoom: async (roomId) => {
        let rooms = get().availableRooms;
        let room = rooms.find(r => r.id === roomId);

        if (!room && _dbHealthy) {
          const { data, error } = await supabase.from('mock_rooms').select('*').eq('id', roomId).single();
          if (data && !error) {
            room = data as any;
          }
        }

        if (room) {
          set({ activeRoom: room });
          toast.success('Joined room');
        } else {
          toast.error('Room not found or no longer active.');
          throw new Error('ROOM_NOT_FOUND');
        }
      },

      leaveRoom: () => {
        set({ activeRoom: null });
        toast.info('Left the room');
      },

      // ── Assessment Actions ─────────────────────────────────────────────

      fetchAssessments: async () => {
        set({ isLoadingAssessments: true });
        try {
          const { data, error } = await supabase
            .from('assessments')
            .select('*, questions(*)')
            .eq('is_active', true);

          if (data && !error && data.length > 0) {
            setDbHealth(true);
            // Normalize DB column names (snake_case → camelCase)
            const normalized = data.map((a: any) => ({
              ...a,
              durationMinutes: a.duration_minutes ?? a.durationMinutes,
              totalQuestions: a.total_questions ?? a.totalQuestions,
              companyTags: a.company_tags ?? a.companyTags ?? [],
              questions: (a.questions ?? []).map((q: any) => ({
                ...q,
                correctAnswer: q.correct_answer ?? q.correctAnswer,
                solutionExplanation: q.solution_explanation ?? q.solutionExplanation,
                estimatedTimeSeconds: q.estimated_time_seconds ?? q.estimatedTimeSeconds,
              })),
            }));
            set({ assessments: normalized, isLoadingAssessments: false });
          } else {
            // DB is empty or schema missing — fall back to seed data
            setDbHealth(false);
            console.warn('[Mock Hub] Assessments table empty or missing — using seed data.');
            set({ assessments: SEED_ASSESSMENTS, isLoadingAssessments: false });
          }
        } catch (err) {
          console.warn('[Mock Hub] Cannot reach DB — using seed data.', err);
          set({ assessments: SEED_ASSESSMENTS, isLoadingAssessments: false });
        }
      },

      startAssessment: (assessmentId) => {
        const assessments = get().assessments;
        // DB-first, then seed fallback
        const exam = assessments.find(a => a.id === assessmentId)
          || SEED_ASSESSMENTS.find(a => a.id === assessmentId);
        if (!exam) {
          toast.error('Assessment not found');
          return;
        }
        set({
          currentAssessment: exam,
          isAssessmentActive: true,
          assessmentAnswers: {},
          flaggedQuestions: [],
        });
      },

      restoreAssessment: async (recoveryData) => {
        const assessments = get().assessments;
        // Try in-memory first (instant), then DB, then seed
        let assessment = assessments.find(a => a.id === recoveryData.assessmentId)
          || SEED_ASSESSMENTS.find(a => a.id === recoveryData.assessmentId);

        if (!assessment && _dbHealthy) {
          const { data } = await supabase
            .from('assessments')
            .select('*, questions(*)')
            .eq('id', recoveryData.assessmentId)
            .single();
          assessment = data as any;
        }

        if (assessment) {
          set({
            currentAssessment: assessment,
            isAssessmentActive: true,
            assessmentAnswers: recoveryData.answers || {},
            flaggedQuestions: recoveryData.flagged || [],
          });
          toast.success('Assessment session recovered.');
        } else {
          toast.error('Could not recover the assessment — it may have been deleted.');
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
          return submission.id;
        } catch (err) {
          console.error(err);
          set({ isSubmittingAssessment: false });
          toast.error('Failed to submit assessment to server. Please check your connection.', { duration: 5000 });
          throw err;
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

        let channel: ReturnType<typeof supabase.channel> | null = null;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        const cleanupAndReset = async (reason?: string) => {
          if (timeoutId) clearTimeout(timeoutId);
          if (channel) { supabase.removeChannel(channel); channel = null; }
          try {
            await supabase.from('matchmaking_queue').delete().eq('user_id', userId);
          } catch { /* ignore cleanup errors */ }
          set({ isMatchmaking: false, matchmakingStatus: '' });
          if (reason) toast.error(reason);
        };

        const { error } = await supabase.from('matchmaking_queue').upsert([{
          user_id: userId === 'anon' ? crypto.randomUUID() : userId,
          display_name: displayName,
          role: 'interviewee',
          company: 'General',
          difficulty: 'Medium',
        }], { onConflict: 'user_id' });

        if (error) {
          console.warn('[Matchmaking] Queue insert failed:', error.code, error.message);
          setDbHealth(false);
          await cleanupAndReset();
          toast.error(
            error.code === 'PGRST205'
              ? 'Database not ready — run schema migrations first.'
              : `Matchmaking unavailable: ${error.message}`
          );
          return;
        }

        set({ matchmakingStatus: 'Searching for peers...' });

        // 2. Subscribe to realtime room assignments
        channel = supabase.channel(`matchmaking:${userId}`, {
          config: { broadcast: { ack: false } }
        });

        channel.on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'room_participants',
          filter: `user_id=eq.${userId}`,
        }, async (payload: any) => {
          const roomId = payload.new?.room_id;
          if (!roomId) return;

          const { data: roomData } = await supabase
            .from('mock_rooms')
            .select('*, room_participants(*)')
            .eq('id', roomId)
            .single();

          if (roomData) {
            if (timeoutId) clearTimeout(timeoutId);
            if (channel) { supabase.removeChannel(channel); channel = null; }
            set({
              isMatchmaking: false,
              matchmakingStatus: '',
              activeRoom: {
                id: roomData.id,
                title: roomData.title,
                type: roomData.type,
                company: roomData.company || 'General',
                difficulty: roomData.difficulty,
                duration: roomData.duration || '45m',
                participants: (roomData.room_participants || []).map((p: any) => ({
                  userId: p.user_id,
                  displayName: p.display_name || 'Anonymous',
                  role: p.role,
                  isOnline: p.is_online ?? true,
                })),
                rating: 0,
                status: roomData.status,
              } as MockRoom,
            });
            toast.success('Match found! Entering interview room...');
          }
        }).subscribe((status) => {
          if (status === 'CHANNEL_ERROR') {
            cleanupAndReset('Realtime connection failed. Check your network.');
          }
        });

        // 3. 30-second timeout — surface clear error, never leave infinite state
        timeoutId = setTimeout(async () => {
          if (get().isMatchmaking) {
            await cleanupAndReset('No peers found in 30 seconds. Try again soon.');
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
        myCreatedRooms: state.myCreatedRooms,
        leaderboard: state.leaderboard,
        scheduledSessions: state.scheduledSessions,
        notifications: state.notifications,
        friends: state.friends,
      }),
    }
  )
);
