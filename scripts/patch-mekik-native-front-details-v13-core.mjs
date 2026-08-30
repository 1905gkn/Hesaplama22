import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("Mekik native front/details v13: HTML_BASE64 bulunamadi.");
let html = Buffer.from(match[3], "base64").toString("utf8");

html = html
  .replace(/<style\s+data-rafex-mekik-native-front-details="v13">[\s\S]*?<\/style>\s*/g, "")
  .replace(/<script\s+data-rafex-mekik-native-front-details="v13">[\s\S]*?<\/script>\s*/g, "");

const runtime = String.raw`<style data-rafex-mekik-native-front-details="v13">
.m2-corporate-type-card[data-rafex-system="mekik2"]{
  grid-template-columns:minmax(0,1fr)!important;
  grid-template-rows:28px minmax(0,1fr) minmax(0,1fr)!important;
  overflow:hidden!important;
}
.m2-corporate-type-card[data-rafex-system="mekik2"]>.m2-corporate-view{
  grid-column:1!important;min-width:0!important;min-height:0!important;height:100%!important;
  display:grid!important;grid-template-rows:20px minmax(0,1fr)!important;
  position:relative!important;overflow:hidden!important;background:#fff!important;
}
.m2-corporate-type-card[data-rafex-system="mekik2"]>.m2-corporate-view:nth-of-type(1){grid-row:2!important;border-bottom:1px solid #c6d2dc!important}
.m2-corporate-type-card[data-rafex-system="mekik2"]>.m2-corporate-view:nth-of-type(2){grid-row:3!important}
.m2-corporate-type-card[data-rafex-system="mekik2"]>.m2-corporate-view>svg.rafex-mekik-native-front-v13,
.m2-corporate-type-card[data-rafex-system="mekik2"]>.m2-corporate-view>svg.rafex-mekik-native-side-v13{
  grid-row:2!important;width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;
  min-width:0!important;min-height:0!important;display:block!important;position:static!important;
  margin:0!important;transform:none!important;overflow:visible!important;
}
.m2-corporate-type-card[data-rafex-system="mekik2"] .rafex-mekik-view-details{
  display:flex!important;visibility:visible!important;opacity:1!important;
  position:absolute!important;left:50%!important;bottom:5px!important;transform:translateX(-50%)!important;
  z-index:8!important;width:auto!important;max-width:82%!important;min-height:28px!important;
  margin:0!important;padding:5px 10px!important;border-radius:5px!important;
  background:#173c2d!important;color:#fff!important;font:800 7px/1.2 Arial,sans-serif!important;
}
.rafex-mekik-front-callouts-v13{position:absolute;inset:22px 0 0;z-index:9;pointer-events:none;font-family:Arial,sans-serif}
.rafex-mekik-front-callouts-v13 .top-stack{position:absolute;top:4px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:3px;white-space:nowrap}
.rafex-mekik-front-callouts-v13 .side-gap{font:900 7px/1 Arial;color:#6c5600;background:#fff5bd;padding:2px 5px;border-radius:7px}
.rafex-mekik-front-callouts-v13 .column-gap{font:900 7px/1 Arial;color:#fff;background:#173c2d;padding:4px 12px;border-radius:10px;min-width:145px;text-align:center}
.rafex-mekik-front-callouts-v13 .pallet-chip{font:900 7px/1 Arial;color:#4d4300;background:#fff3a5;border:1px solid #d2a900;padding:3px 7px;border-radius:9px}
.rafex-mekik-front-callouts-v13 .upright-chip{position:absolute;right:3.5%;top:47%;transform:translateY(-50%);background:#173c2d;color:#fff;border-radius:7px;padding:6px 9px;text-align:center;font:900 6.5px/1.2 Arial;min-width:84px}
.rafex-mekik-front-callouts-v13 .upright-chip b{display:block;margin-top:2px;font-size:10px}
</style>
<script data-rafex-mekik-native-front-details="v13">(function(){
  if(window.__rafexMekikNativeFrontDetailsV13)return;window.__rafexMekikNativeFrontDetailsV13=true;
  function fmtN(v){var n=Math.round(Number(v)||0);try{return n.toLocaleString('tr-TR')}catch{return String(n)}}
  function systemOf(entry){var d=entry?.drawing||entry||{},x=String(entry?.rafexSystem||entry?.__rafexSystem||d?.rafexSystem||'').toLowerCase();if(x==='b2b'||x==='mekik2')return x;return d?.b2bLayout||d?.b2b?'b2b':'mekik2';}
  function usedMekik(){try{return (typeof m2CorporateUsedTypes==='function'?(m2CorporateUsedTypes()||[]):[]).filter(function(e){return systemOf(e)==='mekik2';})}catch{return[]}}
  function nameOf(entry,index){return String(entry?.name||entry?.typeName||('TİP '+(index+1))).trim()}
  function cardName(card){return String(card?.dataset?.rafexTypeName||card?.querySelector(':scope>strong span')?.textContent||card?.querySelector(':scope>strong')?.textContent||'').replace(/\s+TİPİ$/i,'').trim()}
  function drawingFrontSvg(d){try{if(typeof m2MekikSetProjection!=='function')return '';var projection=m2MekikSetProjection('front',d,0,0,200,112);return '<svg class="rafex-mekik-native-front-v13" viewBox="0 0 200 112" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Detaylı Mekik ön görünüş"><rect width="200" height="112" fill="#fff"/><g transform="translate(8 7) scale(.84)">'+projection+'</g></svg>';}catch(e){console.warn('Mekik v13 front projection',e);return ''}}
  function drawingSideSvg(d){try{if(typeof m2MekikSetProjection!=='function')return '';var projection=m2MekikSetProjection('side',d,0,0,200,112);return '<svg class="rafex-mekik-native-side-v13" viewBox="0 0 200 112" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Mekik yan görünüş"><rect width="200" height="112" fill="#fff"/><g transform="translate(8 7) scale(.84)">'+projection+'</g></svg>';}catch(e){return ''}}
  function callouts(d){var pallet=Math.max(600,Number(d?.palW)||1200),column=pallet+150,levels=Math.max(1,Math.min(15,Number(d?.levels)||1));var levelH=Math.max(380,Math.min(5000,Number(d?.levelH)||1580)),loadH=Math.max(300,Math.min(3000,Number(d?.palletHeight)||levelH-380));var first=Math.max(0,Math.min(5000,Number(d?.firstRailHeight)||430)),upright=first+(levels-1)*levelH+loadH/2;var side=Number(d?.sideClearance)||Number(d?.sideGap)||75;return '<div class="rafex-mekik-front-callouts-v13"><div class="top-stack"><span class="side-gap">YAN BOŞLUK · '+fmtN(side)+' + '+fmtN(side)+' mm</span><span class="column-gap">KOLON ARALIĞI · '+fmtN(column)+' mm</span><span class="pallet-chip">PALET · '+fmtN(pallet)+' mm</span></div><span class="upright-chip">AYAK UZUNLUĞU<b>'+fmtN(upright)+' mm</b></span></div>'}
  function ensureDetail(view,d,mode){if(!view)return;var detail=view.querySelector(':scope>.rafex-mekik-view-details');if(!detail){detail=document.createElement('div');detail.className='rafex-mekik-view-details';view.appendChild(detail)}if(mode==='front')detail.innerHTML='<span class="rafex-mekik-detail-line">'+fmtN(Number(d?.bays)||1)+' BÖLÜM · '+fmtN(Number(d?.levels)||1)+' KAT · PALET '+fmtN(Number(d?.palW)||1200)+' mm</span>';else {var gaps='';try{gaps=typeof m2PalletGapSummary==='function'?m2PalletGapSummary(d?.palletGaps||d?.plan?.gaps||[]):''}catch{}detail.innerHTML='<span class="rafex-mekik-detail-line">'+(gaps||('PALET DERİNLİK · '+fmtN(Number(d?.palD)||800)+' mm'))+'</span>';}}
  function repairHost(host){if(!host)return;var grid=host.querySelector('.m2-corporate-type-grid');if(!grid)return;var entries=usedMekik();entries.forEach(function(entry,index){var d=entry?.drawing||entry||{},name=nameOf(entry,index);var cards=Array.from(grid.querySelectorAll(':scope>.m2-corporate-type-card'));var card=cards.find(function(c){return String(c.dataset.rafexSystem||'').toLowerCase()==='mekik2'&&cardName(c)===name})||cards.find(function(c){return cardName(c)===name&&!c.querySelector('.rafex-report-3d-frame,.rafex-b2b-report-perspective')});if(!card)return;card.dataset.rafexSystem='mekik2';var views=Array.from(card.querySelectorAll(':scope>.m2-corporate-view'));if(views.length<2)return;var front=views[0],side=views[1],fsvg=drawingFrontSvg(d),ssvg=drawingSideSvg(d);if(fsvg){var h=front.querySelector(':scope>b')?.outerHTML||'<b>ÖNDEN GÖRÜNÜŞ</b>';front.innerHTML=h+fsvg+callouts(d);ensureDetail(front,d,'front')}if(ssvg){var h2=side.querySelector(':scope>b')?.outerHTML||'<b>YAN GÖRÜNÜŞ</b>';side.innerHTML=h2+ssvg;ensureDetail(side,d,'side')}})}
  function repair(){['m2CorporatePreview','m2CorporatePrint','m2CorporatePrintArea'].forEach(function(id){repairHost(document.getElementById(id))})}
  function schedule(){[0,40,100,220,500,900,1400,2000].forEach(function(ms){setTimeout(repair,ms)})}
  try{var prev=window.m2RenderCorporateReport;if(typeof prev==='function'&&!prev.__rafexMekikV13){var wrap=function(){var out=prev.apply(this,arguments);schedule();return out};wrap.__rafexMekikV13=true;try{m2RenderCorporateReport=wrap}catch{}window.m2RenderCorporateReport=wrap}}catch{}
  try{var prep=window.__rafexPrepareCorporatePrint;if(typeof prep==='function'&&!prep.__rafexMekikV13){var wrapPrep=async function(){var out=await prep.apply(this,arguments);repair();await new Promise(function(r){requestAnimationFrame(function(){repair();r()})});return out};wrapPrep.__rafexMekikV13=true;window.__rafexPrepareCorporatePrint=wrapPrep}}catch{}
  schedule();
})();</script>`;

const bodyEnd = html.lastIndexOf("</body>");
if (bodyEnd < 0) throw new Error("Mekik native front/details v13: body bulunamadi.");
html = html.slice(0, bodyEnd) + runtime + html.slice(bodyEnd);
const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.slice(0, match.index) + match[1] + match[2] + encoded + match[2] + worker.slice(match.index + match[0].length);
fs.writeFileSync(workerPath, worker);
console.log("FINAL v13: Mekik detayli native on gorunus geri geldi; yesil bilgi etiketleri ve esit on/yan slotlari restore edildi.");
