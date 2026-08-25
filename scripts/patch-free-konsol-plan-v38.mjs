import fs from 'node:fs';

const file='dist/server/index.js';
let source=fs.readFileSync(file,'utf8');
const match=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if(!match)throw new Error('HTML_BASE64 not found for Konsol free plan v38');
let html=Buffer.from(match[2],'base64').toString('utf8');
html=html
  .replace(/<style data-rafex-konsol-free-plan="v38">[\s\S]*?<\/style>/g,'')
  .replace(/<script data-rafex-konsol-free-plan="v38">[\s\S]*?<\/script>/g,'');

const runtime=String.raw`
<style data-rafex-konsol-free-plan="v38">
#m2LayoutContent [data-rack][data-rafex-konsol-plan="v38"] .rafex-konsol-plan-footprint{pointer-events:none}
</style>
<script data-rafex-konsol-free-plan="v38">
(()=>{
  if(window.__rafexKonsolFreePlanV38)return;window.__rafexKonsolFreePlanV38=true;
  const NS='http://www.w3.org/2000/svg';
  let raf=0,working=false;
  const text=(v)=>String(v==null?'':v).toLowerCase();
  const num=(...values)=>{for(const value of values){const n=Number(value);if(Number.isFinite(n)&&n>0)return n}return 0};
  const rackList=()=>{try{return Array.isArray(window.m2LayoutState?.racks)?window.m2LayoutState.racks:(Array.isArray(m2LayoutState?.racks)?m2LayoutState.racks:[])}catch{return[]}};
  const savedList=()=>{try{return Array.isArray(window.m2SavedRackTypes)?window.m2SavedRackTypes:(Array.isArray(m2SavedRackTypes)?m2SavedRackTypes:[])}catch{return[]}};
  function savedFor(rack){
    const typeName=text(rack?.typeName||rack?.name||rack?.drawing?.name);
    if(!typeName)return null;
    return savedList().find((entry)=>text(entry?.name)===typeName)||null;
  }
  function token(rack,node){
    const saved=savedFor(rack),d=rack?.drawing||saved?.drawing||{},k=d?.konsol||rack?.konsol||{};
    return [rack?.rafexSystem,rack?.systemType,rack?.system,rack?.kind,rack?.type,rack?.typeName,rack?.name,d?.rafexSystem,d?.systemType,d?.system,k?.system,saved?.__rafexSystem,saved?.__rafexSystemLabel,node?.dataset?.system,node?.getAttribute?.('aria-label')].map(text).join(' ');
  }
  function cantileverFields(rack){
    const saved=savedFor(rack),d=rack?.drawing||saved?.drawing||{},k=d?.konsol||rack?.konsol||{},s=rack?.spec||{};
    return Boolean(num(rack?.armLength,rack?.armDepth,rack?.baseDepth,s?.arm,s?.armLength,d?.armLength,d?.armDepth,d?.baseDepth,k?.armLength,k?.armDepth,k?.baseDepth));
  }
  function isKonsol(rack,node){
    const t=token(rack,node);
    if(/konsol|cantilever/.test(t))return true;
    if(cantileverFields(rack))return true;
    return false;
  }
  function sideOf(rack){
    const saved=savedFor(rack),d=rack?.drawing||saved?.drawing||{},k=d?.konsol||rack?.konsol||{},s=rack?.spec||{};
    const side=text(rack?.side||s?.side||d?.side||k?.side);
    return rack?.doubleSided||s?.doubleSided||d?.doubleSided||k?.doubleSided||/double|çift|cift/.test(side)?'double':'single';
  }
  function countOf(rack){
    const saved=savedFor(rack),d=rack?.drawing||saved?.drawing||{},k=d?.konsol||rack?.konsol||{},s=rack?.spec||{};
    let count=Math.round(num(rack?.uprightCount,rack?.count,s?.count,s?.uprightCount,d?.uprightCount,d?.count,k?.uprightCount,k?.count));
    if(count>=2)return Math.min(60,count);
    const spacing=num(rack?.spacing,s?.spacing,d?.spacing,k?.spacing),width=num(rack?.totalWidth,d?.totalWidth,d?.width,k?.totalWidth);
    if(spacing&&width)count=Math.round(width/spacing)+1;
    return Math.max(2,Math.min(60,count||5));
  }
  const node=(name,attrs={})=>{const el=document.createElementNS(NS,name);for(const [key,value] of Object.entries(attrs))el.setAttribute(key,String(value));return el};
  function safeBox(group){
    try{const b=group.getBBox();if(Number.isFinite(b.x)&&Number.isFinite(b.y)&&b.width>0&&b.height>0)return b}catch{}
    return null;
  }
  function drawPlan(group,rack){
    if(!group||group.dataset.rafexKonsolPlan==='v38')return;
    const box=safeBox(group);if(!box)return;
    const wide=box.width>=box.height,w=box.width,h=box.height;
    if(w<1||h<1)return;
    const count=countOf(rack),side=sideOf(rack);
    const frag=document.createDocumentFragment();
    const shell=node('g',{'class':'rafex-konsol-plan-footprint','pointer-events':'none'});
    const minor=Math.max(.8,Math.min(w,h)*.055),major=Math.max(1.2,Math.min(w,h)*.085);
    shell.appendChild(node('rect',{x:box.x,y:box.y,width:w,height:h,rx:Math.min(w,h)*.06,fill:'#005387', 'fill-opacity':'.035',stroke:'#005387','stroke-opacity':'.35','stroke-width':minor*.55}));
    if(wide){
      const axisY=side==='double'?box.y+h/2:box.y+Math.max(major*1.2,h*.12);
      const edgeA=box.y+Math.max(minor,h*.035),edgeB=box.y+h-Math.max(minor,h*.035);
      shell.appendChild(node('line',{x1:box.x,y1:axisY,x2:box.x+w,y2:axisY,stroke:'#005387','stroke-width':major,'stroke-linecap':'square'}));
      for(let i=0;i<count;i++){
        const x=box.x+(count===1?w/2:(w*i/(count-1)));
        const armEnd=side==='double'?edgeB:edgeB;
        shell.appendChild(node('line',{x1:x,y1:axisY,x2:x,y2:armEnd,stroke:'#E1A100','stroke-width':minor,'stroke-linecap':'square'}));
        if(side==='double')shell.appendChild(node('line',{x1:x,y1:axisY,x2:x,y2:edgeA,stroke:'#E1A100','stroke-width':minor,'stroke-linecap':'square'}));
        shell.appendChild(node('rect',{x:x-major*.7,y:axisY-major*.7,width:major*1.4,height:major*1.4,fill:'#005387',rx:major*.15}));
        shell.appendChild(node('line',{x1:x-minor*.6,y1:armEnd,x2:x+minor*.6,y2:armEnd,stroke:'#E25303','stroke-width':minor*.8,'stroke-linecap':'round'}));
        if(side==='double')shell.appendChild(node('line',{x1:x-minor*.6,y1:edgeA,x2:x+minor*.6,y2:edgeA,stroke:'#E25303','stroke-width':minor*.8,'stroke-linecap':'round'}));
      }
    }else{
      const axisX=side==='double'?box.x+w/2:box.x+Math.max(major*1.2,w*.12);
      const edgeA=box.x+Math.max(minor,w*.035),edgeB=box.x+w-Math.max(minor,w*.035);
      shell.appendChild(node('line',{x1:axisX,y1:box.y,x2:axisX,y2:box.y+h,stroke:'#005387','stroke-width':major,'stroke-linecap':'square'}));
      for(let i=0;i<count;i++){
        const y=box.y+(count===1?h/2:(h*i/(count-1)));
        shell.appendChild(node('line',{x1:axisX,y1:y,x2:edgeB,y2:y,stroke:'#E1A100','stroke-width':minor,'stroke-linecap':'square'}));
        if(side==='double')shell.appendChild(node('line',{x1:axisX,y1:y,x2:edgeA,y2:y,stroke:'#E1A100','stroke-width':minor,'stroke-linecap':'square'}));
        shell.appendChild(node('rect',{x:axisX-major*.7,y:y-major*.7,width:major*1.4,height:major*1.4,fill:'#005387',rx:major*.15}));
        shell.appendChild(node('line',{x1:edgeB,y1:y-minor*.6,x2:edgeB,y2:y+minor*.6,stroke:'#E25303','stroke-width':minor*.8,'stroke-linecap':'round'}));
        if(side==='double')shell.appendChild(node('line',{x1:edgeA,y1:y-minor*.6,x2:edgeA,y2:y+minor*.6,stroke:'#E25303','stroke-width':minor*.8,'stroke-linecap':'round'}));
      }
    }
    frag.appendChild(shell);
    group.dataset.rafexKonsolPlan='v38';
    group.replaceChildren(frag);
  }
  function process(){
    raf=0;if(working)return;working=true;
    try{
      const layer=document.getElementById('m2LayoutContent');if(!layer)return;
      const racks=rackList();
      layer.querySelectorAll('[data-rack]').forEach((group)=>{
        const id=Number(group.dataset.rack),rack=racks.find((item)=>Number(item?.id)===id);
        if(!rack||!isKonsol(rack,group))return;
        drawPlan(group,rack);
      });
    }finally{working=false}
  }
  function schedule(){if(!raf)raf=requestAnimationFrame(process)}
  const observer=new MutationObserver((records)=>{if(working)return;if(records.some((r)=>r.addedNodes?.length||r.removedNodes?.length))schedule()});
  function boot(){observer.observe(document.body||document.documentElement,{childList:true,subtree:true});schedule()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.rafexRefreshKonsolFreePlanV38=schedule;
})();
</script>`;
const bodyClose=html.lastIndexOf('</body>');
if(bodyClose<0)throw new Error('Konsol free plan v38 body kapanisi bulunamadi');
html=html.slice(0,bodyClose)+runtime+'\n'+html.slice(bodyClose);
for(const required of ['data-rafex-konsol-free-plan="v38"','__rafexKonsolFreePlanV38','data-rafex-konsol-plan','rafexRefreshKonsolFreePlanV38'])if(!html.includes(required))throw new Error('Konsol free plan v38 doğrulaması eksik: '+required);
const encoded=Buffer.from(html).toString('base64');
source=source.slice(0,match.index)+match[0].replace(match[2],encoded)+source.slice(match.index+match[0].length);
fs.writeFileSync(file,source);
console.log('Konsol v38: Serbest Cizim ust gorunumu 3D kat yigini yerine temiz 2D ayak izi olarak ciziliyor.');
