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
import { useWebRTC } from '@/hooks/useWebRTC';
import { MockWhiteboard } from './MockWhiteboard';


interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
}

export function InterviewRoom() {
  const router = useRouter();
  const { activeRoom, leaveRoom } = useMockStore();
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'whiteboard'>('editor');
  const [isMounted, setIsMounted] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [codeOutput, setCodeOutput] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [sessionSeconds, setSessionSeconds] = useState(0);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const editorRef = useRef<any>(null);
  const providerRef = useRef<any>(null);
  const docRef = useRef<any>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const sessionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // ── Media Stream Setup ──────────────────────────────────────────────
  useEffect(() => {
    if (!activeRoom || !isMounted) return;

    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('Camera/mic not available:', err);
        toast.info('Camera or microphone not available. You can still use the editor.');
        setIsVideoEnabled(false);
        setIsMicEnabled(false);
      }
    };

    initMedia();

    return () => {
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    };
  }, [activeRoom?.id, isMounted]);

  const { remoteStream } = useWebRTC(activeRoom?.id || '', localStreamRef.current);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // ── YJS Collaborative Setup ─────────────────────────────────────────
  useEffect(() => {
    if (!activeRoom || !isMounted) return;

    // Production-ready signaling servers (ordered by priority)
    const signalingServers = [
      // Custom server (set NEXT_PUBLIC_YJS_SERVER for enterprise deployment)
      ...(process.env.NEXT_PUBLIC_YJS_SERVER ? [`wss://${process.env.NEXT_PUBLIC_YJS_SERVER}`] : []),
      // Hosted fallbacks
      'wss://signaling.yjs.dev',
      'wss://y-webrtc-signaling-eu.onrender.com',
    ];

    import('yjs').then(Y => {
      docRef.current = new Y.Doc();
      import('y-webrtc').then(({ WebrtcProvider }) => {
        providerRef.current = new WebrtcProvider(
          `placeprep-editor-${activeRoom.id}`,
          docRef.current,
          {
            signaling: signalingServers,
            password: activeRoom.id,
          }
        );
      }).catch(e => console.warn('[YJS] WebRTC provider init failed:', e));
    });

    return () => {
      providerRef.current?.destroy();
      docRef.current?.destroy();
    };
  }, [activeRoom?.id, isMounted]);


  const handleEditorDidMount = (editor: any) => {
    if (!isMounted || !docRef.current || !providerRef.current) return;
    editorRef.current = editor;
    try {
      const type = docRef.current.getText('monaco');
      new MonacoBinding(type, editorRef.current.getModel(), new Set([editorRef.current]), providerRef.current.awareness);
    } catch (err) {
      console.warn('YJS binding failed:', err);
    }
  };

  // ── Camera/Mic Toggle ───────────────────────────────────────────────
  const toggleVideo = useCallback(() => {
    const stream = localStreamRef.current;
    if (stream) {
      stream.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    }
    setIsVideoEnabled(v => !v);
  }, []);

  const toggleMic = useCallback(() => {
    const stream = localStreamRef.current;
    if (stream) {
      stream.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    }
    setIsMicEnabled(m => !m);
  }, []);

  // ── Screen Sharing ──────────────────────────────────────────────────
  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      // Stop sharing — restore camera
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        setIsScreenSharing(false);
      } catch {
        setIsScreenSharing(false);
      }
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        localStreamRef.current?.getTracks().forEach(t => t.stop());
        localStreamRef.current = screenStream;
        if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;
        setIsScreenSharing(true);

        screenStream.getVideoTracks()[0].addEventListener('ended', () => {
          setIsScreenSharing(false);
        });
      } catch {
        toast.info('Screen sharing cancelled or not supported.');
      }
    }
  }, [isScreenSharing]);

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
  }, [chatInput]);

  // ── Code Submit ─────────────────────────────────────────────────────
  const handleCodeSubmit = useCallback(() => {
    const code = editorRef.current?.getValue() || '';
    if (!code.trim()) {
      toast.error('Write some code before submitting.');
      return;
    }
    setCodeOutput('Code submitted successfully. In a live session, this would be evaluated against test cases.');
    toast.success('Code submitted!');
  }, []);

  // ── Leave & Cleanup ─────────────────────────────────────────────────
  const handleLeave = useCallback(() => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    providerRef.current?.destroy();
    docRef.current?.destroy();
    leaveRoom();
    router.push('/mockhub/arena');
  }, [leaveRoom, router]);

  if (!activeRoom || !isMounted) return null;

  const participants = activeRoom.participants || [];

  return (
    <div className="fixed inset-0 bg-[#050505] z-[9999] flex overflow-hidden font-sans">
      {/* Left: Video Feeds */}
      <aside className="w-64 md:w-80 border-r border-white/5 bg-black/40 backdrop-blur-3xl flex flex-col p-4 md:p-6 gap-4 md:gap-6">
        <div className="flex items-center justify-between mb-2 md:mb-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white">Live Session</span>
          </div>
          <button
            onClick={handleLeave}
            className="p-2 rounded-lg bg-white/5 text-muted-foreground hover:text-white hover:bg-rose-500/20 transition-all"
            aria-label="Leave room"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Local Video */}
        <div className="relative aspect-video rounded-2xl md:rounded-3xl bg-white/5 border border-white/10 overflow-hidden shadow-2xl">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-cover ${!isVideoEnabled ? 'hidden' : ''}`}
          />
          {!isVideoEnabled && (
            <div className="absolute inset-0 flex items-center justify-center">
              <VideoOff className="w-10 h-10 md:w-12 md:h-12 text-muted-foreground/20" />
            </div>
          )}
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <div className="px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10">
              <span className="text-[10px] font-bold text-white">You {isScreenSharing ? '(Screen)' : ''}</span>
            </div>
          </div>
        </div>

        {/* Remote Video Placeholder */}
        <div className="relative aspect-video rounded-2xl md:rounded-3xl bg-white/5 border border-white/10 overflow-hidden shadow-2xl">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={`w-full h-full object-cover ${!remoteStream ? 'hidden' : ''}`}
          />
          {!remoteStream && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-2">
                <Video className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground/20 mx-auto" />
                <p className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest">
                  {participants.length > 1 ? participants.find(p => p.displayName !== 'You')?.displayName || 'Peer' : 'Waiting for peer...'}
                </p>
                {participants.length <= 1 && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('Room link copied to clipboard!');
                    }}
                    className="mt-4 flex items-center justify-center gap-2 px-4 py-2 mx-auto rounded-lg bg-white/5 border border-white/10 hover:bg-primary/20 hover:border-primary/30 transition-all group/share"
                  >
                    <Link className="w-3.5 h-3.5 text-muted-foreground group-hover/share:text-primary transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover/share:text-primary transition-colors">
                      Share Link
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}
          {participants.length > 1 && (
            <div className="absolute top-3 right-3">
              <div className="px-3 py-1 rounded-full bg-primary text-white text-[8px] font-black uppercase tracking-widest">
                {participants.find(p => p.role === 'interviewer')?.role === 'interviewer' ? 'Interviewer' : 'Peer'}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-auto grid grid-cols-4 gap-2 md:gap-3 bg-white/5 p-3 md:p-4 rounded-[24px] md:rounded-[32px] border border-white/10">
          <button
            onClick={toggleMic}
            className={`aspect-square rounded-xl md:rounded-2xl flex items-center justify-center transition-all ${isMicEnabled ? 'bg-white/10 text-white' : 'bg-rose-500 text-white'}`}
            aria-label={isMicEnabled ? 'Mute microphone' : 'Unmute microphone'}
          >
            {isMicEnabled ? <Mic className="w-4 h-4 md:w-5 md:h-5" /> : <MicOff className="w-4 h-4 md:w-5 md:h-5" />}
          </button>
          <button
            onClick={toggleVideo}
            className={`aspect-square rounded-xl md:rounded-2xl flex items-center justify-center transition-all ${isVideoEnabled ? 'bg-white/10 text-white' : 'bg-rose-500 text-white'}`}
            aria-label={isVideoEnabled ? 'Disable camera' : 'Enable camera'}
          >
            {isVideoEnabled ? <Video className="w-4 h-4 md:w-5 md:h-5" /> : <VideoOff className="w-4 h-4 md:w-5 md:h-5" />}
          </button>
          <button
            onClick={toggleScreenShare}
            className={`aspect-square rounded-xl md:rounded-2xl flex items-center justify-center transition-all ${isScreenSharing ? 'bg-primary text-white' : 'bg-white/10 text-white'}`}
            aria-label={isScreenSharing ? 'Stop screen sharing' : 'Start screen sharing'}
          >
            {isScreenSharing ? <ScreenShareOff className="w-4 h-4 md:w-5 md:h-5" /> : <ScreenShare className="w-4 h-4 md:w-5 md:h-5" />}
          </button>
          <button
            onClick={handleLeave}
            className="aspect-square rounded-xl md:rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
            aria-label="End call"
          >
            <X className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </aside>

      {/* Center: Workspace */}
      <main className="flex-1 flex flex-col relative">
        <header className="h-14 md:h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-8 bg-black/20">
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'editor' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-white'}`}
            >
              <Code2 className="w-4 h-4" /> Code
            </button>
            <button
              onClick={() => setActiveTab('whiteboard')}
              className={`flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'whiteboard' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-white'}`}
            >
              <PenTool className="w-4 h-4" /> Board
            </button>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-white focus:outline-none"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            {/* Session Timer */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[10px] font-black tabular-nums text-muted-foreground uppercase tracking-widest">
                {String(Math.floor(sessionSeconds / 60)).padStart(2, '0')}:{String(sessionSeconds % 60).padStart(2, '0')}
              </span>
            </div>
            <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />

              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 hidden md:inline">Connected</span>
            </div>
            <Button onClick={handleCodeSubmit} size="sm" className="bg-emerald-600 text-[10px]">
              <Play className="w-3 h-3 mr-1" /> Run
            </Button>
          </div>
        </header>

        <div className="flex-1 bg-[#1e1e1e] flex flex-col">
          {activeTab === 'editor' ? (
            <>
              <div className="flex-1">
                <Editor
                  height="100%"
                  theme="vs-dark"
                  language={language}
                  defaultValue="// Start coding your solution here...\n"
                  onMount={handleEditorDidMount}
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    padding: { top: 20 },
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    fontFamily: 'JetBrains Mono, monospace',
                    wordWrap: 'on',
                  }}
                />
              </div>
              {codeOutput && (
                <div className="h-24 border-t border-white/10 bg-black/60 p-4 overflow-y-auto">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2">Output</p>
                  <pre className="text-xs font-mono text-muted-foreground">{codeOutput}</pre>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-[#121212]">
              <MockWhiteboard roomId={activeRoom.id} />
            </div>
          )}
        </div>
      </main>

      {/* Right: Question & Chat */}
      <aside className="hidden lg:flex w-80 xl:w-96 border-l border-white/5 bg-black/40 backdrop-blur-3xl flex-col">
        <div className="p-6 xl:p-8 space-y-6 xl:space-y-8 flex-1 overflow-y-auto custom-scrollbar">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-4">Interview Problem</h3>
            <h2 className="text-lg xl:text-xl font-bold text-white leading-tight mb-4">{activeRoom.title || 'Mock Interview Session'}</h2>
            
            {/* Room Metadata */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                {activeRoom.company || 'General'}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                {activeRoom.type || 'Technical'}
              </span>
              <span className={`px-2.5 py-1 rounded-md border text-[9px] font-black uppercase tracking-widest ${
                activeRoom.difficulty === 'Hard' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                activeRoom.difficulty === 'Medium' ? 'bg-primary/10 text-primary border-primary/20' :
                'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
              }`}>
                {activeRoom.difficulty || 'Medium'}
              </span>
            </div>

            <div className="p-4 xl:p-6 rounded-2xl xl:rounded-3xl bg-white/5 border border-white/10 text-sm font-medium text-muted-foreground leading-relaxed">
              Discuss the problem with your partner using the code editor. Use the chat below for text communication.
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-4">Participants</h3>
            <div className="space-y-3">
              {participants.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-3 xl:p-4 rounded-xl xl:rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-primary">{p.displayName[0]}</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{p.displayName}</p>
                      <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">{p.role}</p>
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${p.isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Chat</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
              {chatMessages.length === 0 ? (
                <p className="text-[10px] font-medium text-muted-foreground/40 text-center py-4">No messages yet</p>
              ) : (
                chatMessages.map(msg => (
                  <div key={msg.id} className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-black text-primary uppercase">{msg.sender}</span>
                      <span className="text-[8px] font-medium text-muted-foreground">{msg.timestamp}</span>
                    </div>
                    <p className="text-xs font-medium text-white">{msg.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="p-4 xl:p-6 border-t border-white/5 bg-black/20">
          <div className="relative">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
              placeholder="Send a message..."
              className="w-full bg-white/5 border border-white/10 rounded-xl xl:rounded-2xl px-4 xl:px-6 py-3 xl:py-4 text-xs font-medium text-white focus:outline-none focus:border-primary transition-all pr-12"
            />
            <button
              onClick={sendMessage}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-white transition-colors p-1"
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
