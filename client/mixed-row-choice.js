/* mixed-row-choice-v284 */
(function(){
 let pending=null;
 window.rafexChooseMixedRowV284=function(){
  if(pending)return pending;
  pending=new Promise(resolve=>{
   const overlay=document.createElement('div');overlay.id='rafexMixedRowDirection';overlay.className='m2-symbol-overlay';
   overlay.style.cssText='position:fixed;inset:0;z-index:100000;background:rgba(15,35,29,.55);display:flex;align-items:center;justify-content:center;padding:20px';
   overlay.innerHTML='<div class="m2-symbol-dialog" role="dialog" aria-modal="true" aria-labelledby="rafexMixedRowTitle" style="background:white;padding:24px;border-radius:16px;width:min(520px,100%);box-shadow:0 20px 70px #0004"><h3 id="rafexMixedRowTitle">Tekli sıra hangi tarafa eklensin?</h3><p>Çiftli sıranın üst veya alt sırasını seç.</p><div style="display:flex;gap:10px;margin-top:20px"><button type="button" data-row="upper" style="flex:1">Üstüne</button><button type="button" data-row="lower" style="flex:1">Altına</button></div><div style="display:flex;justify-content:flex-end;margin-top:14px"><button type="button" data-row="cancel">Vazgeç</button></div></div>';
   const previous=document.activeElement;
   const finish=value=>{document.removeEventListener('keydown',key,true);overlay.remove();pending=null;previous?.focus?.();resolve(value);};
   const key=e=>{if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();finish(null);}else if(e.key==='Tab'){const buttons=[...overlay.querySelectorAll('button')],i=buttons.indexOf(document.activeElement);e.preventDefault();buttons[(i+(e.shiftKey?-1:1)+buttons.length)%buttons.length].focus();}};
   overlay.addEventListener('click',e=>{const row=e.target.closest('[data-row]')?.dataset.row;if(row)finish(row==='cancel'?null:row);else if(e.target===overlay)finish(null);});
   document.addEventListener('keydown',key,true);document.body.appendChild(overlay);overlay.querySelector('button').focus();
  });return pending;
 };
})();
