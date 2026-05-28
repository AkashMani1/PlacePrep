import { Question } from './types';

// Seeded deterministic shuffler for randomized stable options
function getShuffledOptions(correctStr: string, distractors: string[], seed: number) {
  const rawList = [correctStr, ...distractors.slice(0, 3)];
  // Basic alphabetic sorting first to guarantee normalization
  rawList.sort();

  const listWithIndex = rawList.map((item, index) => ({ item, index }));
  listWithIndex.sort((a, b) => {
    const valA = (a.item.charCodeAt(0) || 0) + a.item.length + seed + a.index;
    const valB = (b.item.charCodeAt(0) || 0) + b.item.length + seed + b.index;
    const hashA = Math.sin(valA) * 1000;
    const hashB = Math.sin(valB) * 1000;
    return (hashA - Math.floor(hashA)) - (hashB - Math.floor(hashB));
  });

  const options = listWithIndex.map(x => x.item);
  const correctIdx = options.indexOf(correctStr);
  return { options, correctAnswer: correctIdx };
}

// ── GENERALIZED COMPANY ONLINE ASSESSMENT GENERATOR ──────────────────
export function generateCompanyQuestions(company: string, assignIdx: number, diff: 'Easy' | 'Medium' | 'Hard'): Question[] {
  const list: Question[] = [];
  const prefix = company === 'Amazon' ? 'amz' : company.toLowerCase().slice(0, 3);
  const idPrefix = `${prefix}-a${assignIdx}-q`;

  // Define section question counts based on the company's real Online Assessment (OA) rules
  let quantCount = 0;
  let verbalCount = 0;
  let logicalCount = 0;
  let techCount = 0;
  let codingCount = 0;

  if (company === 'TCS') {
    quantCount = 20;   // Numerical
    verbalCount = 25;  // Verbal
    logicalCount = 20; // Reasoning
    techCount = 15;    // Advanced Quant & Reasoning
    codingCount = 2;   // Coding
  } else if (company === 'Amazon') {
    quantCount = 5;
    logicalCount = 5;
    techCount = 5;     // CS/System Design MCQ
    codingCount = 2;   // Advanced Coding
  } else if (company === 'Accenture') {
    quantCount = 15;   // Cognitive Quant
    verbalCount = 17;  // Verbal
    logicalCount = 18; // Abstract Reasoning
    techCount = 40;    // Common Apps (12), Pseudocode (18), Network/Cloud (10)
  } else if (company === 'Cognizant') {
    quantCount = 10;
    logicalCount = 10;
    verbalCount = 10;
    techCount = 18;    // Debugging (15), DBMS (3)
    codingCount = 2;   // Coding
  } else if (company === 'Infosys') {
    quantCount = 10;
    logicalCount = 19; // Logical (15) + Puzzles (4)
    verbalCount = 20;
    techCount = 5;     // Pseudocode
  } else if (company === 'Wipro') {
    quantCount = 16;
    logicalCount = 14;
    verbalCount = 18;
    codingCount = 2;
  } else if (company === 'Capgemini') {
    verbalCount = 17;  // English Communication
    techCount = 15;    // Pseudocode
    logicalCount = 16; // Game-based Aptitude / Logic Puzzles
  } else if (company === 'Deloitte') {
    quantCount = 15;
    logicalCount = 20;
    verbalCount = 25;
    techCount = 15;    // Tech/CS MCQs
  }

  let globalQIdx = 1;

  // ──── SECTION 1: QUANTITATIVE APTITUDE ────
  for (let i = 1; i <= quantCount; i++) {
    const qSeed = assignIdx * 1000 + globalQIdx * 100;
    const d1 = assignIdx * 2 + i + 4;
    const d2 = assignIdx * 3 + i + 7;
    const baseVal = assignIdx * 150 + i * 40 + 300;

    let title = `Aptitude (Q${globalQIdx})`;
    let content = '';
    let correctStr = '';
    let distractors: string[] = [];

    if (i % 4 === 1) {
      title = `Time & Work (Q${globalQIdx})`;
      content = `[Quantitative] Person A can complete a task in ${d1} days, and Person B can complete it in ${d2} days. If they work together, in how many days will they finish the task?`;
      const ans = parseFloat(((d1 * d2) / (d1 + d2)).toFixed(2));
      correctStr = `${ans} days`;
      distractors = [
        `${(ans + 1.2).toFixed(2)} days`,
        `${(ans - 0.7).toFixed(2)} days`,
        `${(ans * 1.15).toFixed(2)} days`
      ];
    } else if (i % 4 === 2) {
      title = `Upstream Boat (Q${globalQIdx})`;
      const v = assignIdx * 2 + 10;
      const c = assignIdx + 1;
      const dist = (v - c) * 4;
      content = `[Quantitative] A vessel travels upstream with a still water speed of ${v} km/h. If the current flows at ${c} km/h, what is the total travel duration to row ${dist} km upstream?`;
      const ansVal = 4;
      correctStr = `${ansVal} hours`;
      distractors = [`${ansVal + 1.5} hours`, `${ansVal - 1.2} hours`, `${(ansVal * 1.25).toFixed(1)} hours`];
    } else if (i % 4 === 3) {
      title = `Successive Discounts (Q${i})`;
      content = `[Quantitative] Find the net selling price of an item marked at ₹${baseVal * 5} after successive discounts of 20% and 10%.`;
      const ans = Math.round(baseVal * 5 * 0.8 * 0.9);
      correctStr = `₹${ans}`;
      distractors = [`₹${ans + 40}`, `₹${ans - 30}`, `₹${Math.round(ans * 1.12)}`];
    } else {
      title = `Exclusion Averages (Q${i})`;
      const count = assignIdx + 5;
      const avg = assignIdx * 4 + 25;
      const newAvg = avg - 3;
      const valExcluded = count * avg - (count - 1) * newAvg;
      content = `[Quantitative] The average score of ${count} students in an exam is ${avg}. If one score is excluded, the new average becomes ${newAvg}. Find the excluded score.`;
      correctStr = `${valExcluded}`;
      distractors = [`${valExcluded + 6}`, `${valExcluded - 8}`, `${Math.round(valExcluded * 1.2)}`];
    }

    const shuffled = getShuffledOptions(correctStr, distractors, qSeed);

    list.push({
      id: `${idPrefix}${globalQIdx}`,
      title,
      content,
      type: 'aptitude',
      difficulty: diff,
      tags: ['Math', company, diff],
      company,
      topic: 'Quantitative',
      options: shuffled.options,
      correctAnswer: shuffled.correctAnswer,
      solutionExplanation: `Calculated deterministically. Correct: ${correctStr}.`,
      estimatedTimeSeconds: 75,
    });
    globalQIdx++;
  }

  // ──── SECTION 2: VERBAL ABILITY ────
  const vocabData = [
    { word: 'LUCID', syn: 'Clear and easy to understand', ant: 'Vague and hard to comprehend', dist1: 'Extremely detailed and complex', dist2: 'Kind and highly generous' },
    { word: 'EPHEMERAL', syn: 'Temporary and short-lived', ant: 'Eternal and permanent', dist1: 'Quickly rotating in circles', dist2: 'Wise and showing keen judgment' },
    { word: 'BENEVOLENT', syn: 'Kind and charitable', ant: 'Malevolent and hostile', dist1: 'Wise and highly logical', dist2: 'Careful and precise' },
    { word: 'METICULOUS', syn: 'Extremely careful and precise', ant: 'Careless and sloppy', dist1: 'Wise and showing good judgment', dist2: 'Short-lived and transient' },
    { word: 'SAGACIOUS', syn: 'Wise and showing keen judgment', ant: 'Ignorant and foolish', dist1: 'Kind and extremely generous', dist2: 'Meticulous and precise' },
    { word: 'PRAGMATIC', syn: 'Practical and realistic', ant: 'Idealistic and impractical', dist1: 'Vague and highly ambiguous', dist2: 'Temporary and short-lived' },
    { word: 'VIGILANT', syn: 'Watchful and alert to danger', ant: 'Negligent and careless', dist1: 'Wise and highly sagacious', dist2: 'Generous and charitable' },
    { word: 'RESILIENT', syn: 'Able to recover quickly', ant: 'Fragile and easily broken', dist1: 'Clear and easy to read', dist2: 'Extremely slow and redundant' },
    { word: 'AMBIGUOUS', syn: 'Open to double interpretation', ant: 'Clear and unambiguous', dist1: 'Careful and highly detailed', dist2: 'Kind and benevolent' },
    { word: 'COGNIZANT', syn: 'Fully aware and mindful', ant: 'Ignorant and unaware', dist1: 'Temporary and short-lived', dist2: 'Practical and realistic' },
    { word: 'REDUNDANT', syn: 'Unnecessary and superfluous', ant: 'Essential and necessary', dist1: 'Able to recover quickly', dist2: 'Wise and showing keen judgment' },
    { word: 'UBIQUITOUS', syn: 'Present everywhere at once', ant: 'Rare and scarce', dist1: 'Temporary and short-lived', dist2: 'Open to double interpretation' },
  ];

  const prepData = [
    { verb: 'absorbed', prep: 'in', noun: 'the detailed technical manual', dist1: 'with', dist2: 'at', dist3: 'on' },
    { verb: 'comply', prep: 'with', noun: 'the security guidelines', dist1: 'to', dist2: 'at', dist3: 'by' },
    { verb: 'proficient', prep: 'in', noun: 'cloud architecture design', dist1: 'at', dist2: 'for', dist3: 'with' },
    { verb: 'accustomed', prep: 'to', noun: 'working under tight deadlines', dist1: 'with', dist2: 'in', dist3: 'at' },
    { verb: 'interested', prep: 'in', noun: 'machine learning algorithms', dist1: 'on', dist2: 'for', dist3: 'at' },
    { verb: 'capable', prep: 'of', noun: 'handling high-concurrency traffic', dist1: 'for', dist2: 'to', dist3: 'in' },
    { verb: 'responsible', prep: 'for', noun: 'deploying the production build', dist1: 'to', dist2: 'with', dist3: 'in' },
    { verb: 'pleased', prep: 'with', noun: 'the candidate\'s performance', dist1: 'from', dist2: 'at', dist3: 'to' },
    { verb: 'rely', prep: 'on', noun: 'distributed caching mechanisms', dist1: 'at', dist2: 'in', dist3: 'with' },
    { verb: 'abstain', prep: 'from', noun: 'making unauthorized DB edits', dist1: 'to', dist2: 'by', dist3: 'with' },
  ];

  const svData = [
    { subject: 'Every one of the applicants', verbSingular: 'has', verbPlural: 'have', predicate: 'submitted the placement form.' },
    { subject: 'The team of expert engineers', verbSingular: 'is', verbPlural: 'are', predicate: 'currently resolving the outage.' },
    { subject: 'Neither of the proposed solutions', verbSingular: 'meets', verbPlural: 'meet', predicate: 'the required performance metrics.' },
    { subject: 'Each of the database transactions', verbSingular: 'requires', verbPlural: 'require', predicate: 'strict ACID verification.' },
    { subject: 'A pack of high-performance servers', verbSingular: 'was', verbPlural: 'were', predicate: 'provisioned for the workload.' },
    { subject: 'None of the submitted code blocks', verbSingular: 'contains', verbPlural: 'contain', predicate: 'any syntax or lint errors.' },
    { subject: 'The collection of study modules', verbSingular: 'helps', verbPlural: 'help', predicate: 'candidates clear the placement rounds.' },
    { subject: 'Either the team leads or the manager', verbSingular: 'approves', verbPlural: 'approve', predicate: 'the production release plan.' }
  ];

  const apData = [
    { active: 'The manager delivered the presentation.', passive: 'The presentation was delivered by the manager.', dist1: 'The presentation is delivered by the manager.', dist2: 'The presentation has been delivered by the manager.' },
    { active: 'The compiler detected the syntax error.', passive: 'The syntax error was detected by the compiler.', dist1: 'The syntax error is detected by the compiler.', dist2: 'The syntax error has been detected by the compiler.' },
    { active: 'Akash wrote the optimized backend code.', passive: 'The optimized backend code was written by Akash.', dist1: 'The optimized backend code is written by Akash.', dist2: 'The optimized backend code was being write by Akash.' },
    { active: 'The team deployed the application.', passive: 'The application was deployed by the team.', dist1: 'The application is deployed by the team.', dist2: 'The application has been deployed by the team.' },
    { active: 'The system generated the report.', passive: 'The report was generated by the system.', dist1: 'The report is generated by the system.', dist2: 'The report has been generated by the system.' },
    { active: 'The user clicked the button.', passive: 'The button was clicked by the user.', dist1: 'The button is clicked by the user.', dist2: 'The button has been clicked by the user.' },
    { active: 'The server rejected the connection.', passive: 'The connection was rejected by the server.', dist1: 'The connection is rejected by the server.', dist2: 'The connection was being reject by the server.' },
    { active: 'The algorithm sorted the dataset.', passive: 'The dataset was sorted by the algorithm.', dist1: 'The dataset is sorted by the algorithm.', dist2: 'The dataset has been sorted by the algorithm.' }
  ];

  for (let i = 1; i <= verbalCount; i++) {
    const qSeed = assignIdx * 1000 + globalQIdx * 100;
    let title = `Verbal (Q${globalQIdx})`;
    let content = '';
    let correctStr = '';
    let distractors: string[] = [];

    const mode = (assignIdx * 13 + i) % 4;

    if (mode === 0) {
      const idx = (assignIdx * 7 + i) % prepData.length;
      const data = prepData[idx];
      title = `Prepositions (Q${globalQIdx})`;
      content = `[Verbal] Fill in the blank: "The candidate was fully ${data.verb} ___ ${data.noun}."`;
      correctStr = data.prep;
      distractors = [data.dist1, data.dist2, data.dist3];
    } else if (mode === 1) {
      const idx = (assignIdx * 5 + i) % svData.length;
      const data = svData[idx];
      title = `Subject-Verb Agreement (Q${globalQIdx})`;
      content = `[Verbal] Choose the grammatically correct sentence structure representing Subject-Verb alignment:`;
      correctStr = `${data.subject} ${data.verbSingular} ${data.predicate}`;
      distractors = [
        `${data.subject} ${data.verbPlural} ${data.predicate}`,
        `${data.subject} ${data.verbSingular} being ${data.predicate}`,
        `${data.subject} is submit ${data.predicate}`
      ];
    } else if (mode === 2) {
      const idx = (assignIdx * 3 + i) % apData.length;
      const data = apData[idx];
      title = `Passive Form (Q${globalQIdx})`;
      content = `[Verbal] Identify the correct passive voice representation for: "${data.active}"`;
      correctStr = data.passive;
      distractors = [data.dist1, data.dist2, 'The sentence cannot be converted.'];
    } else {
      const idx = (assignIdx * 11 + i) % vocabData.length;
      const data = vocabData[idx];
      title = `Vocabulary Synonyms (Q${globalQIdx})`;
      content = `[Verbal] What is the closest synonym to the target vocabulary word: "${data.word}"?`;
      correctStr = data.syn;
      distractors = [data.ant, data.dist1, data.dist2];
    }

    const shuffled = getShuffledOptions(correctStr, distractors, qSeed);

    list.push({
      id: `${idPrefix}${globalQIdx}`,
      title,
      content,
      type: 'aptitude',
      difficulty: diff,
      tags: ['Verbal', company, diff],
      company,
      topic: 'Verbal',
      options: shuffled.options,
      correctAnswer: shuffled.correctAnswer,
      solutionExplanation: `Calculated grammatically. Correct: ${correctStr}.`,
      estimatedTimeSeconds: 45,
    });
    globalQIdx++;
  }

  // ──── SECTION 3: LOGICAL REASONING ────
  const decWords = ['RECURSION', 'ALGORITHM', 'DATABASE', 'POINTERS', 'COMPILER', 'SOFTWARE', 'NETWORK', 'FUNCTION', 'VARIABLE', 'ITERATION'];
  const names = [['A', 'B', 'C', 'D'], ['W', 'X', 'Y', 'Z'], ['P', 'Q', 'R', 'S'], ['K', 'L', 'M', 'N']];
  const syllogisms = [
    { s1: 'software', s2: 'tools', s3: 'programs', term: 'software', follows: 'Both I and II follow' },
    { s1: 'trees', s2: 'green things', s3: 'plants', term: 'trees', follows: 'Both I and II follow' },
    { s1: 'books', s2: 'pages', s3: 'words', term: 'books', follows: 'Both I and II follow' },
    { s1: 'cars', s2: 'vehicles', s3: 'engines', term: 'cars', follows: 'Both I and II follow' },
  ];

  for (let i = 1; i <= logicalCount; i++) {
    const qSeed = assignIdx * 1000 + globalQIdx * 100;
    let title = `Logical (Q${globalQIdx})`;
    let content = '';
    let correctStr = '';
    let distractors: string[] = [];

    const mode = (assignIdx * 11 + i) % 3;

    if (mode === 0) {
      title = `Coding-Decoding (Q${globalQIdx})`;
      const wIdx = (assignIdx * 7 + i) % decWords.length;
      const word = decWords[wIdx];
      
      // Simple swap adjacent characters encoding
      let encoded = '';
      for (let k = 0; k < word.length; k += 2) {
        if (k + 1 < word.length) {
          encoded += word[k + 1] + word[k];
        } else {
          encoded += word[k];
        }
      }
      content = `[Logical] If COMPUTER is encoded as OCPMTURE, then how is "${word}" coded in this logic?`;
      correctStr = encoded;
      
      // Plausible distractors
      const rev = word.split('').reverse().join('');
      const wrong1 = encoded.slice(1) + encoded[0];
      const wrong2 = word.slice(1) + word[0];
      distractors = [rev, wrong1, wrong2];
    } else if (mode === 1) {
      title = `Arrangements (Q${globalQIdx})`;
      const group = names[(assignIdx + i) % names.length];
      content = `[Logical] ${group[0]}, ${group[1]}, ${group[2]}, ${group[3]} sit in a row facing North. ${group[0]} is to the immediate right of ${group[1]}. ${group[2]} is between ${group[0]} and ${group[3]}. Who is sitting immediate left of ${group[3]}?`;
      correctStr = group[2];
      distractors = [group[0], group[1], 'Cannot be determined'];
    } else {
      title = `Syllogisms (Q${globalQIdx})`;
      const syl = syllogisms[(assignIdx + i) % syllogisms.length];
      content = `[Logical] Statements: All ${syl.s1} are ${syl.s2}. All ${syl.s2} are ${syl.s3}. Conclusions:\nI. All ${syl.term} are ${syl.s3}.\nII. Some ${syl.s2} are ${syl.term}.`;
      correctStr = syl.follows;
      distractors = ['Only I follows', 'Only II follows', 'Neither I nor II follows'];
    }

    const shuffled = getShuffledOptions(correctStr, distractors, qSeed);

    list.push({
      id: `${idPrefix}${globalQIdx}`,
      title,
      content,
      type: 'aptitude',
      difficulty: diff,
      tags: ['Logical', company, diff],
      company,
      topic: 'Logical',
      options: shuffled.options,
      correctAnswer: shuffled.correctAnswer,
      solutionExplanation: `Solved logically. Correct: ${correctStr}.`,
      estimatedTimeSeconds: 60,
    });
    globalQIdx++;
  }

  // ──── SECTION 4: TECHNICAL / CS CORE MCQs ────
  for (let i = 1; i <= techCount; i++) {
    const qSeed = assignIdx * 1000 + globalQIdx * 100;
    let title = `Technical (Q${globalQIdx})`;
    let content = '';
    let correctStr = '';
    let distractors: string[] = [];

    const mode = (assignIdx * 17 + i) % 20;

    if (mode === 0) {
      title = `Database Normalization (Q${globalQIdx})`;
      content = `[Technical] Which normal form (NF) handles removing transitive dependencies to maintain high database consistency?`;
      correctStr = 'Third Normal Form (3NF)';
      distractors = ['Second Normal Form (2NF)', 'First Normal Form (1NF)', 'Boyce-Codd Normal Form (BCNF)'];
    } else if (mode === 1) {
      title = `Object Oriented Principles (Q${globalQIdx})`;
      content = `[Technical] What OOP concept is exemplified when a child class implements a customized method inherited from its parent?`;
      correctStr = 'Method Overriding (Runtime Polymorphism)';
      distractors = ['Method Overloading (Compile-time)', 'Data Encapsulation', 'Multiple Inheritance'];
    } else if (mode === 2) {
      const bitX = (assignIdx * 3 + i + 4) % 15;
      const bitY = (assignIdx * 2 + i + 6) % 15;
      const bitAns = bitX & bitY;
      title = `Bitwise Operations (Q${globalQIdx})`;
      content = `[Technical] Pseudocode: What is the resulting decimal value of the bitwise expression: ${bitX} & ${bitY}?`;
      correctStr = `${bitAns}`;
      distractors = [`${bitX | bitY}`, `${bitX ^ bitY}`, `${bitAns + 3}`];
    } else if (mode === 3) {
      title = `Network Layers (Q${globalQIdx})`;
      content = `[Technical] Which ISO/OSI model layer is responsible for safe, end-to-end transport routing, congestion management, and logical addressing?`;
      correctStr = 'Network Layer';
      distractors = ['Transport Layer', 'Data Link Layer', 'Physical Layer'];
    } else if (mode === 4) {
      title = `Unsorted Search Complexity (Q${globalQIdx})`;
      content = `[Technical] What is the worst-case time complexity of finding an element in a raw, unsorted array of size N?`;
      correctStr = 'O(N)';
      distractors = ['O(log N)', 'O(N log N)', 'O(1)'];
    } else if (mode === 5) {
      title = `ACID Atomicity (Q${globalQIdx})`;
      content = `[Technical] Which database ACID property ensures that all queries within a transaction block are executed successfully, or none are at all?`;
      correctStr = 'Atomicity';
      distractors = ['Consistency', 'Isolation', 'Durability'];
    } else if (mode === 6) {
      title = `Deadlock Conditions (Q${globalQIdx})`;
      content = `[Technical] Which of the following is NOT one of Coffman\'s four necessary conditions for generating an operating system deadlock?`;
      correctStr = 'Preemption';
      distractors = ['Mutual Exclusion', 'Hold and Wait', 'Circular Wait'];
    } else if (mode === 7) {
      title = `CPU Scheduling (Q${globalQIdx})`;
      content = `[Technical] Which CPU scheduling algorithm minimizes average response times specifically inside interactive, time-sharing multi-user OS environments?`;
      correctStr = 'Round Robin (RR)';
      distractors = ['First Come First Served (FCFS)', 'Shortest Job First (SJF)', 'Priority Scheduling'];
    } else if (mode === 8) {
      title = `Virtual Memory Paging (Q${globalQIdx})`;
      content = `[Technical] Which operating system hardware/software management technique divides virtual memory spaces into fixed-size block frames?`;
      correctStr = 'Paging';
      distractors = ['Segmentation', 'Swapping', 'Dynamic Relocation'];
    } else if (mode === 9) {
      title = `SQL aggregate filter (Q${globalQIdx})`;
      content = `[Technical] Which standard SQL query clause is utilized specifically to filter rows based on aggregated values or group functions?`;
      correctStr = 'HAVING';
      distractors = ['WHERE', 'GROUP BY', 'ORDER BY'];
    } else if (mode === 10) {
      title = `OOP Abstraction (Q${globalQIdx})`;
      content = `[Technical] Which major object-oriented program design concept hides internal process implementation details, displaying only outer interface behavior?`;
      correctStr = 'Abstraction';
      distractors = ['Encapsulation', 'Inheritance', 'Polymorphism'];
    } else if (mode === 11) {
      title = `Graph Cycles (Q${globalQIdx})`;
      content = `[Technical] Which graph traversal strategy is most standard for detecting back-edges or cycles inside a directed graph in linear time?`;
      correctStr = 'Depth-First Search (DFS)';
      distractors = ['Breadth-First Search (BFS)', 'Dijkstra\'s shortest algorithm', 'Binary Search'];
    } else if (mode === 12) {
      title = `Stack Data Structure (Q${globalQIdx})`;
      content = `[Technical] Which application represents a core, primary real-world usage of a LIFO Stack data structure?`;
      correctStr = 'Function call activation records tracking';
      distractors = ['Process queue job scheduler', 'Printer buffer requests pool', 'Graph shortest path execution'];
    } else if (mode === 13) {
      title = `Hashing Collisions (Q${globalQIdx})`;
      content = `[Technical] Which collision resolution strategy allocates a separate linked list for every bucket address inside a hash table?`;
      correctStr = 'Chaining (Separate Chaining)';
      distractors = ['Linear Probing', 'Quadratic Probing', 'Double Hashing'];
    } else if (mode === 14) {
      title = `HTTP Server Errors (Q${globalQIdx})`;
      content = `[Technical] Which HTTP response status code indicates a generic Internal Server Error occurred on the server-side?`;
      correctStr = '500';
      distractors = ['404', '403', '200'];
    } else if (mode === 15) {
      title = `Process vs Thread (Q${globalQIdx})`;
      content = `[Technical] What is the fundamental memory difference between an operating system process and a thread?`;
      correctStr = 'Threads share process memory; processes possess isolated memory namespaces.';
      distractors = ['Processes share memory; threads possess isolated memory namespaces.', 'Both processes and threads possess completely isolated memory namespaces.', 'Both processes and threads share a single system-wide memory namespace.'];
    } else if (mode === 16) {
      title = `Cache Mapping (Q${globalQIdx})`;
      content = `[Technical] Which computer cache mapping strategy maps a memory block to one specific block line index exclusively?`;
      correctStr = 'Direct Mapped Cache';
      distractors = ['Fully Associative Cache', 'Set-Associative Cache', 'Random Cache'];
    } else if (mode === 17) {
      title = `AES Cryptography (Q${globalQIdx})`;
      content = `[Technical] Which algorithm represents a widely utilized, highly secure symmetric-key block cryptographic standard?`;
      correctStr = 'Advanced Encryption Standard (AES)';
      distractors = ['Rivest-Shamir-Adleman (RSA)', 'Diffie-Hellman Key Exchange', 'Elliptic Curve Cryptography (ECC)'];
    } else if (mode === 18) {
      title = `Cache Evictions (Q${globalQIdx})`;
      content = `[Technical] Which hardware cache replacement policy evicts the block that has not been accessed for the longest duration of time?`;
      correctStr = 'Least Recently Used (LRU)';
      distractors = ['Least Frequently Used (LFU)', 'First-In First-Out (FIFO)', 'Random Replacement'];
    } else {
      title = `Singleton Pattern (Q${globalQIdx})`;
      content = `[Technical] Which software design pattern guarantees that a class has exactly one global instance and provides a single access point?`;
      correctStr = 'Singleton Pattern';
      distractors = ['Factory Pattern', 'Observer Pattern', 'Decorator Pattern'];
    }

    const shuffled = getShuffledOptions(correctStr, distractors, qSeed);

    list.push({
      id: `${idPrefix}${globalQIdx}`,
      title,
      content,
      type: 'aptitude',
      difficulty: diff,
      tags: ['Technical', company, diff],
      company,
      topic: 'Logical', // Maps to logical/technical sections
      options: shuffled.options,
      correctAnswer: shuffled.correctAnswer,
      solutionExplanation: `Calculated technically. Correct: ${correctStr}.`,
      estimatedTimeSeconds: 60,
    });
    globalQIdx++;
  }

  // ──── SECTION 5: ADVANCED CODING (2 Questions) ────
  const codingData = [
    { title: 'Subarray Sum Kadane', content: 'Which optimal programmatic paradigm or technique computes the maximum contiguous subarray sum in O(N) linear time?', correct: "Kadane's Dynamic Programming Algorithm", dist1: 'Recursive Divide and Conquer', dist2: 'Two-pointer sliding sum' },
    { title: 'Shortest Path Dijkstra', content: 'Which graph algorithm handles finding the single-source shortest path correctly on graphs containing positive edges in O(V^2 + E) or O(E log V) time?', correct: "Dijkstra's Greedy Shortest Path Algorithm", dist1: 'Floyd-Warshall All-Pairs Algorithm', dist2: 'Bellman-Ford Dynamic Algorithm' },
    { title: 'MST Kruskal Strategy', content: 'Which greedy algorithm calculates the Minimum Spanning Tree (MST) of a connected, weighted graph by sorting all edges and adding them sequentially?', correct: "Kruskal's Greedy MST Algorithm", dist1: 'Prim\'s Dense Matrix MST Algorithm', dist2: 'Dijkstra\'s Shortest Path Algorithm' },
    { title: 'LCS DP Complexity', content: 'What is the optimal worst-case time complexity to calculate the Longest Common Subsequence (LCS) of two strings of lengths M and N using dynamic programming?', correct: "O(M * N)", dist1: 'O(2^(M+N))', dist2: 'O(M + N)' },
    { title: 'Floyd-Warshall DP', content: 'Which algorithmic strategy utilizes three nested loops to calculate shortest paths between all pairs of vertices on a graph containing vertices V?', correct: "Floyd-Warshall Dynamic All-Pairs Algorithm", dist1: 'Dijkstra\'s Greedy Strategy', dist2: 'Bellman-Ford Dynamic Relaxation' },
    { title: 'BST Traversal Queue', content: 'Which data structure is utilized within level-order traversal of a Binary Search Tree (BST) to explore all nodes level-by-level starting from the root?', correct: "First-In First-Out (FIFO) Queue", dist1: 'Last-In First-Out (LIFO) Stack', dist2: 'Priority Heap Queue' },
    { title: 'Matrix Chain DP', content: 'What paradigm calculates the most optimal parenthesization sequence for a chain of matrix multiplications minimizing total scalar multiplications?', correct: "Dynamic Programming (Matrix Chain Multiplication)", dist1: 'Greedy Interval Scheduling', dist2: 'Divide and Conquer partitioning' },
    { title: 'Knapsack DP Complexity', content: 'What is the optimal time complexity to solve the 0/1 Knapsack problem using dynamic programming with N items and maximum weight capacity W?', correct: "O(N * W)", dist1: 'O(2^N)', dist2: 'O(N log N)' }
  ];

  for (let i = 1; i <= codingCount; i++) {
    const qSeed = assignIdx * 1000 + globalQIdx * 100;
    const cIdx = (assignIdx * 7 + i) % codingData.length;
    const data = codingData[cIdx];

    const shuffled = getShuffledOptions(data.correct, [data.dist1, data.dist2, 'Brute force selection'], qSeed);

    list.push({
      id: `${idPrefix}${globalQIdx}`,
      title: `${data.title} [Part B: Advanced Coding]`,
      content: `[Coding] ${data.content}`,
      type: 'coding',
      difficulty: diff,
      tags: ['Coding', company, diff],
      company,
      topic: 'DSA',
      options: shuffled.options,
      correctAnswer: shuffled.correctAnswer,
      solutionExplanation: `Calculated algorithmically. Correct: ${data.correct}.`,
      estimatedTimeSeconds: 120,
    });
    globalQIdx++;
  }

  return list;
}

// ── MOCK QUESTIONS STATIC EXPORTS ────────────────────────────────────
export const MOCK_QUESTIONS: Question[] = [];

const companiesList = ['TCS', 'Amazon', 'Accenture', 'Cognizant', 'Infosys', 'Wipro', 'Capgemini', 'Deloitte'] as const;
const diffsList: ('Easy' | 'Medium' | 'Hard')[] = ['Medium', 'Easy', 'Medium', 'Hard', 'Medium', 'Easy', 'Medium', 'Hard', 'Medium', 'Easy'];

for (const comp of companiesList) {
  for (let idx = 1; idx <= 10; idx++) {
    const diff = diffsList[idx - 1];
    MOCK_QUESTIONS.push(...generateCompanyQuestions(comp, idx, diff));
  }
}

// ── SEED ASSESSMENTS ──────────────────────────────────────────────────
const tcsAssessments = [
  {
    id: 'tcs-nqt-2026',
    title: 'TCS NQT Simulator',
    category: 'Campus Drive',
    description: 'Complete simulation of TCS NQT: Quant, Verbal, Logical & Coding.',
    durationMinutes: 190,
    totalQuestions: 82,
    difficulty: 'Medium' as const,
    companyTags: ['TCS'],
    questions: MOCK_QUESTIONS.filter(q => q.id.startsWith('tcs-a1-q')),
  },
  {
    id: 'tcs-nqt-ninja-2026',
    title: 'TCS NQT Ninja Prep Mock',
    category: 'Campus Drive',
    description: 'Foundation and Advanced sections targeted for TCS Ninja placement (approx. 3.6 LPA). Duration 190 mins.',
    durationMinutes: 190,
    totalQuestions: 82,
    difficulty: 'Easy' as const,
    companyTags: ['TCS'],
    questions: MOCK_QUESTIONS.filter(q => q.id.startsWith('tcs-a2-q')),
  },
  {
    id: 'tcs-nqt-digital-2026',
    title: 'TCS NQT Digital Prep Mock',
    category: 'Campus Drive',
    description: 'Foundation and Advanced sections targeted for TCS Digital placement (approx. 7.0 LPA). Duration 190 mins.',
    durationMinutes: 190,
    totalQuestions: 82,
    difficulty: 'Medium' as const,
    companyTags: ['TCS'],
    questions: MOCK_QUESTIONS.filter(q => q.id.startsWith('tcs-a3-q')),
  },
  {
    id: 'tcs-nqt-prime-2026',
    title: 'TCS NQT Prime Prep Mock',
    category: 'Campus Drive',
    description: 'Foundation and Advanced sections targeted for TCS Prime placement (approx. 9.0-11.5 LPA). Duration 190 mins.',
    durationMinutes: 190,
    totalQuestions: 82,
    difficulty: 'Hard' as const,
    companyTags: ['TCS'],
    questions: MOCK_QUESTIONS.filter(q => q.id.startsWith('tcs-a4-q')),
  },
  {
    id: 'tcs-nqt-grand-2026',
    title: 'TCS NQT Grand Simulation Mock',
    category: 'Campus Drive',
    description: 'Ultimate simulated TCS NQT mixed exam with mixed difficulty covering all Ninja, Digital, and Prime roles.',
    durationMinutes: 190,
    totalQuestions: 82,
    difficulty: 'Medium' as const,
    companyTags: ['TCS'],
    questions: MOCK_QUESTIONS.filter(q => q.id.startsWith('tcs-a5-q')),
  },
  {
    id: 'tcs-nqt-adv-2026',
    title: 'TCS NQT Advanced Practice',
    category: 'Campus Drive',
    description: 'Advanced section focus for TCS Prime/Digital roles. Duration 190 mins.',
    durationMinutes: 190,
    totalQuestions: 82,
    difficulty: 'Easy' as const,
    companyTags: ['TCS'],
    questions: MOCK_QUESTIONS.filter(q => q.id.startsWith('tcs-a6-q')),
  },
  {
    id: 'tcs-nqt-ninja-v2',
    title: 'TCS NQT Ninja Simulator v2',
    category: 'Campus Drive',
    description: 'High-fidelity simulation matching current TCS Ninja recruitment guidelines.',
    durationMinutes: 190,
    totalQuestions: 82,
    difficulty: 'Medium' as const,
    companyTags: ['TCS'],
    questions: MOCK_QUESTIONS.filter(q => q.id.startsWith('tcs-a7-q')),
  },
  {
    id: 'tcs-nqt-digital-v2',
    title: 'TCS NQT Digital Simulator v2',
    category: 'Campus Drive',
    description: 'Advanced system and coding challenges matching TCS Digital hiring standards.',
    durationMinutes: 190,
    totalQuestions: 82,
    difficulty: 'Hard' as const,
    companyTags: ['TCS'],
    questions: MOCK_QUESTIONS.filter(q => q.id.startsWith('tcs-a8-q')),
  },
  {
    id: 'tcs-nqt-prime-v2',
    title: 'TCS NQT Prime Simulator v2',
    category: 'Campus Drive',
    description: 'Elite competitive programming and logic questions for TCS Prime roles (9-11 LPA).',
    durationMinutes: 190,
    totalQuestions: 82,
    difficulty: 'Medium' as const,
    companyTags: ['TCS'],
    questions: MOCK_QUESTIONS.filter(q => q.id.startsWith('tcs-a9-q')),
  },
  {
    id: 'tcs-nqt-grand-v2',
    title: 'TCS NQT Grand Simulator v2',
    category: 'Campus Drive',
    description: 'Full-length mixed difficulty national qualifier simulation covering all sections.',
    durationMinutes: 190,
    totalQuestions: 82,
    difficulty: 'Easy' as const,
    companyTags: ['TCS'],
    questions: MOCK_QUESTIONS.filter(q => q.id.startsWith('tcs-a10-q')),
  },
];

const otherCompanies = [
  { tag: 'Amazon', prefix: 'amz', title: 'Amazon OA Simulator', duration: 90, qs: 17, cat: 'FAANG OA', desc: 'Amazon OA: Advanced Aptitude, Data Structures, and 2 Elite Coding Questions.' },
  { tag: 'Accenture', prefix: 'acc', title: 'Accenture Cognitive Prep', duration: 90, qs: 90, cat: 'Campus Drive', desc: 'Accenture Cognitive and Technical assessment (Common Apps, Cloud, Network, Pseudocode).' },
  { tag: 'Cognizant', prefix: 'cog', title: 'Cognizant GenC Mock', duration: 120, qs: 50, cat: 'Campus Drive', desc: 'Cognizant mock simulation: Quantitative, Verbal, Logical, SQL, OOPs and Coding.' },
  { tag: 'Infosys', prefix: 'inf', title: 'Infosys OA Engine', duration: 100, qs: 54, cat: 'Campus Drive', desc: 'Infosys assessment: Quant, Logical, Verbal, Pseudocode and Puzzles.' },
  { tag: 'Wipro', prefix: 'wip', title: 'Wipro NLTH Mock', duration: 115, qs: 50, cat: 'Campus Drive', desc: 'Wipro NLTH/Turbo: Aptitude (Quant, Verbal, Logical) + 2 coding questions.' },
  { tag: 'Capgemini', prefix: 'cap', title: 'Capgemini Exceller', duration: 84, qs: 48, cat: 'Campus Drive', desc: 'Capgemini Exceller: English communication, Pseudocode, and Game Aptitude.' },
  { tag: 'Deloitte', prefix: 'del', title: 'Deloitte Assessment', duration: 75, qs: 75, cat: 'Campus Drive', desc: 'Deloitte OA: Quant, Verbal, Logical, and Core CS (DBMS, Networking, OOPs) MCQs.' },
];

const generatedAssessments = otherCompanies.flatMap(c => 
  Array.from({ length: 10 }, (_, i) => ({
    id: `${c.prefix}-a${i + 1}`,
    title: `${c.title} ${i + 1}`,
    category: c.cat,
    description: c.desc,
    durationMinutes: c.duration,
    totalQuestions: c.qs,
    difficulty: diffsList[i],
    companyTags: [c.tag],
    questions: MOCK_QUESTIONS.filter(q => q.id.startsWith(`${c.prefix}-a${i + 1}-q`)),
  }))
);

export const SEED_ASSESSMENTS: import('./types').Assessment[] = [
  ...tcsAssessments,
  ...generatedAssessments,
];

