import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync('client/b2b-viewer.entry.js','utf8');
const method=source.slice(source.indexOf('  addDimensions('),source.indexOf('  dimensionValue('));
const obj=vm.runInNewContext('({'+method+'})',{THREE:{Group:class{add(){}}},SOURCE_SECTION_WIDTH:2700,SOURCE_CLEAR_LEFT:120});
function run({bottoms=[1200,2600,4100],heights=[100,150,200],included=true,first='ground',tunnel=0,levels=bottoms.length+(first==='ground'?1:0),visible=true}={}){
 const calls=[];
 const viewer={options:{sectionWidth:2700,moduleCount:1,palletDepth:1200,frontPalletGap:50,rearPalletGap:50,rowType:'single',rowGap:200,firstPalletPosition:first,levels,tunnelHeight:tunnel,dimensions:{levels:visible,traverseIncluded:included}},
 traverseBottom:i=>bottoms[i],traverseTop:i=>bottoms[i]+heights[i],loadBottom:()=>0,palletHeightAt:()=>1200,dimensionValue:n=>String(n),content:{add(){}},
 addVerticalDimension:(_g,_x,_y,start,end,label)=>calls.push({start,end,label})};
 obj.addDimensions.call(viewer,2820);
 return calls;
}
assert.deepEqual(run().map(x=>[x.start,x.end]),[[0,1300],[1300,2750],[2750,4300]]);
assert.deepEqual(run({included:false}).map(x=>[x.start,x.end]),[[0,1200],[1300,2600],[2750,4100]]);
assert.deepEqual(run({first:'traverse'}).map(x=>[x.start,x.end]),[[0,1300],[1300,2750],[2750,4300]]);
assert.deepEqual(run({tunnel:2500}).map(x=>[x.start,x.end]),[[0,2750],[2750,4300]]);
assert.equal(run({levels:1}).length,0);
assert.equal(run({visible:false}).length,0);
for(let count=1;count<=8;count++){
 const bottoms=Array.from({length:count},(_,i)=>200+i*1500);
 assert.equal(run({bottoms,heights:bottoms.map(()=>125)}).length,count);
}
assert(fs.readFileSync('portal.html','utf8').includes('id="b2bDimension-traverseIncluded"'));
assert(fs.readFileSync('client/b2b-section-positioner-v5.js','utf8').includes('data-rafex-dimension="traverseIncluded"'));
console.log('PASS: ground-to-top, top-to-top, variable profiles, ground/traverse start, tunnel, 1–8 beams, hidden and legacy modes.');
const depthMethod=source.slice(source.indexOf('  addDepthDimension('),source.indexOf('  addDimensionLabel(',source.indexOf('  addDepthDimension(')));
const depth=vm.runInNewContext('({'+depthMethod+'})',{THREE:{Vector3:class{constructor(x,y,z){Object.assign(this,{x,y,z});}}}});
const lines=[];
depth.addDepthDimension.call({addLine:(_l,points)=>lines.push(points),addPoint(){},addDimensionLabelAt(){}},{},3400,45,1145,0,'AYAK DERİNLİĞİ',2980);
assert.equal(lines[1][0].x,2980);
assert.equal(lines[1][0].y,45);
assert.equal(lines[2][0].x,2980);
assert.equal(lines[2][0].y,1145);
console.log('PASS: depth witness lines start on the selected structural face, not the model origin.');
