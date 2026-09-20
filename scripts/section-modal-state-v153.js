(function(){
  // The placement editor is appended directly to body. Observe its visibility,
  // not every product/guide insertion in the drawing below the page.
  let modal=null;
  function sync(){
    const open=!!(modal?.isConnected&&!modal.hasAttribute('hidden'));
    if(document.body.classList.contains('rafex-section-placement-open-v153')!==open)document.body.classList.toggle('rafex-section-placement-open-v153',open);
  }
  const visibility=new MutationObserver(sync);
  function bind(){
    const next=document.getElementById('m2SectionPlacementModal');
    if(next!==modal){visibility.disconnect();modal=next;if(modal)visibility.observe(modal,{attributes:true,attributeFilter:['hidden']});}
    sync();
  }
  new MutationObserver(bind).observe(document.body,{childList:true});
  bind();
})();
