(function(){
 // Bound cache lifetime and compare the complete physical model on each call.
 const cache=new Map(),render=window.rafexRenderPlanV143;
 if(render)window.rafexRenderPlanV143=function(plan,options){
   const key=JSON.stringify([plan,options]);if(cache.has(key))return cache.get(key);
   const result=render(plan,options);if(cache.size>=256)cache.delete(cache.keys().next().value);cache.set(key,result);return result;
 };
 let svg=null,observer=null,frame=0;
 function update(){
   frame=0;const next=document.getElementById('m2LayoutSvg');if(!next)return;
   if(next!==svg){observer?.disconnect();svg=next;observer=new MutationObserver(schedule);observer.observe(svg,{attributes:true,attributeFilter:['viewBox'],childList:true});}
   // Leave room for full-size letters and dimension annotations at maximum zoom.
   const view=svg.viewBox.baseVal,margin=Math.max(64,Math.max(view.width,view.height)*.1);
   if(!(view.width>0&&view.height>0))return;
   const racks=typeof m2LayoutState!=='undefined'?m2LayoutState.racks:[];
   const selected=racks.find(r=>Number(r.id)===Number(m2LayoutState.selected));
   const nodes=new Map(Array.from(svg.querySelectorAll('[data-rack]')).map(n=>[Number(n.dataset.rack),n]));
   for(const rack of racks){
     const node=nodes.get(Number(rack.id));if(!node)continue;
     const b=m2RackBounds(rack),outside=b.right<view.x-margin||b.left>view.x+view.width+margin||b.bottom<view.y-margin||b.top>view.y+view.height+margin;
     const interactive=m2LayoutState.drag||rack===selected||(selected?.joinGroup&&rack.joinGroup===selected.joinGroup);
     node.classList.toggle('rafex-offscreen-v152',!!outside&&!interactive);
   }
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(update)}
 const base=m2RenderLayout;m2RenderLayout=function(){const result=base.apply(this,arguments);update();return result};
 document.addEventListener('pointerup',schedule,true);
 document.addEventListener('pointerdown',schedule,true);
 window.rafexLayoutBudgetV152={update,cache};schedule();
})();
