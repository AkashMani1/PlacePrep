'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams }                  from 'next/navigation';
import { InterviewRoom }       from '@/components/mocks/components/InterviewRoom';
import { RoomPasswordGate, GateError } from '@/components/mocks/components/RoomPasswordGate';
import { useMockStore }        from '@/store/useMockStore';
import { Loader2, Globe }      from 'lucide-react';
import { useAuth }             from '@/context/AuthContext';
import { Button }              from '@/components/ui/Button';
import { supabase }            from '@/lib/supabase';

// ── Minimal room preview type (safe — no passcode_hash) ───────────────────
interface RoomPreview {
  title:      string;
  difficulty: string;
  company:    string;
  type:       string;
  is_private: boolean;
}

type PageState =
  | 'loading'          // resolving auth + initial join attempt
  | 'unauthenticated'  // user must sign in
  | 'password_gate'    // private room — waiting for passcode
  | 'in_room'          // activeRoom set — render InterviewRoom
  | 'not_found';       // room gone

// ── Inner component (needs useSearchParams inside Suspense) ───────────────
function RoomPageInner({ roomId }: { roomId: string }) {
  const router                   = useRouter();
  const searchParams             = useSearchParams();
  const inviteToken              = searchParams.get('invite') ?? undefined;

  const { activeRoom, joinRoom } = useMockStore();
  const { user, isLoading: authLoading, signInWithGoogle } = useAuth();

  const [pageState,   setPageState]   = useState<PageState>('loading');
  const [gateError,   setGateError]   = useState<GateError>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [roomPreview, setRoomPreview] = useState<RoomPreview | null>(null);

  // ── Fetch public-safe room preview for the gate UI ────────────────────
  useEffect(() => {
    if (!roomId) return;
    supabase
      .from('mock_rooms')
      .select('title, difficulty, company, type, is_private')
      .eq('id', roomId)
      .single()
      .then(({ data }) => {
        if (data) setRoomPreview(data as RoomPreview);
      });
  }, [roomId]);

  // ── Initial join attempt ───────────────────────────────────────────────
  // If ?invite= token is present, try it first for transparent bypass.
  useEffect(() => {
    if (authLoading) return;
    if (!user) { setPageState('unauthenticated'); return; }
    if (activeRoom) { setPageState('in_room'); return; }

    setPageState('loading');

    // Pass inviteToken so private rooms can be joined transparently
    joinRoom(roomId, undefined, inviteToken)
      .then(() => setPageState('in_room'))
      .catch((err: Error) => {
        switch (err.message) {
          case 'ROOM_REQUIRES_PASSCODE':
            setPageState('password_gate');
            break;
          case 'ROOM_NOT_FOUND':
            setPageState('not_found');
            break;
          default:
            setPageState('not_found');
        }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, user, authLoading]);

  // ── If activeRoom is set externally (matchmaking), enter room ─────────
  useEffect(() => {
    if (activeRoom && pageState !== 'in_room') setPageState('in_room');
  }, [activeRoom, pageState]);

  // ── Manual passcode submit (from gate UI) ─────────────────────────────
  const handlePasscodeSubmit = useCallback(async (passcode: string) => {
    setIsVerifying(true);
    setGateError(null);
    try {
      await joinRoom(roomId, passcode);
      setPageState('in_room');
    } catch (err: any) {
      switch (err.message) {
        case 'WRONG_PASSCODE':  setGateError('WRONG_PASSCODE');  break;
        case 'RATE_LIMITED':    setGateError('RATE_LIMITED');    break;
        case 'ROOM_NOT_FOUND':  setPageState('not_found');       break;
        default:                setGateError('UNKNOWN_ERROR');
      }
    } finally {
      setIsVerifying(false);
    }
  }, [roomId, joinRoom]);

  // ── Render ────────────────────────────────────────────────────────────

  if (pageState === 'loading') {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (pageState === 'unauthenticated') {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-background relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.05)_0%,transparent_70%)] blur-3xl" />
        </div>
        <div className="relative z-10 w-full max-w-md p-10 bg-card/40 border border-white/5 backdrop-blur-2xl rounded-[40px] text-center shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-6">
            <Globe className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Join Mock Interview</h2>
          <p className="text-sm font-medium text-muted-foreground mb-8">
            You need to be signed in to join this session and connect with your peer.
          </p>
          <Button onClick={signInWithGoogle} className="w-full py-6 bg-primary text-white font-bold text-sm shadow-xl shadow-primary/20">
            Sign In with Google to Join
          </Button>
        </div>
      </div>
    );
  }

  if (pageState === 'not_found') {
    return (
      <div className="flex h-[100dvh] w-full flex-col items-center justify-center gap-6 bg-background">
        <Globe className="h-12 w-12 text-muted-foreground opacity-30" />
        <div className="text-center">
          <p className="text-lg font-black text-white mb-2">Room Not Found</p>
          <p className="text-sm text-muted-foreground">This room may have ended or never existed.</p>
        </div>
        <Button onClick={() => router.push('/mockhub/arena')} className="bg-primary text-white px-8 py-3">
          Browse Active Rooms
        </Button>
      </div>
    );
  }

  if (pageState === 'password_gate') {
    return (
      <RoomPasswordGate
        roomId={roomId}
        roomTitle={roomPreview?.title}
        roomDifficulty={roomPreview?.difficulty}
        roomCompany={roomPreview?.company}
        roomType={roomPreview?.type}
        onSubmit={handlePasscodeSubmit}
        error={gateError}
        isVerifying={isVerifying}
      />
    );
  }

  // in_room
  if (!activeRoom) {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <InterviewRoom />
    </div>
  );
}

// ── Page export — wraps inner in Suspense (required by useSearchParams) ───
export default function RoomPage({ params }: { params: { roomId: string } }) {
  return (
    <Suspense
      fallback={
        <div className="flex h-[100dvh] w-full items-center justify-center bg-background">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      }
    >
      <RoomPageInner roomId={params.roomId} />
    </Suspense>
  );
}
