'use client';

import { Tldraw } from 'tldraw';
import 'tldraw/tldraw.css';

export function MockWhiteboard({ roomId }: { roomId: string }) {
  // We can add collaborative binding using Yjs or Supabase later
  // For now, let's just render the Tldraw component properly
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }} className="tldraw-wrapper">
      <Tldraw persistenceKey={`tldraw-room-${roomId}`} />
    </div>
  );
}
