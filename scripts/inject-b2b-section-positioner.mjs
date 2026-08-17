import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const workerPath = path.join(root, "dist/server/index.js");
const fallbackPath = path.join(root, "client/b2b-section-positioner-fallback.js");
const marker = "data-rafex-b2b-section-positioner-fallback=\"v2\"";
const clarityMarker = "data-rafex-section-positioner-clarity=\"v1\"";
const oldActionsLookup = 'const actions = document.querySelector(".m2-report-head-actions");\n    if (!actions) return false;';
const robustActionsLookup = 'const reportTypeHost = document.getElementById("m2ReportType");\n    const reportRoot = document.getElementById("m2CorporatePreview") || document.getElementById("m2CorporatePrint");\n    const actions = document.querySelector(".m2-report-head-actions") || reportTypeHost?.parentElement || reportRoot?.parentElement;\n    if (!actions) return false;';
const blurredModalClass = 'modal.className = "m2-layout-modal rafex-section-placement-modal";';
const clearModalClass = 'modal.className = "rafex-section-placement-modal";';

let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("HTML_BASE64 build çıktısında bulunamadı.");

let html = Buffer.from(match[3], "base64").toString("utf8");

// Önceden gömülmüş fallback sürümlerini de her buildde güncelle.
html = html.replaceAll(oldActionsLookup, robustActionsLookup);
html = html.replaceAll(blurredModalClass, clearModalClass);

if (!html.includes(marker)) {
  let fallback = fs.readFileSync(fallbackPath, "utf8");
  fallback = fallback.replaceAll(oldActionsLookup, robustActionsLookup);
  fallback = fallback.replaceAll(blurredModalClass, clearModalClass);
  fallback = fallback.replace(/<\/script/gi, "<\\/script");

  if (!fallback.includes(clearModalClass)) {
    throw new Error("Kesit Yer Belirleme modal bulanıklık sınıfı kaldırılamadı.");
  }

  const scriptTag = `<script ${marker}>${fallback}<\/script>`;
  const bodyEnd = html.lastIndexOf("</body>");
  if (bodyEnd < 0) throw new Error("Portal </body> kapanışı bulunamadı.");
  html = `${html.slice(0, bodyEnd)}${scriptTag}${html.slice(bodyEnd)}`;
}

// Modal arkasındaki sayfa her zaman net kalsın. Genel modal stilleri tekrar eklense bile bu kural baskın gelir.
if (!html.includes(clarityMarker)) {
  const clarityTag = `<style ${clarityMarker}>#m2SectionPlacementModal,.rafex-section-placement-modal{backdrop-filter:none!important;-webkit-backdrop-filter:none!important;filter:none!important}body:has(#m2SectionPlacementModal:not([hidden]))>*:not(#m2SectionPlacementModal){filter:none!important}</style>`;
  const bodyEnd = html.lastIndexOf("</body>");
  if (bodyEnd < 0) throw new Error("Portal </body> kapanışı bulunamadı.");
  html = `${html.slice(0, bodyEnd)}${clarityTag}${html.slice(bodyEnd)}`;
}

// Statik buton yoksa mümkün olan en güvenli B2B rapor başlığına ekle.
if (!html.includes('id="m2SectionPlacementButton"')) {
  const actionsIndex = html.indexOf("m2-report-head-actions");
  let targetIndex = actionsIndex >= 0 ? html.indexOf('id="m2ReportType"', actionsIndex) : html.indexOf('id="m2ReportType"');
  if (targetIndex < 0) targetIndex = html.indexOf("Çıktı Tipi");
  const labelStart = targetIndex >= 0 ? html.lastIndexOf("<label", targetIndex) : -1;
  if (labelStart >= 0) {
    html = `${html.slice(0, labelStart)}<button type="button" id="m2SectionPlacementButton" class="rafex-section-placement-button" data-rafex-section-positioner-static="v2">Kesit Yer Belirleme</button>${html.slice(labelStart)}`;
  }
}

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.slice(0, match.index) + match[1] + match[2] + encoded + match[2] + worker.slice(match.index + match[0].length);
fs.writeFileSync(workerPath, worker);

const verify = worker.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
const verifyHtml = verify ? Buffer.from(verify[2], "base64").toString("utf8") : "";
if (!verifyHtml.includes("Kesit Yer Belirleme") || !verifyHtml.includes(marker)) {
  throw new Error("Kesit Yer Belirleme fallback'i build çıktısına eklenemedi.");
}
if (!verifyHtml.includes("reportTypeHost") || !verifyHtml.includes("m2CorporatePreview")) {
  throw new Error("Kesit Yer Belirleme canlı görünürlük koruması build çıktısına eklenemedi.");
}
if (!verifyHtml.includes(clarityMarker) || !verifyHtml.includes("backdrop-filter:none!important")) {
  throw new Error("Kesit Yer Belirleme net görünüm koruması build çıktısına eklenemedi.");
}
if (verifyHtml.includes(blurredModalClass)) {
  throw new Error("Kesit Yer Belirleme modalında bulanıklık sınıfı kaldı.");
}
