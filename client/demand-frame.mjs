// Coalesce resize/control/data requests; captures can explicitly flush one frame.
export function createDemandFrame(draw,{request=callback=>requestAnimationFrame(callback),cancel=id=>cancelAnimationFrame(id)}={}){
 let pending=null,disposed=false,drawing=false;
 const paint=()=>{pending=null;if(disposed||drawing)return;drawing=true;try{draw();}finally{drawing=false;}};
 return {
  request(){if(!disposed&&pending===null)pending=request(paint);},
  flush(){if(disposed||drawing)return;if(pending!==null){cancel(pending);pending=null;}paint();},
  dispose(){disposed=true;if(pending!==null)cancel(pending);pending=null;}
 };
}
