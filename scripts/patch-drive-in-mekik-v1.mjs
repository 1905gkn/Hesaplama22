import fs from "node:fs";

const file = "dist/server/index.js";
let source = fs.readFileSync(file, "utf8");
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error("HTML_BASE64 not found for Drive In v1");
let html = Buffer.from(match[2], "base64").toString("utf8");

html = html
  .replace(/<style data-rafex-drive-in-mekik="v1">[\s\S]*?<\/style>/g, "")
  .replace(/<script data-rafex-drive-in-viewer-loader="v1"[^>]*><\/script>/g, "")
  .replace(/<script data-rafex-drive-in-mekik="v1">[\s\S]*?<\/script>/g, "");

const runtime = String.raw`
<style data-rafex-drive-in-mekik="v1">
#page.drive-in-mode .rafex-drive-first-level{order:0}
#page.drive-in-mode #m2Front{position:relative;overflow:hidden;background:#fff}
#page.drive-in-mode #m2Front .rafex-drive-front-wrap{position:absolute;inset:0;min-height:100%;background:linear-gradient(180deg,#fff,#f8faf8)}
#page.drive-in-mode #m2Front .rafex-drive-front-wrap canvas{display:block;width:100%;height:100%;min-height:430px;touch-action:none}
#page.drive-in-mode #m2Front .rafex-drive-front-status{position:absolute;left:12px;bottom:10px;padding:6px 9px;border:1px solid #dfe5e0;border-radius:7px;background:#ffffffdd;color:#536158;font-size:10px;font-weight:900;pointer-events:none}
#page.drive-in-mode #m2Front .rafex-drive-dim{position:absolute;z-index:3;padding:4px 7px;border:1px solid #b9c9bf;border-radius:999px;background:#fffffff0;color:#174d36;font:900 10px/1 Arial,sans-serif;pointer-events:none;box-shadow:0 1px 4px #0001}
#page.drive-in-mode #m2Front .rafex-drive-dim-width{left:50%;top:8px;transform:translateX(-50%)}
#page.drive-in-mode #m2Front .rafex-drive-dim-height{left:8px;top:50%;transform:translateY(-50%) rotate(-90deg)}
#page.drive-in-mode #m2Front .rafex-drive-dim-bay{left:50%;bottom:9px;transform:translateX(-50%)}
#page.drive-in-mode #m2Front .rafex-drive-dim-level{right:8px;top:42%}
#page.drive-in-mode #m2Front .rafex-drive-dim-pallet{right:8px;top:52%}
#page.drive-in-mode .m2-view[data-m2-view="front"] .m2-view-header-tools>span{font-weight:900;color:#214f3b}
</style>
<script data-rafex-drive-in-mekik="v1">
(()=>{
  if(window.__rafexDriveInMekikV1)return;window.__rafexDriveInMekikV1=true;
  const baseRenderMekik2=window.renderMekik2||renderMekik2;
  const baseDrawMekik2=window.drawMekik2||drawMekik2;
  const baseRefreshSaved=window.m2RefreshSavedRackTypes||m2RefreshSavedRackTypes;
  const baseSaveRack=window.m2SaveRackType||m2SaveRackType;
  const baseShowPage=window.showPage||showPage;
  const baseRefreshReport=typeof m2RefreshActiveReport==='function'?m2RefreshActiveReport:null;
  const baseCorporate=typeof m2RenderCorporateReport==='function'?m2RenderCorporateReport:null;
  let frontViewer=null,frontMountToken=0,frontScheduleRaf=0,frontConfigKey='',viewerLoading=null;

  const isDrive=()=>{try{return m2ActiveModule==='drive'}catch{return false}};
  const number=(id,fallback)=>{const v=Number(document.getElementById(id)?.value);return Number.isFinite(v)?v:fallback};
  const palletDepth=()=>{const choice=document.getElementById('m2PalD')?.value;if(choice==='other')return number('m2PalDOther',900);const v=Number(choice);return Number.isFinite(v)?v:800};
  const config=()=>({
    bays:Math.max(1,number('m2Bays',1)),
    levels:Math.max(1,number('m2Levels',4)),
    palletWidth:Math.max(300,number('m2PalW',800)),
    palletDepth:Math.max(300,palletDepth()),
    palletHeight:Math.max(300,number('m2LevelH',1200)),
    depthPallets:Math.max(1,number('m2Depth',5)),
    systemType:document.getElementById('m2System')?.value||'fifo',
    firstPalletGap:Math.max(0,number('m2FirstPalletGap',200)),
    palletGap:Math.max(0,number('m2PalletGap',50)),
    firstLevelHeight:Math.max(0,number('m2FirstLevelHeight',430)),
    levelSpacing:Math.max(380,number('m2LevelSpacing',1580)),
  });

  function syncFirstLevel(fromVisible=false){
    const visible=document.getElementById('driveFirstLevelHeight'),native=document.getElementById('m2FirstLevelHeight');
    if(!visible||!native)return;
    if(fromVisible){native.value=String(Math.max(0,Number(visible.value)||0));}
    else if(document.activeElement!==visible)visible.value=String(Math.max(0,Number(native.value)||430));
  }

  function setText(selector,value){const el=document.querySelector(selector);if(el)el.textContent=value}
  function relabelDrive(){
    if(!isDrive())return;
    document.getElementById('page')?.classList.add('drive-in-mode');
    setText('#pageTitle','Drive In');
    const hero=document.querySelector('#page h2');if(hero&&/mekik/i.test(hero.textContent||''))hero.textContent='Drive In';
    const saved=document.querySelector('#m2SavedTypesPanel .m2-saved-types-head>b');if(saved)saved.childNodes[0].textContent='Kayıtlı Drive In Raf Tipleri ';
    const projectTitle=document.querySelector('.m2-project-actions>div>b');if(projectTitle)projectTitle.textContent='Kayıtlı Drive In Projeleri';
    setText('#m2ReportProjectName','DRIVE IN RAF PROJESİ');
    const reportMeta=document.getElementById('m2ReportMeta');if(reportMeta)reportMeta.textContent='RAFEX RAF SİSTEMLERİ · DRIVE IN TEKNİK YERLEŞİM';
    document.querySelectorAll('#page .m2-report-elevation>b').forEach((node)=>{if(/^MEKİK\b/i.test(node.textContent||''))node.textContent=(node.textContent||'').replace(/^MEKİK\b/i,'DRIVE IN')});
    const frontHeader=document.querySelector('.m2-view[data-m2-view="front"] .m2-view-header-tools>span');if(frontHeader)frontHeader.textContent='Drive In · GLB ön montaj görünümü';
  }

  function installFirstLevelField(){
    const pallet=document.getElementById('m2LevelH');if(!pallet)return;
    const label=pallet.closest('label');if(!label)return;
    let field=document.querySelector('.rafex-drive-first-level');
    if(!field){
      field=document.createElement('label');field.className='input-field rafex-drive-first-level';
      field.innerHTML='İlk kat yüksekliği (mm)<input id="driveFirstLevelHeight" type="number" min="0" max="5000" step="10" value="430">';
      label.insertAdjacentElement('afterend',field);
      const input=field.querySelector('input');
      input.addEventListener('input',()=>{syncFirstLevel(true);try{drawMekik2()}catch{}});
      input.addEventListener('change',()=>{syncFirstLevel(true);try{drawMekik2()}catch{}});
    }
    syncFirstLevel(false);
  }

  function destroyFront(){
    frontMountToken+=1;
    if(frontScheduleRaf){cancelAnimationFrame(frontScheduleRaf);frontScheduleRaf=0;}
    try{frontViewer?.destroy?.()}catch{}
    frontViewer=null;frontConfigKey='';
    try{window.RafexDriveInViewer?.destroy?.()}catch{}
  }

  function ensureViewer(){
    if(window.RafexDriveInViewer?.mount)return Promise.resolve(window.RafexDriveInViewer);
    if(viewerLoading)return viewerLoading;
    viewerLoading=new Promise((resolve,reject)=>{
      const ready=()=>resolve(window.RafexDriveInViewer);
      window.addEventListener('rafex-drive-in-viewer-ready',ready,{once:true});
      const script=document.createElement('script');script.src='/drive-in-viewer.js?v=drive-in-front-v5';script.defer=true;script.dataset.rafexDriveInViewerLoader='v5';
      script.onerror=()=>reject(new Error('Drive In 3D motoru yüklenemedi.'));
      document.head.appendChild(script);
    }).catch((error)=>{viewerLoading=null;throw error});
    return viewerLoading;
  }

  function dimensionMarkup(c){
    const bayClear=c.palletWidth+150,total=c.bays*bayClear+(c.bays+1)*90,totalH=c.firstLevelHeight+Math.max(0,c.levels-1)*c.levelSpacing+c.palletHeight+220;
    return '<span class="rafex-drive-dim rafex-drive-dim-width">TOPLAM '+Math.round(total)+' mm</span><span class="rafex-drive-dim rafex-drive-dim-height">YÜKSEKLİK '+Math.round(totalH)+' mm</span><span class="rafex-drive-dim rafex-drive-dim-bay">GÖZ '+Math.round(bayClear)+' mm</span><span class="rafex-drive-dim rafex-drive-dim-level">İLK KAT '+Math.round(c.firstLevelHeight)+' · ARA '+Math.round(c.levelSpacing)+' mm</span><span class="rafex-drive-dim rafex-drive-dim-pallet">PALET '+Math.round(c.palletWidth)+' × '+Math.round(c.palletDepth)+' × '+Math.round(c.palletHeight)+' mm</span>';
  }

  function updateDimensions(host,c){
    const bayClear=c.palletWidth+150,total=c.bays*bayClear+(c.bays+1)*90,totalH=c.firstLevelHeight+Math.max(0,c.levels-1)*c.levelSpacing+c.palletHeight+220;
    const set=(name,value)=>{const node=host.querySelector('.rafex-drive-dim-'+name);if(node)node.textContent=value};
    set('width','TOPLAM '+Math.round(total)+' mm');set('height','YÜKSEKLİK '+Math.round(totalH)+' mm');set('bay','GÖZ '+Math.round(bayClear)+' mm');set('level','İLK KAT '+Math.round(c.firstLevelHeight)+' · ARA '+Math.round(c.levelSpacing)+' mm');set('pallet','PALET '+Math.round(c.palletWidth)+' × '+Math.round(c.palletDepth)+' × '+Math.round(c.palletHeight)+' mm');
  }

  function mountFront(){
    if(!isDrive())return;
    const host=document.getElementById('m2Front');if(!host)return;
    const nextConfig=config();
    const nextKey=JSON.stringify(nextConfig);
    const existingCanvas=host.querySelector('#rafexDriveFrontCanvas');
    if(frontViewer&&existingCanvas&&frontViewer.canvas===existingCanvas&&!frontViewer.destroyed){
      if(nextKey!==frontConfigKey){try{frontViewer.update?.(nextConfig)}catch{}updateDimensions(host,nextConfig);frontConfigKey=nextKey;}
      return;
    }
    destroyFront();
    const token=frontMountToken;
    host.innerHTML='<div class="rafex-drive-front-wrap"><canvas id="rafexDriveFrontCanvas" aria-label="Drive In GLB ön görünüş"></canvas>'+dimensionMarkup(nextConfig)+'<span class="rafex-drive-front-status" id="rafexDriveFrontStatus">Drive In GLB parçaları yükleniyor…</span></div>';
    const canvas=document.getElementById('rafexDriveFrontCanvas'),status=document.getElementById('rafexDriveFrontStatus');
    if(!canvas)return;
    const start=()=>{
      if(token!==frontMountToken||!isDrive()||!document.body.contains(canvas))return;
      const api=window.RafexDriveInViewer;if(!api?.mount){if(status)status.textContent='Drive In 3D motoru hazırlanıyor…';return;}
      try{
        frontViewer=api.mount(canvas,nextConfig);
        frontConfigKey=nextKey;
        canvas.addEventListener('drive-in-ready',()=>{if(status)status.textContent='AYAK · RAY · KONSOL · ARA BAĞ · PALET';},{once:true});
        canvas.addEventListener('drive-in-error',(event)=>{if(status)status.textContent=event.detail?.message||'Drive In GLB yüklenemedi.';},{once:true});
      }catch(error){if(status)status.textContent=error?.message||'Drive In ön görünüş açılamadı.'}
    };
    ensureViewer().then(start).catch((error)=>{if(status)status.textContent=error?.message||'Drive In ön görünüş açılamadı.'});
  }

  function scheduleFront(){
    if(!isDrive()||frontScheduleRaf)return;
    frontScheduleRaf=requestAnimationFrame(()=>{frontScheduleRaf=0;if(isDrive())mountFront()});
  }

  drawMekik2=function(...args){
    const result=baseDrawMekik2.apply(this,args);
    if(isDrive()){
      if(typeof m2LastDrawing!=='undefined'&&m2LastDrawing)m2LastDrawing.rafexSystem='drive';
      syncFirstLevel(false);relabelDrive();scheduleFront();
    }
    return result;
  };
  window.drawMekik2=drawMekik2;

  m2SaveRackType=async function(...args){
    if(isDrive()&&typeof m2LastDrawing!=='undefined'&&m2LastDrawing)m2LastDrawing.rafexSystem='drive';
    return await baseSaveRack.apply(this,args);
  };
  window.m2SaveRackType=m2SaveRackType;

  m2RefreshSavedRackTypes=async function(...args){
    const result=await baseRefreshSaved.apply(this,args);
    try{
      if(isDrive())m2SavedRackTypes=m2SavedRackTypes.filter((entry)=>entry?.drawing?.rafexSystem==='drive');
      else if(m2ActiveModule==='mekik2')m2SavedRackTypes=m2SavedRackTypes.filter((entry)=>entry?.drawing?.rafexSystem!=='drive');
      m2SelectedSavedType=m2SavedRackTypes.length?Math.min(m2SelectedSavedType??0,m2SavedRackTypes.length-1):null;
      m2RenderSavedRackTypes();
      if(isDrive()&&document.getElementById('m2FloorStatus'))document.getElementById('m2FloorStatus').textContent=m2SavedRackTypes.length+' kayıtlı Drive In raf tipi getirildi.';
    }catch{}
    relabelDrive();
    return result;
  };
  window.m2RefreshSavedRackTypes=m2RefreshSavedRackTypes;

  renderDrive=function(){
    try{if(m2ActiveModule!=='drive')m2ActivateModule('drive')}catch{}
    baseRenderMekik2();
    const page=document.getElementById('page');if(page){page.dataset.m2Module='drive';page.classList.add('drive-in-mode')}
    installFirstLevelField();
    if(typeof m2LastDrawing!=='undefined'&&m2LastDrawing)m2LastDrawing.rafexSystem='drive';
    relabelDrive();
    try{drawMekik2()}catch{scheduleFront()}
    setTimeout(()=>{installFirstLevelField();relabelDrive();scheduleFront()},120);
  };
  window.renderDrive=renderDrive;

  showPage=function(name,...args){
    if(name!=='drive')destroyFront();
    return baseShowPage.call(this,name,...args);
  };
  window.showPage=showPage;

  if(baseRefreshReport){
    m2RefreshActiveReport=function(...args){const result=baseRefreshReport.apply(this,args);if(isDrive())requestAnimationFrame(relabelDrive);return result};window.m2RefreshActiveReport=m2RefreshActiveReport;
  }
  if(baseCorporate){
    m2RenderCorporateReport=function(...args){const result=baseCorporate.apply(this,args);if(isDrive())requestAnimationFrame(relabelDrive);return result};window.m2RenderCorporateReport=m2RenderCorporateReport;
  }
})();
</script>`;

html = html.replace("</body>", runtime + "</body>");
for (const required of [
  'data-rafex-drive-in-mekik="v1"',
  '/drive-in-viewer.js?v=drive-in-front-v5',
  "İlk kat yüksekliği (mm)",
  "m2ActivateModule('drive')",
  "rafexSystem='drive'",
  "AYAK · RAY · KONSOL · ARA BAĞ · PALET",
]) if (!html.includes(required)) throw new Error(`Drive In v1 doğrulaması eksik: ${required}`);

const encoded = Buffer.from(html).toString("base64");
source = source.slice(0, match.index) + match[0].replace(match[2], encoded) + source.slice(match.index + match[0].length);
fs.writeFileSync(file, source);
console.log("Drive In v1: Mekik akışı korundu; GLB ön görünüş tekrar mount döngüsü ve resize titreşimi giderildi.");

