'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Video, VideoOff, Mic, MicOff, ScreenShare, ScreenShareOff,
  X, Code2, PenTool, Send, Play, Clock, Link
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/Button';
import { useMockStore } from '@/store/useMockStore';
import { toast } from 'sonner';
import { MonacoBinding } from 'y-monaco';
import { useRouter } from 'next/navigation';
import { MockWhiteboard } from './MockWhiteboard';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { LiveKitRoom, useTracks, ParticipantTile, RoomAudioRenderer, useLocalParticipant } from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';


interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
}

function LiveKitVideoSidebar() {
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ], { onlySubscribed: false });

  return (
    <div className="flex flex-col gap-4 w-full h-full overflow-y-auto custom-scrollbar p-1">
      {tracks.length === 0 && (
        <div className="relative aspect-video rounded-[16px] bg-white/5 border border-white/5 flex items-center justify-center backdrop-blur-md">
          <div className="animate-pulse flex flex-col items-center">
            <Video className="w-6 h-6 text-white/20 mb-2" />
            <p className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold">Connecting...</p>
          </div>
        </div>
      )}
      {tracks.map((trackRef) => (
        <div key={trackRef.participant.identity + trackRef.source} className="relative aspect-video rounded-[16px] bg-[#050505] border border-white/10 overflow-hidden shadow-2xl ring-1 ring-white/5">
          <ParticipantTile trackRef={trackRef} className="w-full h-full object-cover" />
          <div className="absolute bottom-2 left-2 flex items-center gap-2">
            <div className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 shadow-lg">
              <span className="text-[9px] font-black text-white uppercase tracking-wider">
                {trackRef.participant.name || trackRef.participant.identity} {trackRef.source === Track.Source.ScreenShare ? '(Screen)' : ''}
              </span>
            </div>
          </div>
        </div>
      ))}
      <RoomAudioRenderer />
    </div>
  );
}

function CustomLiveKitControls({ onLeave }: { onLeave: () => void }) {
  const { localParticipant, isCameraEnabled, isMicrophoneEnabled, isScreenShareEnabled } = useLocalParticipant();

  const toggleMic = useCallback(() => {
    localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
  }, [localParticipant, isMicrophoneEnabled]);

  const toggleVideo = useCallback(() => {
    localParticipant.setCameraEnabled(!isCameraEnabled);
  }, [localParticipant, isCameraEnabled]);

  const toggleScreenShare = useCallback(() => {
    localParticipant.setScreenShareEnabled(!isScreenShareEnabled);
  }, [localParticipant, isScreenShareEnabled]);

  return (
    <div className="mt-auto flex items-center justify-between bg-white/5 p-2 rounded-[20px] border border-white/10 shrink-0 backdrop-blur-xl">
      <button
        onClick={toggleMic}
        className={`flex-1 aspect-[4/3] rounded-[14px] flex items-center justify-center transition-all duration-300 mx-0.5 ${isMicrophoneEnabled ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-rose-500/20 text-rose-500 hover:bg-rose-500/30'}`}
      >
        {isMicrophoneEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
      </button>
      <button
        onClick={toggleVideo}
        className={`flex-1 aspect-[4/3] rounded-[14px] flex items-center justify-center transition-all duration-300 mx-0.5 ${isCameraEnabled ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-rose-500/20 text-rose-500 hover:bg-rose-500/30'}`}
      >
        {isCameraEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
      </button>
      <button
        onClick={toggleScreenShare}
        className={`flex-1 aspect-[4/3] rounded-[14px] flex items-center justify-center transition-all duration-300 mx-0.5 ${isScreenShareEnabled ? 'bg-primary/20 text-primary hover:bg-primary/30' : 'bg-white/10 text-white hover:bg-white/15'}`}
      >
        {isScreenShareEnabled ? <ScreenShareOff className="w-4 h-4" /> : <ScreenShare className="w-4 h-4" />}
      </button>
      <button
        onClick={onLeave}
        className="flex-1 aspect-[4/3] rounded-[14px] bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 transition-all duration-300 mx-0.5 shadow-lg shadow-rose-500/20"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}

export function InterviewRoom() {
  const router = useRouter();
  const { user } = useAuth();
  const { activeRoom, leaveRoom } = useMockStore();
  const [activeTab, setActiveTab] = useState<'editor' | 'whiteboard'>('editor');
  const [isMounted, setIsMounted] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [codeOutput, setCodeOutput] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [sessionSeconds, setSessionSeconds] = useState(0);

  const [lkToken, setLkToken] = useState('');
  const [liveKitUrl] = useState(process.env.NEXT_PUBLIC_LIVEKIT_URL || '');

  const editorRef = useRef<any>(null);
  const providerRef = useRef<any>(null);
  const docRef = useRef<any>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const sessionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chatChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const [peerName, setPeerName] = useState('Peer');
  const [peerHasWriteAccess, setPeerHasWriteAccess] = useState(false);

  const isHost = activeRoom?.created_by === user?.id || activeRoom?.host_id === user?.id;
  const isReadonly = !isHost && !peerHasWriteAccess;

  useEffect(() => { setIsMounted(true); }, []);

  // Session timer
  useEffect(() => {
    if (!activeRoom) return;
    sessionTimerRef.current = setInterval(() => {
      setSessionSeconds(s => s + 1);
    }, 1000);
    return () => {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    };
  }, [activeRoom]);

  useEffect(() => {
    if (activeRoom) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [activeRoom]);

  // ── LiveKit Setup ──────────────────────────────────────────────
  useEffect(() => {
    if (!activeRoom || !user) return;
    let mounted = true;
    
    (async () => {
      try {
        const resp = await fetch('/api/livekit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            room: activeRoom.id, 
            username: user.user_metadata?.full_name || 'Anonymous' 
          }),
        });
        const data = await resp.json();
        if (mounted && data.token) setLkToken(data.token);
      } catch (err) {
        console.error('Failed to fetch LiveKit token:', err);
      }
    })();
    
    return () => { mounted = false; };
  }, [activeRoom?.id, user]);

  // ── YJS Collaborative Setup ─────────────────────────────────────────
  useEffect(() => {
    if (!activeRoom || !isMounted) return;

    import('yjs').then(async (Y) => {
      docRef.current = new Y.Doc();
      const { SupabaseProvider } = await import('@/lib/y-supabase');
      const channel = supabase.channel(`editor:${activeRoom.id}`, {
        config: { broadcast: { ack: false, self: false } }
      });
      providerRef.current = new SupabaseProvider(channel, docRef.current);
    });

    return () => {
      providerRef.current?.destroy();
      docRef.current?.destroy();
    };
  }, [activeRoom?.id, isMounted]);

  // ── Chat & Sync Setup ───────────────────────────────────────────────
  useEffect(() => {
    if (!activeRoom?.id || !isMounted) return;

    chatChannelRef.current = supabase.channel(`chat:${activeRoom.id}`, {
      config: { 
        broadcast: { ack: false, self: false },
        presence: { key: user?.id || `anon-${Math.random()}` }
      }
    });

    chatChannelRef.current.on('broadcast', { event: 'new_message' }, ({ payload }) => {
      setChatMessages(prev => [...prev, { ...payload.msg, sender: payload.senderName }]);
    });

    chatChannelRef.current.on('broadcast', { event: 'code_submit' }, ({ payload }) => {
      setCodeOutput(`${payload.senderName} executed the code.`);
      toast.info(`${payload.senderName} submitted their code.`);
    });

    chatChannelRef.current.on('broadcast', { event: 'write_access_change' }, ({ payload }) => {
      setPeerHasWriteAccess(payload.granted);
      toast.info(`The host has ${payload.granted ? 'granted' : 'revoked'} your write access.`);
    });

    chatChannelRef.current.on('presence', { event: 'sync' }, () => {
      const state = chatChannelRef.current?.presenceState();
      if (!state) return;

      const userIds = Object.keys(state);
      
      // Strict 2-Peer Limit Enforcement
      // If we are NOT the host, and we are not among the first 2 connected users...
      if (!isHost && userIds.length > 2 && !userIds.slice(0, 2).includes(user?.id || '')) {
        toast.error('This room is full. Maximum 2 peers allowed.');
        router.push('/mockhub');
        return;
      }

      // Sync peer name based on who else is in the room
      const peerKeys = userIds.filter(id => id !== user?.id);
      if (peerKeys.length > 0) {
        const peerPresence = state[peerKeys[0]]?.[0] as any;
        if (peerPresence) setPeerName(peerPresence.displayName);
      } else {
        setPeerName('Peer');
      }
    });

    chatChannelRef.current.on('presence', { event: 'join' }, ({ newPresences }) => {
      for (const p of newPresences) {
        if (p.displayName && p.userId !== user?.id) {
          toast.success(`${p.displayName} joined the room.`);
          // If we are the host, send the current write access state to the newly joined peer
          if (isHost) {
            chatChannelRef.current?.send({ 
              type: 'broadcast', 
              event: 'write_access_change', 
              payload: { granted: peerHasWriteAccess } 
            });
          }
        }
      }
    });

    chatChannelRef.current.on('presence', { event: 'leave' }, ({ leftPresences }) => {
      for (const p of leftPresences) {
        if (p.displayName && p.userId !== user?.id) {
          toast.info(`${p.displayName} left the room.`);
        }
      }
    });

    chatChannelRef.current.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
         await chatChannelRef.current?.track({
           userId: user?.id,
           displayName: user?.user_metadata?.full_name || 'Anonymous User'
         });
      }
    });

    return () => {
      if (chatChannelRef.current) {
        supabase.removeChannel(chatChannelRef.current);
        chatChannelRef.current = null;
      }
    };
  }, [activeRoom?.id, isMounted, user]);


  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor; // ← store ref so getValue() works in submit
    if (!isMounted || !docRef.current || !providerRef.current) return;
    const type = docRef.current.getText('monaco');
    const binding = new MonacoBinding(type, editor.getModel(), new Set([editor]), providerRef.current.awareness);
  };

  // ── Chat ────────────────────────────────────────────────────────────
  const sendMessage = useCallback(() => {
    if (!chatInput.trim()) return;
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'You',
      text: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages(prev => [...prev, msg]);
    setChatInput('');
    chatChannelRef.current?.send({ 
      type: 'broadcast', 
      event: 'new_message', 
      payload: { msg, senderName: user?.user_metadata?.full_name || 'You' } 
    });
  }, [chatInput, user]);

  // ── Code Submit ─────────────────────────────────────────────────────
  const handleCodeSubmit = useCallback(() => {
    // Primary: read from Monaco editor; Fallback: read from Yjs doc
    const code = editorRef.current?.getValue?.() || docRef.current?.getText('monaco')?.toString() || '';
    if (!code.trim()) {
      toast.error('Write some code before submitting.');
      return;
    }
    setCodeOutput('Code submitted successfully. In a live session, this would be evaluated against test cases.');
    toast.success('Code submitted!');
    chatChannelRef.current?.send({ 
      type: 'broadcast', 
      event: 'code_submit', 
      payload: { code, senderName: user?.user_metadata?.full_name || 'You' } 
    });
  }, [user]);

  // ── Leave & Cleanup ─────────────────────────────────────────────────
  const handleLeave = useCallback(() => {
    providerRef.current?.destroy();
    docRef.current?.destroy();
    leaveRoom();
    router.push('/mockhub/arena');
  }, [leaveRoom, router]);

  if (!activeRoom || !isMounted) return null;

  // Dynamically generate participants based on WebRTC state
  const participants = [
    { displayName: user?.user_metadata?.full_name || 'You', role: 'Participant', isOnline: true },
    { displayName: peerName, role: 'Participant', isOnline: true }
  ];

  return (
    <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-[#050505] to-[#050505] z-[9999] flex flex-col md:flex-row font-sans p-2 md:p-4 gap-2 md:gap-4 overflow-hidden">
      
      {/* Left Sidebar: Video & Controls */}
      <aside className="w-full md:w-[320px] rounded-[24px] md:rounded-[32px] border border-white/10 bg-black/40 backdrop-blur-3xl flex flex-col p-4 md:p-5 gap-4 shadow-2xl flex-shrink-0 md:h-full overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/90">Live Session</span>
          </div>
          <button
            onClick={handleLeave}
            className="p-2 rounded-xl bg-white/5 border border-white/5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all"
            aria-label="Leave room"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* LiveKit Video Grid */}
        <div className="flex-1 w-full relative min-h-0 flex flex-col gap-2">
          {liveKitUrl && lkToken && (
            <LiveKitRoom
              video={true}
              audio={true}
              screen={false}
              token={lkToken}
              serverUrl={liveKitUrl}
              connect={true}
              className="w-full h-full flex flex-col gap-2"
            >
              <LiveKitVideoSidebar />
              <CustomLiveKitControls onLeave={handleLeave} />
            </LiveKitRoom>
          )}
        </div>
      </aside>

      {/* Center Workspace */}
      <main className="flex-1 flex flex-col relative rounded-[24px] md:rounded-[32px] border border-white/10 bg-[#0A0A0A]/80 backdrop-blur-2xl shadow-2xl overflow-hidden min-h-[50vh]">
        <header className="h-14 md:h-16 border-b border-white/5 flex items-center justify-between px-3 md:px-6 bg-white/5 shrink-0">
          <div className="flex items-center gap-3">
            {/* Pill-shaped Tabs */}
            <div className="flex items-center p-1 bg-black/40 rounded-xl border border-white/5">
              <button
                onClick={() => setActiveTab('editor')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'editor' ? 'bg-white/10 text-white shadow-sm' : 'text-muted-foreground hover:text-white'}`}
              >
                <Code2 className="w-3.5 h-3.5" /> Code
              </button>
              <button
                onClick={() => setActiveTab('whiteboard')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'whiteboard' ? 'bg-white/10 text-white shadow-sm' : 'text-muted-foreground hover:text-white'}`}
              >
                <PenTool className="w-3.5 h-3.5" /> Board
              </button>
            </div>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/5 text-[10px] font-bold text-white focus:outline-none focus:border-white/20 transition-all appearance-none cursor-pointer"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex items-center gap-2">
              {isHost && (
                <button 
                  onClick={() => {
                    const next = !peerHasWriteAccess;
                    setPeerHasWriteAccess(next);
                    chatChannelRef.current?.send({ type: 'broadcast', event: 'write_access_change', payload: { granted: next } });
                    toast.success(`Peer write access ${next ? 'granted' : 'revoked'}`);
                  }}
                  className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[9px] uppercase tracking-widest font-black transition-all duration-300 ${peerHasWriteAccess ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20' : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'}`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${peerHasWriteAccess ? 'bg-amber-500' : 'bg-primary'} animate-pulse`} />
                  {peerHasWriteAccess ? 'Revoke Peer Write' : 'Allow Peer Write'}
                </button>
              )}
              {/* Share Link */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Invite link copied!');
                }}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-white/80"
              >
                <Link className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] font-black uppercase tracking-widest">Share</span>
              </button>
              
              {/* Timer */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-white/5">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] font-black tabular-nums text-white/80 uppercase tracking-widest">
                  {String(Math.floor(sessionSeconds / 60)).padStart(2, '0')}:{String(sessionSeconds % 60).padStart(2, '0')}
                </span>
              </div>
            </div>
            
            <button onClick={handleCodeSubmit} className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20">
              <Play className="w-3 h-3" /> Run
            </button>
          </div>
        </header>

        <div className="flex-1 w-full relative">
          {activeTab === 'editor' ? (
            <div className="absolute inset-0 pt-4">
              <Editor
                height="100%"
                language={language}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  padding: { top: 0 },
                  readOnly: isReadonly,
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  cursorBlinking: "smooth",
                }}
                onMount={handleEditorDidMount}
              />
            </div>
          ) : (
            <MockWhiteboard roomId={activeRoom?.id || ''} isReadonly={isReadonly} />
          )}
        </div>
      </main>

      {/* Right Sidebar: Chat & Metadata */}
      <aside className="hidden lg:flex w-[320px] rounded-[32px] border border-white/10 bg-black/40 backdrop-blur-3xl flex-col overflow-hidden shadow-2xl">
        <div className="p-6 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
          <div>
            <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 mb-3">Problem Statement</h3>
            <h2 className="text-lg font-bold text-white leading-tight mb-4">{activeRoom.title || 'Mock Interview Session'}</h2>
            
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-[9px] font-black text-white/60 uppercase tracking-widest">{activeRoom.company || 'General'}</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-[9px] font-black text-white/60 uppercase tracking-widest">{activeRoom.type || 'Technical'}</span>
              <span className={`px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${
                activeRoom.difficulty === 'Hard' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                activeRoom.difficulty === 'Medium' ? 'bg-primary/10 text-primary border-primary/20' :
                'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
              }`}>{activeRoom.difficulty || 'Medium'}</span>
            </div>

            <div className="p-4 rounded-[20px] bg-white/5 border border-white/5 text-xs font-medium text-white/60 leading-relaxed">
              Collaborate on this problem in real-time. Use the editor to code and the board to diagram.
            </div>
          </div>

          <div>
            <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 mb-3">Participants</h3>
            <div className="space-y-2">
              {participants.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-[16px] bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shadow-inner">
                      <span className="text-[10px] font-bold text-primary">{p.displayName[0]}</span>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-white/90">{p.displayName}</p>
                      <p className="text-[8px] font-black uppercase tracking-widest text-white/40">{p.role}</p>
                    </div>
                  </div>
                  <div className={`w-1.5 h-1.5 rounded-full ${p.isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="space-y-3 flex-1 flex flex-col">
            <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Live Chat</h3>
            <div className="flex-1 min-h-[150px] space-y-2 overflow-y-auto custom-scrollbar pb-2">
              {chatMessages.length === 0 ? (
                <p className="text-[10px] font-medium text-white/30 text-center py-8">It's quiet here...</p>
              ) : (
                chatMessages.map(msg => (
                  <div key={msg.id} className="p-3 rounded-[16px] bg-white/5 border border-white/5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-black text-primary uppercase tracking-wider">{msg.sender}</span>
                      <span className="text-[8px] font-medium text-white/30">{msg.timestamp}</span>
                    </div>
                    <p className="text-[11px] font-medium text-white/80 leading-relaxed">{msg.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-white/5 backdrop-blur-xl border-t border-white/5 shrink-0">
          <div className="relative group">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
              placeholder="Message..."
              className="w-full bg-black/40 border border-white/10 rounded-[16px] px-4 py-3 text-[11px] font-medium text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all pr-12 placeholder:text-white/20"
            />
            <button
              onClick={sendMessage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-xl bg-primary/20 text-primary hover:bg-primary hover:text-white transition-all duration-300"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
