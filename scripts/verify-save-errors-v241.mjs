import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import{webcrypto}from'node:crypto';
const context={crypto:webcrypto,navigator:{onLine:true},window:{},fetch:null};vm.createContext(context);vm.runInContext(fs.readFileSync(new URL('./save-recovery-request-v241.js',import.meta.url),'utf8'),context);
let count=0;
async function rejects(response,pattern,status){context.fetch=async()=>response;await assert.rejects(context.requestJson('/api/projects',{method:'POST',body:'SECRET-PAYLOAD'}),error=>{assert.match(error.message,pattern);assert.equal(error.status,status);assert.match(error.code,/^HATA-/);assert(!error.message.includes('SECRET'));assert.equal(error.details.path,'/api/projects');count++;return true;});}
await rejects(new Response(JSON.stringify({error:'Oturum gerekli.'}),{status:401,headers:{'content-type':'application/json'}}),/Oturum gerekli.*HTTP 401/,401);
await rejects(new Response('<html>SECRET upstream stack</html>',{status:502,headers:{'content-type':'text/html'}}),/Ara sunucu.*HTML.*HTTP 502/,502);
await rejects(new Response('<html>login</html>',{status:200,headers:{'content-type':'text/html'}}),/Beklenen JSON.*HTTP 200/,200);
await rejects(new Response('{broken',{status:200,headers:{'content-type':'application/json'}}),/bozuk JSON.*HTTP 200/,200);
await rejects(new Response(JSON.stringify({error:'Çakışan kayıt'}),{status:409,headers:{'content-type':'application/problem+json'}}),/Çakışan kayıt.*HTTP 409/,409);
context.navigator.onLine=false;context.fetch=async()=>{throw new TypeError('Failed to fetch')};await assert.rejects(context.requestJson('/api/projects'),/İnternet bağlantısı yok/);count++;
context.navigator.onLine=true;await assert.rejects(context.requestJson('/api/projects'),/Sunucuya bağlantı kurulamadı/);count++;
context.fetch=async()=>new Response('{"ok":true}',{headers:{'content-type':'application/json'}});assert.equal((await context.requestJson('/api/projects')).ok,true);count++;
console.log(count+' request/error cases passed');
