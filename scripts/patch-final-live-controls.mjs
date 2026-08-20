import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const workerPath=path.join(root,"dist/server/index.js");
const portalPath=path.join(root,"portal.html");
let worker=fs.readFileSync(workerPath,"utf8");
const match=worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if(!match)throw new Error("FINAL: HTML_BASE64 bulunamadi.");
let html=Buffer.from(match[3],"base64").toString("utf8");
const source=fs.readFileSync(portalPath,"utf8");

const betweenButton='<button type="button" id="m2BetweenMeasureButton" onclick="m2ToggleBetweenMeasure()">Arası Ölç</button>';
if(!html.includes('id="m2BetweenMeasureButton"')){
  const measureButton='<button type="button" id="m2MeasureToolButton" onclick="m2ToggleMeasureTool()">Mesafe Ölç</button>';
  if(!html.includes(measureButton))throw new Error("FINAL: Mesafe Olc butonu bulunamadi.");
  html=html.replace(measureButton,measureButton+betweenButton);
}
if(!html.includes('data-rafex-between-measure-source="v2"')){
  const runtimeMatch=source.match(/<style data-rafex-between-measure-source-style="v2">[\s\S]*?<\/script>/);
  if(!runtimeMatch)throw new Error("FINAL: Arasi Olc runtime source'ta bulunamadi.");
  const bodyEnd=html.lastIndexOf('</body>');
  if(bodyEnd<0)throw new Error("FINAL: body kapanisi bulunamadi.");
  html=html.slice(0,bodyEnd)+runtimeMatch[0]+html.slice(bodyEnd);
}

// Remove the old pointerdown duplicate path.
html=html.replace(/\n\s*document\.addEventListener\('pointerdown',function\(event\)\{[\s\S]*?m2ToggleCustomizeRackAccessoryLevel\(type,level\);\s*\},true\);/g,'\n');

// Do not let the legacy delegated click toggle level buttons a second time.
const delegated="if(levelButton){event.preventDefault();event.stopPropagation();const level=Number((levelButton.textContent||'').replace(/\\D/g,''));if(level)window.m2ToggleCustomizeRackAccessoryLevel(type,level);return;}";
if(html.includes(delegated))html=html.replaceAll(delegated,"if(levelButton){return;}");

// Give every rendered level an explicit level id. The final capture handler below
// is the single authority for K1/K2/... clicks, so inline onclick is intentionally omitted.
const levelRender="const levels=Array.from({length:count},(_,i)=>i+1).map((level)=>'<button type=\"button\" class=\"'+(selected.has(level)?'active':'')+'\">K'+level+'</button>').join('');";
const levelRenderFixed="const levels=Array.from({length:count},(_,i)=>i+1).map((level)=>'<button type=\"button\" data-level=\"'+level+'\" class=\"'+(selected.has(level)?'active':'')+'\">K'+level+'</button>').join('');";
if(html.includes(levelRender))html=html.replaceAll(levelRender,levelRenderFixed);

const finalMarker='data-rafex-final-live-controls="v2"';
if(!html.includes(finalMarker)){
  const runtime=`<style ${finalMarker}>#m2CustomizeAccessories .m2-customize-accessory-levels button{pointer-events:auto!important;position:relative;z-index:2;touch-action:manipulation}#m2CustomizeAccessories .m2-customize-accessory-levels button[hidden]{display:none!important}</style><script ${finalMarker}>(function(){
    if(window.__rafexFinalLiveControlsV2)return;window.__rafexFinalLiveControlsV2=true;
    const activeRack=()=>{try{const id=Number(typeof m2CustomizeRackId!=='undefined'?m2CustomizeRackId:0);const racks=(typeof m2LayoutState!=='undefined'&&Array.isArray(m2LayoutState?.racks))?m2LayoutState.racks:[];return racks.find(r=>Number(r?.id)===id)||null}catch{return null}};
    const isGround=()=>String(activeRack()?.b2b?.firstPalletPosition||'ground').toLowerCase()==='ground';
    const applyGroundK1=()=>{const host=document.getElementById('m2CustomizeAccessories');if(!host)return;host.querySelectorAll('.m2-customize-accessory-card').forEach(card=>{const type=card.dataset.accessoryType||'';const hide=isGround()&&(type==='hTraverse'||type==='tray');card.querySelectorAll('.m2-customize-accessory-levels button').forEach(btn=>{const level=Number(btn.dataset.level||String(btn.textContent||'').replace(/\\D/g,''));if(level===1)btn.hidden=hide;});});};
    const render=window.m2RenderCustomizeRackAccessories;if(typeof render==='function'&&!render.__rafexFinalGroundK1){window.m2RenderCustomizeRackAccessories=function(){const out=render.apply(this,arguments);applyGroundK1();return out};window.m2RenderCustomizeRackAccessories.__rafexFinalGroundK1=true;}
    const collect=window.m2CollectCustomizeRackAccessories;if(typeof collect==='function'&&!collect.__rafexFinalGroundK1){window.m2CollectCustomizeRackAccessories=function(){const items=collect.apply(this,arguments);if(!isGround()||!Array.isArray(items))return items;return items.map(item=>(item?.type==='hTraverse'||item?.type==='tray')?{...item,levels:Array.isArray(item.levels)?item.levels.filter(n=>Number(n)!==1):[]} : item)};window.m2CollectCustomizeRackAccessories.__rafexFinalGroundK1=true;}
    document.addEventListener('click',(event)=>{const target=event.target instanceof Element?event.target:null;const button=target?.closest?.('#m2CustomizeAccessories .m2-customize-accessory-levels button');if(!button)return;const card=button.closest('.m2-customize-accessory-card');const type=card?.dataset?.accessoryType||'';const level=Number(button.dataset.level||String(button.textContent||'').replace(/\\D/g,''));if(!type||!level||typeof window.m2ToggleCustomizeRackAccessoryLevel!=='function')return;event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();window.m2ToggleCustomizeRackAccessoryLevel(type,level);requestAnimationFrame(applyGroundK1);},true);
    requestAnimationFrame(applyGroundK1);
  })();</script>`;
  const bodyEnd=html.lastIndexOf('</body>');
  if(bodyEnd<0)throw new Error("FINAL: body kapanisi bulunamadi (controls).");
  html=html.slice(0,bodyEnd)+runtime+html.slice(bodyEnd);
}

if(!html.includes('id="m2BetweenMeasureButton"'))throw new Error("FINAL: Arasi Olc butonu final HTML'de yok.");
if(!html.includes('data-rafex-between-measure-source="v2"'))throw new Error("FINAL: Arasi Olc runtime final HTML'de yok.");
if(!html.includes('data-level="'))throw new Error("FINAL: Kat butonlarina tekil data-level eklenemedi.");
if(/document\.addEventListener\('pointerdown',function\(event\)\{[\s\S]*?m2-customize-accessory-levels button/.test(html))throw new Error("FINAL: Eski aksesuar pointerdown handler hala var.");
if(!html.includes(finalMarker)||!html.includes('__rafexFinalLiveControlsV2'))throw new Error("FINAL: Tekil aksesuar tiklama runtime eklenemedi.");

const encoded=Buffer.from(html,"utf8").toString("base64");
worker=worker.slice(0,match.index)+match[1]+match[2]+encoded+match[2]+worker.slice(match.index+match[0].length);
fs.writeFileSync(workerPath,worker);
console.log("FINAL LIVE: Arasi Olc + tek event aksesuar kat tiklama + Zemin K1 kurali uygulandi.");
