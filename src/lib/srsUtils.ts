/* Developed by Akash Mani - PlacePrep SRS Engine */

import { Problem } from './types';
import { today, addDays } from './utils';

/**
 * SRS interval stages in days (SM-2 simplified).
 * First revisit: 3 days, second: 7 days, third and beyond: 21 days.
 */
export const SRS_INTERVALS = [3, 7, 21] as const;
export type SrsInterval = typeof SRS_INTERVALS[number];

/**
 * Called when a problem is marked 'Revisit' or difficulty is 'Hard'.
 * Computes the next review date and advances the interval stage.
 */
export function scheduleForReview(problem: Problem): Partial<Problem> {
  const currentInterval = problem.srsInterval as SrsInterval | undefined;
  const stageIndex = currentInterval ? SRS_INTERVALS.indexOf(currentInterval) : -1;
  // Advance to next stage, cap at the last stage (21 days)
  const nextIndex = Math.min(stageIndex + 1, SRS_INTERVALS.length - 1);
  const nextInterval = SRS_INTERVALS[nextIndex];

  return {
    srsNextReview: addDays(today(), nextInterval),
    srsInterval: nextInterval,
    srsReviewCount: (problem.srsReviewCount ?? 0) + 1,
    srsLastReviewed: today(),
  };
}

/**
 * Called when a problem is marked 'Done' while in the SRS queue.
 * Clears the schedule — the problem is considered mastered.
 */
export function clearSrsSchedule(): Partial<Problem> {
  return {
    srsNextReview: undefined,
    srsInterval: 0,
    srsReviewCount: undefined,
    srsLastReviewed: today(),
  };
}

/**
 * Pure computation: returns all problems due for review today or overdue.
 * This is the single source of truth for what appears in the SRS Dashboard widget.
 */
export function getDueForReview(problems: Problem[]): Problem[] {
  const todayStr = today();
  return problems.filter(
    (p) =>
      p.srsNextReview != null &&
      p.srsNextReview <= todayStr &&
      p.status !== 'Done'
  );
}

/**
 * Returns a human-readable label for the SRS stage of a problem.
 * e.g. "Review #1 · 3-Day Cycle"
 */
export function getSrsStageLabel(problem: Problem): string {
  const count = problem.srsReviewCount ?? 1;
  const interval = problem.srsInterval ?? 3;
  return `Review #${count} · ${interval}-Day Cycle`;
}

/**
 * Returns how many days a problem is overdue for review (0 if not overdue).
 */
export function getDaysOverdue(problem: Problem): number {
  if (!problem.srsNextReview) return 0;
  const due = new Date(problem.srsNextReview);
  const now = new Date(today());
  const diff = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}
