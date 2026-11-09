/* depth-join-v523 */
(function(){
      function m2JoinedDepthPlan(anchor, depthMm) {
        const feet=anchor.plan?.feet||[],braces=anchor.plan?.braces||[],parts=[];
        for(let i=0;i<Math.max(feet.length,braces.length);i++){
          if(Number(feet[i])>0)parts.push({kind:"feet",length:Number(feet[i])});
          if(Number(braces[i])>0)parts.push({kind:"braces",length:Number(braces[i])});
        }
        if(!parts.length||parts[0].kind!=="feet"||!Number.isFinite(depthMm)||depthMm<=0)return null;
        const plan={feet:[],braces:[]};let remaining=depthMm,lastKind="",index=0,railOverhang=0;
        while(remaining>0.001){
          if(lastKind==="feet"&&remaining<=100){railOverhang=remaining;break;}
          // Continue with the last available foot/tie sizes beyond the anchor's end.
          const part=parts[index++]||{kind:lastKind==="feet"?"braces":"feet",length:lastKind==="feet"?Number(braces.at(-1)||feet.at(-1)):Number(feet.at(-1))};
          // A joined shuttle can end inside the next anchor frame. Keep the
          // completed frames and finish with one upright profile, not a frame
          // extending beyond the last pallet. Drive-In retains its own frame rule.
          if(part.kind==="feet"&&remaining<part.length-.001&&plan.feet.length&&anchor.rafexSystem!=="drive"){
            plan.braces[plan.braces.length-1]+=remaining;remaining=0;lastKind="braces";break;
          }
          const length=part.kind==="feet"?part.length:Math.min(remaining,part.length);
          if(!Number.isFinite(length)||length<=0)return null;
          plan[part.kind].push(length);remaining-=length;lastKind=part.kind;
        }
        const supportLength=[...plan.feet,...plan.braces].reduce((sum,length)=>sum+length,0);
        return {plan,hasExtra:lastKind==="braces",railOverhang,supportLength,depthMm:supportLength+railOverhang};
      }
      function m2DepthJoinDrawing(first,rack){
        const count=Math.max(1,Math.round(Number(rack.depth)||1)),palD=Number(first.palD)||Number(rack.palD);
        if(!(palD>0))return null;
        // Slice the anchor's actual pallet positions, not a newly optimized 3-pallet layout.
        const fallback=m2PalletDepthLayout(Math.max(count,Number(first.depth)||count),palD,first.systemType,first.firstPalletGap??200,first.palletGap??50);
        const positions=Array.from({length:count},(_,i)=>Number.isFinite(first.palletPositions?.[i])?first.palletPositions[i]:fallback.positions[i]);
        const adapted=m2JoinedDepthPlan(first,positions.at(-1)+palD);if(!adapted)return null;
        const next={...rack,...adapted,plan:{...rack.plan,...adapted.plan},palD,palletPositions:positions,palletGaps:positions.slice(1).map((position,i)=>position-positions[i]-palD)};
        for(const key of ['systemType','firstPalletGap','palletGap','firstRailHeight','levelH','levels','loadedLevels','traverseHeight','railHeight','railThickness','traverseRecommendation','footType','footProfile','footProfileKey','footLy','sideUprightHeight','totalRackHeight']){
          if(first[key]!==undefined)next[key]=first[key];
        }
        next.railLength=next.depthMm;next.totalWidth=next.widthMm;
        next.h=rack.h*next.depthMm/rack.depthMm;
        next.straightProfileCount=next.hasExtra?(Number(next.bays)||1)+1:0;
        next.straightProfileLength=Number(next.sideUprightHeight)||Number(next.totalRackHeight)||0;
        next.deepestFoot=Math.max(...next.plan.feet);next.deepestBrace=Math.max(0,...next.plan.braces);
        next.totalPalletLoad=count*(Number(next.loadedLevels)||Number(next.levels)||1)*(Number(next.palletWeight)||0);
        next.railLengthMeters=next.depthMm/1000;
        next.footLoad=m2CalculateFootLoad(next.totalPalletLoad,next.depthMm,next.deepestFoot,next.deepestBrace);
        for(const key of ['mekikCustomizationV514','driveCustomizationV521']){
          delete next[key];if(first[key]){next[key]=structuredClone(first[key]);next[key].depths=Array.from({length:next.levels},(_,i)=>Math.min(count,Number(first[key].depths?.[i])||count));next[key].frameLevels=(first[key].frameLevels||[]).slice(0,next.plan.feet.length);next[key].frameHeights=(first[key].frameHeights||[]).slice(0,next.plan.feet.length);}
        }
        delete next.rackDetail;
        next.joinReferenceId=first.id;
        return next;
      }
      function m2DepthJoinSystem(rack){
        if(!rack||rack.b2bLayout||rack.b2b||(rack.rafexSystem&&!['mekik2','drive'].includes(rack.rafexSystem))||!rack.plan?.feet?.length)return null;
        return rack.rafexSystem==="drive"?"drive":"mekik2";
      }
      function m2ChooseDepthJoinRack(rack){
        const status=$("m2FloorStatus"),system=m2DepthJoinSystem(rack);
        if(!system){status.textContent="Aynı sistemden iki raf seçin.";return;}
        if(m2JoinFirstRackId==null){m2JoinFirstRackId=rack.id;m2LayoutState.selected=rack.id;status.textContent="Referans raf seçildi. Ayak düzeni uyarlanacak ikinci rafı seçin.";m2RenderLayout();return;}
        const first=m2LayoutState.racks.find(item=>item.id===m2JoinFirstRackId);
        if(first===rack){status.textContent="İkinci olarak farklı bir raf seçin.";return;}
        const angleDelta=((Number(first?.angle)-Number(rack.angle))%360+360)%360;
        if(m2DepthJoinSystem(first)!==system||Math.min(angleDelta,360-angleDelta)>.1){status.textContent="Birleşecek rafların sistemi ve giriş yönü aynı olmalı.";return;}
        if(rack.joinGroup){status.textContent="Eklenecek rafı önce mevcut birleşiminden ayırın.";return;}
        const adapted=m2DepthJoinDrawing(first,rack);
        if(!adapted){status.textContent="Referans rafın ayak dağılımı geçerli değil.";return;}
        const radians=Number(first.angle)*Math.PI/180,ux=Math.cos(radians),uy=Math.sin(radians),nx=-uy,ny=ux;
        const cx=first.x+first.w/2,cy=first.y+first.h/2,sign=((rack.x+rack.w/2-cx)*ux+(rack.y+rack.h/2-cy)*uy)>=0?1:-1;
        // Front edges stay flush, including rotated blocks of unequal depth.
        const distance=(first.w+adapted.w)/2,depthOffset=(adapted.h-first.h)/2;
        const nextX=cx+sign*ux*distance+nx*depthOffset-adapted.w/2,nextY=cy+sign*uy*distance+ny*depthOffset-adapted.h/2;
        if(!m2RackInsideArea(adapted,nextX,nextY,rack.angle)||m2RackOverlapsExcept(adapted,nextX,nextY,rack.angle,[first.id])){status.textContent="Birleşim konumu duvara veya başka bir rafa taşıyor; raflar birleştirilmedi.";return;}
        const signature=item=>JSON.stringify([item.plan.feet,item.plan.braces,Boolean(item.hasExtra),Number(item.depthMm),item.firstRailHeight,item.levelH,item.levels,item.traverseHeight,item.railHeight,item.footProfile,item.palletPositions||[]]);
        const changed=signature(rack)!==signature(adapted);
        m2PushUndo("Raf birleştirme");
        const undo=m2UndoHistory.at(-1);if(changed&&undo){undo.joinSavedRackTypes=JSON.parse(JSON.stringify(m2SavedRackTypes));undo.joinSelectedSavedType=m2SelectedSavedType;}
        Object.assign(rack,adapted);rack.x=nextX;rack.y=nextY;rack.specLocked=true;rack.locked=true;rack.freePlacement=false;rack.staged=false;
        if(changed){
          const used=new Set([...(window.rafexProjectTypesV133||[]).map(item=>item.name),...m2SavedRackTypes.map(item=>item.name),...m2LayoutState.racks.map(item=>item.typeName)].filter(Boolean).map(name=>String(name).trim().toUpperCase()));
          let number=1,name;do{name=b2bTypeLetter("",number++);}while(used.has(name));
          rack.typeName=name;rack.typeColor=m2TypeColor(name);
          const drawing=JSON.parse(JSON.stringify(rack));
          for(const key of ['id','x','y','w','h','angle','blockName','joinGroup','sharedFootWith','sharedFootSide','joinReferenceId'])delete drawing[key];
          const entry={id:-Date.now(),name,drawing,source:'custom',system,__rafexSystem:system};
          window.rafexCommitCustomTypeV184?.(rack,entry,null);
          entry.name=rack.typeName;entry.drawing={...drawing,typeName:rack.typeName,rafexCatalogKey:rack.rafexCatalogKey};
          m2SavedRackTypes.push(entry);m2RenderSavedRackTypes();
        }
        const group=first.joinGroup||`join-${Date.now()}`;first.joinGroup=group;rack.joinGroup=group;rack.sharedFootWith=first.id;rack.sharedFootSide=sign>0?"left":"right";
        m2JoinMode=false;m2JoinFirstRackId=null;m2LayoutState.selected=rack.id;
        $("m2JoinRackButton")?.classList.remove("active");$("m2JoinRackButton")?.setAttribute("aria-pressed","false");
        status.textContent=changed?`${first.typeName||"Referans"} korundu; eklenen raf ${rack.typeName} tipi olarak kendi palet derinliğine uyarlandı.`:"Raflar referans ayak düzeniyle birleştirildi; tip değişmedi.";
        m2RenderLayout();
      }

 const choose=m2ChooseJoinRack,commit=m2CommitMultiSelection,undoAction=m2UndoLastAction;
 m2ChooseJoinRack=function(id){const rack=m2LayoutState.racks.find(r=>r.id===id);if(m2DepthJoinSystem(rack)||m2DepthJoinSystem(m2LayoutState.racks.find(r=>r.id===m2JoinFirstRackId)))return m2ChooseDepthJoinRack(rack);return choose.apply(this,arguments);};
 m2CommitMultiSelection=function(request=null){
  const anchor=m2LayoutState.racks.find(r=>r.id===m2JoinFirstRackId);
  if(!m2JoinMode||!m2DepthJoinSystem(anchor))return commit.apply(this,arguments);
  let moving=request?m2LayoutState.racks.filter(r=>r.id===request.rackId):[];
  if(!request&&m2MultiSelect.start&&m2MultiSelect.hover){const a=m2MultiSelect.start,b=m2MultiSelect.hover;moving=m2LayoutState.racks.filter(r=>{const v=m2RackBounds(r);return r.id!==anchor.id&&v.cx>=Math.min(a.x,b.x)&&v.cx<=Math.max(a.x,b.x)&&v.cy>=Math.min(a.y,b.y)&&v.cy<=Math.max(a.y,b.y);});}
  m2MultiSelect.start=null;m2MultiSelect.hover=null;
  if(moving.length!==1){$('m2FloorStatus').textContent='Mekik / Drive-in birleşimi için eklenecek tek bloğu seçin.';m2RenderLayout();return;}
  const before=m2UndoHistory.length,catalog=structuredClone(window.rafexProjectTypesV133||[]),selected=window.rafexSelectedCatalogKey;
  m2ChooseDepthJoinRack(moving[0]);
  if(m2UndoHistory.length>before){Object.assign(m2UndoHistory.at(-1),{joinCatalogV523:catalog,joinCatalogSelectedV523:selected});m2ClearMultiSelection();document.getElementById('m2LayoutSvg')?.classList.remove('m2-multi-selecting');m2RenderLayout();}
 };
 m2UndoLastAction=function(){const s=m2UndoHistory.at(-1);if(s?.joinSavedRackTypes){m2SavedRackTypes=structuredClone(s.joinSavedRackTypes);m2SelectedSavedType=s.joinSelectedSavedType;}if(s?.joinCatalogV523){window.rafexProjectTypesV133=structuredClone(s.joinCatalogV523);window.rafexSelectedCatalogKey=s.joinCatalogSelectedV523;}const result=undoAction.apply(this,arguments);m2RenderSavedRackTypes();return result;};
 // Repair only legacy generated joins that unnecessarily extended a complete
 // final frame beyond the last pallet. Keep the entry edge, names and custom
 // floor settings; standalone/manual layouts are never rewritten.
 const renderJoined=m2RenderLayout;
 m2RenderLayout=function(){
  for(const rack of m2LayoutState.racks){
   if(!rack.joinReferenceId||!rack.joinGroup||rack.hasExtra||rack.plan?.manual||m2DepthJoinSystem(rack)!=='mekik2')continue;
   const first=m2LayoutState.racks.find(r=>r.id===rack.joinReferenceId&&r.joinGroup===rack.joinGroup);
   const palletEnd=Number(rack.palletPositions?.at(-1))+Number(rack.palD);
   if(!first||!(Number(rack.depthMm)>palletEnd+100))continue;
   const next=m2DepthJoinDrawing(first,rack);
   if(!next?.hasExtra||!(next.depthMm<rack.depthMm-.1))continue;
   const delta=(next.h-rack.h)/2,angle=Number(rack.angle||0)*Math.PI/180;
   rack.x-=Math.sin(angle)*delta;rack.y+=(Math.cos(angle)-1)*delta;
   for(const key of ['plan','hasExtra','railOverhang','supportLength','depthMm','railLength','h','straightProfileCount','straightProfileLength','deepestFoot','deepestBrace','railLengthMeters','footLoad'])rack[key]=next[key];
   delete rack.rackDetail;
  }
  return renderJoined.apply(this,arguments);
 };
 window.rafexDepthJoinV523={plan:m2JoinedDepthPlan,drawing:m2DepthJoinDrawing};

})();

