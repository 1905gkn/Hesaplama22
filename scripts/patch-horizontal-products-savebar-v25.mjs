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

/* Mekik front view remains the native detailed projection after switching
   between MR, B2B and Mekik inside Serbest Cizim. */
#page:not(.b2b-mode):not(.mr-mode) #m2Front{position:relative!important;overflow:hidden!important}
#page:not(.b2b-mode):not(.mr-mode) #m2Front>svg{
  display:block!important;width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;
  margin:0 auto!important;transform:none!important
}
.rafex-mekik-live-front-overlay{position:absolute;inset:0;z-index:7;pointer-events:none;font-family:Arial,sans-serif}
.rafex-mekik-live-front-overlay .top-stack{position:absolute;top:1.5%;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:4px;white-space:nowrap}
.rafex-mekik-live-front-overlay .side-gap{padding:2px 8px;border-radius:10px;background:#fff6bf;color:#6c5600;font-size:11px;font-weight:950}
.rafex-mekik-live-front-overlay .pallet-chip{padding:3px 9px;border:1px solid #d2a900;border-radius:11px;background:#fff3a5;color:#4d4300;font-size:11px;font-weight:950}
.rafex-mekik-live-front-overlay .upright-line{position:absolute;right:7.8%;top:20%;bottom:10%;width:3px;background:#d6ac00}
.rafex-mekik-live-front-overlay .upright-line:before,.rafex-mekik-live-front-overlay .upright-line:after{content:"";position:absolute;left:50%;transform:translateX(-50%);border-left:7px solid transparent;border-right:7px solid transparent}
.rafex-mekik-live-front-overlay .upright-line:before{top:-1px;border-bottom:12px solid #d6ac00}.rafex-mekik-live-front-overlay .upright-line:after{bottom:-1px;border-top:12px solid #d6ac00}
.rafex-mekik-live-front-overlay .upright-chip{position:absolute;right:1.2%;top:49%;transform:translateY(-50%);min-width:118px;padding:8px 10px;border-radius:9px;background:#173c2d;color:#fff;text-align:center;font-size:10px;font-weight:950}
.rafex-mekik-live-front-overlay .upright-chip b{display:block;margin-top:3px;font-size:16px}

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
  let mekikRepairing=false;
  const formatMm=(value)=>{const n=Math.round(Number(value)||0);try{return n.toLocaleString('tr-TR')}catch{return String(n)}};
  const activeFreeSystem=(page)=>String(page?.dataset?.rafexFreeContextSystem||page?.dataset?.freeSystem||'').toLowerCase();
  const repairMekikFront=(page)=>{
    const freeSystem=activeFreeSystem(page),isFree=page.classList.contains('rafex-free-drawing-page');
    const isMekik=(isFree&&freeSystem==='mekik2')||(!isFree&&!page.classList.contains('b2b-mode')&&!page.classList.contains('mr-mode')&&!!page.querySelector('#m2Top,#m2Side'));
    if(!isMekik)return;
    const host=document.getElementById('m2Front');if(!host)return;
    let native=host.querySelector('svg [data-front-layout="ayak2-glb-front-projection"]');
    if(!native&&!mekikRepairing&&typeof window.drawMekik2==='function'){
      mekikRepairing=true;try{window.drawMekik2()}catch(error){console.warn('Mekik ön görünüşü yenilenemedi',error)}finally{mekikRepairing=false}
      native=host.querySelector('svg [data-front-layout="ayak2-glb-front-projection"]');
    }
    if(!native)return;
    const svg=host.querySelector(':scope>svg');
    if(svg){Array.from(svg.querySelectorAll(':scope>text')).slice(0,2).forEach((node)=>node.style.display='none');const bayDims=Array.from(svg.querySelectorAll('.m2-front-bay-dimension'));bayDims.forEach((node,index)=>node.style.display=index===0?'':'none')}
    let drawing={};try{drawing=typeof m2LastDrawing!=='undefined'&&m2LastDrawing?m2LastDrawing:{}}catch(error){}
    const side=Math.max(0,Number(drawing.sideClearance??drawing.sideGap??75)||75),levels=Math.max(1,Number(drawing.levels)||1),levelH=Math.max(380,Number(drawing.levelH)||1580),loadH=Math.max(300,Number(drawing.palletHeight)||levelH-380),first=Math.max(0,Number(drawing.firstRailHeight)||430),upright=first+(levels-1)*levelH+loadH/2,pallet=Math.max(600,Number(drawing.palW)||1200);
    const signature=[side,levels,levelH,loadH,first,pallet].join('|');let overlay=host.querySelector('.rafex-mekik-live-front-overlay');
    if(!overlay){overlay=document.createElement('div');overlay.className='rafex-mekik-live-front-overlay';host.appendChild(overlay)}
    if(overlay.dataset.signature!==signature){overlay.dataset.signature=signature;overlay.innerHTML='<div class="top-stack"><span class="side-gap">YAN BOŞLUK · '+formatMm(side)+' + '+formatMm(side)+' mm</span><span class="pallet-chip">PALET · '+formatMm(pallet)+' mm</span></div><span class="upright-line"></span><span class="upright-chip">AYAK UZUNLUĞU<b>'+formatMm(upright)+' mm</b></span>'}
  };
  const savedIndex=(button)=>{const row=button?.closest?.('.m2-saved-type-row');if(!row)return-1;const main=row.querySelector('.m2-saved-type'),source=String(main?.getAttribute('onclick')||'');const match=source.match(/(?:m2HandleSavedRackTypeClick|m2SelectSavedRackType)\((\d+)/);if(match)return Number(match[1]);return Array.from(row.parentElement?.querySelectorAll('.m2-saved-type-row')||[]).indexOf(row)};
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
    repairMekikFront(page);
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
  document.addEventListener('click',(event)=>{const page=document.getElementById('page');if(!page?.classList.contains('rafex-free-drawing-page'))return;const button=event.target?.closest?.('#m2SavedTypeList .rafex-free-info,#m2SavedTypeList .rafex-free-copy');if(!button)return;const index=savedIndex(button);if(index<0)return;event.preventDefault();event.stopImmediatePropagation();if(button.classList.contains('rafex-free-info'))window.rafexFreeShowInfoV3?.(index);else window.rafexFreeCopySavedV3?.(index)},true);
  document.addEventListener('click',schedule,true);document.addEventListener('change',schedule,true);
  schedule();
})();
</script>`;

html = html.replace('</body>', `${runtime}</body>`);
const encoded = Buffer.from(html).toString('base64');
source = source.slice(0, match.index) + match[0].replace(match[2], encoded) + source.slice(match.index + match[0].length);
fs.writeFileSync(file, source);
console.log('Horizontal system product cards and B2B/Mekik save bar v25 applied');
