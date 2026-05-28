/**
 * Server-only invite token utilities.
 * Uses HMAC-SHA256 + base64url — no JWT library needed.
 *
 * Token format: base64url(JSON payload) . hmac_hex
 * Payload: { roomId: string, exp: number, v: 1 }
 *
 * NEVER import this file from client components.
 * It reads process.env.INVITE_TOKEN_SECRET at runtime.
 */

import { createHmac, timingSafeEqual } from 'crypto';

const TOKEN_VERSION  = 1;
const EXPIRY_MS      = 7 * 24 * 60 * 60 * 1000; // 7 days

function getSecret(): string {
  const s = process.env.INVITE_TOKEN_SECRET;
  if (!s || s.length < 32) {
    throw new Error(
      'INVITE_TOKEN_SECRET env var is missing or too short (min 32 chars). ' +
      'Generate one with: openssl rand -hex 32'
    );
  }
  return s;
}

// ── Generate ──────────────────────────────────────────────────────────────

export function generateInviteToken(roomId: string): {
  token: string;
  expiresAt: number;
} {
  const expiresAt = Date.now() + EXPIRY_MS;
  const rawPayload = JSON.stringify({ roomId, exp: expiresAt, v: TOKEN_VERSION });
  const payload    = Buffer.from(rawPayload).toString('base64url');
  const sig        = createHmac('sha256', getSecret()).update(payload).digest('hex');
  return { token: `${payload}.${sig}`, expiresAt };
}

// ── Verify ────────────────────────────────────────────────────────────────

export type VerifyResult =
  | { valid: true }
  | { valid: false; reason: 'malformed' | 'bad_signature' | 'expired' | 'room_mismatch' };

export function verifyInviteToken(roomId: string, token: string): VerifyResult {
  try {
    const dotIdx = token.lastIndexOf('.');
    if (dotIdx === -1) return { valid: false, reason: 'malformed' };

    const payload = token.slice(0, dotIdx);
    const sig     = token.slice(dotIdx + 1);
    if (!payload || !sig) return { valid: false, reason: 'malformed' };

    // Constant-time HMAC comparison (prevents timing attacks)
    const expectedSig = createHmac('sha256', getSecret()).update(payload).digest('hex');
    const expectedBuf = Buffer.from(expectedSig, 'hex');
    let   actualBuf: Buffer;
    try {
      actualBuf = Buffer.from(sig, 'hex');
    } catch {
      return { valid: false, reason: 'malformed' };
    }
    if (expectedBuf.length !== actualBuf.length) return { valid: false, reason: 'bad_signature' };
    if (!timingSafeEqual(expectedBuf, actualBuf))  return { valid: false, reason: 'bad_signature' };

    // Decode and validate payload
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      roomId: string;
      exp:    number;
      v:      number;
    };

    if (data.exp < Date.now())      return { valid: false, reason: 'expired' };
    if (data.roomId !== roomId)     return { valid: false, reason: 'room_mismatch' };

    return { valid: true };
  } catch {
    return { valid: false, reason: 'malformed' };
  }
}
