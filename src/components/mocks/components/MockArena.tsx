'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Calendar, Plus, ChevronRight, Play, Clock, Star, Globe, Search, X, Trash2 } from 'lucide-react';
import { BentoCard } from '@/components/ui/Bento';
import { useMockStore } from '@/store/useMockStore';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function MockArena() {
  const router = useRouter();
  const {
    availableRooms, isLoadingRooms, joinRoom, createRoom, deleteRoom, myCreatedRooms,
    scheduledSessions, addScheduledSession, cancelSession,
    isMatchmaking, matchmakingStatus, startMatchmaking, cancelMatchmaking,
  } = useMockStore();
  const { user } = useAuth();

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ partnerName: '', type: 'Technical (DSA)', date: '', time: '14:00' });

  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [createRoomForm, setCreateRoomForm] = useState({
    title: 'Mock Interview Session',
    type: 'Technical (DSA)',
    company: 'General',
    difficulty: 'Medium',
  });

  const handleSchedule = () => {
    if (!scheduleForm.partnerName || !scheduleForm.date) {
      toast.error('Please fill partner name and date.');
      return;
    }
    addScheduledSession({ ...scheduleForm, status: 'confirmed' });
    setShowScheduleModal(false);
    setScheduleForm({ partnerName: '', type: 'Technical (DSA)', date: '', time: '14:00' });
  };

  const handleCreateRoomSubmit = async () => {
    if (!createRoomForm.title.trim()) {
      toast.error('Please provide a room title.');
      return;
    }
    toast.loading('Creating private room...', { id: 'create-room' });
    try {
      const roomId = await createRoom({
        title: createRoomForm.title,
        type: createRoomForm.type,
        company: createRoomForm.company,
        difficulty: createRoomForm.difficulty,
      });
      const inviteLink = `${window.location.origin}/mockhub/interview/${roomId}`;
      await navigator.clipboard.writeText(`Join my mock interview room on PlacePrep: ${inviteLink}`);
      toast.success('Room created! Invite link copied to clipboard.', { id: 'create-room' });
      setShowCreateRoomModal(false);
      router.push(`/mockhub/interview/${roomId}`);
    } catch (err) {
      toast.error('Failed to create room', { id: 'create-room' });
    }
  };

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
            {availableRooms.length} Active Rooms
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {isLoadingRooms ? (
            // Skeleton loaders
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-5 rounded-[28px] bg-card/20 border border-white/5 animate-pulse h-24" />
            ))
          ) : availableRooms.length === 0 ? (
            <div className="py-16 text-center rounded-[28px] border-2 border-dashed border-white/5 bg-white/[0.02]">
              <Globe className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40 mb-4">
                No active rooms right now
              </p>
              <button
                onClick={() => setShowCreateRoomModal(true)}
                className="px-6 py-3 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest"
              >
                Create First Room
              </button>
            </div>
          ) : (
            <AnimatePresence>
              {availableRooms.map((room) => (
                <motion.div
                  key={room.id}
                  whileHover={{ x: 8, backgroundColor: 'rgba(255, 255, 255, 0.04)' }}
                  onClick={() => router.push(`/mockhub/interview/${room.id}`)}
                  className="group relative flex items-center justify-between p-5 rounded-[28px] bg-card/40 border border-white/5 backdrop-blur-xl transition-all cursor-pointer overflow-hidden shadow-xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="flex items-center gap-6 relative z-10">
                    <div className="w-14 h-14 rounded-[20px] bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <Play className="w-5 h-5 text-primary fill-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-black tracking-tight text-foreground">{room.type || room.title}</h3>
                        <span className="px-2 py-0.5 rounded-md bg-black/40 text-[9px] font-black text-muted-foreground uppercase tracking-widest border border-white/5">
                          {room.company || 'General'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {room.duration || '45m'}</span>
                        <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {room.participants?.length || 0} Joined</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 relative z-10">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      room.difficulty === 'Hard' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                      room.difficulty === 'Medium' ? 'bg-primary/10 text-primary border-primary/20' :
                      'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    }`}>
                      {room.difficulty || 'Medium'}
                    </span>
                    {(myCreatedRooms.includes(room.id) || user?.email === 'akashmani9955@gmail.com') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteRoom(room.id);
                        }}
                        className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center hover:bg-rose-500 hover:border-rose-500 transition-all duration-300 group/delete"
                        title="Delete Room"
                      >
                        <Trash2 className="w-4 h-4 text-rose-500 group-hover/delete:text-white" />
                      </button>
                    )}
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                      <ChevronRight className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
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
            onClick={() => setShowScheduleModal(true)}
            className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/10"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>

        <BentoCard className="bg-card/40 backdrop-blur-3xl border-white/5 shadow-2xl !p-0 overflow-hidden">
          <div className="p-8 space-y-6">
            {/* Matchmaking */}
            <div className="bg-primary/10 p-5 rounded-[28px] border border-primary/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                <Users className="w-16 h-16 text-primary" />
              </div>
              <h3 className="text-base font-black text-primary tracking-tight mb-2 uppercase">Match with Peer</h3>
              <p className="text-[10px] font-semibold text-primary/70 mb-5 leading-relaxed">
                Automatically find a partner for a bidirectional technical mock interview.
              </p>
              {isMatchmaking ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{matchmakingStatus}</span>
                  </div>
                  <button
                    onClick={() => cancelMatchmaking(user?.id || 'anon')}
                    className="w-full py-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-rose-500/20 transition-all"
                  >
                    Cancel Search
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => startMatchmaking(user?.id || 'anon', user?.user_metadata?.full_name || 'Anonymous')}
                    className="w-full py-3.5 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Find Match Now
                  </button>
                  
                  <div className="flex items-center gap-2 my-1">
                    <div className="h-px bg-white/10 flex-1" />
                    <span className="text-[8px] font-black text-muted-foreground uppercase">OR</span>
                    <div className="h-px bg-white/10 flex-1" />
                  </div>

                  <button
                    onClick={() => setShowCreateRoomModal(true)}
                    className="w-full py-3.5 rounded-xl bg-white/5 border border-white/10 text-primary hover:bg-white/10 text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    Create & Share Link
                  </button>
                </div>
              )}
            </div>

            {/* Scheduled Sessions */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Scheduled Sessions</h4>
              {scheduledSessions.filter(s => s.status !== 'cancelled').length === 0 ? (
                <div className="py-12 text-center rounded-[32px] border border-dashed border-white/10 bg-white/[0.02]">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">No pending sessions</p>
                  <button
                    onClick={() => setShowScheduleModal(true)}
                    className="mt-3 text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                  >
                    Schedule one →
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {scheduledSessions.filter(s => s.status !== 'cancelled').map(session => (
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
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-[10px] font-black text-primary uppercase">{session.date}</p>
                          <p className="text-[10px] font-medium text-muted-foreground">{session.time}</p>
                        </div>
                        <button
                          onClick={() => cancelSession(session.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-500/20 text-muted-foreground hover:text-rose-500 transition-all"
                          aria-label="Cancel session"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </BentoCard>
      </div>

      {/* ── Schedule Modal ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showScheduleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-2xl z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 40 }}
              className="bg-card/60 border border-white/10 rounded-[40px] p-10 w-full max-w-lg space-y-8"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black uppercase tracking-widest text-foreground">Schedule Session</h3>
                <button onClick={() => setShowScheduleModal(false)} className="p-2 rounded-full hover:bg-white/5 text-muted-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-3 block">Partner Name</label>
                  <input
                    value={scheduleForm.partnerName}
                    onChange={e => setScheduleForm(f => ({ ...f, partnerName: e.target.value }))}
                    placeholder="Enter partner's name"
                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-foreground text-sm font-medium focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-3 block">Date</label>
                    <input
                      type="date"
                      value={scheduleForm.date}
                      onChange={e => setScheduleForm(f => ({ ...f, date: e.target.value }))}
                      className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-foreground text-sm font-medium focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-3 block">Time</label>
                    <input
                      type="time"
                      value={scheduleForm.time}
                      onChange={e => setScheduleForm(f => ({ ...f, time: e.target.value }))}
                      className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-foreground text-sm font-medium focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-3 block">Type</label>
                  <select
                    value={scheduleForm.type}
                    onChange={e => setScheduleForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-foreground text-sm font-medium focus:outline-none focus:border-primary transition-all"
                  >
                    <option value="Technical (DSA)">Technical (DSA)</option>
                    <option value="System Design">System Design</option>
                    <option value="HR & Behavioral">HR & Behavioral</option>
                    <option value="Full Loop">Full Loop Simulation</option>
                  </select>
                </div>
              </div>

              <Button onClick={handleSchedule} className="w-full py-5 bg-primary text-white">
                Confirm Schedule
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Create Room Modal ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showCreateRoomModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-2xl z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 40 }}
              className="bg-card/60 border border-white/10 rounded-[40px] p-10 w-full max-w-lg space-y-8"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black uppercase tracking-widest text-foreground">Create Mock Room</h3>
                <button onClick={() => setShowCreateRoomModal(false)} className="p-2 rounded-full hover:bg-white/5 text-muted-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-3 block">Room Title</label>
                  <input
                    value={createRoomForm.title}
                    onChange={e => setCreateRoomForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g., TCS Advanced Coding Prep"
                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-foreground text-sm font-medium focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-3 block">Type</label>
                    <select
                      value={createRoomForm.type}
                      onChange={e => setCreateRoomForm(f => ({ ...f, type: e.target.value }))}
                      className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-foreground text-sm font-medium focus:outline-none focus:border-primary transition-all"
                    >
                      <option value="Technical (DSA)">Technical (DSA)</option>
                      <option value="System Design">System Design</option>
                      <option value="HR & Behavioral">HR & Behavioral</option>
                      <option value="Core Subjects">Core Subjects</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-3 block">Difficulty</label>
                    <select
                      value={createRoomForm.difficulty}
                      onChange={e => setCreateRoomForm(f => ({ ...f, difficulty: e.target.value }))}
                      className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-foreground text-sm font-medium focus:outline-none focus:border-primary transition-all"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-3 block">Company Target</label>
                  <select
                    value={createRoomForm.company}
                    onChange={e => setCreateRoomForm(f => ({ ...f, company: e.target.value }))}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-foreground text-sm font-medium focus:outline-none focus:border-primary transition-all"
                  >
                    <option value="General">General / None</option>
                    <option value="TCS">TCS (Ninja/Digital/Prime)</option>
                    <option value="Amazon">Amazon</option>
                    <option value="Google">Google</option>
                    <option value="Microsoft">Microsoft</option>
                  </select>
                </div>
              </div>

              <Button onClick={handleCreateRoomSubmit} className="w-full py-5 bg-primary text-white">
                Create & Enter Room
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
