import fs from "node:fs";
import path from "node:path";

const portalPath = path.join(process.cwd(), "portal.html");
let html = fs.readFileSync(portalPath, "utf8");

const marker = "const m2PerfGeometryTable = new Map();";
if (html.includes(marker)) {
  console.log("v27: Serbest yerlesim geometri cache tablosu zaten mevcut.");
  process.exit(0);
}

const oldSymbolBounds = '      function m2SymbolBounds(symbol,x=symbol.x,y=symbol.y){const quarter=Math.abs((Number(symbol.angle)||0)%180)===90,cx=x+symbol.w/2,cy=y+symbol.h/2,w=quarter?symbol.h:symbol.w,h=quarter?symbol.w:symbol.h;return{left:cx-w/2,right:cx+w/2,top:cy-h/2,bottom:cy+h/2,cx,cy};}';
const newSymbolBounds = `      function m2SymbolBounds(symbol,x=symbol.x,y=symbol.y){
        const current=x===symbol.x&&y===symbol.y;
        if(current&&symbol?.id!=null){
          const key=\`${'${symbol.x}|${symbol.y}|${symbol.w}|${symbol.h}|${Number(symbol.angle)||0}'}\`,hit=m2PerfSymbolGeometryTable.get(symbol.id);
          if(hit?.key===key)return hit.value;
          const quarter=Math.abs((Number(symbol.angle)||0)%180)===90,cx=x+symbol.w/2,cy=y+symbol.h/2,w=quarter?symbol.h:symbol.w,h=quarter?symbol.w:symbol.h,value={left:cx-w/2,right:cx+w/2,top:cy-h/2,bottom:cy+h/2,cx,cy};
          m2PerfSymbolGeometryTable.set(symbol.id,{key,value});return value;
        }
        const quarter=Math.abs((Number(symbol.angle)||0)%180)===90,cx=x+symbol.w/2,cy=y+symbol.h/2,w=quarter?symbol.h:symbol.w,h=quarter?symbol.w:symbol.h;return{left:cx-w/2,right:cx+w/2,top:cy-h/2,bottom:cy+h/2,cx,cy};
      }`;

const oldBounds = `      function m2RackBounds(rack, x = rack.x, y = rack.y, angle = rack.angle) {
        const quarterTurn = Math.abs(angle % 180) === 90, overhang = m2RackVisualSideOverhang(rack), width = quarterTurn ? rack.h : rack.w + overhang * 2, height = quarterTurn ? rack.w + overhang * 2 : rack.h,
          cx = x + rack.w / 2, cy = y + rack.h / 2;
        return { left: cx - width / 2, right: cx + width / 2, top: cy - height / 2, bottom: cy + height / 2, cx, cy };
      }`;

const newBounds = `      const m2PerfGeometryTable = new Map();
      const m2PerfSymbolGeometryTable = new Map();
      const m2PerfSpatialTable = { drag:null, rackCount:-1, grid:new Map(), rackById:new Map(), cellSize:120 };
      function m2PerfRackGeometryKey(rack){
        return \`${'${rack.x}|${rack.y}|${rack.w}|${rack.h}|${rack.angle}|${rack.layoutView||""}|${rack.depthMm||""}|${(rack.plan?.feet||[]).join(",")}'}\`;
      }
      function m2PerfBuildSpatialTable(){
        const drag=m2LayoutState.drag;
        if(!drag)return null;
        if(m2PerfSpatialTable.drag===drag&&m2PerfSpatialTable.rackCount===m2LayoutState.racks.length)return m2PerfSpatialTable;
        const grid=new Map(),rackById=new Map(),cellSize=m2PerfSpatialTable.cellSize;
        const add=(cell,id)=>{let list=grid.get(cell);if(!list){list=[];grid.set(cell,list);}list.push(id);};
        m2LayoutState.racks.forEach((rack)=>{
          rackById.set(rack.id,rack);
          const b=m2RackBounds(rack),x0=Math.floor(b.left/cellSize),x1=Math.floor(b.right/cellSize),y0=Math.floor(b.top/cellSize),y1=Math.floor(b.bottom/cellSize);
          for(let gx=x0;gx<=x1;gx++)for(let gy=y0;gy<=y1;gy++)add(\`${'${gx}:${gy}'}\`,rack.id);
        });
        m2PerfSpatialTable.drag=drag;m2PerfSpatialTable.rackCount=m2LayoutState.racks.length;m2PerfSpatialTable.grid=grid;m2PerfSpatialTable.rackById=rackById;
        return m2PerfSpatialTable;
      }
      function m2PerfCollisionCandidates(bounds){
        const table=m2PerfBuildSpatialTable();
        if(!table)return m2LayoutState.racks;
        const ids=new Set(),cellSize=table.cellSize,x0=Math.floor(bounds.left/cellSize),x1=Math.floor(bounds.right/cellSize),y0=Math.floor(bounds.top/cellSize),y1=Math.floor(bounds.bottom/cellSize);
        for(let gx=x0;gx<=x1;gx++)for(let gy=y0;gy<=y1;gy++)(table.grid.get(\`${'${gx}:${gy}'}\`)||[]).forEach((id)=>ids.add(id));
        return [...ids].map((id)=>table.rackById.get(id)).filter(Boolean);
      }
      function m2RackBounds(rack, x = rack.x, y = rack.y, angle = rack.angle) {
        const current=x===rack.x&&y===rack.y&&angle===rack.angle;
        if(current&&rack?.id!=null){
          const key=m2PerfRackGeometryKey(rack),hit=m2PerfGeometryTable.get(rack.id);
          if(hit?.key===key)return hit.value;
          const quarterTurn = Math.abs(angle % 180) === 90, overhang = m2RackVisualSideOverhang(rack), width = quarterTurn ? rack.h : rack.w + overhang * 2, height = quarterTurn ? rack.w + overhang * 2 : rack.h,
            cx = x + rack.w / 2, cy = y + rack.h / 2, value={ left: cx - width / 2, right: cx + width / 2, top: cy - height / 2, bottom: cy + height / 2, cx, cy };
          m2PerfGeometryTable.set(rack.id,{key,value});
          if(m2PerfGeometryTable.size>Math.max(200,m2LayoutState.racks.length*3)){
            const live=new Set(m2LayoutState.racks.map((item)=>item.id));for(const id of m2PerfGeometryTable.keys())if(!live.has(id))m2PerfGeometryTable.delete(id);
          }
          return value;
        }
        const quarterTurn = Math.abs(angle % 180) === 90, overhang = m2RackVisualSideOverhang(rack), width = quarterTurn ? rack.h : rack.w + overhang * 2, height = quarterTurn ? rack.w + overhang * 2 : rack.h,
          cx = x + rack.w / 2, cy = y + rack.h / 2;
        return { left: cx - width / 2, right: cx + width / 2, top: cy - height / 2, bottom: cy + height / 2, cx, cy };
      }
      window.rafexFreeLayoutPerfTables={rackGeometry:m2PerfGeometryTable,symbolGeometry:m2PerfSymbolGeometryTable,spatial:m2PerfSpatialTable};`;

const oldOverlaps = `      function m2RackOverlaps(rack, x = rack.x, y = rack.y, angle = rack.angle) {
        const a = m2RackBounds(rack, x, y, angle);
        return m2RackOverlapsBlockingSymbol(rack,x,y,angle) || m2LayoutState.racks.some((other) => {
          if (other.id === rack.id) return false;
          if (rack.joinGroup && other.joinGroup === rack.joinGroup) return false;
          const b = m2RackBounds(other);
          return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
        });
      }`;

const newOverlaps = `      function m2RackOverlaps(rack, x = rack.x, y = rack.y, angle = rack.angle) {
        const a = m2RackBounds(rack, x, y, angle);
        if(m2RackOverlapsBlockingSymbol(rack,x,y,angle))return true;
        return m2PerfCollisionCandidates(a).some((other) => {
          if (other.id === rack.id) return false;
          if (rack.joinGroup && other.joinGroup === rack.joinGroup) return false;
          const b = m2RackBounds(other);
          return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
        });
      }`;

const oldOverlapsExcept = `      function m2RackOverlapsExcept(rack, x = rack.x, y = rack.y, angle = rack.angle, excludedIds = []) {
        const excluded = new Set(excludedIds.map(Number)), a = m2RackBounds(rack,x,y,angle);
        return m2RackOverlapsBlockingSymbol(rack,x,y,angle) || m2LayoutState.racks.some((other) => {
          if (other.id === rack.id || excluded.has(Number(other.id))) return false;
          const b = m2RackBounds(other);
          return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
        });
      }`;

const newOverlapsExcept = `      function m2RackOverlapsExcept(rack, x = rack.x, y = rack.y, angle = rack.angle, excludedIds = []) {
        const excluded = new Set(excludedIds.map(Number)), a = m2RackBounds(rack,x,y,angle);
        if(m2RackOverlapsBlockingSymbol(rack,x,y,angle))return true;
        return m2PerfCollisionCandidates(a).some((other) => {
          if (other.id === rack.id || excluded.has(Number(other.id))) return false;
          const b = m2RackBounds(other);
          return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
        });
      }`;

if(!html.includes(oldSymbolBounds))throw new Error("v27: m2SymbolBounds kaynagi bulunamadi.");
if(!html.includes(oldBounds))throw new Error("v27: m2RackBounds kaynagi bulunamadi.");
if(!html.includes(oldOverlaps))throw new Error("v27: m2RackOverlaps kaynagi bulunamadi.");
if(!html.includes(oldOverlapsExcept))throw new Error("v27: m2RackOverlapsExcept kaynagi bulunamadi.");

html=html.replace(oldSymbolBounds,newSymbolBounds);
html=html.replace(oldBounds,newBounds);
html=html.replace(oldOverlaps,newOverlaps);
html=html.replace(oldOverlapsExcept,newOverlapsExcept);

if(!html.includes(marker)||!html.includes("m2PerfCollisionCandidates(a).some"))throw new Error("v27: cache/spatial tablo dogrulamasi basarisiz.");
fs.writeFileSync(portalPath,html);
console.log("v27: Serbest yerlesim geometri tablosu aktif: duran raf bounds cache + drag boyunca spatial grid + ayni mesafe/cakisma formulleri.");
