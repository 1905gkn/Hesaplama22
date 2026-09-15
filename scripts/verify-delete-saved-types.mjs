import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {deleteSavedTypes} from './delete-saved-types.mjs';

const source=fs.readFileSync(new URL('./patch-independent-performance-v133.mjs',import.meta.url),'utf8');
const handler=source.slice(source.indexOf('`  let deletingSavedTypes=')+1,source.indexOf('`+html.slice(deleteEnd)')).replace('${deleteSavedTypes.toString()}',deleteSavedTypes.toString());
for(const scenario of ['success','cancel','network-error','not-deleted','pending-refresh']){
  const endpoints=['/api/b2b-types','/api/mekik2-types','/api/mr-types'];
  const db=new Map(endpoints.map(url=>[url,[{id:1}]])),calls=[];
  const ctx={window:{rafexProjectIdentityV133:{uuid:'project'},rafexProjectTypesV133:[{id:100}]},catalog:[{id:1}],catalogReady:true,catalogLoadedAt:0,catalogLoading:null,m2SavedRackTypes:[{id:100}],m2SelectedSavedType:0,isFree:()=>true,confirm:()=>scenario!=='cancel',installCatalog(){},status(value){ctx.message=value;},req:async(url,opt={})=>{
    calls.push([url,opt.method||'GET']);
    if(opt.method==='DELETE'){
      if(scenario==='network-error'&&url===endpoints[0])throw Error('Network failed');
      if(scenario!=='not-deleted')db.set(url,[]);
      return {ok:true};
    }
    assert.equal(opt.cache,'no-store');return {types:db.get(url)};
  }};
  let finishRefresh;
  if(scenario==='pending-refresh')ctx.catalogLoading=new Promise(resolve=>{finishRefresh=()=>{ctx.catalog=[{id:9}];resolve();};});
  vm.createContext(ctx);vm.runInContext(handler,ctx);
  const operation=ctx.deleteAllCommon();
  if(finishRefresh){assert.equal(calls.length,0);finishRefresh();}
  await operation;
  if(['success','pending-refresh'].includes(scenario)){
    assert.equal(calls.length,6);assert.equal(ctx.catalog.length,0);assert.equal(ctx.window.rafexProjectTypesV133.length,0);
    for(const url of endpoints)assert.equal(db.get(url).length,0,'Reload must read an empty persisted catalog');
  }else{
    assert.equal(ctx.window.rafexProjectTypesV133.length,1,'Failure/cancel must preserve visible project records');
    assert.equal(ctx.catalog.length,1);
  }
}
console.log('PASS: active-project delete persists across reload; cancellation, partial failure, unsuccessful deletion and pending refresh covered.');
