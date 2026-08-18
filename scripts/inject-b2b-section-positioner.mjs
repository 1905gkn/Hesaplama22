import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const workerPath = path.join(root, "dist/server/index.js");
const fallbackPath = path.join(root, "client/b2b-section-positioner-v5.js");
const marker = "data-rafex-b2b-section-positioner-fallback=\"v5\"";
const clarityMarker = "data-rafex-section-positioner-clarity=\"v1\"";
const printPlacementMarker = "data-rafex-section-positioner-print-placement=\"v2\"";
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

// Modalı her tıklamada silip yeniden oluşturma. Mevcut modalı yeniden kullan.
fallback = fallback.replace(
  'const old = document.getElementById("m2SectionPlacementModal");\n    if (old) old.remove();',
  'const old = document.getElementById("m2SectionPlacementModal");\n    if (old) return old;',
);
fallback = fallback.replace(
  `    try {\n      const render = typeof m2RenderCorporateReport === "function" ? m2RenderCorporateReport : null;\n      const result = render?.();\n      if (result && typeof result.then === "function") result.finally(() => setTimeout(prepareEditor, 0));\n      else setTimeout(prepareEditor, 70);\n    } catch { prepareEditor(); }`,
  `    setTimeout(prepareEditor, 0);`,
);

// Raf tipi bazında ölçü yazısı ölçeğini sakla.
fallback = fallback.replace(
  'const DEFAULT_VIEW = { x: 0, y: 0, scale: 1, azimuth: 41, elevation: 24, counts: [], showPallets: true, dimensions: DIMENSION_DEFAULTS };',
  'const DEFAULT_VIEW = { x: 0, y: 0, scale: 1, azimuth: 41, elevation: 24, counts: [], showPallets: true, dimensionLabelScale: 1, dimensions: DIMENSION_DEFAULTS };',
);
fallback = fallback.replace(
  '      showPallets: value.showPallets !== false,\n      dimensions: {',
  '      showPallets: value.showPallets !== false,\n      dimensionLabelScale: clamp(number(value.dimensionLabelScale, defaults.dimensionLabelScale || 1), 0.55, 1.8),\n      dimensions: {',
);
fallback = fallback.replace(
  '        showPallets: settings.showPallets,\n        dimensions: { ...settings.dimensions },',
  '        showPallets: settings.showPallets,\n        dimensionLabelScale: settings.dimensionLabelScale,\n        dimensions: { ...settings.dimensions },',
);
fallback = fallback.replace(
  '      showPallets: settings.showPallets,\n      dimensions: { ...settings.dimensions },',
  '      showPallets: settings.showPallets,\n      dimensionLabelScale: settings.dimensionLabelScale,\n      dimensions: { ...settings.dimensions },',
);

// Ölçü yazısı kontrolünü UI'ya ekle.
fallback = fallback.replace(
  '<div class="rafex-option-row rafex-dimension-options"><strong>ÖLÇÜLERİ GÖSTER</strong>',
  '<div class="rafex-option-row"><strong>ÖLÇÜ YAZISI</strong><button type="button" data-rafex-dim-text-down>−</button><strong data-rafex-dim-text-scale style="min-width:54px;text-align:center">100%</strong><button type="button" data-rafex-dim-text-up>+</button></div><div class="rafex-option-row rafex-dimension-options"><strong>ÖLÇÜLERİ GÖSTER</strong>',
);
fallback = fallback.replace(
  '    const pallet = document.querySelector("[data-rafex-pallets]");',
  '    const dimTextScale = document.querySelector("[data-rafex-dim-text-scale]");\n    if (dimTextScale) dimTextScale.textContent = `${Math.round(value.dimensionLabelScale * 100)}%`;\n    const pallet = document.querySelector("[data-rafex-pallets]");',
);
fallback = fallback.replace(
  '  function rotateView(azimuthDelta, elevationDelta = 0) {',
  '  function changeDimensionLabelScale(delta) {\n    if (!activeKey) return;\n    const value = ensureSetting(activeKey);\n    value.dimensionLabelScale = clamp(Math.round((value.dimensionLabelScale + delta) * 100) / 100, 0.55, 1.8);\n    previewCache.delete(activeKey);\n    updateArtwork();\n    schedulePreview(true, 90);\n  }\n\n  function rotateView(azimuthDelta, elevationDelta = 0) {',
);
fallback = fallback.replace(
  '    modal.querySelector("[data-rafex-pallets]")?.addEventListener("click", togglePallets);',
  '    modal.querySelector("[data-rafex-pallets]")?.addEventListener("click", togglePallets);\n    modal.querySelector("[data-rafex-dim-text-down]")?.addEventListener("click", () => changeDimensionLabelScale(-0.1));\n    modal.querySelector("[data-rafex-dim-text-up]")?.addEventListener("click", () => changeDimensionLabelScale(0.1));',
);

// PDF ve ekran aynı yerleşim matematiğini kullansın: left/top + translate + scale.
fallback = fallback.replace(
  '    image.style.objectPosition = `${50 + settings.x}% ${50 + settings.y}%`;\n    image.style.transform = `scale(${settings.scale})`;\n    image.style.transformOrigin = "center center";',
  '    image.style.setProperty("position", "absolute", "important");\n    image.style.setProperty("left", `${50 + settings.x}%`, "important");\n    image.style.setProperty("top", `${50 + settings.y}%`, "important");\n    image.style.setProperty("width", "100%", "important");\n    image.style.setProperty("height", "100%", "important");\n    image.style.setProperty("max-width", "none", "important");\n    image.style.setProperty("object-fit", "contain", "important");\n    image.style.setProperty("object-position", "center center", "important");\n    image.style.setProperty("transform", `translate(-50%,-50%) scale(${settings.scale})`, "important");\n    image.style.setProperty("transform-origin", "center center", "important");\n    image.dataset.rafexPrintScale = String(settings.scale);',
);

// PDF hemen alınırsa devam eden perspektif render'ı yüzünden eski ölçek basılmasın.
fallback = fallback.replace(
  '        await renderAllPerspective(saved, false);',
  '        while (renderQueued) await new Promise((resolve) => setTimeout(resolve, 25));\n        await renderAllPerspective(saved, true);',
);

fallback = fallback.replace(/<\/script/gi, "<\\/script");

if (!fallback.includes(clearModalClass) && fallback.includes("modal.className")) throw new Error("Kesit Yer Belirleme modal bulanıklık sınıfı kaldırılamadı.");
if (!fallback.includes('if (old) return old;') || !fallback.includes('setTimeout(prepareEditor, 0);')) throw new Error("Kesit Yer Belirleme açılış/hız hotfix'i uygulanamadı.");
if (!fallback.includes('rafexPrintScale') || !fallback.includes('translate(-50%,-50%) scale(${settings.scale})')) throw new Error("Kesit Yer Belirleme PDF yerleşim hotfix'i uygulanamadı.");
if (!fallback.includes('dimensionLabelScale: settings.dimensionLabelScale') || !fallback.includes('data-rafex-dim-text-scale')) throw new Error("Ölçü yazısı ölçek kontrolü uygulanamadı.");
if (!fallback.includes('while (renderQueued)') || !fallback.includes('renderAllPerspective(saved, true)')) throw new Error("Kesit Yer Belirleme PDF render bekleme hotfix'i uygulanamadı.");

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

if (!html.includes(printPlacementMarker)) {
  const placementStyle = `<style ${printPlacementMarker}>.rafex-perspective-output .rafex-report-3d-frame{position:relative!important;overflow:hidden!important}.rafex-perspective-output .rafex-report-3d-frame>img{display:block!important}</style>`;
  bodyEnd = html.lastIndexOf("</body>");
  if (bodyEnd < 0) throw new Error("Portal </body> kapanışı bulunamadı.");
  html = `${html.slice(0, bodyEnd)}${placementStyle}${html.slice(bodyEnd)}`;
}

if (!html.includes('id="m2SectionPlacementButton"')) {
  const actionsIndex = html.indexOf("m2-report-head-actions");
  let targetIndex = actionsIndex >= 0 ? html.indexOf('id="m2ReportType"', actionsIndex) : html.indexOf('id="m2ReportType"');
  if (targetIndex < 0) targetIndex = html.indexOf("ÇIKTI TİPİ");
  const labelStart = targetIndex >= 0 ? html.lastIndexOf("<label", targetIndex) : -1;
  if (labelStart >= 0) html = `${html.slice(0, labelStart)}<button type="button" id="m2SectionPlacementButton" class="rafex-section-placement-button" data-rafex-section-positioner-static="v5">Kesit Yer Belirleme</button>${html.slice(labelStart)}`;
}

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.slice(0, match.index) + match[1] + match[2] + encoded + match[2] + worker.slice(match.index + match[0].length);
fs.writeFileSync(workerPath, worker);

const verify = worker.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
const verifyHtml = verify ? Buffer.from(verify[2], "base64").toString("utf8") : "";
if (!verifyHtml.includes("Kesit Yer Belirleme") || !verifyHtml.includes(marker)) throw new Error("Kesit Yer Belirleme v5 fallback'i build çıktısına eklenemedi.");
if (!verifyHtml.includes("ÖLÇÜLERİ GÖSTER") || !verifyHtml.includes("Paletleri Gizle")) throw new Error("Kesit Yer Belirleme ölçü/palet kontrolleri build çıktısına eklenemedi.");
if (!verifyHtml.includes('data-rafex-dim-text-scale') || !verifyHtml.includes('dimensionLabelScale: settings.dimensionLabelScale')) throw new Error("Ölçü yazısı ölçek kontrolü build çıktısına eklenemedi.");
if (!verifyHtml.includes('rafexPrintScale') || !verifyHtml.includes('translate(-50%,-50%) scale(${settings.scale})')) throw new Error("Kesit Yer Belirleme PDF yerleşimi build çıktısına eklenemedi.");
if (!verifyHtml.includes('while (renderQueued)')) throw new Error("Kesit Yer Belirleme PDF render beklemesi build çıktısına eklenemedi.");
if (!verifyHtml.includes(clarityMarker) || !verifyHtml.includes("backdrop-filter:none!important")) throw new Error("Kesit Yer Belirleme net görünüm koruması build çıktısına eklenemedi.");
if (!verifyHtml.includes(printPlacementMarker)) throw new Error("Kesit Yer Belirleme PDF yerleşim stili build çıktısına eklenemedi.");
if (verifyHtml.includes(blurredModalClass)) throw new Error("Kesit Yer Belirleme modalında bulanıklık sınıfı kaldı.");
