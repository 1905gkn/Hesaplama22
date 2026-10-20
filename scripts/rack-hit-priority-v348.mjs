export function transform(html){
 if(html.includes('data-rack-hit-priority="v348"'))return html;
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('v348 missing body');
 const css='#page :is(#m2LayoutSvg,.rafex-drag-scene-v248) .m2-rack-distance{stroke:#bd8800!important;stroke-width:1.5!important;vector-effect:non-scaling-stroke!important}'+
 '#page :is(#m2LayoutSvg,.rafex-drag-scene-v248) .m2-rack-distance-label{fill:#6f4700!important;opacity:1!important;visibility:visible!important}'+
 '#page :is(#m2LayoutSvg,.rafex-drag-scene-v248) .m2-wall-distance{stroke-width:1!important;stroke-dasharray:4 4!important;stroke-linecap:round!important;vector-effect:non-scaling-stroke!important}';
 const runtime=`(()=>{
 let forwarding=false;
 function prioritize(event){
  if(forwarding||event.defaultPrevented||event.button!==0)return;
  const label=event.target.closest?.('.m2-distance-guide,.m2-wall-guide');
  const svg=label?.closest('#m2LayoutSvg');if(!svg||svg.classList.contains('m2-dimension-editing'))return;
  if(typeof m2LayoutTool!=='undefined'&&(m2LayoutTool==='dimension'||m2LayoutTool==='measure'))return;
  const rack=document.elementsFromPoint(event.clientX,event.clientY).find(node=>node.closest?.('[data-rack]')?.closest('#m2LayoutSvg')===svg);
  if(!rack)return;
  event.stopImmediatePropagation();event.preventDefault();forwarding=true;
  try{const EventType=event.type==='pointerdown'?PointerEvent:MouseEvent;
   rack.dispatchEvent(new EventType(event.type,{bubbles:true,cancelable:true,composed:true,view:window,clientX:event.clientX,clientY:event.clientY,screenX:event.screenX,screenY:event.screenY,button:event.button,buttons:event.buttons,detail:event.detail,ctrlKey:event.ctrlKey,shiftKey:event.shiftKey,altKey:event.altKey,metaKey:event.metaKey,pointerId:event.pointerId,pointerType:event.pointerType,isPrimary:event.isPrimary,pressure:event.pressure}));
  }finally{forwarding=false;}
 }
 document.addEventListener('pointerdown',prioritize,true);document.addEventListener('dblclick',prioritize,true);
})();`;
 return html.slice(0,end)+'<style data-rack-hit-priority="v348">'+css+'</style><script data-rack-hit-priority="v348">'+runtime+'</script>'+html.slice(end);
}

