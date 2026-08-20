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
/* Mekik artik Kesit Yer Belirleme listesine / calisma alanina girmez. */
#m2SectionPlacementModal .rafex-mekik-section-divider,
#m2SectionPlacementModal .rafex-mekik-section-entry,
#m2SectionPlacementModal [data-rafex-mekik-workspace]{display:none!important}

/* Yalniz PDF/kurumsal cikti icin: Mekik kartinin basligi tam genislik,
   altindaki On ve Yan gorunusler tam ortadan 50/50 bolunur. */
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
  grid-template-rows:22px minmax(0,1fr)!important;
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
  min-width:0!important;
  display:grid!important;
  place-items:center!important;
}
.m2-corporate-type-card[data-rafex-system="mekik2"]>.m2-corporate-view>svg[data-rafex-native-positioned="1"]{
  align-self:stretch!important;
  justify-self:stretch!important;
  overflow:visible!important;
}
.m2-corporate-type-card[data-rafex-system="mekik2"]>.rafex-native-system-chip{
  top:7px!important;
  right:7px!important;
}
</style>
<script data-rafex-mekik-output-halves="v1">(function(){
  if(window.__rafexMekikOutputHalvesV1)return;
  window.__rafexMekikOutputHalvesV1=true;

  var balanceTimer=0;
  var modalTimer=0;

  function qsa(root,selector){try{return Array.from((root||document).querySelectorAll(selector));}catch{return[];}}

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

  function metrics(view,svg){
    if(!view||!svg)return null;
    var rect=svg.getBoundingClientRect();
    var vb=svg.viewBox&&svg.viewBox.baseVal;
    var box=null;
    try{box=svg.getBBox();}catch{}
    if(!vb||!box||!rect.width||!rect.height||!vb.width||!vb.height||!box.width||!box.height)return null;
    var base=Math.min(rect.width/vb.width,rect.height/vb.height);
    if(!Number.isFinite(base)||base<=0)return null;
    var maxPxPerUnit=Math.min((rect.width*.90)/box.width,(rect.height*.84)/box.height);
    if(!Number.isFinite(maxPxPerUnit)||maxPxPerUnit<=0)return null;
    return{svg:svg,base:base,max:maxPxPerUnit};
  }

  function applyCommonScale(frontView,frontSvg,sideView,sideSvg){
    resetSvgForNativeHalf(frontSvg);
    resetSvgForNativeHalf(sideSvg);
    requestAnimationFrame(function(){
      var a=metrics(frontView,frontSvg),b=metrics(sideView,sideSvg);
      if(!a||!b)return;
      /* Her iki cizimde de ayni SVG user-unit -> piksel orani kullanilir.
         Boylece sadece kutular 50/50 degil, On ve Yan kesit de ayni olcekte olur. */
      var common=Math.min(a.max,b.max);
      [a,b].forEach(function(item){
        var factor=common/item.base;
        if(!Number.isFinite(factor)||factor<=0)factor=1;
        factor=Math.max(.35,Math.min(3.25,factor));
        item.svg.style.setProperty('transform','scale('+factor+')','important');
      });
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
    if(frontSvg&&sideSvg)applyCommonScale(front,frontSvg,side,sideSvg);
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
    }catch(error){console.warn('Mekik 50/50 rapor kancasi kurulamadi',error);}

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
    }catch(error){console.warn('Mekik 50/50 yazdirma kancasi kurulamadi',error);}
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
for (const required of [marker, 'grid-template-columns:minmax(0,1fr) minmax(0,1fr)', 'rafex-mekik-section-entry', 'applyCommonScale']) {
  if (!finalHtml.includes(required)) throw new Error(`Mekik output halves dogrulama hatasi: ${required}`);
}
console.log("FINAL: Mekik Kesit Yer Belirleme'den kaldirildi; PDF On/Yan 50/50 ve ortak olcege getirildi (v1).");
