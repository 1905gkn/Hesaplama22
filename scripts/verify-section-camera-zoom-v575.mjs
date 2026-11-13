import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
import {cameraCaptureZoom,sourceTransform} from './section-camera-zoom-v575.mjs';
class Vector{constructor(x,y,z){Object.assign(this,{x,y,z});}sub(v){this.x-=v.x;this.y-=v.y;this.z-=v.z;return this;}add(v){this.x+=v.x;this.y+=v.y;this.z+=v.z;return this;}multiplyScalar(f){this.x*=f;this.y*=f;this.z*=f;return this;}distanceTo(v){return Math.hypot(this.x-v.x,this.y-v.y,this.z-v.z);}}
const target=new Vector(10,20,30),position=new Vector(110,220,330);let updated=0;
const viewer={camera:{position,far:100,updateProjectionMatrix(){updated++;}},controls:{target,update(){}}};
const before=position.distanceTo(target);cameraCaptureZoom(viewer,.5);assert(Math.abs(position.distanceTo(target)-2*before)<1e-9);assert(viewer.camera.far>=position.distanceTo(target)*20);assert.equal(updated,1);
cameraCaptureZoom(viewer,2);assert(Math.abs(position.distanceTo(target)-before)<1e-9);
for(const [file,name,start]of [['scripts/patch-mr-free-extension-v35.mjs','captureMRPerspective','const detachedCapture = `'],['scripts/patch-ui-runtime-stability.mjs','captureB2BPerspective','const detached = `']]){
 const s=fs.readFileSync(file,'utf8'),index=s.indexOf(start);assert(index>=0);
 const capture=s.slice(index+start.length,s.indexOf('\n`;',index)).replaceAll('\\`','`').replaceAll('\\${','${');
 const result=sourceTransform(capture,name);new vm.Script(result);assert(result.includes('cameraCaptureZoom(viewer,settings.captureZoom)'));assert.equal(sourceTransform(result,name),result);
}
if(fs.existsSync('dist/index.html')){const html=fs.readFileSync('dist/index.html','utf8');assert(html.includes('data-section-camera-zoom="v575"'));assert(html.includes('data-rafex-camera-zoom-out'));for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g))if(!/src=|application\/json/.test(m[1]))new vm.Script(m[2]);}
console.log('PASS v575: camera distance zoom, target preservation, far plane, MR/B2B source captures, idempotency and generated editor');
