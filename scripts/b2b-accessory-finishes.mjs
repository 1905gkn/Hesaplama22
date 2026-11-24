export function paintAccessory(root,color){
 const materials=new Map();
 const paint=source=>{
  if(!materials.has(source)){
   const material=source.clone();
   material.color.setHex(color);
   material.map=null;
   material.vertexColors=false;
   materials.set(source,material);
  }
  return materials.get(source);
 };
 root.traverse(mesh=>{
  if(mesh.isMesh&&mesh.material)mesh.material=Array.isArray(mesh.material)?mesh.material.map(paint):paint(mesh.material);
 });
}

export function transformAccessoryFinishes(source){
 const replace=(anchor,value,all=false)=>{
  if(!source.includes(anchor))throw Error('Missing B2B accessory anchor: '+anchor);
  source=all?source.replaceAll(anchor,value):source.replace(anchor,value);
 };
 const traverseColor='(COLORS[this.options.traverseColor] ?? COLORS.ral1007)';
 replace('section.add(stop);','paintRackAccessory(stop, '+traverseColor+'); section.add(stop);',true);
 replace('section.add(h);','paintRackAccessory(h, '+traverseColor+'); section.add(h);');
 replace('layer.add(tray);','paintRackAccessory(tray, COLORS.galvanized); layer.add(tray);');
 replace('section.add(wire);','paintRackAccessory(wire, COLORS.galvanized); section.add(wire);');
 replace('hReferenceSpan.outerDepth + 16','hReferenceSpan.outerDepth');
 replace('if (hSpan) h.position.y += 2;','');
 replace('this.seatAccessoryOnTraverses(h, hSpan, 0.71);\n          h.position.z += 50;','this.seatAccessoryOnTraverses(h, hSpan);');
 return 'const paintRackAccessory = '+paintAccessory.toString()+';\n'+source;
}
