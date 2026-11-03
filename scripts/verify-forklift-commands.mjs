import assert from 'node:assert/strict';
import {buildNavigation,createTraffic,HALF_LENGTH,HALF_WIDTH} from '../client/forklift-navigation.mjs';
const data={floorLoops:[[{x:0,z:0},{x:40,z:0},{x:40,z:34},{x:0,z:34}]],racks:Array.from({length:4},(_,i)=>({x:20,z:6+i*7,width:26,depth:2,angle:0})),symbols:[]};
const before=JSON.stringify(data),nav=await buildNavigation(data),traffic=createTraffic(nav,1,()=>.4),a=traffic.agents[0];
assert.equal(traffic.command(0,20,6).accepted,false,'rack target accepted');
assert.equal(traffic.command(0,-2,10).accepted,false,'outside target accepted');
assert.equal(traffic.command(9,2,2).accepted,false);
traffic.step(.1);assert(a.target);
const target=nav.nodes.filter(n=>n.component===nav.nodes[a.node].component&&n.aisleRun!==a.reservedRun).sort((p,q)=>Math.hypot(p.x-a.x,p.z-a.z)-Math.hypot(q.x-a.x,q.z-a.z))[0];
assert(target);const result=traffic.command(0,target.x,target.z);assert(result.accepted);assert(a.manualPending,'moving command must wait for next safe node');
let arrived=false,last=[a.x,a.z];
for(let i=0;i<18000;i++){traffic.step(.05);assert(Math.hypot(a.x-last[0],a.z-last[1])<=.85*.05+1e-7,'command teleported vehicle');last=[a.x,a.z];
 const sin=Math.abs(Math.sin(a.angle)),cos=Math.abs(Math.cos(a.angle));if(sin<1e-6||cos<1e-6)assert(nav.space.boxFree(a.x,a.z,sin>.5?HALF_WIDTH:HALF_LENGTH,sin>.5?HALF_LENGTH:HALF_WIDTH));else assert(nav.space.turnFree(a.x,a.z));
 if(!a.manualPending&&a.manualGoal==null&&Math.hypot(a.x-result.point.x,a.z-result.point.z)<.01){arrived=true;break;}}
assert(arrived,'manual destination not reached');const at=[a.x,a.z];for(let i=0;i<400;i++)traffic.step(.05);assert(Math.hypot(a.x-at[0],a.z-at[1])>1,'automatic roaming did not resume');assert.equal(JSON.stringify(data),before);
console.log('PASS: manual destination, safe mid-edge redirect, invalid targets, no teleport/collision, automatic resume, source unchanged.');
