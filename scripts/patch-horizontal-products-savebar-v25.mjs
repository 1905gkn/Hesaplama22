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
#page #m2Front>svg[data-rafex-reference-front="v26"]{background:#fff}

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
    let drawing={};try{drawing=typeof m2LastDrawing!=='undefined'&&m2LastDrawing?m2LastDrawing:{}}catch(error){}
    const side=Math.max(0,Number(drawing.sideClearance??drawing.sideGap??75)||75),levels=Math.max(1,Number(drawing.levels)||1),levelH=Math.max(380,Number(drawing.levelH)||1580),loadH=Math.max(300,Number(drawing.palletHeight)||levelH-380),first=Math.max(0,Number(drawing.firstRailHeight)||430),upright=first+(levels-1)*levelH+loadH/2,pallet=Math.max(600,Number(drawing.palW)||1200),foot=Math.max(70,Math.min(110,Number(drawing.footType)||90)),pitch=pallet+150+foot,bays=Math.max(1,Number(drawing.bays)||1);
    const signature=[side,levels,levelH,loadH,first,pallet,foot,bays].join('|');
    if(host.dataset.rafexReferenceFrontSignature===signature&&host.querySelector('svg[data-rafex-reference-front="v26"]'))return;
    let projection='';try{projection=m2MekikSetProjection('front',drawing,58,42,740,610)}catch(error){return}
    const rackTop=153,rackBottom=632,dimX=800,chipX=814;
    host.innerHTML='<svg viewBox="0 0 950 696" data-rafex-reference-front="v26" role="img" aria-label="Mekik raf referans önden görünüşü">'+
      '<defs><pattern id="rafex-mekik-grid-v26" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#e8eeeb" stroke-width="1"/></pattern></defs><rect width="950" height="696" fill="#fff"/><rect width="950" height="696" fill="url(#rafex-mekik-grid-v26)"/>'+
      '<g class="m2-set-projection">'+projection+'</g>'+
      '<g font-family="Arial,sans-serif" text-anchor="middle" font-weight="900"><rect x="236" y="18" width="206" height="24" rx="12" fill="#fff7c7" stroke="#d4aa00"/><text x="339" y="34" font-size="13" fill="#6b5600">YAN BOŞLUK · '+formatMm(side)+' + '+formatMm(side)+' mm</text><rect x="180" y="44" width="318" height="31" rx="15" fill="#173c2d"/><text x="339" y="65" font-size="15" fill="#fff">KOLON ARALIĞI · '+formatMm(pitch)+' mm</text><rect x="245" y="78" width="188" height="25" rx="12" fill="#fff3a5" stroke="#d4aa00"/><text x="339" y="95" font-size="14" fill="#594700">PALET · '+formatMm(pallet)+' mm</text></g>'+
      '<g stroke="#d5ad00" fill="#d5ad00"><line x1="'+dimX+'" y1="'+rackTop+'" x2="'+dimX+'" y2="'+rackBottom+'" stroke-width="4"/><path d="M'+dimX+' '+rackTop+'l-8 15h16zM'+dimX+' '+rackBottom+'l-8-15h16z"/></g><g font-family="Arial,sans-serif" text-anchor="middle" font-weight="900"><rect x="'+chipX+'" y="335" width="124" height="62" rx="10" fill="#173c2d"/><text x="'+(chipX+62)+'" y="359" font-size="13" fill="#fff">AYAK UZUNLUĞU</text><text x="'+(chipX+62)+'" y="383" font-size="20" fill="#fff">'+formatMm(upright)+' mm</text></g></svg>';
    host.dataset.rafexReferenceFrontSignature=signature;
    host.querySelectorAll('.m2-front-bay-dimension').forEach((node)=>node.style.display='none');
  };

  /* Mekik: normal tasiyici Ayak takimi, yalniz secili arka ilave profil
     Ayak profili olarak listelenir. Her ikisi de goz sayisi + 1 hat kuralini kullanir. */
  const normalizeMekikBom=(rows,entry,labels)=>{
    const drawing=entry?.drawing||entry||{};if(drawing.b2bLayout||drawing?.b2b?.mr)return rows;
    const isTurkish=String(labels?.unitEach||'adet').toLocaleLowerCase('tr-TR')==='adet',normalName=isTurkish?'Ayak takımı':(labels?.items?.footTeam||'Ayak takımı'),profileName=isTurkish?'Ayak Profili':(labels?.items?.foot||'Ayak profili'),oldProfile=String(labels?.items?.foot||'Ayak profili').toLocaleLowerCase('tr-TR'),oldExtra=String(labels?.items?.extra||'Ekstra düz profil').toLocaleLowerCase('tr-TR'),lineCount=(Math.max(1,Math.round(Number(drawing.bays)||1))+1)*Math.max(1,Math.round(Number(entry?.rackCount)||1));
    return (Array.isArray(rows)?rows:[]).map((row)=>{
      const item=String(row?.item||'').trim(),key=item.toLocaleLowerCase('tr-TR');
      if(key===oldExtra||key==='düz profil'||key==='ekstra düz profil')return{...row,item:profileName,qty:lineCount};
      if(key===oldProfile||key==='ayak'||key==='ayak profili')return{...row,item:normalName};
      return row;
    });
  };
  try{const previousBom=window.m2CorporateBomRows;if(typeof previousBom==='function'&&!previousBom.__rafexMekikFootSplitV26){const wrapped=function(entry,labels){return normalizeMekikBom(previousBom.apply(this,arguments),entry,labels)};wrapped.__rafexMekikFootSplitV26=true;try{m2CorporateBomRows=wrapped}catch{}window.m2CorporateBomRows=wrapped}}catch(error){console.warn('Mekik ayak listesi ayrılamadı',error)}
  const renameMekikPartRows=(page)=>{page.querySelectorAll('#m2Parts .m2-part>span').forEach((node)=>{const value=String(node.textContent||'').trim();if(/^Ekstra düz profil\b/i.test(value)||/^Düz profil\b/i.test(value))node.textContent=value.replace(/^Ekstra düz profil\b|^Düz profil\b/i,'Ayak Profili');else if(/^Ayak\b/i.test(value)&&!/^Ayak (takımı|Profili)\b/i.test(value))node.textContent=value.replace(/^Ayak\b/i,'Ayak takımı')})};

  /* Raf arasi alaninin ilk degisiklikten sonra yakinlik listesinden dusmesi
     islemi kilitliyordu. Secilen iki raf arasindaki iliskiyi dogrudan yeniden kur. */
  const directRackGap=(owner,other)=>{try{const a=m2CombinedRackBounds(owner),b=m2CombinedRackBounds(other),candidates=[],horizontalStart=Math.max(a.top,b.top),horizontalEnd=Math.min(a.bottom,b.bottom),verticalStart=Math.max(a.left,b.left),verticalEnd=Math.min(a.right,b.right);let candidate;if(a.right<=b.left&&horizontalStart<=horizontalEnd){candidate=m2ClearRackGapLine(owner,other,'right',a.right,b.left,horizontalStart,horizontalEnd);if(candidate)candidates.push(candidate)}if(b.right<=a.left&&horizontalStart<=horizontalEnd){candidate=m2ClearRackGapLine(owner,other,'left',a.left,b.right,horizontalStart,horizontalEnd);if(candidate)candidates.push(candidate)}if(a.bottom<=b.top&&verticalStart<=verticalEnd){candidate=m2ClearRackGapLine(owner,other,'bottom',a.bottom,b.top,verticalStart,verticalEnd);if(candidate)candidates.push(candidate)}if(b.bottom<=a.top&&verticalStart<=verticalEnd){candidate=m2ClearRackGapLine(owner,other,'top',a.top,b.bottom,verticalStart,verticalEnd);if(candidate)candidates.push(candidate)}candidate=candidates.sort((x,y)=>x.distance-y.distance)[0];if(!candidate)return null;candidate.clearanceMm=m2RackClearanceMm(owner,other,candidate.direction);candidate.other=other;return candidate}catch(error){return null}};
  window.rafexSetRackGapV49=function(ownerId,otherId,rawValue){const owner=(m2LayoutState?.racks||[]).find((rack)=>Number(rack.id)===Number(ownerId)),other=(m2LayoutState?.racks||[]).find((rack)=>Number(rack.id)===Number(otherId));if(!owner||!other)return;const relation=directRackGap(owner,other);if(!relation){document.getElementById('m2FloorStatus').textContent='Bu iki raf artık aynı doğrultuda değil.';return}const displayMm=Math.max(0,Number(rawValue)||0),desiredPx=(displayMm+(Number(relation.clearanceMm)||0))*Math.max(.0001,Number(m2LayoutState.scale)||.04),delta=desiredPx-Number(relation.distance||0);let nextX=owner.x,nextY=owner.y;if(relation.direction==='right')nextX-=delta;else if(relation.direction==='left')nextX+=delta;else if(relation.direction==='bottom')nextY-=delta;else if(relation.direction==='top')nextY+=delta;const moved=m2MoveRackOrJoinedGroup(owner,nextX,nextY),status=document.getElementById('m2FloorStatus');if(status)status.textContent=moved?'Raf arası '+formatMm(displayMm)+' mm olarak ayarlandı.':'Girilen raf arası mesafe bloğu alan dışına çıkarıyor veya başka bir rafla çakıştırıyor.';m2RenderLayout()};
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
    if(isMekik)renameMekikPartRows(page);
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
for (const required of ['data-rafex-reference-front="v26"','__rafexMekikFootSplitV26','directRackGap','renameMekikPartRows','Ayak takımı','Ayak Profili']) {
  if (!html.includes(required)) throw new Error(`Mekik/raf arası v26 doğrulaması eksik: ${required}`);
}
const encoded = Buffer.from(html).toString('base64');
source = source.slice(0, match.index) + match[0].replace(match[2], encoded) + source.slice(match.index + match[0].length);
fs.writeFileSync(file, source);
console.log('Horizontal system product cards and B2B/Mekik save bar v25 applied');
