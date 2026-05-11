'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Zap, Trophy, Users, X } from 'lucide-react';
import { useMockStore } from '@/store/useMockStore';

const ICONS: Record<string, typeof Bell> = { achievement: Trophy, alert: Zap, social: Users, reminder: Bell };
const COLORS: Record<string, string> = { achievement: 'text-yellow-500', alert: 'text-primary', social: 'text-indigo-500', reminder: 'text-emerald-500' };

export function MockNotifications() {
  const { notifications, submissions, addNotification, dismissNotification } = useMockStore();
  const [visible, setVisible] = useState(true);

  // Generate real notifications based on user activity
  useEffect(() => {
    if (submissions.length > 0) {
      const latest = submissions[submissions.length - 1];
      if (latest && !notifications.find(n => n.text.includes(latest.assessmentId))) {
        addNotification({
          type: 'achievement',
          text: `Assessment completed with ${latest.accuracy.toFixed(0)}% accuracy!`,
          icon: 'Trophy',
          color: 'text-yellow-500',
        });
      }
    }
  }, [submissions.length]);

  const unread = notifications.filter(n => !n.read);
  const latestNotification = unread[0];

  if (!latestNotification || !visible) return null;

  const Icon = ICONS[latestNotification.type] || Bell;
  const color = COLORS[latestNotification.type] || 'text-primary';

  return (
    <div className="fixed bottom-6 right-6 md:bottom-12 md:right-12 z-[50]">
      <AnimatePresence mode="wait">
        <motion.div
          key={latestNotification.id}
          initial={{ opacity: 0, y: 20, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 20, x: 20 }}
          className="flex items-center gap-4 bg-card/60 backdrop-blur-3xl border border-white/10 px-5 py-4 rounded-[24px] md:rounded-[32px] shadow-2xl min-w-[280px] md:min-w-[320px]"
        >
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">
              {latestNotification.type === 'achievement' ? 'Achievement' :
               latestNotification.type === 'alert' ? 'Update' :
               latestNotification.type === 'social' ? 'Social' : 'Reminder'}
            </p>
            <p className="text-xs font-bold text-white tracking-tight leading-snug truncate">{latestNotification.text}</p>
          </div>
          <button
            onClick={() => {
              dismissNotification(latestNotification.id);
              if (unread.length <= 1) setVisible(false);
            }}
            className="p-1 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-all shrink-0"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
