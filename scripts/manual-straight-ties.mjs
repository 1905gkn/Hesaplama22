import fs from 'node:fs';

export function tiePoints(rack, footWidth, scale){
 if(!rack?.b2bLayout||rack.b2b?.mr||rack.plan?.mr||rack.rafexSystem==='mr'||Number(rack.b2bLayout.rowCount||1)!==1||rack.b2b?.rowType==='double')return [];
 const {w,h,x,y}=rack,layout=rack.b2bLayout;
 const frameDepth=Number(layout.frameDepth)*scale,overhang=Number(layout.palletOverhang||0)*scale;
 if(![w,h,x,y,frameDepth,overhang,footWidth].every(Number.isFinite)||w<=0||h<=0||frameDepth<=0)return [];
 const angle=(Number(rack.angle)||0)*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle);
 const offset=Math.min(w/2,footWidth*scale/2);
 return [[offset,overhang],[w-offset,overhang],[offset,overhang+frameDepth],[w-offset,overhang+frameDepth]].map(([u,v])=>{
  const dx=u-w/2,dy=v-h/2;
  return {x:x+w/2+dx*c-dy*s,y:y+h/2+dx*s+dy*c};
 });
}

export function installedTies(racks,points){
 const owners=racks.filter(r=>r.manualStraightTies?.length);
 if(!owners.length)return [];
 const byId=new Map(racks.map(r=>[String(r.id),r])),result=[];
 for(const rack of owners)for(const tie of rack.manualStraightTies){
  if(String(tie.ownerId)!==String(rack.id))continue;
  const peer=byId.get(String(tie.peerId));
  if(!peer||peer===rack)continue;
  const a=points(rack)[tie.from],b=points(peer)[tie.to];
  if(a&&b&&Number.isFinite(tie.length)&&tie.length>0)result.push({a,b,tie});
 }
 return result;
}

export function pickTiePair(p,racks,points,tolerance){
 const nearby=[];
 for(const rack of racks){
  const angle=(Number(rack.angle)||0)*Math.PI/180;
  points(rack).forEach((q,index)=>{const side=index<2?-1:1;nearby.push({rack,p:q,index,nx:-side*Math.sin(angle),ny:side*Math.cos(angle),distance:Math.hypot(p.x-q.x,p.y-q.y)});});
 }
 nearby.sort((a,b)=>a.distance-b.distance);nearby.length=Math.min(nearby.length,32);
 let best=null,rank=Infinity;
 for(let i=0;i<nearby.length;i++)for(let j=i+1;j<nearby.length;j++){
  const a=nearby[i],b=nearby[j],dx=b.p.x-a.p.x,dy=b.p.y-a.p.y,length=Math.hypot(dx,dy);
  if(a.rack===b.rack||!length||a.nx*b.nx+a.ny*b.ny>-.995||(dx*a.nx+dy*a.ny)/length<.995)continue;
  const t=((p.x-a.p.x)*dx+(p.y-a.p.y)*dy)/(length*length);if(t<-.1||t>1.1)continue;
  const distance=Math.hypot(p.x-a.p.x-t*dx,p.y-a.p.y-t*dy),score=distance+length*.001;
  if(distance<=tolerance&&score<rank){rank=score;best={a,b};}
 }
 return best;
}

export function automaticTieSegments(rack,footWidth,scale,plan,shared){
 const l=rack.b2bLayout;if(!l||!(plan.count>0)||!(plan.length>0))return [];
 const y=(Number(l.palletOverhang||0)+Number(l.frameDepth))*scale, angle=(Number(rack.angle)||0)*Math.PI/180;
 const c=Math.cos(angle),s=Math.sin(angle),offset=Math.min(rack.w/2,footWidth*scale/2);
 const point=(x,v)=>{const dx=x-rack.w/2,dy=v-rack.h/2;return{x:rack.x+rack.w/2+dx*c-dy*s,y:rack.y+rack.h/2+dx*s+dy*c};};
 return [offset,rack.w-offset].flatMap((x,i)=>shared&&rack.sharedFootSide===(i?"right":"left")?[]:[{a:point(x,y),b:point(x,y+plan.length*scale),tie:{length:plan.length}}]);
}

function installManualTies(tiePoints,installedTies,pickTiePair,automaticTieSegments){
 const type='manual-straight-tie',label='Düz arabağ';
 const $=id=>document.getElementById(id);
 const points=r=>r.b2bLayout?tiePoints(r,m2B2BFootWidth(r),Number(m2LayoutState.scale)):[];
 const all=()=>installedTies(m2LayoutState.racks,points);
 let down=null;
 const doubleRacks=()=>m2LayoutState.racks.filter(r=>r.b2bLayout&&!r.b2b?.mr&&!r.plan?.mr&&(Number(r.b2bLayout.rowCount)===2||r.b2b?.rowType==='double'));
 const status=text=>{const node=$('m2FloorStatus');if(node)node.textContent=text;};
 function clear(){down=null;}
 const tool=m2SetLayoutTool;
 m2SetLayoutTool=function(){const wasActive=m2LayoutTool===type;clear();const result=tool.apply(this,arguments);if(wasActive!==(m2LayoutTool===type))m2RenderLayout();return result;};
 const open=m2OpenProtectionDialog;
 m2OpenProtectionDialog=function(){
  const choices=$('m2ProtectionModal')?.querySelector('.m2-symbol-choices');
  if(choices&&!choices.querySelector('[data-protection-choice="'+type+'"]')){
   const button=document.createElement('button');button.type='button';button.className='m2-protection-choice';button.dataset.protectionChoice=type;
   button.textContent=label;button.onclick=()=>m2ChooseProtection(type);choices.append(button);
  }
  return open.apply(this,arguments);
 };
 const start=m2StartProtectionPlacement;
 m2StartProtectionPlacement=function(){
  if(m2ProtectionChoice!==type)return start.apply(this,arguments);
  if(window.rafexCanEditProjectV134?.()===false)return;
  m2ProtectionDraft=null;m2CloseProtectionDialog();
  if(m2LayoutTool!==type)m2SetLayoutTool(type);else clear();
  status('Düz arabağ: rafların arasındaki bağlantı yerine tıklayın. Shift ile tıklayarak manuel bağlantıyı kaldırın. Esc ile bitirin.');
 };
 const inCanvas=e=>e.target.closest?.('#m2LayoutSvg');
 const stop=e=>{e.preventDefault();e.stopImmediatePropagation();};
 function pick(event){
  const matrix=$('m2LayoutSvg')?.getScreenCTM(), zoom=matrix?Math.hypot(matrix.a,matrix.b):1;
  return pickTiePair(m2SvgPoint(event),m2LayoutState.racks,points,12/Math.max(.001,zoom));
 }
 function toggle(a,b,remove){
  const matching=(entry,from,to)=>String(entry.ownerId)===String(from.rack.id)&&String(entry.peerId)===String(to.rack.id)&&entry.from===from.index&&entry.to===to.index;
  for(const [from,to] of [[a,b],[b,a]]){
   const ties=from.rack.manualStraightTies||[];
   const existing=ties.find(tie=>matching(tie,from,to));
   if(existing){if(!remove)return "Bu noktada düz arabağ zaten var.";m2PushUndo(label+' kaldır');from.rack.manualStraightTies=ties.filter(tie=>tie!==existing);return 'Bağlantı kaldırıldı.';}
  }
  if(remove)return "Bu noktada kaldırılacak manuel bağlantı yok.";
  const scale=Number(m2LayoutState.scale),length=Math.round(Math.hypot(b.p.x-a.p.x,b.p.y-a.p.y)/scale);
  if(!Number.isFinite(length)||length<=0)return 'İki ayrı bağlantı noktası seçin.';
  m2PushUndo(label+' ekle');
  a.rack.manualStraightTies=[...(a.rack.manualStraightTies||[]),{ownerId:a.rack.id,peerId:b.rack.id,from:a.index,to:b.index,length}];
  return label+' eklendi · '+fmt(length)+' mm.';
 }
 document.addEventListener('pointerdown',e=>{
  if(m2LayoutTool!==type||e.button!==0||!inCanvas(e))return;
  down={x:e.clientX,y:e.clientY};stop(e);
 },true);
 document.addEventListener('pointerup',e=>{
  if(m2LayoutTool!==type||!down)return;
  const press=down;down=null;stop(e);
  if(!inCanvas(e)||Math.hypot(e.clientX-press.x,e.clientY-press.y)>8)return;
  if(window.rafexCanEditProjectV134?.()===false){clear();return;}
  const hit=pick(e);
  if(!hit){status("İki tek sıra rafın karşılıklı ayakları arasına tıklayın.");return;}
  const message=toggle(hit.a,hit.b,e.shiftKey);clear();m2RenderLayout();status(message);
 },true);
 for(const event of ['click','dblclick'])document.addEventListener(event,e=>{if(m2LayoutTool===type&&e.button===0&&inCanvas(e))stop(e);},true);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&m2LayoutTool===type){stop(e);m2SetLayoutTool(type);clear();}},true);
 window.rafexManualStraightTies={
  svg:()=>{
   const draw=({a,b},color)=>'<line x1="'+a.x+'" y1="'+a.y+'" x2="'+b.x+'" y2="'+b.y+'" stroke="'+color+'" stroke-width="3" vector-effect="non-scaling-stroke" pointer-events="none"><title>Düz arabağ</title></line>';
   const manual=all().map(item=>draw(item,"#b65714")).join("");
   if(m2LayoutTool!==type||window.rafexViewportV248?.exporting)return manual;
   return doubleRacks().flatMap(r=>automaticTieSegments(r,m2B2BFootWidth(r),Number(m2LayoutState.scale),b2bStraightTiePlan(r),sharedRows(r,m2LayoutState.racks)===2)).map(item=>draw(item,"#138073")).join("")+manual;
  },
  rows:owners=>{
   const counts=new Map();
   for(const {tie} of all())if(!owners||owners.has(String(tie.ownerId)))counts.set(tie.length,(counts.get(tie.length)||0)+1);
   if(!counts.size)return [];
   const existing=new Map(doubleRacks().map(r=>{const plan=b2bStraightTiePlan(r);return [plan.length,plan];}));
   return [...counts].map(([length,qty])=>{const plan=existing.get(length);return {name:label,spec:plan?fmt(length)+' × '+fmt(plan.width)+' mm · galvaniz':fmt(length)+' mm · Manuel',qty,unit:'AD'};});
  }
 };
}

export function transform(html){
 if(html.includes('data-manual-straight-ties'))return html;
 const replace=(before,after)=>{if(!html.includes(before))throw Error('Manual tie anchor missing: '+before);html=html.replace(before,()=>after);};
 const paint='html += window.rafexBackMeshV482?.svg() || "";';
 replace(paint,paint+'\n        html += window.rafexManualStraightTies?.svg() || "";');
 const layoutRows='barriers.forEach((qty,spec)=>add("Bariyer koruma",qty,spec));';
 replace(layoutRows,layoutRows+'\n        for(const row of window.rafexManualStraightTies?.rows()||[])add(row.name,row.qty,row.spec,row.unit);');
 const bom='result.push(...(window.rafexBackMeshV482?.rows()||[]));';
 replace(bom,bom+'\n    result.push(...(window.rafexManualStraightTies?.rows(regionScopeV179?new Set([...regionScopeV179.racks].map(String)):null)||[]));');
 const key='JSON.stringify(rack&&rack.backMeshSides||[])';
 replace(key,key+',JSON.stringify(rack&&rack.manualStraightTies||[])');
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('Missing body');
 return html.slice(0,end)+'<script data-manual-straight-ties>('+installManualTies.toString()+')('+[tiePoints,installedTies,pickTiePair,automaticTieSegments].map(fn=>fn.toString()).join(',')+');</script>'+html.slice(end);
}

if(/[\\/]manual-straight-ties\.mjs$/.test(process.argv[1]||'')){
 const file=process.argv[2]||'dist/index.html';
 fs.writeFileSync(file,transform(fs.readFileSync(file,'utf8')));
}
