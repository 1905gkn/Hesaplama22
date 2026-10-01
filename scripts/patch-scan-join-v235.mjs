import fs from 'node:fs';
export function rowOffset(rack,row){
 const l=rack.b2bLayout||{},rows=Number(l.rowCount)||1,frame=Number(l.frameDepth)||1100,pallet=Number(l.palletDepth)||frame,overhang=Number(l.palletOverhang)||0;
 const pitch=pallet+Math.max(0,(Number(l.rowGap)||0)-2*overhang),depth=Number(rack.depthMm)||pallet+(rows-1)*pitch;
 return -rack.h/2+(overhang+frame/2+row*pitch)*rack.h/depth;
}
export function rowAxis(rack,row){
 const rad=(Number(rack.angle)||0)*Math.PI/180;
 return -(rack.x+rack.w/2)*Math.sin(rad)+(rack.y+rack.h/2)*Math.cos(rad)+rowOffset(rack,row);
}
export function planScannedJoin(target,moving,scale,foot,fixed=[target]){
 const rad=(Number(target.angle)||0)*Math.PI/180,ux=Math.cos(rad),uy=Math.sin(rad);
 const along=r=>(r.x+r.w/2)*ux+(r.y+r.h/2)*uy,cross=r=>-(r.x+r.w/2)*uy+(r.y+r.h/2)*ux;
 const sign=moving.reduce((n,r)=>n+along(r)-along(target),0)<0?-1:1;
 // Continue the existing row through single bays; pointer position must never
 // flip subsequent doubles to the opposite side of that row.
 const reference=fixed.find(r=>Number(r.b2bLayout?.rowCount)===2);
 const lower=Number(target.b2bLayout?.rowCount)===1&&reference&&Math.abs(rowAxis(target,0)-rowAxis(reference,1))<Math.abs(rowAxis(target,0)-rowAxis(reference,0));
 const row=r=>lower?(Number(r.b2bLayout?.rowCount)||1)-1:0,axis=rowAxis(target,row(target));
 const ordered=moving.slice().sort((a,b)=>sign*(along(a)-along(b))||cross(a)-cross(b)||Number(a.id)-Number(b.id));
 let previous=target;const planned=[];
 for(const rack of ordered){
  const step=(previous.w+rack.w)/2-foot*scale;if(step<=0)throw Error('Modül genişliği ortak ayak için yetersiz.');
  const a=along(previous)+sign*step,c=axis-rowOffset(rack,row(rack));
  const next={...rack,x:ux*a-uy*c-rack.w/2,y:uy*a+ux*c-rack.h/2,sharedFootWith:previous.id,sharedFootSide:sign>0?'left':'right'};
  planned.push(next);previous=next;
 }
 return {planned,sign};
}
export function sharedRows(rack,racks){
 return Array.from({length:Number(rack.b2bLayout?.rowCount)||1},(_,row)=>sharedRow(rack,row,racks)).filter(Boolean).length;
}
export function sharedRow(rack,row,racks){
 const parent=racks.find(r=>r.id===rack.sharedFootWith);if(!parent)return false;
 return Array.from({length:Number(parent.b2bLayout?.rowCount)||1},(_,i)=>rowAxis(parent,i)).some(axis=>Math.abs(axis-rowAxis(rack,row))<.01);
}
export function installScannedJoin(){
 const status=t=>{const el=document.getElementById('m2FloorStatus');if(el)el.textContent=t;};
 const reset=()=>{m2JoinMode=false;m2JoinFirstRackId=null;m2ClearMultiSelection();document.getElementById('m2JoinRackButton')?.classList.remove('active');document.getElementById('m2JoinRackButton')?.setAttribute('aria-pressed','false');};
 m2ToggleJoinMode=function(){
  if(m2JoinMode){reset();status('Birleştirme iptal edildi.');m2RenderLayout();return;}
  m2ClearAllSelections();m2LayoutState.mode='idle';m2JoinMode=true;m2JoinFirstRackId=null;
  document.getElementById('m2JoinRackButton')?.classList.add('active');document.getElementById('m2JoinRackButton')?.setAttribute('aria-pressed','true');
  status('Önce sabit kalacak hedef modülü seç. Ardından eklenecek modülleri alan tarayarak seç.');m2RenderLayout();
 };
 m2ChooseJoinRack=function(id){
  const rack=m2LayoutState.racks.find(r=>r.id===id);
  if(!rack?.b2bLayout||rack.b2b?.mr){status('Birleştirmek için bir B2B modülü seç.');return;}
  m2JoinFirstRackId=id;m2LayoutState.selected=id;m2ClearMultiSelection();m2MultiSelect.active=true;
  document.getElementById('m2LayoutSvg')?.classList.add('m2-multi-selecting');
  status('Hedef seçildi. Fareyle alan tarayarak yanına birleştirilecek modülleri seç. Hedef sabit kalır; Birleştir düğmesi veya Esc iptal eder.');m2RenderLayout();
 };
 const original=m2CommitMultiSelection;
 m2CommitMultiSelection=function(){
  if(!m2JoinMode||m2JoinFirstRackId==null)return original.apply(this,arguments);
  const target=m2LayoutState.racks.find(r=>r.id===m2JoinFirstRackId),start=m2MultiSelect.start,end=m2MultiSelect.hover;
  if(!target||!start||!end)return;
  const left=Math.min(start.x,end.x),right=Math.max(start.x,end.x),top=Math.min(start.y,end.y),bottom=Math.max(start.y,end.y);
  const fixed=m2JoinedRackMembers(target),fixedIds=new Set(fixed.map(r=>r.id)),selected=new Set();
  m2LayoutState.racks.forEach(r=>{const b=m2RackBounds(r);if(!fixedIds.has(r.id)&&b.cx>=left&&b.cx<=right&&b.cy>=top&&b.cy<=bottom)selected.add(r.id);});
  const groups=new Set(m2LayoutState.racks.filter(r=>selected.has(r.id)).map(r=>r.joinGroup).filter(Boolean));
  m2LayoutState.racks.forEach(r=>{if(groups.has(r.joinGroup)&&!fixedIds.has(r.id))selected.add(r.id);});
  const moving=m2LayoutState.racks.filter(r=>selected.has(r.id));m2MultiSelect.start=null;m2MultiSelect.hover=null;
  const fail=t=>{status(t+' Yeniden tarayabilir veya Birleştir ile iptal edebilirsin.');m2RenderLayout();};
  if(!moving.length){fail('Tarama alanında eklenecek modül bulunamadı.');return;}
  const profile=r=>String(r.footProfile||r.footProfileKey||r.b2b?.footProfile||'').replace(/\s+/g,'').toLowerCase(),angle=r=>((Number(r.angle)||0)%360+360)%360;
  if(moving.some(r=>!r.b2bLayout||r.b2b?.mr||Math.abs(angle(r)-angle(target))>.1||!profile(r)||profile(r)!==profile(target)||m2B2BFootWidth(r)!==m2B2BFootWidth(target)||Math.abs(Number(r.b2bLayout.frameDepth)-Number(target.b2bLayout.frameDepth))>1)){
   fail('Birleşim için yön, çerçeve derinliği ve ayak profili aynı olmalı. Tekli ve çiftli sıralar birlikte seçilebilir.');return;
  }
  const rad=angle(target)*Math.PI/180,along=r=>(r.x+r.w/2)*Math.cos(rad)+(r.y+r.h/2)*Math.sin(rad),sign=moving.reduce((n,r)=>n+along(r)-along(target),0)<0?-1:1;
  const anchor=fixed.slice().sort((a,b)=>sign*(along(b)-along(a)))[0];
  let planned;try{planned=planScannedJoin(anchor,moving,m2LayoutState.scale,m2B2BFootWidth(target),fixed).planned;}catch(e){fail(e.message);return;}
  const ids=[...fixedIds,...selected];
  if(planned.some(r=>!m2RackInsideArea(r,r.x,r.y,r.angle)||m2RackOverlapsExcept(r,r.x,r.y,r.angle,ids))){fail('Birleşim konumunda duvar, kolon veya başka raf var; hiçbir modül taşınmadı.');return;}
  m2PushUndo('Taranan modülleri hedefe birleştir');const group=target.joinGroup||'join-scan-'+Date.now();fixed.forEach(r=>r.joinGroup=group);
  planned.forEach(p=>{const r=m2LayoutState.racks.find(r=>r.id===p.id);Object.assign(r,{x:p.x,y:p.y,sharedFootWith:p.sharedFootWith,sharedFootSide:p.sharedFootSide,joinGroup:group,locked:true,freePlacement:false,staged:false});});
  reset();m2LayoutState.selected=target.id;m2RenderLayout();status(moving.length+' modül hedefin yanına kaydırılıp ortak ayakla birleştirildi.');
 };
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&m2JoinMode){reset();status('Birleştirme iptal edildi.');m2RenderLayout();}});
}
export function transform(html){
 if(html.includes('data-scan-join="v235"'))return html;
 html=html.replace('if(hasSelection)m2ClearAllSelections(', 'if(hasSelection&&!(m2JoinMode&&target?.closest?.("#m2LayoutSvg")))m2ClearAllSelections(');
 html=html.replaceAll('rack.sharedFootWith?rowCount:0','sharedRows(rack,m2LayoutState.racks)');
 html=html.replaceAll('rack.sharedFootWith?rows:0','sharedRows(rack,m2LayoutState.racks)');
 html=html.replaceAll('item.sharedFootWith ? (Number(item.b2bLayout.rowCount) || 1) : 0','sharedRows(item,m2LayoutState.racks)');
 html=html.replace('rack&&rack.id,rackSystem(rack),','rack&&rack.id,rack&&rack.sharedFootWith,rackSystem(rack),');
 html=html.replaceAll('rowCount===2?footTeams/rowCount:0','rowCount===2?2-(sharedRows(rack,m2LayoutState.racks)===2?1:0):0');
 const hide='if (rack.sharedFootSide !== side)';if(!html.includes(hide))throw Error('Shared upright anchor missing');
 html=html.replace(hide,'if (rack.sharedFootSide !== side || !sharedRow(rack,row,m2LayoutState.racks))');
 const at=html.lastIndexOf('</body>');if(at<0)throw Error('Body missing');
 return html.slice(0,at)+'<script data-scan-join="v235">'+rowOffset.toString()+'\n'+rowAxis.toString()+'\n'+sharedRows.toString()+'\n'+sharedRow.toString()+'\n'+planScannedJoin.toString()+'\n('+installScannedJoin.toString()+')();</script>'+html.slice(at);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-scan-join-v235.mjs')){
 const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}
