export function viewerFrameChanged(viewer) {
  const c=viewer.camera;
  const key=[c.position.x,c.position.y,c.position.z,c.quaternion.x,c.quaternion.y,c.quaternion.z,c.quaternion.w,c.zoom,c.fov,c.aspect,viewer.canvas.width,viewer.canvas.height].join(',');
  if(!viewer.frameDirty&&key===viewer.lastFrameKey)return false;
  viewer.frameDirty=false;viewer.lastFrameKey=key;return true;
}
