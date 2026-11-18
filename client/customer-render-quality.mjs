import {adaptiveRenderQuality} from './adaptive-render-quality.mjs';
// Detached customer block viewers also reduce raster work while navigating.
export function customerRenderQuality({renderer,controls,render=()=>{},enabled=false,env=globalThis}){
 if(!enabled)return {dispose(){}};
 const quality=adaptiveRenderQuality({renderer,render,env});
 const start=()=>{const before=quality.stats().pixelRatio;quality.move();if(before!==quality.stats().pixelRatio)render();};
 const change=start,end=()=>quality.move();
 // Native block viewers have real shadow maps; the layout renderer has none.
 renderer.shadowMap.enabled=false;
 quality.pause(false);
 controls.addEventListener('start',start);controls.addEventListener('change',change);controls.addEventListener('end',end);
 const canvas=renderer.domElement;
 canvas.addEventListener('pointercancel',end);canvas.addEventListener('lostpointercapture',end);
 return {dispose(){quality.dispose();controls.removeEventListener('start',start);controls.removeEventListener('change',change);controls.removeEventListener('end',end);canvas.removeEventListener('pointercancel',end);canvas.removeEventListener('lostpointercapture',end);}};
}
