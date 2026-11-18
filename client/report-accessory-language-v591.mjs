export function translateAccessoryText591(source,language='tr'){
 if(typeof source!=='string'||!['en','fr'].includes(language))return source;
 const fr=language==='fr',rows=[
 ['Toplama katı ZS travers','Picking level ZS beam','Lisse ZS de niveau de picking'],
 ['Toplama katı kutu travers','Picking level box beam','Lisse caisson de niveau de picking'],
 ['Toplama katı tavası','Picking level shelf panel','Plateau de niveau de picking'],
 ['Toplama katı tava','Picking level shelf panel','Plateau de niveau de picking'],
 ['Toplama katı','Picking level','Niveau de picking'],['Toplama','Picking','Picking'],
 ['Tavalı','With shelf panels','Avec plateaux'],['Tava','Shelf panel','Plateau'],
 ['H travers','H-beam','Lisse en H'],['Palet dayama','Pallet backstop','Butée de palette'],
 ['Kat teli','Wire decking','Platelage grillagé'],['Hafif deprem çaprazı','Light seismic bracing','Contreventement sismique léger'],
 ['Ağır deprem çaprazı','Heavy seismic bracing','Contreventement sismique renforcé'],
 ['Bariyer koruma','Safety barrier','Barrière de protection'],['UAKS ayak koruma','UAKS upright protector','Protection de montant UAKS'],['UAKZ ayak koruma','UAKZ upright protector','Protection de montant UAKZ'],
 ['Üst palet kotu','Top pallet elevation','Cote supérieure de la palette'],['Ayak boyu','Upright height','Hauteur du montant']];
 return source.split(/(\n|\\n)/).map(line=>{
  const trimmed=line.trim(),lower=trimmed.toLocaleLowerCase('tr');
  for(const [tr,en,french]of rows){const key=tr.toLocaleLowerCase('tr');if(lower===key)return line.replace(trimmed,fr?french:en);}
  const numbered=/^(Z\s*[–−-]\s*)?TOPLAMA\s+(\d+)(.*)$/iu.exec(trimmed);
  if(numbered)return line.replace(trimmed,(numbered[1]?(fr?'SOL':'GROUND')+'–':'')+(fr?'PICKING':'PICKING')+' '+numbered[2]+numbered[3]);
  // Translate known product prefixes only; preserve codes, dimensions and numbers.
  for(const [tr,en,french]of rows){const key=tr.toLocaleLowerCase('tr');if(lower.startsWith(key)&&/^[\s·:|–-]/.test(trimmed.slice(tr.length)))return line.replace(trimmed,(fr?french:en)+trimmed.slice(tr.length));}
  return line;
 }).join('');
}
