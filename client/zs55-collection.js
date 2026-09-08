// Mounting offsets measured from the user's HR 3 TIRNAK ZS 55 assembly.
// Local B2B axes: X span, Y depth, negative Z upwards.
export function zs55Collection(THREE, viewer, section, floor, index) {
  const finish=(geometry,reflected=false)=>{
    // Swapping the CAD span/depth axes reflects the winding.
    if(reflected&&geometry.index){const a=geometry.index.array;for(let i=0;i<a.length;i+=3){const t=a[i+1];a[i+1]=a[i+2];a[i+2]=t;}geometry.index.needsUpdate=true;}
    geometry.attributes.position.needsUpdate=true;
    geometry.computeVertexNormals();geometry.computeBoundingBox();geometry.computeBoundingSphere();
  };
  const frameBoxes=[];
  section.updateMatrixWorld(true);
  const inverse=section.matrixWorld.clone().invert();
  section.traverse(mesh=>{
    if(!mesh.isMesh||!mesh.geometry||!/AYAK/i.test(mesh.name))return;
    mesh.geometry.computeBoundingBox();
    const box=mesh.geometry.boundingBox.clone().applyMatrix4(inverse.clone().multiply(mesh.matrixWorld));
    const size=box.getSize(new THREE.Vector3());
    if(size.z>500&&size.x<250&&size.y<250)frameBoxes.push(box);
  });
  if(frameBoxes.length<4)throw new Error('ZS55: upright mounting faces unavailable');
  const center=(Math.min(...frameBoxes.map(b=>b.min.x))+Math.max(...frameBoxes.map(b=>b.max.x)))/2;
  const left=Math.max(...frameBoxes.filter(b=>b.max.x<center).map(b=>b.max.x));
  const right=Math.min(...frameBoxes.filter(b=>b.min.x>center).map(b=>b.min.x));
  const front=Math.min(...frameBoxes.map(b=>b.min.y)),rear=Math.max(...frameBoxes.map(b=>b.max.y));
  const beamLeft=left+4,beamRight=right-4,beamLength=beamRight-beamLeft;
  const bottom=Number(floor.bottom)||0,height=Number(floor.zsHeight)||75;
  const layer=new THREE.Group();layer.name='ZS55 HR Toplama '+(index+1);
  for(const back of [false,true]){
    const beam=viewer.models.zs55Traverse.clone(true);
    beam.traverse(mesh=>{
      if(!mesh.isMesh)return;
      mesh.geometry=mesh.geometry.clone();
      const p=mesh.geometry.attributes.position;
      const body=/Z_TRAVERS|Z TRAVERS/i.test(mesh.name);
      const longConnector=/SOL/i.test(mesh.name);
      // The supplied SOL mesh contains a second, disconnected connector at
      // CAD Y=1446..1488. Keep only the upright-mounted piece at 1304..1346.
      if(longConnector){
        const source=mesh.geometry.index.array,keep=[];
        for(let i=0;i<source.length;i+=3){
          if([source[i],source[i+1],source[i+2]].every(v=>p.getY(v)<1400))keep.push(source[i],source[i+1],source[i+2]);
        }
        mesh.geometry.setIndex(keep);
      }
      for(let i=0;i<p.count;i++){
        const depth=p.getX(i),along=p.getY(i)-1346,z=p.getZ(i);
        const x=body?along*beamLength/2692:along+(longConnector?0:beamLength-2692);
        p.setXYZ(i,back?beamLeft+x:beamRight-x,back?rear+4.43884-depth:front-4.43884+depth,z+50.73630142211914-bottom);
      }
      finish(mesh.geometry);
    });
    beam.name=layer.name+(back?' Arka':' Ön');viewer.applyRackMaterials(beam);layer.add(beam);
  }
  let cursor=left+4;
  viewer.trayPiecePlan(right-left,floor.trayWidth).forEach((width,piece)=>{
    const tray=viewer.models.zs55Tray.clone(true);
    tray.traverse(mesh=>{
      if(!mesh.isMesh)return;
      mesh.geometry=mesh.geometry.clone();const p=mesh.geometry.attributes.position;
      for(let i=0;i<p.count;i++){
        const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
        // Turn the tray over within the same seating envelope: flat surface
        // above, folded edges below (negative local Z points upwards).
        p.setXYZ(i,cursor+y*(width-1.6)/298.4,front+4.6+x*(rear-front-5.6)/1044.4,-z-20.200947-(bottom+height-18));
      }
      finish(mesh.geometry);
    });
    tray.name=layer.name+' Tava '+(piece+1);layer.add(tray);cursor+=width;
  });
  return layer;
}
