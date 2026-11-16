export function combineProductPages(target){
  const sources=[...target.querySelectorAll(':scope>.m2-corporate-page')].filter(page=>page.querySelector('.m2-corporate-bom-card'));
  if(!sources.length)return;
  const measure=document.createElement('div');
  const oldStyle=target.getAttribute('style');
  let width;
  try{target.style.setProperty('display','block','important');target.style.setProperty('visibility','hidden','important');width=target.getBoundingClientRect().width;}
  finally{if(oldStyle===null)target.removeAttribute('style');else target.setAttribute('style',oldStyle);}
  if(!width){const preview=document.getElementById('m2CorporatePreview');width=preview?.getBoundingClientRect().width;}
  if(!width){let parent=target.parentElement;while(parent&&!width){const box=parent.getBoundingClientRect(),css=getComputedStyle(parent);width=box.width-parseFloat(css.paddingLeft||0)-parseFloat(css.paddingRight||0);parent=parent.parentElement;}}
  width=Math.max(320,Math.min(1120,width||960));
  measure.style.cssText='position:fixed;left:-100000px;top:0;width:'+width+'px;visibility:hidden;pointer-events:none';
  (target.parentElement||document.body).appendChild(measure);
  const expectedRows=sources.reduce((n,p)=>n+p.querySelectorAll('.m2-corporate-bom-row').length,0);
  const pages=[];let body;
  function overflows(row){const bounds=body.getBoundingClientRect(),last=row.getBoundingClientRect();return last.bottom>bounds.bottom-2;}
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
          if(overflows(row)){
            row.remove();const continuing=!!card.querySelector('.m2-corporate-bom-row');if(!continuing)card.remove();
            newPage();card=newCard(continuing);card.appendChild(row);
          }
        }
      }
    }
    const actualRows=pages.reduce((n,p)=>n+p.querySelectorAll('.m2-corporate-bom-row').length,0);
    if(actualRows!==expectedRows)throw Error('Ürün listesi sayfalanamadı: satır sayısı değişti.');
    target.dataset.productRows581=String(actualRows);target.dataset.productPages581=String(pages.length);
    sources[0].before(...pages);sources.forEach(page=>page.remove());
  }finally{measure.remove();}
}
