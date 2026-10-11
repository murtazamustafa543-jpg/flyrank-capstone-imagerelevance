const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/:id/approve", (req, res) => {
  const row = db.prepare("SELECT * FROM suggestions WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Suggestion not found" });
  db.prepare("UPDATE suggestions SET status = 'approved' WHERE id = ?").run(req.params.id);
  res.json({ id: req.params.id, status: "approved" });
});

router.post("/:id/reject", (req, res) => {
  const row = db.prepare("SELECT * FROM suggestions WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Suggestion not found" });
  db.prepare("UPDATE suggestions SET status = 'rejected' WHERE id = ?").run(req.params.id);
  res.json({ id: req.params.id, status: "rejected" });
});

router.get("/:id/explain", (req, res) => {
  const row = db.prepare(`
    SELECT s.*, p.title as post_title, i.filename, it.subject, it.caption, it.confidence
    FROM suggestions s
    JOIN posts p ON s.post_id = p.id
    JOIN images i ON s.image_id = i.id
    JOIN image_tags it ON s.image_id = it.image_id
    WHERE s.id = ?
  `).get(req.params.id);
  if (!row) return res.status(404).json({ error: "Suggestion not found" });
  res.json({
    id: row.id,
    postTitle: row.post_title,
    imageFilename: row.filename,
    subject: row.subject,
    caption: row.caption,
    confidence: row.confidence,
    similarityScore: row.similarity_score,
    guardPassed: row.guard_passed === 1,
    rejectionReason: row.rejection_reason,
    status: row.status,
  });
});

module.exports = router;