(()=>{
  const ns='http://www.w3.org/2000/svg',ENTER=8,RELEASE=12,REACH=400;
  let guide=null,guideKey='',screenVersion=0;
  const lower=(items,value,key)=>{let a=0,b=items.length;while(a<b){const m=(a+b)>>>1;if(key(items[m])<value)a=m+1;else b=m;}return a;};
  function buildIndex(boxes){
    function axis(a,b,c,d){const map=new Map();for(const box of boxes)for(const edge of [a,b]){const value=box[edge];let group=map.get(value);if(!group)map.set(value,group={value,items:[]});group.items.push({box,center:(box[c]+box[d])/2});}const groups=[...map.values()].sort((x,y)=>x.value-y.value);for(const g of groups)g.items.sort((x,y)=>x.center-y.center);return groups;}
    return{x:axis('left','right','top','bottom'),y:axis('top','bottom','left','right')};
  }
  function nearest(groups,box,axis,scale,previous){
    const edges=axis==='x'?['left','right']:['top','bottom'],cross=axis==='x'?['top','bottom']:['left','right'],gap=ref=>Math.max(0,ref[cross[0]]-box[cross[1]],box[cross[0]]-ref[cross[1]])*scale;
    if(previous&&Math.abs(previous.value-box[previous.edge])*scale<=RELEASE&&gap(previous.ref)<=REACH)return{...previous,delta:previous.value-box[previous.edge]};
    let best=null,bestScore=Infinity;const center=(box[cross[0]]+box[cross[1]])/2;
    for(const edge of edges){const at=lower(groups,box[edge],g=>g.value);for(let i=Math.max(0,at-8);i<Math.min(groups.length,at+8);i++){const g=groups[i],distance=Math.abs(g.value-box[edge])*scale;if(distance>ENTER)continue;const j=lower(g.items,center,r=>r.center);for(let k=Math.max(0,j-4);k<Math.min(g.items.length,j+4);k++){const ref=g.items[k].box,apart=gap(ref);if(apart>REACH)continue;const score=distance+apart/1000;if(score<bestScore){bestScore=score;best={edge,value:g.value,ref,delta:g.value-box[edge]};}}}}
    return best;
  }
  function choose(raw,x,y,valid){
    const options=[{dx:raw.dx+(x?.delta||0),dy:raw.dy+(y?.delta||0),x,y}];
    if(x&&y){const single=[{dx:raw.dx+x.delta,dy:raw.dy,x,y:null},{dx:raw.dx,dy:raw.dy+y.delta,x:null,y}];single.sort((a,b)=>Math.hypot(a.dx-raw.dx,a.dy-raw.dy)-Math.hypot(b.dx-raw.dx,b.dy-raw.dy));options.push(...single);}
    for(const option of options)if((Math.abs(option.dx-raw.dx)<1e-9&&Math.abs(option.dy-raw.dy)<1e-9)||valid(option.dx,option.dy))return option;
    return{...raw,x:null,y:null};
  }
  function context(drag,rack){
    if(drag.alignmentV249)return drag.alignmentV249;
    const origins=drag.groupMembers?.length?drag.groupMembers:[{id:rack.id,x:drag.originX,y:drag.originY}],byId=new Map(m2LayoutState.racks.map(r=>[Number(r.id),r])),ids=new Set(origins.map(o=>Number(o.id))),boxes=origins.map(o=>{const r=byId.get(Number(o.id));return r&&m2RackBounds(r,o.x,o.y,r.angle);}).filter(Boolean);
    if(!boxes.length)return null;
    const bounds={left:Math.min(...boxes.map(b=>b.left)),right:Math.max(...boxes.map(b=>b.right)),top:Math.min(...boxes.map(b=>b.top)),bottom:Math.max(...boxes.map(b=>b.bottom))};
    const refs=m2LayoutState.racks.filter(r=>!ids.has(Number(r.id))&&!r.staged).map(r=>({...m2RackBounds(r),id:r.id}));
    return drag.alignmentV249={origins,bounds,index:buildIndex(refs),x:null,y:null,screen:null};
  }
  function clear(){guide?.remove();guide=null;guideKey='';}
  function paint(ctx,rack,drag,scale){
    const dx=rack.x-drag.originX,dy=rack.y-drag.originY,b={left:ctx.bounds.left+dx,right:ctx.bounds.right+dx,top:ctx.bounds.top+dy,bottom:ctx.bounds.bottom+dy},parts=[],pad=10/scale;
    for(const axis of ['x','y']){const match=ctx[axis];if(!match)continue;if(Math.abs(b[match.edge]-match.value)*scale>.1){ctx[axis]=null;continue;}const ref=match.ref,v=match.value;if(axis==='x')parts.push(`<line x1="${v}" x2="${v}" y1="${Math.min(b.top,ref.top)-pad}" y2="${Math.max(b.bottom,ref.bottom)+pad}"/>`);else parts.push(`<line y1="${v}" y2="${v}" x1="${Math.min(b.left,ref.left)-pad}" x2="${Math.max(b.right,ref.right)+pad}"/>`);}
    if(!parts.length){clear();return;}
    const parent=document.querySelector('.rafex-drag-scene-v248 .rafex-scene-content-v248')||document.getElementById('m2LayoutSvg');if(!parent)return;
    if(!guide?.isConnected||guide.parentNode!==parent){clear();guide=document.createElementNS(ns,'g');guide.setAttribute('data-rafex-alignment-v249','');guide.setAttribute('pointer-events','none');guide.setAttribute('aria-hidden','true');parent.append(guide);}
    const html=parts.join('');if(html!==guideKey){guide.innerHTML=html;guideKey=html;}
  }
  const apply=m2ApplyLiveRackDrag;
  m2ApplyLiveRackDrag=function(svg,drag,clientX,clientY){
    if(!drag||m2LayoutState.drag!==drag||!Number.isFinite(clientX+clientY))return apply.apply(this,arguments);
    const rack=m2LayoutState.racks.find(r=>Number(r.id)===Number(drag.id));if(!rack)return apply.apply(this,arguments);
    const ctx=context(drag,rack);if(!ctx)return apply.apply(this,arguments);
    const view=svg.getAttribute('viewBox');if(!ctx.screen||ctx.screen.view!==view||ctx.screen.version!==screenVersion){const matrix=svg.getScreenCTM();if(!matrix)return apply.apply(this,arguments);ctx.screen={view,version:screenVersion,matrix,scale:Math.max(.000001,Math.sqrt(Math.abs(matrix.a*matrix.d-matrix.b*matrix.c)))};}
    const {matrix,scale}=ctx.screen,point=m2SvgPoint({clientX,clientY}),raw={dx:point.x-drag.dx-drag.originX,dy:point.y-drag.dy-drag.originY},b={left:ctx.bounds.left+raw.dx,right:ctx.bounds.right+raw.dx,top:ctx.bounds.top+raw.dy,bottom:ctx.bounds.bottom+raw.dy};
    const x=nearest(ctx.index.x,b,'x',scale,ctx.x),y=nearest(ctx.index.y,b,'y',scale,ctx.y);
    const valid=(dx,dy)=>{if(drag.selectionGroup)return m2GroupTranslationValid(ctx.origins,dx,dy);if(drag.groupMembers?.length>1)return drag.groupMembers.some(o=>m2LayoutState.racks.find(r=>r.id===o.id)?.freePlacement)?m2FreeGroupTranslationValid(ctx.origins,dx,dy):m2GroupTranslationValid(ctx.origins,dx,dy);const px=drag.originX+dx,py=drag.originY+dy;return m2RackInsideArea(rack,px,py,rack.angle)&&!m2RackOverlaps(rack,px,py,rack.angle);};
    const snap=choose(raw,x,y,valid);ctx.x=snap.x;ctx.y=snap.y;
    const target=new DOMPoint(drag.originX+drag.dx+snap.dx,drag.originY+drag.dy+snap.dy).matrixTransform(matrix);
    const result=apply.call(this,svg,drag,target.x,target.y);if(m2LayoutState.drag===drag)paint(ctx,rack,drag,scale);else clear();return result;
  };
  const render=m2RenderLayout;m2RenderLayout=function(){clear();return render.apply(this,arguments);};
  const finish=m2FinishRetainedDragV107;m2FinishRetainedDragV107=function(){try{return finish.apply(this,arguments);}finally{clear();}};
  for(const type of ['pointerup','pointercancel','lostpointercapture'])document.addEventListener(type,clear,true);
  window.addEventListener('blur',clear);window.addEventListener('resize',()=>{screenVersion++;clear();},{passive:true});window.addEventListener('scroll',()=>{screenVersion++;},{passive:true,capture:true});
  window.rafexAlignmentV249={buildIndex,nearest,choose,clear};
})();
