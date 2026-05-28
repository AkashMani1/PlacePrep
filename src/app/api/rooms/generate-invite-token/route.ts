import { NextRequest, NextResponse } from 'next/server';
import { createClient }              from '@supabase/supabase-js';
import { generateInviteToken }       from '@/lib/inviteToken';

// ── POST /api/rooms/generate-invite-token ─────────────────────────────────
// Only the room owner can generate a token for their room.
// Returns a signed invite token valid for 7 days.
export async function POST(req: NextRequest) {
  // ── Parse body ────────────────────────────────────────────────────────
  let body: { roomId?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 }); }

  const { roomId } = body;
  if (!roomId || typeof roomId !== 'string') {
    return NextResponse.json({ error: 'roomId is required.' }, { status: 400 });
  }

  // ── Verify caller is authenticated ───────────────────────────────────
  const authHeader = req.headers.get('authorization');
  const jwt        = authHeader?.replace('Bearer ', '');
  if (!jwt) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  // ── Verify caller owns the room (via user-level Supabase client) ──────
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${jwt}` } } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Invalid session.' }, { status: 401 });
  }

  // Check ownership — creator only
  const { data: room, error: roomError } = await supabase
    .from('mock_rooms')
    .select('id, created_by, is_private')
    .eq('id', roomId)
    .single();

  if (roomError || !room) {
    return NextResponse.json({ error: 'Room not found.' }, { status: 404 });
  }

  if (room.created_by !== user.id) {
    return NextResponse.json({ error: 'Only the room owner can generate invite links.' }, { status: 403 });
  }

  if (!room.is_private) {
    // Public rooms don't need a token — just return the plain link
    return NextResponse.json({ token: null, isPublic: true });
  }

  // ── Generate signed token ──────────────────────────────────────────────
  const { token, expiresAt } = generateInviteToken(roomId);

  return NextResponse.json(
    { token, expiresAt, isPublic: false },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

export async function GET()    { return NextResponse.json({ error: 'Method not allowed.' }, { status: 405 }); }
export async function PUT()    { return NextResponse.json({ error: 'Method not allowed.' }, { status: 405 }); }
export async function DELETE() { return NextResponse.json({ error: 'Method not allowed.' }, { status: 405 }); }
