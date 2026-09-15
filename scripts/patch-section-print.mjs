import fs from 'node:fs';
export function transform(html){
  if(html.includes('/* RAFEX_PREPARED_SECTION_PRINT */'))return html;
  const replace=(a,b)=>{if(!html.includes(a)||html.indexOf(a)!==html.lastIndexOf(a))throw Error('Section print anchor missing: '+a);html=html.replace(a,b)};
  replace('async function m2PrintCorporateReport(){',`async function m2PrintCorporateReport(){
        /* RAFEX_PREPARED_SECTION_PRINT */
        const prepared=!!document.querySelector('.m2-report-panel[data-rafex-manual-output="1"]');
        if(prepared){
          await window.rafexCreateFreeDrawingOutput();
          const preview=document.getElementById('m2CorporatePreview');
          const cards=[...preview.querySelectorAll('.rafex-v19-type-card[data-rafex-system="b2b"],.rafex-v19-type-card[data-rafex-system="mr"]')];
          if(!preview.querySelector('.m2-corporate-page')||cards.some(card=>!card.querySelector('.rafex-report-3d-frame img'))){
            alert('Kesit görüntüleri hazırlanamadı. Çıktıyı Oluştur ile tekrar deneyin.');return;
          }
        }`);
  replace('print.innerHTML=m2BuildCorporatePages(); document.body.appendChild(print); document.documentElement.classList.add("m2-corporate-printing"); document.body.classList.add("m2-corporate-printing");',
    'print.innerHTML=prepared?document.getElementById("m2CorporatePreview").innerHTML:m2BuildCorporatePages(); document.body.appendChild(print);');
  replace('if(typeof window.__rafexPrepareCorporatePrint==="function")await window.__rafexPrepareCorporatePrint();',
    'if(!prepared&&typeof window.__rafexPrepareCorporatePrint==="function")await window.__rafexPrepareCorporatePrint();');
  replace('requestAnimationFrame(()=>requestAnimationFrame(()=>window.print()));',`try{
          await Promise.all([...print.querySelectorAll('img')].map(async image=>{
            image.loading='eager';image.decoding='sync';
            await image.decode();
            if(!image.naturalWidth)throw Error('Kesit resmi yüklenemedi');
          }));
        }catch(error){cleanup();alert('PDF görüntüleri yüklenemedi. Lütfen çıktıyı tekrar oluşturun.');return;}
        document.documentElement.classList.add('m2-corporate-printing');document.body.classList.add('m2-corporate-printing');
        requestAnimationFrame(()=>requestAnimationFrame(()=>window.print()));`);
  return html;
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-section-print.mjs')){
  const file='dist/server/index.js',source=fs.readFileSync(file,'utf8'),m=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
  if(!m)throw Error('Section print HTML missing');
  fs.writeFileSync(file,source.replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString('utf8'))).toString('base64')));
}
