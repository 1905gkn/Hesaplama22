UPDATE users
SET allowed_modules = substr(rtrim(allowed_modules), 1, length(rtrim(allowed_modules)) - 1) || ',"free"]'
WHERE instr(allowed_modules, '"free"') = 0;
