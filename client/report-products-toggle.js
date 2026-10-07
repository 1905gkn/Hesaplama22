/* report-products-toggle-v278 */
(() => {
  let hide = false, queued = false;
  function filter(root) {
    if (!root || !hide) return;
    root.querySelectorAll('.m2-corporate-page').forEach(page => {
      if (page.matches('.rafex-product-flow-page') || page.querySelector('.m2-corporate-bom-card,.m2-corporate-bom-grid')) page.remove();
    });
    const pages=[...root.querySelectorAll('.m2-corporate-page')];
    pages.forEach((page,index)=>{const footer=page.querySelector('.m2-corporate-page-footer'),text=`${index+1} / ${pages.length}`;if(footer&&footer.textContent!==text)footer.textContent=text;});
  }
  const build=m2BuildCorporatePages;
  m2BuildCorporatePages=function(...args){const holder=document.createElement('div');holder.innerHTML=build.apply(this,args);filter(holder);return holder.innerHTML;};
  function install() {
    const actions=document.querySelector('.m2-report-head-actions');
    if(!actions||document.getElementById('rafexHideReportProducts'))return;
    const label=document.createElement('label');label.className='m2-report-check';
    const input=document.createElement('input');input.type='checkbox';input.id='rafexHideReportProducts';input.checked=hide;
    const text=document.createElement('span');text.textContent='Ürün listesini gizle';label.append(input,text);actions.appendChild(label);
    input.addEventListener('change',async()=>{
      hide=input.checked;
      if(hide)filter(document.getElementById('m2CorporatePreview'));
      if(typeof window.rafexCreateFreeDrawingOutput==='function')await window.rafexCreateFreeDrawingOutput();
      else if(typeof m2RenderCorporateReport==='function')m2RenderCorporateReport();
    });
  }
  function refresh(){queued=false;install();filter(document.getElementById('m2CorporatePreview'));filter(document.getElementById('m2CorporatePrint'));}
  const observer=new MutationObserver(()=>{if(!queued){queued=true;requestAnimationFrame(refresh);}});
  observer.observe(document.getElementById('page')||document.body,{childList:true,subtree:true});
  window.addEventListener('beforeprint',refresh);
  install();window.rafexReportProductsHidden=()=>hide;
})();
