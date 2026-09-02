import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const workerPath = path.join(root, "dist/server/index.js");
const marker = 'data-rafex-unified-free-drawing="v1"';

let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("Unified free drawing: HTML_BASE64 bulunamadi.");

let html = Buffer.from(match[3], "base64").toString("utf8");

html = html
  .replace(/<style\s+data-rafex-unified-free-drawing="v1">[\s\S]*?<\/style>\s*<script\s+data-rafex-unified-free-drawing="v1">[\s\S]*?<\/script>/g, "");

const runtime = `<style ${marker}>
#page.rafex-free-drawing-page{--rafex-free-green:#173c2d;--rafex-free-soft:#edf4ef;--rafex-free-line:#d8e5dc}
#page.rafex-free-drawing-page>.hero{margin-bottom:14px}
.rafex-system-picker{margin:0 0 16px;padding:18px;border:1px solid var(--rafex-free-line);background:#fff}
.rafex-system-picker-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:14px}
.rafex-system-picker-head h3{margin:0;color:#173c2d;font-size:17px}
.rafex-system-picker-head p{margin:5px 0 0;color:#6c786f;font-size:12px;line-height:1.5}
.rafex-system-picker-step{flex:none;padding:6px 10px;border-radius:999px;background:#173c2d;color:#fff;font-size:10px;font-weight:900;letter-spacing:.07em}
.rafex-system-options{display:grid;grid-template-columns:repeat(5,minmax(130px,1fr));gap:9px}
.rafex-system-option{position:relative;display:flex;min-height:84px;padding:12px;border:1px solid #dce6df;border-radius:11px;background:#f8faf8;cursor:pointer;transition:.15s ease}
.rafex-system-option:hover{border-color:#9fb9a8;background:#f2f7f3}
.rafex-system-option input{position:absolute;opacity:0;pointer-events:none}
.rafex-system-option-body{display:flex;flex-direction:column;gap:5px;width:100%}
.rafex-system-option strong{font-size:13px;color:#173c2d}
.rafex-system-option small{font-size:10px;line-height:1.35;color:#738077}
.rafex-system-option em{margin-top:auto;font-style:normal;font-size:9px;font-weight:900;letter-spacing:.04em;color:#728078}
.rafex-system-option:has(input:checked){border-color:#173c2d;background:#e8f1eb;box-shadow:inset 0 0 0 1px #173c2d}
.rafex-system-option:has(input:checked) em{color:#173c2d}
.rafex-system-option[data-ready="false"]{background:#fbfbfa}
.rafex-system-option[data-ready="false"] em{color:#997b3c}
.rafex-system-picker-actions{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-top:14px;padding-top:13px;border-top:1px solid #edf1ee}
.rafex-system-continue,.rafex-system-add-module{border:0;border-radius:9px;padding:10px 16px;font-weight:900;cursor:pointer}
.rafex-system-continue{background:#173c2d;color:#fff}
.rafex-system-add-module{background:#f0c800;color:#17241d}
.rafex-system-add-module[disabled]{opacity:.45;cursor:not-allowed}
.rafex-system-picker-message{min-height:18px;margin-left:auto;font-size:11px;font-weight:700;color:#66736b}
.rafex-system-picker-message.error{color:#a23a3a}
.rafex-system-picker-message.ok{color:#245c3c}
/* Sistem seçilince o sistemin kendi iki kolonlu hesap + görsel düzeni korunur. */
.rafex-system-unavailable{display:none;margin:0 0 16px;padding:18px;border:1px dashed #c8d3cb;border-radius:12px;background:#fbfcfb}
#page.rafex-free-drawing-page.rafex-free-unavailable .rafex-system-unavailable{display:block}
.rafex-system-unavailable h3{margin:0 0 7px;color:#173c2d;font-size:15px}
.rafex-system-unavailable p{margin:0;color:#6c776f;font-size:12px;line-height:1.55}
.rafex-free-mode-note{display:flex;align-items:center;gap:8px;margin:0 0 12px;padding:9px 12px;border-radius:9px;background:#edf4ef;color:#31513f;font-size:11px;font-weight:800}
.rafex-free-mode-note b{color:#173c2d}
@media(max-width:1100px){.rafex-system-options{grid-template-columns:repeat(3,minmax(130px,1fr))}}
@media(max-width:720px){.rafex-system-options{grid-template-columns:1fr 1fr}.rafex-system-picker-head{flex-direction:column}.rafex-system-picker-message{width:100%;margin-left:0}}
@media(max-width:430px){.rafex-system-options{grid-template-columns:1fr}}
</style>
<script ${marker}>(function(){
  if(window.__rafexUnifiedFreeDrawingV1)return;
  window.__rafexUnifiedFreeDrawingV1=true;

  const SUPPORTED=new Set(['b2b','mekik2','drive','mr','konsol']);
  const SYSTEMS=[
    {key:'b2b',label:'B2B',desc:'B2B ürün girdilerini aç; mevcut ortak yerleşim korunur.',ready:true},
    {key:'mekik2',label:'Mekik',desc:'Mekik ürün girdilerini aç; aynı alana raf eklemeye devam et.',ready:true},
    {key:'drive',label:'Drive-In',desc:'Drive-In ürün girdilerini aç; aynı ortak alana raf ekle.',ready:true},
    {key:'mr',label:'MR',desc:'MR ürün girdilerini aç; B2B ve Mekik ile aynı alana ekle.',ready:true},
    {key:'konsol',label:'Konsol Kollu',desc:'Konsol Kollu girdilerini ve 3D görünüşünü aç; aynı ortak alana raf ekle.',ready:true}
  ];
  const COMMON_KEYS=['layoutState','layoutZoom','pinnedDimensions','pinnedDimensionsByRack','dimensionOffsets','dimensionFontSizes','selectedDimensionKey','userNotes','selectedNoteId','hiddenSummaryDimensions','visibleRackDimensions','showSharedFootLabels','edgeEditorVisible','freeMeasure','layoutSymbols','selectedSymbolId'];
  const free={active:false,pending:null,selected:null,continued:false,currentEngine:null,previousM2Module:null,common:null,systemStates:Object.create(null)};

  function canUseM2(){return typeof m2FreshModuleState==='function'&&typeof m2CaptureModuleState==='function'&&typeof m2RestoreModuleState==='function';}
  function pickCommon(state){const common={};COMMON_KEYS.forEach((key)=>common[key]=state[key]);return common;}
  function applyCommon(state){if(!free.common)return state;COMMON_KEYS.forEach((key)=>state[key]=free.common[key]);return state;}
  function ensureUnifiedState(){
    if(free.common||!canUseM2())return;
    const fresh=m2FreshModuleState();
    free.common=pickCommon(fresh);
  }
  function captureEngine(){
    if(!free.active||!free.currentEngine||!SUPPORTED.has(free.currentEngine)||!canUseM2())return;
    const state=m2CaptureModuleState();
    free.systemStates[free.currentEngine]=state;
    free.common=pickCommon(state);
  }
  function restoreEngine(system){
    ensureUnifiedState();
    let state=free.systemStates[system];
    if(!state)state=m2FreshModuleState();
    applyCommon(state);
    m2RestoreModuleState(state);
    m2ActiveModule=system;
    free.currentEngine=system;
  }
  function saveStandaloneState(){
    if(!canUseM2())return;
    try{
      free.previousM2Module=m2ActiveModule;
      if(free.previousM2Module)m2ModuleStates[free.previousM2Module]=m2CaptureModuleState();
    }catch(error){console.warn('Serbest Cizim standalone state kaydedilemedi',error);}
  }
  function restoreStandaloneState(){
    if(!canUseM2())return;
    try{
      captureEngine();
      const previous=free.previousM2Module||'mekik2';
      const state=m2ModuleStates?.[previous];
      if(state)m2RestoreModuleState(state);
      m2ActiveModule=previous;
    }catch(error){console.warn('Serbest Cizim standalone state geri yuklenemedi',error);}
  }

  function ensureNav(){
    const nav=document.getElementById('nav');
    if(!nav)return;
    let button=nav.querySelector('button[data-page="free"]');
    const b2b=nav.querySelector('button[data-page="b2b"]');
    if(!button&&b2b){
      button=document.createElement('button');
      button.dataset.page='free';
      button.innerHTML='<i>01</i>Serbest Çizim';
      nav.insertBefore(button,b2b);
    }
    const numbers={b2b:'02',ayak:'03',travers:'04',mr:'05',drive:'06',mekik2:'07',konsol:'08',admin:'09'};
    Object.entries(numbers).forEach(([page,no])=>{const i=nav.querySelector('button[data-page="'+page+'"] i');if(i)i.textContent=no;});
  }
  function setNavActive(){document.querySelectorAll('#nav button[data-page]').forEach((button)=>button.classList.toggle('active',button.dataset.page==='free'));}

  function optionMarkup(system){
    const checked=free.pending===system.key?' checked':'';
    return '<label class="rafex-system-option" data-ready="'+String(system.ready)+'"><input type="radio" name="rafexUnifiedSystem" value="'+system.key+'"'+checked+'><span class="rafex-system-option-body"><strong>'+system.label+'</strong><small>'+system.desc+'</small><em>'+(system.ready?'MODÜL ÇİZİMİ HAZIR':'ALTYAPI BEKLİYOR')+'</em></span></label>';
  }
  function pickerMarkup(){
    return '<section class="card rafex-system-picker" id="rafexUnifiedSystemPicker"><div class="rafex-system-picker-head"><div><h3>Raf Sistemi Araçları</h3><p>B2B, Mekik, Drive-In, MR ve Konsol Kollu aynı Serbest Çizim projesinde birlikte kullanılır. Sistem kartına tıklayınca kendi ürün girdileri ve görseli doğrudan açılır.</p></div><span class="rafex-system-picker-step">ORTAK YERLEŞİM</span></div><div class="rafex-system-options">'+SYSTEMS.map(optionMarkup).join('')+'</div><div class="rafex-system-picker-actions"><button type="button" class="rafex-system-add-module" id="rafexUnifiedAddModule" disabled>+ Modülü Ortak Alana Ekle</button><span class="rafex-system-picker-message" id="rafexUnifiedMessage"></span></div></section><section class="rafex-system-unavailable" id="rafexUnifiedUnavailable"><h3>Bu sistem için ortak modül geometrisi henüz hazır değil</h3><p id="rafexUnifiedUnavailableText"></p></section>';
  }
  function setMessage(text,type=''){
    const box=document.getElementById('rafexUnifiedMessage');if(!box)return;
    box.textContent=text||'';box.className='rafex-system-picker-message'+(type?' '+type:'');
  }
  function systemLabel(key){return SYSTEMS.find((item)=>item.key===key)?.label||key;}

  function decoratePage(){
    const page=document.getElementById('page');if(!page)return;
    page.classList.add('rafex-free-drawing-page');
    page.classList.toggle('rafex-free-awaiting',!free.continued);
    page.classList.toggle('rafex-free-unavailable',free.continued&&!SUPPORTED.has(free.selected));
    page.dataset.rafexFreeDrawing='1';
    const title=document.getElementById('pageTitle');if(title)title.textContent='Serbest Çizim';
    const hero=page.querySelector('.hero');
    if(hero){
      const kicker=hero.querySelector('p'),heading=hero.querySelector('h2');
      if(kicker)kicker.textContent='TÜM RAF SİSTEMLERİ · ORTAK YERLEŞİM';
      if(heading)heading.textContent='Serbest Çizim';
      if(!document.getElementById('rafexUnifiedSystemPicker'))hero.insertAdjacentHTML('afterend',pickerMarkup());
    }else if(!document.getElementById('rafexUnifiedSystemPicker'))page.insertAdjacentHTML('afterbegin',pickerMarkup());

    const floor=page.querySelector('.m2-floor-editor');
    if(floor&&!page.querySelector('.rafex-free-mode-note'))floor.insertAdjacentHTML('beforebegin','<div class="rafex-free-mode-note"><b>ORTAK ALAN</b><span>B2B, Mekik, Drive-In, MR ve Konsol Kollu modülleri aynı Serbest Çizim alanında birlikte taşınabilir, döndürülebilir ve PDF yerleşiminde korunur.</span></div>');

    page.querySelectorAll('input[name="rafexUnifiedSystem"]').forEach((input)=>{
      input.checked=free.pending===input.value;
      input.addEventListener('change',()=>{free.pending=input.value;free.selected=input.value;continueSelected();});
    });
    document.getElementById('rafexUnifiedContinue')?.addEventListener('click',continueSelected);
    const add=document.getElementById('rafexUnifiedAddModule');
    if(add){add.disabled=!(free.continued&&SUPPORTED.has(free.selected));add.addEventListener('click',addCurrentModule);}
    if(free.continued&&free.selected){
      const supported=SUPPORTED.has(free.selected);
      setMessage(supported?systemLabel(free.selected)+' hesap girdileri açık.':'Bu sistemin ortak çizim adaptörü henüz mevcut değil.',supported?'ok':'error');
      if(!supported){const text=document.getElementById('rafexUnifiedUnavailableText');if(text)text.textContent=systemLabel(free.selected)+' için mevcut portalda ortak Serbest Çizim alanına aktarılabilecek teknik modül çizimi tanımlı değil. Sistem kartı yerini aldı; çizim motoru eklendiğinde aynı akıştan doğrudan modül üretilecek.';}
    }else setMessage('Bir sistem tipi seç; ürün girdileri doğrudan açılır.');
    setNavActive();
    if(typeof applyTranslations==='function')try{applyTranslations(page);}catch{}
  }

  function konsolSpec(){
    try{var api=window.rafexKonsolFreeApiV46;if(api&&typeof api.getCurrentSpec==='function')return api.getCurrentSpec();}catch(_){}
    var value=function(id,fallback){var node=document.getElementById(id),n=Number(node&&node.value);return Number.isFinite(n)&&n>0?n:fallback};
    return{count:Math.max(2,Math.round(value('konsolUprightCount',5))),spacing:value('konsolSpacing',1500),height:value('konsolHeight',4500),arm:value('konsolArmLength',1200),levels:Math.max(1,Math.round(value('konsolLevels',4))),side:document.getElementById('konsolSide')?.value==='double'?'double':'single',productLength:value('femProductLength',0),levelLoad:value('konsolLevelLoad',500)};
  }
  function konsolDrawing(){
    var spec=konsolSpec(),count=Math.max(2,Number(spec.count)||5),spacing=Math.max(300,Number(spec.spacing)||1500),arm=Math.max(250,Number(spec.arm)||1200),height=Math.max(1000,Number(spec.height)||4500),levels=Math.max(1,Number(spec.levels)||4),side=spec.side==='double'?'double':'single';
    var totalWidth=Math.max((count-1)*spacing+130,Number(spec.productLength)||0),totalDepth=(side==='double'?arm*2:arm)+220;
    return{rafexSystem:'konsol',systemType:'konsol',totalWidth:totalWidth,railLength:totalDepth,widthMm:totalWidth,depthMm:totalDepth,bays:Math.max(1,count-1),levels:levels,depth:1,palW:spacing,palD:arm,palletWeight:Number(spec.levelLoad)||0,palletHeight:0,levelH:levels>1?height/(levels-1):height,traverseHeight:0,totalRackHeight:height,sideUprightHeight:height,footType:130,layoutView:'konsol-top',palletPositions:[0],palletGaps:[],plan:{feet:Array.from({length:count},function(){return totalDepth}),braces:[]},konsol:{...spec,count:count,spacing:spacing,arm:arm,height:height,levels:levels,side:side,totalWidth:totalWidth,totalDepth:totalDepth},spec:{...spec,count:count,spacing:spacing,arm:arm,height:height,levels:levels,side:side}};
  }
  function syncKonsolDrawing(){
    if(free.selected!=='konsol')return;
    m2LastDrawing=konsolDrawing();
    var save=document.getElementById('m2SaveRackButton');if(save)save.disabled=false;
  }
  function renderKonsolCommon(){
    var page=document.getElementById('page'),floor=page&&page.querySelector('.m2-floor-editor');
    var viewerReady=typeof window.rafexLoadHeavyViewerV1==='function'?window.rafexLoadHeavyViewerV1('konsol'):Promise.resolve(!!window.RafexKonsolViewer);
    if(floor)floor.remove();
    var legacy=document.createElement('div');legacy.hidden=true;legacy.setAttribute('aria-hidden','true');legacy.className='rafex-konsol-common-legacy-engine';
    if(page)Array.from(page.children).filter(function(node){return node.matches?.('.hero,.m2-layout,.rafex-b2b-mekik-savebar,.m2-spacing-modal')}).forEach(function(node){legacy.appendChild(node)});
    if(legacy.childElementCount)document.body.appendChild(legacy);
    if(typeof window.renderKonsol==='function')window.renderKonsol();
    page=document.getElementById('page');if(!page)return;
    if(legacy.childElementCount)page.appendChild(legacy);
    if(floor)page.appendChild(floor);
    page.classList.add('konsol-common-mode');
    var settle=function(){page.querySelectorAll('.konsol-free-card,.konsol-pdf-card,.konsol-ortak-floor').forEach(function(node){if(node!==floor){node.hidden=true;node.setAttribute('aria-hidden','true')}})};
    settle();[80,220,600,1200].forEach(function(delay){setTimeout(settle,delay)});
    if(!page.dataset.rafexKonsolCommonAdapter){page.dataset.rafexKonsolCommonAdapter='1';page.addEventListener('input',function(event){if(event.target?.closest?.('.konsol-panel'))setTimeout(syncKonsolDrawing,0)});page.addEventListener('change',function(event){if(event.target?.closest?.('.konsol-panel'))setTimeout(syncKonsolDrawing,0)})}
    Promise.resolve(viewerReady).then(function(){if(free.active&&free.selected==='konsol'&&document.getElementById('konsolCanvas'))window.rafexMountKonsolViewer?.()}).catch(function(error){var status=document.getElementById('konsolViewerStatus');if(status)status.textContent='Konsol 3D motoru yüklenemedi.';console.warn('Konsol Ortak Cizim viewer yukleme hatasi',error)});
    syncKonsolDrawing();setTimeout(syncKonsolDrawing,80);setTimeout(function(){window.rafexUnifiedCatalogSync?.()},120);
  }

  function renderEngine(system,continued){
    const target=SUPPORTED.has(system)?system:'mekik2';
    if(free.currentEngine==='drive'&&target!=='drive')try{window.RafexDriveInViewer?.destroy?.()}catch{}
    if(free.currentEngine&&free.currentEngine!==target)captureEngine();
    if(target==='konsol'){ensureUnifiedState();m2ActiveModule='konsol';free.currentEngine='konsol';}
    else restoreEngine(target);
    const page=document.getElementById('page');
    if(page){
      page.classList.remove('b2b-mode','mr-mode','drive-in-mode');
      delete page.dataset.m2Module;
      page.dataset.rafexFreeContextSystem=target;
    }
    if(target==='b2b')renderB2B();else if(target==='mr')renderMR();else if(target==='drive')renderDrive();else if(target==='konsol')renderKonsolCommon();else renderMekik2();
    free.continued=Boolean(continued);
    decoratePage();
  }

  function enterFreeDrawing(){
    ensureNav();
    if(!free.active){
      saveStandaloneState();
      ensureUnifiedState();
      free.active=true;
      free.pending=free.selected||null;
      free.continued=false;
    }
    renderEngine(free.selected&&SUPPORTED.has(free.selected)?free.selected:'mekik2',false);
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function continueSelected(){
    const checked=document.querySelector('input[name="rafexUnifiedSystem"]:checked');
    const selected=checked?.value||free.pending;
    if(!selected){setMessage('Önce bir sistem tipi seç.','error');return;}
    free.pending=selected;free.selected=selected;
    if(SUPPORTED.has(selected)){
      renderEngine(selected,true);
    }else{
      free.continued=true;
      const page=document.getElementById('page');
      page?.classList.remove('rafex-free-awaiting');page?.classList.add('rafex-free-unavailable');
      const add=document.getElementById('rafexUnifiedAddModule');if(add)add.disabled=true;
      const text=document.getElementById('rafexUnifiedUnavailableText');if(text)text.textContent=systemLabel(selected)+' için mevcut portalda ortak Serbest Çizim alanına aktarılabilecek teknik modül çizimi tanımlı değil. Sistem kartı ve seçim akışı hazır; teknik çizim motoru geldiğinde aynı alana bağlanacak.';
      setMessage(systemLabel(selected)+' seçildi; teknik ortak çizim adaptörü bekleniyor.','error');
    }
  }

  function addCurrentModule(){
    if(!free.continued||!SUPPORTED.has(free.selected)){setMessage('Önce çizim motoru hazır bir sistem seç.','error');return;}
    try{
      if(free.selected==='konsol')syncKonsolDrawing();
      if(!m2LastDrawing?.plan){setMessage('Önce hesap girdilerini tamamlayıp modülü oluştur.','error');return;}
      const before=Array.isArray(m2LayoutState?.racks)?m2LayoutState.racks.length:0;
      m2AddRack(m2LastDrawing,null);
      const after=Array.isArray(m2LayoutState?.racks)?m2LayoutState.racks.length:0;
      if(after>before){setMessage(systemLabel(free.selected)+' modülü ortak Serbest Çizim alanına eklendi.','ok');setTimeout(()=>document.getElementById('m2LayoutSvg')?.scrollIntoView({behavior:'smooth',block:'center'}),80);}
      else setMessage('Modül eklenemedi. Önce Serbest Yerleşim alanını tamamla.','error');
    }catch(error){console.warn('Serbest Cizim modul ekleme hatasi',error);setMessage(error?.message||'Modül eklenemedi.','error');}
  }

  window.rafexEnterUnifiedFreeDrawing=enterFreeDrawing;
  window.rafexFreeDrawingContinue=continueSelected;
  window.rafexFreeAddCurrentModule=addCurrentModule;

  const originalShowPage=window.showPage||showPage;
  if(typeof originalShowPage==='function'){
    const wrapped=function(name){
      if(name==='free'){enterFreeDrawing();return;}
      if(free.active){restoreStandaloneState();free.active=false;free.currentEngine=null;}
      return originalShowPage(name);
    };
    try{showPage=wrapped;}catch{}
    window.showPage=wrapped;
  }

  function boot(){ensureNav();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  new MutationObserver(()=>ensureNav()).observe(document.documentElement,{childList:true,subtree:true});
})();</script>`;

const closing = html.lastIndexOf("</body>");
if (closing < 0) throw new Error("Unified free drawing: </body> bulunamadi.");
html = html.slice(0, closing) + runtime + "\n" + html.slice(closing);

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.replace(match[0], `${match[1]}${match[2]}${encoded}${match[2]}`);
fs.writeFileSync(workerPath, worker);

const finalHtml = Buffer.from(encoded, "base64").toString("utf8");
for (const required of ["rafexLoadHeavyViewerV1('konsol')","window.rafexMountKonsolViewer?.()","Konsol Ortak Cizim viewer yukleme hatasi"]) {
  if (!finalHtml.includes(required)) throw new Error(`Konsol Ortak Cizim 3D baglantisi eksik: ${required}`);
}
for (const required of [marker, "Serbest Çizim", "Raf Sistemi Araçları", "rafexEnterUnifiedFreeDrawing", "+ Modülü Ortak Alana Ekle", "['b2b','mekik2','drive','mr','konsol']", "else if(target==='konsol')renderKonsolCommon()", "rafexSystem:'konsol'", "page.classList.remove('b2b-mode','mr-mode','drive-in-mode')"] ) {
  if (!finalHtml.includes(required)) throw new Error(`Unified free drawing dogrulama hatasi: ${required}`);
}
if (finalHtml.includes("setTimeout(()=>document.querySelector('.m2-layout')?.scrollIntoView({behavior:'smooth',block:'start'}),60)")) {
  throw new Error("Unified free drawing: sistem gecisindeki otomatik kaydirma kaldirilamadi.");
}
console.log("FINAL: Ortak B2B/Mekik/Drive-In/MR sistem gecisi ekran kaydirilmadan yapilir (v1).");

