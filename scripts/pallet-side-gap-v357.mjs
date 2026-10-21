export function transform(html){
 if(html.includes('/* pallet-side-gap-v357 */'))return html;
 const replace=(a,b,n=1)=>{if(html.split(a).length!==n+1)throw Error('v357 anchor '+a.slice(0,90));html=html.split(a).join(b);};
 replace('let b2bPalletOverhang = 50,','/* pallet-side-gap-v357 */ let b2bPalletSideGap=75;\n      let b2bPalletOverhang = 50,');
 replace('const calculatedWidth = count * width + (count + 1) * 75;','const palletSideGap=Math.max(0,Math.min(500,Number(input?input.palletSideGap??75:b2bPalletSideGap)||0));\n        const calculatedWidth = count * width + (count + 1) * palletSideGap;');
 replace('const isStandardFourEuro = type === "euro" && count === 4;','const isStandardFourEuro = type === "euro" && count === 4 && palletSideGap === 75;');
 replace('return { type, count, width, depth, calculatedWidth, sectionWidth, isStandardFourEuro };','return { type, count, width, depth, calculatedWidth, sectionWidth, isStandardFourEuro, palletSideGap };');
 replace('<label>Travers yüksekliği (mm)<input id="b2bMeasureTraverseHeight" type="number" min="50" max="500" step="10" value="${b2bTraverseHeight()}"></label>','<label>Palet ara ve yan boşluğu (her boşluk, mm)<input id="b2bMeasurePalletSideGap" type="number" min="0" max="500" step="1" value="${b2bPalletSideGap}"><small>Travers boyu = palet eni × adet + boşluk × (adet + 1).</small></label>');
 replace('b2bMeasureTraverseHeight:b2bTraverseHeight(),','b2bMeasurePalletSideGap:b2bPalletSideGap,');
 replace('b2bTraverseHeightOverride = Math.max(50, Math.min(500, Number($("b2bMeasureTraverseHeight")?.value) || b2bTraverseHeight()));','b2bPalletSideGap=read("b2bMeasurePalletSideGap",b2bPalletSideGap,500);b2bTraverseHeightOverride=null;');
 replace('return b2bTraverseHeightOverride ?? (B2B_TRAVERSE_TYPES.find','return (B2B_TRAVERSE_TYPES.find');
 replace('palletOverhang:b2bPalletOverhang, traverseHeightOverride:', 'palletOverhang:b2bPalletOverhang, palletSideGap:b2bPalletSideGap, traverseHeightOverride:');
 replace('traverseHeightOverride:b2bTraverseHeightOverride, showPallets:', 'traverseHeightOverride:null, showPallets:');
 replace('b2bSpecialPallet = { width:Number(state.palletWidth) || 800, depth:Number(state.palletDepth) || 1200 };','b2bPalletSideGap=Math.max(0,Math.min(500,Number(state.palletSideGap??75)||0));\n        b2bSpecialPallet = { width:Number(state.palletWidth) || 800, depth:Number(state.palletDepth) || 1200 };');
 replace('palletWidth: geometry.width,','palletWidth: geometry.width, palletSideGap:geometry.palletSideGap,');
 replace('b2bLayout:{ palletCount:count, palletWidth, palletDepth,','b2bLayout:{ palletCount:count, palletWidth, palletSideGap:geometry.palletSideGap, palletDepth,');
 replace('const normalized=Math.max(1,Math.min(4,Math.round(count))), calculated=normalized*layout.palletWidth+(normalized+1)*75;\n        return layout.palletType==="euro"&&normalized===4?3600:calculated;','const normalized=Math.max(1,Math.min(4,Math.round(count)));return rafexSectionWidthV238(layout,normalized);');
 replace('planClearanceMm = Math.max(75, palletGapMm)','planClearanceMm = Math.max(0, palletGapMm)');
 replace('function widthForCount(count, palletWidth) {','function widthForCount(count, palletWidth, palletSideGap=75) {');
 replace('return count === 4 && width === 800 ? 3600 : count * width + (count + 1) * 75;','const gap=Math.max(0,Math.min(500,Number(palletSideGap)||0));return count === 4 && width === 800 && gap===75 ? 3600 : count * width + (count + 1) * gap;');
 replace('widthForCount(count, base.palletWidth)','widthForCount(count, base.palletWidth, base.palletSideGap??75)');
 replace('palletWidth: number(layout.palletWidth ?? state.palletWidth ?? drawing?.palW, 800),','palletWidth: number(layout.palletWidth ?? state.palletWidth ?? drawing?.palW, 800),\n      palletSideGap:number(layout.palletSideGap??state.palletSideGap,75),');
 replace('palletWidth:Number(l.palletWidth||b.palletWidth||d.palW||saved.palletWidth)||800,','palletSideGap:Number(l.palletSideGap??b.palletSideGap??saved.palletSideGap??75),palletWidth:Number(l.palletWidth||b.palletWidth||d.palW||saved.palletWidth)||800,');
 replace('const rackWidth = palletCount * palletWidth + (palletCount + 1) * 75 + footWidth * 2;','const rackWidth = (Number(options.sectionWidth)||palletCount * palletWidth + (palletCount + 1) * Number(options.palletSideGap??75)) + footWidth * 2;');
 replace('const sectionWidth = Math.max(1200, Number(layout.sectionWidth) || palletCount * palletWidth + (palletCount + 1) * 75);','const sectionWidth = Math.max(1, Number(layout.sectionWidth) || palletCount * palletWidth + (palletCount + 1) * Number(layout.palletSideGap??state.palletSideGap??75));');
 replace('next.palletCount*next.palletWidth+(next.palletCount+1)*75','next.palletCount*next.palletWidth+(next.palletCount+1)*Number(next.palletSideGap??75)');
 return html;
}

