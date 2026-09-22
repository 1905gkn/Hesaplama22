(function(){
  const copy=x=>JSON.parse(JSON.stringify(x));
  window.rafexPrepareImportedTypesV188=function(specs){
    if(m2ActiveModule!=='b2b'||!document.getElementById('b2bModuleCount'))throw Error('PDF aktarımı için Ortak Çizim içinde B2B seçilmelidir.');
    const previous=b2bReadInputState(),last=m2LastDrawing,entries=[];
    try{for(const [i,s] of specs.entries()){
      const choice=window.RafexRackTravers?.choices('normal',s.sectionWidth,s.palletWeight*s.palletCount)?.[0];
      if(!choice)throw Error(s.name+': yük tablosunda uygun travers yok.');
      const beam=window.RafexRackTravers.height(choice.value);
      if(s.levelStep<s.palletHeight+beam)throw Error(s.name+': seçilen travers ile PDF kat aralığı yetersiz.');
      const state={palletType:s.palletWidth===800&&s.palletDepth===1200?'euro':'special',palletWidth:s.palletWidth,palletDepth:s.palletDepth,palletHeight:s.palletHeight,palletWeight:s.palletWeight,palletCount:s.palletCount,levels:s.levels,rowType:'single',rowGap:0,firstPalletPosition:'ground',firstFloorGap:s.firstBeamTop-beam,palletTraverseGap:s.levelStep-s.palletHeight-beam,palletOverhang:(s.palletDepth-s.frameDepth)/2,footHeightMode:'manual',footHeight:s.footHeight,footManual:false,traverseManual:false,traverseType:choice.value,collectionLevels:{enabled:false},accessories:[],manualLevelSpecs:Array.from({length:s.levels},(_,index)=>({distance:index?s.levelStep:s.firstBeamTop-beam,palletHeight:s.palletHeight,weight:s.palletWeight*s.palletCount,traverseType:choice.value,selectionMode:'auto'}))};
      state.traverseHeightOverride=beam;
      b2bApplySavedInputState(state);
      // m2LastDrawing retains the generic Mekik beam height (80 mm). B2B's
      // selected-profile calculation is authoritative for imported B2B types.
      const d=copy({...m2LastDrawing,traverseHeight:b2bTraverseHeight()}),physical=b2bLayoutDrawing(d);
      if(!d?.plan||!d.footProfile||!Number.isFinite(d.footCapacity)||d.footCapacity<d.footLoad)throw Error(s.name+': yük tablosunda uygun ayak bulunamadı.');
      if(Math.abs(physical.b2bLayout.sectionWidth-s.sectionWidth)>1||Math.abs(physical.b2bLayout.frameDepth-s.frameDepth)>1||Number(d.b2b?.levels)!==s.levels||Number(d.b2b?.footHeight)!==s.footHeight)throw Error(s.name+': hesaplanan ölçüler PDF ile uyuşmuyor.');
      if(Number(d.traverseHeight)!==beam)throw Error(s.name+': travers yüksekliği seçilen profille uyuşmuyor.');
      d.rafexSystem='b2b';d.pdfSourceSpec=copy(s);
      entries.push({id:-(Date.now()+i),name:s.name,source:'project',__rafexSystem:'b2b',__rafexSystemLabel:'B2B',__rafexUnified:true,drawing:d,__rafexSnapshot:copy(d)});
    }}finally{b2bApplySavedInputState(previous);m2LastDrawing=last;}
    return entries;
  };
  window.rafexApplyImportedLayoutV188=function(plan,entries,fileName){
    const oldState=copy(m2LayoutState),oldSymbols=copy(m2LayoutSymbols),oldTypes=copy(window.rafexProjectTypesV133||[]),oldHistory=m2UndoHistory.slice(),push=m2PushUndo;
    const oldDecorations={notes:m2UserNotes,offsets:m2DimensionOffsets,fonts:m2DimensionFontSizes,hidden:m2HiddenSummaryDimensions,visible:m2VisibleRackDimensions,pinned:m2PinnedDimensionsByRack,measure:m2FreeMeasure};
    try{
      const merged=window.rafexMergeRackCatalog(oldTypes,entries),bySpec=new Map();
      for(const entry of entries){const id=merged.aliases['b2b:'+entry.id]||'b2b:'+entry.id;bySpec.set(entry.drawing.pdfSourceSpec.key,merged.entries.find(e=>'b2b:'+e.id===id));}
      const excluded=new Set(plan.conflicts.flat()),positions=plan.placements.filter(p=>!excluded.has(p.id)).map(copy),rowEnd=new Map();let adjusted=0;
      for(const p of positions){
        const entry=bySpec.get(p.key);if(!entry)throw Error('PDF tipi katalogda bulunamadı.');
        const physical=b2bLayoutDrawing(entry.drawing);p.nativeWidth=physical.totalWidth;p.nativeDepth=physical.railLength;
        const minimum=(rowEnd.get(p.row)??-Infinity)+p.nativeWidth/2+1;
        if(p.y<minimum){p.y=minimum;adjusted++;}rowEnd.set(p.row,p.y+p.nativeWidth/2);
      }
      const maxX=Math.max(...positions.map(p=>p.x+p.nativeDepth/2)),maxY=Math.max(...positions.map(p=>p.y+p.nativeWidth/2)),scale=Math.min(840/(maxX+2000),490/(maxY+2000));
      m2LayoutState.pdfImport??=null;push('PDF otomatik yerleşim');m2PushUndo=()=>{};
      m2UserNotes=[];m2DimensionOffsets={};m2DimensionFontSizes={};m2HiddenSummaryDimensions=new Set();m2VisibleRackDimensions={length:new Set(),depth:new Set()};m2PinnedDimensionsByRack={};m2FreeMeasure={points:[],hover:null};
      window.rafexProjectTypesV133=merged.entries;window.rafexUnifiedCatalogSync();
      m2LayoutState={...m2LayoutState,points:[],pathBreaks:[],cadElements:[],closed:false,openFinished:true,scale,racks:[],selected:null,pinnedRackId:null,drag:null,hover:null,mode:'idle',edgeDimensions:[],pdfImport:{fileName,detected:plan.placements.length,excluded:plan.placements.filter(p=>excluded.has(p.id)),warnings:plan.warnings,adjusted,warehouseBoundary:null}};
      m2LayoutSymbols=[];
      const templates=new Map();
      for(const [key,entry] of bySpec){
        m2AddRack(copy(entry.__rafexSnapshot||entry.drawing),entry.name);
        const rack=m2LayoutState.racks.pop();if(!rack)throw Error('Yerleşim bloğu oluşturulamadı.');templates.set(key,copy(rack));
      }
      for(const [i,p] of positions.entries()){
        const entry=bySpec.get(p.key),rack=copy(templates.get(p.key));
        Object.assign(rack,{id:Date.now()+i,x:80+p.x*scale-rack.w/2,y:70+p.y*scale-rack.h/2,angle:90,staged:false,freePlacement:false,locked:true,rafexCatalogKey:'b2b:'+entry.id,rafexSystem:'b2b',pdfSourceId:p.id});
        if(!m2RackInsideArea(rack)||m2RackOverlaps(rack))throw Error(p.id+': hesaplanan raf dış ölçüsü başka bir blokla çakışıyor.');
        m2LayoutState.racks.push(rack);
      }
      m2LayoutState.selected=null;m2RenderSavedRackTypes();m2RenderLayout();m2RenderLayoutProductList();m2RefreshActiveReport();
      document.getElementById('rafexOpenLayoutScreen')?.click();
      document.getElementById('m2FloorStatus').textContent=positions.length+' raf gözü PDF’den otomatik yerleştirildi.'+(excluded.size?' '+excluded.size+' çakışan göz bekletildi.':'')+' Projeyi Kaydet ile saklayabilirsin.';
      return {placed:positions.length,excluded:excluded.size,adjusted};
    }catch(error){m2LayoutState=oldState;m2LayoutSymbols=oldSymbols;window.rafexProjectTypesV133=oldTypes;m2UndoHistory.splice(0,m2UndoHistory.length,...oldHistory);m2UserNotes=oldDecorations.notes;m2DimensionOffsets=oldDecorations.offsets;m2DimensionFontSizes=oldDecorations.fonts;m2HiddenSummaryDimensions=oldDecorations.hidden;m2VisibleRackDimensions=oldDecorations.visible;m2PinnedDimensionsByRack=oldDecorations.pinned;m2FreeMeasure=oldDecorations.measure;window.rafexUnifiedCatalogSync();m2RenderLayout();throw error;}
    finally{m2PushUndo=push;m2UpdateUndoButton();}
  };
})();
