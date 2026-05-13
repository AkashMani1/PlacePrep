'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { InterviewRoom } from '@/components/mocks/components/InterviewRoom';
import { useMockStore } from '@/store/useMockStore';
import { Loader2, Globe } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

export default function RoomPage({ params }: { params: { roomId: string } }) {
  const router = useRouter();
  const { activeRoom, joinRoom } = useMockStore();
  const { user, isLoading: authLoading, signInWithGoogle } = useAuth();

  useEffect(() => {
    if (!authLoading && user && !activeRoom && params.roomId) {
      joinRoom(params.roomId).catch(() => {
        router.push('/mockhub/arena');
      });
    }
  }, [params.roomId, activeRoom, joinRoom, router, user, authLoading]);

  if (authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background relative overflow-hidden">
        {/* Ambient Background */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.05)_0%,transparent_70%)] blur-3xl" />
        </div>
        
        <div className="relative z-10 w-full max-w-md p-10 bg-card/40 border border-white/5 backdrop-blur-2xl rounded-[40px] text-center shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-6">
            <Globe className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Join Mock Interview</h2>
          <p className="text-sm font-medium text-muted-foreground mb-8">
            You need to be signed in to join this private session and connect with your peer.
          </p>
          <Button onClick={signInWithGoogle} className="w-full py-6 bg-primary text-white font-bold text-sm shadow-xl shadow-primary/20">
            Sign In with Google to Join
          </Button>
        </div>
      </div>
    );
  }

  if (!activeRoom) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
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
