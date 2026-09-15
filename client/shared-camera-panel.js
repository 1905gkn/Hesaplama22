(function(){
  const viewers=new WeakMap();
  function wrap(name){
    const api=window[name];if(!api?.mount||api.mount.rafexCameraPanel)return;
    const mount=api.mount;
    api.mount=function(canvas,...args){const viewer=mount.call(this,canvas,...args);viewers.set(canvas,viewer);install(canvas);return viewer;};
    api.mount.rafexCameraPanel=true;
  }
  function install(canvas){
    if(!['mrCanvas','konsolCanvas'].includes(canvas?.id))return;
    const host=canvas.parentElement;if(!host||host.querySelector('[data-shared-camera]'))return;
    host.style.position='relative';
    const panel=document.createElement('div');panel.className='b2b-camera-controller';panel.dataset.sharedCamera='1';
    panel.innerHTML='<div class="b2b-camera-head"><b>KAMERA</b><button class="b2b-rotate-toggle" type="button" data-camera="rotate" aria-pressed="false">DÖNÜŞ KAPALI</button></div><div class="b2b-camera-presets"><button type="button" data-camera="0">ÖN</button><button type="button" data-camera="90">SAĞ</button><button type="button" data-camera="180">ARKA</button><button type="button" data-camera="-90">SOL</button></div><div class="b2b-camera-zoom"><button type="button" data-camera="in">＋ YAKLAŞ</button><button type="button" data-camera="fit">SIĞDIR</button><button type="button" data-camera="out">－ UZAKLAŞ</button></div>';
    panel.onclick=event=>{
      const button=event.target.closest('[data-camera]'),viewer=viewers.get(canvas);
      if(!button||!viewer||viewer.destroyed)return;
      const action=button.dataset.camera,controls=viewer.controls,camera=viewer.camera;
      if(action==='rotate'){
        controls.autoRotate=!controls.autoRotate;controls.autoRotateSpeed=.75;
        button.setAttribute('aria-pressed',String(controls.autoRotate));button.textContent=controls.autoRotate?'DÖNÜŞ AÇIK':'DÖNÜŞ KAPALI';
      }else if(action==='fit')viewer.setView('perspective');
      else if(action==='in'||action==='out'){
        const offset=camera.position.clone().sub(controls.target),distance=offset.length();
        const next=Math.max(controls.minDistance||1,Math.min(controls.maxDistance||Infinity,distance*(action==='in'?.82:1.22)));
        camera.position.copy(controls.target).add(offset.multiplyScalar(next/Math.max(distance,1)));
      }else{
        const angle=Number(action)*Math.PI/180,elevation=(action==='0'?28:20)*Math.PI/180;
        const radius=Math.max(camera.position.distanceTo(controls.target),1),target=controls.target;
        camera.position.set(target.x+radius*Math.cos(elevation)*Math.sin(angle),target.y+radius*Math.sin(elevation),target.z+radius*Math.cos(elevation)*Math.cos(angle));
      }
      controls.update();camera.updateProjectionMatrix();event.stopPropagation();
    };
    host.appendChild(panel);
  }
  wrap('RafexMRViewer');wrap('RafexKonsolViewer');
  window.addEventListener('rafex-mr-viewer-ready',()=>wrap('RafexMRViewer'));
  window.addEventListener('rafex-konsol-viewer-ready',()=>wrap('RafexKonsolViewer'));
})();
