import fs from "node:fs";
import path from "node:path";

const portalPath = path.join(process.cwd(), "portal.html");
let html = fs.readFileSync(portalPath, "utf8");

const marker = "const m2PerfRuntimeTables = {";
if (html.includes(marker)) {
  console.log("v29: Serbest yerlesim runtime tablolari zaten mevcut.");
  process.exit(0);
}

const anchor = "      const m2PerfRackAuxDomTable = new Map();";
if (!html.includes(anchor)) throw new Error("v29: v28 DOM tablo ankraj noktasi bulunamadi.");

const runtimeTables = `${anchor}\n      const m2PerfRuntimeTables = {\n        rackById:new Map(),\n        wallGeometry:new Map(),\n        columnGeometry:new Map(),\n        accessoryGeometry:new Map(),\n        distanceDependencies:new Map(),\n        collisionPairs:new Map(),\n        domNodes:new Map(),\n        eventRegistry:new Map(),\n        dirtyQueue:new Set(),\n        frameCache:new Map(),\n        pointerTransform:{svg:null,rect:null,version:0},\n        frameVersion:0,\n        topologyVersion:0\n      };\n      function m2PerfRefreshRuntimeTables(){\n        const t=m2PerfRuntimeTables;\n        t.rackById.clear();t.wallGeometry.clear();t.columnGeometry.clear();t.accessoryGeometry.clear();t.distanceDependencies.clear();t.collisionPairs.clear();t.domNodes.clear();t.frameCache.clear();\n        m2LayoutState.racks.forEach((rack)=>{\n          t.rackById.set(Number(rack.id),rack);\n          const b=m2RackBounds(rack);\n          t.frameCache.set(\"rack-bounds:\"+rack.id,b);\n          t.distanceDependencies.set(Number(rack.id),{rackIds:new Set(),wallIds:new Set(),columnIds:new Set(),symbolIds:new Set()});\n        });\n        const points=Array.isArray(m2LayoutState.points)?m2LayoutState.points:[];\n        const edgeCount=m2LayoutState.openFinished?Math.max(0,points.length-1):points.length;\n        for(let i=0;i<edgeCount;i++){\n          const a=points[i],b=points[(i+1)%points.length];\n          if(!a||!b)continue;\n          const wall={id:i,a,b,minX:Math.min(a.x,b.x),maxX:Math.max(a.x,b.x),minY:Math.min(a.y,b.y),maxY:Math.max(a.y,b.y),vertical:Math.abs(a.x-b.x)<=Math.abs(a.y-b.y)};\n          t.wallGeometry.set(i,wall);\n        }\n        m2LayoutSymbols.forEach((symbol)=>{\n          const id=Number(symbol.id),bounds=m2SymbolBounds(symbol);\n          if(symbol.type===\"column\")t.columnGeometry.set(id,{symbol,bounds});\n          else t.accessoryGeometry.set(id,{symbol,bounds});\n          if(symbol.rackId!=null){\n            const dep=t.distanceDependencies.get(Number(symbol.rackId));if(dep)dep.symbolIds.add(id);\n          }\n        });\n        t.topologyVersion++;\n        if(window.rafexFreeLayoutPerfTables){\n          window.rafexFreeLayoutPerfTables.runtime=t;\n          window.rafexFreeLayoutPerfTables.wallGeometry=t.wallGeometry;\n          window.rafexFreeLayoutPerfTables.columnGeometry=t.columnGeometry;\n          window.rafexFreeLayoutPerfTables.accessoryGeometry=t.accessoryGeometry;\n          window.rafexFreeLayoutPerfTables.distanceDependencies=t.distanceDependencies;\n          window.rafexFreeLayoutPerfTables.collisionPairs=t.collisionPairs;\n          window.rafexFreeLayoutPerfTables.dirtyQueue=t.dirtyQueue;\n          window.rafexFreeLayoutPerfTables.frameCache=t.frameCache;\n        }\n      }\n      function m2PerfBeginRuntimeFrame(rackId){\n        const t=m2PerfRuntimeTables;t.frameVersion++;t.frameCache.clear();t.dirtyQueue.clear();\n        if(rackId!=null){t.dirtyQueue.add(\"rack:\"+rackId);t.dirtyQueue.add(\"distance-overlay:\"+rackId);}\n      }`;
html = html.replace(anchor, runtimeTables);

const oldRefreshTail = `        if(window.rafexFreeLayoutPerfTables){window.rafexFreeLayoutPerfTables.rackDom=m2PerfRackDomTable;window.rafexFreeLayoutPerfTables.symbolDom=m2PerfSymbolDomTable;window.rafexFreeLayoutPerfTables.rackAuxDom=m2PerfRackAuxDomTable;}\n      }`;
const newRefreshTail = `        m2PerfRackDomTable.forEach((entry,id)=>m2PerfRuntimeTables.domNodes.set(\"rack:\"+id,entry));\n        m2PerfSymbolDomTable.forEach((entry,id)=>m2PerfRuntimeTables.domNodes.set(\"symbol:\"+id,entry));\n        m2PerfRackAuxDomTable.forEach((entry,id)=>m2PerfRuntimeTables.domNodes.set(\"aux:\"+id,entry));\n        m2PerfRefreshRuntimeTables();\n        if(window.rafexFreeLayoutPerfTables){window.rafexFreeLayoutPerfTables.rackDom=m2PerfRackDomTable;window.rafexFreeLayoutPerfTables.symbolDom=m2PerfSymbolDomTable;window.rafexFreeLayoutPerfTables.rackAuxDom=m2PerfRackAuxDomTable;window.rafexFreeLayoutPerfTables.domNodes=m2PerfRuntimeTables.domNodes;}\n      }`;
if (!html.includes(oldRefreshTail)) throw new Error("v29: DOM tablo yenileme sonu bulunamadi.");
html = html.replace(oldRefreshTail, newRefreshTail);

const oldRackLookup = `        const rack=m2LayoutState.racks.find((item)=>Number(item.id)===Number(drag.id)),layer=$("m2LayoutContent");if(!rack||!layer)return false;`;
const newRackLookup = `        m2PerfBeginRuntimeFrame(drag.id);\n        const rack=m2PerfRuntimeTables.rackById.get(Number(drag.id))||m2LayoutState.racks.find((item)=>Number(item.id)===Number(drag.id)),layer=$("m2LayoutContent");if(!rack||!layer)return false;`;
if (!html.includes(oldRackLookup)) throw new Error("v29: tek-raf drag lookup kaynagi bulunamadi.");
html = html.replace(oldRackLookup, newRackLookup);

const oldGuideHtml = `        const overlay=m2PerfEnsureDragOverlay(layer),guideHtml=m2WallDistanceGuides(rack,{left:true,right:true,top:true,bottom:true,gap:true})+m2RackDistanceGuide(rack)+m2ColumnDistanceGuide(rack)+m2PerfMovingSeismicSvg(rack.id);`;
const newGuideHtml = `        const overlay=m2PerfEnsureDragOverlay(layer);\n        const wallGuide=m2WallDistanceGuides(rack,{left:true,right:true,top:true,bottom:true,gap:true}),rackGuide=m2RackDistanceGuide(rack),columnGuide=m2ColumnDistanceGuide(rack),seismicGuide=m2PerfMovingSeismicSvg(rack.id);\n        m2PerfRuntimeTables.frameCache.set(\"wall-guide:\"+rack.id,wallGuide);m2PerfRuntimeTables.frameCache.set(\"rack-guide:\"+rack.id,rackGuide);m2PerfRuntimeTables.frameCache.set(\"column-guide:\"+rack.id,columnGuide);m2PerfRuntimeTables.frameCache.set(\"seismic-guide:\"+rack.id,seismicGuide);\n        const guideHtml=wallGuide+rackGuide+columnGuide+seismicGuide;`;
if (!html.includes(oldGuideHtml)) throw new Error("v29: canli guide hesap blogu bulunamadi.");
html = html.replace(oldGuideHtml, newGuideHtml);

const oldWindowTable = `      window.rafexFreeLayoutPerfTables={rackGeometry:m2PerfGeometryTable,symbolGeometry:m2PerfSymbolGeometryTable,spatial:m2PerfSpatialTable};`;
const newWindowTable = `      window.rafexFreeLayoutPerfTables={rackGeometry:m2PerfGeometryTable,symbolGeometry:m2PerfSymbolGeometryTable,spatial:m2PerfSpatialTable};`;
if (!html.includes(oldWindowTable)) throw new Error("v29: global performans tablo nesnesi bulunamadi.");

if(!html.includes(marker)||!html.includes("m2PerfRefreshRuntimeTables()")||!html.includes("m2PerfBeginRuntimeFrame(drag.id)"))throw new Error("v29: runtime tablo dogrulamasi basarisiz.");
fs.writeFileSync(portalPath, html);
console.log("v29: Serbest yerlesim merkezi runtime tablolari aktif: rack/wall/column/accessory/dependency/collision/DOM/dirty/frame/pointer tabloları hazir ve tek-raf drag akisina baglandi.");
