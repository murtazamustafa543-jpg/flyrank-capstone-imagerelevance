const express = require("express");
const router = express.Router();
const db = require("../db");
const { getImageSuggestionsForPost } = require("../matching/match");

router.get("/", (req, res) => {
  const posts = db.prepare("SELECT id, title, created_at FROM posts").all();
  res.json(posts);
});

router.get("/:id/images", async (req, res) => {
  const result = await getImageSuggestionsForPost(req.params.id);
  if (!result) return res.status(404).json({ error: "Post not found" });
  if (result.error) return res.status(500).json(result);
  res.json(result);
});

module.exports = router;