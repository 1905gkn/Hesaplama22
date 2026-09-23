import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {layoutAgent,buildAgentRequest} from './layout-agent-api-v188.mjs';
const input={requestId:crypto.randomUUID(),prompt:'Sağa 20 yeni blok ekle',source:{system:'b2b'}};
const request=(body=input,origin='https://rafex.test')=>new Request('https://rafex.test/api/layout-agent',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(body)});
const cfg={env:{OPENAI_API_KEY:'fake'},now:()=>Date.parse('2026-09-23'),proxyApi:async r=>{const x=await r.json();return Response.json({ok:true,requestId:x.requestId,reservedUsd:.10})}};
let calls=0;
const fetchImpl=async(url,opts)=>{calls++;const b=JSON.parse(opts.body);assert.equal(b.model,'gpt-5.6-sol');assert.equal(b.reasoning.effort,'low');assert.equal(b.max_output_tokens,1500);assert.equal(b.store,false);assert.equal(b.service_tier,'default');assert.ok(!b.tools);return Response.json({status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify({action:'repeat',count:20,direction:1,reason:'20 yeni blok.'})}]}]});};
assert.equal((await layoutAgent(request(),{...cfg,fetchImpl})).status,200);assert.equal(calls,1);
for(const change of [{env:{}},{now:()=>Date.parse('2026-11-22')},{proxyApi:async()=>Response.json({error:'cap'}, {status:409})},{proxyApi:async()=>Response.json({ok:true})},{proxyApi:async()=>{throw Error('offline')}}]){
 assert.ok((await layoutAgent(request(),{...cfg,fetchImpl,...change})).status>=400);
}
assert.equal((await layoutAgent(request(input,'https://evil.test'),{...cfg,fetchImpl})).status,403);
assert.equal((await layoutAgent(request({...input,prompt:'x'.repeat(1201)}),{...cfg,fetchImpl})).status,400);
assert.equal(calls,1,'blocked requests must never call model');
let failed=0;await layoutAgent(request(),{...cfg,fetchImpl:async()=>{failed++;throw Error('timeout')}});assert.equal(failed,1,'no automatic retry');
for(const prompt of ['x'.repeat(1200),'😀'.repeat(600),'ş'.repeat(1200)]){const b=buildAgentRequest({...input,prompt});assert.ok((Buffer.byteLength(JSON.stringify(b))+1000)*5+30000<=95000);}
console.log('PASS: model/low, cost bound, no tools/retry, missing key, expired pricing, quota failure, CSRF, malformed budget, timeout, input limits.');
const source=fs.readFileSync(new URL('./patch-regions-repeat-v179.mjs',import.meta.url),'utf8');
const repeat=source.slice(source.indexOf(' function repeat(options='),source.indexOf(' function install(){',source.indexOf(' function repeat(options=')));
const racks=[{id:1,x:0,y:0,w:100,h:50,angle:0,locked:true}];let undos=0;
const ctx={racks:()=>racks,symbols:()=>[],clone:structuredClone,status:()=>{},$:()=>null,m2AutoFillDraft:null,m2LayoutState:{selected:1,scale:1},m2RackInsideArea:r=>r.x>=0&&r.x+r.w<=500,m2RackOverlapsExcept:()=>false,m2RackBounds:r=>({left:r.x,right:r.x+r.w,top:r.y,bottom:r.y+r.h}),overlap:(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top,m2PushUndo:()=>undos++,m2SetAutoFillControlsActive:()=>{},m2RenderLayout:()=>{}};
vm.createContext(ctx);vm.runInContext(repeat+';this.repeat=repeat;',ctx);
const preview=ctx.repeat({count:2,direction:1,sourceId:1,dryRun:true});assert.equal(preview.racks.length,2);assert.equal(racks.length,1);assert.equal(undos,0);
assert.equal(ctx.repeat({count:20,direction:1,sourceId:1}),false);assert.equal(racks.length,1);assert.equal(undos,0);
assert.equal(ctx.repeat({count:2,direction:1,sourceId:1}),true);assert.equal(racks.length,3);assert.equal(undos,1);
console.log('PASS: repeat dry-run has no mutations/undo, over-capacity fails atomically, apply creates two racks in one undo.');
