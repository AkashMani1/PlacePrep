'use client';

import { useEffect, useRef, useState } from 'react';
import { Tldraw, createTLStore, defaultShapeUtils } from 'tldraw';
import 'tldraw/tldraw.css';

import { supabase } from '@/lib/supabase';

interface MockWhiteboardProps {
  roomId: string;
  isReadonly?: boolean;
}

export function MockWhiteboard({ roomId, isReadonly = false }: MockWhiteboardProps) {
  const [store] = useState(() => createTLStore({ shapeUtils: defaultShapeUtils }));
  const [isConnected, setIsConnected] = useState(false);
  const [peerCount, setPeerCount] = useState(1); // Self is 1

  useEffect(() => {
    if (!roomId || typeof window === 'undefined') return;

    let destroyed = false;

    const channel = supabase.channel(`whiteboard:${roomId}`, {
      config: { broadcast: { ack: false, self: false } }
    });

    // Listen to local user changes and broadcast them
    const unlisten = store.listen((update) => {
      if (update.source === 'user' && !isReadonly) {
        channel.send({ 
          type: 'broadcast', 
          event: 'tl_update', 
          payload: { changes: update.changes } 
        });
      }
    });

    // Listen to remote changes and apply them
    channel.on('broadcast', { event: 'tl_update' }, ({ payload }) => {
      if (destroyed) return;
      try {
        const { added, updated, removed } = payload.changes;
        store.mergeRemoteChanges(() => {
          if (added && Object.keys(added).length > 0) store.put(Object.values(added));
          if (updated && Object.keys(updated).length > 0) store.put(Object.values(updated).map((u: any) => u[1]));
          if (removed && Object.keys(removed).length > 0) store.remove(Object.values(removed).map((r: any) => r.id));
        });
      } catch (err) {
        console.error('[Whiteboard] Sync error:', err);
      }
    });

    // Simple presence
    channel.on('broadcast', { event: 'tl_presence' }, () => {
      if (!destroyed) setPeerCount(2); // In 1-on-1, assume 2 if presence received
    });

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        setIsConnected(true);
        channel.send({ type: 'broadcast', event: 'tl_presence', payload: {} });
      }
      if (status === 'CHANNEL_ERROR') setIsConnected(false);
    });

    return () => {
      destroyed = true;
      unlisten();
      supabase.removeChannel(channel);
    };
  }, [roomId, store, isReadonly]);

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

      <Tldraw store={store} hideUi={isReadonly} />
    </div>
  );
}
