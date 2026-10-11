const SIMILARITY_THRESHOLD = 0.28;
const CONFIDENCE_THRESHOLD = 0.6;

function runGuard({ similarityScore, imageTags, postTopic }) {
  const reasons = [];

  // Check 1: similarity score too low
  if (similarityScore < SIMILARITY_THRESHOLD) {
    reasons.push(
      `Similarity score ${similarityScore.toFixed(3)} is below threshold ${SIMILARITY_THRESHOLD}`
    );
  }

  // Check 2: image confidence too low
  if (imageTags.confidence < CONFIDENCE_THRESHOLD) {
    reasons.push(
      `Image confidence ${imageTags.confidence} is below threshold ${CONFIDENCE_THRESHOLD} — classification uncertain`
    );
  }

  // Check 3: subject mismatch — does the image subject relate to the post topic?
  const imageSubject = imageTags.subject.toLowerCase();
  const topic = postTopic.toLowerCase();

  const subjectMatchesPost =
    imageSubject.includes(topic) ||
    topic.includes(imageSubject) ||
    shareKeyword(imageSubject, topic);

  if (!subjectMatchesPost) {
    reasons.push(
      `Subject mismatch: post is about "${postTopic}" but image shows "${imageTags.subject}"`
    );
  }

  const passed = reasons.length === 0;

  return {
    passed,
    reasons,
    explanation: passed
      ? `Image matches post — subject "${imageTags.subject}" aligns with topic "${postTopic}", similarity ${similarityScore.toFixed(3)}`
      : `Rejected: ${reasons.join("; ")}`,
  };
}

function shareKeyword(a, b) {
  const wordsA = a.split(/\s+/);
  const wordsB = b.split(/\s+/);
  return wordsA.some(w => w.length > 3 && wordsB.includes(w));
}

module.exports = { runGuard, SIMILARITY_THRESHOLD };