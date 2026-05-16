import fs from 'fs';

const content = fs.readFileSync('src/lib/dsaKillListSeed.ts', 'utf8');

const regex = /d\('(.*?)',\s*'(.*?)',\s*'(.*?)',\s*'(.*?)',\s*'(.*?)',\s*'(.*?)'\),?/g;

let items = [];
let match;
while ((match = regex.exec(content)) !== null) {
  let [fullMatch, id, name, topic, diff, url1, url2] = match;
  
  if (topic === 'Arrays & Strings') {
    const stringIds = ['dsa_002','dsa_003','dsa_004','dsa_005','dsa_012','dsa_015','dsa_016','dsa_017','dsa_018','dsa_020','dsa_021','dsa_022'];
    if (stringIds.includes(id)) {
      topic = 'Strings';
    } else {
      topic = 'Arrays';
    }
  }
  
  items.push({ id, name, topic, diff, url1, url2, fullMatch: `  d('${id}','${name}','${topic}','${diff}','${url1}','${url2}'),` });
}

const topicOrder = [
  'Math',
  'Arrays',
  'Strings',
  'Hashmap',
  'Two Pointers',
  'Sliding Window',
  'Bit Manipulation',
  'Matrix',
  'Story / Company',
  'Stack',
  'Linked List',
  'Binary Search',
  'Kadane\\\'s Algo',
  'Binary Tree',
  'Binary Tree BFS',
  'Binary Search Tree',
  'Heap',
  'Graph General',
  'Backtracking',
  '1D DP',
  'Multi Dimensional DP'
];

items.sort((a, b) => {
  let indexA = topicOrder.indexOf(a.topic);
  let indexB = topicOrder.indexOf(b.topic);
  if (indexA === -1) indexA = 99;
  if (indexB === -1) indexB = 99;
  
  if (indexA !== indexB) return indexA - indexB;
  
  const numA = parseInt(a.id.split('_')[1], 10);
  const numB = parseInt(b.id.split('_')[1], 10);
  return numA - numB;
});

let newLines = [];
let currentTopic = '';
for (const item of items) {
  let cleanTopic = item.topic.replace(/\\'/g, "'");
  if (cleanTopic !== currentTopic) {
    if (newLines.length > 0) newLines.push('');
    newLines.push(`  // ${cleanTopic}`);
    currentTopic = cleanTopic;
  }
  newLines.push(item.fullMatch);
}

const prefix = `/* Developed by Akash Mani - DSA Must-Do List Seed Data */
import { Problem } from './types';

const d = (id: string, name: string, topic: string, difficulty: 'Easy'|'Medium'|'Hard', leetcode: string, youtube: string): Problem => ({
  id, name, category: 'DSA', topic, difficulty, platform: 'LeetCode',
  status: 'Todo', notes: '', addedAt: '2026-05-10', isPriority: true,
  readingUrl: leetcode, videoUrl: youtube,
});

export const DSA_KILL_LIST: Problem[] = [
`;
const suffix = `
];
`;

fs.writeFileSync('src/lib/dsaKillListSeed.ts', prefix + newLines.join('\n') + suffix);
console.log('Done! Total items:', items.length);
