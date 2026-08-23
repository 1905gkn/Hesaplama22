import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const mode = process.argv[2];
const marker = 'data-rafex-mr-free-extension="v35"';

function planExtension(targetMm, sectionMm, footMm) {
  const target = Math.max(0, Math.round(Number(targetMm) || 0));
  const section = Math.max(500, Math.round(Number(sectionMm) || 0));
  const foot = Math.max(1, Math.round(Number(footMm) || 60));
  let occupied = 0;
  let count = 0;
  while (count < 100) {
    const increment = section + foot;
    if (occupied + increment > target + 0.01) break;
    occupied += increment;
    count += 1;
  }
  const wallRemaining = Math.max(0, target - occupied);
  const netRemaining = Math.max(0, wallRemaining - foot);
  const customMax = Math.floor(netRemaining / 50) * 50;
  return { count, occupied, wallRemaining, netRemaining, customMax, needsCustom: netRemaining > 500 && customMax >= 500 };
}

function summarizeMrCounts(racks) {
  return (racks || []).reduce((totals, rack) => {
    const modules = Math.max(1, Math.round(Number(rack?.modules) || 1));
    const levels = Math.max(1, Math.round(Number(rack?.levels) || 1));
    const trayPieces = Math.max(0, Math.round(Number(rack?.trayPieces) || 0));
    const trayLevels = Math.max(0, Math.round(Number(rack?.trayLevels) || 0));
    totals.uprights += modules + (rack?.sharedFootWith ? 0 : 1);
    totals.traverses += modules * levels * 2;
    totals.trays += modules * trayPieces * trayLevels;
    return totals;
  }, { uprights:0, traverses:0, trays:0 });
}

function connectedJoinedIds(racks, selectedId) {
  const owner = (racks || []).find((rack) => Number(rack?.id) === Number(selectedId));
  if (!owner?.joinGroup) return owner ? [owner.id] : [];
  const members = racks.filter((rack) => rack?.joinGroup === owner.joinGroup);
  const byId = new Map(members.map((rack) => [Number(rack.id), rack]));
  const links = new Map(members.map((rack) => [Number(rack.id), []]));
  members.forEach((rack) => {
    const parent = Number(rack.sharedFootWith);
    if (!Number.isFinite(parent) || !byId.has(parent)) return;
    links.get(Number(rack.id)).push(parent);
    links.get(parent).push(Number(rack.id));
  });
  const found = [], pending = [Number(owner.id)], visited = new Set();
  while (pending.length) {
    const id = pending.pop();
    if (visited.has(id) || !byId.has(id)) continue;
    visited.add(id); found.push(byId.get(id).id);
    links.get(id).forEach((next) => pending.push(next));
  }
  return found;
}

assert.deepEqual(planExtension(8000, 2500, 60), { count: 3, occupied: 7680, wallRemaining: 320, netRemaining: 260, customMax: 250, needsCustom: false });
assert.deepEqual(planExtension(7000, 2500, 60), { count: 2, occupied: 5120, wallRemaining: 1880, netRemaining: 1820, customMax: 1800, needsCustom: true });
assert.equal(planExtension(620, 2500, 60).customMax, 550);
assert.equal(planExtension(670, 2500, 60).customMax, 600);
assert.deepEqual(summarizeMrCounts([
  { modules:1, levels:4, trayPieces:8, trayLevels:4 },
  { modules:1, levels:4, trayPieces:8, trayLevels:4, sharedFootWith:1 },
  { modules:1, levels:4, trayPieces:8, trayLevels:4, sharedFootWith:2 },
]), { uprights:4, traverses:24, trays:96 });
assert.deepEqual(summarizeMrCounts([
  { modules:1, levels:4, trayPieces:8, trayLevels:4 },
  { modules:1, levels:4, trayPieces:8, trayLevels:4, sharedFootWith:1 },
  { modules:1, levels:4, trayPieces:8, trayLevels:4 },
]), { uprights:5, traverses:24, trays:96 });
assert.deepEqual(summarizeMrCounts([{ modules:3, levels:4, trayPieces:8, trayLevels:2 }]), { uprights:4, traverses:24, trays:48 });
assert.deepEqual(connectedJoinedIds([
  { id:1, joinGroup:"same" },
  { id:2, joinGroup:"same", sharedFootWith:1 },
  { id:3, joinGroup:"same" },
  { id:4, joinGroup:"same", sharedFootWith:3 },
], 1), [1, 2]);

if (mode === "source") {
  const portalPath = path.join(root, "portal.html");
  const mrViewerPath = path.join(root, "client/mr-viewer.entry.js");
  const sectionPositionerPath = path.join(root, "client/b2b-section-positioner-v5.js");
  let portal = fs.readFileSync(portalPath, "utf8");

  const oldSection = "const config=mrConfigurationV2(),footWidth=config.uprightWidth,totalWidth=config.modules*config.width+(config.modules+1)*footWidth,sectionWidth=totalWidth;";
  const newSection = "const config=mrConfigurationV2(),footWidth=config.uprightWidth,totalWidth=config.modules*config.width+(config.modules+1)*footWidth,sectionWidth=config.modules*config.width;";
  if (portal.includes(oldSection)) portal = portal.replace(oldSection, newSection);
  else if (!portal.includes(newSection)) throw new Error("MR v35: MR net bolum genisligi bulunamadi.");

  const oldNormalize = "m2LayoutState.racks.forEach((rack)=>{\n          if(!rack?.b2bLayout)return;";
  const newNormalize = "m2LayoutState.racks.forEach((rack)=>{\n          if(!rack?.b2bLayout||rack?.b2b?.mr)return;";
  if (portal.includes(oldNormalize)) portal = portal.replace(oldNormalize, newNormalize);
  else if (!portal.includes(newNormalize)) throw new Error("MR v35: B2B fiziksel genislik normalizasyonu bulunamadi.");

  // Serbest yerlesim varsayimlari: ortak ayak etiketi kullanici istemeden
  // gorunmez; olcu etiketleri de tasinmis eski koordinatlarla ekran disina cikmaz.
  const oldSharedButton = '<button type="button" id="m2SharedFootLabelButton" onclick="m2ToggleSharedFootLabels()">Ortak Ayağı Gizle</button>';
  const newSharedButton = '<button type="button" id="m2SharedFootLabelButton" aria-pressed="false" onclick="m2ToggleSharedFootLabels()">Ortak Ayağı Göster</button>';
  if (portal.includes(oldSharedButton)) portal = portal.replace(oldSharedButton, newSharedButton);
  else if (!portal.includes(newSharedButton)) throw new Error("MR v42: ortak ayak dugmesi bulunamadi.");

  const oldFreshShared = "visibleRackDimensions:{ length:new Set(), depth:new Set() }, showSharedFootLabels:true, reportImages:Array(4).fill(null)";
  const newFreshShared = "visibleRackDimensions:{ length:new Set(), depth:new Set() }, showSharedFootLabels:false, reportImages:Array(4).fill(null)";
  if (portal.includes(oldFreshShared)) portal = portal.replace(oldFreshShared, newFreshShared);
  else if (!portal.includes(newFreshShared)) throw new Error("MR v42: ortak ayak varsayilan durumu bulunamadi.");

  const oldSharedState = 'sharedFootButton.classList.toggle("active",!m2ShowSharedFootLabels);sharedFootButton.setAttribute("aria-pressed",String(!m2ShowSharedFootLabels));';
  const newSharedState = 'sharedFootButton.classList.toggle("active",m2ShowSharedFootLabels);sharedFootButton.setAttribute("aria-pressed",String(m2ShowSharedFootLabels));';
  if (portal.includes(oldSharedState)) portal = portal.replace(oldSharedState, newSharedState);
  else if (!portal.includes(newSharedState)) throw new Error("MR v42: ortak ayak dugme durumu bulunamadi.");

  const oldDimensionPosition = "function m2DimensionPosition(key, x, y) { const offset = m2DimensionOffsets[key] || { x: 0, y: 0 }; return { x: x + offset.x, y: y + offset.y }; }";
  const newDimensionPosition = "function m2DimensionPosition(key, x, y) { const offset = m2DimensionOffsets[key] || { x: 0, y: 0 }, nextX=x+(Number(offset.x)||0), nextY=y+(Number(offset.y)||0); return { x:Math.max(22,Math.min(978,nextX)), y:Math.max(20,Math.min(630,nextY)) }; }";
  if (portal.includes(oldDimensionPosition)) portal = portal.replace(oldDimensionPosition, newDimensionPosition);
  else if (!portal.includes(newDimensionPosition)) throw new Error("MR v42: olcu etiketi konumlandiricisi bulunamadi.");

  // Aynı joinGroup adının yanlışlıkla başka bir raf sırasında da kalması,
  // birleşik sınırı iki ayrı sıra boyunca büyütüp RAF ARASI çizgisini ilgisiz
  // rafların arasına taşıyabiliyordu. Yalnız ortak-ayak bağlantısıyla erişilen
  // fiziksel zincir birleşik kabul edilir.
  const oldJoinedMembers = `function m2JoinedRackMembers(rack) {
        return rack?.joinGroup ? m2LayoutState.racks.filter((item) => item.joinGroup === rack.joinGroup) : rack ? [rack] : [];
      }`;
  const newJoinedMembers = `function m2JoinedRackMembers(rack) {
        if(!rack)return[];if(!rack.joinGroup)return[rack];
        const members=m2LayoutState.racks.filter((item)=>item.joinGroup===rack.joinGroup),byId=new Map(members.map((item)=>[Number(item.id),item])),links=new Map(members.map((item)=>[Number(item.id),[]]));
        members.forEach((item)=>{const parent=Number(item.sharedFootWith);if(!Number.isFinite(parent)||!byId.has(parent))return;links.get(Number(item.id)).push(parent);links.get(parent).push(Number(item.id));});
        const connected=[],pending=[Number(rack.id)],visited=new Set();while(pending.length){const id=pending.pop();if(visited.has(id)||!byId.has(id))continue;visited.add(id);connected.push(byId.get(id));(links.get(id)||[]).forEach((next)=>pending.push(next));}
        return connected.length?connected:[rack];
      }`;
  if (portal.includes(oldJoinedMembers)) portal = portal.replace(oldJoinedMembers, newJoinedMembers);
  else if (!portal.includes("const connected=[],pending=[Number(rack.id)]")) throw new Error("MR v43: fiziksel raf zinciri bulunamadi.");

  const oldRackDistanceGuide = `function m2RackDistanceGuide(rack) {
        const nearest = m2NearestRackGap(rack);
        if (!nearest) return "";
        const mm = Math.max(0, Math.round(nearest.distance / m2LayoutState.scale) - nearest.clearanceMm), mx = (nearest.ax + nearest.bx) / 2, my = (nearest.ay + nearest.by) / 2, axis = Math.abs(nearest.ax - nearest.bx) < Math.abs(nearest.ay - nearest.by) ? "vertical" : "horizontal", label = m2DimensionPosition(\`gap:\${rack.id}\`, mx, my - 8);
        return \`<g class="m2-distance-guide" data-rack-gap="\${mm}"><line x1="\${nearest.ax}" y1="\${nearest.ay}" x2="\${nearest.bx}" y2="\${nearest.by}" class="m2-rack-distance"/><circle cx="\${nearest.ax}" cy="\${nearest.ay}" r="4" fill="#e09b00"/><circle cx="\${nearest.bx}" cy="\${nearest.by}" r="4" fill="#e09b00"/><rect x="\${label.x-48}" y="\${label.y-13}" width="96" height="20" rx="5" class="m2-measure-hit" data-dimension-key="gap:\${rack.id}" data-dimension-axis="\${axis}" onpointerdown="event.stopPropagation();if(m2LayoutTool!=='dimension'){event.preventDefault();m2PromptRackDistance(\${rack.id},\${mm})}"/><text x="\${label.x}" y="\${label.y}" text-anchor="middle" class="m2-rack-distance-label m2-dimension-movable" data-dimension-key="gap:\${rack.id}" data-dimension-axis="\${axis}" onpointerdown="event.stopPropagation();if(m2LayoutTool!=='dimension'){event.preventDefault();m2PromptRackDistance(\${rack.id},\${mm})}">RAF ARASI \${fmt(mm)} mm</text></g>\`;
      }`;
  const newRackDistanceGuide = `function m2RackDistanceGuide(rack) {
        const owner=m2LayoutState.racks.find((item)=>Number(item.id)===Number(rack?.id));if(!owner)return"";
        const nearest = m2NearestRackGap(owner);
        if (!nearest) return "";
        const mm = Math.max(0, Math.round(nearest.distance / m2LayoutState.scale) - nearest.clearanceMm), mx = (nearest.ax + nearest.bx) / 2, my = (nearest.ay + nearest.by) / 2, axis = Math.abs(nearest.ax - nearest.bx) < Math.abs(nearest.ay - nearest.by) ? "vertical" : "horizontal", label = m2DimensionPosition(\`gap:\${owner.id}\`, mx, my - 8);
        return \`<g class="m2-distance-guide" data-rack-gap="\${mm}" data-rack-gap-owner="\${owner.id}" data-rack-gap-other="\${nearest.other?.id??''}"><line x1="\${nearest.ax}" y1="\${nearest.ay}" x2="\${nearest.bx}" y2="\${nearest.by}" class="m2-rack-distance"/><circle cx="\${nearest.ax}" cy="\${nearest.ay}" r="4" fill="#e09b00"/><circle cx="\${nearest.bx}" cy="\${nearest.by}" r="4" fill="#e09b00"/><rect x="\${label.x-48}" y="\${label.y-13}" width="96" height="20" rx="5" class="m2-measure-hit" data-dimension-key="gap:\${owner.id}" data-dimension-axis="\${axis}" onpointerdown="event.stopPropagation();if(m2LayoutTool!=='dimension'){event.preventDefault();m2PromptRackDistance(\${owner.id},\${mm})}"/><text x="\${label.x}" y="\${label.y}" text-anchor="middle" class="m2-rack-distance-label m2-dimension-movable" data-dimension-key="gap:\${owner.id}" data-dimension-axis="\${axis}" onpointerdown="event.stopPropagation();if(m2LayoutTool!=='dimension'){event.preventDefault();m2PromptRackDistance(\${owner.id},\${mm})}">RAF ARASI \${fmt(mm)} mm</text></g>\`;
      }`;
  if (portal.includes(oldRackDistanceGuide)) portal = portal.replace(oldRackDistanceGuide, newRackDistanceGuide);
  else if (!portal.includes('data-rack-gap-owner="${owner.id}"')) throw new Error("MR v43: raf arasi sahipligi bulunamadi.");

  // Bir raf seciliyken daha once sabitlenmis baska raf olculeri ayni katmanda
  // gosterilmez. Secim kalkinca kullanicinin sabitledigi olculer yeniden gorunur.
  const oldPinnedGuideRender = `m2LayoutState.racks.forEach((rack)=>{if(rack.id===selectedRack?.id)return;const pinned=m2PinnedForRack(rack.id);if(!Object.values(pinned).some(Boolean))return;html+=m2WallDistanceGuides(rack,pinned)+(pinned.gap?m2RackDistanceGuide(rack)+m2ColumnDistanceGuide(rack):"");});`;
  const newPinnedGuideRender = `m2LayoutState.racks.forEach((rack)=>{if(selectedRack||rack.id===selectedRack?.id)return;const pinned=m2PinnedForRack(rack.id);if(!Object.values(pinned).some(Boolean))return;html+=m2WallDistanceGuides(rack,pinned)+(pinned.gap?m2RackDistanceGuide(rack)+m2ColumnDistanceGuide(rack):"");});`;
  if (portal.includes(oldPinnedGuideRender)) portal = portal.replace(oldPinnedGuideRender, newPinnedGuideRender);
  else if (!portal.includes("if(selectedRack||rack.id===selectedRack?.id)return")) throw new Error("MR v43: secili raf olcu onceligi bulunamadi.");

  // Hizli surukleme katmani eski rafin RAF ARASI SVG'sini yeniden kullanmasin.
  const oldEnsureOverlay = `function m2PerfEnsureDragOverlay(layer){
        if(m2PerfDragOverlay?.isConnected&&m2PerfDragOverlay.parentNode===layer)return m2PerfDragOverlay;
        const overlay=document.createElementNS("http://www.w3.org/2000/svg","g");overlay.setAttribute("data-rafex-drag-overlay","v28");layer.appendChild(overlay);m2PerfDragOverlay=overlay;return overlay;
      }`;
  const newEnsureOverlay = `function m2PerfEnsureDragOverlay(layer,rackId){
        if(m2PerfDragOverlay?.isConnected&&m2PerfDragOverlay.parentNode===layer){if(Number(m2PerfDragOverlay.dataset.rackOwner)!==Number(rackId))m2PerfDragOverlay.innerHTML="";m2PerfDragOverlay.dataset.rackOwner=String(rackId);return m2PerfDragOverlay;}
        const overlay=document.createElementNS("http://www.w3.org/2000/svg","g");overlay.setAttribute("data-rafex-drag-overlay","v43");overlay.dataset.rackOwner=String(rackId);layer.appendChild(overlay);m2PerfDragOverlay=overlay;return overlay;
      }`;
  if (portal.includes(oldEnsureOverlay)) portal = portal.replace(oldEnsureOverlay, newEnsureOverlay);
  else if (!portal.includes('data-rafex-drag-overlay","v43"')) throw new Error("MR v43: surukleme olcu sahipligi bulunamadi.");

  const oldFastDragGuard = `const drag=m2LayoutState.drag;if(!drag||drag.selectionGroup||Number(drag.groupMembers?.length||1)>1)return false;`;
  const newFastDragGuard = `const drag=m2LayoutState.drag;if(!drag||Number(m2LayoutState.selected)!==Number(drag.id)||drag.selectionGroup||Number(drag.groupMembers?.length||1)>1)return false;`;
  if (portal.includes(oldFastDragGuard)) portal = portal.replace(oldFastDragGuard, newFastDragGuard);
  else if (!portal.includes("Number(m2LayoutState.selected)!==Number(drag.id)")) throw new Error("MR v43: secili surukleme korumasi bulunamadi.");

  const oldOverlayCall = `const overlay=m2PerfEnsureDragOverlay(layer),guideHtml=m2WallDistanceGuides(rack,{left:true,right:true,top:true,bottom:true,gap:true})+m2RackDistanceGuide(rack)+m2ColumnDistanceGuide(rack)+m2PerfMovingSeismicSvg(rack.id);`;
  const newOverlayCall = `const overlay=m2PerfEnsureDragOverlay(layer,rack.id),guideHtml=m2WallDistanceGuides(rack,{left:true,right:true,top:true,bottom:true,gap:true})+m2RackDistanceGuide(rack)+m2ColumnDistanceGuide(rack)+m2PerfMovingSeismicSvg(rack.id);`;
  if (portal.includes(oldOverlayCall)) portal = portal.replace(oldOverlayCall, newOverlayCall);
  else if (!portal.includes("m2PerfEnsureDragOverlay(layer,rack.id)")) throw new Error("MR v43: surukleme katmani raf baglantisi bulunamadi.");

  const oldFullLayerWrite = `layer.innerHTML = html; m2PerfRefreshLayoutDomTable(layer);`;
  const newFullLayerWrite = `if(m2PerfDragOverlay?.isConnected)m2PerfDragOverlay.remove();m2PerfDragOverlay=null;layer.innerHTML = html; m2PerfRefreshLayoutDomTable(layer);`;
  if (portal.includes(oldFullLayerWrite)) portal = portal.replace(oldFullLayerWrite, newFullLayerWrite);
  else if (!portal.includes("m2PerfDragOverlay=null;layer.innerHTML = html")) throw new Error("MR v43: eski surukleme katmani temizligi bulunamadi.");

  const oldSeparate = `function m2SeparateSelectedRack() {
        const rack=m2SelectedRack();
        if(!rack?.joinGroup){$("m2FloorStatus").textContent="Ayırmak için birleşik bir modül seç.";return;}
        m2PushUndo("Raf ayırma");
        const oldGroup=rack.joinGroup;rack.joinGroup=null;rack.sharedFootWith=null;rack.sharedFootSide=null;rack.freePlacement=true;rack.staged=true;rack.locked=false;
        m2LayoutState.racks.forEach((item)=>{if(item.sharedFootWith===rack.id){item.sharedFootWith=null;item.sharedFootSide=null;}});
        m2NormalizeJoinComponents(oldGroup);
        $("m2FloorStatus").textContent="Seçili modül birleşik gruptan ayrıldı. İlk bırakmaya kadar serbestçe taşıyabilirsin.";m2RenderLayout();
      }`;
  const newSeparate = `function m2SeparateSelectedRack() {
        const rack=m2SelectedRack();
        if(!rack?.joinGroup){$("m2FloorStatus").textContent="Ayırmak için birleşik bir modül seç.";return;}
        m2PushUndo("Raf ayırma");
        const oldGroup=rack.joinGroup,baseBlock=String(rack.blockName||rack.typeName||"MR Raf").replace(/ · Bağımsız(?: \\d+)?$/u,"");
        rack.joinGroup=null;rack.sharedFootWith=null;rack.sharedFootSide=null;rack.freePlacement=false;rack.staged=false;rack.locked=true;rack.specLocked=true;rack.independentBlock=true;rack.independentBlockId="independent-"+rack.id;rack.blockName=baseBlock+" · Bağımsız";
        m2LayoutState.racks.forEach((item)=>{if(item.id!==rack.id&&item.sharedFootWith===rack.id){item.sharedFootWith=null;item.sharedFootSide=null;}});
        Object.keys(m2DimensionOffsets).filter((key)=>key.includes(":"+rack.id)).forEach((key)=>delete m2DimensionOffsets[key]);
        delete m2PinnedDimensionsByRack[String(rack.id)];m2PinnedDimensions=m2EmptyPinnedDimensions();m2LayoutState.pinnedRackId=null;
        m2NormalizeJoinComponents(oldGroup);
        $("m2FloorStatus").textContent="Seçili modül ortak ayak ve grup ilişkilerinden ayrıldı; artık tamamen bağımsız bir raf bloğu.";m2RenderLayout();
      }`;
  if (portal.includes(oldSeparate)) portal = portal.replace(oldSeparate, newSeparate);
  else if (!portal.includes('rack.independentBlockId="independent-"+rack.id')) throw new Error("MR v42: raf ayirma fonksiyonu bulunamadi.");

  const oldControlSelector = 'controls.querySelectorAll("input,button").forEach((element)=>element.disabled=!active);';
  const newControlSelector = 'controls.querySelectorAll("input,button:not(.rafex-extension-toggle)").forEach((element)=>element.disabled=!active);';
  if (portal.includes(oldControlSelector)) portal = portal.replace(oldControlSelector, newControlSelector);
  else if (!portal.includes(newControlSelector)) throw new Error("MR v42: uzatma kontrol secicisi bulunamadi.");

  // MR uzatmada fare hem yonu hem istenen mesafeyi belirler. Ancak isaretlenen
  // noktadan once duvar/raf/kolon/bariyer varsa cizgi ve yerlestirme engelde durur.
  const oldPointerCommit = "if (m2AutoFillDraft && !rackNode) { m2CommitAutoFillGuide(point); return; }";
  const newPointerCommit = "if (m2AutoFillDraft && !rackNode) { if(m2AutoFillDraft.rafexSystem==='mr'&&typeof window.rafexCommitMrObstacleV40==='function')window.rafexCommitMrObstacleV40(point);else m2CommitAutoFillGuide(point); return; }";
  if (portal.includes(oldPointerCommit)) portal = portal.replace(oldPointerCommit, newPointerCommit);
  else if (!portal.includes(newPointerCommit)) throw new Error("MR v40: pointer commit baglanti noktasi bulunamadi.");

  const oldPointerMove = `if (m2AutoFillDraft && !m2LayoutState.drag) { const input=$("m2AutoFillLength"),manualTyping=input&&document.activeElement===input&&input.value;if(!manualTyping){m2AutoFillDraft.hover = m2ProjectAutoFillPoint(point);m2AutoFillDraft.manualLengthMm=null;const mm=Math.round(Math.hypot(m2AutoFillDraft.hover.x-m2AutoFillDraft.start.x,m2AutoFillDraft.hover.y-m2AutoFillDraft.start.y)/m2LayoutState.scale);if(input)input.value=String(mm);m2RenderLayout();} }`;
  const priorPointerMove = `if (m2AutoFillDraft && !m2LayoutState.drag) { const input=$("m2AutoFillLength"),manualTyping=input&&document.activeElement===input&&input.value;if(!manualTyping){const mrObstacle=m2AutoFillDraft.rafexSystem==='mr'&&typeof window.rafexProjectMrObstacleV40==='function';m2AutoFillDraft.hover = mrObstacle?window.rafexProjectMrObstacleV40(point):m2ProjectAutoFillPoint(point);m2AutoFillDraft.manualLengthMm=null;const mm=mrObstacle?Math.max(0,Math.round(Number(m2AutoFillDraft.obstacleDistanceMm)||0)):Math.round(Math.hypot(m2AutoFillDraft.hover.x-m2AutoFillDraft.start.x,m2AutoFillDraft.hover.y-m2AutoFillDraft.start.y)/m2LayoutState.scale);if(input)input.value=String(mm);m2RenderLayout();} }`;
  const newPointerMove = `if (m2AutoFillDraft && !m2LayoutState.drag) { const input=$("m2AutoFillLength"),manualTyping=input&&document.activeElement===input&&input.value;if(!manualTyping){const mrObstacle=m2AutoFillDraft.rafexSystem==='mr'&&typeof window.rafexProjectMrObstacleV40==='function';m2AutoFillDraft.hover = mrObstacle?window.rafexProjectMrObstacleV40(point):m2ProjectAutoFillPoint(point);m2AutoFillDraft.manualLengthMm=null;const mm=mrObstacle?Math.max(0,Math.round(Number(m2AutoFillDraft.selectedLengthMm)||0)):Math.round(Math.hypot(m2AutoFillDraft.hover.x-m2AutoFillDraft.start.x,m2AutoFillDraft.hover.y-m2AutoFillDraft.start.y)/m2LayoutState.scale);if(input)input.value=String(mm);m2RenderLayout();} }`;
  if (portal.includes(oldPointerMove)) portal = portal.replace(oldPointerMove, newPointerMove);
  else if (portal.includes(priorPointerMove)) portal = portal.replace(priorPointerMove, newPointerMove);
  else if (!portal.includes(newPointerMove)) throw new Error("MR v40: pointer move baglanti noktasi bulunamadi.");

  const oldGuide = `if (m2AutoFillDraft?.hover) { const start=m2AutoFillDraft.start,end=m2AutoFillDraft.hover,mm=m2AutoFillDraft.manualLengthMm??Math.round(Math.hypot(end.x-start.x,end.y-start.y)/m2LayoutState.scale),mx=(start.x+end.x)/2,my=(start.y+end.y)/2;html += \`<line x1="\${start.x}" y1="\${start.y}" x2="\${end.x}" y2="\${end.y}" class="m2-b2b-auto-guide-preview"/><circle cx="\${end.x}" cy="\${end.y}" r="6" class="m2-b2b-auto-guide-point"/><text x="\${mx}" y="\${my-10}" text-anchor="middle" class="m2-b2b-auto-guide-label" onpointerdown="event.stopPropagation()" onclick="event.stopPropagation();$('m2AutoFillLength')?.focus()" title="Elle mesafe yazmak için tıkla">\${fmt(mm)} mm</text>\`; }`;
  const priorGuide = `if (m2AutoFillDraft?.hover) { const start=m2AutoFillDraft.start,end=m2AutoFillDraft.hover,mm=m2AutoFillDraft.manualLengthMm??Math.round(Math.hypot(end.x-start.x,end.y-start.y)/m2LayoutState.scale),mx=(start.x+end.x)/2,my=(start.y+end.y)/2,obstacleMm=Math.max(0,Math.round(Number(m2AutoFillDraft.obstacleDistanceMm)||0)),obstacleLabel=String(m2AutoFillDraft.obstacleLabel||'DUVARA KALAN'),guideText=m2AutoFillDraft.rafexSystem==='mr'?(m2AutoFillDraft.manualLengthMm!=null&&mm<obstacleMm?\`\${obstacleLabel} · \${fmt(obstacleMm)} mm · SEÇİLEN \${fmt(mm)} mm\`:\`\${obstacleLabel} · \${fmt(obstacleMm)} mm\`):\`\${fmt(mm)} mm\`;html += \`<line x1="\${start.x}" y1="\${start.y}" x2="\${end.x}" y2="\${end.y}" class="m2-b2b-auto-guide-preview"/><circle cx="\${end.x}" cy="\${end.y}" r="6" class="m2-b2b-auto-guide-point"/><text x="\${mx}" y="\${my-10}" text-anchor="middle" class="m2-b2b-auto-guide-label" onpointerdown="event.stopPropagation()" onclick="event.stopPropagation();$('m2AutoFillLength')?.focus()" title="Elle mesafe yazmak için tıkla">\${esc(guideText)}</text>\`; }`;
  const newGuide = `if (m2AutoFillDraft?.hover) { const start=m2AutoFillDraft.start,end=m2AutoFillDraft.hover,mm=m2AutoFillDraft.manualLengthMm??Math.round(Math.hypot(end.x-start.x,end.y-start.y)/m2LayoutState.scale),mx=(start.x+end.x)/2,my=(start.y+end.y)/2,obstacleMm=Math.max(0,Math.round(Number(m2AutoFillDraft.obstacleDistanceMm)||0)),obstacleLabel=String(m2AutoFillDraft.obstacleLabel||'DUVARA KALAN'),guideText=m2AutoFillDraft.rafexSystem==='mr'?(m2AutoFillDraft.manualLengthMm!=null?(mm<obstacleMm?\`SEÇİLEN · \${fmt(mm)} mm · \${obstacleLabel} \${fmt(obstacleMm)} mm\`:\`\${obstacleLabel} · \${fmt(obstacleMm)} mm\`):m2AutoFillDraft.pointerClamped?\`\${obstacleLabel} · \${fmt(obstacleMm)} mm\`:\`İŞARETLENEN MESAFE · \${fmt(mm)} mm\`):\`\${fmt(mm)} mm\`;html += \`<line x1="\${start.x}" y1="\${start.y}" x2="\${end.x}" y2="\${end.y}" class="m2-b2b-auto-guide-preview"/><circle cx="\${end.x}" cy="\${end.y}" r="6" class="m2-b2b-auto-guide-point"/><text x="\${mx}" y="\${my-10}" text-anchor="middle" class="m2-b2b-auto-guide-label" onpointerdown="event.stopPropagation()" onclick="event.stopPropagation();$('m2AutoFillLength')?.focus()" title="Elle mesafe yazmak için tıkla">\${esc(guideText)}</text>\`; }`;
  if (portal.includes(oldGuide)) portal = portal.replace(oldGuide, newGuide);
  else if (portal.includes(priorGuide)) portal = portal.replace(priorGuide, newGuide);
  else if (!portal.includes(newGuide)) throw new Error("MR v40: uzatma cizgisi baglanti noktasi bulunamadi.");

  // MR rapor kesitleri aktif 3D sahneyi bozmadan, kendi GLB motorundan
  // arka planda yakalanir. B2B'nin varsayilan olculeri MR'ye uygulanmaz.
  let mrViewer = fs.readFileSync(mrViewerPath, "utf8");
  if (!mrViewer.includes("__rafexMrDetachedPerspectiveCaptureV38")) {
    const activeAnchor = "\nlet active = null;\n";
    if (!mrViewer.includes(activeAnchor)) throw new Error("MR v38: viewer active baglanti noktasi bulunamadi.");
    const detachedCapture = `
// __rafexMrDetachedPerspectiveCaptureV38
async function captureMRPerspective(config = {}, settings = {}) {
  const width = Math.max(640, Math.round(Number(settings.width) || 1120));
  const height = Math.max(480, Math.round(Number(settings.height) || 900));
  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText = \`position:fixed;left:-100000px;top:0;width:\${width}px;height:\${height}px;overflow:hidden;pointer-events:none;background:#fff\`;
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "display:block;width:100%;height:100%";
  host.appendChild(canvas);
  document.body.appendChild(host);
  let viewer;
  try {
    const ready = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("MR perspektif kesiti zaman asimina ugradi.")), 20000);
      canvas.addEventListener("mr-viewer-ready", () => { clearTimeout(timeout); resolve(); }, { once:true });
      canvas.addEventListener("mr-viewer-error", (event) => { clearTimeout(timeout); reject(new Error(event.detail?.message || "MR perspektif kesiti olusturulamadi.")); }, { once:true });
    });
    viewer = new MRViewer(canvas, { config });
    await ready;
    viewer.renderer.setPixelRatio(Math.max(1, Math.min(2.5, Number(settings.pixelRatio) || 1.5)));
    viewer.onResize();
    viewer.setAutoRotate(false);
    viewer.setView("perspective");
    viewer.controls.update();
    viewer.renderer.render(viewer.scene, viewer.camera);
    await new Promise((resolve) => requestAnimationFrame(resolve));
    viewer.renderer.render(viewer.scene, viewer.camera);
    return canvas.toDataURL("image/webp", Math.max(.5, Math.min(1, Number(settings.quality) || .9)));
  } finally {
    viewer?.destroy();
    host.remove();
  }
}
`;
    mrViewer = mrViewer.replace(activeAnchor, `${detachedCapture}${activeAnchor}`);
    const apiAnchor = `  mount(canvas, options) { if (!(canvas instanceof HTMLCanvasElement)) throw new Error("MR 3D alanı bulunamadı."); active?.destroy(); active = new MRViewer(canvas, options); return active; },`;
    if (!mrViewer.includes(apiAnchor)) throw new Error("MR v38: viewer API baglanti noktasi bulunamadi.");
    mrViewer = mrViewer.replace(apiAnchor, `${apiAnchor}
  capturePerspective(config, settings) { return captureMRPerspective(config, settings); },`);
    fs.writeFileSync(mrViewerPath, mrViewer);
  }

  // Kesit Yer Belirleme MR tipini ayri tutar ve secilen rafin kendi kaydini
  // MR viewer'a yollar. Eski/hatali 3'lu B2B varsayimi burada devre disidir.
  let positioner = fs.readFileSync(sectionPositionerPath, "utf8");
  if (!positioner.includes("__rafexMrSectionOutputV38")) {
    const palletAnchor = `  function palletCountOf(drawing) {
    return clamp(Math.round(number(drawing?.b2bLayout?.palletCount ?? drawing?.b2b?.palletCount ?? drawing?.bays, 3)), 1, 4);
  }
`;
    if (!positioner.includes(palletAnchor)) throw new Error("MR v38: kesit pallet sayisi baglanti noktasi bulunamadi.");
    positioner = positioner.replace(palletAnchor, `${palletAnchor}
  // __rafexMrSectionOutputV38
  function isMrDrawing(drawing) {
    return Boolean(drawing?.b2b?.mr || drawing?.rafexSystem === "mr" || drawing?.systemType === "mr" || drawing?.b2bLayout?.palletType === "mr" || drawing?.plan?.mr);
  }
`);
    positioner = positioner.replace(
      "        const label = safeKey(entry?.name || entry?.typeName || entry?.label || `Raf Tipi ${index + 1}`);\n        if (!groups.has(label)) groups.set(label, { key: label, label, entries: new Map(), cards: [] });",
      "        const label = safeKey(entry?.name || entry?.typeName || entry?.label || `Raf Tipi ${index + 1}`);\n        const system = isMrDrawing(drawing) ? \"mr\" : \"b2b\";\n        if (!groups.has(label)) groups.set(label, { key: label, label, system, entries: new Map(), cards: [] });"
    );
    const captureStart = positioner.indexOf("  async function capturePerspective(key, source = draft, force = false) {");
    const captureEnd = positioner.indexOf("\n  function installStyles", captureStart);
    if (captureStart < 0 || captureEnd < 0) throw new Error("MR v38: kesit yakalama fonksiyonu bulunamadi.");
    const mrCapture = `  async function capturePerspective(key, source = draft, force = false) {
    // __rafexDetachedSectionCaptureV1 + __rafexMrSectionCaptureV38
    const type = rackTypeCache.find((item) => item.key === safeKey(key)) || collectRackTypes().find((item) => item.key === safeKey(key));
    const settings = settingFor(key, source);
    const seed = type?.entries?.values?.().next?.().value;
    const mr = type?.system === "mr" || isMrDrawing(seed?.drawing);
    const options = mr ? window.rafexMrConfigFromRackV37?.(seed?.drawing) : optionsForType(type, settings);
    const capture = mr ? window.RafexMRViewer?.capturePerspective : window.RafexB2BViewer?.capturePerspective;
    if (!options || typeof capture !== "function") return null;
    const signature = JSON.stringify({ system:mr?"mr":"b2b", key:safeKey(key), azimuth:settings.azimuth, elevation:settings.elevation, showPallets:settings.showPallets, dimensions:settings.dimensions, options });
    if (!force && previewCache.get(key)?.signature === signature) return previewCache.get(key).src;
    if (previewPending.has(key)) return previewPending.get(key);
    const task = (async () => {
      // MR'de modules/kat/olculer seed kaydindan birebir gelir; B2B sayaclari uygulanmaz.
      const src = await capture.call(mr ? window.RafexMRViewer : window.RafexB2BViewer, options, { width:1120, height:900, azimuth:settings.azimuth, elevation:settings.elevation, pixelRatio:1.5, quality:.9 });
      if (src) { previewCache.set(key, { signature, src }); trimPreviewCache(); }
      return src || null;
    })().catch((error) => {
      console.error(mr ? "MR kesit perspektifi hazirlanamadi" : "Kesit Yer Belirleme perspektif goruntusu hazirlanamadi", error);
      return null;
    }).finally(() => previewPending.delete(key));
    previewPending.set(key, task);
    return task;
  }
`;
    positioner = positioner.slice(0, captureStart) + mrCapture + positioner.slice(captureEnd);
    for (const required of ["__rafexMrSectionOutputV38", "__rafexMrSectionCaptureV38", "RafexMRViewer?.capturePerspective"]) {
      if (!positioner.includes(required)) throw new Error(`MR v38 kesit kaynak dogrulama hatasi: ${required}`);
    }
    fs.writeFileSync(sectionPositionerPath, positioner);
  }

  fs.writeFileSync(portalPath, portal);
  console.log("MR v43 source: secili rafin fiziksel zincirine bagli, sahipligi dogrulanan mesafeler hazir.");
} else if (mode === "runtime") {
  const workerPath = path.join(root, "dist/server/index.js");
  let worker = fs.readFileSync(workerPath, "utf8");
  const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
  if (!match) throw new Error("MR v35: HTML_BASE64 build ciktisinda bulunamadi.");
  let html = Buffer.from(match[3], "base64").toString("utf8");
  html = html.replace(/<style\s+data-rafex-mr-free-extension="v35">[\s\S]*?<\/style>\s*<script\s+data-rafex-mr-free-extension="v35">[\s\S]*?<\/script>/g, "");

  // PDF/kesit sayfasi MR'yi ucuncu bagimsiz sistem olarak siniflandirir.
  // Boylece MR kartina once B2B SVG'si, sonra B2B 3D yakalamasi basilmaz.
  const oldSystemClassifier = "if(x==='b2b'||x==='mekik2')return x;";
  const newSystemClassifier = "if(x==='b2b'||x==='mekik2'||x==='mr')return x;";
  if (html.includes(oldSystemClassifier)) html = html.replace(oldSystemClassifier, newSystemClassifier);
  else if (!html.includes(newSystemClassifier)) throw new Error("MR v38: PDF sistem siniflandiricisi bulunamadi.");

  const oldCardRouter = "  function buildCard(group,index){return group.system==='b2b'?buildB2BCard(group,index):buildMekikCard(group,index)}";
  const newCardRouter = `  function buildMRCard(group,index){
    var count=Math.max(1,Number(group&&group.rackCount)||1),title=String(group&&group.name||('MR Tip '+(index+1)));
    return '<article class="rafex-v19-type-card rafex-v38-mr-type-card" data-rafex-system="mr" data-rafex-type-name="'+htmlEsc(title)+'" style="--m2-type-color:#1d5f8a"><div class="rafex-v19-card-head"><span>'+htmlEsc(title)+'</span><small>MR SİSTEM</small><small>'+fmtN(count)+' ADET</small></div><div class="rafex-v19-view"><div class="rafex-v19-view-title">MR 3D GÖRÜNÜŞ · KAYITLI ÖLÇÜLER</div><div class="rafex-v19-visual"><div class="rafex-mr-output-wait">MR görünüşü hazırlanıyor…</div></div></div></article>';
  }
  function buildCard(group,index){return group.system==='mr'?buildMRCard(group,index):group.system==='b2b'?buildB2BCard(group,index):buildMekikCard(group,index)}`;
  if (html.includes(oldCardRouter)) html = html.replace(oldCardRouter, newCardRouter);
  else if (!html.includes("function buildMRCard(group,index)")) throw new Error("MR v38: PDF kart yonlendiricisi bulunamadi.");

  const oldSectionCardQuery = "'.m2-corporate-type-card,.rafex-v19-type-card[data-rafex-system=\"b2b\"]'";
  const newSectionCardQuery = "'.m2-corporate-type-card,.rafex-v19-type-card[data-rafex-system=\"b2b\"],.rafex-v19-type-card[data-rafex-system=\"mr\"]'";
  if (html.includes(oldSectionCardQuery)) html = html.replace(oldSectionCardQuery, newSectionCardQuery);
  else if (!html.includes(newSectionCardQuery)) throw new Error("MR v38: kesit kart sorgusu bulunamadi.");
  const oldSectionCardFilter = '        if ((card.dataset.rafexSystem && card.dataset.rafexSystem !== "b2b") || card.querySelector(".m2-set-projection")) return;';
  const newSectionCardFilter = '        if ((card.dataset.rafexSystem && card.dataset.rafexSystem !== "b2b" && card.dataset.rafexSystem !== "mr") || card.querySelector(".m2-set-projection")) return;';
  if (html.includes(oldSectionCardFilter)) html = html.replace(oldSectionCardFilter, newSectionCardFilter);
  else if (!html.includes(newSectionCardFilter)) throw new Error("MR v38: kesit kart sistem filtresi bulunamadi.");
  const oldSectionCardGroup = "        if (!groups.has(label)) groups.set(label, { key: label, label, entries: new Map(), cards: [] });\n        if (!groups.get(label).cards.includes(card)) groups.get(label).cards.push(card);";
  const newSectionCardGroup = "        const system = card.dataset.rafexSystem === \"mr\" ? \"mr\" : \"b2b\";\n        if (!groups.has(label)) groups.set(label, { key: label, label, system, entries: new Map(), cards: [] });\n        if (!groups.get(label).system) groups.get(label).system = system;\n        if (!groups.get(label).cards.includes(card)) groups.get(label).cards.push(card);";
  if (html.includes(oldSectionCardGroup)) html = html.replace(oldSectionCardGroup, newSectionCardGroup);
  else if (!html.includes(newSectionCardGroup)) throw new Error("MR v38: kesit kart grup baglantisi bulunamadi.");

  const runtime = String.raw`<style ${marker}>
.mr-mode #m2AutoFillControls{display:block!important}
#m2AutoFillControls.rafex-extension-disclosure-v42{display:block!important;visibility:visible!important;opacity:1!important;padding:0!important;overflow:hidden}
.rafex-extension-toggle{display:flex!important;align-items:center;justify-content:space-between;width:100%;min-height:44px;padding:10px 12px!important;border:0!important;border-radius:9px!important;background:#edf8f3!important;color:#164d39!important;cursor:pointer!important;opacity:1!important;font-size:10px;font-weight:950;text-align:left}
.rafex-extension-toggle:after{content:'+';font-size:18px;line-height:1}.rafex-extension-disclosure-v42.is-open>.rafex-extension-toggle:after{content:'−'}
.rafex-extension-body{display:none;align-items:center;gap:8px;padding:10px 12px;border-top:1px solid #cfe4da}.rafex-extension-disclosure-v42.is-open>.rafex-extension-body{display:flex}
.rafex-extension-disclosure-v42.is-disabled>.rafex-extension-toggle{background:#f3f5f4!important;color:#526158!important;cursor:pointer!important}
@media(max-width:700px){.rafex-extension-body{flex-wrap:wrap}.rafex-extension-body input{flex:1;min-width:120px}}
#rafexMrExtensionModal[hidden]{display:none!important}
#rafexMrExtensionModal{position:fixed;inset:0;z-index:10080;display:grid;place-items:center;padding:20px;background:#10251dcc;backdrop-filter:blur(3px)}
.rafex-mr-extension-card{width:min(520px,calc(100vw - 32px));padding:20px;border:2px solid #e0b900;border-radius:16px;background:#fff;box-shadow:0 24px 70px #0005;color:#173c2d}
.rafex-mr-extension-card h3{margin:0;font-size:18px}.rafex-mr-extension-card>p{margin:7px 0 14px;color:#5d6962;font-size:11px;line-height:1.5}
.rafex-mr-extension-summary{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:13px}.rafex-mr-extension-summary div{padding:10px;border-radius:9px;background:#f4f7f4}.rafex-mr-extension-summary span{display:block;color:#718078;font-size:8px;font-weight:850}.rafex-mr-extension-summary b{display:block;margin-top:4px;font-size:13px}
.rafex-mr-extension-field{display:grid;gap:7px;padding:12px;border:1px solid #e5d171;border-radius:10px;background:#fffbea;font-size:10px;font-weight:900}.rafex-mr-extension-input{display:grid;grid-template-columns:42px minmax(0,1fr) 42px;gap:7px}.rafex-mr-extension-input button,.rafex-mr-extension-input input{min-height:42px;border:1px solid #d5ddd8;border-radius:8px;background:#fff;color:#173c2d;font-weight:900}.rafex-mr-extension-input input{text-align:center;font-size:16px}.rafex-mr-extension-field small{color:#66726b;font-size:8px;line-height:1.45}
.rafex-mr-extension-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:15px}.rafex-mr-extension-actions button{padding:10px 14px;border:1px solid #ccd7d0;border-radius:8px;background:#fff;color:#173c2d;font-weight:900}.rafex-mr-extension-actions .primary{border-color:#d8b100;background:#f2c500}
.rafex-mr-extension-error{min-height:16px;margin-top:8px;color:#a23c32;font-size:9px;font-weight:850}
#m2CustomizeModal.rafex-mr-customize-v37 .m2-customize-preview{background:#fff}
#m2CustomizeModal.rafex-mr-customize-v37 .m2-customize-preview>span{background:#052848}
#m2CustomizeModal.rafex-mr-customize-v37 aside>:not(.m2-customize-head):not(.rafex-mr-customize-summary):not(.m2-customize-actions){display:none!important}
.rafex-mr-customize-summary{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px;border:1px solid #d9e5df;border-radius:10px;background:#f7faf8}
.rafex-mr-customize-summary div{padding:9px;border-radius:8px;background:#fff}.rafex-mr-customize-summary small{display:block;color:#6d7a73;font-size:8px;font-weight:850}.rafex-mr-customize-summary b{display:block;margin-top:4px;color:#173c2d;font-size:12px}
.rafex-v38-mr-type-card.rafex-perspective-output .rafex-v19-view{width:100%!important;height:100%!important}.rafex-v38-mr-type-card .rafex-report-3d-frame{width:100%;height:100%;overflow:hidden}.rafex-v38-mr-type-card .rafex-report-3d-frame img{display:block;width:100%;height:100%;object-fit:contain}.rafex-mr-output-wait{display:grid;place-items:center;width:100%;height:100%;color:#65736b;font-size:10px;font-weight:850}
@media(max-width:560px){.rafex-mr-extension-summary{grid-template-columns:1fr}.rafex-mr-extension-card{padding:15px}}
</style>
<script ${marker}>(function(){
  if(window.__rafexMrFreeExtensionV35)return;window.__rafexMrFreeExtensionV35=true;window.__rafexMrPointerDoubleTapV36=true;
  var originalStart=window.m2StartAutoFillGuide;
  var originalPreview=window.m2PreviewAutoFillLength;
  var originalApply=window.m2ApplyAutoFillLength;
  var originalCancel=window.m2CancelAutoFill;
  var originalCommit=window.m2CommitAutoFillGuide;
  var originalCustomizeOpen=window.m2OpenCustomizeModal;
  var originalCustomizeClose=window.m2CloseCustomizeModal;
  var originalCustomizePreview=window.m2PreviewRackCustomization;
  var originalCustomizeApply=window.m2ApplyRackCustomization;
  var originalSelectSaved=window.m2SelectSavedRackType;
  var pendingCustom=null;
  var lastMrPointerTap={id:null,at:0};
  var suppressMrDblClickUntil=0;

  function isMr(rack){return !!(rack?.b2b?.mr||rack?.rafexSystem==='mr'||rack?.systemType==='mr'||rack?.b2bLayout?.palletType==='mr'||rack?.plan?.mr);}
  function rackById(id){try{return m2LayoutState.racks.find(function(r){return Number(r.id)===Number(id);})||null;}catch{return null;}}
  function formatMm(value){try{return Math.round(Number(value)||0).toLocaleString('tr-TR')+' mm';}catch{return String(Math.round(Number(value)||0))+' mm';}}
  function configFromRack(rack){
    var state=rack?.b2b||{},layout=rack?.b2bLayout||{},levels=Math.max(1,Math.round(Number(state.levels)||Number(rack?.levels)||1)),width=Math.max(300,Number(state.width)||Number(layout.palletWidth)||Number(rack?.palW)||2400),depth=Math.max(300,Number(state.depth)||Number(layout.palletDepth)||Number(rack?.depthMm)||800),firstTraverse=Math.max(0,Number(state.firstTraverse??rack?.firstRailHeight??200)),levelGap=Math.max(100,Number(state.requestedLevelGap)||Number(state.levelGap)||Number(rack?.levelH)||1000),traverseType=String(state.traverseType||'ZS65'),traverseHeight=Math.max(1,Number(state.traverseHeight)||Number(rack?.traverseHeight)||({ZS35:55,ZS55:75,ZS65:85}[traverseType]||85)),topTraverse=firstTraverse+Math.max(0,levels-1)*(levelGap+traverseHeight),automaticUprightHeight=topTraverse+traverseHeight+levelGap/2,uprightHeight=Math.max(topTraverse+traverseHeight,Number(state.uprightHeight)||Number(rack?.sideUprightHeight)||automaticUprightHeight);
    var dimensions=state.dimensions||{};
    return{modules:Math.max(1,Math.round(Number(state.modules)||Number(rack?.bays)||1)),levels:levels,width:width,depth:depth,firstTraverse:firstTraverse,levelGap:levelGap,requestedLevelGap:levelGap,height:topTraverse,uprightHeight:uprightHeight,uprightType:state.uprightType||'MR60',uprightThickness:Number(state.uprightThickness)||1.5,uprightWidth:60,traverseType:traverseType,traverseThickness:Number(state.traverseThickness)||1.5,traverseHeight:traverseHeight,uprightFinish:state.uprightFinish||'ral5010',traverseFinish:state.traverseFinish||'ral1007',accessories:Array.isArray(state.accessories)?JSON.parse(JSON.stringify(state.accessories)):[],dimensions:{levels:dimensions.levels!==false,markers:dimensions.markers!==false,width:dimensions.width!==false,depth:dimensions.depth!==false},dimensionScale:Math.max(.7,Math.min(1.5,Number(state.dimensionScale)||1))};
  }
  window.rafexMrConfigFromRackV37=configFromRack;
  function footOf(rack){return Math.max(1,Math.round(Number(rack?.b2b?.uprightWidth)||60));}
  function sectionOf(rack){return Math.max(500,Math.round(Number(rack?.b2b?.width)||Number(rack?.palW)||500));}
  function setStatus(text){var node=document.getElementById('m2FloorStatus');if(node)node.textContent=text;}
  function installExtensionDisclosure(){
    var host=document.getElementById('m2AutoFillControls');if(!host)return null;
    if(!host.classList.contains('rafex-extension-disclosure-v42')){
      var oldTitle=host.querySelector(':scope>b'),body=document.createElement('div'),toggle=document.createElement('button');
      if(oldTitle)oldTitle.remove();body.className='rafex-extension-body';while(host.firstChild)body.appendChild(host.firstChild);
      toggle.type='button';toggle.className='rafex-extension-toggle';toggle.textContent='UZATMA MESAFESİ';toggle.setAttribute('aria-expanded','false');
      toggle.addEventListener('click',function(event){event.preventDefault();var open=host.classList.toggle('is-open');toggle.setAttribute('aria-expanded',String(open));});
      host.appendChild(toggle);host.appendChild(body);host.classList.add('rafex-extension-disclosure-v42');host.hidden=false;
      var restore=function(){host.hidden=false;if(host.style.getPropertyValue('display')!=='block')host.style.setProperty('display','block','important');toggle.disabled=false;toggle.removeAttribute('aria-disabled');};
      restore();new MutationObserver(restore).observe(host,{attributes:true,subtree:true,attributeFilter:['style','hidden','disabled','aria-disabled']});
    }
    host.style.setProperty('display','block','important');var header=host.querySelector('.rafex-extension-toggle');if(header){header.disabled=false;header.removeAttribute('aria-disabled');}return host;
  }
  function controls(active){
    var host=installExtensionDisclosure(),input=document.getElementById('m2AutoFillLength');if(!host)return;
    host.hidden=false;host.style.setProperty('display','block','important');host.classList.toggle('is-disabled',!active);host.querySelectorAll('input,button:not(.rafex-extension-toggle)').forEach(function(el){el.disabled=!active;});
    if(input){input.placeholder=active?'Örn. 7000':'Önce MR rafı çift tıkla';if(!active)input.value='';}
  }
  function mrFinish(value){try{return mrFinishLabelV4(value);}catch(e){return String(value||'');}}
  function mrNumber(value){try{return fmt(Math.round(Number(value)||0));}catch(e){return Math.round(Number(value)||0).toLocaleString('tr-TR');}}
  function mrTrayPieces(width,trayWidth){try{return mrTrayPlanV5(width,trayWidth).pieces||[];}catch(e){var size=[200,250,300].includes(Number(trayWidth))?Number(trayWidth):300,full=Math.floor(width/size),remainder=width-full*size,pieces=Array(full).fill(size);if(remainder>=50)pieces.push(remainder);return pieces;}}
  function mrQuantitySummary(racks){
    var uprights=new Map(),traverses=new Map(),trays=new Map();
    (racks||[]).filter(isMr).forEach(function(rack){
      var settings=rack.b2b||{},modules=Math.max(1,Math.round(Number(settings.modules)||Number(rack.bays)||1)),levels=Math.max(1,Math.round(Number(settings.levels)||Number(rack.levels)||1)),width=Math.max(300,Math.round(Number(settings.width)||Number(rack.palW)||2400)),depth=Math.max(300,Math.round(Number(settings.depth)||Number(rack.depthMm)||Number(rack.railLength)||800)),uprightKey=(settings.uprightType||'MR60')+' · '+String(Number(settings.uprightThickness)||1.5).replace('.',',')+' mm · 60 mm · '+mrFinish(settings.uprightFinish||'ral5010')+' · H '+mrNumber(Number(rack.sideUprightHeight)||Number(settings.uprightHeight)||0)+' × D '+mrNumber(depth)+' mm',traverseKey=(settings.traverseType||'ZS65')+' · '+String(Number(settings.traverseThickness)||1.5).replace('.',',')+' mm · H '+mrNumber(Number(settings.traverseHeight)||85)+' mm · '+mrFinish(settings.traverseFinish||'ral1007')+' · L '+mrNumber(width)+' mm';
      // Her bagimsiz blokta N modul = N+1 ayak. Bagli moduller ise yalniz
      // ekledikleri N yeni ayagi getirir; ortak ayak ikinci kez sayilmaz.
      var uprightQty=modules+(rack.sharedFootWith?0:1);uprights.set(uprightKey,(uprights.get(uprightKey)||0)+uprightQty);traverses.set(traverseKey,(traverses.get(traverseKey)||0)+modules*levels*2);
      (settings.accessories||[]).filter(function(item){return item&&item.type==='tray';}).forEach(function(item){var selectedLevels=new Set((item.levels||[]).map(Number).filter(function(level){return level>=1&&level<=levels;}));if(!selectedLevels.size)return;mrTrayPieces(width,item.width).forEach(function(piece){var key=mrNumber(piece)+' × '+mrNumber(depth)+' mm';trays.set(key,(trays.get(key)||0)+modules*selectedLevels.size);});});
    });
    var rows=[];uprights.forEach(function(qty,spec){rows.push({item:'MR Ayak Toplama',spec:spec,qty:qty});});traverses.forEach(function(qty,spec){rows.push({item:'ZS Travers',spec:spec,qty:qty});});trays.forEach(function(qty,spec){rows.push({item:'Tava',spec:spec,qty:qty});});return rows;
  }
  window.rafexMrQuantitySummaryV42=mrQuantitySummary;
  var originalLayoutProductsV42=window.m2LayoutProductRows,originalCorporateBomV42=window.m2CorporateBomRows;
  var exactLayoutProductsV42=function(){
    if(typeof m2ActiveModule==='undefined'||m2ActiveModule!=='mr')return originalLayoutProductsV42?.apply(this,arguments)||[];
    var exact=mrQuantitySummary(m2LayoutState.racks).map(function(row){return{name:row.item+' · '+row.spec,qty:row.qty};}),other=(originalLayoutProductsV42?.apply(this,arguments)||[]).filter(function(row){var name=String(row?.name||'');return !name.startsWith('MR Ayak Toplama')&&!name.startsWith('ZS Travers')&&!name.startsWith('Tava');});return exact.concat(other);
  };
  var exactCorporateBomV42=function(entry,labels){
    var drawing=entry?.drawing||entry;if(!isMr(drawing))return originalCorporateBomV42?.apply(this,arguments)||[];
    var ids=new Set((entry?.rackIds||[]).map(Number)),live=[];try{live=m2LayoutState.racks.filter(function(rack){return ids.has(Number(rack.id))&&isMr(rack);});}catch(e){}
    if(!live.length){var count=Math.max(1,Math.round(Number(entry?.rackCount)||1));for(var i=0;i<count;i++)live.push(drawing);}
    var unit=labels?.unitEach||'adet';return mrQuantitySummary(live).map(function(row){return{item:row.item,spec:row.spec,qty:row.qty,unit:unit};});
  };
  exactLayoutProductsV42.__rafexMrExactQuantitiesV42=true;exactCorporateBomV42.__rafexMrExactQuantitiesV42=true;
  try{m2LayoutProductRows=exactLayoutProductsV42;m2CorporateBomRows=exactCorporateBomV42;}catch(e){}window.m2LayoutProductRows=exactLayoutProductsV42;window.m2CorporateBomRows=exactCorporateBomV42;
  function startMr(rack){
    if(m2AutoFillDraft?.rafexSystem==='mr'&&Number(m2AutoFillDraft.rackId)===Number(rack.id)){controls(true);return;}
    var origin={x:rack.x+rack.w/2,y:rack.y+rack.h/2};m2AutoFillDraft={rackId:rack.id,origin:origin,start:origin,hover:origin,direction:1,rafexSystem:'mr'};m2LayoutState.selected=rack.id;controls(true);
    // Pointermove, odaktaki ve dolu inputu "manuel yazim" kabul edip duruyor.
    // Baslangicta inputu odaklamayarak cizgiyi kesintisiz birak; kullanici
    // isterse inputa tiklayip ayni mesafeyi elle girmeye devam edebilir.
    var input=document.getElementById('m2AutoFillLength');if(input){input.value='';if(document.activeElement===input)input.blur();}
    setStatus('MR uzatma yönü açıldı. Fareyi uzatılacak tarafa götür; çizgi en yakın duvar veya engelde durur. İstersen daha kısa bir mesafeyi elle yaz.');m2RenderLayout();
  }
  function mountMrCustomize(rack){
    var canvas=document.getElementById('m2CustomizeCanvas');if(!canvas||!window.RafexMRViewer?.mount)return;
    try{window.RafexB2BViewer?.destroy?.();}catch(e){}
    try{var instance=window.RafexMRViewer.mount(canvas,{config:configFromRack(rack)});try{mrViewerInstance=instance;}catch(e){}}catch(error){setStatus(error?.message||'MR 3D önizlemesi açılamadı.');}
  }
  function openMrCustomize(rack){
    var modal=document.getElementById('m2CustomizeModal');if(!modal)return;
    try{m2CustomizeRackId=rack.id;m2CustomizeMode=false;}catch(e){}m2LayoutState.selected=rack.id;document.getElementById('m2CustomizeRackButton')?.classList.remove('active');modal.classList.add('rafex-mr-customize-v37');modal.hidden=false;
    var head=modal.querySelector('.m2-customize-head'),title=head?.querySelector('b'),copy=head?.querySelector('small'),close=head?.querySelector('button'),badge=modal.querySelector('.m2-customize-preview>span');if(title)title.textContent='MR Modül Önizlemesi';if(copy)copy.textContent='Ölçüler oluşturduğun MR raf tipinden birebir alınır; B2B değerleri uygulanmaz.';if(close)close.setAttribute('onclick','window.rafexCloseMrCustomizeV37()');if(badge)badge.textContent='MR 3D RAF ÖNİZLEMESİ';
    var config=configFromRack(rack),summary=modal.querySelector('.rafex-mr-customize-summary');if(!summary){summary=document.createElement('div');summary.className='rafex-mr-customize-summary';head?.after(summary);}summary.innerHTML='<div><small>TOPLAM GENİŞLİK</small><b>'+formatMm(config.modules*config.width+(config.modules+1)*60)+'</b></div><div><small>DERİNLİK</small><b>'+formatMm(config.depth)+'</b></div><div><small>ZEMİN → K1</small><b>'+formatMm(config.firstTraverse)+'</b></div><div><small>KAT ARASI NET</small><b>'+formatMm(config.levelGap)+'</b></div><div><small>AYAK BOYU</small><b>'+formatMm(config.uprightHeight)+'</b></div><div><small>SİSTEM</small><b>MR60 · '+config.traverseType+'</b></div>';
    var actions=modal.querySelector('.m2-customize-actions'),buttons=actions?.querySelectorAll('button');if(buttons?.[0]){buttons[0].textContent='Kapat';buttons[0].setAttribute('onclick','window.rafexCloseMrCustomizeV37()');}if(buttons?.[1]){buttons[1].textContent='MR Ölçülerine Git';buttons[1].setAttribute('onclick','window.rafexLoadMrRackV37()');}
    requestAnimationFrame(function(){mountMrCustomize(rack);});
  }
  function closeMrCustomize(){
    var modal=document.getElementById('m2CustomizeModal');if(modal){modal.hidden=true;modal.classList.remove('rafex-mr-customize-v37');}
    try{window.RafexMRViewer?.destroy?.();mrViewerInstance=null;m2CustomizeRackId=null;}catch(e){}
    requestAnimationFrame(function(){try{if(m2ActiveModule==='mr'&&document.getElementById('mrCanvas'))mrMountViewer();}catch(e){}});
  }
  window.rafexCloseMrCustomizeV37=closeMrCustomize;
  window.rafexLoadMrRackV37=function(){var rack=rackById(typeof m2CustomizeRackId==='undefined'?null:m2CustomizeRackId);if(!isMr(rack))return closeMrCustomize();try{var drawing=JSON.parse(JSON.stringify(rack));m2LastDrawing=drawing;mrApplyDrawingToFormV4(drawing);mrUpdateSummary(false);mrSyncLayoutDrawingV4(false);}catch(e){}closeMrCustomize();setTimeout(function(){document.querySelector('.mr-form')?.scrollIntoView?.({behavior:'smooth',block:'start'});},60);};
  function axisOf(rack,direction){var radians=(Number(rack?.angle)||0)*Math.PI/180,sign=direction>=0?1:-1,ux=Math.cos(radians),uy=Math.sin(radians);return{ux:ux,uy:uy,dx:sign*ux,dy:sign*uy,vx:-uy,vy:ux,direction:sign};}
  function rackCorners(rack){var cx=rack.x+rack.w/2,cy=rack.y+rack.h/2,radians=(Number(rack.angle)||0)*Math.PI/180,cos=Math.cos(radians),sin=Math.sin(radians);return[[-rack.w/2,-rack.h/2],[rack.w/2,-rack.h/2],[rack.w/2,rack.h/2],[-rack.w/2,rack.h/2]].map(function(pair){return{x:cx+pair[0]*cos-pair[1]*sin,y:cy+pair[0]*sin+pair[1]*cos};});}
  function symbolCorners(symbol){var cx=symbol.x+symbol.w/2,cy=symbol.y+symbol.h/2,radians=(Number(symbol.angle)||0)*Math.PI/180,cos=Math.cos(radians),sin=Math.sin(radians);return[[-symbol.w/2,-symbol.h/2],[symbol.w/2,-symbol.h/2],[symbol.w/2,symbol.h/2],[-symbol.w/2,symbol.h/2]].map(function(pair){return{x:cx+pair[0]*cos-pair[1]*sin,y:cy+pair[0]*sin+pair[1]*cos};});}
  function raySegmentDistance(origin,dir,a,b){var sx=b.x-a.x,sy=b.y-a.y,den=dir.dx*sy-dir.dy*sx;if(Math.abs(den)<1e-8)return Infinity;var ax=a.x-origin.x,ay=a.y-origin.y,t=(ax*sy-ay*sx)/den,s=(ax*dir.dy-ay*dir.dx)/den;return t>=-1e-6&&s>=-1e-6&&s<=1+1e-6?Math.max(0,t):Infinity;}
  function extensionAnchor(source,direction){var axis=axisOf(source,direction),group=source.joinGroup;if(!group)return source;var sourceCx=source.x+source.w/2,sourceCy=source.y+source.h/2,candidates=m2LayoutState.racks.filter(function(rack){if(rack.joinGroup!==group)return false;var cx=rack.x+rack.w/2,cy=rack.y+rack.h/2,cross=Math.abs((cx-sourceCx)*axis.vx+(cy-sourceCy)*axis.vy);return cross<=Math.max(source.h,rack.h)*.6;});return candidates.sort(function(a,b){var ac=(a.x+a.w/2)*axis.dx+(a.y+a.h/2)*axis.dy,bc=(b.x+b.w/2)*axis.dx+(b.y+b.h/2)*axis.dy;return bc-ac;})[0]||source;}
  function obstacleClearance(source,direction){
    var axis=axisOf(source,direction),anchor=extensionAnchor(source,axis.direction),cx=anchor.x+anchor.w/2,cy=anchor.y+anchor.h/2,start={x:cx+axis.dx*anchor.w/2,y:cy+axis.dy*anchor.w/2},halfDepth=Math.max(1,anchor.h/2),best={distancePx:Infinity,label:'DUVARA KALAN',type:'wall'};
    function consider(distancePx,label,type){if(Number.isFinite(distancePx)&&distancePx>=-1e-6&&distancePx<best.distancePx-.01)best={distancePx:Math.max(0,distancePx),label:label,type:type};}
    var points=Array.isArray(m2LayoutState.points)?m2LayoutState.points:[],breaks=m2LayoutState.pathBreaks||[],edgeCount=m2LayoutState.closed?points.length:Math.max(0,points.length-1),rayOrigins=[0,-halfDepth*.98,halfDepth*.98].map(function(offset){return{x:start.x+axis.vx*offset,y:start.y+axis.vy*offset};});
    for(var i=0;i<edgeCount;i++){if(!m2LayoutState.closed&&breaks.includes(i))continue;var a=points[i],b=points[(i+1)%points.length];if(!a||!b)continue;rayOrigins.forEach(function(origin){consider(raySegmentDistance(origin,axis,a,b),'DUVARA KALAN','wall');});}
    var excluded=new Set(m2LayoutState.racks.filter(function(rack){return rack.id===source.id||source.joinGroup&&rack.joinGroup===source.joinGroup;}).map(function(rack){return Number(rack.id);}));
    m2LayoutState.racks.forEach(function(rack){if(excluded.has(Number(rack.id)))return;var projected=rackCorners(rack).map(function(point){var rx=point.x-start.x,ry=point.y-start.y;return{q:rx*axis.dx+ry*axis.dy,s:rx*axis.vx+ry*axis.vy};}),minS=Math.min.apply(null,projected.map(function(p){return p.s;})),maxS=Math.max.apply(null,projected.map(function(p){return p.s;})),minQ=Math.min.apply(null,projected.map(function(p){return p.q;})),maxQ=Math.max.apply(null,projected.map(function(p){return p.q;}));if(maxS>=-halfDepth&&minS<=halfDepth&&maxQ>=0)consider(Math.max(0,minQ),'RAFA KALAN','rack');});
    try{(Array.isArray(m2LayoutSymbols)?m2LayoutSymbols:[]).filter(function(symbol){return symbol&&symbol.blocking===true;}).forEach(function(symbol){var projected=symbolCorners(symbol).map(function(point){var rx=point.x-start.x,ry=point.y-start.y;return{q:rx*axis.dx+ry*axis.dy,s:rx*axis.vx+ry*axis.vy};}),minS=Math.min.apply(null,projected.map(function(p){return p.s;})),maxS=Math.max.apply(null,projected.map(function(p){return p.s;})),minQ=Math.min.apply(null,projected.map(function(p){return p.q;})),maxQ=Math.max.apply(null,projected.map(function(p){return p.q;}));if(maxS>=-halfDepth&&minS<=halfDepth&&maxQ>=0)consider(Math.max(0,minQ),symbol.type==='column'?'KOLONA KALAN':'ENGELE KALAN',symbol.type==='column'?'column':'barrier');});}catch(e){}
    if(!Number.isFinite(best.distancePx)){var canvasDistances=[];if(axis.dx>1e-8)canvasDistances.push((1000-start.x)/axis.dx);else if(axis.dx<-1e-8)canvasDistances.push((0-start.x)/axis.dx);if(axis.dy>1e-8)canvasDistances.push((650-start.y)/axis.dy);else if(axis.dy<-1e-8)canvasDistances.push((0-start.y)/axis.dy);consider(Math.min.apply(null,canvasDistances.filter(function(value){return value>=0;})),'ÇİZİM SINIRINA KALAN','boundary');}
    var scale=Math.max(.0001,Number(m2LayoutState.scale)||.04),distanceMm=Math.max(0,Math.floor(best.distancePx/scale+1e-6)),distancePx=distanceMm*scale,end={x:start.x+axis.dx*distancePx,y:start.y+axis.dy*distancePx};return{source:source,anchor:anchor,direction:axis.direction,ux:axis.ux,uy:axis.uy,dx:axis.dx,dy:axis.dy,start:start,end:end,distanceMm:distanceMm,label:best.label,type:best.type};
  }
  window.rafexMrObstacleClearanceV40=obstacleClearance;
  function projectMrObstacle(point){var draft=m2AutoFillDraft,source=draft&&rackById(draft.rackId);if(!draft||draft.rafexSystem!=='mr'||!source)return point;var base=axisOf(source,1),cx=source.x+source.w/2,cy=source.y+source.h/2,direction=((point.x-cx)*base.ux+(point.y-cy)*base.uy)>=0?1:-1,info=obstacleClearance(source,direction),scale=Math.max(.0001,Number(m2LayoutState.scale)||.04),requested=Math.max(0,Math.round(((point.x-info.start.x)*info.dx+(point.y-info.start.y)*info.dy)/scale)),selected=Math.min(requested,info.distanceMm),clamped=requested>info.distanceMm,end={x:info.start.x+info.dx*selected*scale,y:info.start.y+info.dy*selected*scale};draft.direction=direction;draft.anchorId=info.anchor.id;draft.start=info.start;draft.hover=end;draft.manualLengthMm=null;draft.selectedLengthMm=selected;draft.pointerRequestedMm=requested;draft.pointerClamped=clamped;draft.obstacleDistanceMm=info.distanceMm;draft.obstacleLabel=info.label;draft.obstacleType=info.type;setStatus(clamped?info.label+' '+formatMm(info.distanceMm)+'; işaretlediğin nokta engelin arkasında kaldığı için çizgi burada durduruldu.':'İşaretlenen uzatma '+formatMm(selected)+'. En yakın sınır: '+info.label.toLocaleLowerCase('tr-TR')+' '+formatMm(info.distanceMm)+'.');return end;}
  window.rafexProjectMrObstacleV40=projectMrObstacle;
  function previewMr(raw){
    var draft=m2AutoFillDraft,source=draft&&rackById(draft.rackId),requested=Math.max(0,Math.round(Number(raw)||0));if(!draft||draft.rafexSystem!=='mr'||!source)return false;
    var info=obstacleClearance(source,draft.direction||1),selected=Math.min(requested,info.distanceMm),input=document.getElementById('m2AutoFillLength');draft.anchorId=info.anchor.id;draft.start=info.start;draft.hover={x:info.start.x+info.dx*selected*m2LayoutState.scale,y:info.start.y+info.dy*selected*m2LayoutState.scale};draft.manualLengthMm=selected;draft.selectedLengthMm=selected;draft.pointerRequestedMm=requested;draft.pointerClamped=requested>info.distanceMm;draft.obstacleDistanceMm=info.distanceMm;draft.obstacleLabel=info.label;draft.obstacleType=info.type;if(input&&requested>info.distanceMm)input.value=String(selected);setStatus(requested>info.distanceMm?'Girilen ölçü '+info.label.toLocaleLowerCase('tr-TR')+' '+formatMm(info.distanceMm)+' olduğu için bu sınırda durduruldu.':info.label+' '+formatMm(info.distanceMm)+' · seçilen uzatma '+formatMm(selected)+'.');m2RenderLayout();return true;
  }
  function plan(target,section,foot){
    target=Math.max(0,Math.round(Number(target)||0));section=Math.max(500,Math.round(Number(section)||0));foot=Math.max(1,Math.round(Number(foot)||60));var occupied=0,count=0;
    while(count<100){var increment=section+foot;if(occupied+increment>target+.01)break;occupied+=increment;count++;}
    var wallRemaining=Math.max(0,target-occupied),netRemaining=Math.max(0,wallRemaining-foot),customMax=Math.floor(netRemaining/50)*50;
    return{count:count,occupied:occupied,wallRemaining:wallRemaining,netRemaining:netRemaining,customMax:customMax,needsCustom:netRemaining>500&&customMax>=500};
  }
  window.rafexMrExtensionPlan=plan;
  function copyRack(source,width,centerX,centerY){
    var foot=footOf(source),physical=width+2*foot,copy=JSON.parse(JSON.stringify(source));
    copy.id=Date.now()+Math.floor(Math.random()*100000);copy.x=centerX-physical*m2LayoutState.scale/2;copy.y=centerY-copy.h/2;copy.w=physical*m2LayoutState.scale;copy.widthMm=physical;copy.bays=1;copy.palW=width;copy.joinGroup=null;copy.sharedFootWith=null;copy.sharedFootSide=null;copy.freePlacement=false;copy.staged=false;copy.locked=true;copy.specLocked=true;copy.rafexSystem='mr';copy.rafexSystemLabel='MR';
    copy.b2b={...(copy.b2b||{}),mr:true,modules:1,width:width,uprightWidth:foot};
    copy.b2bLayout={...(copy.b2bLayout||{}),palletCount:1,palletWidth:width,palletType:'mr',sectionWidth:width,rowCount:1};
    return copy;
  }
  function placeAfter(anchor,source,width,direction,ux,uy,typeName){
    var foot=footOf(source),anchorPhysical=Math.max(1,Number(anchor.widthMm)||anchor.w/m2LayoutState.scale),probePhysical=width+2*foot,step=(anchorPhysical+probePhysical)/2-foot,anchorCx=anchor.x+anchor.w/2,anchorCy=anchor.y+anchor.h/2,probe=copyRack(source,width,anchorCx+direction*ux*step*m2LayoutState.scale,anchorCy+direction*uy*step*m2LayoutState.scale);
    probe.angle=source.angle;if(typeName){probe.typeName=typeName;probe.typeColor=m2TypeColor(typeName);}
    if(!m2RackInsideArea(probe)||m2RackOverlapsExcept(probe,probe.x,probe.y,probe.angle,[anchor.id]))return null;
    var group=anchor.joinGroup||source.joinGroup||('mr-auto-'+source.id);anchor.joinGroup=group;probe.joinGroup=group;probe.sharedFootWith=anchor.id;probe.sharedFootSide=direction>0?'left':'right';m2LayoutState.racks.push(probe);return probe;
  }
  function drawingFor(source,width){
    var foot=footOf(source),drawing=JSON.parse(JSON.stringify(source)),physical=width+2*foot;
    ['id','x','y','w','h','angle','joinGroup','sharedFootWith','sharedFootSide','freePlacement','staged','locked','rafexSystem','rafexSystemLabel'].forEach(function(key){delete drawing[key];});
    drawing.totalWidth=physical;drawing.widthMm=physical;drawing.railLength=Number(source.depthMm)||Number(source.railLength)||Number(source.b2b?.depth)||800;drawing.depthMm=drawing.railLength;drawing.bays=1;drawing.palW=width;drawing.layoutView='b2b-top';drawing.systemType='mr';drawing.plan={feet:[...(source.plan?.feet||[drawing.railLength])],braces:[...(source.plan?.braces||[])]};
    drawing.b2b={...(drawing.b2b||{}),mr:true,modules:1,width:width,uprightWidth:foot};drawing.b2bLayout={...(drawing.b2bLayout||{}),palletCount:1,palletWidth:width,palletType:'mr',sectionWidth:width,rowCount:1};return drawing;
  }
  function ensureModal(){
    var modal=document.getElementById('rafexMrExtensionModal');if(modal)return modal;modal=document.createElement('div');modal.id='rafexMrExtensionModal';modal.hidden=true;modal.innerHTML='<div class="rafex-mr-extension-card" role="dialog" aria-modal="true" aria-labelledby="rafexMrExtensionTitle"><h3 id="rafexMrExtensionTitle">Kalan MR Bölümü</h3><p>Tam genişlikteki MR modülleri yerleştirildi. En yakın duvar veya engele kalan bölümü 50 mm aralıklarla özel raf tipine dönüştürebilirsin.</p><div class="rafex-mr-extension-summary"><div><span id="rafexMrObstacleSummaryLabel">ENGELE KALAN MESAFE</span><b id="rafexMrWallRemaining">0 mm</b></div><div><span>YERLEŞEN STANDART MODÜL</span><b id="rafexMrStandardCount">0 adet</b></div></div><label class="rafex-mr-extension-field">Son bölüm net raf genişliği (mm)<span class="rafex-mr-extension-input"><button type="button" data-mr-step="-50">−</button><input id="rafexMrCustomWidth" type="number" min="500" step="50"><button type="button" data-mr-step="50">+</button></span><small id="rafexMrCustomHint"></small></label><div class="rafex-mr-extension-error" id="rafexMrExtensionError"></div><div class="rafex-mr-extension-actions"><button type="button" data-mr-cancel>İptal</button><button type="button" class="primary" data-mr-apply>Özel Rafı Oluştur</button></div></div>';
    document.body.appendChild(modal);modal.addEventListener('click',function(event){if(event.target===modal||event.target.closest('[data-mr-cancel]'))closeModal();var step=event.target.closest('[data-mr-step]');if(step)adjust(Number(step.dataset.mrStep)||0);if(event.target.closest('[data-mr-apply]'))applyCustom();});
    modal.addEventListener('keydown',function(event){if(event.key==='Escape'){event.preventDefault();closeModal();}else if(event.key==='Enter'&&event.target?.id==='rafexMrCustomWidth'){event.preventDefault();applyCustom();}});return modal;
  }
  function normalizeCustom(raw){if(!pendingCustom)return 0;var rounded=Math.round((Number(raw)||500)/50)*50;return Math.max(500,Math.min(pendingCustom.customMax,rounded));}
  function adjust(delta){var input=document.getElementById('rafexMrCustomWidth');if(input)input.value=String(normalizeCustom(Number(input.value)+delta));}
  function openModal(data){
    pendingCustom=data;var modal=ensureModal(),input=document.getElementById('rafexMrCustomWidth'),summaryLabel=document.getElementById('rafexMrObstacleSummaryLabel');if(summaryLabel)summaryLabel.textContent=String(data.remainingLabel||data.obstacleLabel||'ENGELE KALAN')+' MESAFE';document.getElementById('rafexMrWallRemaining').textContent=Math.round(data.wallRemaining).toLocaleString('tr-TR')+' mm';document.getElementById('rafexMrStandardCount').textContent=data.standardCount.toLocaleString('tr-TR')+' adet';document.getElementById('rafexMrCustomHint').textContent='Kullanılabilir net genişlik: 500–'+data.customMax.toLocaleString('tr-TR')+' mm · yalnızca 50 mm adımlar';document.getElementById('rafexMrExtensionError').textContent='';input.max=String(data.customMax);input.value=String(data.customMax);modal.hidden=false;setTimeout(function(){input.focus();input.select();},30);
  }
  function closeModal(){var modal=document.getElementById('rafexMrExtensionModal');if(modal)modal.hidden=true;pendingCustom=null;}
  async function saveType(drawing){
    var response=await req('/api/b2b-types',{method:'POST',body:JSON.stringify({drawing:drawing})}),saved=response?.type||response?.rackType||response;var previous=m2ActiveModule;try{m2ActiveModule='mr';await m2RefreshSavedRackTypes();}finally{m2ActiveModule=previous;}
    return (Array.isArray(m2SavedRackTypes)?m2SavedRackTypes.find(function(entry){return Number(entry.id)===Number(saved?.id);}):null)||saved;
  }
  async function applyCustom(){
    if(!pendingCustom)return;var input=document.getElementById('rafexMrCustomWidth'),error=document.getElementById('rafexMrExtensionError'),button=document.querySelector('#rafexMrExtensionModal [data-mr-apply]'),width=normalizeCustom(input?.value);if(input)input.value=String(width);
    if(width<500||width>pendingCustom.customMax){error.textContent='Ölçü 500 mm ile izin verilen üst sınır arasında ve 50 mm adımlı olmalı.';return;}
    var candidate=copyRack(pendingCustom.source,width,0,0),foot=footOf(pendingCustom.source),anchorPhysical=Math.max(1,Number(pendingCustom.anchor.widthMm)||pendingCustom.anchor.w/m2LayoutState.scale),step=(anchorPhysical+candidate.widthMm)/2-foot,anchorCx=pendingCustom.anchor.x+pendingCustom.anchor.w/2,anchorCy=pendingCustom.anchor.y+pendingCustom.anchor.h/2;candidate.x=anchorCx+pendingCustom.direction*pendingCustom.ux*step*m2LayoutState.scale-candidate.w/2;candidate.y=anchorCy+pendingCustom.direction*pendingCustom.uy*step*m2LayoutState.scale-candidate.h/2;candidate.angle=pendingCustom.source.angle;
    if(!m2RackInsideArea(candidate)||m2RackOverlapsExcept(candidate,candidate.x,candidate.y,candidate.angle,[pendingCustom.anchor.id])){error.textContent='Seçilen son bölüm duvara veya başka bir rafa taşıyor. Daha küçük bir ölçü seç.';return;}
    button.disabled=true;error.textContent='Yeni MR tipi kaydediliyor…';var state=pendingCustom;
    try{var entry=await saveType(drawingFor(state.source,width)),name=entry?.name||('MR ÖZEL '+width);m2PushUndo('MR özel son bölüm');var placed=placeAfter(state.anchor,state.source,width,state.direction,state.ux,state.uy,name);if(!placed){m2DiscardUndo?.();throw new Error('Özel raf yerleştirme sırasında alan sınırı değişti.');}m2LayoutState.selected=placed.id;closeModal();m2RenderSavedRackTypes?.();m2RenderLayout();setStatus(name+' · '+width.toLocaleString('tr-TR')+' mm özel MR tipi kaydedildi ve son blok yerleştirildi.');}
    catch(err){error.textContent=err?.message||'Özel MR tipi kaydedilemedi.';}finally{button.disabled=false;}
  }
  function commitMr(point,manualDistance){
    var draft=m2AutoFillDraft,source=draft&&rackById(draft.rackId);if(!draft||draft.rafexSystem!=='mr'||!source)return false;
    var base=axisOf(source,1),cx=source.x+source.w/2,cy=source.y+source.h/2,direction=point?(((point.x-cx)*base.ux+(point.y-cy)*base.uy)>=0?1:-1):(draft.direction||1),info=obstacleClearance(source,direction),scale=Math.max(.0001,Number(m2LayoutState.scale)||.04),requested=manualDistance==null&&point?Math.max(0,Math.round(((point.x-info.start.x)*info.dx+(point.y-info.start.y)*info.dy)/scale)):Math.max(1,Math.round(Number(manualDistance??draft.selectedLengthMm)||0)),target=Math.min(requested,info.distanceMm),section=sectionOf(source),foot=footOf(source),planned=plan(target,section,foot),anchor=info.anchor,added=0,occupied=0;
    if(target<=0){m2AutoFillDraft=null;controls(false);m2LayoutState.selected=source.id;m2RenderLayout();setStatus(info.label+' 0 mm; bu yönde uzatma için boş alan yok.');return true;}
    if(planned.count)m2PushUndo('MR raf uzatma');
    for(var i=0;i<planned.count;i++){var probe=placeAfter(anchor,source,section,direction,base.ux,base.uy,source.typeName);if(!probe)break;anchor=probe;occupied+=section+foot;added++;}
    if(planned.count&&!added)m2DiscardUndo?.();m2AutoFillDraft=null;controls(false);m2LayoutState.selected=source.id;m2RenderLayout();
    var wallRemaining=Math.max(0,target-occupied),netRemaining=Math.max(0,wallRemaining-foot),customMax=Math.floor(netRemaining/50)*50,manualChoice=target<info.distanceMm,remainingLabel=manualChoice?'SEÇİLEN UZATMADA KALAN':info.label;
    if(netRemaining>500&&customMax>=500){openModal({source:source,anchor:anchor,direction:direction,ux:base.ux,uy:base.uy,target:target,available:info.distanceMm,obstacleLabel:info.label,remainingLabel:remainingLabel,standardCount:added,wallRemaining:wallRemaining,netRemaining:netRemaining,customMax:customMax});setStatus(added+' standart MR modülü yerleştirildi; '+remainingLabel.toLocaleLowerCase('tr-TR')+' '+Math.round(wallRemaining).toLocaleString('tr-TR')+' mm için son bölüm ölçüsünü seç.');}
    else setStatus(added?target.toLocaleString('tr-TR')+' mm uzatmada '+added+' standart MR modülü yerleştirildi. '+info.label+' '+formatMm(info.distanceMm)+'. Kalan net alan özel bölüm sınırını aşmıyor.':'Bu yönde standart MR modülü sığmıyor; '+info.label.toLocaleLowerCase('tr-TR')+' '+formatMm(info.distanceMm)+'. Özel bölüm için 500 mm’den büyük net alan gerekli.');return true;
  }
  var wrappedStart=function(rackId){var rack=rackById(rackId);if(isMr(rack)){startMr(rack);return;}return originalStart?.apply(this,arguments);};
  var wrappedPreview=function(value){if(previewMr(value))return;return originalPreview?.apply(this,arguments);};
  var wrappedApply=function(){if(m2AutoFillDraft?.rafexSystem==='mr'){var distance=Math.max(1,Math.round(Number(document.getElementById('m2AutoFillLength')?.value)||0));if(!distance){setStatus('MR uzatma mesafesini mm olarak yaz.');return;}commitMr(null,distance);return;}return originalApply?.apply(this,arguments);};
  var wrappedCancel=function(){if(m2AutoFillDraft?.rafexSystem==='mr'){m2AutoFillDraft=null;controls(false);setStatus('MR raf uzatma işlemi iptal edildi.');m2RenderLayout();return;}return originalCancel?.apply(this,arguments);};
  var wrappedCommit=function(point,manualDistance){if(m2AutoFillDraft?.rafexSystem==='mr')return commitMr(point,manualDistance);return originalCommit?.apply(this,arguments);};
  window.rafexCommitMrObstacleV40=function(point){return commitMr(point,null);};
  var wrappedCustomizeOpen=function(rackId){var rack=rackById(rackId);if(isMr(rack))return openMrCustomize(rack);return originalCustomizeOpen?.apply(this,arguments);};
  var wrappedCustomizeClose=function(){var modal=document.getElementById('m2CustomizeModal');if(modal?.classList?.contains('rafex-mr-customize-v37'))return closeMrCustomize();return originalCustomizeClose?.apply(this,arguments);};
  var wrappedCustomizePreview=function(){var rack=rackById(typeof m2CustomizeRackId==='undefined'?null:m2CustomizeRackId);if(isMr(rack)){mountMrCustomize(rack);return;}return originalCustomizePreview?.apply(this,arguments);};
  var wrappedCustomizeApply=function(){var rack=rackById(typeof m2CustomizeRackId==='undefined'?null:m2CustomizeRackId);if(isMr(rack))return window.rafexLoadMrRackV37();return originalCustomizeApply?.apply(this,arguments);};
  var wrappedSelectSaved=function(index){var entry=Array.isArray(m2SavedRackTypes)?m2SavedRackTypes[index]:null,drawing=entry?.drawing;if(m2ActiveModule==='mr'&&isMr(drawing)){m2SelectedSavedType=index;m2LayoutState.selected=null;m2LastDrawing=JSON.parse(JSON.stringify(drawing));mrApplyDrawingToFormV4(drawing);mrUpdateSummary(true);mrSyncLayoutDrawingV4(false);m2RenderSavedRackTypes();m2RenderLayout();setStatus(String(entry.name||'MR')+' MR ölçüleriyle yüklendi.');return;}return originalSelectSaved?.apply(this,arguments);};
  try{m2StartAutoFillGuide=wrappedStart;m2PreviewAutoFillLength=wrappedPreview;m2ApplyAutoFillLength=wrappedApply;m2CancelAutoFill=wrappedCancel;m2CommitAutoFillGuide=wrappedCommit;}catch(e){}
  try{m2OpenCustomizeModal=wrappedCustomizeOpen;m2CloseCustomizeModal=wrappedCustomizeClose;m2PreviewRackCustomization=wrappedCustomizePreview;m2ApplyRackCustomization=wrappedCustomizeApply;m2SelectSavedRackType=wrappedSelectSaved;}catch(e){}
  window.m2StartAutoFillGuide=wrappedStart;window.m2PreviewAutoFillLength=wrappedPreview;window.m2ApplyAutoFillLength=wrappedApply;window.m2CancelAutoFill=wrappedCancel;window.m2CommitAutoFillGuide=wrappedCommit;
  window.m2OpenCustomizeModal=wrappedCustomizeOpen;window.m2CloseCustomizeModal=wrappedCustomizeClose;window.m2PreviewRackCustomization=wrappedCustomizePreview;window.m2ApplyRackCustomization=wrappedCustomizeApply;window.m2SelectSavedRackType=wrappedSelectSaved;
  installExtensionDisclosure();var disclosureScanPending=false;new MutationObserver(function(){if(disclosureScanPending)return;disclosureScanPending=true;requestAnimationFrame(function(){disclosureScanPending=false;installExtensionDisclosure();});}).observe(document.body,{childList:true,subtree:true});
  document.addEventListener('pointerdown',function(event){
    if(event.button!=null&&event.button!==0||event.isPrimary===false)return;
    var node=event.target?.closest?.('#m2LayoutSvg [data-rack]'),rack=node&&rackById(node.dataset.rack);if(!isMr(rack)){lastMrPointerTap={id:null,at:0};return;}if(typeof m2CustomizeMode!=='undefined'&&m2CustomizeMode){lastMrPointerTap={id:null,at:0};event.preventDefault();event.stopImmediatePropagation();openMrCustomize(rack);return;}
    var now=Date.now(),same=Number(lastMrPointerTap.id)===Number(rack.id)&&now-lastMrPointerTap.at<520;
    if(!same){lastMrPointerTap={id:rack.id,at:now};return;}
    lastMrPointerTap={id:null,at:0};suppressMrDblClickUntil=now+700;event.preventDefault();event.stopImmediatePropagation();try{m2LayoutState.drag=null;}catch(e){}wrappedStart(rack.id);
  },true);
  document.addEventListener('dblclick',function(event){var node=event.target?.closest?.('#m2LayoutSvg [data-rack]'),rack=node&&rackById(node.dataset.rack);if(!isMr(rack))return;event.preventDefault();event.stopImmediatePropagation();if(Date.now()<suppressMrDblClickUntil)return;wrappedStart(rack.id);},true);
})();</script>`;

  const bodyEnd = html.lastIndexOf("</body>");
  if (bodyEnd < 0) throw new Error("MR v35: body kapanisi bulunamadi.");
  html = html.slice(0, bodyEnd) + runtime + "\n" + html.slice(bodyEnd);
  for (const required of [marker, "__rafexMrPointerDoubleTapV36", "rafexMrConfigFromRackV37", "__rafexMrSectionCaptureV38", "function buildMRCard(group,index)", "rafex-v38-mr-type-card", "data-rafex-system=\"mr\"", "x==='b2b'||x==='mekik2'||x==='mr'", "if(document.activeElement===input)input.blur()", "rafexProjectMrObstacleV40", "rafexCommitMrObstacleV40", "DUVARA KALAN", "KOLONA KALAN", "RAFA KALAN", "rafex-mr-customize-v37", "MR 3D RAF ÖNİZLEMESİ", "addEventListener('pointerdown'", "rafexMrExtensionPlan", "Kalan MR Bölümü", "Özel Rafı Oluştur", "netRemaining>500", "step=\"50\"", "rafex-extension-disclosure-v42", "rafexMrQuantitySummaryV42", "__rafexMrExactQuantitiesV42"]) {
    if (!html.includes(required)) throw new Error(`MR v35 runtime dogrulama hatasi: ${required}`);
  }
  const encoded = Buffer.from(html, "utf8").toString("base64");
  worker = worker.slice(0, match.index) + match[1] + match[2] + encoded + match[2] + worker.slice(match.index + match[0].length);
  fs.writeFileSync(workerPath, worker);
  console.log("MR v42 runtime: acilir uzatma blogu, tam bagimsiz ayirma ve ortak-ayak duyarlı kesin MR adetleri eklendi.");
} else {
  throw new Error("Kullanim: node scripts/patch-mr-free-extension-v35.mjs source|runtime");
}
