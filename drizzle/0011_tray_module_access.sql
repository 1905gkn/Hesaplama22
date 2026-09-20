-- Preserve the existing tray access formerly inherited from Travers.
UPDATE users SET allowed_modules=json_insert(allowed_modules,'$[#]','tava')
WHERE json_valid(allowed_modules)
  AND EXISTS (SELECT 1 FROM json_each(allowed_modules) WHERE value='travers')
  AND NOT EXISTS (SELECT 1 FROM json_each(allowed_modules) WHERE value='tava');

-- The pre-existing default grants all calculation modules to new users.
CREATE TRIGGER users_default_tray_module AFTER INSERT ON users
WHEN json_valid(NEW.allowed_modules)
  AND EXISTS (SELECT 1 FROM json_each(NEW.allowed_modules) WHERE value='travers')
  AND NOT EXISTS (SELECT 1 FROM json_each(NEW.allowed_modules) WHERE value='tava')
BEGIN
  UPDATE users SET allowed_modules=json_insert(allowed_modules,'$[#]','tava') WHERE id=NEW.id;
END;
