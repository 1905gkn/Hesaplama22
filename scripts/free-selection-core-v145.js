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
  function reflow(racks,before,ids,scale=1,footWidth=60) {
    const selected=new Set(ids),groups=new Set(before.filter(r=>selected.has(r.id)&&r.joinGroup).map(r=>r.joinGroup));
    const adjusted=[];
    for(const group of groups) {
      const snapshots=before.filter(r=>r.joinGroup===group);
      if(snapshots.length<2) continue;
      const first=snapshots[0],radians=(Number(first.angle)||0)*Math.PI/180,ux=Math.cos(radians),uy=Math.sin(radians),nx=-uy,ny=ux;
      const ordered=snapshots.slice().sort((a,b)=>((a.x+a.w/2)*ux+(a.y+a.h/2)*uy)-((b.x+b.w/2)*ux+(b.y+b.h/2)*uy));
      let min=Infinity,max=-Infinity;
      for(const saved of ordered) {const center=(saved.x+saved.w/2)*ux+(saved.y+saved.h/2)*uy;min=Math.min(min,center-saved.w/2);max=Math.max(max,center+saved.w/2);}
      const live=ordered.map(saved=>racks.find(r=>r.id===saved.id)).filter(Boolean);
      if(live.length<2) continue;
      const width=typeof footWidth==='function'?footWidth(live[0]):footWidth,shared=Math.max(0,Number(width)||0)*(Number(scale)||1);
      const total=live.reduce((sum,rack)=>sum+rack.w,0)-shared*(live.length-1);
      let cursor=(min+max-total)/2;
      live.forEach((rack,index)=>{
        const saved=ordered.find(row=>row.id===rack.id)||rack,perpendicular=(saved.x+saved.w/2)*nx+(saved.y+saved.h/2)*ny;
        const along=cursor+rack.w/2,cx=along*ux+perpendicular*nx,cy=along*uy+perpendicular*ny;
        rack.x=cx-rack.w/2;rack.y=cy-rack.h/2;cursor+=rack.w-(index<live.length-1?shared:0);
      });
      adjusted.push(group);
    }
    return adjusted;
  }
  function alignExtension(racks,before,sourceId,direction=1,scale=1,footWidth=60) {
    const source=racks.find(r=>r.id===sourceId),savedSource=before.find(r=>r.id===sourceId),group=source?.joinGroup;
    if(!source||!savedSource||!group) return [];
    const members=racks.filter(r=>r.joinGroup===group);
    if(members.length<2) return [];
    const oldMembers=savedSource.joinGroup?before.filter(r=>r.joinGroup===savedSource.joinGroup):[savedSource];
    const radians=(Number(savedSource.angle)||0)*Math.PI/180,ux=Math.cos(radians),uy=Math.sin(radians),nx=-uy,ny=ux;
    const along=r=>(r.x+r.w/2)*ux+(r.y+r.h/2)*uy,across=r=>(r.x+r.w/2)*nx+(r.y+r.h/2)*ny;
    const ordered=members.slice().sort((a,b)=>along(a)-along(b)),crossValues=oldMembers.map(across).sort((a,b)=>a-b);
    const mid=Math.floor(crossValues.length/2),baseline=crossValues.length%2?crossValues[mid]:(crossValues[mid-1]+crossValues[mid])/2;
    const minEdge=Math.min(...oldMembers.map(r=>along(r)-r.w/2)),maxEdge=Math.max(...oldMembers.map(r=>along(r)+r.w/2));
    const overlapAt=index=>Math.max(0,Number(typeof footWidth==='function'?footWidth(ordered[index]):footWidth)||0)*(Number(scale)||1);
    const total=ordered.reduce((sum,rack)=>sum+rack.w,0)-ordered.slice(0,-1).reduce((sum,_rack,index)=>sum+overlapAt(index),0);
    let cursor=direction>=0?minEdge:maxEdge-total;
    ordered.forEach((rack,index)=>{
      const center=cursor+rack.w/2,cx=center*ux+baseline*nx,cy=center*uy+baseline*ny;
      rack.x=cx-rack.w/2;rack.y=cy-rack.h/2;cursor+=rack.w-(index<ordered.length-1?overlapAt(index):0);
    });
    return [group];
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
  root.RafexSelectionCoreV145={clone,system,sameType,changes,applyChanges,commit,reflow,alignExtension,linked,separate};
})(globalThis);
