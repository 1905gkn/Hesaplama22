(()=>{
 const selector='.m2-distance-guide circle,.m2-wall-guide circle,.m2-floor-point,.m2-free-measure-point';
 let svg=null,observer=null,resize=null,pending=0;
 function refresh(root=svg){
  if(!root)return;
  for(const point of root.querySelectorAll(selector)){
   const matrix=point.getScreenCTM();if(!matrix)continue;
   const scale=Math.hypot(matrix.a,matrix.b);if(!(scale>0))continue;
   const radius=(point.matches('.m2-floor-point')?3.5:2.5)/scale;
   const value=String(Math.round(radius*100000)/100000);
   if(point.getAttribute('r')!==value)point.setAttribute('r',value);
   point.style.setProperty('vector-effect','non-scaling-stroke');
  }
 }
 function schedule(){if(!pending)pending=requestAnimationFrame(()=>{pending=0;refresh();document.querySelectorAll('.rafex-drag-scene-v248').forEach(refresh);});}
 function bind(){
  const next=document.getElementById('m2LayoutSvg');if(next===svg)return;
  observer?.disconnect();resize?.disconnect();svg=next;if(!svg)return;
  observer=new MutationObserver(schedule);
  observer.observe(svg,{subtree:true,childList:true,attributes:true,attributeFilter:['viewBox','transform']});
  resize=new ResizeObserver(schedule);resize.observe(svg);
 }
 const base=m2RenderLayout;m2RenderLayout=function(){const result=base.apply(this,arguments);bind();refresh();return result;};
 window.addEventListener('resize',schedule,{passive:true});
 window.rafexRefreshZoomMarksV347=()=>{bind();refresh();};bind();schedule();
})();

