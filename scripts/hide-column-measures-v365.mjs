export function transform(html){
 if(html.includes('data-column-measure-hidden="v365"'))return html;
 const start=html.indexOf('function m2ColumnDistanceGuide('),end=html.indexOf('function m2SetRackCenterDistance(',start+10);if(start<0||end<start)throw Error('v365 column guide anchor');
 html=html.slice(0,start)+'function m2ColumnDistanceGuide(){return "";}\n      '+html.slice(end);
 const replace=(a,b,n=1)=>{if(html.split(a).length!==n+1)throw Error('v365 anchor '+a.slice(0,100));html=html.split(a).join(b);};
 // Both the normal editor and the lightweight drag editor omit this field.
 replace('nearestColumn=m2NearestColumnGap(measurementRack)','nearestColumn=null',2);
 // Reuse the existing four clearance dimensions; never add column labels.
 replace('return window.rafexCadDistancesV363.walls(box,m2LayoutState);','return ('+alignedClearancesV417.toString()+')(box,m2LayoutState,m2LayoutSymbols);');
 replace('return window.rafexCadDistancesV363.segments(m2LayoutState).length>0;','return window.rafexCadDistancesV363.segments(m2LayoutState).length>0||m2LayoutSymbols.some(s=>s.type==="column");');
 // Selecting a column must not draw the reverse rack-to-column measurement.
 replace('const nearest=m2NearestSymbolRackRelation(symbol);if(nearest)add','const nearest=symbol.type==="column"?null:m2NearestSymbolRackRelation(symbol);if(nearest)add');
 const body=html.lastIndexOf('</body>');if(body<0)throw Error('v365 body');return html.slice(0,body)+'<meta data-column-measure-hidden="v365">'+html.slice(body);
}

export function alignedClearancesV417(box,state,symbols){
 const edges=window.rafexCadDistancesV363.segments(state).slice();
 for(const symbol of symbols||[]){
  if(symbol.type!=='column')continue;
  let points=window.rafexCadGeometryV362?.points(symbol);
  if(!points?.length){
   const b=m2SymbolBounds(symbol);
   points=[{x:b.left,y:b.top},{x:b.right,y:b.top},{x:b.right,y:b.bottom},{x:b.left,y:b.bottom}];
  }
  if(points.length<3||points.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y)))continue;
  for(let i=0;i<points.length;i++)edges.push({a:points[i],b:points[(i+1)%points.length]});
 }
 const xs=[],ys=[];
 for(const {a,b} of edges){
  if(Math.abs(b.y-a.y)>1e-8){const t=(box.cy-a.y)/(b.y-a.y);if(t>=0&&t<=1)xs.push(a.x+t*(b.x-a.x));}
  if(Math.abs(b.x-a.x)>1e-8){const t=(box.cx-a.x)/(b.x-a.x);if(t>=0&&t<=1)ys.push(a.y+t*(b.y-a.y));}
 }
 return {left:Math.max(...xs.filter(x=>x<=box.left+1e-8)),right:Math.min(...xs.filter(x=>x>=box.right-1e-8)),top:Math.max(...ys.filter(y=>y<=box.top+1e-8)),bottom:Math.min(...ys.filter(y=>y>=box.bottom-1e-8))};
}

