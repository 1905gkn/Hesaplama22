/* join-click-or-drag-v300 */
(function(){
 let press=null,targetPoint=null,busy=false;
 const status=text=>{const el=document.getElementById('m2FloorStatus');if(el)el.textContent=text;};
 const stop=e=>{e.preventDefault();e.stopImmediatePropagation();};
 const clear=()=>{press=null;m2MultiSelect.start=null;m2MultiSelect.hover=null;};
 const toggle=m2ToggleJoinMode;
 m2ToggleJoinMode=function(){if(busy)return;clear();targetPoint=null;const result=toggle.apply(this,arguments);if(m2JoinMode)status('Sabit kalacak birleşim noktasına tıkla. Sonra eklenecek noktaya tıkla veya basılı tutup alan tara.');return result;};
 document.addEventListener('pointerdown',e=>{
  if(!m2JoinMode||e.button!==0||e.isPrimary===false)return;
  const svg=e.target.closest?.('#m2LayoutSvg');if(!svg)return;stop(e);if(busy)return;
  const node=e.target.closest?.('[data-rack]'),point=m2SvgPoint(e);
  press={pointerId:e.pointerId,id:node?Number(node.dataset.rack):null,point,x:e.clientX,y:e.clientY,svg,list:m2LayoutState.racks,targetId:m2JoinFirstRackId,dragging:false};
  svg.setPointerCapture?.(e.pointerId);
 },true);
 document.addEventListener('pointermove',e=>{
  if(!press||e.pointerId!==press.pointerId)return;stop(e);
  if(!m2JoinMode||press.list!==m2LayoutState.racks||press.targetId!==m2JoinFirstRackId){clear();return;}
  if(!press.dragging&&Math.hypot(e.clientX-press.x,e.clientY-press.y)<5)return;
  if(m2JoinFirstRackId==null){status('Önce sabit kalacak birleşim noktasına tıkla.');return;}
  press.dragging=true;m2MultiSelect.active=true;m2MultiSelect.start=press.point;m2MultiSelect.hover=m2SvgPoint(e);m2QueueLayoutRender();
 },true);
 document.addEventListener('pointerup',async e=>{
  if(!press||e.pointerId!==press.pointerId)return;stop(e);const p=press;press=null;
  p.svg.releasePointerCapture?.(e.pointerId);
  if(!m2JoinMode||p.list!==m2LayoutState.racks||p.targetId!==m2JoinFirstRackId){clear();return;}
  if(p.dragging){busy=true;try{m2MultiSelect.hover=m2SvgPoint(e);await m2CommitMultiSelection();}finally{busy=false;}return;}
  if(p.id==null)return;
  if(m2JoinFirstRackId==null){m2ChooseJoinRack(p.id);if(m2JoinFirstRackId===p.id){targetPoint=p.point;status('Hedef seçildi. Eklenecek birleşim noktasına tıkla; toplu seçim için basılı tutup sürükle.');}return;}
  const target=m2LayoutState.racks.find(r=>r.id===m2JoinFirstRackId);
  if(!target)return;
  if(m2JoinedRackMembers(target).some(r=>r.id===p.id)){m2ChooseJoinRack(p.id);targetPoint=p.point;status('Hedef noktası güncellendi. Eklenecek bloğun birleşim noktasına tıkla.');return;}
  m2MultiSelect.start=p.point;m2MultiSelect.hover=p.point;
  busy=true;try{await m2CommitMultiSelection({rackId:p.id,targetPoint,movingPoint:p.point});}finally{busy=false;}
 },true);
 document.addEventListener('pointercancel',e=>{if(press?.pointerId!==e.pointerId)return;stop(e);clear();m2RenderLayout();},true);
 window.addEventListener('blur',()=>{if(press){clear();m2RenderLayout();}});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){clear();targetPoint=null;}},true);
})();
