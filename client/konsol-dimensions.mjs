export function konsolDimensions(o,rows,baseTop,height,width,uprightDepth){
 const left=-width/2-500,right=width/2+500,z=uprightDepth/2+Math.max(o.baseDepth,...rows.map(r=>r.depth))+250;
 const result=[],add=(a,b,value,label,side)=>result.push({a,b,value,label,side});
 add([right,0,z],[right,baseTop,z],baseTop,'Zemin → taban','right');
 let previous=baseTop;
 rows.forEach((r,i)=>{const bottom=r.top-(o.armThickness||0);add([right,previous,z],[right,bottom,z],bottom-previous,i===0?'Taban → 1. kol':i+'. → '+(i+1)+'. kol','right');previous=r.top;});
 add([left-2300,0,z],[left-2300,height,z],height,'Ayak boyu','left');
 add([left,baseTop,uprightDepth/2],[left,baseTop,uprightDepth/2+o.baseDepth],o.baseDepth,'Taban derinliği','depth');
 const equal=rows.length&&rows.every(r=>Math.abs(r.depth-rows[0].depth)<.01);
 if(equal)add([left,baseTop+1100,uprightDepth/2],[left,baseTop+1100,uprightDepth/2+rows[0].depth],rows[0].depth,'Kat derinliği','depth');
 else rows.forEach((r,i)=>add([left,r.top,uprightDepth/2],[left,r.top,uprightDepth/2+r.depth],r.depth,(i+1)+'. kol derinliği','depth'));
 const start=-width/2;
 add([start,0,z+350],[start+o.spacing,0,z+350],o.spacing,'Ayak aralığı','width');
 add([start,0,z+1100],[width/2,0,z+1100],width,'Toplam uzunluk','width');
 return result;
}
export function addKonsolDimensions(THREE,root,items,dimensionScale=1){
 const group=new THREE.Group();group.name='Konsol ölçüleri';group.userData.measurements=items;group.userData.labelScale=dimensionScale;
 const material=new THREE.LineBasicMaterial({color:0x17657c,depthTest:false});
 for(const item of items){
  const a=new THREE.Vector3(...item.a),b=new THREE.Vector3(...item.b),line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([a,b]),material);line.renderOrder=100;group.add(line);
  for(const p of [a,b]){const tick=new THREE.Line(new THREE.BufferGeometry().setFromPoints([p.clone().add(new THREE.Vector3(item.side==='width'?0:-55,0,item.side==='width'?-55:0)),p.clone().add(new THREE.Vector3(item.side==='width'?0:55,0,item.side==='width'?55:0))]),material);tick.renderOrder=100;group.add(tick);}
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=64;const c=canvas.getContext('2d');
  c.fillStyle='rgba(173,216,245,.58)';c.beginPath();c.roundRect(0,0,512,64,10);c.fill();c.strokeStyle='rgba(90,155,195,.55)';c.lineWidth=2;c.stroke();c.fillStyle='#123e5a';c.font='bold 36px Arial';c.textAlign='center';c.textBaseline='middle';
  c.fillText(item.label+' · '+Math.round(item.value).toLocaleString('tr-TR')+' mm',256,32,492);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:false,sizeAttenuation:false}));sprite.position.copy(a).add(b).multiplyScalar(.5);sprite.position.x+=item.side==='width'?0:item.side==='right'?900:-900;if(item.label==='Zemin → taban')sprite.position.y-=400;sprite.scale.set(.26,.036,1);sprite.renderOrder=101;group.add(sprite);
  const anchor=sprite.position.clone();
  if(item.label==='Ayak boyu')anchor.copy(b);
  sprite.onBeforeRender=(renderer,scene,camera)=>{
   const width=Math.max(1,renderer.domElement.clientWidth),height=Math.max(1,renderer.domElement.clientHeight),pixels=Math.min(36*group.userData.labelScale,width*.42/8),scale=pixels*2*Math.tan(camera.fov*Math.PI/360)/height;
   sprite.scale.set(scale*8,scale,1);
   const screen=anchor.clone().applyMatrix4(group.matrixWorld).project(camera),margin=(pixels*8+16)/width;
   screen.x=Math.max(-1+margin,Math.min(1-margin,screen.x));
   if(item.label==='Ayak boyu')screen.y=Math.min(1-(pixels+16)/height,screen.y+(pixels+8)/height);
   sprite.position.copy(group.worldToLocal(screen.unproject(camera)));sprite.updateMatrixWorld(true);
  };
 }
 root.add(group);return group;
}
