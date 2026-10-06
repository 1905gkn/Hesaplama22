import fs from 'node:fs';
import {frameHeights,installEndFrames} from './end-frames-v274.mjs';
export function transform(html){
 if(html.includes('data-end-frames="v274"'))return html;
 const rep=(a,b)=>{if(!html.includes(a))throw Error('End frames anchor missing: '+a.slice(0,100));html=html.replace(a,b);};
 const field='<label class="b2b-field">Ayak yüksekliği';const a=html.indexOf(field),b=html.indexOf('</label>',a)+8;if(a<0||b<8)throw Error('Height field missing');
 html=html.slice(0,b)+`<div class="b2b-field"><div class="b2b-mode-row"><button type="button" id="b2bEndFrameToggle" aria-pressed="false" onclick="rafexToggleEndFrames()">Yan rafların özel ölçüsü</button><input id="b2bEndFrameHeight" type="number" aria-label="Yan raf ayak yüksekliği (mm)" aria-describedby="b2bEndFrameHint" min="500" max="30000" step="1" hidden disabled oninput="rafexEditEndFrames(false)" onchange="rafexEditEndFrames(true)"></div><small id="b2bEndFrameHint" aria-live="polite"></small></div>`+html.slice(b);
 rep('return { floorPitchEnabled:', 'return { ...window.rafexReadEndFrameState(), floorPitchEnabled:');
 rep('footHeight: vertical.footHeight,','footHeight: vertical.footHeight,endFrameHeight:window.rafexReadEndFrameState().endFrameHeight,');
 rep('function b2bApplySavedInputState(state) {','function b2bApplySavedInputState(state) { window.rafexRestoreEndFrameState(state);');
 rep('return finalizeDetail(o,d.b2b||{})}', 'o=finalizeDetail(o,d.b2b||{});return window.rafexEndFrameOptions?window.rafexEndFrameOptions(d,o):o}');
 rep('return normalizeRackPreviewV233(storedV135,d);','return window.rafexEndFrameOptions?window.rafexEndFrameOptions(d,normalizeRackPreviewV233(storedV135,d)):normalizeRackPreviewV233(storedV135,d);');
 rep("const stored=window.rafexReadRackDetailV135?.(rack,'b2b');if(stored)return stored;","const stored=window.rafexReadRackDetailV135?.(rack,'b2b');if(stored)return window.rafexEndFrameOptions?window.rafexEndFrameOptions(rack,stored):stored;");
 rep('  }return out;',`  }
  for(const r of racks){const slots=out.get(Number(r.id));if(!slots||!r.b2b?.endFrameHeightEnabled)continue;for(const slot of slots){if(slot.shared)continue;slot.product.height=Math.max(slot.product.height,Number(r.b2b.endFrameHeight)||0);slot.product.code=slot.product.family+String(slot.product.height).padStart(5,'0')+slot.product.depth+String(Math.round(slot.product.thickness*100));}}
  return out;`);
 const start=html.indexOf('  function renderSharedFeet(state,svg){'),end=html.indexOf('  function decorate(){',start);if(start<0||end<start)throw Error('Foot layer missing');
 html=html.slice(0,start)+`  function renderSharedFeet(state,svg){
    // Rebuild from the current physical profiles after every layout render.
    // Later rack fills must never cover an earlier rack's shared frame.
    svg.querySelectorAll(':scope > .rafex-shared-foot-layer-v60').forEach(n=>n.remove());
    const layer=document.createElementNS('http://www.w3.org/2000/svg','g');layer.setAttribute('class','rafex-shared-foot-layer-v60');layer.setAttribute('pointer-events','none');
    svg.querySelectorAll('[data-rack]').forEach(group=>{
      const profiles=group.querySelectorAll('.m2-b2b-plan-upright:not(.rafex-profile-merge-source-v61)');if(!profiles.length)return;
      const holder=document.createElementNS('http://www.w3.org/2000/svg','g');holder.setAttribute('data-shared-foot',group.getAttribute('data-rack'));const tr=group.getAttribute('transform');if(tr)holder.setAttribute('transform',tr);
      profiles.forEach(source=>{const clone=source.cloneNode(true);clone.removeAttribute('id');clone.classList.add('rafex-shared-upright-v60');clone.style.setProperty('opacity','1','important');holder.appendChild(clone);});layer.appendChild(holder);
    });
    if(layer.children.length)svg.appendChild(layer);
  }
`+html.slice(end);
 const at=html.lastIndexOf('</body>');return html.slice(0,at)+'<style data-end-frames="v274">#b2bEndFrameToggle{font-size:10px;padding:8px}#b2bEndFrameToggle[aria-pressed="true"]{background:#76182a;color:#fff}#b2bEndFrameHeight[hidden]{display:none!important}#b2bEndFrameHeight[aria-invalid="true"]{border-color:#b42318}#b2bEndFrameHint{font-size:10px}</style><script>'+frameHeights.toString()+'\n('+installEndFrames.toString()+')();</script>'+html.slice(at);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-end-frames-v274.mjs')){const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));}
