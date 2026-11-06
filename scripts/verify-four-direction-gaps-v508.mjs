import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {transform} from './four-direction-gaps-v508.mjs';
const html=fs.readFileSync('dist/index.html','utf8');assert.equal(transform(html),html);
function cut(name){const i=html.indexOf('function '+name+'(');assert(i>=0,name);const rest=html.slice(i),next=rest.slice(10).search(/\n\s*function /),script=rest.indexOf('</script>');return rest.slice(0,script>=0?Math.min(next+10,script):next+10);}
const rack=(id,x,y,w=80,h=80,joinGroup)=>({id,x,y,w,h,joinGroup});
const owner=rack(1,100,200),racks=[owner,rack(2,0,200),rack(3,210,200),rack(4,100,0),rack(5,100,480),rack(6,100,-200),rack(7,300,0)];
const bounds=r=>({left:r.x,right:r.x+r.w,top:r.y,bottom:r.y+r.h,cx:r.x+r.w/2,cy:r.y+r.h/2});
const combined=r=>{const row=r.joinGroup?racks.filter(q=>q.joinGroup===r.joinGroup):[r],bs=row.map(bounds),left=Math.min(...bs.map(b=>b.left)),right=Math.max(...bs.map(b=>b.right)),top=Math.min(...bs.map(b=>b.top)),bottom=Math.max(...bs.map(b=>b.bottom));return{left,right,top,bottom,cx:(left+right)/2,cy:(top+bottom)/2}};
const table={racks,bounds:new Map(),walls:[],activeComputes:0};const state={racks,selected:1,scale:1},window={rafexStableGapLabelV366:{key:(a,b)=>'pair-gap:'+a+':'+b,position:(key,x,y)=>({x,y})}};
const c=vm.createContext({window,m2LayoutState:state,m2GapBoundsV346:bounds,m2CombinedGapBoundsV346:combined,m2PerfDistancePrepare:()=>{table.bounds=new Map(racks.map(r=>[r.id,bounds(r)]));return table},m2PerfDistanceLineCandidates:()=>racks.map(r=>r.id),m2RackClearanceMm:()=>0,m2SegmentsTouch:(a,b,p,q)=>{const cross=(u,v,w)=>(v.x-u.x)*(w.y-u.y)-(v.y-u.y)*(w.x-u.x);return cross(a,b,p)*cross(a,b,q)<0&&cross(p,q,a)*cross(p,q,b)<0},pinnedPairGaps:new Set(),m2NearestRackGap:()=>null,fmt:String});
vm.runInContext(['rackGapSearchV148','m2ClearRackGapLine','m2RackGapLineBlocked','pairCandidate','allPairs','m2RackDistanceGuide'].map(cut).join('\n'),c);
window.rafexRackGapRelationsV46=r=>c.rackGapSearchV148(r,combined(r),racks,bounds,c.m2ClearRackGapLine,()=>0,true);
let pairs=c.allPairs();assert.equal(pairs.length,4,'Both close side gaps must not hide front/back gaps');assert.deepEqual(Array.from(pairs,p=>p.direction).sort(),['bottom','left','right','top']);assert.equal((c.m2RackDistanceGuide(owner).match(/data-rack-gap=/g)||[]).length,4,'Native/drag renderer emits four guides');assert.equal(pairs.find(p=>p.direction==='top').b.id,4,'Only nearest aligned rack per direction');
table.walls=[{a:{x:80,y:150},b:{x:200,y:150}}];assert(!c.allPairs().some(p=>p.direction==='top'),'Do not measure a rack through a blocking wall');table.walls=[];
// A selected left-hand bay must still find a front rack aligned with its joined right-hand bay.
racks.splice(0,racks.length,rack(1,0,200,80,80,'row'),rack(2,80,200,80,80,'row'),rack(3,120,0,30,80),rack(4,200,200),rack(5,0,480));state.selected=1;
pairs=c.allPairs();const front=pairs.find(p=>p.direction==='top');assert(front,'Front rack aligned with joined row is retained');assert.equal(front.distance,120);assert.equal(front.ax,135);assert.equal(front.ay,200);assert.equal(front.by,80);
assert.equal(c.allPairs().some(p=>p.a.joinGroup&&p.a.joinGroup===p.b.joinGroup),false,'Never show a gap within the same joined row');
assert(html.includes('relations.slice(0,4)'));assert(!html.includes('mrGapRelations=m2ActiveModule==="mr"?(window.rafexRackGapRelationsV46?.(measurementRack)||[nearest]).filter(Boolean).slice(0,2)'));
console.log('PASS v508: four directions, side-vs-front/back ranking, nearest only, no diagonal/unobstructed-wall leaks, whole joined-row extents, editor/drag/MR display paths and idempotent syntax.');

