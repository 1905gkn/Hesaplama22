import fs from 'node:fs';

export function transform(html){
 if(html.includes('/* RAFEX_WALL_FIT_V138 */'))return html;
 const marker='<script data-rafex-common-layout-zoom-crisp="v126">',start=html.indexOf(marker),end=html.indexOf('</script>',start);
 if(start<0||end<0)throw Error('v138 zoom runtime missing');
 let runtime=html.slice(start,end);
 function replace(a,b){if(!runtime.includes(a)||runtime.indexOf(a)!==runtime.lastIndexOf(a))throw Error('v138 anchor missing/ambiguous: '+a.slice(0,80));runtime=runtime.replace(a,b);}
 const clampStart=runtime.indexOf('  function clamp(next){'),clampEnd=runtime.indexOf('  function expectedViewBox()',clampStart);
 if(clampStart<0||clampEnd<0)throw Error('v138 view bounds missing');
 runtime=runtime.slice(0,clampStart)+`  /* RAFEX_WALL_FIT_V138 */
  var boundsKey='',observedNode=null;
  function frameBounds(){
    var s=state(),common=document.querySelector('#nav button.active[data-page]')?.dataset.page==='free';
    var points=s?.points;
    if(!common||!s?.closed||s.areaEditMode||!Array.isArray(points)||points.length<3)return{x:0,y:0,w:BASE_W,h:BASE_H};
    var left=Infinity,top=Infinity,right=-Infinity,bottom=-Infinity;
    for(var p of points){if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))continue;left=Math.min(left,p.x);right=Math.max(right,p.x);top=Math.min(top,p.y);bottom=Math.max(bottom,p.y);}
    if(!(right>left&&bottom>top))return{x:0,y:0,w:BASE_W,h:BASE_H};
    // Keep a small border for wall dimensions; never alter world coordinates.
    var pad=36;
    return{x:left-pad,y:top-pad,w:right-left+pad*2,h:bottom-top+pad*2};
  }
  function syncBounds(){var b=frameBounds(),key=[b.x,b.y,b.w,b.h].join('|');if(key!==boundsKey){boundsKey=key;view={...b};}return b;}
  function clamp(next){
    var b=frameBounds(),aspect=b.w/b.h,w=Math.max(Math.min(MIN_W,b.w),Math.min(b.w,Number(next.w)||b.w)),h=w/aspect;
    return{x:Math.max(b.x,Math.min(b.x+b.w-w,Number(next.x)||0)),y:Math.max(b.y,Math.min(b.y+b.h-h,Number(next.y)||0)),w:w,h:h};
  }
  function zoomValue(){return frameBounds().w/Math.max(1,view.w)}
`+runtime.slice(clampEnd);
 replace('var node=svg();if(!node)return false;view=clamp(view);','var node=svg();if(!node)return false;syncBounds();view=clamp(view);');
 replace('node.style.width="100%";node.style.height="auto";node.style.maxWidth="none";node.style.margin="0";', 'node.style.width="100%";node.style.height="auto";node.style.maxWidth="none";node.style.margin="0";node.style.aspectRatio=view.w+" / "+view.h;');
 replace('var before=anchor||selectedCenter()||{x:view.x+view.w/2,y:view.y+view.h/2},nw=Math.max(MIN_W,Math.min(BASE_W,view.w*factor)),nh=nw*BASE_H/BASE_W,rx=(before.x-view.x)/view.w,ry=(before.y-view.y)/view.h;', 'var b=syncBounds(),before=anchor||selectedCenter()||{x:view.x+view.w/2,y:view.y+view.h/2},nw=Math.max(Math.min(MIN_W,b.w),Math.min(b.w,view.w*factor)),nh=nw*b.h/b.w,rx=(before.x-view.x)/view.w,ry=(before.y-view.y)/view.h;');
 replace('function fitAll(){view={x:0,y:0,w:BASE_W,h:BASE_H};apply();return true}', 'function fitAll(){view={...syncBounds()};apply();return true}');
 replace('aspect=BASE_W/BASE_H,w=Math.max(MIN_W,(right-left)*3.2,120)', 'aspect=frameBounds().w/frameBounds().h,w=Math.max(MIN_W,(right-left)*3.2,120)');
 replace('if(w>BASE_W){w=BASE_W;h=BASE_H}if(h>BASE_H){h=BASE_H;w=BASE_W}', 'var b=frameBounds();if(w>b.w||h>b.h){w=b.w;h=b.h}');
 replace('if(!observer){observer=new MutationObserver(function(records){if(applying||zoomValue()<=1.001)return;', 'if(observedNode!==node){observer?.disconnect();observedNode=node;observer=new MutationObserver(function(records){if(applying)return;');
 return html.slice(0,start)+runtime+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-common-wall-fit-v138.mjs')){
 const file='dist/server/index.js',source=fs.readFileSync(file,'utf8'),m=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
 if(!m)throw Error('v138 HTML_BASE64 missing');
 const html=transform(Buffer.from(m[2],'base64').toString('utf8'));
 fs.writeFileSync(file,source.replace(m[0],m[0].replace(m[2],Buffer.from(html).toString('base64'))));
 console.log('v138: common viewport fits wall bounds without changing physical geometry');
}
