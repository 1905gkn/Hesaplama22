import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {independentProject} from './independent-project-v133.mjs';
const original={projectName:'Test',module:'ortak',payload:{drawing:{id:10,b2b:{levels:4}},rackTypes:[{id:2,source:'registry',drawing:{width:2700,b2b:{accessories:[{type:'tray',levels:[2]}]}}}],layout:{racks:[{id:10,joinGroup:'g',b2b:{palletHeight:800},rackTypeId:2},{id:11,joinGroup:'g',sharedFootWith:10,sharedFootSide:'left',seismicBraces:[{id:'brace',rackIds:[10,11]}]}],symbols:[{id:12,rackId:10,tunnelRackId:11,widthMm:10}],userNotes:[{id:13,text:'10'}],pinnedDimensionsByRack:{10:{left:true}},distanceRackId:10,dimensionOffsets:{'gap:10':{x:10,y:2},'edge:10':{x:5}},visibleRackDimensions:{length:[10],depth:[11]},hiddenSummaryDimensions:['length-top:10']}}};
const before=JSON.stringify(original),copy=independentProject(original,'new-uuid',1800000000000);
assert.equal(JSON.stringify(original),before,'source must not be mutated');
const [a,b]=copy.payload.layout.racks;
assert.notEqual(a.id,10);assert.equal(b.sharedFootWith,a.id);assert.equal(a.joinGroup,b.joinGroup);assert.notEqual(a.joinGroup,'g');
assert.deepEqual(b.seismicBraces[0].rackIds,[a.id,b.id]);
assert.equal(copy.payload.layout.symbols[0].rackId,a.id);assert.equal(copy.payload.layout.symbols[0].tunnelRackId,b.id);
assert.equal(copy.payload.layout.symbols[0].widthMm,10);assert.equal(copy.payload.layout.userNotes[0].text,'10');
assert.equal(copy.payload.layout.dimensionOffsets['gap:'+a.id].x,10);
assert.deepEqual(copy.payload.layout.dimensionOffsets['edge:10'],{x:5},'edge indices are not rack IDs');
assert.equal(copy.payload.layout.distanceRackId,a.id);assert.equal(copy.payload.drawing.id,a.id);
assert.equal(a.rackTypeId,copy.payload.rackTypes[0].id);
assert.deepEqual(copy.payload.rackTypes[0].drawing,original.payload.rackTypes[0].drawing);
assert.equal(copy.payload.projectIdentity.uuid,'new-uuid');
const worker=fs.readFileSync('dist/server/index.js','utf8'),match=worker.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/),html=Buffer.from(match[2],'base64').toString();
for(const script of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi))if(!/\bsrc\s*=/.test(script[1]))new vm.Script(script[2]);
assert(html.includes('rafexIndependentSaveV133'));assert(html.includes('window.rafexCommitLayoutV133(layer,html)'));
const saveCode=html.slice(html.indexOf('      async function m2SaveProject() {'),html.indexOf('      function m2ProjectPlacementError()'));
for(const scenario of ['independent','ordinary','network-error','invalid-placement']){
  const ui={m2ProjectName:{value:'old'},rafexAuthorityProjectName:{value:'copy'},m2ProjectSaveMsg:{textContent:''},m2ProjectSaveButton:{disabled:false}};
  const racks=[{id:20,plan:{feet:[5000],braces:[]},x:10,y:10}],calls=[],opened=[];
  const ctx={window:{rafexIndependentProjectV133:independentProject,rafexOpenIndependentV133:r=>opened.push(r)},crypto:{randomUUID:()=>scenario+'-uuid'},document:{querySelector:()=>({dataset:{page:'free'}})},$:id=>ui[id],m2LayoutState:{racks,points:[],scale:1},m2LastDrawing:{plan:null},m2ActiveModule:'mekik2',m2LayoutSymbols:[],m2SavedRackTypes:[],m2PinnedDimensions:{},m2PinnedDimensionsByRack:{},m2DimensionOffsets:{},m2DimensionFontSizes:{},m2HiddenSummaryDimensions:new Set(),m2VisibleRackDimensions:{length:new Set(),depth:new Set()},m2UserNotes:[],m2FreeMeasure:{},m2ProjectPlacementError:()=>scenario==='invalid-placement'?'Çakışma':'',m2MeasurementRack:()=>null,req:async(url,opts)=>{if(scenario==='network-error')throw Error('offline');calls.push(JSON.parse(opts.body));return{serialNo:123}},loadProjects:async()=>{},showPage(){},showProjectSavedNotice(){}};
  vm.createContext(ctx);vm.runInContext(saveCode,ctx);await ctx.m2SaveProject(scenario!=='ordinary');
  assert.equal(racks[0].id,20);assert.equal(ui.m2ProjectSaveButton.disabled,false);assert(!ctx.window.rafexProjectSavingV133);
  if(scenario==='independent'){assert.equal(opened.length,1);assert.equal(calls[0].module,'ortak');assert.notEqual(calls[0].payload.layout.racks[0].id,20);assert.equal(calls[0].payload.projectIdentity.uuid,'independent-uuid');}
  else if(scenario==='ordinary'){assert.equal(opened.length,0);assert.equal(calls[0].payload.layout.racks[0].id,20);}
  else{assert.equal(opened.length,0);assert.equal(calls.length,0);assert(ui.m2ProjectSaveMsg.textContent.startsWith('Kaydedilemedi:'));}
}
console.log('PASS v133: independent IDs, joins, braces, symbols, dimensions, immutable source and inline syntax');
