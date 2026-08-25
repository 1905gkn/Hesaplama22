import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const workerPath = path.join(root, "dist/server/index.js");
const marker = 'data-rafex-free-layout-persistence="v37"';

let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("Free layout persistence v37: HTML_BASE64 bulunamadi.");

let html = Buffer.from(match[3], "base64").toString("utf8");
html = html.replace(/<script\s+data-rafex-free-layout-persistence="v37">[\s\S]*?<\/script>/g, "");

const runtime = String.raw`<script ${marker}>(function(){
  if(window.__rafexFreeLayoutPersistenceV37)return;
  window.__rafexFreeLayoutPersistenceV37=true;

  var COMMON_KEYS=['layoutState','layoutZoom','pinnedDimensions','pinnedDimensionsByRack','dimensionOffsets','dimensionFontSizes','selectedDimensionKey','userNotes','selectedNoteId','hiddenSummaryDimensions','visibleRackDimensions','showSharedFootLabels','edgeEditorVisible','freeMeasure','layoutSymbols','selectedSymbolId'];
  var redrawFrame=0;

  function isFreePage(){
    var page=document.getElementById('page');
    if(!page)return false;
    if(page.dataset?.rafexFreeDrawing==='1'||page.classList.contains('rafex-free-drawing-page'))return true;
    if(document.querySelector('#nav button[data-page="free"].active'))return true;
    return (document.getElementById('pageTitle')?.textContent||'').trim()==='Serbest Çizim';
  }

  function captureCommon(){
    if(!isFreePage()||typeof m2CaptureModuleState!=='function')return null;
    try{
      var state=m2CaptureModuleState();
      var common={};
      COMMON_KEYS.forEach(function(key){common[key]=state[key];});
      return common;
    }catch(error){console.warn('Serbest Cizim ortak alan snapshot alinamadi',error);return null;}
  }

  function mergeCommon(state,common){
    if(!state||typeof state!=='object'||!common)return state;
    COMMON_KEYS.forEach(function(key){state[key]=common[key];});
    return state;
  }

  function scheduleRedraw(){
    if(redrawFrame)return;
    redrawFrame=requestAnimationFrame(function(){
      redrawFrame=0;
      if(!isFreePage())return;
      try{if(typeof m2RenderLayout==='function')m2RenderLayout();}catch(error){console.warn('Serbest Cizim yerlesim yeniden cizilemedi',error);}
    });
  }

  var originalRestore=(typeof window.m2RestoreModuleState==='function')?window.m2RestoreModuleState:(typeof m2RestoreModuleState==='function'?m2RestoreModuleState:null);
  if(typeof originalRestore==='function'&&!originalRestore.__rafexFreeLayoutPersistenceV37){
    var preservedRestore=function(state){
      var common=captureCommon();
      if(common)mergeCommon(state,common);
      var result=originalRestore.call(this,state);
      if(common)scheduleRedraw();
      return result;
    };
    preservedRestore.__rafexFreeLayoutPersistenceV37=true;
    preservedRestore.__rafexOriginalRestore=originalRestore;
    try{m2RestoreModuleState=preservedRestore;}catch{}
    window.m2RestoreModuleState=preservedRestore;
  }

  // Ustteki hesap/3D tipi sadece yeni blok taslagini degistirir. Serbest alandaki
  // mevcut duvarlar, raflar, olculer, notlar ve semboller sistem/tip degisiminde korunur.
  window.rafexPreserveFreeLayoutState=function(){
    var common=captureCommon();
    if(!common)return false;
    try{
      var current=m2CaptureModuleState();
      mergeCommon(current,common);
      if(typeof originalRestore==='function')originalRestore.call(window,current);
      scheduleRedraw();
      return true;
    }catch{return false;}
  };
})();</script>`;

const bodyEnd = html.lastIndexOf("</body>");
if (bodyEnd < 0) throw new Error("Free layout persistence v37: </body> bulunamadi.");
html = html.slice(0, bodyEnd) + runtime + "\n" + html.slice(bodyEnd);

for (const required of [marker, '__rafexFreeLayoutPersistenceV37', 'm2RestoreModuleState=preservedRestore', 'Ustteki hesap/3D tipi sadece yeni blok taslagini degistirir']) {
  if (!html.includes(required)) throw new Error(`Free layout persistence v37 dogrulama hatasi: ${required}`);
}

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.replace(match[0], `${match[1]}${match[2]}${encoded}${match[2]}`);
fs.writeFileSync(workerPath, worker, "utf8");
console.log("FINAL v37: Serbest Cizim yerlesimi ust sistem/tip/3D degisimlerinden ayrildi; mevcut bloklar korunur.");
