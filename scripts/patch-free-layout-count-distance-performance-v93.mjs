import fs from "node:fs";
import path from "node:path";

const portalPath = path.join(process.cwd(), "portal.html");
let html = fs.readFileSync(portalPath, "utf8");

const marker = 'const m2PerfCountDistanceVersion="v93";';
if (html.includes(marker)) {
  console.log("v93: Serbest yerlesim sayim/mesafe performansi zaten mevcut.");
  process.exit(0);
}

function replaceRequired(from, to, label) {
  if (!html.includes(from)) throw new Error(`v93: ${label} bulunamadi.`);
  html = html.replace(from, to);
}

function replaceFunction(source, signature, replacement) {
  const start = source.indexOf(signature);
  if (start < 0) throw new Error(`v93: ${signature} bulunamadi.`);
  const braceStart = source.indexOf("{", start);
  if (braceStart < 0) throw new Error(`v93: ${signature} govde basi bulunamadi.`);
  let depth = 0;
  let quote = null;
  let escape = false;
  for (let index = braceStart; index < source.length; index += 1) {
    const ch = source[index];
    if (quote) {
      if (escape) { escape = false; continue; }
      if (ch === "\\") { escape = true; continue; }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") { quote = ch; continue; }
    if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(0, start) + replacement + source.slice(index + 1);
    }
  }
  throw new Error(`v93: ${signature} govde sonu bulunamadi.`);
}

// Raf secmek, 390 raflik projede tum yerlesimi JSON ile kopyaliyordu. Geri alma
// icin yalniz tasinabilen koordinat ve yerlestirme bayraklari yeterlidir.
replaceRequired(
  `      function m2PushUndo(label){m2UndoHistory.push(m2UndoSnapshot(label));if(m2UndoHistory.length>30)m2UndoHistory.shift();m2UpdateUndoButton();}
      function m2DiscardUndo(){m2UndoHistory.pop();m2UpdateUndoButton();}`,
  `      function m2PushUndo(label){m2UndoHistory.push(m2UndoSnapshot(label));if(m2UndoHistory.length>30)m2UndoHistory.shift();m2UpdateUndoButton();}
      function m2PushFastDragUndo(drag){
        const origins=Array.isArray(drag?.groupMembers)&&drag.groupMembers.length?drag.groupMembers:[{id:drag?.id}];
        const racks=origins.map((origin)=>{const rack=m2LayoutState.racks.find((item)=>Number(item.id)===Number(origin.id));return rack?{id:rack.id,x:rack.x,y:rack.y,freePlacement:!!rack.freePlacement,staged:!!rack.staged,locked:!!rack.locked}:null}).filter(Boolean);
        const symbols=(drag?.symbolMembers||[]).map((origin)=>{const symbol=m2LayoutSymbols.find((item)=>Number(item.id)===Number(origin.id));return symbol?{id:symbol.id,x:symbol.x,y:symbol.y}:null}).filter(Boolean);
        const snapshot={label:"Raf taşıma",fastDrag:{racks,symbols}};drag.rafexFastUndo=snapshot.fastDrag;
        m2UndoHistory.push(snapshot);if(m2UndoHistory.length>30)m2UndoHistory.shift();m2UpdateUndoButton();
      }
      function m2FastDragUnchanged(drag){
        const saved=drag?.rafexFastUndo;if(!saved)return false;
        return saved.racks.every((item)=>{const rack=m2LayoutState.racks.find((entry)=>Number(entry.id)===Number(item.id));return rack&&Number(rack.x)===Number(item.x)&&Number(rack.y)===Number(item.y)&&!!rack.freePlacement===item.freePlacement&&!!rack.staged===item.staged&&!!rack.locked===item.locked;})&&saved.symbols.every((item)=>{const symbol=m2LayoutSymbols.find((entry)=>Number(entry.id)===Number(item.id));return symbol&&Number(symbol.x)===Number(item.x)&&Number(symbol.y)===Number(item.y);});
      }
      function m2CanFastFinishStaticClick(drag){
        const saved=drag?.rafexFastUndo,origin=saved?.racks?.[0];
        return saved?.racks?.length===1&&!saved.symbols.length&&!drag.selectionGroup&&Number(drag.groupMembers?.length||1)===1&&!origin.freePlacement&&!origin.staged&&m2FastDragUnchanged(drag);
      }
      function m2PerfRefreshStaticSelectionUi(rackId){
        const layer=$("m2LayoutContent");
        if(layer)layer.querySelectorAll("g[data-rack]").forEach((group)=>{const selected=Number(group.dataset.rack)===Number(rackId)||m2MultiSelect.rackIds.has(Number(group.dataset.rack)),rect=group.querySelector(".m2-layout-rack"),color=group.dataset.typeColor||"#2878d0";if(rect){rect.classList.toggle("selected",selected);rect.style.fill=selected?color+"24":"transparent";rect.style.stroke=selected?color:"transparent";}});
        const activeRack=m2SelectedRack();
        [["m2ShowTotalLength","length"],["m2ShowTotalDepth","depth"]].forEach(([id,kind])=>{const button=$(id),active=Boolean(activeRack&&m2VisibleRackDimensions[kind].has(activeRack.id));if(button){button.classList.toggle("active",active);button.setAttribute("aria-pressed",String(active));}});
        const wallEditor=$("m2WallEditor"),measurementRack=m2MeasurementRack();
        if(wallEditor){
          wallEditor.hidden=false;wallEditor.style.display=m2ActiveModule==="b2b"?"grid":"";wallEditor.replaceChildren();
          if(m2ActiveModule==="b2b"){
            const title=document.createElement("div"),name=document.createElement("small"),caption=document.createElement("span");title.className="m2-wall-editor-title";caption.textContent="RAF / DUVAR UZAKLIKLARI";name.textContent=measurementRack?.blockName||measurementRack?.typeName||"RAF";title.append(caption,name);wallEditor.appendChild(title);
          }
          if(!measurementRack){if(m2ActiveModule==="b2b"){const empty=document.createElement("div");empty.className="m2-wall-editor-empty";empty.textContent="Uzaklıkları görmek için yerleşime bir raf bloğu ekle.";wallEditor.appendChild(empty);}}
          else{
            const measurements=m2WallMeasurements(measurementRack),labels={left:"Sol duvar",right:"Sağ duvar",top:"Üst duvar",bottom:"Alt duvar"},nearest=m2NearestRackGap(measurementRack),nearestColumn=m2NearestColumnGap(measurementRack),rackPinned=m2PinnedForRack(measurementRack.id);
            const appendField=(label,value,pinKey,onChange,aria)=>{const row=document.createElement("label"),text=document.createElement("span"),input=document.createElement("input");row.className="m2-edge-field dimension-field";if(pinKey){const pin=document.createElement("input");pin.type="checkbox";pin.checked=!!rackPinned[pinKey];pin.setAttribute("aria-label",label+" ölçüsünü sabitle");pin.addEventListener("change",()=>m2TogglePinnedDimension(pinKey,pin.checked));row.appendChild(pin);}else{const icon=document.createElement("i");icon.setAttribute("aria-hidden","true");icon.textContent="↔";row.appendChild(icon);}text.textContent=label;input.type="number";input.min="0";input.step="1";input.value=String(value);input.setAttribute("aria-label",aria);input.addEventListener("input",(event)=>event.stopPropagation());input.addEventListener("change",()=>onChange(input.value));row.append(text,input);wallEditor.appendChild(row);};
            Object.entries(measurements).forEach(([direction,item])=>appendField(labels[direction],Math.round(item.px/m2LayoutState.scale),direction,(value)=>m2SetWallDistance(direction,value),labels[direction]+" mesafesi milimetre"));
            if(nearest)appendField("En yakın raf arası",Math.max(0,Math.round(nearest.distance/m2LayoutState.scale)-nearest.clearanceMm),"gap",(value)=>m2SetRackCenterDistance(value),"En yakın raf arası gösterge ölçüsü milimetre");
            if(nearestColumn)appendField("Kolon–raf arası",Math.max(0,Math.round(nearestColumn.distance/m2LayoutState.scale)),null,(value)=>m2SetColumnDistance(value),"Kolon ile raf arası mesafe milimetre");
          }
        }
        m2RenderSelectedRackInfo();
      }
      function m2DiscardUndo(){m2UndoHistory.pop();m2UpdateUndoButton();}`,
  "hafif raf tasima geri alma kaydi",
);

replaceRequired(
  `      function m2UndoLastAction(){
        const snapshot=m2UndoHistory.pop();if(!snapshot){m2UpdateUndoButton();return;}
        m2LayoutState={...m2LayoutState,...snapshot.layout,drag:null,hover:null,mode:snapshot.layout.mode||"idle"};`,
  `      function m2UndoLastAction(){
        const snapshot=m2UndoHistory.pop();if(!snapshot){m2UpdateUndoButton();return;}
        if(snapshot.fastDrag){
          snapshot.fastDrag.racks.forEach((saved)=>{const rack=m2LayoutState.racks.find((item)=>Number(item.id)===Number(saved.id));if(rack){rack.x=saved.x;rack.y=saved.y;rack.freePlacement=saved.freePlacement;rack.staged=saved.staged;rack.locked=saved.locked;}});
          snapshot.fastDrag.symbols.forEach((saved)=>{const symbol=m2LayoutSymbols.find((item)=>Number(item.id)===Number(saved.id));if(symbol){symbol.x=saved.x;symbol.y=saved.y;}});
          m2LayoutState.drag=null;m2LayoutState.hover=null;m2RenderLayout();m2UpdateUndoButton();return;
        }
        m2LayoutState={...m2LayoutState,...snapshot.layout,drag:null,hover:null,mode:snapshot.layout.mode||"idle"};`,
  "hafif geri alma uygulamasi",
);

replaceRequired(
  `            m2PushUndo("Raf taşıma");
            svg.setPointerCapture?.(event.pointerId); m2QueueLayoutRender();`,
  `            m2PushFastDragUndo(m2LayoutState.drag);
            svg.setPointerCapture?.(event.pointerId); m2QueueLayoutRender();`,
  "raf seciminde tam proje kopyasi",
);

const distanceRuntime = `      const m2PerfCountDistanceVersion="v93";
      const m2PerfDistanceIndex={signature:"",cellSize:50,racks:[],bounds:new Map(),grid:new Map(),columns:[],columnBounds:new Map(),walls:[],nearest:new Map(),columnNearest:new Map(),wallMeasurements:new Map(),activeComputes:0,stats:{rebuilds:0,nearestComputes:0,nearestHits:0,blockerCandidates:0}};
      function m2PerfDistanceSignature(){
        const rackPart=(m2LayoutState.racks||[]).map((rack)=>[rack.id,rack.x,rack.y,rack.w,rack.h,rack.angle,rack.joinGroup||"",rack.layoutView||"",rack.depthMm||"",(rack.plan?.feet||[]).join(",")].join(":" )).join("|");
        const wallPart=[m2LayoutState.closed?1:0,m2LayoutState.openFinished?1:0,(m2LayoutState.pathBreaks||[]).join(","),...(m2LayoutState.points||[]).map((point)=>point.x+":"+point.y)].join("|");
        const columnPart=(m2LayoutSymbols||[]).filter((symbol)=>symbol.type==="column").map((symbol)=>[symbol.id,symbol.x,symbol.y,symbol.w,symbol.h,symbol.angle||0].join(":" )).join("|");
        return rackPart+"#"+wallPart+"#"+columnPart;
      }
      function m2PerfDistanceCellKey(x,y){return x+":"+y;}
      function m2PerfDistancePrepare(){
        const table=m2PerfDistanceIndex;if(table.activeComputes>0)return table;const signature=m2PerfDistanceSignature();if(table.signature===signature)return table;
        const grid=new Map(),bounds=new Map(),cellSize=table.cellSize,add=(gx,gy,id)=>{const key=m2PerfDistanceCellKey(gx,gy),list=grid.get(key);if(list)list.push(id);else grid.set(key,[id]);};
        (m2LayoutState.racks||[]).forEach((rack)=>{const box=m2RackBounds(rack);bounds.set(Number(rack.id),box);const x0=Math.floor((box.left-.001)/cellSize),x1=Math.floor((box.right+.001)/cellSize),y0=Math.floor((box.top-.001)/cellSize),y1=Math.floor((box.bottom+.001)/cellSize);for(let gx=x0;gx<=x1;gx+=1)for(let gy=y0;gy<=y1;gy+=1)add(gx,gy,Number(rack.id));});
        const columns=(m2LayoutSymbols||[]).filter((symbol)=>symbol.type==="column"),columnBounds=new Map();columns.forEach((symbol)=>columnBounds.set(Number(symbol.id),m2SymbolBounds(symbol)));
        const walls=[],breaks=new Set(m2LayoutState.pathBreaks||[]),points=m2LayoutState.points||[],wallEnd=m2LayoutState.closed?points.length:Math.max(0,points.length-1);for(let index=0;index<wallEnd;index+=1){if(!m2LayoutState.closed&&breaks.has(index))continue;const a=points[index],b=points[(index+1)%points.length];if(a&&b)walls.push({a,b});}
        table.signature=signature;table.racks=m2LayoutState.racks||[];table.bounds=bounds;table.grid=grid;table.columns=columns;table.columnBounds=columnBounds;table.walls=walls;table.nearest.clear();table.columnNearest.clear();table.wallMeasurements.clear();table.stats.rebuilds+=1;return table;
      }
      function m2PerfDistanceLineCandidates(table,ax,ay,bx,by){
        const cellSize=table.cellSize,epsilon=.001,x0=Math.floor((Math.min(ax,bx)-epsilon)/cellSize),x1=Math.floor((Math.max(ax,bx)+epsilon)/cellSize),y0=Math.floor((Math.min(ay,by)-epsilon)/cellSize),y1=Math.floor((Math.max(ay,by)+epsilon)/cellSize),ids=new Set();
        for(let gx=x0;gx<=x1;gx+=1)for(let gy=y0;gy<=y1;gy+=1)(table.grid.get(m2PerfDistanceCellKey(gx,gy))||[]).forEach((id)=>ids.add(id));
        table.stats.blockerCandidates+=ids.size;return ids;
      }
      window.rafexFreeCountDistancePerfV93=m2PerfDistanceIndex;
`;

const nearestAnchor = "      function m2NearestRackGap(rack) {";
if (!html.includes(nearestAnchor)) throw new Error("v93: en yakin raf ankraji bulunamadi.");
html = html.replace(nearestAnchor, distanceRuntime + nearestAnchor);

html = replaceFunction(html, "      function m2NearestRackGap(rack) {", `      function m2NearestRackGap(rack) {
        const table=m2PerfDistancePrepare(),a=m2CombinedRackBounds(rack),selectedIds=m2MultiSelect.rackIds.size>1&&m2MultiSelect.rackIds.has(rack?.id)?[...m2MultiSelect.rackIds].map(Number).sort((x,y)=>x-y).join(","):"",key=[rack.id,a.left,a.right,a.top,a.bottom,selectedIds].join(":" );
        if(table.nearest.has(key)){table.stats.nearestHits+=1;return table.nearest.get(key);}
        table.stats.nearestComputes+=1;let nearest=null;table.activeComputes+=1;
        try{table.racks.forEach((other)=>{
          if(other.id===rack.id||(rack.joinGroup&&other.joinGroup===rack.joinGroup))return;
          const b=table.bounds.get(Number(other.id))||m2RackBounds(other),candidates=[],horizontalStart=Math.max(a.top,b.top),horizontalEnd=Math.min(a.bottom,b.bottom),verticalStart=Math.max(a.left,b.left),verticalEnd=Math.min(a.right,b.right);
          if(a.right<=b.left&&horizontalStart<=horizontalEnd){const candidate=m2ClearRackGapLine(rack,other,"right",a.right,b.left,horizontalStart,horizontalEnd);if(candidate)candidates.push(candidate);}
          if(b.right<=a.left&&horizontalStart<=horizontalEnd){const candidate=m2ClearRackGapLine(rack,other,"left",a.left,b.right,horizontalStart,horizontalEnd);if(candidate)candidates.push(candidate);}
          if(a.bottom<=b.top&&verticalStart<=verticalEnd){const candidate=m2ClearRackGapLine(rack,other,"bottom",a.bottom,b.top,verticalStart,verticalEnd);if(candidate)candidates.push(candidate);}
          if(b.bottom<=a.top&&verticalStart<=verticalEnd){const candidate=m2ClearRackGapLine(rack,other,"top",a.top,b.bottom,verticalStart,verticalEnd);if(candidate)candidates.push(candidate);}
          const candidate=candidates.sort((first,second)=>first.distance-second.distance)[0];if(candidate)candidate.clearanceMm=m2RackClearanceMm(rack,other,candidate.direction);if(candidate&&(!nearest||candidate.distance<nearest.distance))nearest={...candidate,other,a,b};
        });}finally{table.activeComputes=Math.max(0,table.activeComputes-1);}
        table.nearest.set(key,nearest);return nearest;
      }`);

html = replaceFunction(html, "      function m2RackGapLineBlocked(ax, ay, bx, by, rackId, otherId) {", `      function m2RackGapLineBlocked(ax, ay, bx, by, rackId, otherId) {
        const table=m2PerfDistancePrepare(),lineA={x:ax,y:ay},lineB={x:bx,y:by};
        for(const wall of table.walls)if(m2SegmentsTouch(lineA,lineB,wall.a,wall.b))return true;
        const horizontal=Math.abs(ay-by)<.001,ids=m2PerfDistanceLineCandidates(table,ax,ay,bx,by);
        for(const id of ids){if(Number(id)===Number(rackId)||Number(id)===Number(otherId))continue;const bounds=table.bounds.get(Number(id));if(!bounds)continue;const blocked=horizontal?ay>bounds.top&&ay<bounds.bottom&&Math.max(Math.min(ax,bx),bounds.left)<Math.min(Math.max(ax,bx),bounds.right):ax>bounds.left&&ax<bounds.right&&Math.max(Math.min(ay,by),bounds.top)<Math.min(Math.max(ay,by),bounds.bottom);if(blocked)return true;}
        return false;
      }`);

html = replaceFunction(html, "      function m2NearestColumnGap(rack) {", `      function m2NearestColumnGap(rack) {
        const table=m2PerfDistancePrepare(),a=m2CombinedRackBounds(rack),key=[rack.id,a.left,a.right,a.top,a.bottom].join(":" );if(table.columnNearest.has(key))return table.columnNearest.get(key);let nearest=null;
        table.columns.forEach((symbol)=>{const b=table.columnBounds.get(Number(symbol.id))||m2SymbolBounds(symbol),horizontalStart=Math.max(a.top,b.top),horizontalEnd=Math.min(a.bottom,b.bottom),verticalStart=Math.max(a.left,b.left),verticalEnd=Math.min(a.right,b.right);let candidate=null;if(a.right<=b.left&&horizontalStart<=horizontalEnd)candidate={direction:"right",distance:b.left-a.right,ax:a.right,ay:(horizontalStart+horizontalEnd)/2,bx:b.left,by:(horizontalStart+horizontalEnd)/2};else if(b.right<=a.left&&horizontalStart<=horizontalEnd)candidate={direction:"left",distance:a.left-b.right,ax:a.left,ay:(horizontalStart+horizontalEnd)/2,bx:b.right,by:(horizontalStart+horizontalEnd)/2};else if(a.bottom<=b.top&&verticalStart<=verticalEnd)candidate={direction:"bottom",distance:b.top-a.bottom,ax:(verticalStart+verticalEnd)/2,ay:a.bottom,bx:(verticalStart+verticalEnd)/2,by:b.top};else if(b.bottom<=a.top&&verticalStart<=verticalEnd)candidate={direction:"top",distance:a.top-b.bottom,ax:(verticalStart+verticalEnd)/2,ay:a.top,bx:(verticalStart+verticalEnd)/2,by:b.bottom};if(candidate&&(!nearest||candidate.distance<nearest.distance))nearest={...candidate,symbol};});
        table.columnNearest.set(key,nearest);return nearest;
      }`);

const wallSignature = "      function m2WallMeasurements(rack) {";
const wallStart = html.indexOf(wallSignature);
const wallEnd = html.indexOf("      function m2WallDistanceGuides", wallStart);
if (wallStart < 0 || wallEnd < 0) throw new Error("v93: duvar mesafe fonksiyonu bulunamadi.");
const wallSource = html.slice(wallStart, wallEnd);
if (!wallSource.includes("m2PerfWallGeometryTable")) throw new Error("v93: v29 duvar tablosu aktif degil.");
const wallCached = wallSource
  .replace(
    wallSignature,
    `      function m2WallMeasurements(rack) {
        const distanceTable=m2PerfDistancePrepare(),distanceBox=m2CombinedRackBounds(rack),distanceKey=[rack.id,distanceBox.left,distanceBox.right,distanceBox.top,distanceBox.bottom].join(":" );if(distanceTable.wallMeasurements.has(distanceKey))return distanceTable.wallMeasurements.get(distanceKey);`,
  )
  .replace(
    "        m2PerfRememberDistanceDependency(rack,\"walls\",result);return result;",
    "        m2PerfRememberDistanceDependency(rack,\"walls\",result);distanceTable.wallMeasurements.set(distanceKey,result);return result;",
  )
  .replace(
    "m2PerfRememberDistanceDependency(rack,\"walls\",empty);return empty;",
    "m2PerfRememberDistanceDependency(rack,\"walls\",empty);distanceTable.wallMeasurements.set(distanceKey,empty);return empty;",
  );
if (!wallCached.includes("distanceTable.wallMeasurements.set")) throw new Error("v93: duvar mesafe cache eklenemedi.");
html = html.slice(0, wallStart) + wallCached + html.slice(wallEnd);

// Tiklayip hic tasimadan birakmak geri alma listesine sahte bir hareket eklemesin.
replaceRequired(
  `          m2LayoutState.drag = null; m2DimensionDrag = null; m2RenderLayout();`,
  `          const finishedDrag=m2LayoutState.drag;
          if(finishedDrag&&m2CanFastFinishStaticClick(finishedDrag)){
            if(m2LayoutRenderFrame!=null){cancelAnimationFrame(m2LayoutRenderFrame);m2LayoutRenderFrame=null;}
            if(typeof m2PerfRenderSingleRackDragFrame==="function")m2PerfRenderSingleRackDragFrame();
            m2DiscardUndo();m2LayoutState.drag=null;m2DimensionDrag=null;m2PerfRefreshStaticSelectionUi(finishedDrag.id);return;
          }
          m2LayoutState.drag=null;m2DimensionDrag=null;if(finishedDrag&&m2FastDragUnchanged(finishedDrag))m2DiscardUndo();m2RenderLayout();`,
  "hareketsiz tiklama geri alma temizligi",
);

for (const required of [
  marker,
  "m2PushFastDragUndo(m2LayoutState.drag)",
  "m2CanFastFinishStaticClick(finishedDrag)",
  "m2PerfRefreshStaticSelectionUi(finishedDrag.id)",
  "snapshot.fastDrag",
  "m2PerfDistanceLineCandidates",
  "table.nearest.has(key)",
  "distanceTable.wallMeasurements.set",
  "window.rafexFreeCountDistancePerfV93",
]) if (!html.includes(required)) throw new Error(`v93 son dogrulama eksik: ${required}`);

fs.writeFileSync(portalPath, html);
console.log("v93: Goruntu degismeden hafif drag undo, mesafe spatial index/cache ve duvar/kolon cache aktif.");
