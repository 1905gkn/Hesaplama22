(()=>{
 let dialog=null,pending=null,pointerId=null;
 const directions={up:{x:0,y:-1,label:'Yukarı'},right:{x:1,y:0,label:'Sağa'},down:{x:0,y:1,label:'Aşağı'},left:{x:-1,y:0,label:'Sola'}};
 function delta(mm,direction,scale){const d=directions[direction];if(!d||!Number.isFinite(mm)||mm<=0||!Number.isFinite(scale)||scale<=0)throw Error('Geçerli bir mesafe ve yön seçin.');return{x:d.x*mm*scale,y:d.y*mm*scale};}
 function ensure(){if(dialog)return dialog;dialog=document.createElement('dialog');dialog.id='rafexOffsetPlacementV334';dialog.setAttribute('aria-labelledby','rafexOffsetTitleV334');dialog.innerHTML='<form><h2 id="rafexOffsetTitleV334">Ölçülü kaydır</h2><p>Bulunduğu hizadan seçtiğiniz yönde kaydırır.</p><label>Mesafe (mm)<input name="distance" type="number" min="0.1" step="any" value="100" required></label><fieldset><legend>Yön</legend><label><input type="radio" name="direction" value="up" checked>↑ Yukarı</label><label><input type="radio" name="direction" value="right">→ Sağa</label><label><input type="radio" name="direction" value="down">↓ Aşağı</label><label><input type="radio" name="direction" value="left">← Sola</label></fieldset><output aria-live="polite"></output><p data-error role="alert"></p><div class="rafex-offset-actions"><button type="button" data-cancel>Vazgeç</button><button type="submit">Yerleştir</button></div></form>';
  document.body.append(dialog);dialog.querySelector('[data-cancel]').onclick=()=>dialog.close();dialog.addEventListener('cancel',()=>{});dialog.addEventListener('close',()=>{pending=null;window.rafexOffsetModalV334=false;const page=document.getElementById('page');if(!dialog.dataset.wasInert)page?.removeAttribute('inert');});
  dialog.querySelector('form').addEventListener('input',summary);dialog.querySelector('form').addEventListener('submit',event=>{event.preventDefault();place();});
  dialog.addEventListener('keydown',event=>{event.stopPropagation();if(event.key==='Escape'){event.preventDefault();dialog.close();}});return dialog;
 }
 function summary(){const mm=Number(dialog.querySelector('[name=distance]').value),dir=dialog.querySelector('[name=direction]:checked')?.value;dialog.querySelector('output').textContent=Number.isFinite(mm)&&mm>0?String(mm)+' mm · '+(directions[dir]?.label||''):'';dialog.querySelector('[data-error]').textContent='';}
 function snapshot(){
  if(m2LayoutState.mode==='draw'){if(!m2LayoutState.hover)return null;return{kind:'point',point:{...m2LayoutState.hover},start:m2CurrentDrawPoint()?{...m2CurrentDrawPoint()}:null};}
  const svg=document.getElementById('m2LayoutSvg'),drag=m2LayoutState.drag;if(drag&&svg)m2FlushLiveRackDrag(svg);
  const rack=m2LayoutState.racks.find(r=>Number(r.id)===Number(drag?.id??m2LayoutState.selected));if(!rack)return null;
  const members=typeof m2MovementMembersV267==='function'?m2MovementMembersV267(rack):m2JoinedRackMembers(rack),origins=members.map(r=>({id:r.id,x:r.x,y:r.y})),symbols=(drag?.symbolMembers||[]).map(o=>{const symbol=m2LayoutSymbols.find(s=>s.id===o.id);return symbol?{id:symbol.id,x:symbol.x,y:symbol.y}:null;}).filter(Boolean);
  if(drag){if(drag.liveFrame!=null)cancelAnimationFrame(drag.liveFrame);m2LayoutState.drag=null;try{if(pointerId!=null&&svg?.hasPointerCapture?.(pointerId))svg.releasePointerCapture(pointerId);}catch{}if(m2LayoutRenderFrame!=null){cancelAnimationFrame(m2LayoutRenderFrame);m2LayoutRenderFrame=null;}}
  return{kind:'racks',origins,symbols,rackId:rack.id};
 }
 function open(){if(pending||window.__rafexManualOutputBuild)return false;const data=snapshot();if(!data)return false;const d=ensure();pending={...data,owner:window.rafexProjectIdentityV133?.uuid,area:window.rafexSaveErrorActiveAreaV304?.(),scale:Number(m2LayoutState.scale)};d.querySelector('form > p').textContent=data.kind==='point'?'Çizgi ucunu bulunduğu hizadan kaydırır.':(data.origins.length>1?'Birleşik / seçili blok · '+data.origins.length+' raf birlikte kaydırılır.':'Seçili raf bulunduğu hizadan kaydırılır.');d.dataset.wasInert=document.getElementById('page')?.hasAttribute('inert')?'1':'';document.getElementById('page')?.setAttribute('inert','');window.rafexOffsetModalV334=true;m2LastRackTap={id:null,at:0};m2RenderLayout();d.querySelector('[data-error]').textContent='';summary();d.showModal();d.querySelector('[name=distance]').focus();d.querySelector('[name=distance]').select();return true;}
 function place(){
  if(!pending)return;const error=dialog.querySelector('[data-error]');try{
   if(pending.owner!==window.rafexProjectIdentityV133?.uuid||pending.area!==window.rafexSaveErrorActiveAreaV304?.())throw Error('Proje veya alan değişti. Pencereyi kapatıp yeniden deneyin.');
   const mm=Number(dialog.querySelector('[name=distance]').value),direction=dialog.querySelector('[name=direction]:checked')?.value,move=delta(mm,direction,pending.scale);
   if(pending.kind==='point'){
    if(m2LayoutState.mode!=='draw')throw Error('Serbest çizim modu kapandı.');const point={x:pending.point.x+move.x,y:pending.point.y+move.y},start=m2CurrentDrawPoint();if(start&&Math.hypot(point.x-start.x,point.y-start.y)<.001)throw Error('Yeni nokta çizgi başlangıcıyla aynı olamaz.');
    m2PushUndo('Çizgi ucunu ölçülü kaydır');m2InsertFreePoint(point);m2LayoutState.hover=null;
   }else{
    if(pending.origins.some(o=>!m2LayoutState.racks.some(r=>r.id===o.id)))throw Error('Seçili raf değişti.');
    if(!m2GroupTranslationValid(pending.origins,move.x,move.y))throw Error('Bu konum alan dışında veya başka bir öğeyle çakışıyor. Mesafe ya da yönü değiştirin.');
    m2PushUndo('Rafı ölçülü kaydır');m2ApplyGroupTranslation(pending.origins,move.x,move.y);for(const o of pending.symbols){const symbol=m2LayoutSymbols.find(s=>s.id===o.id);if(symbol){symbol.x=o.x+move.x;symbol.y=o.y+move.y;}}m2LayoutState.selected=pending.rackId;m2SyncAttachedProtections();
   }
   document.getElementById('m2FloorStatus').textContent=String(mm)+' mm '+directions[direction].label.toLocaleLowerCase('tr-TR')+' yerleştirildi.';dialog.close();m2RenderLayout();
  }catch(e){error.textContent=e.message;}
 }
 window.addEventListener('pointerdown',e=>{if(e.target.closest?.('#m2LayoutSvg'))pointerId=e.pointerId;},true);
 window.addEventListener('keydown',event=>{
  if(event.isComposing||event.altKey||event.shiftKey||!(event.ctrlKey||event.metaKey)||String(event.key).toLowerCase()!=='c')return;
  if(!m2LayoutState.drag&&event.target?.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"]'))return;
  if(pending)return;const svg=document.getElementById('m2LayoutSvg');if(!svg?.getClientRects().length||document.querySelector('dialog[open]')||document.getElementById('page')?.hasAttribute('inert'))return;
  if(m2LayoutState.mode!=='draw'&&(m2SelectedSymbolId!=null||m2SelectedNoteId!=null||m2SelectedDimensionKey!=null||m2LayoutTool))return;
  if(m2LayoutState.mode==='draw'&&!m2LayoutState.hover)return;if(m2LayoutState.mode!=='draw'&&m2LayoutState.selected==null&&!m2LayoutState.drag)return;
  event.preventDefault();event.stopImmediatePropagation();if(!event.repeat)open();
 },true);
 window.rafexOffsetPlacementV334={open,delta};
})();

