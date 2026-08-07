CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
DELETE FROM mekik2_rack_types;
INSERT OR IGNORE INTO app_settings(key,value) VALUES('mekik2_types_reset_v101',datetime('now'));
