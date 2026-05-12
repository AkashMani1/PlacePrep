'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { InterviewRoom } from '@/components/mocks/components/InterviewRoom';
import { useMockStore } from '@/store/useMockStore';
import { Loader2 } from 'lucide-react';

export default function RoomPage({ params }: { params: { roomId: string } }) {
  const router = useRouter();
  const { activeRoom, joinRoom } = useMockStore();

  useEffect(() => {
    if (!activeRoom && params.roomId) {
      joinRoom(params.roomId);
    }
  }, [params.roomId, activeRoom, joinRoom]);

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
