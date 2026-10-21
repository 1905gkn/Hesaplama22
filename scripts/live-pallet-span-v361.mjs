export function transform(html){
 if(html.includes('/* live-pallet-span-v361 */'))return html;
 const replace=(a,b)=>{if(html.split(a).length!==2)throw Error('v361 anchor '+a.slice(0,90));html=html.replace(a,b);};
 replace('moduleCount: modules,\n          palletCount: geometry.count,','moduleCount: modules,\n          sectionWidth: geometry.sectionWidth,\n          palletCount: geometry.count,');
 replace('b2b3DUpdateTimer=null;b2bInstallMain3D();','b2b3DUpdateTimer=null;if($("b2bMain3DCanvas"))b2bUpdateMain3D();else b2bInstallMain3D();');
 replace('b2bApplyInputs({target:$("b2bMeasureSettingsDialog")});','b2bApplyInputs({target:$("b2bMeasureSettingsDialog")});\n        if($("b2bMain3DCanvas"))b2bUpdateMain3D();');
 replace('id="b2bMeasurePalletSideGap" type="number"','id="b2bMeasurePalletSideGap" oninput="b2bPreviewPalletSideGapV361()" type="number"');
 replace('<small>Travers boyu = palet eni × adet + boşluk × (adet + 1).</small>','<small>Travers boyu = palet eni × adet + boşluk × (adet + 1).</small><output id="b2bPalletSideGapPreviewV361" aria-live="polite"></output>');
 replace('      function b2bApplyGapDialog() {',`      function b2bPreviewPalletSideGapV361() { /* live-pallet-span-v361 */
        const input=$("b2bMeasurePalletSideGap"),out=$("b2bPalletSideGapPreviewV361");if(!input||!out)return;
        const raw=input.value.trim(),gap=Number(raw);if(raw===''||!Number.isFinite(gap)||gap<0||gap>500){out.textContent='0–500 mm arasında bir boşluk girin.';return;}
        const base=b2bPalletGeometry(),geometry=b2bPalletGeometry({palletType:base.type,palletCount:base.count,palletWidth:base.width,palletDepth:base.depth,palletSideGap:gap});
        out.textContent=geometry.isStandardFourEuro?'Travers boyu: '+fmt(geometry.sectionWidth)+' mm (standart 4 palet kesiti)':base.count+' × '+fmt(base.width)+' + '+(base.count+1)+' × '+fmt(gap)+' = '+fmt(geometry.sectionWidth)+' mm travers';
      }
      function b2bApplyGapDialog() {`);
 replace('const dialog = $(dialogId); if (dialog && !dialog.open) dialog.showModal();','if(dialogId==="b2bMeasureSettingsDialog")b2bPreviewPalletSideGapV361();\n        const dialog = $(dialogId); if (dialog && !dialog.open) dialog.showModal();');
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('v361 body');
 return html.slice(0,end)+'<style data-live-pallet-span="v361">#b2bPalletSideGapPreviewV361{display:block;color:#204e3e;text-align:left;font-size:12px;line-height:1.5;font-weight:800}</style>'+html.slice(end);
}

