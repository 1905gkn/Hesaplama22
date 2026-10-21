(()=>{
 let root=null,date='',index=0,paused=false,hover=false,focus=false;
 function show(){if(!root?.isConnected)return;const items=[...root.querySelectorAll('ol > li')];if(!items.length)return;index=(index+items.length)%items.length;items.forEach((item,i)=>item.classList.toggle('active',i===index));root.querySelector('[data-quote-count]').textContent=(index+1)+' / '+items.length;const toggle=root.querySelector('[data-quote-pause]');toggle.textContent=paused?'Devam et':'Duraklat';toggle.setAttribute('aria-pressed',String(paused));}
 function sync(next=document.querySelector('.rafex-daily-motivation-v355')){
  if(!next)return;
  if(next!==root){root=next;index=0;paused=false;hover=false;focus=false;date='';const controls=document.createElement('div');controls.className='rafex-motivation-controls-v356';controls.innerHTML='<button type="button" data-quote-prev aria-label="Önceki söz">‹</button><span data-quote-count></span><button type="button" data-quote-next aria-label="Sonraki söz">›</button><button type="button" data-quote-pause aria-pressed="false">Duraklat</button>';root.appendChild(controls);root.querySelector('h3').textContent='Günün sözleri';controls.querySelector('[data-quote-prev]').onclick=()=>{index--;show()};controls.querySelector('[data-quote-next]').onclick=()=>{index++;show()};controls.querySelector('[data-quote-pause]').onclick=()=>{paused=!paused;show()};root.addEventListener('mouseenter',()=>hover=true);root.addEventListener('mouseleave',()=>hover=false);root.addEventListener('focusin',()=>focus=true);root.addEventListener('focusout',e=>{focus=!!e.relatedTarget&&root.contains(e.relatedTarget)});}
  if(date!==root.dataset.day){date=root.dataset.day;index=0;}show();
 }
 window.rafexMotivationCarouselV356={sync};sync();
 const refresh=window.rafexDailyMotivationV355?.refresh;if(refresh)window.rafexDailyMotivationV355.refresh=function(){const result=refresh.apply(this,arguments);sync();return result};
 setInterval(()=>{if(document.hidden)return;sync();if(!paused&&!hover&&!focus){index++;show();}},10000);
})();

