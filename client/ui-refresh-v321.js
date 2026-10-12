/* ui-refresh-v321: one observer for structural UI changes; SVG has its own renderer. */
(() => {
  if (window.rafexObserveUIV321) return;
  const subscriptions = new Map();
  let pending = [], frame = 0, painting = false;
  const page = () => document.getElementById('page');
  const common = () => document.querySelector('#nav button.active[data-page]')?.dataset.page === 'free';
  const deferred = () => common() && page()?.dataset.rafexWorkflowScreen !== 'layout' && !window.__rafexManualOutputBuild;
  window.rafexLayoutRenderDeferredV321 = deferred;
  function structural(record) {
    const target = record.target.nodeType === 1 ? record.target : record.target.parentElement;
    return target && !target.closest('svg,canvas,.m2-floor-canvas,.rafex-drag-scene-v248,#m2CorporatePreview,#m2A4Sheet');
  }
  function inScope(record, scope) {
    const target = record.target.nodeType === 1 ? record.target : record.target.parentElement;
    if (scope === 'nav') return !!target?.closest('#nav') || target === document.body || target === document.documentElement;
    if (scope === 'catalog') return !!target?.closest('#m2SavedTypeList') || target === page();
    return !!target?.closest('#page,#nav,#auth') || target === document.body || target === document.documentElement;
  }
  function flush() {
    frame = 0;
    const records = pending; pending = [];
    for (const [callback, scope] of subscriptions) {
      const relevant = records.filter(record => inScope(record, scope));
      if (relevant.length) {
        try { callback(relevant); } catch (error) { console.error('RAFEX UI refresh', error); }
      }
    }
  }
  const observer = new MutationObserver(records => {
    pending.push(...records.filter(structural));
    if (pending.length && !frame) frame = requestAnimationFrame(flush);
  });
  observer.observe(document.body || document.documentElement, {subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class','hidden','lang','data-m2-module','data-rafex-common-active','data-rafex-common-system','data-rafex-free-context-system','data-rafex-workflow-screen']});
  window.rafexObserveUIV321 = (callback, scope = 'page') => {
    subscriptions.set(callback, scope);
    return () => subscriptions.delete(callback);
  };
  function releaseDrawing() {
    const svg = document.getElementById('m2LayoutSvg'), content = document.getElementById('m2LayoutContent');
    if (!svg) return;
    if (svg.dataset.rafexDeferred321 === '1' && !content?.childElementCount && !Array.from(svg.children).some(node=>node.tagName.toLowerCase()==='g'&&node!==content)) return;
    content?.replaceChildren();
    for (const node of Array.from(svg.children)) if (node.tagName.toLowerCase() === 'g' && node !== content) node.remove();
    svg.__sharedFeetV146?.entries?.clear(); delete svg.__sharedFeetV146;
    // Drop DOM references only. Model, geometry, undo and project data stay intact.
    const tables = window.rafexFreeLayoutPerfTables;
    for (const key of ['rackDom','symbolDom','rackAuxDom']) tables?.[key]?.clear();
    window.rafexFreeLayoutRuntimeCache?.domNodes?.clear();
    svg.dataset.rafexDeferred321 = '1';
    window.__rafexLayoutDirtyV321 = true;
  }
  window.rafexSyncLayoutScreenV321 = screen => {
    if (!common() || window.__rafexManualOutputBuild) return;
    if (screen !== 'layout') { releaseDrawing(); return; }
    const svg = document.getElementById('m2LayoutSvg');
    if (!svg || painting || (svg.dataset.rafexDeferred321 !== '1' && !window.__rafexLayoutDirtyV321)) return;
    painting = true;
    try {
      delete svg.dataset.rafexDeferred321;
      window.__rafexLayoutDirtyV321 = false;
      const started = performance.now();
      m2RenderLayout();
      svg.dataset.rafexPaintMs321 = String(Math.round(performance.now() - started));
    } catch (error) { window.__rafexLayoutDirtyV321 = true; throw error; }
    finally { painting = false; }
  };
  // Install after the feature scripts so hidden rendering skips their decorators too.
  // The core guard remains a fallback if a later feature wraps the function again.
  window.rafexInstallLayoutBoundaryV321 = () => {
    const render = m2RenderLayout;
    if (render.rafexDeferred321) return;
    m2RenderLayout = window.m2RenderLayout = function() {
      if (deferred()) { window.__rafexLayoutDirtyV321 = true; releaseDrawing(); return; }
      return render.apply(this,arguments);
    };
    m2RenderLayout.rafexDeferred321 = true;
  };
})();
