/* foot-protection-ownership-v337 */
function rafexProtectionOwnershipV337(racks,symbols,scale){
 const byRack=new Map(),parents=new Map(),feet=[];
 for(const rack of racks){
  const angle=(Number(rack.angle)||0)*Math.PI/180,cos=Math.cos(angle),sin=Math.sin(angle),cx=rack.x+rack.w/2,cy=rack.y+rack.h/2,halfFoot=m2B2BFootWidth(rack)*scale/2;
  const list=m2RackFootPoints(rack).map((point,index)=>{
   const dx=point.x-cx,dy=point.y-cy,localX=dx*cos+dy*sin,localY=-dx*sin+dy*cos,inset=point.side==='left'?halfFoot:-halfFoot;
   const foot={rack,point,id:String(rack.id)+':'+index,localX,localY,centerX:point.x+inset*cos,centerY:point.y+inset*sin};
   parents.set(foot.id,foot.id);feet.push(foot);return foot;
  });byRack.set(Number(rack.id),list);
 }
 function root(id){let r=id;while(parents.get(r)!==r)r=parents.get(r);while(id!==r){const next=parents.get(id);parents.set(id,r);id=next;}return r;}
 const tolerance=Math.max(1e-6,scale*.5);
 // Proximity alone never establishes a shared upright. Require its saved edge
 // and the two actual upright centers to coincide at the same frame face.
 for(const rack of racks){
  if(rack.sharedFootWith==null||!['left','right'].includes(rack.sharedFootSide))continue;
  const own=byRack.get(Number(rack.id))||[],other=byRack.get(Number(rack.sharedFootWith))||[],opposite=rack.sharedFootSide==='left'?'right':'left';
  for(const a of own){if(a.point.side!==rack.sharedFootSide)continue;
   const b=other.find(b=>b.point.side===opposite&&Math.hypot(a.centerX-b.centerX,a.centerY-b.centerY)<=tolerance);
   if(b){const ra=root(a.id),rb=root(b.id);if(ra!==rb)parents.set(ra,rb);}
  }
 }
 for(const foot of feet)foot.key=root(foot.id);
 const occupied=new Set();
 for(const symbol of symbols){
  if(!/^(uaks|uakz)$/.test(symbol.type)||symbol.rackId==null||!Number.isFinite(Number(symbol.localX))||!Number.isFinite(Number(symbol.localY)))continue;
  const foot=(byRack.get(Number(symbol.rackId))||[]).find(f=>Math.hypot(f.localX-Number(symbol.localX),f.localY-Number(symbol.localY))<=tolerance);
  if(foot)occupied.add(foot.key);
 }
 return {feet,occupied};
}
function m2CommitProtectionArea(){
 const draft=m2ProtectionDraft;if(!draft?.start||!draft?.hover)return;
 const left=Math.min(draft.start.x,draft.hover.x),right=Math.max(draft.start.x,draft.hover.x),top=Math.min(draft.start.y,draft.hover.y),bottom=Math.max(draft.start.y,draft.hover.y),sizeMm=draft.type==='uakz'?360:300,size=sizeMm*m2LayoutState.scale;
 const {feet,occupied}=rafexProtectionOwnershipV337(m2LayoutState.racks,m2LayoutSymbols,m2LayoutState.scale),ids=new Set(m2LayoutSymbols.map(s=>String(s.id)));let added=0,nextId=Date.now();
 m2PushUndo('Ayak koruma ekleme');
 for(const foot of feet){
  const {rack,point,localX,localY,key}=foot;
  if(point.x<left||point.x>right||point.y<top||point.y>bottom||occupied.has(key))continue;
  occupied.add(key);while(ids.has(String(nextId)))nextId++;const id=nextId++;ids.add(String(id));
  m2LayoutSymbols.push({id,type:draft.type,name:draft.type.toUpperCase()+' Ayak Koruma',rackId:rack.id,localX,localY,x:point.x-size/2,y:point.y-size/2,w:size,h:size,widthMm:sizeMm,depthMm:sizeMm,blocking:false,showDetails:false});added++;
 }
 if(!added)m2DiscardUndo();m2ProtectionDraft=null;document.getElementById('m2ProtectionButton')?.classList.remove('active');m2RenderLayout();
 document.getElementById('m2FloorStatus').textContent=added?'Taranan alandaki '+fmt(added)+' raf ayağına '+draft.type.toUpperCase()+' ayak koruma eklendi.':'Taranan ayakların korumaları zaten mevcut veya alanda korunacak raf ayağı bulunamadı.';
}

