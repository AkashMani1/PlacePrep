import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useWebRTC(roomId: string, localStream: MediaStream | null) {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peerConnectionState, setPeerConnectionState] = useState<RTCPeerConnectionState>('new');
  
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const channel = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
      ]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        channel.current?.send({
          type: 'broadcast',
          event: 'webrtc_signal',
          payload: { type: 'ice_candidate', candidate: event.candidate }
        });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    pc.onconnectionstatechange = () => {
      setPeerConnectionState(pc.connectionState);
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setRemoteStream(null);
      }
    };

    if (localStream) {
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    }

    return pc;
  }, [localStream]);

  useEffect(() => {
    if (!roomId) return;

    // Initialize signaling channel
    channel.current = supabase.channel(`webrtc:${roomId}`, {
      config: {
        broadcast: { ack: false }
      }
    });

    channel.current.on('broadcast', { event: 'webrtc_signal' }, async ({ payload }) => {
      if (!peerConnection.current) return;

      try {
        if (payload.type === 'offer') {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(payload.offer));
          const answer = await peerConnection.current.createAnswer();
          await peerConnection.current.setLocalDescription(answer);
          
          channel.current?.send({
            type: 'broadcast',
            event: 'webrtc_signal',
            payload: { type: 'answer', answer }
          });
        } else if (payload.type === 'answer') {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(payload.answer));
        } else if (payload.type === 'ice_candidate') {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
        }
      } catch (err) {
        console.error('WebRTC signaling error:', err);
      }
    });

    // Start peer connection
    peerConnection.current = createPeerConnection();

    channel.current.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // Trigger offer if we are the initiator (simplification: anyone joining can send an offer if there's someone else, 
        // but robustly we should coordinate who sends the offer. For a 1-on-1, typically the second person sends the offer 
        // upon receiving a 'joined' message from presence. Let's broadcast a 'ready' event instead).
        channel.current?.send({
          type: 'broadcast',
          event: 'peer_ready',
          payload: { ready: true }
        });
      }
    });

    channel.current.on('broadcast', { event: 'peer_ready' }, async () => {
      // The other peer is ready, let's create and send an offer
      if (peerConnection.current) {
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        channel.current?.send({
          type: 'broadcast',
          event: 'webrtc_signal',
          payload: { type: 'offer', offer }
        });
      }
    });

    return () => {
      if (channel.current) supabase.removeChannel(channel.current);
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }
    };
  }, [roomId, createPeerConnection]);

  // Handle local stream changes (e.g. screen sharing toggle)
  useEffect(() => {
    if (peerConnection.current && localStream) {
      // Replace tracks if needed
      const senders = peerConnection.current.getSenders();
      
      const videoTrack = localStream.getVideoTracks()[0];
      const audioTrack = localStream.getAudioTracks()[0];

      senders.forEach(sender => {
        if (sender.track?.kind === 'video' && videoTrack && sender.track !== videoTrack) {
          sender.replaceTrack(videoTrack);
        }
        if (sender.track?.kind === 'audio' && audioTrack && sender.track !== audioTrack) {
          sender.replaceTrack(audioTrack);
        }
      });
    }
  }, [localStream]);

  return { remoteStream, peerConnectionState };
}
