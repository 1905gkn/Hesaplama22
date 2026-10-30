import {transform as outputLanguage439} from './patch-output-language-v439.mjs';
import {transform as reliableDrafts} from './reliable-drafts-v407.mjs';
import {transform as sharedNotesUI} from './shared-notes-v405.mjs';
import {transform as manualPalletWeight} from './manual-pallet-weight-v398.mjs';
import {transform as katWire} from './kat-wire-v392.mjs';
import {transform as collectionAccessoryIsolation} from './collection-accessory-isolation-v387.mjs';
import {transform as accessoryFloors} from './accessory-floors-v385.mjs';
import {transform as accessoryLabels} from './accessory-labels-v384.mjs';
import {transform as initialFootFinish} from './initial-foot-finish-v383.mjs';
import {transform as topFinishesUnits} from './top-finishes-units-v382.mjs';
import {transform as representativeFront} from './representative-front-v380.mjs';
import {transform as observer} from './observer-v379.mjs';
import {transform as b2bLevelLimit} from './b2b-level-limit-v378.mjs';
import {transform as extensionPriority} from './extension-priority-v376.mjs';
import {transform as productUnits} from './product-units-v377.mjs';
import {transform as projectProducts} from './project-products-v372.mjs';
import {transform as bannerLanguage} from './banner-language-v371.mjs';
import {transform as crmStart} from './crm-start-v370.mjs';
import {transform as crmReport} from './crm-report-v369.mjs';
import {transform as crmProject} from './crm-project-v368.mjs';
import {transform as equalDistanceFont} from './equal-distance-font-v367.mjs';
import {transform as stableGapLabel} from './stable-gap-label-v366.mjs';
import {transform as hideColumnMeasures} from './hide-column-measures-v365.mjs';
import {transform as preciseMeasures} from './precise-measures-v364.mjs';
import {transform as cadDistances} from './cad-distances-v363.mjs';
import {transform as projectRoundtrip} from './project-roundtrip-v362.mjs';
import {transform as livePalletSpan} from './live-pallet-span-v361.mjs';
import {transform as stableQuotePanel} from './stable-quote-panel-v360.mjs';
import {transform as independentPalletGap} from './independent-pallet-gap-v359.mjs';
import {transform as attributedQuotes} from './attributed-quotes-v358.mjs';
import {transform as motivationCarousel} from './motivation-carousel-v356.mjs';
import {transform as palletSideGap} from './pallet-side-gap-v357.mjs';
import {transform as dailyMotivation} from './daily-motivation-v355.mjs';
import {transform as coverLayout} from './cover-layout-v354.mjs';
import {transform as wallGapBasis} from './wall-gap-basis-v353.mjs';
import {transform as arrayGapBasis} from './array-gap-basis-v352.mjs';
import {transform as inlinePalletCount} from './inline-pallet-count-v351.mjs';
import {transform as gapSide} from './gap-side-v350.mjs';
import {transform as gapModePreserve} from './gap-mode-preserve-v349.mjs';
import {transform as rackHitPriority} from './rack-hit-priority-v348.mjs';
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
html=rackHitPriority(html);
html=gapModePreserve(html);
html=gapSide(html);
html=inlinePalletCount(html);
html=arrayGapBasis(html);
html=wallGapBasis(html);
html=coverLayout(html);
html=dailyMotivation(html);
html=motivationCarousel(html);
html=palletSideGap(html);
html=attributedQuotes(html);
html=independentPalletGap(html);
html=stableQuotePanel(html);
html=livePalletSpan(html);
html=projectRoundtrip(html);
html=cadDistances(html);
html=preciseMeasures(html);
html=hideColumnMeasures(html);
html=stableGapLabel(html);
html=equalDistanceFont(html);
html=crmProject(html);
html=crmReport(html);
html=crmStart(html);
html=bannerLanguage(html);
html=projectProducts(html);
html=extensionPriority(html);
html=productUnits(html);
html=observer(html);
html=representativeFront(html);
html=topFinishesUnits(html);
html=initialFootFinish(html);
html=accessoryLabels(html);
html=accessoryFloors(html);
html=collectionAccessoryIsolation(html);
html=katWire(html);
html=b2bLevelLimit(html);
html=manualPalletWeight(html);
html=sharedNotesUI(html);
html=reliableDrafts(html);
html=outputLanguage439(html);
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
execFileSync(process.execPath,["scripts/verify-crm-start-v370.mjs",outputPath],{stdio:"inherit"});
execFileSync(process.execPath,["scripts/verify-project-products-v372.mjs",outputPath],{stdio:"inherit"});
execFileSync(process.execPath,["scripts/verify-daily-quotes-v375.mjs"],{stdio:"inherit"});
execFileSync(process.execPath,["scripts/verify-extension-units-v377.mjs",outputPath],{stdio:"inherit"});
execFileSync(process.execPath,["scripts/verify-b2b-level-limit-v378.mjs",outputPath],{stdio:"inherit"});
execFileSync(process.execPath,["scripts/verify-observer-v379.mjs",outputPath],{stdio:"inherit"});
execFileSync(process.execPath,["scripts/verify-representative-front-v380.mjs",outputPath],{stdio:"inherit"});
execFileSync(process.execPath,["scripts/verify-top-finishes-units-v382.mjs",outputPath],{stdio:"inherit"});
execFileSync(process.execPath,["scripts/verify-initial-foot-finish-v383.mjs",outputPath],{stdio:"inherit"});
execFileSync(process.execPath,["scripts/verify-accessory-labels-v384.mjs",outputPath,"dist/b2b-viewer.patched.entry.js"],{stdio:"inherit"});
execFileSync(process.execPath,["scripts/verify-accessory-floors-v385.mjs","dist/b2b-viewer.patched.entry.js"],{stdio:"inherit"});
execFileSync(process.execPath,["scripts/verify-collection-accessory-isolation-v387.mjs",outputPath,"dist/b2b-viewer.patched.entry.js"],{stdio:"inherit"});
execFileSync(process.execPath,["scripts/verify-accessory-label-position-v389.mjs","dist/b2b-viewer.patched.entry.js"],{stdio:"inherit"});
execFileSync(process.execPath,["scripts/verify-elevated-accessory-labels-v390.mjs","dist/b2b-viewer.patched.entry.js"],{stdio:"inherit"});
execFileSync(process.execPath,["scripts/verify-kat-wire-v392.mjs",outputPath,"dist/b2b-viewer.patched.entry.js","assets/kat-teli.glb"],{stdio:"inherit"});
execFileSync(process.execPath,["scripts/verify-manual-pallet-weight-v398.mjs",outputPath,"dist/b2b-viewer.patched.entry.js"],{stdio:"inherit"});
console.log(`Static entry v2: ${html.length} baytlik ana sayfa ve ${emittedAssets.size} tekil gorsel ayrildi.`);
