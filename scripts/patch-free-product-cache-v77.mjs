import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("Free product cache v77: HTML_BASE64 bulunamadi.");

let html = Buffer.from(match[3], "base64").toString("utf8");
html = html.replace(/<script\s+data-rafex-free-product-cache="v77">[\s\S]*?<\/script>\s*/g, "");

const runtime = String.raw`<script data-rafex-free-product-cache="v77">(function(){
  if(window.__rafexFreeProductCacheV77)return;window.__rafexFreeProductCacheV77=true;
  var dirty=true,scheduled=false,rowsCache=null,revision=0,lastReason="initial";
  var originalRows=typeof window.m2LayoutProductRows==='function'?window.m2LayoutProductRows:null;
  var originalRender=typeof window.m2RenderLayoutProductList==='function'?window.m2RenderLayoutProductList:null;

  function publish(){
    window.rafexProductCountCacheV77={dirty:dirty,revision:revision,lastReason:lastReason,rows:rowsCache};
    window.rafexProductCountDirtyV77=dirty;
  }
  function freePage(){
    var page=document.getElementById('page');
    return !!(document.getElementById('m2LayoutSvg')&&(page?.dataset?.rafexFreeDrawing==='1'||document.getElementById('m2CommonDrawingWorkspace')||document.querySelector('[data-rafex-common-independent="v44"]')));
  }
  function guardedRows(){
    if(rowsCache&&!dirty)return rowsCache;
    rowsCache=originalRows?originalRows.apply(this,arguments):[];
    return rowsCache;
  }
  if(originalRows){guardedRows.__rafexProductCacheV77=true;window.m2LayoutProductRows=guardedRows;try{m2LayoutProductRows=guardedRows}catch(_){}}

  function refresh(force){
    scheduled=false;
    if(!force&&!dirty)return rowsCache;
    if(!originalRender)return null;
    var result=originalRender.apply(window,[]);
    dirty=false;revision++;publish();
    return result;
  }
  function queue(){
    if(scheduled)return;scheduled=true;
    requestAnimationFrame(function(){scheduled=false;if(freePage())refresh(false)});
  }
  function mark(reason){
    dirty=true;rowsCache=null;lastReason=reason||"data-change";window.__rafexFreeOutputDirty=true;publish();queue();
  }
  function guardedRender(){return dirty?refresh(false):rowsCache}
  if(originalRender){guardedRender.__rafexProductCacheV77=true;window.m2RenderLayoutProductList=guardedRender;try{m2RenderLayoutProductList=guardedRender}catch(_){}}

  function wrap(name,reason){
    var original=window[name];if(typeof original!=='function'||original.__rafexProductMutationV77)return;
    var wrapped=function(){
      var result=original.apply(this,arguments);
      if(result&&typeof result.then==='function')return result.finally(function(){mark(reason)});
      mark(reason);return result;
    };
    wrapped.__rafexProductMutationV77=true;wrapped.__rafexOriginal=original;window[name]=wrapped;
    try{(0,eval)(name+'=window["'+name+'"]')}catch(_){}
  }
  [
    ['m2AddRack','add'],['m2ApplyAutoFillLength','extend'],['m2ApplyRackCustomization','customize'],
    ['m2DuplicateRack','duplicate'],['m2DeleteRack','delete'],['m2ClearLayout','clear'],
    ['m2ApplyProjectRecord','project-open'],['m2UndoLastAction','undo'],
    ['rafexDuplicateSelectedBlocksV64','group-duplicate'],['rafexMrApplyDistanceV70','mr-extend']
  ].forEach(function(entry){wrap(entry[0],entry[1])});

  window.rafexMarkProductCountsDirtyV77=mark;
  window.rafexRefreshProductCountsV77=function(){return refresh(true)};
  publish();queue();
})();</script>`;

const closing = html.lastIndexOf("</body>");
if (closing < 0) throw new Error("Free product cache v77: </body> bulunamadi.");
html = html.slice(0, closing) + runtime + "\n" + html.slice(closing);

for (const required of [
  'data-rafex-free-product-cache="v77"',
  "rafexProductCountCacheV77",
  "rafexMarkProductCountsDirtyV77",
  "rafexRefreshProductCountsV77",
  "m2ApplyAutoFillLength",
  "rafexMrApplyDistanceV70"
]) if (!html.includes(required)) throw new Error("Free product cache v77 dogrulama eksigi: " + required);

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.slice(0, match.index) + match[1] + match[2] + encoded + match[2] + worker.slice(match.index + match[0].length);
fs.writeFileSync(workerPath, worker);
console.log("FINAL v77: urun adetleri olay-temelli onbellekte; tasima/secim/olcu PDF ve urun sayimini tetiklemez.");
