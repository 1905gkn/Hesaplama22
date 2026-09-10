import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync("dist/server/index.js", "utf8");
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
assert.ok(match, "HTML_BASE64 bulunmalı");
const html = Buffer.from(match[2], "base64").toString("utf8");
for (const required of [
  'data-rafex-pdf-upright-visibility="v132"',
  "rafex-pdf-upright-halo-v132",
  "rafex-pdf-upright-overlay-v132",
  "vector-effect:non-scaling-stroke!important",
  "shape-rendering:crispEdges!important",
  "stroke-width:1.2px!important",
  ".m2-b2b-plan-upright:not(.rafex-profile-merge-source-v61)",
  "paintLine(original,'rafex-pdf-upright-halo-v132','#002c45','5px')",
  "paintLine(original,'rafex-pdf-upright-overlay-v132','#0a8dcc','3px')",
  "document.createElementNS('http://www.w3.org/2000/svg','line')",
  "node.style.setProperty('stroke-linecap','butt','important')",
  "node.setAttribute('pointer-events','none')",
  "enhance(document.getElementById('m2LayoutSvg'))",
  "wrappedLayout.__rafexPdfUprightVisibilityV132=true",
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
  try { new vm.Script(entry[2], { filename:`v132-inline-${index}.js` }); }
  catch (error) { errors.push(String(error?.stack || error)); }
});
assert.equal(errors.length, 0, errors.join("\n"));
console.log("v132 verify: PDF ve serbest çizim ayakları aynı ince 5/3 px çizgiyle belirgin gösteriliyor.");
