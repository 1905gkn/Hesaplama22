import fs from 'node:fs';
const runtime=fs.readFileSync(new URL('../client/report-metadata-v324.js',import.meta.url),'utf8');
export function transform(html){
 if(html.includes('/* report-metadata-v324 */'))return html;
 const note='Zemin hariç katlarda kat aralarında travers ölçüsü gösterilmemiştir. Toplam ayak boyunda travers ölçüleri hesaplanmıştır.';
 html=html.replaceAll('<div class="m2-corporate-cut-note">'+note+'</div>','');
 html=html.replace("var note=document.createElement('div');note.className='m2-corporate-cut-note';note.textContent='"+note+"';page.appendChild(note);",'');
 const anchor="      if(!target.querySelector('svg,img,canvas'))throw Error('Çizim önizlemesi üretilemedi.');";
 if(!html.includes(anchor))throw Error('Metadata: successful output hook missing');
 html=html.replace(anchor,'      window.rafexReportMetadataV324(target);\n'+anchor);
 const footer='text=`${index+1} / ${pages.length}`';
 if(!html.includes(footer))throw Error('Metadata: product visibility footer missing');
 html=html.replace(footer,'text=`${index+1} / ${pages.length} · created by G.K`');
 if(html.includes('note.textContent=\''+note+'\'')||html.includes('<div class="m2-corporate-cut-note">'+note))throw Error('Metadata: obsolete section note remains');
 const end=html.lastIndexOf('</body>');
 return html.slice(0,end)+'<style>.m2-corporate-cover .rafex-report-metadata{position:absolute;z-index:8;bottom:7%;left:7%;right:7%;display:grid;grid-template-columns:1.1fr 1.3fr .6fr;gap:24px;padding:20px 24px;background:#ffffff18;border:1px solid #ffffff55;border-radius:8px;color:#fff}.rafex-report-metadata span{display:block;font-size:11px;letter-spacing:.08em;margin-bottom:8px;color:#91d5f1}.rafex-report-metadata strong{display:block;font-size:17px;font-weight:700}.m2-corporate-page-footer{white-space:nowrap}</style><script>'+runtime+'</script>'+html.slice(end);
}

