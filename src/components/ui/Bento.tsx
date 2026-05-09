/* Developed by Akash Mani - This site is developed by Akash Mani. Original watermark of Akash Mani. */
'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

// ── Bento Card ─────────────────────────────────────────────────────────────

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  icon?: any;
  badge?: string;
}

export function BentoCard({ children, className = '', title = '', icon: Icon, badge = '' }: BentoCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className={`bento-card p-6 flex flex-col ${className}`}
    >
      {(title || Icon) && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-10 h-10 bg-muted/50 rounded-xl flex items-center justify-center border border-border/20">
                <Icon className="w-5 h-5 text-primary" />
              </div>
            )}
            <div>
              <h3 className="text-foreground font-black text-sm uppercase tracking-widest leading-none">{title}</h3>
              {badge && <p className="text-muted-foreground text-[10px] font-bold mt-1 uppercase tracking-tighter">{badge}</p>}
            </div>
          </div>
        </div>
      )}
      <div className="flex-1">{children}</div>
    </motion.div>
  );
}

// ── Activity Ring ────────────────────────────────────────────────────────────

interface ActivityRingProps {
  value: number;
  max: number;
  color: string;
  label: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ActivityRing({ value, max, color, label, size = 'md' }: ActivityRingProps) {
  const sizes = {
    sm: { w: 'w-16', h: 'h-16', r: 24, sw: 6, text: 'text-sm', label: 'text-[8px]' },
    md: { w: 'w-24', h: 'h-24', r: 36, sw: 8, text: 'text-xl', label: 'text-[9px]' },
    lg: { w: 'w-32', h: 'h-32', r: 48, sw: 10, text: 'text-2xl', label: 'text-[10px]' }
  };
  
  const { w, h, r, sw, text, label: labelSize } = sizes[size];
  const circumference = 2 * Math.PI * r;
  const safeValue = Number.isFinite(value) ? value : 0;
  const safeMax = Number.isFinite(max) && max > 0 ? max : 1;
  const progress = Math.min(Math.max(safeValue / safeMax, 0), 1);
  const offset = circumference - progress * circumference;

  return (
    <div className="flex flex-col items-center gap-2 group cursor-default">
      <div className={`relative ${w} ${h} flex items-center justify-center`}>
        <svg className="w-full h-full -rotate-90">
          <circle 
            cx="50%" cy="50%" r={r} fill="transparent" stroke="currentColor" 
            strokeWidth={sw} className="text-muted/20" 
          />
          <motion.circle 
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            cx="50%" cy="50%" r={r} fill="transparent" stroke={color} 
            strokeWidth={sw} strokeDasharray={circumference} strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${text} font-black text-foreground leading-none`}>{value}</span>
          <span className={`${labelSize} font-bold text-muted-foreground uppercase tracking-tighter decoration-muted-foreground/30 underline underline-offset-2 decoration-2`}>{max} max</span>
        </div>
      </div>
      <span className={`${labelSize} font-black uppercase tracking-[0.2em] text-muted-foreground group-hover:text-foreground transition-colors`}>{label}</span>
    </div>
  );
}
