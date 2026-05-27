'use client';

import { useEffect, useRef, useState } from 'react';
import { Tldraw, createTLStore, defaultShapeUtils } from 'tldraw';
import 'tldraw/tldraw.css';

import { supabase } from '@/lib/supabase';

interface MockWhiteboardProps {
  roomId: string;
}

export function MockWhiteboard({ roomId }: MockWhiteboardProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [peerCount, setPeerCount] = useState(0);
  const storeRef = useRef<any>(null);
  const docRef = useRef<any>(null);
  const providerRef = useRef<any>(null);

  useEffect(() => {
    if (!roomId || typeof window === 'undefined') return;

    let destroyed = false;

    const initSync = async () => {
      try {
        const Y = await import('yjs');
        const { SupabaseProvider } = await import('@/lib/y-supabase');

        docRef.current = new Y.Doc();
        
        const channel = supabase.channel(`whiteboard:${roomId}`, {
          config: { broadcast: { ack: false, self: false } }
        });

        providerRef.current = new SupabaseProvider(channel, docRef.current);
        
        // Assume connected once initialized since Supabase manages connection state
        setIsConnected(true);
      } catch (err) {
        console.warn('[Whiteboard] Sync init failed (offline mode):', err);
        setIsConnected(false);
      }
    };

    initSync();

    return () => {
      destroyed = true;
      providerRef.current?.destroy();
      docRef.current?.destroy();
    };
  }, [roomId]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Status bar */}
      <div
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 10px',
          borderRadius: 99,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.1)',
          fontSize: 11,
          fontWeight: 700,
          color: 'white',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: isConnected ? '#10b981' : '#f59e0b',
            animation: isConnected ? 'none' : 'pulse 2s infinite',
          }}
        />
        {isConnected
          ? `${peerCount} peer${peerCount !== 1 ? 's' : ''} connected`
          : 'Local mode (connecting...)'}
      </div>

      <Tldraw persistenceKey={`tldraw-room-${roomId}`} />
    </div>
  );
}
