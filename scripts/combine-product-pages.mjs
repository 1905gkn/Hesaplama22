export function combineProductPages(target){
  const sources=[...target.querySelectorAll(':scope>.m2-corporate-page')].filter(page=>page.querySelector('.m2-corporate-bom-card'));
  if(!sources.length)return;
  const measure=document.createElement('div');
  measure.style.cssText='position:fixed;left:-100000px;top:0;width:1120px;visibility:hidden;pointer-events:none';
  document.body.appendChild(measure);
  const pages=[];let body;
  function newPage(){
    const page=sources[0].cloneNode(false);page.removeAttribute('id');page.className='m2-corporate-page rafex-product-flow-page';page.dataset.rafexArea='shared-products';
    const header=sources[0].querySelector('.m2-corporate-page-header')?.cloneNode(true);
    if(header){header.querySelectorAll('.rafex-area-report-name').forEach(n=>n.remove());const title=header.querySelector('b');if(title)title.textContent='ÜRÜN LİSTESİ';page.appendChild(header);}
    body=document.createElement('div');body.className='rafex-product-flow';page.appendChild(body);measure.appendChild(page);pages.push(page);
  }
  try{
    newPage();
    for(const source of sources){
      const area=source.querySelector('.rafex-area-report-name')?.textContent||'';
      for(const original of source.querySelectorAll('.m2-corporate-bom-card')){
        const rows=[...original.querySelectorAll('.m2-corporate-bom-row')];
        function newCard(continued=false){
          const card=original.cloneNode(true);card.removeAttribute('id');card.querySelectorAll('.m2-corporate-bom-row').forEach(row=>row.remove());
          const title=card.querySelector('h3');if(title)title.textContent=[area,title.textContent,continued?'(devam)':''].filter(Boolean).join(' · ');
          body.appendChild(card);return card;
        }
        let card=newCard();
        for(const row of rows){
          card.appendChild(row);
          if(body.scrollHeight>body.clientHeight+1){
            row.remove();const continuing=!!card.querySelector('.m2-corporate-bom-row');if(!continuing)card.remove();
            newPage();card=newCard(continuing);card.appendChild(row);
          }
        }
      }
    }
    sources[0].before(...pages);sources.forEach(page=>page.remove());
  }finally{measure.remove();}
}
