const express = require("express");
const app = express();
require("dotenv").config();

app.use(express.json());

app.use("/ingest", require("./src/routes/ingest"));
app.use("/posts", require("./src/routes/posts"));
app.use("/suggestions", require("./src/routes/suggestions"));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));