export function installManualLevelEditor(dialog,ground,rebind,maxLevels=30){
 const rows=dialog.querySelector('.rows');
 const text=(el,tr)=>{el.textContent=window.rafexTranslateText?.(tr)||tr;};
 const toolbar=document.createElement('div');toolbar.className='manual-level-toolbar';
 const label=document.createElement('label');text(label,'Katın ekleneceği yer');
 const position=document.createElement('select');position.dataset.insertLevel='';label.append(position);
 const add=document.createElement('button');add.type='button';add.dataset.addLevel='';text(add,'Kat ekle');
 toolbar.append(label,add);rows.before(toolbar);
 const all=()=>[...rows.querySelectorAll('.level-row')];
 const level=i=>ground?(i===0?'Zemin katı':i+'. kat'):(i+1)+'. kat';
 function refresh(bind){
  const list=all();
  list.forEach((row,i)=>{
   const distance=row.querySelector('[data-distance]'),weight=row.querySelector('[data-weight]'),pallet=row.querySelector('[data-pallet]'),traverse=row.querySelector('[data-traverse]');
   pallet.min=ground&&i===0?'0':'500';
   const setLabel=(input,value)=>{const host=input.closest('label');let caption=host.querySelector('[data-level-caption]');if(!caption){for(const node of [...host.childNodes])if(node.nodeType===3)node.remove();caption=document.createElement('span');caption.dataset.levelCaption='';host.prepend(caption);}text(caption,value);};
   const hasDistance=!ground||i<list.length-1;
   if(hasDistance&&distance.disabled)distance.value=Number(pallet.value)+200;
   distance.disabled=!hasDistance;
   setLabel(distance,hasDistance?(i===0?'Zemin – 1. kat':i+'. kat – '+(i+1)+'. kat')+' mesafesi (mm)':'Üst kat mesafesi');
   setLabel(weight,level(i)+' ağırlığı (kg)');setLabel(pallet,level(i)+' palet yüksekliği (mm)');
   traverse.disabled=ground&&i===0;setLabel(traverse,traverse.disabled?'Zemin katı — travers yok':level(i)+' travers tipi');
   let remove=row.querySelector('[data-remove-level]');if(!remove){remove=document.createElement('button');remove.type='button';remove.dataset.removeLevel='';row.append(remove);}
   text(remove,'Katı kaldır');remove.disabled=list.length<=1||(ground&&i===0);
   remove.onclick=()=>{row.remove();refresh(true);};
  });
  position.replaceChildren();
  for(let i=ground?1:0;i<=list.length;i++){
   const option=document.createElement('option');option.value=String(i);
   text(option,i===list.length?'En üste ekle':i===0?'1. katın altına ekle':level(i-1)+' ile '+level(i)+' arasına ekle');position.append(option);
  }
  position.value=String(list.length);add.disabled=list.length>=maxLevels;
  if(bind){
   const saved=list.map(row=>{const s=row.querySelector('[data-traverse]');return {traverseType:s.value,selectionMode:s.dataset.manual==='true'?'manual':'auto'};});
   list.forEach(row=>{const s=row.querySelector('[data-traverse]');s.parentElement.querySelectorAll('button,[data-selection-note]').forEach(n=>n.remove());});
   rebind(saved);
  }
 }
 add.onclick=()=>{
  const list=all(),index=Number(position.value);if(list.length>=maxLevels)return;
  const row=list[Math.min(index,list.length-1)].cloneNode(true);
  const pallet=row.querySelector('[data-pallet]');if(Number(pallet.value)<500)pallet.value='500';
  const distance=row.querySelector('[data-distance]');distance.value=Number(row.querySelector('[data-pallet]').value)+200;distance.disabled=false;
  if(list[index])list[index].before(row);else rows.append(row);
  refresh(true);
 };
 refresh(false);
}
