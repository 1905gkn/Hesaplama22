import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* measure-pin-observers-v264 */'))return html;
 const rep=(a,b)=>{if(html.split(a).length!==2)throw Error('Anchor '+a.slice(0,70));html=html.replace(a,b);};
 rep('      function m2OpenMeasureEditor(title, currentMm, apply) {',`      /* measure-pin-observers-v264 */
      let m2PendingMeasurePinV264=null;
      function m2PinMeasureV264(){const pin=m2PendingMeasurePinV264;if(!pin)return;m2CancelMeasureEdit();pin();}
      function m2OpenMeasureEditor(title, currentMm, apply, pin=null) {`);
 rep('        m2PendingMeasureApply = apply; $("m2MeasureTitle").textContent = title;',`        m2PendingMeasurePinV264=pin;
        const pinButton=$('m2MeasurePinV264');if(pinButton)pinButton.hidden=typeof pin!=='function';
        m2PendingMeasureApply = apply; $("m2MeasureTitle").textContent = title;`);
 rep('<div class="m2-measure-actions">','<button id="m2MeasurePinV264" type="button" hidden onclick="m2PinMeasureV264()" style="width:100%;margin:8px 0">Çizim alanında kalsın</button><div class="m2-measure-actions">');
 rep('if (modal) modal.hidden = true; m2PendingMeasureApply = null;','if (modal) modal.hidden = true; m2PendingMeasureApply = null;m2PendingMeasurePinV264=null;');
 rep("m2OpenMeasureEditor('Seçilen iki rafın arası',current,function(value){setPairDistance(aId,bId,value,moveId);});","m2OpenMeasureEditor('Seçilen iki rafın arası',current,function(value){setPairDistance(aId,bId,value,moveId);},function(){window.rafexToggleRackPairGap(aId,bId,true);status('Ölçü çizimde sabitlendi. RAF / DUVAR UZAKLIKLARI bölümündeki işareti kaldırarak gizleyebilirsin.');});");
 rep('m2OpenMeasureEditor(`${label} duvar mesafesi`, currentMm, (value) => m2SetWallDistance(direction, value));','m2OpenMeasureEditor(`${label} duvar mesafesi`, currentMm, (value) => m2SetWallDistance(direction, value),()=>m2TogglePinnedDimension(direction,true));');
 // Ignore SVG-only mutations; HTML replacement still restores controls after navigation.
 const filter=`records=>records.some(record=>record.target?.namespaceURI!=='http://www.w3.org/2000/svg'&&[...record.addedNodes,...record.removedNodes].some(node=>node.nodeType===1&&node.namespaceURI!=='http://www.w3.org/2000/svg'))`;
 rep('new MutationObserver(keepSectionButtonAlive)','new MutationObserver(records=>{if(('+filter+')(records))keepSectionButtonAlive();})');
 rep('var sectionObserver=new MutationObserver(function(){clearTimeout','var sectionObserver=new MutationObserver(function(records){if(!('+filter+')(records))return;clearTimeout');
 rep('var savedActionsObserverV147=new MutationObserver(function(){if(savedActionScanV46)return;','var savedActionsObserverV147=new MutationObserver(function(records){if(!('+filter+')(records))return;if(savedActionScanV46)return;');
 rep('var disclosureScanPending=false;new MutationObserver(function(){if(disclosureScanPending)return;','var disclosureScanPending=false;new MutationObserver(function(records){if(!('+filter+')(records))return;if(disclosureScanPending)return;');
 return html;
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-measure-pin-observers-v264.mjs')){const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));}
