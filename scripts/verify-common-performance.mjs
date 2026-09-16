import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {viewerFrameChanged} from './viewer-frame-budget.mjs';
import {catalogRecordFingerprint,mergeRackCatalog} from './stable-rack-catalog.mjs';
import {namespaceSvgCopy} from './namespace-svg-copy.mjs';
import {transform} from './patch-stable-rack-catalog.mjs';

const row={id:1,name:'A',system:'mr',drawing:{width:2400,load:200}};
const excluded=JSON.parse(JSON.stringify([catalogRecordFingerprint(row)]));
assert.equal(mergeRackCatalog([], [row], excluded).entries.length,0);
assert.equal(mergeRackCatalog([], [{...row,id:999,name:'Z'}], excluded).entries.length,0);
assert.equal(mergeRackCatalog([], [row]).entries.length,1,'Deletion is scoped to its project');
const viewer={camera:{position:{x:1,y:2,z:3},quaternion:{x:0,y:0,z:0,w:1},zoom:1,fov:45,aspect:2},canvas:{width:1200,height:600}};
assert.equal(Array.from({length:600},()=>viewerFrameChanged(viewer)).filter(Boolean).length,1);
for(const change of [()=>viewer.camera.position.x++,()=>viewer.camera.quaternion.w=.5,()=>viewer.canvas.width++,()=>viewer.frameDirty=true]){
  change();assert(viewerFrameChanged(viewer));assert(!viewerFrameChanged(viewer));
}
class Element {
  constructor(attrs={},children=[]){this.attrs=attrs;this.children=children;}
  get attributes(){return Object.entries(this.attrs).map(([name,value])=>({name,value}));}
  getAttribute(k){return this.attrs[k];} setAttribute(k,v){this.attrs[k]=v;}
  querySelectorAll(s){const all=this.children.flatMap(c=>[c,...c.querySelectorAll('*')]);return s==='[id]'?all.filter(c=>c.attrs.id):all;}
}
const fill=new Element({id:'steel'}),shape=new Element({fill:'url(#steel)',href:'#steel'}),svg=new Element({},[fill,shape]);
namespaceSvgCopy(svg,'output-1');
assert.equal(fill.attrs.id,'output-1-steel');assert.equal(shape.attrs.fill,'url(#output-1-steel)');assert.equal(shape.attrs.href,'#output-1-steel');
if(process.argv[2]){
 const source=fs.readFileSync(process.argv[2],'utf8'),m=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
 const html=transform(m?Buffer.from(m[2],'base64').toString():source);
 const runtime=html.match(/<script data-rafex-stable-catalog>([\s\S]*?)<\/script>/)[1];
 let clones=0;const context={window:{},structuredClone(value){clones++;return structuredClone(value);}};
 vm.runInNewContext(runtime,context);
 const data=[row],one=context.window.rafexCatalogView(data);
 for(let i=0;i<100;i++)assert.equal(context.window.rafexCatalogView(data),one);
 assert.equal(clones,1);one[0].name='local';assert.equal(data[0].name,'A');
 data.push({...row,id:2});assert.equal(context.window.rafexCatalogView(data).length,2);assert.equal(clones,2);
}
console.log('PASS: deletion exclusion survives reload, project isolation, idle/camera/resize rendering, SVG references, cached catalog copies.');
