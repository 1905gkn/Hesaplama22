// Retain camera damping but avoid redrawing an unchanged, shadowed scene.
export function renderKonsolFrame(viewer) {
  if (!viewer.renderVisibility) {
    const state=viewer.renderVisibility={visible:true};
    const resume=()=>{if(!viewer.destroyed&&state.visible&&!document.hidden&&viewer.raf==null)viewer.raf=requestAnimationFrame(()=>viewer.loop());};
    state.observer=new IntersectionObserver(entries=>{state.visible=entries.some(e=>e.isIntersecting);resume();});
    state.observer.observe(viewer.canvas);
    document.addEventListener('visibilitychange',resume);
    state.dispose=()=>{state.observer.disconnect();document.removeEventListener('visibilitychange',resume);};
  }
  if(!viewer.renderVisibility.visible||document.hidden)return false;
  viewer.controls.update();
  const c=viewer.camera;
  const key=[c.position.x,c.position.y,c.position.z,c.quaternion.x,c.quaternion.y,c.quaternion.z,c.quaternion.w,c.zoom,c.fov,c.aspect].join(',');
  if(viewer.renderDirty||viewer.renderCameraKey!==key){
    viewer.renderer.render(viewer.scene,c);
    viewer.renderCameraKey=key;viewer.renderDirty=false;
  }
  return true;
}
