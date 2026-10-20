import fs from 'node:fs';
const runtime=fs.readFileSync(new URL('./zoom-marks-v347.js',import.meta.url),'utf8');
export function transform(html){
 if(html.includes('data-zoom-marks="v347"'))return html;
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('v347 body missing');
 return html.slice(0,end)+'<style data-zoom-marks="v347">'+
 '#page :is(#m2LayoutSvg,.rafex-drag-scene-v248) :is(.m2-rack-distance,.m2-wall-distance,.m2-free-measure-line,.m2-between-line,.m2-between-tick){stroke-width:1.2!important;vector-effect:non-scaling-stroke!important;stroke-linecap:round!important}'+
 '#page :is(#m2LayoutSvg,.rafex-drag-scene-v248) :is(.m2-floor-point,.m2-free-measure-point){stroke-width:1.2!important;vector-effect:non-scaling-stroke!important}'+
 '</style><script data-zoom-marks="v347">'+runtime+'</script>'+html.slice(end);
}

