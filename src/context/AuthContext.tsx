/* Developed by Akash Mani - This site is developed by Akash Mani. Original watermark of Akash Mani. */
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

// ── Grace Period Config ───────────────────────────────────────────────────────
/** Number of days a guest can use the app before the login gate appears. */
const GRACE_PERIOD_DAYS = 5;
/** Maximum number of times a user can snooze the login gate. */
const MAX_SNOOZE_COUNT = 1;
const FIRST_VISIT_KEY = 'placeprep_first_visit';
const SNOOZE_KEY = 'placeprep_login_snooze';       // stores expiry timestamp
const SNOOZE_COUNT_KEY = 'placeprep_snooze_count'; // stores how many snoozes used

/** Returns the number of days since first visit (0 on first visit). */
function getDaysSinceFirstVisit(): number {
  if (typeof window === 'undefined') return 0;
  let firstVisit = localStorage.getItem(FIRST_VISIT_KEY);
  if (!firstVisit) {
    firstVisit = new Date().toISOString();
    localStorage.setItem(FIRST_VISIT_KEY, firstVisit);
  }
  const ms = Date.now() - new Date(firstVisit).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

/** True if the user currently has an active snooze window (not yet expired). */
function isSnoozed(): boolean {
  if (typeof window === 'undefined') return false;
  const until = localStorage.getItem(SNOOZE_KEY);
  if (!until) return false;
  return Date.now() < parseInt(until, 10);
}

/** Returns how many times the user has snoozed (0 if never). */
function getSnoozeCount(): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(SNOOZE_COUNT_KEY) || '0', 10);
}

/** True when the user has exhausted all their allowed snoozes. */
function isAtMaxSnoozes(): boolean {
  return getSnoozeCount() >= MAX_SNOOZE_COUNT;
}

/** Adds a 24-hour snooze and increments the snooze counter. */
function setSnooze(): void {
  if (typeof window === 'undefined') return;
  const expiry = Date.now() + 24 * 60 * 60 * 1000;
  localStorage.setItem(SNOOZE_KEY, String(expiry));
  const count = getSnoozeCount();
  localStorage.setItem(SNOOZE_COUNT_KEY, String(count + 1));
}

// ─────────────────────────────────────────────────────────────────────────────

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  /** Whether the login gate modal should be shown right now. */
  shouldShowLoginGate: boolean;
  /** Days elapsed since first visit (for progress display). */
  daysSinceFirstVisit: number;
  /** Max grace period days (for progress display). */
  gracePeriodDays: number;
  /** Snooze the gate for 24h. Returns false if all snoozes are exhausted. */
  snoozeLoginGate: () => boolean;
  /** How many snoozes the user has used so far. */
  snoozeCount: number;
  /** Maximum allowed snoozes before hard block. */
  maxSnoozeCount: number;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [daysSinceFirstVisit, setDaysSinceFirstVisit] = useState(0);
  const [snoozed, setSnoozed] = useState(false);
  const [snoozeCount, setSnoozeCount] = useState(0);

  // Initialise grace period state on mount (client-side only)
  useEffect(() => {
    setDaysSinceFirstVisit(getDaysSinceFirstVisit());
    setSnoozed(isSnoozed());
    setSnoozeCount(getSnoozeCount());
  }, []);

  useEffect(() => {
    // Check active sessions
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error fetching session:', error.message);
      }
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    };

    getSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) console.error('Auth error:', error.message);
  };

  const snoozeLoginGate = (): boolean => {
    if (isAtMaxSnoozes()) return false; // All snoozes exhausted
    setSnooze(); // persists new expiry + increments count
    setSnoozed(true);
    setSnoozeCount((c) => c + 1);
    return true;
  };

  const shouldShowLoginGate =
    !isLoading &&
    !user &&
    daysSinceFirstVisit >= GRACE_PERIOD_DAYS &&
    !snoozed;

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isLoading,
      signOut,
      signInWithGoogle,
      shouldShowLoginGate,
      daysSinceFirstVisit,
      gracePeriodDays: GRACE_PERIOD_DAYS,
      snoozeLoginGate,
      snoozeCount,
      maxSnoozeCount: MAX_SNOOZE_COUNT,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
