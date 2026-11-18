(()=>{
 let percent=100;try{percent=Math.max(50,Math.min(200,Number(localStorage.getItem('rafexDetailText586'))||100));}catch{}
 const bindings=new WeakMap(),originalImages=new WeakMap();
 function scaledSvg(uri,factor,depth=0){
  if(depth>5||!uri.startsWith('data:image/svg+xml'))return uri;
  const split=uri.indexOf(','),header=uri.slice(0,split),raw=header.includes(';base64')?atob(uri.slice(split+1)):decodeURIComponent(uri.slice(split+1));
  const doc=new DOMParser().parseFromString(raw,'image/svg+xml');if(doc.querySelector('parsererror'))return uri;
  const sizes=[...doc.querySelectorAll('text,tspan')].map(text=>{let owner=text,size;while(owner&&!size){size=parseFloat(owner.style?.fontSize||owner.getAttribute?.('font-size'));owner=owner.parentElement;}return [text,size];});
  for(const [text,size] of sizes)if(size){text.style.fontSize=size*factor+'px';text.setAttribute('font-size',String(size*factor));}
  for(const image of doc.querySelectorAll('image')){const href=image.getAttribute('href')||image.getAttribute('xlink:href');if(href?.startsWith('data:image/svg+xml')){const value=scaledSvg(href,factor,depth+1);if(image.hasAttribute('href'))image.setAttribute('href',value);else image.setAttributeNS('http://www.w3.org/1999/xlink','href',value);}}
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(doc));
 }
 window.rafexScaleDetailImages586=modal=>{for(const image of modal.querySelectorAll('.rsv115-elevations img')){if(!originalImages.has(image))originalImages.set(image,image.src);image.src=scaledSvg(originalImages.get(image),percent/100);}};
 window.rafexInstallDetailText586=modal=>{
  if(modal.querySelector('[data-detail-text586]'))return;
  const bar=document.createElement('div');bar.dataset.detailText586='';bar.className='rafex-detail-text586';
  const label=document.createElement('span');label.textContent='Ölçü yazısı';
  const minus=document.createElement('button'),plus=document.createElement('button'),input=document.createElement('input');
  minus.type=plus.type='button';minus.textContent='−';plus.textContent='+';minus.setAttribute('aria-label','Ölçü yazılarını küçült');plus.setAttribute('aria-label','Ölçü yazılarını büyüt');
  input.type='number';input.min='50';input.max='200';input.step='10';input.value=String(percent);input.setAttribute('aria-label','Ölçü yazısı boyutu yüzde');
  const apply=value=>{percent=Math.max(50,Math.min(200,Number(value)||100));input.value=String(percent);try{localStorage.setItem('rafexDetailText586',String(percent));}catch{}modal.querySelector('canvas')?.dispatchEvent(new Event('rafex-detail-text586'));window.rafexScaleDetailImages586(modal);};
  minus.onclick=()=>apply(percent-10);plus.onclick=()=>apply(percent+10);input.oninput=()=>{if(input.value&&input.validity.valid)apply(input.value);};input.onchange=()=>apply(input.value);
  bar.append(label,minus,input,document.createTextNode('%'),plus);modal.querySelector('.rsv115-head').append(bar);
 };
 window.rafexBindDetailText586=(viewer,modal)=>{
  const renderer=viewer?.renderer;if(!renderer||bindings.has(renderer))return;
  const original=renderer.render;let cached=null;
  const collect=scene=>{const list=[];scene.traverse(node=>{if(node.isSprite)list.push(node);});return list;};
  renderer.render=function(scene,camera,...args){
   const labels=viewer.dimensionLabels||cached||(cached=collect(scene)),saved=[];
   // Scale only sprites during this draw; restore exactly, avoiding accumulated
   // scaling and preserving saved options, camera, geometry and export settings.
   for(const label of labels){saved.push([label,label.scale.x,label.scale.y,label.scale.z]);label.scale.x*=percent/100;label.scale.y*=percent/100;}
   try{return original.call(this,scene,camera,...args);}finally{for(const [label,x,y,z] of saved)label.scale.set(x,y,z);}
  };
  Promise.resolve(viewer.ready).then(()=>{cached=null;}).catch(()=>{});
  const redraw=()=>{viewer.renderDirty=true;if(viewer.scene&&viewer.camera)renderer.render(viewer.scene,viewer.camera);};
  viewer.canvas?.addEventListener('rafex-detail-text586',redraw);bindings.set(renderer,true);redraw();
 };
})();
