'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Zap, Trophy, Users } from 'lucide-react';

const NOTIFICATIONS = [
  { id: 1, type: 'achievement', text: 'Sarah Chen just hit a 12-day streak!', icon: Trophy, color: 'text-yellow-500' },
  { id: 2, type: 'alert', text: 'Amazon OA Simulator updated with 2026 trends.', icon: Zap, color: 'text-primary' },
  { id: 3, type: 'social', text: 'Rahul S. invited you to a Mock Squad.', icon: Users, color: 'text-indigo-500' },
];

export function MockNotifications() {
  const [current, setCurrent] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setShow(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % NOTIFICATIONS.length);
        setShow(true);
      }, 500);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const n = NOTIFICATIONS[current];

  return (
    <div className="fixed bottom-12 right-12 z-[50]">
      <AnimatePresence mode="wait">
        {show && (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: 20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 20, x: 20 }}
            className="flex items-center gap-4 bg-card/40 backdrop-blur-3xl border border-white/10 px-6 py-4 rounded-[32px] shadow-2xl min-w-[320px]"
          >
            <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center`}>
              <n.icon className={`w-5 h-5 ${n.color}`} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Global Intel</p>
              <p className="text-xs font-bold text-white tracking-tight leading-snug">{n.text}</p>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
