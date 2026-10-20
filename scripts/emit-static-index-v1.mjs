import {transform as zoomMarks} from './zoom-marks-v347.mjs';
import fs from "node:fs";
import {transform as rackGapBasis} from "./rack-gap-basis-v346.mjs";
import {transform as dimensionClickThrough} from "./dimension-click-through-v345.mjs";
import {transform as singleWall} from "./single-wall-v344.mjs";
import {transform as fontMinimum} from "./font-minimum-v343.mjs";
import {transform as palletTotalPosition} from "./patch-pallet-total-position-v342.mjs";
import crypto from "node:crypto";
import {transform as simplifyUI} from "./simplify-ui-runtime-v321.mjs";
import {execFileSync} from "node:child_process";
import {transform as productCodes} from "./product-codes-v322.mjs";
import {transform as exportProducts} from "./export-products-v323.mjs";
import {transform as reportMetadata} from "./report-metadata-v324.mjs";
import {transform as toolbarFixes} from "./toolbar-fixes-v325.mjs";
import {transform as reliableDashboard} from "./reliable-dashboard-v326.mjs";

const serverPath = "dist/server/index.js";
const outputPath = "dist/index.html";
const source = fs.readFileSync(serverPath, "utf8");
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);

if (!match) {
  throw new Error("HTML_BASE64 bulunamadi; statik giris sayfasi olusturulamadi.");
}

let html = Buffer.from(match[2], "base64").toString("utf8");
if (!html.startsWith("<!doctype html>")) {
  throw new Error("Cozulen ana sayfa beklenen HTML biciminde degil.");
}

const replacementRuntime=fs.readFileSync("client/replace-rack-type-v319.js","utf8");
html=html.replace(/<script data-rafex-replace-type="v319">[\s\S]*?<\/script>/g,"");
const bodyEnd=html.lastIndexOf("</body>");
if(bodyEnd<0)throw Error("Ana sayfanın kapanış etiketi bulunamadı.");
html=html.slice(0,bodyEnd)+'<script data-rafex-replace-type="v319">'+replacementRuntime+'\nwindow.rafexInstallLayoutBoundaryV321();\n</script>'+html.slice(bodyEnd);
html=simplifyUI(html);
html=productCodes(html);
html=exportProducts(html);
html=reportMetadata(html);
html=toolbarFixes(html);
html=reliableDashboard(html);
html=palletTotalPosition(html);
html=fontMinimum(html);
html=singleWall(html);
html=dimensionClickThrough(html);
html=rackGapBasis(html);
html=zoomMarks(html);
// Both the static entry and API fallback must serve the same optimized runtime.
fs.writeFileSync(serverPath,source.replace(match[2],Buffer.from(html,'utf8').toString('base64')));

const assetDirectory = "dist/inline-assets";
fs.mkdirSync(assetDirectory, { recursive: true });
const emittedAssets = new Set();
html = html.replace(
  /data:(image\/(?:png|jpeg|webp|gif|svg\+xml));base64,([A-Za-z0-9+/=]+)/gi,
  (_whole, mime, encoded) => {
    const buffer = Buffer.from(encoded, "base64");
    const extension = mime.toLowerCase() === "image/jpeg" ? "jpg" : mime.split("/")[1].replace("+xml", "");
    const digest = crypto.createHash("sha256").update(buffer).digest("hex").slice(0, 20);
    const fileName = `${digest}.${extension}`;
    if (!emittedAssets.has(fileName)) {
      fs.writeFileSync(`${assetDirectory}/${fileName}`, buffer);
      emittedAssets.add(fileName);
    }
    return `/inline-assets/${fileName}`;
  },
);

fs.writeFileSync(outputPath, html);
execFileSync(process.execPath,["scripts/verify-ui-runtime-v321.mjs",outputPath],{stdio:"inherit"});
execFileSync(process.execPath,["scripts/verify-product-code-rules-v322.mjs",outputPath],{stdio:"inherit"});
execFileSync(process.execPath,["scripts/verify-export-products-v323.mjs",outputPath],{stdio:"inherit"});
execFileSync(process.execPath,["scripts/verify-toolbar-v325.mjs",outputPath],{stdio:"inherit"});
console.log(`Static entry v2: ${html.length} baytlik ana sayfa ve ${emittedAssets.size} tekil gorsel ayrildi.`);

