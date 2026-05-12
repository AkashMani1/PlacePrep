'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Globe, Target, Users, Clock, ChevronRight,
  TrendingUp, Activity, Zap, ShieldCheck, BarChart3
} from 'lucide-react';
import { useMockStore } from '@/store/useMockStore';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const MODULES = [
  {
    id: 'arena',
    title: 'Live Interview Arena',
    desc: 'Real-time P2P interviews with WebRTC video, shared Monaco editor, and collaborative whiteboard.',
    icon: Globe,
    href: '/mockhub/arena',
    color: 'from-sky-500/10 to-blue-600/10',
    border: 'border-sky-500/20',
    iconColor: 'text-sky-400',
    tag: 'LIVE',
    tagColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  },
  {
    id: 'assessment',
    title: 'Assessment Engine',
    desc: 'Full-screen proctored aptitude tests modeled after TCS NQT, Infosys, Amazon, and Accenture.',
    icon: Target,
    href: '/mockhub/assessment',
    color: 'from-primary/10 to-indigo-600/10',
    border: 'border-primary/20',
    iconColor: 'text-primary',
    tag: 'PROCTORED',
    tagColor: 'bg-primary/10 text-primary border-primary/20',
  },
  {
    id: 'leaderboard',
    title: 'Global Leaderboard',
    desc: 'Server-authoritative global and peer rankings. Track Mock IQ, accuracy streaks, and tier progression.',
    icon: Users,
    href: '/mockhub/leaderboard',
    color: 'from-amber-500/10 to-yellow-500/10',
    border: 'border-amber-500/20',
    iconColor: 'text-amber-400',
    tag: 'GLOBAL',
    tagColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  {
    id: 'history',
    title: 'Interview History',
    desc: 'Detailed execution logs, AI debrief analysis, and accuracy trends from all past sessions.',
    icon: Clock,
    href: '/mockhub/interview/history',
    color: 'from-emerald-500/10 to-teal-600/10',
    border: 'border-emerald-500/20',
    iconColor: 'text-emerald-400',
    tag: 'ARCHIVE',
    tagColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
];

export default function MockHubView() {
  const router = useRouter();
  const { user } = useAuth();
  const { availableRooms, submissions, analytics, fetchRooms } = useMockStore();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const metrics = [
    { label: 'Readiness', value: `${analytics?.readinessScore ?? 0}%`, icon: ShieldCheck, color: 'text-primary' },
    { label: 'Avg Accuracy', value: `${analytics?.avgAccuracy?.toFixed(0) ?? 0}%`, icon: BarChart3, color: 'text-emerald-400' },
    { label: 'Sessions', value: `${submissions.length}`, icon: Activity, color: 'text-amber-400' },
    { label: 'Streak', value: `${analytics?.streak ?? 0}d`, icon: Zap, color: 'text-sky-400' },
  ];

  return (
    <div className="space-y-10 pb-16">
      
      {/* ── Status Bar ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
        <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        {isOnline ? 'Systems Operational' : 'Offline Mode'}
        <span className="mx-2 opacity-30">•</span>
        <span>{availableRooms.length} Active Rooms</span>
        <span className="mx-2 opacity-30">•</span>
        <span>{submissions.length} Assessments Completed</span>
      </div>

      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
          className="lg:col-span-3 relative overflow-hidden rounded-[28px] border border-white/8 bg-gradient-to-br from-card/60 to-card/30 backdrop-blur-xl p-8 md:p-10"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-transparent pointer-events-none" />
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary/6 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 space-y-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-3">Interview Command Center</p>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-[1.15]">
                Train Like It's<br />the Real Thing.
              </h1>
              <p className="mt-4 text-sm text-muted-foreground/80 font-medium leading-relaxed max-w-sm">
                A production-grade interview simulation platform built for serious placement preparation. Every session is real. Every result is server-validated.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => router.push('/mockhub/arena')}
                className="group flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-primary text-white text-xs font-black uppercase tracking-[0.15em] hover:bg-primary/90 active:scale-95 transition-all duration-200 shadow-lg shadow-primary/20"
              >
                <Globe className="w-3.5 h-3.5" />
                Join Live Arena
              </button>
              <button
                onClick={() => router.push('/mockhub/assessment')}
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-[0.15em] hover:bg-white/10 active:scale-95 transition-all duration-200"
              >
                <Target className="w-3.5 h-3.5 text-primary" />
                Take Assessment
              </button>
            </div>
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
          className="lg:col-span-2 grid grid-cols-2 gap-3"
        >
          {metrics.map((m, i) => (
            <div
              key={m.label}
              className="flex flex-col justify-between rounded-[20px] border border-white/8 bg-card/40 backdrop-blur-xl p-5 hover:bg-white/5 transition-colors"
            >
              <m.icon className={`w-4 h-4 ${m.color} mb-3`} />
              <div>
                <p className={`text-2xl font-black tabular-nums ${m.color}`}>{m.value}</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 mt-1">{m.label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Module Navigation ─────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Application Modules</p>
          <div className="h-px flex-1 mx-4 bg-white/5" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MODULES.map((mod, i) => (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06, ease: [0.32, 0.72, 0, 1] }}
              onClick={() => router.push(mod.href)}
              className={`group relative flex items-start gap-5 p-6 rounded-[22px] border ${mod.border} bg-gradient-to-br ${mod.color} cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all duration-200`}
            >
              <div className={`w-11 h-11 rounded-2xl bg-black/30 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                <mod.icon className={`w-5 h-5 ${mod.iconColor}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="text-sm font-black text-white tracking-tight">{mod.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-widest ${mod.tagColor}`}>
                    {mod.tag}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground/70 font-medium leading-relaxed line-clamp-2">
                  {mod.desc}
                </p>
              </div>

              <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0 mt-1 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Quick Stats Bar ───────────────────────────────────────────── */}
      {submissions.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5"
        >
          <TrendingUp className="w-4 h-4 text-primary shrink-0" />
          <p className="text-xs text-muted-foreground/70 font-medium">
            {analytics?.avgAccuracy >= 80
              ? `Strong performance — ${analytics.avgAccuracy.toFixed(0)}% average accuracy across ${submissions.length} assessments. Ready for advanced challenges.`
              : analytics?.avgAccuracy >= 60
              ? `Making progress — ${analytics?.avgAccuracy?.toFixed(0) ?? 0}% average accuracy. Focus on your weak topics to reach 80%+.`
              : `Getting started — complete more assessments to improve your accuracy and unlock leaderboard rankings.`
            }
          </p>
          <button
            onClick={() => router.push('/mockhub/recommendations/roadmap')}
            className="ml-auto text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors shrink-0"
          >
            View Roadmap →
          </button>
        </motion.div>
      )}
    </div>
  );
}
