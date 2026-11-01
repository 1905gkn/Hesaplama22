// At most one nearby rack uses detailed CAD; the overview stays instanced.
export function chooseDetailRack(racks,project){
 let best=null,score=Infinity;
 for(const rack of racks){const p=project(rack);if(p.pixels<220||p.z< -1||p.z>1||Math.abs(p.x)>.8||Math.abs(p.y)>.8)continue;const next=p.x*p.x+p.y*p.y;if(next<score){best=rack;score=next;}}
 return best;
}
export function createDetailController({choose,load,show,hide,env=globalThis}){
 let timer=null,active=null,pending=false,paused=false,disposed=false,generation=0,loadsVisible=true,failedId=null;
 const clear=()=>{if(timer!==null){env.clearTimeout(timer);timer=null;}};
 const release=()=>{if(active){const old=active;active=null;hide(old.detail);old.detail.dispose();}};
 async function run(){timer=null;if(paused||disposed||pending)return;const rack=choose(),id=rack?String(rack.id):null;if(id===active?.id)return;if(!rack){release();failedId=null;return;}if(id===failedId)return;release();pending=true;const epoch=generation;
  try{const detail=await load(rack);if(disposed||paused||epoch!==generation||String(choose()?.id)!==id){detail.dispose();return;}detail.loads(loadsVisible);active={id,detail};show(rack,detail);failedId=null;
  }catch(error){failedId=id;console.warn('Detailed rack unavailable; lightweight overview retained.',error);}
  finally{pending=false;if(!disposed&&!paused&&(epoch!==generation||String(choose()?.id)!==id))schedule();}
 }
 function schedule(){if(paused||disposed)return;clear();timer=env.setTimeout(run,300);}
 return {schedule,loads(value){loadsVisible=value;active?.detail.loads(value);},pause(value){paused=value;generation++;clear();if(!paused)schedule();},dispose(){disposed=true;generation++;clear();release();}};
}
