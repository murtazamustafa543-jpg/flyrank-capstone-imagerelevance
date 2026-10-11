// test-scores.js
require("dotenv").config();
const db = require("./src/db");
const { cosineSimilarity } = require("./src/matching/embed");

const foxPost = db.prepare("SELECT pv.embedding, p.title FROM post_vectors pv JOIN posts p ON pv.post_id = p.id WHERE p.title LIKE '%Red Fox%' LIMIT 1").get();
const postVec = JSON.parse(foxPost.embedding);

const images = db.prepare(`
  SELECT iv.embedding, it.subject, i.filename
  FROM image_vectors iv
  JOIN image_tags it ON iv.image_id = it.image_id
  JOIN images i ON iv.image_id = i.id
  ORDER BY i.category, i.filename
`).all();

console.log(`Post: "${foxPost.title}"\n`);
images.forEach(img => {
  const score = cosineSimilarity(postVec, JSON.parse(img.embedding));
  console.log(`${img.filename} (${img.subject}): ${score.toFixed(4)}`);
});