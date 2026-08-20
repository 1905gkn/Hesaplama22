import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const workerPath = path.join(root, "dist/server/index.js");
const marker = 'data-rafex-unified-section-positioner="v1"';

let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("Unified section positioner: HTML_BASE64 bulunamadi.");

let html = Buffer.from(match[3], "base64").toString("utf8");
if (!html.includes('data-rafex-b2b-section-positioner-fallback="v5"')) throw new Error("Unified section positioner: mevcut Kesit Yer Belirleme bulunamadi.");
if (!html.includes('data-rafex-unified-free-catalog="v1"')) throw new Error("Unified section positioner: ortak B2B/Mekik katalog katmani bulunamadi.");

html = html.replace(/<style\s+data-rafex-unified-section-positioner="v1">[\s\S]*?<\/style>\s*<script\s+data-rafex-unified-section-positioner="v1">[\s\S]*?<\/script>/g, "");

const runtime = String.raw`<style data-rafex-unified-section-positioner="v1">
.rafex-mekik-section-divider{margin:7px 0 2px;padding:7px 8px;border-top:1px solid #dce5df;color:#315f88;font-size:9px;font-weight:950;letter-spacing:.05em}
.rafex-section-list .rafex-mekik-section-entry{grid-template-columns:28px minmax(0,1fr)!important;background:#eef5fb!important;color:#17344f!important}
.rafex-section-list .rafex-mekik-section-entry.active{background:#e1effa!important;border-color:#6b9cc4!important}
.rafex-section-list .rafex-mekik-section-entry span:first-child{background:#315f88!important}
.rafex-section-list .rafex-mekik-section-entry b{display:flex;flex-direction:column;gap:2px}
.rafex-section-list .rafex-mekik-section-entry small{font-size:8px;font-weight:800;color:#60788d}
.rafex-mekik-section-workspace[hidden]{display:none!important}
.rafex-mekik-section-title{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 11px;margin-bottom:8px;border:1px solid #cbdce9;border-radius:9px;background:#eef5fb;color:#17344f;font-size:11px;font-weight:900}
.rafex-mekik-system-badge{display:inline-flex;align-items:center;padding:3px 7px;border-radius:999px;background:#315f88;color:#fff;font-size:8px;font-weight:950;letter-spacing:.04em}
.rafex-mekik-section-card{border:1px solid #cbdce9;border-radius:11px;overflow:hidden;background:#f8fbfd}
.rafex-mekik-section-card>b{display:block;padding:8px 10px;background:#dceaf5;color:#17344f;text-align:center;font-size:10px}
.rafex-mekik-stage{position:relative;height:min(56vh,530px);min-height:370px;overflow:hidden;background:#fff;cursor:grab;touch-action:none;user-select:none;border-bottom:1px solid #dfe8ef}
.rafex-mekik-stage.is-dragging{cursor:grabbing}
.rafex-mekik-art{position:absolute;left:50%;top:50%;width:100%;height:100%;max-width:none;object-fit:contain;transform:translate(-50%,-50%);transform-origin:center center;pointer-events:none;user-select:none}
.rafex-mekik-empty{position:absolute;inset:0;display:grid;place-items:center;color:#7b8b97;font-size:11px;pointer-events:none}
.rafex-mekik-controls{display:grid;grid-template-columns:auto 32px 58px 32px auto 1fr auto auto auto;gap:6px;align-items:center;padding:8px;background:#f3f7fa}
.rafex-mekik-controls span{font-size:9px;color:#60788d}.rafex-mekik-controls button{padding:7px 8px;background:#e6eef4;color:#17344f;border-radius:7px}.rafex-mekik-controls strong{font-size:10px;text-align:center;color:#17344f}
.rafex-mekik-section-meta{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:9px 11px;background:#fff;color:#516979;font-size:9px;font-weight:800}
.rafex-mekik-section-meta b{color:#17344f}
.m2-corporate-type-card.rafex-mekik-section-output-card>.m2-corporate-view[data-rafex-mekik-hidden="1"]{display:none!important}
.rafex-mekik-sections-grid{display:grid;grid-template-rows:repeat(var(--rafex-mekik-section-count,1),minmax(0,1fr));gap:5px;min-height:0;height:100%;padding:4px}
.rafex-mekik-output-section{position:relative;min-height:0;overflow:hidden;border:1px solid #d9e4ec;border-radius:7px;background:#fff}
.rafex-mekik-output-label{position:absolute;z-index:2;left:6px;top:5px;padding:3px 6px;border-radius:999px;background:#315f88;color:#fff;font-size:7px;font-weight:950;letter-spacing:.03em}
.rafex-mekik-output-frame{position:absolute;inset:0;overflow:hidden}
.rafex-mekik-output-frame img{position:absolute;width:100%;height:100%;max-width:none;object-fit:contain;object-position:center center;transform-origin:center center}
@media(max-width:820px){.rafex-mekik-stage{height:360px;min-height:290px}.rafex-mekik-controls{grid-template-columns:auto 32px 50px 32px auto}.rafex-mekik-controls span:last-of-type{display:none}}
</style>
<script data-rafex-unified-section-positioner="v1">(function(){
  if(window.__rafexUnifiedSectionPositionerV1)return;
  window.__rafexUnifiedSectionPositionerV1=true;

  var STORAGE_KEY='rafex_mekik_section_placement_v1';
  var saved=loadSettings();
  var draft=clone(saved);
  var typeCache=[];
  var modalSections=[];
  var activeSectionKey='';
  var reportTimer=0;

  function clone(value){try{return JSON.parse(JSON.stringify(value||{}));}catch{return {};}}
  function number(value,fallback){var n=Number(value);return Number.isFinite(n)?n:(fallback||0);}
  function clamp(value,min,max){return Math.max(min,Math.min(max,value));}
  function norm(value){return String(value||'').trim().replace(/\s+/g,' ').toLocaleLowerCase('tr-TR');}
  function esc(value){return String(value||'').replace(/[&<>\"]/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[ch];});}
  function normalizeAngle(value){var n=Math.round(number(value,0));n=((n%360)+360)%360;return n;}
  function sectionView(angle){var a=normalizeAngle(angle);return (a===90||a===270)?'side':'front';}
  function defaultSetting(){return {x:0,y:0,scale:1,rotation:0};}
  function loadSettings(){try{var raw=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');return raw&&typeof raw==='object'?raw:{};}catch{return {};}}
  function settingFor(key,source){var raw=(source||saved)[key]||defaultSetting();return {x:clamp(number(raw.x,0),-80,80),y:clamp(number(raw.y,0),-80,80),scale:clamp(number(raw.scale,1),.35,2.5),rotation:clamp(number(raw.rotation,0),-180,180)};}
  function ensureSetting(key){if(!draft[key])draft[key]=settingFor(key,saved);return draft[key];}
  function saveDraft(){saved=clone(draft);try{localStorage.setItem(STORAGE_KEY,JSON.stringify(saved));}catch{}}

  async function requestJson(url){
    try{if(typeof req==='function')return await req(url);}catch(error){console.warn('Mekik kesit katalog istegi req ile basarisiz',error);}
    var response=await fetch(url,{credentials:'same-origin'});if(!response.ok)throw new Error('HTTP '+response.status);return await response.json();
  }
  async function loadMekikTypes(force){
    if(typeCache.length&&!force)return typeCache;
    try{var result=await requestJson('/api/mekik2-types');var rows=Array.isArray(result&&result.types)?result.types:[];typeCache=rows.filter(function(entry){return entry&&entry.id&&entry.name&&entry.drawing;});return typeCache;}
    catch(error){console.warn('Kesit Yer Belirleme Mekik kayitlarini okuyamadi',error);return typeCache;}
  }
  function typeMap(types){var map=new Map();types.forEach(function(entry){map.set(norm(entry.name),entry);});return map;}
  function rackSystem(rack,typeNames){
    if(rack&&rack.rafexSystem)return rack.rafexSystem;
    if(rack&&(rack.b2b||rack.b2bLayout))return 'b2b';
    return typeNames.has(norm(rack&&rack.typeName))?'mekik2':'';
  }
  function buildModalSections(types){
    var byName=typeMap(types), typeNames=new Set(Array.from(byName.keys()));
    var racks=Array.isArray(window.m2LayoutState&&m2LayoutState.racks)?m2LayoutState.racks:[];
    var usedByType=new Map();
    racks.forEach(function(rack){
      if(rackSystem(rack,typeNames)!=='mekik2')return;
      var name=norm(rack.typeName||rack.name);var type=byName.get(name);if(!type)return;
      var angle=normalizeAngle(rack.angle);var key=String(type.id)+'|'+angle;
      if(!usedByType.has(key))usedByType.set(key,{type:type,angle:angle,used:true});
    });
    var base=Array.from(usedByType.values());
    var usedNames=new Set(base.map(function(item){return norm(item.type.name);}));
    types.forEach(function(type){if(!usedNames.has(norm(type.name)))base.push({type:type,angle:0,used:false});});
    base.sort(function(a,b){var nameDiff=String(a.type.name).localeCompare(String(b.type.name),'tr');return nameDiff||a.angle-b.angle;});
    var counters=new Map();
    return base.map(function(item){var nameKey=norm(item.type.name);var next=(counters.get(nameKey)||0)+1;counters.set(nameKey,next);var mode=sectionView(item.angle);return {key:'mekik:'+item.type.id+':'+item.angle,name:item.type.name,drawing:item.type.drawing,typeId:item.type.id,angle:item.angle,mode:mode,sectionNo:next,used:item.used};});
  }
  function buildOutputSections(types){
    var all=buildModalSections(types);var used=all.filter(function(item){return item.used;});
    if(used.length)return used;
    var corporate=[];try{corporate=typeof m2CorporateUsedTypes==='function'?m2CorporateUsedTypes():[];}catch{}
    var wanted=new Set((Array.isArray(corporate)?corporate:[]).filter(function(entry){var drawing=entry&&entry.drawing||entry;return drawing&&!drawing.b2b&&!drawing.b2bLayout;}).map(function(entry){return norm(entry&& (entry.name||entry.typeName||entry.label));}));
    return all.filter(function(item){return wanted.has(norm(item.name));});
  }
  function svgFor(section){
    try{
      if(typeof m2ReportElevationSvg==='function'){var svg=m2ReportElevationSvg(section.drawing,section.mode,true);if(svg)return svg;}
      if(typeof m2SharedScaleReportSvg==='function'){var shared=m2SharedScaleReportSvg(section.drawing,section.mode,true);if(shared)return shared;}
      if(typeof m2MekikSetProjection==='function'){var body=m2MekikSetProjection(section.mode,section.drawing,70,40,1120,700);return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1260 820">'+body+'</svg>';}
    }catch(error){console.warn('Mekik kesit gorseli olusturulamadi',error);}
    return '';
  }
  function svgDataUri(svg){return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);}

  function ensureWorkspace(modal){
    if(!modal)return null;var workspace=modal.querySelector('.rafex-section-workspace');if(!workspace)return null;
    var panel=workspace.querySelector('[data-rafex-mekik-workspace]');if(panel)return panel;
    panel=document.createElement('div');panel.className='rafex-mekik-section-workspace';panel.dataset.rafexMekikWorkspace='1';panel.hidden=true;
    panel.innerHTML='<div class="rafex-mekik-section-title"><span data-rafex-mekik-title>Mekik · Kesit</span><span class="rafex-mekik-system-badge">MEKİK</span></div><section class="rafex-mekik-section-card"><b data-rafex-mekik-card-title>MEKİK KESİT ÇIKTISI</b><div class="rafex-mekik-stage" data-rafex-mekik-stage><div class="rafex-mekik-empty" data-rafex-mekik-empty>Kesit hazırlanıyor…</div></div><div class="rafex-mekik-controls"><span>Sürükle · Tekerlek</span><button type="button" data-rafex-mekik-zoom-out>−</button><strong data-rafex-mekik-zoom>100%</strong><button type="button" data-rafex-mekik-zoom-in>+</button><button type="button" data-rafex-mekik-fit>Sığdır</button><span></span><button type="button" data-rafex-mekik-rotate-left title="Sola döndür">↺</button><button type="button" data-rafex-mekik-rotate-right title="Sağa döndür">↻</button><button type="button" data-rafex-mekik-reset-angle>Açı 0°</button></div><div class="rafex-mekik-section-meta"><b data-rafex-mekik-meta-section>Kesit 1</b><span data-rafex-mekik-meta-view>Ön görünüş</span><span data-rafex-mekik-meta-angle>Yerleşim açısı 0°</span><span>Bu ayarlar yalnız Kesit Yer Belirleme ve çıktıya uygulanır; Mekik kendi ekranı değişmez.</span></div></section>';
    workspace.appendChild(panel);
    bindWorkspace(panel);return panel;
  }
  function currentSection(){return modalSections.find(function(item){return item.key===activeSectionKey;})||null;}
  function renderWorkspace(){
    var modal=document.getElementById('m2SectionPlacementModal');var panel=ensureWorkspace(modal);var section=currentSection();if(!panel||!section)return;
    var value=ensureSetting(section.key);var stage=panel.querySelector('[data-rafex-mekik-stage]');var empty=panel.querySelector('[data-rafex-mekik-empty]');
    var image=stage&&stage.querySelector('img.rafex-mekik-art');if(!image&&stage){image=document.createElement('img');image.className='rafex-mekik-art';image.draggable=false;stage.appendChild(image);}
    var svg=svgFor(section);if(image&&svg){var src=svgDataUri(svg);if(image.src!==src)image.src=src;image.alt=section.name+' Kesit '+section.sectionNo;if(empty)empty.hidden=true;}else if(empty){empty.hidden=false;empty.textContent='Mekik kesit görünüşü hazırlanamadı.';}
    if(image){image.style.left=(50+value.x)+'%';image.style.top=(50+value.y)+'%';image.style.transform='translate(-50%,-50%) scale('+value.scale+') rotate('+value.rotation+'deg)';}
    var title=panel.querySelector('[data-rafex-mekik-title]');if(title)title.textContent='Mekik · '+section.name+' · Kesit '+section.sectionNo;
    var cardTitle=panel.querySelector('[data-rafex-mekik-card-title]');if(cardTitle)cardTitle.textContent='KESİT '+section.sectionNo+' · '+(section.mode==='side'?'YAN':'ÖN')+' GÖRÜNÜŞ';
    var zoom=panel.querySelector('[data-rafex-mekik-zoom]');if(zoom)zoom.textContent=Math.round(value.scale*100)+'%';
    var sectionMeta=panel.querySelector('[data-rafex-mekik-meta-section]');if(sectionMeta)sectionMeta.textContent='Kesit '+section.sectionNo;
    var viewMeta=panel.querySelector('[data-rafex-mekik-meta-view]');if(viewMeta)viewMeta.textContent=section.mode==='side'?'Yan görünüş':'Ön görünüş';
    var angleMeta=panel.querySelector('[data-rafex-mekik-meta-angle]');if(angleMeta)angleMeta.textContent='Yerleşim açısı '+section.angle+'° · Görsel düzeltme '+value.rotation+'°';
    var reset=panel.querySelector('[data-rafex-mekik-reset-angle]');if(reset)reset.textContent='Açı '+value.rotation+'°';
  }
  function showMekikSection(key){
    activeSectionKey=key;var modal=document.getElementById('m2SectionPlacementModal');var workspace=modal&&modal.querySelector('.rafex-section-workspace');if(!workspace)return;
    var nativeTitle=workspace.querySelector(':scope > [data-rafex-active-section]');var nativeCard=workspace.querySelector(':scope > .rafex-perspective-card');if(nativeTitle)nativeTitle.hidden=true;if(nativeCard)nativeCard.hidden=true;
    var panel=ensureWorkspace(modal);if(panel)panel.hidden=false;
    modal.querySelectorAll('.rafex-section-list button').forEach(function(button){button.classList.toggle('active',button.dataset.rafexMekikSectionKey===key);});
    renderWorkspace();
  }
  function restoreNativeWorkspace(){
    activeSectionKey='';var modal=document.getElementById('m2SectionPlacementModal');var workspace=modal&&modal.querySelector('.rafex-section-workspace');if(!workspace)return;
    var nativeTitle=workspace.querySelector(':scope > [data-rafex-active-section]');var nativeCard=workspace.querySelector(':scope > .rafex-perspective-card');if(nativeTitle)nativeTitle.hidden=false;if(nativeCard)nativeCard.hidden=false;
    var panel=workspace.querySelector('[data-rafex-mekik-workspace]');if(panel)panel.hidden=true;
  }
  function bindWorkspace(panel){
    var changeScale=function(delta){var section=currentSection();if(!section)return;var value=ensureSetting(section.key);value.scale=clamp(Math.round((value.scale+delta)*100)/100,.35,2.5);renderWorkspace();};
    var changeRotation=function(delta){var section=currentSection();if(!section)return;var value=ensureSetting(section.key);value.rotation=clamp(Math.round(value.rotation+delta),-180,180);renderWorkspace();};
    panel.querySelector('[data-rafex-mekik-zoom-out]')?.addEventListener('click',function(){changeScale(-.08);});
    panel.querySelector('[data-rafex-mekik-zoom-in]')?.addEventListener('click',function(){changeScale(.08);});
    panel.querySelector('[data-rafex-mekik-fit]')?.addEventListener('click',function(){var section=currentSection();if(!section)return;draft[section.key]=defaultSetting();renderWorkspace();});
    panel.querySelector('[data-rafex-mekik-rotate-left]')?.addEventListener('click',function(){changeRotation(-5);});
    panel.querySelector('[data-rafex-mekik-rotate-right]')?.addEventListener('click',function(){changeRotation(5);});
    panel.querySelector('[data-rafex-mekik-reset-angle]')?.addEventListener('click',function(){var section=currentSection();if(!section)return;ensureSetting(section.key).rotation=0;renderWorkspace();});
    var stage=panel.querySelector('[data-rafex-mekik-stage]');
    stage?.addEventListener('wheel',function(event){event.preventDefault();changeScale(event.deltaY<0?.06:-.06);},{passive:false});
    var drag=null;
    stage?.addEventListener('pointerdown',function(event){var section=currentSection();if(event.button!==0||!section)return;event.preventDefault();stage.setPointerCapture?.(event.pointerId);var value=ensureSetting(section.key);drag={id:event.pointerId,startX:event.clientX,startY:event.clientY,x:value.x,y:value.y};stage.classList.add('is-dragging');});
    stage?.addEventListener('pointermove',function(event){var section=currentSection();if(!drag||drag.id!==event.pointerId||!section)return;var rect=stage.getBoundingClientRect();if(!rect.width||!rect.height)return;var value=ensureSetting(section.key);value.x=clamp(drag.x+((event.clientX-drag.startX)/rect.width)*100,-80,80);value.y=clamp(drag.y+((event.clientY-drag.startY)/rect.height)*100,-80,80);renderWorkspace();});
    var finish=function(event){if(!drag||drag.id!==event.pointerId)return;drag=null;stage.classList.remove('is-dragging');};stage?.addEventListener('pointerup',finish);stage?.addEventListener('pointercancel',finish);
  }

  async function syncModalList(){
    var modal=document.getElementById('m2SectionPlacementModal');if(!modal||modal.hidden)return;
    var list=modal.querySelector('[data-rafex-section-list]');if(!list)return;
    var types=await loadMekikTypes(false);modalSections=buildModalSections(types);
    list.querySelectorAll('.rafex-mekik-section-divider,.rafex-mekik-section-entry').forEach(function(node){node.remove();});
    var divider=document.createElement('div');divider.className='rafex-mekik-section-divider';divider.textContent='MEKİK KESİTLERİ · AÇIYA GÖRE AYRI';list.appendChild(divider);
    if(!modalSections.length){var empty=document.createElement('div');empty.className='rafex-section-list-note rafex-mekik-section-entry';empty.textContent='Kayıtlı Mekik raf tipi bulunamadı.';list.appendChild(empty);return;}
    modalSections.forEach(function(section,index){var button=document.createElement('button');button.type='button';button.className='rafex-mekik-section-entry';button.dataset.rafexMekikSectionKey=section.key;button.innerHTML='<span>M'+(index+1)+'</span><b>'+esc(section.name)+' · Kesit '+section.sectionNo+'<small>'+section.angle+'° · '+(section.mode==='side'?'Yan':'Ön')+' görünüş'+(section.used?' · Serbest Çizimde kullanılıyor':' · Kayıtlı tip')+'</small></b>';button.addEventListener('click',function(event){event.stopPropagation();showMekikSection(section.key);});list.appendChild(button);});
  }
  function enhanceModalSoon(){[0,90,240,520].forEach(function(delay){setTimeout(function(){var modal=document.getElementById('m2SectionPlacementModal');if(modal&&!modal.hidden){draft=clone(saved);ensureWorkspace(modal);syncModalList();}},delay);});}

  function titleOfCard(card){return norm(card&& (card.dataset.rafexTypeName||card.querySelector(':scope > strong > span')?.textContent||card.querySelector(':scope > strong')?.textContent||card.querySelector('strong')?.textContent));}
  function applySectionToFrame(frame,section,value){
    var svg=svgFor(section);if(!svg)return;var image=frame.querySelector('img');if(!image){image=document.createElement('img');image.decoding='async';image.loading='lazy';frame.appendChild(image);}var src=svgDataUri(svg);if(image.src!==src)image.src=src;image.alt=section.name+' Kesit '+section.sectionNo;image.style.left=(50+value.x)+'%';image.style.top=(50+value.y)+'%';image.style.transform='translate(-50%,-50%) scale('+value.scale+') rotate('+value.rotation+'deg)';
  }
  async function renderMekikOutput(){
    var types=await loadMekikTypes(false);var sections=buildOutputSections(types);if(!sections.length)return;
    var byName=new Map();sections.forEach(function(section){var key=norm(section.name);if(!byName.has(key))byName.set(key,[]);byName.get(key).push(section);});
    ['m2CorporatePreview','m2CorporatePrint','m2CorporatePrintArea'].forEach(function(hostId){var host=document.getElementById(hostId);if(!host)return;var cards=Array.from(host.querySelectorAll('.m2-corporate-type-card'));cards.forEach(function(card){var name=titleOfCard(card);var cardSections=byName.get(name);if(!cardSections||!cardSections.length)return;card.classList.remove('rafex-perspective-output');card.classList.add('rafex-mekik-section-output-card');card.querySelectorAll(':scope > .m2-corporate-view').forEach(function(view){view.removeAttribute('data-rafex-perspective-primary');view.removeAttribute('data-rafex-perspective-hidden');view.dataset.rafexMekikHidden='1';view.style.display='none';});card.querySelector(':scope > .rafex-mekik-sections-grid')?.remove();var grid=document.createElement('div');grid.className='rafex-mekik-sections-grid';grid.style.setProperty('--rafex-mekik-section-count',String(cardSections.length));cardSections.forEach(function(section){var value=settingFor(section.key,saved);var item=document.createElement('div');item.className='rafex-mekik-output-section';item.innerHTML='<span class="rafex-mekik-output-label">MEKİK · '+esc(section.name)+' · KESİT '+section.sectionNo+' · '+section.angle+'° · '+(section.mode==='side'?'YAN':'ÖN')+'</span><div class="rafex-mekik-output-frame"></div>';grid.appendChild(item);applySectionToFrame(item.querySelector('.rafex-mekik-output-frame'),section,value);});card.appendChild(grid);});});
  }
  function queueOutput(delay){clearTimeout(reportTimer);reportTimer=setTimeout(function(){renderMekikOutput();},delay||620);}

  document.addEventListener('click',function(event){
    var open=event.target.closest&&event.target.closest('#m2SectionPlacementButton');if(open){enhanceModalSoon();return;}
    var save=event.target.closest&&event.target.closest('[data-rafex-placement-save]');if(save){saveDraft();queueOutput(90);return;}
    var cancel=event.target.closest&&event.target.closest('[data-rafex-placement-cancel],[data-rafex-placement-close]');if(cancel){draft=clone(saved);activeSectionKey='';return;}
    var nativeButton=event.target.closest&&event.target.closest('[data-rafex-section-list] button:not(.rafex-mekik-section-entry)');if(nativeButton){restoreNativeWorkspace();setTimeout(syncModalList,0);}
  },true);
  document.addEventListener('keydown',function(event){if(event.key==='Escape'){draft=clone(saved);activeSectionKey='';}},true);

  try{
    var originalRender=window.m2RenderCorporateReport||m2RenderCorporateReport;
    if(typeof originalRender==='function'){
      var wrappedRender=function(){var result=originalRender.apply(this,arguments);Promise.resolve(result).finally(function(){queueOutput(680);setTimeout(function(){renderMekikOutput();},1050);});return result;};
      try{m2RenderCorporateReport=wrappedRender;}catch{}window.m2RenderCorporateReport=wrappedRender;
    }
  }catch(error){console.warn('Mekik Kesit Yer Belirleme rapor kancasi kurulamadi',error);}
  try{
    var originalPrepare=window.__rafexPrepareCorporatePrint;
    window.__rafexPrepareCorporatePrint=async function(){if(typeof originalPrepare==='function')await originalPrepare.apply(this,arguments);await renderMekikOutput();};
  }catch(error){console.warn('Mekik Kesit Yer Belirleme yazdirma kancasi kurulamadi',error);}

  function boot(){loadMekikTypes(false);queueOutput(900);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();</script>`;

const closing = html.lastIndexOf("</body>");
if (closing < 0) throw new Error("Unified section positioner: </body> bulunamadi.");
html = html.slice(0, closing) + runtime + "\n" + html.slice(closing);

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.replace(match[0], `${match[1]}${match[2]}${encoded}${match[2]}`);
fs.writeFileSync(workerPath, worker);

const finalHtml = Buffer.from(encoded, "base64").toString("utf8");
for (const required of [marker, "MEKİK KESİTLERİ", "data-rafex-mekik-workspace", "rafex-mekik-sections-grid", "__rafexPrepareCorporatePrint"]) {
  if (!finalHtml.includes(required)) throw new Error(`Unified section positioner dogrulama hatasi: ${required}`);
}
console.log("FINAL: Kesit Yer Belirleme Mekik gorusleri + aci bazli ayri kesitler + cikti yerlestirmesi eklendi (v1).");
