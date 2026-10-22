(function(root){
 'use strict';
 function snapshot(rows){
  if(!Array.isArray(rows)||rows.length>10000)throw Error('Ürün dökümü alınamadı.');
  const map=new Map();
  for(const row of rows){
   const quantity=Number(row.qty);
   if(!Number.isFinite(quantity)||quantity<0)throw Error('Ürün adedi geçersiz; kayıt oluşturulmadı.');
   if(quantity===0)continue;
   const parts=root.rafexProductCodeRulesV322.split(row.spec);
   const name=String(row.name||row.item||''),description=String(parts.description||''),unit=String(row.unit||'adet'),code=parts.code||null;
   if(!name||name.length>512||description.length>2000||unit.length>64||(code&&code.length>128))throw Error('Ürün bilgisi geçersiz; kayıt oluşturulmadı.');
   const key=JSON.stringify(code?[code,unit]:[null,name,description,unit]);
   const item=map.get(key)||{code,name,description,quantity:0,unit};
   item.quantity+=quantity;
   if(!Number.isFinite(item.quantity))throw Error('Ürün adedi çok büyük.');
   map.set(key,item);
  }
  return {version:1,source:'layout-inventory-v44',products:[...map.values()],capturedAt:new Date().toISOString()};
 }
 function capture(record){
  if(typeof root.rafexLayoutInventoryRowsV44!=='function')throw Error('Ürün hesabı hazır değil; tekrar deneyin.');
  const payload=record.payload,areas=payload.areas;
  const layouts=Array.isArray(areas)&&areas.length?areas.map(area=>area.layout):[payload.layout];
  if(layouts.some(layout=>!layout||!Array.isArray(layout.racks)))throw Error('Yerleşimin ürün dökümü alınamadı.');
  const previousState=m2LayoutState,previousSymbols=m2LayoutSymbols,rows=[];
  try{
   for(const layout of layouts){
    // Synchronous calculation only: no painting, selection, history or area changes.
    m2LayoutState=JSON.parse(JSON.stringify(layout));
    m2LayoutSymbols=m2LayoutState.symbols||[];
    rows.push(...root.rafexLayoutInventoryRowsV44());
   }
   payload.productSnapshotV372=snapshot(rows);
  }finally{m2LayoutState=previousState;m2LayoutSymbols=previousSymbols;}
  return record;
 }
 root.rafexProjectProductsV372=Object.freeze({snapshot,capture});
})(typeof window==='undefined'?globalThis:window);
