CREATE TABLE IF NOT EXISTS rack_type_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  system TEXT NOT NULL CHECK(system IN ('b2b','mr','mekik2','drive','konsol')),
  type_no INTEGER NOT NULL,
  name TEXT NOT NULL,
  drawing TEXT NOT NULL,
  log_id TEXT NOT NULL,
  legacy_source TEXT,
  legacy_id INTEGER,
  created_at TEXT NOT NULL,
  UNIQUE(user_id,system,type_no),
  UNIQUE(user_id,log_id),
  UNIQUE(user_id,legacy_source,legacy_id),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS rack_type_records_user_idx
  ON rack_type_records(user_id,system,type_no);

INSERT OR IGNORE INTO rack_type_records(user_id,system,type_no,name,drawing,log_id,legacy_source,legacy_id,created_at)
SELECT user_id,
  CASE WHEN json_extract(drawing,'$.b2b.mr')=1 OR json_extract(drawing,'$.plan.mr')=1 OR lower(COALESCE(json_extract(drawing,'$.systemType'),''))='mr' THEN 'mr' ELSE 'b2b' END,
  type_no,name,drawing,'LEGACY-B2B-'||id||'-'||replace(substr(created_at,12,8),':',''),'b2b',id,created_at
FROM b2b_rack_types;

INSERT OR IGNORE INTO rack_type_records(user_id,system,type_no,name,drawing,log_id,legacy_source,legacy_id,created_at)
SELECT user_id,
  CASE WHEN lower(COALESCE(json_extract(drawing,'$.rafexSystem'),''))='drive' THEN 'drive' WHEN lower(COALESCE(json_extract(drawing,'$.rafexSystem'),'')) IN ('konsol','konsol-kollu','cantilever') THEN 'konsol' ELSE 'mekik2' END,
  type_no,name,drawing,'LEGACY-MEKIK-'||id||'-'||replace(substr(created_at,12,8),':',''),'mekik2',id,created_at
FROM mekik2_rack_types;

INSERT OR IGNORE INTO rack_type_records(user_id,system,type_no,name,drawing,log_id,legacy_source,legacy_id,created_at)
SELECT user_id,'mr',type_no,name,drawing,'LEGACY-MR-'||id||'-'||replace(substr(created_at,12,8),':',''),'mr',id,created_at
FROM mr_rack_types;

INSERT OR REPLACE INTO app_settings(key,value)
VALUES('rack_type_records_migrated_v116',datetime('now'));
