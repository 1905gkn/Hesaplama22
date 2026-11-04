import assert from 'node:assert/strict';
import vm from 'node:vm';
import {runtime,transform} from './b2b-live-input-v486.mjs';
function setup(){
 let seq=0,now=0;const timers=new Map(),listeners={},inputs=new Map(),calls=[];
 const ctx={window:{},m2ActiveModule:'b2b',b2b3DUpdateTimer:null,
 document:{getElementById:id=>id==='b2bMain3DCanvas'?{}:inputs.get(id),addEventListener:(n,f)=>listeners[n]=f},
 setTimeout(f,ms){const id=++seq;timers.set(id,{f,at:now+ms});return id;},
 clearTimeout(id){timers.delete(id);},
 b2bApplyInputs(event){calls.push(['apply',event.target.value,event.type]);ctx.b2b3DUpdateTimer=ctx.setTimeout(()=>calls.push(['delayed']),140);},
 b2bUpdateMain3D(){calls.push(['3d']);}};
 vm.runInNewContext(runtime,ctx);
 function input(id,value){const el={id,value,isConnected:true,validity:{valid:true},closest:s=>s==='.b2b-input-card'?{}:null};inputs.set(id,el);return el;}
 return {ctx,calls,input,listeners,queue:ctx.window.b2bQueueLiveInputV486,advance(ms){now+=ms;for(const[id,t]of [...timers])if(t.at<=now){timers.delete(id);t.f();}},timers};
}
{
 const t=setup(),el=t.input('b2bLevels','6');t.queue({target:el});
 t.advance(100);el.value='7';t.queue({target:el});t.advance(60);
 assert.deepEqual(t.calls,[['apply','7','change'],['3d']]);
 t.advance(1000);assert.equal(t.calls.length,2);
 t.queue({target:el});t.listeners.focusout({target:el});assert.equal(t.calls.length,2);
}
{
 const t=setup(),el=t.input('b2bPalletCount','2');t.queue({target:el});
 t.listeners.change({target:el});assert.equal(t.calls[0][1],'2');
 t.advance(1000);assert.equal(t.calls.length,2);
 el.value='';t.queue({target:el});t.advance(200);assert.equal(t.calls.length,2);
 el.value='3';t.queue({target:el});t.advance(160);assert.equal(t.calls[2][1],'3');
}
{
 const t=setup(),el=t.input('b2bLevels','5');t.queue({target:el});el.isConnected=false;t.advance(160);assert.equal(t.calls.length,0);
 el.isConnected=true;t.queue({target:el});t.ctx.m2ActiveModule='mekik';t.advance(160);assert.equal(t.calls.length,0);
}
{
 const html='<body>'+('oninput="b2bApplyInputs(event)"'.repeat(9))+'</body>';
 const out=transform(html);assert.equal((out.match(/b2bQueueLiveInputV486\(event\)/g)||[]).length,9);
 assert.equal(transform(out),out);
 new vm.Script(runtime);
}
console.log('PASS: latest numeric edit, immediate blur, no starvation/duplicate, empty input, stale DOM/module and idempotent transform');
