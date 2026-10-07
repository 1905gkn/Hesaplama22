import fs from 'node:fs';
export function transform(html){
 if(html.includes('section-right-drag-v291'))return html;
 const start=html.indexOf('    const stage = modal.querySelector(\'[data-rafex-placement-stage="perspective"]\');'),end=html.indexOf('    modal.addEventListener("pointerdown"',start);
 if(start<0||end<0)throw Error('Missing section pointer controls');
 let block=html.slice(start,end);
 block=block.replace('    let drag = null;',`    /* section-right-drag-v291 */
    let drag = null, rotationTimer = 0;
    const queueRotation = () => {if(!rotationTimer)rotationTimer=setTimeout(()=>{rotationTimer=0;schedulePreview(false,0);},90);};
    stage?.addEventListener('contextmenu',event=>event.preventDefault());`)
 .replace('event.button !== 0 || !activeKey','(event.button !== 0 && event.button !== 2) || !activeKey')
 .replace('x: value.x, y: value.y };','x: value.x, y: value.y, rotate:event.button===2, azimuth:value.azimuth, elevation:value.elevation };')
 .replace('      value.x = clamp(drag.x',`      if(drag.rotate){
        value.azimuth=clamp(drag.azimuth+(event.clientX-drag.startX)*.4,-180,180);
        value.elevation=clamp(drag.elevation-(event.clientY-drag.startY)*.3,-35,75);
        updateArtwork();queueRotation();return;
      }
      value.x = clamp(drag.x`)
 .replace('drag = null; stage?.classList.remove("is-dragging");','const rotating=drag.rotate;drag = null; stage?.classList.remove("is-dragging");if(stage?.hasPointerCapture?.(event.pointerId))stage.releasePointerCapture(event.pointerId);if(rotating){clearTimeout(rotationTimer);rotationTimer=0;schedulePreview(false,0);}')
 .replace('    stage?.addEventListener("pointercancel", finish);','    stage?.addEventListener("pointercancel", finish);\n    stage?.addEventListener("lostpointercapture", finish);');
 return html.slice(0,start)+block+html.slice(end).replace('<span>Sürükle · Tekerlek</span>','<span>Sol tuş: taşı · Sağ tuş: döndür · Tekerlek: yakınlaştır</span>');
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-section-right-drag-v291.mjs')){
 const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}
