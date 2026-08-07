CREATE TABLE IF NOT EXISTS mekik2_rack_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type_no INTEGER NOT NULL,
  name TEXT NOT NULL,
  drawing TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(user_id,type_no),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS mekik2_rack_types_user_idx ON mekik2_rack_types(user_id,type_no);
