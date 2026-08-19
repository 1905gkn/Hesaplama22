import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("HTML_BASE64 build çıktısında bulunamadı.");
let html = Buffer.from(match[3], "base64").toString("utf8");

html = html.replace(/<script\s+data-rafex-customize-auto-types=["']v\d+["'][^>]*>[\s\S]*?<\/script>/gi, "");
html = html.replace(/<style\s+data-rafex-customize-auto-types-style=["']v\d+["'][^>]*>[\s\S]*?<\/style>/gi, "");

const style = `<style data-rafex-customize-auto-types-style="v1">
.rafex-custom-type-select{display:grid;gap:5px;margin:8px 0 10px;padding:10px;border:1px solid #d8dfda;border-radius:9px;background:#f7faf8;color:#536058;font-size:10px;font-weight:800}
.rafex-custom-type-select select{width:100%;padding:9px 10px;border:1px solid #d8dfda;border-radius:8px;background:#fff;color:#17201b;font:700 11px Arial,sans-serif}
.rafex-custom-type-select small{color:#738078;font-size:9px;font-weight:600;line-height:1.35}
#m2CustomizeName{pointer-events:none;background:#eef2ef!important;color:#59645d!important}
</style>`;

const script = `<script data-rafex-customize-auto-types="v1">
(function(){
  if(window.__rafexCustomizeAutoTypesV1)return;
  window.__rafexCustomizeAutoTypesV1=true;

  let openingSnapshot=null;
  let explicitTypeName='';
  const byId=(id)=>document.getElementById(id);
  const clone=(value)=>JSON.parse(JSON.stringify(value==null?null:value));
  const normalizeText=(value)=>String(value??'').trim();
  const normalizeAccessories=(items)=>Array.isArray(items)?items.map((item)=>({name:normalizeText(item?.name),code:normalizeText(item?.code).toUpperCase(),qty:Math.max(1,Math.round(Number(item?.qty)||1))})).filter((item)=>item.name||item.code).sort((a,b)=>(a.name+'|'+a.code+'|'+a.qty).localeCompare(b.name+'|'+b.code+'|'+b.qty,'tr')):[];
  const normalizeLevels=(items)=>Array.isArray(items)?items.map((item)=>({interval:Math.max(0,Math.round(Number(item?.interval)||0)),palletHeight:Math.max(300,Math.round(Number(item?.palletHeight)||1200))})):[];
  const stable=(value)=>JSON.stringify(value);

  function signatureFromRack(rack){
    const layout=rack?.b2bLayout||{},state=rack?.b2b||{};
    return stable({
      levels:Math.max(1,Math.round(Number(rack?.levels)||Number(state.levels)||1)),
      palletHeight:Math.max(300,Math.round(Number(rack?.palletHeight)||Number(state.palletHeight)||1200)),
      rowType:Number(layout.rowCount)===2||state.rowType==='double'?'double':'single',
      rowGap:Math.max(0,Math.round(Number(layout.rowGap??state.rowGap??0))),
      customLevels:normalizeLevels(state.customLevels),
      accessories:normalizeAccessories(rack?.accessories)
    });
  }

  function signatureFromDrawing(drawing){
    const layout=drawing?.b2bLayout||{},state=drawing?.b2b||{};
    return stable({
      levels:Math.max(1,Math.round(Number(drawing?.levels)||Number(state.levels)||1)),
      palletHeight:Math.max(300,Math.round(Number(drawing?.palletHeight)||Number(state.palletHeight)||1200)),
      rowType:Number(layout.rowCount)===2||state.rowType==='double'?'double':'single',
      rowGap:Math.max(0,Math.round(Number(layout.rowGap??state.rowGap??0))),
      customLevels:normalizeLevels(state.customLevels),
      accessories:normalizeAccessories(drawing?.accessories)
    });
  }

  function signatureFromForm(){
    let accessories=[];
    try{if(typeof window.m2CollectCustomizeAccessories==='function')accessories=window.m2CollectCustomizeAccessories();}catch{}
    let customLevels=[];
    try{if(byId('m2CustomizeManualLevels')?.checked&&typeof m2CustomizeLevelData==='function')customLevels=m2CustomizeLevelData();}catch{}
    return stable({
      levels:Math.max(1,Math.round(Number(byId('m2CustomizeLevels')?.value)||1)),
      palletHeight:Math.max(300,Math.round(Number(byId('m2CustomizePalletHeight')?.value)||1200)),
      rowType:byId('m2CustomizeRowType')?.value==='double'?'double':'single',
      rowGap:Math.max(0,Math.round(Number(byId('m2CustomizeRowGap')?.value)||0)),
      customLevels:normalizeLevels(customLevels),
      accessories:normalizeAccessories(accessories)
    });
  }

  function lettersToNumber(text){
    const clean=normalizeText(text).toUpperCase().replace(/\s*T[İI]P[İI]\s*$/u,'');
    if(!/^[A-Z]+$/.test(clean))return 0;
    let value=0;for(const char of clean)value=value*26+(char.charCodeAt(0)-64);return value;
  }
  function numberToLetters(value){
    let number=Math.max(1,Math.round(Number(value)||1)),out='';
    while(number>0){number-=1;out=String.fromCharCode(65+(number%26))+out;number=Math.floor(number/26);}return out;
  }
  function nextTypeName(){
    const names=[];
    try{m2SavedRackTypes.forEach((entry)=>names.push(entry?.name));m2LayoutState.racks.forEach((rack)=>names.push(rack?.typeName));}catch{}
    const max=names.reduce((value,name)=>Math.max(value,lettersToNumber(name)),0);
    return numberToLetters(max+1);
  }
  function savedTypes(){try{return Array.isArray(m2SavedRackTypes)?m2SavedRackTypes:[];}catch{return [];}}
  function currentRack(){try{return m2LayoutState.racks.find((item)=>Number(item.id)===Number(m2CustomizeRackId))||null;}catch{return null;}}
  function exactSavedType(signature){return savedTypes().find((entry)=>entry?.drawing&&signatureFromDrawing(entry.drawing)===signature)||null;}

  function ensureTypeSelector(){
    const modal=byId('m2CustomizeModal');
    const nameInput=byId('m2CustomizeName');
    if(!modal||modal.hidden||!nameInput)return;
    const nameLabel=nameInput.closest('label');
    if(nameLabel){
      const first=nameLabel.childNodes[0];
      if(first&&first.nodeType===Node.TEXT_NODE)first.textContent='Raf tipi ';
      nameInput.readOnly=true;
    }
    let holder=byId('m2CustomizeTypePickerWrap');
    if(!holder){
      holder=document.createElement('label');holder.id='m2CustomizeTypePickerWrap';holder.className='rafex-custom-type-select';
      holder.innerHTML='<span>Kayıtlı raf tipinden değiştir</span><select id="m2CustomizeTypePicker"><option value="">Mevcut ayarlarla devam et</option></select><small>Bir tip seçersen raf o tipin teknik ayarlarını birebir alır. Palet / göz adedi ve tünel blok özelliği olarak korunur.</small>';
      const accessory=document.querySelector('[data-rafex-customize-accessories="1"]');
      if(accessory?.parentElement)accessory.parentElement.insertBefore(holder,accessory);
      else nameLabel?.insertAdjacentElement('afterend',holder);
      byId('m2CustomizeTypePicker')?.addEventListener('change',function(){applySavedTypeToForm(this.value);});
    }
    const select=byId('m2CustomizeTypePicker');if(!select)return;
    const rack=currentRack(),current=normalizeText(rack?.typeName);
    const options=savedTypes().filter((entry)=>entry?.drawing&&entry?.name).map((entry)=>'<option value="'+String(entry.name).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;')+'">'+String(entry.name).replace(/&/g,'&amp;').replace(/</g,'&lt;')+' TİPİ</option>').join('');
    select.innerHTML='<option value="">Mevcut ayarlarla devam et'+(current?' · '+current+' TİPİ':'')+'</option>'+options;
    select.value=explicitTypeName&&savedTypes().some((entry)=>entry.name===explicitTypeName)?explicitTypeName:'';
  }

  function applySavedTypeToForm(name){
    explicitTypeName=normalizeText(name);
    if(!explicitTypeName){const rack=currentRack();if(rack&&byId('m2CustomizeName'))byId('m2CustomizeName').value=normalizeText(rack.typeName)||'Raf';return;}
    const entry=savedTypes().find((item)=>item?.name===explicitTypeName&&item?.drawing);if(!entry)return;
    const drawing=entry.drawing,state=drawing.b2b||{},layout=drawing.b2bLayout||{};
    if(byId('m2CustomizeName'))byId('m2CustomizeName').value=entry.name;
    if(byId('m2CustomizeLevels'))byId('m2CustomizeLevels').value=String(Math.max(1,Number(drawing.levels)||Number(state.levels)||1));
    if(byId('m2CustomizePalletHeight'))byId('m2CustomizePalletHeight').value=String(Math.max(300,Number(drawing.palletHeight)||Number(state.palletHeight)||1200));
    if(byId('m2CustomizeRowType'))byId('m2CustomizeRowType').value=Number(layout.rowCount)===2||state.rowType==='double'?'double':'single';
    if(byId('m2CustomizeRowGap'))byId('m2CustomizeRowGap').value=String(Math.max(0,Number(layout.rowGap??state.rowGap??0)));
    const custom=normalizeLevels(state.customLevels);
    if(byId('m2CustomizeManualLevels'))byId('m2CustomizeManualLevels').checked=custom.length>0;
    try{if(typeof m2RenderCustomizeLevelRows==='function')m2RenderCustomizeLevelRows();}catch{}
    if(custom.length){
      [...document.querySelectorAll('#m2CustomizeLevelRows .m2-custom-level-row')].forEach((row,index)=>{const item=custom[index];if(!item)return;const interval=row.querySelector('[data-custom-interval]'),pallet=row.querySelector('[data-custom-pallet]');if(interval)interval.value=String(item.interval);if(pallet)pallet.value=String(item.palletHeight);});
    }
    try{if(typeof window.m2RenderCustomizeAccessories==='function')window.m2RenderCustomizeAccessories(clone(drawing.accessories||[]));}catch{}
    try{if(typeof m2PreviewRackCustomization==='function')m2PreviewRackCustomization();}catch{}
  }

  const originalOpen=window.m2OpenCustomizeModal;
  if(typeof originalOpen==='function'){
    window.m2OpenCustomizeModal=function(rackId){
      let rack=null;try{rack=m2LayoutState.racks.find((item)=>Number(item.id)===Number(rackId))||null;}catch{}
      openingSnapshot=rack?{rackId:Number(rack.id),signature:signatureFromRack(rack),typeName:normalizeText(rack.typeName),savedTypes:savedTypes().slice(),selectedType:(typeof m2SelectedSavedType!=='undefined'?m2SelectedSavedType:null)}:null;
      explicitTypeName='';
      const result=originalOpen.apply(this,arguments);
      requestAnimationFrame(ensureTypeSelector);setTimeout(ensureTypeSelector,80);
      return result;
    };
  }

  const originalSave=window.m2ApplyRackCustomization;
  if(typeof originalSave==='function'){
    window.m2ApplyRackCustomization=function(){
      const rack=currentRack();if(!rack)return originalSave.apply(this,arguments);
      const formSignature=signatureFromForm(),baseSignature=openingSnapshot?.rackId===Number(rack.id)?openingSnapshot.signature:signatureFromRack(rack),structuralChanged=formSignature!==baseSignature;
      const currentName=normalizeText(openingSnapshot?.typeName||rack.typeName)||normalizeText(exactSavedType(baseSignature)?.name)||numberToLetters(Math.max(1,savedTypes().length));
      const selectedEntry=explicitTypeName?savedTypes().find((entry)=>entry?.name===explicitTypeName&&entry?.drawing):null;
      const exactEntry=exactSavedType(formSignature);
      let targetName=currentName,createType=false;
      if(selectedEntry)targetName=selectedEntry.name;
      else if(structuralChanged&&exactEntry)targetName=exactEntry.name;
      else if(structuralChanged){targetName=nextTypeName();createType=true;}
      if(byId('m2CustomizeName'))byId('m2CustomizeName').value=targetName;

      const savedBefore=savedTypes().slice(),selectedBefore=(typeof m2SelectedSavedType!=='undefined'?m2SelectedSavedType:null),tunnelHeight=byId('m2CustomizeTunnel')?.checked?Math.max(500,Number(byId('m2CustomizeTunnelHeight')?.value)||3600):0;
      const result=originalSave.apply(this,arguments);

      rack.typeName=targetName;rack.typeColor=typeof m2TypeColor==='function'?m2TypeColor(targetName):rack.typeColor;
      rack.b2b={...(rack.b2b||{}),tunnelHeight};
      if(!createType){
        try{m2SavedRackTypes.splice(0,m2SavedRackTypes.length,...savedBefore);m2SelectedSavedType=selectedBefore;}catch{}
      }else{
        try{
          const created=m2SavedRackTypes.find((entry)=>entry?.source==='custom'&&entry?.name===targetName);
          if(created?.drawing?.b2b)created.drawing.b2b={...created.drawing.b2b,tunnelHeight:0};
          if(created?.drawing)created.drawing.typeName=targetName;
        }catch{}
      }
      try{if(typeof m2RenderSavedRackTypes==='function')m2RenderSavedRackTypes();if(typeof m2RenderLayout==='function')m2RenderLayout();}catch{}
      const status=byId('m2FloorStatus');
      if(status){
        if(selectedEntry)status.textContent=targetName+' TİPİ seçildi; raf serbest çizimde aynı tip adı ve teknik özelliklerle güncellendi.';
        else if(createType)status.textContent=targetName+' TİPİ oluşturuldu ve kayıtlı raf tiplerine eklendi. Tünel varsa blok özelliği olarak ayrıca gösterilir.';
        else if(structuralChanged&&exactEntry)status.textContent='Değişiklikler '+targetName+' TİPİ ile birebir aynı olduğu için yeni tip açılmadı; rafın tipi '+targetName+' olarak değiştirildi.';
        else status.textContent='Blok güncellendi. Yalnız palet adedi veya tünel değiştiği için yeni raf tipi oluşturulmadı.';
      }
      openingSnapshot=null;explicitTypeName='';
      return result;
    };
  }

  document.addEventListener('change',(event)=>{if(event.target?.id==='m2CustomizeTypePicker')ensureTypeSelector();},true);
})();
<\/script>`;

const bodyEnd=html.lastIndexOf("</body>");
if(bodyEnd<0)throw new Error("Portal </body> kapanışı bulunamadı.");
html=html.slice(0,bodyEnd)+style+script+html.slice(bodyEnd);
if(!html.includes('data-rafex-customize-auto-types="v1"')||!html.includes('Kayıtlı raf tipinden değiştir')||!html.includes('nextTypeName'))throw new Error("Otomatik raf tipi runtime eklenemedi.");

const encoded=Buffer.from(html,"utf8").toString("base64");
worker=worker.slice(0,match.index)+match[1]+match[2]+encoded+match[2]+worker.slice(match.index+match[0].length);
fs.writeFileSync(workerPath,worker);
console.log("Özelleştir otomatik raf tipi ve mevcut tip seçici eklendi.");
