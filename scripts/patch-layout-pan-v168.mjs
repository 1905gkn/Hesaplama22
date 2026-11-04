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

  // touch-viewport-v1: share the authoritative viewBox with mouse navigation.
  var touchPointsV168=new Map(),touchGestureV168=null,touchSuppressV168=false;
  function touchSnapshotV168(){
    var values=Array.from(touchPointsV168.values()),node=svg(),matrix=node&&node.getScreenCTM();
    if(!values.length||!matrix){touchGestureV168=null;return}
    var a=values[0],b=values[1],cx=b?(a.x+b.x)/2:a.x,cy=b?(a.y+b.y)/2:a.y;
    touchGestureV168={node:node,matrix:matrix.inverse(),view:Object.assign({},view),x:cx,y:cy,d:b?Math.hypot(a.x-b.x,a.y-b.y):0};
  }
  function touchResetV168(){touchPointsV168.clear();touchGestureV168=null;touchSuppressV168=false}
  window.addEventListener('pointerdown',function(event){
    if(event.pointerType!=='touch')return;
    var node=svg();if(!node||!node.contains(event.target))return;
    touchPointsV168.set(event.pointerId,{x:event.clientX,y:event.clientY});
    if(touchPointsV168.size>=2){
      // Finish the native one-finger rack handler before taking over navigation.
      if(!touchGestureV168)node.dispatchEvent(new PointerEvent('pointercancel',{bubbles:true,pointerId:Array.from(touchPointsV168.keys())[0],pointerType:'mouse'}));
      endPanV168();touchSnapshotV168();touchSuppressV168=true;
      stopPanEventV168(event);try{node.setPointerCapture(event.pointerId)}catch(_){}return;
    }
    var s=state(),busy=false;
    try{busy=s?.mode==='draw'||s?.areaEditMode||m2LayoutTool||m2AutoFillDraft||m2MultiSelect.active||m2ProtectionDraft||m2SeismicDraft||m2CustomizeMode||m2CopyMode||m2JoinMode}catch(_){busy=true}
    var object=event.target.closest?.('[data-rack],[data-layout-symbol],[data-dimension-key],[data-user-note],[data-free-measure-point],[data-resume-point]');
    if(!busy&&!object){touchSnapshotV168();touchSuppressV168=true;stopPanEventV168(event);try{node.setPointerCapture(event.pointerId)}catch(_){}}
  },{capture:true,passive:false});
  window.addEventListener('pointermove',function(event){
    if(event.pointerType!=='touch'||!touchPointsV168.has(event.pointerId))return;
    touchPointsV168.set(event.pointerId,{x:event.clientX,y:event.clientY});
    var g=touchGestureV168;if(!g)return;
    stopPanEventV168(event);
    if(!g.node.isConnected){touchResetV168();return}
    var values=Array.from(touchPointsV168.values()),a=values[0],b=values[1],cx=b?(a.x+b.x)/2:a.x,cy=b?(a.y+b.y)/2:a.y;
    var m=g.matrix,ratio=b&&g.d>0?g.d/Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)):1;
    var w=Math.max(MIN_W,Math.min(BASE_W,g.view.w*ratio)),h=w*BASE_H/BASE_W,scale=w/g.view.w;
    var originX=m.a*g.x+m.c*g.y+m.e,originY=m.b*g.x+m.d*g.y+m.f;
    var dx=(cx-g.x)*m.a+(cy-g.y)*m.c,dy=(cx-g.x)*m.b+(cy-g.y)*m.d;
    view={x:originX-(originX-g.view.x+dx)*scale,y:originY-(originY-g.view.y+dy)*scale,w:w,h:h};
    if(panFrameV168===null)panFrameV168=requestAnimationFrame(panPaintV168);
  },{capture:true,passive:false});
  ['pointerup','pointercancel'].forEach(function(type){window.addEventListener(type,function(event){
    if(event.pointerType!=='touch'||!touchPointsV168.has(event.pointerId))return;
    touchPointsV168.delete(event.pointerId);
    if(touchGestureV168){stopPanEventV168(event);if(panFrameV168!==null){cancelAnimationFrame(panFrameV168);panFrameV168=null}apply();touchSnapshotV168()}
    if(!touchPointsV168.size)touchGestureV168=null;
  },{capture:true,passive:false})});
  window.addEventListener('click',function(event){if(touchSuppressV168&&svg()?.contains(event.target)){stopPanEventV168(event);touchSuppressV168=false}},true);
  window.addEventListener('blur',touchResetV168);

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
 html=html.replace(/<script data-rafex-mobile-touch-layout="v1">[\s\S]*?<\/script>/g,'');
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
