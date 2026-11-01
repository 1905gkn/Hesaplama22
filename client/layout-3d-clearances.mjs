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
 if(!root||!(scale>0))return [];const unit=1/(scale*1000),out=[],capturedText=new Set();
 for(const group of root.querySelectorAll('.m2-wall-guide,.rafex-common-pair-gap,[data-rack-gap]')){
  if(!group.getClientRects().length)continue;const wall=group.hasAttribute('data-wall-guide'),line=group.querySelector(wall?'line.m2-wall-distance':'line.m2-rack-distance'),text=group.querySelector('text');if(!line||!text)continue;
  const coordinates=['x1','y1','x2','y2'].map(n=>Number(line.getAttribute(n)));if(!finite(...coordinates))continue;
  const a=group.getAttribute('data-gap-a')??group.getAttribute('data-rack-gap-owner'),b=group.getAttribute('data-gap-b')??group.getAttribute('data-rack-gap-other'),id=group.getAttribute('data-wall-rack'),direction=group.getAttribute('data-wall-guide');
  const mm=wall?Number(text.textContent.replace(/[^0-9.,-]/g,'').replaceAll('.','').replace(',','.')):Number(group.getAttribute('data-rack-gap'));if(!Number.isFinite(mm)||mm<0)continue;
  const ids=wall?[id]:[a,b];if(ids.some(id=>id==null))continue;
  out.push({key:wall?'wall:'+id+':'+direction:'pair:'+ids.slice().sort().join(':'),rackIds:ids.map(String),mm,kind:wall?'wall':'pair',label:labelMm(mm),a:[coordinates[0]*unit,.12,coordinates[1]*unit],b:[coordinates[2]*unit,.12,coordinates[3]*unit]});capturedText.add(text);
 }
 const known=new Set(out.map(d=>d.key));
 for(const text of root.querySelectorAll('text[data-dimension-key],text.m2-between-text')){
  if(capturedText.has(text)||!text.getClientRects().length)continue;const style=globalThis.getComputedStyle?.(text);if(style&&(style.display==='none'||style.visibility==='hidden'))continue;
  const group=text.closest('.m2-free-measure,[data-between-overlay],.m2-wall-guide,.m2-distance-guide'),key=text.getAttribute('data-dimension-key')||group?.querySelector('[data-dimension-key]')?.getAttribute('data-dimension-key');if(!key||known.has(key))continue;
  const label=(text.textContent||'').trim();if(!label||!/[0-9]/.test(label))continue;
  try{const inverse=root.getScreenCTM().inverse(),point=(node,x,y)=>{const m=inverse.multiply(node.getScreenCTM());return [(m.a*x+m.c*y+m.e)*unit,.12,(m.b*x+m.d*y+m.f)*unit];},at=point(text,Number(text.getAttribute('x')),Number(text.getAttribute('y'))),line=group?.querySelector('line.m2-free-measure-line,line.m2-between-line,line.m2-wall-distance,line.m2-rack-distance');
   const a=line?point(line,Number(line.getAttribute('x1')),Number(line.getAttribute('y1'))):at,b=line?point(line,Number(line.getAttribute('x2')),Number(line.getAttribute('y2'))):at;if(![...a,...b,...at].every(Number.isFinite))continue;
   out.push({key,kind:'saved',label,a,b,at,labelOnly:!line,rackIds:[]});known.add(key);
  }catch{}
 }
 return out;
}
export function layoutClearances(data,id){
 const unique=new Map();for(const d of [...(data.getClearances?.(id)||data.clearancesByRack?.[String(id)]||[]),...(data.visibleClearances||[])])unique.set(d.key,d);
 return [...unique.values()];
}

