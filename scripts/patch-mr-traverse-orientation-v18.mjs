import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const viewerPath = path.join(root, "client", "mr-viewer.entry.js");
const portalPath = path.join(root, "portal.html");

let viewer = fs.readFileSync(viewerPath, "utf8");

// v16 ayak ekseni yamasindan sonraki production kaynak.
const wrongAxis = `            beam.scale.set(beamLength / traverse.size.x, traverseHeight / traverse.size.y, 1);
            if (side === "front") {
              beam.rotation.y = Math.PI;
              beam.position.set(moduleX + beamLength, levelY, beamDepth);
            } else {
              beam.position.set(moduleX, levelY, Math.max(0, depth - beamDepth));
            }`;

// Eski kaynak icin geriye donuk destek.
const wrongLegacy = `            beam.scale.set(width / traverse.size.x, traverseHeight / traverse.size.y, 1);
            if (side === "front") {
              beam.rotation.y = Math.PI;
              beam.position.set(moduleX + width, levelY, beamDepth);
            } else {
              beam.position.set(moduleX, levelY, Math.max(0, depth - beamDepth));
            }`;

const correctedAxis = `            beam.scale.set(beamLength / traverse.size.x, traverseHeight / traverse.size.y, 1);
            // ZS traverslerin braket/kanca yuzu disari degil raf icine bakar.
            // On travers kaynak yonunde, arka travers 180 derece cevrilmis olarak karsilikli durur.
            if (side === "front") {
              beam.position.set(moduleX, levelY, 0);
            } else {
              beam.rotation.y = Math.PI;
              beam.position.set(moduleX + beamLength, levelY, depth);
            }`;

const correctedLegacy = `            beam.scale.set(width / traverse.size.x, traverseHeight / traverse.size.y, 1);
            // ZS traverslerin braket/kanca yuzu disari degil raf icine bakar.
            // On travers kaynak yonunde, arka travers 180 derece cevrilmis olarak karsilikli durur.
            if (side === "front") {
              beam.position.set(moduleX, levelY, 0);
            } else {
              beam.rotation.y = Math.PI;
              beam.position.set(moduleX + width, levelY, depth);
            }`;

if (viewer.includes(wrongAxis)) {
  viewer = viewer.replace(wrongAxis, correctedAxis);
  fs.writeFileSync(viewerPath, viewer);
  console.log("MR v18: travers yonleri ayak eksenlerinde duzeltildi.");
} else if (viewer.includes(wrongLegacy)) {
  viewer = viewer.replace(wrongLegacy, correctedLegacy);
  fs.writeFileSync(viewerPath, viewer);
  console.log("MR v18: travers yonleri eski kaynakta duzeltildi.");
} else if (viewer.includes(correctedAxis) || viewer.includes(correctedLegacy)) {
  console.log("MR v18: travers yonleri zaten dogru.");
} else {
  throw new Error("MR v18: travers yerlesim blogu bulunamadi.");
}

// v19 regression kilidi: travers duzeltmesi eski MR/B2B kontrollerini bir daha sessizce ezemesin.
if (fs.existsSync(portalPath)) {
  let portal = fs.readFileSync(portalPath, "utf8");
  const requiredPortalMarkers = [
    ['B2B olcu dialog stili', /data-rafex-mr-b2b-v17=["']1["']/],
    ['olcu ayarlari dialogu', /id=["']mrMeasureSettingsDialogV17["']/],
    ['olcu gorunurluk dialogu', /id=["']mrDimensionVisibilityDialogV17["']/],
    ['son travers kotu alani', /id=["']mrTopTraverseEditV17["']/],
    ['MR60 1.5 mm', /value=["']MR60\|1\.5["']/],
    ['MR60 2 mm', /value=["']MR60\|2["']/],
    ['ZS35 1.5 mm', /value=["']ZS35\|1\.5["']/],
    ['ZS35 2 mm', /value=["']ZS35\|2["']/],
    ['ZS55 1.5 mm', /value=["']ZS55\|1\.5["']/],
    ['ZS55 2 mm', /value=["']ZS55\|2["']/],
    ['ZS65 1.5 mm', /value=["']ZS65\|1\.5["']/],
    ['ZS65 2 mm', /value=["']ZS65\|2["']/],
    ['ZS35 H55', /ZS35[^<]{0,100}H\s*55\s*mm/],
    ['ZS55 H75', /ZS55[^<]{0,100}H\s*75\s*mm/],
    ['ZS65 H85', /ZS65[^<]{0,100}H\s*85\s*mm/],
    ['MR60 genislik 60', /Ayak genisligi\s*:\s*60\s*mm/i],
  ];
  const missing = requiredPortalMarkers.filter(([, pattern]) => !pattern.test(portal)).map(([label]) => label);
  if (missing.length) {
    throw new Error(`MR v19 regression kilidi: onceki MR guncellemeleri eksik: ${missing.join(", ")}`);
  }

  // Yeni geometri + korunan kontroller eski tarayici onbellegiyle karismasin.
  portal = portal.replace(/\/mr-viewer\.js\?v=mr-system-\d+/g, "/mr-viewer.js?v=mr-system-19");

  // Canli build'in dogru MR zincirinden ciktigini HTML icinden de denetlenebilir yap.
  if (!portal.includes('name="rafex-mr-regression-lock"')) {
    portal = portal.replace(
      "<head>",
      '<head>\n    <meta name="rafex-mr-regression-lock" content="v19" />',
    );
  }

  fs.writeFileSync(portalPath, portal);
  console.log("MR v19: B2B tipi olculer, MR60/ZS profilleri, travers yukseklikleri ve travers yonu birlikte kilitlendi.");
}
