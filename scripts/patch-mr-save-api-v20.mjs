import fs from "node:fs";
import path from "node:path";

const portalPath = path.join(process.cwd(), "portal.html");
let portal = fs.readFileSync(portalPath, "utf8");

// Compatibility pass. patch-mr-saved-types-v18.mjs is now the authoritative MR
// save/list patch. Keep this legacy v20 step idempotent so the production chain
// can still run without undoing or rejecting the newer implementation.
portal = portal.replace(
  'const m2TypeApi = () => m2ActiveModule === "b2b" ? "/api/b2b-types" : m2ActiveModule === "mr" ? "/api/mr-types" : "/api/mekik2-types";',
  'const m2TypeApi = () => m2ActiveModule === "b2b" ? "/api/b2b-types" : m2ActiveModule === "mr" ? "/api/b2b-types" : "/api/mekik2-types";'
);

portal = portal.replace(
  'const savedResult=await req("/api/mr-types",{method:"POST",body:JSON.stringify({drawing})});',
  'const savedResult=await req(m2TypeApi(),{method:"POST",body:JSON.stringify({drawing})});'
);

const legacyFilter = 'm2SavedRackTypes = Array.isArray(result.types) ? result.types.filter((entry) => entry?.id && entry?.name && entry?.drawing?.plan && (m2ActiveModule!=="mr" || entry?.drawing?.b2b?.mr)).map((entry, index) => ({ ...entry, name:["b2b","mr"].includes(m2ActiveModule) ? b2bTypeLetter(entry.name, entry.typeNo || index + 1) : entry.name, source:"server" })) : [];';
const isolatedFilter = 'm2SavedRackTypes = Array.isArray(result.types) ? result.types.filter((entry) => entry?.id && entry?.name && entry?.drawing?.plan && (m2ActiveModule==="mr" ? !!entry?.drawing?.b2b?.mr : m2ActiveModule==="b2b" ? !entry?.drawing?.b2b?.mr : true)).map((entry, index) => ({ ...entry, name:["b2b","mr"].includes(m2ActiveModule) ? b2bTypeLetter(entry.name, entry.typeNo || index + 1) : entry.name, source:"server" })) : [];';
if (portal.includes(legacyFilter)) portal = portal.replace(legacyFilter, isolatedFilter);

if (!portal.includes('m2ActiveModule === "mr" ? "/api/b2b-types"')) {
  throw new Error("MR v20: MR kayit API b2b-types deposuna yonlenmedi");
}
if (!portal.includes('m2ActiveModule==="mr"?Boolean(entry?.drawing?.b2b?.mr)') && !portal.includes('m2ActiveModule==="mr" ? !!entry?.drawing?.b2b?.mr')) {
  throw new Error("MR v20: B2B/MR kayit ayrimi bulunamadi");
}

fs.writeFileSync(portalPath, portal);
console.log("MR v20: uyumluluk kontrolu tamam; yeni MR kayit akisi korundu.");
