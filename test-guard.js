// test-guard.js
const { runGuard } = require("./src/matching/guard");

// Test 1: good match — fox image for fox post
const result1 = runGuard({
  similarityScore: 0.88,
  imageTags: { subject: "red fox", category: "animal", confidence: 0.99 },
  postTopic: "red fox",
});
console.log("Test 1 (should PASS):", result1.passed, "-", result1.explanation);

// Test 2: wolf image for fox post — the key scenario
const result2 = runGuard({
  similarityScore: 0.66,
  imageTags: { subject: "gray wolf", category: "animal", confidence: 0.95 },
  postTopic: "red fox",
});
console.log("Test 2 (should FAIL):", result2.passed, "-", result2.explanation);

// Test 3: low confidence image
const result3 = runGuard({
  similarityScore: 0.80,
  imageTags: { subject: "red fox", category: "animal", confidence: 0.45 },
  postTopic: "red fox",
});
console.log("Test 3 (should FAIL):", result3.passed, "-", result3.explanation);

// Test 4: no good match at all
const result4 = runGuard({
  similarityScore: 0.45,
  imageTags: { subject: "golden retriever", category: "animal", confidence: 0.97 },
  postTopic: "red fox",
});
console.log("Test 4 (should FAIL):", result4.passed, "-", result4.explanation);
