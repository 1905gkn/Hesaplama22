import fs from "node:fs";
import path from "node:path";

const portalPath = path.join(process.cwd(), "portal.html");
let html = fs.readFileSync(portalPath, "utf8");

function replaceRequired(from, to, label) {
  if (html.includes(to)) return;
  if (!html.includes(from)) throw new Error(`Serbest performans v24: ${label} bulunamadi`);
  html = html.replace(from, to);
}

// Serbest yerlesim pointer hareketlerinde pahali tam SVG renderlarini 30-35 FPS bandina
// birlestir. Durum verisi her pointer eventinde guncellenmeye devam eder; sadece DOM yazimi
// tek bir zamanlanmis rendera indirgenir.
replaceRequired(
  "m2LastRackTap = { id:null, at:0 }, m2LayoutRenderFrame = null,",
  "m2LastRackTap = { id:null, at:0 }, m2LayoutRenderFrame = null, m2LayoutRenderTimer = null, m2LayoutLastInteractiveRender = 0,",
  "render zamanlayici degiskenleri"
);

replaceRequired(
`      function m2QueueLayoutRender() {
        if (m2LayoutRenderFrame != null) return;
        m2LayoutRenderFrame = requestAnimationFrame(() => { m2LayoutRenderFrame = null; m2RenderLayout(); });
      }`,
`      function m2QueueLayoutRender() {
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
      }`,
  "render kuyrugu"
);

// Pointermove icindeki dogrudan tam renderlari da ayni kuyruga al.
replaceRequired(
  'm2AutoFillDraft.manualLengthMm=null;const mm=Math.round(Math.hypot(m2AutoFillDraft.hover.x-m2AutoFillDraft.start.x,m2AutoFillDraft.hover.y-m2AutoFillDraft.start.y)/m2LayoutState.scale);if(input)input.value=String(mm);m2RenderLayout();',
  'm2AutoFillDraft.manualLengthMm=null;const mm=Math.round(Math.hypot(m2AutoFillDraft.hover.x-m2AutoFillDraft.start.x,m2AutoFillDraft.hover.y-m2AutoFillDraft.start.y)/m2LayoutState.scale);if(input)input.value=String(mm);m2QueueLayoutRender();',
  "uzatma onizleme renderi"
);
replaceRequired(
  'else if (Number.isInteger(m2FreeMeasure.dragIndex)) { m2FreeMeasure.points[m2FreeMeasure.dragIndex] = point; m2RenderLayout(); }',
  'else if (Number.isInteger(m2FreeMeasure.dragIndex)) { m2FreeMeasure.points[m2FreeMeasure.dragIndex] = point; m2QueueLayoutRender(); }',
  "serbest olcu surukleme renderi"
);
replaceRequired(
  'else if (m2LayoutTool === "measure" && m2FreeMeasure.points.length === 1) { m2FreeMeasure.hover = point; m2RenderLayout(); }',
  'else if (m2LayoutTool === "measure" && m2FreeMeasure.points.length === 1) { m2FreeMeasure.hover = point; m2QueueLayoutRender(); }',
  "serbest olcu onizleme renderi"
);
replaceRequired(
  'm2LayoutState.hover = m2SnapOrtho(point); m2RenderLayout();',
  'm2LayoutState.hover = m2SnapOrtho(point); m2QueueLayoutRender();',
  "alan cizim onizleme renderi"
);

// En buyuk kazanc: surukleme esnasinda SVG yeniden olusturulduktan sonra her karede
// tekrar querySelectorAll + event listener baglama + yan panel/duvar editoru hesaplarini
// calistirma. Pointerup sonrasi normal render bunlari tek seferde tekrar kurar.
replaceRequired(
  "        layer.innerHTML = html;\n        layer.querySelectorAll('[data-layout-symbol]')",
  "        layer.innerHTML = html;\n        if (interactiveRender) return;\n        layer.querySelectorAll('[data-layout-symbol]')",
  "interaktif render sonrasi agir DOM islemleri"
);

fs.writeFileSync(portalPath, html);
console.log("Serbest performans v24: pointer renderlari birlestirildi; interaktif karelerde agir panel/listener/rapor DOM islemleri atlandi.");
