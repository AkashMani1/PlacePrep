/**
 * seed-mock-hub.mjs
 * Seeds assessments + questions from SEED_ASSESSMENTS into the live Supabase DB.
 * Run: node scripts/seed-mock-hub.mjs
 */

const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your_service_role_key_here';
const BASE = 'https://eavjczqputftpkxstxog.supabase.co/rest/v1';
const H = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'resolution=merge-duplicates',
};

// ── SEED DATA ─────────────────────────────────────────────────────────────────
const ASSESSMENTS = [
  { id: 'tcs-nqt-2026', title: 'TCS NQT Simulator', category: 'Campus Drive', description: 'Complete simulation of TCS NQT: Quant, Verbal, Logical & Coding.', duration_minutes: 180, total_questions: 17, difficulty: 'Medium', company_tags: ['TCS'], is_active: true },
  { id: 'amazon-oa-2026', title: 'Amazon OA Engine', category: 'FAANG OA', description: 'High-intensity coding OA with Hard problems.', duration_minutes: 90, total_questions: 3, difficulty: 'Hard', company_tags: ['Amazon'], is_active: true },
  { id: 'accenture-2026', title: 'Accenture Assessment', category: 'Campus Drive', description: 'Critical Thinking, Abstract Reasoning, and Communication.', duration_minutes: 90, total_questions: 3, difficulty: 'Easy', company_tags: ['Accenture'], is_active: true },
  { id: 'cognizant-2026', title: 'Cognizant GenC Next', category: 'Campus Drive', description: 'Programming fundamentals and debugging assessment.', duration_minutes: 120, total_questions: 2, difficulty: 'Medium', company_tags: ['Cognizant'], is_active: true },
  { id: 'infosys-2026', title: 'Infosys InfyTQ', category: 'Campus Drive', description: 'Quantitative, Logical and Data Interpretation.', duration_minutes: 120, total_questions: 4, difficulty: 'Medium', company_tags: ['Infosys'], is_active: true },
  { id: 'wipro-2026', title: 'Wipro NLTH', category: 'Campus Drive', description: 'National Level Talent Hunt aptitude simulation.', duration_minutes: 60, total_questions: 2, difficulty: 'Easy', company_tags: ['Wipro'], is_active: true },
  { id: 'capgemini-2026', title: 'Capgemini Exceller', category: 'Campus Drive', description: 'Pseudo code, automata and game-based assessment.', duration_minutes: 90, total_questions: 2, difficulty: 'Medium', company_tags: ['Capgemini'], is_active: true },
  { id: 'deloitte-2026', title: 'Deloitte Assessment', category: 'Campus Drive', description: 'Data analysis, logical deduction and quantitative skills.', duration_minutes: 90, total_questions: 2, difficulty: 'Medium', company_tags: ['Deloitte'], is_active: true },
];

const QUESTIONS = [
  // TCS NQT
  { id: 'tcs-q1', assessment_id: 'tcs-nqt-2026', title: 'Simple Interest', content: 'A sum doubles in 10 years at simple interest. In how many years will it triple?', type: 'aptitude', difficulty: 'Easy', tags: ['Math','Interest','TCS'], company: 'TCS', topic: 'Quantitative', options: ['15 years','20 years','25 years','30 years'], correct_answer: 1, solution_explanation: 'Rate=100/10=10%. To triple, 200/10=20 years.', estimated_time_seconds: 60 },
  { id: 'tcs-q2', assessment_id: 'tcs-nqt-2026', title: 'Profit & Loss', content: 'A sells an article to B at 20% profit. B sells to C at 10% loss. If C pays ₹540, what did A pay?', type: 'aptitude', difficulty: 'Easy', tags: ['Math','Profit','TCS'], company: 'TCS', topic: 'Quantitative', options: ['₹400','₹450','₹500','₹550'], correct_answer: 2, solution_explanation: 'Let A cost=x. B=1.2x, C=1.2x*0.9=1.08x=540, x=500.', estimated_time_seconds: 90 },
  { id: 'tcs-q3', assessment_id: 'tcs-nqt-2026', title: 'Time & Work', content: 'A can do a job in 12 days, B in 15 days. Working together, how many days?', type: 'aptitude', difficulty: 'Easy', tags: ['Math','Work','TCS'], company: 'TCS', topic: 'Quantitative', options: ['6','6.67','7','7.5'], correct_answer: 1, solution_explanation: '1/12+1/15=9/60=3/20. Days=20/3≈6.67.', estimated_time_seconds: 60 },
  { id: 'tcs-q4', assessment_id: 'tcs-nqt-2026', title: 'Percentage', content: 'If 40% of a number is 200, what is 75% of that number?', type: 'aptitude', difficulty: 'Easy', tags: ['Math','Percentage','TCS'], company: 'TCS', topic: 'Quantitative', options: ['350','375','400','425'], correct_answer: 1, solution_explanation: 'Number=200/0.4=500. 75% of 500=375.', estimated_time_seconds: 45 },
  { id: 'tcs-q5', assessment_id: 'tcs-nqt-2026', title: 'Ratio & Proportion', content: 'A:B=3:4, B:C=5:6. Find A:B:C.', type: 'aptitude', difficulty: 'Medium', tags: ['Math','Ratio','TCS'], company: 'TCS', topic: 'Quantitative', options: ['15:20:24','3:5:6','15:20:18','9:12:16'], correct_answer: 0, solution_explanation: 'B LCM=20. A=15, B=20, C=24.', estimated_time_seconds: 90 },
  { id: 'tcs-q6', assessment_id: 'tcs-nqt-2026', title: 'Compound Interest', content: 'Find CI on ₹10000 at 10% for 2 years compounded annually.', type: 'aptitude', difficulty: 'Easy', tags: ['Math','CI','TCS'], company: 'TCS', topic: 'Quantitative', options: ['₹2000','₹2100','₹2200','₹2500'], correct_answer: 1, solution_explanation: 'A=10000(1.1)²=12100. CI=2100.', estimated_time_seconds: 60 },
  { id: 'tcs-q7', assessment_id: 'tcs-nqt-2026', title: 'Speed & Distance', content: 'A train 150m long passes a pole in 15 sec. Find its speed in km/h.', type: 'aptitude', difficulty: 'Easy', tags: ['Math','Speed','TCS'], company: 'TCS', topic: 'Quantitative', options: ['30','36','40','45'], correct_answer: 1, solution_explanation: 'Speed=150/15=10m/s=36km/h.', estimated_time_seconds: 45 },
  { id: 'tcs-q8', assessment_id: 'tcs-nqt-2026', title: 'Averages', content: 'Average of 5 numbers is 20. If one number is excluded, average becomes 18. Find excluded number.', type: 'aptitude', difficulty: 'Easy', tags: ['Math','Average','TCS'], company: 'TCS', topic: 'Quantitative', options: ['24','26','28','30'], correct_answer: 2, solution_explanation: 'Sum=100, remaining=72, excluded=28.', estimated_time_seconds: 45 },
  { id: 'tcs-q9', assessment_id: 'tcs-nqt-2026', title: 'Pattern Series', content: 'Find the missing number: 2, 6, 12, 20, 30, ?', type: 'aptitude', difficulty: 'Easy', tags: ['Logical','Sequence','TCS'], company: 'TCS', topic: 'Logical', options: ['40','42','44','48'], correct_answer: 1, solution_explanation: 'Differences: 4,6,8,10,12. Next=30+12=42.', estimated_time_seconds: 60 },
  { id: 'tcs-q10', assessment_id: 'tcs-nqt-2026', title: 'Blood Relations', content: 'Pointing to a photo, Arun said "He is the son of my mother\'s only daughter." How is the person related to Arun?', type: 'aptitude', difficulty: 'Medium', tags: ['Logical','Relations','TCS'], company: 'TCS', topic: 'Logical', options: ['Son','Nephew','Brother','Father'], correct_answer: 0, solution_explanation: 'Mother\'s only daughter is Arun (if female) or Arun\'s sister. Son of that person = Arun\'s son.', estimated_time_seconds: 90 },
  { id: 'tcs-q11', assessment_id: 'tcs-nqt-2026', title: 'Coding-Decoding', content: 'If COMPUTER=FRPSXWHU, then DATA=?', type: 'aptitude', difficulty: 'Easy', tags: ['Logical','Coding','TCS'], company: 'TCS', topic: 'Logical', options: ['GDWD','EDWD','FCVC','GDXD'], correct_answer: 0, solution_explanation: 'Each letter +3: D→G, A→D, T→W, A→D = GDWD.', estimated_time_seconds: 60 },
  { id: 'tcs-q12', assessment_id: 'tcs-nqt-2026', title: 'Syllogism', content: 'All dogs are animals. All animals are living beings. Conclusion: All dogs are living beings.', type: 'aptitude', difficulty: 'Easy', tags: ['Logical','Syllogism','TCS'], company: 'TCS', topic: 'Logical', options: ['True','False','Cannot determine','Partially true'], correct_answer: 0, solution_explanation: 'Valid syllogism - transitive relation holds.', estimated_time_seconds: 45 },
  { id: 'tcs-q13', assessment_id: 'tcs-nqt-2026', title: 'Synonym', content: 'Choose the synonym of "Ephemeral":', type: 'aptitude', difficulty: 'Easy', tags: ['Verbal','Synonym','TCS'], company: 'TCS', topic: 'Verbal', options: ['Permanent','Fleeting','Sturdy','Ancient'], correct_answer: 1, solution_explanation: 'Ephemeral means short-lived, fleeting.', estimated_time_seconds: 30 },
  { id: 'tcs-q14', assessment_id: 'tcs-nqt-2026', title: 'Antonym', content: 'Choose the antonym of "Benevolent":', type: 'aptitude', difficulty: 'Easy', tags: ['Verbal','Antonym','TCS'], company: 'TCS', topic: 'Verbal', options: ['Generous','Malevolent','Kind','Warm'], correct_answer: 1, solution_explanation: 'Benevolent=kind, opposite=malevolent.', estimated_time_seconds: 30 },
  { id: 'tcs-q15', assessment_id: 'tcs-nqt-2026', title: 'Sentence Correction', content: 'Which is grammatically correct?', type: 'aptitude', difficulty: 'Medium', tags: ['Verbal','Grammar','TCS'], company: 'TCS', topic: 'Verbal', options: ['He don\'t know nothing','He doesn\'t know anything','He don\'t knows anything','He doesn\'t knows nothing'], correct_answer: 1, solution_explanation: 'Correct subject-verb agreement and no double negative.', estimated_time_seconds: 45 },
  { id: 'tcs-q16', assessment_id: 'tcs-nqt-2026', title: 'Two Sum', content: 'Given an array of integers and a target, return indices of two numbers that add up to the target. Input: [2,7,11,15], target=9', type: 'aptitude', difficulty: 'Easy', tags: ['Array','Hash','TCS'], company: 'TCS', topic: 'DSA', options: ['O(n²) brute force only','Use HashMap for O(n)','Sort and binary search O(nlogn)','Not possible'], correct_answer: 1, solution_explanation: 'HashMap stores complement. One pass O(n).', estimated_time_seconds: 120 },
  { id: 'tcs-q17', assessment_id: 'tcs-nqt-2026', title: 'Reverse Linked List', content: 'What is the time complexity of reversing a singly linked list iteratively?', type: 'aptitude', difficulty: 'Easy', tags: ['LinkedList','TCS'], company: 'TCS', topic: 'DSA', options: ['O(1)','O(n)','O(n²)','O(log n)'], correct_answer: 1, solution_explanation: 'Single traversal with pointer manipulation.', estimated_time_seconds: 60 },
  // Amazon
  { id: 'amz-q1', assessment_id: 'amazon-oa-2026', title: 'Maximum Subarray', content: 'Find the contiguous subarray with the largest sum in [-2,1,-3,4,-1,2,1,-5,4].', type: 'aptitude', difficulty: 'Hard', tags: ['Array','DP','Amazon'], company: 'Amazon', topic: 'DSA', options: ['4','6','7','10'], correct_answer: 1, solution_explanation: 'Kadane\'s algorithm: subarray [4,-1,2,1] = 6.', estimated_time_seconds: 120 },
  { id: 'amz-q2', assessment_id: 'amazon-oa-2026', title: 'LRU Cache', content: 'Which data structure combination is optimal for O(1) get/put LRU Cache?', type: 'aptitude', difficulty: 'Hard', tags: ['Design','HashMap','Amazon'], company: 'Amazon', topic: 'DSA', options: ['Array + Stack','HashMap + Doubly Linked List','BST + Queue','Trie + Deque'], correct_answer: 1, solution_explanation: 'HashMap for O(1) lookup, DLL for O(1) insert/delete at ends.', estimated_time_seconds: 90 },
  { id: 'amz-q3', assessment_id: 'amazon-oa-2026', title: 'Number of Islands', content: 'Given a 2D grid of 1s and 0s, count the number of islands. Which approach?', type: 'aptitude', difficulty: 'Medium', tags: ['Graph','BFS','Amazon'], company: 'Amazon', topic: 'DSA', options: ['Dynamic Programming','BFS/DFS flood fill','Binary Search','Greedy'], correct_answer: 1, solution_explanation: 'BFS/DFS from each unvisited 1, marking visited. Count connected components.', estimated_time_seconds: 120 },
  // Accenture
  { id: 'acc-q1', assessment_id: 'accenture-2026', title: 'Abstract Reasoning', content: 'In a 3x3 grid, shapes rotate 90° clockwise each cell. What comes in position (3,3)?', type: 'aptitude', difficulty: 'Medium', tags: ['Abstract','Pattern','Accenture'], company: 'Accenture', topic: 'Logical', options: ['Circle','Triangle rotated 270°','Square','Triangle rotated 90°'], correct_answer: 1, solution_explanation: 'Following 90° clockwise rotation pattern across grid.', estimated_time_seconds: 90 },
  { id: 'acc-q2', assessment_id: 'accenture-2026', title: 'Critical Thinking', content: 'All roses are flowers. Some flowers fade quickly. Conclusion: Some roses fade quickly.', type: 'aptitude', difficulty: 'Easy', tags: ['Logical','Critical','Accenture'], company: 'Accenture', topic: 'Logical', options: ['Definitely true','Probably true','Probably false','Cannot be determined'], correct_answer: 3, solution_explanation: 'We cannot determine which flowers fade - could be non-rose flowers.', estimated_time_seconds: 60 },
  { id: 'acc-q3', assessment_id: 'accenture-2026', title: 'English Comprehension', content: '"The manager, along with the workers, ___ present." Fill in:', type: 'aptitude', difficulty: 'Easy', tags: ['Verbal','Grammar','Accenture'], company: 'Accenture', topic: 'Verbal', options: ['were','was','are','have been'], correct_answer: 1, solution_explanation: '"Along with" doesn\'t change subject. Manager(singular)→was.', estimated_time_seconds: 30 },
  // Cognizant
  { id: 'cog-q1', assessment_id: 'cognizant-2026', title: 'Debugging', content: 'int arr[5]={1,2,3,4,5}; printf("%d",arr[5]); What happens?', type: 'aptitude', difficulty: 'Medium', tags: ['C','Debug','Cognizant'], company: 'Cognizant', topic: 'Programming', options: ['Prints 5','Prints 0','Undefined behavior','Compilation error'], correct_answer: 2, solution_explanation: 'arr[5] is out of bounds (valid: 0-4). Undefined behavior.', estimated_time_seconds: 45 },
  { id: 'cog-q2', assessment_id: 'cognizant-2026', title: 'OOP Concepts', content: 'Which principle allows a child class to provide specific implementation of a parent method?', type: 'aptitude', difficulty: 'Easy', tags: ['OOP','Java','Cognizant'], company: 'Cognizant', topic: 'Programming', options: ['Encapsulation','Abstraction','Polymorphism (Override)','Inheritance'], correct_answer: 2, solution_explanation: 'Method overriding is runtime polymorphism.', estimated_time_seconds: 30 },
  // Infosys
  { id: 'inf-q1', assessment_id: 'infosys-2026', title: 'Number System', content: 'What is the remainder when 2^100 is divided by 3?', type: 'aptitude', difficulty: 'Medium', tags: ['Math','Number','Infosys'], company: 'Infosys', topic: 'Quantitative', options: ['0','1','2','Cannot determine'], correct_answer: 1, solution_explanation: '2^1=2(r2), 2^2=4(r1). 100 is even→r1.', estimated_time_seconds: 90 },
  { id: 'inf-q2', assessment_id: 'infosys-2026', title: 'Probability', content: 'Two dice are thrown. What is the probability that the sum is 7?', type: 'aptitude', difficulty: 'Easy', tags: ['Math','Probability','Infosys'], company: 'Infosys', topic: 'Quantitative', options: ['1/6','5/36','1/9','7/36'], correct_answer: 0, solution_explanation: 'Favorable outcomes: 6. Total=36. P=6/36=1/6.', estimated_time_seconds: 60 },
  { id: 'inf-q3', assessment_id: 'infosys-2026', title: 'Arrangement', content: '5 people sit in a row. In how many ways?', type: 'aptitude', difficulty: 'Easy', tags: ['Math','Permutation','Infosys'], company: 'Infosys', topic: 'Logical', options: ['60','100','120','150'], correct_answer: 2, solution_explanation: '5!=120.', estimated_time_seconds: 30 },
  { id: 'inf-q4', assessment_id: 'infosys-2026', title: 'Data Interpretation', content: 'A company revenue: 2022=₹40Cr, 2023=₹52Cr. What is % growth?', type: 'aptitude', difficulty: 'Easy', tags: ['Math','DI','Infosys'], company: 'Infosys', topic: 'Quantitative', options: ['20%','25%','30%','35%'], correct_answer: 2, solution_explanation: 'Growth=(52-40)/40*100=30%.', estimated_time_seconds: 45 },
  // Wipro
  { id: 'wip-q1', assessment_id: 'wipro-2026', title: 'Ages', content: 'Father is 3x son\'s age. After 12 years, he\'ll be 2x. Find son\'s current age.', type: 'aptitude', difficulty: 'Easy', tags: ['Math','Ages','Wipro'], company: 'Wipro', topic: 'Quantitative', options: ['10','12','14','16'], correct_answer: 1, solution_explanation: '3x+12=2(x+12). x=12.', estimated_time_seconds: 60 },
  { id: 'wip-q2', assessment_id: 'wipro-2026', title: 'Pipes & Cisterns', content: 'Pipe A fills in 20 min, B empties in 30 min. Both open, time to fill?', type: 'aptitude', difficulty: 'Medium', tags: ['Math','Pipes','Wipro'], company: 'Wipro', topic: 'Quantitative', options: ['50 min','60 min','45 min','40 min'], correct_answer: 1, solution_explanation: 'Net rate=1/20-1/30=1/60. Time=60 min.', estimated_time_seconds: 60 },
  // Capgemini
  { id: 'cap-q1', assessment_id: 'capgemini-2026', title: 'Pseudo Code', content: 'x=5; y=10; x=x+y; y=x-y; x=x-y; What are x,y?', type: 'aptitude', difficulty: 'Easy', tags: ['Logic','Pseudo','Capgemini'], company: 'Capgemini', topic: 'Programming', options: ['x=5,y=10','x=10,y=5','x=15,y=5','x=10,y=10'], correct_answer: 1, solution_explanation: 'Swap without temp: x=15,y=5,x=10. Result: x=10,y=5.', estimated_time_seconds: 60 },
  { id: 'cap-q2', assessment_id: 'capgemini-2026', title: 'Automata', content: 'A DFA accepts strings ending with "01". Minimum states needed?', type: 'aptitude', difficulty: 'Hard', tags: ['Theory','Automata','Capgemini'], company: 'Capgemini', topic: 'Programming', options: ['2','3','4','5'], correct_answer: 1, solution_explanation: '3 states: start, seen 0, seen 01(accept).', estimated_time_seconds: 90 },
  // Deloitte
  { id: 'del-q1', assessment_id: 'deloitte-2026', title: 'Data Analysis', content: 'A dataset has mean=50, std=10. What % lies between 40-60 (normal dist)?', type: 'aptitude', difficulty: 'Medium', tags: ['Stats','Analysis','Deloitte'], company: 'Deloitte', topic: 'Quantitative', options: ['50%','68%','95%','99%'], correct_answer: 1, solution_explanation: '40-60 is ±1 std deviation = 68% by empirical rule.', estimated_time_seconds: 45 },
  { id: 'del-q2', assessment_id: 'deloitte-2026', title: 'Logical Deduction', content: 'If all managers are leaders, and some leaders are innovators, which MUST be true?', type: 'aptitude', difficulty: 'Easy', tags: ['Logical','Deduction','Deloitte'], company: 'Deloitte', topic: 'Logical', options: ['All managers are innovators','Some managers may be innovators','No manager is an innovator','All innovators are managers'], correct_answer: 1, solution_explanation: 'Some managers MAY be innovators.', estimated_time_seconds: 60 },
];

async function seed() {
  console.log('🌱 Seeding Mock Hub data to Supabase...\n');

  // 1. Upsert assessments
  console.log(`📋 Seeding ${ASSESSMENTS.length} assessments...`);
  const aRes = await fetch(`${BASE}/assessments`, {
    method: 'POST',
    headers: H,
    body: JSON.stringify(ASSESSMENTS),
  });
  const aData = await aRes.text();
  console.log(`   Status: ${aRes.status} ${aRes.ok ? '✅' : '❌'}`);
  if (!aRes.ok) console.log('   Error:', aData.substring(0, 300));

  // 2. Upsert questions (in batches of 10)
  console.log(`\n📝 Seeding ${QUESTIONS.length} questions...`);
  const batchSize = 10;
  for (let i = 0; i < QUESTIONS.length; i += batchSize) {
    const batch = QUESTIONS.slice(i, i + batchSize);
    const qRes = await fetch(`${BASE}/questions`, {
      method: 'POST',
      headers: H,
      body: JSON.stringify(batch),
    });
    const qData = await qRes.text();
    console.log(`   Batch ${Math.floor(i/batchSize)+1}: ${qRes.status} ${qRes.ok ? '✅' : '❌'} (${batch.length} questions)`);
    if (!qRes.ok) console.log('   Error:', qData.substring(0, 200));
  }

  // 3. Verify
  console.log('\n🔍 Verifying seeded data...');
  const [aCount, qCount] = await Promise.all([
    fetch(`${BASE}/assessments?select=id`, { headers: H }).then(r => r.json()),
    fetch(`${BASE}/questions?select=id`, { headers: H }).then(r => r.json()),
  ]);
  console.log(`   Assessments in DB: ${Array.isArray(aCount) ? aCount.length : 'error'}`);
  console.log(`   Questions in DB:   ${Array.isArray(qCount) ? qCount.length : 'error'}`);
  
  const success = Array.isArray(aCount) && aCount.length >= ASSESSMENTS.length &&
                  Array.isArray(qCount) && qCount.length >= QUESTIONS.length;
  
  console.log('\n' + (success ? '✅ SEEDING COMPLETE — DB IS LIVE!' : '⚠️  Seeding incomplete, check errors above'));
}

seed().catch(console.error);
