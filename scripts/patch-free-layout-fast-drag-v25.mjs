import fs from "node:fs";
import path from "node:path";

const portalPath = path.join(process.cwd(), "portal.html");
let html = fs.readFileSync(portalPath, "utf8");

function replaceRequired(from, to, label) {
  if (html.includes(to)) return;
  if (!html.includes(from)) throw new Error(`Serbest performans v25: ${label} bulunamadi`);
  html = html.replace(from, to);
}

// 1) En pahali iki sinir/raf cakisma aramasini azalt.
// Her pointer hareketinde 14/20 kez tum raflari taramak buyuk projelerde ana darboğazdi.
replaceRequired(
  `          for (let i = 0; i < 14; i++) {\n            const mid = (low + high) / 2, x = startX + (endX - startX) * mid, y = startY + (endY - startY) * mid;`,
  `          for (let i = 0; i < 6; i++) {\n            const mid = (low + high) / 2, x = startX + (endX - startX) * mid, y = startY + (endY - startY) * mid;`,
  "tek raf binary-search iterasyonu"
);
replaceRequired(
  `          for (let i = 0; i < 20; i++) {\n            const mid = (low + high) / 2;`,
  `          for (let i = 0; i < 6; i++) {\n            const mid = (low + high) / 2;`,
  "grup binary-search iterasyonu"
);

// 2) Raf suruklenirken tum SVG'yi innerHTML ile yeniden kurma.
// Sadece hareket eden <g data-rack> elemaninin mevcut SVG matrix'ine translation uygula.
const oldQueue = `      function m2QueueLayoutRender() {
        if (m2LayoutRenderFrame != null || m2LayoutRenderTimer != null) return;
        const interactive = Boolean(m2LayoutState.drag || m2SymbolDrag || m2NoteDrag || m2DimensionDrag || m2ProtectionDraft?.start || m2SeismicDraft?.start || m2MultiSelect.active && m2MultiSelect.start || m2AutoFillDraft || m2LayoutState.mode === "draw" && m2LayoutState.points.length || Number.isInteger(m2FreeMeasure.dragIndex));
        const now = performance.now();
        const minFrameGap = interactive ? 28 : 0;
        const delay = Math.max(0, minFrameGap - (now - m2LayoutLastInteractiveRender));
        const schedule = () => {
          m2LayoutRenderTimer = null;
          m2LayoutRenderFrame = requestAnimationFrame((stamp) => {
            m2LayoutRenderFrame = null;
            if (interactive) m2LayoutLastInteractiveRender = stamp;
            m2RenderLayout();
          });
        };
        if (delay > 1) m2LayoutRenderTimer = setTimeout(schedule, delay);
        else schedule();
      }`;

const newQueue = `      function m2FastRackDragPaint() {
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
      }
      function m2QueueLayoutRender() {
        if (m2LayoutState.drag) {
          if (m2LayoutRenderFrame != null) return;
          m2LayoutRenderFrame=requestAnimationFrame(()=>{m2LayoutRenderFrame=null;if(!m2FastRackDragPaint())m2RenderLayout();});
          return;
        }
        if (m2LayoutRenderFrame != null || m2LayoutRenderTimer != null) return;
        const interactive = Boolean(m2SymbolDrag || m2NoteDrag || m2DimensionDrag || m2ProtectionDraft?.start || m2SeismicDraft?.start || m2MultiSelect.active && m2MultiSelect.start || m2AutoFillDraft || m2LayoutState.mode === "draw" && m2LayoutState.points.length || Number.isInteger(m2FreeMeasure.dragIndex));
        const now = performance.now();
        const minFrameGap = interactive ? 28 : 0;
        const delay = Math.max(0, minFrameGap - (now - m2LayoutLastInteractiveRender));
        const schedule = () => {
          m2LayoutRenderTimer = null;
          m2LayoutRenderFrame = requestAnimationFrame((stamp) => {
            m2LayoutRenderFrame = null;
            if (interactive) m2LayoutLastInteractiveRender = stamp;
            m2RenderLayout();
          });
        };
        if (delay > 1) m2LayoutRenderTimer = setTimeout(schedule, delay);
        else schedule();
      }`;
replaceRequired(oldQueue,newQueue,"hizli raf surukleme renderi");

// 3) Browser 100-200 pointermove/sn uretebilir. Cakisma geometrisini proje buyudukce adaptif sinirla.
const dragOpen = `          } else if (m2LayoutState.drag) {\n            const rack = m2LayoutState.racks.find((item) => item.id === m2LayoutState.drag.id);`;
const dragOpenFast = `          } else if (m2LayoutState.drag) {\n            const dragNow=performance.now(),dragGap=m2LayoutState.racks.length>80?32:m2LayoutState.racks.length>40?24:16;if(m2LayoutState.drag.lastComputeAt&&dragNow-m2LayoutState.drag.lastComputeAt<dragGap)return;m2LayoutState.drag.lastComputeAt=dragNow;\n            const rack = m2LayoutState.racks.find((item) => item.id === m2LayoutState.drag.id);`;
replaceRequired(dragOpen,dragOpenFast,"adaptif drag hesaplama araligi");

fs.writeFileSync(portalPath, html);
console.log("Serbest performans v25: rack drag ghost-matrix render, adaptif pointer hesaplama ve 6-adim cakisma aramasi aktif.");
