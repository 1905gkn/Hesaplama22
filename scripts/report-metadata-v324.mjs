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
 html=html.replace(footer,'text=`${index+1} / ${pages.length} · CREATED BY G.K`');
 if(html.includes('note.textContent=\''+note+'\'')||html.includes('<div class="m2-corporate-cut-note">'+note))throw Error('Metadata: obsolete section note remains');
 const end=html.lastIndexOf('</body>');
 return html.slice(0,end)+'<style>.m2-corporate-cover{display:block!important}.m2-corporate-cover .m2-corporate-cover-content{position:absolute!important;top:12%;left:15%;margin:0!important}.m2-corporate-cover .rafex-report-metadata{position:absolute!important;z-index:8;top:auto!important;bottom:5%!important;left:auto!important;right:1.4%!important;display:flex;flex-direction:column;align-items:flex-end;gap:5px;padding:10px 12px;background:#fff;border:1px solid #dce4ea;border-radius:4px;color:#0b2b45;text-align:left;place-self:end!important;margin:0!important;transform:none!important}.rafex-report-metadata>div{display:grid;grid-template-columns:105px 145px;align-items:baseline;gap:8px;width:258px}.rafex-report-metadata span{font-size:9px;letter-spacing:.02em;color:#0b2b45}.rafex-report-metadata strong{font-size:10px;font-weight:700;justify-self:start}.m2-corporate-page .m2-corporate-page-footer{position:absolute!important;top:auto!important;bottom:.8%!important;left:auto!important;right:1.4%!important;place-self:end!important;margin:0!important;transform:none!important;white-space:nowrap;text-transform:uppercase;font-size:10px}</style><script>'+runtime+'</script>'+html.slice(end);
}

