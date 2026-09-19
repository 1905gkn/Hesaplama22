import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const stability=fs.readFileSync('scripts/patch-ui-runtime-stability.mjs','utf8').replaceAll('\r\n','\n');
const injection=fs.readFileSync('scripts/inject-user-20260819.mjs','utf8').replaceAll('\r\n','\n');
function slice(source,start,end){
  const a=source.indexOf(start),b=source.indexOf(end,a);
  assert(a>=0&&b>a,'Runtime anchors must exist');
  return source.slice(a,b);
}
for(const variant of ['stable','force']){
  let root={hidden:false},value=1,calls=[],queue=[],seq=0;
  const canvas={};
  const context={console,window:{},requestAnimationFrame:fn=>{queue.push(fn);return seq++;},
    modal:()=>root,customizeModal:()=>root,ensureViewer:()=>{},palletLabel:()=>{},
    m2PreviewRackCustomization:()=>calls.push(value),
    customizeDraft:()=>({options:{value}}),document:{getElementById:()=>canvas}};
  context.window.RafexB2BViewer={isMountedOn:()=>true,update:options=>calls.push(options.value)};
  const code=variant==='stable'
    ?slice(stability,'  const stablePreview=','  const refreshModal=')+'\nglobalThis.schedule=scheduleStablePreview;'
    :slice(injection,'  const forceCustomizePreview=','\n  try{\n    var originalCustomizeOpen=')+'\nglobalThis.schedule=scheduleForcePreview;';
  vm.createContext(context);vm.runInContext(code,context);
  const flush=()=>{const pending=queue;queue=[];pending.forEach(fn=>fn());};
  for(let i=0;i<100;i++){value=i;context.schedule();}
  assert.equal(queue.length,1,'100 requests must schedule one callback (including frame id zero)');
  flush();assert.deepEqual(calls,[99],'Must use latest state, not first event state');
  context.schedule();root.hidden=true;flush();assert.equal(calls.length,1,'Closing before frame skips work');
  context.schedule();assert.equal(queue.length,0,'Hidden modal schedules no work');
  root=null;context.schedule();assert.equal(queue.length,0,'Missing modal schedules no work');
  root={hidden:false};value=101;context.schedule();flush();assert.deepEqual(calls,[99,101],'Reopening resumes');
  if(variant==='stable')context.m2PreviewRackCustomization=()=>{throw Error('expected test failure');};
  else context.window.RafexB2BViewer.update=()=>{throw Error('expected test failure');};
  context.console={warn:()=>{}};context.schedule();flush();context.schedule();assert.equal(queue.length,1,'Failure must not lock scheduler');flush();
  console.log('PASS '+variant+': 100 requests -> 1 callback; latest state, close, missing modal, reopen and error recovery');
}
let writes=0,text='';
const button={getAttribute:()=> 'true',get textContent(){return text;},set textContent(v){writes++;text=v;}};
const labelContext={document:{getElementById:()=>button}};
vm.createContext(labelContext);vm.runInContext(slice(stability,'  const palletLabel=','  const ensureViewer=')+'\nglobalThis.label=palletLabel;',labelContext);
labelContext.label();labelContext.label();assert.equal(writes,1,'Unchanged label must not produce another DOM mutation');
button.getAttribute=()=> 'false';labelContext.label();assert.equal(writes,2,'Changed visibility must update label');
assert(!stability.includes('requestAnimationFrame(stablePreview)'));
assert(!injection.includes('requestAnimationFrame(forceCustomizePreview)'));
console.log('PASS label: unchanged text does not trigger another DOM write. These are simulated runtime tests, not authenticated UI tests.');
