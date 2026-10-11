// test-match.js
require("dotenv").config();
const db = require("./src/db");
const { getImageSuggestionsForPost } = require("./src/matching/match");

// Get the fox post id
const foxPost = db.prepare("SELECT id FROM posts WHERE title LIKE '%Red Fox%' LIMIT 1").get();
console.log("Testing fox post:", foxPost.id);

getImageSuggestionsForPost(foxPost.id)
  .then(result => console.log(JSON.stringify(result, null, 2)))
  .catch(console.error);