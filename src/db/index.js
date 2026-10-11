const Database = require("better-sqlite3");
const createTables = require("./schema");
const path = require("path");
const fs = require("fs");

const dataDir = path.join(__dirname, "../../data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const db = new Database(path.join(dataDir, "database.db"));

db.exec("PRAGMA journal_mode=WAL;");
db.exec(createTables);

module.exports = db;