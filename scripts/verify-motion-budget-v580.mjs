import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
import {adaptiveRenderQuality} from '../client/adaptive-render-quality.mjs';
const source=fs.readFileSync('client/layout-3d.entry.js','utf8'),fn=source.match(/ function movement580\(\)\{[^\n]+\}/)?.[0];assert(fn);
let sequence=0,renders=0;const timers=new Map();
const mobileQuality=adaptiveRenderQuality({renderer:{domElement:{dataset:{}},setPixelRatio(){}},render:()=>renders++,env:{devicePixelRatio:2,setTimeout:run=>{timers.set(++sequence,run);return sequence;},clearTimeout:id=>timers.delete(id)}});
const api=vm.runInNewContext(fn+';({move:movement580})',{mobileQuality,render:()=>renders++});
api.move();api.move();assert.equal(timers.size,1);assert.equal(mobileQuality.pixelError(),1.5);timers.values().next().value();assert.equal(mobileQuality.pixelError(),.35);assert.equal(renders,3);
assert(source.includes('mobileQuality.pause(paused)'));assert(source.includes('maxPixelError:mobileQuality.pixelError()'));
mobileQuality.dispose();console.log('PASS one adaptive settle timer, refined idle detail and inactive-area isolation.');
