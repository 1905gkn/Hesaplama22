(()=>{
 const ns='http://www.w3.org/2000/svg';let svg=null,observer=null,resize=null,frame=0,rendering=false,visible=null,signature='',scene=null,full=0,finishing=false;
 let pointerMatrix=null;
 const oldPoint=m2SvgPoint;m2SvgPoint=function(event){const drag=state()?.drag,node=document.getElementById('m2LayoutSvg');if(!drag||!node)return oldPoint.apply(this,arguments);const box=node.getAttribute('viewBox');if(!pointerMatrix||pointerMatrix.drag!==drag||pointerMatrix.node!==node||pointerMatrix.box!==box){const matrix=node.getScreenCTM();if(!matrix)return oldPoint.apply(this,arguments);pointerMatrix={drag,node,box,inverse:matrix.inverse()};}const p=new DOMPoint(event.clientX,event.clientY).matrixTransform(pointerMatrix.inverse);return{x:p.x,y:p.y};};
 const invalidatePointer=()=>{pointerMatrix=null;};window.addEventListener('scroll',invalidatePointer,{capture:true,passive:true});window.addEventListener('resize',invalidatePointer,{passive:true});
 const state=()=>typeof m2LayoutState==='undefined'?null:m2LayoutState;
 function compute(){
  const s=state(),node=document.getElementById('m2LayoutSvg');if(full||!s||!node||s.racks.length<80)return null;
  const rect=node.getBoundingClientRect(),matrix=node.getScreenCTM();if(!matrix||rect.width<2||rect.height<2)return null;
  const inv=matrix.inverse(),a=new DOMPoint(Math.max(0,rect.left),Math.max(0,rect.top)).matrixTransform(inv),b=new DOMPoint(Math.min(innerWidth,rect.right),Math.min(innerHeight,rect.bottom)).matrixTransform(inv),margin=Math.max(5,Math.max(Math.abs(b.x-a.x),Math.abs(b.y-a.y))*.06);
  const selected=s.racks.find(r=>r.id===s.selected),moving=new Set((s.drag?.groupMembers||[]).map(r=>Number(r.id))),ids=new Set();if(s.drag)moving.add(Number(s.drag.id));
  for(const r of s.racks){const box=m2RackBounds(r),keep=moving.has(Number(r.id))||r.id===s.selected||m2MultiSelect.rackIds.has(r.id)||(selected?.joinGroup&&r.joinGroup===selected.joinGroup);if(keep||!(box.right<a.x-margin||box.left>b.x+margin||box.bottom<a.y-margin||box.top>b.y+margin))ids.add(Number(r.id));}
  // A visible child's shared frame may be painted by its preceding module.
  const anchors=[];for(const r of s.racks)if(ids.has(Number(r.id))&&r.sharedFootWith)anchors.push(Number(r.sharedFootWith));for(const id of anchors)ids.add(id);
  return ids;
 }
 const key=ids=>ids?[...ids].join(','):'all';
 function prepare(){visible=compute();signature=key(visible);return visible;}
 function schedule(){if(!frame)frame=requestAnimationFrame(()=>{frame=0;if(rendering||full)return;if(state()?.drag){schedule();return;}restore();const next=compute();if(key(next)!==signature)m2RenderLayout();});}
 function bind(){const next=document.getElementById('m2LayoutSvg');if(next===svg)return;observer?.disconnect();resize?.disconnect();svg=next;if(!svg)return;observer=new MutationObserver(()=>{if(scene)scene.moving.setAttribute('viewBox',svg.getAttribute('viewBox'));invalidatePointer();schedule();});observer.observe(svg,{attributes:true,attributeFilter:['viewBox']});resize=new ResizeObserver(()=>{restore();invalidatePointer();schedule();});resize.observe(svg);}
 function restore(){if(!scene)return;const old=scene;scene=null;for(const [node,base] of old.bases)node.setAttribute("transform","translate("+old.dx+" "+old.dy+") "+base);for(const item of old.items){if(item.marker.isConnected)item.marker.replaceWith(item.node);}old.moving.remove();old.svg.style.willChange=old.willChange;old.svg.style.transform=old.transform;if(old.position!==null)old.parent.style.position=old.position;}
 function isolate(){
  const s=state(),drag=s?.drag,node=document.getElementById('m2LayoutSvg');if(full||finishing||!drag||!node||s.racks.length<80)return;
  if(scene){if(scene.drag!==drag)restore();else return;}
  const parent=node.parentElement,rect=node.getBoundingClientRect(),pr=parent.getBoundingClientRect();if(!rect.width||!rect.height)return;
  const ids=new Set((drag.groupMembers?.length?drag.groupMembers:[drag]).map(r=>Number(r.id))),items=[];
  const parentStyle=getComputedStyle(parent),borderLeft=parseFloat(parentStyle.borderLeftWidth)||0,borderTop=parseFloat(parentStyle.borderTopWidth)||0;const position=parentStyle.position==='static'?parent.style.position:null;if(position!==null)parent.style.position='relative';
  function make(z){const root=document.createElementNS(ns,'svg');root.setAttribute('class',(node.getAttribute('class')||'')+' rafex-drag-scene-v248');root.setAttribute('viewBox',node.getAttribute('viewBox'));root.setAttribute('preserveAspectRatio',node.getAttribute('preserveAspectRatio')||'xMidYMid meet');root.setAttribute('aria-hidden','true');root.style.cssText='position:absolute!important;pointer-events:none!important;overflow:hidden!important;contain:strict;will-change:transform;transform:translateZ(0);margin:0!important;left:'+(rect.left-pr.left+parent.scrollLeft-borderLeft)+'px!important;top:'+(rect.top-pr.top+parent.scrollTop-borderTop)+'px!important;width:'+rect.width+'px!important;height:'+rect.height+'px!important;z-index:'+z;parent.appendChild(root);const content=document.createElementNS(ns,'g');content.classList.add('rafex-scene-content-v248');root.appendChild(content);return{root,content};}
  const moving=make(2),motion=document.createElementNS(ns,"g"),bases=new Map();moving.content.appendChild(motion);const willChange=node.style.willChange,transform=node.style.transform;node.style.willChange="transform";node.style.transform="translateZ(0)";
  function move(n,dest){const marker=document.createComment('drag-v248');n.before(marker);items.push({node:n,marker});dest.appendChild(n);}
  for(const id of ids){const n=m2PerfRackDomTable.get(id)?.node;if(n?.isConnected){const entry=m2PerfRackDomTable.get(id);bases.set(n,entry.baseTransform);n.setAttribute("transform",entry.baseTransform);move(n,motion);}}
  for(const entry of drag.perfSharedFootEntries||[]){if(entry.node?.isConnected){bases.set(entry.node,entry.baseTransform);entry.node.setAttribute("transform",entry.baseTransform);move(entry.node,motion);}}
  const rack=s.racks.find(r=>Number(r.id)===Number(drag.id)),dx=Number(rack.x)-Number(drag.originX??rack.x),dy=Number(rack.y)-Number(drag.originY??rack.y);motion.setAttribute("transform","translate("+dx+" "+dy+")");scene={drag,items,parent,position,svg:node,willChange,transform,moving:moving.root,content:moving.content,motion,bases,dx,dy};
 }
 function overlay(){if(!scene)return;const guide=m2PerfDragOverlay;if(guide?.isConnected&&guide.parentNode!==scene.content){const marker=document.createComment('drag-guide-v248');guide.before(marker);scene.items.push({node:guide,marker});scene.content.appendChild(guide);}}
 const baseRender=m2RenderLayout;m2RenderLayout=function(){restore();rendering=true;try{return baseRender.apply(this,arguments)}finally{rendering=false;bind();}};
 const translate=m2PerfTranslateEntry;m2PerfTranslateEntry=function(entry,dx,dy){if(scene&&scene.bases.has(entry?.node)){if(scene.dx!==dx||scene.dy!==dy){scene.dx=dx;scene.dy=dy;scene.motion.setAttribute('transform','translate('+dx+' '+dy+')');}return true;}return translate.apply(this,arguments);};
 const paint=m2PerfRenderSingleRackDragFrame;m2PerfRenderSingleRackDragFrame=function(){const result=paint.apply(this,arguments);if(result){isolate();overlay();}return result;};
 const ensureOverlay=m2PerfEnsureDragOverlay;m2PerfEnsureDragOverlay=function(layer,rackId){if(scene&&m2PerfDragOverlay?.isConnected)return m2PerfDragOverlay;return ensureOverlay.apply(this,arguments);};
 const finish=m2FinishRetainedDragV107;m2FinishRetainedDragV107=function(){finishing=true;restore();try{return finish.apply(this,arguments)}finally{finishing=false;schedule();}};
 const shared=m2PerfTranslateSharedFeet;m2PerfTranslateSharedFeet=function(drag,ids,dx,dy){if(!drag.perfSharedFootEntries){drag.perfSharedFootEntries=Array.from(document.querySelectorAll('#m2LayoutSvg .rafex-shared-foot-layer-v60 [data-shared-foot]')).map(node=>({node,ids:String(node.dataset.sharedFoot).split(':').map(Number),baseTransform:node.getAttribute('transform')||''})).filter(e=>e.ids.some(id=>ids.has(id)));}return shared.apply(this,arguments);};
 function withFull(fn){restore();full++;try{m2RenderLayout();return fn();}finally{full--;if(!full)m2RenderLayout();}}
 window.rafexViewportV248={prepare,visible:()=>visible,withFull,get exporting(){return full>0},restore,schedule,get scene(){return !!scene;}};
 const cache=new Map(),planRender=window.rafexRenderPlanV143;
 if(planRender)window.rafexRenderPlanV143=function(plan,options){const key=JSON.stringify([plan,options]);if(cache.has(key))return cache.get(key);const result=planRender(plan,options);if(cache.size>=256)cache.delete(cache.keys().next().value);cache.set(key,result);return result;};
 window.rafexLayoutBudgetV152={update:schedule,cache};

 document.addEventListener('pointerup',()=>{restore();schedule();},true);document.addEventListener('pointercancel',()=>{restore();schedule();},true);window.addEventListener('blur',restore);window.addEventListener('scroll',schedule,{capture:true,passive:true});window.addEventListener('resize',()=>{restore();schedule();},{passive:true});bind();
})();
