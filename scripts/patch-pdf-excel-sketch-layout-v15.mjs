import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("PDF Excel sketch v15: HTML_BASE64 bulunamadi");
let html = Buffer.from(match[3], "base64").toString("utf8");
html = html
  .replace(/<style\s+data-rafex-pdf-excel-sketch="v15">[\s\S]*?<\/style>\s*/g, "")
  .replace(/<script\s+data-rafex-pdf-excel-sketch="v15">[\s\S]*?<\/script>\s*/g, "");

const runtime = String.raw`<style data-rafex-pdf-excel-sketch="v15">
/* Excel eskizi: SOL %50 = Mekik (on ust / yan alt), SAG %50 = B2B tam boy. */
.rafex-v15-excel-layout{
  display:grid!important;
  grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;
  grid-auto-rows:minmax(0,1fr)!important;
  column-gap:8px!important;
  row-gap:10px!important;
  align-items:stretch!important;
  width:100%!important;
  max-width:100%!important;
  min-width:0!important;
}
.rafex-v15-excel-layout>.m2-corporate-type-card{
  width:100%!important;max-width:none!important;min-width:0!important;
  height:100%!important;min-height:0!important;margin:0!important;
  box-sizing:border-box!important;overflow:hidden!important;
  align-self:stretch!important;justify-self:stretch!important;
  break-inside:avoid!important;page-break-inside:avoid!important;
}
/* Mekik her zaman sol kolon. */
.rafex-v15-excel-layout>.m2-corporate-type-card[data-rafex-system="mekik2"]{
  grid-column:1!important;
  display:grid!important;
  grid-template-columns:minmax(0,1fr)!important;
  grid-template-rows:28px minmax(0,1fr) minmax(0,1fr)!important;
}
.rafex-v15-excel-layout>.m2-corporate-type-card[data-rafex-system="mekik2"]>.m2-corporate-view{
  grid-column:1!important;width:100%!important;height:100%!important;
  min-width:0!important;min-height:0!important;overflow:hidden!important;
}
.rafex-v15-excel-layout>.m2-corporate-type-card[data-rafex-system="mekik2"]>.m2-corporate-view:nth-of-type(1){grid-row:2!important;border-bottom:1px solid #c6d2dc!important}
.rafex-v15-excel-layout>.m2-corporate-type-card[data-rafex-system="mekik2"]>.m2-corporate-view:nth-of-type(2){grid-row:3!important}
/* B2B her zaman sag kolon ve kendi kolonunun tamamini kaplar. */
.rafex-v15-excel-layout>.m2-corporate-type-card[data-rafex-system="b2b"]{
  grid-column:2!important;
  display:grid!important;
  grid-template-columns:minmax(0,1fr)!important;
  grid-template-rows:28px minmax(0,1fr)!important;
}
.rafex-v15-excel-layout>.m2-corporate-type-card[data-rafex-system="b2b"]>.m2-corporate-view{
  grid-column:1!important;grid-row:2!important;width:100%!important;height:100%!important;
  min-width:0!important;min-height:0!important;overflow:hidden!important;
}
.rafex-v15-excel-layout>.m2-corporate-type-card[data-rafex-system="b2b"] svg,
.rafex-v15-excel-layout>.m2-corporate-type-card[data-rafex-system="b2b"] canvas,
.rafex-v15-excel-layout>.m2-corporate-type-card[data-rafex-system="b2b"] img{
  width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;
  object-fit:contain!important;
}
@media print{
  .rafex-v15-excel-layout{grid-template-columns:50% 50%!important;column-gap:0!important}
  .rafex-v15-excel-layout>.m2-corporate-type-card{break-inside:avoid!important;page-break-inside:avoid!important}
}
</style>
<script data-rafex-pdf-excel-sketch="v15">(function(){
  if(window.__rafexPdfExcelSketchV15)return;window.__rafexPdfExcelSketchV15=true;
  function sys(card){return String(card?.dataset?.rafexSystem||'').toLowerCase()}
  function repairHost(host){
    if(!host)return;
    var cards=Array.from(host.querySelectorAll('.m2-corporate-type-card'));
    if(!cards.length)return;
    var parent=cards[0].parentElement;
    if(!parent)return;
    parent.classList.add('rafex-v15-excel-layout');
    parent.style.setProperty('display','grid','important');
    parent.style.setProperty('grid-template-columns','minmax(0,1fr) minmax(0,1fr)','important');
    parent.style.setProperty('width','100%','important');

    var mekik=cards.filter(function(c){return sys(c)==='mekik2'});
    var b2b=cards.filter(function(c){return sys(c)==='b2b'});
    var other=cards.filter(function(c){return sys(c)!=='mekik2'&&sys(c)!=='b2b'});

    /* Excel sirasi: Mekik sol, B2B sag. Her yeni cift yeni grid satirina gider. */
    var max=Math.max(mekik.length,b2b.length);
    for(var i=0;i<max;i++){
      var row=i+1;
      if(mekik[i]){
        mekik[i].style.setProperty('grid-column','1','important');
        mekik[i].style.setProperty('grid-row',String(row),'important');
      }
      if(b2b[i]){
        b2b[i].style.setProperty('grid-column','2','important');
        b2b[i].style.setProperty('grid-row',String(row),'important');
      }
    }
    other.forEach(function(c,i){
      c.style.setProperty('grid-column',String((i%2)+1),'important');
      c.style.setProperty('grid-row',String(max+1+Math.floor(i/2)),'important');
    });
  }
  function repair(){['m2CorporatePreview','m2CorporatePrint','m2CorporatePrintArea'].forEach(function(id){repairHost(document.getElementById(id))})}
  function schedule(){[0,30,80,160,320,650,1100,1700].forEach(function(ms){setTimeout(repair,ms)})}
  try{var prev=window.m2RenderCorporateReport;if(typeof prev==='function'&&!prev.__rafexV15){var w=function(){var out=prev.apply(this,arguments);schedule();return out};w.__rafexV15=true;try{m2RenderCorporateReport=w}catch{}window.m2RenderCorporateReport=w}}catch{}
  try{var prep=window.__rafexPrepareCorporatePrint;if(typeof prep==='function'&&!prep.__rafexV15){var wp=async function(){var out=await prep.apply(this,arguments);repair();await new Promise(function(r){requestAnimationFrame(function(){repair();r()})});return out};wp.__rafexV15=true;window.__rafexPrepareCorporatePrint=wp}}catch{}
  schedule();
})();</script>`;

const bodyEnd = html.lastIndexOf("</body>");
if (bodyEnd < 0) throw new Error("PDF Excel sketch v15: body bulunamadi");
html = html.slice(0, bodyEnd) + runtime + html.slice(bodyEnd);
const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.slice(0, match.index) + match[1] + match[2] + encoded + match[2] + worker.slice(match.index + match[0].length);
fs.writeFileSync(workerPath, worker);
console.log("FINAL v15: Excel eskizi birebir - Mekik sol on/yan, B2B sag tam boy.");
