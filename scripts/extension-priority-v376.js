(()=>{
 let completed=null;
 function canvas(event){return event.target?.closest?.('#m2LayoutSvg');}
 // Register before measurement, rack and symbol capture listeners. During an
 // extension the pointer chooses its endpoint, even over a visible dimension.
 document.addEventListener('pointerdown',event=>{
  if(event.button!==0||!canvas(event)||typeof m2AutoFillDraft==='undefined'||!m2AutoFillDraft||typeof m2LayoutState==='undefined'||m2LayoutState.mode==='draw'||m2LayoutState.drag)return;
  const point=m2SvgPoint(event);
  if(!point||!Number.isFinite(point.x)||!Number.isFinite(point.y))return;
  completed={x:event.clientX,y:event.clientY,time:Date.now()};
  event.preventDefault();event.stopImmediatePropagation();
  // Keep the existing commit path: planning, obstacles, shared feet and undo.
  m2CommitAutoFillGuide(point);
 },true);
 // A pointerdown can rebuild the SVG. Its compatibility click must not open a
 // dimension editor or start another extension after the draft was cleared.
 for(const type of ['click','dblclick'])document.addEventListener(type,event=>{
  if(!completed||event.detail===0||Date.now()-completed.time>700||Math.hypot(event.clientX-completed.x,event.clientY-completed.y)>4||!canvas(event))return;
  event.preventDefault();event.stopImmediatePropagation();
 },true);
})();
