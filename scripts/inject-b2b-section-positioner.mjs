import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const workerPath = path.join(root, "dist/server/index.js");
const fallbackPath = path.join(root, "client/b2b-section-positioner-fallback.js");
const marker = "data-rafex-b2b-section-positioner-fallback=\"v2\"";
const oldActionsLookup = 'const actions = document.querySelector(".m2-report-head-actions");\n    if (!actions) return false;';
const robustActionsLookup = 'const reportTypeHost = document.getElementById("m2ReportType");\n    const reportRoot = document.getElementById("m2CorporatePreview") || document.getElementById("m2CorporatePrint");\n    const actions = document.querySelector(".m2-report-head-actions") || reportTypeHost?.parentElement || reportRoot?.parentElement;\n    if (!actions) return false;';

let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("HTML_BASE64 build çıktısında bulunamadı.");

let html = Buffer.from(match[3], "base64").toString("utf8");

// Daha önce gömülmüş fallback varsa da canlıda başlık sınıfına bağımlı kalmasın.
html = html.replace(oldActionsLookup, robustActionsLookup);

if (!html.includes(marker)) {
  let fallback = fs.readFileSync(fallbackPath, "utf8");
  fallback = fallback.replace(oldActionsLookup, robustActionsLookup);
  fallback = fallback.replace(/<\/script/gi, "<\\/script");

  const scriptTag = `<script ${marker}>${fallback}<\/script>`;
  const bodyEnd = html.lastIndexOf("</body>");
  if (bodyEnd < 0) throw new Error("Portal </body> kapanışı bulunamadı.");
  html = `${html.slice(0, bodyEnd)}${scriptTag}${html.slice(bodyEnd)}`;
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
