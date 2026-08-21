import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("Final user repairs v20: HTML_BASE64 bulunamadi");
let html = Buffer.from(match[3], "base64").toString("utf8");
html = html
  .replace(/<style\s+data-rafex-final-user-repairs="v20">[\s\S]*?<\/style>\s*/g, "")
  .replace(/<script\s+data-rafex-final-user-repairs="v20">[\s\S]*?<\/script>\s*/g, "");

const runtime = String.raw`<style data-rafex-final-user-repairs="v20">
/* Mekik occupies one card: FRONT is the independent upper section and SIDE is
   the independent lower section. No earlier side-by-side rule may win. */
.rafex-v19-type-card[data-rafex-system="mekik2"]{
  display:grid!important;grid-template-columns:minmax(0,1fr)!important;
  grid-template-rows:28px minmax(0,1fr) minmax(0,1fr)!important;gap:0!important
}
.rafex-v19-type-card[data-rafex-system="mekik2"]>.rafex-v19-view:nth-of-type(1){grid-column:1!important;grid-row:2!important;border-right:0!important;border-bottom:1px solid #c6d2dc!important}
.rafex-v19-type-card[data-rafex-system="mekik2"]>.rafex-v19-view:nth-of-type(2){grid-column:1!important;grid-row:3!important;border-right:0!important}
/* Uzatma row has a reserved, permanent position above product disclosures, so
   opening either system list cannot move it. */
#page.rafex-free-drawing-page #m2AutoFillControls{display:flex!important;visibility:visible!important;opacity:1!important;min-height:46px!important;margin:8px 0!important;box-sizing:border-box!important}
#page.rafex-free-drawing-page #m2AutoFillControls[aria-disabled="true"]{opacity:.58!important}
</style>
<script data-rafex-final-user-repairs="v20">(function(){
  if(window.__rafexFinalUserRepairsV20)return;window.__rafexFinalUserRepairsV20=true;
  var PRODUCT_KEY='rafex_free_product_disclosures_v1';
  function productState(){try{return JSON.parse(localStorage.getItem(PRODUCT_KEY)||'{}')||{}}catch{return{}}}
  function saveProductState(state){try{localStorage.setItem(PRODUCT_KEY,JSON.stringify(state))}catch{}}
  function freePage(){var p=document.getElementById('page');return !!p&&p.classList.contains('rafex-free-drawing-page')}
  function stabilizeExtension(){
    if(!freePage())return;var controls=document.getElementById('m2AutoFillControls'),products=document.getElementById('m2LayoutProductList');if(!controls||!products)return;
    if(products.previousElementSibling!==controls)products.parentNode.insertBefore(controls,products);
    controls.hidden=false;controls.style.setProperty('display','flex','important');
  }
  function restoreProductOpenState(){
    if(!freePage())return;var state=productState();document.querySelectorAll('#m2LayoutProductList details[data-rafex-product-system]').forEach(function(details){var key=details.dataset.rafexProductSystem;details.open=state[key]===true;});
  }
  var products=document.getElementById('m2LayoutProductList');if(products)new MutationObserver(function(){stabilizeExtension();restoreProductOpenState()}).observe(products,{childList:true,subtree:false});
  var mutationQueued=false;
  new MutationObserver(function(){
    if(mutationQueued)return;mutationQueued=true;
    setTimeout(function(){mutationQueued=false;stabilizeExtension();restoreProductOpenState()},0);
  }).observe(document.documentElement,{childList:true,subtree:true});
  async function restoreSelectedB2B(){try{if(typeof window.rafexRenderSelectedB2BSections==='function')await window.rafexRenderSelectedB2BSections(true)}catch(error){console.warn('Kesit Yer Belirleme PDF goruntusu restore edilemedi',error)}}
  function finish(){stabilizeExtension();restoreProductOpenState();return restoreSelectedB2B()}
  function schedule(){[0,60,180,420,900,1600,2600,3400].forEach(function(ms){setTimeout(finish,ms)})}
  try{var render=window.m2RenderCorporateReport;if(typeof render==='function'&&!render.__rafexV20){var wrapped=function(){var out=render.apply(this,arguments);Promise.resolve(out).finally(schedule);return out};wrapped.__rafexV20=true;try{m2RenderCorporateReport=wrapped}catch{}window.m2RenderCorporateReport=wrapped}}catch{}
  try{var prepare=window.__rafexPrepareCorporatePrint;if(typeof prepare==='function'&&!prepare.__rafexV20){var wrappedPrepare=async function(){var out=await prepare.apply(this,arguments);await finish();await new Promise(function(resolve){requestAnimationFrame(async function(){await finish();resolve()})});return out};wrappedPrepare.__rafexV20=true;window.__rafexPrepareCorporatePrint=wrappedPrepare}}catch{}
  document.addEventListener('click',function(){setTimeout(stabilizeExtension,0)},true);
  stabilizeExtension();restoreProductOpenState();schedule();
})();</script>`;

const bodyEnd = html.lastIndexOf("</body>");
if (bodyEnd < 0) throw new Error("Final user repairs v20: body bulunamadi");
html = html.slice(0, bodyEnd) + runtime + html.slice(bodyEnd);
const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.slice(0, match.index) + match[1] + match[2] + encoded + match[2] + worker.slice(match.index + match[0].length);
fs.writeFileSync(workerPath, worker);
console.log("FINAL v20: selected B2B section restored; Mekik front/side separated; product arrows and fixed extension row repaired.");
