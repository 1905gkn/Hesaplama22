import fs from "node:fs";
import path from "node:path";

const portalPath = path.join(process.cwd(), "portal.html");
let html = fs.readFileSync(portalPath, "utf8");

const marker = 'const m2PerfLargeBlockVersion="v76";';
if (html.includes(marker)) {
  console.log("v76: Buyuk birlesik blok tasima yolu zaten mevcut.");
  process.exit(0);
}

function replaceRequired(from, to, label) {
  if (!html.includes(from)) throw new Error(`v76: ${label} bulunamadi.`);
  html = html.replace(from, to);
}

replaceRequired(
  `      function m2PerfMovingGroupSeismicSvg(movingIds){`,
  `      const m2PerfLargeBlockVersion="v76";
      function m2PerfIsLargeJoinedDrag(drag){return Boolean(!drag?.selectionGroup&&Array.isArray(drag?.groupMembers)&&drag.groupMembers.length>=8);}
      function m2PerfLargeBlockState(drag){
        if(drag.perfLargeBlockState)return drag.perfLargeBlockState;
        const rackById=new Map(m2LayoutState.racks.map((rack)=>[Number(rack.id),rack])),members=drag.groupMembers.map((origin)=>({origin,rack:rackById.get(Number(origin.id))})).filter((item)=>item.rack),ids=new Set(members.map((item)=>Number(item.rack.id))),boxes=members.map((item)=>m2RackBounds(item.rack,item.origin.x,item.origin.y,item.rack.angle));
        const state={members,ids,left:Math.min(...boxes.map((box)=>box.left)),right:Math.max(...boxes.map((box)=>box.right)),top:Math.min(...boxes.map((box)=>box.top)),bottom:Math.max(...boxes.map((box)=>box.bottom)),rackWrapper:null,externalWrappers:[],guideFrame:0};drag.perfLargeBlockState=state;return state;
      }
      function m2PerfLargeBlockBounds(state,dx,dy){return{left:state.left+dx,right:state.right+dx,top:state.top+dy,bottom:state.bottom+dy};}
      function m2PerfLargeBlockInside(bounds){
        const corners=[{x:bounds.left,y:bounds.top},{x:bounds.right,y:bounds.top},{x:bounds.right,y:bounds.bottom},{x:bounds.left,y:bounds.bottom}];
        if(m2LayoutState.openFinished&&!m2LayoutState.closed){
          if(corners.some((point)=>point.x<0||point.x>1000||point.y<0||point.y>650))return false;
          const breaks=m2LayoutState.pathBreaks||[];for(let index=0;index<m2LayoutState.points.length-1;index++){if(breaks.includes(index))continue;if(m2WallCrossesRack(m2LayoutState.points[index],m2LayoutState.points[index+1],corners))return false;}return true;
        }
        return corners.every(m2PointInArea);
      }
      function m2PerfLargeBlockValid(drag,dx,dy){
        const state=m2PerfLargeBlockState(drag),bounds=m2PerfLargeBlockBounds(state,dx,dy);if(!m2PerfLargeBlockInside(bounds))return false;
        if(m2PerfBlockingSymbols().some((symbol)=>{const box=m2LayoutRuntimeCache.accessories.bounds.get(Number(symbol.id))||m2SymbolBounds(symbol);return bounds.left<box.right&&bounds.right>box.left&&bounds.top<box.bottom&&bounds.bottom>box.top;}))return false;
        return !m2PerfCollisionCandidates(bounds).some((other)=>{if(state.ids.has(Number(other.id)))return false;const box=m2RackBounds(other);return bounds.left<box.right&&bounds.right>box.left&&bounds.top<box.bottom&&bounds.bottom>box.top;});
      }
      function m2PerfSmoothLargeBlock(drag,targetDx,targetDy){
        if(m2PerfLargeBlockValid(drag,targetDx,targetDy))return{dx:targetDx,dy:targetDy,exact:true};
        const candidates=[],approach=(endDx,endDy)=>{let low=0,high=1;for(let index=0;index<6;index++){const mid=(low+high)/2;if(m2PerfLargeBlockValid(drag,endDx*mid,endDy*mid))low=mid;else high=mid;}if(Math.hypot(endDx*low,endDy*low)>.001)candidates.push({dx:endDx*low,dy:endDy*low,exact:false});};
        approach(targetDx,targetDy);approach(targetDx,0);approach(0,targetDy);candidates.sort((a,b)=>Math.hypot(a.dx-targetDx,a.dy-targetDy)-Math.hypot(b.dx-targetDx,b.dy-targetDy));return candidates[0]||{dx:0,dy:0,exact:false};
      }
      function m2PerfAppendWrapper(parent,nodes,className){
        if(!parent||!nodes.length)return null;const wrapper=document.createElementNS("http://www.w3.org/2000/svg","g");wrapper.setAttribute("class",className);parent.appendChild(wrapper);nodes.forEach((node)=>wrapper.appendChild(node));return wrapper;
      }
      function m2PerfEnsureLargeBlockWrappers(drag,state,layer){
        if(state.rackWrapper?.isConnected)return;
        const rackNodes=[];state.members.forEach((item)=>{const entry=m2PerfRackDomTable.get(Number(item.rack.id));if(entry?.node?.isConnected)rackNodes.push(entry.node);(m2PerfRackAuxDomTable.get(Number(item.rack.id))||[]).forEach((aux)=>{if(aux?.node?.isConnected)rackNodes.push(aux.node);});});
        state.rackWrapper=m2PerfAppendWrapper(layer,[...new Set(rackNodes)],"rafex-large-block-drag-v76");
        const feet=Array.from(document.querySelectorAll('#m2LayoutSvg .rafex-shared-foot-layer-v60 [data-shared-foot]')).filter((node)=>{const ids=String(node.dataset.sharedFoot||"").split(":").map(Number).filter(Number.isFinite);return ids.length&&ids.every((id)=>state.ids.has(id));});
        const byParent=new Map();feet.forEach((node)=>{const parent=node.parentNode;if(!byParent.has(parent))byParent.set(parent,[]);byParent.get(parent).push(node);});byParent.forEach((nodes,parent)=>{const wrapper=m2PerfAppendWrapper(parent,nodes,"rafex-large-block-feet-v76");if(wrapper)state.externalWrappers.push(wrapper);});
      }
      function m2PerfTranslateLargeBlock(drag,state,layer,dx,dy){
        m2PerfEnsureLargeBlockWrappers(drag,state,layer);const transform="translate("+dx+" "+dy+")";if(state.rackWrapper?.isConnected)state.rackWrapper.setAttribute("transform",transform);state.externalWrappers.forEach((wrapper)=>{if(wrapper?.isConnected)wrapper.setAttribute("transform",transform);});
      }
      function m2PerfCleanupLargeBlock(drag){const state=drag?.perfLargeBlockState;if(!state)return;state.externalWrappers.forEach((wrapper)=>wrapper?.remove());state.externalWrappers=[];}
      window.rafexFreeLargeBlockV76={version:m2PerfLargeBlockVersion,isLarge:m2PerfIsLargeJoinedDrag,smooth:m2PerfSmoothLargeBlock};
      function m2PerfMovingGroupSeismicSvg(movingIds){`,
  "buyuk blok tablo ve geometri yardimcilari",
);

replaceRequired(
  `          const targetDx=nextX-drag.originX,targetDy=nextY-drag.originY,freeGroup=drag.groupMembers.some((origin)=>m2LayoutState.racks.find((item)=>item.id===origin.id)?.freePlacement),adjusted=freeGroup?m2ClampGroupTranslationToCanvas(drag.groupMembers,targetDx,targetDy):m2SmoothGroupTranslation(drag.groupMembers,targetDx,targetDy);`,
  `          const targetDx=nextX-drag.originX,targetDy=nextY-drag.originY,freeGroup=drag.groupMembers.some((origin)=>m2LayoutState.racks.find((item)=>item.id===origin.id)?.freePlacement),adjusted=freeGroup?m2ClampGroupTranslationToCanvas(drag.groupMembers,targetDx,targetDy):m2PerfIsLargeJoinedDrag(drag)?m2PerfSmoothLargeBlock(drag,targetDx,targetDy):m2SmoothGroupTranslation(drag.groupMembers,targetDx,targetDy);`,
  "canli buyuk blok hizli cakisma yolu",
);

replaceRequired(
  `        const members=m2PerfDragMembers(drag,rack),movingIds=new Set(members.map((item)=>Number(item.rack.id)));if(!members.length)return false;
        let dx=0,dy=0;`,
  `        const members=m2PerfDragMembers(drag,rack),movingIds=new Set(members.map((item)=>Number(item.rack.id)));if(!members.length)return false;
        if(m2PerfIsLargeJoinedDrag(drag)){
          const state=m2PerfLargeBlockState(drag),dx=Number(rack.x)-Number(drag.originX),dy=Number(rack.y)-Number(drag.originY);m2PerfTranslateLargeBlock(drag,state,layer,dx,dy);
          if(!m2PerfPreparedDrags.has(drag)){members.forEach((item)=>m2PerfRemoveStaticMovingGuides(layer,item.rack.id));m2PerfPreparedDrags.add(drag);}
          state.guideFrame++;if(state.guideFrame%4===1){const overlay=m2PerfEnsureDragOverlay(layer,rack.id),guideHtml=rack.freePlacement?"":m2WallDistanceGuides(rack,{left:true,right:true,top:true,bottom:true,gap:true})+m2PerfLiveRackDistanceGuide(rack)+m2ColumnDistanceGuide(rack);overlay.innerHTML=guideHtml;}
          return true;
        }
        let dx=0,dy=0;`,
  "tek SVG grup transform yolu",
);

replaceRequired(
  `          m2LayoutState.drag = null; m2DimensionDrag = null; m2RenderLayout();`,
  `          const finishedDrag=m2LayoutState.drag;m2LayoutState.drag = null;m2PerfCleanupLargeBlock(finishedDrag);m2DimensionDrag = null;m2RenderLayout();`,
  "buyuk blok drag temizligi",
);

for (const required of [
  marker,
  "m2PerfIsLargeJoinedDrag",
  "m2PerfLargeBlockState",
  "m2PerfSmoothLargeBlock",
  "rafex-large-block-drag-v76",
  "m2PerfTranslateLargeBlock",
  "m2PerfCleanupLargeBlock",
  "window.rafexFreeLargeBlockV76",
]) if (!html.includes(required)) throw new Error("v76 son dogrulama eksik: " + required);

fs.writeFileSync(portalPath, html);
console.log("v76: 8+ modullu birlesik bloklar tek SVG grubu ve tek blok cakisma siniri ile tasinir.");
