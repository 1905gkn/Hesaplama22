function m2QueueGroupPlacement(drag,dx,dy,apply){
 if(drag.groupWorkerFlush||drag.groupWorkerDisabled||drag.groupMembers?.length<24||!drag.groupMembers||typeof Worker!=='function')return false;
 let job=drag.groupWorker;
 if(!job){
  const ids=new Set(drag.groupMembers.map(member=>Number(member.id)));
  const racks=m2LayoutState.racks,byId=new Map(racks.map(rack=>[Number(rack.id),rack]));
  const members=drag.groupMembers.map(origin=>({origin,rack:byId.get(Number(origin.id))}));
  if(members.some(({rack})=>!rack||rack.freePlacement||rack.staged)||drag.symbolMembers?.length||
     m2PerfBlockingSymbols().length||m2WallAccessoryIdsV503().size){
   drag.groupWorkerDisabled=true;
   return false;
  }
  const geometry=members.map(({origin,rack})=>{
   const {x,y}=origin,angle=rack.angle*Math.PI/180,cx=x+rack.w/2,cy=y+rack.h/2;
   const c=Math.cos(angle),s=Math.sin(angle),overhang=m2RackVisualSideOverhang(rack)+m2WallMeasurementInset;
   const corners=[[x-overhang,y-m2WallMeasurementInset],[x+rack.w+overhang,y-m2WallMeasurementInset],
    [x+rack.w+overhang,y+rack.h+m2WallMeasurementInset],[x-overhang,y+rack.h+m2WallMeasurementInset]]
    .map(([px,py])=>({x:cx+(px-cx)*c-(py-cy)*s,y:cy+(px-cx)*s+(py-cy)*c}));
   return {box:m2RackBounds(rack,x,y,rack.angle),corners};
  });
  const obstacles=racks.filter(r=>!ids.has(Number(r.id))).map(r=>m2RackBounds(r));
  if([...geometry.map(item=>item.box),...obstacles].some(box=>![box.left,box.right,box.top,box.bottom].every(Number.isFinite))){
   drag.groupWorkerDisabled=true;
   return false;
  }
  let worker;
  try{worker=new Worker('/runtime-assets/group-placement-worker-v1.js');}
  catch{drag.groupWorkerDisabled=true;return false;}
  job={worker,racks,count:racks.length,first:members[0],active:null,next:null,timer:0};
  drag.groupWorker=job;
  const current=()=>m2LayoutState.drag===drag&&drag.groupWorker===job&&job.racks===m2LayoutState.racks&&job.count===job.racks.length;
  const send=()=>{
   if(!job.next||job.active)return;
   job.active=job.next;job.next=null;
   const {origin,rack}=job.first;
   job.timer=setTimeout(fail,400);
   try{worker.postMessage({startDx:rack.x-origin.x,startDy:rack.y-origin.y,targetDx:job.active.dx,targetDy:job.active.dy});}
   catch{fail();}
  };
  function fail(){
   const pending=job.next||job.active,valid=current();
   m2CloseGroupPlacement(drag);drag.groupWorkerDisabled=true;
   if(valid)pending?.apply(null);
  }
  job.send=send;
  worker.onerror=fail;
  worker.onmessage=({data})=>{
   if(!current()){m2CloseGroupPlacement(drag);return;}
   if(!job.active)return;
   clearTimeout(job.timer);
   const request=job.active;job.active=null;
   if(!data||!Number.isFinite(data.dx)||!Number.isFinite(data.dy)){job.active=request;fail();return;}
   request.apply(data);
   send();
  };
  try{
   worker.postMessage({geometry:{members:geometry,obstacles,walls:m2PerfWallGeometryTable().segments||[]}});
  }catch{m2CloseGroupPlacement(drag);drag.groupWorkerDisabled=true;return false;}
 }
 job.next={dx,dy,apply};
 job.send();
 return true;
}

function m2CloseGroupPlacement(drag){
 const job=drag?.groupWorker;
 if(!job)return;
 drag.groupWorker=null;
 clearTimeout(job.timer);
 job.worker.terminate();
}
