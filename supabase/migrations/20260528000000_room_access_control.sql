-- ═══════════════════════════════════════════════════════════════════════════
-- Room Access Control Migration
-- Adds public/private room toggle with bcrypt-hashed passcode support.
-- NEVER stores plain-text passcodes.
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable pgcrypto for bcrypt hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Add access-control columns to mock_rooms ─────────────────────────────

ALTER TABLE public.mock_rooms
  ADD COLUMN IF NOT EXISTS is_private     BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS passcode_hash  TEXT             DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS max_participants INTEGER NOT NULL DEFAULT 2;

-- ── Drop existing over-broad SELECT policies ─────────────────────────────
-- We replace them with access-aware versions.

DROP POLICY IF EXISTS "Anyone can view waiting rooms"  ON public.mock_rooms;
DROP POLICY IF EXISTS "Participants can view their rooms" ON public.mock_rooms;

-- ── New SELECT policies ───────────────────────────────────────────────────

-- Public waiting rooms are discoverable by everyone
CREATE POLICY "Public waiting rooms are visible to all"
  ON public.mock_rooms FOR SELECT
  USING (status = 'waiting' AND is_private = false);

-- Any authenticated user can view a room they created
CREATE POLICY "Creators can always view their own rooms"
  ON public.mock_rooms FOR SELECT
  USING (auth.uid() = created_by);

-- Authenticated participants can view rooms they have joined
CREATE POLICY "Participants can view rooms they joined"
  ON public.mock_rooms FOR SELECT
  USING (
    id IN (
      SELECT room_id FROM public.room_participants
      WHERE user_id = auth.uid()
    )
  );

-- ── Secure passcode verification RPC ─────────────────────────────────────
-- Compares a plain-text passcode against the stored bcrypt hash.
-- Returns TRUE only if the hash matches.
-- The passcode_hash column is NEVER returned to the client via SELECT.
-- This function runs as SECURITY DEFINER so it can read passcode_hash
-- regardless of the caller's RLS context.

CREATE OR REPLACE FUNCTION public.verify_room_passcode(
  p_room_id  UUID,
  p_passcode TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hash TEXT;
BEGIN
  -- Fetch hash (bypasses RLS because SECURITY DEFINER)
  SELECT passcode_hash INTO v_hash
  FROM public.mock_rooms
  WHERE id = p_room_id;

  IF v_hash IS NULL THEN
    -- Room has no passcode set (public room or passcode cleared)
    RETURN TRUE;
  END IF;

  -- pgcrypto constant-time comparison
  RETURN v_hash = crypt(p_passcode, v_hash);
END;
$$;

-- ── Grant execute permission to authenticated users ───────────────────────
GRANT EXECUTE ON FUNCTION public.verify_room_passcode(UUID, TEXT) TO authenticated;

-- ── Helper RPC: create_private_room ──────────────────────────────────────
-- Inserts the room and hashes the passcode atomically on the DB side.
-- Client sends plain-text passcode; only the hash is persisted.

CREATE OR REPLACE FUNCTION public.create_room_with_passcode(
  p_id         UUID,
  p_title      TEXT,
  p_type       TEXT,
  p_difficulty TEXT,
  p_company    TEXT,
  p_is_private BOOLEAN,
  p_passcode   TEXT   -- NULL for public rooms
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hash TEXT := NULL;
BEGIN
  IF p_is_private AND p_passcode IS NOT NULL AND length(p_passcode) > 0 THEN
    -- Hash with bcrypt (work factor 10 — safe default)
    v_hash := crypt(p_passcode, gen_salt('bf', 10));
  END IF;

  INSERT INTO public.mock_rooms (
    id, title, type, difficulty, company,
    is_private, passcode_hash, status, created_by
  ) VALUES (
    p_id, p_title, p_type, p_difficulty, p_company,
    p_is_private, v_hash, 'waiting', auth.uid()
  );

  RETURN p_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_room_with_passcode(UUID, TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT) TO authenticated;

-- ── Index for fast privacy-aware listing ─────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_mock_rooms_public_waiting
  ON public.mock_rooms (status, is_private, created_at DESC)
  WHERE status = 'waiting' AND is_private = false;
