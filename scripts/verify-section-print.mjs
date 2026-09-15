import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {transform} from './patch-section-print.mjs';
const html=transform(fs.readFileSync('portal.html','utf8'));
const start=html.indexOf('async function m2PrintCorporateReport(){'),end=html.indexOf('function m2QueueLayoutRender()',start);
const code=html.slice(start,end);
for(const fail of [false,true]){
  const events=[];
  const image={naturalWidth:100,decode:async()=>{events.push('decode');if(fail)throw Error('load failed')}};
  const classList={add:()=>events.push('print-mode'),remove:()=>{}};
  const preview={innerHTML:'<section>saved camera image</section>',querySelector:()=>({}),querySelectorAll:()=>[{querySelector:()=>image}]};
  const print={querySelectorAll:()=>[image],remove:()=>events.push('cleanup')};
  const window={rafexCreateFreeDrawingOutput:async()=>events.push('prepare'),__rafexPrepareCorporatePrint:async()=>events.push('obsolete-rebuild'),addEventListener(){},removeEventListener(){},print:()=>events.push('print')};
  const document={querySelector:()=>({}),getElementById:id=>id==='m2CorporatePreview'?preview:null,createElement:()=>print,body:{appendChild(){},classList},documentElement:{classList}};
  const ctx=vm.createContext({window,document,console,alert:()=>events.push('error'),requestAnimationFrame:fn=>fn(),m2BuildCorporatePages:()=>{throw Error('Ready sections must not be rebuilt')}});
  vm.runInContext(code,ctx);await ctx.m2PrintCorporateReport();
  assert.equal(print.innerHTML,preview.innerHTML);
  assert(!events.includes('obsolete-rebuild'));
  if(fail){assert(!events.includes('print'));assert(events.includes('error'))}
  else{assert(events.indexOf('decode')<events.indexOf('print-mode'));assert(events.includes('print'))}
}
console.log('PASS: prepared sections retained, decoded before printing, failed images block empty PDF.');
