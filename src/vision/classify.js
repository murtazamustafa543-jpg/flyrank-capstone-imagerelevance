const { GoogleGenerativeAI } = require("@google/generative-ai");
const { z } = require("zod");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Schema that every Gemini response must match — if it doesn't, we reject it
const TagSchema = z.object({
  subject: z.string(),
  category: z.string(),
  attributes: z.array(z.string()),
  caption: z.string(),
  confidence: z.number().min(0).max(1),
});

async function classifyImage(imagePath) {
  const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

  // Read image from disk and convert to base64
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString("base64");
  const ext = path.extname(imagePath).slice(1).toLowerCase();
  const mimeType = ext === "jpg" ? "image/jpeg" : `image/${ext}`;

  const prompt = `Analyze this image and respond with ONLY a valid JSON object, no markdown, no explanation.
The JSON must have exactly these fields:
{
  "subject": "the main subject (e.g. red fox, gray wolf, golden retriever)",
  "category": "one of: animal, plant, landscape, object, person",
  "attributes": ["list", "of", "visual", "descriptors"],
  "caption": "one sentence describing the image",
  "confidence": 0.95
}
confidence is your certainty from 0.0 to 1.0 that your classification is correct.`;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        mimeType,
        data: base64Image,
      },
    },
  ]);

  const text = result.response.text().trim();

  // Strip markdown code fences if Gemini adds them anyway
  const cleaned = text.replace(/```json|```/g, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Gemini returned invalid JSON: ${text}`);
  }

  // Validate against schema — never trust raw model output
  const validated = TagSchema.safeParse(parsed);
  if (!validated.success) {
    throw new Error(`Schema validation failed: ${JSON.stringify(validated.error.errors)}`);
  }

  const tags = validated.data;

  // Flag low-confidence results instead of silently accepting them
  const flagged = tags.confidence < 0.6;

  return { ...tags, flagged };
}

module.exports = { classifyImage };