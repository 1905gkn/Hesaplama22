import fs from "node:fs";
import path from "node:path";

const portalPath = path.join(process.cwd(), "portal.html");
let html = fs.readFileSync(portalPath, "utf8");

const marker = "const m2LayoutRuntimeCache = {";
if (html.includes(marker)) {
  console.log("v29: Serbest yerlesim runtime tablolari zaten mevcut.");
  process.exit(0);
}

const domAnchor = "      const m2PerfRackDomTable = new Map();";
if (!html.includes(domAnchor)) throw new Error("v29: v28 DOM tablo ankraji bulunamadi.");

const runtimeTables = `      const m2LayoutRuntimeCache = {
        walls:{signature:"",version:0,segments:[],xs:[],ys:[]},
        columns:{signature:"",version:0,items:[],bounds:new Map()},
        accessories:{signature:"",version:0,blocking:[],bounds:new Map()},
        distanceDependencies:new Map(),
        collisionPairs:new Map(),
        domNodes:new Map(),
        dirtyObjects:new Set(),
        dirtyKeys:new Map(),
        frameCache:{rackId:null,key:"",version:0,values:new Map()},
        eventRegistry:new Map()
      };
      function m2PerfWallSignature(){
        return [m2LayoutState.openFinished?1:0,(m2LayoutState.pathBreaks||[]).join(","),...(m2LayoutState.points||[]).map((p)=>Number(p.x)+":"+Number(p.y))].join("|");
      }
      function m2PerfWallGeometryTable(){
        const signature=m2PerfWallSignature(),table=m2LayoutRuntimeCache.walls;
        if(table.signature===signature)return table;
        const points=m2LayoutState.points||[],breaks=new Set(m2LayoutState.pathBreaks||[]),segments=[],xs=points.map((p)=>p.x),ys=points.map((p)=>p.y);
        const count=m2LayoutState.openFinished?Math.max(0,points.length-1):points.length;
        for(let i=0;i<count;i++){
          if(breaks.has(i)||!points.length)continue;
          const a=points[i],b=points[(i+1)%points.length];
          segments.push({i,a,b,vertical:Math.abs(a.x-b.x)<.5,horizontal:Math.abs(a.y-b.y)<.5,minX:Math.min(a.x,b.x),maxX:Math.max(a.x,b.x),minY:Math.min(a.y,b.y),maxY:Math.max(a.y,b.y)});
        }
        table.signature=signature;table.version++;table.segments=segments;table.xs=xs;table.ys=ys;return table;
      }
      function m2PerfColumnSignature(){
        return (m2LayoutSymbols||[]).filter((s)=>s.type==="column").map((s)=>[s.id,s.x,s.y,s.w,s.h,s.angle].join(":" )).join("|");
      }
      function m2PerfColumnObjects(){
        const table=m2LayoutRuntimeCache.columns,signature=m2PerfColumnSignature();
        if(table.signature===signature)return table.items;
        const items=(m2LayoutSymbols||[]).filter((s)=>s.type==="column"),bounds=new Map();items.forEach((s)=>bounds.set(Number(s.id),m2SymbolBounds(s)));
        table.signature=signature;table.version++;table.items=items;table.bounds=bounds;return items;
      }
      function m2PerfAccessorySignature(){
        return (m2LayoutSymbols||[]).filter((s)=>s.blocking||/^(uaks|uakz|barrier)$/.test(String(s.type||""))).map((s)=>[s.id,s.type,s.blocking?1:0,s.x,s.y,s.w,s.h,s.angle,s.rackId??""].join(":" )).join("|");
      }
      function m2PerfBlockingSymbols(){
        const table=m2LayoutRuntimeCache.accessories,signature=m2PerfAccessorySignature();
        if(table.signature!==signature){
          const all=(m2LayoutSymbols||[]).filter((s)=>s.blocking||/^(uaks|uakz|barrier)$/.test(String(s.type||""))),blocking=all.filter((s)=>s.blocking),bounds=new Map();all.forEach((s)=>bounds.set(Number(s.id),m2SymbolBounds(s)));
          table.signature=signature;table.version++;table.blocking=blocking;table.bounds=bounds;
        }
        return table.blocking;
      }
      function m2PerfMarkDirty(type,id,key){
        const token=type+":"+id,previous=m2LayoutRuntimeCache.dirtyKeys.get(token);
        if(previous===key)return false;
        m2LayoutRuntimeCache.dirtyKeys.set(token,key);m2LayoutRuntimeCache.dirtyObjects.add(token);return true;
      }
      function m2PerfBeginRuntimeFrame(rack){
        const key=m2PerfRackGeometryKey(rack),frame=m2LayoutRuntimeCache.frameCache;
        if(frame.rackId===Number(rack.id)&&frame.key===key)return false;
        frame.rackId=Number(rack.id);frame.key=key;frame.version++;frame.values.clear();
        m2LayoutRuntimeCache.dirtyObjects.clear();m2PerfMarkDirty("rack",rack.id,key);
        m2PerfWallGeometryTable();m2PerfColumnObjects();m2PerfBlockingSymbols();
        return true;
      }
      function m2PerfRememberDistanceDependency(rack,kind,value){
        const id=Number(rack.id),current=m2LayoutRuntimeCache.distanceDependencies.get(id)||{};
        current[kind]=value;current.wallVersion=m2LayoutRuntimeCache.walls.version;current.columnVersion=m2LayoutRuntimeCache.columns.version;current.accessoryVersion=m2LayoutRuntimeCache.accessories.version;current.frameVersion=m2LayoutRuntimeCache.frameCache.version;
        m2LayoutRuntimeCache.distanceDependencies.set(id,current);
      }
      window.rafexFreeLayoutRuntimeCache=m2LayoutRuntimeCache;
`;
html = html.replace(domAnchor, runtimeTables + domAnchor);

const wallStart = html.indexOf("      function m2WallMeasurements(rack) {");
const wallEnd = html.indexOf("      function m2WallDistanceGuides", wallStart);
if (wallStart < 0 || wallEnd < 0) throw new Error("v29: m2WallMeasurements siniri bulunamadi.");
const newWallMeasurements = `      function m2WallMeasurements(rack) {
        const box=m2CombinedRackBounds(rack),walls=m2PerfWallGeometryTable(),verticalWalls=[],horizontalWalls=[];
        walls.segments.forEach((segment)=>{
          if(segment.vertical&&box.cy>=segment.minY-.5&&box.cy<=segment.maxY+.5)verticalWalls.push(segment.a.x);
          if(segment.horizontal&&box.cx>=segment.minX-.5&&box.cx<=segment.maxX+.5)horizontalWalls.push(segment.a.y);
        });
        const xs=walls.xs,ys=walls.ys;
        if(!xs.length||!ys.length){const empty={left:{px:0,x1:box.left,y1:box.cy,x2:box.left,y2:box.cy},right:{px:0,x1:box.right,y1:box.cy,x2:box.right,y2:box.cy},top:{px:0,x1:box.cx,y1:box.top,x2:box.cx,y2:box.top},bottom:{px:0,x1:box.cx,y1:box.bottom,x2:box.cx,y2:box.bottom}};m2PerfRememberDistanceDependency(rack,"walls",empty);return empty;}
        const leftWall=Math.max(...verticalWalls.filter((x)=>x<=box.left+.5),Math.min(...xs)),rightWall=Math.min(...verticalWalls.filter((x)=>x>=box.right-.5),Math.max(...xs)),topWall=Math.max(...horizontalWalls.filter((y)=>y<=box.top+.5),Math.min(...ys)),bottomWall=Math.min(...horizontalWalls.filter((y)=>y>=box.bottom-.5),Math.max(...ys));
        const leftSurface=leftWall+m2WallMeasurementInset,rightSurface=rightWall-m2WallMeasurementInset,topSurface=topWall+m2WallMeasurementInset,bottomSurface=bottomWall-m2WallMeasurementInset;
        const result={left:{px:Math.max(0,box.left-leftSurface),x1:leftSurface,y1:box.cy,x2:box.left,y2:box.cy},right:{px:Math.max(0,rightSurface-box.right),x1:box.right,y1:box.cy,x2:rightSurface,y2:box.cy},top:{px:Math.max(0,box.top-topSurface),x1:box.cx,y1:topSurface,x2:box.cx,y2:box.top},bottom:{px:Math.max(0,bottomSurface-box.bottom),x1:box.cx,y1:box.bottom,x2:box.cx,y2:bottomSurface}};
        m2PerfRememberDistanceDependency(rack,"walls",result);return result;
      }
`;
html = html.slice(0, wallStart) + newWallMeasurements + html.slice(wallEnd);

const oldBlocking = '      function m2RackOverlapsBlockingSymbol(rack,x=rack.x,y=rack.y,angle=rack.angle){const a=m2RackBounds(rack,x,y,angle);return m2LayoutSymbols.some((symbol)=>{if(!symbol.blocking)return false;const b=m2SymbolBounds(symbol);return a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;});}';
const newBlocking = '      function m2RackOverlapsBlockingSymbol(rack,x=rack.x,y=rack.y,angle=rack.angle){const a=m2RackBounds(rack,x,y,angle);return m2PerfBlockingSymbols().some((symbol)=>{const b=m2LayoutRuntimeCache.accessories.bounds.get(Number(symbol.id))||m2SymbolBounds(symbol);return a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;});}';
if (!html.includes(oldBlocking)) throw new Error("v29: blocking symbol kaynagi bulunamadi.");
html = html.replace(oldBlocking, newBlocking);

const columnScan = 'm2LayoutSymbols.filter((symbol)=>symbol.type==="column").forEach((symbol)=>';
if (!html.includes(columnScan)) throw new Error("v29: kolon tarama kaynagi bulunamadi.");
html = html.split(columnScan).join('m2PerfColumnObjects().forEach((symbol)=>');

const dragNeedle = '        const rack=m2LayoutState.racks.find((item)=>Number(item.id)===Number(drag.id)),layer=$("m2LayoutContent");if(!rack||!layer)return false;';
const dragReplacement = dragNeedle + '\n        if(!m2PerfBeginRuntimeFrame(rack))return true;';
if (!html.includes(dragNeedle)) throw new Error("v29: v28 tek-raf drag ankraji bulunamadi.");
html = html.replace(dragNeedle, dragReplacement);

const refreshNeedle='        if(window.rafexFreeLayoutPerfTables){window.rafexFreeLayoutPerfTables.rackDom=m2PerfRackDomTable;window.rafexFreeLayoutPerfTables.symbolDom=m2PerfSymbolDomTable;window.rafexFreeLayoutPerfTables.rackAuxDom=m2PerfRackAuxDomTable;}';
const refreshReplacement='        m2PerfRackDomTable.forEach((entry,id)=>m2LayoutRuntimeCache.domNodes.set("rack:"+id,entry));m2PerfSymbolDomTable.forEach((entry,id)=>m2LayoutRuntimeCache.domNodes.set("symbol:"+id,entry));m2PerfRackAuxDomTable.forEach((entry,id)=>m2LayoutRuntimeCache.domNodes.set("aux:"+id,entry));\n'+refreshNeedle;
if(!html.includes(refreshNeedle))throw new Error("v29: DOM registry ankraji bulunamadi.");
html=html.replace(refreshNeedle,refreshReplacement);

if(!html.includes(marker)||!html.includes("m2PerfWallGeometryTable()")||!html.includes("m2PerfColumnObjects().forEach")||!html.includes("m2PerfBlockingSymbols().some")||!html.includes("m2PerfBeginRuntimeFrame(rack)"))throw new Error("v29: runtime tablo dogrulamasi basarisiz.");
fs.writeFileSync(portalPath,html);
console.log("v29: Serbest yerlesim merkezi runtime tablolari aktif: wall/column/accessory geometry, distance dependencies, collision/DOM tables, dirty queue ve frame cache. Mesafe/cakisma formulleri korunuyor.");
