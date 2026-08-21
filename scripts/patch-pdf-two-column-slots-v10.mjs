import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("PDF two-column slots v10: HTML_BASE64 bulunamadi.");

let html = Buffer.from(match[3], "base64").toString("utf8");
html = html
  .replace(/<style\s+data-rafex-pdf-two-column-slots="v10">[\s\S]*?<\/style>\s*/g, "")
  .replace(/<script\s+data-rafex-pdf-two-column-slots="v10">[\s\S]*?<\/script>\s*/g, "");

const runtime = String.raw`<style data-rafex-pdf-two-column-slots="v10">
/* PDF/kurumsal çıktı: sayfa iki dikey slota ayrılır. Her sistem yalnızca kendi yarısını kullanır. */
#m2CorporatePreview .m2-corporate-type-grid,
#m2CorporatePrint .m2-corporate-type-grid,
#m2CorporatePrintArea .m2-corporate-type-grid,
.m2-corporate-page .m2-corporate-type-grid{
  display:grid!important;
  grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;
  grid-template-rows:minmax(0,1fr)!important;
  grid-auto-columns:minmax(0,1fr)!important;
  grid-auto-rows:minmax(0,1fr)!important;
  gap:8px!important;
  align-items:stretch!important;
  overflow:hidden!important;
}

/* B2B: mevcut dikey tek-modül yapısı korunur, fakat yalnızca kendi yarım sayfa slotunu doldurur. */
.m2-corporate-type-card[data-rafex-system="b2b"]{
  width:100%!important;
  height:100%!important;
  min-width:0!important;
  min-height:0!important;
  max-width:none!important;
  overflow:hidden!important;
  align-self:stretch!important;
  justify-self:stretch!important;
}

/* Mekik: bir yarım sayfa slotu içinde ön üstte, yan altta. */
.m2-corporate-type-card[data-rafex-system="mekik2"],
.m2-corporate-type-card[data-rafex-system="mekik2"].rafex-mekik-slot-v7{
  width:100%!important;
  height:100%!important;
  min-width:0!important;
  min-height:0!important;
  max-width:none!important;
  display:grid!important;
  grid-template-columns:minmax(0,1fr)!important;
  grid-template-rows:30px minmax(0,1fr) minmax(0,1fr)!important;
  gap:0!important;
  overflow:hidden!important;
  align-self:stretch!important;
  justify-self:stretch!important;
}
.m2-corporate-type-card[data-rafex-system="mekik2"]>strong,
.m2-corporate-type-card[data-rafex-system="mekik2"].rafex-mekik-slot-v7>strong{
  grid-column:1!important;
  grid-row:1!important;
  min-width:0!important;
  min-height:0!important;
  display:flex!important;
  flex-direction:row!important;
  align-items:center!important;
  justify-content:center!important;
  gap:8px!important;
  padding:4px 44px 4px 8px!important;
  border-bottom:1px solid #c6d2dc!important;
  text-align:center!important;
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
  position:relative!important;
  overflow:hidden!important;
  border-left:0!important;
  border-right:0!important;
}
.m2-corporate-type-card[data-rafex-system="mekik2"]>.m2-corporate-view:nth-of-type(1),
.m2-corporate-type-card[data-rafex-system="mekik2"].rafex-mekik-slot-v7>.m2-corporate-view:nth-of-type(1){
  grid-row:2!important;
  border-bottom:1px solid #c6d2dc!important;
}
.m2-corporate-type-card[data-rafex-system="mekik2"]>.m2-corporate-view:nth-of-type(2),
.m2-corporate-type-card[data-rafex-system="mekik2"].rafex-mekik-slot-v7>.m2-corporate-view:nth-of-type(2){
  grid-row:3!important;
}
.m2-corporate-type-card[data-rafex-system="mekik2"]>.m2-corporate-view>b{
  grid-row:1!important;
  display:grid!important;
  place-items:center!important;
  min-height:20px!important;
  margin:0!important;
}
.m2-corporate-type-card[data-rafex-system="mekik2"]>.m2-corporate-view>svg,
.m2-corporate-type-card[data-rafex-system="mekik2"]>.m2-corporate-view>svg[data-rafex-native-positioned="1"]{
  grid-row:2!important;
  display:block!important;
  position:static!important;
  inset:auto!important;
  left:auto!important;
  top:auto!important;
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
  contain:layout paint!important;
}
/* Eski Mekik bilgi bloklari çizimin alanını daraltmasın. */
.m2-corporate-type-card[data-rafex-system="mekik2"] .rafex-mekik-view-details{
  display:none!important;
}
</style>
<script data-rafex-pdf-two-column-slots="v10">(function(){
  if(window.__rafexPdfTwoColumnSlotsV10)return;
  window.__rafexPdfTwoColumnSlotsV10=true;

  function systemOfCard(card){
    var tagged=String(card?.dataset?.rafexSystem||'').toLowerCase();
    if(tagged==='b2b'||tagged==='mekik2')return tagged;
    if(card?.querySelector('.rafex-report-3d-frame,.rafex-b2b-report-perspective'))return 'b2b';
    if(card?.querySelectorAll(':scope > .m2-corporate-view').length>=2)return 'mekik2';
    return '';
  }
  function normalize(){
    ['m2CorporatePreview','m2CorporatePrint','m2CorporatePrintArea'].forEach(function(id){
      var host=document.getElementById(id);if(!host)return;
      host.querySelectorAll('.m2-corporate-type-card').forEach(function(card){
        var sys=systemOfCard(card);if(sys)card.dataset.rafexSystem=sys;
        if(sys==='mekik2'){
          card.classList.add('rafex-pdf-half-mekik-v10');
          var views=card.querySelectorAll(':scope > .m2-corporate-view');
          if(views[0])views[0].dataset.rafexNativeOutput='mekik-front';
          if(views[1])views[1].dataset.rafexNativeOutput='mekik-side';
        }
      });
    });
  }
  function schedule(){[0,40,120,300,700,1200].forEach(function(ms){setTimeout(normalize,ms);});}
  try{
    var prev=window.m2RenderCorporateReport;
    if(typeof prev==='function'&&!prev.__rafexPdfTwoColumnSlotsV10){
      var wrap=function(){var out=prev.apply(this,arguments);schedule();return out;};
      wrap.__rafexPdfTwoColumnSlotsV10=true;
      try{m2RenderCorporateReport=wrap;}catch{}
      window.m2RenderCorporateReport=wrap;
    }
  }catch{}
  try{
    var prep=window.__rafexPrepareCorporatePrint;
    if(typeof prep==='function'&&!prep.__rafexPdfTwoColumnSlotsV10){
      var wrapPrep=async function(){var out=await prep.apply(this,arguments);normalize();await new Promise(function(r){requestAnimationFrame(function(){normalize();r();});});return out;};
      wrapPrep.__rafexPdfTwoColumnSlotsV10=true;
      window.__rafexPrepareCorporatePrint=wrapPrep;
    }
  }catch{}
  schedule();
})();</script>`;

const bodyEnd = html.lastIndexOf("</body>");
if (bodyEnd < 0) throw new Error("PDF two-column slots v10: body bulunamadi.");
html = html.slice(0, bodyEnd) + runtime + html.slice(bodyEnd);

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.slice(0, match.index) + match[1] + match[2] + encoded + match[2] + worker.slice(match.index + match[0].length);
fs.writeFileSync(workerPath, worker);
console.log("PDF v10: sayfa iki dikey slota ayrildi; B2B tek slot, Mekik on/yan ust-alt olarak kendi slotuna kilitlendi.");
