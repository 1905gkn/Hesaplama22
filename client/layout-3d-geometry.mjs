// System-specific local geometry in metres. The viewer applies world placement.
export function rackParts(r,{cad=false,railSeats=null}={}){
 const parts=[];
 const box=(kind,x,y,z,w,h,d,rx=0,rz=0)=>{if([x,y,z,w,h,d].every(Number.isFinite)&&w>0&&h>0&&d>0)parts.push({kind,x,y,z,w,h,d,rx,rz});};
 const post=(x,z,h=r.height)=>{if(!cad||!['b2b','mekik2','drive'].includes(r.system))box('foot',x,h/2,z,r.foot,h,r.foot)};
 function brace(x,z,depth,h){box('foot',x,h/2,z,.035,Math.hypot(depth,h),.035,Math.atan2(depth,h));}
 function panelBracing(x,z1,z2,h){const span=z2-z1;let y=.15,index=0;
  while(y<h-.15){const top=Math.min(y+.6,h-.15);box('brace',x,(top+y)/2,(z1+z2)/2,.03,Math.hypot(top-y,span),.025,Math.atan2((index%2?-1:1)*span,top-y));y=top;index++;}
  for(let y=.15;y<h;y+=1.2)box('tie',x,y,(z1+z2)/2,.03,.04,span);
 }
 function pallet(x,y,z,w,d,h){
  for(const side of [-.35,0,.35])box('timber',x+side*w,y+.055,z,w*.1,.11,d);
  for(const zz of [-.38,0,.38])box('timber',x,y+.13,z+zz*d,w,.04,d*.18);
  if(h>.16)box('load',x,y+.16+(h-.16)/2,z,w*.94,h-.16,d*.94);
 }
 if(r.system==='konsol'){
  const count=Math.max(2,r.uprightCount),span=Math.min(r.width-r.foot,(count-1)*r.spacing),spine=r.doubleSided?0:-r.depth/2+.11,sides=r.doubleSided?[-1,1]:[1];
  for(let i=0;i<count;i++){const x=-span/2+i*span/(count-1);post(x,spine);
   for(const side of sides){const reach=Math.min(r.baseDepth,r.doubleSided?r.depth/2:r.depth-.15);box('foot',x,.08,spine+side*reach/2,.16,.16,reach);
    for(const y of r.floors){const arm=Math.min(r.arm,reach);box('beam',x,y,spine+side*arm/2,.095,.115,arm);box('beam',x,y+.12,spine+side*arm,.1,.25,.035);}
   }
   if(i<count-1){const dx=span/(count-1),h=r.height*.75;box('foot',x+dx/2,r.height/2,spine,.035,Math.hypot(dx,h),.035,0,-Math.atan2(dx,h));box('foot',x+dx/2,r.height/2,spine,.035,Math.hypot(dx,h),.035,0,Math.atan2(dx,h));}
  }
  for(const side of sides)for(const y of r.floors)for(let j=0;j<4;j++)box('product',0,y+.12+r.productHeight/2,spine+side*r.arm*(.18+j*.2),Math.min(r.width,span+.12),r.productHeight,.09);
 }else if(r.system==='mr'){
  const modules=r.modules,pitch=(r.width-r.foot)/modules;
  for(let i=0;i<=modules;i++){const x=-r.width/2+r.foot/2+i*pitch;for(const z of [-1,1])post(x,z*(r.depth-r.foot)/2);panelBracing(x,-(r.depth-r.foot)/2,(r.depth-r.foot)/2,r.height);}
  for(let m=0;m<modules;m++)for(let i=0;i<r.floors.length;i++){const y=r.floors[i],x=-r.width/2+r.foot/2+(m+.5)*pitch;if(!cad)for(const z of [-1,1])box('beam',x,y-r.beam/2,z*(r.depth-r.foot)/2,pitch-r.foot,r.beam,.045);
   const tray=r.accessories.some(a=>a.type==='tray'&&(a.levels||[]).map(Number).includes(i+1));if(tray)box('shelf',x,y+.015,0,pitch-r.foot,.03,r.depth-r.foot);
  }
 }else if(r.system==='drive'||r.system==='mekik2'){
  const pitch=(r.width-r.foot)/r.bays,stations=r.footZ.length?r.footZ:[0,r.depth];
  for(let lane=0;lane<=r.bays;lane++)for(const [start,end] of (r.footFrames?.length?r.footFrames:[[0,r.depth]])){
   const x=-r.width/2+r.foot/2+lane*pitch,z1=Math.max(r.foot/2,start)-r.depth/2,z2=Math.min(r.depth-r.foot/2,end)-r.depth/2,span=z2-z1;let y=.15,index=0;
   while(y<r.height-.15){const top=Math.min(y+.6,r.height-.15);box('brace',x,(top+y)/2,(z1+z2)/2,.03,Math.hypot(top-y,span),.025,Math.atan2((index%2?-1:1)*span,top-y));y=top;index++;}
   for(let y=.15;y<r.height;y+=1.2)box('tie',x,y,(z1+z2)/2,.03,.04,span);
  }
  for(let lane=0;lane<=r.bays;lane++){const x=-r.width/2+r.foot/2+lane*pitch;for(const zz of [...new Set(stations)])post(x,Math.max(r.foot/2,Math.min(r.depth-r.foot/2,zz))-r.depth/2);}
  for(let lane=0;lane<r.bays;lane++){const x=-r.width/2+r.foot/2+(lane+.5)*pitch;
   for(let i=0;i<r.floors.length;i++){const y=r.floors[i];for(const side of [-1,1]){const seat=(railSeats||[-.4575,.4575])[side<0?0:1]*(pitch/1.45),railX=r.system==='mekik2'?x+seat-side*(.075/2-.004):x+side*(pitch*.5-r.foot*.7);box('rail',railX,y-.06,0,.075,.12,r.depth);}
    for(const zz of [...new Set(stations)]){const z=Math.max(.05,Math.min(r.depth-.05,zz))-r.depth/2;if(r.system==='drive'){for(const side of [-1,1])box('beam',x+side*pitch*.35,y-.12,z,pitch*.3,.1,.08);}else if(!cad)box('beam',x,y-.1,z,pitch-r.foot,.1,.08);}
    const positions=r.positions.length?r.positions:Array.from({length:Math.max(1,Math.floor(r.depth/(r.palletDepth+.05)))},(_,j)=>j*(r.palletDepth+.05));
    for(const zz of positions)if(zz+r.palletDepth<=r.depth+.02)pallet(x,y,zz+r.palletDepth/2-r.depth/2,Math.min(r.palletWidth,pitch-r.foot-.06),r.palletDepth,r.palletHeights[i]);
   }
  }
 }else{
  const rows=r.rows,fd=Math.min(r.frameDepth,(r.depth-r.rowGap*(rows-1))/rows),pitch=rows===2?r.depth-fd:0;
  for(let row=0;row<rows;row++){const z=(row-(rows-1)/2)*pitch;
   for(const side of [-1,1]){const x=side*(r.width-r.foot)/2,h=Number(r.frameHeights[row]?.[side<0?'left':'right'])/1000||r.height;for(const edge of [-1,1])post(x,z+edge*(fd-r.foot)/2,h);if(!cad){brace(x,z,fd-r.foot,h*.85);for(let y=.5;y<h;y+=1)box('foot',x,y,z,.04,.045,fd);}}
   for(let i=0;i<r.floors.length;i++){const y=r.floors[i];if(r.tunnelHeight>0&&y<=r.tunnelHeight)continue;const by=r.beamYs[i];if(by!==null&&!cad)for(const edge of [-1,1])box('beam',0,by+r.beam/2,z+edge*(fd-r.foot)/2,r.width-2*r.foot,r.beam,.055);
    const clear=r.width-2*r.foot,space=(clear-r.pallets*r.palletWidth)/(r.pallets+1);for(let p=0;p<r.pallets;p++)pallet(-clear/2+space+(p+.5)*r.palletWidth+p*space,y,z,r.palletWidth,r.palletDepth,r.palletHeights[i]);
   }
  }
 }
 return parts;
}
