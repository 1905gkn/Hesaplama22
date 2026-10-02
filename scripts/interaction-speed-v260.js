/* interaction-speed-v260 */
(()=>{
 let frame=0;
 window.rafexDrawHoverV260=()=>{
  if(frame)return;
  frame=requestAnimationFrame(()=>{
   frame=0;
   if(m2LayoutState.mode!=='draw')return;
   const svg=document.getElementById('m2LayoutSvg');if(!svg)return;
   let g=svg.querySelector('[data-draw-hover-v260]');
   const start=m2CurrentDrawPoint(),end=m2LayoutState.hover;
   if(!m2LayoutState.closed&&start&&end){
    if(!g){g=document.createElementNS('http://www.w3.org/2000/svg','g');g.setAttribute('data-draw-hover-v260','');g.setAttribute('pointer-events','none');(document.getElementById('m2LayoutContent')||svg).append(g);}
    const mm=Math.round(Math.hypot(end.x-start.x,end.y-start.y)/m2LayoutState.scale);
    g.innerHTML=`<line x1="${start.x}" y1="${start.y}" x2="${end.x}" y2="${end.y}" class="m2-floor-draft"/><text x="${(start.x+end.x)/2}" y="${(start.y+end.y)/2-8}" text-anchor="middle" class="m2-layout-label">${fmt(mm)} mm</text>`;
   }else g?.remove();
   window.rafexWallAlignmentV256?.paint();
  });
 };
})();
