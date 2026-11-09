import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {rackEnds556,groupEnds556,transform} from './rack-endpoint-alignment-v556.mjs';
const base={id:1,x:0,y:0,w:100,h:20,angle:0};
for(const angle of [0,90,180,270]){const ends=rackEnds556({...base,angle});assert.equal(ends.length,4);assert.ok(ends.every(p=>Number.isFinite(p.x+p.y)));assert.ok(Math.abs(Math.hypot(ends[1].x-ends[0].x,ends[1].y-ends[0].y)-100)<1e-8);}
const row=[{...base,joinGroup:'g'},{...base,id:2,x:100,joinGroup:'g'},{...base,id:3,x:200,joinGroup:'g'}],origins=row.map(({id,x,y})=>({id,x,y}));const ends=groupEnds556(row,origins,true);assert.equal(ends.length,4);assert.ok(ends.every(p=>p.x===0||p.x===300));
const runtime=fs.readFileSync(new URL('./foot-center-alignment-v334.js',import.meta.url),'utf8'),fixture='<body><script data-rack-alignment="v249">'+runtime+'</script></body>',html=transform(fixture);assert.equal(transform(html),html);const code=html.match(/<script[^>]*>([\s\S]*?)<\/script>/)[1];new vm.Script(code);
// Drive the actual drag wrapper with a middle grab, unequal sizes and a different system.
const source={...base},target={id:2,x:200,y:100,w:80,h:60,angle:0},state={racks:[source,target],scale:.013},window={addEventListener(){}};let allowed=true,calls=0;
const svg={getScreenCTM:()=>({a:1,b:0,c:0,d:1,e:0,f:0}),append(n){n.isConnected=true;n.parentNode=this;}},document={addEventListener(){},querySelector:()=>null,getElementById:()=>svg,createElementNS:()=>({setAttribute(){},remove(){this.isConnected=false;}})};
const sandbox={window,document,m2LayoutState:state,m2SvgPoint:({clientX,clientY})=>({x:clientX,y:clientY}),m2ApplyLiveRackDrag(_svg,drag,x,y){calls++;source.x=x-drag.dx;source.y=y-drag.dy;},m2RackInsideArea:()=>allowed,m2RackOverlaps:()=>false,m2GroupTranslationValid:()=>allowed,m2RenderLayout(){},m2FinishRetainedDragV107(){},DOMPoint:class{constructor(x,y){this.x=x;this.y=y;}matrixTransform(){return this;}}};vm.createContext(sandbox);vm.runInContext(code,sandbox);
state.drag={id:1,originX:0,originY:0,dx:50,dy:10};sandbox.m2ApplyLiveRackDrag(svg,state.drag,148,91);assert.equal(source.x,100);assert.equal(source.y,80);assert.equal(calls,1);
// Hysteresis retains the same end until the mouse leaves the 12 pixel release range.
sandbox.m2ApplyLiveRackDrag(svg,state.drag,154,95);assert.equal(source.x,100);assert.equal(source.y,80);
sandbox.m2ApplyLiveRackDrag(svg,state.drag,180,125);assert.equal(source.x,130);assert.equal(source.y,115);
window.rafexAlignmentEnabledV256=false;sandbox.m2ApplyLiveRackDrag(svg,state.drag,148,91);assert.equal(source.x,98);assert.equal(source.y,81);
window.rafexAlignmentEnabledV256=true;allowed=false;source.x=source.y=0;state.drag={id:1,originX:0,originY:0,dx:50,dy:10};sandbox.m2ApplyLiveRackDrag(svg,state.drag,148,91);assert.equal(source.x,98);assert.equal(source.y,81);
console.log('PASS v556: actual drag endpoint alignment, middle grab, unequal systems, four rotations, whole joined row ends, stable release, OFF bypass and collision rejection.');
