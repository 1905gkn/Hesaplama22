import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const html=fs.readFileSync(process.argv[2],'utf8'),start=html.indexOf('data-initial-foot-finish="v383"');assert(start>=0);
let nodes=[];const context={window:{},document:{querySelectorAll:()=>nodes,addEventListener(){}}};vm.createContext(context);
const body=html.indexOf('>',start)+1;vm.runInContext(html.slice(body,html.indexOf('</script>',body)),context);
const pick=context.window.rafexInitialFootFinishV383;
assert.equal(pick('mekik2',null),'ral5010');assert.equal(pick('drive',null),'ral5010');
assert.equal(pick('mekik2',{rafexSystem:'drive',mekikFootColor:'pgv'}),'ral5010');
assert.equal(pick('drive',{rafexSystem:'mekik2',mekikFootColor:'pgv'}),'ral5010');
for(const system of ['mekik2','drive'])for(const color of ['ral5010','pgv'])assert.equal(pick(system,JSON.parse(JSON.stringify({rafexSystem:system,mekikFootColor:color}))),color);
nodes=[{isConnected:true,value:'pgv',getClientRects:()=>[]}];assert.equal(pick('mekik2',null),'ral5010');
nodes.push({isConnected:true,value:'ral5010',getClientRects:()=>[{}]});assert.equal(pick('mekik2',{rafexSystem:'mekik2',mekikFootColor:'pgv'}),'ral5010');assert.equal(pick('drive',null),'ral5010');
nodes[1].value='pgv';assert.equal(pick('mekik2',null),'pgv');assert.equal(pick('drive',null),'pgv');
assert(html.includes('rafexSystem:m2ActiveModule, mekikFootColor:window.rafexInitialFootFinishV383(m2ActiveModule,m2LastDrawing)'));
console.log('v383: initial RAL5010/PGV, cross-system isolation, visible choices, hidden controls and saved finishes passed');

