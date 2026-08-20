import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const workerPath = path.join(root, "dist/server/index.js");
const marker = 'data-rafex-final-free-pdf-ux="v1"';

let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("Final free/PDF UX: HTML_BASE64 bulunamadi.");

let html = Buffer.from(match[3], "base64").toString("utf8");

// Remove an older copy of this final pass when the script is re-run.
html = html
  .replace(/<style\s+data-rafex-final-free-pdf-ux="v1">[\s\S]*?<\/style>\s*/g, "")
  .replace(/<script\s+data-rafex-final-free-pdf-ux="v1">[\s\S]*?<\/script>\s*/g, "");

// The old unified section-positioner extended Kesit Yer Belirleme into Mekik and
// also post-processed Mekik report cards. Mekik is no longer allowed in that tool,
// so remove that runtime completely. The native B2B positioner stays untouched.
html = html
  .replace(/<style[^>]*data-rafex-unified-section-positioner="v1"[^>]*>[\s\S]*?<\/style>\s*/g, "")
  .replace(/<script[^>]*data-rafex-unified-section-positioner="v1"[^>]*>[\s\S]*?<\/script>\s*/g, "");

// Corporate/detailed output is the second output everywhere and is presented to
// the user with the requested name. Keep its internal value so report logic stays native.
html = html.replace(/(<option\s+value=["']corporate["'][^>]*>)[^<]*(<\/option>)/g, "$1Özel Çıktı$2");
html = html
  .replace(/"Detay \/ Kurumsal Çıktı":"Detailed \/ Corporate Output"/g, '"Detay / Kurumsal Çıktı":"Detailed / Corporate Output","Özel Çıktı":"Special Output"')
  .replace(/"Detay \/ Kurumsal Çıktı":"Sortie détaillée \/ entreprise"/g, '"Detay / Kurumsal Çıktı":"Sortie détaillée / entreprise","Özel Çıktı":"Sortie spéciale"');

// Existing users may have an old persisted B2B section setting with pallets off.
// Migrate that legacy state ON exactly once. After this migration the normal
// Kesit Yer Belirleme toggle is authoritative, so a user can turn pallets off and
// the choice remains off on subsequent visits.
if (html.includes('const STORAGE_KEY = "rafex_b2b_perspective_by_type_v4";') &&
    html.includes("let saved = loadSettings();") &&
    !html.includes("rafex_b2b_pallet_default_v2")) {
  const migration = String.raw`  try {
    const palletDefaultMigrationKey = "rafex_b2b_pallet_default_v2";
    if (!localStorage.getItem(palletDefaultMigrationKey)) {
      const migrated = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      if (migrated && migrated.sections && typeof migrated.sections === "object") {
        Object.keys(migrated.sections).forEach((key) => {
          const section = migrated.sections[key];
          if (section && typeof section === "object") section.showPallets = true;
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      }
      localStorage.setItem(palletDefaultMigrationKey, "1");
    }
  } catch {}

`;
  html = html.replace("  let saved = loadSettings();", migration + "  let saved = loadSettings();");
}

const runtime = String.raw`<style data-rafex-final-free-pdf-ux="v1">
/* B2B native saved-type actions: restore an explicit readable content button. */
#page:not(.rafex-free-drawing-page) .m2-saved-type-preview.rafex-b2b-content-button{
  width:auto!important;min-width:116px!important;padding:0 10px!important;
  display:inline-flex!important;align-items:center!important;justify-content:center!important;
  font:900 8px/1.05 Arial,sans-serif!important;white-space:nowrap!important
}
#page:not(.rafex-free-drawing-page) .m2-saved-type-copy.rafex-b2b-copy-button{
  display:inline-flex!important;align-items:center!important;justify-content:center!important;
  min-width:64px!important
}

/* Serbest Cizim product documents: each system is an independent manual disclosure. */
#page.rafex-free-drawing-page #m2LayoutProductList.rafex-system-product-lists{
  display:block!important;padding:0!important;overflow:hidden!important;background:#fff!important
}
#page.rafex-free-drawing-page #m2LayoutProductList.rafex-system-product-lists>.rafex-product-list-title{
  display:block;padding:8px 10px;border-bottom:1px solid #dce6df;background:#173c2d;color:#fff;
  font:900 10px/1 Arial,sans-serif;letter-spacing:.04em
}
.rafex-system-product-disclosure{display:block;margin:0;border:0;border-bottom:1px solid #dce6df;background:#fff}
.rafex-system-product-disclosure:last-child{border-bottom:0}
.rafex-system-product-disclosure>summary{
  list-style:none;display:flex;align-items:center;gap:8px;min-height:34px;padding:7px 10px;
  cursor:pointer;background:#f4f8f5;color:#173c2d;font:900 10px/1.15 Arial,sans-serif;user-select:none
}
.rafex-system-product-disclosure>summary::-webkit-details-marker{display:none}
.rafex-product-arrow{display:inline-block;width:12px;font-size:10px;transition:transform .12s ease;transform-origin:50% 50%}
.rafex-system-product-disclosure[open] .rafex-product-arrow{transform:rotate(90deg)}
.rafex-product-summary-count{margin-left:auto;color:#6b776f;font-size:8px;font-weight:800}
.rafex-system-product-body{display:flex;flex-direction:column;background:#fff}
.rafex-system-product-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;padding:7px 10px;border-top:1px solid #edf1ee}
.rafex-system-product-row>span{min-width:0;display:flex;flex-direction:column;gap:2px;color:#263a2f;font-size:9px}
.rafex-system-product-row>span small{color:#748078;font-size:8px;line-height:1.25}
.rafex-system-product-row>strong{color:#173c2d;font-size:10px}
.rafex-system-product-empty{padding:10px;color:#7b857f;font-size:9px}

/* Final Mekik PDF geometry. A Mekik-only page uses the whole available type grid.
   Front and side halves are exactly equal height, and each green information bar
   is the final row at the bottom of its own half. */
.m2-corporate-type-grid.rafex-single-mekik-grid{
  grid-template-rows:minmax(0,1fr)!important
}
.m2-corporate-type-card[data-rafex-system="mekik2"]{
  height:100%!important;min-height:0!important;
  grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;
  grid-template-rows:30px minmax(0,1fr)!important
}
.m2-corporate-type-card[data-rafex-system="mekik2"]>.m2-corporate-view{
  height:100%!important;min-height:0!important;align-self:stretch!important;
  display:grid!important;grid-template-rows:22px minmax(0,1fr) auto!important;
  align-content:stretch!important;overflow:hidden!important
}
.m2-corporate-type-card[data-rafex-system="mekik2"]>.m2-corporate-view>b{
  grid-row:1!important;min-height:22px!important
}
.m2-corporate-type-card[data-rafex-system="mekik2"]>.m2-corporate-view>svg[data-rafex-native-positioned="1"],
.m2-corporate-type-card[data-rafex-system="mekik2"]>.m2-corporate-view>svg{
  grid-row:2!important;width:100%!important;height:100%!important;min-height:0!important;
  align-self:stretch!important;justify-self:stretch!important;overflow:visible!important
}
.m2-corporate-type-card[data-rafex-system="mekik2"] .rafex-mekik-view-details{
  grid-row:3!important;align-self:end!important;width:auto!important;min-width:0!important;
  min-height:34px!important;margin:6px 26px 8px!important;padding:7px 12px!important;
  box-sizing:border-box!important
}
</style>
<script data-rafex-final-free-pdf-ux="v1">(function(){
  if(window.__rafexFinalFreePdfUxV1)return;
  window.__rafexFinalFreePdfUxV1=true;

  var productOpen={b2b:false,mekik2:false};
  try{
    var storedProductOpen=JSON.parse(localStorage.getItem('rafex_free_product_disclosures_v1')||'{}');
    productOpen.b2b=storedProductOpen.b2b===true;
    productOpen.mekik2=storedProductOpen.mekik2===true;
  }catch{}

  function qsa(root,selector){try{return Array.from((root||document).querySelectorAll(selector));}catch{return[];}}
  function escapeHtml(value){return String(value==null?'':value).replace(/[&<>\"]/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[ch];});}
  function freePage(){var page=document.getElementById('page');return !!(page&&page.classList.contains('rafex-free-drawing-page'));}
  function activeModule(){try{return typeof m2ActiveModule!=='undefined'?String(m2ActiveModule):'';}catch{return'';}}

  function normalizeOutputSelectors(){
    qsa(document,'select').forEach(function(select){
      var options=Array.from(select.options||[]),corporate=options.find(function(option){return option.value==='corporate';});
      if(!corporate)return;
      corporate.textContent='Özel Çıktı';
      if(select.options[1]!==corporate)select.insertBefore(corporate,select.options[1]||null);
    });
  }

  function enhanceB2BSavedControls(){
    if(freePage()||activeModule()!=='b2b')return;
    var list=document.getElementById('m2SavedTypeList');if(!list)return;
    qsa(list,'.m2-saved-type-row').forEach(function(row){
      var preview=row.querySelector('.m2-saved-type-preview');
      if(preview){
        preview.classList.add('rafex-b2b-content-button');
        preview.textContent='İÇERİĞİNİ GÖSTER';
        preview.title='Raf tipinin içeriğini / 3D önizlemesini göster';
      }
      var copy=row.querySelector('.m2-saved-type-copy');
      if(copy){copy.classList.add('rafex-b2b-copy-button');copy.textContent='KOPYALA';copy.title='Raf tipini üst düzenleyiciye kopyala';}
    });
  }

  function systemOf(entry){
    var drawing=entry&&entry.drawing?entry.drawing:entry||{};
    var explicit=String((entry&&entry.rafexSystem)||drawing.rafexSystem||'').toLowerCase();
    if(explicit==='b2b'||explicit==='mekik2')return explicit;
    return drawing.b2bLayout||drawing.b2b?'b2b':'mekik2';
  }

  function usedTypes(){
    try{
      if(typeof m2CorporateUsedTypes==='function'){
        var current=m2CorporateUsedTypes();
        if(Array.isArray(current)&&current.length)return current;
      }
    }catch(error){console.warn('Serbest Çizim ürün tipleri okunamadı',error);}
    try{
      if(typeof m2LayoutState!=='undefined'&&Array.isArray(m2LayoutState.racks)){
        return m2LayoutState.racks.map(function(rack,index){
          return {name:rack.typeName||rack.name||('Raf Tipi '+(index+1)),drawing:rack,rackCount:1,rafexSystem:rack.rafexSystem};
        });
      }
    }catch{}
    return[];
  }

  function productRows(system){
    var labels={unitEach:'adet'};
    try{if(typeof m2ReportDictionary==='function')labels=m2ReportDictionary('tr')||labels;}catch{}
    var rows=new Map();
    usedTypes().filter(function(entry){return systemOf(entry)===system;}).forEach(function(entry){
      var bom=[];
      try{if(typeof m2CorporateBomRows==='function')bom=m2CorporateBomRows(entry,labels)||[];}catch(error){console.warn('Ürün dökümü hazırlanamadı',error);}
      bom.forEach(function(row){
        var item=String(row.item||row.name||'Ürün'),spec=String(row.spec||''),unit=String(row.unit||labels.unitEach||'adet'),qty=Math.max(0,Number(row.qty)||0);
        if(!qty)return;
        var key=item+'|'+spec+'|'+unit;
        if(!rows.has(key))rows.set(key,{item:item,spec:spec,unit:unit,qty:0});
        rows.get(key).qty+=qty;
      });
    });
    return Array.from(rows.values()).sort(function(a,b){return a.item.localeCompare(b.item,'tr');});
  }

  function productSection(system,label,rows){
    var open=productOpen[system]?' open':'';
    var body=rows.length?rows.map(function(row){
      var spec=row.spec?'<small>'+escapeHtml(row.spec)+'</small>':'';
      return '<div class="rafex-system-product-row"><span><b>'+escapeHtml(row.item)+'</b>'+spec+'</span><strong>'+escapeHtml(Math.round(row.qty))+' '+escapeHtml(row.unit)+'</strong></div>';
    }).join(''):'<div class="rafex-system-product-empty">Bu sistem için yerleşime eklenmiş ürün bulunmuyor.</div>';
    return '<details class="rafex-system-product-disclosure" data-rafex-product-system="'+system+'"'+open+'><summary><span class="rafex-product-arrow">▶</span><b>'+escapeHtml(label)+'</b><span class="rafex-product-summary-count">'+rows.length+' SATIR</span></summary><div class="rafex-system-product-body">'+body+'</div></details>';
  }

  function renderSystemProductLists(){
    if(!freePage())return false;
    var host=document.getElementById('m2LayoutProductList');if(!host)return false;
    var b2bRows=productRows('b2b'),mekikRows=productRows('mekik2');
    host.classList.add('rafex-system-product-lists');
    host.innerHTML='<b class="rafex-product-list-title">ÜRÜN DÖKÜMLERİ</b>'+productSection('b2b','B2B ÜRÜN LİSTESİ',b2bRows)+productSection('mekik2','MEKİK ÜRÜN LİSTESİ',mekikRows);
    qsa(host,'details[data-rafex-product-system]').forEach(function(details){
      details.addEventListener('toggle',function(){
        var key=details.dataset.rafexProductSystem;if(!key)return;
        productOpen[key]=details.open;
        try{localStorage.setItem('rafex_free_product_disclosures_v1',JSON.stringify(productOpen));}catch{}
      });
    });
    return true;
  }

  function installProductHook(){
    var original=null;
    try{if(typeof m2RenderLayoutProductList==='function')original=m2RenderLayoutProductList;}catch{}
    if(typeof original!=='function'||original.__rafexSystemProductWrapped)return;
    var wrapped=function(){
      if(freePage())return renderSystemProductLists();
      return original.apply(this,arguments);
    };
    wrapped.__rafexSystemProductWrapped=true;
    wrapped.__rafexOriginal=original;
    try{m2RenderLayoutProductList=wrapped;}catch{}
    try{window.m2RenderLayoutProductList=wrapped;}catch{}
  }

  function installSavedTypeHook(){
    var original=null;
    try{if(typeof m2RenderSavedRackTypes==='function')original=m2RenderSavedRackTypes;}catch{}
    if(typeof original!=='function'||original.__rafexB2BSavedControlsWrapped)return;
    var wrapped=function(){
      var result=original.apply(this,arguments);
      setTimeout(enhanceB2BSavedControls,0);
      return result;
    };
    wrapped.__rafexB2BSavedControlsWrapped=true;
    wrapped.__rafexOriginal=original;
    try{m2RenderSavedRackTypes=wrapped;}catch{}
    try{window.m2RenderSavedRackTypes=wrapped;}catch{}
  }

  function finalizeMekikCards(){
    try{if(typeof window.rafexNormalizeNativePdfOutputs==='function')window.rafexNormalizeNativePdfOutputs();}catch{}
    ['m2CorporatePreview','m2CorporatePrint','m2CorporatePrintArea'].forEach(function(id){
      var host=document.getElementById(id);if(!host)return;
      qsa(host,'.m2-corporate-type-grid').forEach(function(grid){
        var cards=qsa(grid,':scope > .m2-corporate-type-card');
        var mekikCards=cards.filter(function(card){return card.dataset.rafexSystem==='mekik2';});
        grid.classList.toggle('rafex-single-mekik-grid',cards.length===1&&mekikCards.length===1);
      });
      qsa(host,'.m2-corporate-type-card[data-rafex-system="mekik2"]').forEach(function(card){
        var views=qsa(card,':scope > .m2-corporate-view');
        if(views.length<2)return;
        views[0].dataset.rafexNativeOutput='mekik-front';
        views[1].dataset.rafexNativeOutput='mekik-side';
        views.forEach(function(view){
          view.removeAttribute('data-rafex-perspective-hidden');
          view.removeAttribute('data-rafex-mekik-hidden');
          view.style.removeProperty('display');
          view.style.setProperty('height','100%','important');
        });
      });
    });
  }

  function scheduleFinal(delay){
    setTimeout(function(){normalizeOutputSelectors();enhanceB2BSavedControls();if(freePage())renderSystemProductLists();finalizeMekikCards();},delay||0);
  }

  function installReportHook(){
    var original=null;
    try{if(typeof m2RenderCorporateReport==='function')original=m2RenderCorporateReport;}catch{}
    if(typeof original==='function'&&!original.__rafexFinalPdfWrapped){
      var wrapped=function(){
        var result=original.apply(this,arguments);
        [0,90,320,760,1350,1900].forEach(scheduleFinal);
        return result;
      };
      wrapped.__rafexFinalPdfWrapped=true;
      try{m2RenderCorporateReport=wrapped;}catch{}
      try{window.m2RenderCorporateReport=wrapped;}catch{}
    }
    try{
      var prepare=window.__rafexPrepareCorporatePrint;
      if(typeof prepare==='function'&&!prepare.__rafexFinalPdfWrapped){
        var wrappedPrepare=async function(){
          var result=await prepare.apply(this,arguments);
          finalizeMekikCards();
          await new Promise(function(resolve){requestAnimationFrame(function(){finalizeMekikCards();resolve();});});
          return result;
        };
        wrappedPrepare.__rafexFinalPdfWrapped=true;
        window.__rafexPrepareCorporatePrint=wrappedPrepare;
      }
    }catch{}
  }

  document.addEventListener('click',function(event){
    var target=event.target&&event.target.closest?event.target.closest('button,[data-page],summary'):null;
    if(!target)return;
    if(target.closest('#nav')||target.id==='m2SectionPlacementButton'||target.closest('[data-rafex-placement-save]')||target.closest('[data-rafex-placement-cancel]')){
      [0,80,220,520,1100].forEach(scheduleFinal);
    }
  },true);

  function boot(){
    installProductHook();
    installSavedTypeHook();
    installReportHook();
    [0,120,420,900,1600].forEach(scheduleFinal);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();</script>`;

const closing = html.lastIndexOf("</body>");
if (closing < 0) throw new Error("Final free/PDF UX: </body> bulunamadi.");
html = html.slice(0, closing) + runtime + "\n" + html.slice(closing);

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.replace(match[0], `${match[1]}${match[2]}${encoded}${match[2]}`);
fs.writeFileSync(workerPath, worker);

const finalHtml = Buffer.from(encoded, "base64").toString("utf8");
for (const required of [marker, "B2B ÜRÜN LİSTESİ", "MEKİK ÜRÜN LİSTESİ", "Özel Çıktı", "rafex_b2b_pallet_default_v2", "rafex-single-mekik-grid"]) {
  if (!finalHtml.includes(required)) throw new Error(`Final free/PDF UX dogrulama hatasi: ${required}`);
}
if (finalHtml.includes('data-rafex-unified-section-positioner="v1"')) {
  throw new Error("Final free/PDF UX: eski Mekik Kesit Yer Belirleme runtime'i hala aktif.");
}
console.log("FINAL: Ozel Cikti ikinci secenek; B2B kayitli tip aksiyonlari; sistem bazli acilir urun listeleri; B2B palet varsayilani; Kesit-Mekik PDF izolasyonu; Mekik esit yukseklik/alt bilgi duzeni uygulandi (v1).");
