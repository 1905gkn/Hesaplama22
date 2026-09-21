import fs from 'node:fs';
export function arrangeCustomize(){
 const modal=document.getElementById('m2CustomizeModal'),aside=modal?.querySelector('aside');if(!aside)return;
 const head=aside.querySelector('.m2-customize-head'),block=document.getElementById('m2CustomizeBlockName')?.closest('label'),name=document.getElementById('m2CustomizeName')?.closest('label');
 if(head&&block&&name){if(head.nextElementSibling!==block)head.after(block);if(block.nextElementSibling!==name)block.after(name);}
 const gap=document.getElementById('m2CustomizeRowGap');if(gap){gap.readOnly=true;gap.setAttribute('aria-readonly','true');gap.title='Mevcut iki sıra arası mesafe; bu bölümde değiştirilemez';}
 const accessories=document.getElementById('m2CustomizeAccessories'),collection=document.getElementById('m2CustomizeCollectionV119');
 if(accessories&&collection){
  if(collection.parentElement!==accessories)accessories.appendChild(collection);
  accessories.querySelector('[data-collection-picker-v119]')?.remove();
  const subtitle=accessories.querySelector('.m2-customize-section-head small');if(subtitle)subtitle.textContent='Palet Dayama · H Travers · Tava · Toplama Katı';
 }
 const manual=aside.querySelector('button[onclick*="rafexOpenManualHeightV121"]');
 if(manual){manual.id='rafexEditLevelsV178';manual.textContent='Katları Tek Tek Düzenle';manual.title='Her katın mesafesini, palet yüksekliğini, yükünü ve traversini düzenle';}
}
export function transform(html){
 if(html.includes('data-customize-ui="v178"'))return html;
 const anchor='const commit=rows=>{if(custom){customRows=rows;';
 if(!html.includes(anchor))throw Error('v178 manual commit missing');
 html=html.replace(anchor,"const commit=rows=>{if(custom){const modal=document.getElementById('m2CustomizeModal');if(modal)modal.dataset.detailEditedV135='1';customRows=rows;");
 const manualAnchor='window.rafexManualCustomizeActiveV121=()=>customRows.length>0;';
 if(!html.includes(manualAnchor))throw Error('v178 manual state missing');
 html=html.replace(manualAnchor,manualAnchor+`
 window.rafexManualCustomizeRowsV178=()=>copy(customRows);
 const legacyLevelDataV178=m2CustomizeLevelData;
 m2CustomizeLevelData=window.m2CustomizeLevelData=function(){
  if(customRows.length){const rack=m2LayoutState.racks.find(r=>r.id===customId);return rowsToCustom(customRows,positionOf(rack?.b2b));}
  return legacyLevelDataV178.apply(this,arguments);
 };
 `);
 const same='const sameCustom=JSON.stringify(custom)===JSON.stringify(oldCustom);';
 if(!html.includes(same))throw Error('v178 customization comparison missing');
 html=html.replace(same,'const sameCustom=JSON.stringify(custom)===JSON.stringify(oldCustom)&&JSON.stringify(window.rafexManualCustomizeRowsV178?.()||[])===JSON.stringify(rack.b2b?.manualLevelSpecs||[]);');
 html=html.replace('String(rack.b2bLayout?.rowGap||200)','String(rack.b2bLayout?.rowGap??200)');
 const css=`<style data-customize-ui="v178">
#page #rafexTypeLetterScaleInputV65,#page #rafexTypeLetterContrastInputV65{width:70px!important;min-width:70px!important;flex:0 0 70px!important;padding:5px 7px!important;font-size:12px!important;box-sizing:border-box!important;text-align:center}
#m2CustomizeModal #m2CustomizePalletVisibility{display:flex!important;align-items:center;justify-content:space-between;gap:8px;padding:7px 9px!important;min-height:0!important;border-radius:8px;background:#edf5f0}
#m2CustomizePalletVisibility>div{flex:0 0 auto!important;min-width:0!important}
#m2CustomizePalletVisibility small{display:none!important}
#m2CustomizePalletVisibilityButton{min-width:0!important;min-height:30px!important;padding:6px 8px!important;font-size:10px!important;white-space:normal!important}
#m2CustomizeAccessories:not(.open) #m2CustomizeCollectionV119{display:none!important}
#m2CustomizeAccessories #m2CustomizeCollectionV119{margin:8px!important;min-width:0}
#m2CustomizeRowGap[readonly]{background:#f0f3f1;color:#53645a;cursor:default;appearance:textfield}
#m2CustomizeRowGap[readonly]::-webkit-inner-spin-button{display:none}
#rafexEditLevelsV178{padding:10px!important;border:1px solid #9fbca9!important;background:#eaf3ed!important;color:#174a35!important;border-radius:8px!important;font-weight:700!important}
</style>`;
 const runtime='<script>'+arrangeCustomize.toString()+`;(()=>{
 const load=window.rafexLoadCustomizeCollectionV119;
 if(load)window.rafexLoadCustomizeCollectionV119=function(){const result=load.apply(this,arguments);arrangeCustomize();return result};
 const open=window.m2OpenCustomizeModal;
 if(open){window.m2OpenCustomizeModal=function(){const result=open.apply(this,arguments);arrangeCustomize();return result};try{m2OpenCustomizeModal=window.m2OpenCustomizeModal}catch(_){}}
})();</script>`;
 const at=html.lastIndexOf('</body>');return html.slice(0,at)+css+runtime+html.slice(at);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-customize-ui-v178.mjs')){
 const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');
 fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}
