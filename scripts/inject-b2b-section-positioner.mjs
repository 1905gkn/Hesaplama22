import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const workerPath = path.join(root, "dist/server/index.js");
const fallbackPath = path.join(root, "client/b2b-section-positioner-v5.js");
const marker = "data-rafex-b2b-section-positioner-fallback=\"v5\"";
const clarityMarker = "data-rafex-section-positioner-clarity=\"v1\"";
const oldActionsLookup = 'const actions = document.querySelector(".m2-report-head-actions");\n    if (!actions) return false;';
const robustActionsLookup = 'const reportTypeHost = document.getElementById("m2ReportType");\n    const reportRoot = document.getElementById("m2CorporatePreview") || document.getElementById("m2CorporatePrint") || document.getElementById("m2CorporatePrintArea");\n    const actions = document.querySelector(".m2-report-head-actions") || reportTypeHost?.parentElement || reportRoot?.parentElement;\n    if (!actions) return false;';
const blurredModalClass = 'modal.className = "m2-layout-modal rafex-section-placement-modal";';
const clearModalClass = 'modal.className = "rafex-section-placement-modal";';
const fallbackScriptPattern = /<script\s+data-rafex-b2b-section-positioner-fallback=(?:\\["']|["'])v\d+(?:\\["']|["'])[^>]*>[\s\S]*?<\/script>/gi;

let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("HTML_BASE64 build çıktısında bulunamadı.");

let html = Buffer.from(match[3], "base64").toString("utf8");

html = html.replace(fallbackScriptPattern, "");
html = html.replaceAll(oldActionsLookup, robustActionsLookup);
html = html.replaceAll(blurredModalClass, clearModalClass);

let fallback = fs.readFileSync(fallbackPath, "utf8");
fallback = fallback.replaceAll(oldActionsLookup, robustActionsLookup);
fallback = fallback.replaceAll(blurredModalClass, clearModalClass);

// v5 hotfix: modalı her tıklamada silip yeniden oluşturma. Bu, butonun açılış
// zincirini gereksiz yere bozuyor ve tüm raporu yeniden render ederek arayüzü
// donduruyordu. Mevcut modalı yeniden kullan ve editörü sonraki tick'te hazırla.
fallback = fallback.replace(
  'const old = document.getElementById("m2SectionPlacementModal");\n    if (old) old.remove();',
  'const old = document.getElementById("m2SectionPlacementModal");\n    if (old) return old;',
);
fallback = fallback.replace(
  `    try {\n      const render = typeof m2RenderCorporateReport === "function" ? m2RenderCorporateReport : null;\n      const result = render?.();\n      if (result && typeof result.then === "function") result.finally(() => setTimeout(prepareEditor, 0));\n      else setTimeout(prepareEditor, 70);\n    } catch { prepareEditor(); }`,
  `    setTimeout(prepareEditor, 0);`,
);

// PDF/print hotfix: editördeki ölçek ve konum baskı CSS'i tarafından ezilmesin.
// Inline !important kullanarak ekrandaki % ölçeği PDF çıktısına birebir taşı.
fallback = fallback.replace(
  '    image.style.objectPosition = `${50 + settings.x}% ${50 + settings.y}%`;\n    image.style.transform = `scale(${settings.scale})`;\n    image.style.transformOrigin = "center center";',
  '    image.style.setProperty("object-position", `${50 + settings.x}% ${50 + settings.y}%`, "important");\n    image.style.setProperty("transform", `scale(${settings.scale})`, "important");\n    image.style.setProperty("transform-origin", "center center", "important");\n    image.dataset.rafexPrintScale = String(settings.scale);',
);

// PDF hemen alınırsa devam eden perspektif render'ı yüzünden eski ölçek basılmasın.
// Önce aktif render'ın bitmesini bekle, sonra kayıtlı ayarları zorla tekrar uygula.
fallback = fallback.replace(
  '        await renderAllPerspective(saved, false);',
  '        while (renderQueued) await new Promise((resolve) => setTimeout(resolve, 25));\n        await renderAllPerspective(saved, true);',
);

fallback = fallback.replace(/<\/script/gi, "<\\/script");

if (!fallback.includes(clearModalClass) && fallback.includes("modal.className")) {
  throw new Error("Kesit Yer Belirleme modal bulanıklık sınıfı kaldırılamadı.");
}
if (!fallback.includes('if (old) return old;') || !fallback.includes('setTimeout(prepareEditor, 0);')) {
  throw new Error("Kesit Yer Belirleme açılış/hız hotfix'i uygulanamadı.");
}
if (!fallback.includes('data-rafex-print-scale') && !fallback.includes('rafexPrintScale')) {
  throw new Error("Kesit Yer Belirleme PDF ölçek hotfix'i uygulanamadı.");
}
if (!fallback.includes('while (renderQueued)') || !fallback.includes('renderAllPerspective(saved, true)')) {
  throw new Error("Kesit Yer Belirleme PDF render bekleme hotfix'i uygulanamadı.");
}

const scriptTag = `<script ${marker}>${fallback}<\/script>`;
let bodyEnd = html.lastIndexOf("</body>");
if (bodyEnd < 0) throw new Error("Portal </body> kapanışı bulunamadı.");
html = `${html.slice(0, bodyEnd)}${scriptTag}${html.slice(bodyEnd)}`;

if (!html.includes(clarityMarker)) {
  const clarityTag = `<style ${clarityMarker}>#m2SectionPlacementModal,.rafex-section-placement-modal{backdrop-filter:none!important;-webkit-backdrop-filter:none!important;filter:none!important}body:has(#m2SectionPlacementModal:not([hidden]))>*:not(#m2SectionPlacementModal){filter:none!important}</style>`;
  bodyEnd = html.lastIndexOf("</body>");
  if (bodyEnd < 0) throw new Error("Portal </body> kapanışı bulunamadı.");
  html = `${html.slice(0, bodyEnd)}${clarityTag}${html.slice(bodyEnd)}`;
}

if (!html.includes('id="m2SectionPlacementButton"')) {
  const actionsIndex = html.indexOf("m2-report-head-actions");
  let targetIndex = actionsIndex >= 0 ? html.indexOf('id="m2ReportType"', actionsIndex) : html.indexOf('id="m2ReportType"');
  if (targetIndex < 0) targetIndex = html.indexOf("ÇIKTI TİPİ");
  const labelStart = targetIndex >= 0 ? html.lastIndexOf("<label", targetIndex) : -1;
  if (labelStart >= 0) {
    html = `${html.slice(0, labelStart)}<button type="button" id="m2SectionPlacementButton" class="rafex-section-placement-button" data-rafex-section-positioner-static="v5">Kesit Yer Belirleme</button>${html.slice(labelStart)}`;
  }
}

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.slice(0, match.index) + match[1] + match[2] + encoded + match[2] + worker.slice(match.index + match[0].length);
fs.writeFileSync(workerPath, worker);

const verify = worker.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
const verifyHtml = verify ? Buffer.from(verify[2], "base64").toString("utf8") : "";
if (!verifyHtml.includes("Kesit Yer Belirleme") || !verifyHtml.includes(marker)) {
  throw new Error("Kesit Yer Belirleme v5 fallback'i build çıktısına eklenemedi.");
}
if (!verifyHtml.includes("ÖLÇÜLERİ GÖSTER") || !verifyHtml.includes("Paletleri Gizle")) {
  throw new Error("Kesit Yer Belirleme ölçü/palet kontrolleri build çıktısına eklenemedi.");
}
if (!verifyHtml.includes('if (old) return old;') || !verifyHtml.includes('setTimeout(prepareEditor, 0);')) {
  throw new Error("Kesit Yer Belirleme açılış/hız hotfix'i build çıktısına eklenemedi.");
}
if (!verifyHtml.includes('rafexPrintScale') || !verifyHtml.includes('while (renderQueued)')) {
  throw new Error("Kesit Yer Belirleme PDF ölçek hotfix'i build çıktısına eklenemedi.");
}
if (!verifyHtml.includes(clarityMarker) || !verifyHtml.includes("backdrop-filter:none!important")) {
  throw new Error("Kesit Yer Belirleme net görünüm koruması build çıktısına eklenemedi.");
}
if (verifyHtml.includes(blurredModalClass)) {
  throw new Error("Kesit Yer Belirleme modalında bulanıklık sınıfı kaldı.");
}
