import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {depthSharedSupport} from '../client/depth-shared-support.mjs';
import {layoutSnapshot} from '../client/layout-3d-data.mjs';
import {rackParts} from '../client/layout-3d-geometry.mjs';
import {cadPlacements} from '../client/layout-3d-cad.mjs';
import {mekikStepped} from '../client/mekik-stepped.mjs';
import {driveStepped} from '../client/drive-stepped.mjs';
const a={id:1,typeName:'A',bays:2,levels:4,depth:5,widthMm:2970,totalWidth:2970,depthMm:4500,railLength:4500,w:2970,h:4500,x:0,y:0,angle:0,footType:90,palW:1200,palD:800,palletHeight:1200,firstRailHeight:430,levelH:1580,systemType:'fifo',plan:{feet:[1200,1200,1100],braces:[500,500]},palletPositions:[0,1000,1850,2700,3700],joinGroup:'g'};
const c={...a,id:2,typeName:'C',depth:3,depthMm:2900,railLength:2900,h:2900,x:2880,plan:{feet:[1200,1200],braces:[500]},palletPositions:[0,1000,1850],sharedFootWith:1,sharedFootSide:'left'};
for(const system of ['mekik2','drive'])for(const side of ['left','right']){
 const anchor={...a,rafexSystem:system},child={...c,rafexSystem:system,sharedFootSide:side},racks=[anchor,child],shared=depthSharedSupport(child,racks);
 assert.deepEqual(shared.feet,[0,1]);assert.deepEqual(shared.braces,[0]);assert(!shared.extra);
 const snap=layoutSnapshot({scale:1,racks,points:[]}).racks[1],alone={...snap,depthSharedSupport:null};
 assert.equal(rackParts(alone).filter(p=>p.kind==='foot').length-rackParts(snap).filter(p=>p.kind==='foot').length,4);
 assert.equal(rackParts(snap).filter(p=>p.kind==='rail').length,rackParts(alone).filter(p=>p.kind==='rail').length);
 const templates={mekikPost:{height:5,width:.1,postCenters:[.02]},mekikBeam:{height:.05,railBearings:[{y:-.146}],mountHalfSpan:.675},drivePost:{height:5,width:.141,depth:1.2},b2bBeam:{height:.12,referenceHeight:.12,mountHalfSpan:1.35}};
 const name=system==='drive'?'drivePost':'mekikPost';assert.equal(cadPlacements(alone,templates).filter(p=>p.name===name).length-cadPlacements(snap,templates).filter(p=>p.name===name).length,system==='drive'?2:4);
 const key=system==='drive'?'driveCustomizationV521':'mekikCustomizationV514',calculate=system==='drive'?driveStepped:mekikStepped;
 const custom={...child,[key]:{depths:[3,3,3,3]},depthSharedSupport:shared},full=calculate({...custom,depthSharedSupport:null}),joined=calculate(custom),qty=(model,name)=>model.rows.filter(r=>r.name===name).reduce((n,r)=>n+r.qty,0);
 assert.equal(qty(full,'Ayak takımı')-qty(joined,'Ayak takımı'),2);assert.equal(qty(full,'Ray'),qty(joined,'Ray'));assert.equal(qty(full,'Travers'),qty(joined,'Travers'));assert(qty(full,'Düz arabağ')>qty(joined,'Düz arabağ'));
 assert.equal(depthSharedSupport({...child,sharedFootWith:null},racks).side,null,'Separation restores own supports');
 assert.equal(depthSharedSupport(child,[child]).side,null,'Removed parent restores supports');
 const tail={...child,hasExtra:true,depthMm:3100,railLength:3100,plan:{feet:[1200,1200],braces:[500,200]}};
 assert.equal(depthSharedSupport(tail,[anchor,tail]).extra,false,'Unmatched terminal profile must remain');
}
if(fs.existsSync('dist/index.html')){
 const html=fs.readFileSync('dist/index.html','utf8'),racks=[{...a,rafexSystem:'mekik2'},{...c,rafexSystem:'mekik2'}];
 const ctx=vm.createContext({window:{rafexPlanFinishV382:()=>'#aaa',rafexKatWireV392:{channelCounts:()=>({})},rafexProductCodeRulesV322:{codeFor:()=>''}},m2LayoutState:{racks},n:x=>Number(x)||0,racks:()=>racks,rackSystem:r=>r.rafexSystem,accessories:()=>[],textNumber:x=>String(x),decimalText:x=>String(x),recommendationText:()=>'',mekikColumnSpacing:()=>1350,recommendedRailThickness:()=>2.5,grouped:values=>values.reduce((m,v)=>(m.set(String(v),(m.get(String(v))||0)+1),m),new Map())});
 for(const tag of ['data-depth-shared="v524"','data-rafex-plan-detail="v143"']){const at=html.indexOf(tag);assert(at>=0);vm.runInContext(html.slice(html.indexOf('>',at)+1,html.indexOf('</script>',at)),ctx);}
 const start=html.indexOf('function rows(targetSystem)'),end=html.indexOf('function inventoryPdfPages',start);assert(start>=0);vm.runInContext(html.slice(start,end),ctx);
 const rows=ctx.rows('mekik2');assert.equal(rows.filter(r=>r.name==='Ayak takımı').reduce((n,r)=>n+r.qty,0),13,'Actual screen/PDF inventory: 9 anchor + 4 child frames');
 const p=ctx.window.rafexPlanDetailV143(racks[1]);const standalone=ctx.window.rafexRenderPlanV143(p),joined=ctx.window.rafexRenderPlanV143({...p,shared:ctx.window.rafexDepthSharedV524(racks[1])});
 const count=s=>(s.match(/class="rafex-plan-foot-v143"/g)||[]).length;assert.equal(count(standalone),6);assert.equal(count(joined),4);
}
console.log('PASS v524: both systems/sides, 2D, native and fallback 3D, authoritative inventory, unchanged rails/beams, standalone/separation, unmatched extra support.');
