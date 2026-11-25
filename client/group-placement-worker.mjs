export function createGroupSolver({members, obstacles, walls}, wallCuts){
 const grid=new Map(),cell=120;
 function cells(box,visit){
  for(let x=Math.floor(box.left/cell);x<=Math.floor(box.right/cell);x++){
   for(let y=Math.floor(box.top/cell);y<=Math.floor(box.bottom/cell);y++)if(visit(x+':'+y))return true;
  }
  return false;
 }
 for(const box of obstacles)cells(box,key=>{
  if(!grid.has(key))grid.set(key,[]);
  grid.get(key).push(box);
 });
 function valid(dx,dy){
  return members.every(({box,corners})=>{
   const a={left:box.left+dx,right:box.right+dx,top:box.top+dy,bottom:box.bottom+dy};
   if(cells(a,key=>grid.get(key)?.some(b=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top)))return false;
   if(!walls.length)return true;
   const moved=corners.map(p=>({x:p.x+dx,y:p.y+dy}));
   return !walls.some(({a,b})=>wallCuts(a,b,moved));
  });
 }
 return {valid,solve(startDx,startDy,targetDx,targetDy){
  if(valid(targetDx,targetDy))return {dx:targetDx,dy:targetDy,exact:true};
  const candidates=[{dx:startDx,dy:startDy,exact:false}];
  for(const [endDx,endDy] of [[targetDx,targetDy],[targetDx,startDy],[startDx,targetDy]]){
   let low=0,high=1;
   for(let i=0;i<6;i++){
    const mid=(low+high)/2;
    if(valid(startDx+(endDx-startDx)*mid,startDy+(endDy-startDy)*mid))low=mid;
    else high=mid;
   }
   const dx=startDx+(endDx-startDx)*low,dy=startDy+(endDy-startDy)*low;
   if(valid(dx,dy))candidates.push({dx,dy,exact:false});
  }
  candidates.sort((a,b)=>Math.hypot(a.dx-targetDx,a.dy-targetDy)-Math.hypot(b.dx-targetDx,b.dy-targetDy));
  return candidates[0];
 }};
}
