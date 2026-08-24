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
  display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;justify-content:flex-start!important;
  align-items:stretch!important;gap:8px!important;padding:8px!important;
  overflow-x:auto!important;overflow-y:hidden!important;scrollbar-width:thin
}
#page.rafex-free-drawing-page .rafex-system-product-row{
  flex:0 0 164px!important;width:164px!important;min-width:164px!important;max-width:164px!important;
  height:46px!important;min-height:46px!important;max-height:46px!important;margin:0!important;padding:0!important;
  display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;align-items:stretch!important;gap:0!important;
  border:1px solid #dfe7e1!important;border-radius:9px!important;background:#fff!important;box-sizing:border-box
}
#page.rafex-free-drawing-page .rafex-system-product-row>span{min-width:0;display:flex;flex-direction:column;justify-content:center;gap:2px;padding:6px 8px;overflow:hidden}
#page.rafex-free-drawing-page .rafex-system-product-row>span>b{font-size:9px;line-height:1.15;white-space:normal}
#page.rafex-free-drawing-page .rafex-system-product-row>span>small{font-size:8px;line-height:1.1;white-space:normal}
#page.rafex-free-drawing-page .rafex-system-product-row>strong{
  display:flex!important;align-items:center!important;justify-content:center!important;align-self:stretch!important;
  min-width:46px;height:100%!important;padding:0 7px;border-left:1px solid #dfe7e1!important;box-sizing:border-box;
  font-size:11px!important;white-space:nowrap;text-align:center
}
#page.rafex-free-drawing-page .rafex-system-product-empty{flex:1 0 100%;box-sizing:border-box}

/* Distance editors keep their headings outside the measurement grid. The
   four wall fields and four edge fields stay on one row after system changes. */
#page.rafex-free-drawing-page .m2-wall-editor{
  display:grid!important;grid-template-columns:repeat(4,minmax(220px,1fr))!important;
  gap:8px!important;overflow-x:auto!important;align-items:stretch!important
}
#page.rafex-free-drawing-page .m2-wall-editor>.m2-wall-editor-title{
  grid-column:1/-1!important;width:100%!important;box-sizing:border-box
}
#page.rafex-free-drawing-page .m2-wall-editor>.m2-wall-editor-empty{grid-column:1/-1!important}
#page.rafex-free-drawing-page .m2-edge-editor{
  display:grid!important;grid-template-columns:repeat(4,minmax(220px,1fr))!important;
  gap:8px!important;overflow-x:auto!important;align-items:stretch!important
}
#page.rafex-free-drawing-page .m2-edge-editor[hidden]{display:none!important}

/* MR has its own two-nearest-gap single-row editor; retain that geometry. */
#page.rafex-free-drawing-page.mr-mode .m2-wall-editor{
  display:flex!important;flex-wrap:nowrap!important;align-items:stretch!important
}

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
    page.querySelectorAll('.rafex-system-product-row>span').forEach((cell)=>{
      if(cell.querySelector('small'))return;
      const placeholder=document.createElement('small');
      placeholder.className='rafex-product-spec-placeholder';
      placeholder.setAttribute('aria-hidden','true');
      placeholder.innerHTML='&nbsp;';
      cell.appendChild(placeholder);
    });
    if(page.classList.contains('mr-mode')||page.querySelector('#mrCanvas'))return;
    const isB2B=page.classList.contains('b2b-mode')||page.dataset.rafexFreeContextSystem==='b2b'||!!page.querySelector('#b2bMain3DCanvas');
    const isMekik=!isB2B&&(page.dataset.rafexFreeContextSystem==='mekik2'||!!page.querySelector('#m2Top, #m2Front, #m2Side'));
    if(!isB2B&&!isMekik)return;
    const layout=page.querySelector('.m2-layout');
    if(!layout)return;
    let bar=page.querySelector('.rafex-b2b-mekik-savebar');
    if(!bar){bar=document.createElement('div');bar.className='rafex-b2b-mekik-savebar'}
    if(bar.previousElementSibling!==layout)layout.insertAdjacentElement('afterend',bar);
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
