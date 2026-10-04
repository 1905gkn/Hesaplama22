/* Drawing -> editable plan draft -> user-designed sections -> free layout. */
(function () {
  'use strict';
  const finite = n => Number.isFinite(Number(n));
  function groups(items, tolerance = 20) {
    const result = [];
    items.forEach((item, index) => {
      const w = Math.max(item.w, item.h), d = Math.min(item.w, item.h);
      let group = result.find(g => Math.abs(g.w - w) <= tolerance && Math.abs(g.d - d) <= tolerance && g.label === (item.label || ''));
      if (!group) result.push(group = { id: result.length, name: letter(result.length), w, d, label: item.label || '', members: [] });
      group.members.push(index);
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
    return accepted.sort((a,b)=>a.cy-b.cy||a.cx-b.cx);
  }
  function joinedRuns(items,{gap=150,alignment=5,compatible=()=>true}={}) {
    const rows=[];
    items.forEach((r,index)=>{
      const angle=((r.angle+(r.h>r.w?90:0))%180+180)%180,a=angle*Math.PI/180;
      const p={index,angle,along:r.x*Math.cos(a)+r.y*Math.sin(a),across:-r.x*Math.sin(a)+r.y*Math.cos(a),width:Math.max(r.w,r.h),depth:Math.min(r.w,r.h)};
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
  globalThis.RafexTopPlan={groups,rectangle,cad,detect,joinedRuns};
  if(typeof document==='undefined')return;
})();
