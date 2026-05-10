'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, VideoOff, Mic, MicOff, ScreenShare, 
  Settings, X, MessageSquare, Code2, PenTool,
  ChevronRight, Play, Layout
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/Button';
import { useMockStore } from '@/store/useMockStore';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { MonacoBinding } from 'y-monaco';

export function InterviewRoom() {
  const { activeRoom, leaveRoom } = useMockStore();
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<'editor' | 'whiteboard'>('editor');
  const [isMounted, setIsMounted] = useState(false);
  
  const editorRef = useRef<any>(null);
  const providerRef = useRef<any>(null);
  const docRef = useRef<any>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (activeRoom && isMounted) {
      docRef.current = new Y.Doc();
      providerRef.current = new WebrtcProvider(`mock-room-${activeRoom.id}`, docRef.current, {
        signaling: ['wss://signaling.yjs.dev'] // Public signaling for demo, replace with private
      });

      return () => {
        providerRef.current?.destroy();
        docRef.current?.destroy();
      };
    }
  }, [activeRoom, isMounted]);

  const handleEditorDidMount = (editor: any) => {
    if (!isMounted) return;
    editorRef.current = editor;
    const type = docRef.current.getText('monaco');
    new MonacoBinding(type, editorRef.current.getModel(), new Set([editorRef.current]), providerRef.current.awareness);
  };

  if (!activeRoom || !isMounted) return null;

  return (
    <div className="fixed inset-0 bg-[#050505] z-[200] flex overflow-hidden font-sans">
      {/* Left: Video Feeds */}
      <aside className="w-80 border-r border-white/5 bg-black/40 backdrop-blur-3xl flex flex-col p-6 gap-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-widest text-white">Live Session</span>
          </div>
          <button onClick={leaveRoom} className="p-2 rounded-lg bg-white/5 text-muted-foreground hover:text-white hover:bg-rose-500/20 transition-all">
             <X className="w-4 h-4" />
          </button>
        </div>

        {/* Local Video */}
        <div className="relative aspect-video rounded-3xl bg-white/5 border border-white/10 overflow-hidden shadow-2xl">
          <div className="absolute inset-0 flex items-center justify-center">
             {!isVideoEnabled && <VideoOff className="w-12 h-12 text-muted-foreground/20" />}
          </div>
          <div className="absolute bottom-4 left-4 flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">You</span>
             </div>
          </div>
        </div>

        {/* Remote Video */}
        <div className="relative aspect-video rounded-3xl bg-white/5 border border-white/10 overflow-hidden shadow-2xl">
           <div className="absolute inset-0 flex items-center justify-center">
              <Video className="w-12 h-12 text-muted-foreground/20" />
           </div>
           <div className="absolute top-4 right-4">
              <div className="px-3 py-1 rounded-full bg-primary text-white text-[8px] font-black uppercase tracking-widest">
                 Interviewer
              </div>
           </div>
           <div className="absolute bottom-4 left-4 flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">AM</span>
             </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-auto grid grid-cols-4 gap-3 bg-white/5 p-4 rounded-[32px] border border-white/10">
           <button 
             onClick={() => setIsMicEnabled(!isMicEnabled)}
             className={`aspect-square rounded-2xl flex items-center justify-center transition-all ${isMicEnabled ? 'bg-white/10 text-white' : 'bg-rose-500 text-white'}`}
           >
              {isMicEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
           </button>
           <button 
             onClick={() => setIsVideoEnabled(!isVideoEnabled)}
             className={`aspect-square rounded-2xl flex items-center justify-center transition-all ${isVideoEnabled ? 'bg-white/10 text-white' : 'bg-rose-500 text-white'}`}
           >
              {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
           </button>
           <button className="aspect-square rounded-2xl bg-white/10 text-white flex items-center justify-center">
              <ScreenShare className="w-5 h-5" />
           </button>
           <button className="aspect-square rounded-2xl bg-white/10 text-white flex items-center justify-center">
              <Settings className="w-5 h-5" />
           </button>
        </div>
      </aside>

      {/* Center: Workspace */}
      <main className="flex-1 flex flex-col relative">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/20">
          <div className="flex items-center gap-4">
             <button 
               onClick={() => setActiveTab('editor')}
               className={`flex items-center gap-3 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'editor' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-white'}`}
             >
                <Code2 className="w-4 h-4" /> Collaborative Code
             </button>
             <button 
               onClick={() => setActiveTab('whiteboard')}
               className={`flex items-center gap-3 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'whiteboard' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-white'}`}
             >
                <PenTool className="w-4 h-4" /> Whiteboard
             </button>
          </div>

          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Good Connection</span>
             </div>
             <Button size="sm" className="bg-emerald-600">Submit Code</Button>
          </div>
        </header>

        <div className="flex-1 bg-[#1e1e1e]">
          {activeTab === 'editor' ? (
            <Editor
              height="100%"
              theme="vs-dark"
              defaultLanguage="javascript"
              onMount={handleEditorDidMount}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                padding: { top: 20 },
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                fontFamily: 'JetBrains Mono, monospace',
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
               <div className="text-center space-y-4">
                  <PenTool className="w-12 h-12 mx-auto opacity-20" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em]">Whiteboard Syncing...</p>
               </div>
            </div>
          )}
        </div>
      </main>

      {/* Right: Question & Chat */}
      <aside className="w-96 border-l border-white/5 bg-black/40 backdrop-blur-3xl flex flex-col">
        <div className="p-8 space-y-8 flex-1 overflow-y-auto">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-4">Interview Problem</h3>
            <h2 className="text-xl font-bold text-white leading-tight mb-4">Implement a Distributed LRU Cache</h2>
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 text-sm font-medium text-muted-foreground leading-relaxed">
              Design and implement a data structure for Least Recently Used (LRU) cache that supports O(1) operations. It should support the following operations: get and put...
            </div>
          </div>

          <div>
             <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-4">Participant Status</h3>
             <div className="space-y-3">
                {[
                  { name: 'Akash Mani', role: 'Interviewer', active: true },
                  { name: 'Student', role: 'Interviewee (You)', active: true },
                ].map(p => (
                  <div key={p.name} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                           <span className="text-[10px] font-bold text-primary">{p.name[0]}</span>
                        </div>
                        <div>
                           <p className="text-xs font-bold text-white">{p.name}</p>
                           <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">{p.role}</p>
                        </div>
                     </div>
                     <div className={`w-2 h-2 rounded-full ${p.active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/5 bg-black/20">
           <div className="relative">
              <input 
                type="text" 
                placeholder="Send a message..." 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-medium text-white focus:outline-none focus:border-primary transition-all"
              />
              <button className="absolute right-4 top-1/2 -translate-y-1/2 text-primary">
                 <Send className="w-4 h-4" />
              </button>
           </div>
        </div>
      </aside>
    </div>
  );
}

function Send({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  );
}
