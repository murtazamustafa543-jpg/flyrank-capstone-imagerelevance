require("dotenv").config();
const { getImageSuggestionsForPost } = require("../src/matching/match");
const evalSet = require("./eval-set.json");

async function runEval() {
  let correct = 0;
  let total = 0;
  let skipped = 0;

  console.log("Running eval...\n");

  for (const item of evalSet) {
    const result = await getImageSuggestionsForPost(item.postId);

    if (!result || result.result === "no_confident_match") {
      console.log(`⚠ SKIP  "${item.postTitle}" — no confident match`);
      skipped++;
      continue;
    }

    total++;
    const top1 = result.suggestions[0];

    // Accept any image whose subject contains the expected category
    const hit = top1.subject.toLowerCase().includes(item.correctCategory);

    if (hit) {
      correct++;
      console.log(`✓ HIT   "${item.postTitle}" → ${top1.filename} (${top1.subject})`);
    } else {
      console.log(`✗ MISS  "${item.postTitle}" → got ${top1.filename} (${top1.subject}), expected category: ${item.correctCategory}`);
    }
  }

  const precision = total > 0 ? (correct / total).toFixed(2) : "N/A";
  console.log(`\nTop-1 Precision: ${correct}/${total} = ${precision}`);
  console.log(`Skipped (no match): ${skipped}`);
}

runEval().catch(console.error);