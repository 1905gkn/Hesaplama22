/* rack-array-v243 */
(()=>{
 let scanning=false,sourceIds=[],sourceList=null;
 const el=id=>document.getElementById(id),status=text=>{const node=el('m2FloorStatus');if(node)node.textContent=text;};
 const clone=value=>JSON.parse(JSON.stringify(value));
 function reset(){scanning=false;sourceIds=[];sourceList=null;el('rafexArrayButtonV243')?.classList.remove('active');}
 window.rafexStartArrayV243=function(){
  if(scanning){m2ClearAllSelections('Fonksiyon çoğaltma iptal edildi.');return;}
  if(!m2LayoutState.racks.length){status('Çoğaltmak için önce serbest alana raf ekleyin.');return;}
  window.rafexIndividualSelectionV184?.stop?.();m2ClearAllSelections();m2LayoutState.mode='idle';m2LayoutState.areaEditMode=false;m2ToggleMultiSelect();
  scanning=true;sourceList=m2LayoutState.racks;el('rafexArrayButtonV243')?.classList.add('active');
  status('Fonksiyon Çoğaltma: rafları fareyle tarayarak seçin. Tarama bitince yön, net aralık ve tekrar sayısı açılır. Esc iptal eder.');
 };
 function show(){
  let dialog=el('rafexArrayDialogV243');if(!dialog){
   dialog=document.createElement('dialog');dialog.id='rafexArrayDialogV243';
   dialog.innerHTML='<form><h3>Fonksiyon Çoğaltma</h3><p data-summary></p><label>Kopyalama yönü<select name="direction"><option value="down">↓ Aşağı</option><option value="up">↑ Yukarı</option><option value="right">→ Sağa</option><option value="left">← Sola</option></select></label><label>Gruplar arası net boşluk (mm)<input name="gap" type="number" min="0" step="1" value="1000" required></label><label>Tekrar sayısı (yeni kopya)<input name="count" type="number" min="1" max="100" step="1" value="5" required></label><p class="array-hint">Asıl grup yerinde kalır. 5 tekrar, seçilen grubun 5 yeni kopyasını ekler. Net boşluk, grupların dış kenarları arasındadır.</p><p data-error role="alert"></p><footer><button type="button" data-cancel>Vazgeç</button><button type="submit">Çoğalt</button></footer></form>';
   document.body.append(dialog);dialog.querySelector('[data-cancel]').onclick=()=>dialog.close();dialog.addEventListener('close',reset);
   dialog.querySelector('form').onsubmit=event=>{event.preventDefault();const form=event.currentTarget,submit=form.querySelector('[type="submit"]');submit.disabled=true;try{apply(dialog,form);}catch(error){dialog.querySelector('[data-error]').textContent=error.message;}finally{submit.disabled=false;}};
  }
  dialog.querySelector('[data-summary]').textContent=sourceIds.length+' raf seçildi. Seçilen rafların kendi aralarındaki düzen korunur.';
  dialog.querySelector('[data-error]').textContent='';dialog.showModal();dialog.querySelector('select').focus();
 }
 function plan(sources,direction,gap,count,scale,allRacks,allSymbols){
  if(!['down','up','left','right'].includes(direction)||!Number.isFinite(gap)||gap<0||!Number.isInteger(count)||count<1||count>100||!(scale>0)||!sources.length)throw Error('Yönü, sıfır veya daha büyük boşluğu ve 1–100 arası tam sayı tekrar adedini girin.');
  if(sources.length*count>2000)throw Error('Tek işlemde en fazla 2.000 yeni raf eklenebilir. Tekrar sayısını azaltın.');
  const boxes=sources.map(r=>m2RackBounds(r)),width=Math.max(...boxes.map(b=>b.right))-Math.min(...boxes.map(b=>b.left)),height=Math.max(...boxes.map(b=>b.bottom))-Math.min(...boxes.map(b=>b.top));
  const horizontal=direction==='left'||direction==='right',step=(horizontal?width:height)+gap*scale,sign=direction==='left'||direction==='up'?-1:1;
  if(!Number.isFinite(step)||step<=0)throw Error('Seçilen rafların ölçüleri geçersiz.');
  let next=Date.now();for(const r of [...allRacks,...allSymbols]){next=Math.max(next,(Number(r.id)||0)+1);for(const b of r.seismicBraces||[])next=Math.max(next,(Number(b.id)||0)+1);}
  const selected=new Set(sources.map(r=>r.id)),symbols=allSymbols.filter(s=>selected.has(s.rackId)),racks=[],copies=[];
  for(let index=1;index<=count;index++){
   const idMap=new Map(sources.map(r=>[r.id,next++])),groups=new Map(),braces=new Map(),independent=new Map(),dx=horizontal?sign*step*index:0,dy=horizontal?0:sign*step*index;
   for(const r of sources){
    const c=clone(r);c.id=idMap.get(r.id);c.x=Number(r.x)+dx;c.y=Number(r.y)+dy;
    if(r.joinGroup){if(!groups.has(r.joinGroup))groups.set(r.joinGroup,'array-'+c.id);c.joinGroup=groups.get(r.joinGroup);}else c.joinGroup=null;
    c.sharedFootWith=idMap.get(r.sharedFootWith)??null;if(c.sharedFootWith==null)c.sharedFootSide=null;
    if(r.independentBlockId){if(!independent.has(r.independentBlockId))independent.set(r.independentBlockId,'array-block-'+c.id);c.independentBlockId=independent.get(r.independentBlockId);}
    c.seismicBraces=(r.seismicBraces||[]).map(b=>{const ids=(b.rackIds||[]).map(id=>idMap.get(id)).filter(id=>id!=null);if(!ids.length&&b.type==='light')ids.push(c.id);if(!ids.length)return null;const key=b.id??JSON.stringify(b);if(!braces.has(key))braces.set(key,next++);return {...clone(b),id:braces.get(key),rackIds:ids};}).filter(Boolean);
    c.freePlacement=false;c.staged=false;c.locked=true;racks.push(c);
   }
   for(const s of symbols){const c=clone(s);c.id=next++;c.rackId=idMap.get(s.rackId);if(s.tunnelRackId!=null)c.tunnelRackId=idMap.get(s.tunnelRackId)??null;c.x=Number(s.x)+dx;c.y=Number(s.y)+dy;copies.push(c);}
  }
  return {racks,symbols:copies,step};
 }
 function apply(dialog,form){
  const sources=m2LayoutState.racks.filter(r=>sourceIds.includes(r.id));
  if(sourceList!==m2LayoutState.racks||sources.length!==sourceIds.length)throw Error('Yerleşim değişti. Pencereyi kapatıp rafları yeniden tarayın.');
  const result=plan(sources,form.elements.direction.value,Number(form.elements.gap.value),Number(form.elements.count.value),m2LayoutState.scale,m2LayoutState.racks,m2LayoutSymbols);
  for(let i=0;i<result.racks.length;i++){const r=result.racks[i];if(!m2RackInsideArea(r)||m2RackOverlaps(r))throw Error((Math.floor(i/sources.length)+1)+'. tekrar duvar, kolon veya başka rafla çakışıyor ya da alan dışında kalıyor. Hiçbir kopya eklenmedi. Yönü, aralığı veya tekrar sayısını değiştirin.');}
  m2PushUndo('Fonksiyon çoğaltma');m2LayoutState.racks.push(...result.racks);m2LayoutSymbols.push(...result.symbols);
  m2ClearMultiSelection();m2MultiSelect.rackIds=new Set(result.racks.map(r=>r.id));m2MultiSelect.symbolIds=new Set(result.symbols.map(s=>s.id));window.rafexIndividualSelectionV184?.replace([...m2MultiSelect.rackIds]);m2LayoutState.selected=result.racks[0].id;m2SelectedSymbolId=null;
  m2SyncAttachedProtections();dialog.close();m2RenderLayout();m2RefreshActiveReport();
  status(form.elements.count.value+' tekrar ile '+result.racks.length+' yeni raf eklendi. Gruplar arası net boşluk: '+form.elements.gap.value+' mm. Geri Al ile tüm tekrarları kaldırabilirsiniz.');
 }
 const clear=m2ClearAllSelections;m2ClearAllSelections=function(){reset();return clear.apply(this,arguments);};
 const commit=m2CommitMultiSelection;m2CommitMultiSelection=function(){
  const requested=scanning&&sourceList===m2LayoutState.racks&&m2MultiSelect.start&&m2MultiSelect.hover;
  const result=commit.apply(this,arguments);if(!requested)return result;
  scanning=false;el('rafexArrayButtonV243')?.classList.remove('active');sourceIds=[...m2MultiSelect.rackIds];
  if(!sourceIds.length){reset();status('Tarama alanında raf bulunamadı. Fonksiyon Çoğaltma ile yeniden seçin.');return result;}show();return result;
 };
 document.addEventListener('click',event=>{if(scanning&&event.target.closest?.('button')?.id!=='rafexArrayButtonV243'&&event.target.closest?.('button'))reset();},true);
 window.rafexArrayPlanV243=plan;
})();
