'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Milestone, Target, ShieldAlert, CheckCircle2, Zap, ArrowRight, BrainCircuit, Activity } from 'lucide-react';
import { useMockStore } from '@/store/useMockStore';
import { useRouter } from 'next/navigation';

export default function RoadmapPage() {
  const router = useRouter();
  const { analytics, submissions } = useMockStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const hasData = submissions.length > 0;
  const readiness = analytics?.readinessScore ?? 0;
  
  // Weak & Strong topics (limiting to top 3 for UI)
  const weakTopics = (analytics?.weakTopics ?? []).slice(0, 3);
  const strongTopics = (analytics?.strongTopics ?? []).slice(0, 3);

  const getStatusColor = (status: string) => {
    if (status === 'completed') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (status === 'current') return 'bg-primary/20 text-primary border-primary/30';
    return 'bg-white/5 text-muted-foreground border-white/10';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'completed') return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
    if (status === 'current') return <Zap className="w-5 h-5 text-primary" />;
    return <Target className="w-5 h-5 text-muted-foreground" />;
  };

  const phases = [
    {
      id: 1,
      title: 'Foundation & Core Skills',
      status: readiness >= 40 ? 'completed' : 'current',
      desc: 'Master the basics of DSA and core computer science subjects.',
      action: 'Take Aptitude Assessment',
      href: '/mockhub/assessment'
    },
    {
      id: 2,
      title: 'Weakness Remediation',
      status: readiness >= 70 ? 'completed' : (readiness >= 40 ? 'current' : 'locked'),
      desc: 'Targeted practice on areas where accuracy is below 60%.',
      action: 'Practice Weak Topics',
      href: '/mockhub/assessment'
    },
    {
      id: 3,
      title: 'Live Interview Simulation',
      status: readiness >= 85 ? 'completed' : (readiness >= 70 ? 'current' : 'locked'),
      desc: 'Peer-to-peer mock interviews to build pressure tolerance.',
      action: 'Join Live Arena',
      href: '/mockhub/arena'
    },
    {
      id: 4,
      title: 'Placement Ready',
      status: readiness >= 95 ? 'completed' : (readiness >= 85 ? 'current' : 'locked'),
      desc: 'Consistent 85%+ accuracy across all domains.',
      action: 'View Leaderboard',
      href: '/mockhub/leaderboard'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24">
      {/* ── Hero / Readiness Score ────────────────────────────────────────────── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-card/80 to-card/30 p-10 md:p-14 text-center backdrop-blur-xl"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
            <BrainCircuit className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Personalized Prep Roadmap
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg mb-10">
            {hasData 
              ? `Your placement readiness score is currently ${readiness}%. Follow this dynamic path to reach top-tier employer benchmarks.`
              : 'Complete your first assessment to unlock personalized recommendations and your placement trajectory.'}
          </p>

          <div className="flex items-center gap-6 p-5 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-md">
            <div className="text-center px-4">
              <p className="text-3xl font-black text-white">{readiness}%</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-1">Readiness</p>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="text-center px-4">
              <p className="text-3xl font-black text-white">{analytics?.avgAccuracy?.toFixed(0) ?? 0}%</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-1">Avg Accuracy</p>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="text-center px-4">
              <p className="text-3xl font-black text-white">{analytics?.streak ?? 0}d</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-1">Streak</p>
            </div>
          </div>
        </div>
      </motion.div>

      {hasData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weak Topics */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-8 rounded-[24px] border border-rose-500/20 bg-gradient-to-br from-rose-500/5 to-transparent backdrop-blur-md"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white">Critical Focus Areas</h2>
            </div>
            
            {weakTopics.length > 0 ? (
              <ul className="space-y-3">
                {weakTopics.map((topic) => (
                  <li key={topic} className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5">
                    <span className="font-medium text-rose-200">{topic}</span>
                    <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-1 rounded-md">Needs Practice</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No critical weaknesses identified yet. Keep going!</p>
            )}
          </motion.div>

          {/* Strong Topics */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-8 rounded-[24px] border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent backdrop-blur-md"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Activity className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white">Mastered Topics</h2>
            </div>
            
            {strongTopics.length > 0 ? (
              <ul className="space-y-3">
                {strongTopics.map((topic) => (
                  <li key={topic} className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5">
                    <span className="font-medium text-emerald-200">{topic}</span>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">Mastered</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Complete more assessments to discover your strengths.</p>
            )}
          </motion.div>
        </div>
      )}

      {/* ── Timeline ───────────────────────────────────────────────────────── */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative pt-10"
      >
        <div className="absolute left-[39px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent -translate-x-1/2" />
        
        <div className="space-y-12">
          {phases.map((phase, index) => {
            const isLeft = index % 2 === 0;
            return (
              <motion.div key={phase.id} variants={itemVariants} className="relative flex items-center md:justify-between w-full">
                
                {/* Timeline Node */}
                <div className="absolute left-[39px] md:left-1/2 -translate-x-1/2 w-10 h-10 rounded-full border-4 border-[#09090b] flex items-center justify-center z-10 bg-[#09090b]">
                  <div className={`w-full h-full rounded-full flex items-center justify-center border ${getStatusColor(phase.status)}`}>
                    {getStatusIcon(phase.status)}
                  </div>
                </div>

                {/* Content Card */}
                <div className={`w-full pl-24 md:pl-0 md:w-[calc(50%-40px)] ${isLeft ? 'md:pr-10 md:text-right' : 'md:pl-10 md:ml-auto md:text-left'}`}>
                  <div className={`p-6 rounded-[24px] border transition-all duration-300 ${
                    phase.status === 'current' ? 'bg-primary/5 border-primary/20 shadow-[0_0_30px_-10px_rgba(56,189,248,0.15)]' : 'bg-card/40 border-white/5 hover:bg-white/5'
                  } backdrop-blur-xl group`}>
                    
                    <div className={`text-[10px] font-black uppercase tracking-widest mb-2 ${
                      phase.status === 'completed' ? 'text-emerald-400' :
                      phase.status === 'current' ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                      Phase {phase.id} • {phase.status}
                    </div>
                    
                    <h3 className={`text-xl font-bold mb-2 ${phase.status === 'locked' ? 'text-muted-foreground/50' : 'text-white'}`}>
                      {phase.title}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                      {phase.desc}
                    </p>

                    {phase.status !== 'locked' && (
                      <button
                        onClick={() => router.push(phase.href)}
                        className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                          phase.status === 'current' ? 'text-primary hover:text-primary/80' : 'text-white/60 hover:text-white'
                        }`}
                      >
                        {phase.action}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

    </div>
  );
}
