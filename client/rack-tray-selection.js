(function(){
 const data=__TRAY_DATA__,calculate=__TRAY_CALCULATE__;
 const fmt=n=>Number(n).toLocaleString('tr-TR',{maximumFractionDigits:2});
 function update(f,width,depth,kind='MR'){
   const r=calculate(data,kind,Number(f.trayWidth),Number(depth),Number(f.load),Number(width));
   if(f.traySelectionMode!=='manual')f.trayThickness=r.recommended?.thickness||0;
   return r;
 }
 function fields(f,i,width,depth,custom,kind='MR'){
   const r=update(f,width,depth,kind),attr=custom?'data-floor="'+i+'" data-field=':'data-collection-index="'+i+'" data-collection-field=';
   const chosen=r.options?.find(o=>o.thickness===Number(f.trayThickness));
   const select=(key,options,disabled=false)=>'<select '+attr+'"'+key+'"'+(disabled?' disabled':'')+'>'+options+'</select>';
   const opts=(values,current,label)=>values.map(v=>'<option value="'+v+'"'+(String(v)===String(current)?' selected':'')+'>'+label(v)+'</option>').join('');
   return '<div class="rack-collection-selection rack-tray-selection"><label>Tava genişliği'+select('trayWidth',opts([200,250,300],f.trayWidth,v=>v+' mm'))+'</label><label>Tava seçim şekli'+select('traySelectionMode',opts(['auto','manual'],f.traySelectionMode||'auto',v=>v==='auto'?'Otomatik öneri':'Manuel seçim'))+'</label><label class="rack-collection-product">'+kind+' tava seçimi'+select('trayThickness',f.traySelectionMode==='manual'?'<option value="0">'+(r.recommended?'Ürün seçin':'Tabloda öneri yok')+'</option>'+opts([.6,.8,1,1.2,1.5,2],f.trayThickness,v=>fmt(v)+' mm'+(r.recommended?.thickness===v?' · Önerilen':'')):r.recommended?opts([r.recommended.thickness],f.trayThickness,v=>fmt(v)+' mm · Önerilen'):'<option value="0">Tabloda öneri yok</option>',f.traySelectionMode!=='manual')+'</label><small>'+ (r.error||r.count+' tava · '+fmt(r.perTray)+' kg/tava · Derinlik '+fmt(depth)+' mm'+(r.tableDepth!==Number(depth)?' → tablo '+r.tableDepth+' mm':'')+' · Kalan '+fmt(r.remainder)+' mm')+'<br>'+(chosen?(chosen.suitable?'Seçilen tava yeterli':'Seçilen tava yükü karşılamıyor')+' · '+fmt(chosen.capacity)+' kg/tava':r.recommended?'':'Yeterli tava önerisi bulunamadı.')+'</small></div>';
 }
 function depth(){try{const o=b2b3DOptions();return Number(o.palletDepth)-Number(o.frontPalletGap||0)-Number(o.rearPalletGap||0);}catch{return 0;}}
 function canSave(f,width,depth,kind='MR'){
   return !!calculate(data,kind,Number(f.trayWidth),Number(depth),Number(f.load),Number(width)).recommended;
 }
 window.RafexRackTray={update,fields,depth,canSave};
})();
