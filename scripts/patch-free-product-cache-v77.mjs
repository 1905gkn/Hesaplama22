import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("Free product cache v79: HTML_BASE64 bulunamadi.");

let html = Buffer.from(match[3], "base64").toString("utf8");
html = html.replace(/<script\s+data-rafex-free-product-cache="v(?:77|79)">[\s\S]*?<\/script>\s*/g, "");

const runtime = String.raw`<script data-rafex-free-product-cache="v79">(function(){
  if(window.__rafexFreeProductCacheV79)return;window.__rafexFreeProductCacheV79=true;
  var dirty=true,scheduled=false,rowsCache=null,revision=0,lastReason="initial";
  var originalRows=typeof window.m2LayoutProductRows==='function'?window.m2LayoutProductRows:(typeof m2LayoutProductRows==='function'?m2LayoutProductRows:null);
  var originalRender=typeof window.m2RenderLayoutProductList==='function'?window.m2RenderLayoutProductList:(typeof m2RenderLayoutProductList==='function'?m2RenderLayoutProductList:null);

  function racks(){try{return typeof m2LayoutState!=='undefined'&&Array.isArray(m2LayoutState.racks)?m2LayoutState.racks:[]}catch(_){return []}}
  function recomputeSummary(){
    var list=racks(),totalPallets=0,footTeams=0;
    for(var i=0;i<list.length;i++){
      var item=list[i]||{};
      if(item.b2bLayout){
        var rowCount=Math.max(1,Number(item.b2bLayout.rowCount)||1);
        totalPallets+=(Number(item.b2bLayout.palletCount)||0)*(Number(item.levels)||0)*rowCount;
        footTeams+=2*rowCount-(item.sharedFootWith?rowCount:0);
      }else{
        totalPallets+=(Number(item.bays)||0)*(Number(item.levels)||0)*(Number(item.depth)||0);
      }
    }
    window.rafexLayoutSummaryV79={totalPallets:totalPallets,footTeams:footTeams,rackCount:list.length,revision:revision,lastReason:lastReason};
    return window.rafexLayoutSummaryV79;
  }
  function publish(){
    window.rafexProductCountCacheV79={dirty:dirty,revision:revision,lastReason:lastReason,rows:rowsCache};
    window.rafexProductCountDirtyV79=dirty;
    window.rafexProductCountCacheV77=window.rafexProductCountCacheV79;
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
  if(originalRows){guardedRows.__rafexProductCacheV79=true;window.m2LayoutProductRows=guardedRows;try{m2LayoutProductRows=guardedRows}catch(_){}}

  function refresh(force){
    scheduled=false;
    if(!force&&!dirty)return rowsCache;
    recomputeSummary();
    if(!originalRender){dirty=false;revision++;publish();return rowsCache}
    var result=originalRender.apply(window,[]);
    dirty=false;revision++;recomputeSummary();publish();
    return result;
  }
  function queue(){
    if(scheduled)return;scheduled=true;
    requestAnimationFrame(function(){scheduled=false;if(freePage())refresh(false)});
  }
  function refreshSelectedInfo(){
    requestAnimationFrame(function(){try{if(typeof m2RenderSelectedRackInfo==='function')m2RenderSelectedRackInfo()}catch(_){}});
  }
  function mark(reason){
    dirty=true;rowsCache=null;lastReason=reason||"data-change";window.__rafexFreeOutputDirty=true;
    recomputeSummary();publish();queue();refreshSelectedInfo();
  }
  function guardedRender(){return dirty?refresh(false):rowsCache}
  if(originalRender){guardedRender.__rafexProductCacheV79=true;window.m2RenderLayoutProductList=guardedRender;try{m2RenderLayoutProductList=guardedRender}catch(_){}}

  function wrap(name,reason){
    var original=window[name];if(typeof original!=='function'||original.__rafexProductMutationV79)return;
    var wrapped=function(){
      var result=original.apply(this,arguments);
      if(result&&typeof result.then==='function')return result.finally(function(){mark(reason)});
      mark(reason);return result;
    };
    wrapped.__rafexProductMutationV79=true;wrapped.__rafexOriginal=original;window[name]=wrapped;
    try{(0,eval)(name+'=window["'+name+'"]')}catch(_){}
  }
  [
    ['m2AddRack','add'],['m2AddSelectedSavedRack','saved-add'],
    ['m2ApplyAutoFillLength','extend'],['m2ApplyRackCustomization','customize'],
    ['m2DuplicateRack','duplicate'],['m2DeleteRack','delete'],['m2ClearLayout','clear'],
    ['m2ApplyProjectRecord','project-open'],['m2UndoLastAction','undo'],
    ['m2ChooseJoinRack','join'],['m2SeparateSelectedRack','separate'],
    ['rafexDuplicateSelectedBlocksV64','group-duplicate'],['rafexMrApplyDistanceV70','mr-extend']
  ].forEach(function(entry){wrap(entry[0],entry[1])});

  window.rafexMarkProductCountsDirtyV79=mark;
  window.rafexRefreshProductCountsV79=function(force){dirty=true;rowsCache=null;lastReason=force?'pdf':'manual';return refresh(true)};
  window.rafexMarkProductCountsDirtyV77=mark;
  window.rafexRefreshProductCountsV77=function(){return window.rafexRefreshProductCountsV79(true)};
  recomputeSummary();publish();queue();refreshSelectedInfo();
})();</script>`;

const closing = html.lastIndexOf("</body>");
if (closing < 0) throw new Error("Free product cache v79: </body> bulunamadi.");
html = html.slice(0, closing) + runtime + "\n" + html.slice(closing);

for (const required of [
  'data-rafex-free-product-cache="v79"',
  "rafexProductCountCacheV79",
  "rafexLayoutSummaryV79",
  "rafexMarkProductCountsDirtyV79",
  "rafexRefreshProductCountsV79",
  "m2ApplyAutoFillLength",
  "m2SeparateSelectedRack"
]) if (!html.includes(required)) throw new Error("Free product cache v79 dogrulama eksigi: " + required);

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.slice(0, match.index) + match[1] + match[2] + encoded + match[2] + worker.slice(match.index + match[0].length);
fs.writeFileSync(workerPath, worker);
console.log("FINAL v79: urun/blok adetleri yalnizca veri degisikliginde; tasima/secim/olcu/zoom sayim tetiklemez.");
