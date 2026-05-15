/* Developed by Akash Mani - DSA Must-Do List Seed Data */
import { Problem } from './types';

const d = (id: string, name: string, topic: string, difficulty: 'Easy'|'Medium'|'Hard', leetcode: string, youtube: string): Problem => ({
  id, name, category: 'DSA', topic, difficulty, platform: 'LeetCode',
  status: 'Todo', notes: '', addedAt: '2026-05-10', isPriority: true,
  readingUrl: leetcode, videoUrl: youtube,
});

export const DSA_KILL_LIST: Problem[] = [
  // Math
  d('dsa_066','Palindrome Number','Math','Easy','https://leetcode.com/problems/palindrome-number/','https://youtu.be/JnGbicu7Jzw'),
  d('dsa_067','Sqrt(x)','Math','Easy','https://leetcode.com/problems/sqrtx/','https://youtu.be/KBI2nBVRDIO'),
  d('dsa_068','Pow(x, n)','Math','Medium','https://leetcode.com/problems/powx-n/','https://www.youtube.com/results?search_query=LeetCode+Pow+x+n'),
  d('dsa_101','Reverse Integer','Math','Medium','https://leetcode.com/problems/reverse-integer/','https://www.youtube.com/watch?v=HAgLH58IgJQ'),
  d('dsa_102','Count Primes','Math','Medium','https://leetcode.com/problems/count-primes/','https://www.youtube.com/watch?v=eKp56OLhoQs'),
  d('dsa_103','Find Greatest Common Divisor of Array','Math','Easy','https://leetcode.com/problems/find-greatest-common-divisor-of-array/','https://www.youtube.com/watch?v=J63JPxqmyzg'),
  d('dsa_124','Count Digits','Math','Easy','https://www.google.com/search?q=Count+digits+in+a+number','https://youtu.be/HAgLH58IgJQ'),
  d('dsa_125','Count Odd Digits','Math','Easy','https://www.google.com/search?q=Count+odd+digits+in+a+number','https://www.youtube.com/results?search_query=Count+odd+digits'),
  d('dsa_126','Largest Digit','Math','Easy','https://www.google.com/search?q=Largest+digit+in+a+number','https://www.youtube.com/results?search_query=Largest+digit+in+a+number'),
  d('dsa_127','Divisors of a Number','Math','Easy','https://www.geeksforgeeks.org/find-all-factors-of-a-natural-number/','https://youtu.be/1xNbjMdbjug'),
  d('dsa_128','Factorial Trailing Zeroes','Math','Medium','https://leetcode.com/problems/factorial-trailing-zeroes/','https://youtu.be/8xCBt3tI3sE'),
  d('dsa_129','Armstrong Number','Math','Easy','https://www.geeksforgeeks.org/program-for-armstrong-numbers/','https://www.youtube.com/results?search_query=Armstrong+Number'),
  d('dsa_130','Perfect Number','Math','Easy','https://www.geeksforgeeks.org/perfect-number/','https://www.youtube.com/results?search_query=Perfect+Number'),
  d('dsa_131','LCM (Least Common Multiple)','Math','Easy','https://www.google.com/search?q=LCM+of+two+numbers','https://www.youtube.com/results?search_query=LCM+of+two+numbers+using+GCD'),
  d('dsa_132','Print Primes','Math','Easy','https://www.google.com/search?q=Print+all+primes+till+N','https://www.youtube.com/results?search_query=Print+all+primes+till+N'),
  d('dsa_133','Prime Factorization','Math','Medium','https://www.geeksforgeeks.org/prime-factorization-using-sieve-olog-n-multiple-queries/','https://www.youtube.com/results?search_query=Prime+Factorization'),
  d('dsa_134','Count Primes in Range','Math','Medium','https://www.geeksforgeeks.org/count-primes-range/','https://www.youtube.com/results?search_query=Count+Primes+in+Range'),

  // Arrays
  d('dsa_001','Remove Element','Arrays','Easy','https://leetcode.com/problems/remove-element/','https://youtu.be/xj5XdNfm24'),
  d('dsa_006','Merge Sorted Array','Arrays','Easy','https://leetcode.com/problems/merge-sorted-array/','https://www.youtube.com/results?search_query=LeetCode+Merge+Sorted+Array'),
  d('dsa_007','Best Time to Buy and Sell Stock','Arrays','Easy','https://leetcode.com/problems/best-time-to-buy-and-sell-stock/','https://youtu.be/upkF2hUd5dq'),
  d('dsa_008','Remove Duplicates from Sorted Array II','Arrays','Medium','https://leetcode.com/problems/remove-duplicates-from-sorted-array-ii/','https://youtu.be/zl15jCfADpl'),
  d('dsa_009','Rotate Array','Arrays','Medium','https://leetcode.com/problems/rotate-array/','https://youtu.be/2tAyVoikNew'),
  d('dsa_010','Best Time to Buy and Sell Stock II','Arrays','Medium','https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/','https://www.youtube.com/results?search_query=LeetCode+Best+Time+to+Buy+and+Sell+Stock+II'),
  d('dsa_011','Jump Game','Arrays','Medium','https://leetcode.com/problems/jump-game/','https://www.youtube.com/results?search_query=LeetCode+Jump+Game'),
  d('dsa_013','Trapping Rain Water','Arrays','Hard','https://leetcode.com/problems/trapping-rain-water/','https://www.youtube.com/results?search_query=LeetCode+Trapping+Rain+Water'),
  d('dsa_014','Candy','Arrays','Hard','https://leetcode.com/problems/candy/','https://www.youtube.com/results?search_query=LeetCode+Candy'),
  d('dsa_019','Minimum Amount of Time to Collect Garbage','Arrays','Medium','https://leetcode.com/problems/minimum-amount-of-time-to-collect-garbage/','https://www.youtube.com/results?search_query=LeetCode+Minimum+Amount+of+Time+to+Collect+Garbage'),
  d('dsa_104','Running Sum of 1d Array','Arrays','Easy','https://leetcode.com/problems/running-sum-of-1d-array/','https://www.youtube.com/watch?v=Y8qz0kWJt1E'),
  d('dsa_105','Max Consecutive Ones','Arrays','Easy','https://leetcode.com/problems/max-consecutive-ones/','https://www.youtube.com/watch?v=Mo33MjjMlyA'),
  d('dsa_106','Move Zeroes','Arrays','Easy','https://leetcode.com/problems/move-zeroes/','https://www.youtube.com/watch?v=wtVYyoy6z4Q'),
  d('dsa_107','Remove Duplicates from Sorted Array','Arrays','Easy','https://leetcode.com/problems/remove-duplicates-from-sorted-array/','https://www.youtube.com/watch?v=Fm_p9lJ4Z_8'),
  d('dsa_108','Missing Number','Arrays','Easy','https://leetcode.com/problems/missing-number/','https://www.youtube.com/watch?v=WnPLSRLSANE'),
  d('dsa_109','Sort Colors','Arrays','Medium','https://leetcode.com/problems/sort-colors/','https://www.youtube.com/watch?v=oaVa-9wmpns'),
  d('dsa_110','Next Permutation','Arrays','Medium','https://leetcode.com/problems/next-permutation/','https://www.youtube.com/watch?v=JDOXKqF60RQ'),
  d('dsa_111','Majority Element','Arrays','Easy','https://leetcode.com/problems/majority-element/','https://www.youtube.com/watch?v=nP_ns3uSh80'),
  d('dsa_112','Majority Element II','Arrays','Medium','https://leetcode.com/problems/majority-element-ii/','https://www.youtube.com/watch?v=vwZj1K0e9U0'),
  d('dsa_113','Subarray Sum Equals K','Arrays','Medium','https://leetcode.com/problems/subarray-sum-equals-k/','https://www.youtube.com/watch?v=fFVZt-6sgyo'),
  d('dsa_114','Maximum Points You Can Obtain from Cards','Arrays','Medium','https://leetcode.com/problems/maximum-points-you-can-obtain-from-cards/','https://www.youtube.com/watch?v=O8r0Z0Gx8fM'),
  d('dsa_135','Count Odd Numbers in Array','Arrays','Easy','https://www.google.com/search?q=Count+odd+numbers+in+array','https://www.youtube.com/results?search_query=Count+odd+numbers+in+array'),
  d('dsa_136','Check if Array is Sorted','Arrays','Easy','https://www.google.com/search?q=Check+if+array+is+sorted','https://www.youtube.com/results?search_query=Check+if+array+is+sorted'),
  d('dsa_137','Second Highest Frequency Element','Arrays','Medium','https://www.google.com/search?q=Second+highest+frequency+element+in+array','https://www.youtube.com/results?search_query=Second+highest+frequency+element+in+array'),
  d('dsa_138','Linear Search','Arrays','Easy','https://www.google.com/search?q=Linear+search+in+array','https://www.youtube.com/results?search_query=Linear+search+in+array'),
  d('dsa_139','Largest Element in Array','Arrays','Easy','https://www.google.com/search?q=Largest+element+in+array','https://www.youtube.com/results?search_query=Largest+element+in+array'),
  d('dsa_140','Second Largest Element in Array','Arrays','Easy','https://www.google.com/search?q=Second+largest+element+in+array','https://www.youtube.com/results?search_query=Second+largest+element+in+array'),
  d('dsa_141','Union of Two Sorted Arrays','Arrays','Medium','https://www.geeksforgeeks.org/union-of-two-sorted-arrays/','https://www.youtube.com/results?search_query=Union+of+Two+Sorted+Arrays'),
  d('dsa_142','Intersection of Two Arrays','Arrays','Easy','https://leetcode.com/problems/intersection-of-two-arrays/','https://www.youtube.com/results?search_query=Intersection+of+Two+Arrays'),
  d('dsa_143','Leaders in an Array','Arrays','Medium','https://www.geeksforgeeks.org/leaders-in-an-array/','https://www.youtube.com/results?search_query=Leaders+in+an+Array'),
  d('dsa_144','Rearrange Array Elements by Sign','Arrays','Medium','https://leetcode.com/problems/rearrange-array-elements-by-sign/','https://www.youtube.com/results?search_query=Rearrange+Array+Elements+by+Sign'),
  d('dsa_145','Pascal\'s Triangle','Arrays','Easy','https://leetcode.com/problems/pascals-triangle/','https://www.youtube.com/results?search_query=Pascal+Triangle'),
  d('dsa_146','Missing and Repeating Number','Arrays','Medium','https://www.geeksforgeeks.org/find-a-repeating-and-a-missing-number/','https://www.youtube.com/results?search_query=Missing+and+Repeating+Number'),

  // Strings
  d('dsa_002','Find the Index of the First Occurrence in a String','Strings','Easy','https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/','https://youtu.be/WOZo3leWE98'),
  d('dsa_003','Longest Common Prefix','Strings','Easy','https://leetcode.com/problems/longest-common-prefix/','https://youtu.be/P4rV9qW55Ck'),
  d('dsa_004','Length of Last Word','Strings','Easy','https://leetcode.com/problems/length-of-last-word/','https://youtu.be/n8y0Twfcf-Y'),
  d('dsa_005','Roman to Integer','Strings','Easy','https://leetcode.com/problems/roman-to-integer/','https://www.youtube.com/results?search_query=LeetCode+Roman+to+Integer'),
  d('dsa_012','Reverse Words in a String','Strings','Medium','https://leetcode.com/problems/reverse-words-in-a-string/','https://youtu.be/nP-vkiKyUuq'),
  d('dsa_015','Defanging an IP Address','Strings','Easy','https://leetcode.com/problems/defanging-an-ip-address/','https://www.youtube.com/results?search_query=LeetCode+Defanging+an+IP+Address'),
  d('dsa_016','Maximum Number of Words Found in Sentences','Strings','Easy','https://leetcode.com/problems/maximum-number-of-words-found-in-sentences/','https://youtu.be/qBSXZrU-ncw'),
  d('dsa_017','Check If Two String Arrays are Equivalent','Strings','Easy','https://leetcode.com/problems/check-if-two-string-arrays-are-equivalent/','https://youtu.be/qzb5H7qF5wq'),
  d('dsa_018','Number of Senior Citizens','Strings','Easy','https://leetcode.com/problems/number-of-senior-citizens/','https://youtu.be/qvy9B1JK-co'),
  d('dsa_020','Find and Replace Pattern','Strings','Medium','https://leetcode.com/problems/find-and-replace-pattern/','https://youtu.be/LKs-pWrm0aQ'),
  d('dsa_021','Number of Pairs of Strings With Concatenation','Strings','Medium','https://leetcode.com/problems/number-of-pairs-of-strings-with-concatenation-equal-to-target/','https://youtu.be/O5khhibfKME'),
  d('dsa_022','Valid Number','Strings','Hard','https://leetcode.com/problems/valid-number/','https://www.youtube.com/results?search_query=LeetCode+Valid+Number'),
  d('dsa_115','Reverse String','Strings','Easy','https://leetcode.com/problems/reverse-string/','https://www.youtube.com/watch?v=8g1c1t8z8pY'),
  d('dsa_116','Largest Odd Number in String','Strings','Easy','https://leetcode.com/problems/largest-odd-number-in-string/','https://www.youtube.com/watch?v=5zvY2Zg0UeA'),
  d('dsa_117','Rotate String','Strings','Easy','https://leetcode.com/problems/rotate-string/','https://www.youtube.com/watch?v=Zs9sXnYfO2Y'),
  d('dsa_118','Sort Characters By Frequency','Strings','Medium','https://leetcode.com/problems/sort-characters-by-frequency/','https://www.youtube.com/watch?v=2n1fO0r8i6g'),
  d('dsa_119','Longest Substring with At Most K Distinct Characters','Strings','Medium','https://leetcode.com/problems/longest-substring-with-at-most-k-distinct-characters/','https://www.youtube.com/watch?v=teM9ZsVRQyc'),
  d('dsa_120','Number of Substrings Containing All Three Characters','Strings','Medium','https://leetcode.com/problems/number-of-substrings-containing-all-three-characters/','https://www.youtube.com/watch?v=xtqN4qlgr8s'),

  // Hashmap
  d('dsa_037','Ransom Note','Hashmap','Easy','https://leetcode.com/problems/ransom-note/','https://youtu.be/wHTLIMkq3Fc'),
  d('dsa_038','Isomorphic Strings','Hashmap','Easy','https://leetcode.com/problems/isomorphic-strings/','https://youtu.be/jCz0lqK4VYA'),
  d('dsa_039','Word Pattern','Hashmap','Easy','https://leetcode.com/problems/word-pattern/','https://youtu.be/mOkVAT6-ol'),
  d('dsa_040','Valid Anagram','Hashmap','Easy','https://leetcode.com/problems/valid-anagram/','https://youtu.be/z9-TtSvoRIU'),
  d('dsa_041','Two Sum','Hashmap','Easy','https://leetcode.com/problems/two-sum/','https://youtu.be/Ux0Fqy0cx9M'),
  d('dsa_042','Group Anagrams','Hashmap','Medium','https://leetcode.com/problems/group-anagrams/','https://youtu.be/MxdE6ekmzak'),
  d('dsa_043','Longest Consecutive Sequence','Hashmap','Medium','https://leetcode.com/problems/longest-consecutive-sequence/','https://youtu.be/0PUpzsUqyEM'),
  d('dsa_123','Top K Frequent Elements','Hashmap','Medium','https://leetcode.com/problems/top-k-frequent-elements/','https://www.youtube.com/watch?v=YPTqKIgVk-k'),

  // Two Pointers
  d('dsa_028','Valid Palindrome','Two Pointers','Easy','https://leetcode.com/problems/valid-palindrome/','https://youtu.be/C6v0dBVrvbw'),
  d('dsa_029','Is Subsequence','Two Pointers','Easy','https://leetcode.com/problems/is-subsequence/','https://youtu.be/3V96ois4YSs'),
  d('dsa_030','Two Sum II','Two Pointers','Medium','https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/','https://youtu.be/26f-QDKLzMQ'),
  d('dsa_031','Container With Most Water','Two Pointers','Medium','https://leetcode.com/problems/container-with-most-water/','https://youtu.be/JEAcl9zTpzE'),
  d('dsa_032','3Sum','Two Pointers','Medium','https://leetcode.com/problems/3sum/','https://youtu.be/5Cz3FzCRVzY'),

  // Sliding Window
  d('dsa_033','Minimum Size Subarray Sum','Sliding Window','Medium','https://leetcode.com/problems/minimum-size-subarray-sum/','https://youtu.be/5mlk4xFBoWA'),
  d('dsa_034','Longest Substring Without Repeating Characters','Sliding Window','Medium','https://leetcode.com/problems/longest-substring-without-repeating-characters/','https://youtu.be/UGX8QMSPZQ'),
  d('dsa_035','Substring with Concatenation of All Words','Sliding Window','Hard','https://leetcode.com/problems/substring-with-concatenation-of-all-words/','https://www.youtube.com/results?search_query=LeetCode+Substring+with+Concatenation+of+All+Words'),
  d('dsa_036','Minimum Window Substring','Sliding Window','Hard','https://leetcode.com/problems/minimum-window-substring/','https://youtu.be/OTadHSqZmOc'),
  d('dsa_121','Sliding Window Core Playlist (Striver)','Sliding Window','Medium','https://www.youtube.com/watch?v=MK-NZ4hN7rs','https://www.youtube.com/watch?v=MK-NZ4hN7rs'),
  d('dsa_122','Sliding Window Core Playlist (Aditya Verma)','Sliding Window','Medium','https://www.youtube.com/watch?v=KtpqeN0GxgQ','https://www.youtube.com/watch?v=KtpqeN0GxgQ'),

  // Bit Manipulation
  d('dsa_062','Add Binary','Bit Manipulation','Easy','https://leetcode.com/problems/add-binary/','https://youtu.be/2JJD8PeKqCE'),
  d('dsa_063','Reverse Bits','Bit Manipulation','Easy','https://leetcode.com/problems/reverse-bits/','https://www.youtube.com/results?search_query=LeetCode+Reverse+Bits'),
  d('dsa_064','Number of 1 Bits','Bit Manipulation','Easy','https://leetcode.com/problems/number-of-1-bits/','https://youtu.be/GJK1FwhljJA'),
  d('dsa_065','Single Number','Bit Manipulation','Easy','https://leetcode.com/problems/single-number/','https://youtu.be/ycxJYIfPtu4'),

  // Matrix
  d('dsa_023','Valid Sudoku','Matrix','Medium','https://leetcode.com/problems/valid-sudoku/','https://www.youtube.com/results?search_query=LeetCode+Valid+Sudoku'),
  d('dsa_024','Spiral Matrix','Matrix','Medium','https://leetcode.com/problems/spiral-matrix/','https://www.youtube.com/results?search_query=LeetCode+Spiral+Matrix'),
  d('dsa_025','Rotate Image','Matrix','Medium','https://leetcode.com/problems/rotate-image/','https://www.youtube.com/results?search_query=LeetCode+Rotate+Image'),
  d('dsa_026','Set Matrix Zeroes','Matrix','Medium','https://leetcode.com/problems/set-matrix-zeroes/','https://www.youtube.com/results?search_query=LeetCode+Set+Matrix+Zeroes'),
  d('dsa_027','Game of Life','Matrix','Medium','https://leetcode.com/problems/game-of-life/','https://www.youtube.com/results?search_query=LeetCode+Game+of+Life'),

  // Story / Company
  d('dsa_147','Greater Than Previous Elements','Story / Company','Medium','https://www.geeksforgeeks.org/count-elements-which-are-greater-than-all-previous-elements/','https://www.youtube.com/results?search_query=Count+elements+which+are+greater+than+all+previous+elements'),
  d('dsa_148','Maximum Guests in Party','Story / Company','Medium','https://www.geeksforgeeks.org/find-the-point-where-maximum-intervals-overlap/','https://www.youtube.com/results?search_query=Find+the+point+where+maximum+intervals+overlap'),
  d('dsa_149','Relative Sorting','Story / Company','Medium','https://www.geeksforgeeks.org/sort-array-according-order-defined-another-array/','https://www.youtube.com/results?search_query=Sort+array+according+to+order+defined+by+another+array'),
  d('dsa_150','Row With Max 1s','Story / Company','Medium','https://www.geeksforgeeks.org/row-with-max-1s-in-binary-matrix/','https://www.youtube.com/results?search_query=Row+with+max+1s+in+binary+matrix'),
  d('dsa_151','Curtains (Sliding Window Technique)','Story / Company','Medium','https://www.geeksforgeeks.org/window-sliding-technique/','https://www.youtube.com/results?search_query=Window+Sliding+Technique'),

  // Stack
  d('dsa_044','Valid Parentheses','Stack','Easy','https://leetcode.com/problems/valid-parentheses/','https://youtu.be/xnA2x0wZRIw'),
  d('dsa_045','Next Greater Element I','Stack','Easy','https://leetcode.com/problems/next-greater-element-i/','https://youtu.be/aloGT1R1JUA'),
  d('dsa_046','Min Stack','Stack','Medium','https://leetcode.com/problems/min-stack/','https://youtu.be/LGkIEDu7Xc0'),
  d('dsa_047','Simplify Path','Stack','Medium','https://leetcode.com/problems/simplify-path/','https://youtu.be/2YmEhXMirml'),

  // Linked List
  d('dsa_048','Linked List Cycle','Linked List','Easy','https://leetcode.com/problems/linked-list-cycle/','https://youtu.be/G56TwaqGa-l'),
  d('dsa_049','Merge Two Sorted Lists','Linked List','Easy','https://leetcode.com/problems/merge-two-sorted-lists/','https://youtu.be/NQczIFR3vuo'),
  d('dsa_050','Add Two Numbers','Linked List','Medium','https://leetcode.com/problems/add-two-numbers/','https://youtu.be/Bk3EAQD6r7Q'),
  d('dsa_051','Reverse Linked List','Linked List','Easy','https://leetcode.com/problems/reverse-linked-list/','https://youtu.be/X1z7DRZPnUU'),
  d('dsa_052','Rotate List','Linked List','Medium','https://leetcode.com/problems/rotate-list/','https://youtu.be/3RrVYY9VCA'),
  d('dsa_053','Remove Nth Node From End of List','Linked List','Medium','https://leetcode.com/problems/remove-nth-node-from-end-of-list/','https://youtu.be/yLhvHpiNT-S'),
  d('dsa_054','Reverse Nodes in k-Group','Linked List','Hard','https://leetcode.com/problems/reverse-nodes-in-k-group/','https://youtu.be/kAVzOQeXnUq'),

  // Binary Search
  d('dsa_055','Search Insert Position','Binary Search','Easy','https://leetcode.com/problems/search-insert-position/','https://youtu.be/uBsSovJRuQ'),
  d('dsa_056','Search a 2D Matrix','Binary Search','Medium','https://leetcode.com/problems/search-a-2d-matrix/','https://youtu.be/68KZeWPwsdk'),
  d('dsa_057','Find Peak Element','Binary Search','Medium','https://leetcode.com/problems/find-peak-element/','https://youtu.be/qoWqYMiHrlo'),
  d('dsa_058','Search in Rotated Sorted Array','Binary Search','Medium','https://leetcode.com/problems/search-in-rotated-sorted-array/','https://youtu.be/evr5OjXMcal'),
  d('dsa_059','Median of Two Sorted Arrays','Binary Search','Hard','https://leetcode.com/problems/median-of-two-sorted-arrays/','https://www.youtube.com/results?search_query=LeetCode+Median+of+Two+Sorted+Arrays'),

  // Kadane's Algo
  d('dsa_060','Maximum Subarray','Kadane\'s Algo','Medium','https://leetcode.com/problems/maximum-subarray/','https://www.youtube.com/results?search_query=LeetCode+Maximum+Subarray'),
  d('dsa_061','Maximum Product Subarray','Kadane\'s Algo','Medium','https://leetcode.com/problems/maximum-product-subarray/','https://www.youtube.com/results?search_query=LeetCode+Maximum+Product+Subarray'),

  // Binary Tree
  d('dsa_074','Maximum Depth of Binary Tree','Binary Tree','Easy','https://leetcode.com/problems/maximum-depth-of-binary-tree/','https://youtu.be/hFLWM5HI1w'),
  d('dsa_075','Symmetric Tree','Binary Tree','Easy','https://leetcode.com/problems/symmetric-tree/','https://www.youtube.com/results?search_query=LeetCode+Symmetric+Tree'),
  d('dsa_076','Path Sum','Binary Tree','Easy','https://leetcode.com/problems/path-sum/','https://www.youtube.com/results?search_query=LeetCode+Path+Sum'),
  d('dsa_077','Lowest Common Ancestor','Binary Tree','Medium','https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/','https://www.youtube.com/results?search_query=LeetCode+Lowest+Common+Ancestor'),
  d('dsa_078','Count Good Nodes in Binary Tree','Binary Tree','Medium','https://leetcode.com/problems/count-good-nodes-in-binary-tree/','https://www.youtube.com/results?search_query=LeetCode+Count+Good+Nodes+in+Binary+Tree'),

  // Binary Tree BFS
  d('dsa_079','Average of Levels in Binary Tree','Binary Tree BFS','Easy','https://leetcode.com/problems/average-of-levels-in-binary-tree/','https://www.youtube.com/results?search_query=LeetCode+Average+of+Levels+in+Binary+Tree'),
  d('dsa_080','Binary Tree Right Side View','Binary Tree BFS','Medium','https://leetcode.com/problems/binary-tree-right-side-view/','https://www.youtube.com/results?search_query=LeetCode+Binary+Tree+Right+Side+View'),
  d('dsa_081','Binary Tree Level Order Traversal','Binary Tree BFS','Medium','https://leetcode.com/problems/binary-tree-level-order-traversal/','https://www.youtube.com/results?search_query=LeetCode+Binary+Tree+Level+Order+Traversal'),

  // Binary Search Tree
  d('dsa_082','Validate Binary Search Tree','Binary Search Tree','Medium','https://leetcode.com/problems/validate-binary-search-tree/','https://www.youtube.com/results?search_query=LeetCode+Validate+Binary+Search+Tree'),
  d('dsa_083','Kth Smallest Element in a BST','Binary Search Tree','Medium','https://leetcode.com/problems/kth-smallest-element-in-a-bst/','https://www.youtube.com/results?search_query=LeetCode+Kth+Smallest+Element+in+a+BST'),
  d('dsa_084','Minimum Absolute Difference in BST','Binary Search Tree','Easy','https://leetcode.com/problems/minimum-absolute-difference-in-bst/','https://www.youtube.com/results?search_query=LeetCode+Minimum+Absolute+Difference+in+BST'),

  // Heap
  d('dsa_089','Kth Largest Element in an Array','Heap','Medium','https://leetcode.com/problems/kth-largest-element-in-an-array/','https://www.youtube.com/results?search_query=LeetCode+Kth+Largest+Element+in+an+Array'),
  d('dsa_090','Find Median from Data Stream','Heap','Hard','https://leetcode.com/problems/find-median-from-data-stream/','https://www.youtube.com/results?search_query=LeetCode+Find+Median+from+Data+Stream'),

  // Graph General
  d('dsa_085','Number of Islands','Graph General','Medium','https://leetcode.com/problems/number-of-islands/','https://www.youtube.com/results?search_query=LeetCode+Number+of+Islands'),
  d('dsa_086','Surrounded Regions','Graph General','Medium','https://leetcode.com/problems/surrounded-regions/','https://www.youtube.com/results?search_query=LeetCode+Surrounded+Regions'),
  d('dsa_087','Clone Graph','Graph General','Medium','https://leetcode.com/problems/clone-graph/','https://www.youtube.com/results?search_query=LeetCode+Clone+Graph'),
  d('dsa_088','Course Schedule','Graph General','Medium','https://leetcode.com/problems/course-schedule/','https://www.youtube.com/results?search_query=LeetCode+Course+Schedule'),

  // Backtracking
  d('dsa_069','Combinations','Backtracking','Medium','https://leetcode.com/problems/combinations/','https://www.youtube.com/results?search_query=LeetCode+Combinations'),
  d('dsa_070','Permutations','Backtracking','Medium','https://leetcode.com/problems/permutations/','https://www.youtube.com/results?search_query=LeetCode+Permutations'),
  d('dsa_071','Combination Sum','Backtracking','Medium','https://leetcode.com/problems/combination-sum/','https://www.youtube.com/results?search_query=LeetCode+Combination+Sum'),
  d('dsa_072','N-Queens','Backtracking','Hard','https://leetcode.com/problems/n-queens/','https://www.youtube.com/results?search_query=LeetCode+N-Queens'),
  d('dsa_073','Letter Combinations of a Phone Number','Backtracking','Medium','https://leetcode.com/problems/letter-combinations-of-a-phone-number/','https://www.youtube.com/results?search_query=LeetCode+Letter+Combinations+of+a+Phone+Number'),

  // 1D DP
  d('dsa_091','Climbing Stairs','1D DP','Easy','https://leetcode.com/problems/climbing-stairs/','https://www.youtube.com/results?search_query=LeetCode+Climbing+Stairs'),
  d('dsa_092','Coin Change','1D DP','Medium','https://leetcode.com/problems/coin-change/','https://www.youtube.com/results?search_query=LeetCode+Coin+Change'),
  d('dsa_093','House Robber','1D DP','Medium','https://leetcode.com/problems/house-robber/','https://www.youtube.com/results?search_query=LeetCode+House+Robber'),
  d('dsa_094','Longest Increasing Subsequence','1D DP','Medium','https://leetcode.com/problems/longest-increasing-subsequence/','https://www.youtube.com/results?search_query=LeetCode+Longest+Increasing+Subsequence'),
  d('dsa_095','Word Break','1D DP','Medium','https://leetcode.com/problems/word-break/','https://www.youtube.com/results?search_query=LeetCode+Word+Break'),

  // Multi Dimensional DP
  d('dsa_096','Longest Common Subsequence','Multi Dimensional DP','Medium','https://leetcode.com/problems/longest-common-subsequence/','https://www.youtube.com/results?search_query=LeetCode+Longest+Common+Subsequence'),
  d('dsa_097','Minimum Path Sum','Multi Dimensional DP','Medium','https://leetcode.com/problems/minimum-path-sum/','https://www.youtube.com/results?search_query=LeetCode+Minimum+Path+Sum'),
  d('dsa_098','Triangle','Multi Dimensional DP','Medium','https://leetcode.com/problems/triangle/','https://www.youtube.com/results?search_query=LeetCode+Triangle'),
  d('dsa_099','Best Time to Buy and Sell Stock III','Multi Dimensional DP','Hard','https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/','https://www.youtube.com/results?search_query=LeetCode+Best+Time+to+Buy+and+Sell+Stock+III'),
  d('dsa_100','Best Time to Buy and Sell Stock IV','Multi Dimensional DP','Hard','https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iv/','https://www.youtube.com/results?search_query=LeetCode+Best+Time+to+Buy+and+Sell+Stock+IV'),
];
