import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("PDF two halves v14: HTML_BASE64 bulunamadi");
let html = Buffer.from(match[3], "base64").toString("utf8");
html = html
  .replace(/<style\s+data-rafex-pdf-two-halves="v14">[\s\S]*?<\/style>\s*/g, "")
  .replace(/<script\s+data-rafex-pdf-two-halves="v14">[\s\S]*?<\/script>\s*/g, "");

const runtime = String.raw`<style data-rafex-pdf-two-halves="v14">
/* FINAL: A4 rapor sayfasi yalnizca SOL %50 + SAG %50. */
.rafex-v14-two-halves{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;grid-auto-flow:row!important;grid-auto-rows:minmax(0,1fr)!important;gap:8px!important;align-items:stretch!important;width:100%!important;max-width:100%!important;overflow:visible!important}
.rafex-v14-two-halves>.m2-corporate-type-card{grid-column:auto!important;width:100%!important;max-width:none!important;min-width:0!important;height:100%!important;min-height:0!important;margin:0!important;align-self:stretch!important;justify-self:stretch!important;box-sizing:border-box!important;overflow:hidden!important;break-inside:avoid!important;page-break-inside:avoid!important}
/* B2B kendi yarim sayfasini tek dikey goruntu olarak kullanir. */
.rafex-v14-two-halves>.m2-corporate-type-card[data-rafex-system="b2b"]{display:grid!important;grid-template-columns:minmax(0,1fr)!important;grid-template-rows:28px minmax(0,1fr)!important}
.rafex-v14-two-halves>.m2-corporate-type-card[data-rafex-system="b2b"]>.m2-corporate-view{grid-column:1!important;grid-row:2!important;width:100%!important;height:100%!important;min-width:0!important;min-height:0!important;overflow:hidden!important}
.rafex-v14-two-halves>.m2-corporate-type-card[data-rafex-system="b2b"] svg{width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;object-fit:contain!important}
/* Mekik yarim sayfa icinde iki esit yatay bant: ON ustte, YAN altta. */
.rafex-v14-two-halves>.m2-corporate-type-card[data-rafex-system="mekik2"]{display:grid!important;grid-template-columns:minmax(0,1fr)!important;grid-template-rows:28px minmax(0,1fr) minmax(0,1fr)!important}
.rafex-v14-two-halves>.m2-corporate-type-card[data-rafex-system="mekik2"]>.m2-corporate-view{grid-column:1!important;width:100%!important;height:100%!important;min-width:0!important;min-height:0!important;overflow:hidden!important}
.rafex-v14-two-halves>.m2-corporate-type-card[data-rafex-system="mekik2"]>.m2-corporate-view:nth-of-type(1){grid-row:2!important}
.rafex-v14-two-halves>.m2-corporate-type-card[data-rafex-system="mekik2"]>.m2-corporate-view:nth-of-type(2){grid-row:3!important}
@media print{.rafex-v14-two-halves>.m2-corporate-type-card:nth-child(2n+3){break-before:page!important;page-break-before:always!important}}
</style>
<script data-rafex-pdf-two-halves="v14">(function(){
  if(window.__rafexPdfTwoHalvesV14)return;window.__rafexPdfTwoHalvesV14=true;
  function systemOf(entry){var d=entry&&entry.drawing?entry.drawing:entry||{},x=String(entry?.rafexSystem||entry?.__rafexSystem||d?.rafexSystem||'').toLowerCase();if(x==='b2b'||x==='mekik2')return x;return d?.b2bLayout||d?.b2b?'b2b':'mekik2'}
  function used(){try{return typeof m2CorporateUsedTypes==='function'?(m2CorporateUsedTypes()||[]):[]}catch{return[]}}
  function nameOf(entry,index){return String(entry?.name||entry?.typeName||('Tip '+(index+1))).trim()}
  function cardName(card){return String(card?.dataset?.rafexTypeName||card?.querySelector(':scope>strong span')?.textContent||card?.querySelector(':scope>strong')?.textContent||'').replace(/\s+TİPİ$/i,'').trim()}
  function makeTitle(name){var s=document.createElement('strong'),sp=document.createElement('span');sp.textContent=name;s.appendChild(sp);return s}
  function makeView(label,svg){var v=document.createElement('div');v.className='m2-corporate-view';var b=document.createElement('b');b.textContent=label;v.appendChild(b);if(svg){var w=document.createElement('div');w.innerHTML=String(svg).trim();var n=w.firstElementChild;if(n)v.appendChild(n)}return v}
  function b2bSvg(d){try{var labels=typeof m2ReportDictionary==='function'?m2ReportDictionary('tr'):undefined;return typeof m2B2BReportPerspectiveSvg==='function'?m2B2BReportPerspectiveSvg(d,labels,false):''}catch{return''}}
  function mekikSvg(d,mode){try{return typeof m2ReportElevationSvg==='function'?m2ReportElevationSvg(d,mode):''}catch{return''}}
  function ensureEntry(parent,entry,index){var sys=systemOf(entry),name=nameOf(entry,index),d=entry?.drawing||entry||{};var cards=Array.from(parent.querySelectorAll(':scope>.m2-corporate-type-card'));var card=cards.find(function(c){return String(c.dataset.rafexSystem||'').toLowerCase()===sys&&cardName(c)===name})||cards.find(function(c){return cardName(c)===name&&(!c.dataset.rafexSystem||String(c.dataset.rafexSystem).toLowerCase()===sys)});
    if(!card){card=document.createElement('article');card.className='m2-corporate-type-card';card.dataset.rafexSystem=sys;card.dataset.rafexTypeName=name;card.appendChild(makeTitle(name));if(sys==='b2b'){card.appendChild(makeView('ÖNDEN GÖRÜNÜŞ',b2bSvg(d)))}else{card.appendChild(makeView('ÖNDEN GÖRÜNÜŞ',mekikSvg(d,'front')));card.appendChild(makeView('YAN GÖRÜNÜŞ',mekikSvg(d,'side')))}parent.appendChild(card)}else{card.dataset.rafexSystem=sys;card.dataset.rafexTypeName=name}
    return card
  }
  function repairHost(host){if(!host)return;var existing=Array.from(host.querySelectorAll('.m2-corporate-type-card'));var parent=existing[0]?.parentElement||host.querySelector('.m2-corporate-type-grid');if(!parent)return;parent.classList.add('rafex-v14-two-halves');parent.style.setProperty('display','grid','important');parent.style.setProperty('grid-template-columns','minmax(0,1fr) minmax(0,1fr)','important');parent.style.setProperty('gap','8px','important');
    var entries=used();entries.forEach(function(entry,index){ensureEntry(parent,entry,index)});
    Array.from(parent.querySelectorAll(':scope>.m2-corporate-type-card')).forEach(function(card){card.style.setProperty('width','100%','important');card.style.setProperty('max-width','none','important');card.style.setProperty('grid-column','auto','important')});
  }
  function repair(){['m2CorporatePreview','m2CorporatePrint','m2CorporatePrintArea'].forEach(function(id){repairHost(document.getElementById(id))})}
  function schedule(){[0,30,80,160,320,650,1100,1700].forEach(function(ms){setTimeout(repair,ms)})}
  try{var prev=window.m2RenderCorporateReport;if(typeof prev==='function'&&!prev.__rafexV14){var w=function(){var out=prev.apply(this,arguments);schedule();return out};w.__rafexV14=true;try{m2RenderCorporateReport=w}catch{}window.m2RenderCorporateReport=w}}catch{}
  try{var prep=window.__rafexPrepareCorporatePrint;if(typeof prep==='function'&&!prep.__rafexV14){var wp=async function(){var out=await prep.apply(this,arguments);repair();await new Promise(function(r){requestAnimationFrame(function(){repair();r()})});return out};wp.__rafexV14=true;window.__rafexPrepareCorporatePrint=wp}}catch{}
  schedule();
})();</script>`;

const bodyEnd = html.lastIndexOf("</body>");
if (bodyEnd < 0) throw new Error("PDF two halves v14: body bulunamadi");
html = html.slice(0, bodyEnd) + runtime + html.slice(bodyEnd);
const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.slice(0, match.index) + match[1] + match[2] + encoded + match[2] + worker.slice(match.index + match[0].length);
fs.writeFileSync(workerPath, worker);
console.log("FINAL v14: PDF gercek iki yarim sayfaya kilitlendi; eksik B2B kartlari geri getirildi.");
