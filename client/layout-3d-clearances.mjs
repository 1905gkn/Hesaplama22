import {planWallSegments} from './layout-3d-environment.mjs';
const labelMm=mm=>Math.round(mm).toLocaleString('tr-TR')+' mm';
const finite=(...v)=>v.every(x=>Number.isFinite(Number(x)));
const directions={left:'SOL DUVAR',right:'SAĞ DUVAR',top:'ÜST DUVAR',bottom:'ALT DUVAR'};
function wallAt(state,x,y){
 for(const {a,b} of planWallSegments(state)){const dx=b.x-a.x,dy=b.y-a.y,length=dx*dx+dy*dy;if(!length)continue;const t=Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy)/length));if(Math.hypot(x-a.x-t*dx,y-a.y-t*dy)<=1.1)return true;}return false;
}
export function readRackClearances(state,id,{walls,gaps}){
 const scale=Number(state.scale);if(!(scale>0))return [];const rack=state.racks.find(r=>String(r.id)===String(id));if(!rack)return [];
 const unit=1/(scale*1000),out=[];
 const add=(key,label,mm,x1,y1,x2,y2,ids)=>{if(!finite(mm,x1,y1,x2,y2)||Number(mm)<0)return;out.push({key,kind:key.startsWith('wall:')?'wall':'pair',label:labelMm(mm),mm:Number(mm),rackIds:ids.map(String),a:[Number(x1)*unit,.12,Number(y1)*unit],b:[Number(x2)*unit,.12,Number(y2)*unit]});};
 if(planWallSegments(state).length){let measures={};try{measures=walls(rack)||{}}catch{}
  for(const [direction,m] of Object.entries(measures)){if(!directions[direction])continue;const endpoint=direction==='left'||direction==='top'?[m.x1,m.y1]:[m.x2,m.y2];if(!wallAt(state,...endpoint))continue;add('wall:'+id+':'+direction,directions[direction],Math.round(m.px/scale),m.x1,m.y1,m.x2,m.y2,[id]);}
 }
 let relations=[];try{relations=gaps(rack)||[]}catch{}
 for(const gap of relations){const other=gap.other?.id;if(other==null||String(other)===String(id))continue;
  // Same formula as pairMm in the plan, including the selected pallet/frame basis.
  const mm=Math.max(0,Math.round(gap.distance/scale)-Number(gap.clearanceMm||0));const key='pair:'+([String(id),String(other)].sort().join(':'));
  add(key,'',mm,gap.ax,gap.ay,gap.bx,gap.by,[id,other]);
 }
 return out;
}
export function visiblePlanClearances(root,scale){
 if(!root||!(scale>0))return [];const unit=1/(scale*1000),out=[];
 for(const group of root.querySelectorAll('.m2-wall-guide,.rafex-common-pair-gap,[data-rack-gap]')){
  if(!group.getClientRects().length)continue;const wall=group.hasAttribute('data-wall-guide'),line=group.querySelector(wall?'line.m2-wall-distance':'line.m2-rack-distance'),text=group.querySelector('text');if(!line||!text)continue;
  const coordinates=['x1','y1','x2','y2'].map(n=>Number(line.getAttribute(n)));if(!finite(...coordinates))continue;
  const a=group.getAttribute('data-gap-a'),b=group.getAttribute('data-gap-b'),id=group.getAttribute('data-wall-rack'),direction=group.getAttribute('data-wall-guide');
  const mm=wall?Number(text.textContent.replace(/[^0-9.,-]/g,'').replaceAll('.','').replace(',','.')):Number(group.getAttribute('data-rack-gap'));if(!Number.isFinite(mm)||mm<0)continue;
  const ids=wall?[id]:[a,b];if(ids.some(id=>id==null))continue;
  out.push({key:wall?'wall:'+id+':'+direction:'pair:'+ids.slice().sort().join(':'),rackIds:ids.map(String),mm,kind:wall?'wall':'pair',label:labelMm(mm),a:[coordinates[0]*unit,.12,coordinates[1]*unit],b:[coordinates[2]*unit,.12,coordinates[3]*unit]});
 }
 return out;
}
export function layoutClearances(data,id){
 const unique=new Map();for(const d of [...(data.getClearances?.(id)||data.clearancesByRack?.[String(id)]||[]),...(data.visibleClearances||[])])unique.set(d.key,d);
 return [...unique.values()];
}
