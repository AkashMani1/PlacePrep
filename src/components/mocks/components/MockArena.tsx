'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Users, Calendar, Plus, ChevronRight, Play, Clock, Star, Globe, Lock } from 'lucide-react';
import { BentoCard } from '@/components/ui/Bento';
import { useApp } from '@/context/AppContext';

const magneticSpring = { type: 'spring', stiffness: 150, damping: 15, mass: 0.1 } as any;

const LIVE_ROOMS = [
  { id: '1', type: 'Technical (DSA)', company: 'Google', difficulty: 'Hard', duration: '60m', participants: 4, rating: 4.8 },
  { id: '2', type: 'System Design', company: 'Meta', difficulty: 'Medium', duration: '45m', participants: 2, rating: 4.9 },
  { id: '3', type: 'HR & Behavioral', company: 'Amazon', difficulty: 'Easy', duration: '30m', participants: 12, rating: 4.5 },
];

export function MockArena() {
  const { state } = useApp();
  const peerSessions = state.peerSessions || [];

  return (
    <div className="grid grid-cols-12 gap-8 mt-12">
      {/* ── Live Mock Rooms ────────────────────────────────────────────── */}
      <div className="col-span-12 lg:col-span-7 space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-primary animate-pulse" />
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-foreground">Live Mock Arena</h2>
          </div>
          <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-widest">
            {LIVE_ROOMS.length} Active Rooms
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {LIVE_ROOMS.map((room) => (
              <motion.div
                key={room.id}
                whileHover={{ x: 8, backgroundColor: 'rgba(255, 255, 255, 0.04)' }}
                className="group relative flex items-center justify-between p-6 rounded-[32px] bg-card/40 border border-white/5 backdrop-blur-xl transition-all cursor-pointer overflow-hidden shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-center gap-6 relative z-10">
                  <div className="w-16 h-16 rounded-[24px] bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <Play className="w-6 h-6 text-primary fill-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-black tracking-tight text-foreground">{room.type}</h3>
                      <span className="px-2 py-0.5 rounded-md bg-black/40 text-[9px] font-black text-muted-foreground uppercase tracking-widest border border-white/5">
                        {room.company}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {room.duration}</span>
                      <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {room.participants} Joined</span>
                      <span className="flex items-center gap-1.5 text-yellow-500/80"><Star className="w-3.5 h-3.5 fill-yellow-500/20" /> {room.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    room.difficulty === 'Hard' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
                    room.difficulty === 'Medium' ? 'bg-primary/10 text-primary border-primary/20' : 
                    'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  }`}>
                    {room.difficulty} TIER
                  </span>
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                    <ChevronRight className="w-5 h-5 text-white" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Peer Matching & Schedule ──────────────────────────────────── */}
      <div className="col-span-12 lg:col-span-5 space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-foreground">Squad Sessions</h2>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/10"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>

        <BentoCard className="bg-card/40 backdrop-blur-3xl border-white/5 shadow-2xl !p-0 overflow-hidden">
          <div className="p-8 space-y-6">
            <div className="bg-primary/10 p-6 rounded-[32px] border border-primary/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                <Users className="w-20 h-20 text-primary" />
              </div>
              <h3 className="text-lg font-black text-primary tracking-tight mb-2 uppercase">Match with Peer</h3>
              <p className="text-xs font-semibold text-primary/70 mb-6 leading-relaxed">
                Automatically find a partner for a bidirectional technical mock interview.
              </p>
              <button className="w-full py-4 rounded-2xl bg-primary text-white text-[11px] font-black uppercase tracking-[0.3em] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                Find Match Now
              </button>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Scheduled Sessions</h4>
              {peerSessions.length === 0 ? (
                <div className="py-12 text-center rounded-[32px] border border-dashed border-white/10 bg-white/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">No pending sessions</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {peerSessions.map(session => (
                    <div key={session.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                          <Users className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{session.partnerName}</p>
                          <p className="text-[10px] font-medium text-muted-foreground uppercase">{session.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-primary uppercase">{session.date}</p>
                        <p className="text-[10px] font-medium text-muted-foreground">14:00 PM</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </BentoCard>
      </div>
    </div>
  );
}
