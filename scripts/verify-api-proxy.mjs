import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import {validateCatalogWrite} from './catalog-validation-v185.mjs';

const received=[];
let failCatalog=false;
const server=http.createServer(async(req,res)=>{
  let body='';for await(const chunk of req)body+=chunk;
  received.push({method:req.method,headers:req.headers,body});
  if(req.url==='/api/b2b-types'||req.url==='/api/mekik2-types'){
    if(failCatalog&&req.url==='/api/mekik2-types'){res.writeHead(503);res.end('offline');return;}
    const types=req.url==='/api/b2b-types'?[{id:1,drawing:{b2b:{}}},{id:2,drawing:{plan:{mr:true}}}]:[{id:1,drawing:{rafexSystem:'konsol'}}];
    res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify({types}));return;
  }
  res.writeHead(200,{'content-type':'application/json'});res.end('{"ok":true}');
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
try{
  const origin=`http://127.0.0.1:${server.address().port}`;
  const source=fs.readFileSync(new URL('../api/index.js',import.meta.url),'utf8')
    .replace('import worker from "../dist/server/index.js";','const worker = {};')
    .replace("'../scripts/layout-agent-api-v188.mjs'",JSON.stringify(new URL('./layout-agent-api-v188.mjs',import.meta.url).href))
    .replace("import {validateCatalogWrite} from '../scripts/catalog-validation-v185.mjs';",validateCatalogWrite.toString())
    .replace('https://rafex-configurator.rafex-3908.chatgpt.site',origin);
  const proxy=(await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'))).default;
  for(const method of ['PATCH','POST','DELETE']){
    const body=JSON.stringify({allowedModules:['b2b']});
    const request=new Request('https://example.test/api/users/2',{method,body,headers:{
      'content-type':'application/json','transfer-encoding':'chunked','content-length':'999',
      'connection':'keep-alive, x-hop','x-hop':'remove','cookie':'rafex_session=test-only',
      'origin':'https://example.test'
    }});
    const response=await proxy.fetch(request);
    assert.equal(response.status,200);assert.deepEqual(await response.json(),{ok:true});
    const sent=received.at(-1);
    assert.equal(sent.method,method);assert.equal(sent.body,body);
    assert.equal(sent.headers['x-hop'],undefined);assert.equal(sent.headers.origin,origin);
    assert.equal(sent.headers.cookie,'rafex_session=test-only');
    assert.notEqual(sent.headers['content-length'],'999');
  }
  console.log('PASS: PATCH, POST and DELETE reach upstream with intact JSON/session and valid transport headers.');
  for(const [path,method,body]of [
    ['/api/drawing-projects/48/types','PUT',{revision:0,rackTypes:[{id:1,system:'b2b'},{id:1,system:'b2b'}]}],
    ['/api/projects','POST',{payload:{rackTypes:[{id:1,system:'b2b'},{id:'1',system:'b2b'}]}}],
    ['/api/drawing-projects/48/types','PUT',{rackTypes:[]}]
  ]){
    const before=received.length;
    assert.equal((await proxy.fetch(new Request('https://example.test'+path,{method,body:JSON.stringify(body),headers:{'content-type':'application/json'}}))).status,400);
    assert.equal(received.length,before,'Invalid catalogs never reach persistent storage');
  }
  const valid={revision:0,rackTypes:[{id:1,system:'b2b'},{id:1,system:'mr'}]};
  assert.equal((await proxy.fetch(new Request('https://example.test/api/drawing-projects/48/types',{method:'PUT',body:JSON.stringify(valid)}))).status,200);
  assert.deepEqual(JSON.parse(received.at(-1).body),valid);
  console.log('PASS: ambiguous catalogs rejected before upstream; cross-system keys and complete valid bodies preserved.');
  const catalog=await proxy.fetch(new Request('https://example.test/api/rack-types',{headers:{cookie:'rafex_session=test-only'}}));
  const data=await catalog.json();assert.deepEqual(data.types.map(e=>e.system),['b2b','mr','konsol']);
  assert.deepEqual(data.types.map(e=>e.__rafexApi),['/api/b2b-types','/api/b2b-types','/api/mekik2-types']);
  assert.equal(catalog.headers.get('cache-control'),'no-store');
  failCatalog=true;
  assert.equal((await proxy.fetch(new Request('https://example.test/api/rack-types'))).status,503,'Do not present a partial catalog as complete');
  console.log('PASS: unified catalog reads deployed save stores, preserves system/deletion routes and rejects partial failure.');
}finally{await new Promise(resolve=>server.close(resolve));}
