import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* variant-label-spacing-v306 */'))return html;
 const runtime=`<script>/* variant-label-spacing-v306 */
 (function(){
  const ns='http://www.w3.org/2000/svg',originals=new WeakMap();let scheduled=false;
  const set=(n,k,v)=>{v=String(v);if(n.getAttribute(k)!==v)n.setAttribute(k,v);};
  function paint(){
   const byId=new Map((m2LayoutState?.racks||[]).map(r=>[String(r.id),r]));
   document.querySelectorAll('#m2LayoutSvg [data-rack],.rafex-drag-scene-v248 [data-rack]').forEach(group=>{
    const rack=byId.get(group.getAttribute('data-rack')),mark=group.querySelector('.rafex-rack-label-v160'),name=mark?.querySelector('text');if(!rack||!mark||!name)return;
    const detail=m2PalletVariantLabelV305(rack);group.querySelectorAll('.rafex-tunnel-label-v255').forEach(n=>{if(n.style.getPropertyValue('display')!=='none')n.style.setProperty('display','none','important');});
    let node=mark.querySelector('[data-variant-detail-v306]');if(!detail){node?.remove();const saved=originals.get(name);if(saved){for(const [k,v] of Object.entries(saved))v==null?name.removeAttribute(k):set(name,k,v);originals.delete(name);}return;}
    if(!originals.has(name))originals.set(name,Object.fromEntries(['x','y','font-size','dominant-baseline'].map(k=>[k,name.getAttribute(k)])));
    const frame=group.querySelector(':scope > .m2-layout-rack'),read=(k,v)=>Number(frame?.getAttribute(k)??v),x=read('x',rack.x)+read('width',rack.w)/2,y=read('y',rack.y)+read('height',rack.h)/2;
    const matrix=group.getScreenCTM(),scale=Math.hypot(matrix?.a||1,matrix?.b||0)||1,ratio=Math.max(.1,Math.min(2,Number(window.rafexCommonTypeLetterScaleV65?.())||1));
    const width=rack.w*scale*.82,height=rack.h*scale*.82;
    const main=Math.min(12*ratio,height*.32,width/Math.max(.65,name.textContent.length*.65)),small=Math.min(8*ratio,main*.7,width/Math.max(.65,detail.length*.65));
    const gap=(main+small)*.7+Math.min(3*ratio,height*.1),top=y-gap/2/scale,bottom=y+gap/2/scale;
    for(const [k,v] of Object.entries({x,y:top,'dominant-baseline':'central','font-size':main/scale}))set(name,k,v);
    if(!node){node=document.createElementNS(ns,'text');node.dataset.variantDetailV306='1';mark.append(node);}
    if(node.textContent!==detail)node.textContent=detail;
    for(const [k,v] of Object.entries({x,y:bottom,'text-anchor':'middle','dominant-baseline':'central','font-family':'Arial, sans-serif','font-size':small/scale,'font-weight':600,fill:name.getAttribute('fill')||'#c60000',stroke:'none','paint-order':'normal','letter-spacing':0}))set(node,k,v);
   });
  }
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;paint();});}
  const render=m2RenderLayout;m2RenderLayout=function(){const result=render.apply(this,arguments);schedule();return result;};
  new MutationObserver(records=>{if(records.some(r=>r.target.closest?.('#m2LayoutSvg,.rafex-drag-scene-v248')||[...r.addedNodes].some(n=>n.nodeType===1&&(n.matches?.('#m2LayoutSvg,.rafex-drag-scene-v248')||n.querySelector?.('#m2LayoutSvg,.rafex-drag-scene-v248')))))schedule();}).observe(document.getElementById('page')||document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['transform','viewBox','data-signature']});
  window.addEventListener('resize',schedule);window.rafexVariantLabelSpacingV306={paint,schedule};schedule();
 })();</script>`;
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('Missing body end');return html.slice(0,end)+runtime+'\n'+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-variant-label-spacing-v306.mjs')){
 const file=process.argv[2]||'dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}