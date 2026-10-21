(()=>{
 const finite=p=>p&&Number.isFinite(Number(p.x))&&Number.isFinite(Number(p.y));
 function points(symbol){
  const source=symbol?.cadElement?.points;if(!symbol?.cadImported||!Array.isArray(source)||source.length<2||!source.every(finite))return [];
  const xs=source.map(p=>Number(p.x)),ys=source.map(p=>Number(p.y)),left=Math.min(...xs),top=Math.min(...ys),width=Math.max(...xs)-left,height=Math.max(...ys)-top;
  if(![symbol.x,symbol.y,symbol.w,symbol.h].every(v=>Number.isFinite(Number(v))))return [];
  // Imported collision boxes historically have a two-unit minimum. Keep the
  // original CAD outline at its saved offset; apply only actual symbol edits.
  const sx=Number(symbol.w)/Math.max(2,width),sy=Number(symbol.h)/Math.max(2,height);
  return source.map(p=>({x:Number(symbol.x)+(Number(p.x)-left)*sx,y:Number(symbol.y)+(Number(p.y)-top)*sy}));
 }
 const key=element=>JSON.stringify([element?.type,!!element?.closed,element?.points]);
 function layer(elements,symbols){
  const represented=new Set((symbols||[]).filter(s=>s?.cadImported&&points(s).length>=2).map(s=>key(s.cadElement)));
  return (elements||[]).filter(e=>!((e?.type==='column'||e?.type==='obstacle')&&represented.has(key(e))));
 }
 function shape(symbol,selected){
  const p=points(symbol);if(p.length<2)return '';
  const closed=symbol.cadElement.closed&&p.length>=3,tag=closed?'polygon':'polyline',stroke=selected?1.1:.7;
  return '<'+tag+' points="'+p.map(p=>p.x+','+p.y).join(' ')+'" class="m2-symbol-shape '+(symbol.type==='column'?'m2-symbol-column':'m2-symbol-cad-obstacle')+'" style="stroke-width:'+stroke+'px;'+(!closed?'fill:none;':'')+'"/>';
 }
 window.rafexCadGeometryV362={points,layer,shape};
})();

