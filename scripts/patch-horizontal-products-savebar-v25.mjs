import fs from 'node:fs';

const file = 'dist/server/index.js';
let source = fs.readFileSync(file, 'utf8');
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error('HTML_BASE64 not found');

let html = Buffer.from(match[2], 'base64').toString('utf8');
html = html
  .replace(/<style data-rafex-horizontal-products-savebar="v25">[\s\S]*?<\/style>/g, '')
  .replace(/<script data-rafex-horizontal-products-savebar="v25">[\s\S]*?<\/script>/g, '');

const runtime = String.raw`
<style data-rafex-horizontal-products-savebar="v25">
#page.rafex-free-drawing-page details.rafex-system-product-disclosure[open]>.rafex-system-product-body{
  display:flex!important;align-items:stretch;gap:8px;padding:8px!important;
  overflow-x:auto;overflow-y:hidden;scrollbar-width:thin
}
#page.rafex-free-drawing-page .rafex-system-product-row{
  flex:0 0 205px;min-width:205px;min-height:46px;margin:0!important;padding:9px 11px!important;
  display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;align-items:center;gap:10px!important;
  border:1px solid #dfe7e1!important;border-radius:9px!important;background:#fff!important;box-sizing:border-box
}
#page.rafex-free-drawing-page .rafex-system-product-row>span{min-width:0;display:flex;flex-direction:column;gap:3px}
#page.rafex-free-drawing-page .rafex-system-product-row>span>b{font-size:10px;line-height:1.25;white-space:normal}
#page.rafex-free-drawing-page .rafex-system-product-row>span>small{font-size:8px;line-height:1.25;white-space:normal}
#page.rafex-free-drawing-page .rafex-system-product-row>strong{font-size:13px!important;white-space:nowrap;text-align:right}
#page.rafex-free-drawing-page .rafex-system-product-empty{flex:1 0 100%;box-sizing:border-box}

#page .rafex-b2b-mekik-savebar{width:100%;margin:12px 0 0;box-sizing:border-box}
#page .rafex-b2b-mekik-savebar>#m2SaveRackButton{
  display:block!important;width:100%!important;min-height:72px!important;margin:0!important;padding:0 20px!important;
  border:1px solid #d3ad00!important;border-radius:0 0 14px 14px!important;
  background:#f6d400!important;color:#101713!important;font-size:19px!important;font-weight:950!important;
  box-shadow:none!important;text-align:center!important
}
</style>
<script data-rafex-horizontal-products-savebar="v25">
(()=>{
  if(window.__rafexHorizontalProductsSavebarV25)return;
  window.__rafexHorizontalProductsSavebarV25=true;
  let queued=false;
  const apply=()=>{
    queued=false;
    const page=document.getElementById('page'),button=document.getElementById('m2SaveRackButton');
    if(!page||!button)return;
    if(page.classList.contains('mr-mode')||page.querySelector('#mrCanvas'))return;
    const isB2B=page.classList.contains('b2b-mode')||page.dataset.rafexFreeContextSystem==='b2b'||!!page.querySelector('#b2bMain3DCanvas');
    const isMekik=!isB2B&&(page.dataset.rafexFreeContextSystem==='mekik2'||!!page.querySelector('#m2Top, #m2Front, #m2Side'));
    if(!isB2B&&!isMekik)return;
    const card=(isB2B?page.querySelector('.m2-config-card'):null)||button.closest('.card')||page.querySelector('.m2-layout>.card');
    if(!card)return;
    let bar=card.querySelector(':scope>.rafex-b2b-mekik-savebar');
    if(!bar){bar=document.createElement('div');bar.className='rafex-b2b-mekik-savebar';card.appendChild(bar)}
    if(button.parentElement!==bar)bar.appendChild(button);
  };
  const schedule=()=>{if(!queued){queued=true;requestAnimationFrame(apply)}};
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('click',schedule,true);document.addEventListener('change',schedule,true);
  schedule();
})();
</script>`;

html = html.replace('</body>', `${runtime}</body>`);
const encoded = Buffer.from(html).toString('base64');
source = source.slice(0, match.index) + match[0].replace(match[2], encoded) + source.slice(match.index + match[0].length);
fs.writeFileSync(file, source);
console.log('Horizontal system product cards and B2B/Mekik save bar v25 applied');
