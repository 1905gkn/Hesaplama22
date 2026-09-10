import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { buildPdfFootCountGroups } from "./pdf-foot-count-core-v128.mjs";

const racks = [
  { id:1, x:10, y:10, w:20, h:10, b2bLayout:{ rowCount:1 }, blockName:"A Blok", rafexSystem:"b2b" },
  { id:2, x:30, y:10, w:20, h:10, b2bLayout:{ rowCount:1 }, blockName:"A Blok", rafexSystem:"b2b", sharedFootWith:1 },
  { id:3, x:50, y:10, w:20, h:10, b2bLayout:{ rowCount:1 }, blockName:"A Blok", rafexSystem:"b2b", sharedFootWith:2 },
  { id:4, x:10, y:50, w:20, h:20, b2bLayout:{ rowCount:2 }, blockName:"B Blok", rafexSystem:"mr" },
  { id:5, x:30, y:50, w:20, h:20, b2bLayout:{ rowCount:2 }, blockName:"B Blok", rafexSystem:"mr", sharedFootWith:4 },
];
const groups = buildPdfFootCountGroups(racks);
assert.equal(groups.length, 2);
assert.deepEqual(groups.map((g) => [g.code, g.moduleCount, g.footTeamCount, g.uprightCount]), [
  ["G1", 3, 4, 8],
  ["G2", 2, 6, 12],
]);

const split = buildPdfFootCountGroups([
  { id:1, x:0, y:0, w:10, h:10, joinGroup:"same", b2bLayout:{ rowCount:1 } },
  { id:2, x:10, y:0, w:10, h:10, joinGroup:"same", sharedFootWith:1, b2bLayout:{ rowCount:1 } },
  { id:3, x:100, y:0, w:10, h:10, joinGroup:"same", b2bLayout:{ rowCount:1 } },
  { id:4, x:110, y:0, w:10, h:10, joinGroup:"same", sharedFootWith:3, b2bLayout:{ rowCount:1 } },
]);
assert.equal(split.length, 2, "Aynı joinGroup adıyla kalan kopuk sıralar ayrı sayılmalı");
assert.deepEqual(split.map((g) => g.footTeamCount), [3, 3]);

const source = fs.readFileSync("dist/server/index.js", "utf8");
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
assert.ok(match, "HTML_BASE64 bulunmalı");
const html = Buffer.from(match[2], "base64").toString("utf8");
for (const required of [
  'data-rafex-pdf-foot-count="v128"',
  "AYAK SAYIM TABLOSU",
  "DİKME / PABUÇ",
  "rafex-pdf-foot-summary-v128",
  "rafex-pdf-foot-count-page-v128",
  "Shared frames are counted once",
]) assert.ok(html.includes(required), `Eksik PDF sayım işareti: ${required}`);

const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
const errors = [];
scripts.forEach((entry, index) => {
  if (/\bsrc\s*=/.test(entry[1] || "")) return;
  try { new vm.Script(entry[2], { filename:`v128-inline-${index}.js` }); }
  catch (error) { errors.push(String(error?.stack || error)); }
});
assert.equal(errors.length, 0, errors.join("\n"));
console.log("v128 verify: ortak ayaklar tek sayiliyor; PDF grup etiketleri, sayim tablosu ve betik soz dizimi dogru.");

