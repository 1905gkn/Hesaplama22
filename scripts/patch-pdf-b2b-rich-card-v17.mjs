import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("PDF B2B rich card v17: HTML_BASE64 bulunamadi");
let html = Buffer.from(match[3], "base64").toString("utf8");
html = html
  .replace(/<style\s+data-rafex-pdf-b2b-rich-card="v17">[\s\S]*?<\/style>\s*/g, "")
  .replace(/<script\s+data-rafex-pdf-b2b-rich-card="v17">[\s\S]*?<\/script>\s*/g, "");

const runtime = String.raw`<style data-rafex-pdf-b2b-rich-card="v17">
/* FINAL v17: ayni tipin bos B2B kabugu yerine gercek/dolu B2B kartini kullan. */
.rafex-v17-layout{
  display:grid!important;
  grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;
  grid-auto-flow:row!important;
  grid-auto-rows:minmax(0,1fr)!important;
  gap:8px!important;
  width:100%!important;max-width:100%!important;min-width:0!important;
  align-items:stretch!important;
}
.rafex-v17-layout>.m2-corporate-type-card.rafex-v17-hidden{display:none!important}
.rafex-v17-layout>.m2-corporate-type-card.rafex-v17-active{
  display:grid!important;
  grid-column:auto!important;grid-row:auto!important;
  width:100%!important;max-width:none!important;min-width:0!important;
  height:100%!important;min-height:0!important;margin:0!important;
  align-self:stretch!important;justify-self:stretch!important;
  overflow:hidden!important;box-sizing:border-box!important;
  break-inside:avoid!important;page-break-inside:avoid!important;
}
/* B2B = yarim sayfada tek tam-yukseklik goruntu. */
.rafex-v17-layout>.m2-corporate-type-card[data-rafex-system="b2b"].rafex-v17-active{
  grid-template-columns:minmax(0,1fr)!important;
  grid-template-rows:28px minmax(0,1fr)!important;
}
.rafex-v17-layout>.m2-corporate-type-card[data-rafex-system="b2b"].rafex-v17-active>.m2-corporate-view.rafex-v17-best-view{
  display:grid!important;grid-column:1!important;grid-row:2!important;
  width:100%!important;height:100%!important;min-width:0!important;min-height:0!important;
  place-items:center!important;overflow:hidden!important;
}
.rafex-v17-layout>.m2-corporate-type-card[data-rafex-system="b2b"].rafex-v17-active>.m2-corporate-view:not(.rafex-v17-best-view){display:none!important}
.rafex-v17-layout>.m2-corporate-type-card[data-rafex-system="b2b"] svg,
.rafex-v17-layout>.m2-corporate-type-card[data-rafex-system="b2b"] canvas,
.rafex-v17-layout>.m2-corporate-type-card[data-rafex-system="b2b"] img{
  width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;
  object-fit:contain!important;display:block!important;margin:auto!important;
}
/* Mekik = ayni yarim sayfada on ust / yan alt. */
.rafex-v17-layout>.m2-corporate-type-card[data-rafex-system="mekik2"].rafex-v17-active{
  grid-template-columns:minmax(0,1fr)!important;
  grid-template-rows:28px minmax(0,1fr) minmax(0,1fr)!important;
}
.rafex-v17-layout>.m2-corporate-type-card[data-rafex-system="mekik2"].rafex-v17-active>.m2-corporate-view{
  grid-column:1!important;width:100%!important;height:100%!important;
  min-width:0!important;min-height:0!important;overflow:hidden!important;
}
.rafex-v17-layout>.m2-corporate-type-card[data-rafex-system="mekik2"].rafex-v17-active>.m2-corporate-view:nth-of-type(1){grid-row:2!important;border-bottom:1px solid #c6d2dc!important}
.rafex-v17-layout>.m2-corporate-type-card[data-rafex-system="mekik2"].rafex-v17-active>.m2-corporate-view:nth-of-type(2){grid-row:3!important}
@media print{
  .rafex-v17-layout{grid-template-columns:50% 50%!important;gap:0!important}
  .rafex-v17-layout>.m2-corporate-type-card.rafex-v17-page-break{break-before:page!important;page-break-before:always!important}
}
</style>
<script data-rafex-pdf-b2b-rich-card="v17">(function(){
  if(window.__rafexPdfB2BRichCardV17)return;window.__rafexPdfB2BRichCardV17=true;
  function nm(card){return String(card?.dataset?.rafexTypeName||card?.querySelector(':scope>strong span')?.textContent||card?.querySelector(':scope>strong')?.textContent||'').replace(/\s+TİPİ$/i,'').trim()}
  function rawSys(card){return String(card?.dataset?.rafexSystem||'').toLowerCase()}
  function text(card){return String(card?.innerText||card?.textContent||'').toUpperCase()}
  function isMekik(card){var s=rawSys(card);if(s==='mekik2')return true;return !!card.querySelector('.rafex-mekik-native-front-v13,.rafex-mekik-native-side-v13,[data-rafex-native-output^="mekik-"]')}
  function looksB2B(card){var s=rawSys(card);if(s==='b2b')return true;var t=text(card);return !!card.querySelector('.rafex-b2b-report-perspective,.rafex-report-3d-frame,[data-rafex-native-output^="b2b"]')||t.includes('3D İLE AYNI MODÜL')||t.includes('3D ILE AYNI MODUL')}
  function score(node){if(!node)return-1;var media=node.querySelectorAll('svg,canvas,img').length;var paths=node.querySelectorAll('svg path,svg line,svg rect,svg polygon,svg polyline').length;var views=node.querySelectorAll('.m2-corporate-view').length;return media*1000000+paths*1000+views*10000+String(node.innerHTML||'').length}
  function chooseBestView(card){var views=Array.from(card.querySelectorAll(':scope>.m2-corporate-view'));if(!views.length)return;var best=views.slice().sort(function(a,b){return score(b)-score(a)})[0];views.forEach(function(v){v.classList.toggle('rafex-v17-best-view',v===best)})}
  function reset(cards){cards.forEach(function(c){c.classList.remove('rafex-v17-active','rafex-v17-hidden','rafex-v17-page-break');c.querySelectorAll(':scope>.m2-corporate-view').forEach(function(v){v.classList.remove('rafex-v17-best-view')})})}
  function repairHost(host){
    if(!host)return;var cards=Array.from(host.querySelectorAll('.m2-corporate-type-card'));if(!cards.length)return;
    var parent=cards[0].parentElement;if(!parent)return;
    parent.classList.add('rafex-v17-layout');
    parent.style.setProperty('display','grid','important');
    parent.style.setProperty('grid-template-columns','minmax(0,1fr) minmax(0,1fr)','important');
    parent.style.setProperty('width','100%','important');
    reset(cards);

    /* Mekik kartlari kendi grubunda kalir. */
    var mekikGroups=new Map();
    cards.filter(isMekik).forEach(function(c){var key=nm(c)||'__mekik';if(!mekikGroups.has(key))mekikGroups.set(key,[]);mekikGroups.get(key).push(c)});
    var selected=new Set();
    mekikGroups.forEach(function(list){var best=list.slice().sort(function(a,b){return score(b)-score(a)})[0];best.dataset.rafexSystem='mekik2';best.classList.add('rafex-v17-active');selected.add(best);list.forEach(function(c){if(c!==best)c.classList.add('rafex-v17-hidden')})});

    /* B2B: ayni isimde bos explicit kart + asagidaki dolu legacy kart varsa, en dolu NON-MEKIK karti sec. */
    var names=new Map();
    cards.filter(function(c){return !isMekik(c)}).forEach(function(c){var key=nm(c)||'__unnamed_'+cards.indexOf(c);if(!names.has(key))names.set(key,[]);names.get(key).push(c)});
    names.forEach(function(list){
      var hasB2B=list.some(looksB2B);
      if(!hasB2B)return;
      var best=list.slice().sort(function(a,b){return score(b)-score(a)})[0];
      best.dataset.rafexSystem='b2b';best.classList.add('rafex-v17-active');selected.add(best);chooseBestView(best);
      list.forEach(function(c){if(c!==best)c.classList.add('rafex-v17-hidden')});
    });

    /* Geriye kalan kartlari kaybetme; sistem etiketi yoksa tek kart olarak koru. */
    cards.forEach(function(c){if(selected.has(c)||c.classList.contains('rafex-v17-hidden'))return;if(!isMekik(c)&&!looksB2B(c)){c.classList.add('rafex-v17-active');selected.add(c)}});

    var active=Array.from(parent.querySelectorAll(':scope>.m2-corporate-type-card.rafex-v17-active'));
    active.forEach(function(c,i){
      c.style.setProperty('grid-column','auto','important');c.style.setProperty('grid-row','auto','important');
      c.style.setProperty('width','100%','important');c.style.setProperty('height','100%','important');
      c.classList.toggle('rafex-v17-page-break',i>1&&i%2===0);
      if(rawSys(c)==='b2b')chooseBestView(c);
    });
  }
  function repair(){['m2CorporatePreview','m2CorporatePrint','m2CorporatePrintArea'].forEach(function(id){repairHost(document.getElementById(id))})}
  function schedule(){[0,20,60,120,240,450,800,1300,2000].forEach(function(ms){setTimeout(repair,ms)})}
  try{var prev=window.m2RenderCorporateReport;if(typeof prev==='function'&&!prev.__rafexV17){var w=function(){var out=prev.apply(this,arguments);schedule();return out};w.__rafexV17=true;try{m2RenderCorporateReport=w}catch{}window.m2RenderCorporateReport=w}}catch{}
  try{var prep=window.__rafexPrepareCorporatePrint;if(typeof prep==='function'&&!prep.__rafexV17){var wp=async function(){var out=await prep.apply(this,arguments);repair();await new Promise(function(r){requestAnimationFrame(function(){repair();r()})});return out};wp.__rafexV17=true;window.__rafexPrepareCorporatePrint=wp}}catch{}
  schedule();
})();</script>`;

const bodyEnd = html.lastIndexOf("</body>");
if (bodyEnd < 0) throw new Error("PDF B2B rich card v17: body bulunamadi");
html = html.slice(0, bodyEnd) + runtime + html.slice(bodyEnd);
const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.slice(0, match.index) + match[1] + match[2] + encoded + match[2] + worker.slice(match.index + match[0].length);
fs.writeFileSync(workerPath, worker);
console.log("FINAL v17: bos B2B kabugu yerine ayni tipin dolu legacy B2B karti yarim sayfaya tasindi; tekrar kart gizlendi.");
