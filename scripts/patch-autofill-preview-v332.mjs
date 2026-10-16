import fs from 'node:fs';
export function transform(html){
 if(html.includes('data-autofill-preview="v332"'))return html;
 const from='if (m2AutoFillDraft && !m2LayoutState.drag) { const input=$("m2AutoFillLength"),manualTyping=input&&document.activeElement===input&&input.value;if(!manualTyping){const mrObstacle=m2AutoFillDraft.rafexSystem===\'mr\'&&typeof window.rafexProjectMrObstacleV40===\'function\';m2AutoFillDraft.hover = mrObstacle?window.rafexProjectMrObstacleV40(point):m2ProjectAutoFillPoint(point);m2AutoFillDraft.manualLengthMm=null;const mm=mrObstacle?Math.max(0,Math.round(Number(m2AutoFillDraft.selectedLengthMm)||0)):Math.round(Math.hypot(m2AutoFillDraft.hover.x-m2AutoFillDraft.start.x,m2AutoFillDraft.hover.y-m2AutoFillDraft.start.y)/m2LayoutState.scale);if(input)input.value=String(mm);m2RenderLayout();} }';
 if(html.split(from).length!==2)throw Error('v332 pointer preview anchor mismatch');
 html=html.replace(from,'if (m2AutoFillDraft && !m2LayoutState.drag) { window.rafexQueueAutoFillPreviewV332(point); }');
 const runtime=`<script data-autofill-preview="v332">(()=>{
 const ns='http://www.w3.org/2000/svg';let frame=0,pending=null,previewOnly=false;
 function clear(){if(frame)cancelAnimationFrame(frame);frame=0;pending=null;document.getElementById('rafexAutoFillPreviewV332')?.remove();}
 function paint(){
  const svg=document.getElementById('m2LayoutSvg'),d=m2AutoFillDraft;if(!svg||!d?.hover)return;
  const start=d.start,end=d.hover,mm=d.manualLengthMm??Math.round(Math.hypot(end.x-start.x,end.y-start.y)/m2LayoutState.scale),obstacle=Math.max(0,Math.round(Number(d.obstacleDistanceMm)||0)),name=String(d.obstacleLabel||'DUVARA KALAN');
  const text=d.rafexSystem==='mr'?(d.manualLengthMm!=null?(mm<obstacle?'SEÇİLEN · '+fmt(mm)+' mm · '+name+' '+fmt(obstacle)+' mm':name+' · '+fmt(obstacle)+' mm'):d.pointerClamped?name+' · '+fmt(obstacle)+' mm':'İŞARETLENEN MESAFE · '+fmt(mm)+' mm'):fmt(mm)+' mm';
  let group=document.getElementById('rafexAutoFillPreviewV332');
  if(!group){svg.querySelectorAll('.m2-b2b-auto-guide-preview,.m2-b2b-auto-guide-point,.m2-b2b-auto-guide-label').forEach(n=>n.remove());group=document.createElementNS(ns,'g');group.id='rafexAutoFillPreviewV332';const line=document.createElementNS(ns,'line'),point=document.createElementNS(ns,'circle'),label=document.createElementNS(ns,'text');line.setAttribute('class','m2-b2b-auto-guide-preview');point.setAttribute('class','m2-b2b-auto-guide-point');point.setAttribute('r','6');label.setAttribute('class','m2-b2b-auto-guide-label');label.setAttribute('text-anchor','middle');label.appendChild(document.createTextNode(''));label.addEventListener('pointerdown',e=>e.stopPropagation());label.addEventListener('click',e=>{e.stopPropagation();document.getElementById('m2AutoFillLength')?.focus();});group.append(line,point,label);(document.getElementById('m2LayoutContent')||svg).appendChild(group);}
  const [line,point,label]=group.children;for(const [k,v]of Object.entries({x1:start.x,y1:start.y,x2:end.x,y2:end.y}))line.setAttribute(k,v);point.setAttribute('cx',end.x);point.setAttribute('cy',end.y);label.setAttribute('x',(start.x+end.x)/2);label.setAttribute('y',(start.y+end.y)/2-10);if(label.firstChild.data!==text)label.firstChild.data=text;
 }
 function flush(){if(frame)cancelAnimationFrame(frame);frame=0;const job=pending;pending=null;if(!job||job.draft!==m2AutoFillDraft)return;const d=m2AutoFillDraft,input=document.getElementById('m2AutoFillLength');if(input===document.activeElement&&d.manualLengthMm!=null&&input.value)return;const mr=d.rafexSystem==='mr'&&typeof window.rafexProjectMrObstacleV40==='function';d.hover=mr?window.rafexProjectMrObstacleV40(job.point):m2ProjectAutoFillPoint(job.point);d.manualLengthMm=null;const mm=mr?Math.max(0,Math.round(Number(d.selectedLengthMm)||0)):Math.round(Math.hypot(d.hover.x-d.start.x,d.hover.y-d.start.y)/m2LayoutState.scale);if(input)input.value=String(mm);paint();}
 window.rafexQueueAutoFillPreviewV332=function(point){if(!m2AutoFillDraft)return;pending={draft:m2AutoFillDraft,point:{x:point.x,y:point.y}};if(!frame)frame=requestAnimationFrame(flush);};
 const render=m2RenderLayout;m2RenderLayout=window.m2RenderLayout=function(){if(previewOnly){paint();return;}document.getElementById('rafexAutoFillPreviewV332')?.remove();return render.apply(this,arguments);};
 const start=m2StartAutoFillGuide;m2StartAutoFillGuide=window.m2StartAutoFillGuide=function(id){if(m2LayoutState.mode==='draw'||m2AutoFillDraft&&Number(m2AutoFillDraft.rackId)===Number(id))return;clear();return start.apply(this,arguments);};
 const preview=m2PreviewAutoFillLength;m2PreviewAutoFillLength=window.m2PreviewAutoFillLength=function(){if(frame)cancelAnimationFrame(frame);frame=0;pending=null;previewOnly=true;try{return preview.apply(this,arguments);}finally{previewOnly=false;}};
 const cancel=m2CancelAutoFill;m2CancelAutoFill=window.m2CancelAutoFill=function(){clear();return cancel.apply(this,arguments);};
 const apply=m2ApplyAutoFillLength;m2ApplyAutoFillLength=window.m2ApplyAutoFillLength=function(){flush();return apply.apply(this,arguments);};
 const commit=m2CommitAutoFillGuide;m2CommitAutoFillGuide=window.m2CommitAutoFillGuide=function(){flush();clear();return commit.apply(this,arguments);};
})();</script>`;
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('v332 body missing');return html.slice(0,end)+runtime+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-autofill-preview-v332.mjs')){
 const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('v332 HTML missing');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));console.log('v332: lightweight frame-batched autofill preview and single double-click activation');
}

