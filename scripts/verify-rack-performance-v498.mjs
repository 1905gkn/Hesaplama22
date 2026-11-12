import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {clearMekikResourcesV498,batchMrPartsV498,disposeMrInstancesV498,observeKonsolDetachV498,transformHtml,transformMR,transformMekik,transformKonsol} from './rack-performance-v498.mjs';
const THREE=await import(process.env.RAFEX_THREE_MODULE||'three');
globalThis.RafexThree=THREE;

const sharedGeometry=new THREE.BoxGeometry(1,1,1),sharedMaterial=new THREE.MeshBasicMaterial(),ownGeometry=new THREE.BoxGeometry(2,2,2),ownMaterial=new THREE.MeshBasicMaterial();
const asset=new THREE.Group(),root=new THREE.Group();asset.add(new THREE.Mesh(sharedGeometry,sharedMaterial));
root.add(new THREE.Mesh(sharedGeometry,ownMaterial),new THREE.Mesh(ownGeometry,ownMaterial),asset.clone(true));
const disposals={sharedGeometry:0,sharedMaterial:0,ownGeometry:0,ownMaterial:0};
for(const [name,item] of Object.entries({sharedGeometry,sharedMaterial,ownGeometry,ownMaterial}))item.addEventListener('dispose',()=>disposals[name]++);
clearMekikResourcesV498.call({models:{upright:{root:asset}},root});
assert.deepEqual(disposals,{sharedGeometry:0,sharedMaterial:0,ownGeometry:1,ownMaterial:1});assert.equal(root.children.length,0);

const parts=new THREE.Group();for(let i=0;i<48;i++){const part=new THREE.Mesh(sharedGeometry,sharedMaterial);part.position.set(i*3,(i%4)*2,5);part.rotation.x=i%2?Math.PI:0;part.scale.set(2,1,3);parts.add(part);}
const boundsBefore=new THREE.Box3().setFromObject(parts);batchMrPartsV498(parts);
const boundsAfter=new THREE.Box3().setFromObject(parts);assert.equal(parts.children.length,1);assert.equal(parts.children[0].count,48);
assert.ok(boundsBefore.min.distanceTo(boundsAfter.min)<1e-5);assert.ok(boundsBefore.max.distanceTo(boundsAfter.max)<1e-5);
let instanceDisposals=0;parts.children[0].addEventListener('dispose',()=>instanceDisposals++);disposeMrInstancesV498(parts);assert.equal(instanceDisposals,1);assert.equal(disposals.sharedGeometry,0);assert.equal(disposals.sharedMaterial,0);
let detachCallback,destroyCalls=0;globalThis.document={getElementById:()=>({})};globalThis.MutationObserver=class{constructor(cb){detachCallback=cb}observe(){}disconnect(){}};
const detachedViewer={canvas:{id:'konsolCanvas',isConnected:true},destroy(){destroyCalls++}};observeKonsolDetachV498(detachedViewer);detachCallback();assert.equal(destroyCalls,0);detachedViewer.canvas.isConnected=false;detachCallback();assert.equal(destroyCalls,1);

function frameTest(code,name){
  const start=name==='MR'?code.indexOf('animate(){if(!this.destroyed)'):code.indexOf('loop(){if(!this.destroyed)');
  const end=code.indexOf('destroy(){',start),methods=code.slice(start,end);
  const queue=new Map();let seq=0,renders=0,dirty=true;
  const context={requestAnimationFrame:fn=>{queue.set(++seq,fn);return seq},cancelAnimationFrame:id=>queue.delete(id),document:{hidden:false},Za:()=>{const value=dirty;dirty=false;return value},$a:()=>true,ke:o=>{if(o.renderDirty){renders++;o.renderDirty=false;return true}return !!o.controls.autoRotate}};
  context.console=console;
  if(name==='MR'){const visibleName=methods.match(/this\.animationFrame=null,!([\w$]+)\(this\)/)?.[1];assert.ok(visibleName);context[visibleName]=()=>true;}
  if(name==='MR'){const dirtyName=methods.match(/this\.changedV498=([\w$]+)\(this\)/)?.[1];assert.ok(dirtyName);context[dirtyName]=context.Za;}
  if(name==='Konsol'){const frameName=methods.match(/([\w$]+)\(this\)&&this.requestFrameV498/)?.[1];assert.ok(frameName);context[frameName]=context.ke;}
  const C=vm.runInNewContext('(class Harness{'+methods+'})',context),v=new C();
  Object.assign(v,{destroyed:false,canvas:{isConnected:true,clientHeight:800},visibilityV147:{visible:true},renderVisibility:{visible:true},controls:{update(){},autoRotate:false},dimensionLabels:[],renderer:{render(){renders++}},camera:{},scene:{},animationFrame:null,raf:null});
  if(name==='MR')v.animate=v.animate.bind(v);
  const drain=limit=>{let n=0;while(queue.size&&n++<limit){const [id,fn]=queue.entries().next().value;queue.delete(id);fn();}return n};
  v.invalidateV498();drain(20);assert.equal(queue.size,0,name+' must sleep');assert.ok(renders>0,name+' must paint');
  dirty=true;v.invalidateV498();drain(20);assert.equal(queue.size,0,name+' wakes and sleeps after edit');
  v.controls.autoRotate=true;v.requestFrameV498();drain(5);assert.ok(queue.size>0,name+' rotation continues');
  v.controls.autoRotate=false;drain(20);assert.equal(queue.size,0,name+' rotation stops');
}
const mr=fs.readFileSync('dist/mr-viewer.js','utf8'),konsol=fs.readFileSync('dist/konsol-viewer.js','utf8');
frameTest(mr,'MR');frameTest(konsol,'Konsol');
for(const [file,transform] of [['mr',transformMR],['mekik-front',transformMekik],['konsol',transformKonsol]]){const text=fs.readFileSync('dist/'+file+'-viewer.js','utf8');assert.equal(transform(text),text,'idempotent '+file);new vm.Script(text);}
const html=fs.readFileSync('dist/index.html','utf8');assert.equal(transformHtml(html),html);
assert.ok(!html.slice(html.indexOf('function syncEdge(){'),html.indexOf('function cleanSectionTypes(){}')).includes('button.click()'));
const planScript=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(s=>s.includes('window.rafexRenderPlanV143=function'));
const context={window:{rafexPlanFinishV382:()=> '#004f7c'}};vm.runInNewContext(planScript,context);
const p={width:72090,length:51250,bays:50,depth:60,foot:90,pitch:1440,palW:1200,palD:800,positions:Array.from({length:60},(_,i)=>i*850),sequence:Array.from({length:40},(_,i)=>({kind:i%2?'braces':'feet',y:i*1200,length:1200})),showPallets:true,braces:[]};
const full=context.window.rafexRenderPlanV143(p),compact=context.window.rafexRenderPlanV143(p,{compact:true});
const count=s=>(s.match(/<[^/!][^>]*>/g)||[]).length;assert.ok(count(compact)<count(full)*.6);
assert.equal((full.match(/data-pallet-row=/g)||[]).length,3000);assert.equal((compact.match(/data-pallet-row=/g)||[]).length,60);
console.log(JSON.stringify({result:'PASS',cleanup:disposals,mrParts:'48 meshes -> 1 batch; identical bounds',idle:'MR and Konsol sleep, wake, rotate, stop',topNodes:{full:count(full),compact:count(compact)},syntax:'all modified viewers and inline scripts',idempotency:true}));
