import fs from "node:fs";
import path from "node:path";

const portalPath = path.join(process.cwd(), "portal.html");
let html = fs.readFileSync(portalPath, "utf8");

const oldUndo = `      function m2UndoSnapshot(label="Son işlem"){
        const layout=JSON.parse(JSON.stringify({...m2LayoutState,drag:null,hover:null,branchSourceIndex:null}));
        return{label,layout,symbols:JSON.parse(JSON.stringify(m2LayoutSymbols||[])),notes:JSON.parse(JSON.stringify(m2UserNotes||[])),dimensionOffsets:JSON.parse(JSON.stringify(m2DimensionOffsets||{})),dimensionFontSizes:{...m2DimensionFontSizes},hidden:[...m2HiddenSummaryDimensions],visible:{length:[...m2VisibleRackDimensions.length],depth:[...m2VisibleRackDimensions.depth]},pinned:JSON.parse(JSON.stringify(m2PinnedDimensionsByRack||{})),freeMeasure:JSON.parse(JSON.stringify(m2FreeMeasure||{points:[],hover:null}))};
      }
      function m2UpdateUndoButton(){const button=$("m2UndoButton");if(button){button.disabled=!m2UndoHistory.length;button.title=m2UndoHistory.length?\`${m2UndoHistory.at(-1).label} işlemini geri al\`:"Geri alınacak işlem yok";}}
      function m2PushUndo(label){m2UndoHistory.push(m2UndoSnapshot(label));if(m2UndoHistory.length>30)m2UndoHistory.shift();m2UpdateUndoButton();}
      function m2DiscardUndo(){m2UndoHistory.pop();m2UpdateUndoButton();}
      function m2UndoLastAction(){
        const snapshot=m2UndoHistory.pop();if(!snapshot){m2UpdateUndoButton();return;}
        m2LayoutState={...m2LayoutState,...snapshot.layout,drag:null,hover:null,mode:snapshot.layout.mode||"idle"};m2LayoutSymbols=snapshot.symbols;m2UserNotes=snapshot.notes;m2DimensionOffsets=snapshot.dimensionOffsets;m2DimensionFontSizes=snapshot.dimensionFontSizes;m2HiddenSummaryDimensions=new Set(snapshot.hidden);m2VisibleRackDimensions={length:new Set(snapshot.visible.length),depth:new Set(snapshot.visible.depth)};m2PinnedDimensionsByRack=snapshot.pinned;m2PinnedDimensions=m2EmptyPinnedDimensions();m2FreeMeasure=snapshot.freeMeasure;m2SelectedSymbolId=null;m2SelectedNoteId=null;m2SelectedDimensionKey=null;m2ClearMultiSelection();m2ClearAllSelections(\`${snapshot.label} geri alındı.\`);m2UpdateUndoButton();
      }`;

const newUndo = `      let m2UndoBytes=0;const m2UndoMaxBytes=8*1024*1024,m2UndoMaxEntries=40;
      function m2UndoJsonClone(value){return value==null?value:JSON.parse(JSON.stringify(value));}
      function m2UndoSnapshot(label="Son işlem"){
        const layout=m2UndoJsonClone({...m2LayoutState,drag:null,hover:null,branchSourceIndex:null});
        const snapshot={kind:"snapshot",label,layout,symbols:m2UndoJsonClone(m2LayoutSymbols||[]),notes:m2UndoJsonClone(m2UserNotes||[]),dimensionOffsets:m2UndoJsonClone(m2DimensionOffsets||{}),dimensionFontSizes:{...m2DimensionFontSizes},hidden:[...m2HiddenSummaryDimensions],visible:{length:[...m2VisibleRackDimensions.length],depth:[...m2VisibleRackDimensions.depth]},pinned:m2UndoJsonClone(m2PinnedDimensionsByRack||{}),freeMeasure:m2UndoJsonClone(m2FreeMeasure||{points:[],hover:null})};
        snapshot.bytes=JSON.stringify(snapshot).length*2;return snapshot;
      }
      function m2UndoTrim(){while(m2UndoHistory.length>m2UndoMaxEntries||m2UndoBytes>m2UndoMaxBytes&&m2UndoHistory.length>1){const removed=m2UndoHistory.shift();m2UndoBytes=Math.max(0,m2UndoBytes-(Number(removed?.bytes)||0));}}
      function m2UpdateUndoButton(){const button=$("m2UndoButton");if(button){button.disabled=!m2UndoHistory.length;button.title=m2UndoHistory.length?\`${m2UndoHistory.at(-1).label} işlemini geri al\`:"Geri alınacak işlem yok";}}
      function m2PushUndo(label){const snapshot=m2UndoSnapshot(label),previous=m2UndoHistory.at(-1);if(previous?.kind==="snapshot"&&previous.label===label&&previous.bytes===snapshot.bytes)return;m2UndoHistory.push(snapshot);m2UndoBytes+=snapshot.bytes;m2UndoTrim();m2UpdateUndoButton();}
      function m2PushPositionUndo(label="Raf taşıma"){
        const drag=m2LayoutState?.drag||{},rackIds=new Set(),symbolIds=new Set(),addId=(set,value)=>{const id=Number(value&&typeof value==="object"?value.id:value);if(Number.isFinite(id))set.add(id)};
        addId(rackIds,drag.id);[...(drag.groupMembers||[]),...(drag.selectionGroup||[])].forEach((value)=>addId(rackIds,value));(drag.symbolMembers||[]).forEach((value)=>addId(symbolIds,value));
        const racks=(m2LayoutState?.racks||[]).filter((rack)=>rackIds.has(Number(rack.id))).map((rack)=>({id:Number(rack.id),x:Number(rack.x)||0,y:Number(rack.y)||0,angle:Number(rack.angle)||0}));
        const symbols=(m2LayoutSymbols||[]).filter((symbol)=>symbolIds.has(Number(symbol.id))).map((symbol)=>({id:Number(symbol.id),x:Number(symbol.x)||0,y:Number(symbol.y)||0,angle:Number(symbol.angle)||0}));
        if(!racks.length&&drag.id!=null){const rack=(m2LayoutState?.racks||[]).find((item)=>Number(item.id)===Number(drag.id));if(rack)racks.push({id:Number(rack.id),x:Number(rack.x)||0,y:Number(rack.y)||0,angle:Number(rack.angle)||0});}
        const entry={kind:"positions",label,racks,symbols,bytes:128+(racks.length+symbols.length)*80};m2UndoHistory.push(entry);m2UndoBytes+=entry.bytes;m2UndoTrim();m2UpdateUndoButton();
      }
      function m2DiscardUndo(){const removed=m2UndoHistory.pop();m2UndoBytes=Math.max(0,m2UndoBytes-(Number(removed?.bytes)||0));m2UpdateUndoButton();}
      function m2UndoLastAction(){
        const snapshot=m2UndoHistory.pop();if(!snapshot){m2UpdateUndoButton();return;}m2UndoBytes=Math.max(0,m2UndoBytes-(Number(snapshot.bytes)||0));
        if(snapshot.kind==="positions"){
          const rackMap=new Map((snapshot.racks||[]).map((item)=>[Number(item.id),item])),symbolMap=new Map((snapshot.symbols||[]).map((item)=>[Number(item.id),item]));
          (m2LayoutState.racks||[]).forEach((rack)=>{const old=rackMap.get(Number(rack.id));if(old){rack.x=old.x;rack.y=old.y;rack.angle=old.angle;}});(m2LayoutSymbols||[]).forEach((symbol)=>{const old=symbolMap.get(Number(symbol.id));if(old){symbol.x=old.x;symbol.y=old.y;symbol.angle=old.angle;}});
          m2LayoutState.drag=null;m2ClearMultiSelection();m2ClearAllSelections(\`${snapshot.label} geri alındı.\`);m2RenderLayout();m2UpdateUndoButton();return;
        }
        m2LayoutState={...m2LayoutState,...snapshot.layout,drag:null,hover:null,mode:snapshot.layout.mode||"idle"};m2LayoutSymbols=snapshot.symbols;m2UserNotes=snapshot.notes;m2DimensionOffsets=snapshot.dimensionOffsets;m2DimensionFontSizes=snapshot.dimensionFontSizes;m2HiddenSummaryDimensions=new Set(snapshot.hidden);m2VisibleRackDimensions={length:new Set(snapshot.visible.length),depth:new Set(snapshot.visible.depth)};m2PinnedDimensionsByRack=snapshot.pinned;m2PinnedDimensions=m2EmptyPinnedDimensions();m2FreeMeasure=snapshot.freeMeasure;m2SelectedSymbolId=null;m2SelectedNoteId=null;m2SelectedDimensionKey=null;m2ClearMultiSelection();m2ClearAllSelections(\`${snapshot.label} geri alındı.\`);m2UpdateUndoButton();
      }`;

if (!html.includes(newUndo)) {
  if (!html.includes(oldUndo)) throw new Error("Common source v90: undo blogu bulunamadi");
  html = html.replace(oldUndo, newUndo);
}

const dragUndo = `            m2PushUndo("Raf taşıma");`;
const positionUndo = `            m2PushPositionUndo("Raf taşıma");`;
if (html.includes(dragUndo)) html = html.replace(dragUndo, positionUndo);
if (!html.includes(positionUndo)) throw new Error("Common source v90: raf tasima fark undo baglanamadi");

for (const [label, replacement] of [
  ["m2PushUndo(\"Raf döndürme\")", "m2PushPositionUndo(\"Raf döndürme\")"],
  ["m2PushUndo(\"Hassas taşıma\")", "m2PushPositionUndo(\"Hassas taşıma\")"],
  ["m2PushUndo(\"Raf konumu\")", "m2PushPositionUndo(\"Raf konumu\")"],
]) html = html.replaceAll(label, replacement);

if (!html.includes("m2UndoMaxBytes=8*1024*1024") || !html.includes('kind:"positions"')) {
  throw new Error("Common source v90: undo performans dogrulamasi eksik");
}

fs.writeFileSync(portalPath, html);
console.log("SOURCE v90: raf tasima geri alma fark tabanli; tam snapshotlar 8 MB bellek butcesiyle sinirli.");
