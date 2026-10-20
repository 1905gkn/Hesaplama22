import fs from 'node:fs';
export function transform(html){
 if(html.includes('data-pallet-total-position="v342"'))return html;
 const replace=(from,to,count)=>{if(html.split(from).length-1!==count)throw Error('v342 anchor missing: '+from.slice(0,70));html=html.split(from).join(to);};
 replace('<div class="m2-selected-pallet-total"><small>ALT ÇİZİM TOPLAM PALET</small><strong>${fmt(layoutTotalPallets)}</strong></div>','',2);
 replace('<button type="button" id="rafexExportProductsV323">','<div id="rafexLayoutPalletTotalV342" class="m2-selected-pallet-total" aria-live="polite"><small>ALT ÇİZİM TOPLAM PALET</small><strong>0</strong></div><button type="button" id="rafexExportProductsV323">',1);
 const anchor='const layoutTotalPallets = m2LayoutState.racks.reduce((total, item) => total + rafexPalletCapacity(item), 0);';
 replace(anchor,anchor+`\n        const totalNodeV342=document.querySelector('#rafexLayoutPalletTotalV342 strong');if(totalNodeV342&&totalNodeV342.textContent!==fmt(layoutTotalPallets))totalNodeV342.textContent=fmt(layoutTotalPallets);`,1);
 const css='<style data-pallet-total-position="v342">#rafexLayoutPalletTotalV342{flex:none;min-width:150px;border-left:0;padding:7px 10px;text-align:right;background:#fff;border-radius:7px}#rafexLayoutPalletTotalV342 small{font-size:9px;letter-spacing:0}#rafexLayoutPalletTotalV342 strong{font-size:18px}@media(max-width:700px){.rafex-floor-export-row{flex-wrap:wrap}.rafex-floor-export-row #m2FloorSafetyNote{flex-basis:100%}#rafexLayoutPalletTotalV342{margin-left:auto}}</style>';
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('v342 body missing');return html.slice(0,end)+css+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-pallet-total-position-v342.mjs')){
 const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('v342 HTML missing');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));console.log('v342: layout pallet total immediately left of Excel export');
}

