(()=>{
 const selector='.m2-distance-guide text[data-dimension-key],.m2-wall-guide text[data-dimension-key]';
 let last=null;
 function pick(labels,x,y){let best=null;for(const item of labels){const b=item.box;if(!b||b.width<=0||b.height<=0||x<b.left||x>b.right||y<b.top||y>b.bottom)continue;const d=Math.hypot(x-(b.left+b.right)/2,y-(b.top+b.bottom)/2);if(!best||d<best.d)best={...item,d};}return best?.node||null;}
 function rootAt(event){return event.target.closest?.('#m2LayoutSvg');}
 function labelAt(root,x,y){return pick([...root.querySelectorAll(selector)].filter(n=>n.getClientRects().length&&getComputedStyle(n).visibility!=='hidden').map(node=>({node,box:node.getBoundingClientRect()})),x,y);}
 function open(label,event){const key=label.dataset.dimensionKey||'',group=label.closest('.m2-distance-guide,.m2-wall-guide'),p=key.split(':');
  if(p[0]==='wall'){const rack=m2LayoutState.racks.find(r=>String(r.id)===p[1]),m=rack&&m2WallMeasurements(rack)[p[2]];if(!m)return false;m2PromptWallDistance(rack.id,p[2],Math.round(m.px/m2LayoutState.scale));return true;}
  if(p[0]==='symbol-gap'){const value=Number(label.dataset.symbolGapMm);if(!Number.isFinite(value))return false;m2PromptSymbolDistance(p[1],p[2],value);return true;}
  if(p[0]==='column-gap'){const value=Number(group?.dataset.columnGap);if(!Number.isFinite(value))return false;m2PromptColumnDistance(Number(p[1]),value,p[2],p[3]);return true;}
  if(p[0]==='pair-gap'||p[0]==='gap'){const a=Number(group?.dataset.gapA||group?.dataset.rackGapOwner||p[1]),b=Number(group?.dataset.gapB||group?.dataset.rackGapOther||p[2]),value=Number(group?.dataset.rackGap),line=group?.querySelector('.m2-rack-distance'),matrix=line?.getScreenCTM();if(!Number.isFinite(value))return false;if(Number.isFinite(a)&&Number.isFinite(b)&&a!==b&&matrix&&typeof window.rafexPromptRackPairDistance==='function'){const q=new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse()),move=window.rafexGapSideV350(Number(line.getAttribute('x1')),Number(line.getAttribute('y1')),Number(line.getAttribute('x2')),Number(line.getAttribute('y2')),q.x,q.y,a,b);window.rafexPromptRackPairDistance(a,b,value,move);}else m2PromptRackDistance(a,value);return true;}
  return false;
 }
 document.addEventListener('pointerdown',event=>{if(event.button!==0||event.defaultPrevented)return;const root=rootAt(event);if(!root||root.classList.contains('m2-dimension-editing')||typeof m2LayoutTool==='undefined'||m2LayoutTool==='dimension'||m2LayoutTool==='measure')return;const label=labelAt(root,event.clientX,event.clientY);if(!label)return;if(open(label,event)){last={x:event.clientX,y:event.clientY,time:Date.now()};event.preventDefault();event.stopImmediatePropagation();}},true);
 // Symbol distance labels also have a legacy click handler. A handled pointer
 // must open the editor once, without its later click opening another editor.
 document.addEventListener('click',event=>{if(!last||event.detail===0||Date.now()-last.time>800||Math.hypot(event.clientX-last.x,event.clientY-last.y)>3)return;if(rootAt(event)){event.preventDefault();event.stopImmediatePropagation();}last=null;},true);
 window.rafexMeasurePickV364={pick};
})();

