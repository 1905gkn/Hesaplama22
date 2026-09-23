(function(){
  const copy=x=>JSON.parse(JSON.stringify(x));
  window.rafexPrepareImportedTypesV188=function(specs){
    if(m2ActiveModule!=='b2b'||!document.getElementById('b2bModuleCount'))throw Error('PDF aktarımı için Ortak Çizim içinde B2B seçilmelidir.');
    const previous=b2bReadInputState(),last=m2LastDrawing,entries=[],originalGeometry=typeof b2bPalletGeometry==='function'?b2bPalletGeometry:null;
    try{for(const [i,s] of specs.entries()){
      const choices=window.RafexRackTravers?.choices('normal',s.sectionWidth,s.palletWeight*s.palletCount)||[];
      const choice=s.beamHeight?choices.find(c=>window.RafexRackTravers.height(c.value)===s.beamHeight):choices[0];
      if(s.beamHeight&&!choice)throw Error(s.name+': '+s.beamHeight+' mm travers için bu yükte uygun profil bulunamadı.');
      if(!choice)throw Error(s.name+': yük tablosunda uygun travers yok.');
      const beam=window.RafexRackTravers.height(choice.value);
      const openings=s.levelPitches?s.levelPitches.map(p=>p-beam):s.clearOpenings,heights=s.palletHeights||Array(s.levels).fill(s.palletHeight);
      if(heights.length!==s.levels||heights.some(h=>!Number.isFinite(h)||h<=0))throw Error(s.name+': kat palet yükseklikleri geçersiz.');
      if(!Array.isArray(openings)||openings.length!==s.levels-2)throw Error(s.name+': PDF net kat açıklıkları eksik.');
      if(s.firstBeamTop-beam<heights[0]||openings.some((g,i)=>!Number.isFinite(g)||g<heights[i+1]))throw Error(s.name+': PDF net kat açıklığı palet yüksekliğinden kısa.');
      const state={palletType:s.palletWidth===800&&s.palletDepth===1200?'euro':'special',palletWidth:s.palletWidth,palletDepth:s.palletDepth,palletHeight:s.palletHeight,palletWeight:s.palletWeight,palletCount:s.palletCount,levels:s.levels,rowType:'single',rowGap:0,firstPalletPosition:'ground',firstFloorGap:s.firstBeamTop-beam,palletTraverseGap:0,palletOverhang:(s.palletDepth-s.frameDepth)/2,footHeightMode:'manual',footHeight:s.footHeight,footManual:false,traverseManual:false,traverseType:choice.value,collectionLevels:{enabled:false},accessories:[]};
      state.traverseManual=!!s.beamHeight;
      state.rowType=s.rowType||'single';state.rowGap=s.rowGap||0;
      state.palletTraverseGap=(openings[0]??s.firstBeamTop-beam)-s.palletHeight;
      state.manualLevelSpecs=Array.from({length:s.levels},(_,index)=>({distance:index===0?s.firstBeamTop-beam:index<s.levels-1?openings[index-1]+beam:0,palletHeight:heights[index],weight:s.palletWeight*s.palletCount,traverseType:index<s.levels-1?choice.value:'',selectionMode:s.beamHeight?'manual':'auto'}));
      state.traverseHeightOverride=beam;
      if(originalGeometry)b2bPalletGeometry=function(){return {...originalGeometry(),sectionWidth:s.sectionWidth};};
      b2bApplySavedInputState(state);
      // m2LastDrawing retains the generic Mekik beam height (80 mm). B2B's
      // selected-profile calculation is authoritative for imported B2B types.
      const d=copy({...m2LastDrawing,traverseHeight:b2bTraverseHeight()});d.b2b.importedSectionWidth=s.sectionWidth;const physical=b2bLayoutDrawing(d);
      if(!d?.plan||!d.footProfile||!Number.isFinite(d.footCapacity)||d.footCapacity<d.footLoad)throw Error(s.name+': yük tablosunda uygun ayak bulunamadı.');
      if(Math.abs(physical.b2bLayout.sectionWidth-s.sectionWidth)>1||Math.abs(physical.b2bLayout.frameDepth-s.frameDepth)>1||Number(d.b2b?.levels)!==s.levels||Number(d.b2b?.footHeight)!==s.footHeight)throw Error(s.name+': hesaplanan ölçüler PDF ile uyuşmuyor.');
      if(Number(d.traverseHeight)!==beam)throw Error(s.name+': travers yüksekliği seçilen profille uyuşmuyor.');
      Object.assign(d,physical);
      // The generic drawing also carries Mekik's derived height. Preserve the
      // measured upright in every native drawing/report field and its snapshot.
      d.palletHeight=s.palletHeight;d.sideUprightHeight=s.footHeight;d.totalRackHeight=s.footHeight;d.deepestFoot=s.footHeight;d.straightProfileLength=s.footHeight;d.plan.feet=[s.footHeight];
      if(window.rafexB2BDetailOptionsV117&&window.rafexPhysicalLevelsV121){
        const detail=window.rafexB2BDetailOptionsV117(d),floors=window.rafexPhysicalLevelsV121(detail);
        if(floors.length!==s.levels-1||detail.palletHeights?.some((h,i)=>h!==heights[i])||Math.abs(floors[0].bottom+floors[0].beam-s.firstBeamTop)>1||floors.some((f,i)=>i&&Math.abs(f.bottom-floors[i-1].bottom-floors[i-1].beam-openings[i-1])>1)||floors.at(-1).bottom+floors.at(-1).beam>s.footHeight)throw Error(s.name+': çizim kat kotları PDF ile uyuşmuyor.');
        d.b2bViewerOptions=copy(detail);
      }
      d.rafexSystem='b2b';d.pdfSourceSpec=copy({...s,clearOpenings:openings});
      entries.push({id:-(Date.now()+i),name:s.name,source:'project',__rafexSystem:'b2b',__rafexSystemLabel:'B2B',__rafexUnified:true,drawing:d,__rafexSnapshot:copy(d)});
    }}finally{if(originalGeometry)b2bPalletGeometry=originalGeometry;b2bApplySavedInputState(previous);m2LastDrawing=last;}
    // Compatible heights/bracing use one adequately rated upright profile so
    // adjoining narrow and wide bays can share their end frame.
    for(const entry of entries){
      const d=entry.drawing;
      const compatible=entries.map(e=>e.drawing).filter(other=>other.b2b.footHeight===d.b2b.footHeight&&other.footLy===d.footLy&&other.footTableHeight===d.footTableHeight&&JSON.stringify(other.plan)===JSON.stringify(d.plan));
      const strongest=compatible.sort((a,b)=>b.footCapacity-a.footCapacity)[0];
      if(strongest&&strongest.footCapacity>=d.footLoad){
        for(const key of ['footProfile','footProfileKey','footCapacity','footType'])if(strongest[key]!=null)d[key]=strongest[key];
        Object.assign(d,b2bLayoutDrawing(d));entry.__rafexSnapshot=copy(d);
      }
    }
    return entries;
  };
  window.rafexApplyImportedLayoutV188=function(plan,entries,fileName){
    const oldState=copy(m2LayoutState),oldSymbols=copy(m2LayoutSymbols),oldTypes=copy(window.rafexProjectTypesV133||[]),oldHistory=m2UndoHistory.slice(),push=m2PushUndo;
    const oldDecorations={notes:m2UserNotes,offsets:m2DimensionOffsets,fonts:m2DimensionFontSizes,hidden:m2HiddenSummaryDimensions,visible:m2VisibleRackDimensions,pinned:m2PinnedDimensionsByRack,measure:m2FreeMeasure};
    try{
      const merged=entries.some(e=>e.importName!==undefined)?window.rafexImportedNamesV194.apply(oldTypes,entries):window.rafexMergeRackCatalog(oldTypes,entries),bySpec=new Map();
      for(const entry of entries){const id=merged.aliases['b2b:'+entry.id]||'b2b:'+entry.id;bySpec.set(entry.drawing.pdfSourceSpec.key,merged.entries.find(e=>'b2b:'+e.id===id));}
      const excluded=new Set(plan.conflicts.flat()),positions=(plan.blocks||plan.placements.filter(p=>!excluded.has(p.id))).map(copy);let adjusted=0;
      for(const p of positions){
        const entry=bySpec.get(p.key);if(!entry)throw Error('PDF tipi katalogda bulunamadı.');
        const physical=b2bLayoutDrawing(entry.drawing);p.nativeWidth=physical.totalWidth;p.nativeDepth=physical.railLength;
        p.foot=typeof m2B2BFootWidth==='function'?m2B2BFootWidth(entry.drawing):0;p.profile=entry.drawing.footProfile;p.sourceY=p.y;p.links=[];
      }
      // Connect only consecutive source bays, never bridge an aisle or a held bay.
      for(let i=0;i<positions.length;i++)for(let j=i+1;j<positions.length;j++){
        const a=positions[i],b=positions[j],gap=Math.abs(a.sourceY-b.sourceY)-(a.depth+b.depth)/2;
        const shared=(a.sourceRows||[a.row]).filter(r=>(b.sourceRows||[b.row]).includes(r));
        if(shared.length&&gap>=40&&gap<=200&&a.foot>0&&a.foot===b.foot&&a.profile===b.profile){a.links.push(j);b.links.push(i);}
      }
      const visited=new Set();let joined=0;
      // Double rows are roots so a single tail subtracts exactly one shared frame.
      const roots=positions.map((p,i)=>i).sort((a,b)=>(positions[b].rowCount||1)-(positions[a].rowCount||1)||positions[a].y-positions[b].y);
      for(const root of roots){
        if(visited.has(root))continue;visited.add(root);const queue=[root],group='pdf-join-'+root;
        for(let n=0;n<queue.length;n++){
          const i=queue[n],a=positions[i];
          for(const j of a.links){if(visited.has(j))continue;const b=positions[j];
            // A single frame cannot own the two frames of a double-row joint.
            if((b.rowCount||1)>(a.rowCount||1))continue;
            visited.add(j);queue.push(j);const sign=Math.sign(b.sourceY-a.sourceY);
            b.y=a.y+sign*((a.nativeWidth+b.nativeWidth)/2-a.foot);
            b.parentIndex=i;b.sharedSide=sign>0?'left':'right';a.joinGroup=group;b.joinGroup=group;joined++;
          }
        }
      }
      adjusted=positions.filter(p=>Math.abs(p.y-p.sourceY)>1).length;
      const horizontal=plan.orientation==='horizontal';let extentX,extentY;
      if(plan.batch){
        let offset=0;extentY=0;
        for(const index of [...new Set(positions.map(p=>p.fileIndex))]){
          const group=positions.filter(p=>p.fileIndex===index);
          for(const p of group){p.screenX=p.horizontal?p.y:p.x;p.screenY=p.horizontal?p.x:p.y;p.screenW=p.horizontal?p.nativeWidth:p.nativeDepth;p.screenH=p.horizontal?p.nativeDepth:p.nativeWidth;}
          const minX=Math.min(...group.map(p=>p.screenX-p.screenW/2)),maxX=Math.max(...group.map(p=>p.screenX+p.screenW/2)),minY=Math.min(...group.map(p=>p.screenY-p.screenH/2)),maxY=Math.max(...group.map(p=>p.screenY+p.screenH/2));
          for(const p of group){p.screenX+=offset-minX;p.screenY-=minY;}
          extentY=Math.max(extentY,maxY-minY);offset+=maxX-minX+3000;
        }
        extentX=offset-3000;
      }else{const maxX=Math.max(...positions.map(p=>p.x+p.nativeDepth/2)),maxY=Math.max(...positions.map(p=>p.y+p.nativeWidth/2));extentX=horizontal?maxY:maxX;extentY=horizontal?maxX:maxY;}
      const scale=Math.min(840/(extentX+2000),490/(extentY+2000));
      m2LayoutState.pdfImport??=null;push('PDF otomatik yerleşim');m2PushUndo=()=>{};
      m2UserNotes=[];m2DimensionOffsets={};m2DimensionFontSizes={};m2HiddenSummaryDimensions=new Set();m2VisibleRackDimensions={length:new Set(),depth:new Set()};m2PinnedDimensionsByRack={};m2FreeMeasure={points:[],hover:null};
      window.rafexProjectTypesV133=merged.entries;window.rafexUnifiedCatalogSync();
      m2LayoutState={...m2LayoutState,points:[],pathBreaks:[],cadElements:[],closed:false,openFinished:true,scale,racks:[],selected:null,pinnedRackId:null,drag:null,hover:null,mode:'idle',edgeDimensions:[],pdfImport:{fileName,files:plan.files||[fileName],raster:!!plan.raster,detected:plan.placements.length,excluded:plan.placements.filter(p=>excluded.has(p.id)),warnings:plan.warnings,adjusted,joined,doubleBlocks:positions.filter(p=>p.rowCount===2).length,warehouseBoundary:null}};
      m2LayoutSymbols=[];
      const templates=new Map();
      for(const [key,entry] of bySpec){
        m2AddRack(copy(entry.__rafexSnapshot||entry.drawing),entry.name);
        const rack=m2LayoutState.racks.pop();if(!rack)throw Error('Yerleşim bloğu oluşturulamadı.');templates.set(key,copy(rack));
      }
      const baseId=Date.now();
      for(const [i,p] of positions.entries()){
        const entry=bySpec.get(p.key),rack=copy(templates.get(p.key));
        Object.assign(rack,{id:baseId+i,x:80+(plan.batch?p.screenX:horizontal?p.y:p.x)*scale-rack.w/2,y:70+(plan.batch?p.screenY:horizontal?p.x:p.y)*scale-rack.h/2,angle:(plan.batch?p.horizontal:horizontal)?0:90,staged:false,freePlacement:false,locked:true,rafexCatalogKey:'b2b:'+entry.id,rafexSystem:'b2b',pdfSourceId:p.id,pdfSourceIds:p.sourceIds||[p.id]});
        if(p.tunnelHeight){
          rack.b2b={...rack.b2b,tunnelHeight:p.tunnelHeight};
          rack.b2bViewerOptions={...rack.b2bViewerOptions,tunnelHeight:p.tunnelHeight};
          const detail=window.rafexB2BDetailOptionsV117(rack),visible=window.rafexPhysicalLevelsV121(detail).filter(f=>f.bottom>=p.tunnelHeight);
          if(!visible.length)throw Error(p.id+': tünel üstünde kullanılabilir kat kalmıyor.');
          rack.b2b.accessories=[...(rack.b2b.accessories||[]),{type:'tray',width:300,levels:[visible[0].level]}];
          rack.b2bViewerOptions.accessories=copy(rack.b2b.accessories);
        }
        if(p.braced)rack.seismicBraces=[{id:baseId+positions.length+i,type:'light',rackIds:[rack.id]}];
        if(p.joinGroup)rack.joinGroup=p.joinGroup+'-'+baseId;
        if(p.parentIndex!==undefined){rack.sharedFootWith=baseId+p.parentIndex;rack.sharedFootSide=p.sharedSide;}
        if(!m2RackInsideArea(rack)||m2RackOverlaps(rack)){
          const error=Error(p.id+': hesaplanan raf dış ölçüsü başka bir blokla çakışıyor.');
          if(typeof m2RackBounds==='function'){
            const bounds=m2RackBounds(rack),hits=m2LayoutState.racks.filter(other=>{const b=m2RackBounds(other);return bounds.left<b.right&&bounds.right>b.left&&bounds.top<b.bottom&&bounds.bottom>b.top;});
            error.layoutConflict={id:p.id,bounds,nearby:hits.map(other=>({id:other.pdfSourceId,bounds:m2RackBounds(other)})),source:p,neighbors:hits.map(other=>positions.find(p=>p.id===other.pdfSourceId))};
          }
          throw error;
        }
        m2LayoutState.racks.push(rack);
      }
      m2LayoutState.selected=null;m2RenderSavedRackTypes();m2RenderLayout();m2RenderLayoutProductList();m2RefreshActiveReport();
      document.getElementById('rafexOpenLayoutScreen')?.click();
      const placed=positions.reduce((n,p)=>n+(p.rowCount||1),0);
      document.getElementById('m2FloorStatus').textContent=placed+' raf gözü, '+positions.length+' blok olarak yerleştirildi; '+joined+' ortak ayaklı birleşim oluşturuldu.'+(excluded.size?' '+excluded.size+' çakışan göz bekletildi.':'')+' Projeyi Kaydet ile saklayabilirsin.';
      return {placed,blocks:positions.length,joined,excluded:excluded.size,adjusted};
    }catch(error){m2LayoutState=oldState;m2LayoutSymbols=oldSymbols;window.rafexProjectTypesV133=oldTypes;m2UndoHistory.splice(0,m2UndoHistory.length,...oldHistory);m2UserNotes=oldDecorations.notes;m2DimensionOffsets=oldDecorations.offsets;m2DimensionFontSizes=oldDecorations.fonts;m2HiddenSummaryDimensions=oldDecorations.hidden;m2VisibleRackDimensions=oldDecorations.visible;m2PinnedDimensionsByRack=oldDecorations.pinned;m2FreeMeasure=oldDecorations.measure;window.rafexUnifiedCatalogSync();m2RenderLayout();throw error;}
    finally{m2PushUndo=push;m2UpdateUndoButton();}
  };
})();
