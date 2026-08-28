import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("Common architecture v90: HTML_BASE64 bulunamadi");
let html = Buffer.from(match[3], "base64").toString("utf8");

// Eski mod-onarma katmanlari ayni fonksiyonlari tekrar tekrar sardigi icin kaldirilir.
html = html
  .replace(/<style\s+data-rafex-common-project-mode="v87">[\s\S]*?<\/style>/g, "")
  .replace(/<script\s+data-rafex-common-project-mode="v87">[\s\S]*?<\/script>/g, "")
  .replace(/<script\s+data-rafex-common-loader-normalize="v88">[\s\S]*?<\/script>/g, "")
  .replace(/<script\s+data-rafex-common-mode-identity="v89">[\s\S]*?<\/script>/g, "");

// Ortak katalog ve urun katmanlari yalniz gercek Ortak Cizim kontrolcusu aktifken calisir.
html = html
  .replaceAll(
    "return !!(page&&(page.dataset.rafexFreeDrawing==='1'||page.classList.contains('rafex-free-drawing-page')));",
    "return window.__rafexCommonArchitectureV90Active===true&&!!(page&&(page.dataset.rafexFreeDrawing==='1'||page.classList.contains('rafex-free-drawing-page')));",
  )
  .replaceAll(
    "return !!(page&&(page.dataset?.rafexFreeDrawing==='1'||page.classList.contains('rafex-free-drawing-page')));",
    "return window.__rafexCommonArchitectureV90Active===true&&!!(page&&(page.dataset?.rafexFreeDrawing==='1'||page.classList.contains('rafex-free-drawing-page')));",
  );

const oldSchedulePdf = "  function schedulePdf(delay){clearTimeout(pdfTimer);pdfTimer=setTimeout(syncPdf,delay||30);}";
const newSchedulePdf = "  function schedulePdf(delay){if(window.__rafexExplicitOutputV90!==true)return;clearTimeout(pdfTimer);pdfTimer=setTimeout(syncPdf,delay||30);}";
if (html.includes(oldSchedulePdf)) html = html.replace(oldSchedulePdf, newSchedulePdf);
if (!html.includes(newSchedulePdf)) throw new Error("Common architecture v90: PDF zamanlayici anchor bulunamadi");

const oldCorporate = "  if(previousCorporate){var commonCorporate=function(){if(isFree())layoutGroups(true);var result=previousCorporate.apply(this,arguments);schedulePdf(40);setTimeout(syncPdf,420);setTimeout(syncPdf,1150);setTimeout(syncPdf,3250);return result;};try{m2RenderCorporateReport=commonCorporate}catch(error){}window.m2RenderCorporateReport=commonCorporate;}";
const newCorporate = "  if(previousCorporate){var commonCorporate=function(){if(isFree())layoutGroups(true);var result=previousCorporate.apply(this,arguments);if(window.__rafexExplicitOutputV90===true)requestAnimationFrame(syncPdf);return result;};try{m2RenderCorporateReport=commonCorporate}catch(error){}window.m2RenderCorporateReport=commonCorporate;}";
if (html.includes(oldCorporate)) html = html.replace(oldCorporate, newCorporate);
if (!html.includes(newCorporate)) throw new Error("Common architecture v90: kurumsal PDF anchor bulunamadi");

const oldObserver = `  var observer=new MutationObserver(function(records){
    var needsPdf=false,needsModal=false,needsDecorate=false;
    records.forEach(function(record){var target=record.target&&record.target.nodeType===1?record.target:record.target&&record.target.parentElement;if(!target)return;if(target.id==='m2CorporatePreview'||target.closest&&target.closest('#m2CorporatePreview,#m2CorporatePrint,#m2CorporatePrintArea'))needsPdf=true;if(target.id==='m2SectionPlacementModal'||target.closest&&target.closest('#m2SectionPlacementModal'))needsModal=true;if(!(target.closest&&target.closest('.rafex-free-mode-note'))&&(target.id==='page'||target.closest&&target.closest('#page')))needsDecorate=true;});
    if(needsPdf)schedulePdf(20);if(needsModal)scheduleModal(20);if(needsDecorate)decorateIndependent();
  });
  function boot(){decorateIndependent();if(document.body)observer.observe(document.body,{childList:true,subtree:true});if(isFree()){loadCatalog(true);layoutGroups(true);if(typeof m2RenderLayout==='function')m2RenderLayout();}schedulePdf(120);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();`;
const newObserver = `  var observer={observe:function(){},disconnect:function(){}};
  window.rafexCommonV44Api={decorate:decorateIndependent,loadCatalog:loadCatalog,layoutGroups:layoutGroups,syncPdf:syncPdf,scheduleModal:scheduleModal};
  function boot(){decorateIndependent();if(isFree()){loadCatalog(true);layoutGroups(true);if(typeof m2RenderLayout==='function')m2RenderLayout();}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();`;
if (html.includes(oldObserver)) html = html.replace(oldObserver, newObserver);
if (!html.includes("window.rafexCommonV44Api={decorate:decorateIndependent")) {
  throw new Error("Common architecture v90: global MutationObserver kaldirilamadi");
}

html = html
  .replace(/<style\s+data-rafex-common-architecture="v90">[\s\S]*?<\/style>/g, "")
  .replace(/<script\s+data-rafex-common-architecture="v90">[\s\S]*?<\/script>/g, "");

const runtime = String.raw`<style data-rafex-common-architecture="v90">
#page.rafex-common-v90{--common-green:#173c2d;--common-line:#cddbd1;--common-soft:#f3f8f4}
#page.rafex-common-v90 .rafex-system-option[data-ready="false"]{display:none!important}
#page.rafex-common-v90 .rafex-system-options{grid-template-columns:repeat(3,minmax(150px,1fr))!important}
#page.rafex-common-v90 .rafex-common-toolbar-v90{position:sticky;top:72px;z-index:36;display:grid;grid-template-columns:minmax(240px,1fr) auto;gap:10px;align-items:end;margin:0 0 12px;padding:12px 14px;border:1px solid var(--common-line);border-left:6px solid var(--common-green);border-radius:12px;background:rgba(255,255,255,.97);box-shadow:0 8px 26px rgba(23,60,45,.1);backdrop-filter:blur(7px)}
#page.rafex-common-v90 .rafex-common-name-v90{display:grid;gap:5px;color:#31513f;font-size:9px;font-weight:950;letter-spacing:.05em}
#page.rafex-common-v90 .rafex-common-name-v90 input{width:100%;padding:10px 11px;border:1px solid #cbd9cf;border-radius:8px;background:#fff;color:#17201b;font-size:13px;font-weight:850;outline:0}
#page.rafex-common-v90 .rafex-common-name-v90 input:focus{border-color:#b99800;box-shadow:0 0 0 3px rgba(242,197,0,.22)}
#page.rafex-common-v90 .rafex-common-actions-v90{display:flex;gap:7px;align-items:center;justify-content:flex-end;flex-wrap:wrap}
#page.rafex-common-v90 .rafex-common-actions-v90 button{padding:9px 11px;border:1px solid #cbd9cf;border-radius:8px;background:#f5f8f6;color:#173c2d;font-size:10px;font-weight:900}
#page.rafex-common-v90 .rafex-common-actions-v90 button[data-primary="1"]{border-color:#173c2d;background:#173c2d;color:#fff}
#page.rafex-common-v90 .rafex-common-actions-v90 button.active{border-color:#b48d00;background:#fff4bd;color:#5f4a00}
#page.rafex-common-v90 .rafex-common-status-v90{grid-column:1/-1;min-height:14px;color:#65736a;font-size:9px;font-weight:800}
#page.rafex-common-v90 .rafex-native-project-bridge-v90,#page.rafex-common-v90 label:has(#mrProjectName),#page.rafex-common-v90 label:has(#b2bProjectName){display:none!important}
#page.rafex-common-v90:not(.rafex-products-open-v90) #m2LayoutProductList{display:none!important}
#page.rafex-common-v90:not(.rafex-output-ready-v90) #m2A4Sheet,#page.rafex-common-v90:not(.rafex-output-ready-v90) #m2CorporatePreview,#page.rafex-common-v90:not(.rafex-output-ready-v90) #m2TypePagesHost,#page.rafex-common-v90:not(.rafex-output-ready-v90) .m2-print-pack{display:none!important}
#page.rafex-common-v90:not(.rafex-3d-open-v90) canvas{display:none!important}
#page.rafex-common-v90:not(.rafex-3d-open-v90) [class*="viewer-status"],#page.rafex-common-v90:not(.rafex-3d-open-v90) [id*="ViewerStatus"]{display:none!important}
#page.rafex-common-v90 .rafex-common-collapsed-note-v90{display:none;margin:8px 0;padding:9px 11px;border:1px dashed #c7d6cb;border-radius:8px;background:#f7faf8;color:#627067;font-size:10px;font-weight:800}
#page.rafex-common-v90:not(.rafex-3d-open-v90) .rafex-common-collapsed-note-v90{display:block}
#page.rafex-common-v90 .m2-project-actions>div>b{color:#173c2d}
#page.rafex-common-v90 .rafex-free-mode-note{margin-top:4px}
@media(max-width:900px){#page.rafex-common-v90 .rafex-common-toolbar-v90{position:relative;top:auto;grid-template-columns:1fr}#page.rafex-common-v90 .rafex-common-actions-v90{justify-content:flex-start}#page.rafex-common-v90 .rafex-system-options{grid-template-columns:1fr!important}}
</style>
<script data-rafex-common-architecture="v90">(()=>{
  if(window.__rafexCommonArchitectureV90)return;
  window.__rafexCommonArchitectureV90=true;

  const state={active:false,project:null,projectKey:'',projectLoaded:false,name:'',productsOpen:false,view3D:false,outputDirty:true,wrappers:false,base:{},requestCache:new Map(),requestInflight:new Map(),heavy:{},dragging:false};
  const INSTANCE_KEYS=new Set(['id','x','y','w','h','angle','staged','freePlacement','locked','specLocked','joinGroup','sharedFootSide','sharedFootWith','individualSpec','blockName','typeName','typeColor','rafexGlobalTypeLetter','rafexSectionLetter','seismicBraces','selected','hover']);
  const low=(value)=>String(value||'').toLocaleLowerCase('tr-TR').trim();
  const clone=(value)=>{if(value==null)return value;try{return structuredClone(value)}catch{return JSON.parse(JSON.stringify(value))}};
  const readGlobal=(name)=>{try{return window[name]||eval('typeof '+name+'!=="undefined"?'+name+':null')}catch{return window[name]||null}};
  const assignGlobal=(name,value)=>{window[name]=value;try{eval(name+'=value')}catch{}};
  const status=(text)=>{const node=document.getElementById('rafexCommonStatusV90');if(node)node.textContent=text||'';const floor=document.getElementById('m2FloorStatus');if(floor&&text)floor.textContent=text;};

  function systemOf(value){
    const drawing=value?.drawing||value?.rack||value||{};
    const raw=low(value?.system||value?.rafexSystem||value?.__rafexSystem||drawing?.rafexSystem||drawing?.__rafexSystem);
    if(raw)return raw==='mekik'?'mekik2':raw;
    if(drawing?.b2b?.mr===true||drawing?.plan?.mr===true||low(drawing?.systemType)==='mr')return'mr';
    if(drawing?.b2bLayout||drawing?.b2b)return'b2b';
    if(drawing?.plan||['fifo','filo'].includes(low(drawing?.systemType)))return'mekik2';
    return'';
  }
  function projectSystems(project){
    if(Array.isArray(project?.systems))return[...new Set(project.systems.map(low).filter(Boolean))];
    const payload=project?.payload||{},items=[];
    [payload?.layout?.racks,payload?.state?.layout?.racks,payload?.common?.layoutState?.racks,payload?.compactCommon?.definitions,payload?.definitions,payload?.rackTypes].forEach((rows)=>{if(Array.isArray(rows))items.push(...rows)});
    return[...new Set(items.map(systemOf).filter(Boolean))];
  }
  function isCommonProject(project){
    const moduleName=low(project?.effective_module||project?.module).replace(/[\s_-]+/g,'');
    return project?.is_common===true||['ortak','common','commondrawing','ortakcizim'].includes(moduleName)||project?.payload?.commonDrawing===true||project?.payload?.schema==='rafex-common-v3'||projectSystems(project).length>1;
  }
  function stable(value){
    if(Array.isArray(value))return value.map(stable);
    if(value&&typeof value==='object'){const result={};Object.keys(value).sort().forEach((key)=>{if(value[key]!==undefined)result[key]=stable(value[key])});return result;}
    return value;
  }
  function hash(text){let value=2166136261;for(let i=0;i<text.length;i+=1){value^=text.charCodeAt(i);value=Math.imul(value,16777619)}return(value>>>0).toString(36)}
  function layoutHolder(payload){
    if(payload?.layout&&typeof payload.layout==='object')return payload.layout;
    if(payload?.state?.layout&&typeof payload.state.layout==='object')return payload.state.layout;
    if(payload?.common?.layoutState&&typeof payload.common.layoutState==='object')return payload.common.layoutState;
    return null;
  }
  function compactPayload(input){
    const payload=clone(input||{}),layout=layoutHolder(payload),racks=Array.isArray(layout?.racks)?layout.racks:[];
    payload.version=Math.max(3,Number(payload.version)||0);payload.schema='rafex-common-v3';payload.commonDrawing=true;
    if(!racks.length||payload.compactCommon?.instances?.length)return payload;
    const definitions=[],definitionMap=new Map(),instances=[];
    racks.forEach((rack,index)=>{
      const base={},instance={};Object.entries(rack||{}).forEach(([key,value])=>{(INSTANCE_KEYS.has(key)?instance:base)[key]=clone(value)});
      const signature=JSON.stringify(stable(base));let definitionId='d'+hash(signature),suffix=1;
      while(definitionMap.has(definitionId)&&definitionMap.get(definitionId).signature!==signature)definitionId='d'+hash(signature)+'_'+suffix++;
      if(!definitionMap.has(definitionId)){const entry={id:definitionId,system:systemOf(rack),typeName:String(rack?.typeName||rack?.rafexGlobalTypeLetter||'Raf'),rack:base,signature};definitionMap.set(definitionId,entry);definitions.push({id:entry.id,system:entry.system,typeName:entry.typeName,rack:entry.rack});}
      instance.definitionId=definitionId;if(instance.id==null)instance.id=Date.now()+index;instances.push(instance);
    });
    payload.compactCommon={version:1,definitions,instances,rackCount:racks.length,createdAt:new Date().toISOString()};
    layout.racks=[];
    if(Array.isArray(payload?.state?.layout?.racks)&&payload.state.layout!==layout)payload.state.layout.racks=[];
    if(Array.isArray(payload?.common?.layoutState?.racks)&&payload.common.layoutState!==layout)payload.common.layoutState.racks=[];
    if(Array.isArray(payload.rackTypes)){
      const seen=new Set();payload.rackTypes=payload.rackTypes.filter((entry)=>{const key=systemOf(entry)+':'+String(entry?.id??entry?.name??'');if(seen.has(key))return false;seen.add(key);return true});
    }
    return payload;
  }
  function expandPayload(input){
    const payload=clone(input||{}),compact=payload.compactCommon,layout=layoutHolder(payload);
    if(!compact||!Array.isArray(compact.definitions)||!Array.isArray(compact.instances)||!layout)return payload;
    if(Array.isArray(layout.racks)&&layout.racks.length)return payload;
    const definitions=new Map(compact.definitions.map((entry)=>[String(entry.id),entry]));
    layout.racks=compact.instances.map((instance)=>{const copy=clone(instance),definition=definitions.get(String(copy.definitionId));delete copy.definitionId;return Object.assign({},clone(definition?.rack||{}),copy)});
    return payload;
  }
  function normalizeProject(project){const copy=clone(project||{});copy.module='ortak';copy.payload=expandPayload(copy.payload||{});copy.payload.commonDrawing=true;copy.payload.schema=copy.payload.schema||'rafex-common-v3';return copy;}
  function realCommon(){return state.active===true&&window.rafexUnifiedFreeDrawingActiveV75?.()===true&&!!document.getElementById('rafexUnifiedSystemPicker')}

  function syncRoute(projectKey=''){
    try{const url=new URL(location.href);if(state.active)url.searchParams.set('mode','common');else url.searchParams.delete('mode');if(projectKey)url.searchParams.set('project',projectKey);history.replaceState(history.state,'',url)}catch{}
  }
  function setViewerPaused(paused){try{window.RafexB2BViewer?.setPaused?.(paused)}catch{}try{window.RafexMRViewer?.setPaused?.(paused)}catch{}}
  function set3DOpen(open){state.view3D=Boolean(open);const page=document.getElementById('page');page?.classList.toggle('rafex-3d-open-v90',state.view3D);document.getElementById('rafexCommon3DV90')?.classList.toggle('active',state.view3D);setViewerPaused(!state.view3D);if(state.view3D){try{readGlobal('b2bUpdateMain3D')?.()}catch{}try{readGlobal('mrUpdateSummary')?.(true)}catch{}}}
  function setProductsOpen(open){state.productsOpen=Boolean(open);const page=document.getElementById('page');page?.classList.toggle('rafex-products-open-v90',state.productsOpen);document.getElementById('rafexCommonProductsV90')?.classList.toggle('active',state.productsOpen);if(state.productsOpen){try{window.rafexRefreshProductCountsV77?.()}catch{}try{readGlobal('m2RenderLayoutProductList')?.()}catch{}}}
  function markDirty(){if(!state.active)return;state.outputDirty=true;document.getElementById('page')?.classList.remove('rafex-output-ready-v90');}

  function toolbarMarkup(){return '<section class="rafex-common-toolbar-v90" id="rafexCommonToolbarV90"><label class="rafex-common-name-v90"><span>ORTAK ÇİZİM PROJE ADI</span><input id="rafexCommonProjectNameV90" type="text" maxlength="120" placeholder="Örn. Depo ortak yerleşimi"></label><div class="rafex-common-actions-v90"><button type="button" id="rafexCommonSaveV90" data-primary="1">Projeyi Kaydet</button><button type="button" id="rafexCommonUndoV90">Geri Al</button><button type="button" id="rafexCommonProductsV90">Ürün Dökümü</button><button type="button" id="rafexCommon3DV90">3D Gör</button><button type="button" id="rafexCommonOutputV90" data-primary="1">Çıktıyı Oluştur</button></div><div class="rafex-common-status-v90" id="rafexCommonStatusV90"></div></section>'}
  function ensureToolbar(){
    const page=document.getElementById('page');if(!page||!state.active)return null;page.classList.add('rafex-common-v90');
    let toolbar=document.getElementById('rafexCommonToolbarV90');if(!toolbar){const anchor=document.getElementById('rafexUnifiedSystemPicker')||page.querySelector('.hero')||page.firstElementChild;if(anchor)anchor.insertAdjacentHTML('beforebegin',toolbarMarkup());else page.insertAdjacentHTML('afterbegin',toolbarMarkup());toolbar=document.getElementById('rafexCommonToolbarV90')}
    const input=document.getElementById('rafexCommonProjectNameV90');if(input&&input.value!==state.name)input.value=state.name;
    if(input&&!input.dataset.bound){input.dataset.bound='1';input.addEventListener('input',()=>{state.name=input.value;const native=document.getElementById('m2ProjectName');if(native)native.value=state.name;markDirty()})}
    const native=document.getElementById('m2ProjectName');if(native){const label=native.closest('label');if(label)label.classList.add('rafex-native-project-bridge-v90');native.value=state.name||native.value||''}
    const collapsed=page.querySelector('.rafex-common-collapsed-note-v90');if(!collapsed){const canvas=page.querySelector('canvas');canvas?.insertAdjacentHTML('beforebegin','<div class="rafex-common-collapsed-note-v90">3D görünüm kapalıdır; yalnız gerektiğinde “3D Gör” ile açılır.</div>')}
    return toolbar;
  }
  function decorate(){
    if(!state.active)return;const page=document.getElementById('page');if(!page)return;ensureToolbar();
    const title=document.getElementById('pageTitle');if(title)title.textContent='Ortak Çizim';
    const heading=page.querySelector('.hero h2');if(heading)heading.textContent='Ortak Çizim';
    const kicker=page.querySelector('.hero p');if(kicker)kicker.textContent='B2B · MEKİK · MR · ORTAK YERLEŞİM';
    const nav=document.querySelector('#nav button[data-page="free"]');if(nav){const texts=[...nav.childNodes].filter((node)=>node.nodeType===3);if(texts.length)texts[texts.length-1].textContent=' Ortak Çizim';else if(!/Ortak Çizim/.test(nav.textContent||''))nav.append(' Ortak Çizim')}
    page.querySelectorAll('.rafex-system-option[data-ready="false"]').forEach((node)=>node.remove());
    const pickerTitle=page.querySelector('.rafex-system-picker-head h3');if(pickerTitle)pickerTitle.textContent='Ortak Çizim Modül Araçları';
    const pickerCopy=page.querySelector('.rafex-system-picker-head p');if(pickerCopy)pickerCopy.textContent='B2B, Mekik ve MR modüllerini aynı planda kullan. Sistem değiştirirken yerleşim ve proje adı korunur.';
    const projectTitle=page.querySelector('.m2-project-actions>div>b');if(projectTitle)projectTitle.textContent='Kayıtlı Ortak Çizim Projeleri';
    const reportTitle=page.querySelector('.m2-report-head b');if(reportTitle)reportTitle.textContent='Ortak Çizim Çıktı Alanı';
    page.classList.toggle('rafex-products-open-v90',state.productsOpen);page.classList.toggle('rafex-3d-open-v90',state.view3D);page.classList.toggle('rafex-output-ready-v90',!state.outputDirty);
    window.rafexCommonV44Api?.decorate?.();setViewerPaused(!state.view3D);
  }

  function withOutput(callback){
    window.__rafexExplicitOutputV90=true;state.outputDirty=false;document.getElementById('page')?.classList.add('rafex-output-ready-v90');
    const run=window.rafexRunPdfWorkV78||((fn)=>fn());let result;
    try{result=run(callback)}catch(error){window.__rafexExplicitOutputV90=false;throw error}
    if(result&&typeof result.finally==='function')return result.finally(()=>{window.__rafexExplicitOutputV90=false});
    requestAnimationFrame(()=>{window.__rafexExplicitOutputV90=false});return result;
  }
  function createOutput(){
    return withOutput(()=>{try{window.rafexRefreshProductCountsV77?.()}catch{}try{readGlobal('m2RenderLayoutProductList')?.()}catch{}try{readGlobal('m2RefreshActiveReport')?.()}catch{}requestAnimationFrame(()=>window.rafexCommonV44Api?.syncPdf?.());status('Ortak Çizim çıktısı güncel proje verileriyle oluşturuldu.')});
  }

  async function enterCommon(){
    state.active=true;window.__rafexCommonArchitectureV90Active=true;
    if(!window.rafexUnifiedFreeDrawingActiveV75?.())state.base.enter?.();
    await new Promise((resolve)=>requestAnimationFrame(resolve));
    if(!document.getElementById('rafexUnifiedSystemPicker')){try{document.querySelector('#nav button[data-page="free"]')?.click()}catch{}if(!window.rafexUnifiedFreeDrawingActiveV75?.())state.base.enter?.();await new Promise((resolve)=>requestAnimationFrame(resolve))}
    syncRoute(state.projectKey);decorate();return realCommon();
  }
  function exitCommon(){state.active=false;window.__rafexCommonArchitectureV90Active=false;window.__rafexExplicitOutputV90=false;setViewerPaused(false);const page=document.getElementById('page');page?.classList.remove('rafex-common-v90','rafex-products-open-v90','rafex-3d-open-v90','rafex-output-ready-v90');syncRoute('')}
  async function openProject(project,asCopy=false){
    if(!project)return false;
    if(!isCommonProject(project)){exitCommon();return state.base.applyProject?state.base.applyProject(project,Boolean(asCopy)):false}
    const key=String(project.serial_no??project.id??'');if(state.projectLoaded&&state.projectKey===key&&!asCopy){decorate();return true}
    const normalized=normalizeProject(project);state.project=normalized;state.projectKey=key;state.name=String(project.project_name||'')+(asCopy?' - Kopya':'');
    await enterCommon();const opened=state.base.loadUnified?.(normalized,Boolean(asCopy));state.projectLoaded=opened!==false;syncRoute(key);decorate();markDirty();
    if(state.base.refreshProjects)await readGlobal('m2RefreshProjects')?.();status('Proje #'+String(project.serial_no??project.id??'')+' Ortak Çizim olarak açıldı.');return opened!==false;
  }
  async function openProjectByKey(key){
    if(state.projectLoaded&&state.projectKey===String(Number(key)||key))return true;
    try{const result=await readGlobal('req')('/api/project-detail/'+encodeURIComponent(key));return openProject(result?.project,false)}catch(error){status(error?.message||'Ortak proje açılamadı.');return false}
  }

  function installRequestLayer(){
    const base=readGlobal('req');if(typeof base!=='function'||base.__rafexCommonV90)return false;
    state.base.req=base;
    const wrapped=async function(url,opt={}){
      const method=String(opt?.method||'GET').toUpperCase();let next=opt;
      if(state.active&&url==='/api/projects'&&method==='POST'){
        try{const body=JSON.parse(opt.body||'{}'),name=String(document.getElementById('rafexCommonProjectNameV90')?.value||state.name||body.projectName||'').trim();body.module='ortak';body.projectName=name;body.payload=compactPayload(body.payload||{});next={...opt,body:JSON.stringify(body)};state.name=name}catch{}
      }
      const cacheable=method==='GET'&&/^\/api\/(projects(?:\/summary)?|project-detail\/|b2b-types|mekik2-types)/.test(String(url));const cacheKey=method+':'+url;
      if(cacheable){const cached=state.requestCache.get(cacheKey);if(cached&&Date.now()-cached.at<1500)return cached.value;if(state.requestInflight.has(cacheKey))return state.requestInflight.get(cacheKey)}
      const task=Promise.resolve(base.call(this,url,next));if(cacheable)state.requestInflight.set(cacheKey,task);
      try{const value=await task;if(cacheable)state.requestCache.set(cacheKey,{at:Date.now(),value});if(method!=='GET'){state.requestCache.clear();state.requestInflight.clear()}return value}finally{if(cacheable)state.requestInflight.delete(cacheKey)}
    };
    wrapped.__rafexCommonV90=true;wrapped.__rafexOriginal=base;assignGlobal('req',wrapped);return true;
  }
  function installFunctionWrappers(){
    if(state.wrappers)return true;const enter=window.rafexEnterUnifiedFreeDrawing,loader=window.rafexLoadUnifiedProjectV75;if(typeof enter!=='function'||typeof loader!=='function'||!installRequestLayer())return false;
    state.base.enter=enter;state.base.loadUnified=loader;state.base.loadProject=readGlobal('m2LoadProject');state.base.refreshProjects=readGlobal('m2RefreshProjects');state.base.saveProject=readGlobal('m2SaveProject');state.base.applyProject=readGlobal('m2ApplyProjectRecord');

    const loadProject=async function(id){
      let rows=[];try{rows=Array.isArray(m2ProjectRecords)?m2ProjectRecords:[]}catch{}let project=rows.find((item)=>Number(item?.id)===Number(id)||Number(item?.serial_no)===Number(id));
      if(project&&(isCommonProject(project)||state.active)){if(!project.payload){const result=await readGlobal('req')('/api/project-detail/'+encodeURIComponent(project.serial_no??project.id));project=result?.project}return openProject(project,false)}
      return state.base.loadProject?.apply(this,arguments);
    };assignGlobal('m2LoadProject',loadProject);

    const refreshProjects=async function(){
      if(!state.active)return state.base.refreshProjects?.apply(this,arguments);
      try{const result=await readGlobal('req')('/api/projects/summary'),rows=(result?.projects||[]).filter(isCommonProject);try{m2ProjectRecords=rows}catch{}window.m2ProjectRecords=rows;readGlobal('m2RenderProjects')?.();decorate();return rows}catch(error){status(error?.message||'Ortak projeler getirilemedi.');return[]}
    };assignGlobal('m2RefreshProjects',refreshProjects);

    const saveProject=async function(){
      if(!state.active)return state.base.saveProject?.apply(this,arguments);ensureToolbar();const name=String(document.getElementById('rafexCommonProjectNameV90')?.value||state.name||'').trim();if(!name){status('Kaydedilemedi: Ortak Çizim proje adı yazılmadı.');document.getElementById('rafexCommonProjectNameV90')?.focus();return}state.name=name;const native=document.getElementById('m2ProjectName');if(native)native.value=name;const result=await state.base.saveProject?.apply(this,arguments);state.requestCache.clear();await refreshProjects();status('Ortak Çizim projesi kaydedildi.');return result
    };assignGlobal('m2SaveProject',saveProject);

    ['m2RenderA4Report','m2RenderCorporateReport','m2RefreshActiveReport','m2ScheduleReportRefresh','m2BuildCorporatePages'].forEach((name)=>{const original=readGlobal(name);if(typeof original!=='function'||original.__rafexOutputGuardV90)return;state.heavy[name]=original;const wrapped=function(){if(state.active&&window.__rafexExplicitOutputV90!==true){markDirty();return name==='m2BuildCorporatePages'?'':null}return original.apply(this,arguments)};wrapped.__rafexOutputGuardV90=true;wrapped.__rafexOriginal=original;assignGlobal(name,wrapped)});
    ['m2PrintCorporateReport','m2PrintA4Report'].forEach((name)=>{const original=readGlobal(name);if(typeof original!=='function'||original.__rafexOutputPrintV90)return;const wrapped=function(){return withOutput(()=>original.apply(this,arguments))};wrapped.__rafexOutputPrintV90=true;wrapped.__rafexOriginal=original;assignGlobal(name,wrapped)});

    window.rafexEnterUnifiedFreeDrawing=function(){state.active=true;window.__rafexCommonArchitectureV90Active=true;const result=enter.apply(this,arguments);requestAnimationFrame(decorate);return result};
    state.wrappers=true;return true;
  }

  document.addEventListener('click',(event)=>{
    const nav=event.target?.closest?.('#nav button[data-page]');
    if(nav?.dataset.page==='free'){event.preventDefault();event.stopImmediatePropagation();enterCommon();return}
    if(nav&&nav.dataset.page!=='free'){exitCommon();return}
    if(!state.active)return;
    const button=event.target?.closest?.('button');if(!button)return;
    if(button.id==='rafexCommonSaveV90'){event.preventDefault();readGlobal('m2SaveProject')?.();return}
    if(button.id==='rafexCommonUndoV90'){event.preventDefault();readGlobal('m2UndoLastAction')?.();markDirty();return}
    if(button.id==='rafexCommonProductsV90'){event.preventDefault();setProductsOpen(!state.productsOpen);return}
    if(button.id==='rafexCommon3DV90'){event.preventDefault();set3DOpen(!state.view3D);return}
    if(button.id==='rafexCommonOutputV90'){event.preventDefault();createOutput();return}
    const text=String(button.textContent||'').trim();if(/Çıktıyı Oluştur|PDF Oluştur/i.test(text)){window.__rafexExplicitOutputV90=true;document.getElementById('page')?.classList.add('rafex-output-ready-v90');requestAnimationFrame(()=>{window.__rafexExplicitOutputV90=false})}
    if(!/3D|Kamera|Yaklaş|Uzaklaş|Görünüş/i.test(text))markDirty();requestAnimationFrame(decorate);
  },true);
  document.addEventListener('input',(event)=>{if(state.active&&!event.target?.closest?.('#rafexCommonToolbarV90'))markDirty()},true);
  document.addEventListener('change',(event)=>{if(state.active){markDirty();if(event.target?.matches?.('input[name="rafexUnifiedSystem"]'))requestAnimationFrame(()=>{decorate();setViewerPaused(!state.view3D)})}},true);
  document.addEventListener('pointerdown',(event)=>{if(state.active&&event.target?.closest?.('[data-rack]'))state.dragging=true},true);
  document.addEventListener('pointerup',()=>{if(state.active&&state.dragging){state.dragging=false;markDirty()}},true);
  window.addEventListener('rafex-b2b-viewer-ready',()=>setViewerPaused(!state.view3D));window.addEventListener('rafex-mr-viewer-ready',()=>setViewerPaused(!state.view3D));

  function boot(){
    if(!installFunctionWrappers()){setTimeout(boot,50);return}
    window.rafexOpenProjectV90=openProject;window.rafexOpenProjectByKeyV90=openProjectByKey;window.rafexCommonCreateOutputV90=createOutput;window.rafexCompactCommonPayloadV90=compactPayload;window.rafexExpandCommonPayloadV90=expandPayload;window.rafexIsCommonProjectV90=isCommonProject;
    let wanted='',mode='';try{const params=new URLSearchParams(location.search);wanted=String(params.get('project')||'').trim();mode=String(params.get('mode')||'').trim()}catch{}
    if(mode==='common'&&!wanted)enterCommon();
    if(wanted)setTimeout(()=>{if(!state.projectLoaded)openProjectByKey(wanted)},1150);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();</script>`;

const bodyEnd = html.lastIndexOf("</body>");
if (bodyEnd < 0) throw new Error("Common architecture v90: body bulunamadi");
html = html.slice(0, bodyEnd) + runtime + "\n" + html.slice(bodyEnd);

for (const required of [
  'data-rafex-common-architecture="v90"',
  'window.__rafexCommonArchitectureV90Active',
  'rafexOpenProjectV90',
  'rafex-common-v3',
  '/api/projects/summary',
  '/api/project-detail/',
  'm2BuildCorporatePages',
  'rafexCommonCreateOutputV90',
  'setViewerPaused',
  'window.rafexCommonV44Api={decorate:decorateIndependent',
]) if (!html.includes(required)) throw new Error("Common architecture v90 dogrulama eksigi: " + required);
if (html.includes("setTimeout(syncPdf,3250)") || html.includes("observer.observe(document.body,{childList:true,subtree:true})")) {
  throw new Error("Common architecture v90: eski PDF/MutationObserver yukleri kaldi");
}

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.slice(0, match.index) + match[0].replace(match[3], encoded) + worker.slice(match.index + match[0].length);
fs.writeFileSync(workerPath, worker);
console.log("v90: Ortak Cizim tek kontrolcu, kompakt proje, ozel API, istege bagli PDF/3D ve olaya dayali UI ile aktif.");
