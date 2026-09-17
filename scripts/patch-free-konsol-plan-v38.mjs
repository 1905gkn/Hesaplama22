import fs from 'node:fs';

const file='dist/server/index.js';
let source=fs.readFileSync(file,'utf8');
const match=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if(!match)throw new Error('HTML_BASE64 not found for Konsol free plan v38');
let html=Buffer.from(match[2],'base64').toString('utf8');
if(!html.includes('const konsolExactScaleV111=')){
  const anchor='      function m2RenderLayout() {';
  if(!html.includes(anchor))throw new Error('Konsol scale: layout renderer missing');
  html=html.replace(anchor,anchor+String.raw`
        const konsolExactScaleV111=m2LayoutState.scale;
        for(const rack of m2LayoutState.racks||[]){
          if(rack.rafexSystem!=='konsol'&&rack.systemType!=='konsol'&&rack.layoutView!=='konsol-top')continue;
          const w=Number(rack.widthMm)*konsolExactScaleV111,h=Number(rack.depthMm)*konsolExactScaleV111;
          if(w>0&&h>0&&Number.isFinite(w)&&Number.isFinite(h)){
            rack.x+=(rack.w-w)/2;rack.y+=(rack.h-h)/2;rack.w=w;rack.h=h;
          }
        }
`);
}
html=html
  .replace(/<style data-rafex-konsol-free-plan="v38">[\s\S]*?<\/style>/g,'')
  .replace(/<script data-rafex-konsol-free-plan="v38">[\s\S]*?<\/script>/g,'');

const runtime=String.raw`
<style data-rafex-konsol-free-plan="v38">
#m2LayoutContent [data-rack][data-rafex-konsol-plan="v38"] .rafex-konsol-plan-footprint{pointer-events:none}
#m2LayoutContent [data-rafex-konsol-plan="v38"] .m2-layout-rack{fill:transparent!important;stroke:none!important}
#m2LayoutContent [data-rafex-konsol-plan="v38"] .m2-layout-rack.selected{stroke:#214c3b!important;stroke-dasharray:3 2;fill:none!important}
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
    const saved=savedFor(rack),d=rack?.drawing||saved?.drawing||{};
    // Older shared records can retain a generic Mekik system tag. The saved
    // cantilever geometry is authoritative, not that inherited label.
    if(rack?.konsol||rack?.drawing?.konsol||rack?.layoutView==='konsol-top'||rack?.drawing?.layoutView==='konsol-top')return true;
    const explicit=[rack?.rafexSystem,rack?.__rafexSystem,rack?.systemType,d?.rafexSystem,d?.systemType,saved?.__rafexSystem]
      .map(text).filter(Boolean);
    if(explicit.some((value)=>/^(mekik|mekik2|shuttle|drive|drive-in|drivein|b2b|mr|fifo|lifo)$/.test(value)))return false;
    if(explicit.some((value)=>/^(konsol|konsol-kollu|cantilever)$/.test(value)))return true;
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
    if(!group)return;
    if(group.dataset.rafexKonsolPlan==='v38'&&group.querySelector('.rafex-konsol-plan-steel'))return;
    const box={x:Number(rack.x),y:Number(rack.y),width:Number(rack.w),height:Number(rack.h)};
    if(!Object.values(box).every(Number.isFinite))return;
    const wide=box.width>=box.height,w=box.width,h=box.height;
    if(w<1||h<1)return;
    const count=countOf(rack),side=sideOf(rack);
    const frag=document.createDocumentFragment();
    const shell=node('g',{'class':'rafex-konsol-plan-footprint','pointer-events':'none'});
    const saved=savedFor(rack),d=rack.drawing||saved?.drawing||{};
    const spec={...(d.spec||{}),...(d.konsol||{}),...(rack.spec||{}),...(rack.konsol||{})};
    const length=wide?w:h,depth=wide?h:w;
    const widthMm=num(rack.widthMm,spec.totalWidth,(count-1)*num(spec.spacing,1500)+130);
    const scale=length/widthMm;
    const foot=Math.min(depth*.15,130*scale),armWidth=Math.min(depth*.06,70*scale);
    const span=Math.min(length-foot,(count-1)*num(spec.spacing,1500)*scale);
    const first=(length-span)/2,axis=side==='double'?depth/2:foot/2;
    const steel=node('g',{'class':'rafex-konsol-plan-steel',transform:wide?'translate('+box.x+' '+box.y+')':'translate('+box.x+' '+box.y+') matrix(0 1 1 0 0 0)'});
    shell.appendChild(steel);
    // Uprights meet the arms directly; no decorative longitudinal back strip.
    for(let i=0;i<count;i++){
      const x=first+span*i/(count-1);
      steel.appendChild(node('rect',{x:x-armWidth/2,y:side==='double'?0:axis,width:armWidth,height:side==='double'?depth:depth-axis,fill:spec.armColor==='ral2004'?'#E25303':'#E1A100'}));
      steel.appendChild(node('rect',{x:x-foot/2,y:axis-foot/2,width:foot,height:foot,fill:'#005387'}));
    }
    const load=spec.loadType||'profile';
    const rows=spec.levelRows||spec.levelsData;
    const hasLoad=!Array.isArray(rows)||rows.some(row=>Number(row.load)>0);
    const productLength=Math.min(length,num(spec.productLength,widthMm)*scale);
    function goods(a,b){
      const pad=Math.min(30*scale,(b-a)*.05),height=b-a-2*pad;
      if(height<=0)return;
      const x=(length-productLength)/2;
      const goods=node('g',{'class':'rafex-konsol-plan-product','data-load-type':load});
      steel.appendChild(goods);
      if(load==='profile'){
        for(let j=0;j<5;j++)goods.appendChild(node('rect',{x,y:a+pad+j*height/5,width:productLength,height:height*.14,fill:'#aeb7bc',stroke:'#65757d','stroke-width':Math.min(.35,10*scale)}));
      }else if(load==='pallet'){
        const bays=Math.max(1,Math.ceil(productLength/(1200*scale)));
        for(let j=0;j<bays;j++){
          const px=x+j*productLength/bays,pw=productLength/bays;
          goods.appendChild(node('rect',{x:px+pad,y:a+pad,width:Math.max(.01,pw-2*pad),height,fill:'#c99648',stroke:'#79551f','stroke-width':Math.min(.35,10*scale)}));
          goods.appendChild(node('line',{x1:px+pw/2,y1:a+pad,x2:px+pw/2,y2:b-pad,stroke:'#ad7e35','stroke-width':Math.min(.45,15*scale)}));
        }
      }
    }
    if(hasLoad&&load!=='unpacked'){
      goods(axis+foot/2,depth);
      if(side==='double')goods(0,axis-foot/2);
    }
    // Reuse B2B's letter decorator and its size/contrast controls.
    const label=node('text',{'class':'m2-rack-name',x:box.x+w/2,y:box.y+h/2,'text-anchor':'middle','dominant-baseline':'central'});
    label.textContent=String(rack.typeName||saved?.name||rack.name||'');
    shell.appendChild(label);
    // Keep the standard hit surface used by selection, dragging and drag caches.
    const hit=group.querySelector('.m2-layout-rack')||node('rect',{'class':'m2-layout-rack'});
    for(const [key,value] of Object.entries({x:box.x,y:box.y,width:w,height:h,fill:'transparent',stroke:'none','pointer-events':'all'}))hit.setAttribute(key,String(value));
    hit.style.setProperty('fill','transparent','important');hit.style.setProperty('stroke','none','important');hit.style.pointerEvents='all';
    frag.appendChild(hit);frag.appendChild(shell);
    group.dataset.rafexKonsolPlan='v38';
    group.replaceChildren(frag);
    return true;
  }
  function process(){
    raf=0;if(working)return;working=true;
    try{
      const layer=document.getElementById('m2LayoutContent');if(!layer)return;
      const racks=rackList();
      const byId=new Map(racks.map(rack=>[Number(rack.id),rack]));
      let changed=false;
      layer.querySelectorAll('[data-rack]').forEach((group)=>{
        const id=Number(group.dataset.rack),rack=byId.get(id);
        if(!rack||!isKonsol(rack,group))return;
        if(drawPlan(group,rack))changed=true;
      });
      if(changed)window.rafexCommonSingleLineLetterV58?.decorate?.();
    }finally{working=false}
  }
  function schedule(){if(!raf)raf=requestAnimationFrame(process)}
  const observer=new MutationObserver((records)=>{if(working)return;if(records.some(r=>Array.from(r.addedNodes||[]).some(n=>n.nodeType===1&&(n.id==='m2LayoutContent'||n.matches?.('[data-rack]')||n.querySelector?.('#m2LayoutContent,[data-rack]')))))schedule()});
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
