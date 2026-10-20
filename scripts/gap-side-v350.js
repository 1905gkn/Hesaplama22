(()=>{
 const hitClass='rafex-gap-side-hit-v350';let svg=null,observer=null,pending=0;
 function ids(group){const a=Number(group.dataset.gapA||group.dataset.rackGapOwner),b=Number(group.dataset.gapB||group.dataset.rackGapOther);return Number.isFinite(a)&&Number.isFinite(b)&&a!==b?[a,b]:null;}
 function line(group){return group.querySelector('.m2-rack-distance');}
 function choose(ax,ay,bx,by,x,y,a,b){return (x-ax)*(bx-ax)+(y-ay)*(by-ay)<((bx-ax)**2+(by-ay)**2)/2?a:b;}
 window.rafexGapSideV350=choose;
 window.rafexGapSideTitleV350=(aId,bId,moveId)=>{
  const a=m2LayoutState.racks.find(r=>Number(r.id)===Number(aId)),b=m2LayoutState.racks.find(r=>Number(r.id)===Number(bId));if(!a||!b)return 'Seçilen iki rafın arası';
  const A=m2GapBoundsV346(a),B=m2GapBoundsV346(b),isA=Number(moveId)===Number(aId),dx=(B.cx-A.cx)*(isA?-1:1),dy=(B.cy-A.cy)*(isA?-1:1),side=Math.abs(dx)>=Math.abs(dy)?dx<0?'Sol':'Sağ':dy<0?'Üst':'Alt',rack=isA?a:b;
  return 'Raf arası · '+side+' taraftaki '+(rack.typeName||'raf')+' hareket edecek';
 };
 function decorate(){
  const next=document.getElementById('m2LayoutSvg');if(next!==svg){observer?.disconnect();svg=next;if(svg){observer=new MutationObserver(records=>{if(records.some(r=>r.type==='childList'||!r.target.classList?.contains(hitClass)))schedule();});observer.observe(svg,{subtree:true,childList:true,attributes:true,attributeFilter:['x1','x2','y1','y2']});}}
  if(!svg)return;
  for(const group of svg.querySelectorAll('.m2-distance-guide')){
   const source=line(group);if(!source||!ids(group))continue;
   let hit=group.querySelector('.'+hitClass);if(!hit){hit=document.createElementNS('http://www.w3.org/2000/svg','line');hit.setAttribute('class',hitClass);hit.setAttribute('aria-label','Mesafesini değiştirmek istediğiniz raf tarafına tıklayın');source.parentNode.appendChild(hit);}
   for(const key of ['x1','y1','x2','y2']){const value=source.getAttribute(key);if(hit.getAttribute(key)!==value)hit.setAttribute(key,value);}
  }
 }
 function schedule(){if(!pending)pending=requestAnimationFrame(()=>{pending=0;decorate();});}
 document.addEventListener('pointerdown',event=>{
  if(event.button!==0)return;const group=event.target.closest?.('.m2-distance-guide'),root=group?.closest('#m2LayoutSvg');if(!root||root.classList.contains('m2-dimension-editing'))return;
  if(typeof m2LayoutTool!=='undefined'&&(m2LayoutTool==='dimension'||m2LayoutTool==='measure'))return;
  const pair=ids(group),source=line(group),matrix=source?.getScreenCTM();if(!pair||!matrix||typeof window.rafexPromptRackPairDistance!=='function')return;
  const point=new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse()),[a,b]=pair,ax=Number(source.getAttribute('x1')),ay=Number(source.getAttribute('y1')),bx=Number(source.getAttribute('x2')),by=Number(source.getAttribute('y2'));
  const moving=choose(ax,ay,bx,by,point.x,point.y,a,b),mm=Number(group.dataset.rackGap);if(!Number.isFinite(mm))return;
  event.preventDefault();event.stopImmediatePropagation();window.rafexPromptRackPairDistance(a,b,mm,moving);
 },true);
 const render=m2RenderLayout;m2RenderLayout=window.m2RenderLayout=function(){const result=render.apply(this,arguments);decorate();return result;};decorate();
})();

