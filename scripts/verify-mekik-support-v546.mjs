import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {layoutSnapshot} from '../client/layout-3d-data.mjs';
import {rackParts} from '../client/layout-3d-geometry.mjs';
import {cadPlacements} from '../client/layout-3d-cad.mjs';
import {mekikStepped,upgradeMekikStepped} from '../client/mekik-stepped.mjs';
const source=fs.readFileSync(new URL('../client/depth-join-v523.js',import.meta.url),'utf8');
const start=source.indexOf('      function m2JoinedDepthPlan('),end=source.indexOf('      function m2DepthJoinDrawing(');
const context={};vm.runInNewContext(source.slice(start,end)+';this.plan=m2JoinedDepthPlan;',context);
const anchor={rafexSystem:'mekik2',plan:{feet:[1200,1200,1200],braces:[1200,1200]}};
for(const end of [2600,2650,3000]){const joined=context.plan(anchor,end);assert.equal(joined.hasExtra,true);assert.equal(joined.depthMm,end);assert.deepEqual(Array.from(joined.plan.feet),[1200]);assert.equal(joined.plan.braces[0],end-1200);}
assert.equal(context.plan({...anchor,rafexSystem:'drive'},2600).depthMm,3600,'Drive-In keeps its native full-frame rule');
for(const end of [1299,1300])assert.equal(context.plan(anchor,end).hasExtra,false,'Preserve up-to-100mm native tail');
const templates={mekikPost:{height:5,width:.1,postCenters:[.02]},mekikBeam:{height:.05,railBearings:[{y:-.146}],mountHalfSpan:.675}};
const raw={id:1,rafexSystem:'mekik2',bays:7,levels:4,depth:3,palW:1200,palD:800,palletHeight:1200,firstRailHeight:430,levelH:1500,footType:100,widthMm:10600,totalWidth:10600,depthMm:3100,railLength:3100,sideUprightHeight:5600,totalRackHeight:5600,hasExtra:true,plan:{feet:[1200,1200],braces:[500,200]},palletPositions:[0,1000,1850],x:0,y:0,w:10600,h:3100};
for(const custom of [false,true]){
 const drawing={...raw,...(custom?{mekikCustomizationV514:{depths:[3,3,3,3]}}:{})};
 const snap=layoutSnapshot({scale:1,points:[],racks:[drawing]}).racks[0],plain={...snap,hasExtra:false};
 const cad=cadPlacements(snap,templates),without=cadPlacements(plain,templates),terminal=(snap.depth-snap.foot)/2;
 assert.equal(cad.filter(p=>p.name==='mekikPost').length-without.filter(p=>p.name==='mekikPost').length,8,'One terminal profile per upright row');
 assert.equal(cad.filter(p=>p.name==='mekikPost'&&Math.abs(p.z-terminal)<1e-8).length,8);
 assert.equal(rackParts(snap).filter(p=>p.kind==='foot').length-rackParts(plain).filter(p=>p.kind==='foot').length,8,'Fallback and native show the same terminal profiles');
 const parts=rackParts(snap,{cad:true}),ties=parts.filter(p=>p.kind==='tie');
 assert.equal(ties.length,2*2*8,'Exactly one top and bottom horizontal tie on each complete frame');
 assert(!ties.some(p=>p.z+p.d/2>1.35+1e-8),'No invented braced frame connects to the terminal profile');
 for(const tie of ties)assert(Math.abs(tie.y-.15)<1e-8||Math.abs(tie.y-(snap.height-.15))<1e-8);
 const terminalBeams=cad.filter(p=>p.name==='mekikBeam'&&p.z>terminal);
 assert.equal(terminalBeams.length,7*4,'Terminal profile carries traverses at all supported levels');
 const shared={...snap,depthSharedSupport:{side:'left',feet:[],braces:[],extra:true,intervals:[]}};
 assert.equal(cadPlacements(shared,templates).filter(p=>p.name==='mekikPost'&&Math.abs(p.z-terminal)<1e-8).length,7,'Only a physically shared terminal profile is suppressed');
 if(custom){const model=mekikStepped(drawing);assert.equal(model.frames.length,2);assert.equal(model.rows.find(p=>p.name==='Ayak Profili').qty,8);const saved=structuredClone(snap);for(const floor of saved.mekikStepped.floors)for(const run of floor.runs){run.end=2650;run.stations=run.stations.filter(at=>at<3000);}const before=JSON.stringify(saved),fixed=upgradeMekikStepped(saved);assert.equal(JSON.stringify(saved),before);assert(fixed.mekikStepped.floors.every(f=>f.runs.at(-1).stations.includes(3050)));assert.equal(upgradeMekikStepped(fixed),fixed);}
}
console.log('PASS v546: joined shuttle ends with one profile, native/fallback 3D and CAD traverses agree, shared owner deduplicated, full frames alone receive top/bottom ties, Drive-In and 100mm rules preserved.');
