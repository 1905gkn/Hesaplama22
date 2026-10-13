import fs from 'node:fs';
const runtime=fs.readFileSync(new URL('../client/export-products-xlsx-v323.js',import.meta.url),'utf8');
export function transform(html){
  if(html.includes('/* export-products-xlsx-v323:'))return html;
  const note=/<div class="m2-floor-safety-note" id="m2FloorSafetyNote">[^<]+<\/div>/;
  if(!note.test(html))throw Error('Excel export: floor note missing');
  html=html.replace(note,original=>'<div class="rafex-floor-export-row">'+original+'<button type="button" id="rafexExportProductsV323">Excel’e Aktar</button></div>');
  const end=html.lastIndexOf('</body>');
  return html.slice(0,end)+'<style>.rafex-floor-export-row{display:flex;align-items:center;gap:10px;grid-column:1/-1}.rafex-floor-export-row #m2FloorSafetyNote{flex:1;min-width:0}.rafex-floor-export-row #rafexExportProductsV323{flex:none;white-space:nowrap;background:#173c2d;color:#fff;padding:10px 14px;border:0;border-radius:7px;cursor:pointer}</style><script>'+runtime+'</script>'+html.slice(end);
}

