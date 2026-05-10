import { create } from 'zustand';
import { MockRoom, Assessment, Question, Submission } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { SEED_ASSESSMENTS } from '@/lib/mockHubData';
import { generateAIFeedback } from '@/lib/aiFeedback';
import { toast } from 'sonner';

interface MockState {
  activeRoom: MockRoom | null;
  availableRooms: MockRoom[];
  assessments: Assessment[];
  currentAssessment: Assessment | null;
  isAssessmentActive: boolean;
  lastSubmission: Submission | null;
  
  // Actions
  fetchRooms: () => Promise<void>;
  createRoom: (room: Partial<MockRoom>) => Promise<void>;
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  
  fetchAssessments: () => Promise<void>;
  startAssessment: (assessmentId: string) => Promise<void>;
  submitAssessment: (submission: Omit<Submission, 'id' | 'completedAt'>) => Promise<void>;
}

export const useMockStore = create<MockState>((set, get) => ({
  activeRoom: null,
  availableRooms: [],
  assessments: SEED_ASSESSMENTS,
  currentAssessment: null,
  isAssessmentActive: false,
  lastSubmission: null,

  fetchRooms: async () => {
    const { data, error } = await supabase
      .from('mock_rooms')
      .select('*, room_participants(user_id, role)')
      .eq('status', 'open');
    
    if (data && !error) {
      set({ availableRooms: data as any });
    }
  },

  createRoom: async (roomData) => {
    // Logic to create room in Supabase
    const { data, error } = await supabase
      .from('mock_rooms')
      .insert([roomData])
      .select()
      .single();
    
    if (data && !error) {
      set({ activeRoom: data as any });
    }
  },

  joinRoom: async (roomId) => {
    // Logic to join room
    set({ activeRoom: { id: roomId } as any });
  },

  leaveRoom: async () => {
    set({ activeRoom: null });
  },

  fetchAssessments: async () => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      set({ assessments: SEED_ASSESSMENTS });
      return;
    }

    const { data, error } = await supabase
      .from('assessments')
      .select('*');
    
    if (data && !error && data.length > 0) {
      set({ assessments: data as any });
    } else {
      set({ assessments: SEED_ASSESSMENTS });
    }
  },

  startAssessment: async (assessmentId) => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const exam = SEED_ASSESSMENTS.find(a => a.id === assessmentId);
      if (exam) {
        set({ currentAssessment: exam, isAssessmentActive: true });
      } else {
        // Fallback to first seed if id doesn't match (for demo)
        set({ currentAssessment: SEED_ASSESSMENTS[0], isAssessmentActive: true });
      }
      return;
    }

    // Fetch assessment with questions
    const { data, error } = await supabase
      .from('assessments')
      .select('*, questions(*)')
      .eq('id', assessmentId)
      .single();
    
    if (data && !error) {
      set({ currentAssessment: data as any, isAssessmentActive: true });
    } else {
      // Final fallback if DB is empty but connected
      const exam = SEED_ASSESSMENTS.find(a => a.id === assessmentId) || SEED_ASSESSMENTS[0];
      set({ currentAssessment: exam, isAssessmentActive: true });
    }
  },

  submitAssessment: async (submission) => {
    toast.loading('Analyzing your performance with AI...', { id: 'submit-assessment' });
    
    // Generate AI Feedback
    const aiFeedback = await generateAIFeedback(submission, 'assessment');
    
    const fullSubmission = {
      ...submission,
      id: Math.random().toString(36).substr(2, 9),
      completedAt: new Date().toISOString(),
      aiFeedback
    };
    
    const { error } = await supabase
      .from('submissions')
      .insert([fullSubmission]);
    
    if (error) {
      console.error('Supabase Error:', error.message);
    }

    toast.success('Simulation data persisted!', { id: 'submit-assessment' });
    
    set({ 
      isAssessmentActive: false, 
      currentAssessment: null,
      lastSubmission: fullSubmission as Submission
    });
  }
}));
