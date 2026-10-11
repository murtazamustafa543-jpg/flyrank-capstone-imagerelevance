
require("dotenv").config();
const { classifyImage } = require("./src/vision/classify");
const path = require("path");

const testImage = path.join(__dirname, "images/fox/fox1.jpg");

classifyImage(testImage)
  .then(result => console.log("Result:", JSON.stringify(result, null, 2)))
  .catch(err => console.error("Error:", err.message));