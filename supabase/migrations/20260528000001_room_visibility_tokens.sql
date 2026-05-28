-- ═══════════════════════════════════════════════════════════════════════════
-- Room Visibility: Private rooms visible in arena (but locked)
-- + Add has_passcode as a GENERATED column so it's always accurate
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Drop the column we added as a plain boolean (replace with generated) ──
-- In case the previous migration added has_passcode as a plain column:
ALTER TABLE public.mock_rooms
  DROP COLUMN IF EXISTS has_passcode;

-- ── Re-add as a GENERATED column — always reflects passcode_hash presence ──
ALTER TABLE public.mock_rooms
  ADD COLUMN IF NOT EXISTS has_passcode BOOLEAN
    GENERATED ALWAYS AS (passcode_hash IS NOT NULL) STORED;

-- ── Drop old SELECT policy that only showed public rooms ──────────────────
DROP POLICY IF EXISTS "Public waiting rooms are visible to all" ON public.mock_rooms;

-- ── New policy: ALL waiting rooms visible to everyone ─────────────────────
-- Both public and private rooms appear in the arena list.
-- Security is enforced at the JOIN level (passcode/invite token gate).
-- The passcode_hash column is NEVER selected by client queries.
CREATE POLICY "All waiting rooms are discoverable"
  ON public.mock_rooms FOR SELECT
  USING (status = 'waiting');

-- ── Security: create a column-masking view for safe client reads ──────────
-- This view exposes all room fields EXCEPT passcode_hash.
-- Clients should query this view (or use explicit SELECT without passcode_hash).
CREATE OR REPLACE VIEW public.mock_rooms_safe AS
  SELECT
    id,
    title,
    type,
    difficulty,
    company,
    duration,
    created_by,
    created_at,
    status,
    is_private,
    has_passcode,
    max_participants
  FROM public.mock_rooms;

-- Grant SELECT on the safe view
GRANT SELECT ON public.mock_rooms_safe TO authenticated, anon;
