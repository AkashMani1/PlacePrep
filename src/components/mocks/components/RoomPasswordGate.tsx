'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, Shield, Copy, Check, AlertTriangle, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

// ── Types ──────────────────────────────────────────────────────────────────

export type GateError =
  | 'WRONG_PASSCODE'
  | 'RATE_LIMITED'
  | 'UNKNOWN_ERROR'
  | null;

interface RoomPasswordGateProps {
  roomId: string;
  roomTitle?: string;
  roomDifficulty?: string;
  roomCompany?: string;
  roomType?: string;
  /** Called with the plain-text passcode when the user submits */
  onSubmit: (passcode: string) => Promise<void>;
  /** Error from the latest submit attempt */
  error?: GateError;
  /** Whether we are currently verifying */
  isVerifying?: boolean;
}

// ── Animated background particles ─────────────────────────────────────────

function Particles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary/10"
          style={{
            width:  Math.random() * 6 + 2,
            height: Math.random() * 6 + 2,
            left:   `${Math.random() * 100}%`,
            top:    `${Math.random() * 100}%`,
          }}
          animate={{
            y:       [0, -30 - Math.random() * 40, 0],
            opacity: [0, 0.5, 0],
            scale:   [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat:   Infinity,
            delay:    Math.random() * 4,
            ease:     'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ── PIN-dot display ────────────────────────────────────────────────────────

function PinDots({ length, filled }: { length: number; filled: number }) {
  return (
    <div className="flex items-center justify-center gap-2 my-3">
      {Array.from({ length }).map((_, i) => (
        <motion.div
          key={i}
          animate={i < filled ? { scale: [1, 1.3, 1] } : { scale: 1 }}
          transition={{ duration: 0.2 }}
          className={`w-3 h-3 rounded-full border transition-all duration-200 ${
            i < filled
              ? 'bg-primary border-primary shadow-[0_0_8px_rgba(99,102,241,0.6)]'
              : 'bg-white/5 border-white/20'
          }`}
        />
      ))}
    </div>
  );
}

// ── Error shake animation ──────────────────────────────────────────────────

const shakeVariants = {
  shake: {
    x: [-10, 10, -8, 8, -6, 6, 0],
    transition: { duration: 0.4 },
  },
  idle: { x: 0 },
};

// ── Main component ─────────────────────────────────────────────────────────

export function RoomPasswordGate({
  roomId,
  roomTitle,
  roomDifficulty,
  roomCompany,
  roomType,
  onSubmit,
  error,
  isVerifying = false,
}: RoomPasswordGateProps) {
  const [passcode,    setPasscode]    = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [copied,      setCopied]      = useState(false);
  const [shaking,     setShaking]     = useState(false);
  const inputRef                      = useRef<HTMLInputElement>(null);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Shake animation on error
  useEffect(() => {
    if (error === 'WRONG_PASSCODE') {
      setShaking(true);
      setPasscode('');
      const t = setTimeout(() => setShaking(false), 500);
      return () => clearTimeout(t);
    }
  }, [error]);

  const handleSubmit = useCallback(async () => {
    const trimmed = passcode.trim();
    if (trimmed.length < 4) {
      toast.error('Passcode must be at least 4 characters.');
      return;
    }
    await onSubmit(trimmed);
  }, [passcode, onSubmit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  }, [handleSubmit]);

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      toast.success('Room link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  const difficultyColor =
    roomDifficulty === 'Hard'   ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
    roomDifficulty === 'Medium' ? 'bg-primary/10 text-primary border-primary/20'    :
                                  'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#050505] overflow-hidden">
      {/* ── Ambient glow ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.08)_0%,transparent_65%)] blur-3xl" />
        <div className="absolute top-0 right-0 w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.04)_0%,transparent_70%)] blur-2xl" />
      </div>

      <Particles />

      {/* ── Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md"
      >
        <motion.div
          variants={shakeVariants}
          animate={shaking ? 'shake' : 'idle'}
          className="bg-[#0d0d0d]/80 border border-white/8 rounded-[40px] overflow-hidden backdrop-blur-3xl shadow-[0_40px_120px_rgba(0,0,0,0.8)]"
        >
          {/* Top gradient strip */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          <div className="p-10 space-y-8">
            {/* ── Header ── */}
            <div className="text-center space-y-4">
              {/* Shield icon with glow */}
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="mx-auto w-20 h-20 rounded-[28px] bg-primary/10 border border-primary/20 flex items-center justify-center relative"
              >
                <div className="absolute inset-0 rounded-[28px] bg-primary/5 blur-xl" />
                <Shield className="w-9 h-9 text-primary relative z-10" />
              </motion.div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary/70 mb-1.5">
                  Password Protected
                </p>
                <h1 className="text-2xl font-black text-white leading-tight tracking-tight">
                  {roomTitle || 'Private Mock Room'}
                </h1>
              </div>

              {/* Room meta badges */}
              <div className="flex items-center justify-center flex-wrap gap-2">
                {roomCompany && (
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/8 text-[9px] font-black text-white/50 uppercase tracking-widest">
                    {roomCompany}
                  </span>
                )}
                {roomType && (
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/8 text-[9px] font-black text-white/50 uppercase tracking-widest">
                    {roomType}
                  </span>
                )}
                {roomDifficulty && (
                  <span className={`px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${difficultyColor}`}>
                    {roomDifficulty}
                  </span>
                )}
              </div>
            </div>

            {/* ── Passcode input area ── */}
            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/40 text-center">
                Enter Room Passcode
              </label>

              {/* PIN dots (visible when input has 4–20 chars) */}
              <AnimatePresence>
                {passcode.length > 0 && passcode.length <= 20 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <PinDots
                      length={Math.max(passcode.length, 4)}
                      filled={passcode.length}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input field */}
              <div className="relative group">
                <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm" />
                <input
                  ref={inputRef}
                  type={showPass ? 'text' : 'password'}
                  value={passcode}
                  onChange={e => setPasscode(e.target.value.slice(0, 20))}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter passcode"
                  maxLength={20}
                  disabled={isVerifying}
                  aria-label="Room passcode"
                  aria-describedby={error ? 'passcode-error' : undefined}
                  className={`relative w-full bg-black/60 border rounded-2xl px-6 py-4 text-center text-lg font-mono font-bold text-white tracking-widest focus:outline-none transition-all duration-300 pr-14 disabled:opacity-50 disabled:cursor-not-allowed
                    ${error === 'WRONG_PASSCODE'
                      ? 'border-rose-500/50 focus:border-rose-500/80 ring-1 ring-rose-500/20'
                      : 'border-white/8 focus:border-primary/50 focus:ring-1 focus:ring-primary/20'
                    }
                  `}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-white/30 hover:text-white/70 transition-colors"
                  aria-label={showPass ? 'Hide passcode' : 'Show passcode'}
                >
                  {showPass
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye    className="w-4 h-4" />
                  }
                </button>
              </div>

              {/* ── Error message ── */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    id="passcode-error"
                    key={error}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-rose-500/8 border border-rose-500/20"
                    role="alert"
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                    <p className="text-[11px] font-semibold text-rose-400 leading-snug">
                      {error === 'WRONG_PASSCODE'
                        ? 'Incorrect passcode. Please check with the room owner and try again.'
                        : error === 'RATE_LIMITED'
                        ? 'Too many attempts. Please wait 1 minute before trying again.'
                        : 'Something went wrong. Please check your connection and try again.'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Submit button ── */}
              <motion.button
                onClick={handleSubmit}
                disabled={isVerifying || passcode.trim().length < 4}
                whileHover={{ scale: isVerifying ? 1 : 1.02 }}
                whileTap={  { scale: isVerifying ? 1 : 0.98 }}
                className="w-full py-4 rounded-2xl bg-primary text-white font-black text-[11px] uppercase tracking-[0.3em] shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                aria-busy={isVerifying}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying…
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Enter Room
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </div>

            {/* ── Share link row ── */}
            <div className="pt-2 border-t border-white/5">
              <p className="text-[10px] font-medium text-white/30 text-center mb-3">
                Share this room with someone who has the passcode
              </p>
              <button
                onClick={copyLink}
                className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-white/4 border border-white/8 hover:bg-white/8 hover:border-white/12 transition-all duration-300 group"
              >
                <motion.div
                  animate={copied ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {copied
                    ? <Check className="w-3.5 h-3.5 text-emerald-500" />
                    : <Copy  className="w-3.5 h-3.5 text-white/40 group-hover:text-white/70 transition-colors" />
                  }
                </motion.div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white/70 transition-colors">
                  {copied ? 'Link Copied!' : 'Copy Room Link'}
                </span>
              </button>
            </div>
          </div>

          {/* Bottom gradient strip */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </motion.div>
      </motion.div>
    </div>
  );
}
