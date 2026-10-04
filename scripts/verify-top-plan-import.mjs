import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const scope={};vm.createContext(scope);vm.runInContext(fs.readFileSync(new URL('../client/top-plan-import.js',import.meta.url),'utf8'),scope);
const api=scope.RafexTopPlan;
const modules=Array.from({length:100},(_,i)=>({w:i<60?2700:1800,h:1100,cx:i*3000,cy:0}));
assert.equal(api.groups(modules).length,2);assert.equal(api.groups(modules)[0].members.length,60);
assert.equal(api.groups([{w:2700,h:1100},{w:1100,h:2700}]).length,1);
assert.equal(api.groups([{w:2700,h:1100,label:'A'},{w:2700,h:1100,label:'B'}]).length,2);
assert.equal(api.rectangle([{x:0,y:0},{x:10,y:0},{x:9,y:8},{x:0,y:8}]),null);
const json=JSON.stringify({units:'mm',objects:[{type:'rack',closed:true,points:[[0,0],[2700,0],[2700,1100],[0,1100]]},{type:'wall',closed:true,points:[[0,0],[5000,0],[5000,4000],[0,4000]]}]});
assert.equal(api.cad(json,'json').length,1);assert.equal(api.cad(json,'json')[0].w,2700);
assert.throws(()=>api.cad('{"units":"inch","objects":[]}','json'));
const dxf='0\nSECTION\n2\nENTITIES\n0\nLWPOLYLINE\n8\nRACK\n70\n1\n10\n0\n20\n0\n10\n2700\n20\n0\n10\n2700\n20\n1100\n10\n0\n20\n1100\n0\nENDSEC\n0\nEOF\n';
assert.equal(api.cad(dxf,'dxf').length,1);
const width=600,height=400,data=new Uint8ClampedArray(width*height*4).fill(255);
const dark=(x,y)=>{const i=(y*width+x)*4;data[i]=data[i+1]=data[i+2]=0;};
for(let j=0;j<10;j++)for(let i=0;i<10;i++){const x=5+i*58,y=5+j*38;for(let dx=0;dx<=40;dx++){dark(x+dx,y);dark(x+dx,y+22);}for(let dy=0;dy<=22;dy++){dark(x,y+dy);dark(x+40,y+dy);}}
assert.equal(api.detect({width,height,data},{x:0,y:0,w:width,h:height}).length,100);
assert.equal(api.detect({width,height,data},{x:0,y:0,w:58,h:38}).length,1);
// A beam extension must not erase the adjoining bays. The lower beam ends
// before the upper one, as in dimension lines in the supplied PDF.
const broken=new Uint8ClampedArray(150*60*4).fill(255);
const ink=(x,y)=>{const i=(y*150+x)*4;broken[i]=broken[i+1]=broken[i+2]=0;};
for(let x=5;x<=140;x++)ink(x,10);
for(let x=15;x<=135;x++)ink(x,30);
for(const x of [15,55,95,135])for(let y=10;y<=30;y++)ink(x,y);
assert.equal(api.detect({width:150,height:60,data:broken},{x:0,y:0,w:150,h:60}).length,3);
const bays=[0,2800,5600,12000,14800].map(x=>({x,y:1000,w:2800,h:1100,angle:0}));
assert.deepEqual(Array.from(api.joinedRuns(bays),r=>r.indices.length),[3,2]);
assert.deepEqual(Array.from(api.joinedRuns(bays.map(r=>({...r,x:1000,y:r.x,angle:90}))),r=>r.indices.length),[3,2]);
assert.equal(api.joinedRuns([{...bays[0]},{...bays[1],x:500}]).length,0,'True overlaps cannot become shared frames');
assert.equal(api.joinedRuns([{...bays[0]},{...bays[1],h:1600}]).length,0,'Different frame depths cannot share a frame');
assert.equal(api.joinedRuns(bays,{compatible:()=>false}).length,0);
console.log('PASS: 100 raster modules, cropped scan, CAD parsing, dimensions, rotations and separate types.');

assert.equal(api.dimensions({w:1000,h:1050,spanAxis:'x'}).d,1050);
assert.equal(api.groups([{w:2700,h:1050,nominalW:2700,nominalD:1050,spanAxis:'x'},{w:2750,h:1050,nominalW:2750,nominalD:1050,spanAxis:'x'}],150).length,2);
const vg={rects:[0,30,60].map(cx=>({cx,cy:10,w:27,h:10.5,color:'red'})),labels:[0,30,60].map(cx=>({cx,cy:10,nominalW:2700,nominalD:1050,spanAxis:'x',label:''}))};
assert.equal(api.detectVectors(vg,{x:29,y:0,w:2,h:20}).length,1);
console.log('PASS: explicit dimensions stay separate and a partial rescan preserves vector measurements.');

const face=(cx,cy,extra={})=>({cx,cy,w:2700,h:1050,spanAxis:'x',...extra});
const pair=api.pairBackToBack([face(1500,1000),face(1500,2300)]);
assert.equal(pair.length,1);assert.equal(pair[0].rowType,'double');assert.equal(pair[0].h,2350);assert.equal(pair[0].rowGap,350);assert.equal(pair[0].sourceCount,2);
assert.equal(api.pairBackToBack([face(1500,1000),face(1500,5000)]).length,2,'Do not pair across an aisle');
assert.equal(api.pairBackToBack([face(1500,1000),face(1600,2300)]).length,2,'Misaligned bays remain separate');
assert.equal(api.pairBackToBack([face(1500,1000),face(1500,2300,{label:'Tünel'})]).length,2,'Different face types remain separate');
assert.equal(api.pairBackToBack([face(1500,1000),face(1500,2300),face(1500,3600)]).length,3,'Ambiguous three-row groups remain separate');
const turned=api.pairBackToBack([face(1000,1500,{w:1050,h:2700,spanAxis:'y'}),face(2300,1500,{w:1050,h:2700,spanAxis:'y'})]);
assert.equal(turned.length,1);assert.equal(turned[0].w,2350);assert.equal(turned[0].h,2700);
console.log('PASS: back-to-back detection preserves aisles, singles, ambiguous rows, distinct types and rotated footprints.');
