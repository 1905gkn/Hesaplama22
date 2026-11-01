import {driveInUprightHeight} from '../client/drive-in-height.mjs';
import fs from 'node:fs';import vm from 'node:vm';import path from 'node:path';import assert from 'node:assert/strict';import {createRequire} from 'node:module';import {transform} from './representative-front-v380.mjs';
const require=createRequire(path.resolve(process.argv[4]||'.','package.json'));
const THREE=require('three');
const html=fs.readFileSync(process.argv[2]||'dist/index.html','utf8');
assert(html.includes('data-representative-front="v380"'));assert.equal(transform(html),html);
for(const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))if(match[1].trim())new vm.Script(match[1]);
const root=process.argv[3]||'.';
const mekik=fs.readFileSync(root+'/client/mekik-front-viewer.entry.js','utf8'),drive=fs.readFileSync(root+'/client/drive-in-viewer.entry.js','utf8');
assert(mekik.includes('const FRONT_DISPLAY_BAYS = 5;'));assert(drive.includes('const FRONT_DISPLAY_BAYS = 5;'));
const ctx={driveInUprightHeight,THREE,FRONT_DISPLAY_BAYS:5,REFERENCE_UPRIGHT_WIDTH:100,REFERENCE_BAY_PITCH:1450,EURO_PALLET_VISUAL_HEIGHT:140,finishMaterial:()=>new THREE.MeshBasicMaterial(),CustomEvent:class{constructor(name,options){this.detail=options.detail}},console,Intl,clamp:(n,a,b)=>Math.max(a,Math.min(b,n)),window:{}};vm.createContext(ctx);
vm.runInContext(mekik.slice(mekik.indexOf('class MekikFrontViewer'),mekik.indexOf('\nlet canvas ='))+';globalThis.MekikTest=MekikFrontViewer;',ctx);
vm.runInContext(drive.slice(drive.indexOf('class DriveInFrontViewer'),drive.indexOf('\nlet active ='))+';globalThis.DriveTest=DriveInFrontViewer;',ctx);
const model=()=>{const root=new THREE.Group();root.add(new THREE.Mesh(new THREE.BoxGeometry(100,100,100)));return{root,size:new THREE.Vector3(100,100,100),topOffset:0,source:'synthetic'}};
for(const bays of [1,3,5,14,50]){
 const config=Object.freeze({bays,levels:3,palletWidth:1200,palletDepth:800,palletHeight:1200,firstLevelHeight:430,levelSpacing:1580,footType:90,footColor:'pgv',traverseColor:'ral1007',sideClearance:75,traverseHeight:50,uprightHeight:4190,bayPitch:1350,totalWidth:bays*1440+90});const serialized=JSON.stringify(config);
 const viewer=Object.create(ctx.MekikTest.prototype);Object.assign(viewer,{config,root:new THREE.Group(),models:{upright:model(),pallet:model(),traverse:model()},fit(){},render(){},canvas:{dispatchEvent(event){assert.equal(event.detail.config.bays,bays)}}});viewer.rebuild();
 assert.equal(viewer.root.children.filter(c=>c.name.startsWith('Mekik Ayak ')).length,6);assert.equal(viewer.root.children.filter(c=>c.name.startsWith('Mekik Paletli Yük ')).length,15);assert.equal(viewer.root.children.filter(c=>c.name.startsWith('Mekik Travers ')).length,15);assert.equal(JSON.stringify(config),serialized);
 const rect={left:0,top:0,width:1260,height:760},overlay={setAttribute(){},querySelector(){return null},style:{},parentElement:{getBoundingClientRect:()=>rect},innerHTML:''};viewer.overlay=overlay;viewer.canvas.getBoundingClientRect=()=>rect;viewer.lastWidth=1260;viewer.lastHeight=760;viewer.camera=new THREE.OrthographicCamera(-6000,6000,5000,-1000,1,100000);viewer.camera.up.set(0,0,1);viewer.camera.position.set(3375,10000,2000);viewer.camera.lookAt(3375,0,2000);viewer.camera.updateProjectionMatrix();viewer.camera.updateMatrixWorld();viewer.renderDimensionOverlay();assert(overlay.innerHTML.includes('data-display-bays="5"'));assert(overlay.innerHTML.includes('data-total-mm="'+config.totalWidth+'"'));assert(overlay.innerHTML.includes('TOPLAM UZUNLUK'));
 const dv=Object.create(ctx.DriveTest.prototype),parts=[];Object.assign(ctx,{metricsOf:()=>({size:new THREE.Vector3(100,100,100)}),consolePairAtSpan:source=>source,technicalMaterials:{}});
 const dc=Object.freeze({...config,railLength:6000,depthPallets:5,totalWidth:bays*1440+90});Object.assign(dv,{config:dc,root:new THREE.Group(),models:{ayak:{kind:'ayak'},ray:{kind:'ray'},konsol:{kind:'konsol'},arabag:{kind:'arabag'},palet:{kind:'palet'}},fitCamera(){},renderScene(){},addLoadBox(){},addPart(source,scale,position){parts.push(source.kind);const mesh=new THREE.Mesh(new THREE.BoxGeometry(100,100,100));mesh.position.copy(position);this.root.add(mesh);return mesh}});dv.rebuild();assert.equal(parts.filter(x=>x==='ayak').length,6);assert.equal(parts.filter(x=>x==='palet').length,15);assert.equal(parts.filter(x=>x==='ray').length,30);assert.equal(dc.bays,bays);assert.equal(dc.totalWidth,config.totalWidth);
 let layout;dv.camera=viewer.camera;dv.lastWidth=1260;dv.lastHeight=760;dv.emit=(_,data)=>layout=data;dv.emitLayout();assert.equal(layout.columnXs.length,6);assert.equal(layout.totalWidth,config.totalWidth);assert.equal(layout.displayBays,5);
}
// Real SVG fallback also draws exactly five bays, never changes saved detail.
const a=html.indexOf('      function m2MekikSetProjection('),b=html.indexOf('\n      function ',a+10);assert(a>0&&b>a);Object.assign(ctx,{fmt:String,m2Ayak2FrontRaster:'fixture.png'});vm.runInContext(html.slice(a,b),ctx);
for(const bays of [1,5,50]){const drawing={bays,levels:3,palW:1200,footType:90,totalWidth:bays*1440+90};const old=JSON.stringify(drawing);const svg=ctx.m2MekikSetProjection('front',drawing);assert.equal((svg.match(/class="m2-front-load"/g)||[]).length,15);assert.equal((svg.match(/class="m2-front-upright /g)||[]).length,6);assert.equal(JSON.stringify(drawing),old)}
const frontStart=html.indexOf('      function m2ReportElevationSvg('),frontEnd=html.indexOf('\n      function ',frontStart+10);vm.runInContext(html.slice(frontStart,frontEnd),ctx);ctx.window.rafexReadRackDetailV135=()=>'<svg>OLD SAVED FRONT</svg>';
for(const rafexSystem of ['mekik2','drive']){const drawing={rafexSystem,bays:50,levels:3,palW:1200,footType:90,totalWidth:72090};const svg=ctx.m2ReportElevationSvg(drawing,'front');assert(!svg.includes('OLD SAVED FRONT'));assert(svg.includes('72,09 m'));assert.equal((svg.match(/class="m2-front-load"/g)||[]).length,15)}
assert(ctx.m2ReportElevationSvg({b2b:{}},'front').includes('OLD SAVED FRONT'));assert(ctx.m2ReportElevationSvg({},'side').includes('OLD SAVED FRONT'));
assert(html.includes("frontRepresentation:'five-bays-v380'"));assert(html.includes('c.totalWidth=Number(d.totalWidth||d.widthMm)'));assert(html.includes('data-total-mm="\'+totalWidth+\'"'));
console.log('PASS representative fronts: real geometry builds 5 bays / 6 uprights for 1–50 actual bays; all levels preserved; native SVG fallback, main/capture dimensions retain exact saved width; configuration unchanged; section cache invalidated; inline syntax.');

// Manual upright height must drive both live and exported geometry.
const sourceHtml422=html,sourceMekik422=mekik;
{
const html=sourceHtml422,mekik=sourceMekik422;
for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))if(m[1].trim())new vm.Script(m[1]);
const a=html.indexOf('      function m2MekikSetProjection('),b=html.indexOf('\n      function ',a+10);
const context={window:{},fmt:n=>String(n),m2Ayak2FrontRaster:'fixture.png',m2ShowSidePallets:true,m2PalletDepthLayout:()=>({positions:[200,1050,1900,2750,3600],gaps:[200,50,50,200]}),m2PalletGapSummary:()=>''};vm.createContext(context);vm.runInContext(html.slice(a,b),context);
const base={rafexSystem:'mekik2',mekikUprightMode:'manual',bays:20,levels:4,palW:1200,palD:800,footType:90,totalWidth:28890,palletHeight:1200,firstRailHeight:430,levelH:1580,railLength:4500,plan:{feet:[1200,1100,1200],braces:[500,500]}};
for(const height of [5770,6500,8000]){
 const drawing={...base,sideUprightHeight:height,totalRackHeight:Math.max(height,6370)};
 const side=context.m2MekikSetProjection('side',drawing),front=context.m2MekikSetProjection('front',drawing);
 assert(side.includes('height="'+height+'" rx="1" class="m2-side-upright-body"'),height+' side upright physically extends');
 assert(front.includes('height="'+height+'"'),height+' front upright physically extends');
 assert(side.includes('data-load-top-mm="6370"'),'Pallet top remains 6370 regardless of upright');
 assert.equal((front.match(/class="m2-front-load"/g)||[]).length,20);
}
const reportStart=html.indexOf('      function m2ReportElevationSvg('),reportEnd=html.indexOf('\n      function ',reportStart+10);
vm.runInContext(html.slice(reportStart,reportEnd),context);context.window.rafexReadRackDetailV135=()=>'<svg>STALE</svg>';
const savedManual={...base,sideUprightHeight:6500,totalRackHeight:6500};
const report=context.m2ReportElevationSvg(savedManual,'side');assert(!report.includes('STALE'));assert(report.includes('data-upright-top-mm="6500"'));
const captureStart=html.indexOf('  function config(d,system){'),captureEnd=html.indexOf('  function standalone(',captureStart);
vm.runInContext(html.slice(captureStart,captureEnd)+'\nglobalThis.captureConfig=config;',context);assert.equal(context.captureConfig(savedManual,'mekik2').uprightHeight,6500);
// Actual main front config reads saved manual height; common navigation does not hide it.
let drawing={...base,sideUprightHeight:6500};const fields={m2Levels:{value:'4'},m2Bays:{value:'20'},m2PalW:{value:'1200'},m2PalD:{value:'800'},m2LevelH:{value:'1200'},m2FirstLevelHeight:{value:'430'},m2LevelSpacing:{value:'1580'}};
const page={dataset:{rafexFreeDrawing:'1'},classList:{contains:()=>true}},info={textContent:''};let selected='mekik2';
const env={m2LastDrawing:drawing,m2ActiveModule:'mekik2',Intl,document:{getElementById:id=>id==='page'?page:id==='pageTitle'?{textContent:'ORTAK ÇİZİM'}:null,querySelector:selector=>selector.includes('input:checked')?{value:selected}:selector.includes('.active')?{dataset:{page:'free'}}:null,querySelectorAll:selector=>{const id=selector.match(/\[id="([^"]+)"\]/)?.[1];return fields[id]?[{...fields[id],isConnected:true,getClientRects:()=>[{}]}]:[];}}};vm.createContext(env);
vm.runInContext(mekik.slice(mekik.indexOf('const clamp ='),mekik.indexOf('const MEKIK_FINISH_COLORS'))+'\nglobalThis.read=readConfig;globalThis.active=isMekikFront;',env);
assert(env.active());assert.equal(env.read().uprightHeight,6500);env.m2LastDrawing={...drawing,sideUprightHeight:8000};assert.equal(env.read().uprightHeight,8000);
for(const system of ['b2b','drive','mr','konsol']){selected=system;assert(!env.active(),system+' must not mount Mekik');}
assert(mekik.includes('AYAK BOYU ${formatter.format(config.uprightHeight)} mm'));
console.log('PASS v422: front/side SVG upright geometry 5770/6500/8000, fixed pallet elevations, common-page front activation and saved manual 3D height.');


}

for(const height of [5770,6500,8000]){
 const config={bays:20,levels:4,palletWidth:1200,palletDepth:800,palletHeight:1200,firstLevelHeight:430,levelSpacing:1580,footType:90,footColor:'ral5010',traverseColor:'ral1007',sideClearance:75,traverseHeight:50,uprightHeight:height,bayPitch:1350,totalWidth:28890};
 const viewer=Object.create(ctx.MekikTest.prototype);Object.assign(viewer,{config,root:new THREE.Group(),models:{upright:model(),pallet:model(),traverse:model()},fit(){},render(){},canvas:{dispatchEvent(){}}});viewer.rebuild();
 const posts=viewer.root.children.filter(n=>n.name.startsWith('Mekik Ayak '));assert.equal(posts.length,6);for(const post of posts)assert.equal(post.scale.z,height/100);
}
console.log('PASS v422: real 3D upright scales follow manual heights without changing five-bay representation.');
