import fs from "node:fs";
import path from "node:path";

const portalPath = path.join(process.cwd(), "portal.html");
let html = fs.readFileSync(portalPath, "utf8");

const modalStart = html.indexOf('id="m2CustomizeModal"');
const modalEnd = html.indexOf('id="m2SymbolModal"', modalStart);
if (modalStart < 0 || modalEnd < 0) throw new Error("Özelleştir modalı kaynak HTML içinde bulunamadı.");

const marker = 'data-rafex-customize-accessories="source-v2"';
const runtimeMarker = 'data-rafex-customize-accessories-runtime="source-v2"';

if (!html.includes(marker)) {
  const blockToken = '<label>Blok adı<input id="m2CustomizeBlockName"';
  const modalHtml = html.slice(modalStart, modalEnd);
  if (!modalHtml.includes(blockToken)) throw new Error("Özelleştir içindeki Blok adı alanı bulunamadı.");

  const section = `<div class="m2-customize-extra-controls" ${marker}>
    <section id="m2CustomizePalletVisibility" class="m2-customize-pallet-visibility">
      <div><b>PALETLER</b><small>3D önizlemede paletleri göster veya kaldır</small></div>
      <button id="m2CustomizePalletVisibilityButton" type="button" aria-pressed="true" onclick="m2ToggleCustomizePallets()">PALETLERİ GİZLE</button>
    </section>
    <section id="m2CustomizeAccessories" class="m2-customize-accessories">
      <button type="button" class="m2-customize-section-head" aria-expanded="false" onclick="m2ToggleCustomizeAccessoriesSection()">
        <span><b>AKSESUAR EKLE</b><small>Palet Dayama · H Travers · Tava</small></span><i>⌄</i>
      </button>
      <div class="m2-customize-accessory-list" id="m2CustomizeAccessoryList"></div>
    </section>
  </div>`;

  const patchedModal = modalHtml.replace(blockToken, `${section}${blockToken}`);
  html = html.slice(0, modalStart) + patchedModal + html.slice(modalEnd);
}

if (!html.includes('data-rafex-customize-accessories-style="source-v2"')) {
  const style = `<style data-rafex-customize-accessories-style="source-v2">
#m2CustomizeModal .m2-customize-dialog aside{overflow-y:auto!important}
.m2-customize-extra-controls{display:grid;gap:8px;margin:9px 0 14px}
.m2-customize-pallet-visibility{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:9px;padding:10px 11px;border:1px solid #d8e1db;border-radius:10px;background:#f7faf8}
.m2-customize-pallet-visibility>div{display:grid;gap:2px;min-width:0}
.m2-customize-pallet-visibility b{font-size:10px;color:#173c2d;letter-spacing:.05em}
.m2-customize-pallet-visibility small{font-size:8px;color:#718078}
#m2CustomizePalletVisibilityButton{min-height:34px;padding:7px 9px;border:1px solid #214f3b;border-radius:8px;background:#214f3b;color:#fff;font-size:8px;font-weight:900;white-space:nowrap;cursor:pointer;pointer-events:auto!important}
#m2CustomizePalletVisibilityButton[aria-pressed="false"]{background:#fff;color:#214f3b}
#m2CustomizeAccessories{display:block!important;visibility:visible!important;opacity:1!important;border:1px solid #d8e1db;border-radius:10px;background:#fff;overflow:hidden;pointer-events:auto!important}
#m2CustomizeAccessories button{cursor:pointer;pointer-events:auto!important}
#m2CustomizeAccessories .m2-customize-section-head{width:100%;min-height:46px;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 11px;border:0;border-radius:0;background:#f7faf8;color:#173c2d;text-align:left}
#m2CustomizeAccessories .m2-customize-section-head>span{display:grid;gap:2px;min-width:0}
#m2CustomizeAccessories .m2-customize-section-head b{font-size:11px;letter-spacing:.05em}
#m2CustomizeAccessories .m2-customize-section-head small{font-size:8px;color:#718078}
#m2CustomizeAccessories .m2-customize-section-head i{font-style:normal;font-size:16px;line-height:1;transition:transform .16s ease}
#m2CustomizeAccessories.open .m2-customize-section-head i{transform:rotate(180deg)}
#m2CustomizeAccessories .m2-customize-accessory-list{display:none;gap:7px;padding:8px;background:#fff}
#m2CustomizeAccessories.open .m2-customize-accessory-list{display:grid}
#m2CustomizeAccessories .m2-customize-accessory-card{border:1px solid #e1e7e3;border-radius:8px;background:#fff;overflow:hidden}
#m2CustomizeAccessories .m2-customize-accessory-type-head{width:100%;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 10px;border:0;border-radius:0;background:#fbfcfb;color:#173c2d;text-align:left}
#m2CustomizeAccessories .m2-customize-accessory-type-head>span:first-child{font-size:9px;font-weight:900}
#m2CustomizeAccessories .m2-customize-accessory-type-head .state{margin-left:auto;padding:3px 6px;border-radius:999px;background:#edf2ee;color:#5d6d63;font-size:7px;font-weight:900}
#m2CustomizeAccessories .m2-customize-accessory-card.enabled .m2-customize-accessory-type-head .state{background:#dff0e6;color:#17643f}
#m2CustomizeAccessories .m2-customize-accessory-type-head i{font-style:normal;font-size:14px;line-height:1;transition:transform .16s ease}
#m2CustomizeAccessories .m2-customize-accessory-card.open .m2-customize-accessory-type-head i{transform:rotate(180deg)}
#m2CustomizeAccessories .m2-customize-accessory-body{display:none;padding:9px;border-top:1px solid #e7ece9;background:#fff}
#m2CustomizeAccessories .m2-customize-accessory-card.open .m2-customize-accessory-body{display:grid;gap:8px}
#m2CustomizeAccessories .m2-customize-accessory-enable{width:100%;min-height:34px;padding:8px;border:1px dashed #9db1a4;border-radius:7px;background:#f7faf8;color:#173c2d;font-size:8px;font-weight:900}
#m2CustomizeAccessories .m2-customize-accessory-remove{justify-self:end;padding:6px 8px;border:0;border-radius:6px;background:#f3e7e7;color:#922f2f;font-size:8px;font-weight:850}
#m2CustomizeAccessories .m2-customize-accessory-level-title{display:flex;align-items:center;justify-content:space-between;gap:6px}
#m2CustomizeAccessories .m2-customize-accessory-level-title span{font-size:8px;color:#69756d;font-weight:850}
#m2CustomizeAccessories .m2-customize-accessory-level-title button{padding:5px 7px;border:1px solid #d3dbd5;border-radius:6px;background:#fff;color:#173c2d;font-size:8px;font-weight:800}
#m2CustomizeAccessories .m2-customize-accessory-levels{display:flex;flex-wrap:wrap;gap:4px}
#m2CustomizeAccessories .m2-customize-accessory-levels button{min-width:30px;padding:5px 6px;border:1px solid #d3ddd6;border-radius:6px;background:#fff;color:#173c2d;font-size:8px;font-weight:800}
#m2CustomizeAccessories .m2-customize-accessory-levels button.active{background:#214f3b;border-color:#214f3b;color:#fff}
#m2CustomizeAccessories .m2-customize-accessory-tray{display:flex;align-items:center;gap:4px;flex-wrap:wrap}
#m2CustomizeAccessories .m2-customize-accessory-tray span{font-size:8px;color:#69756d;font-weight:850;margin-right:2px}
#m2CustomizeAccessories .m2-customize-accessory-tray button{padding:5px 7px;border:1px solid #d3ddd6;border-radius:6px;background:#fff;color:#173c2d;font-size:8px;font-weight:800}
#m2CustomizeAccessories .m2-customize-accessory-tray button.active{background:#f2c500;border-color:#d6b200;color:#17201b}
@media(max-width:760px){.m2-customize-pallet-visibility{grid-template-columns:1fr}.m2-customize-pallet-visibility button{width:100%}#m2CustomizeAccessories .m2-customize-section-head{min-height:48px}#m2CustomizeAccessories .m2-customize-accessory-type-head{min-height:44px}#m2CustomizeAccessories .m2-customize-accessory-levels button{min-width:42px;min-height:42px;font-size:10px}}
</style>`;
  const headEnd = html.indexOf("</head>");
  if (headEnd < 0) throw new Error("Portal </head> bulunamadı.");
  html = html.slice(0, headEnd) + style + html.slice(headEnd);
}

if (!html.includes(runtimeMarker)) {
  const runtime = `<script ${runtimeMarker}>
(function(){
  const TYPES={palletStop:'Palet Dayama',hTraverse:'H Travers',tray:'Tava'};
  const typeKeys=Object.keys(TYPES);
  let draft=[];
  let expandedType=null;
  let palletsVisible=true;
  const clone=(items)=>Array.isArray(items)?items.filter((item)=>TYPES[item?.type]).map((item)=>({type:item.type,levels:Array.isArray(item.levels)?[...new Set(item.levels.map(Number).filter(Number.isFinite))].sort((a,b)=>a-b):[],...(item.type==='tray'?{width:[200,250,300].includes(Number(item.width))?Number(item.width):300}:{})})):[];
  const levelCount=()=>Math.max(1,Math.min(15,Math.round(Number(document.getElementById('m2CustomizeLevels')?.value)||1)));
  const preview=()=>{try{if(typeof window.m2PreviewRackCustomization==='function')window.m2PreviewRackCustomization();}catch{}try{window.RafexB2BViewer?.update({showPallets:palletsVisible,accessories:clone(draft)});}catch{}};
  const itemFor=(type)=>draft.find((item)=>item.type===type)||null;
  const setSectionOpen=(open)=>{const section=document.getElementById('m2CustomizeAccessories');if(!section)return;section.classList.toggle('open',!!open);section.querySelector('.m2-customize-section-head')?.setAttribute('aria-expanded',String(!!open));};
  const renderPalletButton=()=>{const button=document.getElementById('m2CustomizePalletVisibilityButton');if(!button)return;button.textContent=palletsVisible?'PALETLERİ GİZLE':'PALETLERİ GÖSTER';button.setAttribute('aria-pressed',String(palletsVisible));};

  window.m2CustomizePalletsVisible=()=>palletsVisible;
  window.m2SetCustomizePalletsVisible=(value,doPreview=true)=>{palletsVisible=value!==false;renderPalletButton();if(doPreview)preview();};
  window.m2ToggleCustomizePallets=()=>{palletsVisible=!palletsVisible;renderPalletButton();preview();};
  window.m2ToggleCustomizeAccessoriesSection=()=>{const section=document.getElementById('m2CustomizeAccessories');setSectionOpen(!section?.classList.contains('open'));if(section?.classList.contains('open'))window.m2RenderCustomizeRackAccessories();};

  window.m2CollectCustomizeRackAccessories=()=>clone(draft).map((item)=>({...item,levels:item.levels.filter((level)=>level>=1&&level<=levelCount())}));
  window.m2LoadCustomizeRackAccessories=(items)=>{draft=clone(items);expandedType=null;setSectionOpen(false);window.m2RenderCustomizeRackAccessories();};
  window.m2ToggleCustomizeRackAccessoryPanel=(type)=>{if(!TYPES[type])return;expandedType=expandedType===type?null:type;setSectionOpen(true);window.m2RenderCustomizeRackAccessories();};
  window.m2EnableCustomizeRackAccessory=(type)=>{if(!TYPES[type])return;if(!itemFor(type))draft.push({type,levels:[],...(type==='tray'?{width:300}:{})});expandedType=type;setSectionOpen(true);window.m2RenderCustomizeRackAccessories();preview();};
  window.m2RemoveCustomizeRackAccessory=(type)=>{draft=draft.filter((item)=>item.type!==type);expandedType=type;window.m2RenderCustomizeRackAccessories();preview();};
  window.m2ToggleCustomizeRackAccessoryLevel=(type,level)=>{const item=itemFor(type);if(!item)return;const set=new Set(item.levels||[]);set.has(level)?set.delete(level):set.add(level);item.levels=[...set].sort((a,b)=>a-b);window.m2RenderCustomizeRackAccessories();preview();};
  window.m2AllCustomizeRackAccessoryLevels=(type)=>{const item=itemFor(type);if(!item)return;const count=levelCount();item.levels=(item.levels||[]).filter((level)=>level>=1&&level<=count).length===count?[]:Array.from({length:count},(_,i)=>i+1);window.m2RenderCustomizeRackAccessories();preview();};
  window.m2SetCustomizeRackTrayWidth=(type,width)=>{const item=itemFor(type);if(!item||item.type!=='tray')return;item.width=[200,250,300].includes(Number(width))?Number(width):300;window.m2RenderCustomizeRackAccessories();preview();};
  window.m2RenderCustomizeRackAccessories=()=>{
    const host=document.getElementById('m2CustomizeAccessoryList');if(!host)return;
    const count=levelCount();
    draft=draft.map((item)=>({...item,levels:(item.levels||[]).filter((level)=>level>=1&&level<=count)}));
    host.innerHTML=Object.entries(TYPES).map(([type,title])=>{
      const item=itemFor(type),enabled=!!item,open=expandedType===type;
      let body='<button type="button" class="m2-customize-accessory-enable">BU AKSESUARI EKLE</button>';
      if(item){
        const selected=new Set(item.levels||[]);
        const levels=Array.from({length:count},(_,i)=>i+1).map((level)=>'<button type="button" class="'+(selected.has(level)?'active':'')+'">K'+level+'</button>').join('');
        const tray=type==='tray'?'<div class="m2-customize-accessory-tray"><span>Tava eni</span>'+[200,250,300].map((width)=>'<button type="button" class="'+(Number(item.width)===width?'active':'')+'">'+width+' mm</button>').join('')+'</div>':'';
        body=tray+'<div class="m2-customize-accessory-level-title"><span>Eklenecek katlar</span><button type="button">'+(selected.size===count?'Tümünü Kaldır':'Tüm Katlar')+'</button></div><div class="m2-customize-accessory-levels">'+levels+'</div><button type="button" class="m2-customize-accessory-remove">Aksesuarı Kaldır</button>';
      }
      return '<div class="m2-customize-accessory-card '+(enabled?'enabled ':'')+(open?'open':'')+'" data-accessory-type="'+type+'"><button type="button" class="m2-customize-accessory-type-head" aria-expanded="'+String(open)+'"><span>'+title+'</span><span class="state">'+(enabled?'EKLİ':'EKLE')+'</span><i>⌄</i></button><div class="m2-customize-accessory-body">'+body+'</div></div>';
    }).join('');
  };

  document.addEventListener('click',(event)=>{
    const target=event.target instanceof Element?event.target:null;if(!target)return;
    const palletButton=target.closest('#m2CustomizePalletVisibilityButton');
    if(palletButton){event.preventDefault();event.stopPropagation();window.m2ToggleCustomizePallets();return;}
    const sectionHead=target.closest('#m2CustomizeAccessories > .m2-customize-section-head');
    if(sectionHead){event.preventDefault();event.stopPropagation();window.m2ToggleCustomizeAccessoriesSection();return;}
    const card=target.closest('#m2CustomizeAccessories .m2-customize-accessory-card');
    if(!card)return;
    const type=card.dataset.accessoryType||typeKeys[[...card.parentElement?.children||[]].indexOf(card)];if(!TYPES[type])return;
    const typeHead=target.closest('.m2-customize-accessory-type-head');
    if(typeHead){event.preventDefault();event.stopPropagation();window.m2ToggleCustomizeRackAccessoryPanel(type);return;}
    if(target.closest('.m2-customize-accessory-enable')){event.preventDefault();event.stopPropagation();window.m2EnableCustomizeRackAccessory(type);return;}
    if(target.closest('.m2-customize-accessory-remove')){event.preventDefault();event.stopPropagation();window.m2RemoveCustomizeRackAccessory(type);return;}
    const levelButton=target.closest('.m2-customize-accessory-levels button');
    if(levelButton){event.preventDefault();event.stopPropagation();const level=Number((levelButton.textContent||'').replace(/\D/g,''));if(level)window.m2ToggleCustomizeRackAccessoryLevel(type,level);return;}
    if(target.closest('.m2-customize-accessory-level-title button')){event.preventDefault();event.stopPropagation();window.m2AllCustomizeRackAccessoryLevels(type);return;}
    const trayButton=target.closest('.m2-customize-accessory-tray button');
    if(trayButton){event.preventDefault();event.stopPropagation();const width=Number((trayButton.textContent||'').replace(/\D/g,''));window.m2SetCustomizeRackTrayWidth(type,width);}
  },true);
})();
</script>`;
  const bodyEnd = html.lastIndexOf("</body>");
  if (bodyEnd < 0) throw new Error("Portal </body> bulunamadı.");
  html = html.slice(0, bodyEnd) + runtime + html.slice(bodyEnd);
}

const openNeedle = '        $("m2CustomizeModal").hidden=false;';
const openReplacement = '        if(typeof m2LoadCustomizeRackAccessories==="function")m2LoadCustomizeRackAccessories(Array.isArray(rack.b2b?.accessories)?rack.b2b.accessories:[]);\
        if(typeof m2SetCustomizePalletsVisible==="function")m2SetCustomizePalletsVisible(rack.b2b?.showPallets!==false,false);\
        $("m2CustomizeModal").hidden=false;';
if (!html.includes(openReplacement)) {
  const openIndex = html.indexOf(openNeedle);
  if (openIndex < 0) throw new Error("Özelleştir açılış satırı bulunamadı.");
  html = html.slice(0, openIndex) + openReplacement + html.slice(openIndex + openNeedle.length);
}

const saveNeedle = ':0};rack.sideUprightHeight=m2B2BCalculatedFootHeight(rack);';
const saveReplacement = ':0};if(typeof m2CollectCustomizeRackAccessories==="function")rack.b2b.accessories=m2CollectCustomizeRackAccessories();if(typeof m2CustomizePalletsVisible==="function")rack.b2b.showPallets=m2CustomizePalletsVisible();rack.sideUprightHeight=m2B2BCalculatedFootHeight(rack);';
if (!html.includes(saveReplacement)) {
  if (!html.includes(saveNeedle)) throw new Error("Özelleştir aksesuar/palet kaydetme noktası bulunamadı.");
  html = html.replace(saveNeedle, saveReplacement);
}

const previewNeedle = 'options.straightTiePositions=options.rowType==="double"?b2bStraightTiePositions(footHeight):[];window.RafexB2BViewer?.update(options);';
const previewReplacement = 'options.straightTiePositions=options.rowType==="double"?b2bStraightTiePositions(footHeight):[];if(typeof m2CollectCustomizeRackAccessories==="function")options.accessories=m2CollectCustomizeRackAccessories();if(typeof m2CustomizePalletsVisible==="function")options.showPallets=m2CustomizePalletsVisible();window.RafexB2BViewer?.update(options);';
if (!html.includes(previewReplacement)) {
  if (!html.includes(previewNeedle)) throw new Error("Özelleştir 3D önizleme aksesuar/palet noktası bulunamadı.");
  html = html.replace(previewNeedle, previewReplacement);
}

const rackOptionNeedle = 'showPallets:true};';
const rackOptionReplacement = 'showPallets:state.showPallets!==false};';
if (!html.includes(rackOptionReplacement)) {
  if (!html.includes(rackOptionNeedle)) throw new Error("Özelleştir palet görünürlük varsayılanı bulunamadı.");
  html = html.replace(rackOptionNeedle, rackOptionReplacement);
}

const levelNeedle = 'oninput="m2RenderCustomizeLevelRows();m2PreviewRackCustomization()"';
const levelReplacement = 'oninput="m2RenderCustomizeLevelRows();m2RenderCustomizeRackAccessories?.();m2PreviewRackCustomization()"';
if (!html.includes(levelReplacement) && html.includes(levelNeedle)) html = html.replace(levelNeedle, levelReplacement);

const verifyStart = html.indexOf('id="m2CustomizeModal"');
const verifyEnd = html.indexOf('id="m2SymbolModal"', verifyStart);
const verifyModal = html.slice(verifyStart, verifyEnd);
const accessoryIndex = verifyModal.indexOf(marker);
const blockIndex = verifyModal.indexOf('id="m2CustomizeBlockName"');
if (accessoryIndex < 0 || blockIndex < 0 || accessoryIndex > blockIndex) throw new Error("Özelleştir ek kontrolleri Blok adı üstüne yerleşmedi.");
if (!verifyModal.includes('m2CustomizePalletVisibilityButton') || !verifyModal.includes('m2CustomizeAccessoryList')) throw new Error("Özelleştir palet/aksesuar kontrolleri bulunamadı.");
if (!html.includes('m2CollectCustomizeRackAccessories') || !html.includes('m2CustomizePalletsVisible')) throw new Error("Özelleştir runtime fonksiyonları eklenemedi.");
if (!html.includes('rack.b2b.accessories=m2CollectCustomizeRackAccessories()') || !html.includes('rack.b2b.showPallets=m2CustomizePalletsVisible()')) throw new Error("Özelleştir kaydı bağlanamadı.");

fs.writeFileSync(portalPath, html);
console.log("Özelleştir > Palet görünürlüğü ve aksesuar kontrolleri etkileşimli olarak bağlandı.");
