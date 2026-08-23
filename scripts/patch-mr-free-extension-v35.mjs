import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const mode = process.argv[2];
const marker = 'data-rafex-mr-free-extension="v35"';

function planExtension(targetMm, sectionMm, footMm) {
  const target = Math.max(0, Math.round(Number(targetMm) || 0));
  const section = Math.max(500, Math.round(Number(sectionMm) || 0));
  const foot = Math.max(1, Math.round(Number(footMm) || 60));
  let occupied = 0;
  let count = 0;
  while (count < 100) {
    const increment = section + (count ? foot : 2 * foot);
    if (occupied + increment > target + 0.01) break;
    occupied += increment;
    count += 1;
  }
  const wallRemaining = Math.max(0, target - occupied);
  const netRemaining = Math.max(0, wallRemaining - (count ? foot : 2 * foot));
  const customMax = Math.floor(netRemaining / 50) * 50;
  return { count, occupied, wallRemaining, netRemaining, customMax, needsCustom: netRemaining > 500 && customMax >= 500 };
}

assert.deepEqual(planExtension(8000, 2500, 60), { count: 3, occupied: 7740, wallRemaining: 260, netRemaining: 200, customMax: 200, needsCustom: false });
assert.deepEqual(planExtension(7000, 2500, 60), { count: 2, occupied: 5180, wallRemaining: 1820, netRemaining: 1760, customMax: 1750, needsCustom: true });
assert.equal(planExtension(620, 2500, 60).needsCustom, false);
assert.equal(planExtension(670, 2500, 60).customMax, 550);

if (mode === "source") {
  const portalPath = path.join(root, "portal.html");
  let portal = fs.readFileSync(portalPath, "utf8");

  const oldSection = "const config=mrConfigurationV2(),footWidth=config.uprightWidth,totalWidth=config.modules*config.width+(config.modules+1)*footWidth,sectionWidth=totalWidth;";
  const newSection = "const config=mrConfigurationV2(),footWidth=config.uprightWidth,totalWidth=config.modules*config.width+(config.modules+1)*footWidth,sectionWidth=config.modules*config.width;";
  if (portal.includes(oldSection)) portal = portal.replace(oldSection, newSection);
  else if (!portal.includes(newSection)) throw new Error("MR v35: MR net bolum genisligi bulunamadi.");

  const oldNormalize = "m2LayoutState.racks.forEach((rack)=>{\n          if(!rack?.b2bLayout)return;";
  const newNormalize = "m2LayoutState.racks.forEach((rack)=>{\n          if(!rack?.b2bLayout||rack?.b2b?.mr)return;";
  if (portal.includes(oldNormalize)) portal = portal.replace(oldNormalize, newNormalize);
  else if (!portal.includes(newNormalize)) throw new Error("MR v35: B2B fiziksel genislik normalizasyonu bulunamadi.");

  fs.writeFileSync(portalPath, portal);
  console.log("MR v35 source: MR net bolum genisligi korundu; B2B fiziksel genislik normalizasyonu MR raflarini degistirmez.");
} else if (mode === "runtime") {
  const workerPath = path.join(root, "dist/server/index.js");
  let worker = fs.readFileSync(workerPath, "utf8");
  const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
  if (!match) throw new Error("MR v35: HTML_BASE64 build ciktisinda bulunamadi.");
  let html = Buffer.from(match[3], "base64").toString("utf8");
  html = html.replace(/<style\s+data-rafex-mr-free-extension="v35">[\s\S]*?<\/style>\s*<script\s+data-rafex-mr-free-extension="v35">[\s\S]*?<\/script>/g, "");

  const runtime = String.raw`<style ${marker}>
.mr-mode #m2AutoFillControls{display:flex!important}
#rafexMrExtensionModal[hidden]{display:none!important}
#rafexMrExtensionModal{position:fixed;inset:0;z-index:10080;display:grid;place-items:center;padding:20px;background:#10251dcc;backdrop-filter:blur(3px)}
.rafex-mr-extension-card{width:min(520px,calc(100vw - 32px));padding:20px;border:2px solid #e0b900;border-radius:16px;background:#fff;box-shadow:0 24px 70px #0005;color:#173c2d}
.rafex-mr-extension-card h3{margin:0;font-size:18px}.rafex-mr-extension-card>p{margin:7px 0 14px;color:#5d6962;font-size:11px;line-height:1.5}
.rafex-mr-extension-summary{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:13px}.rafex-mr-extension-summary div{padding:10px;border-radius:9px;background:#f4f7f4}.rafex-mr-extension-summary span{display:block;color:#718078;font-size:8px;font-weight:850}.rafex-mr-extension-summary b{display:block;margin-top:4px;font-size:13px}
.rafex-mr-extension-field{display:grid;gap:7px;padding:12px;border:1px solid #e5d171;border-radius:10px;background:#fffbea;font-size:10px;font-weight:900}.rafex-mr-extension-input{display:grid;grid-template-columns:42px minmax(0,1fr) 42px;gap:7px}.rafex-mr-extension-input button,.rafex-mr-extension-input input{min-height:42px;border:1px solid #d5ddd8;border-radius:8px;background:#fff;color:#173c2d;font-weight:900}.rafex-mr-extension-input input{text-align:center;font-size:16px}.rafex-mr-extension-field small{color:#66726b;font-size:8px;line-height:1.45}
.rafex-mr-extension-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:15px}.rafex-mr-extension-actions button{padding:10px 14px;border:1px solid #ccd7d0;border-radius:8px;background:#fff;color:#173c2d;font-weight:900}.rafex-mr-extension-actions .primary{border-color:#d8b100;background:#f2c500}
.rafex-mr-extension-error{min-height:16px;margin-top:8px;color:#a23c32;font-size:9px;font-weight:850}
#m2CustomizeModal.rafex-mr-customize-v37 .m2-customize-preview{background:#fff}
#m2CustomizeModal.rafex-mr-customize-v37 .m2-customize-preview>span{background:#052848}
#m2CustomizeModal.rafex-mr-customize-v37 aside>:not(.m2-customize-head):not(.rafex-mr-customize-summary):not(.m2-customize-actions){display:none!important}
.rafex-mr-customize-summary{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px;border:1px solid #d9e5df;border-radius:10px;background:#f7faf8}
.rafex-mr-customize-summary div{padding:9px;border-radius:8px;background:#fff}.rafex-mr-customize-summary small{display:block;color:#6d7a73;font-size:8px;font-weight:850}.rafex-mr-customize-summary b{display:block;margin-top:4px;color:#173c2d;font-size:12px}
@media(max-width:560px){.rafex-mr-extension-summary{grid-template-columns:1fr}.rafex-mr-extension-card{padding:15px}}
</style>
<script ${marker}>(function(){
  if(window.__rafexMrFreeExtensionV35)return;window.__rafexMrFreeExtensionV35=true;window.__rafexMrPointerDoubleTapV36=true;
  var originalStart=window.m2StartAutoFillGuide;
  var originalPreview=window.m2PreviewAutoFillLength;
  var originalApply=window.m2ApplyAutoFillLength;
  var originalCancel=window.m2CancelAutoFill;
  var originalCommit=window.m2CommitAutoFillGuide;
  var originalCustomizeOpen=window.m2OpenCustomizeModal;
  var originalCustomizeClose=window.m2CloseCustomizeModal;
  var originalCustomizePreview=window.m2PreviewRackCustomization;
  var originalCustomizeApply=window.m2ApplyRackCustomization;
  var originalSelectSaved=window.m2SelectSavedRackType;
  var pendingCustom=null;
  var lastMrPointerTap={id:null,at:0};
  var suppressMrDblClickUntil=0;

  function isMr(rack){return !!(rack?.b2b?.mr||rack?.rafexSystem==='mr'||rack?.systemType==='mr'||rack?.b2bLayout?.palletType==='mr'||rack?.plan?.mr);}
  function rackById(id){try{return m2LayoutState.racks.find(function(r){return Number(r.id)===Number(id);})||null;}catch{return null;}}
  function formatMm(value){try{return Math.round(Number(value)||0).toLocaleString('tr-TR')+' mm';}catch{return String(Math.round(Number(value)||0))+' mm';}}
  function configFromRack(rack){
    var state=rack?.b2b||{},layout=rack?.b2bLayout||{},levels=Math.max(1,Math.round(Number(state.levels)||Number(rack?.levels)||1)),width=Math.max(300,Number(state.width)||Number(layout.palletWidth)||Number(rack?.palW)||2400),depth=Math.max(300,Number(state.depth)||Number(layout.palletDepth)||Number(rack?.depthMm)||800),firstTraverse=Math.max(0,Number(state.firstTraverse??rack?.firstRailHeight??200)),levelGap=Math.max(100,Number(state.requestedLevelGap)||Number(state.levelGap)||Number(rack?.levelH)||1000),traverseType=String(state.traverseType||'ZS65'),traverseHeight=Math.max(1,Number(state.traverseHeight)||Number(rack?.traverseHeight)||({ZS35:55,ZS55:75,ZS65:85}[traverseType]||85)),topTraverse=firstTraverse+Math.max(0,levels-1)*(levelGap+traverseHeight),automaticUprightHeight=topTraverse+traverseHeight+levelGap/2,uprightHeight=Math.max(topTraverse+traverseHeight,Number(state.uprightHeight)||Number(rack?.sideUprightHeight)||automaticUprightHeight);
    return{modules:Math.max(1,Math.round(Number(state.modules)||Number(rack?.bays)||1)),levels:levels,width:width,depth:depth,firstTraverse:firstTraverse,levelGap:levelGap,requestedLevelGap:levelGap,height:topTraverse,uprightHeight:uprightHeight,uprightType:state.uprightType||'MR60',uprightThickness:Number(state.uprightThickness)||1.5,uprightWidth:60,traverseType:traverseType,traverseThickness:Number(state.traverseThickness)||1.5,traverseHeight:traverseHeight,uprightFinish:state.uprightFinish||'ral5010',traverseFinish:state.traverseFinish||'ral1007',accessories:Array.isArray(state.accessories)?JSON.parse(JSON.stringify(state.accessories)):[],dimensions:{levels:true,markers:true,width:true,depth:true},dimensionScale:Math.max(.7,Math.min(1.5,Number(state.dimensionScale)||1))};
  }
  window.rafexMrConfigFromRackV37=configFromRack;
  function footOf(rack){return Math.max(1,Math.round(Number(rack?.b2b?.uprightWidth)||60));}
  function sectionOf(rack){return Math.max(500,Math.round(Number(rack?.b2b?.width)||Number(rack?.palW)||500));}
  function setStatus(text){var node=document.getElementById('m2FloorStatus');if(node)node.textContent=text;}
  function controls(active){
    var host=document.getElementById('m2AutoFillControls'),input=document.getElementById('m2AutoFillLength');if(!host)return;
    host.hidden=false;host.style.setProperty('display','flex','important');host.classList.toggle('is-disabled',!active);host.querySelectorAll('input,button').forEach(function(el){el.disabled=!active;});
    if(input){input.placeholder=active?'Örn. 7000':'Önce MR rafı çift tıkla';if(!active)input.value='';}
  }
  function startMr(rack){
    if(m2AutoFillDraft?.rafexSystem==='mr'&&Number(m2AutoFillDraft.rackId)===Number(rack.id)){controls(true);return;}
    var origin={x:rack.x+rack.w/2,y:rack.y+rack.h/2};m2AutoFillDraft={rackId:rack.id,origin:origin,start:origin,hover:origin,direction:1,rafexSystem:'mr'};m2LayoutState.selected=rack.id;controls(true);
    var input=document.getElementById('m2AutoFillLength');if(input){input.value='';input.focus({preventScroll:true});}
    setStatus('MR uzatma yönü açıldı. Fareyle duvara kadar göster veya uzatma mesafesini mm olarak yaz.');m2RenderLayout();
  }
  function mountMrCustomize(rack){
    var canvas=document.getElementById('m2CustomizeCanvas');if(!canvas||!window.RafexMRViewer?.mount)return;
    try{window.RafexB2BViewer?.destroy?.();}catch(e){}
    try{var instance=window.RafexMRViewer.mount(canvas,{config:configFromRack(rack)});try{mrViewerInstance=instance;}catch(e){}}catch(error){setStatus(error?.message||'MR 3D önizlemesi açılamadı.');}
  }
  function openMrCustomize(rack){
    var modal=document.getElementById('m2CustomizeModal');if(!modal)return;
    try{m2CustomizeRackId=rack.id;m2CustomizeMode=false;}catch(e){}m2LayoutState.selected=rack.id;document.getElementById('m2CustomizeRackButton')?.classList.remove('active');modal.classList.add('rafex-mr-customize-v37');modal.hidden=false;
    var head=modal.querySelector('.m2-customize-head'),title=head?.querySelector('b'),copy=head?.querySelector('small'),close=head?.querySelector('button'),badge=modal.querySelector('.m2-customize-preview>span');if(title)title.textContent='MR Modül Önizlemesi';if(copy)copy.textContent='Ölçüler oluşturduğun MR raf tipinden birebir alınır; B2B değerleri uygulanmaz.';if(close)close.setAttribute('onclick','window.rafexCloseMrCustomizeV37()');if(badge)badge.textContent='MR 3D RAF ÖNİZLEMESİ';
    var config=configFromRack(rack),summary=modal.querySelector('.rafex-mr-customize-summary');if(!summary){summary=document.createElement('div');summary.className='rafex-mr-customize-summary';head?.after(summary);}summary.innerHTML='<div><small>TOPLAM GENİŞLİK</small><b>'+formatMm(config.modules*config.width+(config.modules+1)*60)+'</b></div><div><small>DERİNLİK</small><b>'+formatMm(config.depth)+'</b></div><div><small>ZEMİN → K1</small><b>'+formatMm(config.firstTraverse)+'</b></div><div><small>KAT ARASI NET</small><b>'+formatMm(config.levelGap)+'</b></div><div><small>AYAK BOYU</small><b>'+formatMm(config.uprightHeight)+'</b></div><div><small>SİSTEM</small><b>MR60 · '+config.traverseType+'</b></div>';
    var actions=modal.querySelector('.m2-customize-actions'),buttons=actions?.querySelectorAll('button');if(buttons?.[0]){buttons[0].textContent='Kapat';buttons[0].setAttribute('onclick','window.rafexCloseMrCustomizeV37()');}if(buttons?.[1]){buttons[1].textContent='MR Ölçülerine Git';buttons[1].setAttribute('onclick','window.rafexLoadMrRackV37()');}
    requestAnimationFrame(function(){mountMrCustomize(rack);});
  }
  function closeMrCustomize(){
    var modal=document.getElementById('m2CustomizeModal');if(modal){modal.hidden=true;modal.classList.remove('rafex-mr-customize-v37');}
    try{window.RafexMRViewer?.destroy?.();mrViewerInstance=null;m2CustomizeRackId=null;}catch(e){}
    requestAnimationFrame(function(){try{if(m2ActiveModule==='mr'&&document.getElementById('mrCanvas'))mrMountViewer();}catch(e){}});
  }
  window.rafexCloseMrCustomizeV37=closeMrCustomize;
  window.rafexLoadMrRackV37=function(){var rack=rackById(typeof m2CustomizeRackId==='undefined'?null:m2CustomizeRackId);if(!isMr(rack))return closeMrCustomize();try{var drawing=JSON.parse(JSON.stringify(rack));m2LastDrawing=drawing;mrApplyDrawingToFormV4(drawing);mrUpdateSummary(false);mrSyncLayoutDrawingV4(false);}catch(e){}closeMrCustomize();setTimeout(function(){document.querySelector('.mr-form')?.scrollIntoView?.({behavior:'smooth',block:'start'});},60);};
  function previewMr(raw){
    var draft=m2AutoFillDraft,source=draft&&rackById(draft.rackId),distance=Math.max(0,Number(raw)||0);if(!draft||draft.rafexSystem!=='mr'||!source)return false;
    var radians=source.angle*Math.PI/180,ux=Math.cos(radians),uy=Math.sin(radians),direction=draft.direction||1,foot=footOf(source),startOffset=source.w/2-foot*m2LayoutState.scale,start={x:draft.origin.x+direction*ux*startOffset,y:draft.origin.y+direction*uy*startOffset};
    draft.start=start;draft.hover={x:start.x+direction*ux*distance*m2LayoutState.scale,y:start.y+direction*uy*distance*m2LayoutState.scale};draft.manualLengthMm=Math.round(distance);m2RenderLayout();return true;
  }
  function plan(target,section,foot){
    target=Math.max(0,Math.round(Number(target)||0));section=Math.max(500,Math.round(Number(section)||0));foot=Math.max(1,Math.round(Number(foot)||60));var occupied=0,count=0;
    while(count<100){var increment=section+(count?foot:2*foot);if(occupied+increment>target+.01)break;occupied+=increment;count++;}
    var wallRemaining=Math.max(0,target-occupied),netRemaining=Math.max(0,wallRemaining-(count?foot:2*foot)),customMax=Math.floor(netRemaining/50)*50;
    return{count:count,occupied:occupied,wallRemaining:wallRemaining,netRemaining:netRemaining,customMax:customMax,needsCustom:netRemaining>500&&customMax>=500};
  }
  window.rafexMrExtensionPlan=plan;
  function copyRack(source,width,centerX,centerY){
    var foot=footOf(source),physical=width+2*foot,copy=JSON.parse(JSON.stringify(source));
    copy.id=Date.now()+Math.floor(Math.random()*100000);copy.x=centerX-physical*m2LayoutState.scale/2;copy.y=centerY-copy.h/2;copy.w=physical*m2LayoutState.scale;copy.widthMm=physical;copy.bays=1;copy.palW=width;copy.joinGroup=null;copy.sharedFootWith=null;copy.sharedFootSide=null;copy.freePlacement=false;copy.staged=false;copy.locked=true;copy.specLocked=true;copy.rafexSystem='mr';copy.rafexSystemLabel='MR';
    copy.b2b={...(copy.b2b||{}),mr:true,modules:1,width:width,uprightWidth:foot};
    copy.b2bLayout={...(copy.b2bLayout||{}),palletCount:1,palletWidth:width,palletType:'mr',sectionWidth:width,rowCount:1};
    return copy;
  }
  function placeAfter(anchor,source,width,direction,ux,uy,typeName){
    var foot=footOf(source),anchorPhysical=Math.max(1,Number(anchor.widthMm)||anchor.w/m2LayoutState.scale),probePhysical=width+2*foot,step=(anchorPhysical+probePhysical)/2-foot,anchorCx=anchor.x+anchor.w/2,anchorCy=anchor.y+anchor.h/2,probe=copyRack(source,width,anchorCx+direction*ux*step*m2LayoutState.scale,anchorCy+direction*uy*step*m2LayoutState.scale);
    probe.angle=source.angle;if(typeName){probe.typeName=typeName;probe.typeColor=m2TypeColor(typeName);}
    if(!m2RackInsideArea(probe)||m2RackOverlapsExcept(probe,probe.x,probe.y,probe.angle,[anchor.id]))return null;
    var group=anchor.joinGroup||source.joinGroup||('mr-auto-'+source.id);anchor.joinGroup=group;probe.joinGroup=group;probe.sharedFootWith=anchor.id;probe.sharedFootSide=direction>0?'left':'right';m2LayoutState.racks.push(probe);return probe;
  }
  function drawingFor(source,width){
    var foot=footOf(source),drawing=JSON.parse(JSON.stringify(source)),physical=width+2*foot;
    ['id','x','y','w','h','angle','joinGroup','sharedFootWith','sharedFootSide','freePlacement','staged','locked','rafexSystem','rafexSystemLabel'].forEach(function(key){delete drawing[key];});
    drawing.totalWidth=physical;drawing.widthMm=physical;drawing.railLength=Number(source.depthMm)||Number(source.railLength)||Number(source.b2b?.depth)||800;drawing.depthMm=drawing.railLength;drawing.bays=1;drawing.palW=width;drawing.layoutView='b2b-top';drawing.systemType='mr';drawing.plan={feet:[...(source.plan?.feet||[drawing.railLength])],braces:[...(source.plan?.braces||[])]};
    drawing.b2b={...(drawing.b2b||{}),mr:true,modules:1,width:width,uprightWidth:foot};drawing.b2bLayout={...(drawing.b2bLayout||{}),palletCount:1,palletWidth:width,palletType:'mr',sectionWidth:width,rowCount:1};return drawing;
  }
  function ensureModal(){
    var modal=document.getElementById('rafexMrExtensionModal');if(modal)return modal;modal=document.createElement('div');modal.id='rafexMrExtensionModal';modal.hidden=true;modal.innerHTML='<div class="rafex-mr-extension-card" role="dialog" aria-modal="true" aria-labelledby="rafexMrExtensionTitle"><h3 id="rafexMrExtensionTitle">Kalan MR Bölümü</h3><p>Tam genişlikteki MR modülleri yerleştirildi. Duvara kalan bölümü 50 mm aralıklarla özel raf tipine dönüştürebilirsin.</p><div class="rafex-mr-extension-summary"><div><span>DUVARA KALAN MESAFE</span><b id="rafexMrWallRemaining">0 mm</b></div><div><span>YERLEŞEN STANDART MODÜL</span><b id="rafexMrStandardCount">0 adet</b></div></div><label class="rafex-mr-extension-field">Son bölüm net raf genişliği (mm)<span class="rafex-mr-extension-input"><button type="button" data-mr-step="-50">−</button><input id="rafexMrCustomWidth" type="number" min="500" step="50"><button type="button" data-mr-step="50">+</button></span><small id="rafexMrCustomHint"></small></label><div class="rafex-mr-extension-error" id="rafexMrExtensionError"></div><div class="rafex-mr-extension-actions"><button type="button" data-mr-cancel>İptal</button><button type="button" class="primary" data-mr-apply>Özel Rafı Oluştur</button></div></div>';
    document.body.appendChild(modal);modal.addEventListener('click',function(event){if(event.target===modal||event.target.closest('[data-mr-cancel]'))closeModal();var step=event.target.closest('[data-mr-step]');if(step)adjust(Number(step.dataset.mrStep)||0);if(event.target.closest('[data-mr-apply]'))applyCustom();});
    modal.addEventListener('keydown',function(event){if(event.key==='Escape'){event.preventDefault();closeModal();}else if(event.key==='Enter'&&event.target?.id==='rafexMrCustomWidth'){event.preventDefault();applyCustom();}});return modal;
  }
  function normalizeCustom(raw){if(!pendingCustom)return 0;var rounded=Math.round((Number(raw)||500)/50)*50;return Math.max(500,Math.min(pendingCustom.customMax,rounded));}
  function adjust(delta){var input=document.getElementById('rafexMrCustomWidth');if(input)input.value=String(normalizeCustom(Number(input.value)+delta));}
  function openModal(data){
    pendingCustom=data;var modal=ensureModal(),input=document.getElementById('rafexMrCustomWidth');document.getElementById('rafexMrWallRemaining').textContent=Math.round(data.wallRemaining).toLocaleString('tr-TR')+' mm';document.getElementById('rafexMrStandardCount').textContent=data.standardCount.toLocaleString('tr-TR')+' adet';document.getElementById('rafexMrCustomHint').textContent='Kullanılabilir net genişlik: 500–'+data.customMax.toLocaleString('tr-TR')+' mm · yalnızca 50 mm adımlar';document.getElementById('rafexMrExtensionError').textContent='';input.max=String(data.customMax);input.value=String(data.customMax);modal.hidden=false;setTimeout(function(){input.focus();input.select();},30);
  }
  function closeModal(){var modal=document.getElementById('rafexMrExtensionModal');if(modal)modal.hidden=true;pendingCustom=null;}
  async function saveType(drawing){
    var response=await req('/api/b2b-types',{method:'POST',body:JSON.stringify({drawing:drawing})}),saved=response?.type||response?.rackType||response;var previous=m2ActiveModule;try{m2ActiveModule='mr';await m2RefreshSavedRackTypes();}finally{m2ActiveModule=previous;}
    return (Array.isArray(m2SavedRackTypes)?m2SavedRackTypes.find(function(entry){return Number(entry.id)===Number(saved?.id);}):null)||saved;
  }
  async function applyCustom(){
    if(!pendingCustom)return;var input=document.getElementById('rafexMrCustomWidth'),error=document.getElementById('rafexMrExtensionError'),button=document.querySelector('#rafexMrExtensionModal [data-mr-apply]'),width=normalizeCustom(input?.value);if(input)input.value=String(width);
    if(width<500||width>pendingCustom.customMax){error.textContent='Ölçü 500 mm ile izin verilen üst sınır arasında ve 50 mm adımlı olmalı.';return;}
    var candidate=copyRack(pendingCustom.source,width,0,0),foot=footOf(pendingCustom.source),anchorPhysical=Math.max(1,Number(pendingCustom.anchor.widthMm)||pendingCustom.anchor.w/m2LayoutState.scale),step=(anchorPhysical+candidate.widthMm)/2-foot,anchorCx=pendingCustom.anchor.x+pendingCustom.anchor.w/2,anchorCy=pendingCustom.anchor.y+pendingCustom.anchor.h/2;candidate.x=anchorCx+pendingCustom.direction*pendingCustom.ux*step*m2LayoutState.scale-candidate.w/2;candidate.y=anchorCy+pendingCustom.direction*pendingCustom.uy*step*m2LayoutState.scale-candidate.h/2;candidate.angle=pendingCustom.source.angle;
    if(!m2RackInsideArea(candidate)||m2RackOverlapsExcept(candidate,candidate.x,candidate.y,candidate.angle,[pendingCustom.anchor.id])){error.textContent='Seçilen son bölüm duvara veya başka bir rafa taşıyor. Daha küçük bir ölçü seç.';return;}
    button.disabled=true;error.textContent='Yeni MR tipi kaydediliyor…';var state=pendingCustom;
    try{var entry=await saveType(drawingFor(state.source,width)),name=entry?.name||('MR ÖZEL '+width);m2PushUndo('MR özel son bölüm');var placed=placeAfter(state.anchor,state.source,width,state.direction,state.ux,state.uy,name);if(!placed){m2DiscardUndo?.();throw new Error('Özel raf yerleştirme sırasında alan sınırı değişti.');}m2LayoutState.selected=placed.id;closeModal();m2RenderSavedRackTypes?.();m2RenderLayout();setStatus(name+' · '+width.toLocaleString('tr-TR')+' mm özel MR tipi kaydedildi ve son blok yerleştirildi.');}
    catch(err){error.textContent=err?.message||'Özel MR tipi kaydedilemedi.';}finally{button.disabled=false;}
  }
  function commitMr(point,manualDistance){
    var draft=m2AutoFillDraft,source=draft&&rackById(draft.rackId);if(!draft||draft.rafexSystem!=='mr'||!source)return false;
    var projected=point?m2ProjectAutoFillPoint(point):draft.hover,radians=source.angle*Math.PI/180,ux=Math.cos(radians),uy=Math.sin(radians),direction=draft.direction||1,target=manualDistance==null?Math.max(0,Math.round(Math.hypot(projected.x-draft.start.x,projected.y-draft.start.y)/m2LayoutState.scale)):Math.max(1,Math.round(Number(manualDistance)||0)),section=sectionOf(source),foot=footOf(source),planned=plan(target,section,foot),anchor=source,added=0,occupied=0;
    if(planned.count)m2PushUndo('MR raf uzatma');
    for(var i=0;i<planned.count;i++){var probe=placeAfter(anchor,source,section,direction,ux,uy,source.typeName);if(!probe)break;anchor=probe;occupied+=section+(added?foot:2*foot);added++;}
    if(planned.count&&!added)m2DiscardUndo?.();m2AutoFillDraft=null;controls(false);m2LayoutState.selected=source.id;m2RenderLayout();
    var wallRemaining=Math.max(0,target-occupied),netRemaining=Math.max(0,wallRemaining-(added?foot:2*foot)),customMax=Math.floor(netRemaining/50)*50;
    if(netRemaining>500&&customMax>=500){openModal({source:source,anchor:anchor,direction:direction,ux:ux,uy:uy,target:target,standardCount:added,wallRemaining:wallRemaining,netRemaining:netRemaining,customMax:customMax});setStatus(added+' standart MR modülü yerleştirildi; duvara kalan '+Math.round(wallRemaining).toLocaleString('tr-TR')+' mm için son bölüm ölçüsünü seç.');}
    else setStatus(added?target.toLocaleString('tr-TR')+' mm alana '+added+' standart MR modülü yerleştirildi. Kalan net alan 500 mm sınırını aşmadığı için özel bölüm açılmadı.':'Bu mesafeye standart MR modülü sığmıyor; özel bölüm için 500 mm’den büyük net alan gerekli.');return true;
  }
  var wrappedStart=function(rackId){var rack=rackById(rackId);if(isMr(rack)){startMr(rack);return;}return originalStart?.apply(this,arguments);};
  var wrappedPreview=function(value){if(previewMr(value))return;return originalPreview?.apply(this,arguments);};
  var wrappedApply=function(){if(m2AutoFillDraft?.rafexSystem==='mr'){var distance=Math.max(1,Math.round(Number(document.getElementById('m2AutoFillLength')?.value)||0));if(!distance){setStatus('MR uzatma mesafesini mm olarak yaz.');return;}commitMr(null,distance);return;}return originalApply?.apply(this,arguments);};
  var wrappedCancel=function(){if(m2AutoFillDraft?.rafexSystem==='mr'){m2AutoFillDraft=null;controls(false);setStatus('MR raf uzatma işlemi iptal edildi.');m2RenderLayout();return;}return originalCancel?.apply(this,arguments);};
  var wrappedCommit=function(point,manualDistance){if(m2AutoFillDraft?.rafexSystem==='mr')return commitMr(point,manualDistance);return originalCommit?.apply(this,arguments);};
  var wrappedCustomizeOpen=function(rackId){var rack=rackById(rackId);if(isMr(rack))return openMrCustomize(rack);return originalCustomizeOpen?.apply(this,arguments);};
  var wrappedCustomizeClose=function(){var modal=document.getElementById('m2CustomizeModal');if(modal?.classList?.contains('rafex-mr-customize-v37'))return closeMrCustomize();return originalCustomizeClose?.apply(this,arguments);};
  var wrappedCustomizePreview=function(){var rack=rackById(typeof m2CustomizeRackId==='undefined'?null:m2CustomizeRackId);if(isMr(rack)){mountMrCustomize(rack);return;}return originalCustomizePreview?.apply(this,arguments);};
  var wrappedCustomizeApply=function(){var rack=rackById(typeof m2CustomizeRackId==='undefined'?null:m2CustomizeRackId);if(isMr(rack))return window.rafexLoadMrRackV37();return originalCustomizeApply?.apply(this,arguments);};
  var wrappedSelectSaved=function(index){var entry=Array.isArray(m2SavedRackTypes)?m2SavedRackTypes[index]:null,drawing=entry?.drawing;if(m2ActiveModule==='mr'&&isMr(drawing)){m2SelectedSavedType=index;m2LayoutState.selected=null;m2LastDrawing=JSON.parse(JSON.stringify(drawing));mrApplyDrawingToFormV4(drawing);mrUpdateSummary(true);mrSyncLayoutDrawingV4(false);m2RenderSavedRackTypes();m2RenderLayout();setStatus(String(entry.name||'MR')+' MR ölçüleriyle yüklendi.');return;}return originalSelectSaved?.apply(this,arguments);};
  try{m2StartAutoFillGuide=wrappedStart;m2PreviewAutoFillLength=wrappedPreview;m2ApplyAutoFillLength=wrappedApply;m2CancelAutoFill=wrappedCancel;m2CommitAutoFillGuide=wrappedCommit;}catch(e){}
  try{m2OpenCustomizeModal=wrappedCustomizeOpen;m2CloseCustomizeModal=wrappedCustomizeClose;m2PreviewRackCustomization=wrappedCustomizePreview;m2ApplyRackCustomization=wrappedCustomizeApply;m2SelectSavedRackType=wrappedSelectSaved;}catch(e){}
  window.m2StartAutoFillGuide=wrappedStart;window.m2PreviewAutoFillLength=wrappedPreview;window.m2ApplyAutoFillLength=wrappedApply;window.m2CancelAutoFill=wrappedCancel;window.m2CommitAutoFillGuide=wrappedCommit;
  window.m2OpenCustomizeModal=wrappedCustomizeOpen;window.m2CloseCustomizeModal=wrappedCustomizeClose;window.m2PreviewRackCustomization=wrappedCustomizePreview;window.m2ApplyRackCustomization=wrappedCustomizeApply;window.m2SelectSavedRackType=wrappedSelectSaved;
  document.addEventListener('pointerdown',function(event){
    if(event.button!=null&&event.button!==0||event.isPrimary===false)return;
    var node=event.target?.closest?.('#m2LayoutSvg [data-rack]'),rack=node&&rackById(node.dataset.rack);if(!isMr(rack)){lastMrPointerTap={id:null,at:0};return;}if(typeof m2CustomizeMode!=='undefined'&&m2CustomizeMode){lastMrPointerTap={id:null,at:0};event.preventDefault();event.stopImmediatePropagation();openMrCustomize(rack);return;}
    var now=Date.now(),same=Number(lastMrPointerTap.id)===Number(rack.id)&&now-lastMrPointerTap.at<520;
    if(!same){lastMrPointerTap={id:rack.id,at:now};return;}
    lastMrPointerTap={id:null,at:0};suppressMrDblClickUntil=now+700;event.preventDefault();event.stopImmediatePropagation();try{m2LayoutState.drag=null;}catch(e){}wrappedStart(rack.id);
  },true);
  document.addEventListener('dblclick',function(event){var node=event.target?.closest?.('#m2LayoutSvg [data-rack]'),rack=node&&rackById(node.dataset.rack);if(!isMr(rack))return;event.preventDefault();event.stopImmediatePropagation();if(Date.now()<suppressMrDblClickUntil)return;wrappedStart(rack.id);},true);
})();</script>`;

  const bodyEnd = html.lastIndexOf("</body>");
  if (bodyEnd < 0) throw new Error("MR v35: body kapanisi bulunamadi.");
  html = html.slice(0, bodyEnd) + runtime + "\n" + html.slice(bodyEnd);
  for (const required of [marker, "__rafexMrPointerDoubleTapV36", "rafexMrConfigFromRackV37", "rafex-mr-customize-v37", "MR 3D RAF ÖNİZLEMESİ", "addEventListener('pointerdown'", "rafexMrExtensionPlan", "Kalan MR Bölümü", "Özel Rafı Oluştur", "netRemaining>500", "step=\"50\""]) {
    if (!html.includes(required)) throw new Error(`MR v35 runtime dogrulama hatasi: ${required}`);
  }
  const encoded = Buffer.from(html, "utf8").toString("base64");
  worker = worker.slice(0, match.index) + match[1] + match[2] + encoded + match[2] + worker.slice(match.index + match[0].length);
  fs.writeFileSync(workerPath, worker);
  console.log("MR v37 runtime: MR uzatma + B2B'den izole MR 3D onizleme ve olcu butunlugu eklendi.");
} else {
  throw new Error("Kullanim: node scripts/patch-mr-free-extension-v35.mjs source|runtime");
}
