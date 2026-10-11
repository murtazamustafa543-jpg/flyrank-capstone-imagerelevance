const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const db = require("../db");
const { classifyImage } = require("./classify");
const { getEmbedding } = require("../matching/embed");

const IMAGES_DIR = path.join(__dirname, "../../images");
const COST_PER_VISION_CALL = 0.000015; // approximate Gemini Flash cost per image
const COST_PER_EMBED_CALL = 0.000001;

let batchStatus = {
  running: false,
  total: 0,
  processed: 0,
  failed: 0,
  totalCost: 0,
  errors: [],
};

function getBatchStatus() {
  return { ...batchStatus };
}

async function runBatchIngestion() {
  if (batchStatus.running) {
    return { message: "Batch already running" };
  }

  // Scan all image files from images/category/ folders
  const imageFiles = [];
  const categories = fs.readdirSync(IMAGES_DIR).filter(f =>
    fs.statSync(path.join(IMAGES_DIR, f)).isDirectory()
  );

  for (const category of categories) {
    const categoryDir = path.join(IMAGES_DIR, category);
    const files = fs.readdirSync(categoryDir).filter(f =>
      /\.(jpg|jpeg|png|webp)$/i.test(f)
    );
    for (const file of files) {
      imageFiles.push({ filename: file, category, filepath: path.join(categoryDir, file) });
    }
  }

  batchStatus = {
    running: true,
    total: imageFiles.length,
    processed: 0,
    failed: 0,
    totalCost: 0,
    errors: [],
  };

  // Process in background — don't await this in the route
  processBatch(imageFiles);

  return { message: "Batch started", total: imageFiles.length };
}

async function processBatch(imageFiles) {
  for (const { filename, category, filepath } of imageFiles) {
    try {
      // Skip if already processed
      const existing = db.prepare("SELECT id FROM images WHERE filepath = ?").get(filepath);
      if (existing) {
        batchStatus.processed++;
        continue;
      }

      // 1. Classify image with Gemini Vision
      const tags = await classifyImage(filepath);
      batchStatus.totalCost += COST_PER_VISION_CALL;

      // 2. Save image record
      const imageId = uuidv4();
      db.prepare(
        "INSERT INTO images (id, filename, filepath, category) VALUES (?, ?, ?, ?)"
      ).run(imageId, filename, filepath, category);

      // 3. Save tags
      const tagId = uuidv4();
      db.prepare(`
        INSERT INTO image_tags (id, image_id, subject, category, attributes, caption, confidence, flagged)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        tagId, imageId,
        tags.subject, tags.category,
        JSON.stringify(tags.attributes),
        tags.caption,
        tags.confidence,
        tags.flagged ? 1 : 0
      );

      // 4. Generate and save embedding
      const embedding = await getEmbedding(tags.caption);
      batchStatus.totalCost += COST_PER_EMBED_CALL;

      const vectorId = uuidv4();
      db.prepare(
        "INSERT INTO image_vectors (id, image_id, embedding) VALUES (?, ?, ?)"
      ).run(vectorId, imageId, JSON.stringify(embedding));

      batchStatus.processed++;
      console.log(`[ingest] ✓ ${filename} — "${tags.subject}" (confidence: ${tags.confidence})`);

      // Small delay to avoid hitting rate limits
      await new Promise(r => setTimeout(r, 13000));;

    } catch (err) {
      batchStatus.failed++;
      batchStatus.errors.push({ filename, error: err.message });
      console.error(`[ingest] ✗ ${filename} — ${err.message}`);

      // Retry delay on error
      await new Promise(r => setTimeout(r, 15000))
    }
  }

  batchStatus.running = false;
  console.log(`[ingest] Batch complete. Processed: ${batchStatus.processed}, Failed: ${batchStatus.failed}, Cost: $${batchStatus.totalCost.toFixed(6)}`);
}

module.exports = { runBatchIngestion, getBatchStatus };