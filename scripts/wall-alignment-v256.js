/* wall-alignment-v256 */
(function(){
 function snap(raw,points,index,tolerance){const start=points[index];if(!start)return{point:raw,guides:[]};let best=null,d=tolerance;
  points.forEach((p,i)=>{if(i===index||Math.hypot(p.x-start.x,p.y-start.y)<1e-8)return;const n=Math.hypot(p.x-raw.x,p.y-raw.y);if(n<=d){d=n;best=p;}});
  if(best)return{point:{x:best.x,y:best.y},guides:[{a:raw,b:best}],endpoint:true};
  const horizontal=Math.abs(raw.x-start.x)>=Math.abs(raw.y-start.y),point=horizontal?{x:raw.x,y:start.y}:{x:start.x,y:raw.y},axis=horizontal?'x':'y';d=tolerance;best=null;
  points.forEach((p,i)=>{if(i===index||Math.hypot(p.x-start.x,p.y-start.y)<1e-8)return;const n=Math.abs(p[axis]-point[axis]);if(n<=d){d=n;best=p;}});
  if(best){point[axis]=best[axis];return{point,guides:[{a:point,b:best}]};}return{point,guides:[]};
 }
 let last=null;const original=m2SnapOrtho;
 m2SnapOrtho=function(point){if(window.rafexAlignmentEnabledV256===false){last=null;return original(point);}const matrix=document.getElementById('m2LayoutSvg')?.getScreenCTM(),zoom=matrix?Math.hypot(matrix.a,matrix.b):1,index=Number.isInteger(m2LayoutState.drawFromIndex)?m2LayoutState.drawFromIndex:m2LayoutState.points.length-1;const refs=m2LayoutState.racks.flatMap(r=>{const b=m2RackBounds(r);return[{x:b.left,y:b.top},{x:b.right,y:b.top},{x:b.left,y:b.bottom},{x:b.right,y:b.bottom}];});last=snap(point,[...m2LayoutState.points,...refs],index,8/Math.max(.001,zoom));return last.point;};
 function paint(){const svg=document.getElementById('m2LayoutSvg');svg?.querySelector('[data-wall-alignment-v256]')?.remove();if(!svg||window.rafexAlignmentEnabledV256===false||m2LayoutState.mode!=='draw'||!m2LayoutState.hover||!last?.guides.length)return;const ns='http://www.w3.org/2000/svg',g=document.createElementNS(ns,'g');g.setAttribute('data-wall-alignment-v256','');g.setAttribute('pointer-events','none');for(const guide of last.guides){const l=document.createElementNS(ns,'line');for(const[k,v]of Object.entries({x1:guide.a.x,y1:guide.a.y,x2:guide.b.x,y2:guide.b.y,stroke:'#1687e8','stroke-width':1.5,'stroke-dasharray':'6 4','vector-effect':'non-scaling-stroke'}))l.setAttribute(k,v);g.append(l);}const c=document.createElementNS(ns,'circle'),m=svg.getScreenCTM(),z=Math.hypot(m.a,m.b);for(const[k,v]of Object.entries({cx:last.point.x,cy:last.point.y,r:5/z,fill:'white',stroke:'#1687e8','stroke-width':2,'vector-effect':'non-scaling-stroke'}))c.setAttribute(k,v);g.append(c);svg.append(g);}
 const render=m2RenderLayout;m2RenderLayout=window.m2RenderLayout=function(){const result=render.apply(this,arguments);paint();return result;};window.rafexWallAlignmentV256={snap};
})();
