(function(root){
  'use strict';
  const clone = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
  const placement = new Set(['id','x','y','angle','joinGroup','sharedFootWith','sharedFootSide','independentBlock','independentBlockId','rackTypeId','savedTypeId','freePlacement','staged','locked']);
  function system(rack) {
    if(rack.konsol || rack.layoutView === 'konsol-top') return 'konsol';
    if(rack.b2b?.mr || rack.plan?.mr) return 'mr';
    const s=String(rack.rafexSystem || rack.systemType || '').toLowerCase();
    if(['drive','drive-in','drivein'].includes(s)) return 'drive';
    if(['konsol','konsol-kollu','cantilever'].includes(s)) return 'konsol';
    if(s==='mr') return 'mr';
    if(rack.b2bLayout || rack.b2b || s==='b2b') return 'b2b';
    return 'mekik2';
  }
  function sameType(a,b) {
    if(system(a)!==system(b)) return false;
    if(a.typeName && b.typeName && a.typeName!==b.typeName) return false;
    if(a.rafexCatalogKey && b.rafexCatalogKey) return a.rafexCatalogKey===b.rafexCatalogKey;
    const ai=a.rackTypeId ?? a.savedTypeId, bi=b.rackTypeId ?? b.savedTypeId;
    if(ai!=null && bi!=null) return String(ai)===String(bi);
    return !!a.typeName && a.typeName===b.typeName;
  }
  function changes(before,after,path=[],out=[]) {
    for(const key of new Set([...Object.keys(before||{}),...Object.keys(after||{})])) {
      if(!path.length && placement.has(key)) continue;
      const a=before?.[key],b=after?.[key],next=path.concat(key);
      if(JSON.stringify(a)===JSON.stringify(b)) continue;
      if(a && b && typeof a==='object' && typeof b==='object' && !Array.isArray(a) && !Array.isArray(b)) changes(a,b,next,out);
      else out.push({path:next,value:clone(b),remove:!Object.hasOwn(after||{},key)});
    }
    return out;
  }
  function applyChanges(rack,delta) {
    const cx=rack.x+rack.w/2,cy=rack.y+rack.h/2;
    for(const change of delta) {
      let target=rack;
      for(const key of change.path.slice(0,-1)) target=target[key] ||= {};
      const key=change.path.at(-1);
      if(change.remove) delete target[key]; else target[key]=clone(change.value);
    }
    rack.x=cx-rack.w/2; rack.y=cy-rack.h/2; rack.individualSpec=true;
  }
  function restore(target,saved) {Object.keys(target).forEach(key=>delete target[key]);Object.assign(target,clone(saved));}
  function commit(racks,before,ids,sourceId) {
    const source=racks.find(r=>r.id===sourceId),old=before.find(r=>r.id===sourceId);
    if(!source || !old) return 0;
    const delta=changes(old,source),selected=new Set(ids);
    // Native customizers may reflow an entire joined group. Restore every
    // instance first, then apply only the edited fields to the explicit selection.
    for(const saved of before) {
      const live=racks.find(r=>r.id===saved.id); if(!live) continue;
      restore(live,saved);
      if(selected.has(live.id)) applyChanges(live,delta);
    }
    return delta.length;
  }
  function linked(rack,racks) {return !!rack && (!!rack.joinGroup || rack.sharedFootWith!=null || racks.some(r=>r.sharedFootWith===rack.id));}
  function separate(racks,ids) {
    const selected=new Set(ids),groups=new Set(); let count=0;
    for(const rack of racks) if(selected.has(rack.id) && linked(rack,racks)) {
      if(rack.joinGroup) groups.add(rack.joinGroup);
      rack.joinGroup=null; rack.sharedFootWith=null; rack.sharedFootSide=null;
      rack.independentBlock=true; rack.independentBlockId='independent-'+rack.id;
      rack.freePlacement=true; rack.staged=true; rack.locked=false; count++;
    }
    for(const rack of racks) if(selected.has(rack.sharedFootWith)) {rack.sharedFootWith=null;rack.sharedFootSide=null;}
    return {count,groups:[...groups]};
  }
  root.RafexSelectionCoreV145={clone,system,sameType,changes,applyChanges,commit,linked,separate};
})(globalThis);
