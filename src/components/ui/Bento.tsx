/* Developed by Akash Mani - Premium UI System Components */
'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

// Premium Linear Easing
const premiumEasing = [0.32, 0.72, 0, 1];

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
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3, ease: premiumEasing }}
      className={`relative overflow-hidden rounded-[24px] bg-[#121214] border border-white/[0.04] p-6 flex flex-col group shadow-[0_8px_30px_rgb(0,0,0,0.12)] ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
      
      {(title || Icon) && (
        <div className="relative z-10 flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-10 h-10 bg-white/[0.03] rounded-xl flex items-center justify-center border border-white/[0.04] transition-all group-hover:bg-white/[0.05]">
                <Icon className="w-5 h-5 text-primary/80 group-hover:text-primary transition-colors" />
              </div>
            )}
            <div>
              <h3 className="text-foreground font-semibold text-sm tracking-wide leading-none">{title}</h3>
              {badge && <p className="text-muted-foreground text-[10px] font-medium mt-1 tracking-tight">{badge}</p>}
            </div>
          </div>
        </div>
      )}
      <div className="relative z-10 flex-1">{children}</div>
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
    <div className="flex flex-col items-center gap-3 group cursor-default">
      <div className={`relative ${w} ${h} flex items-center justify-center`}>
        <svg className="w-full h-full -rotate-90" style={{ overflow: 'visible' }}>
          <circle 
            cx="50%" cy="50%" r={r} fill="transparent" stroke="rgba(255,255,255,0.05)" 
            strokeWidth={sw} strokeLinecap="round"
          />
          <motion.circle 
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: premiumEasing }}
            cx="50%" cy="50%" r={r} fill="transparent" stroke={color} 
            strokeWidth={sw} strokeDasharray={circumference} strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${text} font-bold text-foreground leading-none`}>{value}</span>
          <span className={`${labelSize} font-medium text-muted-foreground/60 mt-1`}>{max} total</span>
        </div>
      </div>
      <span className={`${labelSize} font-semibold tracking-wide text-muted-foreground group-hover:text-foreground transition-colors uppercase`}>{label}</span>
    </div>
  );
}
