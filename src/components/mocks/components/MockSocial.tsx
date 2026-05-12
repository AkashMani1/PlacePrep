'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Flame, Shield, ArrowUpRight } from 'lucide-react';
import { useMockStore } from '@/store/useMockStore';
import { toast } from 'sonner';

const TIER_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  Diamond: { text: 'text-cyan-400',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/20'   },
  Platinum: { text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  Gold:     { text: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20'  },
  Silver:   { text: 'text-slate-400',  bg: 'bg-slate-500/10',  border: 'border-slate-500/20'  },
  Bronze:   { text: 'text-orange-400', bg: 'bg-orange-700/10', border: 'border-orange-700/20' },
};

export function MockSocial() {
  const { leaderboard, submissions, analytics, friends, computeLeaderboard } = useMockStore();

  useEffect(() => {
    computeLeaderboard();
  }, [computeLeaderboard]);

  const totalScore = submissions.reduce((s, sub) => s + sub.score, 0);
  const userTier = totalScore >= 2500 ? 'Diamond' : totalScore >= 1500 ? 'Platinum' : totalScore >= 800 ? 'Gold' : totalScore >= 300 ? 'Silver' : 'Bronze';
  const tierCfg = TIER_COLORS[userTier];

  return (
    <div className="space-y-10 mt-12">
      {/* Section Header */}
      <div className="flex items-center gap-4">
        <Trophy className="w-5 h-5 text-amber-400" />
        <h2 className="text-xl font-black tracking-tight text-white">Leaderboard & Social</h2>
        <div className="flex-1 h-px bg-white/5" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Your Stats Card ───────────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-6 rounded-[20px] bg-card/40 border border-white/8 backdrop-blur-xl space-y-5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Your Standing</p>
              <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${tierCfg.bg} ${tierCfg.border} ${tierCfg.text}`}>
                {userTier}
              </span>
            </div>

            {submissions.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <Trophy className="w-8 h-8 text-muted-foreground/20 mx-auto" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">No data yet</p>
                <p className="text-[9px] text-muted-foreground/30">Complete assessments to rank up</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Mock IQ Score */}
                <div className="space-y-1.5">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">Mock IQ Score</p>
                  <p className="text-3xl font-black text-white tabular-nums">{totalScore}</p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Accuracy', value: `${analytics.avgAccuracy.toFixed(0)}%` },
                    { label: 'Streak', value: `${analytics.streak}d` },
                    { label: 'Sessions', value: `${submissions.length}` },
                  ].map((s) => (
                    <div key={s.label} className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                      <p className="text-sm font-black text-white tabular-nums">{s.value}</p>
                      <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/50 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Friends / Study Partners */}
          <div className="p-6 rounded-[20px] bg-card/40 border border-white/8 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Study Partners</p>
              {friends.length > 0 && (
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">
                  {friends.filter(f => f.isOnline).length} Online
                </span>
              )}
            </div>

            {friends.length === 0 ? (
              <div className="py-6 text-center space-y-2">
                <Users className="w-6 h-6 text-muted-foreground/20 mx-auto" />
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/30">No partners connected</p>
                <button
                  onClick={() => toast.info('Share your profile link to connect!')}
                  className="text-[9px] font-black text-primary uppercase tracking-widest hover:text-primary/80 transition-colors"
                >
                  Invite peers →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {friends.map(friend => (
                  <div key={friend.userId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black text-muted-foreground">
                          {friend.displayName[0]}
                        </div>
                        {friend.isOnline && (
                          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-background" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{friend.displayName}</p>
                        <p className="text-[9px] text-muted-foreground/50 truncate w-28">{friend.status}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toast.info(`Challenge sent to ${friend.displayName}!`)}
                      className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
                    >
                      Challenge
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Global Leaderboard ─────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="rounded-[20px] bg-card/40 border border-white/8 backdrop-blur-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Global Rankings</p>
              {leaderboard.length > 0 && (
                <span className="text-[9px] font-bold text-primary uppercase tracking-widest flex items-center gap-1">
                  Live <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block" />
                </span>
              )}
            </div>

            {leaderboard.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <Trophy className="w-8 h-8 text-muted-foreground/10 mx-auto" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">Syncing global data...</p>
                <p className="text-[9px] text-muted-foreground/20">Complete an assessment to join the leaderboard</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {leaderboard.slice(0, 8).map((entry, i) => {
                  const tc = TIER_COLORS[entry.tier] || TIER_COLORS.Bronze;
                  const isTop3 = i < 3;
                  return (
                    <div
                      key={entry.id}
                      className={`flex items-center gap-4 px-6 py-3.5 transition-colors ${
                        isTop3 ? 'hover:bg-white/[0.03]' : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      {/* Rank */}
                      <span className={`w-6 text-center text-xs font-black tabular-nums ${
                        i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-orange-400' : 'text-muted-foreground/40'
                      }`}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${entry.rank}`}
                      </span>

                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-[10px] font-black text-muted-foreground/60 uppercase shrink-0">
                        {entry.name.substring(0, 2)}
                      </div>

                      {/* Name & Tier */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-white truncate">{entry.name}</p>
                        <span className={`text-[8px] font-black uppercase tracking-widest ${tc.text}`}>{entry.tier}</span>
                      </div>

                      {/* Score */}
                      <div className="text-right">
                        <p className="text-sm font-black text-white tabular-nums">{entry.score}</p>
                        <p className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest">IQ</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
