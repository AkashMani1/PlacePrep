#!/usr/bin/env node
/**
 * deploy-schema.js
 * Pushes all Mock Hub SQL migrations to the live Supabase instance.
 *
 * Usage:
 *   node scripts/deploy-schema.js <SUPABASE_SERVICE_ROLE_KEY>
 *
 * The service role key is available in:
 *   Supabase Dashboard → Project Settings → API → service_role key
 */

const SUPABASE_URL = 'https://eavjczqputftpkxstxog.supabase.co';
const SERVICE_ROLE_KEY = process.argv[2];

if (!SERVICE_ROLE_KEY) {
  console.error('❌ Usage: node scripts/deploy-schema.js <SUPABASE_SERVICE_ROLE_KEY>');
  console.error('   Get it from: https://supabase.com/dashboard/project/eavjczqputftpkxstxog/settings/api');
  process.exit(1);
}

// Full combined schema - all migrations in one atomic operation
const FULL_SCHEMA_SQL = `
-- ============================================================
-- PLACEPREP MOCK HUB — FULL PRODUCTION SCHEMA
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ── MOCK ROOMS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.mock_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Technical (DSA)', 'System Design', 'HR & Behavioral', 'Full Loop Simulation', 'Aptitude')),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    company TEXT DEFAULT 'General',
    duration TEXT DEFAULT '45m',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'in-progress', 'completed', 'cancelled')),
    room_code TEXT UNIQUE,
    is_private BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_mock_rooms_status ON public.mock_rooms(status);
CREATE INDEX IF NOT EXISTS idx_mock_rooms_created_by ON public.mock_rooms(created_by);
CREATE INDEX IF NOT EXISTS idx_mock_rooms_created_at ON public.mock_rooms(created_at DESC);

-- ── ROOM PARTICIPANTS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.room_participants (
    room_id UUID REFERENCES public.mock_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL DEFAULT 'Anonymous',
    role TEXT NOT NULL CHECK (role IN ('interviewer', 'interviewee', 'peer')),
    joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    is_online BOOLEAN DEFAULT true,
    last_ping TIMESTAMPTZ DEFAULT NOW(),
    camera_on BOOLEAN DEFAULT true,
    mic_on BOOLEAN DEFAULT true,
    screen_sharing BOOLEAN DEFAULT false,
    PRIMARY KEY (room_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_room_participants_room ON public.room_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_room_participants_user ON public.room_participants(user_id);

-- ── MATCHMAKING QUEUE ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.matchmaking_queue (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('interviewer', 'interviewee')),
    company TEXT NOT NULL DEFAULT 'General',
    difficulty TEXT DEFAULT 'Medium',
    joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT matchmaking_queue_user_id_unique UNIQUE (user_id)
);

-- ── ASSESSMENTS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.assessments (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    company_tags TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_assessments_difficulty ON public.assessments(difficulty);
CREATE INDEX IF NOT EXISTS idx_assessments_tags ON public.assessments USING GIN(company_tags);

-- ── QUESTIONS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.questions (
    id TEXT PRIMARY KEY,
    assessment_id TEXT REFERENCES public.assessments(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('mcq', 'coding', 'aptitude')),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    tags TEXT[] NOT NULL DEFAULT '{}',
    company TEXT,
    topic TEXT,
    options TEXT[] NOT NULL DEFAULT '{}',
    correct_answer INTEGER NOT NULL,
    solution_explanation TEXT,
    estimated_time_seconds INTEGER DEFAULT 60,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_questions_assessment ON public.questions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_questions_type ON public.questions(type);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON public.questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_tags ON public.questions USING GIN(tags);

-- ── SUBMISSIONS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.submissions (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    assessment_id TEXT REFERENCES public.assessments(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0),
    max_score INTEGER NOT NULL CHECK (max_score > 0),
    accuracy NUMERIC(5,2) NOT NULL CHECK (accuracy >= 0 AND accuracy <= 100),
    time_spent_seconds INTEGER NOT NULL CHECK (time_spent_seconds >= 0),
    completed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    telemetry JSONB NOT NULL DEFAULT '{}',
    ai_feedback JSONB,
    anti_cheat_warnings INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_submissions_user ON public.submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assessment ON public.submissions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_completed ON public.submissions(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_accuracy ON public.submissions(accuracy DESC);

-- ── NOTIFICATIONS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('achievement', 'alert', 'social', 'reminder', 'match')),
    text TEXT NOT NULL,
    icon TEXT DEFAULT 'Bell',
    color TEXT DEFAULT 'blue',
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(user_id, read);

-- ── SQUADS / FRIENDSHIPS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.squads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    friend_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, friend_id),
    CONSTRAINT no_self_squad CHECK (user_id != friend_id)
);

-- ── INTERVIEW SESSIONS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.interview_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES public.mock_rooms(id) ON DELETE SET NULL,
    interviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    interviewee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    interviewer_notes TEXT,
    feedback JSONB,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned'))
);

CREATE INDEX IF NOT EXISTS idx_interview_sessions_interviewee ON public.interview_sessions(interviewee_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_status ON public.interview_sessions(status);

-- ── USER PROFILES (supplemental) ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    college TEXT,
    target_company TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ── REALTIME REPLICATION ──────────────────────────────────────
-- (Supabase automatically enables realtime for tables in publication)
ALTER TABLE public.mock_rooms REPLICA IDENTITY FULL;
ALTER TABLE public.room_participants REPLICA IDENTITY FULL;
ALTER TABLE public.matchmaking_queue REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.submissions REPLICA IDENTITY FULL;

-- Add to realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'mock_rooms'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.mock_rooms;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'room_participants'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.room_participants;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'matchmaking_queue'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.matchmaking_queue;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'submissions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.submissions;
  END IF;
END;
$$;

-- ── ROW LEVEL SECURITY ────────────────────────────────────────
ALTER TABLE public.mock_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matchmaking_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- mock_rooms policies
DROP POLICY IF EXISTS "Anyone can view waiting rooms" ON public.mock_rooms;
CREATE POLICY "Anyone can view waiting rooms" ON public.mock_rooms FOR SELECT USING (status = 'waiting');
DROP POLICY IF EXISTS "Participants can view their rooms" ON public.mock_rooms;
CREATE POLICY "Participants can view their rooms" ON public.mock_rooms FOR SELECT USING (
    id IN (SELECT room_id FROM public.room_participants WHERE user_id = auth.uid())
);
DROP POLICY IF EXISTS "Users can create rooms" ON public.mock_rooms;
CREATE POLICY "Users can create rooms" ON public.mock_rooms FOR INSERT WITH CHECK (auth.uid() = created_by);
DROP POLICY IF EXISTS "Room creators can update rooms" ON public.mock_rooms;
CREATE POLICY "Room creators can update rooms" ON public.mock_rooms FOR UPDATE USING (auth.uid() = created_by);

-- room_participants policies
DROP POLICY IF EXISTS "Anyone can view participants of waiting rooms" ON public.room_participants;
CREATE POLICY "Anyone can view participants of waiting rooms" ON public.room_participants FOR SELECT USING (
    room_id IN (SELECT id FROM public.mock_rooms WHERE status = 'waiting')
);
DROP POLICY IF EXISTS "Users can view participants of their rooms" ON public.room_participants;
CREATE POLICY "Users can view participants of their rooms" ON public.room_participants FOR SELECT USING (
    room_id IN (SELECT room_id FROM public.room_participants WHERE user_id = auth.uid())
);
DROP POLICY IF EXISTS "Users can join rooms" ON public.room_participants;
CREATE POLICY "Users can join rooms" ON public.room_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their participant status" ON public.room_participants;
CREATE POLICY "Users can update their participant status" ON public.room_participants FOR UPDATE USING (auth.uid() = user_id);

-- matchmaking_queue policies
DROP POLICY IF EXISTS "Users can insert themselves into queue" ON public.matchmaking_queue;
CREATE POLICY "Users can insert themselves into queue" ON public.matchmaking_queue FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can view queue" ON public.matchmaking_queue;
CREATE POLICY "Users can view queue" ON public.matchmaking_queue FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can delete themselves from queue" ON public.matchmaking_queue;
CREATE POLICY "Users can delete themselves from queue" ON public.matchmaking_queue FOR DELETE USING (auth.uid() = user_id);

-- assessments / questions (public read)
DROP POLICY IF EXISTS "Anyone can view assessments" ON public.assessments;
CREATE POLICY "Anyone can view assessments" ON public.assessments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can view questions" ON public.questions;
CREATE POLICY "Anyone can view questions" ON public.questions FOR SELECT USING (true);

-- submissions policies
DROP POLICY IF EXISTS "Users can view their own submissions" ON public.submissions;
CREATE POLICY "Users can view their own submissions" ON public.submissions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own submissions" ON public.submissions;
CREATE POLICY "Users can insert their own submissions" ON public.submissions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- notifications policies
DROP POLICY IF EXISTS "Users can view their notifications" ON public.notifications;
CREATE POLICY "Users can view their notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their notifications" ON public.notifications;
CREATE POLICY "Users can update their notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);

-- squads policies
DROP POLICY IF EXISTS "Users can view their squads" ON public.squads;
CREATE POLICY "Users can view their squads" ON public.squads FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);
DROP POLICY IF EXISTS "Users can insert squads" ON public.squads;
CREATE POLICY "Users can insert squads" ON public.squads FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their squads" ON public.squads;
CREATE POLICY "Users can update their squads" ON public.squads FOR UPDATE USING (auth.uid() = user_id);

-- interview_sessions policies
DROP POLICY IF EXISTS "Participants can view their sessions" ON public.interview_sessions;
CREATE POLICY "Participants can view their sessions" ON public.interview_sessions FOR SELECT USING (
    auth.uid() = interviewer_id OR auth.uid() = interviewee_id
);
DROP POLICY IF EXISTS "Interviewers can create sessions" ON public.interview_sessions;
CREATE POLICY "Interviewers can create sessions" ON public.interview_sessions FOR INSERT WITH CHECK (auth.uid() = interviewer_id);
DROP POLICY IF EXISTS "Participants can update sessions" ON public.interview_sessions;
CREATE POLICY "Participants can update sessions" ON public.interview_sessions FOR UPDATE USING (
    auth.uid() = interviewer_id OR auth.uid() = interviewee_id
);

-- profiles policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ── TRIGGERS ──────────────────────────────────────────────────
-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_mock_rooms_updated_at ON public.mock_rooms;
CREATE TRIGGER set_mock_rooms_updated_at
    BEFORE UPDATE ON public.mock_rooms
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── LEADERBOARD VIEW (DB-side, tamper-proof) ─────────────────
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT
    s.user_id,
    p.full_name AS name,
    p.username,
    p.avatar_url,
    COUNT(s.id)::INTEGER AS total_assessments,
    SUM(s.score)::INTEGER AS total_score,
    ROUND(AVG(s.accuracy)::NUMERIC, 1) AS avg_accuracy,
    MAX(s.score)::INTEGER AS best_score,
    ROW_NUMBER() OVER (ORDER BY SUM(s.score) DESC) AS rank
FROM public.submissions s
LEFT JOIN public.profiles p ON p.id = s.user_id
GROUP BY s.user_id, p.full_name, p.username, p.avatar_url
ORDER BY total_score DESC;

GRANT SELECT ON public.leaderboard TO anon, authenticated;
`;

async function deploySchema() {
  console.log('🚀 Deploying Mock Hub schema to Supabase...\n');

  // Use Supabase's pg REST endpoint to execute SQL
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sql: FULL_SCHEMA_SQL })
  });

  if (!response.ok) {
    // Try alternative: pg endpoint
    console.log('Trying direct pg endpoint...');
    const pgResponse = await fetch(`${SUPABASE_URL}/pg/query`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: FULL_SCHEMA_SQL })
    });

    const pgText = await pgResponse.text();
    console.log('PG response:', pgResponse.status, pgText.substring(0, 500));
    return;
  }

  const result = await response.json();
  console.log('✅ Schema deployed:', result);

  // Verify tables exist
  console.log('\n🔍 Verifying tables...');
  const tables = ['mock_rooms', 'room_participants', 'matchmaking_queue', 'assessments', 'questions', 'submissions', 'notifications'];
  for (const table of tables) {
    const check = await fetch(`${SUPABASE_URL}/rest/v1/${table}?limit=1`, {
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      }
    });
    console.log(`  ${check.ok ? '✅' : '❌'} ${table} (${check.status})`);
  }
}

deploySchema().catch(console.error);
