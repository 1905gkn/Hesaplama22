import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const workerPath = path.join(root, "dist/server/index.js");
const marker = 'data-rafex-native-output-free-ux="v2"';

let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("Native output/free UX v2: HTML_BASE64 bulunamadi.");

let html = Buffer.from(match[3], "base64").toString("utf8");

// Serbest Cizim katalogu ve sistem yonlendirmesi kalir; B2B/Mekik kurumsal
// ciktilarini sonradan yeniden boyutlandiran runtime katmanlarini kaldir.
// Boylece iki sistem kendi bolumlerinde var olan native cikti renderer'ina doner.
html = html
  .replace(/<style\s+data-rafex-final-free-pdf-ux="v1">[\s\S]*?<\/style>\s*/g, "")
  .replace(/<script\s+data-rafex-final-free-pdf-ux="v1">[\s\S]*?<\/script>\s*/g, "")
  .replace(/<style\s+data-rafex-mekik-output-halves="v1">[\s\S]*?<\/style>\s*/g, "")
  .replace(/<script\s+data-rafex-mekik-output-halves="v1">[\s\S]*?<\/script>\s*/g, "")
  .replace(/<style\s+data-rafex-native-system-pdf-router="v1">[\s\S]*?<\/style>\s*/g, "")
  .replace(/<script\s+data-rafex-native-system-pdf-router="v1">[\s\S]*?<\/script>\s*/g, "")
  .replace(/<style\s+data-rafex-native-output-free-ux="v2">[\s\S]*?<\/style>\s*/g, "")
  .replace(/<script\s+data-rafex-native-output-free-ux="v2">[\s\S]*?<\/script>\s*/g, "");

// Onceki final pass kurumsal secenegin adini Ozel Cikti yapmisti. Native adini geri getir.
html = html
  .replace(/(<option\s+value=["']corporate["'][^>]*>)[^<]*(<\/option>)/g, "$1Kurumsal Çıktı$2")
  .replace(/,"Özel Çıktı":"Special Output"/g, "")
  .replace(/,"Özel Çıktı":"Sortie spéciale"/g, "")
  .replace(/Özel Çıktı/g, "Kurumsal Çıktı");

// B2B kart eslestiricisi, sistem etiketi henuz konmadan da native Mekik SVG kartini
// perspektif cikti gibi ele almasin. Sistem-bazli gruplama degisiklikleri korunur.
html = html.replace(
  'if (card.dataset.rafexSystem && card.dataset.rafexSystem !== "b2b") return;',
  'if ((card.dataset.rafexSystem && card.dataset.rafexSystem !== "b2b") || card.querySelector(".m2-set-projection")) return;'
);

const runtime = String.raw`<style data-rafex-native-output-free-ux="v2">
/* Kayitli raf tiplerinde aksiyonlar her bolumde ayni sembollerle gorunur. */
.m2-saved-type-preview.rafex-global-info-action,
.m2-saved-type-copy.rafex-global-copy-action{
  width:36px!important;min-width:36px!important;height:auto!important;min-height:36px!important;
  padding:0!important;display:inline-grid!important;place-items:center!important;
  border:1px solid #9fb5a7!important;border-radius:8px!important;background:#fff!important;
  color:var(--g,#214f3b)!important;cursor:pointer!important
}
.m2-saved-type-preview.rafex-global-info-action{font:900 17px/1 Georgia,serif!important}
.m2-saved-type-copy.rafex-global-copy-action{font:900 12px/1 Arial,sans-serif!important}
.m2-saved-type-preview.rafex-global-info-action:hover,
.m2-saved-type-copy.rafex-global-copy-action:hover{background:var(--g,#214f3b)!important;color:#fff!important}
.rafex-copy-pages{position:relative;display:block;width:17px;height:16px;color:currentColor}
.rafex-copy-pages:before,.rafex-copy-pages:after{content:"";position:absolute;width:9px;height:11px;border:1.6px solid currentColor;border-radius:1.5px;background:transparent}
.rafex-copy-pages:before{left:2px;top:1px}
.rafex-copy-pages:after{left:6px;top:4px}

/* Serbest Cizim urun dokumleri sistem bazinda manuel acilir/kapanir. */
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

/* Mekik icerik modalinda native on/yan ciktilar yalniz okunur gosterilir. */
.rafex-saved-content-modal[hidden]{display:none!important}
.rafex-saved-content-modal{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;padding:22px;background:#07150e99}
.rafex-saved-content-dialog{width:min(980px,96vw);max-height:92vh;overflow:auto;border-radius:14px;background:#fff;box-shadow:0 24px 70px #0005}
.rafex-saved-content-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;border-bottom:1px solid #dfe5e0;background:#f6f8f6;color:#173c2d}
.rafex-saved-content-head b{font-size:12px}
.rafex-saved-content-head button{width:34px;height:34px;padding:0;border-radius:8px;background:#173c2d;color:#fff;font-size:18px}
.rafex-saved-content-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:14px}
.rafex-saved-content-view{min-width:0;border:1px solid #dce5df;border-radius:10px;overflow:hidden;background:#fff}
.rafex-saved-content-view>b{display:block;padding:8px 10px;border-bottom:1px solid #e7ece8;background:#f5f8f6;color:#173c2d;font-size:10px;text-align:center}
.rafex-saved-content-view svg{display:block;width:100%!important;height:auto!important;min-height:260px}
@media(max-width:760px){.rafex-saved-content-grid{grid-template-columns:1fr}}
</style>
<script data-rafex-native-output-free-ux="v2">(function(){
  if(window.__rafexNativeOutputFreeUxV2)return;
  window.__rafexNativeOutputFreeUxV2=true;

  var productOpen={b2b:false,mekik2:false};
  var lastLayoutSignature='';
  try{
    var stored=JSON.parse(localStorage.getItem('rafex_free_product_disclosures_v1')||'{}');
    productOpen.b2b=stored.b2b===true;
    productOpen.mekik2=stored.mekik2===true;
  }catch(e){}

  function qsa(root,selector){try{return Array.from((root||document).querySelectorAll(selector));}catch(e){return[];}}
  function freePage(){var page=document.getElementById('page');return !!(page&&page.classList.contains('rafex-free-drawing-page'));}
  function activeModule(){try{return typeof m2ActiveModule!=='undefined'?String(m2ActiveModule):'';}catch(e){return'';}}
  function escapeHtml(value){return String(value==null?'':value).replace(/[&<>\"]/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[ch];});}
  function systemOfEntry(entry){
    var drawing=entry&&entry.drawing?entry.drawing:entry||{};
    var explicit=String(entry&&entry.__rafexSystem||entry&&entry.rafexSystem||drawing.rafexSystem||'').toLowerCase();
    if(explicit==='b2b'||explicit==='mekik2')return explicit;
    if(drawing.b2b||drawing.b2bLayout)return 'b2b';
    var module=activeModule();
    return module==='b2b'?'b2b':'mekik2';
  }

  function normalizeOutputSelectors(){
    qsa(document,'select').forEach(function(select){
      var options=Array.from(select.options||[]);
      var corporate=options.find(function(option){return option.value==='corporate';});
      if(!corporate)return;
      corporate.textContent='Kurumsal Çıktı';
      corporate.defaultSelected=true;
      if(select.options[0]!==corporate)select.insertBefore(corporate,select.options[0]||null);
      if(!select.dataset.rafexCorporatePriority){
        select.dataset.rafexCorporatePriority='1';
        select.value='corporate';
        corporate.selected=true;
        try{select.dispatchEvent(new Event('change',{bubbles:true}));}catch(e){}
      }
    });
  }

  function ensureContentModal(){
    var modal=document.getElementById('rafexSavedContentModal');
    if(modal)return modal;
    modal=document.createElement('div');
    modal.id='rafexSavedContentModal';
    modal.className='rafex-saved-content-modal';
    modal.hidden=true;
    modal.innerHTML='<div class="rafex-saved-content-dialog" role="dialog" aria-modal="true"><div class="rafex-saved-content-head"><b id="rafexSavedContentTitle">RAF İÇERİĞİ</b><button type="button" aria-label="Kapat">×</button></div><div class="rafex-saved-content-grid" id="rafexSavedContentGrid"></div></div>';
    modal.addEventListener('click',function(event){if(event.target===modal)modal.hidden=true;});
    var close=modal.querySelector('.rafex-saved-content-head button');if(close)close.addEventListener('click',function(){modal.hidden=true;});
    document.body.appendChild(modal);
    return modal;
  }

  function openGenericContent(entry){
    if(!entry||!entry.drawing)return;
    var modal=ensureContentModal();
    var title=modal.querySelector('#rafexSavedContentTitle');
    var grid=modal.querySelector('#rafexSavedContentGrid');
    if(title)title.textContent=String(entry.name||'Raf')+' · İÇERİĞİ';
    var drawing=entry.drawing;
    var front='',side='';
    try{if(typeof m2ReportElevationSvg==='function'){front=m2ReportElevationSvg(drawing,'front');side=m2ReportElevationSvg(drawing,'side');}}catch(e){}
    if(front&&side){
      grid.innerHTML='<div class="rafex-saved-content-view"><b>ÖNDEN GÖRÜŞ</b>'+front+'</div><div class="rafex-saved-content-view"><b>YAN GÖRÜŞ</b>'+side+'</div>';
    }else{
      var info='Ölçü: '+Math.round(Number(drawing.totalWidth)||0)+' × '+Math.round(Number(drawing.railLength)||0)+' mm · Kat: '+Math.round(Number(drawing.levels)||0)+' · Palet: '+Math.round(Number(drawing.palW)||0)+' × '+Math.round(Number(drawing.palD)||0)+' mm';
      grid.innerHTML='<div class="rafex-saved-content-view" style="grid-column:1/-1"><b>RAF BİLGİSİ</b><div style="padding:18px;font:700 12px/1.6 Arial;color:#31483b">'+escapeHtml(info)+'</div></div>';
    }
    modal.hidden=false;
  }

  function showSavedContent(index){
    var entry=Array.isArray(window.m2SavedRackTypes)?window.m2SavedRackTypes[index]:null;
    if(!entry)return;
    var system=systemOfEntry(entry);
    if(system==='b2b'&&typeof window.m2OpenSavedRackPreview==='function'){
      var previous=activeModule();
      try{m2ActiveModule='b2b';window.m2OpenSavedRackPreview(index);return;}catch(e){}finally{try{m2ActiveModule=previous;}catch(e){}}
    }
    openGenericContent(entry);
  }

  function copySavedType(index){
    var entry=Array.isArray(window.m2SavedRackTypes)?window.m2SavedRackTypes[index]:null;
    if(!entry)return;
    var system=systemOfEntry(entry),previous=activeModule();
    try{
      if(system==='b2b'||system==='mekik2')m2ActiveModule=system;
      if(typeof window.m2CopySavedRackType==='function')window.m2CopySavedRackType(index);
      else if(typeof window.m2SelectSavedRackType==='function')window.m2SelectSavedRackType(index);
    }catch(e){console.warn('Kayitli raf tipi kopyalanamadi',e);}
    finally{try{m2ActiveModule=previous;}catch(e){}}
  }

  function enhanceSavedControls(){
    var list=document.getElementById('m2SavedTypeList');if(!list)return;
    qsa(list,'.m2-saved-type-row').forEach(function(row,index){
      var preview=row.querySelector('.m2-saved-type-preview');
      if(!preview){preview=document.createElement('button');preview.type='button';preview.className='m2-saved-type-preview';var del=row.querySelector('.m2-type-delete');row.insertBefore(preview,del||null);}
      preview.classList.add('rafex-global-info-action');preview.textContent='i';preview.title='İçeriğini göster';preview.setAttribute('aria-label','İçeriğini göster');preview.removeAttribute('onclick');preview.onclick=function(event){event.stopPropagation();showSavedContent(index);};

      var copy=row.querySelector('.m2-saved-type-copy');
      if(!copy){copy=document.createElement('button');copy.type='button';copy.className='m2-saved-type-copy';var del2=row.querySelector('.m2-type-delete');row.insertBefore(copy,del2||null);}
      copy.classList.add('rafex-global-copy-action');copy.innerHTML='<span class="rafex-copy-pages" aria-hidden="true"></span>';copy.title='Kopyala';copy.setAttribute('aria-label','Kopyala');copy.removeAttribute('onclick');copy.onclick=function(event){event.stopPropagation();copySavedType(index);};
    });
  }

  function usedTypes(){
    try{if(typeof m2CorporateUsedTypes==='function'){var current=m2CorporateUsedTypes();if(Array.isArray(current)&&current.length)return current;}}catch(e){}
    try{if(typeof m2LayoutState!=='undefined'&&Array.isArray(m2LayoutState.racks))return m2LayoutState.racks.map(function(rack,index){return{name:rack.typeName||rack.name||('Raf Tipi '+(index+1)),drawing:rack,rackCount:1,rafexSystem:rack.rafexSystem};});}catch(e){}
    return[];
  }

  function productRows(system){
    var labels={unitEach:'adet'};
    try{if(typeof m2ReportDictionary==='function')labels=m2ReportDictionary('tr')||labels;}catch(e){}
    var rows=new Map();
    usedTypes().filter(function(entry){return systemOfEntry(entry)===system;}).forEach(function(entry){
      var bom=[];try{if(typeof m2CorporateBomRows==='function')bom=m2CorporateBomRows(entry,labels)||[];}catch(e){}
      bom.forEach(function(row){
        var item=String(row.item||row.name||'Ürün'),spec=String(row.spec||''),unit=String(row.unit||labels.unitEach||'adet'),qty=Math.max(0,Number(row.qty)||0);if(!qty)return;
        var key=item+'|'+spec+'|'+unit;if(!rows.has(key))rows.set(key,{item:item,spec:spec,unit:unit,qty:0});rows.get(key).qty+=qty;
      });
    });
    return Array.from(rows.values()).sort(function(a,b){return a.item.localeCompare(b.item,'tr');});
  }

  function productSection(system,label,rows){
    var open=productOpen[system]?' open':'';
    var body=rows.length?rows.map(function(row){var spec=row.spec?'<small>'+escapeHtml(row.spec)+'</small>':'';return '<div class="rafex-system-product-row"><span><b>'+escapeHtml(row.item)+'</b>'+spec+'</span><strong>'+escapeHtml(Math.round(row.qty))+' '+escapeHtml(row.unit)+'</strong></div>';}).join(''):'<div class="rafex-system-product-empty">Bu sistem için yerleşime eklenmiş ürün bulunmuyor.</div>';
    return '<details class="rafex-system-product-disclosure" data-rafex-product-system="'+system+'"'+open+'><summary><span class="rafex-product-arrow">▶</span><b>'+escapeHtml(label)+'</b><span class="rafex-product-summary-count">'+rows.length+' SATIR</span></summary><div class="rafex-system-product-body">'+body+'</div></details>';
  }

  function renderSystemProductLists(){
    if(!freePage())return false;
    var host=document.getElementById('m2LayoutProductList');if(!host)return false;
    var b2bRows=productRows('b2b'),mekikRows=productRows('mekik2');
    host.classList.add('rafex-system-product-lists');
    host.innerHTML='<b class="rafex-product-list-title">ÜRÜN DÖKÜMLERİ</b>'+productSection('b2b','B2B ÜRÜN LİSTESİ',b2bRows)+productSection('mekik2','MEKİK ÜRÜN LİSTESİ',mekikRows);
    qsa(host,'details[data-rafex-product-system]').forEach(function(details){details.addEventListener('toggle',function(){var key=details.dataset.rafexProductSystem;if(!key)return;productOpen[key]=details.open;try{localStorage.setItem('rafex_free_product_disclosures_v1',JSON.stringify(productOpen));}catch(e){}});});
    return true;
  }

  function layoutSignature(){
    try{
      if(typeof m2LayoutState==='undefined'||!Array.isArray(m2LayoutState.racks))return'';
      return m2LayoutState.racks.map(function(rack){
        var layout=rack.b2bLayout||{},braces=Array.isArray(rack.seismicBraces)?rack.seismicBraces.length:0;
        return [rack.id,rack.rafexSystem||'',rack.typeName||'',rack.bays||0,rack.levels||0,rack.depth||0,layout.palletCount||0,layout.rowCount||0,rack.sharedFootWith||'',braces].join(':');
      }).join('|');
    }catch(e){return String(Date.now());}
  }

  function refreshProductsIfChanged(force){
    if(!freePage())return;
    var sig=layoutSignature();if(!force&&sig===lastLayoutSignature)return;lastLayoutSignature=sig;renderSystemProductLists();
  }

  function installProductHooks(){
    var originalList=null;try{if(typeof m2RenderLayoutProductList==='function')originalList=m2RenderLayoutProductList;}catch(e){}
    if(typeof originalList==='function'&&!originalList.__rafexImmediateSystemProducts){
      var wrappedList=function(){if(freePage())return renderSystemProductLists();return originalList.apply(this,arguments);};wrappedList.__rafexImmediateSystemProducts=true;
      try{m2RenderLayoutProductList=wrappedList;}catch(e){}try{window.m2RenderLayoutProductList=wrappedList;}catch(e){}
    }
    var originalLayout=null;try{if(typeof m2RenderLayout==='function')originalLayout=m2RenderLayout;}catch(e){}
    if(typeof originalLayout==='function'&&!originalLayout.__rafexImmediateSystemProducts){
      var wrappedLayout=function(){var result=originalLayout.apply(this,arguments);refreshProductsIfChanged(false);return result;};wrappedLayout.__rafexImmediateSystemProducts=true;
      try{m2RenderLayout=wrappedLayout;}catch(e){}try{window.m2RenderLayout=wrappedLayout;}catch(e){}
    }
  }

  function installSavedHook(){
    var original=null;try{if(typeof m2RenderSavedRackTypes==='function')original=m2RenderSavedRackTypes;}catch(e){}
    if(typeof original==='function'&&!original.__rafexGlobalSavedActions){
      var wrapped=function(){var result=original.apply(this,arguments);setTimeout(enhanceSavedControls,0);return result;};wrapped.__rafexGlobalSavedActions=true;
      try{m2RenderSavedRackTypes=wrapped;}catch(e){}try{window.m2RenderSavedRackTypes=wrapped;}catch(e){}
    }
    if(typeof window.rafexUnifiedCatalogSync==='function'&&!window.rafexUnifiedCatalogSync.__rafexGlobalSavedActions){
      var sync=window.rafexUnifiedCatalogSync;
      var wrappedSync=function(){var result=sync.apply(this,arguments);[0,40,120,300].forEach(function(delay){setTimeout(enhanceSavedControls,delay);});return result;};wrappedSync.__rafexGlobalSavedActions=true;window.rafexUnifiedCatalogSync=wrappedSync;
    }
  }

  function scheduleUi(){[0,40,120,300].forEach(function(delay){setTimeout(function(){normalizeOutputSelectors();enhanceSavedControls();refreshProductsIfChanged(false);},delay);});}

  document.addEventListener('click',function(event){
    var target=event.target&&event.target.closest?event.target.closest('button,[data-page],select'):null;if(!target)return;
    if(target.closest('#nav')||target.closest('#m2SavedTypesPanel')||target.id==='m2AddRack'||target.closest('[data-page]'))scheduleUi();
  },true);

  function boot(){installProductHooks();installSavedHook();normalizeOutputSelectors();enhanceSavedControls();refreshProductsIfChanged(true);scheduleUi();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();</script>`;

const closing = html.lastIndexOf("</body>");
if (closing < 0) throw new Error("Native output/free UX v2: </body> bulunamadi.");
html = html.slice(0, closing) + runtime + "\n" + html.slice(closing);

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.replace(match[0], `${match[1]}${match[2]}${encoded}${match[2]}`);
fs.writeFileSync(workerPath, worker);

const finalHtml = Buffer.from(encoded, "base64").toString("utf8");
for (const required of [marker, "Kurumsal Çıktı", "B2B ÜRÜN LİSTESİ", "MEKİK ÜRÜN LİSTESİ", "rafex-copy-pages", "data-rafex-unified-free-catalog=\"v1\""]) {
  if (!finalHtml.includes(required)) throw new Error(`Native output/free UX v2 dogrulama hatasi: ${required}`);
}
for (const removed of ['data-rafex-final-free-pdf-ux="v1"','data-rafex-mekik-output-halves="v1"','data-rafex-native-system-pdf-router="v1"']) {
  if (finalHtml.includes(removed)) throw new Error(`Native output/free UX v2: eski cikti runtime'i hala aktif: ${removed}`);
}
console.log("FINAL: B2B/Mekik native kurumsal ciktilari geri yuklendi; Kurumsal Cikti birinci ve varsayilan; kayitli tiplerde i/kopya ikonlari her yerde; Serbest Cizim urun listeleri anlik guncellenir (v2).");
