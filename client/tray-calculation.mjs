export function calculateTray(data,kind,width,depth,load,span){
  if(!data.tables[kind]||![200,250,300].includes(width)||![depth,load,span].every(x=>Number.isFinite(x)&&x>0))return {error:'Tüm ölçüleri ve toplam yükü sıfırdan büyük girin.'};
  if(depth<data.depths[0]||depth>data.depths.at(-1))return {error:'Tablo derinliği 400–1200 mm aralığındadır.'};
  const count=Math.floor(span/width);
  if(count<1)return {error:'Kat genişliğine en az bir tam tava sığmalıdır.'};
  const column=data.depths.findIndex(x=>x>=depth),perTray=load/count;
  const options=data.tables[kind].filter(x=>x.width===width).sort((a,b)=>a.thickness-b.thickness).map(x=>({...x,capacity:x.capacities[column],suitable:x.capacities[column]*count>=load}));
  return {count,perTray,remainder:span-count*width,tableDepth:data.depths[column],options,recommended:options.find(x=>x.suitable)||null};
}
