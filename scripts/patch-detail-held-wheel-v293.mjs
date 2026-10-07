import fs from 'node:fs';
export const runtime=`/* detail-held-wheel-v293 */
window.rafexDetailMouseV293=function(viewer,canvas){
 if(!viewer?.controls||!canvas||viewer.__detailMouseV293)return;
 viewer.__detailMouseV293=true;
 const controls=viewer.controls,camera=viewer.camera;
 controls.mouseButtons.RIGHT=0;controls.mouseButtons.LEFT=2;
 let held=false,pointer=null;
 const down=event=>{if(event.button===2){held=true;pointer=event.pointerId;}};
 const up=event=>{if(event.pointerId===pointer&&(event.button===2||event.type==='pointercancel')){held=false;pointer=null;}};
 const reset=()=>{held=false;pointer=null;};
 const move=event=>{if(held&&event.pointerId===pointer&&!(event.buttons&2))reset();};
 const menu=event=>event.preventDefault();
 const wheel=event=>{
  event.preventDefault();event.stopImmediatePropagation();
  if(!held||!controls.enabled||!controls.enableZoom||viewer.destroyed)return;
  const offset=camera.position.clone().sub(controls.target),distance=offset.length();if(!(distance>0))return;
  const next=Math.max(controls.minDistance||.01,Math.min(controls.maxDistance||Infinity,distance*Math.exp(Math.sign(event.deltaY)*.12)));
  camera.position.copy(controls.target).add(offset.multiplyScalar(next/distance));controls.update();viewer.renderDirty=true;
 };
 canvas.addEventListener('pointerdown',down,true);canvas.addEventListener('wheel',wheel,{capture:true,passive:false});canvas.addEventListener('contextmenu',menu);
 window.addEventListener('pointerup',up,true);window.addEventListener('pointercancel',up,true);window.addEventListener('pointermove',move,true);window.addEventListener('blur',reset);
 const destroy=viewer.destroy;viewer.destroy=function(){reset();canvas.removeEventListener('pointerdown',down,true);canvas.removeEventListener('wheel',wheel,true);canvas.removeEventListener('contextmenu',menu);window.removeEventListener('pointerup',up,true);window.removeEventListener('pointercancel',up,true);window.removeEventListener('pointermove',move,true);window.removeEventListener('blur',reset);return destroy?.apply(this,arguments);};
};`;
export function transform(html){
 if(html.includes('detail-held-wheel-v293'))return html;
 const anchor="detailViewer=viewer;viewer?.setView?.('perspective');";
 if(!html.includes(anchor))throw Error('Missing shared rack detail viewer');
 return html.replace(anchor,"detailViewer=viewer;window.rafexDetailMouseV293(viewer,canvas);viewer?.setView?.('perspective');").replace("Mouse ile döndür · tekerlek ile yakınlaştır","Sağ tuş: döndür · sağ tuş basılı + tekerlek: yakınlaştır").replace('</body>','<script>'+runtime+'</script></body>');
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-detail-held-wheel-v293.mjs')){
 const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}
