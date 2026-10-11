const express = require("express");
const router = express.Router();
const { runBatchIngestion, getBatchStatus } = require("../vision/ingest");

router.post("/batch", async (req, res) => {
  const result = await runBatchIngestion();
  res.status(202).json(result);
});

router.get("/status", (req, res) => {
  res.json(getBatchStatus());
});

module.exports = router;