import { Assessment, Question } from './types';

export const SEED_QUESTIONS: Question[] = [
  {
    id: 'q1',
    title: 'Two Sum',
    content: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    type: 'coding',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table', 'LeetCode'],
    testCases: [{ input: '[2,7,11,15], 9', output: '[0,1]' }]
  },
  {
    id: 'q2',
    title: 'Logical Reasoning - Pattern Matching',
    content: 'Find the missing number in the sequence: 2, 6, 12, 20, 30, ?',
    type: 'aptitude',
    difficulty: 'Easy',
    tags: ['Logical', 'Sequence', 'TCS'],
    solutionExplanation: 'The difference between terms is increasing by 2: 4, 6, 8, 10... so next is 12. 30 + 12 = 42.'
  },
  {
    id: 'q3',
    title: 'TCS NQT - Quantitative',
    content: 'A sum of money doubles itself in 10 years at simple interest. In how many years will it triple itself?',
    type: 'aptitude',
    difficulty: 'Medium',
    tags: ['Math', 'Interest', 'TCS'],
  },
  {
    id: 'q4',
    title: 'Accenture - Abstract Reasoning',
    content: 'Which of the following figures completes the series? (Imagine a 3x3 grid of rotating shapes)',
    type: 'aptitude',
    difficulty: 'Medium',
    tags: ['Abstract', 'Accenture'],
  },
  {
    id: 'q5',
    title: 'Cognizant - Debugging (C++)',
    content: 'Identify the error in the following code snippet that implements a linked list reversal.',
    type: 'coding',
    difficulty: 'Medium',
    tags: ['C++', 'Linked List', 'Cognizant'],
  },
  {
    id: 'q6',
    title: 'TCS Digital - Advanced DSA',
    content: 'Given a weighted directed acyclic graph, find the longest path from a source vertex to all other vertices.',
    type: 'coding',
    difficulty: 'Hard',
    tags: ['Graph', 'DP', 'TCS Digital'],
  }
];

export const SEED_ASSESSMENTS: Assessment[] = [
  {
    id: 'tcs-nqt-2026',
    title: 'TCS NQT Simulator',
    category: 'Campus Drive',
    description: 'Complete simulation of the latest TCS NQT pattern including Quant, Verbal, Logical, and Coding.',
    durationMinutes: 180,
    totalQuestions: 80,
    difficulty: 'Medium',
    companyTags: ['TCS'],
    questions: SEED_QUESTIONS.slice(0, 3)
  },
  {
    id: 'amazon-oa-2026',
    title: 'Amazon OA Engine',
    category: 'FAANG OA',
    description: 'High-intensity coding OA with 2 Hard problems and a leadership principles survey.',
    durationMinutes: 90,
    totalQuestions: 2,
    difficulty: 'Hard',
    companyTags: ['Amazon'],
    questions: [SEED_QUESTIONS[0], SEED_QUESTIONS[5]]
  },
  {
    id: 'accenture-assessment-2026',
    title: 'Accenture Assessment',
    category: 'Campus Drive',
    description: 'Critical Thinking, Abstract Reasoning, and Communication assessment simulation.',
    durationMinutes: 90,
    totalQuestions: 90,
    difficulty: 'Easy',
    companyTags: ['Accenture'],
    questions: [SEED_QUESTIONS[3]]
  },
  {
    id: 'cognizant-genc-2026',
    title: 'Cognizant GenC Next',
    category: 'Campus Drive',
    description: 'Skill-based assessment focusing on programming fundamentals and debugging.',
    durationMinutes: 120,
    totalQuestions: 40,
    difficulty: 'Medium',
    companyTags: ['Cognizant'],
    questions: [SEED_QUESTIONS[4]]
  }
];
