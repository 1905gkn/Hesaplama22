import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const workerPath = path.join(root, "dist/server/index.js");
const marker = 'data-rafex-user-20260819="v2"';

let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("HTML_BASE64 build çıktısında bulunamadı.");
let html = Buffer.from(match[3], "base64").toString("utf8");

// Aynı yama tekrar çalıştırılırsa eski sürümü temizle ve tek runtime bırak.
html = html.replace(/<script\s+data-rafex-user-20260819=["']v\d+["'][^>]*>[\s\S]*?<\/script>/gi, "");
html = html.replace(/<style\s+data-rafex-user-20260819-style=["']v\d+["'][^>]*>[\s\S]*?<\/style>/gi, "");

// Kesit Yer Belirleme: açıyı açık isimleriyle, artı/eksi yön bilgisiyle göster.
html = html.replaceAll(
  'if (angles) angles.textContent = `${Math.round(value.azimuth)}° / ${Math.round(value.elevation)}°`;',
  'if (angles) { const az=Math.round(value.azimuth), el=Math.round(value.elevation); angles.textContent = `Yatay açı: ${az}° · Yukarı/Aşağı: ${el>=0?"+":""}${el}°`; angles.dataset.azimuth=String(az); angles.dataset.elevation=String(el); }',
);
html = html.replaceAll(
  '<small data-rafex-angle-label style="margin-left:8px;color:#68736c">41° / 24°</small>',
  '<small data-rafex-angle-label data-azimuth="41" data-elevation="24" style="margin-left:8px;color:#68736c">Yatay açı: 41° · Yukarı/Aşağı: +24°</small>',
);

const runtime = `<script ${marker}>(function(){
  if(window.__rafexUser20260819V2)return;window.__rafexUser20260819V2=true;

  const num=(v,f=0)=>Number.isFinite(Number(v))?Number(v):f;
  const rackLevels=(rack)=>Math.max(1,Math.round(num(rack?.levels ?? rack?.b2b?.levels ?? rack?.b2bLayout?.levels,1)));
  const isDouble=(rack)=>Math.round(num(rack?.b2bLayout?.rowCount, rack?.b2b?.rowType==='double'?2:1))===2;
  const rowGap=(rack)=>Math.max(0,Math.round(num(rack?.b2bLayout?.rowGap ?? rack?.b2b?.rowGap,125)));
  const seismicInfo=(rack)=>isDouble(rack)?('KAT: '+rackLevels(rack)+' · ÇİFT SIRA ARASI: '+rowGap(rack)+' mm'):('KAT: '+rackLevels(rack)+' · TEK SIRA · BASIC 125 mm');
  const status=(text)=>{const node=document.getElementById('m2FloorStatus');if(node)node.textContent=text;};
  const seismicButton=()=>document.getElementById('m2SeismicButton');
  const braceCount=()=>{try{return (m2LayoutState?.racks||[]).reduce((sum,rack)=>sum+(Array.isArray(rack.seismicBraces)?rack.seismicBraces.length:0),0);}catch{return 0;}};

  // Çaprazın üstünde kat ve sıra bilgisi her zaman görünsün.
  try{
    const original=window.m2SeismicBraceSvg;
    if(typeof original==='function'&&!original.__rafexInfoV2){
      const wrapped=function(brace){
        const svg=original.apply(this,arguments);if(!svg)return svg;
        try{
          const racks=(brace?.rackIds||[]).map(id=>m2LayoutState?.racks?.find(r=>r.id===Number(id))).filter(Boolean);
          if(!racks.length)return svg;
          const x=racks.reduce((s,r)=>s+(num(r.x)+num(r.w)/2),0)/racks.length;
          const y=racks.reduce((s,r)=>s+(num(r.y)+num(r.h)/2),0)/racks.length;
          const label=seismicInfo(racks[0]);
          const text='<text x="'+x+'" y="'+(y+22)+'" text-anchor="middle" class="m2-layout-label rafex-seismic-info" style="font-size:12px;font-weight:900;fill:#173c2d;stroke:#fff;stroke-width:3px;paint-order:stroke">'+label+'</text>';
          return svg.replace(/<\\/g>\\s*$/,text+'</g>');
        }catch{return svg;}
      };wrapped.__rafexInfoV2=true;window.m2SeismicBraceSvg=wrapped;
    }
  }catch(e){console.warn('Deprem çaprazı bilgisi eklenemedi',e)}

  // Deprem çaprazı ekleme modu: her seçimden sonra açık kalır. ESC veya aynı buton kapatır.
  let seismicPlacementActive=false;
  let persistentType='light';
  const paintSeismicMode=()=>{
    const button=seismicButton();
    if(button){button.classList.toggle('active',seismicPlacementActive);button.setAttribute('aria-pressed',seismicPlacementActive?'true':'false');button.title=seismicPlacementActive?'Ekleme modunu kapatmak için tekrar tıkla veya ESC':'Deprem çaprazı ekle';}
  };
  const cancelPersistentSeismic=(message)=>{
    seismicPlacementActive=false;
    try{m2SeismicDraft=null;}catch{}
    paintSeismicMode();
    try{if(typeof m2RenderLayout==='function')m2RenderLayout();}catch{}
    if(message)status(message);
  };
  try{
    const originalOpen=window.m2OpenSeismicDialog;
    if(typeof originalOpen==='function'&&!originalOpen.__rafexPersistentV2){
      const wrapped=function(){
        if(seismicPlacementActive){cancelPersistentSeismic('Deprem çaprazı ekleme modu kapatıldı.');return;}
        return originalOpen.apply(this,arguments);
      };wrapped.__rafexPersistentV2=true;window.m2OpenSeismicDialog=wrapped;
    }
    const originalStart=window.m2StartSeismicPlacement;
    if(typeof originalStart==='function'&&!originalStart.__rafexPersistentV2){
      const wrapped=function(){
        const result=originalStart.apply(this,arguments);
        try{persistentType=m2SeismicDraft?.type||m2SeismicChoice||persistentType;}catch{}
        seismicPlacementActive=true;paintSeismicMode();
        status((persistentType==='heavy'?'Ağır':'Hafif')+' deprem çaprazı ekleme modu açık. Seçim yaptıktan sonra eklemeye devam edebilirsin; ESC veya aynı buton kapatır.');
        return result;
      };wrapped.__rafexPersistentV2=true;window.m2StartSeismicPlacement=wrapped;
    }
    const originalCommit=window.m2CommitSeismicArea;
    if(typeof originalCommit==='function'&&!originalCommit.__rafexPersistentV2){
      const wrapped=function(){
        let type=persistentType;try{type=m2SeismicDraft?.type||m2SeismicChoice||type;}catch{}
        const before=braceCount();
        const result=originalCommit.apply(this,arguments);
        if(seismicPlacementActive){
          persistentType=type==='heavy'?'heavy':'light';
          try{m2SeismicDraft={type:persistentType,start:null,hover:null};}catch{}
          paintSeismicMode();
          try{if(typeof m2RenderLayout==='function')m2RenderLayout();}catch{}
          const added=Math.max(0,braceCount()-before);
          status(added>0?(added+' adet '+(persistentType==='heavy'?'ağır':'hafif')+' deprem çaprazı eklendi. Ekleme modu açık; devam edebilirsin. ESC veya butona tekrar basarak kapat.'):'Bu seçimde yeni çapraz eklenmedi. Ekleme modu açık; tekrar seçim yapabilirsin.');
        }
        return result;
      };wrapped.__rafexPersistentV2=true;window.m2CommitSeismicArea=wrapped;
    }
    const originalClear=window.m2ClearAllSelections;
    if(typeof originalClear==='function'&&!originalClear.__rafexPersistentV2){
      const wrapped=function(){const result=originalClear.apply(this,arguments);if(seismicPlacementActive){seismicPlacementActive=false;paintSeismicMode();}return result;};wrapped.__rafexPersistentV2=true;window.m2ClearAllSelections=wrapped;
    }
  }catch(e){console.warn('Deprem çaprazı sürekli ekleme modu kurulamadı',e)}
  document.addEventListener('keydown',(event)=>{if(event.key==='Escape'&&seismicPlacementActive){seismicPlacementActive=false;paintSeismicMode();setTimeout(()=>status('Deprem çaprazı ekleme modu ESC ile kapatıldı.'),0);}},true);

  // Özelleştir: yalnız gerçek B2B aksesuarlarını kullan; palet önizlemesi her açılışta görünür başlasın.
  const removeLegacyAccessoryUi=()=>{document.querySelectorAll('[data-rafex-customize-accessories="1"]').forEach(node=>node.remove());};
  removeLegacyAccessoryUi();
  if(typeof window.m2EnsureCustomizeAccessories==='function')window.m2EnsureCustomizeAccessories=()=>null;
  new MutationObserver(removeLegacyAccessoryUi).observe(document.body,{childList:true,subtree:true});

  const syncCustomize=()=>{
    const modal=document.getElementById('m2CustomizeModal');if(!modal||modal.hidden)return;
    const palletCount=document.getElementById('m2CustomizePalletCount');if(palletCount){const v=Math.max(1,Math.min(4,Math.round(num(palletCount.value,1))));if(String(v)!==palletCount.value)palletCount.value=String(v);}
    const levels=document.getElementById('m2CustomizeLevels');if(levels){const v=Math.max(1,Math.min(15,Math.round(num(levels.value,1))));if(String(v)!==levels.value)levels.value=String(v);}
    const manual=document.getElementById('m2CustomizeManualLevels');
    const rows=document.getElementById('m2CustomizeLevelRows');if(rows)rows.hidden=!(manual?.checked===true);
    try{if(typeof m2RenderCustomizeLevelRows==='function')m2RenderCustomizeLevelRows();}catch{}
    try{window.m2RenderCustomizeRackAccessories?.();}catch{}
    const rowType=document.getElementById('m2CustomizeRowType');const gap=document.getElementById('m2CustomizeRowGap');if(gap)gap.disabled=rowType?.value!=='double';
    try{if(typeof m2PreviewRackCustomization==='function')m2PreviewRackCustomization();}catch{}
  };
  try{
    const originalOpenCustomize=window.m2OpenCustomizeModal;
    if(typeof originalOpenCustomize==='function'&&!originalOpenCustomize.__rafexUxV2){
      const wrapped=function(){
        const result=originalOpenCustomize.apply(this,arguments);
        setTimeout(()=>{
          try{window.m2SetCustomizePalletsVisible?.(true,false);}catch{}
          syncCustomize();
          try{if(typeof m2PreviewRackCustomization==='function')m2PreviewRackCustomization();}catch{}
        },0);
        return result;
      };wrapped.__rafexUxV2=true;window.m2OpenCustomizeModal=wrapped;
    }
    const originalEnableAccessory=window.m2EnableCustomizeRackAccessory;
    if(typeof originalEnableAccessory==='function'&&!originalEnableAccessory.__rafexUxV2){
      const wrapped=function(type){
        const result=originalEnableAccessory.apply(this,arguments);
        try{
          const item=window.m2CollectCustomizeRackAccessories?.().find(entry=>entry.type===type);
          if(item&&(!Array.isArray(item.levels)||item.levels.length===0))window.m2AllCustomizeRackAccessoryLevels?.(type);
          window.m2RenderCustomizeRackAccessories?.();
          if(typeof m2PreviewRackCustomization==='function')m2PreviewRackCustomization();
        }catch{}
        return result;
      };wrapped.__rafexUxV2=true;window.m2EnableCustomizeRackAccessory=wrapped;
    }
    const originalPalletToggle=window.m2ToggleCustomizePallets;
    if(typeof originalPalletToggle==='function'&&!originalPalletToggle.__rafexUxV2){
      const wrapped=function(){const result=originalPalletToggle.apply(this,arguments);requestAnimationFrame(()=>{try{if(typeof m2PreviewRackCustomization==='function')m2PreviewRackCustomization();}catch{}});return result;};wrapped.__rafexUxV2=true;window.m2ToggleCustomizePallets=wrapped;
    }
  }catch(e){console.warn('Özelleştir kontrol düzeltmeleri kurulamadı',e)}
  const customizeModal=document.getElementById('m2CustomizeModal');
  if(customizeModal){
    const fields=new Set(['m2CustomizePalletCount','m2CustomizeLevels','m2CustomizeManualLevels','m2CustomizePalletHeight','m2CustomizeRowType','m2CustomizeRowGap']);
    const onChange=(event)=>{if(fields.has(event.target?.id))requestAnimationFrame(syncCustomize);};
    customizeModal.addEventListener('input',onChange);
    customizeModal.addEventListener('change',onChange);
    new MutationObserver(()=>{if(customizeModal.hidden===false)requestAnimationFrame(syncCustomize);}).observe(customizeModal,{attributes:true,attributeFilter:['hidden']});
  }

  // Ağır deprem çaprazı ve düz arabağ dökümde kaybolursa ayrı toplam sayfasıyla garanti et.
  try{
    const originalPages=window.m2CorporateBomPages;
    if(typeof originalPages==='function'&&!originalPages.__rafexRequiredRowsV2){
      const wrapped=function(types,labels,combined){
        const pages=originalPages.apply(this,arguments)||[];
        try{
          const existing=pages.join(' ').toLocaleLowerCase('tr-TR');
          const source=typeof m2LayoutProductRows==='function'?m2LayoutProductRows():[];
          const wanted=[];
          source.forEach(row=>{
            const name=String(row?.name||'');const lower=name.toLocaleLowerCase('tr-TR');
            const isStraight=lower.startsWith('düz arabağ');const isHeavy=lower.startsWith('ağır deprem çaprazı');if(!isStraight&&!isHeavy)return;
            const key=isStraight?'düz arabağ':'ağır deprem çaprazı';if(existing.includes(key))return;
            wanted.push({item:name,spec:'Serbest yerleşim toplamı',qty:Math.max(0,num(row.qty,0)),unit:labels?.unitEach||'adet'});
          });
          if(wanted.length&&typeof m2CorporateBomTable==='function'&&typeof m2CorporateHeader==='function'){
            pages.push('<section class="m2-corporate-page rafex-required-bom-page">'+m2CorporateHeader('DEPREM ÇAPRAZI / DÜZ ARABAĞ DÖKÜMÜ')+'<div class="m2-corporate-bom-grid combined">'+m2CorporateBomTable('Zorunlu yerleşim ürünleri',wanted,labels,'Serbest yerleşim toplamı')+'</div></section>');
          }
        }catch(e){console.warn('Zorunlu döküm satırları hazırlanamadı',e)}
        return pages;
      };wrapped.__rafexRequiredRowsV2=true;window.m2CorporateBomPages=wrapped;
    }
  }catch(e){console.warn('Kurumsal döküm genişletilemedi',e)}

  paintSeismicMode();
})();</script>`;

const style = `<style data-rafex-user-20260819-style="v2">
.rafex-seismic-info{pointer-events:none}
#m2SeismicButton.active{background:#f2c500!important;color:#17201b!important;box-shadow:0 0 0 2px #cda900 inset!important}
.m2-corporate-bom-card h3{font-size:18px!important;line-height:1.2!important;padding:10px 12px!important}
.m2-corporate-bom-head{font-size:11.5px!important;font-weight:900!important}
.m2-corporate-bom-row{font-size:11.5px!important;min-height:34px!important;line-height:1.15!important}
.m2-corporate-bom-head span,.m2-corporate-bom-row span{padding:7px 8px!important}
.m2-corporate-bom-meta{font-size:11px!important;padding:8px 12px!important}
.rafex-required-bom-page .m2-corporate-bom-row{font-size:13px!important;min-height:42px!important}
[data-rafex-angle-label]{display:inline-block!important;margin-top:5px!important;padding:5px 8px!important;border-radius:6px!important;background:#edf2ee!important;color:#173c2d!important;font-size:10px!important;font-weight:900!important}
#m2CustomizeRowGap:disabled{opacity:.5!important;background:#eef1ee!important;cursor:not-allowed!important}
</style>`;

const bodyEnd=html.lastIndexOf("</body>");
if(bodyEnd<0)throw new Error("Portal </body> bulunamadı.");
html=html.slice(0,bodyEnd)+style+runtime+html.slice(bodyEnd);

if(!html.includes('Yatay açı: ${az}° · Yukarı/Aşağı:')) throw new Error('Kesit açı verisi eklenemedi.');
if(!html.includes('__rafexPersistentV2')||!html.includes('BASIC 125 mm')) throw new Error('Deprem sürekli ekleme/veri düzeltmesi eklenemedi.');
if(!html.includes('m2SetCustomizePalletsVisible?.(true,false)')||!html.includes('m2EnableCustomizeRackAccessory')) throw new Error('Özelleştir düzeltmeleri eklenemedi.');
if(!html.includes('DEPREM ÇAPRAZI / DÜZ ARABAĞ DÖKÜMÜ')) throw new Error('Döküm güvenlik sayfası eklenemedi.');

const encoded=Buffer.from(html,"utf8").toString("base64");
worker=worker.slice(0,match.index)+match[1]+match[2]+encoded+match[2]+worker.slice(match.index+match[0].length);
fs.writeFileSync(workerPath,worker);
