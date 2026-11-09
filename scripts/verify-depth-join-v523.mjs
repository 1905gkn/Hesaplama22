import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const html=fs.readFileSync(new URL('../portal.html',import.meta.url),'utf8');
for(const [,script] of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(script);
const functions=fs.readFileSync(new URL('../client/depth-join-v523.js',import.meta.url),'utf8');
const letter=html.slice(html.indexOf('      function b2bTypeLetter('),html.indexOf('      function m2TypeColor('));
const pallets=html.slice(html.indexOf('      function m2PalletDepthLayout('),html.indexOf('      function m2DxfPair('));
const load=html.slice(html.indexOf('      function m2CalculateFootLoad('),html.indexOf('      function drawMekik2('));
function setup(system='mekik2',angle=0){
  const anchor={id:1,typeName:'A',rafexSystem:system,plan:{feet:[1200,1200,1200],braces:[1200,1200]},depth:5,depthMm:6000,w:100,h:600,x:0,y:0,angle};
  const added={id:2,typeName:'B',rafexSystem:system,plan:{feet:[1000,1000],braces:[1600]},depth:3,depthMm:3600,w:100,h:360,x:200,y:0,angle};
  Object.assign(anchor,{palD:1200,palletPositions:[0,1200,2400,3600,4800],firstRailHeight:430,levelH:1500,levels:4,traverseHeight:50,railHeight:100});
  Object.assign(added,{palD:1200,palletPositions:[0,1200,2400],firstRailHeight:600,levelH:1700,levels:3});
  const status={classList:{remove(){}},setAttribute(){}};
  const ctx=vm.createContext({m2LayoutState:{racks:[anchor,added]},m2SavedRackTypes:[],m2SelectedSavedType:null,m2UndoHistory:[],m2JoinFirstRackId:null,m2JoinMode:true,$:()=>status,window:{},structuredClone,document:{getElementById:()=>({classList:{remove(){}}})},m2MultiSelect:{},m2ClearMultiSelection(){},m2ChooseJoinRack(){},m2CommitMultiSelection(){},m2UndoLastAction(){},m2RenderSavedRackTypes(){},m2RenderLayout(){},m2TypeColor:name=>name,m2PushUndo(){ctx.undo=structuredClone(ctx.m2LayoutState);ctx.m2UndoHistory.push({});},m2RackInsideArea:()=>true,m2RackOverlapsExcept:()=>false});
  vm.runInContext(letter+pallets+load+functions,ctx);ctx.m2JoinedDepthPlan=ctx.window.rafexDepthJoinV523.plan;ctx.m2DepthJoinDrawing=ctx.window.rafexDepthJoinV523.drawing;ctx.m2ChooseDepthJoinRack=r=>ctx.m2JoinFirstRackId==null?ctx.m2ChooseJoinRack(r.id):ctx.m2CommitMultiSelection({rackId:r.id});
  return {ctx,anchor,added,status};
}
for(const system of ['mekik2','drive'])for(const angle of [0,90,180,270]){
  const {ctx,anchor,added}=setup(system,angle),before=JSON.stringify(anchor.plan);
  ctx.m2ChooseDepthJoinRack(anchor);ctx.m2ChooseDepthJoinRack(added);
  assert.equal(added.typeName,'C');assert.equal(anchor.typeName,'A');assert.equal(JSON.stringify(anchor.plan),before);
  assert.equal(added.depth,3);assert.equal(added.depthMm,3600);
  assert.equal(added.firstRailHeight,anchor.firstRailHeight);assert.equal(added.levelH,anchor.levelH);assert.equal(added.levels,anchor.levels);
  assert.deepEqual(Array.from(added.plan.feet),[1200,1200]);assert.deepEqual(Array.from(added.plan.braces),[1200]);
  assert.equal(ctx.undo.racks[1].typeName,'B');
  assert.equal(ctx.m2SavedRackTypes.at(-1).name,'C');assert.equal(ctx.m2SavedRackTypes.at(-1).drawing.railLength,3600);
  assert.equal(ctx.m2UndoHistory.at(-1).joinSavedRackTypes.length,0);
  const r=angle*Math.PI/180,nx=-Math.sin(r),ny=Math.cos(r);
  const front=rack=>(rack.x+rack.w/2)*nx+(rack.y+rack.h/2)*ny-rack.h/2;
  assert.ok(Math.abs(front(anchor)-front(added))<1e-8);
  const roundTrip=JSON.parse(JSON.stringify(ctx.m2LayoutState));assert.equal(roundTrip.racks[1].typeName,'C');
}
{
  const {ctx,anchor,added}=setup();
  const tail=ctx.m2JoinedDepthPlan(anchor,4200);assert.equal(tail.hasExtra,true);assert.deepEqual(Array.from(tail.plan.braces),[1200,600]);
  const long=ctx.m2JoinedDepthPlan(anchor,8400);assert.equal([...long.plan.feet,...long.plan.braces].reduce((a,b)=>a+b,0),8400);
  Object.assign(added,ctx.m2DepthJoinDrawing(anchor,added));ctx.m2ChooseDepthJoinRack(anchor);ctx.m2ChooseDepthJoinRack(added);assert.equal(added.typeName,'B');
}
{
  const {ctx,anchor,added}=setup();
  for(const tail of [99,100]){
    const adapted=ctx.m2JoinedDepthPlan(anchor,1200+tail);
    assert.deepEqual(Array.from(adapted.plan.feet),[1200]);assert.equal(adapted.hasExtra,false);assert.equal(adapted.railOverhang,tail);
  }
  const profile=ctx.m2JoinedDepthPlan(anchor,1301);
  assert.equal(profile.hasExtra,true);assert.equal(profile.supportLength,1301);assert.equal(profile.railOverhang,0);
  const frame=ctx.m2JoinedDepthPlan(anchor,2600);
  assert.deepEqual(Array.from(frame.plan.feet),[1200]);assert.deepEqual(Array.from(frame.plan.braces),[1400]);assert.equal(frame.depthMm,2600,'Finish with a profile inside the next anchor frame');assert.equal(frame.hasExtra,true);
  anchor.palD=800;anchor.palletPositions=[0,1000,1850,2700,3700];
  const next=ctx.m2DepthJoinDrawing(anchor,added);
  assert.deepEqual(Array.from(next.palletPositions),[0,1000,1850]);assert.equal(next.palD,800);assert.equal(next.depth,3);
  assert.equal(next.depthMm,2650);assert.equal(next.h,265);
}
for(const angle of [0,90,180,270]){
 const {ctx,anchor,added}=setup('mekik2',angle);Object.assign(anchor,{joinGroup:'old'});Object.assign(added,{joinGroup:'old',joinReferenceId:anchor.id,palD:800,palletPositions:[0,1000,1850],plan:{feet:[1200,1200],braces:[1200]},mekikCustomizationV514:{depths:[3,3,2],heightMode:'manual',uprightHeight:5000}});
 const radians=angle*Math.PI/180,front=r=>(r.x+r.w/2)*-Math.sin(radians)+(r.y+r.h/2)*Math.cos(radians)-r.h/2,before=front(added),custom=JSON.stringify(added.mekikCustomizationV514);
 anchor.palD=800;anchor.palletPositions=[0,1000,1850,2700,3700];ctx.m2RenderLayout();assert.equal(added.depthMm,2650);assert.equal(added.hasExtra,true);assert.equal(added.typeName,'B');assert.equal(JSON.stringify(added.mekikCustomizationV514),custom);assert(Math.abs(front(added)-before)<1e-8);const fixed=JSON.stringify(added);ctx.m2RenderLayout();assert.equal(JSON.stringify(added),fixed,'Old join migration runs only once');
}
for(const failure of ['wall','system','direction','group']){
  const {ctx,anchor,added}=setup();
  if(failure==='wall')ctx.m2RackInsideArea=()=>false;
  if(failure==='system')added.rafexSystem='drive';
  if(failure==='direction')added.angle=180;
  if(failure==='group')added.joinGroup='existing';
  const before=JSON.stringify(added);ctx.m2ChooseDepthJoinRack(anchor);ctx.m2ChooseDepthJoinRack(added);
  assert.equal(JSON.stringify(added),before);assert.equal(ctx.undo,undefined);
}
console.log('Depth joins passed: 5+3 pallets, both systems, four rotations, naming, tail profile, extension, persistence and rejected placements.');

for(const f of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(f)){const body=fs.readFileSync(f,'utf8');const data=f.endsWith('.html')?body:Buffer.from(body.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/)[1],'base64').toString();assert.ok(data.includes('/* depth-join-v523 */'),f+' must include the final join override');}

