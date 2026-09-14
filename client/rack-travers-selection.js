(function(){
 'use strict';
 const tables={normal:__RACK_NORMAL__,collection:__RACK_COLLECTION__};
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function key(row,kind){
  const s=row.section;if(!s)return '';
  if(kind==='collection')return s.replace(/^ZS30\.(\d+)\.(.+) ST37$/,(_,h,t)=>'ZS'+h+'|'+Number(t.replace(',','.'))).replace(/^Kutu50\.(\d+)\.(.+) ST37$/,(_,h,t)=>'Kutu'+h+'|'+Number(t.replace(',','.')));
  return s.replace(/^Kutu50\.(\d+)\.(.+) /,'Kutu$1x50x$2 ');
 }
 function height(s){if(/^ZS/.test(s))return ({35:55,55:75,65:85})[s.match(/\d+/)?.[0]]||75;return Number(String(s).match(/\d+/)?.[0])||140;}
 function choices(kind,width,load){const t=tables[kind],L=t.lengths.find(n=>n>=width),Q=t.loads.find(n=>n>=load);if(!(width>0&&load>0)||L===undefined||Q===undefined)return [];return t.records.filter(r=>r.length===L&&r.load===Q&&r.section).map(r=>({...r,value:key(r,kind)}));}
 const catalog=kind=>[...new Map(tables[kind].records.filter(r=>r.section).map(r=>[key(r,kind),{...r,value:key(r,kind)}])).values()];
 function label(r){return r.value.replace('|',' / ')+' · '+r.group+(r.manual?' · Yönetici tarafından kabul edildi !':r.preliminary?' · Burkulma kontrolü hariç ön seçim':'');}
 function options(kind,width,load,selected,manual){const rows=choices(kind,width,load),all=manual?catalog(kind):rows;return '<option value="">'+(rows.length?'Ürün seçin':'Tabloda öneri yok')+'</option>'+all.map(r=>'<option value="'+esc(r.value)+'"'+(r.value===selected?' selected':'')+'>'+esc(label(r))+(rows.some(x=>x.value===r.value)?' · Önerilen':manual?' · Tablo önerisi dışında':'')+'</option>').join('');}
 function updateFloor(f,width){const rows=choices('collection',width,Number(f.load));if(f.selectionMode!=='manual')f.traverse=rows[0]?.value||'';return rows;}
 function floorFields(f,i,width,custom){const rows=updateFloor(f,width),attr=custom?'data-floor="'+i+'" data-field=':'data-collection-index="'+i+'" data-collection-field=';return '<label>Toplama katı ağırlığı (kg)<input '+attr+'"load" type="number" min="1" max="1500" value="'+(f.load||'')+'" placeholder="Ürün ve tabla toplamı"></label><label>Seçim şekli<select '+attr+'"selectionMode"><option value="auto"'+(f.selectionMode!=='manual'?' selected':'')+'>Otomatik öneri</option><option value="manual"'+(f.selectionMode==='manual'?' selected':'')+'>Manuel seçim</option></select></label><label>Önerilen traversler<select '+attr+'"traverse">'+options('collection',width,Number(f.load),f.traverse,f.selectionMode==='manual')+'</select></label><small>'+ (rows.length?'Hesapta '+rows[0].length+' mm / '+rows[0].load+' kg kullanıldı.':'Boy ve yük girin. Tablo sınırı: 3600 mm / 1500 kg.')+' ZS: burkulma kontrolü hariç ön seçim.</small>';}
 function bindLevels(dialog,width,ground,saved){
  const rows=[...dialog.querySelectorAll('.level-row')];
  const refresh=()=>rows.forEach((row,i)=>{const select=row.querySelector('[data-traverse]');if(select.disabled)return;const loadRow=rows[ground?i+1:i],load=Number(loadRow?.querySelector('[data-weight]')?.value)||0;const found=choices('normal',width,load);const chosen=select.dataset.manual==='true'?select.value:found[0]?.value||'';select.innerHTML=options('normal',width,load,chosen,select.dataset.manual==='true');select.value=chosen;row.querySelector('[data-selection-note]').textContent=found.length?'Tablo: '+found[0].length+' mm / '+found[0].load+' kg':'Tabloda öneri yok';});
  rows.forEach((row,i)=>{const select=row.querySelector('[data-traverse]');select.dataset.manual=String(saved[i]?.selectionMode==='manual');const note=document.createElement('small');note.dataset.selectionNote='';select.after(note);const button=document.createElement('button');button.type='button';button.textContent='Manuel / otomatik';button.onclick=()=>{select.dataset.manual=String(select.dataset.manual!=='true');refresh();};select.after(button);select.onchange=()=>{select.dataset.manual='true';refresh();};});
  dialog.oninput=refresh;refresh();
 }
 window.RafexRackTravers={choices,catalog,options,height,updateFloor,floorFields,bindLevels};
 if(typeof b2bApplyInputs!=='function')return;
 function sync(event){const select=document.getElementById('b2bTraverseType');if(!select)return;const g=b2bPalletGeometry(),load=Number(document.getElementById('b2bPalletWeight')?.value)*g.count,width=g.sectionWidth;const rows=choices('normal',width,load);let selected=select.value;if(event?.target===select)b2bTraverseManual=true;if(!b2bTraverseManual)selected=rows[0]?.value||'';select.innerHTML=options('normal',width,load,selected,b2bTraverseManual);select.value=selected;const title=document.getElementById('b2bTraverseRecommendation');if(title)title.textContent=rows.length?'Kat '+load+' kg / '+width+' mm → tablo '+rows[0].load+' kg / '+rows[0].length+' mm':'Tabloda öneri yok (en fazla 4000 mm / 4500 kg)';const button=document.getElementById('b2bTraverseManualButton');if(button)button.textContent=b2bTraverseManual?'Otomatik Öneriye Dön':'Manuel Seç';}
 const apply=b2bApplyInputs;b2bApplyInputs=window.b2bApplyInputs=function(event){sync(event);const result=apply.apply(this,arguments);sync();return result;};
 b2bToggleTraverseManual=window.b2bToggleTraverseManual=function(){b2bTraverseManual=!b2bTraverseManual;b2bApplyInputs();};
 const restore=b2bApplySavedInputState;b2bApplySavedInputState=window.b2bApplySavedInputState=function(s){const result=restore.apply(this,arguments),select=document.getElementById('b2bTraverseType');if(select&&s?.traverseType){select.innerHTML=options('normal',1,1,s.traverseType,true);select.value=s.traverseType;}sync();return result;};
 sync();
})();
