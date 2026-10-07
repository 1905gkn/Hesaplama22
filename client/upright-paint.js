/* upright-paint-v276 */
(() => {
  const scope = '#m2LayoutSvg,.rafex-drag-scene-v248,#m2ReportFloor,#m2A4PrintSheet,#m2A4PrintArea,#m2CorporatePreview,#m2CorporatePrint,#m2CorporatePrintArea';
  function paint(root = document) {
    root.querySelectorAll(scope).forEach(svg => {
      svg.querySelectorAll('.m2-b2b-plan-upright').forEach(node => {
        const blue = node.classList.contains('rafex-ral5010-upright') || /5010/.test(node.getAttribute('data-upright-finish') || '');
        const color = blue ? '#00679d' : '#aeb8bd';
        // A same-colour screen-space edge prevents subpixel blue faces from
        // fading at different positions. Physical rect geometry stays intact.
        for (const [key, value] of Object.entries({ fill: color, stroke: color, 'stroke-width': '0.8px', 'stroke-opacity': '1', 'fill-opacity': '1', opacity: '1', 'vector-effect': 'non-scaling-stroke', 'stroke-linejoin': 'miter', transform: 'none', filter: 'none', 'shape-rendering': 'geometricPrecision' })) {
          if (node.style.getPropertyValue(key) !== value || node.style.getPropertyPriority(key) !== 'important') node.style.setProperty(key, value, 'important');
        }
      });
    });
  }
  let queued = false;
  const schedule = () => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; paint(); }); };
  const observer = new MutationObserver(records => {
    if (records.some(record => record.target.closest?.(scope) || [...record.addedNodes].some(node => node.nodeType === 1 && (node.matches?.(scope) || node.querySelector?.(scope))))) schedule();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('beforeprint', () => paint());
  window.rafexPaintUprights = paint;
  paint();
})();
