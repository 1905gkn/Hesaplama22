import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const workerPath = path.join(root, "dist/server/index.js");
const marker = 'data-rafex-mekik-output-halves="v1"';

let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("Mekik output halves: HTML_BASE64 bulunamadi.");

let html = Buffer.from(match[3], "base64").toString("utf8");
if (!html.includes('data-rafex-native-system-pdf-router="v1"')) {
  throw new Error("Mekik output halves: native PDF router bulunamadi.");
}
if (!html.includes('data-rafex-unified-section-positioner="v1"')) {
  throw new Error("Mekik output halves: Kesit Yer Belirleme katmani bulunamadi.");
}

html = html.replace(/<style\s+data-rafex-mekik-output-halves="v1">[\s\S]*?<\/style>\s*<script\s+data-rafex-mekik-output-halves="v1">[\s\S]*?<\/script>/g, "");

const runtime = String.raw`<style data-rafex-mekik-output-halves="v1">
/* Mekik Kesit Yer Belirleme listesine / calisma alanina girmez. */
#m2SectionPlacementModal .rafex-mekik-section-divider,
#m2SectionPlacementModal .rafex-mekik-section-entry,
#m2SectionPlacementModal [data-rafex-mekik-workspace]{display:none!important}

/* Yalniz PDF/kurumsal cikti icin: Mekik karti 50/50 iki bolumdur.
   Her gorusun kendi bilgi alani, kendi ciziminin hemen altindadir. */
.m2-corporate-type-card[data-rafex-system="mekik2"]{
  display:grid!important;
  grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;
  grid-template-rows:30px minmax(0,1fr)!important;
}
.m2-corporate-type-card[data-rafex-system="mekik2"]>strong{
  grid-column:1/-1!important;
  grid-row:1!important;
  min-width:0!important;
  padding:4px 46px 4px 10px!important;
  display:flex!important;
  flex-direction:row!important;
  align-items:center!important;
  justify-content:center!important;
  gap:10px!important;
  border-bottom:1px solid #c6d2dc!important;
  text-align:center!important;
}
.m2-corporate-type-card[data-rafex-system="mekik2"]>strong small,
.m2-corporate-type-card[data-rafex-system="mekik2"]>strong small.m2-corporate-unit-count{
  margin:0!important;
  padding:0!important;
  border:0!important;
}
.m2-corporate-type-card[data-rafex-system="mekik2"]>.m2-corporate-view{
  min-width:0!important;
  min-height:0!important;
  grid-row:2!important;
  overflow:hidden!important;
  border-left:0!important;
  display:grid!important;
  grid-template-rows:22px minmax(0,68%) auto minmax(0,1fr)!important;
  align-content:stretch!important;
  background:#fff!important;
}
.m2-corporate-type-card[data-rafex-system="mekik2"]>.m2-corporate-view[data-rafex-native-output="mekik-front"]{
  grid-column:1!important;
  border-right:1px solid #c6d2dc!important;
}
.m2-corporate-type-card[data-rafex-system="mekik2"]>.m2-corporate-view[data-rafex-native-output="mekik-side"]{
  grid-column:2!important;
  border-right:0!important;
}
.m2-corporate-type-card[data-rafex-system="mekik2"]>.m2-corporate-view>b{
  grid-row:1!important;
  min-width:0!important;
  display:grid!important;
  place-items:center!important;
}
.m2-corporate-type-card[data-rafex-system="mekik2"]>.m2-corporate-view>svg[data-rafex-native-positioned="1"]{
  grid-row:2!important;
  align-self:stretch!important;
  justify-self:stretch!important;
  width:100%!important;
  height:100%!important;
  min-width:0!important;
  min-height:0!important;
  overflow:visible!important;
}
.m2-corporate-type-card[data-rafex-system="mekik2"] .rafex-mekik-view-details{
  grid-row:3!important;
  min-width:0!important;
  min-height:36px!important;
  margin:8px 38px 0!important;
  padding:7px 12px!important;
  box-sizing:border-box!important;
  border-radius:4px!important;
  background:#123f2f!important;
  color:#fff!important;
  display:flex!important;
  flex-direction:column!important;
  align-items:center!important;
  justify-content:center!important;
  gap:2px!important;
  text-align:center!important;
  font:800 8px/1.28 Arial,sans-serif!important;
  letter-spacing:.01em!important;
  overflow:hidden!important;
}
.m2-corporate-type-card[data-rafex-system="mekik2"] .rafex-mekik-view-details:empty{
  visibility:hidden!important;
}
.m2-corporate-type-card[data-rafex-system="mekik2"] .rafex-mekik-detail-line{
  display:block!important;
  width:100%!important;
  white-space:normal!important;
}
.m2-corporate-type-card[data-rafex-system="mekik2"] .rafex-mekik-extra-details:empty{
  display:none!important;
}
.m2-corporate-type-card[data-rafex-system="mekik2"]>.rafex-native-system-chip{
  top:7px!important;
  right:7px!important;
}
</style>
<script data-rafex-mekik-output-halves="v1">(function(){
  if(window.__rafexMekikOutputHalvesV2)return;
  window.__rafexMekikOutputHalvesV2=true;

  var balanceTimer=0;
  var modalTimer=0;

  function qsa(root,selector){try{return Array.from((root||document).querySelectorAll(selector));}catch{return[];}}
  function normalized(value){
    return String(value||'').replace(/\s+/g,' ').trim().toLocaleUpperCase('tr-TR');
  }

  function cleanSectionPlacement(){
    var modal=document.getElementById('m2SectionPlacementModal');
    if(!modal)return;
    qsa(modal,'.rafex-mekik-section-divider,.rafex-mekik-section-entry').forEach(function(node){node.remove();});
    qsa(modal,'[data-rafex-mekik-workspace]').forEach(function(node){node.hidden=true;node.style.setProperty('display','none','important');});
  }

  function scheduleSectionClean(delay){
    clearTimeout(modalTimer);
    modalTimer=setTimeout(cleanSectionPlacement,delay||0);
  }

  function resetSvgForNativeHalf(svg){
    if(!svg)return;
    svg.dataset.rafexNativePositioned='1';
    svg.style.setProperty('position','relative','important');
    svg.style.setProperty('left','auto','important');
    svg.style.setProperty('top','auto','important');
    svg.style.setProperty('width','100%','important');
    svg.style.setProperty('height','100%','important');
    svg.style.setProperty('max-width','none','important');
    svg.style.setProperty('object-fit','contain','important');
    svg.style.setProperty('transform','none','important');
    svg.style.setProperty('transform-origin','50% 50%','important');
    svg.style.setProperty('transform-box','fill-box','important');
  }

  function footerSignature(kind,text){
    var value=normalized(text);
    if(!value)return false;
    if(kind==='front')return value.includes('BÖLÜMDEN OLUŞUR')||value.includes('BOLUMDEN OLUSUR');
    return value.includes('GERÇEK PROJE')||value.includes('GERCEK PROJE')||value.includes('PALET DERİNLİK')||value.includes('PALET DERINLIK');
  }

  function hideFooterGraphic(textNode,svg){
    if(!textNode||!svg)return;
    var node=textNode;
    for(var depth=0;depth<4&&node&&node!==svg;depth++,node=node.parentElement){
      if(node.tagName&&String(node.tagName).toLowerCase()==='g'){
        var value=normalized(node.textContent);
        var hasFooter=value.includes('BÖLÜMDEN OLUŞUR')||value.includes('BOLUMDEN OLUSUR')||value.includes('GERÇEK PROJE')||value.includes('GERCEK PROJE')||value.includes('PALET DERİNLİK')||value.includes('PALET DERINLIK');
        if(hasFooter&&node.querySelector('rect')){
          node.dataset.rafexMekikFooterGraphic='1';
          node.style.setProperty('display','none','important');
          return;
        }
      }
    }
    textNode.dataset.rafexMekikFooterGraphic='1';
    textNode.style.setProperty('display','none','important');
  }

  function collectFooterLines(svg,kind){
    if(!svg)return[];
    var lines=[];
    qsa(svg,'text').forEach(function(text){
      var raw=String(text.textContent||'').replace(/\s+/g,' ').trim();
      if(!footerSignature(kind,raw))return;
      if(!lines.some(function(line){return normalized(line)===normalized(raw);})){lines.push(raw);}
      hideFooterGraphic(text,svg);
    });
    return lines;
  }

  function ensureDetails(view,svg,kind){
    if(!view||!svg)return;
    var details=view.querySelector(':scope > .rafex-mekik-view-details');
    if(!details){
      details=document.createElement('div');
      details.className='rafex-mekik-view-details';
      details.dataset.rafexMekikView=kind;
      view.appendChild(details);
    }
    var lines=collectFooterLines(svg,kind);
    var previous=qsa(details,':scope > .rafex-mekik-detail-line').map(function(node){return node.textContent||'';});
    if(!lines.length&&previous.length)return;
    details.replaceChildren();
    lines.forEach(function(line){
      var row=document.createElement('span');
      row.className='rafex-mekik-detail-line';
      row.textContent=line;
      details.appendChild(row);
    });
    var extra=document.createElement('div');
    extra.className='rafex-mekik-extra-details';
    extra.dataset.rafexMekikExtraDetails=kind;
    details.appendChild(extra);
  }

  function metrics(view,svg){
    if(!view||!svg)return null;
    var rect=svg.getBoundingClientRect();
    var vb=svg.viewBox&&svg.viewBox.baseVal;
    var box=null;
    try{box=svg.getBBox();}catch{}
    if(!vb||!box||!rect.width||!rect.height||!vb.width||!vb.height||!box.width||!box.height)return null;
    var base=Math.min(rect.width/vb.width,rect.height/vb.height);
    if(!Number.isFinite(base)||base<=0)return null;
    var maxPxPerUnit=Math.min((rect.width*.90)/box.width,(rect.height*.86)/box.height);
    if(!Number.isFinite(maxPxPerUnit)||maxPxPerUnit<=0)return null;
    return{svg:svg,base:base,max:maxPxPerUnit};
  }

  function setScale(item,target){
    if(!item)return;
    var factor=target/item.base;
    if(!Number.isFinite(factor)||factor<=0)factor=1;
    factor=Math.max(.35,Math.min(3.75,factor));
    item.svg.style.setProperty('transform','scale('+factor+')','important');
  }

  function applyViewScale(frontView,frontSvg,sideView,sideSvg){
    resetSvgForNativeHalf(frontSvg);
    resetSvgForNativeHalf(sideSvg);
    requestAnimationFrame(function(){
      var front=metrics(frontView,frontSvg),side=metrics(sideView,sideSvg);
      if(!front||!side)return;
      /* Onceki ortak olcek referans olarak korunur. Yan gorunus bu olcekte kalir;
         On gorunus %30 buyutulur, ancak kendi yarim sayfasina sigabilecegi maksimum
         olcegi asamaz. Boylece +%30 istekli ama tasmasiz bir fit-scale elde edilir. */
      var common=Math.min(front.max,side.max);
      var sideTarget=Math.min(side.max,common);
      var frontTarget=Math.min(front.max,common*1.30);
      setScale(side,sideTarget);
      setScale(front,frontTarget);
      frontSvg.dataset.rafexMekikScaleBoost='1.30';
    });
  }

  function balanceCard(card){
    if(!card||card.dataset.rafexSystem!=='mekik2')return;
    card.classList.remove('rafex-mekik-section-output-card');
    qsa(card,':scope > .rafex-mekik-sections-grid').forEach(function(node){node.remove();});
    var views=qsa(card,':scope > .m2-corporate-view');
    if(views.length<2)return;
    var front=views[0],side=views[1];
    front.dataset.rafexNativeOutput='mekik-front';
    side.dataset.rafexNativeOutput='mekik-side';
    [front,side].forEach(function(view){
      view.removeAttribute('data-rafex-perspective-hidden');
      view.removeAttribute('data-rafex-mekik-hidden');
      view.style.removeProperty('display');
    });
    var frontSvg=front.querySelector(':scope > svg')||front.querySelector('svg');
    var sideSvg=side.querySelector(':scope > svg')||side.querySelector('svg');
    if(frontSvg&&sideSvg){
      ensureDetails(front,frontSvg,'front');
      ensureDetails(side,sideSvg,'side');
      applyViewScale(front,frontSvg,side,sideSvg);
    }
  }

  function balanceAll(){
    cleanSectionPlacement();
    ['m2CorporatePreview','m2CorporatePrint','m2CorporatePrintArea'].forEach(function(id){
      var host=document.getElementById(id);if(!host)return;
      qsa(host,'.m2-corporate-type-card[data-rafex-system="mekik2"]').forEach(balanceCard);
    });
  }

  function scheduleBalance(delay){
    clearTimeout(balanceTimer);
    balanceTimer=setTimeout(balanceAll,delay||0);
  }

  function hookReport(){
    try{
      var original=window.m2RenderCorporateReport||m2RenderCorporateReport;
      if(typeof original==='function'&&!original.__rafexMekikHalfWrapped){
        var wrapped=function(){
          var result=original.apply(this,arguments);
          [0,120,860,1260,1620].forEach(function(delay){setTimeout(balanceAll,delay);});
          return result;
        };
        wrapped.__rafexMekikHalfWrapped=true;
        try{m2RenderCorporateReport=wrapped;}catch{}
        window.m2RenderCorporateReport=wrapped;
      }
    }catch(error){console.warn('Mekik PDF rapor kancasi kurulamadi',error);}

    try{
      var originalPrepare=window.__rafexPrepareCorporatePrint;
      if(typeof originalPrepare==='function'&&!originalPrepare.__rafexMekikHalfWrapped){
        var wrappedPrepare=async function(){
          var result=await originalPrepare.apply(this,arguments);
          balanceAll();
          await new Promise(function(resolve){requestAnimationFrame(function(){balanceAll();resolve();});});
          return result;
        };
        wrappedPrepare.__rafexMekikHalfWrapped=true;
        window.__rafexPrepareCorporatePrint=wrappedPrepare;
      }
    }catch(error){console.warn('Mekik PDF yazdirma kancasi kurulamadi',error);}
  }

  function observe(){
    var modal=document.getElementById('m2SectionPlacementModal');
    if(modal&&!modal.__rafexNoMekikObserver){
      modal.__rafexNoMekikObserver=true;
      new MutationObserver(function(){scheduleSectionClean(0);}).observe(modal,{childList:true,subtree:true});
    }
    ['m2CorporatePreview','m2CorporatePrint','m2CorporatePrintArea'].forEach(function(id){
      var host=document.getElementById(id);
      if(host&&!host.__rafexMekikHalfObserver){
        host.__rafexMekikHalfObserver=true;
        new MutationObserver(function(){scheduleBalance(70);}).observe(host,{childList:true,subtree:true});
      }
    });
  }

  document.addEventListener('click',function(event){
    if(event.target&&event.target.closest&&event.target.closest('#m2SectionPlacementButton')){
      [0,80,220,520].forEach(function(delay){setTimeout(cleanSectionPlacement,delay);});
    }
  },true);

  function boot(){
    hookReport();observe();cleanSectionPlacement();
    [120,600,1000,1600].forEach(function(delay){setTimeout(balanceAll,delay);});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();</script>`;

const closing = html.lastIndexOf("</body>");
if (closing < 0) throw new Error("Mekik output halves: </body> bulunamadi.");
html = html.slice(0, closing) + runtime + "\n" + html.slice(closing);

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.replace(match[0], `${match[1]}${match[2]}${encoded}${match[2]}`);
fs.writeFileSync(workerPath, worker);

const finalHtml = Buffer.from(encoded, "base64").toString("utf8");
for (const required of [marker, 'rafex-mekik-view-details', 'rafex-mekik-extra-details', 'frontTarget=Math.min(front.max,common*1.30)', 'grid-template-columns:minmax(0,1fr) minmax(0,1fr)']) {
  if (!finalHtml.includes(required)) throw new Error(`Mekik output halves dogrulama hatasi: ${required}`);
}
console.log("FINAL: Mekik PDF bilgi bantlari kendi goruslerinin altina alindi; On gorunus +%30 fit-scale uygulandi (v2). Kesit Yer Belirleme'de Mekik kapali.");
