import fs from "node:fs";
import path from "node:path";

const p=path.join(process.cwd(),"dist/server/index.js");
let worker=fs.readFileSync(p,"utf8");
const match=worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if(!match)throw new Error("HTML_BASE64 bulunamadi.");
let html=Buffer.from(match[3],"base64").toString("utf8");

const marker='data-rafex-free-layout-stop3d-hard="v4"';
if(!html.includes(marker)){
  const runtime=`<style ${marker}>
    #rafexMain3DResumeLauncher{position:fixed;right:22px;bottom:22px;z-index:9999;padding:11px 16px;border:0;border-radius:10px;background:#7f1623;color:#fff;font-weight:800;box-shadow:0 8px 24px #0003;cursor:pointer}
    #rafexMain3DResumeLauncher[hidden]{display:none!important}
  </style><script ${marker}>(function(){
    if(window.__rafexFreeLayoutStop3DHardV4)return;window.__rafexFreeLayoutStop3DHardV4=true;
    window.__rafexFreeLayout3DStopped=false;
    let hiddenPanel=null;

    function ensureLauncher(){
      let btn=document.getElementById('rafexMain3DResumeLauncher');
      if(!btn){
        btn=document.createElement('button');btn.type='button';btn.id='rafexMain3DResumeLauncher';btn.textContent='3D GÖRÜNÜMÜ AÇ';btn.hidden=true;
        btn.addEventListener('click',(event)=>{event.preventDefault();event.stopPropagation();resume3D();});
        document.body.appendChild(btn);
      }
      return btn;
    }

    function find3DPanel(){
      const canvas=document.getElementById('b2bMain3DCanvas');
      const host=canvas?.closest?.('.b2b-main-3d-canvas')||canvas?.parentElement||null;
      if(!host)return {canvas:null,host:null,panel:null};
      let panel=host.parentElement||host;
      const header=panel?.querySelector?.('header');
      if(!header||!/3D\s*Raf\s*Görünüşü/i.test(header.textContent||'')){
        const candidate=host.closest?.('.m2-view,.m2-drawing-view,.card,section');
        if(candidate&&/3D\s*Raf\s*Görünüşü/i.test(candidate.textContent||''))panel=candidate;
        else panel=host;
      }
      return {canvas,host,panel};
    }

    function guardViewer(){
      const viewer=window.RafexB2BViewer;if(!viewer||viewer.__rafexMain3DGuardV4)return;
      viewer.__rafexMain3DGuardV4=true;
      const mount=viewer.mount?.bind(viewer);
      if(mount){viewer.mount=function(canvas,options){if(window.__rafexFreeLayout3DStopped&&canvas?.id==='b2bMain3DCanvas')return;return mount(canvas,options);};}
    }

    function stop3D(){
      if(window.__rafexFreeLayout3DStopped){ensureLauncher().hidden=false;return;}
      window.__rafexFreeLayout3DStopped=true;
      guardViewer();
      try{window.RafexB2BViewer?.setAutoRotate?.(false);}catch{}
      try{window.RafexB2BViewer?.destroy?.();}catch{}
      const {canvas,panel}=find3DPanel();
      if(canvas)canvas.style.visibility='hidden';
      if(panel){hiddenPanel=panel;panel.style.display='none';panel.dataset.rafex3dStopped='1';}
      const loading=document.getElementById('b2b3DLoading');if(loading)loading.hidden=true;
      ensureLauncher().hidden=false;
    }

    function resume3D(){
      window.__rafexFreeLayout3DStopped=false;
      const btn=ensureLauncher();btn.hidden=true;
      if(hiddenPanel){hiddenPanel.style.display='';delete hiddenPanel.dataset.rafex3dStopped;}
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
    ensureLauncher();
    window.addEventListener('rafex-b2b-viewer-ready',guardViewer);

    document.addEventListener('pointerdown',(event)=>{
      const t=event.target instanceof Element?event.target:null;if(!t)return;
      if(t.closest('#rafexMain3DResumeLauncher'))return;
      if(t.closest('#m2LayoutSvg,#m2LayoutContent,.m2-floor-canvas,.m2-floor-canvas-wrap'))stop3D();
    },true);
    document.addEventListener('click',(event)=>{
      const t=event.target instanceof Element?event.target:null;if(!t)return;
      if(t.closest('#rafexMain3DResumeLauncher'))return;
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

if(!html.includes(marker)||!html.includes('rafexMain3DResumeLauncher'))throw new Error('Hard 3D stop/resume v4 runtime eklenemedi.');
const encoded=Buffer.from(html,'utf8').toString('base64');
worker=worker.slice(0,match.index)+match[1]+match[2]+encoded+match[2]+worker.slice(match.index+match[0].length);
fs.writeFileSync(p,worker);
console.log('FINAL: Serbest yerlesimde 3D panel gizleme + sabit geri ac butonu v4 uygulandi.');
