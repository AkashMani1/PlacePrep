'use client';

/* Developed by Akash Mani - Achievement Badge Vault */

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import {
  Flame, Zap, Code2, Target, Trophy, GitBranch, Layers, Brain,
  Activity, Video, ShieldCheck, Award, FlaskConical, Rocket,
  RotateCcw, Star, Lock,
} from 'lucide-react';
import { useBadges } from '@/hooks/useBadges';
import { Badge, BadgeTier } from '@/lib/types';

const smoothSpring = { type: 'spring', stiffness: 100, damping: 20 } as any;

// Map icon string names to Lucide components
const ICON_MAP: Record<string, React.ElementType> = {
  Flame, Zap, Code2, Target, Trophy, GitBranch, Layers, Brain,
  Activity, Video, ShieldCheck, Award, FlaskConical, Rocket,
  RotateCcw, Star,
};

const TIER_CONFIG: Record<BadgeTier, { label: string; ringColor: string; textColor: string }> = {
  bronze:   { label: '🥉', ringColor: 'ring-orange-500/30',  textColor: 'text-orange-400' },
  silver:   { label: '🥈', ringColor: 'ring-slate-400/30',   textColor: 'text-slate-300' },
  gold:     { label: '🥇', ringColor: 'ring-yellow-500/30',  textColor: 'text-yellow-400' },
  platinum: { label: '✦',  ringColor: 'ring-amber-300/50',   textColor: 'text-amber-300' },
};

function BadgeCard({ badge, earned, index }: { badge: Badge; earned: boolean; index: number }) {
  const IconComponent = ICON_MAP[badge.icon] ?? Star;
  const tierCfg = TIER_CONFIG[badge.tier];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...smoothSpring, delay: index * 0.03 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`relative p-5 rounded-[24px] border flex flex-col items-center gap-3 text-center transition-all duration-300 shadow-lg group cursor-default ${
        earned
          ? 'bg-card/80 border-border/40 hover:border-white/20 backdrop-blur'
          : 'bg-card/20 border-border/10 opacity-50 grayscale'
      }`}
    >
      {/* Tier indicator */}
      <span className={`absolute top-3 right-3 text-xs font-black ${tierCfg.textColor}`}>
        {tierCfg.label}
      </span>

      {/* Icon container */}
      <div
        className={`relative w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ring-2 ${tierCfg.ringColor} ${
          earned
            ? `bg-gradient-to-br ${badge.color} shadow-lg`
            : 'bg-muted/20 border border-border/20'
        }`}
      >
        {earned ? (
          <IconComponent className="w-7 h-7 text-white drop-shadow" />
        ) : (
          <Lock className="w-5 h-5 text-muted-foreground/40" />
        )}
        {/* Earned glow effect */}
        {earned && (
          <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${badge.color} blur-xl opacity-30 -z-10 group-hover:opacity-60 transition-opacity`} />
        )}
      </div>

      {/* Text */}
      <div className="flex flex-col gap-1">
        <p className={`text-xs font-black uppercase tracking-tight leading-tight ${earned ? 'text-foreground' : 'text-muted-foreground/40'}`}>
          {badge.name}
        </p>
        <p className={`text-[10px] font-medium leading-relaxed ${earned ? 'text-muted-foreground/70' : 'text-muted-foreground/30'}`}>
          {badge.description}
        </p>
      </div>

      {/* Earned indicator */}
      {earned && (
        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-widest">
          Earned
        </span>
      )}
    </motion.div>
  );
}

export const BadgeVault = memo(function BadgeVault() {
  const { allBadges, earnedCount, totalCount } = useBadges();
  const progressPct = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  return (
    <div className="relative overflow-hidden rounded-[40px] border border-border/30 bg-card/60 backdrop-blur-2xl shadow-2xl p-8">
      {/* Subtle top line */}
      <div className="absolute top-0 left-[20%] w-[60%] h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="relative z-10 flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <h3 className="text-foreground font-black text-base uppercase tracking-tight">
                Achievement Vault
              </h3>
              <p className="text-muted-foreground text-xs font-medium mt-0.5">
                {earnedCount} of {totalCount} badges unlocked
              </p>
            </div>
          </div>

          {/* Progress pill */}
          <div className="flex items-center gap-3 px-5 py-2.5 bg-black/5 dark:bg-white/5 rounded-2xl border border-white/5">
            <div className="h-1.5 w-24 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1.2, ease: [0.32, 0.72, 0, 1] }}
                className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full"
              />
            </div>
            <span className="text-[11px] font-black text-yellow-500 tabular-nums">{progressPct}%</span>
          </div>
        </div>

        {/* Badge Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {allBadges
            .sort((a, b) => (b.earned ? 1 : 0) - (a.earned ? 1 : 0)) // Earned first
            .map(({ badge, earned }, i) => (
              <BadgeCard key={badge.id} badge={badge} earned={earned} index={i} />
            ))}
        </div>
      </div>
    </div>
  );
});
