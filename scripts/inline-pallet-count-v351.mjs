export function transform(html){
 if(html.includes('/* inline-pallet-count-v351 */'))return html;
 const before="const detail=m2PalletVariantLabelV305(rack);group.querySelectorAll(";
 if(html.split(before).length!==2)throw Error('v351 variant paint anchor');
 const after=`/* inline-pallet-count-v351 */
    const rawDetail=m2PalletVariantLabelV305(rack),count=/(\\d+)$/.exec(rawDetail)?.[1]||'',detail=rawDetail.startsWith('TÜNEL')?'TÜNEL':'';
    const base=String(rack.rafexGlobalTypeLetter||rack.typeName||'').trim().replace(/\\s*-\\s*Tünel(?:\\s+\\d+)?\\s*$/i,'');
    const inlineName=base+count;if(name.textContent!==inlineName)name.textContent=inlineName;
    group.querySelectorAll(`;
 return html.replace(before,after);
}

