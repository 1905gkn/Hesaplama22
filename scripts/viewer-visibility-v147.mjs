// Keep the scene and camera intact; only its automatic animation pauses.
export function viewerVisibleV147(viewer) {
  if (!viewer.visibilityV147) {
    const state = viewer.visibilityV147 = { visible: true };
    const resume = () => {
      if (!viewer.destroyed && state.visible && !document.hidden && viewer.animationFrame == null)
        viewer.animationFrame = requestAnimationFrame(viewer.animate);
    };
    state.observer = new IntersectionObserver(entries => {
      state.visible = entries.some(entry => entry.isIntersecting);
      resume();
    });
    state.observer.observe(viewer.canvas);
    document.addEventListener('visibilitychange', resume);
    state.dispose = () => {
      state.observer.disconnect();
      document.removeEventListener('visibilitychange', resume);
    };
  }
  return viewer.visibilityV147.visible && !document.hidden;
}
