import fs from 'node:fs';

function installDimensionDrag(){
  const ns='http://www.w3.org/2000/svg';
  let drag=null,frame=0,observerFrame=0,observer=null,observed=null;
  const make=(tag,attrs)=>{const el=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,v);return el;};
  function refresh(){
    const svg=document.getElementById('m2LayoutSvg');if(!svg)return;
    if(observed!==svg){observer?.disconnect();observed=svg;observer=new MutationObserver(()=>{if(!observerFrame)observerFrame=requestAnimationFrame(()=>{observerFrame=0;refresh();});});observer.observe(svg,{childList:true,subtree:true});}
    for(const group of svg.querySelectorAll('.m2-wall-guide,.m2-distance-guide,[data-between-overlay],.m2-free-measure')){
      const label=group.querySelector('[data-dimension-key]');if(!label)continue;
      const key=label.dataset.dimensionKey;group.dataset.dimensionKey=key;
      let lines=group.querySelector(':scope > [data-dimension-lines]');
      if(!lines){
        const geometry=Array.from(group.children).filter(n=>['line','circle','path'].includes(n.localName));
        const main=geometry.find(n=>n.localName==='line');if(!main)continue;
        lines=make('g',{'data-dimension-lines':'1'});group.insertBefore(lines,group.firstChild);
        geometry.forEach(n=>lines.appendChild(n));
        const coords={x1:main.getAttribute('x1'),y1:main.getAttribute('y1'),x2:main.getAttribute('x2'),y2:main.getAttribute('y2')};
        lines.appendChild(make('line',{...coords,class:'rafex-dimension-hit',stroke:'transparent','stroke-width':16,'vector-effect':'non-scaling-stroke'}));
        for(const i of [1,2])group.insertBefore(make('line',{x1:coords['x'+i],y1:coords['y'+i],x2:coords['x'+i],y2:coords['y'+i],class:'rafex-dimension-witness',stroke:main.getAttribute('stroke')||'#bc8500','stroke-width':1,'data-anchor-x':coords['x'+i],'data-anchor-y':coords['y'+i]}),lines);
      }
      const offset=m2DimensionOffsets[key]||{},x=Number(offset.x)||0,y=Number(offset.y)||0;
      lines.setAttribute('transform',`translate(${x} ${y})`);
      for(const witness of group.querySelectorAll(':scope > .rafex-dimension-witness')){
        witness.setAttribute('x2',Number(witness.dataset.anchorX)+x);witness.setAttribute('y2',Number(witness.dataset.anchorY)+y);
        witness.style.display=x||y?'':'none';
      }
    }
  }
  // Keep labels and their complete dimension geometry in the same SVG coordinates.
  m2DimensionPosition=function(key,x,y){const o=m2DimensionOffsets[key]||{};return{x:x+(Number(o.x)||0),y:y+(Number(o.y)||0)};};
  const render=m2RenderLayout;m2RenderLayout=function(...args){const result=render.apply(this,args);refresh();return result;};
  document.addEventListener('pointerdown',event=>{
    if(m2LayoutTool!=='dimension'||event.button!==0)return;
    const node=event.target.closest?.('[data-dimension-key]'),svg=node?.closest('#m2LayoutSvg');if(!svg)return;
    event.preventDefault();event.stopImmediatePropagation();
    const key=node.dataset.dimensionKey,base=m2DimensionOffsets[key]||{x:0,y:0};
    m2SelectedDimensionKey=key;m2DimensionDrag=null;
    const font=document.getElementById('m2DimensionFontSize');if(font){font.disabled=false;font.value=m2DimensionFontSizes[key]||16;}
    drag={key,base:{...base},start:m2SvgPoint(event),svg,id:event.pointerId,moved:false};
    svg.setPointerCapture?.(event.pointerId);
  },true);
  document.addEventListener('pointermove',event=>{
    if(!drag||event.pointerId!==drag.id)return;
    event.preventDefault();event.stopImmediatePropagation();const p=m2SvgPoint(event),dx=p.x-drag.start.x,dy=p.y-drag.start.y;
    if(!drag.moved&&Math.hypot(dx,dy)<1)return;
    if(!drag.moved){m2PushUndo('Ölçü yerini taşı');drag.moved=true;}
    m2DimensionOffsets[drag.key]={x:(Number(drag.base.x)||0)+dx,y:(Number(drag.base.y)||0)+dy};
    if(!frame)frame=requestAnimationFrame(()=>{frame=0;m2RenderLayout();});
  },true);
  function finish(event){if(!drag||event.pointerId!==drag.id)return;event.preventDefault();event.stopImmediatePropagation();const old=drag;drag=null;if(frame){cancelAnimationFrame(frame);frame=0;}old.svg.releasePointerCapture?.(old.id);m2RenderLayout();}
  document.addEventListener('pointerup',finish,true);document.addEventListener('pointercancel',finish,true);
  refresh();
}

export function transform(html){
  if(html.includes('data-rafex-dimension-drag'))return html;
  const payload=`<style data-rafex-dimension-drag>
#m2LayoutSvg .rafex-dimension-hit{pointer-events:none}
#m2LayoutSvg .rafex-dimension-witness{pointer-events:none}
#page #m2LayoutSvg.m2-dimension-editing [data-dimension-key],#page #m2LayoutSvg.m2-dimension-editing .m2-measure-hit[data-dimension-key^="wall:"]{pointer-events:all!important;cursor:move!important}
#page #m2LayoutSvg.m2-dimension-editing .rafex-dimension-hit{pointer-events:stroke!important;cursor:move!important}
</style><script>(${installDimensionDrag.toString()})();</script>`;
  const end=html.lastIndexOf('</body>');if(end<0)throw Error('Missing document body');
  return html.slice(0,end)+payload+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-dimension-drag.mjs')){
  const file='dist/server/index.js',source=fs.readFileSync(file,'utf8'),m=source.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);
  if(!m)throw Error('Missing compiled HTML');
  fs.writeFileSync(file,source.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}
