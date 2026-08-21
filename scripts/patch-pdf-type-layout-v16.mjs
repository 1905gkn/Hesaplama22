import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("PDF type layout v16: HTML_BASE64 bulunamadi");
let html = Buffer.from(match[3], "base64").toString("utf8");
html = html
  .replace(/<style\s+data-rafex-pdf-type-layout="v16">[\s\S]*?<\/style>\s*/g, "")
  .replace(/<script\s+data-rafex-pdf-type-layout="v16">[\s\S]*?<\/script>\s*/g, "");

const runtime = String.raw`<style data-rafex-pdf-type-layout="v16">
/* FINAL: taraf sabit degil; kart tipi kendi sunumunu belirler. */
.rafex-v16-type-layout{
  display:grid!important;
  grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;
  grid-auto-flow:row!important;
  grid-auto-rows:minmax(0,1fr)!important;
  gap:8px!important;
  align-items:stretch!important;
  width:100%!important;max-width:100%!important;min-width:0!important;
}
.rafex-v16-type-layout>.m2-corporate-type-card.rafex-v16-hidden{display:none!important}
.rafex-v16-type-layout>.m2-corporate-type-card.rafex-v16-active{
  grid-column:auto!important;grid-row:auto!important;
  width:100%!important;max-width:none!important;min-width:0!important;
  height:100%!important;min-height:0!important;margin:0!important;
  box-sizing:border-box!important;overflow:hidden!important;
  align-self:stretch!important;justify-self:stretch!important;
  break-inside:avoid!important;page-break-inside:avoid!important;
}
/* B2B: yarim sayfanin TAMAMI tek dikey goruntu. */
.rafex-v16-type-layout>.m2-corporate-type-card[data-rafex-system="b2b"].rafex-v16-active{
  display:grid!important;grid-template-columns:minmax(0,1fr)!important;
  grid-template-rows:28px minmax(0,1fr)!important;
}
.rafex-v16-type-layout>.m2-corporate-type-card[data-rafex-system="b2b"].rafex-v16-active>.m2-corporate-view.rafex-v16-best-view{
  display:grid!important;grid-column:1!important;grid-row:2!important;
  width:100%!important;height:100%!important;min-width:0!important;min-height:0!important;
  overflow:hidden!important;place-items:center!important;
}
.rafex-v16-type-layout>.m2-corporate-type-card[data-rafex-system="b2b"].rafex-v16-active>.m2-corporate-view:not(.rafex-v16-best-view){display:none!important}
.rafex-v16-type-layout>.m2-corporate-type-card[data-rafex-system="b2b"] svg,
.rafex-v16-type-layout>.m2-corporate-type-card[data-rafex-system="b2b"] canvas,
.rafex-v16-type-layout>.m2-corporate-type-card[data-rafex-system="b2b"] img{
  width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;
  object-fit:contain!important;display:block!important;margin:auto!important;
}
/* Mekik: ayni yarim sayfada on ustte, yan altta; esit alan. */
.rafex-v16-type-layout>.m2-corporate-type-card[data-rafex-system="mekik2"].rafex-v16-active{
  display:grid!important;grid-template-columns:minmax(0,1fr)!important;
  grid-template-rows:28px minmax(0,1fr) minmax(0,1fr)!important;
}
.rafex-v16-type-layout>.m2-corporate-type-card[data-rafex-system="mekik2"].rafex-v16-active>.m2-corporate-view{
  grid-column:1!important;width:100%!important;height:100%!important;
  min-width:0!important;min-height:0!important;overflow:hidden!important;
}
.rafex-v16-type-layout>.m2-corporate-type-card[data-rafex-system="mekik2"].rafex-v16-active>.m2-corporate-view:nth-of-type(1){grid-row:2!important;border-bottom:1px solid #c6d2dc!important}
.rafex-v16-type-layout>.m2-corporate-type-card[data-rafex-system="mekik2"].rafex-v16-active>.m2-corporate-view:nth-of-type(2){grid-row:3!important}
@media print{
  .rafex-v16-type-layout{grid-template-columns:50% 50%!important;gap:0!important}
  .rafex-v16-type-layout>.rafex-v16-new-page{break-before:page!important;page-break-before:always!important}
}
</style>
<script data-rafex-pdf-type-layout="v16">(function(){
  if(window.__rafexPdfTypeLayoutV16)return;window.__rafexPdfTypeLayoutV16=true;
  function sys(card){return String(card?.dataset?.rafexSystem||'').toLowerCase()}
  function name(card){return String(card?.dataset?.rafexTypeName||card?.querySelector(':scope>strong span')?.textContent||card?.querySelector(':scope>strong')?.textContent||'').replace(/\s+TİPİ$/i,'').trim()}
  function score(node){if(!node)return-1;var media=node.querySelectorAll('svg,canvas,img').length;var svg=node.querySelectorAll('svg').length;return media*100000+svg*10000+String(node.innerHTML||'').length}
  function chooseBestB2BView(card){var views=Array.from(card.querySelectorAll(':scope>.m2-corporate-view'));if(!views.length)return;var best=views.slice().sort(function(a,b){return score(b)-score(a)})[0];views.forEach(function(v){v.classList.toggle('rafex-v16-best-view',v===best)})}
  function repairHost(host){
    if(!host)return;var cards=Array.from(host.querySelectorAll('.m2-corporate-type-card'));if(!cards.length)return;
    var parent=cards[0].parentElement;if(!parent)return;
    parent.classList.add('rafex-v16-type-layout');
    parent.style.setProperty('display','grid','important');
    parent.style.setProperty('grid-template-columns','minmax(0,1fr) minmax(0,1fr)','important');
    parent.style.setProperty('width','100%','important');

    /* Ayni sistem + ayni tip iki kez uretilmisse sadece en dolu kart kalsin. */
    var groups=new Map();
    cards.forEach(function(c){var key=(sys(c)||'other')+'||'+name(c);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(c)});
    groups.forEach(function(list){var best=list.slice().sort(function(a,b){return score(b)-score(a)})[0];list.forEach(function(c){c.classList.toggle('rafex-v16-hidden',c!==best);c.classList.toggle('rafex-v16-active',c===best)});if(sys(best)==='b2b')chooseBestB2BView(best)});

    var active=Array.from(parent.querySelectorAll(':scope>.m2-corporate-type-card.rafex-v16-active'));
    active.forEach(function(c,i){
      c.classList.toggle('rafex-v16-new-page',i>1&&i%2===0);
      c.style.setProperty('grid-column','auto','important');
      c.style.setProperty('grid-row','auto','important');
      c.style.setProperty('width','100%','important');
      c.style.setProperty('height','100%','important');
    });
  }
  function repair(){['m2CorporatePreview','m2CorporatePrint','m2CorporatePrintArea'].forEach(function(id){repairHost(document.getElementById(id))})}
  function schedule(){[0,30,80,160,320,650,1100,1700].forEach(function(ms){setTimeout(repair,ms)})}
  try{var prev=window.m2RenderCorporateReport;if(typeof prev==='function'&&!prev.__rafexV16){var w=function(){var out=prev.apply(this,arguments);schedule();return out};w.__rafexV16=true;try{m2RenderCorporateReport=w}catch{}window.m2RenderCorporateReport=w}}catch{}
  try{var prep=window.__rafexPrepareCorporatePrint;if(typeof prep==='function'&&!prep.__rafexV16){var wp=async function(){var out=await prep.apply(this,arguments);repair();await new Promise(function(r){requestAnimationFrame(function(){repair();r()})});return out};wp.__rafexV16=true;window.__rafexPrepareCorporatePrint=wp}}catch{}
  schedule();
})();</script>`;

const bodyEnd = html.lastIndexOf("</body>");
if (bodyEnd < 0) throw new Error("PDF type layout v16: body bulunamadi");
html = html.slice(0, bodyEnd) + runtime + html.slice(bodyEnd);
const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.slice(0, match.index) + match[1] + match[2] + encoded + match[2] + worker.slice(match.index + match[0].length);
fs.writeFileSync(workerPath, worker);
console.log("FINAL v16: taraf sabit degil; Mekik on/yan, B2B tek tam boy; duplicate kartlar temizlendi.");
