export function palletRowsV395(types){
 const rows=[],seen=new Set();
 for(const entry of types||[]){
  const d=entry.drawing||entry,b=d.b2b||{},view=d.rackDetail?.views?.b2b||d.b2bViewerOptions||{},count=Number(b.palletCount||d.b2bLayout?.palletCount)||1;
  const specs=b.manualLevelSpecs?.length?b.manualLevelSpecs:b.customLevels?.length?b.customLevels:null;
  const heights=b.palletHeights||d.palletHeights||view.palletHeights||[];
  const levels=Math.max(1,Number(d.levels||b.levels)||specs?.length||heights.length||1);
  const variants=specs||heights.length?Array.from({length:levels},(_,i)=>{const s=specs?.[i]||{};return {palD:Number(s.palletDepth??s.palD??d.palD??b.palletDepth)||0,palW:Number(s.palletWidth??s.palW??d.palW??b.palletWidth)||0,palletHeight:Number(s.palletHeight??heights[i]??d.palletHeight??b.palletHeight)||0,palletWeight:Number(s.palletWeight??(s.weight!=null?Number(s.weight)/(Number(s.palletCount)||count):d.palletWeight??b.palletWeight))||0};}):[{palD:Number(d.palD??b.palletDepth)||0,palW:Number(d.palW??b.palletWidth)||0,palletHeight:Number(d.palletHeight??b.palletHeight)||0,palletWeight:Number(d.palletWeight??b.palletWeight)||0}];
  for(const v of variants){if(v.palletHeight<=0)continue;const key=JSON.stringify([entry.rafexSystem||d.rafexSystem||'',String(entry.name||d.typeName||'').trim().toLocaleUpperCase('tr-TR'),v.palD,v.palW,v.palletHeight,v.palletWeight]);if(seen.has(key))continue;seen.add(key);rows.push({...entry,drawing:{...d,...v}});}
 }
 return rows;
}

export function transformFinalReport(html){
 if(html.includes('data-report-final-pallet="v393"'))return html;
 const replace=(a,b)=>{if(html.split(a).length!==2)throw Error('Final pallet report anchor: '+a.slice(0,100));html=html.replace(a,b);};
 replace('types=window.rafexUniquePalletRowsV184(types);','types=window.rafexPalletRowsV395(types);');
 replace('<div class="m2-corporate-final"><div class="m2-corporate-pallets">${m2CorporatePalletTable(types,palletTotal,t)}</div>', '<div class="m2-corporate-final"><div class="m2-report-pallet-model-v393"><img src="/report-pallet.png?v=v396" alt="Palet 3D — Wuc: genişlik, Duc: derinlik, Huc: yükseklik" width="1600" height="1600"></div><div class="m2-corporate-pallets">${m2CorporatePalletTable(types,palletTotal,t).replace(/<div class="m2-pallet-spec-total">[\\s\\S]*?<\\/div>/,\'\')}</div>');
 replace('Çizimler 3D olduğu için perspektiften dolayı görsel yanılmalar olabilir.</p></article></div></div></section>', 'Çizimler 3D olduğu için perspektiften dolayı görsel yanılmalar olabilir.</p></article></div><div class="m2-pallet-spec-total m2-final-pallet-total-v393"><span>${t.totalPallets}</span><b>${fmt(palletTotal)}</b></div></div></section>');
 const style=`<style data-report-final-pallet="v393">
 .m2-corporate-final{grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;grid-template-rows:minmax(0,1fr) auto auto!important;inset:13% 2% 5%!important;gap:12px!important}
 .m2-corporate-final>.m2-report-pallet-model-v393{grid-column:1;grid-row:1;min-width:0;min-height:0;display:flex;align-items:center;justify-content:center;overflow:hidden}
 .m2-report-pallet-model-v393 img{display:block;width:82%;height:82%;max-width:100%;max-height:100%;object-fit:contain}
 .m2-corporate-final>.m2-corporate-pallets{grid-column:2!important;grid-row:1;min-width:0;align-self:start;width:100%;max-width:100%}
 .m2-corporate-final>.m2-corporate-images{grid-column:1;grid-row:2;min-width:0}
 .m2-corporate-final>.m2-corporate-images:empty{display:none}
 .m2-corporate-final>.m2-corporate-copy{grid-column:2;grid-row:2;min-width:0;height:auto!important}
 .m2-corporate-final>.m2-final-pallet-total-v393{grid-column:1/-1;grid-row:3;margin:0!important;min-width:0}
 .m2-corporate-final .m2-pallet-spec-grid{min-width:0;grid-template-columns:1.15fr repeat(4,minmax(0,1fr));font-size:10px!important;line-height:1.3}
 .m2-corporate-final .m2-pallet-spec-grid>span{padding:6px 4px!important;font-weight:700}
 .m2-corporate-final .m2-pallet-spec-head{background:#0b2b45!important;color:#fff!important;font-weight:900;border-bottom:3px solid #4fa3c7}
 .m2-corporate-final .m2-pallet-spec-row:nth-child(odd){background:#edf4f8}
 .m2-corporate-final .m2-pallet-spec-grid>span{min-width:0;overflow-wrap:anywhere;white-space:normal!important;overflow:visible;text-overflow:clip}
 .m2-corporate-final .m2-pallet-spec-row strong{font-size:12px!important;font-weight:900;padding:6px 4px!important}
 </style>`;
 return html.replace('</head>',style+'<script data-pallet-rows="v395">window.rafexPalletRowsV395='+palletRowsV395.toString()+';</script></head>');
}

