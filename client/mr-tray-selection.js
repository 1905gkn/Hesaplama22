(function(){
 if(typeof mrUpdateSummary!=='function')return;
 let selection={trayWidth:200,trayThickness:0,load:200,traySelectionMode:'auto'};
 function sync(){
   const anchor=document.getElementById('mrTraverseType');if(!anchor)return;
   if(mrTrayAccessoryV5)selection.trayWidth=mrTrayAccessoryV5.width;
   const width=Number(document.getElementById('mrSectionWidth')?.value),depth=Number(document.getElementById('mrDepth')?.value);
   window.RafexRackTray.update(selection,width,depth);
   if(mrTrayAccessoryV5)Object.assign(mrTrayAccessoryV5,{thickness:selection.trayThickness,load:selection.load,traySelectionMode:selection.traySelectionMode});
   let host=document.getElementById('mrTraySelection');
   if(!host){host=document.createElement('div');host.id='mrTraySelection';host.style.cssText='grid-column:1/-1;min-width:0;margin-top:10px';anchor.closest('label').after(host);
     host.onchange=e=>{const key=e.target.dataset.collectionField;if(!key)return;selection[key]=key==='traySelectionMode'?e.target.value:Number(e.target.value);if(key==='trayThickness')selection.traySelectionMode='manual';if(key==='trayWidth'&&mrTrayAccessoryV5)mrTrayAccessoryV5.width=selection.trayWidth;mrUpdateSummary(true);mrSyncLayoutDrawingV4(false);};
   }
   const common=document.querySelector('#page[data-rafex-common-active="1"]'),levels=document.getElementById('mrLevels')?.closest('label');
   const loadMarkup='Bölüm başına kat yükü (kg)<input type="number" min="1" data-collection-field="load" value="'+selection.load+'">';
   if(common&&levels){
     let load=document.getElementById('mrCommonLevelLoad');
     if(!load){load=document.createElement('label');load.id='mrCommonLevelLoad';load.innerHTML=loadMarkup;levels.after(load);load.onchange=host.onchange;}
     const input=load.querySelector('input');if(document.activeElement!==input)input.value=String(selection.load);
   }
   host.innerHTML=(common&&levels?'':'<label style="display:grid;gap:5px;font-size:11px;font-weight:bold">'+loadMarkup+'</label>')+window.RafexRackTray.fields(selection,0,width,depth,false)+'<small>MR TAVA tablosu · Bir bölümün bir katındaki toplam yük. Tava eklenecek katlar aksesuar alanından seçilir.</small>';
 }
 const summary=mrUpdateSummary;mrUpdateSummary=window.mrUpdateSummary=function(){sync();return summary.apply(this,arguments);};
 const state=mrAccessoryStateV5;mrAccessoryStateV5=function(){return state.apply(this,arguments).map(item=>({...item,thickness:selection.trayThickness,load:selection.load,traySelectionMode:selection.traySelectionMode}));};
 const restore=mrApplyDrawingToFormV4;mrApplyDrawingToFormV4=window.mrApplyDrawingToFormV4=function(drawing){
   const item=drawing?.b2b?.accessories?.find(x=>x.type==='tray');
   selection={trayWidth:item?.width||200,trayThickness:item?.thickness||0,load:item?.load||200,traySelectionMode:item?.traySelectionMode||(item?.thickness?'manual':'auto')};
   const result=restore.apply(this,arguments);sync();return result;
 };
})();
