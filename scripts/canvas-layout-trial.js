(()=>{
 const ns='http://www.w3.org/2000/svg',selector='#m2LayoutContent > g[data-rack]';
 const props=['fill','fill-opacity','stroke','stroke-opacity','stroke-width','stroke-linecap','stroke-linejoin',
  'stroke-dasharray','opacity','font-family','font-size','font-weight','letter-spacing','text-anchor',
  'dominant-baseline','visibility','display','paint-order','vector-effect'];
 const style=document.createElement('style');
 style.textContent='@media screen{#m2LayoutSvg[data-canvas144] '+selector+' > :not(.m2-layout-rack){opacity:0!important}'+
  '#m2LayoutSvg[data-canvas144] '+selector+' > .m2-layout-rack{fill:transparent!important}'+
  '#m2LayoutSvg[data-canvas144] '+selector+' > .m2-layout-rack:not(.selected){stroke:transparent!important}}';
 document.head.append(style);
 let overlay=null,generation=0,timer=0,button=null;
 let enabled=new URLSearchParams(location.search).get('canvas144')==='1';
 const project144=()=>/^0*144$/.test(String(window.rafexProjectIdentityV133?.displayNumber??document.getElementById('rafexProjectDisplayNumber')?.textContent??'').trim());
 function clear(){
  generation++;clearTimeout(timer);
  document.getElementById('m2LayoutSvg')?.removeAttribute('data-canvas144');
  overlay?.remove();overlay=null;
 }
 function toggleButton(svg){
  if(button?.isConnected)return;
  button=document.createElement('button');button.type='button';
  button.id='rafexCanvasTrial144';
  button.textContent=enabled?'Canvas denemesini kapat':'Canvas denemesini aç';
  button.setAttribute('aria-pressed',String(enabled));
  button.onclick=()=>{
   enabled=!enabled;
   button.textContent=enabled?'Canvas denemesini kapat':'Canvas denemesini aç';
   button.setAttribute('aria-pressed',String(enabled));
   if(enabled)schedule();else clear();
  };
  (svg.closest('.m2-floor-canvas-wrap')||svg).before(button);
 }
 async function paint(){
  const svg=document.getElementById('m2LayoutSvg');
  if(!svg||!project144()||!enabled||m2LayoutState.drag||window.rafexViewportV248?.exporting)return;
  const groups=[...svg.querySelectorAll(selector)];
  if(!groups.length)return;
  const epoch=generation,started=performance.now(),root=document.createElementNS(ns,'svg');
  let left=Infinity,top=Infinity,right=-Infinity,bottom=-Infinity;
  const layoutRacks=new Map(m2LayoutState.racks.map(r=>[String(r.id),r]));
  for(const group of groups){
   const rack=layoutRacks.get(group.dataset.rack);
   if(!rack)continue;
   const {left:x,top:y,right:r,bottom:b}=m2RackBounds(rack);
   left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,r);bottom=Math.max(bottom,b);
  }
  if(!(right>left&&bottom>top))return;
  left-=10;top-=10;right+=10;bottom+=10;
  const w=right-left,h=bottom-top,ratio=Math.min(4,4096/Math.max(w,h),Math.sqrt(10000000/(w*h)));
  const width=Math.max(1,Math.ceil(w*ratio)),height=Math.max(1,Math.ceil(h*ratio));
  root.setAttribute('xmlns',ns);root.setAttribute('viewBox',[left,top,w,h].join(' '));
  root.setAttribute('width',width);root.setAttribute('height',height);
  for(const defs of svg.querySelectorAll(':scope > defs'))root.append(defs.cloneNode(true));
  let copied=0;
  for(const group of groups){
   const clone=group.cloneNode(true),sources=[group,...group.querySelectorAll('*')],targets=[clone,...clone.querySelectorAll('*')];
   sources.forEach((node,i)=>{
    const target=targets[i],css=getComputedStyle(node);
    for(const property of props){const value=css.getPropertyValue(property);if(value)target.style.setProperty(property,value);}
    for(const name of target.getAttributeNames())if(name.startsWith('on'))target.removeAttribute(name);
   });
   clone.querySelectorAll('.m2-layout-rack,.m2-rack-pallet-count').forEach(node=>node.remove());
   root.append(clone);copied+=sources.length;
   if(copied>=400){
    copied=0;await new Promise(resolve=>setTimeout(resolve,0));
    if(epoch!==generation||m2LayoutState.drag)return;
   }
  }
  const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(root)],{type:'image/svg+xml'}));
  try{
   const image=new Image();image.src=url;await image.decode();
   if(epoch!==generation||m2LayoutState.drag||svg!==document.getElementById('m2LayoutSvg'))return;
   const layer=document.createElementNS(ns,'foreignObject'),canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
   if(!ctx)return;
   canvas.width=width;canvas.height=height;
   canvas.style.cssText='display:block;width:100%;height:100%';
   ctx.drawImage(image,0,0,width,height);
   for(const [key,value] of Object.entries({x:left,y:top,width:w,height:h}))layer.setAttribute(key,value);
   layer.setAttribute('pointer-events','none');layer.setAttribute('aria-hidden','true');layer.setAttribute('data-canvas144-layer','');
   const firstRack=svg.querySelector(selector);
   if(!firstRack)return;
   layer.append(canvas);firstRack.before(layer);
   overlay=layer;svg.setAttribute('data-canvas144','');
   svg.dataset.canvas144BuildMs=String(Math.round(performance.now()-started));
  }finally{URL.revokeObjectURL(url);}
 }
 function schedule(){
  if(!project144()&&!button&&!overlay)return;
  clear();
  if(!project144()){button?.remove();button=null;return;}
  const svg=document.getElementById('m2LayoutSvg');
  if(svg)toggleButton(svg);
  if(enabled&&!window.rafexViewportV248?.exporting)
   timer=setTimeout(()=>void paint().catch(()=>clear()),180);
 }
 const render=m2RenderLayout;
 m2RenderLayout=function(){
  if(!project144()&&!button&&!overlay)return render.apply(this,arguments);
  clear();try{return render.apply(this,arguments);}finally{schedule();}
 };
 const drag=m2ApplyLiveRackDrag;
 m2ApplyLiveRackDrag=function(){if(overlay)clear();return drag.apply(this,arguments);};
 window.addEventListener('pointerup',()=>{if(enabled&&!overlay&&project144())schedule();},true);
 window.addEventListener('pointercancel',()=>{if(enabled&&!overlay&&project144())schedule();},true);
 document.addEventListener('click',()=>{if(button&&!project144()){clear();button.remove();button=null;}},true);
 window.rafexCanvas144={clear,schedule};
})();
