(function(){
 const message='Tabloda uygun tava önerisi yok. Kaydetmek için kat yükünü veya tava ölçülerini değiştirin.';
 function allowed(items,width,depth,kind){
   return (items||[]).filter(item=>item.type==='tray').every(item=>window.RafexRackTray.canSave({trayWidth:item.width,load:item.load},width,depth,kind));
 }
 function reject(){if(!window.RafexCommonFeedback?.(message,document.getElementById('b2bAccessoryArea')||document.getElementById('mrTraySelection')))alert(message);return false;}
 if(typeof m2SaveRackType==='function'){
   const save=m2SaveRackType;
   m2SaveRackType=window.m2SaveRackType=function(){
     const system=document.querySelector('#rafexUnifiedSystemPicker input:checked')?.value||(typeof m2ActiveModule!=='undefined'?m2ActiveModule:'');
     if(system==='b2b'){
       const geometry=b2bPalletGeometry(),state=b2bReadInputState();
       const width=Number(geometry.sectionWidth||geometry.calculatedWidth);
       if(!allowed(state.accessories,width,window.RafexRackTray.depth(),'HR'))return reject();
       if(state.collectionLevels?.enabled&&(state.collectionLevels.floors||[]).some(f=>!window.RafexRackTray.canSave(f,width,window.RafexRackTray.depth(),'MR')))return reject();
     }
     return save.apply(this,arguments);
   };
 }
 if(typeof window.mrSaveRackV6==='function'){
   const save=window.mrSaveRackV6;
   window.mrSaveRackV6=function(){
     const width=Number(document.getElementById('mrSectionWidth')?.value),depth=Number(document.getElementById('mrDepth')?.value);
     if(!allowed(mrAccessoryStateV5(),width,depth,'MR'))return reject();
     return save.apply(this,arguments);
   };
 }
})();
