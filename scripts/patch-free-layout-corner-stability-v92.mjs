import fs from "node:fs";
import path from "node:path";

const portalPath = path.join(process.cwd(), "portal.html");
let html = fs.readFileSync(portalPath, "utf8");

const marker = "function m2SmoothFreeRackPosition(rack,targetX,targetY)";
if (html.includes(marker)) {
  console.log("v92: Serbest Cizim kose geometrisi zaten tek kaynaga bagli.");
  process.exit(0);
}

function replaceRequired(from, to, label) {
  if (!html.includes(from)) throw new Error(`v92: ${label} bulunamadi.`);
  html = html.replace(from, to);
}

const moveHelper = `      function m2MoveRackOrJoinedGroup(rack, nextX, nextY) {`;
const cornerHelpers = `      function m2FreeAreaCenter(){
        const points=Array.isArray(m2LayoutState.points)?m2LayoutState.points:[];
        if(!points.length)return{x:500,y:325};
        return{x:points.reduce((sum,point)=>sum+Number(point.x||0),0)/points.length,y:points.reduce((sum,point)=>sum+Number(point.y||0),0)/points.length};
      }
      function m2SmoothFreeRackPosition(rack,targetX,targetY){
        const valid=(x,y)=>m2RackInsideArea(rack,x,y,rack.angle);
        if(valid(targetX,targetY))return{x:targetX,y:targetY,exact:true};
        const candidates=[],seeds=[];
        if(valid(rack.x,rack.y))seeds.push({x:rack.x,y:rack.y});
        const area=m2FreeAreaCenter(),center={x:area.x-rack.w/2,y:area.y-rack.h/2};
        if(valid(center.x,center.y))seeds.push(center);
        const approach=(start,endX,endY)=>{
          let low=0,high=1;
          for(let index=0;index<18;index++){
            const mid=(low+high)/2,x=start.x+(endX-start.x)*mid,y=start.y+(endY-start.y)*mid;
            if(valid(x,y))low=mid;else high=mid;
          }
          const x=start.x+(endX-start.x)*low,y=start.y+(endY-start.y)*low;
          if(valid(x,y))candidates.push({x,y,exact:false});
        };
        seeds.forEach((seed)=>{approach(seed,targetX,targetY);approach(seed,targetX,seed.y);approach(seed,seed.x,targetY);});
        candidates.sort((a,b)=>Math.hypot(a.x-targetX,a.y-targetY)-Math.hypot(b.x-targetX,b.y-targetY));
        return candidates[0]||seeds[0]||null;
      }
      function m2FreeGroupTranslationValid(origins,dx,dy){
        return origins.every((origin)=>{const member=m2LayoutState.racks.find((item)=>item.id===origin.id);return member&&m2RackInsideArea(member,origin.x+dx,origin.y+dy,member.angle);});
      }
      function m2SmoothFreeGroupTranslation(origins,targetDx,targetDy){
        if(m2FreeGroupTranslationValid(origins,targetDx,targetDy))return{dx:targetDx,dy:targetDy,exact:true};
        const seeds=[],candidates=[];
        if(m2FreeGroupTranslationValid(origins,0,0))seeds.push({dx:0,dy:0});
        const boxes=origins.map((origin)=>{const member=m2LayoutState.racks.find((item)=>item.id===origin.id);return member?m2RackBounds(member,origin.x,origin.y,member.angle):null;}).filter(Boolean);
        if(boxes.length){
          const area=m2FreeAreaCenter(),left=Math.min(...boxes.map((box)=>box.left)),right=Math.max(...boxes.map((box)=>box.right)),top=Math.min(...boxes.map((box)=>box.top)),bottom=Math.max(...boxes.map((box)=>box.bottom)),center={dx:area.x-(left+right)/2,dy:area.y-(top+bottom)/2};
          if(m2FreeGroupTranslationValid(origins,center.dx,center.dy))seeds.push(center);
        }
        const approach=(start,endDx,endDy)=>{
          let low=0,high=1;
          for(let index=0;index<18;index++){
            const mid=(low+high)/2,dx=start.dx+(endDx-start.dx)*mid,dy=start.dy+(endDy-start.dy)*mid;
            if(m2FreeGroupTranslationValid(origins,dx,dy))low=mid;else high=mid;
          }
          const dx=start.dx+(endDx-start.dx)*low,dy=start.dy+(endDy-start.dy)*low;
          if(m2FreeGroupTranslationValid(origins,dx,dy))candidates.push({dx,dy,exact:false});
        };
        seeds.forEach((seed)=>{approach(seed,targetDx,targetDy);approach(seed,targetDx,seed.dy);approach(seed,seed.dx,targetDy);});
        candidates.sort((a,b)=>Math.hypot(a.dx-targetDx,a.dy-targetDy)-Math.hypot(b.dx-targetDx,b.dy-targetDy));
        return candidates[0]||seeds[0]||{dx:0,dy:0,exact:false};
      }
${moveHelper}`;
replaceRequired(moveHelper, cornerHelpers, "kose yardimcilarinin ekleme noktasi");

const oldGroupChoice = "freeGroup?m2ClampGroupTranslationToCanvas(drag.groupMembers,targetDx,targetDy):m2SmoothGroupTranslation(drag.groupMembers,targetDx,targetDy)";
const newGroupChoice = "freeGroup?m2SmoothFreeGroupTranslation(drag.groupMembers,targetDx,targetDy):m2SmoothGroupTranslation(drag.groupMembers,targetDx,targetDy)";
replaceRequired(oldGroupChoice, newGroupChoice, "canli birlesik raf kose hesabi");

const oldBaseGroupChoice = "freeGroup?m2ClampGroupTranslationToCanvas(m2LayoutState.drag.groupMembers,targetDx,targetDy):m2SmoothGroupTranslation(m2LayoutState.drag.groupMembers,targetDx,targetDy)";
const newBaseGroupChoice = "freeGroup?m2SmoothFreeGroupTranslation(m2LayoutState.drag.groupMembers,targetDx,targetDy):m2SmoothGroupTranslation(m2LayoutState.drag.groupMembers,targetDx,targetDy)";
replaceRequired(oldBaseGroupChoice, newBaseGroupChoice, "temel birlesik raf kose hesabi");

const oldLiveFree = `        if(rack.freePlacement){
          rack.x=Math.max(0,Math.min(1000-rack.w,nextX));rack.y=Math.max(0,Math.min(650-rack.h,nextY));
          $("m2FloorStatus").textContent="İlk bırakmaya kadar duvarlardan bağımsız taşıyabilirsin.";m2PaintLiveRackDragFrame();return;
        }`;
const newLiveFree = `        if(rack.freePlacement){
          const freeAdjusted=m2SmoothFreeRackPosition(rack,nextX,nextY);if(freeAdjusted){rack.x=freeAdjusted.x;rack.y=freeAdjusted.y;}
          $("m2FloorStatus").textContent=freeAdjusted?.exact?"Raf gerçek alan sınırları içinde taşınıyor.":"Raf döndürülmüş köşeleri korunarak alan sınırında kaydırılıyor.";m2PaintLiveRackDragFrame();return;
        }`;
replaceRequired(oldLiveFree, newLiveFree, "canli tek raf kose hesabi");

const oldBaseFree = `            if (rack.freePlacement) {
              rack.x = Math.max(0, Math.min(1000 - rack.w, nextX)); rack.y = Math.max(0, Math.min(650 - rack.h, nextY));
              $("m2FloorStatus").textContent = "İlk bırakmaya kadar duvarlardan bağımsız taşıyabilirsin."; m2QueueLayoutRender(); return;
            }`;
const newBaseFree = `            if (rack.freePlacement) {
              const freeAdjusted=m2SmoothFreeRackPosition(rack,nextX,nextY);if(freeAdjusted){rack.x=freeAdjusted.x;rack.y=freeAdjusted.y;}
              $("m2FloorStatus").textContent = freeAdjusted?.exact ? "Raf gerçek alan sınırları içinde taşınıyor." : "Raf döndürülmüş köşeleri korunarak alan sınırında kaydırılıyor."; m2QueueLayoutRender(); return;
            }`;
replaceRequired(oldBaseFree, newBaseFree, "temel tek raf kose hesabi");

const oldDrop = `            else if (rack?.freePlacement) {
              rack.freePlacement = false; rack.staged = false; rack.locked = true;
              const outside = !m2RackInsideArea(rack), overlap = m2RackOverlaps(rack);
              $("m2FloorStatus").textContent = outside
                ? "Raf duvarın üzerinde veya alan dışında bırakıldı; bu konumdayken proje kaydedilemez."
                : overlap ? "Raf başka bir rafın üzerinde bırakıldı; bu konumdayken proje kaydedilemez."
                : "Raf bırakıldı; artık duvar ve çakışma sınırları aktif.";
              m2RenderLayout();
            }`;
const newDrop = `            else if (rack?.freePlacement) {
              const outside=!m2RackInsideArea(rack),overlap=m2RackOverlaps(rack),valid=!outside&&!overlap;
              rack.freePlacement=!valid;rack.staged=!valid;rack.locked=valid;
              $("m2FloorStatus").textContent=outside
                ? "Raf alan sınırında tutuldu; tamamı gerçek alan içine girene kadar serbest taşıma açık."
                : overlap ? "Raf başka bir rafla çakışıyor; uygun konuma gelene kadar serbest taşıma açık."
                : "Raf gerçek alan sınırları içinde yerleştirildi; duvar ve çakışma sınırları aktif.";
              m2RenderLayout();
            }`;
replaceRequired(oldDrop, newDrop, "tek raf birakma durumu");

for (const required of [marker,"function m2SmoothFreeGroupTranslation","freeGroup?m2SmoothFreeGroupTranslation","rack.freePlacement=!valid;rack.staged=!valid;rack.locked=valid"]) {
  if (!html.includes(required)) throw new Error("v92 son dogrulama eksik: " + required);
}
if (html.includes("freeGroup?m2ClampGroupTranslationToCanvas")) throw new Error("v92: eski dikdortgen grup siniri kaldi.");

fs.writeFileSync(portalPath, html);
console.log("v92: Tekli/birlesik/toplu raflar gercek poligon ve dondurulmus kose geometrisiyle sinirlanir; gecersiz birakma durumu kilitlenmez.");
