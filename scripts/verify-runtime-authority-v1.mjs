import fs from "node:fs";

const source = fs.readFileSync("dist/server/index.js", "utf8");
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error("Runtime authority verify: HTML_BASE64 bulunamadi");
const html = Buffer.from(match[2], "base64").toString("utf8");
const count = (needle) => html.split(needle).length - 1;
if (count('data-rafex-runtime-authority="v1"') !== 2) throw new Error("Runtime authority style/script tekil degil");
if (count('window.RafexRuntimeAuthority=') !== 1) throw new Error("Runtime authority nesnesi tekil degil");
if (html.includes('data-rafex-common-layout-theme="v96"')) throw new Error("Eski v96 tema katmani hala aktif");
for (const required of ['data-rafex-authority-mode','data-rafex-authority-system','rafex-authority-state','requestViewer(system)']) {
  if (!html.includes(required)) throw new Error("Runtime authority verify eksigi: " + required);
}
console.log("Runtime authority v1 verified: tek durum ve tema otoritesi aktif.");
