export function transform(html){
 if(html.includes('/* array-gap-basis-v352 */'))return html;
 const replace=(a,b)=>{if(html.split(a).length!==2)throw Error('v352 anchor '+a.slice(0,100));html=html.replace(a,b);};
 replace('const boxes=[...sources.map(r=>m2RackBounds(r)),...symbols.map(s=>m2SymbolBounds(s)),','/* array-gap-basis-v352 */ const boxes=[...sources.map(r=>m2GapBoundsV346(r)),...symbols.map(s=>m2SymbolBounds(s)),');
 replace('<label>Gruplar arası net boşluk (mm)<input name="gap"','<label><span data-array-gap-label>Gruplar arası net boşluk (mm)</span><input name="gap"');
 replace("  dialog.querySelector('[data-error]').textContent='';dialog.showModal();dialog.querySelector('select').focus();",`  const gapBasis=m2LayoutState.rackGapBasis==='frame'?'Raftan rafa':'Paletten palete';
  dialog.querySelector('[data-array-gap-label]').textContent=gapBasis+' net boşluk (mm)';
  dialog.querySelector('.array-hint').textContent='Asıl grup yerinde kalır. Net aralık '+gapBasis.toLocaleLowerCase('tr-TR')+' ölçülür; her yeni grup bu aralıkla yerleştirilir. Seçilen sembol ve yazıların kendi sınırları korunur.';
  dialog.querySelector('[data-error]').textContent='';dialog.showModal();dialog.querySelector('select').focus();`);
 return html;
}

