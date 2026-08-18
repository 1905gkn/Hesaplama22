import fs from "node:fs";
import path from "node:path";

const portalPath = path.join(process.cwd(), "portal.html");
let html = fs.readFileSync(portalPath, "utf8");

const modalStart = html.indexOf('id="m2CustomizeModal"');
const modalEnd = html.indexOf('id="m2SymbolModal"', modalStart);
if (modalStart < 0 || modalEnd < 0) throw new Error("Özelleştir modalı kaynak HTML içinde bulunamadı.");

const marker = 'data-rafex-customize-accessories="source-v1"';
const runtimeMarker = 'data-rafex-customize-accessories-runtime="source-v1"';

if (!html.includes(marker)) {
  const blockToken = '<label>Blok adı<input id="m2CustomizeBlockName"';
  const modalHtml = html.slice(modalStart, modalEnd);
  if (!modalHtml.includes(blockToken)) throw new Error("Özelleştir içindeki Blok adı alanı bulunamadı.");

  const section = `<section id="m2CustomizeAccessories" ${marker}>
    <div class="m2-customize-accessory-head">
      <div><b>AKSESUAR EKLE</b><small>Bu raf modülüne aksesuar ekle</small></div>
      <button type="button" onclick="m2ToggleCustomizeRackAccessories()">+ Aksesuar Ekle</button>
    </div>
    <div class="m2-customize-accessory-picker" id="m2CustomizeAccessoryPicker">
      <button type="button" onclick="m2AddCustomizeRackAccessory('palletStop')">Palet Dayama</button>
      <button type="button" onclick="m2AddCustomizeRackAccessory('hTraverse')">H Travers</button>
      <button type="button" onclick="m2AddCustomizeRackAccessory('tray')">Tava</button>
    </div>
    <div class="m2-customize-accessory-list" id="m2CustomizeAccessoryList"><div class="m2-customize-accessory-empty">Henüz aksesuar eklenmedi.</div></div>
  </section>`;

  const patchedModal = modalHtml.replace(blockToken, `${section}${blockToken}`);
  html = html.slice(0, modalStart) + patchedModal + html.slice(modalEnd);
}

if (!html.includes('data-rafex-customize-accessories-style="source-v1"')) {
  const style = `<style data-rafex-customize-accessories-style="source-v1">
#m2CustomizeModal .m2-customize-dialog aside{overflow-y:auto!important}
#m2CustomizeAccessories{display:block!important;visibility:visible!important;opacity:1!important;margin:9px 0 14px!important;padding:12px!important;border:2px solid #e0b900!important;border-radius:10px!important;background:#fff8d5!important;box-sizing:border-box!important;flex:0 0 auto!important}
#m2CustomizeAccessories .m2-customize-accessory-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
#m2CustomizeAccessories .m2-customize-accessory-head>div{display:grid;gap:2px;min-width:0}
#m2CustomizeAccessories .m2-customize-accessory-head b{font-size:12px;color:#173c2d;letter-spacing:.04em}
#m2CustomizeAccessories .m2-customize-accessory-head small{font-size:9px;color:#68736c}
#m2CustomizeAccessories .m2-customize-accessory-head>button{padding:8px 10px;border:0;border-radius:8px;background:#214f3b;color:#fff;font-size:10px;font-weight:900;cursor:pointer;white-space:nowrap}
#m2CustomizeAccessories .m2-customize-accessory-picker{display:none;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin-top:9px}
#m2CustomizeAccessories.open .m2-customize-accessory-picker{display:grid}
#m2CustomizeAccessories .m2-customize-accessory-picker button{padding:8px 5px;border:1px solid #d4ddd6;border-radius:7px;background:#fff;color:#173c2d;font-size:9px;font-weight:850;cursor:pointer}
#m2CustomizeAccessories .m2-customize-accessory-list{display:grid;gap:7px;margin-top:8px}
#m2CustomizeAccessories .m2-customize-accessory-empty{padding:7px;border:1px dashed #c7d1ca;border-radius:7px;background:#fffdf1;color:#78827c;text-align:center;font-size:9px}
#m2CustomizeAccessories .m2-customize-accessory-card{padding:8px;border:1px solid #d9e0db;border-radius:8px;background:#fff}
#m2CustomizeAccessories .m2-customize-accessory-card-head{display:flex;align-items:center;justify-content:space-between;gap:7px}
#m2CustomizeAccessories .m2-customize-accessory-card-head b{font-size:10px;color:#173c2d}
#m2CustomizeAccessories .m2-customize-accessory-remove{padding:5px 7px;border:0;border-radius:6px;background:#f3e7e7;color:#922f2f;font-size:8px;font-weight:800;cursor:pointer}
#m2CustomizeAccessories .m2-customize-accessory-level-title{display:flex;align-items:center;justify-content:space-between;gap:6px;margin-top:7px}
#m2CustomizeAccessories .m2-customize-accessory-level-title span{font-size:8px;color:#69756d;font-weight:850}
#m2CustomizeAccessories .m2-customize-accessory-level-title button{padding:4px 6px;border:1px solid #d3dbd5;border-radius:6px;background:#fff;color:#173c2d;font-size:8px;font-weight:800;cursor:pointer}
#m2CustomizeAccessories .m2-customize-accessory-levels{display:flex;flex-wrap:wrap;gap:4px;margin-top:5px}
#m2CustomizeAccessories .m2-customize-accessory-levels button{min-width:29px;padding:5px 6px;border:1px solid #d3ddd6;border-radius:6px;background:#fff;color:#173c2d;font-size:8px;font-weight:800;cursor:pointer}
#m2CustomizeAccessories .m2-customize-accessory-levels button.active{background:#214f3b;border-color:#214f3b;color:#fff}
#m2CustomizeAccessories .m2-customize-accessory-tray{display:flex;align-items:center;gap:4px;margin-top:7px}
#m2CustomizeAccessories .m2-customize-accessory-tray span{font-size:8px;color:#69756d;font-weight:850;margin-right:2px}
#m2CustomizeAccessories .m2-customize-accessory-tray button{padding:5px 6px;border:1px solid #d3ddd6;border-radius:6px;background:#fff;color:#173c2d;font-size:8px;font-weight:800;cursor:pointer}
#m2CustomizeAccessories .m2-customize-accessory-tray button.active{background:#f2c500;border-color:#d6b200;color:#17201b}
</style>`;
  const headEnd = html.indexOf("</head>");
  if (headEnd < 0) throw new Error("Portal </head> bulunamadı.");
  html = html.slice(0, headEnd) + style + html.slice(headEnd);
}

if (!html.includes(runtimeMarker)) {
  const runtime = `<script ${runtimeMarker}>
(function(){
  const TYPES={palletStop:'Palet Dayama',hTraverse:'H Travers',tray:'Tava'};
  let draft=[];
  const clone=(items)=>Array.isArray(items)?items.filter((item)=>TYPES[item?.type]).map((item)=>({type:item.type,levels:Array.isArray(item.levels)?[...new Set(item.levels.map(Number).filter(Number.isFinite))].sort((a,b)=>a-b):[],...(item.type==='tray'?{width:[200,250,300].includes(Number(item.width))?Number(item.width):300}:{})})):[];
  const levelCount=()=>Math.max(1,Math.min(15,Math.round(Number(document.getElementById('m2CustomizeLevels')?.value)||1)));
  const preview=()=>{try{if(typeof window.m2PreviewRackCustomization==='function')window.m2PreviewRackCustomization();}catch{}};

  window.m2CollectCustomizeRackAccessories=()=>clone(draft).map((item)=>({...item,levels:item.levels.filter((level)=>level>=1&&level<=levelCount())}));
  window.m2LoadCustomizeRackAccessories=(items)=>{draft=clone(items);window.m2RenderCustomizeRackAccessories();};
  window.m2ToggleCustomizeRackAccessories=()=>document.getElementById('m2CustomizeAccessories')?.classList.toggle('open');
  window.m2AddCustomizeRackAccessory=(type)=>{if(!TYPES[type])return;if(!draft.some((item)=>item.type===type))draft.push({type,levels:[],...(type==='tray'?{width:300}:{})});document.getElementById('m2CustomizeAccessories')?.classList.add('open');window.m2RenderCustomizeRackAccessories();preview();};
  window.m2RemoveCustomizeRackAccessory=(index)=>{draft.splice(Number(index)||0,1);window.m2RenderCustomizeRackAccessories();preview();};
  window.m2ToggleCustomizeRackAccessoryLevel=(index,level)=>{const item=draft[index];if(!item)return;const set=new Set(item.levels||[]);set.has(level)?set.delete(level):set.add(level);item.levels=[...set].sort((a,b)=>a-b);window.m2RenderCustomizeRackAccessories();preview();};
  window.m2AllCustomizeRackAccessoryLevels=(index)=>{const item=draft[index];if(!item)return;const count=levelCount();item.levels=(item.levels||[]).filter((level)=>level>=1&&level<=count).length===count?[]:Array.from({length:count},(_,i)=>i+1);window.m2RenderCustomizeRackAccessories();preview();};
  window.m2SetCustomizeRackTrayWidth=(index,width)=>{const item=draft[index];if(!item||item.type!=='tray')return;item.width=[200,250,300].includes(Number(width))?Number(width):300;window.m2RenderCustomizeRackAccessories();preview();};
  window.m2RenderCustomizeRackAccessories=()=>{
    const host=document.getElementById('m2CustomizeAccessoryList');if(!host)return;
    const count=levelCount();
    draft=draft.map((item)=>({...item,levels:(item.levels||[]).filter((level)=>level>=1&&level<=count)}));
    if(!draft.length){host.innerHTML='<div class="m2-customize-accessory-empty">Henüz aksesuar eklenmedi.</div>';return;}
    host.innerHTML=draft.map((item,index)=>{
      const selected=new Set(item.levels||[]);
      const levels=Array.from({length:count},(_,i)=>i+1).map((level)=>'<button type="button" class="'+(selected.has(level)?'active':'')+'" onclick="m2ToggleCustomizeRackAccessoryLevel('+index+','+level+')">K'+level+'</button>').join('');
      const tray=item.type==='tray'?'<div class="m2-customize-accessory-tray"><span>Tava eni</span>'+[200,250,300].map((width)=>'<button type="button" class="'+(Number(item.width)===width?'active':'')+'" onclick="m2SetCustomizeRackTrayWidth('+index+','+width+')">'+width+' mm</button>').join('')+'</div>':'';
      return '<div class="m2-customize-accessory-card"><div class="m2-customize-accessory-card-head"><b>'+TYPES[item.type]+'</b><button type="button" class="m2-customize-accessory-remove" onclick="m2RemoveCustomizeRackAccessory('+index+')">Kaldır</button></div>'+tray+'<div class="m2-customize-accessory-level-title"><span>Eklenecek katlar</span><button type="button" onclick="m2AllCustomizeRackAccessoryLevels('+index+')">'+(selected.size===count?'Tümünü Kaldır':'Tüm Katlar')+'</button></div><div class="m2-customize-accessory-levels">'+levels+'</div></div>';
    }).join('');
  };
})();
</script>`;
  const bodyEnd = html.lastIndexOf("</body>");
  if (bodyEnd < 0) throw new Error("Portal </body> bulunamadı.");
  html = html.slice(0, bodyEnd) + runtime + html.slice(bodyEnd);
}

const openNeedle = '        $("m2CustomizeModal").hidden=false;';
const openReplacement = '        if(typeof m2LoadCustomizeRackAccessories==="function")m2LoadCustomizeRackAccessories(Array.isArray(rack.b2b?.accessories)?rack.b2b.accessories:[]);\n        $("m2CustomizeModal").hidden=false;';
if (!html.includes(openReplacement)) {
  const openIndex = html.indexOf(openNeedle);
  if (openIndex < 0) throw new Error("Özelleştir açılış satırı bulunamadı.");
  html = html.slice(0, openIndex) + openReplacement + html.slice(openIndex + openNeedle.length);
}

const saveNeedle = ':0};rack.sideUprightHeight=m2B2BCalculatedFootHeight(rack);';
const saveReplacement = ':0};if(typeof m2CollectCustomizeRackAccessories==="function")rack.b2b.accessories=m2CollectCustomizeRackAccessories();rack.sideUprightHeight=m2B2BCalculatedFootHeight(rack);';
if (!html.includes(saveReplacement)) {
  if (!html.includes(saveNeedle)) throw new Error("Özelleştir aksesuar kaydetme noktası bulunamadı.");
  html = html.replace(saveNeedle, saveReplacement);
}

const previewNeedle = 'options.straightTiePositions=options.rowType==="double"?b2bStraightTiePositions(footHeight):[];window.RafexB2BViewer?.update(options);';
const previewReplacement = 'options.straightTiePositions=options.rowType==="double"?b2bStraightTiePositions(footHeight):[];if(typeof m2CollectCustomizeRackAccessories==="function")options.accessories=m2CollectCustomizeRackAccessories();window.RafexB2BViewer?.update(options);';
if (!html.includes(previewReplacement)) {
  if (!html.includes(previewNeedle)) throw new Error("Özelleştir 3D önizleme aksesuar noktası bulunamadı.");
  html = html.replace(previewNeedle, previewReplacement);
}

const levelNeedle = 'oninput="m2RenderCustomizeLevelRows();m2PreviewRackCustomization()"';
const levelReplacement = 'oninput="m2RenderCustomizeLevelRows();m2RenderCustomizeRackAccessories?.();m2PreviewRackCustomization()"';
if (!html.includes(levelReplacement) && html.includes(levelNeedle)) html = html.replace(levelNeedle, levelReplacement);

const verifyStart = html.indexOf('id="m2CustomizeModal"');
const verifyEnd = html.indexOf('id="m2SymbolModal"', verifyStart);
const verifyModal = html.slice(verifyStart, verifyEnd);
const accessoryIndex = verifyModal.indexOf(marker);
const blockIndex = verifyModal.indexOf('id="m2CustomizeBlockName"');
if (accessoryIndex < 0 || blockIndex < 0 || accessoryIndex > blockIndex) throw new Error("AKSESUAR EKLE, Özelleştir panelinde Blok adı üstüne yerleşmedi.");
if (!html.includes('m2CollectCustomizeRackAccessories') || !html.includes('m2LoadCustomizeRackAccessories')) throw new Error("Özelleştir aksesuar runtime fonksiyonları eklenemedi.");
if (!html.includes('rack.b2b.accessories=m2CollectCustomizeRackAccessories()')) throw new Error("Özelleştir aksesuar kaydı bağlanamadı.");

fs.writeFileSync(portalPath, html);
console.log("Özelleştir > Aksesuar Ekle kaynak modala yerleştirildi.");
