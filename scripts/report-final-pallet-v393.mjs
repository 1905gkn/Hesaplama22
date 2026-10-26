export function transformFinalReport(html){
 if(html.includes('data-report-final-pallet="v393"'))return html;
 const replace=(a,b)=>{if(html.split(a).length!==2)throw Error('Final pallet report anchor: '+a.slice(0,100));html=html.replace(a,b);};
 replace('<div class="m2-corporate-final"><div class="m2-corporate-pallets">${m2CorporatePalletTable(types,palletTotal,t)}</div>', '<div class="m2-corporate-final"><div class="m2-report-pallet-model-v393"><img src="/report-pallet.png?v=v393" alt="Palet 3D" width="1600" height="1600"></div><div class="m2-corporate-pallets">${m2CorporatePalletTable(types,palletTotal,t).replace(/<div class="m2-pallet-spec-total">[\\s\\S]*?<\\/div>/,\'\')}</div>');
 replace('Çizimler 3D olduğu için perspektiften dolayı görsel yanılmalar olabilir.</p></article></div></div></section>', 'Çizimler 3D olduğu için perspektiften dolayı görsel yanılmalar olabilir.</p></article></div><div class="m2-pallet-spec-total m2-final-pallet-total-v393"><span>${t.totalPallets}</span><b>${fmt(palletTotal)}</b></div></div></section>');
 const style=`<style data-report-final-pallet="v393">
 .m2-corporate-final{grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;grid-template-rows:minmax(0,1fr) auto auto!important;inset:13% 2% 5%!important;gap:12px!important}
 .m2-corporate-final>.m2-report-pallet-model-v393{grid-column:1;grid-row:1;min-width:0;min-height:0;display:flex;align-items:center;justify-content:center;overflow:hidden}
 .m2-report-pallet-model-v393 img{display:block;width:100%;height:100%;max-width:100%;max-height:100%;object-fit:contain}
 .m2-corporate-final>.m2-corporate-pallets{grid-column:2!important;grid-row:1;min-width:0;align-self:start;width:100%;max-width:100%}
 .m2-corporate-final>.m2-corporate-images{grid-column:1;grid-row:2;min-width:0}
 .m2-corporate-final>.m2-corporate-images:empty{display:none}
 .m2-corporate-final>.m2-corporate-copy{grid-column:2;grid-row:2;min-width:0;height:auto!important}
 .m2-corporate-final>.m2-final-pallet-total-v393{grid-column:1/-1;grid-row:3;margin:0!important;min-width:0}
 .m2-corporate-final .m2-pallet-spec-grid{min-width:0;grid-template-columns:1.15fr repeat(4,minmax(0,1fr));font-size:6.5px}
 .m2-corporate-final .m2-pallet-spec-grid>span{min-width:0;overflow-wrap:anywhere}
 </style>`;
 return html.replace('</head>',style+'</head>');
}

