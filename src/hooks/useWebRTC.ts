'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// ── Production ICE server configuration ────────────────────────────────────
// Includes multiple STUN servers for redundancy.
// For enterprise/NAT-traversal, add Twilio TURN credentials via environment vars.
const ICE_SERVERS: RTCIceServer[] = [
  // Google STUN (free, high-availability)
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  // Cloudflare STUN
  { urls: 'stun:stun.cloudflare.com:3478' },
  // Twilio STUN (no auth required for STUN)
  { urls: 'stun:global.stun.twilio.com:3478' },
  // TURN (activated when NEXT_PUBLIC_TURN_* env vars are set)
  ...(process.env.NEXT_PUBLIC_TURN_URL ? [{
    urls: process.env.NEXT_PUBLIC_TURN_URL,
    username: process.env.NEXT_PUBLIC_TURN_USERNAME || '',
    credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL || '',
  }] : []),
];

const PEER_CONFIG: RTCConfiguration = {
  iceServers: ICE_SERVERS,
  iceTransportPolicy: 'all',
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require',
};

// ── Reconnect backoff ────────────────────────────────────────────────────────
const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000]; // exponential backoff

export function useWebRTC(roomId: string, localStream: MediaStream | null) {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peerConnectionState, setPeerConnectionState] = useState<RTCPeerConnectionState>('new');
  const [isInitiator, setIsInitiator] = useState(false);

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const channel = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const reconnectAttempt = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(true);
  const isNegotiating = useRef(false);
  const myPeerId = useRef(Math.random().toString(36).substring(7));

  // ── Cleanup helper ─────────────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    if (channel.current) {
      supabase.removeChannel(channel.current);
      channel.current = null;
    }
    if (peerConnection.current) {
      peerConnection.current.onicecandidate = null;
      peerConnection.current.ontrack = null;
      peerConnection.current.onconnectionstatechange = null;
      peerConnection.current.onnegotiationneeded = null;
      peerConnection.current.close();
      peerConnection.current = null;
    }
  }, []);

  // ── Send signaling message ─────────────────────────────────────────────────
  const sendSignal = useCallback((payload: any) => {
    channel.current?.send({
      type: 'broadcast',
      event: 'webrtc_signal',
      payload,
    });
  }, []);

  // ── Create peer connection ─────────────────────────────────────────────────
  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(PEER_CONFIG);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal({ type: 'ice_candidate', candidate: event.candidate.toJSON() });
      }
    };

    pc.ontrack = (event) => {
      if (!isMounted.current) return;
      setRemoteStream(event.streams[0] ?? new MediaStream([event.track]));
    };

    pc.onconnectionstatechange = () => {
      if (!isMounted.current) return;
      const state = pc.connectionState;
      setPeerConnectionState(state);

      if (state === 'failed') {
        toast.error('WebRTC connection failed. Attempting reconnect...');
        scheduleReconnect();
      } else if (state === 'disconnected') {
        // Disconnected is transient — wait before acting
        reconnectTimer.current = setTimeout(() => {
          if (pc.connectionState === 'disconnected') scheduleReconnect();
        }, 3000);
      } else if (state === 'connected') {
        reconnectAttempt.current = 0; // Reset backoff on success
      } else if (state === 'closed') {
        setRemoteStream(null);
      }
    };

    pc.onnegotiationneeded = async () => {
      if (isNegotiating.current || !isInitiator) return;
      isNegotiating.current = true;
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sendSignal({ type: 'offer', offer: pc.localDescription });
      } catch (err) {
        console.error('[WebRTC] negotiationneeded error:', err);
      } finally {
        isNegotiating.current = false;
      }
    };

    // Add local tracks
    if (localStream) {
      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    }

    return pc;
  }, [localStream, sendSignal, isInitiator]);

  // ── Schedule reconnect with exponential backoff ─────────────────────────
  const scheduleReconnect = useCallback(() => {
    const attempt = reconnectAttempt.current;
    const delay = RECONNECT_DELAYS[Math.min(attempt, RECONNECT_DELAYS.length - 1)];
    reconnectAttempt.current++;

    console.log(`[WebRTC] Reconnecting in ${delay}ms (attempt ${attempt + 1})`);

    reconnectTimer.current = setTimeout(() => {
      if (!isMounted.current || !roomId) return;
      cleanup();
      initializeConnection();
    }, delay);
  }, [roomId]);

  // ── Initialize signaling + peer connection ─────────────────────────────────
  const initializeConnection = useCallback(() => {
    if (!roomId || !isMounted.current) return;

    // Create signaling channel via Supabase Realtime Broadcast
    channel.current = supabase.channel(`webrtc:${roomId}`, {
      config: { broadcast: { ack: false, self: false } }
    });

    // Handle incoming signals
    const pendingCandidates: RTCIceCandidateInit[] = [];
    
    channel.current.on('broadcast', { event: 'webrtc_signal' }, async ({ payload }: any) => {
      if (!peerConnection.current || !isMounted.current) return;

      try {
        if (payload.type === 'offer') {
          if (peerConnection.current.signalingState !== 'stable' && !isNegotiating.current) return;
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(payload.offer));
          const answer = await peerConnection.current.createAnswer();
          await peerConnection.current.setLocalDescription(answer);
          sendSignal({ type: 'answer', answer: peerConnection.current.localDescription });
          
          // Process any queued candidates
          while (pendingCandidates.length > 0) {
            const candidate = pendingCandidates.shift();
            if (candidate) await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
          }
        } else if (payload.type === 'answer') {
          if (peerConnection.current.signalingState === 'have-local-offer') {
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(payload.answer));
            // Process any queued candidates
            while (pendingCandidates.length > 0) {
              const candidate = pendingCandidates.shift();
              if (candidate) await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
            }
          }
        } else if (payload.type === 'ice_candidate') {
          if (peerConnection.current.remoteDescription) {
            await peerConnection.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
          } else {
            pendingCandidates.push(payload.candidate);
          }
        }
      } catch (err) {
        console.error('[WebRTC] Signal handling error:', err);
      }
    });

    // Handle peer ready event — whoever has the "higher" peerId becomes the caller
    channel.current.on('broadcast', { event: 'peer_ready' }, async ({ payload }: any) => {
      if (!peerConnection.current || !isMounted.current) return;
      
      // Deterministic initiator selection to prevent glare
      if (myPeerId.current > payload.peerId) {
        setIsInitiator(true);
        try {
          isNegotiating.current = true;
          const offer = await peerConnection.current.createOffer();
          await peerConnection.current.setLocalDescription(offer);
          sendSignal({ type: 'offer', offer: peerConnection.current.localDescription });
        } catch (err) {
          console.error('[WebRTC] Offer creation error:', err);
        } finally {
          isNegotiating.current = false;
        }
      } else {
        // Not the initiator, let the other peer know we are here so they can send the offer
        setIsInitiator(false);
        if (peerConnection.current.connectionState !== 'connected' && peerConnection.current.signalingState === 'stable') {
          channel.current?.send({
            type: 'broadcast',
            event: 'peer_ready',
            payload: { peerId: myPeerId.current },
          });
        }
      }
    });

    // Subscribe and announce presence
    channel.current.subscribe((status) => {
      if (status === 'SUBSCRIBED' && isMounted.current) {
        // Announce we're ready — the other peer will send an offer
        channel.current?.send({
          type: 'broadcast',
          event: 'peer_ready',
          payload: { peerId: myPeerId.current },
        });
      } else if (status === 'CHANNEL_ERROR') {
        console.error('[WebRTC] Signaling channel error');
        scheduleReconnect();
      }
    });

    peerConnection.current = createPeerConnection();
  }, [roomId, createPeerConnection, sendSignal, scheduleReconnect]);

  // ── Lifecycle ───────────────────────────────────────────────────────────────
  useEffect(() => {
    isMounted.current = true;
    if (!roomId) return;

    initializeConnection();

    return () => {
      isMounted.current = false;
      cleanup();
    };
  }, [roomId]);

  // ── Handle local stream changes (screen share swap) ─────────────────────
  useEffect(() => {
    if (!peerConnection.current || !localStream) return;
    const senders = peerConnection.current.getSenders();
    const videoTrack = localStream.getVideoTracks()[0];
    const audioTrack = localStream.getAudioTracks()[0];

    senders.forEach(sender => {
      if (sender.track?.kind === 'video' && videoTrack && sender.track !== videoTrack) {
        sender.replaceTrack(videoTrack).catch(console.error);
      }
      if (sender.track?.kind === 'audio' && audioTrack && sender.track !== audioTrack) {
        sender.replaceTrack(audioTrack).catch(console.error);
      }
    });
  }, [localStream]);

  return { remoteStream, peerConnectionState, isInitiator };
}
