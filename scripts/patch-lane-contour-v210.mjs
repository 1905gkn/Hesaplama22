import fs from 'node:fs';
export function selectedFramesV429(){
 const ns='http://www.w3.org/2000/svg';let frame=0;
 const own=n=>n?.nodeType===1&&n.hasAttribute('data-selected-frame-v429');
 function draw(){
  frame=0;
  for(const group of document.querySelectorAll('#m2LayoutSvg [data-rack],.rafex-drag-scene-v248 [data-rack]')){
   const base=group.querySelector(':scope > .m2-layout-rack');let border=group.querySelector(':scope > [data-selected-frame-v429]');
   if(!base?.classList.contains('selected')){border?.remove();continue;}
   const matrix=group.getScreenCTM(),scale=Math.max(.0001,Math.hypot(matrix?.a||1,matrix?.b||0)),pad=2/scale;
   const x=Number(base.getAttribute('x')),y=Number(base.getAttribute('y')),w=Number(base.getAttribute('width')),h=Number(base.getAttribute('height'));
   if(![x,y,w,h].every(Number.isFinite)||w<=0||h<=0){border?.remove();continue;}
   if(!border){border=document.createElementNS(ns,'rect');border.setAttribute('data-selected-frame-v429','');border.setAttribute('pointer-events','none');border.setAttribute('fill','none');border.setAttribute('stroke','#ef8c16');border.setAttribute('stroke-width','1.8');border.setAttribute('vector-effect','non-scaling-stroke');}
   for(const [key,value] of Object.entries({x:x-pad,y:y-pad,width:w+2*pad,height:h+2*pad,rx:2/scale}))if(border.getAttribute(key)!==String(value))border.setAttribute(key,value);
   if(group.lastElementChild!==border)group.appendChild(border);
  }
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(draw);}
 const observer=new MutationObserver(records=>{
  if(records.some(r=>{
   if(r.type==='attributes')return !!r.target.closest?.('#m2LayoutSvg,.rafex-drag-scene-v248')&&!own(r.target);
   const nodes=[...r.addedNodes,...r.removedNodes];if(nodes.length&&nodes.every(own))return false;
   return !!r.target.closest?.('#m2LayoutSvg,.rafex-drag-scene-v248')||nodes.some(n=>n.nodeType===1&&(n.id==='m2LayoutSvg'||n.classList?.contains('rafex-drag-scene-v248')||n.querySelector?.('#m2LayoutSvg')));
  }))schedule();
 });
 observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','viewBox']});
 window.addEventListener('resize',schedule);schedule();
}

export function transform(html){
 if(html.includes('data-lane-contour="v210"'))return html;
 const code=`<style data-lane-contour="v210">
#page #m2LayoutSvg [data-rack]:has(.rafex-plan-detail-v143)>.m2-layout-rack:is(.selected,:not(.selected)){stroke-opacity:0!important;fill-opacity:0!important}
#page #m2LayoutSvg[data-lane-pressed-v210] [data-rack]:has(.rafex-plan-detail-v143)>.m2-layout-rack.selected{stroke-opacity:1!important;fill-opacity:.12!important}
/* selected-module-frame-v424 */
#page #m2LayoutSvg [data-rack]>.m2-layout-rack.selected.selected.selected{
 stroke:#ef8c16!important;stroke-opacity:1!important;stroke-width:1.5px!important;stroke-dasharray:none!important;fill-opacity:0!important;vector-effect:non-scaling-stroke;pointer-events:all;
}
@media print{#page #m2LayoutSvg [data-rack]>.m2-layout-rack.selected.selected.selected{stroke-opacity:0!important}}
</style><script>(()=>{
let active=null;
function clear(){active?.removeAttribute('data-lane-pressed-v210');active=null;}
document.addEventListener('pointerdown',event=>{clear();const group=event.target.closest?.('#m2LayoutSvg [data-rack]');if(event.button!==0||!group?.querySelector('.rafex-plan-detail-v143'))return;active=group.closest('svg');active?.setAttribute('data-lane-pressed-v210','1');},true);
window.addEventListener('pointerup',clear,true);window.addEventListener('pointercancel',clear,true);window.addEventListener('blur',clear);document.addEventListener('lostpointercapture',clear,true);
})();</script><style>@media print{[data-selected-frame-v429]{display:none!important}}</style><script>(${selectedFramesV429.toString()})();</script>`;
 const at=html.lastIndexOf('</body>');return html.slice(0,at)+code+html.slice(at);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-lane-contour-v210.mjs')){
 const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}

