import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const workerPath = path.join(root, "dist/server/index.js");
const fallbackPath = path.join(root, "client/b2b-section-positioner-v5.js");
const marker = "data-rafex-b2b-section-positioner-fallback=\"v5\"";
const clarityMarker = "data-rafex-section-positioner-clarity=\"v1\"";
const printPlacementMarker = "data-rafex-section-positioner-print-placement=\"v2\"";
const freeLayoutMarker = "data-rafex-free-layout-hotfix=\"v1\"";
const oldActionsLookup = 'const actions = document.querySelector(".m2-report-head-actions");\n    if (!actions) return false;';
const robustActionsLookup = 'const reportTypeHost = document.getElementById("m2ReportType");\n    const reportRoot = document.getElementById("m2CorporatePreview") || document.getElementById("m2CorporatePrint") || document.getElementById("m2CorporatePrintArea");\n    const actions = document.querySelector(".m2-report-head-actions") || reportTypeHost?.parentElement || reportRoot?.parentElement;\n    if (!actions) return false;';
const blurredModalClass = 'modal.className = "m2-layout-modal rafex-section-placement-modal";';
const clearModalClass = 'modal.className = "rafex-section-placement-modal";';
const fallbackScriptPattern = /<script\s+data-rafex-b2b-section-positioner-fallback=(?:\\["']|["'])v\d+(?:\\["']|["'])[^>]*>[\s\S]*?<\/script>/gi;
const freeLayoutScriptPattern = /<script\s+data-rafex-free-layout-hotfix=(?:\\["']|["'])v\d+(?:\\["']|["'])[^>]*>[\s\S]*?<\/script>/gi;
const freeLayoutStylePattern = /<style\s+data-rafex-free-layout-hotfix-style=(?:\\["']|["'])v\d+(?:\\["']|["'])[^>]*>[\s\S]*?<\/style>/gi;

let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("HTML_BASE64 build çıktısında bulunamadı.");

let html = Buffer.from(match[3], "base64").toString("utf8");

html = html.replace(fallbackScriptPattern, "");
html = html.replace(freeLayoutScriptPattern, "");
html = html.replace(freeLayoutStylePattern, "");
html = html.replaceAll(oldActionsLookup, robustActionsLookup);
html = html.replaceAll(blurredModalClass, clearModalClass);

// Serbest yerleşim uzatma hesabı: mevcut sınır ayağı zaten var.
// Her yeni modül yalnızca kendi bölüm/travers genişliği + 1 yeni ayak tüketir.
html = html.replaceAll(
  'const incrementalWidth=(count)=>m2B2BSectionWidth(source.b2bLayout,count)+(planned.length?footMm:2*footMm);',
  'const incrementalWidth=(count)=>m2B2BSectionWidth(source.b2bLayout,count)+footMm;',
);

// Geçişte eski/yarım ön görünüş görünmesin; bunun yerine Rafex yükleme katmanı kullan.
html = html.replaceAll('B2B GLB DOSYALARI AÇILIYOR…', '3D MODÜL HAZIRLANIYOR…');
html = html.replaceAll(
  'onclick="m2ApplyRackCustomization()">Kaydet ve Listeye Ekle</button>',
  'onclick="m2ApplyRackCustomization()">Değişiklikleri Kaydet</button>',
);
html = html.replaceAll(
  'Blok adı projeye özel kalır; teknik değişiklikler yeni raf tipi olarak kaydedilir.',
  'Tünel proje detayıdır ve mevcut raf tipine eklenir; diğer teknik değişiklikler yeni raf tipi olarak kaydedilir.',
);

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

const freeLayoutHotfix = String.raw`<script ${freeLayoutMarker}>(function(){
  if(window.__rafexFreeLayoutHotfixV1)return;window.__rafexFreeLayoutHotfixV1=true;
  const allEdgesOn=()=>{try{if(!m2LayoutState?.closed)return;const count=m2LayoutState.points?.length||0;m2LayoutState.showAreaDimensions=count>0;m2LayoutState.edgeDimensions=Array(count).fill(true);m2RenderLayout?.();}catch(error){console.warn("Kenar ölçüleri açılamadı",error);}};
  const wrapEdges=(name)=>{try{const original=window[name];if(typeof original!=="function")return;window[name]=function(){const result=original.apply(this,arguments);setTimeout(allEdgesOn,0);return result;};}catch{}};
  wrapEdges("m2CreateRectangle");wrapEdges("m2FinishFreeArea");wrapEdges("m2EndFreeAreaOpen");

  function pausedOverlay(){return document.getElementById("rafexB2BPausedOverlay");}
  function mainCanvas(){return document.getElementById("b2bMain3DCanvas");}
  function mainHost(){const canvas=mainCanvas();return canvas?.closest?.(".b2b-main-3d-canvas")||canvas?.parentElement||null;}
  window.rafexPauseB2B3D=function(){
    const host=mainHost();if(!host||pausedOverlay())return;
    try{window.RafexB2BViewer?.destroy?.();}catch{}
    host.style.position="relative";
    const overlay=document.createElement("div");overlay.id="rafexB2BPausedOverlay";overlay.className="rafex-b2b-paused-overlay";
    overlay.innerHTML='<img src="/rafex-logo.png" alt="Rafex"><b>3D MODÜL DURDURULDU</b><small>Serbest çizim sırasında sayfayı hızlandırmak için 3D görünüm geçici olarak kapatıldı.</small><button type="button" id="rafexResumeB2B3D">Modülü Yenile</button>';
    host.appendChild(overlay);document.getElementById("rafexResumeB2B3D")?.addEventListener("click",window.rafexResumeB2B3D);
  };
  window.rafexResumeB2B3D=function(){
    const canvas=mainCanvas(),overlay=pausedOverlay();if(!canvas){overlay?.remove();return;}
    const loading=document.getElementById("b2b3DLoading");if(loading)loading.hidden=false;
    try{
      const ready=()=>{if(loading)loading.hidden=true;overlay?.remove();};
      canvas.addEventListener("b2b-viewer-ready",ready,{once:true});
      window.RafexB2BViewer?.mount?.(canvas,b2b3DOptions());
      if(typeof b2bUpdateMain3D==="function")b2bUpdateMain3D();
      if(typeof b2bSetCameraAngles==="function")b2bSetCameraAngles();
      if(typeof b2bApplyAutoRotate==="function")b2bApplyAutoRotate();
      setTimeout(()=>{if(loading)loading.hidden=true;overlay?.remove();},2500);
    }catch(error){if(loading)loading.hidden=true;const small=overlay?.querySelector("small");if(small)small.textContent="3D modül yenilenemedi. Tekrar deneyin.";console.error("3D modül yenileme hatası",error);}
  };
  const pauseOn=(name)=>{try{const original=window[name];if(typeof original!=="function")return;window[name]=function(){window.rafexPauseB2B3D();return original.apply(this,arguments);};}catch{}};
  pauseOn("m2StartFreeArea");pauseOn("m2EnableAreaEdit");
  try{const originalRemount=window.m2RemountMain3D;if(typeof originalRemount==="function")window.m2RemountMain3D=function(){if(pausedOverlay())return;return originalRemount.apply(this,arguments);};}catch{}

  try{
    const originalApply=window.m2ApplyRackCustomization;
    if(typeof originalApply==="function")window.m2ApplyRackCustomization=function(){
      const rack=m2LayoutState?.racks?.find((item)=>item.id===m2CustomizeRackId);if(!rack?.b2bLayout)return originalApply.apply(this,arguments);
      const customName=String(document.getElementById("m2CustomizeName")?.value||"").trim()||String(rack.typeName||"Özel Raf");
      const blockName=String(document.getElementById("m2CustomizeBlockName")?.value||"").trim();
      const count=Math.max(1,Math.min(4,Math.round(Number(document.getElementById("m2CustomizePalletCount")?.value)||1)));
      const levels=Math.max(1,Math.min(15,Math.round(Number(document.getElementById("m2CustomizeLevels")?.value)||1)));
      const palletHeight=Math.max(300,Number(document.getElementById("m2CustomizePalletHeight")?.value)||1200);
      const rowCount=document.getElementById("m2CustomizeRowType")?.value==="double"?2:1;
      const rowGap=Math.max(0,Number(document.getElementById("m2CustomizeRowGap")?.value)||0);
      const custom=document.getElementById("m2CustomizeManualLevels")?.checked?m2CustomizeLevelData():[];
      const oldCustom=Array.isArray(rack.b2b?.customLevels)?rack.b2b.customLevels:[];
      const sameCustom=JSON.stringify(custom)===JSON.stringify(oldCustom);
      const sameStructure=count===Number(rack.b2bLayout.palletCount||rack.bays||1)&&levels===Number(rack.levels||1)&&palletHeight===Number(rack.palletHeight||1200)&&rowCount===Number(rack.b2bLayout.rowCount||1)&&rowGap===Number(rack.b2bLayout.rowGap||0)&&sameCustom;
      const sameName=customName.toLocaleLowerCase("tr-TR")===String(rack.typeName||"").trim().toLocaleLowerCase("tr-TR");
      if(!sameStructure||!sameName)return originalApply.apply(this,arguments);
      m2PushUndo?.("Tünel bilgisi güncelleme");
      const tunnel=document.getElementById("m2CustomizeTunnel")?.checked?Math.max(500,Number(document.getElementById("m2CustomizeTunnelHeight")?.value)||3600):0;
      rack.blockName=blockName;rack.b2b={...(rack.b2b||{}),tunnelHeight:tunnel};
      const modal=document.getElementById("m2CustomizeModal");if(modal)modal.hidden=true;m2CustomizeRackId=null;
      m2RenderLayout?.();m2RenderSavedRackTypes?.();m2RenderSelectedRackInfo?.();
      const status=document.getElementById("m2FloorStatus");if(status)status.textContent=tunnel?"Tünel bilgisi mevcut raf tipine proje detayı olarak eklendi; yeni raf tipi oluşturulmadı.":"Tünel bilgisi mevcut raf tipinden kaldırıldı; yeni raf tipi oluşturulmadı.";
      if(!pausedOverlay())m2RemountMain3D?.();
    };
  }catch(error){console.warn("Tünel raf tipi kuralı kurulamadı",error);}

  try{
    const originalInfo=window.m2RenderSelectedRackInfo;
    if(typeof originalInfo==="function")window.m2RenderSelectedRackInfo=function(){const result=originalInfo.apply(this,arguments);const box=document.getElementById("m2SelectedRackInfo");box?.querySelector?.(".rafex-tunnel-detail")?.remove?.();const rack=typeof m2SelectedRack==="function"?m2SelectedRack():null,tunnel=Math.max(0,Number(rack?.b2b?.tunnelHeight)||0);if(box&&tunnel){const note=document.createElement("div");note.className="rafex-tunnel-detail";note.textContent="TÜNEL · "+Math.round(tunnel).toLocaleString("tr-TR")+" mm · Mevcut raf tipine bağlı proje detayı";box.appendChild(note);}return result;};
  }catch{}
})();</script>`;
const freeLayoutStyle = String.raw`<style data-rafex-free-layout-hotfix-style="v1">
.rafex-b2b-paused-overlay{position:absolute!important;inset:0!important;z-index:120!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:12px!important;background:#fff!important;color:#173c2d!important;text-align:center!important;padding:28px!important}.rafex-b2b-paused-overlay img{width:min(260px,46%)!important;height:auto!important}.rafex-b2b-paused-overlay b{font-size:16px!important;letter-spacing:.04em!important}.rafex-b2b-paused-overlay small{max-width:440px!important;color:#68736c!important;line-height:1.5!important}.rafex-b2b-paused-overlay button{background:#173c2d!important;color:#fff!important;padding:11px 22px!important;border-radius:9px!important}.b2b-main-3d-canvas{position:relative!important}.b2b-main-3d-canvas #b2b3DLoading{position:absolute!important;inset:0!important;z-index:115!important;display:flex!important;align-items:center!important;justify-content:center!important;padding-top:170px!important;background:#fff url('/rafex-logo.png') center calc(50% - 45px)/220px auto no-repeat!important;color:#173c2d!important;font-weight:900!important;letter-spacing:.04em!important}.b2b-main-3d-canvas #b2b3DLoading[hidden]{display:none!important}.rafex-tunnel-detail{margin-top:8px;padding:8px 10px;border-left:3px solid #f2c500;background:#fff8d5;color:#4f4700;font-size:11px;font-weight:800}
</style>`;
bodyEnd = html.lastIndexOf("</body>");
if (bodyEnd < 0) throw new Error("Portal </body> kapanışı bulunamadı.");
html = `${html.slice(0, bodyEnd)}${freeLayoutHotfix}${freeLayoutStyle}${html.slice(bodyEnd)}`;

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
if (!verifyHtml.includes(freeLayoutMarker) || !verifyHtml.includes('m2B2BSectionWidth(source.b2bLayout,count)+footMm')) throw new Error("Serbest yerleşim hotfix'i build çıktısına eklenemedi.");
if (!verifyHtml.includes("Modülü Yenile") || !verifyHtml.includes("Tünel bilgisi mevcut raf tipine")) throw new Error("3D durdurma veya tünel proje detayı hotfix'i eksik.");
if (verifyHtml.includes(blurredModalClass)) throw new Error("Kesit Yer Belirleme modalında bulanıklık sınıfı kaldı.");
