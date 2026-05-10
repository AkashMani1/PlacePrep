/* Developed by Akash Mani - PlacePrep Badge Engine */

import { Badge, AppState } from './types';
import { calcStreak } from './utils';

/**
 * All badge definitions for PlacePrep.
 * Each badge's `check` function is a pure derivation over AppState.
 * To add a new badge, simply append an object to this array.
 */
export const ALL_BADGES: Badge[] = [
  // \u2500\u2500 STREAK BADGES \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  {
    id: 'streak_3',
    name: 'Getting Started',
    description: 'Maintain a 3-day consecutive study streak.',
    icon: 'Flame',
    tier: 'bronze',
    color: 'from-orange-400 to-orange-600',
    check: (s: AppState) => calcStreak(s.dailyLogs) >= 3,
  },
  {
    id: 'streak_7',
    name: '7-Day Warrior',
    description: 'Maintain a 7-day consecutive study streak.',
    icon: 'Flame',
    tier: 'silver',
    color: 'from-amber-400 to-amber-600',
    check: (s: AppState) => calcStreak(s.dailyLogs) >= 7,
  },
  {
    id: 'streak_21',
    name: 'Habit Machine',
    description: 'Maintain a legendary 21-day study streak.',
    icon: 'Zap',
    tier: 'gold',
    color: 'from-yellow-300 to-yellow-600',
    check: (s: AppState) => calcStreak(s.dailyLogs) >= 21,
  },

  // \u2500\u2500 DSA PROBLEM BADGES \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  {
    id: 'dsa_first',
    name: 'First Blood',
    description: 'Solve your very first DSA problem.',
    icon: 'Code2',
    tier: 'bronze',
    color: 'from-blue-400 to-blue-600',
    check: (s: AppState) => s.problems.some((p) => p.status === 'Done' && p.category === 'DSA'),
  },
  {
    id: 'dsa_25',
    name: 'Coder',
    description: 'Solve 25 DSA problems from the Must-Do list.',
    icon: 'Code2',
    tier: 'bronze',
    color: 'from-blue-400 to-indigo-600',
    check: (s: AppState) =>
      s.problems.filter((p) => p.status === 'Done' && p.category === 'DSA').length >= 25,
  },
  {
    id: 'dsa_50',
    name: 'Half Century',
    description: 'Solve 50 DSA problems.',
    icon: 'Target',
    tier: 'silver',
    color: 'from-indigo-400 to-violet-600',
    check: (s: AppState) =>
      s.problems.filter((p) => p.status === 'Done' && p.category === 'DSA').length >= 50,
  },
  {
    id: 'dsa_100',
    name: 'Century Club',
    description: 'Solve 100 DSA problems. You are elite.',
    icon: 'Trophy',
    tier: 'gold',
    color: 'from-violet-400 to-purple-600',
    check: (s: AppState) =>
      s.problems.filter((p) => p.status === 'Done' && p.category === 'DSA').length >= 100,
  },
  {
    id: 'graph_master',
    name: 'Graph Master',
    description: 'Solve all Graph problems in the Must-Do list.',
    icon: 'GitBranch',
    tier: 'silver',
    color: 'from-cyan-400 to-blue-600',
    check: (s: AppState) => {
      const graphProbs = s.problems.filter((p) => p.topic.toLowerCase().includes('graph'));
      return graphProbs.length > 0 && graphProbs.every((p) => p.status === 'Done');
    },
  },
  {
    id: 'dp_slayer',
    name: 'DP Slayer',
    description: 'Solve all Dynamic Programming problems.',
    icon: 'Layers',
    tier: 'gold',
    color: 'from-pink-400 to-rose-600',
    check: (s: AppState) => {
      const dpProbs = s.problems.filter(
        (p) => p.topic.toLowerCase().includes('dynamic') || p.topic.toLowerCase().includes('dp')
      );
      return dpProbs.length > 0 && dpProbs.every((p) => p.status === 'Done');
    },
  },

  // \u2500\u2500 APTITUDE BADGES \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  {
    id: 'aptitude_first',
    name: 'Sharp Mind',
    description: 'Solve your first Aptitude problem.',
    icon: 'Brain',
    tier: 'bronze',
    color: 'from-amber-400 to-orange-600',
    check: (s: AppState) =>
      s.problems.some((p) => p.status === 'Done' && p.category === 'Aptitude'),
  },
  {
    id: 'aptitude_25',
    name: 'Quant Master',
    description: 'Complete 25 Aptitude problems.',
    icon: 'Activity',
    tier: 'silver',
    color: 'from-amber-300 to-amber-600',
    check: (s: AppState) =>
      s.problems.filter((p) => p.status === 'Done' && p.category === 'Aptitude').length >= 25,
  },

  // \u2500\u2500 MOCK INTERVIEW BADGES \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  {
    id: 'mock_first',
    name: 'Mock Rookie',
    description: 'Complete your first mock interview session.',
    icon: 'Video',
    tier: 'bronze',
    color: 'from-emerald-400 to-green-600',
    check: (s: AppState) => s.mocks.length >= 1,
  },
  {
    id: 'mock_expert',
    name: 'Mock Expert',
    description: 'Complete 7 mock interview sessions.',
    icon: 'ShieldCheck',
    tier: 'gold',
    color: 'from-emerald-400 to-teal-600',
    check: (s: AppState) => s.mocks.length >= 7,
  },
  {
    id: 'mock_ace',
    name: 'Interview Ace',
    description: 'Score above 80% in any mock interview.',
    icon: 'Award',
    tier: 'silver',
    color: 'from-amber-300 to-yellow-500',
    check: (s: AppState) => s.mocks.some((m) => m.maxScore > 0 && (m.score / m.maxScore) * 100 >= 80),
  },

  // \u2500\u2500 PROJECT BADGES \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  {
    id: 'project_first',
    name: 'Builder',
    description: 'Add your first project to the Project Lab.',
    icon: 'FlaskConical',
    tier: 'bronze',
    color: 'from-violet-400 to-purple-600',
    check: (s: AppState) => (s.projects?.length ?? 0) >= 1,
  },
  {
    id: 'project_live',
    name: 'Shipped It',
    description: 'Mark a project as Live.',
    icon: 'Rocket',
    tier: 'silver',
    color: 'from-sky-400 to-blue-600',
    check: (s: AppState) => (s.projects ?? []).some((p) => p.status === 'Live'),
  },

  // \u2500\u2500 SRS SYNERGY BADGES \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  {
    id: 'srs_initiated',
    name: 'SRS Initiated',
    description: 'Have your first problem enter the Spaced Repetition queue.',
    icon: 'RotateCcw',
    tier: 'bronze',
    color: 'from-sky-400 to-cyan-600',
    check: (s: AppState) => s.problems.some((p) => (p.srsReviewCount ?? 0) >= 1),
  },
  {
    id: 'memory_palace',
    name: 'Memory Palace',
    description: 'Successfully master 10 problems through Spaced Repetition.',
    icon: 'Brain',
    tier: 'silver',
    color: 'from-sky-400 to-blue-600',
    check: (s: AppState) =>
      s.problems.filter((p) => p.status === 'Done' && (p.srsReviewCount ?? 0) >= 1).length >= 10,
  },

  // \u2500\u2500 ULTIMATE BADGE \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  {
    id: 'placement_ready',
    name: 'Placement Ready\u2122',
    description: 'Complete 80% of the Must-Do list and finish 5 mock interviews.',
    icon: 'Star',
    tier: 'platinum',
    color: 'from-yellow-300 via-amber-400 to-orange-500',
    check: (s: AppState) => {
      const total = s.problems.length;
      const done = s.problems.filter((p) => p.status === 'Done').length;
      return total > 0 && done / total >= 0.8 && s.mocks.length >= 5;
    },
  },
];
