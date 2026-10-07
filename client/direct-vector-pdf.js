/* direct-vector-pdf-v283 */
(()=>{
 let loading,busy=false;
 function script(name){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='/pdf-export/'+name;s.onload=resolve;s.onerror=()=>{s.remove();reject(Error('PDF modülü yüklenemedi. Tekrar deneyin.'));};document.head.append(s);});}
 function load(){if(!loading)loading=(async()=>{await script('jspdf.umd.min.js');await Promise.all([script('svg2pdf.umd.min.js'),script('html2canvas.min.js')]);})().catch(e=>{loading=null;throw e;});return loading;}
 const frame=()=>new Promise(resolve=>requestAnimationFrame(()=>resolve()));
 const props=['fill','fill-opacity','fill-rule','stroke','stroke-width','stroke-opacity','stroke-linecap','stroke-linejoin','stroke-dasharray','stroke-dashoffset','opacity','font-size','font-weight','font-style','text-anchor','dominant-baseline','visibility','display','paint-order','clip-path','transform','transform-origin'];
 function freezeSvg(source){
  const copy=source.cloneNode(true),a=[source,...source.querySelectorAll('*')],b=[copy,...copy.querySelectorAll('*')];
  a.forEach((node,i)=>{const style=getComputedStyle(node),dest=b[i];for(const prop of props){const value=style.getPropertyValue(prop);if(value)dest.style.setProperty(prop,value);}dest.style.removeProperty('rx');dest.style.removeProperty('ry');dest.style.setProperty('filter','none');if(node.tagName.toLowerCase()==='text'){dest.style.setProperty('font-family','RafexSans');dest.setAttribute('font-family','RafexSans');}});
  copy.setAttribute('xmlns','http://www.w3.org/2000/svg');copy.removeAttribute('id');return copy;
 }
 async function font(pdf,name,style){const r=await fetch('/pdf-export/'+name);if(!r.ok)throw Error('PDF yazı tipi yüklenemedi');const bytes=new Uint8Array(await r.arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));pdf.addFileToVFS(name,btoa(binary));pdf.addFont(name,'RafexSans',style);}
 async function download(root){
  if(busy)throw Error('PDF zaten hazırlanıyor');busy=true;
  const name=typeof rafexReportProjectNameV282==='function'?rafexReportProjectNameV282(document.getElementById('m2ReportLanguage')?.value||'tr'):'Rafex';
  const manual=window.__rafexManualOutputBuild;window.__rafexManualOutputBuild=true;const keepAlive=setInterval(()=>window.rafexOpenPdfGateV89?.(),5000);
  const status=document.getElementById('m2FloorStatus'),buttons=[...document.querySelectorAll('.m2-pdf-button')],states=buttons.map(b=>b.disabled);
  buttons.forEach(b=>b.disabled=true);
  try{
   await load();await document.fonts.ready;
   const preview=document.getElementById('m2CorporatePreview');root.style.cssText='display:block!important;position:absolute!important;left:-100000px!important;top:0!important;width:'+(preview?.clientWidth||1123)+'px!important';
   const pages=[...root.querySelectorAll(':scope > .m2-corporate-page')];if(!pages.length)throw Error('PDF sayfaları hazır değil.');
   const pdf=new window.jspdf.jsPDF({orientation:'landscape',unit:'pt',format:'a4',compress:true,putOnlyUsedFonts:true});
   await Promise.all([font(pdf,'NotoSans-Regular.ttf','normal'),font(pdf,'NotoSans-Bold.ttf','bold')]);pdf.setFont('RafexSans');
   const width=pdf.internal.pageSize.getWidth(),height=pdf.internal.pageSize.getHeight();
   for(let index=0;index<pages.length;index++){
    if(status)status.textContent='PDF hazırlanıyor · '+(index+1)+' / '+pages.length;await frame();
    const page=pages[index],rect=page.getBoundingClientRect();if(!rect.width||!rect.height)throw Error('PDF sayfası görünür değil');
    const plans=[...page.querySelectorAll('.m2-corporate-floor svg')].map(svg=>{const bounds=svg.getBoundingClientRect();return{svg:freezeSvg(svg),x:(bounds.left-rect.left)*width/rect.width,y:(bounds.top-rect.top)*height/rect.height,w:bounds.width*width/rect.width,h:bounds.height*height/rect.height};});
    const canvas=await window.html2canvas(page,{backgroundColor:'#ffffff',scale:Math.min(4,3508/rect.width),useCORS:true,logging:false,ignoreElements:el=>el.tagName?.toLowerCase()==='svg'&&!!el.closest('.m2-corporate-floor'),onclone:doc=>{doc.documentElement.classList.remove('m2-corporate-printing');doc.body.classList.remove('m2-corporate-printing');const print=doc.getElementById('m2CorporatePrint');if(print){print.style.cssText='display:block!important;position:absolute!important;left:0!important;top:0!important;width:'+root.clientWidth+'px!important';}}});
    if(index)pdf.addPage('a4','landscape');pdf.addImage(canvas,'PNG',0,0,width,height,undefined,'FAST');canvas.width=canvas.height=1;
    for(const plan of plans){const box=plan.svg.viewBox.baseVal;plan.svg.setAttribute('width',String(plan.w));plan.svg.setAttribute('height',String(plan.h));await pdf.svg(plan.svg,{x:plan.x,y:plan.y,width:plan.w,height:plan.h});}
   }
   pdf.setProperties({title:name,subject:'Rafex teknik yerleşim',creator:'Rafex Configurator'});
   pdf.save(name.replace(/[<>:"/\\|?*\x00-\x1f]/g,'_').slice(0,100)+'.pdf');
   if(status)status.textContent='PDF indirildi. Üst görünüm vektör olarak korundu.';
  }finally{clearInterval(keepAlive);window.__rafexManualOutputBuild=manual;busy=false;buttons.forEach((b,i)=>b.disabled=states[i]);}
 }
 window.rafexDownloadPreparedPdfV283=download;
 window.rafexVectorPdfV283={freezeSvg};
})();
