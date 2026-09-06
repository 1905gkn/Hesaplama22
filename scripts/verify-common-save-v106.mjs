import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'rafex-save-'));fs.mkdirSync(path.join(dir,'dist/server'),{recursive:true});
const file=path.join(dir,'dist/server/index.js');
fs.writeFileSync(file,"const HTML_BASE64='"+Buffer.from(fs.readFileSync('.tmp-cold-store-before.html','utf8')).toString('base64')+"';");
execFileSync(process.execPath,[path.resolve('scripts/patch-runtime-authority-v2.mjs')],{cwd:dir});
const html=Buffer.from(fs.readFileSync(file,'utf8').match(/HTML_BASE64='([^']+)'/)[1],'base64').toString();
const code=html.slice(html.indexOf('      async function m2SaveProject() {'),html.indexOf('      function m2ProjectPlacementError()'));
for(const scenario of ['common','standalone-invalid','common-invalid','placement-error']){
  const ui={m2ProjectName:{value:'legacy'},rafexAuthorityProjectName:{value:'gokhan deneme - performans testi'},m2ProjectSaveMsg:{textContent:''},m2ProjectSaveButton:{disabled:false}};
  const racks=Array.from({length:504},(_,i)=>({id:i+1,plan:scenario==='common-invalid'?null:{feet:[5000],braces:[]},x:i,y:1}));
  const calls=[],ctx={document:{querySelector:()=>({dataset:{page:scenario==='standalone-invalid'?'mekik2':'free'}})},$:id=>ui[id],m2LayoutState:{racks,points:[],scale:1},m2LastDrawing:{plan:null},m2ActiveModule:'mekik2',m2LayoutSymbols:[],m2SavedRackTypes:[],m2PinnedDimensions:{},m2PinnedDimensionsByRack:{},m2DimensionOffsets:{},m2DimensionFontSizes:{},m2HiddenSummaryDimensions:new Set(),m2VisibleRackDimensions:{length:new Set(),depth:new Set()},m2UserNotes:[],m2FreeMeasure:{},m2ProjectPlacementError:()=>scenario==='placement-error'?'Çakışma':'',m2MeasurementRack:()=>null,req:async(url,opts)=>{calls.push(JSON.parse(opts.body));return{serialNo:15}},loadProjects:async()=>{},showPage(){},showProjectSavedNotice(){}};
  vm.createContext(ctx);vm.runInContext(code,ctx);await ctx.m2SaveProject();
  if(scenario==='common'){assert.equal(calls.length,1);assert.equal(calls[0].module,'ortak');assert.equal(calls[0].payload.layout.racks.length,504);assert.deepEqual(calls[0].payload.layout.racks,racks);assert.deepEqual(calls[0].payload.drawing,racks[0]);assert.equal(calls[0].projectName,ui.rafexAuthorityProjectName.value);assert.equal(ctx.m2LastDrawing.plan,null);}
  else{assert.equal(calls.length,0);assert(ui.m2ProjectSaveMsg.textContent.startsWith('Kaydedilemedi:'));}
}
console.log('PASS: common layout saves 504 unchanged racks independent of invalid open editor; invalid rack plans, standalone editor and collision checks still block saving.');
