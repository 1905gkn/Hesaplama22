import assert from 'node:assert/strict';
import {layoutAgent} from './layout-agent-api-v188.mjs';
const requestId=crypto.randomUUID(),secret='DO_NOT_LOG_PRIVATE_DATA';
const request=()=>new Request('https://rafex.test/api/layout-agent',{method:'POST',headers:{origin:'https://rafex.test'},body:JSON.stringify({requestId,prompt:secret,source:{system:'b2b'}})});
const config={env:{OPENAI_API_KEY:secret},now:()=>Date.parse('2026-09-23'),proxyApi:async()=>Response.json({ok:true,requestId,reservedUsd:.10})};
const completed=text=>Response.json({status:'completed',output:[{type:'message',content:[{type:'output_text',text}]}]});
const cases=[
 ['MODEL_TIMEOUT',504,async()=>{throw new DOMException(secret,'TimeoutError')}],
 ['PROVIDER_CONNECTION',502,async()=>{throw Error(secret)}],
 ['PROVIDER_HTTP',502,async()=>new Response(secret,{status:429})],
 ['PROVIDER_JSON',502,async()=>new Response(secret)],
 ['OUTPUT_LIMIT',502,async()=>Response.json({status:'incomplete',incomplete_details:{reason:'max_output_tokens'}})],
 ['RESPONSE_INCOMPLETE',502,async()=>Response.json({status:'failed'})],
 ['RESPONSE_FORMAT',502,async()=>Response.json({status:'completed',output:{}})],
 ['EMPTY_OUTPUT',502,async()=>Response.json({status:'completed',output:[]})],
 ['OUTPUT_JSON',502,async()=>completed(secret)],
 ['OUTPUT_VALIDATION',502,async()=>completed('{}')],
];
const logs=[],original=console.error;console.error=x=>logs.push(x);
try{for(const [code,status,fetcher] of cases){let calls=0;const response=await layoutAgent(request(),{...config,fetchImpl:async()=>{calls++;return fetcher()}});const data=await response.json();assert.equal(response.status,status);assert.equal(data.code,code);assert.equal(data.requestId,requestId);assert.equal(data.reservedUsd,.10);assert.equal(calls,1);assert.ok(data.error.includes(requestId));assert.ok(!JSON.stringify(data).includes(secret));const log=JSON.parse(logs.at(-1));assert.equal(log.code,code);assert.equal(log.requestId,requestId);assert.ok(!logs.at(-1).includes(secret));}}finally{console.error=original;}
console.log('PASS: 10 distinct agent errors, safe correlation logs, no private content, unchanged reservation, no retries.');
