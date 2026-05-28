import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ── Rate-limit store (in-memory, per-instance) ────────────────────────────
// For production at scale, replace with Upstash Redis or similar.
const attemptMap = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_MAX    = 5;   // max attempts per window
const RATE_LIMIT_WINDOW = 60_000; // 1 minute in ms

function getRateLimitKey(req: NextRequest): string {
  // Use X-Forwarded-For first (Vercel/proxy), fall back to direct IP
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return `ratelimit:verify-passcode:${ip}`;
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = attemptMap.get(key);

  if (!record || now > record.resetAt) {
    attemptMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count };
}

// ── Supabase admin client (service role — server-only) ────────────────────
// Uses the service role key so it can call SECURITY DEFINER RPCs and bypass
// client-side RLS. This key MUST stay server-side only.
function getAdminClient() {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key  = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL env vars.');
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

// ── POST /api/rooms/verify-passcode ────────────────────────────────────────
export async function POST(req: NextRequest) {
  // ── Rate limit ────────────────────────────────────────────────────────
  const rlKey = getRateLimitKey(req);
  const { allowed, remaining } = checkRateLimit(rlKey);

  if (!allowed) {
    return NextResponse.json(
      { valid: false, error: 'Too many attempts. Please wait a minute and try again.' },
      {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit':     String(RATE_LIMIT_MAX),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  // ── Parse body ────────────────────────────────────────────────────────
  let body: { roomId?: string; passcode?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ valid: false, error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { roomId, passcode } = body;

  if (!roomId || typeof roomId !== 'string') {
    return NextResponse.json({ valid: false, error: 'roomId is required.' }, { status: 400 });
  }
  if (!passcode || typeof passcode !== 'string') {
    return NextResponse.json({ valid: false, error: 'passcode is required.' }, { status: 400 });
  }
  if (passcode.length < 4 || passcode.length > 20) {
    return NextResponse.json({ valid: false, error: 'Passcode must be 4–20 characters.' }, { status: 400 });
  }

  // ── Verify via DB RPC (hash comparison stays on DB, never crosses the wire) ──
  try {
    const admin = getAdminClient();

    const { data, error } = await admin.rpc('verify_room_passcode', {
      p_room_id:  roomId,
      p_passcode: passcode,
    });

    if (error) {
      console.error('[verify-passcode] RPC error:', error.message);
      return NextResponse.json(
        { valid: false, error: 'Verification service error. Please try again.' },
        { status: 503 }
      );
    }

    const valid = data === true;

    return NextResponse.json(
      { valid },
      {
        status: 200,
        headers: {
          'X-RateLimit-Limit':     String(RATE_LIMIT_MAX),
          'X-RateLimit-Remaining': String(remaining),
          // Never cache passcode responses
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (err) {
    console.error('[verify-passcode] Unexpected error:', err);
    return NextResponse.json(
      { valid: false, error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

// Block all other HTTP methods
export async function GET()    { return NextResponse.json({ error: 'Method not allowed.' }, { status: 405 }); }
export async function PUT()    { return NextResponse.json({ error: 'Method not allowed.' }, { status: 405 }); }
export async function DELETE() { return NextResponse.json({ error: 'Method not allowed.' }, { status: 405 }); }
