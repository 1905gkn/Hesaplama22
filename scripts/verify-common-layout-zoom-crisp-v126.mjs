import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync("dist/server/index.js", "utf8");
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error("HTML_BASE64 not found for v126 verification");
const html = Buffer.from(match[2], "base64").toString("utf8");

for (const required of [
  'data-rafex-common-layout-zoom-crisp="v126"',
  "rafexCommonLayoutZoomCrispV126",
  "rafexFocusSelectedRackV126",
  "m2FocusSelectedRackV126",
  "SEÇİLİ RAF",
  "m2ZoomLayout=function(change,reset)",
  "m2SvgPoint=point",
  "vector-effect:non-scaling-stroke",
  "fill:#c78330!important",
  "fill-opacity:.055!important",
]) if (!html.includes(required)) throw new Error("v126 verification missing: " + required);

const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
const errors = [];
scripts.forEach((entry, index) => {
  if (/\bsrc\s*=/.test(entry[1] || "")) return;
  try { new vm.Script(entry[2], { filename: `v126-inline-${index}.js` }); }
  catch (error) { errors.push(String(error && error.stack || error)); }
});
if (errors.length) throw new Error("v126 inline syntax error:\n" + errors.join("\n"));

console.log("v126 verify: zoom controls, selected-rack focus, pointer mapping and crisp SVG palette are present and syntax-valid.");
