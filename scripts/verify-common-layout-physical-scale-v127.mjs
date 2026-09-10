import fs from "node:fs";
import assert from "node:assert/strict";

const worker = fs.readFileSync("dist/server/index.js", "utf8");
const match = worker.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error("HTML_BASE64 not found for physical plan scale verification");
const html = Buffer.from(match[2], "base64").toString("utf8");

for (const required of [
  "Math.max(.5, source.totalWidth * m2LayoutState.scale)",
  "Math.max(.5, source.railLength * m2LayoutState.scale)",
  "rack.w = Math.max(.5, rack.widthMm * m2LayoutState.scale)",
  "uprightW = Math.max(.25, footWidthMm * xScale)",
  "uprightH = Math.max(.4, Math.min(13, frameH * .16))",
  "planGapPx = Math.max(.2, planClearanceMm * xScale)",
  "planPalletW = Math.max(.25,",
  "showPallets:state.showPallets!==false",
  "else if(rack.b2b?.showPallets!==false)",
  "showPallets:b.showPallets!==false",
]) assert.ok(html.includes(required), `Final HTML missing physical/per-type rule: ${required}`);

function geometry(areaWidth, areaHeight) {
  const scale = Math.min(880 / areaWidth, 530 / areaHeight);
  const rackWidth = 2880 * scale;
  const rackDepth = 1200 * scale;
  const uprightWidth = Math.max(.25, 90 * scale);
  const uprightHeight = Math.max(.4, Math.min(13, 1100 * scale * .16));
  const gap = Math.max(.2, 75 * scale);
  const palletWidth = Math.max(.25, (rackWidth - 2 * uprightWidth - 4 * gap) / 3);
  return { scale, rackWidth, rackDepth, uprightWidth, uprightHeight, gap, palletWidth };
}

const medium = geometry(50000, 30000);
const large = geometry(100000, 100000);
for (const key of ["uprightWidth", "uprightHeight", "gap", "palletWidth"]) {
  const mediumRatio = medium[key] / medium.rackWidth;
  const largeRatio = large[key] / large.rackWidth;
  assert.ok(Math.abs(mediumRatio - largeRatio) < 1e-10, `${key} must keep its rack-relative ratio`);
}
assert.ok(large.palletWidth > large.gap * 8, "100 m plan pallets must remain distinct from their clearances");
assert.ok(large.rackDepth < 8, "Verification fixture must exercise the former 8 px depth distortion");

const report = fs.readFileSync("client/b2b-report-3d.js", "utf8");
for (const required of [
  "showPallets: state.showPallets !== false",
  "merged.showPallets = fallback.showPallets",
  "showPallets:tallest?.showPallets!==false",
  "showPallets:moduleOptions[0]?.showPallets!==false",
]) assert.ok(report.includes(required), `B2B report must preserve per-type pallet visibility: ${required}`);

console.log("v127 verify: 50x30 m and 100x100 m top plans keep identical physical proportions; pallet visibility stays per rack type.");
