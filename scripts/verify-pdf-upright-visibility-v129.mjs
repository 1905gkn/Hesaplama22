import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync("dist/server/index.js", "utf8");
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
assert.ok(match, "HTML_BASE64 bulunmalı");
const html = Buffer.from(match[2], "base64").toString("utf8");
for (const required of [
  'data-rafex-pdf-upright-visibility="v130"',
  "rafex-pdf-upright-halo-v130",
  "rafex-pdf-upright-overlay-v130",
  "vector-effect:non-scaling-stroke!important",
  "shape-rendering:crispEdges!important",
  ".m2-b2b-plan-upright:not(.rafex-profile-merge-source-v61)",
  "paint(original.cloneNode(true),'rafex-pdf-upright-halo-v130','#002c45','14px')",
  "paint(original.cloneNode(true),'rafex-pdf-upright-overlay-v130','#0a8dcc','10.5px')",
  "template.content.querySelectorAll('.m2-corporate-floor svg').forEach(enhance)",
]) assert.ok(html.includes(required), `Eksik PDF ayak görünürlük işareti: ${required}`);
for (const removed of [
  'data-rafex-pdf-foot-count="v128"',
  "AYAK SAYIM TABLOSU",
  "rafex-pdf-foot-count-page-v128",
]) assert.ok(!html.includes(removed), `İstenmeyen sayım arayüzü kaldı: ${removed}`);

const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
const errors = [];
scripts.forEach((entry, index) => {
  if (/\bsrc\s*=/.test(entry[1] || "")) return;
  try { new vm.Script(entry[2], { filename:`v130-inline-${index}.js` }); }
  catch (error) { errors.push(String(error?.stack || error)); }
});
assert.equal(errors.length, 0, errors.join("\n"));
console.log("v130 verify: PDF ayakları 14 px koyu dış katman ve 10,5 px parlak mavi gövdeyle baskın çiziliyor.");
