export function transform(html){
 if(html.includes('/* independent-pallet-gap-v359 */'))return html;
 const replace=(a,b)=>{if(html.split(a).length!==2)throw Error('v359 anchor '+a.slice(0,90));html=html.replace(a,b);};
 const gap='<label>Palet ara ve yan boşluğu (her boşluk, mm)<input id="b2bMeasurePalletSideGap" type="number" min="0" max="500" step="1" value="${b2bPalletSideGap}"><small>Travers boyu = palet eni × adet + boşluk × (adet + 1).</small></label>';
 replace(gap,'<label hidden>Travers yüksekliği (mm)<input id="b2bMeasureTraverseHeight" type="number" min="50" max="500" step="10" value="${b2bTraverseHeight()}"></label>');
 const visible='${b2bShowPallets ? "Paletleri Gizle" : "Paletleri Göster"}</button></label></div><div class="b2b-measure-dialog-actions">';
 replace(visible,'${b2bShowPallets ? "Paletleri Gizle" : "Paletleri Göster"}</button></label><fieldset class="b2b-horizontal-gap-v359"><legend>Yatay palet yerleşimi</legend>'+gap+'</fieldset></div><div class="b2b-measure-dialog-actions">');
 replace('b2bMeasurePalletSideGap:b2bPalletSideGap,','b2bMeasureTraverseHeight:b2bTraverseHeight(), b2bMeasurePalletSideGap:b2bPalletSideGap,');
 replace('return (B2B_TRAVERSE_TYPES.find','return b2bTraverseHeightOverride ?? (B2B_TRAVERSE_TYPES.find');
 replace('traverseHeightOverride:null, showPallets:','traverseHeightOverride:b2bTraverseHeightOverride, showPallets:');
 const start=html.indexOf('      function b2bApplyMeasureSettings() {'),end=html.indexOf('      function b2bTogglePalletVisibility()',start);if(start<0||end<0)throw Error('v359 apply handler');
 const handler=`      function b2bApplyMeasureSettings() { /* independent-pallet-gap-v359 */
        const read=(id,fallback,max=3000)=>{const input=$(id),raw=String(input?.value??'').trim(),value=Number(raw);return raw!==''&&Number.isFinite(value)?Math.max(0,Math.min(max,value)):fallback;};
        const topOverlap=read("b2bMeasureTopOverlap",b2bLastPalletOverlap);
        if(topOverlap!==b2bLastPalletOverlap)b2bLastOverlapManual=true;
        b2bFirstFloorGap=read("b2bMeasureFloorGap",b2bFirstFloorGap);
        b2bPalletTraverseGap=read("b2bMeasureClearance",b2bPalletTraverseGap,2000);
        b2bLastPalletOverlap=topOverlap;
        b2bPalletOverhang=read("b2bMeasurePalletOverhang",b2bPalletOverhang,1000);
        b2bPalletSideGap=read("b2bMeasurePalletSideGap",b2bPalletSideGap,500);
        // The hidden height setting remains in saved state; horizontal spacing never resets it.
        $("b2bMeasureSettingsDialog")?.close();
        b2bApplyInputs({target:$("b2bMeasureSettingsDialog")});
      }
`;
 html=html.slice(0,start)+handler+html.slice(end);
 const endBody=html.lastIndexOf('</body>');if(endBody<0)throw Error('v359 body');
 const css='#b2bMeasureSettingsDialog label[hidden]{display:none!important}.b2b-horizontal-gap-v359{margin:12px 0 0;padding:12px;border:1px solid #c7d8cf;border-radius:8px;background:#f6faf7}.b2b-horizontal-gap-v359 legend{padding:0 6px;color:#204e3e;font-size:12px;font-weight:700}.b2b-horizontal-gap-v359 label{margin:0}.b2b-horizontal-gap-v359 small{font-size:11px;line-height:1.5;color:#52685c}';
 return html.slice(0,endBody)+'<style data-independent-pallet-gap="v359">'+css+'</style>'+html.slice(endBody);
}

