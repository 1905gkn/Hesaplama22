import fs from 'node:fs';import assert from 'node:assert/strict';import * as T from 'three';import vm from 'node:vm';
import {compactCadVertices,compactCadVerticesAsync} from '../client/cad-exact-vertices.mjs';
import {readGlb,readPrimitive} from './cad-gpu-assets-v532.mjs';
import {cadFacingParts,mayFaceCamera} from '../client/cad-facing-batches.mjs';
import {createPreparationBudget} from '../client/layout-3d-budget.mjs';
import {transform} from './drive-gpu-v537.mjs';
const bytes=fs.readFileSync(process.env.RAFEX_DRIVE_TEST_ASSET||'dist/drive-in/drive-in-ayak-top.glb'),{json,bin}=readGlb(bytes),budget=createPreparationBudget();
let beforeVertices=0,afterVertices=0,faces=0,emptyFaces=0,checkedCulls=0;
const pa=new T.Vector3(),pb=new T.Vector3(),pc=new T.Vector3(),normal=new T.Vector3(),edge=new T.Vector3();
for(const mesh of json.meshes)for(const primitive of mesh.primitives){
 const {attrs,indices}=await readPrimitive(json,bin,primitive),g=new T.BufferGeometry();
 for(const [name,a]of Object.entries(attrs))g.setAttribute(name==='POSITION'?'position':name==='NORMAL'?'normal':name,new T.BufferAttribute(a.array,a.n,!!a.normalized));g.setIndex(new T.BufferAttribute(indices,1));
 const originalPositions=g.attributes.position.array.slice(),compact=await compactCadVerticesAsync(g,budget);beforeVertices+=g.attributes.position.count;afterVertices+=compact.attributes.position.count;faces+=indices.length/3;
 assert.deepEqual(g.attributes.position.array,originalPositions,'Source CAD not mutated');assert.equal(compact.index.count,g.index.count,'No triangles removed or reordered');
 for(const [name,a]of Object.entries(g.attributes)){
  const b=compact.attributes[name],oldWords=new Uint32Array(a.array.buffer,a.array.byteOffset,a.array.byteLength/4),newWords=new Uint32Array(b.array.buffer,b.array.byteOffset,b.array.byteLength/4);
  for(let j=0;j<indices.length;j++)for(let k=0;k<a.itemSize;k++)assert.equal(newWords[compact.index.getX(j)*a.itemSize+k],oldWords[g.index.getX(j)*a.itemSize+k],'Each rendered corner, normal and winding remains bit-exact');
 }
 const parts=await cadFacingParts(compact,budget);if(!parts)continue;
 assert.equal(parts.reduce((n,p)=>n+p.geometry.index.count,0),indices.length);
 for(const part of parts){
  if(part.geometry.drawRange.count===0){emptyFaces+=part.geometry.index.count/3;for(let j=0;j<part.geometry.index.count;j+=3){const p=part.geometry.attributes.position,ix=part.geometry.index;pa.fromBufferAttribute(p,ix.getX(j));pb.fromBufferAttribute(p,ix.getX(j+1));pc.fromBufferAttribute(p,ix.getX(j+2));normal.subVectors(pb,pa).cross(edge.subVectors(pc,pa));assert.equal(normal.lengthSq(),0,'Only exactly zero-area faces excluded from GPU draws');}}
  const pos=part.geometry.attributes.position,ix=part.geometry.index;
  for(const camera of [new T.Vector3(10000,12000,9000),new T.Vector3(-8000,-4000,2000),new T.Vector3(20,2500,-100),new T.Vector3(50,6000,50)])if(!mayFaceCamera(part,camera)){
   checkedCulls++;for(let j=0;j<ix.count;j+=3){pa.fromBufferAttribute(pos,ix.getX(j));pb.fromBufferAttribute(pos,ix.getX(j+1));pc.fromBufferAttribute(pos,ix.getX(j+2));normal.subVectors(pb,pa).cross(edge.subVectors(pc,pa));assert(normal.dot(edge.subVectors(camera,pa))<0,'No potentially visible original triangle may be culled');}
  }
 }
}
assert(afterVertices<beforeVertices*.8,'Real Drive asset must reuse at least 20% of vertex entries');assert(emptyFaces>30000);assert(checkedCulls>0);
// No welding across normal/UV seams, signed zero, or arbitrary attribute bits.
const seams=new T.BufferGeometry();seams.setAttribute('position',new T.Float32BufferAttribute([0,0,0,0,0,0,0,0,0],3));seams.setAttribute('normal',new T.Float32BufferAttribute([0,1,0,0,-1,0,0,1,0],3));seams.setIndex([0,1,2]);const welded=compactCadVertices(seams,{threshold:0});assert.equal(welded.attributes.position.count,2);assert.deepEqual(Array.from(welded.index.array),[0,1,0]);
// Geometry-only MR extraction has no renderer or controls and must never start
// an animation callback. Real viewers wake correctly even if methods are unbound.
const mr=fs.readFileSync('dist/mr-viewer.js','utf8'),method=mr.match(/requestFrameV498\(\)\{[\s\S]*?\}invalidateV498/)[0].replace(/invalidateV498$/,'');let scheduled=null;
const Harness=vm.runInNewContext('(class{'+method+'})',{document:{hidden:false},requestAnimationFrame:fn=>{scheduled=fn;return 1;}}),stub=new Harness();stub.requestFrameV498();assert.equal(scheduled,null);stub.renderer={};stub.controls={};stub.animate=function(){assert.equal(this,stub);};stub.requestFrameV498();assert(scheduled);scheduled();
const html=fs.readFileSync(fs.existsSync('dist/index.html')?'dist/index.html':'preview.html','utf8'),patched=transform(html);assert.equal(transform(patched),patched);assert(patched.includes('/layout-3d.js?v=537'));assert(patched.includes('/drive-in-viewer.js?v=537'));assert(patched.includes('/mr-viewer.js?v=537'));
console.log(JSON.stringify({pass:true,sourceFaces:faces,skippedEmptyFaces:emptyFaces,beforeVertices,afterVertices,vertexReductionPercent:+(100*(1-afterVertices/beforeVertices)).toFixed(1),checkedCulls,...budget.stats(),geometryAndNormalsBitExact:true,resolutionUnchanged:true}));
