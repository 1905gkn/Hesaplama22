import fs from 'node:fs';
const runtime=fs.readFileSync(new URL('./gap-side-v350.js',import.meta.url),'utf8');
export function transform(html){
 if(html.includes('data-gap-side="v350"'))return html;
 const anchor="m2OpenMeasureEditor('Seçilen iki rafın arası',current,";
 if(html.split(anchor).length!==2)throw Error('v350 prompt anchor');
 html=html.replace(anchor,"m2OpenMeasureEditor(window.rafexGapSideTitleV350?.(aId,bId,moveId)||'Seçilen iki rafın arası',current,");
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('v350 body');
 const css='#page #m2LayoutSvg .m2-distance-guide .rafex-gap-side-hit-v350{pointer-events:stroke!important;stroke:transparent!important;stroke-width:14!important;vector-effect:non-scaling-stroke!important;cursor:pointer!important}#page #m2LayoutSvg.m2-dimension-editing .m2-distance-guide .rafex-gap-side-hit-v350{pointer-events:none!important}';
 return html.slice(0,end)+'<style data-gap-side="v350">'+css+'</style><script data-gap-side="v350">'+runtime+'</script>'+html.slice(end);
}

