import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Target } from 'lucide-react';
import { useEffect, useState } from 'react';

export const itemVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { 
      duration: 0.6, 
      ease: [0.32, 0.72, 0, 1] // Premium Linear easing
    }
  }
};

const COMMAND_QUOTES = [
  "CONSISTENCY EXECUTED OVER TIME IS THE ULTIMATE ADVANTAGE.",
  "EVERY DSA PROBLEM SOLVED IS A STEP CLOSER TO YOUR DREAM OFFER.",
  "PREPARATION ELIMINATES THE ELEMENT OF SURPRISE IN INTERVIEWS.",
  "ELEVATE YOUR SKILLS BY OPTIMIZING YOUR STUDY HABITS EVERY DAY.",
  "THE BEST CANDIDATES ARE THE ONES WHO OUTWORK THEIR OWN UNCERTAINTY.",
  "SUCCESS IN PLACEMENTS IS A PRODUCT OF FOCUSED, DISCIPLINED EFFORT.",
  "DO NOT WAIT FOR MOTIVATION; RELY ON YOUR DAILY SYSTEMS."
];

export function QuoteCard() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % COMMAND_QUOTES.length);
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col gap-3 py-2 px-1">
      <div className="flex items-center gap-2 mb-1">
        <Target className="w-3.5 h-3.5 text-primary opacity-50" />
        <span className="text-[10px] font-medium tracking-wide text-muted-foreground opacity-60">Daily Motivation</span>
      </div>
      <div className="relative min-h-[45px] flex items-center">
        <div className="absolute -left-2 top-0 w-[2px] h-full bg-gradient-to-b from-primary/50 to-transparent rounded-full" />
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 0.9, x: 0 }}
            exit={{ opacity: 0, x: 5 }}
            transition={{ duration: 0.8 }}
            className="text-[12px] font-medium text-foreground leading-[1.5] italic tracking-tight"
          >
            "{COMMAND_QUOTES[index]}"
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

export function BentoCard({ children, className = '', title = '', icon: Icon, badge = '', delay = 0 }: { children: React.ReactNode; className?: string; title?: string; icon?: any; badge?: string; delay?: number }) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -2, transition: { duration: 0.3 } }}
      className={`relative overflow-hidden rounded-[24px] bg-[#121214] border border-white/[0.04] p-6 flex flex-col group shadow-[0_8px_30px_rgb(0,0,0,0.12)] ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
      <div className="relative z-10 flex flex-col h-full">
        {(title || Icon) && (
          <div className={`flex items-center justify-between ${badge ? 'mb-8' : 'mb-6'}`}>
            <div className="flex items-center gap-4">
              {Icon && (
                <div className="w-10 h-10 bg-white/[0.03] rounded-xl flex items-center justify-center border border-white/[0.04] transition-all group-hover:bg-white/[0.05]">
                  <Icon className="w-5 h-5 text-primary/80 group-hover:text-primary transition-colors" />
                </div>
              )}
              <div>
                <h3 className="text-foreground font-semibold text-sm tracking-wide leading-none mb-1">{title}</h3>
                {badge && <p className="text-muted-foreground text-[10px] font-medium tracking-tight">{badge}</p>}
              </div>
            </div>
          </div>
        )}
        <div className="flex-1">{children}</div>
      </div>
    </motion.div>
  );
}
