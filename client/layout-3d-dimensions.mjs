export const mmLabel=m=>(Math.round(m*1000)).toLocaleString('tr-TR')+' mm';
export function rackDimensions(r){
 const w=r.width/2,d=r.depth/2,offset=.4;
 const result=[{a:[-w,0,-d-offset],b:[w,0,-d-offset],label:'EN · '+mmLabel(r.width)},
 {a:[w+offset,0,-d],b:[w+offset,0,d],label:'DERİNLİK · '+mmLabel(r.depth)},
 {a:[-w-offset,0,d],b:[-w-offset,r.height,d],label:'AYAK · '+mmLabel(r.height)}];
 const special=[...new Set(r.frameHeights.flatMap(row=>[row.left,row.right]).map(Number).filter(v=>v>r.height*1000))];
 for(const [i,h] of special.entries())result.push({a:[w+offset+i*.25,0,d],b:[w+offset+i*.25,h/1000,d],label:'YAN AYAK · '+mmLabel(h/1000)});
 const x=-w-offset*2;for(let i=0;i<r.floors.length;i++){const y=r.floors[i];if(y<=0)continue;result.push({a:[x,y,d],b:[-w,y,d],label:'K'+(i+1)+' KOT · '+mmLabel(y)});}
 return result;
}
export function planDimensions(data){
 const out=[];for(let i=0;i<data.points.length;i++){const j=(i+1)%data.points.length;if((j===0&&!data.closed)||data.breaks.includes(i)||!(data.showAreaDimensions||data.edgeDimensions?.[i]===true))continue;const a=data.points[i],b=data.points[j];out.push({a:[a.x,.035,a.z],b:[b.x,.035,b.z],label:'ALAN · '+mmLabel(Math.hypot(b.x-a.x,b.z-a.z))});}
 if(data.measurePoints?.length===2){const [a,b]=data.measurePoints;out.push({a:[a.x,.07,a.z],b:[b.x,.07,b.z],label:'MESAFE · '+mmLabel(Math.hypot(b.x-a.x,b.z-a.z))});}
 return out;
}
