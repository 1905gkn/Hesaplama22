import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {columnSlots,helpers,transform} from './column-extension-v504.mjs';
import {layoutSnapshot} from '../client/layout-3d-data.mjs';import {rackParts} from '../client/layout-3d-geometry.mjs';
const original=fs.readFileSync('dist/index.html','utf8'),html=transform(original);assert.equal(transform(html),html);
function cut(name){const i=html.indexOf('function '+name+'('),rest=html.slice(i);assert.ok(i>=0,name);const e=rest.slice(10).search(/\n\s*function /),script=rest.indexOf('</script>');return rest.slice(0,script>=0?Math.min(e+10,script):e+10);}
const make=(rows=1)=>({id:1,typeName:'A',x:0,y:0,w:2880,h:rows===2?2500:1200,angle:0,levels:4,footType:90,depthMm:rows===2?2500:1200,layoutView:'b2b-top',b2b:{accessories:[]},b2bLayout:{sectionWidth:2700,palletCount:3,palletWidth:800,palletDepth:1200,palletOverhang:50,frameDepth:1100,rowCount:rows,rowGap:200},plan:{feet:[4900],braces:[]}});
const poly=(x,y,w,h)=>[{x,y},{x:x+w,y},{x:x+w,y:y+h},{x,y:y+h}];
for(const angle of [0,90,180,270])for(const rows of [1,2]){
 const r=make(rows);r.angle=angle;const rotate=points=>points.map(p=>{const a=angle*Math.PI/180,x=p.x-r.w/2,y=p.y-r.h/2;return{x:r.w/2+x*Math.cos(a)-y*Math.sin(a),y:r.h/2+x*Math.sin(a)+y*Math.cos(a)}});
 assert.deepEqual(columnSlots(r,rotate(poly(400,300,300,300)),1,90),[{row:0,pallet:0}]);
 assert.equal(columnSlots(r,rotate(poly(400,40,300,100)),1,90),null,'Front traverse collision');
 assert.equal(columnSlots(r,rotate(poly(80,300,100,300)),1,90),null,'End-frame collision');
 assert.equal(columnSlots(r,rotate(poly(400,1100,300,100)),1,90),null,'Rear traverse collision');
 if(rows===2)assert.deepEqual(columnSlots(r,rotate(poly(400,1600,300,300)),1,90),[{row:1,pallet:0}]);
}
function harness(rows=1,columnPositions=[{x:4050,y:300,w:250,h:300}],kind='column'){
 const source=make(rows),state={racks:[source],scale:1,selected:1},symbols=columnPositions.map((p,i)=>({...p,id:'col'+i,type:kind,blocking:true})),status={textContent:''};let next=10;
 const bounds=(r,x=r.x,y=r.y)=>({left:x,right:x+r.w,top:y,bottom:y+r.h}),c=vm.createContext({m2LayoutState:state,m2LayoutSymbols:symbols,m2LayoutRuntimeCache:{accessories:{bounds:new Map()}},window:{},m2AutoFillDraft:null,m2B2BFootWidth:()=>90,m2SymbolBounds:bounds,m2RackBounds:bounds,m2PerfBlockingSymbols:()=>symbols,m2BarrierFitsTunnelV165:()=>false,m2B2BSectionWidth:(l,n)=>n*800+(n+1)*75,m2B2BCopyRack:(r,n)=>{const d=structuredClone(r);delete d.columnPassageV504;d.id=next++;d.w=n*800+(n+1)*75+180;d.b2bLayout.palletCount=n;d.b2bLayout.sectionWidth=d.w-180;return d},m2RackInsideArea:()=>true,m2RackOverlapsExcept:r=>c.m2RackOverlapsBlockingSymbol(r),m2SetAutoFillControlsActive(){},m2PushUndo(){},m2DiscardUndo(){},m2RenderLayout(){c.m2RefreshColumnPassagesV504()},m2JoinedRackMembers:r=>state.racks.filter(q=>q.id===r.id||r.joinGroup&&q.joinGroup===r.joinGroup),$:()=>status,fmt:String});
 vm.runInContext(helpers+cut('m2RackOverlapsBlockingSymbol')+cut('m2CommitAutoFillGuide')+cut('rafexPalletCapacity')+cut('rafexPalletCapacityBaseV504'),c);
 // v236 replaces the original blocker later in the real page; exercise that final implementation too.
 Object.assign(c,{rackBlocks:r=>[bounds(r)],overlaps:(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top});const oi=html.indexOf('m2RackOverlapsBlockingSymbol=function(r,');vm.runInContext(html.slice(oi,html.indexOf('\n',oi)),c);
 function extend(r,distance=2880,direction=1){c.m2AutoFillDraft={rackId:r.id,direction,start:{x:r.x,y:r.y},hover:{x:r.x+distance,y:r.y}};c.m2CommitAutoFillGuide(null,distance);}
 return {c,state,symbols,status,source,extend};
}
for(const rows of [1,2]){
 const positions=[{x:4050,y:300,w:250,h:300},...(rows===2?[{x:4050,y:1600,w:250,h:300}]:[])],t=harness(rows,positions);
 t.extend(t.source);assert.ok(!t.state.racks.some(r=>r.columnPassageV504),'First attempt never bypasses a column');assert.match(t.status.textContent,/Kolona ulaşıldı/);
 const anchor=t.state.racks.at(-1);t.extend(anchor,6000);const accepted=t.state.racks.filter(r=>r.columnPassageV504);assert.ok(accepted.length,'Second attempt passes safely');
 assert.equal(accepted[0].columnPassageV504.slots.length,rows,'Every obstructed row loses its pallet place');assert.equal(t.c.rafexPalletCapacity(accepted[0]),0,'A one-pallet bay is empty on all affected rows and floors');
 const restored=JSON.parse(JSON.stringify(accepted[0]));assert.equal(t.c.rafexPalletCapacity(restored),0,'Save/reopen preserves disabled capacity');
 assert.equal(t.c.m2RackOverlapsBlockingSymbol(restored),false,'Saved authorized column remains valid');
 assert.equal(t.c.m2RackOverlapsBlockingSymbol(restored,restored.x,restored.y+280,0),true,'Moving the bay into a traverse collision is still blocked');
 t.symbols.length=0;t.c.m2RefreshColumnPassagesV504();assert.equal(accepted[0].columnPassageV504,undefined,'Removing the column restores all pallet places');
}
for(const p of [{x:4050,y:40,w:250,h:100},{x:2750,y:300,w:250,h:300}]){const t=harness(1,[p]);t.extend(t.source,2880);t.extend(t.state.racks.at(-1),2880);assert.ok(!t.state.racks.some(r=>r.columnPassageV504),'Structural columns cannot be bypassed');}
const obstacle=harness(1,[{x:4050,y:300,w:250,h:300}],'fixed');obstacle.extend(obstacle.source);obstacle.extend(obstacle.state.racks.at(-1));assert.ok(!obstacle.state.racks.some(r=>r.columnPassageV504),'Other obstacles stay blocking');
// Exercise the actual block-count toolbar function, including its all-or-nothing validation.
for(const rows of [1,2]){
 const t=harness(rows,[{x:4050,y:300,w:250,h:300},...(rows===2?[{x:4050,y:1600,w:250,h:300}]:[])]),c=t.c;
 Object.assign(c,{racks:()=>t.state.racks,symbols:()=>t.symbols,clone:structuredClone,status:text=>{t.status.textContent=text},overlap:(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top});
 vm.runInContext(cut('repeat'),c);assert.equal(c.repeat({sourceId:1,count:3,direction:1}),false);assert.equal(t.state.racks.length,1,'First count extension is stopped');assert.equal(c.repeat({sourceId:1,count:3,direction:1}),true);assert.equal(t.state.racks.length,4);assert.equal(t.state.racks[1].columnPassageV504.slots.length,rows);assert.equal(c.rafexPalletCapacity(t.state.racks[1]),8*rows,'Exactly one pallet stack per obstructed row is removed');assert.equal(t.state.racks[2].columnPassageV504,undefined,'Empty stacks are not copied to the next bay');
}
const direction=harness();direction.extend(direction.source);vm.runInContext('m2ColumnBeginExtensionV504(m2LayoutState.racks.at(-1),{direction:-1})',direction.c);assert.equal(vm.runInContext('m2ColumnExtensionContextV504.allowed.size',direction.c),0,'Opposite direction is a fresh first attempt');
const remapStart=html.indexOf('const remapRack = rack => {'),remapEnd=html.indexOf('racks.forEach(remapRack);',remapStart),copyRack=make();copyRack.columnPassageV504={columnIds:['old-column'],slots:[{row:0,pallet:1}]};const remapContext=vm.createContext({racks:[copyRack],symbolIds:new Map([['old-column',123]]),rackIds:new Map(),mapped:(m,id)=>m.get(String(id))??id,typeIdFor:(_,id)=>id,remapCatalogKey(){},named:(_,id)=>id,groups:new Map(),braces:new Map(),uuid:'new-project'});vm.runInContext(html.slice(remapStart,remapEnd)+'racks.forEach(remapRack);',remapContext);assert.equal(copyRack.columnPassageV504.columnIds[0],123,'Independent project copy remaps linked column IDs');
// Actual 3D snapshot and geometry omit exactly the affected pallet stack.
const r=make(2);r.columnPassageV504={version:1,columnIds:['c'],slots:[{row:1,pallet:0}]};r.sideUprightHeight=4900;r.palletHeight=1200;
const snapshot=layoutSnapshot({racks:[r],scale:.001,points:[]},()=>({levels:4,palletCount:3,rowType:'double',palletWidth:800,palletDepth:1200,sectionWidth:2700,footWidth:90}));const sr=snapshot.racks[0],full=rackParts({...sr,blockedPallets:[]}),blocked=rackParts(sr),loads=ps=>ps.filter(p=>p.kind==='load').length;assert.equal(loads(full)-loads(blocked),4,'3D removes four loads from one blocked stack');
assert.ok(html.includes('if(m2ColumnPalletBlockedV504(rack,row,pallet))continue;'),'Native 2D pallet loop omits blocked stacks');assert.ok(html.includes('m2ColumnEndExtensionV504(!options.dryRun)'),'Block-count path and previews share retry transaction');
console.log('PASS v504: first stop / second safe extension, one and two rows, all four rotations, traverse and frame rejection, ordinary obstacles, opposite-direction reset, save/reopen capacity, column removal, 2D exclusion and actual 3D pallet stacks.');