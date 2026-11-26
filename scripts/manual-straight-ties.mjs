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

function installManualTies(tiePoints,installedTies){
 const type='manual-straight-tie',label='Düz arabağ',ns='http://www.w3.org/2000/svg';
 const $=id=>document.getElementById(id);
 const points=r=>r.b2bLayout?tiePoints(r,m2B2BFootWidth(r),Number(m2LayoutState.scale)):[];
 const all=()=>installedTies(m2LayoutState.racks,points);
 let first=null,down=null;
 const status=text=>{const node=$('m2FloorStatus');if(node)node.textContent=text;};
 function clear(){first=down=null;$('m2LayoutSvg')?.querySelector('[data-tie-first]')?.remove();}
 function marker(point){
  const svg=$('m2LayoutSvg'),circle=document.createElementNS(ns,'circle');
  for(const [key,value] of Object.entries({cx:point.x,cy:point.y,r:4,fill:'#df710e',stroke:'#fff','vector-effect':'non-scaling-stroke','pointer-events':'none','data-tie-first':''}))circle.setAttribute(key,value);
  svg?.append(circle);
 }
 const tool=m2SetLayoutTool;
 m2SetLayoutTool=function(){clear();return tool.apply(this,arguments);};
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
  status('Düz arabağ: iki tek sıra rafın karşılıklı ayak köşelerine sırayla tıklayın. Aynı çifti tekrar seçmek bağlantıyı kaldırır. Esc ile bitirin.');
 };
 const inCanvas=e=>e.target.closest?.('#m2LayoutSvg');
 const stop=e=>{e.preventDefault();e.stopImmediatePropagation();};
 function pick(event){
  const group=event.target.closest?.('[data-rack]'),rack=group&&m2LayoutState.racks.find(r=>String(r.id)===group.dataset.rack);
  if(!rack)return null;
  const point=m2SvgPoint(event),corners=points(rack);
  let best=null,distance=Infinity;
  corners.forEach((p,index)=>{const d=Math.hypot(p.x-point.x,p.y-point.y);if(d<distance){best={rack,index,p};distance=d;}});
  return best;
 }
 function toggle(a,b){
  const matching=(entry,from,to)=>String(entry.ownerId)===String(from.rack.id)&&String(entry.peerId)===String(to.rack.id)&&entry.from===from.index&&entry.to===to.index;
  for(const [from,to] of [[a,b],[b,a]]){
   const ties=from.rack.manualStraightTies||[];
   const existing=ties.find(tie=>matching(tie,from,to));
   if(existing){m2PushUndo(label+' kaldır');from.rack.manualStraightTies=ties.filter(tie=>tie!==existing);return 'Bağlantı kaldırıldı.';}
  }
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
  if(!hit){status('Tek sıra B2B rafın bağlanacak ayak köşesini seçin.');return;}
  if(!first){first=hit;marker(hit.p);status('Şimdi karşıdaki tek sıra rafın ayak köşesini seçin.');return;}
  if(first.rack===hit.rack){status('Karşı bağlantı için başka bir tek sıra raf seçin.');return;}
  const message=toggle(first,hit);clear();m2RenderLayout();status(message);
 },true);
 for(const event of ['click','dblclick'])document.addEventListener(event,e=>{if(m2LayoutTool===type&&e.button===0&&inCanvas(e))stop(e);},true);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&m2LayoutTool===type){stop(e);m2SetLayoutTool(type);clear();}},true);
 window.rafexManualStraightTies={
  svg:()=>all().map(({a,b})=>'<line x1="'+a.x+'" y1="'+a.y+'" x2="'+b.x+'" y2="'+b.y+'" stroke="#b65714" stroke-width="3" vector-effect="non-scaling-stroke" pointer-events="none"><title>Düz arabağ</title></line>').join(''),
  rows:owners=>{
   const counts=new Map();
   for(const {tie} of all())if(!owners||owners.has(String(tie.ownerId)))counts.set(tie.length,(counts.get(tie.length)||0)+1);
   return [...counts].map(([length,qty])=>({name:label,spec:fmt(length)+' mm · Manuel',qty,unit:'AD'}));
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
 return html.slice(0,end)+'<script data-manual-straight-ties>('+function(tiePoints,installedTies,install){install(tiePoints,installedTies);}.toString()+')('+tiePoints.toString()+','+installedTies.toString()+','+installManualTies.toString()+');</script>'+html.slice(end);
}

if(/[\\/]manual-straight-ties\.mjs$/.test(process.argv[1]||'')){
 const file=process.argv[2]||'dist/index.html';
 fs.writeFileSync(file,transform(fs.readFileSync(file,'utf8')));
}
