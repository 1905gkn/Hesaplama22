import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const portalPath = path.join(root, "portal.html");
const viewerPath = path.join(root, "client/b2b-viewer.entry.js");
const positionerPath = path.join(root, "client/b2b-section-positioner-v5.js");

let html = fs.readFileSync(portalPath, "utf8");

// Ana sayfada sol yeşil menü hiç görünmesin; diğer sayfalarda sabit/tam boy kalsın.
const showPageNeedle = '      function showPage(name) {\n        if (name === "admin" && me.role !== "super") name = "home";';
const showPageReplacement = '      function showPage(name) {\n        if (name === "admin" && me.role !== "super") name = "home";\n        document.body.classList.toggle("rafex-home-page", name === "home");';
if (!html.includes(showPageReplacement)) {
  if (!html.includes(showPageNeedle)) throw new Error("showPage ana sayfa hedefi bulunamadı.");
  html = html.replace(showPageNeedle, showPageReplacement);
}

if (!html.includes('data-rafex-home-sidebar="v1"')) {
  const style = `<style data-rafex-home-sidebar="v1">
body.rafex-home-page .side{display:none!important}
body.rafex-home-page .content{margin-left:0!important;width:100%!important}
body.rafex-home-page .shell{display:block!important}
</style>`;
  const headEnd = html.indexOf("</head>");
  if (headEnd < 0) throw new Error("Portal </head> bulunamadı.");
  html = html.slice(0, headEnd) + style + html.slice(headEnd);
}

// Özelleştir modalında ek kontrolleri inline onclick'e bağımlı bırakma ve 3D viewer'ı
// başka bir arka-plan kesit render'ı devraldıysa otomatik olarak tekrar modal canvasına bağla.
if (!html.includes('data-rafex-customize-stability="v1"')) {
  const runtime = `<script data-rafex-customize-stability="v1">
(function(){
  if(window.__rafexCustomizeStabilityV1)return;window.__rafexCustomizeStabilityV1=true;
  const previewIds=new Set(['m2CustomizePalletCount','m2CustomizeLevels','m2CustomizeManualLevels','m2CustomizePalletHeight','m2CustomizeRowType','m2CustomizeRowGap','m2CustomizeTunnel','m2CustomizeTunnelHeight']);
  const modal=()=>document.getElementById('m2CustomizeModal');
  const currentRack=()=>{try{return m2LayoutState?.racks?.find((item)=>item.id===m2CustomizeRackId)||null;}catch{return null;}};
  const palletLabel=()=>{const button=document.getElementById('m2CustomizePalletVisibilityButton');if(!button)return;const visible=button.getAttribute('aria-pressed')!=='false';button.textContent=visible?'PALETLER · GÖSTERİLİYOR':'PALETLER · GİZLİ';};
  const ensureViewer=()=>{
    const canvas=document.getElementById('m2CustomizeCanvas'),rack=currentRack(),service=window.RafexB2BViewer;
    if(!canvas||!rack||!service?.mount)return false;
    const mounted=typeof service.isMountedOn==='function'?service.isMountedOn(canvas):(typeof service.getActiveCanvas==='function'?service.getActiveCanvas()===canvas:false);
    if(mounted)return true;
    try{
      const options=typeof m2Rack3DOptions==='function'?m2Rack3DOptions(rack):null;
      if(!options)return false;
      if(typeof window.m2CollectCustomizeRackAccessories==='function')options.accessories=window.m2CollectCustomizeRackAccessories();
      if(typeof window.m2CustomizePalletsVisible==='function')options.showPallets=window.m2CustomizePalletsVisible();
      service.mount(canvas,options);return true;
    }catch(error){console.warn('Özelleştir 3D yeniden bağlanamadı',error);return false;}
  };
  const stablePreview=()=>{ensureViewer();try{if(typeof m2PreviewRackCustomization==='function')m2PreviewRackCustomization();}catch(error){console.warn('Özelleştir önizleme yenilenemedi',error);}palletLabel();};
  const refreshModal=()=>{if(modal()?.hidden!==false)return;try{window.m2RenderCustomizeRackAccessories?.();}catch{};palletLabel();requestAnimationFrame(stablePreview);};

  const originalSet=window.m2SetCustomizePalletsVisible;
  if(typeof originalSet==='function'&&!originalSet.__rafexStable){const wrapped=function(){const result=originalSet.apply(this,arguments);palletLabel();return result;};wrapped.__rafexStable=true;window.m2SetCustomizePalletsVisible=wrapped;}
  const originalToggle=window.m2ToggleCustomizePallets;
  if(typeof originalToggle==='function'&&!originalToggle.__rafexStable){const wrapped=function(){ensureViewer();const result=originalToggle.apply(this,arguments);palletLabel();requestAnimationFrame(stablePreview);return result;};wrapped.__rafexStable=true;window.m2ToggleCustomizePallets=wrapped;}

  const root=modal();
  if(root){
    new MutationObserver(()=>{if(root.hidden===false)requestAnimationFrame(refreshModal);}).observe(root,{attributes:true,attributeFilter:['hidden']});
    root.addEventListener('click',(event)=>{
      const button=event.target?.closest?.('button');if(!button||!root.contains(button))return;
      let handled=false;
      try{
        if(button.id==='m2CustomizePalletVisibilityButton'){
          handled=true;window.m2ToggleCustomizePallets?.();
        }else if(button.classList.contains('m2-customize-section-head')){
          handled=true;window.m2ToggleCustomizeAccessoriesSection?.();
        }else{
          const raw=button.getAttribute('onclick')||'';let match;
          if((match=raw.match(/m2ToggleCustomizeRackAccessoryPanel\('([^']+)'\)/))){handled=true;window.m2ToggleCustomizeRackAccessoryPanel?.(match[1]);}
          else if((match=raw.match(/m2EnableCustomizeRackAccessory\('([^']+)'\)/))){handled=true;window.m2EnableCustomizeRackAccessory?.(match[1]);}
          else if((match=raw.match(/m2RemoveCustomizeRackAccessory\('([^']+)'\)/))){handled=true;window.m2RemoveCustomizeRackAccessory?.(match[1]);}
          else if((match=raw.match(/m2ToggleCustomizeRackAccessoryLevel\('([^']+)',\s*(\d+)\)/))){handled=true;window.m2ToggleCustomizeRackAccessoryLevel?.(match[1],Number(match[2]));}
          else if((match=raw.match(/m2AllCustomizeRackAccessoryLevels\('([^']+)'\)/))){handled=true;window.m2AllCustomizeRackAccessoryLevels?.(match[1]);}
          else if((match=raw.match(/m2SetCustomizeRackTrayWidth\('([^']+)',\s*(\d+)\)/))){handled=true;window.m2SetCustomizeRackTrayWidth?.(match[1],Number(match[2]));}
        }
      }catch(error){console.warn('Özelleştir kontrolü çalıştırılamadı',error);}
      if(handled){event.preventDefault();event.stopImmediatePropagation();requestAnimationFrame(stablePreview);}
    },true);
    const onFieldChange=(event)=>{if(previewIds.has(event.target?.id))requestAnimationFrame(stablePreview);};
    root.addEventListener('input',onFieldChange);
    root.addEventListener('change',onFieldChange);
  }
  palletLabel();
})();
</script>`;
  const bodyEnd = html.lastIndexOf("</body>");
  if (bodyEnd < 0) throw new Error("Portal </body> bulunamadı.");
  html = html.slice(0, bodyEnd) + runtime + html.slice(bodyEnd);
}

fs.writeFileSync(portalPath, html);

// Viewer'a aktif 3D canvası bozmadan arka planda perspektif yakalama yeteneği ekle.
let viewer = fs.readFileSync(viewerPath, "utf8");
if (!viewer.includes("__rafexDetachedPerspectiveCaptureV1")) {
  const activeAnchor = "\nlet active = null;\n";
  if (!viewer.includes(activeAnchor)) throw new Error("B2B viewer active bağlantı noktası bulunamadı.");
  const detached = `
// __rafexDetachedPerspectiveCaptureV1
async function captureB2BPerspective(options = {}, settings = {}) {
  const width = Math.max(640, Math.round(Number(settings.width) || 1120));
  const height = Math.max(480, Math.round(Number(settings.height) || 900));
  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText = \`position:fixed;left:-100000px;top:0;width:\${width}px;height:\${height}px;overflow:hidden;pointer-events:none;background:#fff\`;
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "display:block;width:100%;height:100%";
  host.appendChild(canvas);
  document.body.appendChild(host);
  let viewer;
  try {
    const ready = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("B2B perspektif kesiti zaman aşımına uğradı.")), 20000);
      canvas.addEventListener("b2b-viewer-ready", () => { clearTimeout(timeout); resolve(); }, { once:true });
      canvas.addEventListener("b2b-viewer-error", (event) => { clearTimeout(timeout); reject(new Error(event.detail?.message || "B2B perspektif kesiti oluşturulamadı.")); }, { once:true });
    });
    viewer = new B2BViewer(canvas, options);
    await ready;
    viewer.renderer.setPixelRatio(clamp(Number(settings.pixelRatio) || 1.5, 1, 2.5));
    viewer.onResize();
    viewer.setAutoRotate(false);
    viewer.setView("perspective");
    viewer.setCameraAngles(Number(settings.azimuth) || 41, Number(settings.elevation) || 24);
    viewer.controls.update();
    viewer.renderer.render(viewer.scene, viewer.camera);
    await new Promise((resolve) => requestAnimationFrame(resolve));
    viewer.renderer.render(viewer.scene, viewer.camera);
    return canvas.toDataURL("image/webp", clamp(Number(settings.quality) || .9, .5, 1));
  } finally {
    viewer?.destroy();
    host.remove();
  }
}
`;
  viewer = viewer.replace(activeAnchor, `${detached}${activeAnchor}`);
  const serviceAnchor = `  captureViews(options, settings) {
    return captureB2BViews(options, settings);
  },`;
  if (!viewer.includes(serviceAnchor)) throw new Error("B2B viewer servis bağlantı noktası bulunamadı.");
  viewer = viewer.replace(serviceAnchor, `${serviceAnchor}
  capturePerspective(options, settings) {
    return captureB2BPerspective(options, settings);
  },
  getActiveCanvas() {
    return active?.canvas || null;
  },
  isMountedOn(canvas) {
    return Boolean(active && !active.destroyed && active.canvas === canvas);
  },`);
  fs.writeFileSync(viewerPath, viewer);
}

// Kesit Yer Belirleme arka-plan render'ı artık global viewer mount/destroy kullanmasın.
let positioner = fs.readFileSync(positionerPath, "utf8");
const capturePattern = /  async function capturePerspective\(key, source = draft, force = false\) \{[\s\S]*?\n  \}\n\n  function installStyles/;
if (!positioner.includes("__rafexDetachedSectionCaptureV1")) {
  if (!capturePattern.test(positioner)) throw new Error("Kesit perspektif yakalama fonksiyonu bulunamadı.");
  capturePattern.lastIndex = 0;
  const replacement = `  async function capturePerspective(key, source = draft, force = false) {
    // __rafexDetachedSectionCaptureV1
    const type = rackTypeCache.find((item) => item.key === safeKey(key)) || collectRackTypes().find((item) => item.key === safeKey(key));
    const settings = settingFor(key, source);
    const options = optionsForType(type, settings);
    if (!options || typeof window.RafexB2BViewer?.capturePerspective !== "function") return null;
    const signature = JSON.stringify({ key: safeKey(key), counts: settings.counts, azimuth: settings.azimuth, elevation: settings.elevation, showPallets: settings.showPallets, dimensions: settings.dimensions, options });
    if (!force && previewCache.get(key)?.signature === signature) return previewCache.get(key).src;
    if (previewPending.has(key)) return previewPending.get(key);
    const task = (async () => {
      const src = await window.RafexB2BViewer.capturePerspective(options, { width:1120, height:900, azimuth:settings.azimuth, elevation:settings.elevation, pixelRatio:1.5, quality:.9 });
      if (src) { previewCache.set(key, { signature, src }); trimPreviewCache(); }
      return src || null;
    })().catch((error) => {
      console.error("Kesit Yer Belirleme perspektif görüntüsü hazırlanamadı", error);
      return null;
    }).finally(() => previewPending.delete(key));
    previewPending.set(key, task);
    return task;
  }

  function installStyles`;
  positioner = positioner.replace(capturePattern, replacement);
}

const ensureButtonPattern = /  function ensureButton\(\) \{[\s\S]*?\n  \}\n\n  function installRenderHooks/;
if (!positioner.includes("__rafexStableSectionButtonV1")) {
  if (!ensureButtonPattern.test(positioner)) throw new Error("Kesit buton kurulum fonksiyonu bulunamadı.");
  ensureButtonPattern.lastIndex = 0;
  const replacement = `  function ensureButton() {
    // __rafexStableSectionButtonV1
    const reportTypeHost = document.getElementById("m2ReportType");
    const reportRoot = document.getElementById("m2CorporatePreview") || document.getElementById("m2CorporatePrint") || document.getElementById("m2CorporatePrintArea");
    const actions = document.querySelector(".m2-report-head-actions") || reportTypeHost?.parentElement || reportRoot?.parentElement;
    if (!actions) return false;
    let button = document.getElementById("m2SectionPlacementButton");
    if (button && !actions.contains(button)) { button.remove(); button = null; }
    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.id = "m2SectionPlacementButton";
      button.className = "rafex-section-placement-button";
      button.textContent = "Kesit Yer Belirleme";
      actions.insertBefore(button, reportTypeHost?.closest("label") || actions.firstChild);
    }
    if (button.dataset.rafexPerSectionPlacement !== "v5") {
      button.addEventListener("click", openEditor);
      button.dataset.rafexPerSectionPlacement = "v5";
    }
    return true;
  }

  function installRenderHooks`;
  positioner = positioner.replace(ensureButtonPattern, replacement);
}

const bootTail = '  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => boot());\n  else boot();';
if (!positioner.includes("__rafexSectionButtonObserverV1")) {
  if (!positioner.includes(bootTail)) throw new Error("Kesit boot sonu bulunamadı.");
  positioner = positioner.replace(bootTail, `  // __rafexSectionButtonObserverV1
  let ensureButtonTimer = 0;
  const keepSectionButtonAlive = () => {
    clearTimeout(ensureButtonTimer);
    ensureButtonTimer = setTimeout(() => {
      const host = document.querySelector(".m2-report-head-actions") || document.getElementById("m2ReportType")?.parentElement;
      if (host && !document.getElementById("m2SectionPlacementButton")) ensureButton();
    }, 40);
  };
  const start = () => {
    boot();
    if (document.body) new MutationObserver(keepSectionButtonAlive).observe(document.body, { childList:true, subtree:true });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once:true });
  else start();`);
}

fs.writeFileSync(positionerPath, positioner);

if (!html.includes('rafex-home-page') || !html.includes('data-rafex-customize-stability="v1"')) throw new Error("Ana sayfa / Özelleştir stabilite yamaları eklenemedi.");
if (!viewer.includes("captureB2BPerspective") || !viewer.includes("isMountedOn(canvas)")) throw new Error("Detached viewer yakalama servisi eklenemedi.");
if (!positioner.includes("__rafexDetachedSectionCaptureV1") || !positioner.includes("__rafexStableSectionButtonV1") || !positioner.includes("__rafexSectionButtonObserverV1")) throw new Error("Kesit stabilite yamaları eklenemedi.");

console.log("Ana sayfa menüsü, Özelleştir kontrolleri ve Kesit Yer Belirleme stabilite yamaları uygulandı.");
