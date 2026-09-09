import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const workerPath = path.join(root, "dist/server/index.js");
const marker = 'data-rafex-unified-free-catalog="v1"';

let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("Unified free catalog: HTML_BASE64 bulunamadi.");

let html = Buffer.from(match[3], "base64").toString("utf8");
if (!html.includes('data-rafex-unified-free-drawing="v1"')) throw new Error("Unified free catalog: Serbest Cizim runtime bulunamadi.");
if (!html.includes('data-rafex-unified-free-drawing-safe="v2"')) throw new Error("Unified free catalog: Serbest Cizim safety runtime bulunamadi.");

html = html.replace(/<style\s+data-rafex-unified-free-catalog="v1">[\s\S]*?<\/style>\s*<script\s+data-rafex-unified-free-catalog="v1">[\s\S]*?<\/script>/g, "");

const decorateNeedle = "if(typeof applyTranslations==='function')try{applyTranslations(page);}catch{}";
const decorateHook = `${decorateNeedle}\n    if(typeof window.rafexUnifiedCatalogSync==='function')setTimeout(()=>window.rafexUnifiedCatalogSync(),0);`;
if (!html.includes("window.rafexUnifiedCatalogSync")) {
  if (!html.includes(decorateNeedle)) throw new Error("Unified free catalog: decoratePage hook noktasi bulunamadi.");
  html = html.replace(decorateNeedle, decorateHook);
}

const runtime = `<style ${marker}>
.rafex-unified-catalog-summary{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:7px 0 0;font-size:10px;color:#617067}
.rafex-unified-catalog-chip{display:inline-flex;align-items:center;gap:5px;padding:4px 7px;border:1px solid #d9e4dc;border-radius:999px;background:#f7faf8;font-weight:900;color:#31513f}
.rafex-unified-system-badge{display:inline-flex;align-items:center;justify-content:center;min-width:44px;margin-right:7px;padding:3px 6px;border-radius:999px;background:#173c2d;color:#fff;font-size:8px;font-weight:900;letter-spacing:.05em;vertical-align:1px}
.rafex-unified-type-row .m2-saved-type{min-width:0}
.rafex-unified-type-row .m2-saved-type b{display:block;white-space:normal}
.rafex-unified-type-row .m2-saved-type small{display:block;margin-top:4px}
.rafex-unified-type-row[data-system="b2b"] .rafex-unified-system-badge{background:#173c2d}
.rafex-unified-type-row[data-system="mekik2"] .rafex-unified-system-badge{background:#315f88}
.rafex-unified-type-row[data-system="mr"] .rafex-unified-system-badge{background:#8a6300}
.rafex-unified-type-row[data-system="drive"] .rafex-unified-system-badge{background:#7b4d14}
.rafex-unified-type-row[data-system="konsol"] .rafex-unified-system-badge{background:#8b5317}
</style>
<script ${marker}>(function(){
  if(window.__rafexUnifiedFreeCatalogV1)return;
  window.__rafexUnifiedFreeCatalogV1=true;
  window.__rafexSavedTypesAuthoritative=true;

  const SYSTEMS=[
    {key:'b2b',label:'B2B'},
    {key:'mekik2',label:'Mekik'},
    {key:'drive',label:'Drive-In'},
    {key:'mr',label:'MR'},
    {key:'konsol',label:'Konsol Kollu'}
  ];
  const SYSTEM_MAP=Object.fromEntries(SYSTEMS.map((item)=>[item.key,item]));
  let cache=[];
  let loadedOnce=false;
  let loading=null;
  let lastLoadedAt=0;

  const originalRender=typeof m2RenderSavedRackTypes==='function'?m2RenderSavedRackTypes:null;
  const originalRefresh=typeof m2RefreshSavedRackTypes==='function'?m2RefreshSavedRackTypes:null;
  const originalAddSelected=typeof m2AddSelectedSavedRack==='function'?m2AddSelectedSavedRack:null;
  const originalDeleteAll=typeof m2DeleteAllSavedRackTypes==='function'?m2DeleteAllSavedRackTypes:null;
  const originalAddRack=typeof m2AddRack==='function'?m2AddRack:null;

  function isFree(){
    const page=document.getElementById('page');
    return !!(page&&(page.dataset?.rafexFreeDrawing==='1'||page.classList.contains('rafex-free-drawing-page')));
  }
  function labelFor(key){return SYSTEM_MAP[key]?.label||key||'Raf';}
  function clone(value){try{return JSON.parse(JSON.stringify(value))}catch{return value}}
  function freeze(value){if(!value||typeof value!=='object'||Object.isFrozen(value))return value;Object.freeze(value);Object.values(value).forEach(freeze);return value}
  function entryKey(entry){return entry?String(entry.__rafexSystem||'')+':'+String(entry.id??''):'';}
  function status(text){const box=document.getElementById('m2FloorStatus');if(box)box.textContent=text;}
  function currentSelectedKey(){return entryKey(Array.isArray(m2SavedRackTypes)?m2SavedRackTypes[m2SelectedSavedType]:null);}
  function activeFirstSystems(){
    // Switching editors must not reorder the shared catalog.
    return [...SYSTEMS];
  }
  function normalizeEntry(system,entry,index){
    const name=system.key==='b2b'&&typeof b2bTypeLetter==='function'?b2bTypeLetter(entry.name,entry.typeNo||index+1):entry.name;
    const snapshot=freeze(clone(entry.drawing));
    return {...entry,name,drawing:clone(snapshot),source:'registry',__rafexSnapshot:snapshot,__rafexSystem:system.key,__rafexSystemLabel:system.label,__rafexUnified:true};
  }
  async function fetchRegistry(){
    const result=await req('/api/rack-types');
    const types=Array.isArray(result?.types)?result.types:[];
    return types.filter((entry)=>entry?.id&&entry?.name&&entry?.drawing?.plan&&SYSTEM_MAP[entry.system]).map((entry,index)=>normalizeEntry(SYSTEM_MAP[entry.system],entry,index));
  }
  function summaryMarkup(){
    const counts=SYSTEMS.map((system)=>({label:system.label,count:cache.filter((entry)=>entry.__rafexSystem===system.key).length}));
    return '<div class="rafex-unified-catalog-summary">'+counts.map((item)=>'<span class="rafex-unified-catalog-chip">'+item.label+' · '+item.count+'</span>').join('')+'<span>Aynı Ortak Çizim ve PDF projesinde birlikte kullanılabilir.</span></div>';
  }
  function renderUnified(){
    if(!isFree()){if(originalRender)return originalRender();return;}
    const list=document.getElementById('m2SavedTypeList');if(!list)return;
    const count=document.getElementById('m2SavedTypeCount');if(count)count.textContent='('+m2SavedRackTypes.length+')';
    const head=document.querySelector('#m2SavedTypesPanel .m2-saved-types-head b');
    if(head)head.innerHTML='Kayıtlı Raf Tipleri · Tüm Sistemler <span id="m2SavedTypeCount">('+m2SavedRackTypes.length+')</span>'+summaryMarkup();
    list.innerHTML=m2SavedRackTypes.length?m2SavedRackTypes.map((entry,index)=>{
      const drawing=entry.__rafexSnapshot||entry.drawing||{};
      const system=entry.__rafexSystem||'mekik2';
      const systemLabel=labelFor(system);
      const color=typeof m2TypeColor==='function'?m2TypeColor(entry.name):'#173c2d';
      const levels=Math.max(0,Number(drawing.levels)||0);
      const palletCount=system==='konsol'?0:system==='b2b'&&drawing.b2b?Math.max(1,Number(drawing.b2b.palletCount)||Number(drawing.bays)||1)*Math.max(1,levels)*((drawing.b2b.rowType||'single')==='double'?2:1):(Number(drawing.bays)||0)*levels*(Number(drawing.depth)||0);
      const footLabel=drawing.footProfile?drawing.footProfile+' · Ly '+fmt(drawing.footLy)+' mm':fmt(drawing.footType)+' mm';
      const levelDetail=typeof m2LevelDetail==='function'?m2LevelDetail(drawing):fmt(levels)+' kat';
      const detail=(system==='konsol'?fmt(drawing.totalWidth)+' × '+fmt(drawing.railLength)+' mm · '+fmt(drawing.konsol?.count||drawing.plan?.feet?.length)+' ayak · '+fmt(levels)+' kat · '+(drawing.konsol?.side==='double'?'Çift taraflı':'Tek taraflı')+' · Kol '+fmt(drawing.konsol?.arm||drawing.palD)+' mm':fmt(drawing.totalWidth)+' × '+fmt(drawing.railLength)+' mm · '+esc(levelDetail)+(palletCount?' · <strong>'+fmt(palletCount)+' palet</strong>':'')+' · Palet '+fmt(drawing.palW)+' × '+fmt(drawing.palD)+' mm · Ayak '+esc(footLabel))+' · LOG '+esc(entry.logId||entry.createdAt||'-');
      return '<div class="m2-saved-type-row rafex-unified-type-row" data-system="'+system+'"><button type="button" class="m2-saved-type'+(index===m2SelectedSavedType?' active':'')+'" style="border-color:'+color+';box-shadow:inset 5px 0 '+color+';background:'+color+'12" onclick="m2HandleSavedRackTypeClick('+index+',event)" title="Seç · çift tıklayarak Ortak Çizim alanına ekle"><b><span class="rafex-unified-system-badge">'+esc(systemLabel)+'</span><i class="m2-type-swatch" style="background:'+color+'"></i>'+esc(entry.name)+'</b><small>'+detail+'</small></button><button type="button" class="m2-saved-type-preview rafex-free-info" data-saved-index="'+index+'" aria-label="İçeriğini göster" title="İçeriğini göster">i</button><button type="button" class="m2-saved-type-copy rafex-free-copy" data-saved-index="'+index+'" aria-label="Kopyala" title="Kopyala ve bu sistemin özelliklerini aç"><span class="rafex-free-copy-pages" aria-hidden="true"></span></button><button type="button" class="m2-type-delete" aria-label="'+esc(entry.name)+' kaydını sil" title="'+esc(systemLabel)+' raf tipini sil" onclick="event.stopPropagation();rafexUnifiedDeleteSavedRackType('+index+')">×</button></div>';
    }).join(''):'<span class="m2-floor-status">B2B, Mekik, Drive-In, MR veya Konsol Kollu altında henüz kayıtlı raf tipi yok.</span>';
    if(typeof m2RenderSelectedRackInfo==='function')m2RenderSelectedRackInfo();
    const note=document.querySelector('.rafex-free-mode-note span');
    if(note)note.textContent='B2B, Mekik, Drive-In, MR ve Konsol Kollu altında kaydettiğin raf tipleri burada tek listede görünür; aynı Ortak Çizim alanına eklenir ve aynı PDF içinde birlikte raporlanır.';
  }
  function installCache(selectedKey=''){
    m2SavedRackTypes=cache.map((entry)=>({...entry,drawing:clone(entry.__rafexSnapshot)}));
    let index=selectedKey?m2SavedRackTypes.findIndex((entry)=>entryKey(entry)===selectedKey):-1;
    if(index<0&&m2SavedRackTypes.length)index=0;
    m2SelectedSavedType=m2SavedRackTypes.length?index:null;
    renderUnified();
  }
  async function refreshUnified(force=false){
    if(!isFree()){if(originalRefresh)return originalRefresh();return [];}
    const selectedKey=currentSelectedKey();
    if(loading)return loading;
    if(!force&&loadedOnce&&Date.now()-lastLoadedAt<3000){installCache(selectedKey);return cache;}
    loading=(async()=>{
      cache=await fetchRegistry();loadedOnce=true;lastLoadedAt=Date.now();installCache(selectedKey);
      const counts=SYSTEMS.map((system)=>system.label+' '+cache.filter((entry)=>entry.__rafexSystem===system.key).length).join(' · ');
      status(counts+' kayıt tek tablodan yüklendi; hepsi Ortak Çizim ve PDF alanında hazır.');
      return cache;
    })();
    try{return await loading;}finally{loading=null;}
  }
  function markAddedRacks(before,system,name,drawing){
    if(!Array.isArray(m2LayoutState?.racks))return;
    m2LayoutState.racks.slice(before).forEach((rack)=>{
      rack.rafexSystem=system;
      rack.rafexSystemLabel=labelFor(system);
      if(name&&!rack.typeName)rack.typeName=name;
      if(system==='konsol'){rack.konsol={...(drawing?.konsol||{})};rack.spec={...(drawing?.spec||drawing?.konsol||{})};rack.armLength=Number(drawing?.konsol?.arm||drawing?.palD)||0;rack.uprightCount=Number(drawing?.konsol?.count||drawing?.plan?.feet?.length)||0;rack.spacing=Number(drawing?.konsol?.spacing||drawing?.palW)||0;rack.layoutView='konsol-top';}
    });
  }
  function addRackForSystem(system,drawing,typeName){
    if(!originalAddRack)return;
    drawing=clone(drawing);
    const previous=m2ActiveModule;
    const before=Array.isArray(m2LayoutState?.racks)?m2LayoutState.racks.length:0;
    try{
      if(system==='b2b'||system==='mekik2'||system==='drive'||system==='mr'||system==='konsol')m2ActiveModule=system;
      const result=originalAddRack(drawing,typeName);
      markAddedRacks(before,system,typeName,drawing);
      return result;
    }finally{
      m2ActiveModule=previous;
    }
  }

  if(originalRender){
    const wrappedRender=function(){return isFree()?renderUnified():originalRender();};
    try{m2RenderSavedRackTypes=wrappedRender;}catch{}
    window.m2RenderSavedRackTypes=wrappedRender;
  }
  if(originalRefresh){
    const wrappedRefresh=async function(){return isFree()?refreshUnified(true):originalRefresh();};
    try{m2RefreshSavedRackTypes=wrappedRefresh;}catch{}
    window.m2RefreshSavedRackTypes=wrappedRefresh;
  }
  if(originalAddRack){
    const wrappedAddRack=function(drawing=null,typeName=null){
      if(!isFree())return originalAddRack(drawing,typeName);
      if(!drawing){
        const entry=m2SavedRackTypes[m2SelectedSavedType];
        if(entry?.__rafexUnified)return addRackForSystem(entry.__rafexSystem,entry.__rafexSnapshot||entry.drawing,entry.name);
      }
      const explicit=String(drawing?.rafexSystem||'').toLowerCase();
      const system=['konsol','konsol-kollu','cantilever'].includes(explicit)?'konsol':explicit==='drive'?'drive':drawing?.systemType==='mr'||drawing?.b2b?.mr===true||drawing?.plan?.mr===true?'mr':drawing?.b2b||drawing?.b2bLayout?'b2b':m2ActiveModule;
      return addRackForSystem(system,drawing,typeName);
    };
    try{m2AddRack=wrappedAddRack;}catch{}
    window.m2AddRack=wrappedAddRack;
  }
  if(originalAddSelected){
    const wrappedAddSelected=function(){
      if(!isFree())return originalAddSelected();
      const entry=m2SavedRackTypes[m2SelectedSavedType];
      if(!entry){status('Önce B2B, Mekik, Drive-In, MR veya Konsol Kollu kayıtlı raf tiplerinden birini seç.');return;}
      const before=Array.isArray(m2LayoutState?.racks)?m2LayoutState.racks.length:0;
      addRackForSystem(entry.__rafexSystem,entry.__rafexSnapshot||entry.drawing,entry.name);
      const after=Array.isArray(m2LayoutState?.racks)?m2LayoutState.racks.length:0;
      if(after>before)status(labelFor(entry.__rafexSystem)+' · '+entry.name+' Ortak Çizim alanına eklendi ve PDF projesine dahil edildi.');
      renderUnified();
    };
    try{m2AddSelectedSavedRack=wrappedAddSelected;}catch{}
    window.m2AddSelectedSavedRack=wrappedAddSelected;
  }
  if(originalDeleteAll){
    const wrappedDeleteAll=async function(){
      if(!isFree())return originalDeleteAll();
      if(!m2SavedRackTypes.length){status('Silinecek kayıtlı raf tipi yok.');return;}
      if(!confirm('B2B, Mekik, Drive-In, MR ve Konsol Kollu altındaki TÜM kayıtlı raf tiplerini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.'))return;
      try{
        await req('/api/rack-types',{method:'DELETE',body:'{}'});
        cache=[];loadedOnce=true;lastLoadedAt=Date.now();m2SavedRackTypes=[];m2SelectedSavedType=null;renderUnified();status('B2B, Mekik, Drive-In, MR ve Konsol Kollu altındaki tüm kayıtlı raf tipleri silindi.');
      }catch(error){status(error?.message||'Kayıtlı raf tipleri silinemedi.');}
    };
    try{m2DeleteAllSavedRackTypes=wrappedDeleteAll;}catch{}
    window.m2DeleteAllSavedRackTypes=wrappedDeleteAll;
  }

  window.rafexUnifiedDeleteSavedRackType=async function(index){
    if(!isFree())return;
    const entry=m2SavedRackTypes[index];if(!entry)return;
    if(!confirm(labelFor(entry.__rafexSystem)+' · '+entry.name+' raf tipini silmek istediğinizden emin misiniz?'))return;
    const system=SYSTEM_MAP[entry.__rafexSystem];if(!system)return;
    try{
      await req('/api/rack-types/'+Number(entry.id),{method:'DELETE',body:'{}'});
      const key=entryKey(entry);cache=cache.filter((item)=>entryKey(item)!==key);installCache('');status(labelFor(entry.__rafexSystem)+' · '+entry.name+' silindi.');
    }catch(error){status(error?.message||'Raf tipi silinemedi.');}
  };
  window.rafexUnifiedCatalogSync=function(){
    if(!isFree())return;
    refreshUnified(false).catch((error)=>{console.warn('Serbest Cizim ortak raf katalogu yuklenemedi',error);status(error?.message||'Kayıtlı raf tipleri getirilemedi.');});
  };
})();</script>`;

const closing = html.lastIndexOf("</body>");
if (closing < 0) throw new Error("Unified free catalog: </body> bulunamadi.");
html = html.slice(0, closing) + runtime + "\n" + html.slice(closing);

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.replace(match[0], `${match[1]}${match[2]}${encoded}${match[2]}`);
fs.writeFileSync(workerPath, worker);

const finalHtml = Buffer.from(encoded, "base64").toString("utf8");
for (const required of [marker,"rafexUnifiedCatalogSync","rafexUnifiedDeleteSavedRackType","Kayıtlı Raf Tipleri · Tüm Sistemler","/api/rack-types","__rafexSnapshot"]) {
  if (!finalHtml.includes(required)) throw new Error(`Unified free catalog dogrulama hatasi: ${required}`);
}
console.log("FINAL: Serbest Cizim ortak kayitli raf katalogu eklendi; B2B + Mekik ayni yerlesim ve PDF projesinde birlikte kullanilir (v1).");
