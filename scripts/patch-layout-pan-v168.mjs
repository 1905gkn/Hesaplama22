import fs from 'node:fs';
export const panRuntime=String.raw`
  // layout-pan-v168: change the viewport only; never touch rack coordinates.
  var panEnabledV168=false,panDragV168=null,panFrameV168=null,panClickV168=false;
  function panCursorV168(){
    var node=svg(),button=byId('m2PanV168');
    if(node){node.classList.toggle('rafex-pan-ready-v168',panEnabledV168);node.classList.toggle('rafex-pan-drag-v168',!!panDragV168)}
    if(button){button.classList.toggle('active',panEnabledV168);button.setAttribute('aria-pressed',String(panEnabledV168))}
  }
  function panPaintV168(){panFrameV168=null;apply()}
  function endPanV168(){
    var drag=panDragV168;panDragV168=null;
    if(panFrameV168!==null){cancelAnimationFrame(panFrameV168);panFrameV168=null;apply()}
    if(drag)try{drag.node.releasePointerCapture(drag.id)}catch(_){}
    panCursorV168();
  }
  function setPanV168(value){endPanV168();panEnabledV168=!!value;panCursorV168()}
  function installPanV168(focus){
    var button=byId('m2PanV168');
    if(!button){button=document.createElement('button');button.id='m2PanV168';button.type='button';button.textContent='PAN';button.title='Alanı kaydır · Sağ tuşla da sürükleyebilirsin · Esc ile kapat';button.onclick=function(){setPanV168(!panEnabledV168)};focus.insertAdjacentElement('afterend',button)}
    panCursorV168();
  }
  function stopPanEventV168(event){event.preventDefault();event.stopImmediatePropagation()}
  // pan-wheel-v177: wheel zoom belongs exclusively to active pan navigation.
  window.addEventListener('wheel',function(event){
    var node=svg();if(!node||!node.contains(event.target))return;
    event.stopImmediatePropagation();
    if(!panEnabledV168&&!panDragV168)return;
    event.preventDefault();
    var delta=Number(event.deltaY)||0;if(!delta)return;
    if(event.deltaMode===1)delta*=16;else if(event.deltaMode===2)delta*=node.getBoundingClientRect().height;
    zoomAt(Math.exp(Math.max(-140,Math.min(140,delta))*.00165),point(event));
    if(panDragV168){var matrix=node.getScreenCTM();if(matrix){panDragV168.view=Object.assign({},view);panDragV168.matrix=matrix.inverse();panDragV168.x=event.clientX;panDragV168.y=event.clientY}}
  },{capture:true,passive:false});
  window.addEventListener('pointerdown',function(event){
    panClickV168=false;
    var node=svg();if(!node||!node.contains(event.target)||panDragV168)return;
    if(event.button!==2&&!(panEnabledV168&&event.button===0))return;
    var matrix=node.getScreenCTM();if(!matrix)return;
    var inverse;try{inverse=matrix.inverse()}catch(_){return}
    stopPanEventV168(event);panClickV168=true;
    panDragV168={id:event.pointerId,node:node,x:event.clientX,y:event.clientY,view:Object.assign({},view),matrix:inverse};
    try{node.setPointerCapture(event.pointerId)}catch(_){}
    panCursorV168();
  },true);
  window.addEventListener('pointermove',function(event){
    var drag=panDragV168;if(!drag||drag.id!==event.pointerId)return;
    stopPanEventV168(event);
    if(!drag.node.isConnected||!event.buttons){endPanV168();return}
    var dx=event.clientX-drag.x,dy=event.clientY-drag.y,m=drag.matrix;
    view={x:drag.view.x-dx*m.a-dy*m.c,y:drag.view.y-dx*m.b-dy*m.d,w:drag.view.w,h:drag.view.h};
    if(panFrameV168===null)panFrameV168=requestAnimationFrame(panPaintV168);
  },true);
  ['pointerup','pointercancel','lostpointercapture'].forEach(function(type){window.addEventListener(type,function(event){if(panDragV168&&panDragV168.id===event.pointerId){stopPanEventV168(event);endPanV168()}},true)});
  ['click','auxclick'].forEach(function(type){window.addEventListener(type,function(event){if(panClickV168&&svg()?.contains(event.target)){stopPanEventV168(event);panClickV168=false}},true)});
  window.addEventListener('contextmenu',function(event){if(svg()?.contains(event.target))stopPanEventV168(event)},true);
  window.addEventListener('blur',endPanV168);
  window.addEventListener('keydown',function(event){if(event.key==='Escape'&&(panEnabledV168||panDragV168)){stopPanEventV168(event);setPanV168(false)}},true);
`;
export function transform(html){
 if(html.includes('// layout-pan-v168:'))return html;
 const start=html.indexOf('<script data-rafex-common-layout-zoom-crisp="v126">'),end=html.indexOf('</script>',start);
 if(start<0||end<0)throw Error('v168 viewport runtime missing');
 let runtime=html.slice(start,end);
 const replace=(a,b)=>{if(!runtime.includes(a))throw Error('v168 anchor missing: '+a);runtime=runtime.replace(a,b)};
 replace('return{x:w>b.w?b.x+(b.w-w)/2:Math.max(b.x,Math.min(b.x+b.w-w,Number(next.x)||0)),y:h>b.h?b.y+(b.h-h)/2:Math.max(b.y,Math.min(b.y+b.h-h,Number(next.y)||0)),w:w,h:h};','return{x:Number.isFinite(Number(next.x))?Number(next.x):0,y:Number.isFinite(Number(next.y))?Number(next.y):0,w:w,h:h};');
 replace('  function install(){',panRuntime+'\n  function install(){');
 replace('controls.appendChild(focus)}','controls.appendChild(focus)}\n    installPanV168(focus);');
 html=html.slice(0,start)+runtime+html.slice(end);
 return html.replace('</body>','<style data-layout-pan="v168">#page #m2PanV168{width:auto!important;padding:0 10px!important}#page #m2PanV168.active{background:#174a35!important;color:#fff!important}#m2LayoutSvg.rafex-pan-ready-v168,#m2LayoutSvg.rafex-pan-ready-v168 *{cursor:grab!important}#m2LayoutSvg.rafex-pan-drag-v168,#m2LayoutSvg.rafex-pan-drag-v168 *{cursor:grabbing!important}</style></body>');
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-layout-pan-v168.mjs')){
 const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');
 fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}
