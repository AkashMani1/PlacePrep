/* Developed by Akash Mani - PlacePrep Badge Hook */
'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { ALL_BADGES } from '@/lib/badges';
import { Badge } from '@/lib/types';
import { toast } from 'sonner';

export interface BadgeResult {
  badge: Badge;
  earned: boolean;
}

export function useBadges() {
  const { state, markBadgesSeen } = useApp();
  const hasRunInitialCheck = useRef(false);

  // 1. Pure derivation — compute which badges are earned right now
  const results: BadgeResult[] = useMemo(() => {
    return ALL_BADGES.map((badge) => ({
      badge,
      earned: badge.check(state),
    }));
  }, [state]);

  const earnedBadges = useMemo(() => results.filter((r) => r.earned), [results]);

  // 2. Detect newly-earned badges and fire a toast notification
  useEffect(() => {
    // Skip the very first render to avoid flooding toasts on page load
    if (!hasRunInitialCheck.current) {
      hasRunInitialCheck.current = true;
      return;
    }

    // Read seenIds fresh inside the effect to avoid stale closure
    const seenIds = new Set(state.seenBadgeIds ?? []);
    const newlyEarned = earnedBadges.filter((r) => !seenIds.has(r.badge.id));
    if (newlyEarned.length === 0) return;

    // Fire one toast per newly unlocked badge
    newlyEarned.forEach(({ badge }) => {
      toast.success(`🏆 Achievement Unlocked: ${badge.name}`, {
        description: badge.description,
        duration: 6000,
        position: 'top-right',
      });
    });

    // Mark as seen so toasts never repeat
    markBadgesSeen(newlyEarned.map((r) => r.badge.id));
  // earnedBadges.length is the correct dep — we only want to react when count changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [earnedBadges.length, state.seenBadgeIds]);

  return {
    allBadges: results,
    earnedBadges,
    earnedCount: earnedBadges.length,
    totalCount: ALL_BADGES.length,
  };
}
