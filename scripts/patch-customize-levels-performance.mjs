import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("HTML_BASE64 build ciktisinda bulunamadi.");
let html = Buffer.from(match[3], "base64").toString("utf8");

const marker = 'data-rafex-customize-levels-performance="v1"';
if (!html.includes(marker)) {
  const runtime = `<style data-rafex-customize-levels-performance-style="v1">
#m2CustomizeModal .m2-customize-dialog{contain:layout paint style}
#m2CustomizeModal canvas{image-rendering:auto}
</style><script ${marker}>(function(){
  if(window.__rafexCustomizeLevelsPerformanceV1)return;
  window.__rafexCustomizeLevelsPerformanceV1=true;
  const byId=(id)=>document.getElementById(id);
  let activeRackId=null;
  let previewTimer=null;
  let viewerTimer=null;
  let viewerPending=null;
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

  const originalOpen=window.m2OpenCustomizeModal;
  if(typeof originalOpen==='function'&&!originalOpen.__rafexLevelsPerfV1){
    const wrapped=function(rackId){
      activeRackId=Number(rackId)||null;
      const result=originalOpen.apply(this,arguments);
      requestAnimationFrame(postRender);
      return result;
    };
    wrapped.__rafexLevelsPerfV1=true;
    window.m2OpenCustomizeModal=wrapped;
  }

  const originalRender=window.m2RenderCustomizeRackAccessories;
  if(typeof originalRender==='function'&&!originalRender.__rafexLevelsPerfV1){
    const wrapped=function(){const result=originalRender.apply(this,arguments);postRender();return result;};
    wrapped.__rafexLevelsPerfV1=true;
    window.m2RenderCustomizeRackAccessories=wrapped;
  }

  const originalCollect=window.m2CollectCustomizeRackAccessories;
  if(typeof originalCollect==='function'&&!originalCollect.__rafexLevelsPerfV1){
    const wrapped=function(){
      const items=originalCollect.apply(this,arguments);
      if(!hideK1()||!Array.isArray(items))return items;
      return items.map((item)=>({...item,levels:Array.isArray(item?.levels)?item.levels.filter((level)=>Number(level)!==1):[]}));
    };
    wrapped.__rafexLevelsPerfV1=true;
    window.m2CollectCustomizeRackAccessories=wrapped;
  }

  const originalToggle=window.m2ToggleCustomizeRackAccessoryLevel;
  if(typeof originalToggle==='function'&&!originalToggle.__rafexLevelsPerfV1){
    const wrapped=function(type,level){
      if(hideK1()&&Number(level)===1)return;
      const key=String(type)+':'+String(level),now=Date.now();
      if(lastLevelToggle.key===key&&now-lastLevelToggle.time<420)return;
      lastLevelToggle={key,time:now};
      const result=originalToggle.apply(this,arguments);
      postRender();
      return result;
    };
    wrapped.__rafexLevelsPerfV1=true;
    window.m2ToggleCustomizeRackAccessoryLevel=wrapped;
  }

  const originalAll=window.m2AllCustomizeRackAccessoryLevels;
  if(typeof originalAll==='function'&&!originalAll.__rafexLevelsPerfV1){
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
    wrapped.__rafexLevelsPerfV1=true;
    window.m2AllCustomizeRackAccessoryLevels=wrapped;
  }

  const originalApply=window.m2ApplyRackCustomization;
  if(typeof originalApply==='function'&&!originalApply.__rafexLevelsPerfV1){
    const wrapped=function(){
      const rack=activeRack();
      try{
        if(rack){
          rack.b2b={...(rack.b2b||{})};
          if(typeof window.m2CollectCustomizeRackAccessories==='function')rack.b2b.accessories=window.m2CollectCustomizeRackAccessories();
        }
      }catch{}
      const result=originalApply.apply(this,arguments);
      try{
        if(rack&&typeof window.m2CollectCustomizeRackAccessories==='function')rack.b2b.accessories=window.m2CollectCustomizeRackAccessories();
      }catch{}
      return result;
    };
    wrapped.__rafexLevelsPerfV1=true;
    window.m2ApplyRackCustomization=wrapped;
  }

  const originalPreview=window.m2PreviewRackCustomization;
  if(typeof originalPreview==='function'&&!originalPreview.__rafexLevelsPerfV1){
    const wrapped=function(){
      const args=arguments,ctx=this;
      if(previewTimer)clearTimeout(previewTimer);
      previewTimer=setTimeout(()=>{previewTimer=null;try{originalPreview.apply(ctx,args);}catch{}},70);
    };
    wrapped.__rafexLevelsPerfV1=true;
    window.m2PreviewRackCustomization=wrapped;
  }

  function installViewerOptimization(){
    const api=window.RafexB2BViewer;
    if(!api||api.__rafexCustomizePerfV1)return false;
    api.__rafexCustomizePerfV1=true;
    const originalMount=api.mount?.bind(api);
    const originalUpdate=api.update?.bind(api);
    const originalDestroy=api.destroy?.bind(api);
    if(originalMount)api.mount=function(canvas,options){
      const viewer=originalMount(canvas,options);
      if(canvas?.id==='m2CustomizeCanvas'){
        try{viewer?.renderer?.setPixelRatio?.(1);if(viewer?.renderer?.shadowMap)viewer.renderer.shadowMap.enabled=false;viewer?.onResize?.();}catch{}
      }
      return viewer;
    };
    if(originalUpdate)api.update=function(options){
      const modal=byId('m2CustomizeModal');
      if(!modal||modal.hidden)return originalUpdate(options);
      viewerPending={...(viewerPending||{}),...(options||{})};
      if(viewerTimer)clearTimeout(viewerTimer);
      viewerTimer=setTimeout(()=>{const next=viewerPending;viewerPending=null;viewerTimer=null;try{originalUpdate(next);}catch{}},95);
    };
    if(originalDestroy)api.destroy=function(){
      if(viewerTimer){clearTimeout(viewerTimer);viewerTimer=null;viewerPending=null;}
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

if(!html.includes(marker)||!html.includes('__rafexCustomizeLevelsPerformanceV1'))throw new Error('Ozellestir kat/performance patch eklenemedi.');
const encoded=Buffer.from(html,'utf8').toString('base64');
worker=worker.slice(0,match.index)+match[1]+match[2]+encoded+match[2]+worker.slice(match.index+match[0].length);
fs.writeFileSync(workerPath,worker);
console.log('Ozellestir kat secimi ve performans patch v1 uygulandi.');
