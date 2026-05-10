'use client';

import { motion } from 'framer-motion';
import { Trophy, Users, Flame, Target, ChevronRight, Star, Shield } from 'lucide-react';
import { BentoCard } from '@/components/ui/Bento';

const LEADERBOARD = [
  { rank: 1, name: 'Akash Mani', score: 2840, streak: 12, tier: 'Diamond' },
  { rank: 2, name: 'Sarah Chen', score: 2650, streak: 8, tier: 'Platinum' },
  { rank: 3, name: 'Rahul Sharma', score: 2420, streak: 15, tier: 'Platinum' },
  { rank: 4, name: 'You', score: 2100, streak: 4, tier: 'Gold' },
];

export function MockSocial() {
  return (
    <div className="grid grid-cols-12 gap-8 mt-20">
      {/* ── Global Leaderboard ────────────────────────────────────────── */}
      <div className="col-span-12 lg:col-span-8 space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-foreground">Global Hall of Fame</h2>
          </div>
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            Elite League • Week 14
          </span>
        </div>

        <div className="rounded-[48px] border border-white/5 bg-card/30 backdrop-blur-3xl overflow-hidden shadow-2xl">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="border-b border-white/5">
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rank</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Candidate</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Streak</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Mock IQ</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">League</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                 {LEADERBOARD.map((user) => (
                    <motion.tr 
                      key={user.name}
                      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                      className={`group transition-all ${user.name === 'You' ? 'bg-primary/5' : ''}`}
                    >
                       <td className="px-10 py-8">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                             user.rank === 1 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                             user.rank === 2 ? 'bg-slate-400/20 text-slate-400 border border-slate-400/30' :
                             user.rank === 3 ? 'bg-amber-700/20 text-amber-700 border border-amber-700/30' :
                             'text-muted-foreground'
                          }`}>
                             {user.rank}
                          </div>
                       </td>
                       <td className="px-10 py-8">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-indigo-500/20 border border-white/10" />
                             <span className={`font-black tracking-tight ${user.name === 'You' ? 'text-primary' : 'text-foreground'}`}>
                                {user.name}
                             </span>
                          </div>
                       </td>
                       <td className="px-10 py-8">
                          <div className="flex items-center justify-center gap-2">
                             <Flame className={`w-4 h-4 ${user.streak > 10 ? 'text-orange-500 animate-pulse' : 'text-orange-500/40'}`} />
                             <span className="text-sm font-black tabular-nums text-white">{user.streak}</span>
                          </div>
                       </td>
                       <td className="px-10 py-8 text-center font-black tabular-nums text-white">
                          {user.score}
                       </td>
                       <td className="px-10 py-8 text-right">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                             user.tier === 'Diamond' ? 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.1)]' :
                             user.tier === 'Platinum' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' :
                             'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          }`}>
                             {user.tier}
                          </span>
                       </td>
                    </motion.tr>
                 ))}
              </tbody>
           </table>
        </div>
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
              <div className="p-6 rounded-3xl bg-primary/5 border border-primary/20 relative overflow-hidden group">
                 <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-black text-white tracking-tight">Code Ninjas elite</h4>
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center">
                       <Shield className="w-4 h-4" />
                    </div>
                 </div>
                 <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-6">Ranked #14 Globally</p>
                 <div className="flex -space-x-3 mb-6">
                    {[1, 2, 3, 4, 5].map(i => (
                       <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-card flex items-center justify-center font-black text-[10px] text-primary">
                          {i === 5 ? '+8' : 'AM'}
                       </div>
                    ))}
                 </div>
                 <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                    Enter War Room
                 </button>
              </div>
           </div>

           <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nearby Friends</h3>
                 <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest animate-pulse">8 Online</span>
              </div>
              <div className="space-y-4">
                 {[
                    { name: 'Rahul S.', status: 'Coding Amazon OA', online: true },
                    { name: 'Priya K.', status: 'Idle', online: true },
                    { name: 'John Doe', status: 'In Mock Interview', online: false },
                 ].map(friend => (
                    <div key={friend.name} className="flex items-center justify-between group cursor-pointer">
                       <div className="flex items-center gap-4">
                          <div className="relative">
                             <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-xs text-muted-foreground group-hover:text-primary group-hover:border-primary/40 transition-all">
                                {friend.name[0]}
                             </div>
                             {friend.online && <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" />}
                          </div>
                          <div>
                             <p className="text-xs font-black text-white">{friend.name}</p>
                             <p className="text-[9px] font-medium text-muted-foreground truncate w-32">{friend.status}</p>
                          </div>
                       </div>
                       <div className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-all">
                          <ChevronRight className="w-4 h-4" />
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </BentoCard>
      </div>
    </div>
  );
}
