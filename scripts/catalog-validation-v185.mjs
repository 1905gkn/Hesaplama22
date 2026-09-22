// Validate at the proxy boundary as well as the editor; never forward an
// ambiguous catalog to the persistent store. No mutation or automatic repair.
export function validateCatalogWrite(path,method,body){
 const catalog=/^\/api\/drawing-projects\/\d+\/types$/.test(path)&&method==='PUT';
 const history=path==='/api/projects'&&method==='POST';
 if(!catalog&&!history)return null;
 if(catalog&&(!Number.isSafeInteger(body?.revision)||body.revision<0))return 'Katalog sürümü geçersiz; kayıt değiştirilmedi.';
 const types=catalog?body?.rackTypes:body?.payload?.rackTypes;
 if(!catalog&&types===undefined)return null;
 if(!Array.isArray(types))return 'Raf tipi listesi geçersiz; kayıt değiştirilmedi.';
 const keys=new Set();
 for(const type of types){
  if(!type||type.id==null||type.id===''||!Number.isSafeInteger(Number(type.id)))return 'Raf tipi kimliği geçersiz; kayıt değiştirilmedi.';
  const d=type.__rafexSnapshot||type.drawing||{};
  let system=String(type.__rafexSystem||type.system||d.rafexSystem||(d.b2b?.mr?'mr':d.b2b||d.b2bLayout?'b2b':'mekik2')).toLowerCase();
  system=({mekik:'mekik2',shuttle:'mekik2','drive-in':'drive',drivein:'drive',cantilever:'konsol','konsol-kollu':'konsol'})[system]||system;
  const key=system+':'+Number(type.id);
  if(keys.has(key))return 'Raf tipi kimlikleri çakışıyor ('+key+'); kayıt değiştirilmedi.';
  keys.add(key);
 }
 return null;
}
