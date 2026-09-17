(function(){
  const loads=new Map();
  async function load(system){
    const name=system==='drive'?'drive-in':'mekik-front',api=()=>system==='drive'?window.RafexDriveInViewer:window.rafexMekikFrontGlbV2;
    if(api()?.capture)return api();
    if(!loads.has(name))loads.set(name,new Promise((resolve,reject)=>{
      const script=document.createElement('script');script.src=system==='drive'?'/drive-in-viewer.js':'/mekik-front-viewer.js';script.onload=resolve;script.onerror=()=>reject(Error(name+' çizicisi yüklenemedi'));document.head.append(script);
    }));
    await loads.get(name);if(!api()?.capture)throw Error(name+' çıktı çizicisi bulunamadı');return api();
  }
  function config(d,system){
    const c={bays:Number(d.bays)||1,levels:Number(d.levels)||4,palletWidth:Number(d.palW)||1200,palletDepth:Number(d.palD)||800,palletHeight:Number(d.palletHeight)||1200,firstLevelHeight:Number(d.firstRailHeight??430),levelSpacing:Number(d.levelH)||1580,footType:Number(d.footType)||90,footColor:d.mekikFootColor||'ral5010',traverseColor:d.mekikTraverseColor||'ral1007',traverseHeight:Number(d.mekikTraverseHeight)||50,sideClearance:Number(d.mekikSideClearance??75),depthPallets:Number(d.depth)||5,systemType:d.systemType||'fifo',firstPalletGap:Number(d.firstPalletGap??200),palletGap:Number(d.palletGap??50)};
    c.uprightHeight=c.firstLevelHeight+(c.levels-1)*c.levelSpacing+c.palletHeight/2;c.bayPitch=c.palletWidth+c.sideClearance*2;c.totalWidth=c.bays*c.bayPitch+c.footType;
    return c;
  }
  function standalone(svg,host){
    const props=['fill','fill-opacity','stroke','stroke-width','stroke-dasharray','stroke-opacity','font-family','font-size','font-weight','text-anchor','dominant-baseline','paint-order','opacity'];
    for(const node of [svg,...svg.querySelectorAll('*')]){
      const style=getComputedStyle(node);for(const prop of props)if(style.getPropertyValue(prop))node.style.setProperty(prop,style.getPropertyValue(prop).replace(/url\(["']?[^)"']*#([^)'" ]+)["']?\)/g,'url(#$1)'));
    }
    svg.setAttribute('xmlns','http://www.w3.org/2000/svg');return svg.outerHTML;
  }
  window.rafexCaptureTechnicalViews=async function(d,system){
    d={...(d.rackDetail?.views?.[system]||d.rackDetail?.views?.mekik2||{}),...d};
    d.railLength=Number(d.depthMm||d.railLength);d.totalWidth=Number(d.widthMm||d.totalWidth);
    const api=await load(system),c=config(d,system),host=document.createElement('div');
    host.className='m2-canvas rafex-native-side-capture';host.style.cssText='position:fixed;left:-20000px;top:0;width:1260px;height:760px';document.body.append(host);
    const css=document.createElement('style');css.textContent=Array.from(document.styleSheets).flatMap(sheet=>{try{return Array.from(sheet.cssRules).map(rule=>rule.cssText).filter(text=>text.includes('#m2Side')).map(text=>text.replaceAll('#m2Side','.rafex-native-side-capture'));}catch{return [];}}).join('\n');document.head.append(css);
    try{
      let front=await api.capture(c);
      if(system==='drive'){
        host.innerHTML='<svg class="rafex-drive-dimensions"></svg>';window.rafexDriveDimensions(host,front.config,front.layout);
        const overlay=host.querySelector('svg');standalone(overlay,host);
        front='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1260 760"><image width="1260" height="760" href="'+front.image+'"/>'+overlay.innerHTML+'</svg>';
      }
      host.innerHTML=window.rafexNativeSideSection(d);const side=standalone(host.querySelector('svg'),host);
      const uri=svg=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
      return {front:uri(front),side:uri(side)};
    }finally{host.remove();css.remove();}
  };
  window.rafexApplyTechnicalViews=function(card,views){
    card.classList.add('rafex-perspective-output','rafex-two-native-views');
    card.style.setProperty('grid-template-columns','minmax(0,1fr)','important');
    card.style.setProperty('grid-template-rows','28px minmax(0,1fr) minmax(0,1fr)','important');
    card.querySelectorAll(':scope>.rafex-v19-view').forEach(node=>node.remove());
    for(const [mode,title] of [['front','ÖNDEN GÖRÜNÜŞ'],['side','YAN GÖRÜNÜŞ']]){
      const view=document.createElement('div');view.className='rafex-v19-view';view.dataset.rafexNativeView=mode;
      view.style.setProperty('grid-column','1','important');view.style.setProperty('grid-row',mode==='front'?'2':'3','important');
      const label=document.createElement('div');label.className='rafex-v19-view-title';label.textContent=title;
      const visual=document.createElement('div');visual.className='rafex-v19-visual';const image=new Image();image.src=views[mode];image.alt=title;image.loading='eager';visual.append(image);view.append(label,visual);card.append(view);
    }
  };
})();
