import fs from 'node:fs';
import path from 'node:path';

const portalPath = path.join(process.cwd(), 'portal.html');
let html = fs.readFileSync(portalPath, 'utf8');

const oldStart = `m2LayoutState.drag = { id, dx: point.x - rack.x, dy: point.y - rack.y, originX:rack.x, originY:rack.y, groupMembers,selectionGroup,symbolMembers,undoCaptured:false };\n            svg.setPointerCapture?.(event.pointerId); m2RenderLayout();`;
const newStart = `m2LayoutState.drag = { id, dx: point.x - rack.x, dy: point.y - rack.y, originX:rack.x, originY:rack.y, groupMembers,selectionGroup,symbolMembers,undoCaptured:true };\n            m2PushUndo(\"Raf taşıma\");\n            svg.setPointerCapture?.(event.pointerId); m2QueueLayoutRender();`;

if (html.includes(oldStart)) {
  html = html.replace(oldStart, newStart);
} else if (!html.includes('undoCaptured:true };\n            m2PushUndo("Raf taşıma")')) {
  throw new Error('Raf sürükleme başlangıç bloğu bulunamadı.');
}

const firstMoveUndo = `if(!m2LayoutState.drag.undoCaptured){m2PushUndo(\"Raf taşıma\");m2LayoutState.drag.undoCaptured=true;}\n            const rack = m2LayoutState.racks.find((item) => item.id === m2LayoutState.drag.id);`;
const firstMoveFast = `const rack = m2LayoutState.racks.find((item) => item.id === m2LayoutState.drag.id);`;
if (html.includes(firstMoveUndo)) html = html.replace(firstMoveUndo, firstMoveFast);

fs.writeFileSync(portalPath, html);
console.log('Serbest yerleşim ilk sürükleme takılması azaltıldı: undo snapshot pointerdown aşamasına alındı ve ilk render kuyruğa taşındı.');
