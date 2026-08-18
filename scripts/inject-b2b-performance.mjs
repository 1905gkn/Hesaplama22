import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const workerPath = path.join(root, "dist/server/index.js");
const marker = 'data-rafex-b2b-performance="v1"';
const scriptPattern = /<script\s+data-rafex-b2b-performance=(?:\\["']|["'])v\d+(?:\\["']|["'])[^>]*>[\s\S]*?<\/script>/gi;

let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("HTML_BASE64 build çıktısında bulunamadı.");
let html = Buffer.from(match[3], "base64").toString("utf8");
html = html.replace(scriptPattern, "");

const performanceScript = String.raw`<script ${marker}>(function(){
  if(window.__rafexB2BPerformanceV1)return;window.__rafexB2BPerformanceV1=true;

  function collectSharedResources(viewer){
    const geometries=new Set(),materials=new Set();
    try{
      Object.values(viewer.models||{}).forEach((root)=>root?.traverse?.((object)=>{
        if(object.geometry)geometries.add(object.geometry);
        const list=Array.isArray(object.material)?object.material:[object.material];
        list.filter(Boolean).forEach((material)=>materials.add(material));
      }));
    }catch{}
    return{geometries,materials};
  }

  function disposeContent(viewer){
    const content=viewer?.content;if(!content)return;
    const shared=collectSharedResources(viewer),seenGeometry=new Set(),seenMaterial=new Set(),seenTexture=new Set();
    try{
      content.traverse((object)=>{
        const geometry=object.geometry;
        if(geometry&&!shared.geometries.has(geometry)&&!seenGeometry.has(geometry)){
          seenGeometry.add(geometry);try{geometry.dispose?.();}catch{}
        }
        const list=Array.isArray(object.material)?object.material:[object.material];
        list.filter(Boolean).forEach((material)=>{
          if(shared.materials.has(material)||seenMaterial.has(material))return;
          seenMaterial.add(material);
          const texture=material.map;
          if(texture?.isCanvasTexture&&!seenTexture.has(texture)){seenTexture.add(texture);try{texture.dispose?.();}catch{}}
          try{material.dispose?.();}catch{}
        });
      });
    }catch(error){console.warn("B2B eski 3D kaynakları temizlenemedi",error);}
  }

  function optimizeViewer(viewer){
    if(!viewer||viewer.__rafexPerformanceOptimized)return viewer;
    viewer.__rafexPerformanceOptimized=true;
    const main=viewer.canvas?.id==="b2bMain3DCanvas";

    if(main){
      try{viewer.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));viewer.onResize?.();}catch{}
      try{
        viewer.renderer.shadowMap.autoUpdate=false;
        viewer.renderer.shadowMap.needsUpdate=true;
      }catch{}
    }

    const originalUpdate=viewer.update?.bind(viewer);
    if(originalUpdate)viewer.update=function(next,initial){
      disposeContent(viewer);
      const result=originalUpdate(next,initial);
      try{if(main)viewer.renderer.shadowMap.needsUpdate=true;}catch{}
      viewer.__rafexForceRenderUntil=performance.now()+220;
      return result;
    };

    const originalDestroy=viewer.destroy?.bind(viewer);
    if(originalDestroy)viewer.destroy=function(){
      disposeContent(viewer);
      try{viewer.ground?.geometry?.dispose?.();viewer.ground?.material?.dispose?.();}catch{}
      return originalDestroy();
    };

    viewer.__rafexInteracting=false;
    viewer.__rafexLastRender=0;
    viewer.__rafexForceRenderUntil=performance.now()+500;
    try{
      viewer.controls?.addEventListener?.("start",()=>{viewer.__rafexInteracting=true;viewer.__rafexForceRenderUntil=performance.now()+500;});
      viewer.controls?.addEventListener?.("end",()=>{viewer.__rafexInteracting=false;viewer.__rafexForceRenderUntil=performance.now()+350;});
      viewer.controls?.addEventListener?.("change",()=>{viewer.__rafexForceRenderUntil=performance.now()+180;});
    }catch{}

    viewer.animate=function(now){
      if(viewer.destroyed)return;
      requestAnimationFrame(viewer.animate);
      if(document.hidden)return;
      const active=viewer.__rafexInteracting||viewer.controls?.autoRotate||now<viewer.__rafexForceRenderUntil;
      const interval=active?33:160;
      if(now-viewer.__rafexLastRender<interval)return;
      viewer.__rafexLastRender=now;
      try{viewer.controls?.update?.();}catch{}
      try{
        (viewer.dimensionLabels||[]).forEach((object)=>{
          object.getWorldPosition(viewer.dimensionWorldPosition);
          const distance=viewer.camera.position.distanceTo(viewer.dimensionWorldPosition);
          const ratio=Math.max(1,Math.min(2.65,distance/12000));
          const base=object.userData?.baseScale;if(base)object.scale.set(base.x*ratio,base.y*ratio,1);
        });
      }catch{}
      try{viewer.renderer.render(viewer.scene,viewer.camera);}catch{}
    }.bind(viewer);
    return viewer;
  }

  function install(){
    const api=window.RafexB2BViewer;if(!api||api.__rafexPerformanceWrapped)return false;
    api.__rafexPerformanceWrapped=true;
    let activeViewer=null,pendingUpdate=null,updateTimer=null;
    const originalMount=api.mount.bind(api),originalUpdate=api.update.bind(api),originalDestroy=api.destroy.bind(api);

    api.mount=function(canvas,options){
      if(updateTimer){clearTimeout(updateTimer);updateTimer=null;pendingUpdate=null;}
      activeViewer=optimizeViewer(originalMount(canvas,options));
      return activeViewer;
    };
    api.update=function(options){
      if(activeViewer?.canvas?.id!=="b2bMain3DCanvas")return originalUpdate(options);
      pendingUpdate={...(pendingUpdate||{}),...(options||{})};
      if(updateTimer)clearTimeout(updateTimer);
      updateTimer=setTimeout(()=>{const next=pendingUpdate;pendingUpdate=null;updateTimer=null;originalUpdate(next);},45);
    };
    api.destroy=function(){
      if(updateTimer){clearTimeout(updateTimer);updateTimer=null;pendingUpdate=null;}
      activeViewer=null;return originalDestroy();
    };
    return true;
  }

  if(!install())window.addEventListener("rafex-b2b-viewer-ready",install,{once:true});
})();</script>`;

const bodyEnd=html.lastIndexOf("</body>");
if(bodyEnd<0)throw new Error("Portal </body> kapanışı bulunamadı.");
html=`${html.slice(0,bodyEnd)}${performanceScript}${html.slice(bodyEnd)}`;

if(!html.includes(marker)||!html.includes("shadowMap.autoUpdate=false")||!html.includes("disposeContent(viewer)"))throw new Error("B2B performans optimizasyonu build çıktısına eklenemedi.");
const encoded=Buffer.from(html,"utf8").toString("base64");
worker=worker.slice(0,match.index)+match[1]+match[2]+encoded+match[2]+worker.slice(match.index+match[0].length);
fs.writeFileSync(workerPath,worker);
