import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("Final PDF halves/extension v11: HTML_BASE64 bulunamadi.");

let html = Buffer.from(match[3], "base64").toString("utf8");
html = html
  .replace(/<style\s+data-rafex-final-pdf-halves-extension="v11">[\s\S]*?<\/style>\s*/g, "")
  .replace(/<script\s+data-rafex-final-pdf-halves-extension="v11">[\s\S]*?<\/script>\s*/g, "");

const runtime = String.raw`<style data-rafex-final-pdf-halves-extension="v11">
/* SERBEST CIZIM: Uzatma Mesafesi alani her sistemde ayni yerde gorunur. */
#page.rafex-free-drawing-page #m2AutoFillControls{
  display:flex!important;
  visibility:visible!important;
  opacity:1!important;
}
#page.rafex-free-drawing-page[data-rafex-free-context-system="mekik2"] #m2AutoFillControls{
  display:flex!important;
  visibility:visible!important;
  opacity:.58!important;
  filter:grayscale(.35)!important;
}
#page.rafex-free-drawing-page[data-rafex-free-context-system="mekik2"] #m2AutoFillControls input,
#page.rafex-free-drawing-page[data-rafex-free-context-system="mekik2"] #m2AutoFillControls button{
  cursor:not-allowed!important;
}

/* PDF: her sayfada iki esit dikey slot. Bir kart = sayfanin tam yarisi. */
#m2CorporatePreview .m2-corporate-type-grid,
#m2CorporatePrint .m2-corporate-type-grid,
#m2CorporatePrintArea .m2-corporate-type-grid,
.m2-corporate-page .m2-corporate-type-grid{
  display:grid!important;
  grid-template-columns:repeat(2,minmax(0,1fr))!important;
  grid-template-rows:minmax(0,1fr)!important;
  grid-auto-flow:row!important;
  grid-auto-rows:minmax(0,1fr)!important;
  column-gap:8px!important;
  row-gap:0!important;
  align-items:stretch!important;
  overflow:visible!important;
}
.m2-corporate-type-grid>.m2-corporate-type-card{
  width:100%!important;
  max-width:none!important;
  height:100%!important;
  min-width:0!important;
  min-height:0!important;
  overflow:hidden!important;
  break-inside:avoid!important;
  page-break-inside:avoid!important;
}
/* 3.,5.,7... kart yeni basili sayfadan baslar: bir sayfada en fazla 2 kart. */
@media print{
  .m2-corporate-type-grid>.m2-corporate-type-card:nth-child(2n+3){
    break-before:page!important;
    page-break-before:always!important;
  }
}

/* B2B: tek dikey modul, kendisine ayrilan yarim sayfanin tamamini kullanir. */
.m2-corporate-type-card[data-rafex-system="b2b"]{
  grid-column:auto!important;
  align-self:stretch!important;
  justify-self:stretch!important;
}

/* MEKIK: ayni yarim sayfa icinde ON ustte / YAN altta; iki gorus tam esit alan. */
.m2-corporate-type-card[data-rafex-system="mekik2"],
.m2-corporate-type-card[data-rafex-system="mekik2"].rafex-mekik-slot-v7,
.m2-corporate-type-card[data-rafex-system="mekik2"].rafex-pdf-half-mekik-v10{
  display:grid!important;
  grid-template-columns:minmax(0,1fr)!important;
  grid-template-rows:28px minmax(0,1fr) minmax(0,1fr)!important;
  gap:0!important;
  height:100%!important;
  min-height:0!important;
  overflow:hidden!important;
}
.m2-corporate-type-card[data-rafex-system="mekik2"]>strong,
.m2-corporate-type-card[data-rafex-system="mekik2"].rafex-mekik-slot-v7>strong{
  grid-column:1!important;
  grid-row:1!important;
  height:28px!important;
  min-height:28px!important;
  box-sizing:border-box!important;
  display:flex!important;
  flex-direction:row!important;
  align-items:center!important;
  justify-content:center!important;
  padding:3px 40px 3px 8px!important;
  gap:6px!important;
}
.m2-corporate-type-card[data-rafex-system="mekik2"]>.m2-corporate-view,
.m2-corporate-type-card[data-rafex-system="mekik2"].rafex-mekik-slot-v7>.m2-corporate-view{
  grid-column:1!important;
  width:100%!important;
  height:100%!important;
  min-width:0!important;
  min-height:0!important;
  display:grid!important;
  grid-template-rows:20px minmax(0,1fr)!important;
  overflow:hidden!important;
  position:relative!important;
  box-sizing:border-box!important;
}
.m2-corporate-type-card[data-rafex-system="mekik2"]>.m2-corporate-view:nth-of-type(1),
.m2-corporate-type-card[data-rafex-system="mekik2"].rafex-mekik-slot-v7>.m2-corporate-view:nth-of-type(1){
  grid-row:2!important;
  border-right:0!important;
  border-bottom:1px solid #c6d2dc!important;
}
.m2-corporate-type-card[data-rafex-system="mekik2"]>.m2-corporate-view:nth-of-type(2),
.m2-corporate-type-card[data-rafex-system="mekik2"].rafex-mekik-slot-v7>.m2-corporate-view:nth-of-type(2){
  grid-row:3!important;
  border-right:0!important;
}
.m2-corporate-type-card[data-rafex-system="mekik2"]>.m2-corporate-view>svg,
.m2-corporate-type-card[data-rafex-system="mekik2"]>.m2-corporate-view>svg[data-rafex-native-positioned="1"]{
  grid-row:2!important;
  display:block!important;
  position:static!important;
  inset:auto!important;
  width:100%!important;
  height:100%!important;
  max-width:100%!important;
  max-height:100%!important;
  min-width:0!important;
  min-height:0!important;
  margin:0!important;
  transform:none!important;
  translate:none!important;
  object-fit:contain!important;
  overflow:hidden!important;
}
.m2-corporate-type-card[data-rafex-system="mekik2"] .rafex-mekik-view-details{display:none!important}
</style>
<script data-rafex-final-pdf-halves-extension="v11">(function(){
  if(window.__rafexFinalPdfHalvesExtensionV11)return;
  window.__rafexFinalPdfHalvesExtensionV11=true;

  function isFree(){var p=document.getElementById('page');return !!p&&p.classList.contains('rafex-free-drawing-page');}
  function rackSystem(rack){if(!rack)return'';return rack.rafexSystem||(rack.b2bLayout||rack.b2b?'b2b':'mekik2');}
  function selectedRack(){
    try{var id=m2LayoutState?.selected;if(id==null&&m2MultiSelect?.rackIds?.size===1)id=Array.from(m2MultiSelect.rackIds)[0];return m2LayoutState?.racks?.find(function(r){return Number(r.id)===Number(id);})||null;}catch{return null;}
  }
  function contextSystem(){
    var rack=selectedRack();if(rack)return rackSystem(rack);
    var page=document.getElementById('page');var tagged=String(page?.dataset?.rafexFreeContextSystem||'');if(tagged)return tagged;
    try{return m2ActiveModule==='b2b'?'b2b':'mekik2';}catch{return'mekik2';}
  }
  function syncExtension(){
    if(!isFree())return;
    var controls=document.getElementById('m2AutoFillControls');if(!controls)return;
    var system=contextSystem(),mekik=system==='mekik2';
    controls.hidden=false;
    controls.style.setProperty('display','flex','important');
    controls.setAttribute('aria-disabled',mekik?'true':'false');
    var input=document.getElementById('m2AutoFillLength');
    controls.querySelectorAll('input,button').forEach(function(el){
      if(mekik){el.disabled=true;el.setAttribute('aria-disabled','true');}
      else if(window.m2AutoFillDraft){el.disabled=false;el.removeAttribute('aria-disabled');}
    });
    if(input&&mekik){input.value='';input.placeholder='Mekik sisteminde kullanılamaz';}
    else if(input&&!window.m2AutoFillDraft){input.placeholder='B2B rafına çift tıkla';}
  }
  function tagPdfCards(){
    ['m2CorporatePreview','m2CorporatePrint','m2CorporatePrintArea'].forEach(function(id){
      var host=document.getElementById(id);if(!host)return;
      host.querySelectorAll('.m2-corporate-type-card').forEach(function(card){
        var sys=String(card.dataset.rafexSystem||'').toLowerCase();
        if(!sys){if(card.querySelector('.rafex-report-3d-frame,.rafex-b2b-report-perspective'))sys='b2b';else if(card.querySelectorAll(':scope>.m2-corporate-view').length>=2)sys='mekik2';if(sys)card.dataset.rafexSystem=sys;}
        if(sys==='mekik2'){
          var views=card.querySelectorAll(':scope>.m2-corporate-view');
          if(views[0])views[0].dataset.rafexNativeOutput='mekik-front';
          if(views[1])views[1].dataset.rafexNativeOutput='mekik-side';
        }
      });
    });
  }
  function sync(){syncExtension();tagPdfCards();}
  function schedule(){[0,30,100,260,650,1100].forEach(function(ms){setTimeout(sync,ms);});}
  document.addEventListener('click',function(){setTimeout(syncExtension,0);},true);
  document.addEventListener('pointerup',function(){setTimeout(syncExtension,0);},true);
  try{var prev=window.m2RenderCorporateReport;if(typeof prev==='function'&&!prev.__rafexV11){var wrap=function(){var out=prev.apply(this,arguments);schedule();return out;};wrap.__rafexV11=true;try{m2RenderCorporateReport=wrap;}catch{}window.m2RenderCorporateReport=wrap;}}catch{}
  try{var prep=window.__rafexPrepareCorporatePrint;if(typeof prep==='function'&&!prep.__rafexV11){var wrapPrep=async function(){var out=await prep.apply(this,arguments);sync();await new Promise(function(r){requestAnimationFrame(function(){sync();r();});});return out;};wrapPrep.__rafexV11=true;window.__rafexPrepareCorporatePrint=wrapPrep;}}catch{}
  schedule();
})();</script>`;

const bodyEnd = html.lastIndexOf("</body>");
if (bodyEnd < 0) throw new Error("Final PDF halves/extension v11: body bulunamadi.");
html = html.slice(0, bodyEnd) + runtime + html.slice(bodyEnd);

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.slice(0, match.index) + match[1] + match[2] + encoded + match[2] + worker.slice(match.index + match[0].length);
fs.writeFileSync(workerPath, worker);
console.log("FINAL v11: Uzatma alani sabit; Mekik pasif. PDF iki yarim slot; Mekik on/yan esit ust-alt.");
