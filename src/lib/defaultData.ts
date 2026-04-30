/* Developed by Akash Mani - This site is developed by Akash Mani. Original watermark of Akash Mani. */
import { Problem, WeekPlan, MockInterview, StarStory, KnowledgeItem, CSSubcategory } from './types';

export const DEFAULT_WEEKS: WeekPlan[] = [
  {
    week: 1, phase: 'Ninja', focus: 'Aptitude Core & Foundation',
    tasks: [
      { id: 'w1t1', label: 'Quant: Number System & Divisibility Rules (High Weight)', done: false },
      { id: 'w1t2', label: 'Quant: Percentages, Profit & Loss Basics', done: false },
      { id: 'w1t3', label: 'Logical: Blood Relations & Direction Sense', done: false },
      { id: 'w1t4', label: 'DSA: Master Basic Syntax, Loops, and If-Else patterns', done: false },
      { id: 'w1t5', label: 'Mock: Cognitive Section Baseline Aptitude Test', done: false },
    ],
  },
  {
    week: 2, phase: 'Ninja', focus: 'Time, Speed, Work & String Basics',
    tasks: [
      { id: 'w2t1', label: 'Quant: Time & Work, Pipes & Cisterns', done: false },
      { id: 'w2t2', label: 'Quant: Time Speed Distance, Relative Speed (Trains)', done: false },
      { id: 'w2t3', label: 'Logical: Seating Arrangement (Linear & Circular)', done: false },
      { id: 'w2t4', label: 'DSA Strings: Palindrome, Vowel Count, Reverse logic', done: false },
      { id: 'w2t5', label: 'Mock: 30-Min High Intensity Aptitude Drill', done: false },
    ],
  },
  {
    week: 3, phase: 'Ninja', focus: 'Aptitude Mastery & Basic Arrays',
    tasks: [
      { id: 'w3t1', label: 'Quant: Ratio & Proportion, Mixtures & Alligations', done: false },
      { id: 'w3t2', label: 'Verbal: Reading Comprehension Techniques', done: false },
      { id: 'w3t3', label: 'Logical: Syllogisms & Venn Diagrams', done: false },
      { id: 'w3t4', label: 'DSA Arrays: Max/Min, 2nd Largest, Simple Two Pointers', done: false },
      { id: 'w3t5', label: 'Mock: Standard Pattern Test (Verbal + Logical + Quant)', done: false },
    ],
  },
  {
    week: 4, phase: 'Ninja', focus: 'Coding Foundation',
    tasks: [
      { id: 'w4t1', label: 'DSA Math: GCD, LCM, Prime checks (Basics)', done: false },
      { id: 'w4t2', label: 'CS Core: OOPs concepts (Inheritance, Polymorphism)', done: false },
      { id: 'w4t3', label: 'Verbal: Sentence Completion & Error Spotting', done: false },
      { id: 'w4t4', label: 'HR Prep: Draft "Tell me about yourself" (1 min pitch)', done: false },
      { id: 'w4t5', label: 'Mock: Full Placement Integrated Test 1', done: false },
    ],
  },
  {
    week: 5, phase: 'Digital', focus: 'Advanced Arrays & Hashing',
    tasks: [
      { id: 'w5t1', label: 'DSA Arrays: Kadane\'s Algorithm (Max Subarray)', done: false },
      { id: 'w5t2', label: 'DSA Arrays: Merge Intervals & Sliding Window Basics', done: false },
      { id: 'w5t3', label: 'Logical: Advanced Puzzles & Number Series', done: false },
      { id: 'w5t4', label: 'CS Core: DBMS basics (ACID, Normalization, Keys)', done: false },
      { id: 'w5t5', label: 'Mock Code: 2 Medium Problems (SDE 1 focus)', done: false },
    ],
  },
  {
    week: 6, phase: 'Digital', focus: 'Hashing, Searching & SQL',
    tasks: [
      { id: 'w6t1', label: 'DSA Hashing: Two Sum, Frequency Maps, Group Anagrams', done: false },
      { id: 'w6t2', label: 'DSA Search: Binary Search & Lower/Upper Bounds', done: false },
      { id: 'w6t3', label: 'CS Core: SQL Queries (JOINs, Group By, Subqueries)', done: false },
      { id: 'w6t4', label: 'Quant: Advanced Probability & Permutations', done: false },
      { id: 'w6t5', label: 'Mock: DBMS & SQL Technical Interview simulation', done: false },
    ],
  },
  {
    week: 7, phase: 'Digital', focus: 'Stacks, Queues & Linked Lists',
    tasks: [
      { id: 'w7t1', label: 'DSA Stack: Valid Parentheses, Next Greater Element', done: false },
      { id: 'w7t2', label: 'DSA Linked List: Reverse, Detect Cycle, Middle', done: false },
      { id: 'w7t3', label: 'CS Core: Operating Systems (Threads, Deadlocks)', done: false },
      { id: 'w7t4', label: 'HR Prep: Draft 3 STAR Stories (Leadership, Conflict)', done: false },
      { id: 'w7t5', label: 'Mock Test: Core Specific Technical MCQ + Code', done: false },
    ],
  },
  {
    week: 8, phase: 'Digital', focus: 'Recursion & Advanced Algorithms',
    tasks: [
      { id: 'w8t1', label: 'DSA Recursion: Subsets, Permutations, Combinations', done: false },
      { id: 'w8t2', label: 'DSA Greedy: Activity Selection, Fractional Knapsack', done: false },
      { id: 'w8t3', label: 'CS Core: Computer Networks (OSI Model, TCP/UDP)', done: false },
      { id: 'w8t4', label: 'Resume Review: Tailor technical skills strictly for SDE Roles', done: false },
      { id: 'w8t5', label: 'Mock: Peer Interview covering OS & CN + 1 Medium code', done: false },
    ],
  },
  {
    week: 9, phase: 'Prime', focus: 'Dynamic Programming Foundations',
    tasks: [
      { id: 'w9t1', label: 'DSA DP: Climbing Stairs, Coin Change (Memoization)', done: false },
      { id: 'w9t2', label: 'DSA DP: Longest Common Subsequence, 0/1 Knapsack', done: false },
      { id: 'w9t3', label: 'System Design: REST vs SOAP basics', done: false },
      { id: 'w9t4', label: 'Mock Code: 90 Min Hard DP Problem (SDE 2 level)', done: false },
      { id: 'w9t5', label: 'HR Prep: "Why our company?", "Future Goals" alignment', done: false },
    ],
  },
  {
    week: 10, phase: 'Prime', focus: 'Trees & Advanced Graphs',
    tasks: [
      { id: 'w10t1', label: 'DSA Trees: Traversals, LCA, Validate BST', done: false },
      { id: 'w10t2', label: 'DSA Graphs: BFS/DFS Traversals, Number of Islands', done: false },
      { id: 'w10t3', label: 'DSA Graphs: Dijkstra\'s shortest path (Crucial for Advanced)', done: false },
      { id: 'w10t4', label: 'CS Core: Advanced DBMS (Indexing, B-Trees)', done: false },
      { id: 'w10t5', label: 'Mock Code: High Quality Graph Traversal Problem', done: false },
    ],
  },
  {
    week: 11, phase: 'Prime', focus: 'System Design & Revision',
    tasks: [
      { id: 'w11t1', label: 'System Architecture: Microservices, Load Balancing basics', done: false },
      { id: 'w11t2', label: 'Revision: Revisit all marked questions in the DSA Sheet', done: false },
      { id: 'w11t3', label: 'Revision: Re-calculate high-weight Quant formulas', done: false },
      { id: 'w11t4', label: 'Mock: Technical Interview focusing on Project Architecture', done: false },
      { id: 'w11t5', label: 'Mock Test: Final Full-Length Pattern Test', done: false },
    ],
  },
  {
    week: 12, phase: 'Prime', focus: 'The Final Polish',
    tasks: [
      { id: 'w12t1', label: 'Review all Mock Test feedback & patch weak areas', done: false },
      { id: 'w12t2', label: 'Behavioral: Record yourself answering situational TR questions', done: false },
      { id: 'w12t3', label: 'Technical: Re-read CS core subjects flashcards/SQL queries', done: false },
      { id: 'w12t4', label: 'Final Sanity Check: Resume, ID docs, Interview environment', done: false },
      { id: 'w12t5', label: 'Mock: The Ultimate Full-Length Mock Interview (HR + TR + MR)', done: false },
    ],
  },
];



export const DEFAULT_MOCKS: MockInterview[] = [
  { id: 'm1', type: 'Standard Aptitude Pattern', score: 42, maxScore: 60, date: '2026-01-20', feedback: 'Good logic, slow on quant. Memorize percentage/fraction tables.' },
];

export const DEFAULT_STARS: StarStory[] = [
  {
    id: 's1',
    tag: 'Leadership',
    situation: 'During our final year project, our team leader fell sick 2 weeks before the deadline, leaving the frontend integration unfinished.',
    task: 'As a backend developer, I needed to ensure the project was completed on time without compromising functionality.',
    action: 'I stepped up to coordinate the remaining team, learned basic React in 2 days, and led pair-programming sessions to finish the integrations.',
    result: 'We successfully deployed on time and received an "A" grade. I learned adaptability and cross-functional leadership.',
  },
];

export const DEFAULT_KNOWLEDGE: KnowledgeItem[] = [
  // ── OOPs ──
  { id: 'k_oops1', category: 'Core CS', subcategory: 'OOPs', question: 'Define basic principles of OOPs', answer: '' },
  { id: 'k_oops2', category: 'Core CS', subcategory: 'OOPs', question: 'What is Polymorphism?', answer: '' },
  { id: 'k_oops3', category: 'Core CS', subcategory: 'OOPs', question: 'Difference between overloading and overriding', answer: '' },
  { id: 'k_oops4', category: 'Core CS', subcategory: 'OOPs', question: 'What is meant by Interface?', answer: '' },
  { id: 'k_oops5', category: 'Core CS', subcategory: 'OOPs', question: 'What is meant by Abstract class?', answer: '' },
  { id: 'k_oops6', category: 'Core CS', subcategory: 'OOPs', question: 'Define types of inheritance', answer: '' },
  { id: 'k_oops7', category: 'Core CS', subcategory: 'OOPs', question: 'Difference between interface and abstract class', answer: '' },
  { id: 'k_oops8', category: 'Core CS', subcategory: 'OOPs', question: 'What is a Class?', answer: '' },
  { id: 'k_oops9', category: 'Core CS', subcategory: 'OOPs', question: 'Explain about Public and Private access specifiers', answer: '' },
  { id: 'k_oops10', category: 'Core CS', subcategory: 'OOPs', question: 'Difference between Default and Protected access specifiers', answer: '' },

  // ── Java ──
  { id: 'k_java1', category: 'Core CS', subcategory: 'Java', question: 'What is JAVA? What are its features?', answer: '' },
  { id: 'k_java2', category: 'Core CS', subcategory: 'Java', question: 'Why is Java platform independent?', answer: '' },
  { id: 'k_java3', category: 'Core CS', subcategory: 'Java', question: 'Why do we not install JVM directly?', answer: '' },
  { id: 'k_java4', category: 'Core CS', subcategory: 'Java', question: 'How does Java enable high performance?', answer: '' },
  { id: 'k_java5', category: 'Core CS', subcategory: 'Java', question: 'What are the Java IDEs?', answer: '' },
  { id: 'k_java6', category: 'Core CS', subcategory: 'Java', question: 'What do you mean by Constructor?', answer: '' },
  { id: 'k_java7', category: 'Core CS', subcategory: 'Java', question: 'What is meant by Local variable and Instance variable?', answer: '' },
  { id: 'k_java8', category: 'Core CS', subcategory: 'Java', question: 'What do you mean by constructor overloading?', answer: '' },
  { id: 'k_java9', category: 'Core CS', subcategory: 'Java', question: 'Diff between final, finally, finalize?', answer: '' },
  { id: 'k_java10', category: 'Core CS', subcategory: 'Java', question: 'Difference between Array and ArrayList', answer: '' },
  { id: 'k_java11', category: 'Core CS', subcategory: 'Java', question: 'Difference between String, StringBuilder, and StringBuffer', answer: '' },
  { id: 'k_java12', category: 'Core CS', subcategory: 'Java', question: 'Define mutable and immutable string', answer: '' },
  { id: 'k_java13', category: 'Core CS', subcategory: 'Java', question: 'Difference between HashMap and HashTable', answer: '' },
  { id: 'k_java14', category: 'Core CS', subcategory: 'Java', question: 'Difference between HashSet and TreeSet', answer: '' },
  { id: 'k_java15', category: 'Core CS', subcategory: 'Java', question: 'What is meant by Collections in Java?', answer: '' },
  { id: 'k_java16', category: 'Core CS', subcategory: 'Java', question: 'What are all the Classes and Interfaces available in collections?', answer: '' },
  { id: 'k_java17', category: 'Core CS', subcategory: 'Java', question: 'Explain about the different lists available in the collection', answer: '' },
  { id: 'k_java18', category: 'Core CS', subcategory: 'Java', question: 'What do you mean by public static void main(String args[])?', answer: '' },
  { id: 'k_java19', category: 'Core CS', subcategory: 'Java', question: 'Difference between IO and UTIL package in Java', answer: '' },

  // ── DBMS ──
  { id: 'k_dbms1', category: 'Core CS', subcategory: 'DBMS', question: 'What are advantages of DBMS over traditional file based systems?', answer: '' },
  { id: 'k_dbms2', category: 'Core CS', subcategory: 'DBMS', question: 'What are super, primary, candidate and foreign keys?', answer: '' },
  { id: 'k_dbms3', category: 'Core CS', subcategory: 'DBMS', question: 'Difference between primary key and unique constraints', answer: '' },
  { id: 'k_dbms4', category: 'Core CS', subcategory: 'DBMS', question: 'What is database normalization? Define Normal Forms.', answer: '' },
  { id: 'k_dbms5', category: 'Core CS', subcategory: 'DBMS', question: 'What are the differences between DDL, DML and DCL in SQL?', answer: '' },
  { id: 'k_dbms6', category: 'Core CS', subcategory: 'DBMS', question: 'Difference between HAVING and WHERE clause', answer: '' },
  { id: 'k_dbms7', category: 'Core CS', subcategory: 'DBMS', question: 'What is Join? Types of Joins in SQL?', answer: '' },
  { id: 'k_dbms8', category: 'Core CS', subcategory: 'DBMS', question: 'What is Identity in SQL?', answer: '' },
  { id: 'k_dbms9', category: 'Core CS', subcategory: 'DBMS', question: 'What is a view in SQL? How to create one? What are its uses?', answer: '' },
  { id: 'k_dbms10', category: 'Core CS', subcategory: 'DBMS', question: 'What is a Trigger? What is a Stored Procedure? Difference between them?', answer: '' },
  { id: 'k_dbms11', category: 'Core CS', subcategory: 'DBMS', question: 'What is a transaction? What are ACID properties?', answer: ''},
  { id: 'k_dbms12', category: 'Core CS', subcategory: 'DBMS', question: 'What are indexes? Difference between clustered and non-clustered indexes?', answer: '' },
  { id: 'k_dbms13', category: 'Core CS', subcategory: 'DBMS', question: 'Query to find 2nd highest salary of an employee', answer: 'SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees);\n-- OR using LIMIT/OFFSET:\nSELECT DISTINCT salary FROM employees ORDER BY salary DESC LIMIT 1 OFFSET 1;' },
  { id: 'k_dbms14', category: 'Core CS', subcategory: 'DBMS', question: 'Why can we not use WHERE clause with aggregate functions? (HAVING)', answer: '' },
  { id: 'k_dbms15', category: 'Core CS', subcategory: 'DBMS', question: 'Difference between primary key and unique key. Why use unique key if it allows only one null?', answer: '' },
  { id: 'k_dbms16', category: 'Core CS', subcategory: 'DBMS', question: "What's the difference between materialized and dynamic view?", answer: '' },
  { id: 'k_dbms17', category: 'Core CS', subcategory: 'DBMS', question: 'What is embedded and dynamic SQL?', answer: '' },
  { id: 'k_dbms18', category: 'Core CS', subcategory: 'DBMS', question: 'What is the difference between CHAR and VARCHAR?', answer: '' },
  { id: 'k_dbms19', category: 'Core CS', subcategory: 'DBMS', question: 'What is cardinality in DBMS?', answer: '' },
  { id: 'k_dbms20', category: 'Core CS', subcategory: 'DBMS', question: 'View Serializable and View Equivalence', answer: '' },
  { id: 'k_dbms21', category: 'Core CS', subcategory: 'DBMS', question: 'Cascadeless Recoverable Schedules', answer: '' },
  { id: 'k_dbms22', category: 'Core CS', subcategory: 'DBMS', question: 'Tell the list of data structures used in RDBMS, Network Data Model, and Hierarchical Data Model', answer: '' },

  // ── Data Structures ──
  { id: 'k_ds1', category: 'Core CS', subcategory: 'Data Structures', question: 'What is a Data Structure? Linear vs Non-linear?', answer: '' },
  { id: 'k_ds2', category: 'Core CS', subcategory: 'Data Structures', question: 'What are the various operations that can be performed on different Data Structures?', answer: '' },
  { id: 'k_ds3', category: 'Core CS', subcategory: 'Data Structures', question: 'What are the area of applications of Data Structures?', answer: '' },
  { id: 'k_ds4', category: 'Core CS', subcategory: 'Data Structures', question: 'What is the difference between file structure and storage structure?', answer: '' },
  { id: 'k_ds5', category: 'Core CS', subcategory: 'Data Structures', question: 'What is an Array? How is an Array different from Linked List?', answer: '' },
  { id: 'k_ds6', category: 'Core CS', subcategory: 'Data Structures', question: 'What is a multidimensional array? How are elements of a 2D array stored in memory?', answer: '' },
  { id: 'k_ds7', category: 'Core CS', subcategory: 'Data Structures', question: 'Calculate the address of a random element in a 2D array given base address BA', answer: '' },
  { id: 'k_ds8', category: 'Core CS', subcategory: 'Data Structures', question: 'What is Stack and where can it be used? Stack overflow condition?', answer: '' },
  { id: 'k_ds9', category: 'Core CS', subcategory: 'Data Structures', question: 'Difference between PUSH and POP. Steps for insertion and deletion in stack.', answer: '' },
  { id: 'k_ds10', category: 'Core CS', subcategory: 'Data Structures', question: 'List the area of applications where stack data structure can be used', answer: '' },
  { id: 'k_ds11', category: 'Core CS', subcategory: 'Data Structures', question: 'Which notations are used in evaluation of arithmetic expressions (prefix and postfix)?', answer: '' },
  { id: 'k_ds12', category: 'Core CS', subcategory: 'Data Structures', question: 'What is a Queue? How is it different from Stack? What is FIFO? What is a dequeue?', answer: '' },
  { id: 'k_ds13', category: 'Core CS', subcategory: 'Data Structures', question: 'Drawbacks of array implementation of Queue. Scenarios for circular queue insertion.', answer: '' },
  { id: 'k_ds14', category: 'Core CS', subcategory: 'Data Structures', question: 'What is minimum number of queues to implement a priority queue?', answer: '' },
  { id: 'k_ds15', category: 'Core CS', subcategory: 'Data Structures', question: 'What is a Linked List and what are its types? Are linked lists linear or non-linear?', answer: '' },
  { id: 'k_ds16', category: 'Core CS', subcategory: 'Data Structures', question: 'Advantages of Linked List over an array', answer: '' },
  { id: 'k_ds17', category: 'Core CS', subcategory: 'Data Structures', question: 'What is a doubly linked list?', answer: '' },
  { id: 'k_ds18', category: 'Core CS', subcategory: 'Data Structures', question: 'Which data structure is used to perform recursion?', answer: '' },
  { id: 'k_ds19', category: 'Core CS', subcategory: 'Data Structures', question: 'Which data structures are used for BFS and DFS of a graph?', answer: '' },
  { id: 'k_ds20', category: 'Core CS', subcategory: 'Data Structures', question: 'How to implement a stack using queue? How to implement a queue using stack?', answer: '' },
  { id: 'k_ds21', category: 'Core CS', subcategory: 'Data Structures', question: 'Which Data Structure should be used for implementing LRU cache?', answer: '' },
  { id: 'k_ds22', category: 'Core CS', subcategory: 'Data Structures', question: 'How to check if a given Binary Tree is BST or not?', answer: '' },
  { id: 'k_ds23', category: 'Core CS', subcategory: 'Data Structures', question: 'Define the tree data structure. List types of tree.', answer: '' },
  { id: 'k_ds24', category: 'Core CS', subcategory: 'Data Structures', question: 'What are Binary Trees? Maximum number of nodes in a binary tree of height k?', answer: '' },
  { id: 'k_ds25', category: 'Core CS', subcategory: 'Data Structures', question: 'How can AVL Tree be useful compared to Binary Search Tree?', answer: '' },
  { id: 'k_ds26', category: 'Core CS', subcategory: 'Data Structures', question: 'State the properties of B Tree. Differences between B tree and B+ tree.', answer: '' },
  { id: 'k_ds27', category: 'Core CS', subcategory: 'Data Structures', question: 'List some applications of Tree data structure', answer: '' },
  { id: 'k_ds28', category: 'Core CS', subcategory: 'Data Structures', question: 'Differentiate among cycle, path, and circuit in graphs', answer: '' },
  { id: 'k_ds29', category: 'Core CS', subcategory: 'Data Structures', question: 'Mention data structures used in graph implementation', answer: '' },
  { id: 'k_ds30', category: 'Core CS', subcategory: 'Data Structures', question: 'What are the applications of Graph data structure?', answer: '' },
  { id: 'k_ds31', category: 'Core CS', subcategory: 'Data Structures', question: 'List some applications of Multilinked Structures', answer: '' },
  { id: 'k_ds32', category: 'Core CS', subcategory: 'Data Structures', question: 'What is the difference between NULL and VOID?', answer: '' },
  { id: 'k_ds33', category: 'Core CS', subcategory: 'Data Structures', question: 'What is a Linked List? What are its types?', answer: '' },
  { id: 'k_ds34', category: 'Core CS', subcategory: 'Data Structures', question: 'What is FIFO? How does a Queue implement it?', answer: '' },
  { id: 'k_ds35', category: 'Core CS', subcategory: 'Data Structures', question: 'Which data structure suits the most in tree construction?', answer: '' },
  { id: 'k_ds36', category: 'Core CS', subcategory: 'Data Structures', question: 'How to reference all the elements in a one-dimension array?', answer: '' },

  // ── C Programming ──
  { id: 'k_c1', category: 'Core CS', subcategory: 'C Programming', question: 'What are local static variables? What is their use?', answer: '' },
  { id: 'k_c2', category: 'Core CS', subcategory: 'C Programming', question: 'Difference between i++ and ++i', answer: '' },
  { id: 'k_c3', category: 'Core CS', subcategory: 'C Programming', question: 'Difference between ++*p, *p++ and *++p', answer: '' },
  { id: 'k_c4', category: 'Core CS', subcategory: 'C Programming', question: 'Write the syntax in C to create a node in singly linked list', answer: '' },
  { id: 'k_c5', category: 'Core CS', subcategory: 'C Programming', question: 'What pointer type to use for heterogeneous linked list in C?', answer: '' },
  { id: 'k_c6', category: 'Core CS', subcategory: 'C Programming', question: 'Write C program to insert a node in circular singly list at beginning', answer: '' },
  { id: 'k_c7', category: 'Core CS', subcategory: 'C Programming', question: 'Write C code to perform in-order traversal on a binary tree', answer: '' },
  { id: 'k_c8', category: 'Core CS', subcategory: 'C Programming', question: 'Write recursive C function to count nodes in a binary tree', answer: '' },
  { id: 'k_c9', category: 'Core CS', subcategory: 'C Programming', question: 'Write recursive C function to calculate height of a binary tree', answer: '' },
  { id: 'k_c10', category: 'Core CS', subcategory: 'C Programming', question: 'What Are The Different Types Of Control Structures In Programming?', answer: '' },
  { id: 'k_c11', category: 'Core CS', subcategory: 'C Programming', question: 'What Is || Operator and how does it function?', answer: '' },
  { id: 'k_c12', category: 'Core CS', subcategory: 'C Programming', question: 'Can the "if" function be used in comparing strings?', answer: '' },
  { id: 'k_c13', category: 'Core CS', subcategory: 'C Programming', question: 'What Are Preprocessor Directives?', answer: '' },
  { id: 'k_c14', category: 'Core CS', subcategory: 'C Programming', question: 'Describe the order of precedence with regards to operators in C', answer: '' },
  { id: 'k_c15', category: 'Core CS', subcategory: 'C Programming', question: 'How do you determine the length of a string value stored in a variable?', answer: '' },
  { id: 'k_c16', category: 'Core CS', subcategory: 'C Programming', question: 'Why is C language considered a Middle Level Language?', answer: '' },
  { id: 'k_c17', category: 'Core CS', subcategory: 'C Programming', question: 'What are the different file extensions involved when programming in C?', answer: '' },
  { id: 'k_c18', category: 'Core CS', subcategory: 'C Programming', question: 'What Are Reserved Words?', answer: '' },
  { id: 'k_c19', category: 'Core CS', subcategory: 'C Programming', question: 'Write a C program to count number of words in a given sentence until EOF', answer: '' },
  { id: 'k_c20', category: 'Core CS', subcategory: 'C Programming', question: 'What will be the outcome of the conditional statement if the value of variable S is 10?', answer: '' },
  { id: 'k_c21', category: 'Core CS', subcategory: 'C Programming', question: 'What is wrong with this statement? myName = "robin";', answer: '' },
  { id: 'k_c22', category: 'Core CS', subcategory: 'C Programming', question: 'Is it possible to initialize a variable at the time it was declared?', answer: '' },

  // ── Algorithms ──
  { id: 'k_algo1', category: 'Core CS', subcategory: 'Algorithms', question: 'In what scenario can Binary Search be used?', answer: '' },
  { id: 'k_algo2', category: 'Core CS', subcategory: 'Algorithms', question: 'Advantages of Binary search over linear search', answer: '' },
  { id: 'k_algo3', category: 'Core CS', subcategory: 'Algorithms', question: 'What are the advantages of Selection Sort?', answer: '' },
  { id: 'k_algo4', category: 'Core CS', subcategory: 'Algorithms', question: 'Which data structures are used in BFS and DFS algorithm?', answer: '' },

  // ── Computer Networks ──
  { id: 'k_cn1', category: 'Core CS', subcategory: 'Computer Networks', question: 'TCP vs UDP?', answer: 'TCP: Connection-oriented, reliable, guarantees delivery, slower. Used in HTTP, FTP, Email.\nUDP: Connectionless, unreliable, faster. Used in Video streaming, Gaming, DNS.' },
  { id: 'k_cn2', category: 'Core CS', subcategory: 'Computer Networks', question: 'Explain the OSI Model layers.', answer: '7. Application (HTTP/FTP)\n6. Presentation (Encryption)\n5. Session (Sync/Ports)\n4. Transport (TCP/UDP)\n3. Network (IP, Routers)\n2. Data Link (MAC, Switches)\n1. Physical (Cables, Bits)' },

  // ── Operating Systems ──
  { id: 'k_os1', category: 'Core CS', subcategory: 'Operating Systems', question: 'Process vs Thread?', answer: 'Process: Program in execution. Heavyweight, isolated memory.\nThread: Segment of a process. Lightweight, shares memory, faster context switching.' },
  { id: 'k_os2', category: 'Core CS', subcategory: 'Operating Systems', question: 'What is a Deadlock? Give the 4 necessary conditions (Coffman).', answer: '1. Mutual Exclusion\n2. Hold and Wait\n3. No Preemption\n4. Circular Wait' },

  // --- APTITUDE ---
  { id: 'k10', category: 'Aptitude', question: 'Time & Work Shortcut: Two people working together', answer: 'If A can do work in X days and B in Y days:\nTogether: (X * Y) / (X + Y) days.' },
  { id: 'k11', category: 'Aptitude', question: 'Speed & Distance Shortcut: Average Speed', answer: 'Average speed = (2 * X * Y) / (X + Y)\nNot just (X+Y)/2!' },
  { id: 'k12', category: 'Aptitude', question: 'Percentage Shortcut: A is x% more than B', answer: 'B is less than A by: [x / (100 + x)] * 100 %\nIf A is x% less than B: [x / (100 - x)] * 100 %' },

  // --- HR ---
  { id: 'k13', category: 'HR', question: 'Tell me about yourself (Framework)', answer: '1. Present: Branch, College, CGPA.\n2. Past: Projects/internships and tech stack.\n3. Alignment: Why your skills fit the company.\nKeep under 90 seconds.' },
  { id: 'k14', category: 'HR', question: 'Why Our Company?', answer: 'The company offers an unmatched learning ecosystem and diverse projects. I value job stability, global exposure, and structured career progression.' },
  { id: 'k15', category: 'HR', question: 'Where do you see yourself in 3-5 years?', answer: 'Short term: Become a strong full-stack developer. Within 3-5 years: Take architectural responsibilities and mentor junior team members.' },
];

export const HABIT_TEMPLATES = [
  { id: 'h1', label: '🧠 Revise 1 Core CS Topic (OS/DBMS)', category: 'theory' },
  { id: 'h2', label: '💻 Solve 2 company specific DSA questions', category: 'coding' },
  { id: 'h3', label: '📝 Practice 1 STAR answer aloud', category: 'hr' },
  { id: 'h4', label: '📊 Solve 10 Aptitude questions (Timed)', category: 'aptitude' },
  { id: 'h5', label: '🔍 Update DSA tracker notes', category: 'review' },
];

export const QUOTES = [
  { text: "Most companies test accuracy and speed, not just complex logic. Master the basics.", author: "PlacePrep Strategy" },
  { text: "Coding rounds are marathons. Start with the easiest 2 questions quickly.", author: "Placement Fact" },
  { text: "Aptitude clears the first round. DSA clears the second. HR clears the final. Don't neglect any.", author: "Placement Fact" },
  { text: "Consistency > Cramming. 2 coding problems a day beats 14 on Sunday.", author: "Developer Wisdom" },
];

export const DEFAULT_HABIT_GROUPS = [
  {
    id: 'morning',
    title: 'Morning Block',
    items: [
      { id: 'm_watched', label: 'Study Theory', detail: 'Watched/Read Concepts' },
      { id: 'm_notes', label: 'Create Notes', detail: 'Made Prompts/Cheatsheets' },
      { id: 'm_understood', label: 'Concept Mastered', detail: 'Understood core logic deeply' },
    ]
  },
  {
    id: 'afternoon',
    title: 'Afternoon Block',
    items: [
      { id: 'a_solved', label: 'Solve Problems', detail: 'Practiced 3-4 questions' },
      { id: 'a_submit', label: 'Submit Code', detail: 'Successfully submitted' },
      { id: 'a_review', label: 'Review Solutions', detail: 'Optimized and reviewed edges' },
    ]
  },
  {
    id: 'evening',
    title: 'Evening Review',
    items: [
      { id: 'e_noted', label: 'Daily Reflection', detail: 'Noted key learnings & mistakes' },
      { id: 'e_progress', label: 'Update Tracker', detail: 'Logged daily progress' },
      { id: 'e_plan', label: 'Plan Next Day', detail: 'Set goals for tomorrow' },
    ]
  }
];

