'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Flame, ChevronRight, Shield } from 'lucide-react';
import { BentoCard } from '@/components/ui/Bento';
import { useMockStore } from '@/store/useMockStore';
import { toast } from 'sonner';

export function MockSocial() {
  const { leaderboard, submissions, analytics, friends, computeLeaderboard } = useMockStore();

  useEffect(() => {
    computeLeaderboard();
  }, [computeLeaderboard]);

  const totalScore = submissions.reduce((s, sub) => s + sub.score, 0);
  const userTier = totalScore >= 2500 ? 'Diamond' : totalScore >= 1500 ? 'Platinum' : totalScore >= 800 ? 'Gold' : totalScore >= 300 ? 'Silver' : 'Bronze';

  const TIER_COLORS: Record<string, string> = {
    Diamond: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.1)]',
    Platinum: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    Gold: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    Silver: 'bg-slate-400/10 text-slate-400 border-slate-400/20',
    Bronze: 'bg-orange-700/10 text-orange-700 border-orange-700/20',
  };

  const handleFriendAction = (name: string) => {
    toast.info(`Challenge sent to ${name}!`);
  };

  return (
    <div className="grid grid-cols-12 gap-8 mt-20">
      {/* ── Leaderboard ────────────────────────────────────────────── */}
      <div className="col-span-12 lg:col-span-8 space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-foreground">Performance Board</h2>
          </div>
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            Your Stats
          </span>
        </div>

        {submissions.length === 0 ? (
          <div className="py-20 text-center rounded-[48px] border-2 border-dashed border-white/5 bg-white/[0.02]">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground opacity-40 mb-2">
              No ranking data yet
            </p>
            <p className="text-[10px] font-medium text-muted-foreground opacity-30">
              Complete assessments to build your leaderboard profile
            </p>
          </div>
        ) : (
          <div className="rounded-[48px] border border-white/5 bg-card/30 backdrop-blur-3xl overflow-hidden shadow-2xl">
            <div className="p-8 space-y-6">
              {/* User Card */}
              <div className="p-6 rounded-[32px] bg-primary/5 border border-primary/20 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center font-black text-primary text-lg">
                    #1
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-primary tracking-tight">You</h3>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                      {submissions.length} assessments • {analytics.streak} day streak
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-2">
                    <Flame className={`w-5 h-5 ${analytics.streak > 3 ? 'text-orange-500 animate-pulse' : 'text-orange-500/40'}`} />
                    <span className="text-lg font-black tabular-nums text-white">{analytics.streak}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black tabular-nums text-white">{totalScore}</span>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Mock IQ</p>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${TIER_COLORS[userTier]}`}>
                    {userTier}
                  </span>
                </div>
              </div>

              {/* Recent performance summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <span className="text-2xl font-black text-foreground tabular-nums">{analytics.avgAccuracy.toFixed(0)}%</span>
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-1">Avg Accuracy</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <span className="text-2xl font-black text-foreground tabular-nums">{analytics.bestStreak}</span>
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-1">Best Streak</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <span className="text-2xl font-black text-foreground tabular-nums">{analytics.pressureIndex.toFixed(0)}%</span>
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-1">Pressure IQ</p>
                </div>
              </div>

              {/* Global Leaderboard List */}
              <div className="mt-12 space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-6">Global Rankings</h3>
                <div className="space-y-3">
                  {leaderboard.length === 0 ? (
                    <div className="py-8 text-center rounded-2xl border border-dashed border-white/5">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Awaiting global data sync...</p>
                    </div>
                  ) : (
                    leaderboard.slice(0, 5).map((entry) => (
                      <div 
                        key={entry.id}
                        className="p-4 rounded-2xl bg-white/2 border border-white/5 flex items-center justify-between hover:bg-white/5 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-black text-primary/60 w-6">#{entry.rank}</span>
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-bold text-xs uppercase">
                            {entry.name.substring(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-white tracking-tight">{entry.name}</p>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{entry.tier}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-white tabular-nums">{entry.score}</p>
                          <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">IQ Points</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Social Hub & Squads ───────────────────────────────────────── */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
        <div className="flex items-center gap-3 px-2">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-foreground">Mock Squads</h2>
        </div>

        <BentoCard className="bg-card/40 backdrop-blur-3xl border-white/5 p-8 space-y-10">
           <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Your Squad</h3>
              {submissions.length >= 3 ? (
                <div className="p-6 rounded-3xl bg-primary/5 border border-primary/20 relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-black text-white tracking-tight">
                      {userTier === 'Diamond' || userTier === 'Platinum' ? 'Elite Squad' : 'Rising Squad'}
                    </h4>
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center">
                      <Shield className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-6">
                    Tier: {userTier} • {submissions.length} Simulations
                  </p>
                  <button
                    onClick={() => toast.info('Squad challenges coming soon!')}
                    className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:border-primary transition-all"
                  >
                    Enter War Room
                  </button>
                </div>
              ) : (
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 text-center">
                  <Shield className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40 mb-2">
                    Complete 3+ assessments to unlock squads
                  </p>
                </div>
              )}
           </div>

           <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Study Partners</h3>
                 {friends.length > 0 && (
                   <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                     {friends.filter(f => f.isOnline).length} Online
                   </span>
                 )}
              </div>
              {friends.length === 0 ? (
                <div className="py-8 text-center rounded-2xl border border-dashed border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40 mb-2">
                    No study partners yet
                  </p>
                  <button
                    onClick={() => toast.info('Share your profile link to connect with peers!')}
                    className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                  >
                    Invite friends →
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {friends.map(friend => (
                    <div key={friend.userId} className="flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-xs text-muted-foreground group-hover:text-primary group-hover:border-primary/40 transition-all">
                            {friend.displayName[0]}
                          </div>
                          {friend.isOnline && <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" />}
                        </div>
                        <div>
                          <p className="text-xs font-black text-white">{friend.displayName}</p>
                          <p className="text-[9px] font-medium text-muted-foreground truncate w-32">{friend.status}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleFriendAction(friend.displayName)}
                        className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-all"
                        aria-label={`Challenge ${friend.displayName}`}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
           </div>
        </BentoCard>
      </div>
    </div>
  );
}
