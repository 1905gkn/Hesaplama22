import fs from "node:fs";
import path from "node:path";

const portalPath = path.join(process.cwd(), "portal.html");
let portal = fs.readFileSync(portalPath, "utf8");

function replaceRequired(from, to, label) {
  if (portal.includes(to)) return;
  if (!portal.includes(from)) throw new Error(`MR v20: ${label} bulunamadi`);
  portal = portal.replace(from, to);
}

replaceRequired(
  'const m2TypeApi = () => m2ActiveModule === "b2b" ? "/api/b2b-types" : m2ActiveModule === "mr" ? "/api/mr-types" : "/api/mekik2-types";',
  'const m2TypeApi = () => m2ActiveModule === "b2b" ? "/api/b2b-types" : m2ActiveModule === "mr" ? "/api/b2b-types" : "/api/mekik2-types";',
  "MR kayit API yonlendirmesi"
);

replaceRequired(
  'const savedResult=await req("/api/mr-types",{method:"POST",body:JSON.stringify({drawing})});',
  'const savedResult=await req(m2TypeApi(),{method:"POST",body:JSON.stringify({drawing})});',
  "MR kaydet POST"
);

replaceRequired(
  'm2SavedRackTypes = Array.isArray(result.types) ? result.types.filter((entry) => entry?.id && entry?.name && entry?.drawing?.plan && (m2ActiveModule!=="mr" || entry?.drawing?.b2b?.mr)).map((entry, index) => ({ ...entry, name:["b2b","mr"].includes(m2ActiveModule) ? b2bTypeLetter(entry.name, entry.typeNo || index + 1) : entry.name, source:"server" })) : [];',
  'm2SavedRackTypes = Array.isArray(result.types) ? result.types.filter((entry) => entry?.id && entry?.name && entry?.drawing?.plan && (m2ActiveModule==="mr" ? !!entry?.drawing?.b2b?.mr : m2ActiveModule==="b2b" ? !entry?.drawing?.b2b?.mr : true)).map((entry, index) => ({ ...entry, name:["b2b","mr"].includes(m2ActiveModule) ? b2bTypeLetter(entry.name, entry.typeNo || index + 1) : entry.name, source:"server" })) : [];',
  "B2B ve MR kayit listesi ayrimi"
);

fs.writeFileSync(portalPath, portal);
console.log("MR v20: kaydetme mevcut b2b-types deposuna baglandi; B2B ve MR kayitlari arayuzde birbirinden ayrildi.");
