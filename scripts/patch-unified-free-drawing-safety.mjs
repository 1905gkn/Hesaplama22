import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const workerPath = path.join(root, "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("Unified free drawing safety: HTML_BASE64 bulunamadi.");

let html = Buffer.from(match[3], "base64").toString("utf8");
if (!html.includes('data-rafex-unified-free-drawing="v1"')) {
  throw new Error("Unified free drawing safety: v1 runtime bulunamadi.");
}

let fixes = 0;

function replaceRequired(pattern, replacement, label) {
  const before = html;
  html = html.replace(pattern, replacement);
  if (html === before) throw new Error(`Unified free drawing safety: ${label} bulunamadi.`);
  fixes += 1;
}

// The original runtime observed the whole document and ensureNav() rewrote nav icon
// text on every callback. textContent itself creates another mutation, so this could
// create an endless microtask loop and make the whole portal look unreachable.
replaceRequired(
  /if\(i\)i\.textContent=no;/g,
  "if(i&&i.textContent!==no)i.textContent=no;",
  "idempotent nav numbering",
);
replaceRequired(
  /new MutationObserver\(\(\)=>ensureNav\(\)\)\.observe\(document\.documentElement,\{childList:true,subtree:true\}\);/g,
  "",
  "global mutation observer",
);

// Resolve showPage without ever evaluating an undeclared identifier, and keep a
// recovery path so a Serbest Cizim-only error cannot take the rest of the portal down.
replaceRequired(
  /const originalShowPage=window\.showPage\|\|showPage;/g,
  "const originalShowPage=typeof window.showPage==='function'?window.showPage:(typeof showPage==='function'?showPage:null);",
  "safe showPage resolver",
);
replaceRequired(
  /if\(name==='free'\)\{enterFreeDrawing\(\);return;\}/g,
  "if(name==='free'){try{enterFreeDrawing();}catch(error){console.error('Serbest Cizim acilis hatasi',error);free.active=false;if(typeof originalShowPage==='function')return originalShowPage('home');}return;}",
  "free drawing recovery wrapper",
);

const safeMarker = '<!-- data-rafex-unified-free-drawing-safe="v2" -->';
if (!html.includes(safeMarker)) {
  const closing = html.lastIndexOf("</body>");
  if (closing < 0) throw new Error("Unified free drawing safety: </body> bulunamadi.");
  html = html.slice(0, closing) + safeMarker + "\n" + html.slice(closing);
}

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.replace(match[0], `${match[1]}${match[2]}${encoded}${match[2]}`);
fs.writeFileSync(workerPath, worker);

const finalHtml = Buffer.from(encoded, "base64").toString("utf8");
for (const required of [
  'data-rafex-unified-free-drawing="v1"',
  'data-rafex-unified-free-drawing-safe="v2"',
  "if(i&&i.textContent!==no)i.textContent=no;",
  "typeof window.showPage==='function'",
]) {
  if (!finalHtml.includes(required)) throw new Error(`Unified free drawing safety dogrulama hatasi: ${required}`);
}
if (finalHtml.includes("new MutationObserver(()=>ensureNav()).observe(document.documentElement,{childList:true,subtree:true});")) {
  throw new Error("Unified free drawing safety: recursive observer hala mevcut.");
}

console.log(`FINAL: Serbest Cizim guvenlik duzeltmeleri uygulandi (v2, ${fixes} fix).`);
