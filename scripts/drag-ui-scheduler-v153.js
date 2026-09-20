(function(){
  const pending=new Set();let frame=0;
  function moving(){return typeof m2LayoutState!=='undefined'&&!!m2LayoutState.drag&&!m2LayoutState.drag.pendingSelectionV148;}
  function defer(job){if(!moving())return false;pending.add(job);return true;}
  function flush(){
    frame=0;if(moving())return;
    const jobs=Array.from(pending);pending.clear();
    for(const job of jobs){try{job();}catch(error){console.error('Deferred layout UI update failed',error);}}
  }
  function schedule(){if(!frame&&pending.size)frame=requestAnimationFrame(flush);}
  // Run after the application's pointer handler commits the final position.
  for(const event of ['pointerup','pointercancel','keyup'])document.addEventListener(event,schedule,true);
  window.rafexDragUiV153={defer,schedule,flush};
})();
