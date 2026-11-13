// Retain camera damping but avoid redrawing an unchanged, shadowed scene.
export function renderKonsolFrame(viewer) {
  if (!viewer.renderVisibility) {
    const state=viewer.renderVisibility={visible:true};
    const resume=()=>{if(!viewer.destroyed&&state.visible&&!document.hidden&&viewer.raf==null)viewer.raf=requestAnimationFrame(()=>viewer.loop());};
    state.observer=new IntersectionObserver(entries=>{state.visible=entries.some(e=>e.isIntersecting);resume();});
    state.observer.observe(viewer.canvas);
    if(document.documentElement&&typeof MutationObserver!=='undefined'){
      state.languageObserver=new MutationObserver(()=>{if(!viewer.dimensionLanguage){viewer.renderDirty=true;resume();}});
      state.languageObserver.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
    }
    document.addEventListener('visibilitychange',resume);
    state.dispose=()=>{state.observer.disconnect();state.languageObserver?.disconnect();document.removeEventListener('visibilitychange',resume);};
  }
  if(!viewer.renderVisibility.visible||document.hidden)return false;
  viewer.controls.update();
  const c=viewer.camera;
  const key=[c.position.x,c.position.y,c.position.z,c.quaternion.x,c.quaternion.y,c.quaternion.z,c.quaternion.w,c.zoom,c.fov,c.aspect].join(',');
  const language=viewer.dimensionLanguage||document.documentElement?.lang||'tr';
  if(viewer.renderLanguage!==language){viewer.renderDirty=true;viewer.renderLanguage=language;}
  if(viewer.renderDirty||viewer.renderCameraKey!==key){
    viewer.renderer.render(viewer.scene,c);
    viewer.renderCameraKey=key;viewer.renderDirty=false;
  }
  return true;
}
