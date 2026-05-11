import { Question } from './types';

export const MOCK_QUESTIONS: Question[] = [
  // ── TCS NQT: Quantitative ─────────────────────────────────────────────
  { id:'tcs-q1', title:'Simple Interest', content:'A sum doubles in 10 years at simple interest. In how many years will it triple?', type:'aptitude', difficulty:'Easy', tags:['Math','Interest','TCS'], company:'TCS', topic:'Quantitative', options:['15 years','20 years','25 years','30 years'], correctAnswer:1, solutionExplanation:'Rate=100/10=10%. To triple, 200/10=20 years.', estimatedTimeSeconds:60 },
  { id:'tcs-q2', title:'Profit & Loss', content:'A sells an article to B at 20% profit. B sells to C at 10% loss. If C pays ₹540, what did A pay?', type:'aptitude', difficulty:'Easy', tags:['Math','Profit','TCS'], company:'TCS', topic:'Quantitative', options:['₹400','₹450','₹500','₹550'], correctAnswer:2, solutionExplanation:'Let A cost=x. B=1.2x, C=1.2x*0.9=1.08x=540, x=500.', estimatedTimeSeconds:90 },
  { id:'tcs-q3', title:'Time & Work', content:'A can do a job in 12 days, B in 15 days. Working together, how many days?', type:'aptitude', difficulty:'Easy', tags:['Math','Work','TCS'], company:'TCS', topic:'Quantitative', options:['6','6.67','7','7.5'], correctAnswer:1, solutionExplanation:'1/12+1/15=9/60=3/20. Days=20/3≈6.67.', estimatedTimeSeconds:60 },
  { id:'tcs-q4', title:'Percentage', content:'If 40% of a number is 200, what is 75% of that number?', type:'aptitude', difficulty:'Easy', tags:['Math','Percentage','TCS'], company:'TCS', topic:'Quantitative', options:['350','375','400','425'], correctAnswer:1, solutionExplanation:'Number=200/0.4=500. 75% of 500=375.', estimatedTimeSeconds:45 },
  { id:'tcs-q5', title:'Ratio & Proportion', content:'A:B=3:4, B:C=5:6. Find A:B:C.', type:'aptitude', difficulty:'Medium', tags:['Math','Ratio','TCS'], company:'TCS', topic:'Quantitative', options:['15:20:24','3:5:6','15:20:18','9:12:16'], correctAnswer:0, solutionExplanation:'B LCM=20. A=15, B=20, C=24.', estimatedTimeSeconds:90 },
  { id:'tcs-q6', title:'Compound Interest', content:'Find CI on ₹10000 at 10% for 2 years compounded annually.', type:'aptitude', difficulty:'Easy', tags:['Math','CI','TCS'], company:'TCS', topic:'Quantitative', options:['₹2000','₹2100','₹2200','₹2500'], correctAnswer:1, solutionExplanation:'A=10000(1.1)²=12100. CI=2100.', estimatedTimeSeconds:60 },
  { id:'tcs-q7', title:'Speed & Distance', content:'A train 150m long passes a pole in 15 sec. Find its speed in km/h.', type:'aptitude', difficulty:'Easy', tags:['Math','Speed','TCS'], company:'TCS', topic:'Quantitative', options:['30','36','40','45'], correctAnswer:1, solutionExplanation:'Speed=150/15=10m/s=36km/h.', estimatedTimeSeconds:45 },
  { id:'tcs-q8', title:'Averages', content:'Average of 5 numbers is 20. If one number is excluded, average becomes 18. Find excluded number.', type:'aptitude', difficulty:'Easy', tags:['Math','Average','TCS'], company:'TCS', topic:'Quantitative', options:['24','26','28','30'], correctAnswer:2, solutionExplanation:'Sum=100, remaining=72, excluded=28.', estimatedTimeSeconds:45 },

  // ── TCS NQT: Logical ──────────────────────────────────────────────────
  { id:'tcs-q9', title:'Pattern Series', content:'Find the missing number: 2, 6, 12, 20, 30, ?', type:'aptitude', difficulty:'Easy', tags:['Logical','Sequence','TCS'], company:'TCS', topic:'Logical', options:['40','42','44','48'], correctAnswer:1, solutionExplanation:'Differences: 4,6,8,10,12. Next=30+12=42.', estimatedTimeSeconds:60 },
  { id:'tcs-q10', title:'Blood Relations', content:'Pointing to a photo, Arun said "He is the son of my mother\'s only daughter." How is the person related to Arun?', type:'aptitude', difficulty:'Medium', tags:['Logical','Relations','TCS'], company:'TCS', topic:'Logical', options:['Son','Nephew','Brother','Father'], correctAnswer:0, solutionExplanation:'Mother\'s only daughter = Arun\'s sister or Arun (if female). Son of that person = Arun\'s son/nephew. If Arun is male, mother\'s only daughter is his sister, so her son is his nephew. But "my mother\'s only daughter" could be Arun if female - son.', estimatedTimeSeconds:90 },
  { id:'tcs-q11', title:'Coding-Decoding', content:'If COMPUTER=FRPSXWHU, then DATA=?', type:'aptitude', difficulty:'Easy', tags:['Logical','Coding','TCS'], company:'TCS', topic:'Logical', options:['GDWD','EDWD','FCVC','GDXD'], correctAnswer:0, solutionExplanation:'Each letter +3: D→G, A→D, T→W, A→D = GDWD.', estimatedTimeSeconds:60 },
  { id:'tcs-q12', title:'Syllogism', content:'All dogs are animals. All animals are living beings. Conclusion: All dogs are living beings.', type:'aptitude', difficulty:'Easy', tags:['Logical','Syllogism','TCS'], company:'TCS', topic:'Logical', options:['True','False','Cannot determine','Partially true'], correctAnswer:0, solutionExplanation:'Valid syllogism - transitive relation holds.', estimatedTimeSeconds:45 },

  // ── TCS NQT: Verbal ───────────────────────────────────────────────────
  { id:'tcs-q13', title:'Synonym', content:'Choose the synonym of "Ephemeral":', type:'aptitude', difficulty:'Easy', tags:['Verbal','Synonym','TCS'], company:'TCS', topic:'Verbal', options:['Permanent','Fleeting','Sturdy','Ancient'], correctAnswer:1, solutionExplanation:'Ephemeral means short-lived, fleeting.', estimatedTimeSeconds:30 },
  { id:'tcs-q14', title:'Antonym', content:'Choose the antonym of "Benevolent":', type:'aptitude', difficulty:'Easy', tags:['Verbal','Antonym','TCS'], company:'TCS', topic:'Verbal', options:['Generous','Malevolent','Kind','Warm'], correctAnswer:1, solutionExplanation:'Benevolent=kind, opposite=malevolent.', estimatedTimeSeconds:30 },
  { id:'tcs-q15', title:'Sentence Correction', content:'Which is grammatically correct?', type:'aptitude', difficulty:'Medium', tags:['Verbal','Grammar','TCS'], company:'TCS', topic:'Verbal', options:['He don\'t know nothing','He doesn\'t know anything','He don\'t knows anything','He doesn\'t knows nothing'], correctAnswer:1, solutionExplanation:'Correct subject-verb agreement and no double negative.', estimatedTimeSeconds:45 },

  // ── TCS NQT: Coding ───────────────────────────────────────────────────
  { id:'tcs-q16', title:'Two Sum', content:'Given an array of integers and a target, return indices of two numbers that add up to the target. Input: [2,7,11,15], target=9', type:'coding', difficulty:'Easy', tags:['Array','Hash','TCS'], company:'TCS', topic:'DSA', options:['O(n²) brute force only','Use HashMap for O(n)','Sort and binary search O(nlogn)','Not possible'], correctAnswer:1, solutionExplanation:'HashMap stores complement. One pass O(n).', estimatedTimeSeconds:120 },
  { id:'tcs-q17', title:'Reverse Linked List', content:'What is the time complexity of reversing a singly linked list iteratively?', type:'coding', difficulty:'Easy', tags:['LinkedList','TCS'], company:'TCS', topic:'DSA', options:['O(1)','O(n)','O(n²)','O(log n)'], correctAnswer:1, solutionExplanation:'Single traversal with pointer manipulation.', estimatedTimeSeconds:60 },

  // ── Infosys ───────────────────────────────────────────────────────────
  { id:'inf-q1', title:'Number System', content:'What is the remainder when 2^100 is divided by 3?', type:'aptitude', difficulty:'Medium', tags:['Math','Number','Infosys'], company:'Infosys', topic:'Quantitative', options:['0','1','2','Cannot determine'], correctAnswer:1, solutionExplanation:'2^1=2(r2), 2^2=4(r1), 2^3=8(r2), 2^4=16(r1). Pattern: odd power→r2, even→r1. 100 is even→r1.', estimatedTimeSeconds:90 },
  { id:'inf-q2', title:'Probability', content:'Two dice are thrown. What is the probability that the sum is 7?', type:'aptitude', difficulty:'Easy', tags:['Math','Probability','Infosys'], company:'Infosys', topic:'Quantitative', options:['1/6','5/36','1/9','7/36'], correctAnswer:0, solutionExplanation:'Favorable outcomes: (1,6)(2,5)(3,4)(4,3)(5,2)(6,1)=6. Total=36. P=6/36=1/6.', estimatedTimeSeconds:60 },
  { id:'inf-q3', title:'Puzzle - Arrangement', content:'5 people sit in a row. In how many ways can they be arranged?', type:'aptitude', difficulty:'Easy', tags:['Math','Permutation','Infosys'], company:'Infosys', topic:'Logical', options:['60','100','120','150'], correctAnswer:2, solutionExplanation:'5!=120.', estimatedTimeSeconds:30 },
  { id:'inf-q4', title:'Data Interpretation', content:'A company revenue: 2022=₹40Cr, 2023=₹52Cr. What is % growth?', type:'aptitude', difficulty:'Easy', tags:['Math','DI','Infosys'], company:'Infosys', topic:'Quantitative', options:['20%','25%','30%','35%'], correctAnswer:2, solutionExplanation:'Growth=(52-40)/40*100=30%.', estimatedTimeSeconds:45 },

  // ── Wipro ─────────────────────────────────────────────────────────────
  { id:'wip-q1', title:'Ages', content:'Father is 3x son\'s age. After 12 years, he\'ll be 2x. Find son\'s current age.', type:'aptitude', difficulty:'Easy', tags:['Math','Ages','Wipro'], company:'Wipro', topic:'Quantitative', options:['10','12','14','16'], correctAnswer:1, solutionExplanation:'3x+12=2(x+12). 3x+12=2x+24. x=12.', estimatedTimeSeconds:60 },
  { id:'wip-q2', title:'Pipes & Cisterns', content:'Pipe A fills in 20 min, B empties in 30 min. Both open, time to fill?', type:'aptitude', difficulty:'Medium', tags:['Math','Pipes','Wipro'], company:'Wipro', topic:'Quantitative', options:['50 min','60 min','45 min','40 min'], correctAnswer:1, solutionExplanation:'Net rate=1/20-1/30=1/60. Time=60 min.', estimatedTimeSeconds:60 },

  // ── Accenture ─────────────────────────────────────────────────────────
  { id:'acc-q1', title:'Abstract Reasoning', content:'In a 3x3 grid, shapes rotate 90° clockwise each cell. What comes in position (3,3)?', type:'aptitude', difficulty:'Medium', tags:['Abstract','Pattern','Accenture'], company:'Accenture', topic:'Logical', options:['Circle','Triangle rotated 270°','Square','Triangle rotated 90°'], correctAnswer:1, solutionExplanation:'Following 90° clockwise rotation pattern across grid.', estimatedTimeSeconds:90 },
  { id:'acc-q2', title:'Critical Thinking', content:'All roses are flowers. Some flowers fade quickly. Conclusion: Some roses fade quickly.', type:'aptitude', difficulty:'Easy', tags:['Logical','Critical','Accenture'], company:'Accenture', topic:'Logical', options:['Definitely true','Probably true','Probably false','Cannot be determined'], correctAnswer:3, solutionExplanation:'We cannot determine which flowers fade - could be non-rose flowers.', estimatedTimeSeconds:60 },
  { id:'acc-q3', title:'English Comprehension', content:'"The manager, along with the workers, ___ present." Fill in:', type:'aptitude', difficulty:'Easy', tags:['Verbal','Grammar','Accenture'], company:'Accenture', topic:'Verbal', options:['were','was','are','have been'], correctAnswer:1, solutionExplanation:'"Along with" doesn\'t change subject. Manager(singular)→was.', estimatedTimeSeconds:30 },

  // ── Cognizant ─────────────────────────────────────────────────────────
  { id:'cog-q1', title:'Debugging', content:'int arr[5]={1,2,3,4,5}; printf("%d",arr[5]); What happens?', type:'coding', difficulty:'Medium', tags:['C','Debug','Cognizant'], company:'Cognizant', topic:'Programming', options:['Prints 5','Prints 0','Undefined behavior','Compilation error'], correctAnswer:2, solutionExplanation:'arr[5] is out of bounds (valid: 0-4). Undefined behavior.', estimatedTimeSeconds:45 },
  { id:'cog-q2', title:'OOP Concepts', content:'Which principle allows a child class to provide specific implementation of a parent method?', type:'coding', difficulty:'Easy', tags:['OOP','Java','Cognizant'], company:'Cognizant', topic:'Programming', options:['Encapsulation','Abstraction','Polymorphism (Override)','Inheritance'], correctAnswer:2, solutionExplanation:'Method overriding is runtime polymorphism.', estimatedTimeSeconds:30 },

  // ── Capgemini ──────────────────────────────────────────────────────────
  { id:'cap-q1', title:'Pseudo Code', content:'x=5; y=10; x=x+y; y=x-y; x=x-y; What are x,y?', type:'coding', difficulty:'Easy', tags:['Logic','Pseudo','Capgemini'], company:'Capgemini', topic:'Programming', options:['x=5,y=10','x=10,y=5','x=15,y=5','x=10,y=10'], correctAnswer:1, solutionExplanation:'Swap without temp: x=15,y=15-10=5,x=15-5=10. Result: x=10,y=5.', estimatedTimeSeconds:60 },
  { id:'cap-q2', title:'Automata', content:'A DFA accepts strings ending with "01". Minimum states needed?', type:'coding', difficulty:'Hard', tags:['Theory','Automata','Capgemini'], company:'Capgemini', topic:'Programming', options:['2','3','4','5'], correctAnswer:1, solutionExplanation:'3 states: start, seen 0, seen 01(accept).', estimatedTimeSeconds:90 },

  // ── Amazon OA ─────────────────────────────────────────────────────────
  { id:'amz-q1', title:'Maximum Subarray', content:'Find the contiguous subarray with the largest sum in [-2,1,-3,4,-1,2,1,-5,4].', type:'coding', difficulty:'Hard', tags:['Array','DP','Amazon'], company:'Amazon', topic:'DSA', options:['4','6','7','10'], correctAnswer:1, solutionExplanation:'Kadane\'s algorithm: subarray [4,-1,2,1] = 6.', estimatedTimeSeconds:120 },
  { id:'amz-q2', title:'LRU Cache', content:'Which data structure combination is optimal for O(1) get/put LRU Cache?', type:'coding', difficulty:'Hard', tags:['Design','HashMap','Amazon'], company:'Amazon', topic:'DSA', options:['Array + Stack','HashMap + Doubly Linked List','BST + Queue','Trie + Deque'], correctAnswer:1, solutionExplanation:'HashMap for O(1) lookup, DLL for O(1) insert/delete at ends.', estimatedTimeSeconds:90 },
  { id:'amz-q3', title:'Number of Islands', content:'Given a 2D grid of 1s and 0s, count the number of islands. Which approach?', type:'coding', difficulty:'Medium', tags:['Graph','BFS','Amazon'], company:'Amazon', topic:'DSA', options:['Dynamic Programming','BFS/DFS flood fill','Binary Search','Greedy'], correctAnswer:1, solutionExplanation:'BFS/DFS from each unvisited 1, marking visited. Count connected components.', estimatedTimeSeconds:120 },

  // ── Deloitte ──────────────────────────────────────────────────────────
  { id:'del-q1', title:'Data Analysis', content:'A dataset has mean=50, std=10. What % lies between 40-60 (normal dist)?', type:'aptitude', difficulty:'Medium', tags:['Stats','Analysis','Deloitte'], company:'Deloitte', topic:'Quantitative', options:['50%','68%','95%','99%'], correctAnswer:1, solutionExplanation:'40-60 is ±1 std deviation = 68% by empirical rule.', estimatedTimeSeconds:45 },
  { id:'del-q2', title:'Logical Deduction', content:'If all managers are leaders, and some leaders are innovators, which MUST be true?', type:'aptitude', difficulty:'Easy', tags:['Logical','Deduction','Deloitte'], company:'Deloitte', topic:'Logical', options:['All managers are innovators','Some managers may be innovators','No manager is an innovator','All innovators are managers'], correctAnswer:1, solutionExplanation:'Since some leaders are innovators and all managers are leaders, some managers MAY be innovators.', estimatedTimeSeconds:60 },
];

// ── Build assessments from questions ─────────────────────────────────────
export const SEED_ASSESSMENTS: import('./types').Assessment[] = [
  {
    id: 'tcs-nqt-2026',
    title: 'TCS NQT Simulator',
    category: 'Campus Drive',
    description: 'Complete simulation of TCS NQT: Quant, Verbal, Logical & Coding.',
    durationMinutes: 180,
    totalQuestions: 17,
    difficulty: 'Medium',
    companyTags: ['TCS'],
    questions: MOCK_QUESTIONS.filter(q => q.company === 'TCS'),
  },
  {
    id: 'amazon-oa-2026',
    title: 'Amazon OA Engine',
    category: 'FAANG OA',
    description: 'High-intensity coding OA with Hard problems.',
    durationMinutes: 90,
    totalQuestions: 3,
    difficulty: 'Hard',
    companyTags: ['Amazon'],
    questions: MOCK_QUESTIONS.filter(q => q.company === 'Amazon'),
  },
  {
    id: 'accenture-2026',
    title: 'Accenture Assessment',
    category: 'Campus Drive',
    description: 'Critical Thinking, Abstract Reasoning, and Communication.',
    durationMinutes: 90,
    totalQuestions: 3,
    difficulty: 'Easy',
    companyTags: ['Accenture'],
    questions: MOCK_QUESTIONS.filter(q => q.company === 'Accenture'),
  },
  {
    id: 'cognizant-2026',
    title: 'Cognizant GenC Next',
    category: 'Campus Drive',
    description: 'Programming fundamentals and debugging assessment.',
    durationMinutes: 120,
    totalQuestions: 2,
    difficulty: 'Medium',
    companyTags: ['Cognizant'],
    questions: MOCK_QUESTIONS.filter(q => q.company === 'Cognizant'),
  },
  {
    id: 'infosys-2026',
    title: 'Infosys InfyTQ',
    category: 'Campus Drive',
    description: 'Quantitative, Logical and Data Interpretation.',
    durationMinutes: 120,
    totalQuestions: 4,
    difficulty: 'Medium',
    companyTags: ['Infosys'],
    questions: MOCK_QUESTIONS.filter(q => q.company === 'Infosys'),
  },
  {
    id: 'wipro-2026',
    title: 'Wipro NLTH',
    category: 'Campus Drive',
    description: 'National Level Talent Hunt aptitude simulation.',
    durationMinutes: 60,
    totalQuestions: 2,
    difficulty: 'Easy',
    companyTags: ['Wipro'],
    questions: MOCK_QUESTIONS.filter(q => q.company === 'Wipro'),
  },
  {
    id: 'capgemini-2026',
    title: 'Capgemini Exceller',
    category: 'Campus Drive',
    description: 'Pseudo code, automata and game-based assessment.',
    durationMinutes: 90,
    totalQuestions: 2,
    difficulty: 'Medium',
    companyTags: ['Capgemini'],
    questions: MOCK_QUESTIONS.filter(q => q.company === 'Capgemini'),
  },
  {
    id: 'deloitte-2026',
    title: 'Deloitte Assessment',
    category: 'Campus Drive',
    description: 'Data analysis, logical deduction and quantitative skills.',
    durationMinutes: 90,
    totalQuestions: 2,
    difficulty: 'Medium',
    companyTags: ['Deloitte'],
    questions: MOCK_QUESTIONS.filter(q => q.company === 'Deloitte'),
  },
];
