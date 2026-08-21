import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("PDF Excel layout v18: HTML_BASE64 bulunamadi");
let html = Buffer.from(match[3], "base64").toString("utf8");
html = html
  .replace(/<style\s+data-rafex-pdf-excel-layout="v18">[\s\S]*?<\/style>\s*/g, "")
  .replace(/<script\s+data-rafex-pdf-excel-layout="v18">[\s\S]*?<\/script>\s*/g, "");

const runtime = String.raw`<style data-rafex-pdf-excel-layout="v18">
/* Kitap2.xlsx yerlesimi: SOL %50 Mekik (on ust / yan alt), SAG %50 B2B tam boy. */
.m2-corporate-page.rafex-v18-excel-page .m2-corporate-type-grid.rafex-v18-excel-grid{
  position:absolute!important;
  inset:12.5% .65% 7%!important;
  display:grid!important;
  grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;
  grid-template-rows:minmax(0,1fr)!important;
  gap:8px!important;
  width:auto!important;height:auto!important;
  align-items:stretch!important;
  overflow:hidden!important;
}
.m2-corporate-page.rafex-v18-type-page-hidden{display:none!important}
.rafex-v18-excel-grid>.m2-corporate-type-card.rafex-v18-card{
  display:grid!important;
  grid-column:auto!important;grid-row:1!important;
  width:100%!important;height:100%!important;
  min-width:0!important;min-height:0!important;max-width:none!important;
  margin:0!important;overflow:hidden!important;box-sizing:border-box!important;
  align-self:stretch!important;justify-self:stretch!important;
  break-inside:avoid!important;page-break-inside:avoid!important;
}
.rafex-v18-excel-grid>.m2-corporate-type-card.rafex-v18-card>strong{
  grid-column:1!important;grid-row:1!important;
  display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:center!important;
  gap:8px!important;min-width:0!important;min-height:0!important;padding:3px 8px!important;
  border:0!important;border-bottom:1px solid #c6d2dc!important;
  background:#edf4f8!important;color:#0b2b45!important;
}
.rafex-v18-excel-grid>.m2-corporate-type-card.rafex-v18-card>strong span{font-size:11px!important;line-height:1!important}
.rafex-v18-excel-grid>.m2-corporate-type-card.rafex-v18-card>strong small{font-size:8px!important;line-height:1!important;margin:0!important;padding:0!important;border:0!important}

/* SOL: Mekik. Tek kartin icinde on gorunus ustte, yan gorunus altta. */
.rafex-v18-excel-grid>.m2-corporate-type-card.rafex-v18-mekik{
  grid-column:1!important;
  grid-template-columns:minmax(0,1fr)!important;
  grid-template-rows:28px minmax(0,1fr) minmax(0,1fr)!important;
}
.rafex-v18-excel-grid>.m2-corporate-type-card.rafex-v18-mekik>.m2-corporate-view{
  display:grid!important;grid-column:1!important;
  grid-template-rows:18px minmax(0,1fr)!important;
  width:100%!important;height:100%!important;min-width:0!important;min-height:0!important;
  overflow:hidden!important;border-left:0!important;background:#fff!important;
}
.rafex-v18-excel-grid>.m2-corporate-type-card.rafex-v18-mekik>.m2-corporate-view:nth-of-type(1){grid-row:2!important;border-bottom:1px solid #c6d2dc!important}
.rafex-v18-excel-grid>.m2-corporate-type-card.rafex-v18-mekik>.m2-corporate-view:nth-of-type(2){grid-row:3!important}
.rafex-v18-excel-grid>.m2-corporate-type-card.rafex-v18-mekik>.m2-corporate-view:nth-of-type(n+3){display:none!important}

/* SAG: B2B. Gercek/dolu front karti kolonun tamamini kullanir; bos kabuk gosterilmez. */
.rafex-v18-excel-grid>.m2-corporate-type-card.rafex-v18-b2b{
  grid-column:2!important;
  grid-template-columns:minmax(0,1fr)!important;
  grid-template-rows:28px minmax(0,1fr)!important;
}
.rafex-v18-excel-grid>.m2-corporate-type-card.rafex-v18-b2b>.m2-corporate-view{display:none!important}
.rafex-v18-excel-grid>.m2-corporate-type-card.rafex-v18-b2b>.m2-corporate-view.rafex-v18-b2b-view{
  display:grid!important;grid-column:1!important;grid-row:2!important;
  grid-template-rows:18px minmax(0,1fr)!important;
  width:100%!important;height:100%!important;min-width:0!important;min-height:0!important;
  overflow:hidden!important;border-left:0!important;background:#fff!important;place-items:stretch!important;
}
.rafex-v18-excel-grid>.m2-corporate-type-card.rafex-v18-b2b>.m2-corporate-view.rafex-v18-b2b-view>div,
.rafex-v18-excel-grid>.m2-corporate-type-card.rafex-v18-b2b>.m2-corporate-view.rafex-v18-b2b-view>section{
  width:100%!important;height:100%!important;min-width:0!important;min-height:0!important;
  overflow:hidden!important;display:grid!important;place-items:center!important;
}
.rafex-v18-excel-grid>.m2-corporate-type-card.rafex-v18-b2b svg,
.rafex-v18-excel-grid>.m2-corporate-type-card.rafex-v18-b2b canvas,
.rafex-v18-excel-grid>.m2-corporate-type-card.rafex-v18-b2b img{
  display:block!important;width:100%!important;height:100%!important;
  max-width:100%!important;max-height:100%!important;min-width:0!important;min-height:0!important;
  object-fit:contain!important;margin:auto!important;
}
@media print{
  .m2-corporate-page.rafex-v18-excel-page .m2-corporate-type-grid.rafex-v18-excel-grid{
    grid-template-columns:50% 50%!important;gap:0!important;
  }
  .m2-corporate-page.rafex-v18-type-page-hidden{display:none!important}
}
</style>
<script data-rafex-pdf-excel-layout="v18">(function(){
  if(window.__rafexPdfExcelLayoutV18)return;window.__rafexPdfExcelLayoutV18=true;
  function nm(card){return String(card?.dataset?.rafexTypeName||card?.querySelector(':scope>strong span')?.textContent||card?.querySelector(':scope>strong')?.textContent||'').replace(/\s+TİPİ$/i,'').trim()}
  function rawSys(card){return String(card?.dataset?.rafexSystem||'').toLowerCase()}
  function tx(card){return String(card?.innerText||card?.textContent||'').toUpperCase()}
  function isMekik(card){var s=rawSys(card);if(s==='mekik2')return true;return !!card.querySelector('.rafex-mekik-native-front-v13,.rafex-mekik-native-side-v13,[data-rafex-native-output^="mekik-"]')}
  function isB2B(card){var s=rawSys(card);if(s==='b2b')return true;var t=tx(card);return !!card.querySelector('.rafex-b2b-report-perspective,.rafex-report-3d-frame,[data-rafex-native-output^="b2b"]')||t.includes('3D İLE AYNI MODÜL')||t.includes('3D ILE AYNI MODUL')}
  function score(node){if(!node)return-1;var media=node.querySelectorAll('svg,canvas,img').length;var shapes=node.querySelectorAll('svg path,svg line,svg rect,svg polygon,svg polyline,svg circle,svg text').length;var nativeB2B=node.querySelectorAll('.rafex-b2b-report-perspective,.rafex-report-3d-frame,[data-rafex-native-output^="b2b"]').length;var marker=tx(node).includes('3D İLE AYNI MODÜL')||tx(node).includes('3D ILE AYNI MODUL')?1:0;return nativeB2B*100000000+marker*50000000+media*1000000+shapes*1000+String(node.innerHTML||'').length}
  function bestPerName(cards){var groups=new Map();cards.forEach(function(card,index){var key=(nm(card)||('__'+index)).toLocaleUpperCase('tr-TR');if(!groups.has(key))groups.set(key,[]);groups.get(key).push(card)});return Array.from(groups.values()).map(function(list){return list.slice().sort(function(a,b){return score(b)-score(a)})[0]})}
  function cleanGrid(grid){
    if(!grid)return;
    ['rafex-v14-two-halves','rafex-v15-excel-layout','rafex-v16-type-layout','rafex-v17-layout'].forEach(function(c){grid.classList.remove(c)});
    grid.classList.add('rafex-v18-excel-grid');
    ['display','grid-template-columns','grid-template-rows','grid-auto-rows','grid-auto-flow','width','height','gap','column-gap','row-gap'].forEach(function(p){grid.style.removeProperty(p)});
  }
  function cleanCard(card){
    if(!card)return;
    ['rafex-v16-hidden','rafex-v16-active','rafex-v16-new-page','rafex-v17-hidden','rafex-v17-active','rafex-v17-page-break','rafex-v18-mekik','rafex-v18-b2b'].forEach(function(c){card.classList.remove(c)});
    card.classList.add('rafex-v18-card');
    ['display','grid-column','grid-row','width','height','max-width','min-width','min-height','margin','align-self','justify-self'].forEach(function(p){card.style.removeProperty(p)});
    card.querySelectorAll(':scope>.m2-corporate-view').forEach(function(v){
      ['rafex-v16-best-view','rafex-v17-best-view','rafex-v18-b2b-view'].forEach(function(c){v.classList.remove(c)});
      ['display','grid-column','grid-row','width','height','min-width','min-height'].forEach(function(p){v.style.removeProperty(p)});
    });
  }
  function configureMekik(card){
    if(!card)return;cleanCard(card);card.dataset.rafexSystem='mekik2';card.classList.add('rafex-v18-mekik');
    var views=Array.from(card.querySelectorAll(':scope>.m2-corporate-view'));
    views.forEach(function(v,i){if(i<2)v.style.removeProperty('display');else v.style.setProperty('display','none','important')});
  }
  function configureB2B(card){
    if(!card)return;cleanCard(card);card.dataset.rafexSystem='b2b';card.classList.add('rafex-v18-b2b');
    var views=Array.from(card.querySelectorAll(':scope>.m2-corporate-view'));
    var best=views.slice().sort(function(a,b){return score(b)-score(a)})[0];
    views.forEach(function(v){if(v===best){v.classList.add('rafex-v18-b2b-view');v.style.removeProperty('display')}else v.style.setProperty('display','none','important')});
  }
  function ensurePageShell(typePages,index){
    if(typePages[index])return typePages[index];
    var base=typePages[0];if(!base)return null;
    var page=base.cloneNode(true);
    page.querySelectorAll('.m2-corporate-type-card').forEach(function(c){c.remove()});
    var grid=page.querySelector('.m2-corporate-type-grid');if(grid)grid.innerHTML='';
    base.parentElement?.insertBefore(page,base.nextSibling);
    typePages.push(page);return page;
  }
  function repairHost(host){
    if(!host)return;
    var typePages=Array.from(host.querySelectorAll('.m2-corporate-page')).filter(function(p){return p.querySelector('.m2-corporate-type-card')});
    if(!typePages.length)return;
    var cards=typePages.flatMap(function(p){return Array.from(p.querySelectorAll('.m2-corporate-type-card'))});
    if(!cards.length)return;

    var mekik=bestPerName(cards.filter(isMekik));
    var b2b=bestPerName(cards.filter(function(c){return !isMekik(c)&&isB2B(c)}));
    if(!b2b.length){
      /* v14 bos kabuklari B2B etiketi tasiyabilir; gercek kart marker'i kaybolduysa en dolu non-Mekik kartlari geri al. */
      b2b=bestPerName(cards.filter(function(c){return !isMekik(c)&&rawSys(c)==='b2b'}));
    }
    var pairs=Math.max(mekik.length,b2b.length);
    if(!pairs)return;

    typePages.forEach(function(page){page.classList.remove('rafex-v18-excel-page','rafex-v18-type-page-hidden');var g=page.querySelector('.m2-corporate-type-grid');if(g){g.classList.remove('rafex-v18-excel-grid');cleanGrid(g)}});

    for(var i=0;i<pairs;i++){
      var page=ensurePageShell(typePages,i);if(!page)continue;
      page.classList.add('rafex-v18-excel-page');page.classList.remove('rafex-v18-type-page-hidden');
      var grid=page.querySelector('.m2-corporate-type-grid');
      if(!grid){grid=document.createElement('div');grid.className='m2-corporate-type-grid';var note=page.querySelector('.m2-corporate-cut-note');if(note)page.insertBefore(grid,note);else page.appendChild(grid)}
      cleanGrid(grid);
      grid.replaceChildren();
      if(mekik[i]){configureMekik(mekik[i]);grid.appendChild(mekik[i])}
      if(b2b[i]){configureB2B(b2b[i]);grid.appendChild(b2b[i])}
    }
    typePages.slice(pairs).forEach(function(page){page.classList.add('rafex-v18-type-page-hidden')});
  }
  function repair(){['m2CorporatePreview','m2CorporatePrint','m2CorporatePrintArea'].forEach(function(id){repairHost(document.getElementById(id))})}
  function schedule(){[0,30,90,180,360,720,1250,1750,2150,2600].forEach(function(ms){setTimeout(repair,ms)})}
  try{var prev=window.m2RenderCorporateReport;if(typeof prev==='function'&&!prev.__rafexV18){var w=function(){var out=prev.apply(this,arguments);schedule();return out};w.__rafexV18=true;try{m2RenderCorporateReport=w}catch{}window.m2RenderCorporateReport=w}}catch{}
  try{var prep=window.__rafexPrepareCorporatePrint;if(typeof prep==='function'&&!prep.__rafexV18){var wp=async function(){var out=await prep.apply(this,arguments);repair();await new Promise(function(r){requestAnimationFrame(function(){repair();r()})});return out};wp.__rafexV18=true;window.__rafexPrepareCorporatePrint=wp}}catch{}
  schedule();
})();</script>`;

const bodyEnd = html.lastIndexOf("</body>");
if (bodyEnd < 0) throw new Error("PDF Excel layout v18: body bulunamadi");
html = html.slice(0, bodyEnd) + runtime + html.slice(bodyEnd);
const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.slice(0, match.index) + match[1] + match[2] + encoded + match[2] + worker.slice(match.index + match[0].length);
fs.writeFileSync(workerPath, worker);
console.log("FINAL v18: Kitap2 Excel duzeni kilitlendi; Mekik sol on/yan, gercek dolu B2B karti sag tam boy ve ayni sayfada.");
