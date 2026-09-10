import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync("dist/server/index.js", "utf8");
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
assert.ok(match, "HTML_BASE64 bulunmalı");
const html = Buffer.from(match[2], "base64").toString("utf8");
for (const required of [
  'data-rafex-pdf-upright-visibility="v129"',
  "rafex-pdf-upright-overlay-v129",
  "vector-effect:non-scaling-stroke!important",
  "shape-rendering:crispEdges!important",
  ".m2-b2b-plan-upright:not(.rafex-profile-merge-source-v61):not(.rafex-pdf-upright-overlay-v129)",
  "overlay.style.setProperty('display','inline','important')",
  "overlay.style.setProperty('stroke-width','3.8px','important')",
  "overlay.setAttribute('class','rafex-pdf-upright-overlay-v129')",
  "original.parentNode.appendChild(overlay)",
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
  try { new vm.Script(entry[2], { filename:`v129-inline-${index}.js` }); }
  catch (error) { errors.push(String(error?.stack || error)); }
});
assert.equal(errors.length, 0, errors.join("\n"));
console.log("v129 verify: PDF ayakları üst katmanda, keskin ve ölçekten bağımsız konturla çiziliyor; sayım tablosu kaldırıldı.");
