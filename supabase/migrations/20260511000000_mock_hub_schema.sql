-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- MOCK ROOMS (for realtime interviews)
CREATE TABLE IF NOT EXISTS public.mock_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    company TEXT,
    duration TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'in-progress', 'completed', 'cancelled'))
);

-- ROOM PARTICIPANTS
CREATE TABLE IF NOT EXISTS public.room_participants (
    room_id UUID REFERENCES public.mock_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('interviewer', 'interviewee', 'peer')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_online BOOLEAN DEFAULT true,
    last_ping TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (room_id, user_id)
);

-- SUBMISSIONS (Assessments)
CREATE TABLE IF NOT EXISTS public.submissions (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    assessment_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    accuracy NUMERIC NOT NULL,
    time_spent_seconds INTEGER NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    telemetry JSONB NOT NULL,
    ai_feedback JSONB
);

-- SQUADS (Friendships / Study Partners)
CREATE TABLE IF NOT EXISTS public.squads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    friend_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, friend_id)
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    text TEXT NOT NULL,
    icon TEXT,
    color TEXT,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ROW LEVEL SECURITY (RLS) POLICIES --

-- Enable RLS
ALTER TABLE public.mock_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- mock_rooms policies
CREATE POLICY "Anyone can view waiting rooms" ON public.mock_rooms FOR SELECT USING (status = 'waiting');
CREATE POLICY "Participants can view their rooms" ON public.mock_rooms FOR SELECT USING (
    id IN (SELECT room_id FROM public.room_participants WHERE user_id = auth.uid())
);
CREATE POLICY "Users can create rooms" ON public.mock_rooms FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Room creators can update rooms" ON public.mock_rooms FOR UPDATE USING (auth.uid() = created_by);

-- room_participants policies
CREATE POLICY "Anyone can view participants of waiting rooms" ON public.room_participants FOR SELECT USING (
    room_id IN (SELECT id FROM public.mock_rooms WHERE status = 'waiting')
);
CREATE POLICY "Users can view participants of their rooms" ON public.room_participants FOR SELECT USING (
    room_id IN (SELECT room_id FROM public.room_participants WHERE user_id = auth.uid())
);
CREATE POLICY "Users can join rooms" ON public.room_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their participant status" ON public.room_participants FOR UPDATE USING (auth.uid() = user_id);

-- submissions policies
CREATE POLICY "Users can view their own submissions" ON public.submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own submissions" ON public.submissions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- squads policies
CREATE POLICY "Users can view their squads" ON public.squads FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "Users can insert squads" ON public.squads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their squads" ON public.squads FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- notifications policies
CREATE POLICY "Users can view their notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);

-- MATCHMAKING QUEUE
CREATE TABLE IF NOT EXISTS public.matchmaking_queue (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL,
    company TEXT NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.matchmaking_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert themselves into queue" ON public.matchmaking_queue FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view queue" ON public.matchmaking_queue FOR SELECT USING (true);
CREATE POLICY "Users can delete themselves from queue" ON public.matchmaking_queue FOR DELETE USING (auth.uid() = user_id);

