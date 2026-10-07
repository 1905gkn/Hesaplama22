/* pdf-plan-clean-v279 */
(() => {
  const scopes='#m2LayoutSvg,.rafex-drag-scene-v248,#m2ReportFloor,#m2CorporatePreview,#m2CorporatePrint,#m2CorporatePrintArea,#m2A4PrintSheet,#m2A4PrintArea';
  function set(node,key,value){if(node.style.getPropertyValue(key)!==value||node.style.getPropertyPriority(key)!=='important')node.style.setProperty(key,value,'important');}
  function clean(root,pdf=false){
    if(!root?.querySelectorAll)return root;
    root.querySelectorAll('.rafex-rack-label-v160 text').forEach(node=>{
      set(node,'stroke','none');set(node,'stroke-width','0');set(node,'paint-order','normal');set(node,'filter','none');set(node,'opacity','1');set(node,'font-weight','700');
    });
    root.querySelectorAll('[data-rack-gap] .m2-rack-distance-label').forEach(node=>{
      const text=node.textContent.replace(/^\s*RAF ARASI\s*/i,'');if(text!==node.textContent)node.textContent=text;
      set(node,'font-size','12px');set(node,'stroke','none');set(node,'stroke-width','0');set(node,'filter','none');set(node,'font-weight','700');
    });
    if(pdf){
      // SVG filters can force Chromium's PDF printer to rasterize a layer.
      // Keep the plan as paths, rects and text without those effects.
      [root,...root.querySelectorAll('*')].forEach(node=>{if(!node.style)return;set(node,'filter','none');node.removeAttribute('filter');});
      root.querySelectorAll('.m2-b2b-plan-pallet-line').forEach(node=>node.remove());
    }
    return root;
  }
  const clone=rafexPdfLayoutCloneV140;
  rafexPdfLayoutCloneV140=function(){return clean(clone.apply(this,arguments),true);};
  function paint(){document.querySelectorAll(scopes).forEach(node=>clean(node,node.id!=='m2LayoutSvg'&&!node.classList.contains('rafex-drag-scene-v248')));}
  let pending=false;const schedule=()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;paint();});};
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
  window.addEventListener('beforeprint',paint);
  window.rafexCleanPdfPlan={clean,paint};paint();
})();
