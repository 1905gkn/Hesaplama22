import fs from "node:fs";
import path from "node:path";

const p=path.join(process.cwd(),"dist/server/index.js");
let worker=fs.readFileSync(p,"utf8");
const match=worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if(!match)throw new Error("HTML_BASE64 bulunamadi.");
let html=Buffer.from(match[3],"base64").toString("utf8");

const marker='data-rafex-free-layout-stop3d-hard="v3"';
if(!html.includes(marker)){
  const runtime=`<style ${marker}>
    #rafexMain3DResumeOverlay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.86);z-index:20}
    #rafexMain3DResumeOverlay[hidden]{display:none!important}
    #rafexMain3DResumeOverlay .rafex-3d-resume-card{display:grid;gap:10px;justify-items:center;padding:18px 22px;border:1px solid #d7dfd9;border-radius:14px;background:#fff;box-shadow:0 10px 30px #0002}
    #rafexMain3DResumeOverlay small{font-size:11px;color:#68736c;font-weight:700}
    #rafexMain3DResumeButton{padding:10px 16px;border-radius:9px;background:#7f1623;color:#fff;font-weight:800}
  </style><script ${marker}>(function(){
    if(window.__rafexFreeLayoutStop3DHardV3)return;window.__rafexFreeLayoutStop3DHardV3=true;
    window.__rafexFreeLayout3DStopped=false;

    function ensureOverlay(){
      const canvas=document.getElementById('b2bMain3DCanvas');
      const host=canvas?.parentElement;
      if(!host)return null;
      if(getComputedStyle(host).position==='static')host.style.position='relative';
      let overlay=document.getElementById('rafexMain3DResumeOverlay');
      if(!overlay){
        overlay=document.createElement('div');overlay.id='rafexMain3DResumeOverlay';overlay.hidden=true;
        overlay.innerHTML='<div class="rafex-3d-resume-card"><small>Performans için 3D görünüm durduruldu.</small><button type="button" id="rafexMain3DResumeButton">3D\'Yİ YENİLE</button></div>';
        host.appendChild(overlay);
        overlay.querySelector('#rafexMain3DResumeButton')?.addEventListener('click',(event)=>{event.preventDefault();event.stopPropagation();resume3D();});
      }
      return overlay;
    }

    function guardViewer(){
      const viewer=window.RafexB2BViewer;if(!viewer||viewer.__rafexMain3DGuardV3)return;
      viewer.__rafexMain3DGuardV3=true;
      const mount=viewer.mount?.bind(viewer);
      if(mount){viewer.mount=function(canvas,options){if(window.__rafexFreeLayout3DStopped&&canvas?.id==='b2bMain3DCanvas')return;return mount(canvas,options);};}
    }

    function stop3D(){
      window.__rafexFreeLayout3DStopped=true;
      guardViewer();
      try{window.RafexB2BViewer?.setAutoRotate?.(false);}catch{}
      try{window.RafexB2BViewer?.destroy?.();}catch{}
      const canvas=document.getElementById('b2bMain3DCanvas');if(canvas)canvas.style.visibility='hidden';
      const loading=document.getElementById('b2b3DLoading');if(loading)loading.hidden=true;
      const overlay=ensureOverlay();if(overlay)overlay.hidden=false;
    }

    function resume3D(){
      window.__rafexFreeLayout3DStopped=false;
      const overlay=document.getElementById('rafexMain3DResumeOverlay');if(overlay)overlay.hidden=true;
      const canvas=document.getElementById('b2bMain3DCanvas');
      if(canvas){
        canvas.style.visibility='visible';
        try{window.RafexB2BViewer?.mount?.(canvas,typeof b2b3DOptions==='function'?b2b3DOptions():{});}catch(error){console.warn('3D yeniden baslatilamadi',error);}
        try{if(typeof b2bSetCameraAngles==='function')b2bSetCameraAngles();}catch{}
        try{if(typeof b2bApplyAutoRotate==='function')b2bApplyAutoRotate();}catch{}
        try{if(typeof b2bUpdateMain3D==='function')b2bUpdateMain3D();}catch{}
      }else{
        try{if(typeof b2bInstallMain3D==='function')b2bInstallMain3D();}catch{}
      }
    }

    window.rafexStopMain3DForFreeLayout=stop3D;
    window.rafexResumeMain3D=resume3D;
    guardViewer();
    window.addEventListener('rafex-b2b-viewer-ready',guardViewer);

    document.addEventListener('pointerdown',(event)=>{
      const t=event.target instanceof Element?event.target:null;if(!t)return;
      if(t.closest('#rafexMain3DResumeOverlay'))return;
      if(t.closest('#m2LayoutSvg,#m2LayoutContent,.m2-floor-canvas,.m2-floor-canvas-wrap'))stop3D();
    },true);
    document.addEventListener('click',(event)=>{
      const t=event.target instanceof Element?event.target:null;if(!t)return;
      if(t.closest('#rafexMain3DResumeOverlay'))return;
      if(t.closest('.m2-floor-tools button,.m2-floor-head-actions button,#m2SavedTypesPanel button,#m2LayoutSvg'))stop3D();
    },true);
  })();</script>`;
  const bodyEnd=html.lastIndexOf('</body>');
  if(bodyEnd<0)throw new Error('body kapanisi bulunamadi.');
  html=html.slice(0,bodyEnd)+runtime+html.slice(bodyEnd);
}

const direct=[
  ['function m2AddRack(drawing = null, typeName = null) {','function m2AddRack(drawing = null, typeName = null) { try{window.rafexStopMain3DForFreeLayout?.();}catch{}'],
  ['function m2DuplicateRack() {','function m2DuplicateRack() { try{window.rafexStopMain3DForFreeLayout?.();}catch{}'],
  ['function m2OpenCustomizeModal(rackId){','function m2OpenCustomizeModal(rackId){try{window.rafexStopMain3DForFreeLayout?.();}catch{}']
];
for(const [from,to] of direct){if(html.includes(from)&&!html.includes(to))html=html.replace(from,to);}

if(!html.includes(marker)||!html.includes('rafexResumeMain3D'))throw new Error('Hard 3D stop/resume runtime eklenemedi.');
const encoded=Buffer.from(html,'utf8').toString('base64');
worker=worker.slice(0,match.index)+match[1]+match[2]+encoded+match[2]+worker.slice(match.index+match[0].length);
fs.writeFileSync(p,worker);
console.log('FINAL: Serbest yerlesim ana 3D hard-stop v3 + yenile butonu uygulandi.');
