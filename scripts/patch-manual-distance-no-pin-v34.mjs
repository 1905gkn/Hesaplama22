import fs from "node:fs";
import path from "node:path";

const portalPath = path.join(process.cwd(), "portal.html");
let html = fs.readFileSync(portalPath, "utf8");

const oldFunction = `function m2RememberEditedDistance(rack,direction){if(!rack)return;const key=String(rack.id),state={...m2PinnedForRack(rack.id),[direction]:true};m2PinnedDimensionsByRack[key]=state;m2PinnedDimensions=state;m2LayoutState.pinnedRackId=rack.id;}`;
const newFunction = `function m2RememberEditedDistance(){/* Manual distance changes must not pin guide visibility. */}`;

if (html.includes(oldFunction)) {
  html = html.replace(oldFunction, newFunction);
} else if (!html.includes(newFunction)) {
  throw new Error("v34: Elle mesafe sonrasi olcu sabitleme fonksiyonu bulunamadi.");
}

if (!html.includes(newFunction) || html.includes("[direction]:true};m2PinnedDimensionsByRack[key]=state")) {
  throw new Error("v34: Olcu gorunurlugu sabitleme temizligi dogrulanamadi.");
}

fs.writeFileSync(portalPath, html);
console.log("v34: elle girilen mesafe uygulanir; olcu sabitleme kutusu yalniz kullanici secimiyle degisir.");
