import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const workerPath = path.join(root, "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("HTML_BASE64 build ciktisinda bulunamadi.");

let html = Buffer.from(match[3], "base64").toString("utf8");

// Remove an older copy of this final patch if a prebuilt artifact already contains it.
html = html.replace(/<script\s+data-rafex-current-ux-20260819=["']v\d+["'][^>]*>[\s\S]*?<\/script>/gi, "");
html = html.replace(/<style\s+data-rafex-current-ux-20260819-style=["']v\d+["'][^>]*>[\s\S]*?<\/style>/gi, "");

// Kesit Yer Belirleme: requested base camera is 50 degrees horizontal / 10 degrees vertical.
html = html.replaceAll(
  "const DEFAULT_VIEW = { x: 0, y: 0, scale: 1, azimuth: 41, elevation: 24, counts: [], showPallets: true, dimensionLabelScale: 1, dimensions: DIMENSION_DEFAULTS };",
  "const DEFAULT_VIEW = { x: 0, y: 0, scale: 1, azimuth: 50, elevation: 10, counts: [], showPallets: true, dimensionLabelScale: 1, dimensions: DIMENSION_DEFAULTS };",
);
html = html.replaceAll(
  "const DEFAULT_VIEW = { x: 0, y: 0, scale: 1, azimuth: 41, elevation: 24, counts: [], showPallets: true, dimensions: DIMENSION_DEFAULTS };",
  "const DEFAULT_VIEW = { x: 0, y: 0, scale: 1, azimuth: 50, elevation: 10, counts: [], showPallets: true, dimensions: DIMENSION_DEFAULTS };",
);
html = html.replaceAll('data-azimuth="41" data-elevation="24"', 'data-azimuth="50" data-elevation="10"');
html = html.replaceAll('Yatay açı: 41° · Yukarı/Aşağı: +24°', 'Yatay açı: 50° · Yukarı/Aşağı: +10°');
html = html.replaceAll('>41° / 24°</small>', '>50° / 10°</small>');

// Ensure the actual FRONT button exists next to Fit. This is deliberately done after every other injector.
const toolbarFrontPattern = /(<button type="button" data-rafex-fit>Sığdır<\/button>)(?:<button type="button" data-rafex-front>[^<]*<\/button>)?<span><\/span><button type="button" data-rafex-rotate-left/;
if (toolbarFrontPattern.test(html)) {
  html = html.replace(toolbarFrontPattern, '$1<button type="button" data-rafex-front>Önden</button><span></span><button type="button" data-rafex-rotate-left');
} else if (!html.includes('<button type="button" data-rafex-front>Önden</button>')) {
  throw new Error("Kesit toolbar icinde Sigdir/Donus noktasi bulunamadi.");
}

// Ensure frontCurrent exists and is connected to the button.
if (!html.includes("function frontCurrent()")) {
  const fitNeedle = "  function fitCurrent() {";
  if (!html.includes(fitNeedle)) throw new Error("Kesit fitCurrent bulunamadi.");
  html = html.replace(fitNeedle, `  function frontCurrent() {\n    if (!activeKey) return;\n    const value = ensureSetting(activeKey);\n    value.azimuth = 0; value.elevation = 0;\n    previewCache.delete(activeKey);\n    updateArtwork();\n    schedulePreview(true, 80);\n  }\n\n${fitNeedle}`);
}
if (!html.includes('modal.querySelector("[data-rafex-front]")?.addEventListener("click", frontCurrent);')) {
  const fitListener = '    modal.querySelector("[data-rafex-fit]")?.addEventListener("click", fitCurrent);';
  if (!html.includes(fitListener)) throw new Error("Kesit Sigdir listener bulunamadi.");
  html = html.replace(fitListener, fitListener + '\n    modal.querySelector("[data-rafex-front]")?.addEventListener("click", frontCurrent);');
}

// Native Customize preview must always receive the current accessories and pallet visibility.
const previewNeedle = 'options.straightTiePositions=options.rowType==="double"?b2bStraightTiePositions(footHeight):[];window.RafexB2BViewer?.update(options);';
const previewPatched = 'options.straightTiePositions=options.rowType==="double"?b2bStraightTiePositions(footHeight):[];if(typeof m2CollectCustomizeRackAccessories==="function")options.accessories=m2CollectCustomizeRackAccessories();if(typeof m2CustomizePalletsVisible==="function")options.showPallets=m2CustomizePalletsVisible();window.RafexB2BViewer?.update(options);';
if (!html.includes(previewPatched)) {
  if (!html.includes(previewNeedle)) throw new Error("Ozellestir native preview update noktasi bulunamadi.");
  html = html.replace(previewNeedle, previewPatched);
}

const runtime = `<script data-rafex-current-ux-20260819="v1">(function(){
  if(window.__rafexCurrentUx20260819V1)return;
  window.__rafexCurrentUx20260819V1=true;

  // One-time migration so existing browser data also starts at the newly requested base values.
  try{
    var migrationKey="rafex_section_defaults_20260819_50_10_100_v1";
    if(localStorage.getItem(migrationKey)!=="1"){
      var storageKey="rafex_b2b_perspective_by_type_v4";
      var saved=JSON.parse(localStorage.getItem(storageKey)||"{}");
      if(saved&&saved.sections&&typeof saved.sections==="object"){
        Object.keys(saved.sections).forEach(function(key){
          if(!saved.sections[key]||typeof saved.sections[key]!=="object")saved.sections[key]={};
          saved.sections[key].azimuth=50;
          saved.sections[key].elevation=10;
          saved.sections[key].dimensionLabelScale=1;
        });
        localStorage.setItem(storageKey,JSON.stringify(saved));
      }
      localStorage.setItem(migrationKey,"1");
    }
  }catch(error){console.warn("Kesit varsayilan deger migrasyonu uygulanamadi",error);}

  var raf=function(cb){requestAnimationFrame(function(){requestAnimationFrame(cb);});};
  var customizeModal=function(){return document.getElementById("m2CustomizeModal");};
  var currentRack=function(){try{return m2LayoutState&&m2LayoutState.racks&&m2LayoutState.racks.find(function(item){return item.id===m2CustomizeRackId;})||null;}catch(error){return null;}};
  var ensureCustomizeViewer=function(){
    var modal=customizeModal(),canvas=document.getElementById("m2CustomizeCanvas"),rack=currentRack(),service=window.RafexB2BViewer;
    if(!modal||modal.hidden!==false||!canvas||!rack||!service)return false;
    try{
      var mounted=typeof service.isMountedOn==="function"?service.isMountedOn(canvas):(typeof service.getActiveCanvas==="function"?service.getActiveCanvas()===canvas:false);
      if(!mounted&&typeof service.mount==="function"){
        var options=typeof m2Rack3DOptions==="function"?m2Rack3DOptions(rack):null;
        if(options){
          if(typeof m2CollectCustomizeRackAccessories==="function")options.accessories=m2CollectCustomizeRackAccessories();
          if(typeof m2CustomizePalletsVisible==="function")options.showPallets=m2CustomizePalletsVisible();
          service.mount(canvas,options);
        }
      }
      return true;
    }catch(error){console.warn("Ozellestir viewer modal canvasina baglanamadi",error);return false;}
  };
  var hardPreview=function(){
    ensureCustomizeViewer();
    try{if(typeof m2PreviewRackCustomization==="function")m2PreviewRackCustomization();}catch(error){console.warn("Ozellestir preview yenilenemedi",error);}
    raf(function(){
      ensureCustomizeViewer();
      try{if(typeof m2PreviewRackCustomization==="function")m2PreviewRackCustomization();}catch(error){}
    });
  };
  window.__rafexHardCustomizePreviewV1=hardPreview;

  var wrap=function(name){
    try{
      var original=window[name];
      if(typeof original!=="function"||original.__rafexHardPreviewV1)return;
      var wrapped=function(){var result=original.apply(this,arguments);hardPreview();return result;};
      wrapped.__rafexHardPreviewV1=true;
      window[name]=wrapped;
    }catch(error){console.warn(name+" hard preview wrapper kurulamadı",error);}
  };
  ["m2ToggleCustomizePallets","m2SetCustomizePalletsVisible","m2EnableCustomizeRackAccessory","m2RemoveCustomizeRackAccessory","m2ToggleCustomizeRackAccessoryLevel","m2AllCustomizeRackAccessoryLevels","m2SetCustomizeRackTrayWidth"].forEach(wrap);

  // Keep the visual button state synchronized even if another legacy handler rewrites it.
  var syncPalletButton=function(){
    var button=document.getElementById("m2CustomizePalletVisibilityButton");if(!button)return;
    var visible=true;try{visible=typeof m2CustomizePalletsVisible==="function"?m2CustomizePalletsVisible()!==false:button.getAttribute("aria-pressed")!=="false";}catch(error){}
    button.setAttribute("aria-pressed",String(visible));
    button.textContent=visible?"PALETLERİ GİZLE":"PALETLERİ GÖSTER";
  };
  var modal=customizeModal();
  if(modal){
    modal.addEventListener("click",function(){setTimeout(syncPalletButton,0);},false);
    new MutationObserver(function(){if(modal.hidden===false){setTimeout(function(){syncPalletButton();hardPreview();},0);}}).observe(modal,{attributes:true,attributeFilter:["hidden"]});
  }
  syncPalletButton();
})();</script>`;

const style = `<style data-rafex-current-ux-20260819-style="v1">
/* Kesit toolbar: flex prevents any rotation button from stretching into the large meaningless block. */
.rafex-placement-controls{display:flex!important;grid-template-columns:none!important;align-items:center!important;gap:6px!important}
.rafex-placement-controls>span:first-child{flex:0 0 auto!important}
.rafex-placement-controls>span:nth-of-type(2){flex:1 1 auto!important;min-width:8px!important}
.rafex-placement-controls button{flex:0 0 auto!important;width:auto!important;min-width:36px!important;max-width:none!important}
.rafex-placement-controls [data-rafex-front]{min-width:62px!important;background:#173c2d!important;color:#fff!important}
.rafex-placement-controls [data-rafex-rotate-left],.rafex-placement-controls [data-rafex-rotate-right],.rafex-placement-controls [data-rafex-rotate-up],.rafex-placement-controls [data-rafex-rotate-down]{width:36px!important;min-width:36px!important;padding-left:0!important;padding-right:0!important;text-align:center!important}
@media(max-width:820px){.rafex-placement-controls{display:flex!important;flex-wrap:wrap!important}.rafex-placement-controls>span:nth-of-type(2){display:none!important}}
</style>`;

const bodyEnd = html.lastIndexOf("</body>");
if (bodyEnd < 0) throw new Error("Portal </body> bulunamadi.");
html = html.slice(0, bodyEnd) + runtime + style + html.slice(bodyEnd);

if (!html.includes('data-rafex-current-ux-20260819="v1"')) throw new Error("Current UX runtime eklenemedi.");
if (!html.includes('<button type="button" data-rafex-front>Önden</button>')) throw new Error("Kesit Onden butonu final HTML icinde yok.");
if (!html.includes(previewPatched)) throw new Error("Ozellestir aksesuar/palet preview final baglantisi yok.");

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.replace(match[0], `${match[1]}${match[2]}${encoded}${match[2]}`);
fs.writeFileSync(workerPath, worker);
console.log("Rafex current UX v1: section 50/10/100 + front control + hard Customize accessory/pallet preview applied.");
