// Only customer links opt in; the configurator editor keeps its existing settings.
export function customerRenderQuality({renderer,controls,render=()=>{},enabled=false,env=globalThis}){
 if(!enabled)return {dispose(){}};
 const idle=Math.min(Number(env.devicePixelRatio)||1,1.5),moving=Math.min(idle,.75);
 let disposed=false,dragging=false,timer=null,current=null;
 const clear=()=>{if(timer!==null){env.clearTimeout(timer);timer=null;}};
 const quality=value=>{if(disposed||current===value)return;current=value;renderer.setPixelRatio(value);render();};
 const settle=()=>{clear();timer=env.setTimeout(()=>{timer=null;if(!dragging)quality(idle);},200);};
 const start=()=>{dragging=true;clear();quality(moving);};
 const change=()=>{quality(moving);if(!dragging)settle();};
 const end=()=>{dragging=false;settle();};
 // Native block viewers have real shadow maps; the layout renderer has none.
 renderer.shadowMap.enabled=false;
 quality(idle);
 controls.addEventListener('start',start);controls.addEventListener('change',change);controls.addEventListener('end',end);
 const canvas=renderer.domElement;
 canvas.addEventListener('pointercancel',end);canvas.addEventListener('lostpointercapture',end);
 return {dispose(){disposed=true;clear();controls.removeEventListener('start',start);controls.removeEventListener('change',change);controls.removeEventListener('end',end);canvas.removeEventListener('pointercancel',end);canvas.removeEventListener('lostpointercapture',end);}};
}
