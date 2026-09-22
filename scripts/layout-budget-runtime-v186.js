(function(){
 const cache=new Map(),render=window.rafexRenderPlanV143;
 if(render)window.rafexRenderPlanV143=function(plan,options){
  const key=JSON.stringify([plan,options]);if(cache.has(key))return cache.get(key);
  const result=render(plan,options);if(cache.size>=256)cache.delete(cache.keys().next().value);cache.set(key,result);return result;
 };
 let svg=null,observer=null,resizeObserver=null,frame=0,entries=[],source=null,dirty=true,screen=null;
 function update(rebuild=true){
  if(frame){cancelAnimationFrame(frame);frame=0;}
  const next=document.getElementById('m2LayoutSvg');if(!next)return;
  if(next!==svg){observer?.disconnect();resizeObserver?.disconnect();svg=next;dirty=true;screen=null;observer=new MutationObserver(records=>{if(records.some(r=>r.type==='childList'))dirty=true;schedule()});observer.observe(svg,{attributes:true,attributeFilter:['viewBox'],childList:true});resizeObserver=new ResizeObserver(screenChanged);resizeObserver.observe(svg);}
  const view=svg.viewBox.baseVal,margin=Math.max(64,Math.max(view.width,view.height)*.1);
  if(!(view.width>0&&view.height>0))return;
  const state=typeof m2LayoutState!=='undefined'?m2LayoutState:null,racks=state?.racks||[];
  // The SVG can be taller than the browser. Its viewBox is not the actually
  // visible viewport; skip layout/paint for racks outside the clipped screen.
  let left=view.x,right=view.x+view.width,top=view.y,bottom=view.y+view.height;
  // PAN/zoom only change the SVG's viewBox, not its screen rectangle. Cache
  // normalized screen coordinates so an animation frame does not force a
  // synchronous layout immediately after the viewport attribute was written.
  if(rebuild||!screen||screen.svg!==svg){
   const rect=svg.getBoundingClientRect(),matrix=svg.getScreenCTM();
   screen=matrix&&rect.width>0&&rect.height>0?{svg,rect,matrix:matrix.translate(view.x,view.y).scale(view.width,view.height)}:null;
  }
  if(screen){
   const {rect}=screen,inverse=screen.matrix.scale(1/view.width,1/view.height).translate(-view.x,-view.y).inverse();
   const a=new DOMPoint(Math.max(rect.left,0),Math.max(rect.top,0)).matrixTransform(inverse),b=new DOMPoint(Math.min(rect.right,innerWidth),Math.min(rect.bottom,innerHeight)).matrixTransform(inverse);
   left=Math.max(left,a.x);right=Math.min(right,b.x);top=Math.max(top,a.y);bottom=Math.min(bottom,b.y);
  }
  // Full renders/membership changes rebuild the index. Viewport-only frames
  // reuse nodes and never query tens of thousands of SVG descendants.
  if(rebuild||dirty||source!==racks||entries.length!==racks.length){
   const nodes=new Map(Array.from(svg.querySelectorAll('[data-rack]')).map(n=>[Number(n.dataset.rack),n]));
   entries=racks.map(rack=>({rack,node:nodes.get(Number(rack.id))}));source=racks;dirty=false;
  }
  const selected=racks.find(r=>Number(r.id)===Number(state?.selected));
  const revealed=[];
  for(const {rack,node} of entries){
   if(!node?.isConnected)continue;
   const b=m2RackBounds(rack),outside=b.right<left-margin||b.left>right+margin||b.bottom<top-margin||b.top>bottom+margin;
   const moving=state.drag&&(Number(state.drag.id)===Number(rack.id)||(state.drag.groupMembers||[]).some(m=>Number(m.id)===Number(rack.id)));
   const interactive=moving||rack===selected||(selected?.joinGroup&&rack.joinGroup===selected.joinGroup),hidden=!!outside&&!interactive;
   if(node.classList.contains('rafex-offscreen-v152')!==hidden){node.classList.toggle('rafex-offscreen-v152',hidden);if(!hidden)revealed.push(node);}
  }
  if(revealed.length)window.rafexFitNameplatesV136?.(revealed);
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(()=>update(false))}
 const base=m2RenderLayout;m2RenderLayout=function(){const result=base.apply(this,arguments);update();return result};
 document.addEventListener('pointerup',schedule,true);document.addEventListener('pointerdown',schedule,true);
 function screenChanged(){screen=null;schedule()}
 window.addEventListener('scroll',screenChanged,{capture:true,passive:true});window.addEventListener('resize',screenChanged,{passive:true});
 window.rafexLayoutBudgetV152={update,cache};schedule();
})();
