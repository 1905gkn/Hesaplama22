import assert from 'node:assert/strict';
import {buildNavigation,createTraffic,navigationSpace,HALF_LENGTH,HALF_WIDTH,SEPARATION} from '../client/forklift-navigation.mjs';
let seed=1234;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const ring=[{x:0,z:0},{x:40,z:0},{x:40,z:34},{x:0,z:34}];
const data={floorLoops:[ring],racks:Array.from({length:4},(_,i)=>({x:20,z:6+i*7,width:26,depth:2,angle:0})),symbols:[]};
const parts=[{kind:'column',x:4,z:14,w:1,d:1,ry:Math.PI/4}],nav=await buildNavigation(data,parts),traffic=createTraffic(nav,3,random);
assert.equal(traffic.agents.length,3);const starts=traffic.agents.map(a=>({x:a.x,z:a.z}));
let travelled=0,aisleTicks=0,totalTicks=0;
assert(nav.aisles.length>0);assert(traffic.agents.every(a=>nav.nodes[a.node].aisle),'vehicles must start between racks');
for(let i=0;i<18000;i++){const before=traffic.agents.map(a=>({x:a.x,z:a.z}));traffic.step(.05);for(let j=0;j<traffic.agents.length;j++){const a=traffic.agents[j];totalTicks++;if(nav.nodes[a.node].aisle)aisleTicks++;travelled+=Math.hypot(a.x-before[j].x,a.z-before[j].z);const sin=Math.abs(Math.sin(a.angle)),cos=Math.abs(Math.cos(a.angle));if(sin<1e-6||cos<1e-6)assert(nav.space.boxFree(a.x,a.z,sin>.5?HALF_WIDTH:HALF_LENGTH,sin>.5?HALF_LENGTH:HALF_WIDTH),'footprint entered rack/column/outside area');else assert(nav.space.turnFree(a.x,a.z),'turn without swept clearance');for(let k=j+1;k<traffic.agents.length;k++)assert(Math.hypot(a.x-traffic.agents[k].x,a.z-traffic.agents[k].z)>=SEPARATION-1e-8,'forklifts overlap');}}
assert(travelled>100,'fleet failed to move');assert(aisleTicks/totalTicks>.6,'vehicles spend too much time outside rack aisles');assert(traffic.agents.some(a=>Math.abs(a.wheelTravel)>.5),'wheel motion must follow travel');
const narrow={floorLoops:[[{x:0,z:0},{x:30,z:0},{x:30,z:2.2},{x:0,z:2.2}]],racks:[],symbols:[]},narrowNav=await buildNavigation(narrow);assert(createTraffic(narrowNav,1,random).agents.length===1);assert(narrowNav.nodes.every(n=>n.edges.every(id=>narrowNav.nodes[id].axis===n.axis)),'turn permitted in narrow corridor');
const tiny=await buildNavigation({floorLoops:[[{x:0,z:0},{x:2,z:0},{x:2,z:1},{x:0,z:1}]],racks:[]});assert.equal(createTraffic(tiny).agents.length,0);
assert.equal(await buildNavigation(data,parts,{cancelled:()=>true}),null);
const rotated=navigationSpace({racks:[{x:0,z:0,width:8,depth:2,angle:Math.PI/4}],symbols:[]});assert(!rotated.boxFree(0,0,HALF_LENGTH,HALF_WIDTH));
const huge=await buildNavigation({racks:[{x:0,z:0,width:1,depth:1},{x:1000,z:1000,width:1,depth:1}]});assert(huge.nodes.length<=26000);
console.log('PASS: 15 minutes, 3 vehicles, no rack/rotated-column/boundary/vehicle collisions; narrow-corridor reverse travel; no-space case; cancellation; bounded navigation grid.',{travelled:Math.round(travelled),nodes:nav.nodes.length,aislePercent:Math.round(aisleTicks/totalTicks*100)});

