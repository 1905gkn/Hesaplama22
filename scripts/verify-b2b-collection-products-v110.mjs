import fs from "node:fs";

const source = fs.readFileSync("dist/server/index.js", "utf8");
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error("v110 verify: HTML_BASE64 yok");
const html = Buffer.from(match[2], "base64").toString("utf8");

for (const required of [
  'data-rafex-b2b-collection-products="v110"',
  "rafexB2BCollectionProductRowsV110",
  "Toplama Katı ZS Travers",
  "Toplama Katı Tava",
  "2*rows*multiplier",
  "trayCount(clear,trayWidth)*rows*multiplier",
  "m2CorporateBomRows=bom",
  "m2DirectLayoutProductRows=direct",
]) {
  if (!html.includes(required)) throw new Error(`v110 verify eksik: ${required}`);
}

const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
for (const [, body] of scripts) {
  if (body.includes('data-rafex-b2b-collection-products="v110"')) continue;
}
const runtime = html.match(/<script\s+data-rafex-b2b-collection-products="v110">([\s\S]*?)<\/script>/i);
if (!runtime) throw new Error("v110 verify: runtime bulunamadi");
new Function(runtime[1]);

console.log("v110 verify: toplama katı travers/tava tip ve adet bağları doğrulandı.");
