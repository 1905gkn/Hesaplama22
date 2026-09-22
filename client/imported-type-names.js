(function(){
  const normalize=value=>String(value??'').trim().toUpperCase();
  function resolve(current,entries){
    const merged=window.rafexMergeRackCatalog(current,entries);
    const targets=entries.map(e=>merged.entries.find(t=>'b2b:'+t.id===(merged.aliases['b2b:'+e.id]||'b2b:'+e.id)));
    return {merged,targets};
  }
  function defaults(current,entries){
    const {targets}=resolve(current,entries);
    entries.forEach((e,i)=>{e.importName=targets[i].name;});
  }
  function apply(current,entries){
    const {merged,targets}=resolve(current,entries),targetSet=new Set(targets);
    const used=new Set(merged.entries.filter(e=>!targetSet.has(e)).map(e=>normalize(e.name)));
    const names=entries.map(e=>normalize(e.importName));
    names.forEach(name=>{
      if(!/^[A-Z]+$/.test(name))throw Error('Blok adı boş olamaz; A–Z harflerini kullan (ör. A, C, AA).');
      if(used.has(name))throw Error('“'+name+'” blok adı zaten kullanılıyor. Her raf tipine farklı bir ad ver.');
      used.add(name);
    });
    if(new Set(targets).size!==targets.length)throw Error('Aynı raf tipi için birden fazla ad tanımlanamaz.');
    targets.forEach((e,i)=>{
      e.name=names[i];e.__rafexGlobalLetter=names[i];
      e.drawing.rafexGlobalTypeLetter=names[i];
      e.__rafexSnapshot={...e.__rafexSnapshot,rafexGlobalTypeLetter:names[i]};
    });
    return merged;
  }
  window.rafexImportedNamesV194={defaults,apply};
})();
