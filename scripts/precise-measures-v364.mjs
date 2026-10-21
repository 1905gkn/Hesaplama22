import fs from 'node:fs';
const runtime=fs.readFileSync(new URL('./precise-measures-v364.js',import.meta.url),'utf8');
export function transform(html){
 if(html.includes('data-precise-measures="v364"'))return html;
 const replace=(a,b,n=1)=>{if(html.split(a).length!==n+1)throw Error('v364 anchor '+a.slice(0,100));html=html.split(a).join(b);};
 const start=html.indexOf('  // A diagonal column still has two independent'),end=html.indexOf('return out;',start);if(start<0||end<start)throw Error('v364 diagonal anchor');html=html.slice(0,start)+'  '+html.slice(end);
 replace('if(y0<=y1){','if(y0<y1-1e-8){');replace('if(x0<=x1){','if(x0<x1-1e-8){');
 replace("function columns(rack){const a=m2RackBounds(rack);return(m2LayoutSymbols||[]).filter(s=>s.type==='column').flatMap(symbol=>relations(a,m2SymbolBounds(symbol)).map(r=>({...r,symbol}))).sort((a,b)=>a.distance-b.distance);}","function columns(rack){const a=m2RackBounds(rack),nearest=new Map();for(const symbol of m2LayoutSymbols||[]){if(symbol.type!=='column')continue;for(const relation of relations(a,m2SymbolBounds(symbol))){const prior=nearest.get(relation.direction);if(!prior||relation.distance<prior.distance)nearest.set(relation.direction,{...relation,symbol});}}return [...nearest.values()].sort((a,b)=>a.distance-b.distance);}");
 // Install before legacy capture listeners so the visible label resolves the
 // intended value even when a later transparent gap line overlaps it.
 const first=html.indexOf('<script');if(first<0)throw Error('v364 first script');html=html.slice(0,first)+'<script data-precise-measures="v364">'+runtime+'</script>'+html.slice(first);
 const endBody=html.lastIndexOf('</body>');if(endBody<0)throw Error('v364 body');
 const css=`#page :is(#m2LayoutSvg,.rafex-drag-scene-v248) :is(.m2-distance-guide,.m2-wall-guide) .m2-measure-hit{pointer-events:none!important;cursor:default!important}
 #page :is(#m2LayoutSvg,.rafex-drag-scene-v248) :is(.m2-distance-guide,.m2-wall-guide) :is(line,circle){pointer-events:none!important}
 #page :is(#m2LayoutSvg,.rafex-drag-scene-v248) :is(.m2-distance-guide,.m2-wall-guide) text[data-dimension-key]{pointer-events:bounding-box!important;cursor:pointer!important}
 #page #m2LayoutSvg .m2-distance-guide .rafex-gap-side-hit-v350{pointer-events:stroke!important;stroke-width:4!important}
 #page #m2LayoutSvg.m2-dimension-editing .m2-distance-guide .rafex-gap-side-hit-v350{pointer-events:none!important}`;
 return html.slice(0,endBody)+'<style data-precise-measures="v364">'+css+'</style>'+html.slice(endBody);
}

