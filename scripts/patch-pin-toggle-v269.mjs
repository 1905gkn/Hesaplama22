import fs from 'node:fs';
export function transform(h){
 if(h.includes('/* pin-toggle-v269 */'))return h;
 const r=(a,b)=>{if(h.split(a).length!==2)throw Error('Missing unique anchor '+a);h=h.replace(a,b);};
 r('let m2PendingMeasurePinV264=null;','/* pin-toggle-v269 */\n      let m2PendingMeasurePinV264=null,m2MeasurePinStateV269=false;');
 r('function m2PinMeasureV264(){const pin=m2PendingMeasurePinV264;if(!pin)return;m2CancelMeasureEdit();pin();}',`function m2PaintMeasurePinV269(){const b=$('m2MeasurePinV264');if(b){b.setAttribute('aria-pressed',String(m2MeasurePinStateV269));b.innerHTML='<span style="margin-right:12px;font-weight:700">'+(m2MeasurePinStateV269?'Açık':'Kapalı')+'</span><span>Çizimde kalsın</span>';}}
      function m2PinMeasureV264(){if(!m2PendingMeasurePinV264)return;m2MeasurePinStateV269=!m2MeasurePinStateV269;m2PaintMeasurePinV269();}`);
 r('function m2OpenMeasureEditor(title, currentMm, apply, pin=null) {','function m2OpenMeasureEditor(title, currentMm, apply, pin=null, pinned=false) {');
 r('m2PendingMeasurePinV264=pin;','m2PendingMeasurePinV264=pin;m2MeasurePinStateV269=!!pinned;m2PaintMeasurePinV269();');
 r('const apply = m2PendingMeasureApply; m2CancelMeasureEdit(); if (apply) apply(value);','const apply=m2PendingMeasureApply,pin=m2PendingMeasurePinV264,pinned=m2MeasurePinStateV269;m2CancelMeasureEdit();if(apply)apply(value);if(pin)pin(pinned);');
 r('()=>m2TogglePinnedDimension(direction,true));','visible=>m2TogglePinnedDimension(direction,visible),!!m2PinnedForRack(rackId)[direction]);');
 r("function(){window.rafexToggleRackPairGap(aId,bId,true);status('Ölçü çizimde sabitlendi. RAF / DUVAR UZAKLIKLARI bölümündeki işareti kaldırarak gizleyebilirsin.');});","function(visible){window.rafexToggleRackPairGap(aId,bId,visible);},pinnedPairGaps.has(Math.min(Number(aId),Number(bId))+':'+Math.max(Number(aId),Number(bId))));");
 return h;
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-pin-toggle-v269.mjs')){const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));}
