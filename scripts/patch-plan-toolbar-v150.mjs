import fs from 'node:fs';
export function transform(html){
 if(html.includes('data-rafex-plan-toolbar="v150"'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('v150 anchor missing: '+a.slice(0,100));html=html.replace(a,b)};
 replace('<div class="m2-floor-canvas-wrap"><div class="m2-layout-zoom-floating"','<div class="rafex-plan-toolbar-v150" role="group" aria-label="Çizim görünüm ayarları"><div class="m2-layout-zoom-floating"');
 replace('</button></div><div class="m2-floor-canvas"><svg id="m2LayoutSvg"','</button></div></div><div class="m2-floor-canvas-wrap"><div class="m2-floor-canvas"><svg id="m2LayoutSvg"');
 replace('var wrap=document.querySelector("#page .m2-floor-canvas-wrap");if(!wrap)return;','var wrap=document.querySelector("#page .rafex-plan-toolbar-v150");if(!wrap)return;');
 const css=`<style data-rafex-plan-toolbar="v150">
#page .rafex-plan-toolbar-v150{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;margin:12px 0 8px;border:1px solid #aac5b5;border-radius:10px;background:#f7faf8;box-sizing:border-box}
#page .rafex-plan-toolbar-v150 .m2-layout-zoom-floating,#page .rafex-plan-toolbar-v150 .rafex-type-letter-scale-v65{position:static!important;inset:auto!important;z-index:auto!important;margin:0!important;padding:0!important;border:0!important;box-shadow:none!important;background:transparent!important;flex-shrink:0}
#page .rafex-plan-toolbar-v150 .rafex-type-letter-scale-v65{flex-direction:row;flex-wrap:wrap;gap:12px;min-width:0;max-width:100%}
#page .rafex-plan-toolbar-v150 .rafex-type-letter-row+.rafex-type-letter-row{margin:0;padding:0;border:0}
@media(max-width:760px){#page .rafex-plan-toolbar-v150{justify-content:flex-start;padding:10px;gap:10px}#page .rafex-plan-toolbar-v150 .rafex-type-letter-scale-v65{gap:8px}}
@media print{#page .rafex-plan-toolbar-v150{display:none!important}}
</style>`;
 const end=html.lastIndexOf('</body>');return html.slice(0,end)+css+'\n'+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-plan-toolbar-v150.mjs')){
 const file='dist/server/index.js',source=fs.readFileSync(file,'utf8'),m=source.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);
 if(!m)throw Error('Missing compiled HTML');
 fs.writeFileSync(file,source.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
 console.log('v150: zoom and type appearance controls occupy a separate toolbar above the drawing.');
}
