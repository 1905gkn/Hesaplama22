import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("HTML_BASE64 build ciktisinda bulunamadi.");
let html = Buffer.from(match[3], "base64").toString("utf8");

const marker = 'data-rafex-customize-levels-performance="v2"';
if (!html.includes(marker)) {
  const runtime = `<style data-rafex-customize-levels-performance-style="v2">
#m2CustomizeModal .m2-customize-dialog{contain:layout paint style}
#m2CustomizeModal .m2-customize-preview{contain:layout paint style}
#m2CustomizeModal canvas{image-rendering:auto}
</style><script ${marker}>(function(){
  if(window.__rafexCustomizeLevelsPerformanceV2)return;
  window.__rafexCustomizeLevelsPerformanceV2=true;
  const byId=(id)=>document.getElementById(id);
  let activeRackId=null;
  let previewTimer=null;
  let previewPending=false;
  let lastPreviewSnapshot='';
  let viewerTimer=null;
  let viewerPending=null;
  let viewerLastKey='';
  let viewer=null;
  let lastLevelToggle={key:'',time:0};

  function activeRack(){
    try{
      const id=Number(activeRackId||m2CustomizeRackId||0);
      return Array.isArray(m2LayoutState?.racks)?m2LayoutState.racks.find((item)=>Number(item?.id)===id):null;
    }catch{return null;}
  }
  function hideK1(){
    const rack=activeRack();
    const pos=String(rack?.b2b?.firstPalletPosition||'').toLowerCase();
    return !!pos&&pos!=='ground';
  }
  function postRender(){
    const host=byId('m2CustomizeAccessories');
    if(!host)return;
    const hidden=hideK1();
    host.querySelectorAll('.m2-customize-accessory-levels button').forEach((button)=>{
      const level=Number((button.textContent||'').replace(/\\D/g,''));
      if(level===1)button.hidden=hidden;
    });
  }
  function previewSnapshot(){
    const ids=['m2CustomizePalletCount','m2CustomizeLevels','m2CustomizePalletHeight','m2CustomizeRowType','m2CustomizeRowGap','m2CustomizeManualLevels','m2CustomizeTunnel','m2CustomizeTunnelHeight'];
    const values=ids.map((id)=>{const el=byId(id);return el?.type==='checkbox'?!!el.checked:String(el?.value??'');});
    try{values.push(JSON.stringify(window.m2CollectCustomizeRackAccessories?.()||[]));}catch{values.push('[]');}
    try{values.push(String(window.m2CustomizePalletsVisible?.()!==false));}catch{values.push('true');}
    return JSON.stringify(values);
  }

  const originalOpen=window.m2OpenCustomizeModal;
  if(typeof originalOpen==='function'&&!originalOpen.__rafexLevelsPerfV2){
    const wrapped=function(rackId){
      activeRackId=Number(rackId)||null;
      lastPreviewSnapshot='';
      const result=originalOpen.apply(this,arguments);
      requestAnimationFrame(postRender);
      return result;
    };
    wrapped.__rafexLevelsPerfV2=true;
    window.m2OpenCustomizeModal=wrapped;
  }

  const originalRender=window.m2RenderCustomizeRackAccessories;
  if(typeof originalRender==='function'&&!originalRender.__rafexLevelsPerfV2){
    let rendering=false;
    const wrapped=function(){
      if(rendering)return;
      rendering=true;
      try{return originalRender.apply(this,arguments);}finally{rendering=false;postRender();}
    };
    wrapped.__rafexLevelsPerfV2=true;
    window.m2RenderCustomizeRackAccessories=wrapped;
  }

  const originalCollect=window.m2CollectCustomizeRackAccessories;
  if(typeof originalCollect==='function'&&!originalCollect.__rafexLevelsPerfV2){
    const wrapped=function(){
      const items=originalCollect.apply(this,arguments);
      if(!hideK1()||!Array.isArray(items))return items;
      return items.map((item)=>({...item,levels:Array.isArray(item?.levels)?item.levels.filter((level)=>Number(level)!==1):[]}));
    };
    wrapped.__rafexLevelsPerfV2=true;
    window.m2CollectCustomizeRackAccessories=wrapped;
  }

  const originalToggle=window.m2ToggleCustomizeRackAccessoryLevel;
  if(typeof originalToggle==='function'&&!originalToggle.__rafexLevelsPerfV2){
    const wrapped=function(type,level){
      if(hideK1()&&Number(level)===1)return;
      const key=String(type)+':'+String(level),now=Date.now();
      if(lastLevelToggle.key===key&&now-lastLevelToggle.time<300)return;
      lastLevelToggle={key,time:now};
      const result=originalToggle.apply(this,arguments);
      postRender();
      return result;
    };
    wrapped.__rafexLevelsPerfV2=true;
    window.m2ToggleCustomizeRackAccessoryLevel=wrapped;
  }

  const originalAll=window.m2AllCustomizeRackAccessoryLevels;
  if(typeof originalAll==='function'&&!originalAll.__rafexLevelsPerfV2){
    const wrapped=function(type){
      const result=originalAll.apply(this,arguments);
      if(hideK1()){
        try{
          const item=(window.m2CollectCustomizeRackAccessories?.()||[]).find((entry)=>entry?.type===type);
          if(item?.levels?.includes?.(1))window.m2ToggleCustomizeRackAccessoryLevel(type,1);
        }catch{}
      }
      postRender();
      return result;
    };
    wrapped.__rafexLevelsPerfV2=true;
    window.m2AllCustomizeRackAccessoryLevels=wrapped;
  }

  const originalApply=window.m2ApplyRackCustomization;
  if(typeof originalApply==='function'&&!originalApply.__rafexLevelsPerfV2){
    const wrapped=function(){
      const rack=activeRack();
      try{
        if(rack){
          rack.b2b={...(rack.b2b||{})};
          if(typeof window.m2CollectCustomizeRackAccessories==='function')rack.b2b.accessories=window.m2CollectCustomizeRackAccessories();
        }
      }catch{}
      const result=originalApply.apply(this,arguments);
      try{if(rack&&typeof window.m2CollectCustomizeRackAccessories==='function')rack.b2b.accessories=window.m2CollectCustomizeRackAccessories();}catch{}
      return result;
    };
    wrapped.__rafexLevelsPerfV2=true;
    window.m2ApplyRackCustomization=wrapped;
  }

  const originalPreview=window.m2PreviewRackCustomization;
  if(typeof originalPreview==='function'&&!originalPreview.__rafexLevelsPerfV2){
    const wrapped=function(){
      const ctx=this,args=arguments;
      previewPending=true;
      if(previewTimer)clearTimeout(previewTimer);
      previewTimer=setTimeout(()=>{
        previewTimer=null;
        if(!previewPending)return;
        previewPending=false;
        const snapshot=previewSnapshot();
        if(snapshot===lastPreviewSnapshot)return;
        lastPreviewSnapshot=snapshot;
        try{originalPreview.apply(ctx,args);}catch(error){console.warn('Ozellestir preview',error);}
      },140);
    };
    wrapped.__rafexLevelsPerfV2=true;
    window.m2PreviewRackCustomization=wrapped;
  }

  function optimizeViewer(instance,canvas){
    if(!instance||instance.__rafexPerfV2)return instance;
    instance.__rafexPerfV2=true;
    viewer=instance;
    const customize=canvas?.id==='m2CustomizeCanvas';
    try{
      instance.renderer?.setPixelRatio?.(customize?1:Math.min(window.devicePixelRatio||1,1.25));
      if(instance.renderer?.shadowMap){instance.renderer.shadowMap.enabled=false;instance.renderer.shadowMap.autoUpdate=false;}
      instance.onResize?.();
    }catch{}
    instance.__rafexInteracting=false;
    instance.__rafexLastRender=0;
    instance.__rafexForceRenderUntil=performance.now()+450;
    try{
      instance.controls?.addEventListener?.('start',()=>{instance.__rafexInteracting=true;instance.__rafexForceRenderUntil=performance.now()+450;});
      instance.controls?.addEventListener?.('end',()=>{instance.__rafexInteracting=false;instance.__rafexForceRenderUntil=performance.now()+260;});
      instance.controls?.addEventListener?.('change',()=>{instance.__rafexForceRenderUntil=performance.now()+180;});
    }catch{}
    instance.animate=function(now){
      if(instance.destroyed)return;
      requestAnimationFrame(instance.animate);
      if(document.hidden)return;
      const active=instance.__rafexInteracting||instance.controls?.autoRotate||now<instance.__rafexForceRenderUntil;
      const interval=active?33:500;
      if(now-instance.__rafexLastRender<interval)return;
      instance.__rafexLastRender=now;
      try{instance.controls?.update?.();}catch{}
      try{instance.renderer?.render?.(instance.scene,instance.camera);}catch{}
    }.bind(instance);
    return instance;
  }

  function stableKey(value){
    try{return JSON.stringify(value,(key,val)=>typeof val==='number'?Math.round(val*1000)/1000:val);}catch{return String(Date.now());}
  }
  function installViewerOptimization(){
    const api=window.RafexB2BViewer;
    if(!api||api.__rafexPerformanceV2)return false;
    api.__rafexPerformanceV2=true;
    const originalMount=api.mount?.bind(api);
    const originalUpdate=api.update?.bind(api);
    const originalDestroy=api.destroy?.bind(api);
    if(originalMount)api.mount=function(canvas,options){
      if(viewerTimer){clearTimeout(viewerTimer);viewerTimer=null;viewerPending=null;}
      viewerLastKey=stableKey(options||{});
      return optimizeViewer(originalMount(canvas,options),canvas);
    };
    if(originalUpdate)api.update=function(options){
      const next={...(viewerPending||{}),...(options||{})};
      const key=stableKey(next);
      if(!viewerPending&&key===viewerLastKey)return;
      viewerPending=next;
      if(viewerTimer)clearTimeout(viewerTimer);
      const customize=viewer?.canvas?.id==='m2CustomizeCanvas';
      viewerTimer=setTimeout(()=>{
        const pending=viewerPending;viewerPending=null;viewerTimer=null;
        const pendingKey=stableKey(pending||{});
        if(pendingKey===viewerLastKey)return;
        viewerLastKey=pendingKey;
        const accessoryOnly=pending&&Object.keys(pending).every((key)=>key==='accessories'||key==='showPallets');
        let restoreFit=null;
        if(accessoryOnly&&viewer&&typeof viewer.fitCamera==='function'){
          restoreFit=viewer.fitCamera;viewer.fitCamera=function(){};
        }
        try{originalUpdate(pending);}catch(error){console.warn('B2B update',error);}finally{if(restoreFit)viewer.fitCamera=restoreFit;}
        if(viewer)viewer.__rafexForceRenderUntil=performance.now()+260;
      },customize?150:90);
    };
    if(originalDestroy)api.destroy=function(){
      if(viewerTimer){clearTimeout(viewerTimer);viewerTimer=null;viewerPending=null;}
      viewer=null;viewerLastKey='';
      return originalDestroy();
    };
    return true;
  }
  if(!installViewerOptimization())window.addEventListener('rafex-b2b-viewer-ready',installViewerOptimization,{once:true});

  document.addEventListener('change',(event)=>{
    if(event.target?.id==='m2CustomizeLevels'||event.target?.id==='m2CustomizeManualLevels')requestAnimationFrame(postRender);
  },true);
  requestAnimationFrame(postRender);
})();</script>`;
  const bodyEnd=html.lastIndexOf('</body>');
  if(bodyEnd<0)throw new Error('Portal </body> bulunamadi.');
  html=html.slice(0,bodyEnd)+runtime+html.slice(bodyEnd);
}

if(!html.includes(marker)||!html.includes('__rafexCustomizeLevelsPerformanceV2'))throw new Error('Ozellestir/performance v2 patch eklenemedi.');
const encoded=Buffer.from(html,'utf8').toString('base64');
worker=worker.slice(0,match.index)+match[1]+match[2]+encoded+match[2]+worker.slice(match.index+match[0].length);
fs.writeFileSync(workerPath,worker);
console.log('Rafex interactive 3D performance v2 uygulandi.');
