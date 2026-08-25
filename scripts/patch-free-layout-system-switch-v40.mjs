import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error("Ortak Cizim sistem gecisi v40: HTML_BASE64 bulunamadi");

let html = Buffer.from(match[2], "base64").toString("utf8");
html = html.replace(/<script\s+data-rafex-free-layout-system-switch="v40">[\s\S]*?<\/script>/g, "");

const runtime = String.raw`<script data-rafex-free-layout-system-switch="v40">
(function(){
  if(window.__rafexFreeLayoutSystemSwitchV40)return;
  window.__rafexFreeLayoutSystemSwitchV40=true;

  var KEYS=['layoutState','layoutZoom','pinnedDimensions','pinnedDimensionsByRack','dimensionOffsets','dimensionFontSizes','selectedDimensionKey','userNotes','selectedNoteId','hiddenSummaryDimensions','visibleRackDimensions','showSharedFootLabels','edgeEditorVisible','freeMeasure','layoutSymbols','selectedSymbolId'];
  var switchToken=0;

  function isCommonPage(){
    var page=document.getElementById('page');
    if(page&&(page.dataset?.rafexFreeDrawing==='1'||page.classList.contains('rafex-free-drawing-page')))return true;
    if(document.querySelector('#nav button[data-page="free"].active'))return true;
    var title=(document.getElementById('pageTitle')?.textContent||'').trim();
    return title==='Serbest Çizim'||title==='Ortak Çizim';
  }

  function cloneValue(value){
    if(value==null)return value;
    try{if(typeof structuredClone==='function')return structuredClone(value);}catch{}
    try{return JSON.parse(JSON.stringify(value));}catch{return value;}
  }

  function captureCommon(){
    if(!isCommonPage()||typeof m2CaptureModuleState!=='function')return null;
    try{
      var state=m2CaptureModuleState(),snapshot={};
      KEYS.forEach(function(key){snapshot[key]=cloneValue(state[key]);});
      snapshot.__rackCount=Array.isArray(snapshot.layoutState?.racks)?snapshot.layoutState.racks.length:0;
      snapshot.__pointCount=Array.isArray(snapshot.layoutState?.points)?snapshot.layoutState.points.length:0;
      return snapshot;
    }catch(error){console.warn('Ortak Cizim sistem gecisi snapshot alinamadi',error);return null;}
  }

  function rawRestore(){
    var fn=(typeof window.m2RestoreModuleState==='function')?window.m2RestoreModuleState:(typeof m2RestoreModuleState==='function'?m2RestoreModuleState:null);
    if(!fn)return null;
    return fn.__rafexOriginalRestore||fn;
  }

  function currentRackCount(){
    try{return Array.isArray(m2LayoutState?.racks)?m2LayoutState.racks.length:0;}catch{return 0;}
  }

  function restoreCommon(snapshot,force){
    if(!snapshot||!isCommonPage()||typeof m2CaptureModuleState!=='function')return false;
    if(!force&&currentRackCount()>=snapshot.__rackCount)return false;
    try{
      var state=m2CaptureModuleState();
      KEYS.forEach(function(key){state[key]=cloneValue(snapshot[key]);});
      var restore=rawRestore();
      if(typeof restore!=='function')return false;
      restore.call(window,state);
      requestAnimationFrame(function(){
        try{if(typeof m2RenderLayout==='function')m2RenderLayout();}catch(error){console.warn('Ortak Cizim sistem gecisi yerlesim cizilemedi',error);}
      });
      return true;
    }catch(error){console.warn('Ortak Cizim sistem gecisi yerlesim geri yuklenemedi',error);return false;}
  }

  document.addEventListener('change',function(event){
    var input=event.target?.closest?.('input[name="rafexUnifiedSystem"]');
    if(!input||!isCommonPage())return;
    var snapshot=captureCommon();
    if(!snapshot)return;
    var token=++switchToken;
    setTimeout(function(){if(token===switchToken)restoreCommon(snapshot,true);},0);
    setTimeout(function(){if(token===switchToken)restoreCommon(snapshot,false);},80);
    setTimeout(function(){if(token===switchToken)restoreCommon(snapshot,false);},220);
  },true);
})();
</script>`;

const closing = html.lastIndexOf("</body>");
if (closing < 0) throw new Error("Ortak Cizim sistem gecisi v40: </body> bulunamadi");
html = html.slice(0, closing) + runtime + "\n" + html.slice(closing);

for (const required of ['data-rafex-free-layout-system-switch="v40"','__rafexFreeLayoutSystemSwitchV40','input[name="rafexUnifiedSystem"]','__rafexOriginalRestore']) {
  if (!html.includes(required)) throw new Error(`Ortak Cizim sistem gecisi v40 dogrulama hatasi: ${required}`);
}

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.slice(0, match.index) + match[0].replace(match[2], encoded) + worker.slice(match.index + match[0].length);
fs.writeFileSync(workerPath, worker);
console.log("v40: Ortak Cizimde Mekik/B2B/MR sistem gecislerinde alt yerlesim ve eklenen moduller korunuyor.");
