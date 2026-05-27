-- Add difficulty and type to matchmaking_queue
ALTER TABLE public.matchmaking_queue
ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'Medium',
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'Technical (DSA)';

-- Create or replace the match_peer function for atomic matchmaking
CREATE OR REPLACE FUNCTION public.match_peer(
  p_user_id UUID,
  p_display_name TEXT,
  p_company TEXT,
  p_difficulty TEXT,
  p_type TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  matched_user RECORD;
  new_room_id UUID;
BEGIN
  -- Try to find someone waiting in the queue who is not the current user
  -- Match on company, difficulty, and type
  SELECT * INTO matched_user
  FROM public.matchmaking_queue
  WHERE user_id != p_user_id
    AND company = p_company
    AND difficulty = p_difficulty
    AND type = p_type
  ORDER BY joined_at ASC
  FOR UPDATE SKIP LOCKED
  LIMIT 1;

  IF FOUND THEN
    -- Remove the matched user from the queue
    DELETE FROM public.matchmaking_queue WHERE user_id = matched_user.user_id;
    -- Remove self if we were already in the queue from a previous failed attempt
    DELETE FROM public.matchmaking_queue WHERE user_id = p_user_id;

    -- Create a new room
    INSERT INTO public.mock_rooms (title, type, difficulty, company, created_by, status, duration)
    VALUES ('Peer Mock Interview', p_type, p_difficulty, p_company, p_user_id, 'in-progress', '45m')
    RETURNING id INTO new_room_id;

    -- Add both users to room_participants
    INSERT INTO public.room_participants (room_id, user_id, role)
    VALUES (new_room_id, matched_user.user_id, 'peer'),
           (new_room_id, p_user_id, 'peer');

    RETURN new_room_id;
  ELSE
    -- No match found, insert self into queue
    INSERT INTO public.matchmaking_queue (user_id, display_name, role, company, difficulty, type)
    VALUES (p_user_id, p_display_name, 'peer', p_company, p_difficulty, p_type)
    ON CONFLICT (user_id) DO UPDATE 
    SET display_name = EXCLUDED.display_name,
        company = EXCLUDED.company,
        difficulty = EXCLUDED.difficulty,
        type = EXCLUDED.type,
        joined_at = timezone('utc'::text, now());
        
    RETURN NULL;
  END IF;
END;
$$;
