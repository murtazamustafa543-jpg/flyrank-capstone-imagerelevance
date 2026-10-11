const db = require("../db");
const { getEmbedding, cosineSimilarity } = require("./embed");
const { runGuard } = require("./guard");
const { v4: uuidv4 } = require("uuid");

async function getImageSuggestionsForPost(postId) {
  // 1. Get the post
  const post = db.prepare("SELECT * FROM posts WHERE id = ?").get(postId);
  if (!post) return null;

  // 2. Get post embedding
  const postVectorRow = db.prepare("SELECT embedding FROM post_vectors WHERE post_id = ?").get(postId);
  if (!postVectorRow) return { error: "Post has no embedding yet" };
  const postVector = JSON.parse(postVectorRow.embedding);

  // 3. Get all image vectors + their tags
  const imageVectors = db.prepare(`
    SELECT iv.image_id, iv.embedding, it.subject, it.category, 
           it.confidence, it.caption, it.flagged, i.filename, i.category as img_category
    FROM image_vectors iv
    JOIN image_tags it ON iv.image_id = it.image_id
    JOIN images i ON iv.image_id = i.id
  `).all();

  if (imageVectors.length === 0) {
    return { error: "No images processed yet" };
  }

  // 4. Score each image against the post
  const scored = imageVectors.map(row => {
    const imageVector = JSON.parse(row.embedding);
    const similarity = cosineSimilarity(postVector, imageVector);

    const guardResult = runGuard({
      similarityScore: similarity,
      imageTags: {
        subject: row.subject,
        category: row.category,
        confidence: row.confidence,
        flagged: row.flagged === 1,
      },
      postTopic: extractTopic(post.title),
    });

    return {
      imageId: row.image_id,
      filename: row.filename,
      subject: row.subject,
      caption: row.caption,
      similarity: parseFloat(similarity.toFixed(4)),
      confidence: row.confidence,
      flagged: row.flagged === 1,
      guardPassed: guardResult.passed,
      explanation: guardResult.explanation,
    };
  });

  // 5. Sort by similarity descending
  scored.sort((a, b) => b.similarity - a.similarity);

  // 6. Save suggestions to DB
  for (const s of scored.slice(0, 5)) {
    const existing = db.prepare(
      "SELECT id FROM suggestions WHERE post_id = ? AND image_id = ?"
    ).get(postId, s.imageId);

    if (!existing) {
      db.prepare(`
        INSERT INTO suggestions (id, post_id, image_id, similarity_score, guard_passed, rejection_reason, status)
        VALUES (?, ?, ?, ?, ?, ?, 'pending')
      `).run(
        uuidv4(), postId, s.imageId,
        s.similarity,
        s.guardPassed ? 1 : 0,
        s.guardPassed ? null : s.explanation
      );
    }
  }

  // 7. Separate passed and rejected
  const passed = scored.filter(s => s.guardPassed);
  const rejected = scored.filter(s => !s.guardPassed);

  if (passed.length === 0) {
    return {
      postId,
      postTitle: post.title,
      result: "no_confident_match",
      reason: "No image passed the mismatch guard",
      topRejected: rejected.slice(0, 3),
    };
  }

  return {
    postId,
    postTitle: post.title,
    result: "match_found",
    suggestions: passed.slice(0, 3),
    rejected: rejected.slice(0, 2),
  };
}

function extractTopic(title) {
  // Pull the key animal term from the post title
  const animals = ["red fox", "fox", "wolf", "dog", "bear", "deer"];
  const lower = title.toLowerCase();
  for (const animal of animals) {
    if (lower.includes(animal)) return animal;
  }
  return lower;
}

module.exports = { getImageSuggestionsForPost };