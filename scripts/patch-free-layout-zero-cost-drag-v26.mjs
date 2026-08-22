import fs from "node:fs";
import path from "node:path";

const portalPath = path.join(process.cwd(), "portal.html");
let html = fs.readFileSync(portalPath, "utf8");

function replaceRequired(from, to, label) {
  if (html.includes(to)) return;
  if (!html.includes(from)) throw new Error(`Serbest performans v26: ${label} bulunamadi`);
  html = html.replace(from, to);
}

// Drag undo icin tum projeyi JSON clone etmek yerine sadece hareket eden elemanlarin
// konum/yerlesim durumunu sakla. Buyuk projelerde ilk tiklamadaki donmayi kaldirir.
replaceRequired(
  `      function m2PushUndo(label){m2UndoHistory.push(m2UndoSnapshot(label));if(m2UndoHistory.length>30)m2UndoHistory.shift();m2UpdateUndoButton();}\n      function m2DiscardUndo(){m2UndoHistory.pop();m2UpdateUndoButton();}`,
  `      function m2PushUndo(label){m2UndoHistory.push(m2UndoSnapshot(label));if(m2UndoHistory.length>30)m2UndoHistory.shift();m2UpdateUndoButton();}\n      function m2PushFastDragUndo(drag){\n        const origins=Array.isArray(drag?.groupMembers)&&drag.groupMembers.length?drag.groupMembers:[{id:drag?.id}];\n        const racks=origins.map((origin)=>{const rack=m2LayoutState.racks.find((item)=>item.id===origin.id);return rack?{id:rack.id,x:rack.x,y:rack.y,freePlacement:!!rack.freePlacement,staged:!!rack.staged,locked:!!rack.locked}:null}).filter(Boolean);\n        const symbols=(drag?.symbolMembers||[]).map((origin)=>{const symbol=m2LayoutSymbols.find((item)=>item.id===origin.id);return symbol?{id:symbol.id,x:symbol.x,y:symbol.y}:null}).filter(Boolean);\n        m2UndoHistory.push({label:\"Raf taşıma\",fastDrag:{racks,symbols}});if(m2UndoHistory.length>30)m2UndoHistory.shift();m2UpdateUndoButton();\n      }\n      function m2DiscardUndo(){m2UndoHistory.pop();m2UpdateUndoButton();}`,
  "hafif drag undo"
);

replaceRequired(
  `      function m2UndoLastAction(){\n        const snapshot=m2UndoHistory.pop();if(!snapshot){m2UpdateUndoButton();return;}\n        m2LayoutState={...m2LayoutState,...snapshot.layout,drag:null,hover:null,mode:snapshot.layout.mode||\"idle\"};`,
  `      function m2UndoLastAction(){\n        const snapshot=m2UndoHistory.pop();if(!snapshot){m2UpdateUndoButton();return;}\n        if(snapshot.fastDrag){\n          snapshot.fastDrag.racks.forEach((saved)=>{const rack=m2LayoutState.racks.find((item)=>item.id===saved.id);if(rack){rack.x=saved.x;rack.y=saved.y;rack.freePlacement=saved.freePlacement;rack.staged=saved.staged;rack.locked=saved.locked;}});\n          snapshot.fastDrag.symbols.forEach((saved)=>{const symbol=m2LayoutSymbols.find((item)=>item.id===saved.id);if(symbol){symbol.x=saved.x;symbol.y=saved.y;}});\n          m2LayoutState.drag=null;m2LayoutState.hover=null;m2RenderLayout();m2UpdateUndoButton();return;\n        }\n        m2LayoutState={...m2LayoutState,...snapshot.layout,drag:null,hover:null,mode:snapshot.layout.mode||\"idle\"};`,
  "hafif drag undo geri alma"
);

// v25'in querySelector/find/matrix parse islemlerini her karede yapmasi yerine pointerdown'da
// bir kez cache olustur. Pointermove sadece son koordinati yazar; tum hesap rAF icinde tek kez yapilir.
const v25Paint = `      function m2FastRackDragPaint() {
        const drag=m2LayoutState.drag,layer=$("m2LayoutContent");
        if(!drag||!layer)return false;
        const origins=Array.isArray(drag.groupMembers)&&drag.groupMembers.length?drag.groupMembers:[{id:drag.id,x:drag.originX,y:drag.originY}];
        let painted=false;
        origins.forEach((origin)=>{
          const rack=m2LayoutState.racks.find((item)=>item.id===origin.id),node=layer.querySelector('[data-rack="'+origin.id+'"]');
          if(!rack||!node)return;
          let raw=node.dataset.rafexDragMatrix;
          if(!raw){
            const matrix=node.transform?.baseVal?.consolidate?.()?.matrix;
            if(!matrix)return;
            raw=[matrix.a,matrix.b,matrix.c,matrix.d,matrix.e,matrix.f].join(",");
            node.dataset.rafexDragMatrix=raw;
          }
          const parts=raw.split(",").map(Number);if(parts.length!==6||parts.some((value)=>!Number.isFinite(value)))return;
          const dx=rack.x-origin.x,dy=rack.y-origin.y;
          node.setAttribute("transform",'matrix('+parts[0]+' '+parts[1]+' '+parts[2]+' '+parts[3]+' '+(parts[4]+dx)+' '+(parts[5]+dy)+')');
          painted=true;
        });
        return painted;
      }`;

const v26Paint = `      function m2FastMatrixRecord(node,id,originX,originY){
        if(!node)return null;const matrix=node.transform?.baseVal?.consolidate?.()?.matrix;if(!matrix)return null;
        return{id,node,originX,originY,a:matrix.a,b:matrix.b,c:matrix.c,d:matrix.d,e:matrix.e,f:matrix.f};
      }
      function m2PrepareFastDrag(svg,drag){
        if(!svg||!drag)return;const rect=svg.getBoundingClientRect(),layer=$("m2LayoutContent");
        drag.fastRect={left:rect.left,top:rect.top,sx:1000/Math.max(1,rect.width),sy:650/Math.max(1,rect.height)};
        const origins=Array.isArray(drag.groupMembers)&&drag.groupMembers.length?drag.groupMembers:[{id:drag.id,x:drag.originX,y:drag.originY}];
        drag.fastRacks=origins.map((origin)=>{const rack=m2LayoutState.racks.find((item)=>item.id===origin.id);return rack?{rack,originX:origin.x,originY:origin.y}:null}).filter(Boolean);
        drag.fastNodes=origins.map((origin)=>m2FastMatrixRecord(layer?.querySelector('[data-rack="'+origin.id+'"]'),origin.id,origin.x,origin.y)).filter(Boolean);
        drag.fastSymbols=(drag.symbolMembers||[]).map((origin)=>{const symbol=m2LayoutSymbols.find((item)=>item.id===origin.id),node=layer?.querySelector('[data-layout-symbol="'+origin.id+'"]');const rec=m2FastMatrixRecord(node,origin.id,origin.x,origin.y);return symbol&&rec?{symbol,rec,originX:origin.x,originY:origin.y}:null}).filter(Boolean);
        if(drag.fastRacks.length){
          drag.fastMinDx=Math.max(...drag.fastRacks.map((entry)=>-entry.originX));drag.fastMaxDx=Math.min(...drag.fastRacks.map((entry)=>1000-entry.originX-entry.rack.w));
          drag.fastMinDy=Math.max(...drag.fastRacks.map((entry)=>-entry.originY));drag.fastMaxDy=Math.min(...drag.fastRacks.map((entry)=>650-entry.originY-entry.rack.h));
        }
      }
      function m2FastRackDragPaint(){
        const drag=m2LayoutState.drag;if(!drag)return false;let painted=false;
        (drag.fastNodes||[]).forEach((rec)=>{const rack=m2LayoutState.racks.find((item)=>item.id===rec.id);if(!rack||!rec.node?.isConnected)return;const dx=rack.x-rec.originX,dy=rack.y-rec.originY;rec.node.setAttribute("transform",'matrix('+rec.a+' '+rec.b+' '+rec.c+' '+rec.d+' '+(rec.e+dx)+' '+(rec.f+dy)+')');painted=true;});
        (drag.fastSymbols||[]).forEach((entry)=>{if(!entry.rec.node?.isConnected)return;const dx=entry.symbol.x-entry.originX,dy=entry.symbol.y-entry.originY,rec=entry.rec;rec.node.setAttribute("transform",'matrix('+rec.a+' '+rec.b+' '+rec.c+' '+rec.d+' '+(rec.e+dx)+' '+(rec.f+dy)+')');});
        return painted;
      }
      function m2ApplyFastDragClient(clientX,clientY){
        const drag=m2LayoutState.drag,rect=drag?.fastRect;if(!drag||!rect||!Number.isFinite(clientX)||!Number.isFinite(clientY))return;
        const pointX=(clientX-rect.left)*rect.sx,pointY=(clientY-rect.top)*rect.sy,targetX=pointX-drag.dx,targetY=pointY-drag.dy;
        if(Array.isArray(drag.groupMembers)&&drag.groupMembers.length){
          let dx=targetX-drag.originX,dy=targetY-drag.originY;
          if(Number.isFinite(drag.fastMinDx))dx=Math.max(drag.fastMinDx,Math.min(drag.fastMaxDx,dx));
          if(Number.isFinite(drag.fastMinDy))dy=Math.max(drag.fastMinDy,Math.min(drag.fastMaxDy,dy));
          drag.fastRacks.forEach((entry)=>{entry.rack.x=entry.originX+dx;entry.rack.y=entry.originY+dy;});
          (drag.fastSymbols||[]).forEach((entry)=>{entry.symbol.x=entry.originX+dx;entry.symbol.y=entry.originY+dy;});
        }else{
          const entry=drag.fastRacks?.[0],rack=entry?.rack;if(!rack)return;rack.x=Math.max(0,Math.min(1000-rack.w,targetX));rack.y=Math.max(0,Math.min(650-rack.h,targetY));
        }
        m2FastRackDragPaint();
      }
      function m2ScheduleFastDrag(event){
        const drag=m2LayoutState.drag;if(!drag)return;drag.pendingClientX=event.clientX;drag.pendingClientY=event.clientY;
        if(drag.fastFrame!=null)return;drag.fastFrame=requestAnimationFrame(()=>{const active=m2LayoutState.drag;if(!active)return;active.fastFrame=null;m2ApplyFastDragClient(active.pendingClientX,active.pendingClientY);});
      }
      function m2FinalizeFastDrag(drag){
        if(!drag)return;const rack=m2LayoutState.racks.find((item)=>item.id===drag.id);if(!rack)return;
        const origins=Array.isArray(drag.groupMembers)&&drag.groupMembers.length?drag.groupMembers:null;
        if(origins&&origins.length>1){
          const hasFree=origins.some((origin)=>m2LayoutState.racks.find((item)=>item.id===origin.id)?.freePlacement);if(hasFree)return;
          const targetDx=rack.x-drag.originX,targetDy=rack.y-drag.originY,adjusted=m2SmoothGroupTranslation(origins,targetDx,targetDy);m2ApplyGroupTranslation(origins,adjusted.dx,adjusted.dy);
          (drag.symbolMembers||[]).forEach((origin)=>{const symbol=m2LayoutSymbols.find((item)=>item.id===origin.id);if(symbol){symbol.x=origin.x+adjusted.dx;symbol.y=origin.y+adjusted.dy;}});return;
        }
        if(rack.freePlacement)return;const targetX=rack.x,targetY=rack.y;rack.x=drag.originX;rack.y=drag.originY;const adjusted=m2SmoothDragPosition(rack,targetX,targetY);rack.x=adjusted?.x??drag.originX;rack.y=adjusted?.y??drag.originY;
      }`;
replaceRequired(v25Paint,v26Paint,"cacheli sifir maliyetli drag paint");

// Pointerdown: pahali tam snapshot yerine hafif undo + ekran/matrix cache.
replaceRequired(
  `            m2LayoutState.drag = { id, dx: point.x - rack.x, dy: point.y - rack.y, originX:rack.x, originY:rack.y, groupMembers,selectionGroup,symbolMembers,undoCaptured:true };\n            m2PushUndo("Raf taşıma");\n            svg.setPointerCapture?.(event.pointerId); m2QueueLayoutRender();`,
  `            m2LayoutState.drag = { id, dx: point.x - rack.x, dy: point.y - rack.y, originX:rack.x, originY:rack.y, groupMembers,selectionGroup,symbolMembers,undoCaptured:true };\n            m2PushFastDragUndo(m2LayoutState.drag);m2PrepareFastDrag(svg,m2LayoutState.drag);\n            svg.setPointerCapture?.(event.pointerId);`,
  "pointerdown hafif drag baslangici"
);

// Drag aktifken pointermove'in geri kalanina hic girme: getBoundingClientRect, collision,
// status DOM, tum raf taramalari yok. Sadece son mouse koordinati rAF'e yazilir.
replaceRequired(
  `        svg.onpointermove = (event) => {\n          const point = m2SvgPoint(event);`,
  `        svg.onpointermove = (event) => {\n          if(m2LayoutState.drag){m2ScheduleFastDrag(event);return;}\n          const point = m2SvgPoint(event);`,
  "pointermove ultra hizli yolu"
);

// Pointerup'ta son koordinati uygula ve pahali alan/cakisma hesaplarini sadece BIR KEZ yap.
replaceRequired(
  `        const stop = () => {\n          if(m2SeismicDraft?.start){m2CommitSeismicArea();return;}`,
  `        const stop = (event) => {\n          if(m2LayoutState.drag){const drag=m2LayoutState.drag;if(drag.fastFrame!=null){cancelAnimationFrame(drag.fastFrame);drag.fastFrame=null;}m2ApplyFastDragClient(event?.clientX??drag.pendingClientX,event?.clientY??drag.pendingClientY);m2FinalizeFastDrag(drag);}\n          if(m2SeismicDraft?.start){m2CommitSeismicArea();return;}`,
  "pointerup tek seferlik finalize"
);

fs.writeFileSync(portalPath, html);
console.log("Serbest performans v26: pointermove sifir collision; cacheli SVG matrix; tek-rAF koordinat; hafif undo; cakisma sadece pointerup'ta.");
