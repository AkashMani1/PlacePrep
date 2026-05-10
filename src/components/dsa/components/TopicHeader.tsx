'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface TopicHeaderProps {
  topic: string;
  count: number;
  solved?: number;
  variant?: 'topic' | 'subtopic';
  collapsed?: boolean;
  onToggle?: () => void;
}

const TopicHeader = memo(({
  topic,
  count,
  solved = 0,
  variant = 'topic',
  collapsed = false,
  onToggle,
}: TopicHeaderProps) => {
  const isSubtopic = variant === 'subtopic';
  const progress = count ? Math.round((solved / count) * 100) : 0;
  
  const content = (
    <>
      <div className={`${isSubtopic ? 'w-2 h-7 bg-amber-500/80' : 'w-2.5 h-8 bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]'} rounded-full shrink-0`} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className={`${isSubtopic ? 'text-xs tracking-[0.18em]' : 'text-sm tracking-[0.3em]'} font-black text-foreground uppercase`}>
            {topic}
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground/45">
            {solved}/{count} Done
          </span>
        </div>
        {isSubtopic && (
          <div className="mt-2 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-muted/40">
            <div className="h-full rounded-full bg-amber-500/80 transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
      {onToggle && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/10 bg-card/70 text-muted-foreground transition-all hover:bg-muted/50">
          {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </div>
      )}
    </>
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`${isSubtopic ? 'mt-4 mb-2 ml-0 md:ml-4 rounded-2xl border border-border/10 bg-card/55 shadow-sm' : 'mt-6 mb-3 sticky top-0 z-20 rounded-2xl bg-background/90 backdrop-blur-xl'} overflow-hidden`}
    >
      {onToggle ? (
        <button
          onClick={onToggle}
          className={`flex w-full items-center gap-4 px-4 ${isSubtopic ? 'py-3' : 'py-4'} text-left transition-colors hover:bg-muted/20`}
          type="button"
        >
          {content}
        </button>
      ) : (
        <div className="flex items-center gap-4 px-4 py-4">
          {content}
        </div>
      )}
    </motion.div>
  );
});

TopicHeader.displayName = 'TopicHeader';

export default TopicHeader;
