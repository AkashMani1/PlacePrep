import { NextRequest, NextResponse } from 'next/server';
import { verifyInviteToken }         from '@/lib/inviteToken';

// ── In-memory rate limit (same pattern as verify-passcode) ────────────────
const attemptMap  = new Map<string, { count: number; resetAt: number }>();
const RL_MAX      = 20;        // tokens are less guessable, allow more attempts
const RL_WINDOW   = 60_000;    // 1 minute

function checkRateLimit(ip: string): boolean {
  const now    = Date.now();
  const record = attemptMap.get(ip);
  if (!record || now > record.resetAt) {
    attemptMap.set(ip, { count: 1, resetAt: now + RL_WINDOW });
    return true;
  }
  if (record.count >= RL_MAX) return false;
  record.count += 1;
  return true;
}

// ── POST /api/rooms/verify-invite-token ────────────────────────────────────
// Verifies a signed invite token for a room WITHOUT using the DB.
// Pure cryptographic verification — no DB round-trip, instant response.
export async function POST(req: NextRequest) {
  // Rate limit
  const ip = (req.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim();
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { valid: false, error: 'Too many requests.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  let body: { roomId?: string; token?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ valid: false, error: 'Invalid JSON.' }, { status: 400 }); }

  const { roomId, token } = body;
  if (!roomId || !token) {
    return NextResponse.json({ valid: false, error: 'roomId and token are required.' }, { status: 400 });
  }

  const result = verifyInviteToken(roomId, token);

  return NextResponse.json(
    { valid: result.valid, reason: result.valid ? undefined : (result as any).reason },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

export async function GET()    { return NextResponse.json({ error: 'Method not allowed.' }, { status: 405 }); }
export async function PUT()    { return NextResponse.json({ error: 'Method not allowed.' }, { status: 405 }); }
export async function DELETE() { return NextResponse.json({ error: 'Method not allowed.' }, { status: 405 }); }
