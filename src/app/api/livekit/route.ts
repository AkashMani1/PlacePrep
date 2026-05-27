import { AccessToken } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { room, username } = body;

    if (!room) {
      return NextResponse.json({ error: 'Missing room name' }, { status: 400 });
    }
    if (!username) {
      return NextResponse.json({ error: 'Missing username' }, { status: 400 });
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

    if (!apiKey || !apiSecret || !wsUrl) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: username,
      // We can also set the participant name if we want, but identity is required.
      name: username,
    });

    at.addGrant({ roomJoin: true, room: room });

    // 1 hour expiration
    const token = await at.toJwt();

    return NextResponse.json({ token });
  } catch (err: any) {
    console.error('Error generating token:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
