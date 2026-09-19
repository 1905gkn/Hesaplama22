import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync('client/b2b-section-positioner-v5.js','utf8').replaceAll('\r\n','\n');
const extract=(from,to)=>{const a=source.indexOf(from),b=source.indexOf(to,a);assert(a>=0&&b>a);return source.slice(a,b);};
const modal={hidden:false,isConnected:true},image={src:''},empty={};
let captures=[],timers=new Map(),id=0,updates=0,writes=0;
const context={document:{getElementById:()=>modal,querySelector:()=>({querySelector:s=>s==='img.rafex-placement-art'?image:empty})},
  capturePerspective:()=>new Promise(resolve=>captures.push(resolve)),updateArtwork:()=>updates++,
  setTimeout:fn=>{timers.set(++id,fn);return id;},clearTimeout:id=>timers.delete(id),
  window:{},localStorage:{setItem:()=>writes++},STORAGE_KEY:'test',
  safeKey:x=>x,ensureSetting:()=>{},renderSectionList:()=>{}};
vm.createContext(context);
vm.runInContext('let previewTimer=0,previewRequestVersion=0,activeKey="A",draft={test:1},saved={test:0};\n'+
  extract('  async function fillArtwork(', '  function changeScale(')+
  extract('  function closeEditor(', '  function prepareEditor(')+
  '\nglobalThis.api={fillArtwork,schedulePreview,closeEditor,selectSection};',context);
const api=context.api;
api.schedulePreview();assert.equal(timers.size,1);api.closeEditor(false);assert.equal(timers.size,0);assert.equal(writes,0);
api.schedulePreview();assert.equal(timers.size,0);assert.equal(await api.fillArtwork(),false);assert.equal(captures.length,0);
modal.hidden=false;const old=api.fillArtwork();api.closeEditor(false);modal.hidden=false;
const fresh=api.fillArtwork();captures[1]('fresh');assert.equal(await fresh,true);captures[0]('old');assert.equal(await old,false);assert.equal(image.src,'fresh');assert.equal(updates,1);
const first=api.fillArtwork(),second=api.fillArtwork();captures[3]('newer');await second;captures[2]('older');await first;assert.equal(image.src,'newer');
const detached=api.fillArtwork();modal.isConnected=false;captures[4]('detached');assert.equal(await detached,false);assert.equal(image.src,'newer');modal.isConnected=true;
api.schedulePreview();api.selectSection('B');assert.equal(timers.size,0);captures[5]('B');await new Promise(setImmediate);assert.equal(image.src,'B');
api.closeEditor(true);assert.equal(writes,1);assert.equal(context.window.__rafexFreeOutputDirty,true);
console.log('PASS: cancel queued capture, skip hidden editor, reject stale/closed/detached results, reopen, section switch and save path. Simulated runtime test.');
