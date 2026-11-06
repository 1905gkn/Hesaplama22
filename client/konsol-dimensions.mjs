export function konsolDimensions(o,rows,baseTop,height,width,uprightDepth){
 const left=-width/2-500,right=width/2+500,z=uprightDepth/2+Math.max(o.baseDepth,...rows.map(r=>r.depth))+250;
 const result=[],add=(a,b,value,label,side)=>result.push({a,b,value,label,side});
 add([right,0,z],[right,baseTop,z],baseTop,'Zemin → taban','right');
 let previous=baseTop;
 rows.forEach((r,i)=>{add([right,previous,z],[right,r.top,z],r.top-previous,i===0?'Taban → 1. kol':i+'. → '+(i+1)+'. kol','right');previous=r.top;});
 add([left-2300,0,z],[left-2300,height,z],height,'Ayak boyu','left');
 add([left,baseTop,uprightDepth/2],[left,baseTop,uprightDepth/2+o.baseDepth],o.baseDepth,'Taban derinliği','depth');
 rows.forEach((r,i)=>add([left,r.top,uprightDepth/2],[left,r.top,uprightDepth/2+r.depth],r.depth,(i+1)+'. kol derinliği','depth'));
 return result;
}
export function addKonsolDimensions(THREE,root,items){
 const group=new THREE.Group();group.name='Konsol ölçüleri';group.userData.measurements=items;
 const material=new THREE.LineBasicMaterial({color:0x17657c,depthTest:false});
 for(const item of items){
  const a=new THREE.Vector3(...item.a),b=new THREE.Vector3(...item.b),line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([a,b]),material);line.renderOrder=100;group.add(line);
  for(const p of [a,b]){const tick=new THREE.Line(new THREE.BufferGeometry().setFromPoints([p.clone().add(new THREE.Vector3(-55,0,0)),p.clone().add(new THREE.Vector3(55,0,0))]),material);tick.renderOrder=100;group.add(tick);}
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=64;const c=canvas.getContext('2d');
  c.fillStyle='#f7faf8';c.fillRect(0,0,512,64);c.strokeStyle='#17657c';c.lineWidth=2;c.strokeRect(1,1,510,62);c.fillStyle='#174d60';c.font='bold 28px Arial';c.textAlign='center';c.textBaseline='middle';
  c.fillText(item.label+' · '+Math.round(item.value).toLocaleString('tr-TR')+' mm',256,32,492);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:false,sizeAttenuation:false}));sprite.position.copy(a).add(b).multiplyScalar(.5);sprite.position.x+=item.side==='right'?500:-500;sprite.scale.set(.19,.024,1);sprite.renderOrder=101;group.add(sprite);
 }
 root.add(group);return group;
}
