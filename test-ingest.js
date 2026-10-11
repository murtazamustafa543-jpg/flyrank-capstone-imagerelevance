// test-ingest.js
require("dotenv").config();
const { runBatchIngestion, getBatchStatus } = require("./src/vision/ingest");

async function test() {
  console.log("Starting batch...");
  await runBatchIngestion();

  // Poll status every 3 seconds
  const interval = setInterval(() => {
    const status = getBatchStatus();
    console.log(`Progress: ${status.processed}/${status.total} | Failed: ${status.failed} | Cost: $${status.totalCost?.toFixed(6)}`);
    if (!status.running) {
      clearInterval(interval);
      console.log("Done!");
    }
  }, 3000);
}

test().catch(console.error);