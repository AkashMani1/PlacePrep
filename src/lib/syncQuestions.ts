import { Question } from './types';
import { supabase } from './supabase';

/**
 * Intelligent Question Database Sync
 * Normalizes questions from various sources (LeetCode, GFG, IndiaBix) 
 * and syncs them into the Supabase database.
 */
export async function syncQuestionDatabase() {
  console.log('[Sync] Initializing Question Database Synchronization...');
  
  // Simulated Sources
  const sources = [
    { name: 'LeetCode', patterns: ['Two Sum', 'LRU Cache', 'Number of Islands'], difficulty: 'Medium' },
    { name: 'GeeksForGeeks', patterns: ['Kadane Algorithm', 'Graph Traversal'], difficulty: 'Medium' },
    { name: 'IndiaBix', patterns: ['Simple Interest', 'Profit & Loss', 'Ratios'], difficulty: 'Easy' },
    { name: 'Company OA', patterns: ['TCS Digital Coding', 'Amazon Leadership'], difficulty: 'Hard' }
  ];

  const questions: Partial<Question>[] = [];

  sources.forEach(source => {
    source.patterns.forEach(pattern => {
      questions.push({
        title: `${pattern} (${source.name})`,
        content: `Detailed implementation and explanation for ${pattern}. High frequency in recent placements.`,
        type: source.name === 'IndiaBix' ? 'aptitude' : 'coding',
        difficulty: source.difficulty as any,
        tags: [source.name, 'Recent Trend'],
      });
    });
  });

  console.log(`[Sync] Normalized ${questions.length} questions. Push to Supabase...`);

  // In a real scenario, we would use upsert to avoid duplicates based on title/slug
  const { error } = await supabase
    .from('questions')
    .upsert(questions, { onConflict: 'title' });

  if (error) {
    console.error('[Sync] Failed to sync questions:', error.message);
    return { success: false, count: 0 };
  }

  console.log('[Sync] Question database updated successfully.');
  return { success: true, count: questions.length };
}
