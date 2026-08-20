import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const workerPath = path.join(root, "dist/server/index.js");
const marker = 'data-rafex-b2b-3d-persistence="v1"';

let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("B2B 3D persistence: HTML_BASE64 bulunamadı.");

let html = Buffer.from(match[3], "base64").toString("utf8");

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
</style>
<script ${marker}>(function(){
  if(window.__rafexB2B3DPersistenceV1)return;
  window.__rafexB2B3DPersistenceV1=true;

  function mainCanvas(){return document.getElementById('b2bMain3DCanvas');}
  function pausedOverlay(){return document.getElementById('rafexB2BPausedOverlay');}
  function cleanPausedState(){
    pausedOverlay()?.remove();
    const canvas=mainCanvas();
    if(canvas)canvas.style.visibility='visible';
    const loading=document.getElementById('b2b3DLoading');
    if(loading&&canvas)loading.hidden=true;
  }

  function refreshMain3D(){
    const canvas=mainCanvas();
    if(!canvas){cleanPausedState();return false;}
    pausedOverlay()?.remove();
    const loading=document.getElementById('b2b3DLoading');
    canvas.style.visibility='hidden';
    if(loading)loading.hidden=false;
    const reveal=()=>{canvas.style.visibility='visible';if(loading)loading.hidden=true;pausedOverlay()?.remove();};
    canvas.addEventListener('b2b-viewer-ready',reveal,{once:true});
    canvas.addEventListener('b2b-viewer-error',reveal,{once:true});
    try{
      window.RafexB2BViewer?.destroy?.();
      window.RafexB2BViewer?.mount?.(canvas,b2b3DOptions());
      if(typeof b2bUpdateMain3D==='function')b2bUpdateMain3D();
      if(typeof b2bSetCameraAngles==='function')b2bSetCameraAngles();
      if(typeof b2bApplyAutoRotate==='function')b2bApplyAutoRotate();
      setTimeout(()=>{if(canvas.style.visibility==='hidden')reveal();},2500);
      return true;
    }catch(error){
      console.warn('B2B 3D yeniden başlatılamadı',error);
      reveal();
      return false;
    }
  }
  window.rafexRefreshMainB2B3D=refreshMain3D;

  // Serbest yerleşime raf ekleme/seçme sırasında üst 3D artık kapatılmayacak.
  // Eski performans kancası çağrılsa bile aktif viewer'ı yok etmek yerine görünümü koru.
  window.rafexPauseB2B3D=function(){cleanPausedState();};

  const previousResume=window.rafexResumeB2B3D;
  window.rafexResumeB2B3D=function(){
    if(mainCanvas())return refreshMain3D();
    if(typeof previousResume==='function')return previousResume.apply(this,arguments);
    cleanPausedState();
  };

  function ensureMainRefreshButton(){
    const canvas=mainCanvas();
    if(!canvas)return;
    const toolbar=document.querySelector('.b2b-3d-toolbar');
    if(!toolbar||document.getElementById('rafexMain3DRefreshButton'))return;
    const button=document.createElement('button');
    button.id='rafexMain3DRefreshButton';
    button.type='button';
    button.className='rafex-main-3d-refresh';
    button.textContent='Modülü Yenile';
    button.title='Üst 3D modülü yeniden oluştur';
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
      button.title='Modülü Yenile';
      button.setAttribute('aria-label','Modülü Yenile');
      brand.insertBefore(button,logo);
      button.appendChild(logo);
      const label=document.createElement('span');
      label.className='rafex-module-refresh-label';
      label.textContent='↻ Modülü Yenile';
      button.appendChild(label);
      button.addEventListener('click',moduleRefreshAction);
    }
    const mobileLogo=document.querySelector('.mobile-app-logo');
    if(mobileLogo&&!mobileLogo.dataset.rafexModuleRefresh){
      mobileLogo.dataset.rafexModuleRefresh='1';
      mobileLogo.classList.add('rafex-module-refresh-mobile');
      mobileLogo.title='Modülü Yenile';
      mobileLogo.setAttribute('aria-label','Modülü Yenile');
      mobileLogo.setAttribute('role','button');
      mobileLogo.tabIndex=0;
      mobileLogo.addEventListener('click',moduleRefreshAction);
      mobileLogo.addEventListener('keydown',(event)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();moduleRefreshAction();}});
    }
  }

  function repair(){cleanPausedState();ensureMainRefreshButton();ensureSidebarRefresh();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',repair,{once:true});else repair();
  const observer=new MutationObserver(()=>{ensureMainRefreshButton();ensureSidebarRefresh();if(pausedOverlay())cleanPausedState();});
  observer.observe(document.documentElement,{childList:true,subtree:true});
})();</script>`;
  const bodyEnd = html.lastIndexOf("</body>");
  if (bodyEnd < 0) throw new Error("B2B 3D persistence: </body> bulunamadı.");
  html = html.slice(0, bodyEnd) + runtime + html.slice(bodyEnd);
}

if (!html.includes(marker) || !html.includes('rafexRefreshMainB2B3D') || !html.includes('window.rafexPauseB2B3D=function(){cleanPausedState();}')) {
  throw new Error("B2B 3D persistence patch doğrulanamadı.");
}

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.slice(0, match.index) + match[1] + match[2] + encoded + match[2] + worker.slice(match.index + match[0].length);
fs.writeFileSync(workerPath, worker);
console.log("B2B 3D kalıcılığı aktif: serbest yerleşim üst 3D'yi kapatmıyor ve Modülü Yenile kullanılabilir.");
