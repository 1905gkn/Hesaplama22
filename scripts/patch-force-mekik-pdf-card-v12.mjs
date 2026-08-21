import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("Force Mekik PDF v12: HTML_BASE64 bulunamadi.");

let html = Buffer.from(match[3], "base64").toString("utf8");
html = html
  .replace(/<style\s+data-rafex-force-mekik-pdf="v12">[\s\S]*?<\/style>\s*/g, "")
  .replace(/<script\s+data-rafex-force-mekik-pdf="v12">[\s\S]*?<\/script>\s*/g, "");

const runtime = String.raw`<style data-rafex-force-mekik-pdf="v12">
.m2-corporate-type-card[data-rafex-system="mekik2"].rafex-force-mekik-v12{
  display:grid!important;grid-template-columns:minmax(0,1fr)!important;
  grid-template-rows:28px minmax(0,1fr) minmax(0,1fr)!important;
  width:100%!important;height:100%!important;min-width:0!important;min-height:0!important;
  overflow:hidden!important;box-sizing:border-box!important
}
.m2-corporate-type-card[data-rafex-system="mekik2"].rafex-force-mekik-v12>strong{
  grid-column:1!important;grid-row:1!important;display:flex!important;align-items:center!important;
  justify-content:center!important;height:28px!important;min-height:28px!important;padding:3px 8px!important;
  box-sizing:border-box!important;border-bottom:1px solid #c6d2dc!important
}
.m2-corporate-type-card[data-rafex-system="mekik2"].rafex-force-mekik-v12>.m2-corporate-view{
  grid-column:1!important;display:grid!important;grid-template-rows:20px minmax(0,1fr)!important;
  width:100%!important;height:100%!important;min-width:0!important;min-height:0!important;
  overflow:hidden!important;box-sizing:border-box!important
}
.m2-corporate-type-card[data-rafex-system="mekik2"].rafex-force-mekik-v12>.m2-corporate-view:nth-of-type(1){grid-row:2!important;border-bottom:1px solid #c6d2dc!important}
.m2-corporate-type-card[data-rafex-system="mekik2"].rafex-force-mekik-v12>.m2-corporate-view:nth-of-type(2){grid-row:3!important}
.m2-corporate-type-card[data-rafex-system="mekik2"].rafex-force-mekik-v12>.m2-corporate-view>b{grid-row:1!important;display:grid!important;place-items:center!important;margin:0!important}
.m2-corporate-type-card[data-rafex-system="mekik2"].rafex-force-mekik-v12>.m2-corporate-view>svg{
  grid-row:2!important;display:block!important;position:static!important;width:100%!important;height:100%!important;
  max-width:100%!important;max-height:100%!important;min-width:0!important;min-height:0!important;
  margin:0!important;transform:none!important;overflow:hidden!important
}
</style>
<script data-rafex-force-mekik-pdf="v12">(function(){
  if(window.__rafexForceMekikPdfV12)return;window.__rafexForceMekikPdfV12=true;
  function systemOf(entry){var d=entry?.drawing||entry||{},x=String(entry?.rafexSystem||entry?.__rafexSystem||d?.rafexSystem||'').toLowerCase();if(x==='b2b'||x==='mekik2')return x;return d?.b2bLayout||d?.b2b?'b2b':'mekik2';}
  function used(){try{return typeof m2CorporateUsedTypes==='function'?(m2CorporateUsedTypes()||[]):[]}catch{return[]}}
  function nameOf(entry,index){return String(entry?.name||entry?.typeName||('TİP '+(index+1))).trim();}
  function cardName(card){return String(card?.dataset?.rafexTypeName||card?.querySelector(':scope>strong span')?.textContent||card?.querySelector(':scope>strong')?.textContent||'').replace(/\s+TİPİ$/i,'').trim();}
  function makeView(label,svg,kind){var view=document.createElement('div');view.className='m2-corporate-view';view.dataset.rafexNativeOutput=kind;var b=document.createElement('b');b.textContent=label;view.appendChild(b);if(svg){var wrap=document.createElement('div');wrap.innerHTML=svg.trim();var node=wrap.firstElementChild;if(node)view.appendChild(node);}return view;}
  function renderSvg(d,mode){try{return typeof m2ReportElevationSvg==='function'?m2ReportElevationSvg(d,mode):''}catch{return''}}
  function ensureHost(host){
    if(!host)return;var grid=host.querySelector('.m2-corporate-type-grid');if(!grid)return;
    var mekik=used().filter(function(e){return systemOf(e)==='mekik2';});
    mekik.forEach(function(entry,index){var name=nameOf(entry,index),d=entry?.drawing||entry||{};
      var cards=Array.from(grid.querySelectorAll(':scope>.m2-corporate-type-card'));
      var card=cards.find(function(c){return String(c.dataset.rafexSystem||'').toLowerCase()==='mekik2'&&cardName(c)===name;});
      if(!card){
        card=document.createElement('article');card.className='m2-corporate-type-card rafex-force-mekik-v12';card.dataset.rafexSystem='mekik2';card.dataset.rafexTypeName=name;
        var title=document.createElement('strong');var span=document.createElement('span');span.textContent=name;title.appendChild(span);card.appendChild(title);
        card.appendChild(makeView('ÖNDEN GÖRÜNÜŞ',renderSvg(d,'front'),'mekik-front'));
        card.appendChild(makeView('YAN GÖRÜNÜŞ',renderSvg(d,'side'),'mekik-side'));
        grid.appendChild(card);
      }else{
        card.dataset.rafexSystem='mekik2';card.classList.add('rafex-force-mekik-v12');
        var views=Array.from(card.querySelectorAll(':scope>.m2-corporate-view'));
        while(views.length<2){var mode=views.length===0?'front':'side';var v=makeView(mode==='front'?'ÖNDEN GÖRÜNÜŞ':'YAN GÖRÜNÜŞ',renderSvg(d,mode),'mekik-'+mode);card.appendChild(v);views.push(v);}
        var front=renderSvg(d,'front'),side=renderSvg(d,'side');
        if(front){var h=views[0].querySelector(':scope>b')?.outerHTML||'<b>ÖNDEN GÖRÜNÜŞ</b>';views[0].innerHTML=h+front;views[0].dataset.rafexNativeOutput='mekik-front';}
        if(side){var h2=views[1].querySelector(':scope>b')?.outerHTML||'<b>YAN GÖRÜNÜŞ</b>';views[1].innerHTML=h2+side;views[1].dataset.rafexNativeOutput='mekik-side';}
      }
    });
  }
  function repair(){['m2CorporatePreview','m2CorporatePrint','m2CorporatePrintArea'].forEach(function(id){ensureHost(document.getElementById(id));});}
  function schedule(){[0,30,90,180,360,700,1200,1800].forEach(function(ms){setTimeout(repair,ms);});}
  try{var prev=window.m2RenderCorporateReport;if(typeof prev==='function'&&!prev.__rafexForceMekikV12){var wrap=function(){var out=prev.apply(this,arguments);schedule();return out};wrap.__rafexForceMekikV12=true;try{m2RenderCorporateReport=wrap}catch{}window.m2RenderCorporateReport=wrap;}}catch{}
  try{var prep=window.__rafexPrepareCorporatePrint;if(typeof prep==='function'&&!prep.__rafexForceMekikV12){var wrapPrep=async function(){var out=await prep.apply(this,arguments);repair();await new Promise(function(r){requestAnimationFrame(function(){repair();r();});});return out};wrapPrep.__rafexForceMekikV12=true;window.__rafexPrepareCorporatePrint=wrapPrep;}}catch{}
  document.addEventListener('click',function(e){var el=e.target instanceof Element?e.target:null;if(el?.closest?.('[data-rafex-corporate-print],#m2PrintCorporateReport,#m2CorporatePrintButton'))schedule();},true);
  schedule();
})();</script>`;

const bodyEnd = html.lastIndexOf("</body>");
if (bodyEnd < 0) throw new Error("Force Mekik PDF v12: body bulunamadi.");
html = html.slice(0, bodyEnd) + runtime + html.slice(bodyEnd);

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.slice(0, match.index) + match[1] + match[2] + encoded + match[2] + worker.slice(match.index + match[0].length);
fs.writeFileSync(workerPath, worker);
console.log("FINAL v12: eksik Mekik PDF kartlari zorunlu olusturuldu; on/yan ust-alt yarim sayfaya kilitlendi.");
