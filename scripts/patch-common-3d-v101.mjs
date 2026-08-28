import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("Common 3D v101: HTML_BASE64 bulunamadi");
let html = Buffer.from(match[3], "base64").toString("utf8");
if (!html.includes('data-rafex-common-architecture="v90"')) throw new Error("Common 3D v101: ortak kontrolcu bulunamadi");

html = html
  .replace(/<style\s+data-rafex-common-3d="v101">[\s\S]*?<\/style>/g, "")
  .replace(/<script\s+data-rafex-common-3d="v101">[\s\S]*?<\/script>/g, "");

const broadCanvasRule = '#page.rafex-common-v90:not(.rafex-3d-open-v90) canvas{display:none!important}';
const scopedCanvasRule = '#page.rafex-common-v90:not(.rafex-3d-open-v90) #b2bMain3DCanvas,#page.rafex-common-v90:not(.rafex-3d-open-v90) #mrCanvas{display:none!important}';
if (html.includes(broadCanvasRule)) html = html.replace(broadCanvasRule, scopedCanvasRule);
if (!html.includes(scopedCanvasRule)) throw new Error("Common 3D v101: ana canvas gorunurluk kurali duzeltilemedi");

const broadStatusRule = '#page.rafex-common-v90:not(.rafex-3d-open-v90) [class*="viewer-status"],#page.rafex-common-v90:not(.rafex-3d-open-v90) [id*="ViewerStatus"]{display:none!important}';
const scopedStatusRule = '#page.rafex-common-v90:not(.rafex-3d-open-v90) #mrViewerStatus,#page.rafex-common-v90:not(.rafex-3d-open-v90) #b2b3DLoading,#page.rafex-common-v90:not(.rafex-3d-open-v90) #b2b3DError{display:none!important}';
if (html.includes(broadStatusRule)) html = html.replace(broadStatusRule, scopedStatusRule);

const runtime = String.raw`<style data-rafex-common-3d="v101">
#page.rafex-common-v90:not(.rafex-3d-open-v90) .b2b-main-3d-canvas,
#page.rafex-common-v90:not(.rafex-3d-open-v90) .mr-view-card{
  display:none!important;
  min-height:0!important;
  height:0!important;
  overflow:hidden!important;
}
#page.rafex-common-v90:not(.rafex-3d-open-v90) canvas:not(#b2bMain3DCanvas):not(#mrCanvas){display:block!important}
#page.rafex-common-v90 .m2-layout-modal canvas,
#page.rafex-common-v90 dialog canvas,
#page.rafex-common-v90 #m2CustomizeCanvas,
#page.rafex-common-v90 #m2SavedRackPreviewCanvas{display:block!important;visibility:visible!important}
#page.rafex-common-v90.rafex-3d-open-v90 #b2bMain3DCanvas,
#page.rafex-common-v90.rafex-3d-open-v90 #mrCanvas{display:block!important;visibility:visible!important}
</style>
<script data-rafex-common-3d="v101">(()=>{
  if(window.__rafexCommon3DV101)return;
  window.__rafexCommon3DV101=true;
  let repairToken=0;
  const read=(name)=>{try{return window[name]||Function('return typeof '+name+'!=="undefined"?'+name+':null')()}catch{return window[name]||null}};
  const page=()=>document.getElementById('page');
  const common=()=>window.__rafexCommonArchitectureV90Active===true&&page()?.classList.contains('rafex-common-v90');
  const open=()=>common()&&page()?.classList.contains('rafex-3d-open-v90');
  const system=()=>{
    const raw=String(read('m2ActiveModule')||page()?.dataset?.m2Module||'').toLowerCase();
    if(raw==='mr'||raw==='b2b')return raw;
    if(document.getElementById('mrCanvas'))return'mr';
    if(document.getElementById('b2bMain3DCanvas'))return'b2b';
    return raw;
  };
  function pauseMain(){
    try{window.RafexB2BViewer?.setPaused?.(true)}catch{}
    try{window.RafexMRViewer?.setPaused?.(true)}catch{}
  }
  function mountB2B(){
    try{read('b2bInstallMain3D')?.()}catch{}
    const canvas=document.getElementById('b2bMain3DCanvas'),api=window.RafexB2BViewer;
    if(!canvas||!api?.mount)return false;
    if(!api.isMounted?.('b2bMain3DCanvas')){
      const options=read('b2b3DOptions');
      api.mount(canvas,typeof options==='function'?options():{});
    }
    try{read('b2bUpdateMain3D')?.()}catch{}
    try{read('b2bSetCameraAngles')?.()}catch{}
    api.setPaused?.(false);
    return true;
  }
  function mountMR(){
    const canvas=document.getElementById('mrCanvas'),api=window.RafexMRViewer;
    if(!canvas||!api?.mount)return false;
    if(!api.isMounted?.('mrCanvas')){
      const mount=read('mrMountViewer');
      if(typeof mount==='function')mount();
      else{
        const config=read('mrConfigurationV2');
        api.mount(canvas,{config:typeof config==='function'?config():{}});
      }
    }
    try{read('mrUpdateSummary')?.(true)}catch{}
    api.setPaused?.(false);
    return true;
  }
  function repair(){
    if(!common())return;
    if(!open()){pauseMain();return;}
    const active=system();
    let mounted=false;
    if(active==='mr')mounted=mountMR();
    else if(active==='b2b')mounted=mountB2B();
    else mounted=mountB2B()||mountMR();
    requestAnimationFrame(()=>{
      window.dispatchEvent(new Event('resize'));
      if(active==='mr')try{window.RafexMRViewer?.setPaused?.(false)}catch{}
      else try{window.RafexB2BViewer?.setPaused?.(false)}catch{}
    });
    const button=document.getElementById('rafexCommon3DV90');
    if(button)button.title=mounted?'Ana 3D görünüm hazır':'3D motoru hazırlanıyor';
  }
  function schedule(){
    const token=++repairToken;
    [0,60,180,420].forEach((delay)=>setTimeout(()=>{if(token===repairToken)repair()},delay));
  }
  document.addEventListener('click',(event)=>{
    if(event.target?.closest?.('#rafexCommon3DV90,input[name="rafexUnifiedSystem"],.rafex-system-option'))schedule();
  },true);
  document.addEventListener('change',(event)=>{if(event.target?.matches?.('input[name="rafexUnifiedSystem"]'))schedule()},true);
  ['common:ready','project:loaded','layout:rendered'].forEach((name)=>window.addEventListener(name,schedule));
  window.addEventListener('rafex-b2b-viewer-ready',schedule);
  window.addEventListener('rafex-mr-viewer-ready',schedule);
  window.addEventListener('pageshow',schedule);
  window.rafexCommon3DRepairV101=schedule;
  setTimeout(schedule,700);
})();</script>`;

const bodyEnd = html.lastIndexOf("</body>");
if (bodyEnd < 0) throw new Error("Common 3D v101: body bulunamadi");
html = html.slice(0, bodyEnd) + runtime + "\n" + html.slice(bodyEnd);

for (const required of [
  'data-rafex-common-3d="v101"',
  'b2bMain3DCanvas',
  'mrCanvas',
  'rafexCommon3DRepairV101',
  "api.isMounted?.('b2bMain3DCanvas')",
  "api.isMounted?.('mrCanvas')",
]) if (!html.includes(required)) throw new Error("Common 3D v101 dogrulama eksigi: " + required);
if (html.includes(broadCanvasRule)) throw new Error("Common 3D v101: tum canvaslari gizleyen eski kural kaldi");

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.slice(0, match.index) + match[0].replace(match[3], encoded) + worker.slice(match.index + match[0].length);
fs.writeFileSync(workerPath, worker);
console.log("v101: Ortak Cizim ana B2B/MR 3D alani kontrollu acilir; modal 3D tuvaller korunur ve ana viewer yeniden baglanir.");
