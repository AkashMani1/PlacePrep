import { useApp } from '@/context/AppContext';
import { BentoCard } from './Shared';

export function DSASheetProgressCard() {
  const { state } = useApp();
  const items = (state.dsaSheetItems || []).filter((item) => !item.hidden);
  const total = items.length;
  const solved = items.filter((item) => item.completed).length;
  const easyTotal = items.filter((item) => item.difficulty === 'Easy').length;
  const mediumTotal = items.filter((item) => item.difficulty === 'Medium').length;
  const hardTotal = items.filter((item) => item.difficulty === 'Hard').length;
  const easySolved = items.filter((item) => item.difficulty === 'Easy' && item.completed).length;
  const mediumSolved = items.filter((item) => item.difficulty === 'Medium' && item.completed).length;
  const hardSolved = items.filter((item) => item.difficulty === 'Hard' && item.completed).length;

  const SVG = 140;
  const cx = SVG / 2;
  const cy = SVG / 2;

  const diffRows = [
    { label: 'Easy', color: '#10B981', solved: easySolved, total: easyTotal }, // Emerald
    { label: 'Medium', color: '#F59E0B', solved: mediumSolved, total: mediumTotal }, // Amber
    { label: 'Hard', color: '#EF4444', solved: hardSolved, total: hardTotal }, // Rose
  ];

  const ringDefs = [
    { r: 60, sw: 8, color: '#10B981', solved: easySolved, total: easyTotal },
    { r: 44, sw: 8, color: '#F59E0B', solved: mediumSolved, total: mediumTotal },
    { r: 28, sw: 8, color: '#EF4444', solved: hardSolved, total: hardTotal },
  ];

  return (
    <BentoCard className="col-span-12 lg:col-span-5 !p-0">
      <div className="px-6 pt-5 pb-5 h-full flex flex-col gap-6">
        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground leading-none">Execution Progress</h3>

        <div className="flex flex-col sm:flex-row items-center gap-8 flex-1 mt-2">
          <div className="relative shrink-0 flex items-center justify-center" style={{ width: SVG, height: SVG }}>
            <svg width={SVG} height={SVG} className="-rotate-90" style={{ overflow: 'visible' }}>
              {ringDefs.map((ring) => {
                const circ = 2 * Math.PI * ring.r;
                const prog = ring.total > 0 ? ring.solved / ring.total : 0;
                return (
                  <g key={ring.r}>
                    <circle cx={cx} cy={cy} r={ring.r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={ring.sw} strokeLinecap="round" />
                    <circle cx={cx} cy={cy} r={ring.r} fill="none" stroke={ring.color} strokeWidth={ring.sw} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - prog)} />
                  </g>
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <p className="leading-none flex flex-col gap-0.5">
                <span className="text-[24px] font-black text-foreground tabular-nums">{solved}</span>
                <span className="text-[10px] font-black text-muted-foreground uppercase opacity-40 tracking-widest">Solved</span>
              </p>
            </div>
          </div>

          <div className="w-full flex-1 flex flex-col justify-center gap-5">
            {diffRows.map((row) => (
              <div key={row.label} className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="text-foreground/80 tabular-nums">{row.solved} / {row.total}</span>
                </div>
                <div className="h-2 w-full rounded-full overflow-hidden bg-black/10 dark:bg-white/[0.05] shadow-inner">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${row.total > 0 ? (row.solved / row.total) * 100 : 0}%`, backgroundColor: row.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BentoCard>
  );
}
