import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const workerPath = path.join(root, "dist/server/index.js");
const marker = 'data-rafex-b2b-3d-module-pause="v3"';

let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("B2B 3D module pause: HTML_BASE64 bulunamadi.");

let html = Buffer.from(match[3], "base64").toString("utf8");

// Earlier production layers either stopped the main 3D on every free-layout click
// or forced it to stay visible. Remove both so the final rule below is authoritative:
// only a real module addition hides the upper 3D, and the user brings it back with Yenile.
html = html
  .replace(/<script\s+data-rafex-free-layout-stop3d="v1">[\s\S]*?<\/script>/g, "")
  .replace(/<style\s+data-rafex-free-layout-stop3d-hard="v5">[\s\S]*?<\/style>\s*<script\s+data-rafex-free-layout-stop3d-hard="v5">[\s\S]*?<\/script>/g, "")
  .replace(/<style\s+data-rafex-b2b-3d-persistence="v1">[\s\S]*?<\/style>\s*<script\s+data-rafex-b2b-3d-persistence="v1">[\s\S]*?<\/script>/g, "")
  .replace(/<style\s+data-rafex-b2b-3d-persistence="v2">[\s\S]*?<\/style>\s*<script\s+data-rafex-b2b-3d-persistence="v2">[\s\S]*?<\/script>/g, "")
  .replace(/<style\s+data-rafex-b2b-3d-module-pause="v3">[\s\S]*?<\/style>\s*<script\s+data-rafex-b2b-3d-module-pause="v3">[\s\S]*?<\/script>/g, "");

if (!html.includes(marker)) {
  const runtime = `<style ${marker}>
.rafex-main-3d-refresh{padding:7px 10px!important;background:#173c2d!important;color:#fff!important;border:1px solid #ffffff22!important;border-radius:8px!important;font-size:10px!important;font-weight:800!important;white-space:nowrap}
.rafex-main-3d-refresh:hover,.rafex-main-3d-refresh:focus-visible{background:#214f3b!important;color:#f2c500!important}
.rafex-module-refresh{width:100%;padding:0;background:transparent;color:#fff;border:0;border-radius:11px;display:flex;flex-direction:column;align-items:center;gap:7px;cursor:pointer}
.rafex-module-refresh .side-logo{pointer-events:none}
.rafex-module-refresh-label{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;padding:7px 9px;border-radius:8px;background:#ffffff12;color:#d7e1da;font-size:10px;font-weight:800;letter-spacing:.03em}
.rafex-module-refresh:hover .rafex-module-refresh-label,.rafex-module-refresh:focus-visible .rafex-module-refresh-label{background:#ffffff20;color:var(--y)}
.rafex-module-refresh:focus-visible{outline:2px solid var(--y);outline-offset:3px}
.mobile-app-logo.rafex-module-refresh-mobile{cursor:pointer}
.rafex-b2b-paused-overlay{position:absolute;inset:0;z-index:40;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:15px;padding:20px;background:#f6f8f5;border-radius:inherit;text-align:center}
.rafex-b2b-paused-logo{display:block;width:min(240px,68%);max-height:105px;object-fit:contain;padding:10px 14px;background:#fff;border-radius:12px;box-shadow:0 8px 28px #173c2d1f}
.rafex-b2b-paused-title{font-size:12px;font-weight:800;color:#5b685f}
.rafex-b2b-resume{padding:11px 18px!important;background:#173c2d!important;color:#fff!important;border:0!important;border-radius:9px!important;font-size:12px!important;font-weight:800!important;box-shadow:0 7px 18px #173c2d2c!important}
.rafex-b2b-resume:hover,.rafex-b2b-resume:focus-visible{background:#214f3b!important;color:#f2c500!important}
</style>
<script ${marker}>(function(){
  if(window.__rafexB2B3DModulePauseV3)return;
  window.__rafexB2B3DModulePauseV3=true;

  let paused=false;
  let armedBaseline=null;
  let armedUntil=0;
  let armedTimer=null;

  function mainCanvas(){return document.getElementById('b2bMain3DCanvas');}
  function mainHost(){
    const canvas=mainCanvas();
    return canvas?.closest?.('.b2b-main-3d-canvas')||canvas?.parentElement||null;
  }
  function rackCount(){
    try{return typeof m2LayoutState!=='undefined'&&Array.isArray(m2LayoutState?.racks)?m2LayoutState.racks.length:0;}catch{return 0;}
  }
  function mainToolbar(){return document.querySelector('.b2b-3d-toolbar');}
  function pausedOverlay(){return document.getElementById('rafexB2BPausedOverlay');}

  function guardViewer(){
    const viewer=window.RafexB2BViewer;
    if(!viewer||viewer.__rafexModulePauseGuardV3)return;
    viewer.__rafexModulePauseGuardV3=true;
    const mount=viewer.mount?.bind(viewer);
    if(mount){
      viewer.mount=function(canvas,options){
        if(paused&&canvas?.id==='b2bMain3DCanvas')return;
        return mount(canvas,options);
      };
    }
  }

  function ensurePausedOverlay(){
    const host=mainHost();
    if(!host)return null;
    if(getComputedStyle(host).position==='static')host.style.position='relative';
    let overlay=pausedOverlay();
    if(overlay&&overlay.parentElement!==host){overlay.remove();overlay=null;}
    if(!overlay){
      overlay=document.createElement('div');
      overlay.id='rafexB2BPausedOverlay';
      overlay.className='rafex-b2b-paused-overlay';
      const sourceLogo=document.querySelector('.side-logo');
      if(sourceLogo){
        const logo=sourceLogo.cloneNode(true);
        logo.removeAttribute('id');
        logo.className='rafex-b2b-paused-logo';
        logo.removeAttribute('style');
        overlay.appendChild(logo);
      }else{
        const logo=document.createElement('strong');
        logo.className='rafex-b2b-paused-logo';
        logo.textContent='RAFEX';
        overlay.appendChild(logo);
      }
      const title=document.createElement('div');
      title.className='rafex-b2b-paused-title';
      title.textContent='Serbest yerlesime modul eklendi';
      overlay.appendChild(title);
      const button=document.createElement('button');
      button.type='button';
      button.className='rafex-b2b-resume';
      button.textContent='↻ Yenile';
      button.title='3D gorunumu yeniden getir';
      button.addEventListener('click',(event)=>{event.preventDefault();event.stopPropagation();resume3D();});
      overlay.appendChild(button);
      host.appendChild(overlay);
    }
    return overlay;
  }

  function applyPausedVisual(){
    const canvas=mainCanvas();
    if(!canvas)return;
    canvas.style.visibility='hidden';
    canvas.dataset.rafexModulePaused='1';
    const loading=document.getElementById('b2b3DLoading');
    if(loading)loading.hidden=true;
    const toolbar=mainToolbar();
    if(toolbar){toolbar.style.visibility='hidden';toolbar.dataset.rafexModulePaused='1';}
    ensurePausedOverlay();
  }

  function pause3D(){
    // Serbest Cizim de B2B'nin kendi sayfasindaki canli 3D'sini aynen korur.
    // Raf ekleme/yerlestirme performans yamasi artik viewer'i yok etmez veya
    // canvas'i gizlemez; kullanici sistem degistirene kadar 3D acik kalir.
    paused=false;
    window.__rafexFreeLayout3DStopped=false;
    pausedOverlay()?.remove();
    const toolbar=mainToolbar();
    if(toolbar){toolbar.style.visibility='';delete toolbar.dataset.rafexModulePaused;}
    const canvas=mainCanvas();
    if(canvas){canvas.style.visibility='visible';delete canvas.dataset.rafexModulePaused;}
    return false;
  }

  function resume3D(){
    paused=false;
    window.__rafexFreeLayout3DStopped=false;
    pausedOverlay()?.remove();
    const toolbar=mainToolbar();
    if(toolbar){toolbar.style.visibility='';delete toolbar.dataset.rafexModulePaused;}
    const canvas=mainCanvas();
    if(!canvas){
      try{if(typeof b2bInstallMain3D==='function')b2bInstallMain3D();}catch{}
      return false;
    }
    canvas.style.visibility='hidden';
    delete canvas.dataset.rafexModulePaused;
    const loading=document.getElementById('b2b3DLoading');
    if(loading)loading.hidden=false;
    const reveal=()=>{canvas.style.visibility='visible';if(loading)loading.hidden=true;pausedOverlay()?.remove();};
    canvas.addEventListener('b2b-viewer-ready',reveal,{once:true});
    canvas.addEventListener('b2b-viewer-error',reveal,{once:true});
    try{
      window.RafexB2BViewer?.destroy?.();
      const options=typeof b2b3DOptions==='function'?b2b3DOptions():{};
      window.RafexB2BViewer?.mount?.(canvas,options);
      if(typeof b2bUpdateMain3D==='function')b2bUpdateMain3D();
      if(typeof b2bSetCameraAngles==='function')b2bSetCameraAngles();
      if(typeof b2bApplyAutoRotate==='function')b2bApplyAutoRotate();
      setTimeout(()=>{if(!paused&&canvas.style.visibility==='hidden')reveal();},2500);
      return true;
    }catch(error){
      console.warn('B2B 3D yeniden baslatilamadi',error);
      reveal();
      return false;
    }
  }

  function refreshMain3D(){
    if(paused)return resume3D();
    const canvas=mainCanvas();
    if(!canvas)return false;
    const loading=document.getElementById('b2b3DLoading');
    canvas.style.visibility='hidden';
    if(loading)loading.hidden=false;
    const reveal=()=>{canvas.style.visibility='visible';if(loading)loading.hidden=true;};
    canvas.addEventListener('b2b-viewer-ready',reveal,{once:true});
    canvas.addEventListener('b2b-viewer-error',reveal,{once:true});
    try{
      window.RafexB2BViewer?.destroy?.();
      const options=typeof b2b3DOptions==='function'?b2b3DOptions():{};
      window.RafexB2BViewer?.mount?.(canvas,options);
      if(typeof b2bUpdateMain3D==='function')b2bUpdateMain3D();
      if(typeof b2bSetCameraAngles==='function')b2bSetCameraAngles();
      if(typeof b2bApplyAutoRotate==='function')b2bApplyAutoRotate();
      setTimeout(()=>{if(!paused&&canvas.style.visibility==='hidden')reveal();},2500);
      return true;
    }catch(error){console.warn('B2B 3D yenilenemedi',error);reveal();return false;}
  }

  function stopArmedWatch(){
    if(armedTimer){clearInterval(armedTimer);armedTimer=null;}
    armedBaseline=null;
    armedUntil=0;
  }

  function armForModuleAddition(){
    armedBaseline=rackCount();
    armedUntil=Date.now()+30000;
    if(armedTimer)return;
    armedTimer=setInterval(()=>{
      if(Date.now()>armedUntil){stopArmedWatch();return;}
      const nowCount=rackCount();
      if(armedBaseline!=null&&nowCount>armedBaseline){stopArmedWatch();pause3D();}
    },100);
  }

  function isModuleAddControl(target,event){
    const button=target?.closest?.('button');
    if(button){
      const onclick=button.getAttribute('onclick')||'';
      if(/m2AddRack\\s*\\(|m2AddSelectedSavedRack\\s*\\(|m2DuplicateRack\\s*\\(|m2ApplyAutoFillLength\\s*\\(|m2SaveRackType\\s*\\(/.test(onclick))return true;
      if(button.id==='m2AutoFillApplyButton'||button.id==='m2SaveRackButton')return true;
    }
    if(target?.closest?.('.m2-saved-type')&&Number(event?.detail)>=2)return true;
    return false;
  }

  function ensureMainRefreshButton(){
    const canvas=mainCanvas();
    if(!canvas)return;
    const toolbar=mainToolbar();
    if(!toolbar||document.getElementById('rafexMain3DRefreshButton'))return;
    const button=document.createElement('button');
    button.id='rafexMain3DRefreshButton';
    button.type='button';
    button.className='rafex-main-3d-refresh';
    button.textContent='Modulu Yenile';
    button.title='Ust 3D modulu yeniden olustur';
    button.addEventListener('click',(event)=>{event.preventDefault();event.stopPropagation();refreshMain3D();});
    toolbar.appendChild(button);
  }

  function moduleRefreshAction(){
    if(mainCanvas())refreshMain3D();
    else window.location.reload();
  }

  function ensureSidebarRefresh(){
    const brand=document.querySelector('.side-brand');
    const logo=brand?.querySelector('.side-logo');
    if(brand&&logo&&!brand.querySelector('.rafex-module-refresh')){
      const button=document.createElement('button');
      button.type='button';
      button.className='rafex-module-refresh';
      button.title='Modulu Yenile';
      button.setAttribute('aria-label','Modulu Yenile');
      brand.insertBefore(button,logo);
      button.appendChild(logo);
      const label=document.createElement('span');
      label.className='rafex-module-refresh-label';
      label.textContent='↻ Modulu Yenile';
      button.appendChild(label);
      button.addEventListener('click',moduleRefreshAction);
    }
    const mobileLogo=document.querySelector('.mobile-app-logo');
    if(mobileLogo&&!mobileLogo.dataset.rafexModuleRefresh){
      mobileLogo.dataset.rafexModuleRefresh='1';
      mobileLogo.classList.add('rafex-module-refresh-mobile');
      mobileLogo.title='Modulu Yenile';
      mobileLogo.setAttribute('aria-label','Modulu Yenile');
      mobileLogo.setAttribute('role','button');
      mobileLogo.tabIndex=0;
      mobileLogo.addEventListener('click',moduleRefreshAction);
      mobileLogo.addEventListener('keydown',(event)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();moduleRefreshAction();}});
    }
  }

  window.rafexRefreshMainB2B3D=refreshMain3D;
  window.rafexResumeMain3D=resume3D;
  window.rafexResumeB2B3D=resume3D;
  window.rafexPauseB2B3D=pause3D;
  window.rafexStopMain3DForFreeLayout=function(){};

  document.addEventListener('click',(event)=>{
    if(!event.isTrusted)return;
    const target=event.target instanceof Element?event.target:null;
    if(!target)return;
    if(target.closest('#rafexB2BPausedOverlay,.rafex-module-refresh,#rafexMain3DRefreshButton'))return;
    if(isModuleAddControl(target,event))armForModuleAddition();
  },true);

  function repair(){guardViewer();ensureMainRefreshButton();ensureSidebarRefresh();if(paused)applyPausedVisual();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',repair,{once:true});else repair();
  const observer=new MutationObserver(()=>{ensureMainRefreshButton();ensureSidebarRefresh();guardViewer();if(paused)applyPausedVisual();});
  observer.observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('rafex-b2b-viewer-ready',()=>{guardViewer();if(paused)applyPausedVisual();});
})();</script>`;
  const bodyEnd = html.lastIndexOf("</body>");
  if (bodyEnd < 0) throw new Error("B2B 3D module pause: </body> bulunamadi.");
  html = html.slice(0, bodyEnd) + runtime + html.slice(bodyEnd);
}

if (html.includes('data-rafex-free-layout-stop3d="v1"') || html.includes('data-rafex-free-layout-stop3d-hard="v5"') || html.includes('data-rafex-b2b-3d-persistence="v2"')) {
  throw new Error("B2B 3D module pause: eski 3D runtime final artifact'ta kaldi.");
}
if (!html.includes(marker) || !html.includes('rafexB2BPausedOverlay') || !html.includes('armForModuleAddition') || !html.includes('window.rafexStopMain3DForFreeLayout=function(){}')) {
  throw new Error("B2B 3D module pause patch dogrulanamadi.");
}

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.slice(0, match.index) + match[1] + match[2] + encoded + match[2] + worker.slice(match.index + match[0].length);
fs.writeFileSync(workerPath, worker);
console.log("FINAL: Serbest Cizim B2B canli 3D'si modul ekleme ve yerlesimde acik kalir (v3).");
