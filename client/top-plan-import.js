/* Drawing -> editable plan draft -> user-designed sections -> free layout. */
(function () {
  'use strict';
  const finite = n => Number.isFinite(Number(n));
  const dimensions=r=>r.spanAxis==='x'?{w:r.w,d:r.h}:r.spanAxis==='y'?{w:r.h,d:r.w}:{w:Math.max(r.w,r.h),d:Math.min(r.w,r.h)};
  function groups(items, tolerance = 20) {
    const result = [];
    items.forEach((item, index) => {
      const {w,d} = dimensions(item);
      let group = result.find(g => Math.abs(g.w - w) <= (item.nominalW || g.exact ? 0.01 : tolerance) && Math.abs(g.d - d) <= (item.nominalD || g.exact ? 0.01 : tolerance) && g.label === (item.label || ''));
      if (!group) result.push(group = { id: result.length, name: letter(result.length), w, d, exact: !!item.nominalW, label: item.label || '', members: [] });
      group.members.push(index);
    });
    result.sort((a,b)=>b.members.length-a.members.length||a.id-b.id);
    result.forEach((g,i)=>{g.id=i;g.name=letter(i);});
    return result;
  }
  function pairBackToBack(items,{tolerance=20,maxGap=500}={}) {
    items=items.map(r=>({...r,spanAxis:r.spanAxis||(r.h>r.w?'y':'x')}));
    const details=items.map(r=>{const d=dimensions(r),angle=(r.angle||0)+(r.spanAxis==='y'?90:0),a=angle*Math.PI/180;return{...d,angle,ux:Math.cos(a),uy:Math.sin(a)};});
    const nearby=items.map((a,i)=>items.flatMap((b,j)=>{if(i===j)return[];const x=details[i],y=details[j];if(Math.abs(x.angle-y.angle)>.1||Math.abs(x.w-y.w)>tolerance||Math.abs(x.d-y.d)>tolerance||(a.label||'')!==(b.label||''))return[];const dx=b.cx-a.cx,dy=b.cy-a.cy,along=Math.abs(dx*x.ux+dy*x.uy),across=Math.abs(-dx*x.uy+dy*x.ux),gap=across-(x.d+y.d)/2;if(along>Math.min(80,x.w*.06)||gap< -Math.min(tolerance,20)||gap>Math.min(maxGap,Math.min(x.d,y.d)*.5))return[];return[{j,gap,across}];}));
    const used=new Set(),result=[];
    items.forEach((r,i)=>{if(used.has(i))return;const choices=nearby[i],match=choices.length===1&&nearby[choices[0].j].length===1?choices[0]:null;
      if(!match){result.push({...r,rowType:'single',sourceCount:1});return;}
      const b=items[match.j],d=details[i],gap=Math.max(0,Math.round(match.gap/10)*10),depth=Math.round((d.d+details[match.j].d+gap)*10)/10;
      used.add(i);used.add(match.j);const vertical=r.spanAxis==='y';result.push({...r,cx:(r.cx+b.cx)/2,cy:(r.cy+b.cy)/2,w:vertical?depth:d.w,h:vertical?d.w:depth,nominalD:r.nominalD?depth:undefined,rowType:'double',rowGap:gap+100,singleDepth:(d.d+details[match.j].d)/2,sourceCount:2});
    });
    return result;
  }
  function letter(index) { let s=''; for(let n=index+1;n;n=Math.floor((n-1)/26))s=String.fromCharCode(65+(n-1)%26)+s; return s; }
  function rectangle(points, label) {
    if (points.length > 4 && Math.hypot(points[0].x-points.at(-1).x,points[0].y-points.at(-1).y)<.01) points=points.slice(0,-1);
    if(points.length!==4 || points.some(p=>!finite(p.x)||!finite(p.y))) return null;
    const a=points[0], b=points[1], c=points[2], d=points[3];
    const u={x:b.x-a.x,y:b.y-a.y},v={x:c.x-b.x,y:c.y-b.y},w=Math.hypot(u.x,u.y),h=Math.hypot(v.x,v.y);
    if(w<=0||h<=0||Math.abs(u.x*v.x+u.y*v.y)>w*h*.015||Math.hypot(a.x+c.x-b.x-d.x,a.y+c.y-b.y-d.y)>Math.max(w,h)*.015)return null;
    return {cx:(a.x+c.x)/2,cy:(a.y+c.y)/2,w,h,angle:Math.atan2(u.y,u.x)*180/Math.PI,label:label||''};
  }
  function cad(text, extension) {
    const boxes=[];let boundary=null;
    if(extension==='json') {
      const data=JSON.parse(text);
      if(data.units && !['mm','millimeter','millimeters'].includes(String(data.units).toLowerCase()))throw Error('AutoCAD JSON ölçü birimi mm olmalı.');
      for(const o of data.objects||[]) {
        if(!o.closed)continue;
        if(/area|wall|alan|duvar/i.test(o.type||o.layer||'')){boundary=rectangle((o.points||[]).map(p=>({x:+p[0],y:-p[1]})));continue;}
        if(/column|door|obstacle|kolon|kapi|engel/i.test(o.type||o.layer||''))continue;
        const r=rectangle((o.points||[]).map(p=>({x:+p[0],y:-p[1]})),o.layer||o.type);if(r)boxes.push(r);
      }
    } else {
      const lines=text.replace(/\r/g,'').split('\n'), entities=[];let current=null;
      for(let i=0;i+1<lines.length;i+=2){const code=Number(lines[i].trim()),value=lines[i+1].trim();if(code===0){current={type:value,pairs:[]};entities.push(current);}else if(current)current.pairs.push([code,value]);}
      // DXF outlines must be closed LWPOLYLINE entities; block inserts are not guessed.
      let section=''; for(const e of entities){if(e.type==='SECTION'){section=e.pairs.find(p=>p[0]===2)?.[1]||'';continue;}if(e.type==='ENDSEC'){section='';continue;}if(section!=='ENTITIES'||e.type!=='LWPOLYLINE'||!(Number(e.pairs.find(p=>p[0]===70)?.[1])&1))continue;const points=[];for(const [c,v] of e.pairs){if(c===10)points.push({x:+v,y:NaN});if(c===20&&points.length)points.at(-1).y=-Number(v);if(c===42&&Number(v)!==0)throw Error('Eğrisel DXF çizgileri raf dikdörtgeni olarak okunamaz.');}const layer=e.pairs.find(p=>p[0]===8)?.[1]||'';const r=rectangle(points,layer);if(r){if(/area|wall|alan|duvar/i.test(layer))boundary=r;else if(!/column|door|obstacle|kolon|kapi|engel/i.test(layer))boxes.push(r);}}
    }
    if(!boxes.length)throw Error('Kapalı dikdörtgen modül bulunamadı. AutoCAD’den raf üst görünümünü mm biriminde, blokları patlatarak kapalı LWPOLYLINE DXF veya raf nesnelerini içeren JSON olarak dışa aktarın. DWG dosyasını DXF olarak kaydedin.');
    boxes.boundary=boundary;return boxes;
  }
  function detect(image, region) {
    const {width,height,data}=image, x0=Math.max(0,Math.floor(region.x)),y0=Math.max(0,Math.floor(region.y)),x1=Math.min(width,Math.ceil(region.x+region.w)),y1=Math.min(height,Math.ceil(region.y+region.h));
    const dark=(x,y)=>{const i=(y*width+x)*4,min=Math.min(data[i],data[i+1],data[i+2]),max=Math.max(data[i],data[i+1],data[i+2]);return data[i+3]>100&&(max<190||(max-min>35&&min<210));};
    const runs=[];
    for(let y=y0;y<y1;y++){let start=-1,gap=0;for(let x=x0;x<=x1+2;x++){if(x<x1&&dark(x,y)){if(start<0)start=x;gap=0;}else if(start>=0&&++gap>2){const end=x-gap;if(end-start>=12)runs.push({x:start,end,y});start=-1;gap=0;}}}
    let edges=[];
    for(const r of runs){const old=edges.find(e=>Math.abs(e.x-r.x)<=3&&Math.abs(e.end-r.end)<=3&&r.y-e.last<=3);if(old)old.last=r.y;else edges.push({...r,last:r.y});}
    const colored=edges.filter(e=>{for(let y=e.y;y<=e.last;y++){let hit=0;for(let x=e.x;x<=e.end;x++){const i=(y*width+x)*4;if(Math.max(data[i],data[i+1],data[i+2])-Math.min(data[i],data[i+1],data[i+2])>60)hit++;}if(hit/(e.end-e.x+1)>.6)return true;}return false;});
    // In predominantly coloured CAD plans, select the complete coloured stroke,
    // not its pale antialiased first scanline. Monochrome scans keep every edge.
    const colorPlan=colored.length>=10&&colored.length>edges.length*.35;if(colorPlan)edges=colored;
    if(edges.length>4000)throw Error('Çizim çok yoğun. Üst görünüm bölgesini daha dar seçin.');
    const beam=(edge,l,r)=>{if(!colorPlan)return true;for(let y=edge.y;y<=edge.last;y++){let hit=0;for(let x=Math.ceil(l);x<=Math.floor(r);x++){const i=(y*width+x)*4;if(Math.max(data[i],data[i+1],data[i+2])-Math.min(data[i],data[i+1],data[i+2])>35)hit++;}if(hit/(r-l+1)>.5)return true;}return false;};
    const result=[],vertical=(x,a,b)=>{let hit=0;for(let y=a;y<=b;y++)if([-2,-1,0,1,2].some(dx=>x+dx>=0&&x+dx<width&&dark(x+dx,y)))hit++;return hit/(b-a+1)>.85;};
    // Dimension extensions and partially covered beams need not have matching
    // endpoints. Test their common span and require two actual upright lines.
    for(let i=0;i<edges.length;i++){const a=edges[i];for(let j=i+1;j<edges.length;j++){const b=edges[j],h=b.y-a.y,left=Math.max(a.x,b.x),right=Math.min(a.end,b.end);if(h<8||h>120||right-left<12)continue;const stations=[];for(let x=left;x<=right;x++){if(vertical(x,a.y,b.last)){const last=stations.at(-1);if(last&&x-last.end<=2)last.end=x;else stations.push({x,end:x});}}const centers=stations.map(s=>(s.x+s.end)/2);for(let k=0;k+1<centers.length;k++){const l=centers[k],r=centers[k+1];if(r-l>=12&&beam(a,l,r)&&beam(b,l,r)&&beam(a,l,l+3)&&beam(b,l,l+3)&&beam(a,r-3,r)&&beam(b,r-3,r))result.push({cx:(l+r)/2,cy:(a.y+b.y)/2,w:r-l,h,angle:0});}}}
    const accepted=[];
    for(const r of result.sort((a,b)=>a.h-b.h)){
      if(accepted.some(s=>{const w=Math.max(0,Math.min(r.cx+r.w/2,s.cx+s.w/2)-Math.max(r.cx-r.w/2,s.cx-s.w/2)),h=Math.max(0,Math.min(r.cy+r.h/2,s.cy+s.h/2)-Math.max(r.cy-r.h/2,s.cy-s.h/2));return w*h/Math.min(r.w*r.h,s.w*s.h)>.55;}))continue;
      accepted.push(r);
    }
    accepted.sort((a,b)=>a.cy-b.cy||a.cx-b.cx);
    return reviewCandidates(accepted);
  }
  // A pair of dimension lines can enclose a rectangle too. Keep unusual
  // candidates reviewable instead of inventing a new rack type for them.
  function reviewCandidates(items) {
    if(!items.length)return items;
    const areas=items.map(r=>r.w*r.h).sort((a,b)=>a-b),typical=areas[Math.floor(areas.length/2)],kept=[],review=[];
    for(const r of items){
      const ratio=Math.max(r.w,r.h)/Math.min(r.w,r.h);
      const peers=items.filter(s=>Math.abs(s.w-r.w)<=Math.max(2,r.w*.08)&&Math.abs(s.h-r.h)<=Math.max(2,r.h*.08)).length;
      const reason=ratio>12?'Çok uzun ve ince; ölçü veya duvar çizgisi olabilir.':items.length>=10&&r.w*r.h>typical*6&&peers<3?'Tekrarlanan raflardan çok büyük; ölçü çizgilerinin kapattığı boşluk olabilir.':null;
      if(reason)review.push({...r,reason});else kept.push(r);
    }
    kept.review=review;return kept;
  }
  function joinedRuns(items,{gap=150,alignment=5,compatible=()=>true}={}) {
    const rows=[];
    items.forEach((r,index)=>{
      const angle=((r.angle+(r.spanAxis?r.spanAxis==='y'?90:0:r.h>r.w?90:0))%180+180)%180,a=angle*Math.PI/180;
      const p={index,angle,along:r.x*Math.cos(a)+r.y*Math.sin(a),across:-r.x*Math.sin(a)+r.y*Math.cos(a),width:dimensions(r).w,depth:dimensions(r).d};
      let row=rows.find(row=>Math.abs(row.angle-angle)<.01&&Math.abs(row.across-p.across)<=alignment);
      if(!row)rows.push(row={angle,across:p.across,points:[]});row.points.push(p);
    });
    return rows.flatMap(row=>{
      const runs=[];let run=null;
      for(const p of row.points.sort((a,b)=>a.along-b.along)){
        const prev=run?.at(-1),space=prev?p.along-prev.along-(p.width+prev.width)/2:Infinity;
        if(!prev||Math.abs(space)>Math.min(gap,Math.min(p.width,prev.width)*.1)||Math.abs(p.depth-prev.depth)>alignment||!compatible(items[prev.index],items[p.index])){run=[];runs.push(run);}
        run.push(p);
      }
      return runs.filter(run=>run.length>1).map(run=>({angle:row.angle,indices:run.map(p=>p.index)}));
    });
  }
  function pdfGeometry(list,OPS,viewport,textItems=[]) {
    const mul=(a,b)=>[a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];
    let matrix=viewport.transform.slice(),color='0,0,0',parts=[],points=[],curved=false;const stack=[],rects=[],segments=[];let pathSegments=[];
    const point=(x,y)=>({x:matrix[0]*x+matrix[2]*y+matrix[4],y:matrix[1]*x+matrix[3]*y+matrix[5]});
    const finish=()=>{if(points.length&&!curved){for(let j=1;j<points.length;j++)pathSegments.push({a:points[j-1],b:points[j],color});const r=rectangle(points);if(r&&Math.abs(Math.sin(r.angle*Math.PI/90))<.01){const swap=Math.abs(Math.sin(r.angle*Math.PI/180))>.5;parts.push({...r,w:swap?r.h:r.w,h:swap?r.w:r.h,angle:0,color});}}points=[];curved=false;};
    for(let i=0;i<list.fnArray.length;i++){
      const fn=list.fnArray[i],args=list.argsArray[i];
      if(fn===OPS.save||fn===OPS.paintFormXObjectBegin){stack.push({matrix:matrix.slice(),color});if(fn===OPS.paintFormXObjectBegin&&args?.[0])matrix=mul(matrix,args[0]);}
      else if(fn===OPS.restore||fn===OPS.paintFormXObjectEnd){const state=stack.pop();if(state){matrix=state.matrix;color=state.color;}}
      else if(fn===OPS.transform)matrix=mul(matrix,args);
      else if(fn===OPS.setStrokeRGBColor)color=[args[0],args[1],args[2]].join(',');
      else if(fn===OPS.constructPath){const [ops,values]=args;let k=0;for(const op of ops){if(op===OPS.moveTo){finish();points=[point(values[k++],values[k++])];}else if(op===OPS.lineTo)points.push(point(values[k++],values[k++]));else if(op===OPS.rectangle){finish();const x=values[k++],y=values[k++],w=values[k++],h=values[k++];points=[point(x,y),point(x+w,y),point(x+w,y+h),point(x,y+h)];finish();}else if(op===OPS.closePath){if(points.length)points.push(points[0]);finish();}else if(op===OPS.curveTo){k+=6;curved=true;}else if(op===OPS.curveTo2||op===OPS.curveTo3){k+=4;curved=true;}}}
      else if([OPS.stroke,OPS.closeStroke,OPS.fillStroke,OPS.eoFillStroke,OPS.closeFillStroke,OPS.closeEOFillStroke].includes(fn)){finish();rects.push(...parts.filter(r=>r.w>=4&&r.h>=4));segments.push(...pathSegments);parts=[];pathSegments=[];}
      else if([OPS.fill,OPS.eoFill,OPS.endPath].includes(fn)){parts=[];points=[];pathSegments=[];curved=false;}
    }
    const labels=[];
    for(const t of textItems){const match=t.str.match(/(\d{3,5})\s*[x×X]\s*(\d{3,5})\s*(?:mm)?/),tunnel=/t[üu]nel/i.test(t.str);if(!match&&!tunnel)continue;const m=mul(viewport.transform,t.transform),font=Math.hypot(t.transform[0],t.transform[1])||1,cx=m[4]+m[0]*t.width/font/2+m[2]*.3,cy=m[5]+m[1]*t.width/font/2+m[3]*.3;labels.push({cx,cy,spanAxis:Math.abs(m[0])>=Math.abs(m[1])?'x':'y',nominalW:match?+match[1]:null,nominalD:match?+match[2]:null,label:tunnel?'Tünel':''});}
    return {rects,labels,segments};
  }
  function vectorBoundary(geometry,region){
    const columns=[];
    for(const line of geometry.segments||[]){const rgb=line.color.split(',').map(Number);if(rgb.some(n=>n>70))continue;const {a,b}=line;if(Math.abs(a.x-b.x)>.1||Math.abs(a.y-b.y)<3||a.x<region.x||a.x>region.x+region.w)continue;const top=Math.min(a.y,b.y),bottom=Math.max(a.y,b.y);if(top<region.y-2||bottom>region.y+region.h+2)continue;let column=columns.find(c=>Math.abs(c.x-a.x)<.2);if(!column)columns.push(column={x:a.x,top,bottom,length:0});column.top=Math.min(column.top,top);column.bottom=Math.max(column.bottom,bottom);column.length+=bottom-top;}
    const walls=columns.filter(c=>c.bottom-c.top>region.h*.7&&c.length>(c.bottom-c.top)*.7).sort((a,b)=>a.x-b.x),left=walls[0],right=walls.at(-1);
    if(!left||!right||right.x-left.x<region.w*.7||Math.abs(left.top-right.top)>5||Math.abs(left.bottom-right.bottom)>5)return null;
    return{x:left.x,y:(left.top+right.top)/2,w:right.x-left.x,h:(left.bottom+right.bottom-left.top-right.top)/2};
  }
  function detectVectors(geometry,region){
    const inside=r=>r.cx>=region.x&&r.cx<=region.x+region.w&&r.cy>=region.y&&r.cy<=region.y+region.h;
    const rects=geometry.rects.filter(inside),anchors=[];
    for(const label of geometry.labels){
      const matches=geometry.rects.filter(r=>Math.abs(label.cx-r.cx)<=r.w/2+.5&&Math.abs(label.cy-r.cy)<=r.h/2+.5).filter(r=>{if(!label.nominalW)return true;const d=dimensions({...r,spanAxis:label.spanAxis});return Math.abs(d.w/d.d-label.nominalW/label.nominalD)<.12;}).sort((a,b)=>a.w*a.h-b.w*b.h);
      if(matches[0])anchors.push({...matches[0],...label,cx:matches[0].cx,cy:matches[0].cy,widthKind:'clear'});
    }
    if(anchors.filter(r=>r.nominalW).length<3)return null;
    const result=[],seen=new Set();
    for(const r of rects){const key=[r.cx,r.cy,r.w,r.h].map(n=>n.toFixed(2)).join(':');if(seen.has(key))continue;
      const own=anchors.find(a=>Math.abs(a.cx-r.cx)<.2&&Math.abs(a.cy-r.cy)<.2&&Math.abs(a.w-r.w)<.2&&Math.abs(a.h-r.h)<.2);
      const template=own||anchors.find(a=>a.color===r.color&&Math.abs(a.w-r.w)<=.25&&Math.abs(a.h-r.h)<=.25);
      if(!template)continue;const d=dimensions({...r,spanAxis:template.spanAxis});let nominalW=template.nominalW,nominalD=template.nominalD;
      if(!nominalW){const scaleAnchor=anchors.find(a=>a.nominalW&&a.spanAxis===template.spanAxis&&Math.abs(dimensions(a).d-d.d)<.25);if(scaleAnchor){nominalD=scaleAnchor.nominalD;nominalW=Math.round(d.w/(dimensions(scaleAnchor).w/scaleAnchor.nominalW)/10)*10;}}
      if(!nominalW||!nominalD)continue;
      seen.add(key);result.push({...r,spanAxis:template.spanAxis,nominalW,nominalD,label:template.label,widthKind:'clear',evidence:own?'PDF ölçü yazısı ve kapalı raf sınırı':'Ölçüsü yazılı rafla aynı sınır ve çizgi rengi'});
    }
    result.sort((a,b)=>a.cy-b.cy||a.cx-b.cx);result.review=[];result.vector=true;return result;
  }
  globalThis.RafexTopPlan={groups,pairBackToBack,dimensions,rectangle,cad,detect,joinedRuns,reviewCandidates,pdfGeometry,detectVectors,vectorBoundary};
  if(typeof document==='undefined')return;
})();
