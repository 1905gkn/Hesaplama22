import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* pallet-variant-label-v305 */'))return html;
 const rep=(a,b)=>{if(!html.includes(a))throw Error('Missing v305 anchor: '+a.slice(0,100));html=html.replace(a,b);};
 rep('      function m2ProjectPlacementError() {',`      /* pallet-variant-label-v305 */
      function m2PalletVariantLabelV305(rack){
        const tunnel=Number(rack?.b2b?.tunnelHeight)>0?'TÜNEL':'';
        if(!rack?.b2bLayout||rack.b2b?.mr)return tunnel;
        const count=Number(rack.b2bLayout.palletCount||rack.b2b?.palletCount);
        const types=window.rafexProjectTypesV133||m2SavedRackTypes||[];
        const entry=rack.rafexCatalogKey?types.find(e=>((e.__rafexSystem||e.system||e.drawing?.rafexSystem||'b2b')+':'+e.id)===rack.rafexCatalogKey):types.find(e=>e.name===rack.typeName&&(e.__rafexSystem||e.system||'b2b')==='b2b');
        const drawing=entry?.drawing;
        const original=Number(drawing?.b2bLayout?.palletCount||drawing?.b2b?.palletCount||drawing?.b2bViewerOptions?.palletCount);
        const variant=Number.isInteger(count)&&count>0&&original>0&&count!==original;
        return variant?(tunnel?tunnel+' - '+count:'- '+count):tunnel;
      }
      function m2ProjectPlacementError() {`);
 rep('JSON.stringify([rack,index,globalKeyV212,rack.id===', 'JSON.stringify([rack,index,globalKeyV212,m2PalletVariantLabelV305(rack),rack.id===');
 rep('const planLabel = b2bTypeLetter(', 'const variantLabelV305=m2PalletVariantLabelV305(rack),planLabel = b2bTypeLetter(');
 rep('cy-(rack.b2b?.tunnelHeight?5:0)', 'cy-(variantLabelV305?5:0)');
 rep('${rack.b2b?.tunnelHeight?`<text x="${cx}" y="${cy+6}"', '${variantLabelV305?`<text x="${cx}" y="${cy+6}"');
 rep('Math.min(6,rack.w/4)*3.6)}" lengthAdjust="spacingAndGlyphs" transform="rotate(${rack.angle} ${cx} ${cy})">TÜNEL</text>', 'Math.min(6,rack.w/4)*Math.max(1,variantLabelV305.length*.6))}" lengthAdjust="spacingAndGlyphs" transform="rotate(${rack.angle} ${cx} ${cy})">${esc(variantLabelV305)}</text>');
 return html;
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-pallet-variant-label-v305.mjs')){
 const file=process.argv[2]||'dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}