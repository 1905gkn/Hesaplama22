import fs from "node:fs";
import path from "node:path";

const p=path.join(process.cwd(),"dist/server/index.js");
let worker=fs.readFileSync(p,"utf8");
const match=worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if(!match)throw new Error("HTML_BASE64 bulunamadi.");
let html=Buffer.from(match[3],"base64").toString("utf8");

const marker='data-rafex-free-layout-stop3d-hard="v2"';
if(!html.includes(marker)){
  const runtime=`<script ${marker}>(function(){
    if(window.__rafexFreeLayoutStop3DHardV2)return;window.__rafexFreeLayoutStop3DHardV2=true;
    window.__rafexFreeLayout3DStopped=false;

    function guardViewer(){
      const viewer=window.RafexB2BViewer;if(!viewer||viewer.__rafexMain3DGuardV2)return;
      viewer.__rafexMain3DGuardV2=true;
      const mount=viewer.mount?.bind(viewer);
      if(mount){viewer.mount=function(canvas,options){if(window.__rafexFreeLayout3DStopped&&canvas?.id==='b2bMain3DCanvas')return;return mount(canvas,options);};}
    }

    function stop3D(){
      window.__rafexFreeLayout3DStopped=true;
      guardViewer();
      try{window.RafexB2BViewer?.setAutoRotate?.(false);}catch{}
      try{window.RafexB2BViewer?.destroy?.();}catch{}
      const canvas=document.getElementById('b2bMain3DCanvas');if(canvas){canvas.width=1;canvas.height=1;canvas.style.visibility='hidden';}
      const loading=document.getElementById('b2b3DLoading');if(loading)loading.hidden=true;
    }
    window.rafexStopMain3DForFreeLayout=stop3D;
    guardViewer();
    window.addEventListener('rafex-b2b-viewer-ready',guardViewer);

    document.addEventListener('pointerdown',(event)=>{
      const t=event.target instanceof Element?event.target:null;if(!t)return;
      if(t.closest('#m2LayoutSvg,#m2LayoutContent,.m2-floor-canvas,.m2-floor-canvas-wrap'))stop3D();
    },true);
    document.addEventListener('click',(event)=>{
      const t=event.target instanceof Element?event.target:null;if(!t)return;
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

if(!html.includes(marker))throw new Error('Hard 3D stop runtime eklenemedi.');
const encoded=Buffer.from(html,'utf8').toString('base64');
worker=worker.slice(0,match.index)+match[1]+match[2]+encoded+match[2]+worker.slice(match.index+match[0].length);
fs.writeFileSync(p,worker);
console.log('FINAL: Serbest yerlesim ana 3D hard-stop v2 uygulandi.');
