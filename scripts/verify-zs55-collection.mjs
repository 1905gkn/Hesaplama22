import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {zs55Collection} from '../client/zs55-collection.js';
const loader=new GLTFLoader();
async function model(file){const b=fs.readFileSync(file);return(await loader.parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'')).scene;}
const models={zs55Traverse:await model('assets/b2b-zs55-hr-traverse.glb'),zs55Tray:await model('assets/b2b-zs55-tray.glb')};
const sourceBefore=new THREE.Box3().setFromObject(models.zs55Traverse).clone();
for(const width of [1800,2700,3600])for(const depth of [900,1050,1100]){
 const section=new THREE.Group();
 for(const x of [45,135+width])for(const y of [40,depth-40]){const foot=new THREE.Mesh(new THREE.BoxGeometry(90,80,5000));foot.name='HR90 AYAK';foot.position.set(x,y,-2500);section.add(foot);}
 const viewer={models,applyRackMaterials(){},trayPiecePlan(w,p){const result=Array(Math.floor(w/p)).fill(p);if(w%p>=50)result.push(w%p);return result;}};
 for(let i=0;i<5;i++){
  const bottom=500+i*575;
  const layer=zs55Collection(THREE,viewer,section,{bottom,zsHeight:75,trayWidth:300,traverse:'ZS55|1.5'},i);
  assert.equal(layer.children.length,2+width/300);
  const beams=layer.children.slice(0,2).map(n=>new THREE.Box3().setFromObject(n));
  assert(Math.abs(beams[0].min.y+4)<.01&&Math.abs(beams[0].max.y-59)<.01,'Front ZS connector seats 59 mm into upright and overhangs outer face by 4 mm');
  assert(Math.abs(beams[1].min.y-(depth-59))<.01&&Math.abs(beams[1].max.y-(depth+4))<.01,'Rear ZS connector seats 59 mm into upright and overhangs outer face by 4 mm');
  for(const beam of layer.children.slice(0,2))beam.traverse(mesh=>{
   if(mesh.isMesh&&/SOL/i.test(mesh.name)){
    const p=mesh.geometry.attributes.position,ids=mesh.geometry.index.array;
    const xs=Array.from(ids,v=>p.getX(v));
    assert(Math.max(...xs)-Math.min(...xs)<43,'Only the upright-mounted connector remains; no inner duplicate');
   }
   if(!mesh.isMesh||!/TIRNAK/.test(mesh.name)||/TRAVERS/.test(mesh.name))return;
   assert(/KONNEKTÖR/.test(mesh.name),'Collection connector must use traverse-color classification');
   const size=mesh.geometry.boundingBox.getSize(new THREE.Vector3());
   assert(Math.abs(size.z-155)<.01,'Connector height must not stretch');
  });
  const tray=new THREE.Box3().setFromObject(layer.children[2]);
  assert(Math.abs(tray.min.y-4.60002)<.01&&Math.abs(tray.max.y-(depth-1))<.01,'Tray seats fully inside the corrected front/rear ZS bodies');
  assert(Math.abs(tray.max.z+bottom+57)<.01,'Tray support seating matches reference assembly');
  let sourceTray;models.zs55Tray.traverse(m=>{if(m.isMesh)sourceTray=m;});
  layer.children[2].traverse(m=>{if(!m.isMesh)return;
   const src=sourceTray.geometry.attributes.position,p=m.geometry.attributes.position;
   for(let v=0;v<p.count;v++)assert(Math.abs(p.getZ(v)-(-src.getZ(v)-20.200947-bottom-57))<.001,'Tray folds face downward');
  });
 }
}
assert(sourceBefore.equals(new THREE.Box3().setFromObject(models.zs55Traverse)),'Source asset unchanged');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'rafex-zs55-'));
const built=path.join(dir,'b2b.mjs');
const shell=path.join(dir,'build.sh');fs.copyFileSync('scripts/build.sh',shell);
const pre=fs.readFileSync('scripts/build-runtime.sh','utf8').replace(/\r\n/g,'\n').split("<<'NODE'\n")[1].split('\nNODE')[0];
execFileSync(process.execPath,['-',shell],{input:pre});
const script=fs.readFileSync(shell,'utf8').replace(/\r\n/g,'\n').split('node - "$viewer_source" "$patched_viewer" <<\'NODE\'\n')[1]?.split('\nNODE')[0];
assert(script,'Build viewer generator found');
const viewerSource=path.join(dir,'source.mjs');fs.writeFileSync(viewerSource,fs.readFileSync('client/b2b-viewer.entry.js','utf8').replace(/\r\n/g,'\n'));
execFileSync(process.execPath,['-',viewerSource,built],{input:script});
execFileSync(process.execPath,['scripts/patch-zs55-collection-models.mjs',built]);
execFileSync(process.execPath,['--check',built]);
assert(fs.readFileSync('scripts/patch-b2b-collection-levels-v102.mjs','utf8').includes('function freshFloor(){return{trayWidth:300,trayThickness:.8,traverse:"ZS55|1.5"'));
assert(fs.readFileSync('client/b2b-accessories.js','utf8').includes("freshCollectionFloor = () => ({ trayWidth:300, trayThickness:.8, traverse:'ZS55|1.5'"));
console.log('PASS: supplied GLBs; 1–5 levels, 3 widths, 3 depths; connector size/outer mounting/tray seat; sources unchanged; generated viewer compiles; new floor defaults ZS55.');
if(process.argv.includes('--visual')){
 const require=createRequire(import.meta.url),{build}=require('esbuild'),{chromium}=require('playwright');
 const bundle=await build({entryPoints:[built],bundle:true,write:false,format:'iife',nodePaths:[path.resolve('node_modules')]});
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const decode=(root,prefix)=>gunzipSync(Buffer.from(fs.readdirSync(root).filter(n=>n.startsWith(prefix+'.')).sort().map(n=>fs.readFileSync(path.join(root,n),'utf8')).join(''),'base64'));
  await page.route('http://zs55.test/**',async route=>{
   const name=new URL(route.request().url()).pathname.slice(1);
   if(!name)return route.fulfill({contentType:'text/html',body:'<body style="margin:0"><canvas id="view" style="width:1100px;height:900px"></canvas></body>'});
   let body;
   if(name.startsWith('draco/'))body=fs.readFileSync(path.join(path.dirname(require.resolve('three')),'../examples/jsm/libs',name));
   else if(fs.existsSync('assets/'+name))body=fs.readFileSync('assets/'+name);
   else if(name==='mr-zs-travers.glb')body=decode('assets/mr-src','zs-travers');
   else if(name==='mr-tava.glb')body=decode('assets/mr-src','tava');
   else body=decode('assets/accessory-src',name.replace('b2b-','').replace('.glb',''));
   await route.fulfill({body,contentType:name.endsWith('.js')?'application/javascript':name.endsWith('.wasm')?'application/wasm':'model/gltf-binary'});
  });
  await page.goto('http://zs55.test/');await page.addScriptTag({content:bundle.outputFiles[0].text});
  await page.evaluate(()=>{
   const canvas=document.querySelector('canvas');canvas.addEventListener('b2b-viewer-ready',()=>window.testReady=true);canvas.addEventListener('b2b-viewer-error',e=>window.testError=e.detail.message);
   window.testViewer=window.RafexB2BViewer.mount(canvas,{moduleCount:1,sectionWidth:2700,palletDepth:1200,levels:1,footHeight:2200,showPallets:false,firstPalletPosition:'traverse',firstFloorGap:1075,collectionFloors:[{bottom:500,zsHeight:75,traverse:'ZS55|1.5',trayWidth:300,trayThickness:.8}]});
  });
  await page.waitForFunction(()=>window.testReady||window.testError,{timeout:30000});
  const error=await page.evaluate(()=>window.testError);assert(!error,error);
  assert.deepEqual(errors,[]);
  const ccCheck=await page.evaluate(()=>{
   const viewer=window.testViewer,source=viewer.models.traverse;
   const original=new Map();source.traverse(m=>{if(m.isMesh)original.set(m.name,m.geometry.attributes.position)});
   let frontCount=0,rearCount=0,frontMeshCount=0,rearMeshCount=0,maxFrontXzError=0,maxFrontYError=0,maxRearError=0;
   viewer.content.traverse(group=>{if(group.userData.mountingFace==='upright-front-face'){frontCount++;
    group.traverse(m=>{if(!m.isMesh)return;const a=original.get(m.name),b=m.geometry.attributes.position;if(!a||!b||a.count!==b.count)return;frontMeshCount++;
     for(let i=0;i<b.count;i++){
      maxFrontXzError=Math.max(maxFrontXzError,Math.abs(b.getX(i)-a.getX(i)),Math.abs(b.getZ(i)-a.getZ(i)));
      maxFrontYError=Math.max(maxFrontYError,Math.abs(b.getY(i)-(124.66762351989746-a.getY(i))));
     }});
    return;
   }
   if(!group.name.endsWith('Arka'))return;rearCount++;
   group.traverse(m=>{if(!m.isMesh)return;const a=original.get(m.name),b=m.geometry.attributes.position;if(!a||!b||a.count!==b.count)return;rearMeshCount++;
    for(let i=0;i<b.count;i++)maxRearError=Math.max(maxRearError,Math.abs(b.getX(i)-a.getX(i)),Math.abs(b.getY(i)-a.getY(i)),Math.abs(b.getZ(i)-a.getZ(i)));
   });
   });return{frontCount,rearCount,frontMeshCount,rearMeshCount,maxFrontXzError,maxFrontYError,maxRearError};
  });
  assert(ccCheck.frontCount>0&&ccCheck.rearCount>0&&ccCheck.frontMeshCount>0&&ccCheck.rearMeshCount>0&&ccCheck.maxFrontXzError<.002&&ccCheck.maxFrontYError<.002&&ccCheck.maxRearError<.002,JSON.stringify(ccCheck));
  console.log('PASS: front CC depth mirrored without changing profile length; rear CC source orientation preserved.');
  const collectionColors=await page.evaluate(()=>{
   let bodyColor=null,connectorCount=0,mismatchCount=0;
   window.testViewer.content.traverse(m=>{if(!m.isMesh)return;const name=m.name.toLocaleUpperCase('tr-TR'),material=Array.isArray(m.material)?m.material[0]:m.material;
    if(name.includes('Z_TRAVERS'))bodyColor=material.color.getHex();
   });
   window.testViewer.content.traverse(m=>{if(!m.isMesh||!m.name.toLocaleUpperCase('tr-TR').includes('KONNEKTÖR'))return;connectorCount++;
    const materials=Array.isArray(m.material)?m.material:[m.material];if(materials.some(x=>x.color.getHex()!==bodyColor))mismatchCount++;
   });return{bodyColor,connectorCount,mismatchCount};
  });
  assert(collectionColors.bodyColor!==null&&collectionColors.connectorCount>0&&collectionColors.mismatchCount===0,JSON.stringify(collectionColors));
  console.log('PASS: all collection connectors use the selected traverse color.');
  await page.screenshot({path:path.join(dir,'zs55.png')});
  console.log('VISUAL='+path.join(dir,'zs55.png'));
 }finally{await browser.close();}
}
