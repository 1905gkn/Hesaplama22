ALTER TABLE users ADD COLUMN default_language TEXT NOT NULL DEFAULT 'tr' CHECK(default_language IN ('tr','en','fr'));
