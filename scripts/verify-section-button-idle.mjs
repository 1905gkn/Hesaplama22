import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync('scripts/inject-user-20260819.mjs','utf8');
const start=source.indexOf('  const keepSectionAlive='),end=source.indexOf('  // __rafexFreeSystemChooserV54',start);
assert.ok(start>=0&&end>start);
let now=0,seq=0,checks=0,opens=0,modal=null,buttonPresent=false;
const timers=new Map(),listeners={},observers=[];
const body={};
const context={window:{__rafexEnsureSectionPlacementV3(){checks++;buttonPresent=true;},__rafexOpenSectionPlacementV3(){opens++;}},
  document:{body,addEventListener(name,callback){listeners[name]=callback;},getElementById(){return modal;}},console,
  setTimeout(callback,delay){const id=++seq;timers.set(id,{callback,at:now+delay});return id;},
  clearTimeout(id){timers.delete(id);},setInterval(){throw Error('Idle polling must not be registered');},
  MutationObserver:class{constructor(callback){this.callback=callback;observers.push(this);}observe(target,options){this.target=target;this.options=options;}}};
function advance(ms){const limit=now+ms;for(;;){const next=[...timers].filter(([,t])=>t.at<=limit).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;now=next[1].at;timers.delete(next[0]);next[1].callback();}now=limit;}
vm.runInNewContext(source.slice(start,end),context);
assert.equal(checks,1,'Initial button registration remains');
advance(60000);assert.equal(checks,1,'An idle minute causes no additional checks');
assert.equal(observers[0].target,body);assert.equal(observers[0].options.subtree,true);
for(const system of ['B2B','MR','Mekik','Drive-In','Konsol','project reopen']){
  buttonPresent=false;
  for(let i=0;i<20;i++)observers[0].callback();
  const before=checks;advance(79);assert.equal(buttonPresent,false);
  advance(1);assert.equal(buttonPresent,true,system+' DOM replacement restores the button');
  assert.equal(checks,before+1,'Mutation bursts are debounced');
}
listeners.click({target:{closest:()=>true}});advance(35);assert.equal(opens,1,'Missing modal retains click fallback');
modal={hidden:false};listeners.click({target:{closest:()=>true}});advance(35);assert.equal(opens,1,'Open modal is not reopened');
console.log('PASS: initial registration, zero idle polling, debounced DOM replacement recovery and click fallback. DOM events are simulated; this is not an authenticated browser test.');
