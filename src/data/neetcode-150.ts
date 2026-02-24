type Difficulty = "Easy" | "Medium" | "Hard";

export interface NeetcodeProblem {
  id: string;
  name: string;
  number: number;
  difficulty: Difficulty;
  url: string;
}

export interface NeetcodeTopic {
  id: string;
  name: string;
  problems: NeetcodeProblem[];
}

function p(
  id: string,
  name: string,
  number: number,
  difficulty: Difficulty
): NeetcodeProblem {
  return {
    id,
    name,
    number,
    difficulty,
    url: `https://leetcode.com/problems/${id}/`,
  };
}

export const NEETCODE_TOPICS: NeetcodeTopic[] = [
  // ── Arrays & Hashing ──────────────────────────────────────────────
  {
    id: "arrays-hashing",
    name: "Arrays & Hashing",
    problems: [
      p("contains-duplicate", "Contains Duplicate", 217, "Easy"),
      p("valid-anagram", "Valid Anagram", 242, "Easy"),
      p("two-sum", "Two Sum", 1, "Easy"),
      p("group-anagrams", "Group Anagrams", 49, "Medium"),
      p("top-k-frequent-elements", "Top K Frequent Elements", 347, "Medium"),
      p(
        "encode-and-decode-strings",
        "Encode and Decode Strings",
        271,
        "Medium"
      ),
      p(
        "product-of-array-except-self",
        "Product of Array Except Self",
        238,
        "Medium"
      ),
      p("valid-sudoku", "Valid Sudoku", 36, "Medium"),
      p(
        "longest-consecutive-sequence",
        "Longest Consecutive Sequence",
        128,
        "Medium"
      ),
    ],
  },

  // ── Two Pointers ──────────────────────────────────────────────────
  {
    id: "two-pointers",
    name: "Two Pointers",
    problems: [
      p("valid-palindrome", "Valid Palindrome", 125, "Easy"),
      p(
        "two-sum-ii-input-array-is-sorted",
        "Two Sum II",
        167,
        "Medium"
      ),
      p("3sum", "3Sum", 15, "Medium"),
      p("container-with-most-water", "Container With Most Water", 11, "Medium"),
      p("trapping-rain-water", "Trapping Rain Water", 42, "Hard"),
    ],
  },

  // ── Sliding Window ────────────────────────────────────────────────
  {
    id: "sliding-window",
    name: "Sliding Window",
    problems: [
      p(
        "best-time-to-buy-and-sell-stock",
        "Best Time to Buy and Sell Stock",
        121,
        "Easy"
      ),
      p(
        "longest-substring-without-repeating-characters",
        "Longest Substring Without Repeating Characters",
        3,
        "Medium"
      ),
      p(
        "longest-repeating-character-replacement",
        "Longest Repeating Character Replacement",
        424,
        "Medium"
      ),
      p("permutation-in-string", "Permutation in String", 567, "Medium"),
      p("minimum-window-substring", "Minimum Window Substring", 76, "Hard"),
      p("sliding-window-maximum", "Sliding Window Maximum", 239, "Hard"),
    ],
  },

  // ── Stack ─────────────────────────────────────────────────────────
  {
    id: "stack",
    name: "Stack",
    problems: [
      p("valid-parentheses", "Valid Parentheses", 20, "Easy"),
      p("min-stack", "Min Stack", 155, "Medium"),
      p(
        "evaluate-reverse-polish-notation",
        "Evaluate Reverse Polish Notation",
        150,
        "Medium"
      ),
      p("generate-parentheses", "Generate Parentheses", 22, "Medium"),
      p("daily-temperatures", "Daily Temperatures", 739, "Medium"),
      p("car-fleet", "Car Fleet", 853, "Medium"),
      p(
        "largest-rectangle-in-histogram",
        "Largest Rectangle in Histogram",
        84,
        "Hard"
      ),
    ],
  },

  // ── Binary Search ─────────────────────────────────────────────────
  {
    id: "binary-search",
    name: "Binary Search",
    problems: [
      p("binary-search", "Binary Search", 704, "Easy"),
      p("search-a-2d-matrix", "Search a 2D Matrix", 74, "Medium"),
      p("koko-eating-bananas", "Koko Eating Bananas", 875, "Medium"),
      p(
        "find-minimum-in-rotated-sorted-array",
        "Find Minimum in Rotated Sorted Array",
        153,
        "Medium"
      ),
      p(
        "search-in-rotated-sorted-array",
        "Search in Rotated Sorted Array",
        33,
        "Medium"
      ),
      p(
        "time-based-key-value-store",
        "Time Based Key-Value Store",
        981,
        "Medium"
      ),
      p("median-of-two-sorted-arrays", "Median of Two Sorted Arrays", 4, "Hard"),
    ],
  },

  // ── Linked List ───────────────────────────────────────────────────
  {
    id: "linked-list",
    name: "Linked List",
    problems: [
      p("reverse-linked-list", "Reverse Linked List", 206, "Easy"),
      p("merge-two-sorted-lists", "Merge Two Sorted Lists", 21, "Easy"),
      p("linked-list-cycle", "Linked List Cycle", 141, "Easy"),
      p("reorder-list", "Reorder List", 143, "Medium"),
      p(
        "remove-nth-node-from-end-of-list",
        "Remove Nth Node From End of List",
        19,
        "Medium"
      ),
      p(
        "copy-list-with-random-pointer",
        "Copy List with Random Pointer",
        138,
        "Medium"
      ),
      p("add-two-numbers", "Add Two Numbers", 2, "Medium"),
      p("lru-cache", "LRU Cache", 146, "Medium"),
      p("merge-k-sorted-lists", "Merge k Sorted Lists", 23, "Hard"),
      p("reverse-nodes-in-k-group", "Reverse Nodes in k-Group", 25, "Hard"),
      p("find-the-duplicate-number", "Find the Duplicate Number", 287, "Medium"),
    ],
  },

  // ── Trees ─────────────────────────────────────────────────────────
  {
    id: "trees",
    name: "Trees",
    problems: [
      p("invert-binary-tree", "Invert Binary Tree", 226, "Easy"),
      p("maximum-depth-of-binary-tree", "Maximum Depth of Binary Tree", 104, "Easy"),
      p("diameter-of-binary-tree", "Diameter of Binary Tree", 543, "Easy"),
      p("balanced-binary-tree", "Balanced Binary Tree", 110, "Easy"),
      p("same-tree", "Same Tree", 100, "Easy"),
      p("subtree-of-another-tree", "Subtree of Another Tree", 572, "Easy"),
      p(
        "lowest-common-ancestor-of-a-binary-search-tree",
        "Lowest Common Ancestor of a BST",
        235,
        "Medium"
      ),
      p(
        "binary-tree-level-order-traversal",
        "Binary Tree Level Order Traversal",
        102,
        "Medium"
      ),
      p(
        "binary-tree-right-side-view",
        "Binary Tree Right Side View",
        199,
        "Medium"
      ),
      p(
        "count-good-nodes-in-binary-tree",
        "Count Good Nodes in Binary Tree",
        1448,
        "Medium"
      ),
      p(
        "validate-binary-search-tree",
        "Validate Binary Search Tree",
        98,
        "Medium"
      ),
      p(
        "kth-smallest-element-in-a-bst",
        "Kth Smallest Element in a BST",
        230,
        "Medium"
      ),
      p(
        "construct-binary-tree-from-preorder-and-inorder-traversal",
        "Construct Binary Tree from Preorder and Inorder",
        105,
        "Medium"
      ),
      p(
        "binary-tree-maximum-path-sum",
        "Binary Tree Maximum Path Sum",
        124,
        "Hard"
      ),
      p(
        "serialize-and-deserialize-binary-tree",
        "Serialize and Deserialize Binary Tree",
        297,
        "Hard"
      ),
    ],
  },

  // ── Tries ─────────────────────────────────────────────────────────
  {
    id: "tries",
    name: "Tries",
    problems: [
      p("implement-trie-prefix-tree", "Implement Trie (Prefix Tree)", 208, "Medium"),
      p(
        "design-add-and-search-words-data-structure",
        "Design Add and Search Words Data Structure",
        211,
        "Medium"
      ),
      p("word-search-ii", "Word Search II", 212, "Hard"),
    ],
  },

  // ── Heap / Priority Queue ─────────────────────────────────────────
  {
    id: "heap-priority-queue",
    name: "Heap / Priority Queue",
    problems: [
      p(
        "kth-largest-element-in-a-stream",
        "Kth Largest Element in a Stream",
        703,
        "Easy"
      ),
      p("last-stone-weight", "Last Stone Weight", 1046, "Easy"),
      p(
        "k-closest-points-to-origin",
        "K Closest Points to Origin",
        973,
        "Medium"
      ),
      p(
        "kth-largest-element-in-an-array",
        "Kth Largest Element in an Array",
        215,
        "Medium"
      ),
      p("task-scheduler", "Task Scheduler", 621, "Medium"),
      p("design-twitter", "Design Twitter", 355, "Medium"),
      p(
        "find-median-from-data-stream",
        "Find Median from Data Stream",
        295,
        "Hard"
      ),
    ],
  },

  // ── Backtracking ──────────────────────────────────────────────────
  {
    id: "backtracking",
    name: "Backtracking",
    problems: [
      p("subsets", "Subsets", 78, "Medium"),
      p("combination-sum", "Combination Sum", 39, "Medium"),
      p("permutations", "Permutations", 46, "Medium"),
      p("subsets-ii", "Subsets II", 90, "Medium"),
      p("combination-sum-ii", "Combination Sum II", 40, "Medium"),
      p("word-search", "Word Search", 79, "Medium"),
      p("palindrome-partitioning", "Palindrome Partitioning", 131, "Medium"),
      p(
        "letter-combinations-of-a-phone-number",
        "Letter Combinations of a Phone Number",
        17,
        "Medium"
      ),
      p("n-queens", "N-Queens", 51, "Hard"),
    ],
  },

  // ── Graphs ────────────────────────────────────────────────────────
  {
    id: "graphs",
    name: "Graphs",
    problems: [
      p("number-of-islands", "Number of Islands", 200, "Medium"),
      p("max-area-of-island", "Max Area of Island", 695, "Medium"),
      p("clone-graph", "Clone Graph", 133, "Medium"),
      p("walls-and-gates", "Walls and Gates", 286, "Medium"),
      p("rotting-oranges", "Rotting Oranges", 994, "Medium"),
      p(
        "pacific-atlantic-water-flow",
        "Pacific Atlantic Water Flow",
        417,
        "Medium"
      ),
      p("surrounded-regions", "Surrounded Regions", 130, "Medium"),
      p("course-schedule", "Course Schedule", 207, "Medium"),
      p("course-schedule-ii", "Course Schedule II", 210, "Medium"),
      p("graph-valid-tree", "Graph Valid Tree", 261, "Medium"),
      p(
        "number-of-connected-components-in-an-undirected-graph",
        "Number of Connected Components in an Undirected Graph",
        323,
        "Medium"
      ),
      p("redundant-connection", "Redundant Connection", 684, "Medium"),
      p("word-ladder", "Word Ladder", 127, "Hard"),
    ],
  },

  // ── Advanced Graphs ───────────────────────────────────────────────
  {
    id: "advanced-graphs",
    name: "Advanced Graphs",
    problems: [
      p("reconstruct-itinerary", "Reconstruct Itinerary", 332, "Hard"),
      p(
        "min-cost-to-connect-all-points",
        "Min Cost to Connect All Points",
        1584,
        "Medium"
      ),
      p("network-delay-time", "Network Delay Time", 743, "Medium"),
      p("swim-in-rising-water", "Swim in Rising Water", 778, "Hard"),
      p("alien-dictionary", "Alien Dictionary", 269, "Hard"),
      p(
        "cheapest-flights-within-k-stops",
        "Cheapest Flights Within K Stops",
        787,
        "Medium"
      ),
    ],
  },

  // ── 1-D Dynamic Programming ───────────────────────────────────────
  {
    id: "1d-dynamic-programming",
    name: "1-D Dynamic Programming",
    problems: [
      p("climbing-stairs", "Climbing Stairs", 70, "Easy"),
      p("min-cost-climbing-stairs", "Min Cost Climbing Stairs", 746, "Easy"),
      p("house-robber", "House Robber", 198, "Medium"),
      p("house-robber-ii", "House Robber II", 213, "Medium"),
      p(
        "longest-palindromic-substring",
        "Longest Palindromic Substring",
        5,
        "Medium"
      ),
      p("palindromic-substrings", "Palindromic Substrings", 647, "Medium"),
      p("decode-ways", "Decode Ways", 91, "Medium"),
      p("coin-change", "Coin Change", 322, "Medium"),
      p("maximum-product-subarray", "Maximum Product Subarray", 152, "Medium"),
      p("word-break", "Word Break", 139, "Medium"),
      p(
        "longest-increasing-subsequence",
        "Longest Increasing Subsequence",
        300,
        "Medium"
      ),
      p("partition-equal-subset-sum", "Partition Equal Subset Sum", 416, "Medium"),
    ],
  },

  // ── 2-D Dynamic Programming ───────────────────────────────────────
  {
    id: "2d-dynamic-programming",
    name: "2-D Dynamic Programming",
    problems: [
      p("unique-paths", "Unique Paths", 62, "Medium"),
      p(
        "longest-common-subsequence",
        "Longest Common Subsequence",
        1143,
        "Medium"
      ),
      p(
        "best-time-to-buy-and-sell-stock-with-cooldown",
        "Best Time to Buy and Sell Stock with Cooldown",
        309,
        "Medium"
      ),
      p("coin-change-ii", "Coin Change II", 518, "Medium"),
      p("target-sum", "Target Sum", 494, "Medium"),
      p("interleaving-string", "Interleaving String", 97, "Medium"),
      p(
        "longest-increasing-path-in-a-matrix",
        "Longest Increasing Path in a Matrix",
        329,
        "Hard"
      ),
      p("distinct-subsequences", "Distinct Subsequences", 115, "Hard"),
      p("edit-distance", "Edit Distance", 72, "Medium"),
      p("burst-balloons", "Burst Balloons", 312, "Hard"),
      p("regular-expression-matching", "Regular Expression Matching", 10, "Hard"),
    ],
  },

  // ── Greedy ────────────────────────────────────────────────────────
  {
    id: "greedy",
    name: "Greedy",
    problems: [
      p("maximum-subarray", "Maximum Subarray", 53, "Medium"),
      p("jump-game", "Jump Game", 55, "Medium"),
      p("jump-game-ii", "Jump Game II", 45, "Medium"),
      p("gas-station", "Gas Station", 134, "Medium"),
      p("hand-of-straights", "Hand of Straights", 846, "Medium"),
      p(
        "merge-triplets-to-form-target-triplet",
        "Merge Triplets to Form Target Triplet",
        1899,
        "Medium"
      ),
      p("partition-labels", "Partition Labels", 763, "Medium"),
      p("valid-parenthesis-string", "Valid Parenthesis String", 678, "Medium"),
    ],
  },

  // ── Intervals ─────────────────────────────────────────────────────
  {
    id: "intervals",
    name: "Intervals",
    problems: [
      p("insert-interval", "Insert Interval", 57, "Medium"),
      p("merge-intervals", "Merge Intervals", 56, "Medium"),
      p("non-overlapping-intervals", "Non-overlapping Intervals", 435, "Medium"),
      p("meeting-rooms", "Meeting Rooms", 252, "Easy"),
      p("meeting-rooms-ii", "Meeting Rooms II", 253, "Medium"),
      p(
        "minimum-interval-to-include-each-query",
        "Minimum Interval to Include Each Query",
        1851,
        "Hard"
      ),
    ],
  },

  // ── Math & Geometry ───────────────────────────────────────────────
  {
    id: "math-geometry",
    name: "Math & Geometry",
    problems: [
      p("rotate-image", "Rotate Image", 48, "Medium"),
      p("spiral-matrix", "Spiral Matrix", 54, "Medium"),
      p("set-matrix-zeroes", "Set Matrix Zeroes", 73, "Medium"),
      p("happy-number", "Happy Number", 202, "Easy"),
      p("plus-one", "Plus One", 66, "Easy"),
      p("powx-n", "Pow(x, n)", 50, "Medium"),
      p("multiply-strings", "Multiply Strings", 43, "Medium"),
      p("detect-squares", "Detect Squares", 2013, "Medium"),
    ],
  },

  // ── Bit Manipulation ──────────────────────────────────────────────
  {
    id: "bit-manipulation",
    name: "Bit Manipulation",
    problems: [
      p("single-number", "Single Number", 136, "Easy"),
      p("number-of-1-bits", "Number of 1 Bits", 191, "Easy"),
      p("counting-bits", "Counting Bits", 338, "Easy"),
      p("reverse-bits", "Reverse Bits", 190, "Easy"),
      p("missing-number", "Missing Number", 268, "Easy"),
      p("sum-of-two-integers", "Sum of Two Integers", 371, "Medium"),
      p("reverse-integer", "Reverse Integer", 7, "Medium"),
    ],
  },
];
