import { startTransition, useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { today, toDateStr } from '@/lib/utils';
import { itemVariants } from './Shared';

type DashboardDailyLog = {
  date: string;
  completedHabits?: string[];
  problemsSolved?: { easy: number; medium: number; hard: number };
};

function getDailySubmissionCount(log: DashboardDailyLog) {
  const solved = log.problemsSolved;
  const solvedCount = solved ? (solved.easy || 0) + (solved.medium || 0) + (solved.hard || 0) : 0;
  return solvedCount > 0 ? solvedCount : log.completedHabits?.length || 0;
}

function getLeetCodeHeatColor(count: number, isToday: boolean) {
  if (count === 0) return `bg-white/[0.03] border-white/[0.05] ${isToday ? 'ring-1 ring-primary/40' : ''}`;
  if (count <= 2) return `bg-primary/30 border-primary/40 ${isToday ? 'ring-1 ring-primary/60' : ''}`;
  if (count <= 4) return `bg-primary/50 border-primary/60 ${isToday ? 'ring-1 ring-primary/80' : ''}`;
  if (count <= 7) return `bg-primary/80 border-primary/90 ${isToday ? 'ring-1 ring-white/50' : ''}`;
  return `bg-primary border-primary shadow-[0_0_12px_rgba(var(--primary-rgb),0.6)] ${isToday ? 'ring-1 ring-white/80' : ''}`;
}

interface HeatCell { date: Date; key: string; count: number; isToday: boolean; }
interface MonthGroup { name: string; short: string; weeks: (HeatCell | null)[][]; }

function buildMonthlyGroups(logs: DashboardDailyLog[], year: number): MonthGroup[] {
  const logMap = new Map(logs.map((log) => [log.date, getDailySubmissionCount(log)]));
  const todayStr = today();

  return Array.from({ length: 12 }, (_, m) => {
    const firstDay = new Date(year, m, 1);
    const daysInMonth = new Date(year, m + 1, 0).getDate();
    const startDow = (firstDay.getDay() + 6) % 7;
    const numWeeks = Math.ceil((startDow + daysInMonth) / 7);

    const weeks: (HeatCell | null)[][] = Array.from({ length: numWeeks }, () =>
      Array<HeatCell | null>(7).fill(null)
    );

    for (let d = 0; d < daysInMonth; d++) {
      const ci = startDow + d;
      const w = Math.floor(ci / 7);
      const dow = ci % 7;
      const date = new Date(year, m, d + 1);
      const key = toDateStr(date);
      weeks[w][dow] = { date, key, count: logMap.get(key) ?? 0, isToday: key === todayStr };
    }

    return {
      name: firstDay.toLocaleString('default', { month: 'long' }),
      short: firstDay.toLocaleString('default', { month: 'short' }),
      weeks,
    };
  });
}

export function DeploymentLogPanel() {
  const { state } = useApp();
  const dailyLogs = state.dailyLogs as DashboardDailyLog[];
  const currentYear = new Date().getFullYear();

  const [selectedYear, setSelectedYear] = useState(() => currentYear);
  const canGoNext = selectedYear < currentYear;

  const [tooltip, setTooltip] = useState<{ count: number; date: Date; x: number; y: number } | null>(null);

  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement>, cell: HeatCell) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ count: cell.count, date: cell.date, x: rect.left + rect.width / 2, y: rect.top });
  }, []);
  const handleMouseLeave = useCallback(() => setTooltip(null), []);

  const logsForYear = useMemo(() => dailyLogs.filter((log) => new Date(log.date).getFullYear() === selectedYear), [dailyLogs, selectedYear]);
  const totalSubmissions = useMemo(() => logsForYear.reduce((sum, log) => sum + getDailySubmissionCount(log), 0), [logsForYear]);
  const totalActiveDays = useMemo(() => logsForYear.filter((log) => getDailySubmissionCount(log) > 0).length, [logsForYear]);
  
  const maxStreak = useMemo(() => logsForYear.reduce((acc, log) => {
    const hasActivity = getDailySubmissionCount(log) > 0;
    const current = hasActivity ? acc.current + 1 : 0;
    return { current, best: Math.max(acc.best, current) };
  }, { current: 0, best: 0 }).best, [logsForYear]);

  const monthGroups = useMemo(() => buildMonthlyGroups(logsForYear, selectedYear), [logsForYear, selectedYear]);

  return (
    <motion.div variants={itemVariants} className="col-span-12 rounded-[24px] border border-white/[0.04] bg-[#121214] px-6 py-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-baseline gap-3">
            <h3 className="text-sm font-semibold tracking-wide text-foreground">Activity Log</h3>
            <p className="text-xs font-medium text-muted-foreground">{totalSubmissions} contributions in {selectedYear}</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
            <p>Active days: <span className="font-semibold text-foreground/90">{totalActiveDays}</span></p>
            <p>Max streak: <span className="font-semibold text-foreground/90">{maxStreak}</span></p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={() => startTransition(() => setSelectedYear((y) => y - 1))} className="w-7 h-7 flex items-center justify-center rounded-full border border-white/[0.06] text-muted-foreground hover:text-foreground hover:bg-white/[0.02] transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1 text-xs font-semibold text-foreground">
            {selectedYear}
          </div>
          <button onClick={() => canGoNext && startTransition(() => setSelectedYear((y) => y + 1))} disabled={!canGoNext} className="w-7 h-7 flex items-center justify-center rounded-full border border-white/[0.06] text-muted-foreground hover:text-foreground hover:bg-white/[0.02] transition-colors disabled:opacity-30">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto pb-2 scrollbar-hide" style={{ overflowY: 'visible' }}>
        <div className="flex w-full justify-between gap-1.5 min-w-max">
          {monthGroups.map((month) => (
            <div key={month.name} className="flex flex-col gap-1.5">
              <span className="text-[10px] font-medium text-muted-foreground/60 tracking-wide">{month.short}</span>
              <div className="flex gap-[4px]">
                {month.weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-[4px]">
                    {week.map((cell, di) => cell ? (
                      <motion.div
                        key={cell.key}
                        whileHover={{ scale: 1.4, zIndex: 20 }}
                        onMouseEnter={(e) => handleMouseEnter(e, cell)}
                        onMouseLeave={handleMouseLeave}
                        className={`h-[12px] w-[12px] rounded-sm border cursor-default transition-all duration-150 ${getLeetCodeHeatColor(cell.count, cell.isToday)}`}
                      />
                    ) : (
                      <div key={`pad-${wi}-${di}`} className="h-[12px] w-[12px]" />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed z-[999] whitespace-nowrap rounded-lg border border-white/[0.1] bg-[#1E1E20] px-3 py-1.5 text-[11px] text-foreground shadow-xl"
            style={{ left: Math.min(Math.max(tooltip.x, 80), typeof window !== 'undefined' ? window.innerWidth - 160 : tooltip.x), top: tooltip.y - 40, transform: 'translateX(-50%)' }}
          >
            <span className="font-semibold">{tooltip.count} submissions</span>
            <span className="mx-2 text-muted-foreground/30">|</span>
            <span className="text-muted-foreground font-medium">
              {tooltip.date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
