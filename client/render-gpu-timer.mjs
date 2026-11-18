// Asynchronous GPU timing. Never wait for results or force a GPU synchronization.
export function createRenderGpuTimer(renderer){
 const gl=renderer.getContext?.(),ext=gl?.getExtension('EXT_disjoint_timer_query_webgl2');
 let pending=[],current=null,lastMs=null,frames=0,samples=0;
 if(!ext)return {begin(){},end(){},stats:()=>({gpuTimingSupported:false,gpuMs:null}),dispose(){}};
 const remove=query=>{gl.deleteQuery(query);};
 return {
  begin(){
   const disjoint=gl.getParameter(ext.GPU_DISJOINT_EXT);if(disjoint)lastMs=null;
   pending=pending.filter(query=>{if(disjoint){remove(query);lastMs=null;return false;}if(!gl.getQueryParameter(query,gl.QUERY_RESULT_AVAILABLE))return true;lastMs=gl.getQueryParameter(query,gl.QUERY_RESULT)/1e6;samples++;remove(query);return false;});
   if(disjoint||++frames%12!==1||pending.length>=3||gl.getQuery(ext.TIME_ELAPSED_EXT,gl.CURRENT_QUERY))return;
   current=gl.createQuery();if(current)gl.beginQuery(ext.TIME_ELAPSED_EXT,current);
  },
  end(){if(current){gl.endQuery(ext.TIME_ELAPSED_EXT);pending.push(current);current=null;}},
  stats:()=>({gpuTimingSupported:true,gpuMs:lastMs,gpuSamples:samples}),
  dispose(){if(current){gl.endQuery(ext.TIME_ELAPSED_EXT);remove(current);current=null;}pending.forEach(remove);pending=[];}
 };
}
