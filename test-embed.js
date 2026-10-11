// test-embed.js
require("dotenv").config();
const { getEmbedding, cosineSimilarity } = require("./src/matching/embed");

async function test() {
  console.log("Getting embeddings...");
  const foxVec = await getEmbedding("red fox in a forest");
  const wolfVec = await getEmbedding("gray wolf in the wilderness");
  const dogVec = await getEmbedding("golden retriever dog");

  const foxWolf = cosineSimilarity(foxVec, wolfVec);
  const foxDog = cosineSimilarity(foxVec, dogVec);

  console.log(`Fox vs Wolf similarity: ${foxWolf.toFixed(4)}`);
  console.log(`Fox vs Dog similarity: ${foxDog.toFixed(4)}`);
  console.log("Fox and Wolf should be more similar than Fox and Dog");
}

test().catch(console.error);