const Database = require("better-sqlite3");
const createTables = require("./schema");
const path = require("path");

const db = new Database(path.join(__dirname, "../../data/database.db"));

db.exec("PRAGMA journal_mode=WAL;");
db.exec(createTables);

module.exports = db;