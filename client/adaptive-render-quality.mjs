// Rendering quality only: saved engineering geometry and export data stay exact.
export function adaptiveRenderQuality({renderer,render=()=>{},idleRatio=1.5,motionPixelError=1.5,mode,env=globalThis}){
 const deviceRatio=Number(env.devicePixelRatio)||1;
 const ratioForMode=()=>Math.min(deviceRatio,mode==="standard"?1:idleRatio);
 const idleError=()=>mode==="standard"?1.25:.35;
 let idle=ratioForMode();
 let ratio=idle,moving=false,active=true,timer=null,last=null,samples=[],slow=0,disposed=false;
 let motionRatio=Math.min(idle,1),error=motionPixelError,lastGpuSample=0;
 const publish=()=>Object.assign(renderer.domElement.dataset,{renderPixelRatio:String(ratio),renderQuality:moving?'moving':'settled',motionPixelError:String(moving?error:idleError())});
 const setRatio=value=>{if(ratio!==value||renderer.getPixelRatio?.()!==value){ratio=value;renderer.setPixelRatio(value);}publish();};
 const clear=()=>{if(timer!==null)env.clearTimeout(timer);timer=null;};
 const settle=()=>{clear();timer=env.setTimeout(()=>{timer=null;if(!active||disposed)return;moving=false;last=null;setRatio(idle);render();},220);};
 return {
  move(){if(!active||disposed)return;if(!moving){last=null;slow=0;samples=[];}moving=true;setRatio(motionRatio);settle();},
  isMoving(){return moving;},
  setMode(value){if(mode===value)return;mode=value;idle=ratioForMode();motionRatio=Math.min(idle,1);setRatio(moving?motionRatio:idle);render();},
  frame(now){
   if(!active||disposed||!moving){last=null;return;}
   const interval=last===null?0:now-last;last=now;
   // Observed RAF intervals are diagnostic only: event-driven frames are not continuous FPS.
   if(interval>=5&&interval<1000){samples.push(interval);if(samples.length>90)samples.shift();
   }
   publish();
  },
  cost(cpuMs,gpuMs,gpuSample=0){
   if(!active||disposed||!moving)return;
   const freshGpu=gpuSample!==lastGpuSample&&gpuMs!==null;lastGpuSample=gpuSample;
   if(freshGpu&&gpuMs>=50)slow+=8;
   else if(freshGpu&&gpuMs>25)slow+=4;
   else if(cpuMs>25)slow++;
   else if(freshGpu)slow=Math.max(0,slow-2);
   if(slow>=8){
    const nextRatio=Math.max(Math.min(idle,.65),Math.round((motionRatio-.15)*100)/100);
    const nextError=Math.min(3,error+.5);slow=0;
    if(nextRatio===motionRatio&&nextError===error)return;
    motionRatio=nextRatio;error=nextError;setRatio(motionRatio);render();
   }
  },
  pixelError(){return moving?error:idleError();},
  stats(){const sorted=[...samples].sort((a,b)=>a-b),p=q=>sorted.length?sorted[Math.min(sorted.length-1,Math.floor((sorted.length-1)*q))]:null;return {moving,pixelRatio:ratio,motionPixelRatio:motionRatio,pixelError:moving?error:idleError(),frameSamples:sorted.length,frameP50Ms:p(.5),frameP95Ms:p(.95)};},
  pause(value=true){active=!value;clear();moving=false;last=null;if(active){setRatio(idle);render();}},
  dispose(){disposed=true;active=false;clear();}
 };
}
