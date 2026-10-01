import assert from 'node:assert/strict';import {insideLayoutPointer} from './patch-join-marquee-v240.mjs';
assert(insideLayoutPointer({target:{closest:()=>null},composedPath:()=>[{id:''},{id:'m2LayoutSvg'},{}]}),'Background replaced during drawing still belongs to canvas');
assert(insideLayoutPointer({target:{closest:()=>({id:'m2LayoutSvg'})}}));
assert(!insideLayoutPointer({target:{closest:()=>null},composedPath:()=>[{id:'outside'}]}));
console.log('PASS detached canvas background, attached rack, outside cancellation');
