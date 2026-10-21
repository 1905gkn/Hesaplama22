import fs from 'node:fs';
const runtime=fs.readFileSync(new URL('./cad-distances-v363.js',import.meta.url),'utf8');
export function transform(html){
 if(html.includes('data-cad-distances="v363"'))return html;
 const replace=(a,b,n=1)=>{if(html.split(a).length!==n+1)throw Error('v363 anchor '+a.slice(0,120));html=html.split(a).join(b);};
 const fn=(name,next,body)=>{const a=html.indexOf('function '+name+'('),b=html.indexOf('function '+next+'(',a+10);if(a<0||b<a)throw Error(name);html=html.slice(0,a)+body+'\n      '+html.slice(b);};
 const firstScript=html.indexOf('<script');if(firstScript<0)throw Error('v363 script anchor');html=html.slice(0,firstScript)+'<script data-cad-distances="v363">'+runtime+'</script>'+html.slice(firstScript);
 replace('const sx=Number(symbol.w)/Math.max(2,width),sy=Number(symbol.h)/Math.max(2,height);','const sx=Number(symbol.w)/(symbol.cadBoundsVersion363?width:Math.max(2,width)),sy=Number(symbol.h)/(symbol.cadBoundsVersion363?height:Math.max(2,height));');
 replace("(e?.type==='column'||e?.type==='obstacle')&&represented.has(key(e))","(e?.type==='column'||e?.type==='obstacle')&&window.rafexCadDistancesV363?.solid(e)");
 replace("node.setAttribute('class','rafex-cad-'+kind);layer.appendChild(node);","node.setAttribute('class','rafex-cad-'+kind);if(!element.closed)node.style.fill='none';layer.appendChild(node);");
 // Import replaces the document geometry, just as it already replaces racks.
 // Do not retain symbols from an unrelated drawing or invent area edges from
 // column/obstacle/door outlines when the CAD contains no area boundary.
 replace("m2LayoutSymbols.filter(function(item){return !item?.cadImported;})","[]");
 replace("elements.filter(function(element){return element.type==='column'||element.type==='obstacle';})","elements.filter(window.rafexCadDistancesV363.solid)");
 replace("w=Math.max(2,Math.max.apply(Math,xs)-x),h=Math.max(2,Math.max.apply(Math,ys)-y)","w=Math.max.apply(Math,xs)-x,h=Math.max.apply(Math,ys)-y");
 replace("angle:0,cadImported:true,cadElement:element","angle:0,blocking:true,cadImported:true,cadBoundsVersion363:true,cadElement:element");
 replace("objects.filter(function(object){return object.type!=='column'&&object.type!=='obstacle';});if(!areas.length)areas=objects.slice();if(!areas.length)","objects.filter(function(object){return object.type==='wall';});if(!objects.length)");
 replace("(!filterArea||touchesArea(object,filterArea.points))","true");
 // Normalize legacy minimum collision boxes before any paint, snapshot or save.
 replace('function m2RenderLayout() {','function m2RenderLayout() { window.rafexCadDistancesV363?.normalize(m2LayoutSymbols);');
 replace('function m2UndoSnapshot(label="Son işlem"){','function m2UndoSnapshot(label="Son işlem"){ window.rafexCadDistancesV363?.normalize(m2LayoutSymbols);');
 replace('Number(entry.id)===Number(item.id));return symbol','String(entry.id)===String(item.id));return symbol');
 fn('m2ActualWallsV228','m2WallMeasurements',`function m2ActualWallsV228(box){return window.rafexCadDistancesV363.walls(box,m2LayoutState);}
      /* wall-gap-basis-v353 */ `);
 fn('m2HasDrawnWallV225','m2WallDistanceGuides',`function m2HasDrawnWallV225(){return window.rafexCadDistancesV363.segments(m2LayoutState).length>0;}`);
 replace('...(m2LayoutState.points||[]).map((p)=>Number(p.x)+":"+Number(p.y))','m2LayoutState.closed?1:0,JSON.stringify(m2LayoutState.cadElements||[]),...(m2LayoutState.points||[]).map((p)=>Number(p.x)+":"+Number(p.y))');
 replace('table.signature=signature;table.version++;table.segments=segments;','table.signature=signature;table.version++;table.segments=window.rafexCadDistancesV363.segments(m2LayoutState);');
 replace('m2LayoutState.openFinished?1:0,(m2LayoutState.pathBreaks||[]).join(","),...(m2LayoutState.points||[]).map((point)=>point.x+":"+point.y)','m2LayoutState.openFinished?1:0,JSON.stringify(m2LayoutState.cadElements||[]),(m2LayoutState.pathBreaks||[]).join(","),...(m2LayoutState.points||[]).map((point)=>point.x+":"+point.y)');
 replace('Number(node.dataset.dimensionKey.slice(11))','Number(node.dataset.dimensionKey.slice(11).split(":")[0])');
 replace('layer.querySelectorAll(\'[data-dimension-key="\'+key+\'"]\')','layer.querySelectorAll(\'[data-dimension-key="\'+key+\'"],[data-dimension-key^="\'+key+\':"]\')');
 replace(".replace(/^symbol-gap:([0-9]+):/, (all, id) => 'symbol-gap:' + mapped(symbolIds, id) + ':')",".replace(/^column-gap:([0-9]+):([^:]+):/, (all, rack, symbol) => 'column-gap:' + mapped(rackIds, rack) + ':' + mapped(symbolIds, symbol) + ':')\n    .replace(/^symbol-gap:([^:]+):/, (all, id) => 'symbol-gap:' + mapped(symbolIds, id) + ':')");
 // Every column relation owns its key and callback, instead of sharing the
 // single nearest-column measurement and moving against the wrong column.
 fn('m2ColumnDistanceGuide','m2SetRackCenterDistance',`function m2ColumnDistanceGuide(rack){return window.rafexCadDistancesV363.columns(rack).map((n,index)=>{const mm=Math.max(0,Math.round(n.distance/m2LayoutState.scale)),axis=/left|right/.test(n.direction)?'horizontal':'vertical',key=index===0?\`column-gap:\${rack.id}\`:\`column-gap:\${rack.id}:\${n.symbol.id}:\${n.direction}\`,label=m2DimensionPosition(key,(n.ax+n.bx)/2,(n.ay+n.by)/2-8),id=JSON.stringify(n.symbol.id).replace(/"/g,'&quot;'),edit=\`event.stopPropagation();if(m2LayoutTool!=='dimension'&&m2LayoutTool!=='measure'){event.preventDefault();m2PromptColumnDistance(\${rack.id},\${mm},\${id},'\${n.direction}')}\`;return \`<g class="m2-distance-guide" data-column-gap="\${mm}" data-column-id="\${n.symbol.id}"><line x1="\${n.ax}" y1="\${n.ay}" x2="\${n.bx}" y2="\${n.by}" class="m2-rack-distance"/><text x="\${label.x}" y="\${label.y}" text-anchor="middle" class="m2-rack-distance-label m2-dimension-movable" data-dimension-key="\${key}" data-dimension-axis="\${axis}" onpointerdown="\${edit}">KOLON \${fmt(mm)} mm</text></g>\`;}).join('');}`);
 fn('m2PromptColumnDistance','m2ActualWallsV228',`function m2PromptColumnDistance(rackId,currentMm,symbolId,direction){m2LayoutState.selected=Number(rackId);m2OpenMeasureEditor("Kolon ile raf arası mesafe",currentMm,value=>m2SetColumnDistance(value,symbolId,direction));}
      function m2SetColumnDistance(rawValue,symbolId,direction){const rack=m2MeasurementRack();if(!rack)return;const n=symbolId==null?m2NearestColumnGap(rack):window.rafexCadDistancesV363.columns(rack).find(r=>String(r.symbol.id)===String(symbolId)&&r.direction===direction);if(!n)return;const value=Number(rawValue);if(!Number.isFinite(value)||value<0)return;const delta=value*m2LayoutState.scale-n.distance;let x=rack.x,y=rack.y;if(n.direction==='right')x-=delta;if(n.direction==='left')x+=delta;if(n.direction==='bottom')y-=delta;if(n.direction==='top')y+=delta;m2PushUndo('Kolon mesafesi');if(!m2MoveRackOrJoinedGroup(rack,x,y))$('m2FloorStatus').textContent='Girilen kolon mesafesi rafı başka bir engelle çakıştırıyor.';else{m2RememberEditedDistance(rack,'gap');$('m2FloorStatus').textContent='Kolon ile raf arası '+fmt(value)+' mm yapıldı.';}m2RenderLayout();}
      /* actual-walls-v228 */ `);
 replace('if(!symbol||!m2HasDrawnWallV225())return"";','if(!symbol)return"";');
 replace('edit=symbol.type==="barrier"?','edit=(symbol.type==="barrier"||symbol.type==="column")?');
 replace('const symbol=m2LayoutSymbols.find((item)=>item.id===symbolId);if(!symbol)return;const desired=Math.max(0,Number(rawValue)||0),box=m2SymbolBounds(symbol),xs=m2LayoutState.points.map((point)=>point.x),ys=m2LayoutState.points.map((point)=>point.y),walls={left:Math.min(...xs),right:Math.max(...xs),top:Math.min(...ys),bottom:Math.max(...ys)};','const symbol=m2LayoutSymbols.find((item)=>String(item.id)===String(symbolId));if(!symbol||!Number.isFinite(Number(rawValue))||Number(rawValue)<0)return;const desired=Number(rawValue),box=m2SymbolBounds(symbol),walls=m2ActualWallsV228(box);if(["left","right","top","bottom"].includes(key)&&!Number.isFinite(walls[key]))return;');
 replace('const target={x:symbol.x,y:symbol.y};target[axis]+=sign*(desired-current)*m2LayoutState.scale;','const target={x:symbol.x,y:symbol.y};target[axis]+=sign*(desired-current)*m2LayoutState.scale;m2PushUndo("Sembol mesafesi");');
 replace('Bariyer mesafesi ${fmt(desired)}','Sembol mesafesi ${fmt(desired)}');
 replace('m2OpenMeasureEditor("Bariyer mesafesi",currentMm','m2OpenMeasureEditor("Kolon / engel mesafesi",currentMm');
 const end=html.lastIndexOf('</body>');html=html.slice(0,end)+'<script data-cad-relations="v363">m2NearestSymbolRackRelation=window.m2NearestSymbolRackRelation=function(s){return window.rafexCadDistancesV363.rackRelation(s);};</script>'+html.slice(end);
 html=html.replace("key=index===0?`column-gap:${rack.id}`:`column-gap:${rack.id}:${n.symbol.id}:${n.direction}`","key=`column-gap:${rack.id}:${n.symbol.id}:${n.direction}`");
 return html;
}

