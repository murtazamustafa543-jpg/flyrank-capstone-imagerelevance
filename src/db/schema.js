const createTables = `
  CREATE TABLE IF NOT EXISTS images (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    filepath TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS image_tags (
    id TEXT PRIMARY KEY,
    image_id TEXT NOT NULL,
    subject TEXT NOT NULL,
    category TEXT NOT NULL,
    attributes TEXT NOT NULL,
    caption TEXT NOT NULL,
    confidence REAL NOT NULL,
    flagged INTEGER DEFAULT 0,
    FOREIGN KEY (image_id) REFERENCES images(id)
  );

  CREATE TABLE IF NOT EXISTS image_vectors (
    id TEXT PRIMARY KEY,
    image_id TEXT NOT NULL,
    embedding TEXT NOT NULL,
    FOREIGN KEY (image_id) REFERENCES images(id)
  );

  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS post_vectors (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    embedding TEXT NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id)
  );

  CREATE TABLE IF NOT EXISTS suggestions (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    image_id TEXT NOT NULL,
    similarity_score REAL NOT NULL,
    guard_passed INTEGER NOT NULL,
    rejection_reason TEXT,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (image_id) REFERENCES images(id)
  );
`;

module.exports = createTables;