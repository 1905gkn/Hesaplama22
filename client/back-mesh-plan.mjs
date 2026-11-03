export function backMeshSupports(width){return width<2000?0:width<=3000?1:2;}
export function backMeshCode(height,width){return 'TLKFS'+String(Math.round(height)).padStart(5,'0')+String(Math.round(width)).padStart(5,'0');}
export function backMeshPanels(height,width){
 height=Math.round(Number(height));width=Math.round(Number(width));if(!(height>0&&width>0))return {panels:[],height:0,width:0,covered:0,remaining:0,supports:0};
 let remaining=height;const panels=[];for(const size of [1500,1000]){const quantity=Math.floor(remaining/size);if(quantity){panels.push({height:size,width,quantity,code:backMeshCode(size,width),custom:false});remaining-=quantity*size;}}
 if(remaining>200){const size=Math.floor(remaining/100)*100;panels.push({height:size,width,quantity:1,code:backMeshCode(size,width),custom:true});remaining-=size;}
 return {panels,height,width,covered:height-remaining,remaining,supports:backMeshSupports(width)};
}
export function backMeshFaces(frameDepth,rows=1,rowGap=200){
 rows=rows===2?2:1;const pitch=frameDepth+rowGap,first=-(rows-1)*pitch/2,last=(rows-1)*pitch/2;
 return {front:first-frameDepth/2-100,back:last+frameDepth/2+100,...(rows===2?{middle:first+frameDepth/2+100}:{})};
}
export function backMeshPlanLine(r,side,scale=1){
 const faces=backMeshFaces(r.frameDepth,r.rows,r.rowGap),v=faces[side];if(!Number.isFinite(v))return null;
 const angle=(Number(r.angle)||0)*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle),point=u=>({x:r.x+u*c-v*scale*s,y:r.y+u*s+v*scale*c});
 return {a:point(-r.width*scale/2),b:point(r.width*scale/2)};
}
