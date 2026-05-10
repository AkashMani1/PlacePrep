import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { getStreakStatus, getHoursUntilMidnight } from '@/lib/utils';

export function StreakPill() {
  const { state } = useApp();
  const status = getStreakStatus(state.dailyLogs);
  const [timeLeft, setTimeLeft] = useState(getHoursUntilMidnight());

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getHoursUntilMidnight()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (status === 'None') return null;

  const isProtected = status === 'Protected';

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-semibold shrink-0 transition-all ${
        isProtected
          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
          : 'bg-rose-500/10 border-rose-500/20 text-rose-500 animate-pulse'
        }`}
    >
      {isProtected
        ? <ShieldCheck className="w-3.5 h-3.5" />
        : <AlertTriangle className="w-3.5 h-3.5" />
      }
      <span className="tracking-wide">
        {isProtected ? 'Secured' : 'At Risk'}
      </span>
      {!isProtected && (
        <span className="opacity-80 tabular-nums">{timeLeft}</span>
      )}
    </div>
  );
}

export function StreakGuard() {
  const { state } = useApp();
  const status = getStreakStatus(state.dailyLogs);
  const [timeLeft, setTimeLeft] = useState(getHoursUntilMidnight());

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getHoursUntilMidnight()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (status === 'None') return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-5 rounded-[24px] border flex items-center justify-between transition-all ${
        status === 'Protected' 
          ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-500' 
          : 'bg-rose-500/5 border-rose-500/10 text-rose-500'
        }`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-2xl ${
          status === 'Protected' 
            ? 'bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
            : 'bg-rose-500/10 animate-pulse'
        }`}>
          {status === 'Protected' ? <ShieldCheck className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
        </div>
        <div>
          <p className="text-[10px] font-semibold tracking-wider opacity-80 mb-0.5">Focus Shield</p>
          <p className="text-md font-bold tracking-tight">{status === 'Protected' ? 'STREAK SECURED' : 'STREAK AT RISK'}</p>
        </div>
      </div>
      {status === 'At Risk' && (
        <div className="text-right">
          <p className="text-[10px] font-semibold tracking-wider opacity-60 mb-0.5">Expiring In</p>
          <p className="text-sm font-bold tabular-nums">{timeLeft}</p>
        </div>
      )}
    </motion.div>
  );
}
