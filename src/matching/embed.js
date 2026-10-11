const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getEmbedding(text) {
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-2" });

  const result = await model.embedContent({
    content: { parts: [{ text }], role: "user" },
    taskType: "SEMANTIC_SIMILARITY",
  });

  return result.embedding.values; // array of numbers
}

function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dot / (magA * magB);
}

module.exports = { getEmbedding, cosineSimilarity };