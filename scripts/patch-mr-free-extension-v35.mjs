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
    const rowCount = Math.max(1, Math.min(2, Math.round(Number(rack?.rowCount) || 1)));
    const trayPieces = Math.max(0, Math.round(Number(rack?.trayPieces) || 0));
    const trayLevels = Math.max(0, Math.round(Number(rack?.trayLevels) || 0));
    totals.uprights += (modules + (rack?.sharedFootWith ? 0 : 1)) * rowCount;
    totals.traverses += modules * levels * 2 * rowCount;
    totals.trays += modules * trayPieces * trayLevels * rowCount;
    return totals;
  }, { uprights:0, traverses:0, trays:0 });
}

function roundUpright50(value) {
  return Math.ceil(Math.max(0, Number(value) || 0) / 50) * 50;
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
assert.deepEqual(summarizeMrCounts([{ modules:2, levels:3, rowCount:2, trayPieces:8, trayLevels:2 }]), { uprights:6, traverses:24, trays:64 });
assert.equal(roundUpright50(4040), 4050);
assert.equal(roundUpright50(4050), 4050);
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
        const relations=(window.rafexRackGapRelationsV46?.(owner)||[m2NearestRackGap(owner)]).filter(Boolean).slice(0,2);
        return relations.map((nearest,index)=>{const mm=Math.max(0,Math.round(nearest.distance/m2LayoutState.scale)-nearest.clearanceMm),mx=(nearest.ax+nearest.bx)/2,my=(nearest.ay+nearest.by)/2,axis=Math.abs(nearest.ax-nearest.bx)<Math.abs(nearest.ay-nearest.by)?"vertical":"horizontal",key=\`gap:\${owner.id}:\${nearest.other?.id??index}\`,label=m2DimensionPosition(key,mx,my-8),edit=index===0?\`event.stopPropagation();if(m2LayoutTool!=='dimension'&&m2LayoutTool!=='measure'){event.preventDefault();m2PromptRackDistance(\${owner.id},\${mm})}\`:"event.stopPropagation()";return \`<g class="m2-distance-guide" data-rack-gap="\${mm}" data-rack-gap-owner="\${owner.id}" data-rack-gap-other="\${nearest.other?.id??''}"><line x1="\${nearest.ax}" y1="\${nearest.ay}" x2="\${nearest.bx}" y2="\${nearest.by}" class="m2-rack-distance"/><circle cx="\${nearest.ax}" cy="\${nearest.ay}" r="4" fill="#e09b00"/><circle cx="\${nearest.bx}" cy="\${nearest.by}" r="4" fill="#e09b00"/><rect x="\${label.x-48}" y="\${label.y-13}" width="96" height="20" rx="5" class="m2-measure-hit" data-dimension-key="\${key}" data-dimension-axis="\${axis}" onpointerdown="\${edit}"/><text x="\${label.x}" y="\${label.y}" text-anchor="middle" class="m2-rack-distance-label m2-dimension-movable" data-dimension-key="\${key}" data-dimension-axis="\${axis}" onpointerdown="\${edit}">RAF ARASI \${fmt(mm)} mm</text></g>\`;}).join("");
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
        const oldGroup=rack.joinGroup,baseBlock=String(rack.blockName||rack.typeName||"MR Raf").replace(/\\s*·?\\s*Bağımsız(?: \\d+)?$/u,"");
        rack.joinGroup=null;rack.sharedFootWith=null;rack.sharedFootSide=null;rack.freePlacement=false;rack.staged=false;rack.locked=true;rack.specLocked=true;rack.independentBlock=true;rack.independentBlockId="independent-"+rack.id;rack.blockName=baseBlock+" Bağımsız";
        m2LayoutState.racks.forEach((item)=>{if(item.id!==rack.id&&item.sharedFootWith===rack.id){item.sharedFootWith=null;item.sharedFootSide=null;}});
        Object.keys(m2DimensionOffsets).filter((key)=>key.includes(":"+rack.id)).forEach((key)=>delete m2DimensionOffsets[key]);
        delete m2PinnedDimensionsByRack[String(rack.id)];m2PinnedDimensions=m2EmptyPinnedDimensions();m2LayoutState.pinnedRackId=null;
        m2NormalizeJoinComponents(oldGroup);
        $("m2FloorStatus").textContent="Seçili modül ortak ayak ve grup ilişkilerinden ayrıldı; artık tamamen bağımsız bir raf bloğu.";m2RenderLayout();
      }`;
  if (portal.includes(oldSeparate)) portal = portal.replace(oldSeparate, newSeparate);
  else if (!portal.includes('rack.independentBlockId="independent-"+rack.id')) throw new Error("MR v42: raf ayirma fonksiyonu bulunamadi.");

  // Bagimsiz raf bilgi kartinda "A Bagimsiz" tek basliktir. Tip harfi alt
  // satirda ikinci kez yazilmaz; eski "A · Bagimsiz" kayitlari da duzeltilir.
  const oldSelectedRackHeading = '${blockName?`<b>${esc(blockName)}</b><br>`:""}<b><i class="m2-info-swatch" style="background:${color}"></i>${esc(name)}</b><br>';
  const newSelectedRackHeading = '${blockName?`<b>${esc(rack?.independentBlock?blockName.replace(" · "," "):blockName)}</b><br>`:""}${rack?.independentBlock?"":`<b><i class="m2-info-swatch" style="background:${color}"></i>${esc(name)}</b><br>`}';
  if (portal.includes(oldSelectedRackHeading)) portal = portal.replace(oldSelectedRackHeading, newSelectedRackHeading);
  else if (!portal.includes('rack?.independentBlock?blockName.replace(" · "," ")')) throw new Error("MR v44: bagimsiz raf tek basligi bulunamadi.");

  // Kayitli MR raflarinda B2B'ye bagli olmayan, dogrudan MR veri ve 3D
  // motorunu kullanan Incele/Kopyala aksiyonlari gosterilir. Sira bilgisi
  // kart basliginda degil, secilen rafin proje bilgi satirinda gosterilir.
  const oldMrSavedMap = 'm2SavedRackTypes.map((entry,index)=>{const drawing=entry.drawing||{},settings=drawing.b2b||{},color=m2TypeColor(entry.name),tray=';
  const newMrSavedMap = 'm2SavedRackTypes.map((entry,index)=>{const drawing=entry.drawing||{},settings=drawing.b2b||{},color=m2TypeColor(entry.name),tray=';
  if (portal.includes(oldMrSavedMap)) portal = portal.replace(oldMrSavedMap, newMrSavedMap);
  else if (!portal.includes(newMrSavedMap)) throw new Error("MR v46: kayitli raf listesi bulunamadi.");

  const oldMrSavedTitle = '${esc(entry.name)} · MR</b><small>';
  const newMrSavedTitle = '${esc(entry.name)} · MR</b><small>';
  if (portal.includes(oldMrSavedTitle)) portal = portal.replace(oldMrSavedTitle, newMrSavedTitle);
  else if (!portal.includes(newMrSavedTitle)) throw new Error("MR v46: kayitli raf basligi bulunamadi.");

  const oldMrSavedActions = '</button><button type="button" class="m2-saved-type-copy" aria-label="${esc(entry.name)} tipini MR düzenleyiciye kopyala" title="Üstte düzenlemek için kopyala" onclick="event.stopPropagation();mrSelectBlockV7(${index})">KOPYALA</button><button type="button" class="m2-type-delete"';
  const newMrSavedActions = '</button><button type="button" class="m2-saved-type-preview" aria-label="${esc(entry.name)} MR rafını incele" title="İncele" onclick="event.stopPropagation();rafexInspectMrSavedV45(${index})">i</button><button type="button" class="m2-saved-type-copy" aria-label="${esc(entry.name)} tipini MR düzenleyiciye kopyala" title="Kopyala" onclick="event.stopPropagation();rafexCopyMrSavedV45(${index})">⧉</button><button type="button" class="m2-type-delete"';
  if (portal.includes(oldMrSavedActions)) portal = portal.replace(oldMrSavedActions, newMrSavedActions);
  else if (!portal.includes('rafexInspectMrSavedV45(${index})')) throw new Error("MR v48: MR kayitli raf aksiyonlari bulunamadi.");

  const oldMrBlockTitle = '<b>${esc(entry.name)}</b><small>${fmt(settings.modules||drawing.bays)} modül · ${fmt(settings.levels||drawing.levels)} kat</small>';
  const newMrBlockTitle = '<b>${esc(entry.name)} · ${fmt(Math.max(1,Math.min(2,Number(settings.rowCount)||Number(drawing.b2bLayout?.rowCount)||1)))} sıra</b><small>${fmt(settings.modules||drawing.bays)} modül · ${fmt(settings.levels||drawing.levels)} kat</small>';
  if (portal.includes(oldMrBlockTitle)) portal = portal.replace(oldMrBlockTitle, newMrBlockTitle);
  // Eski MR ekranlarinda bu ikinci mini blok paneli yoktur; kayitli sistem
  // listesindeki sira etiketi yukarida her surumde zorunlu olarak uygulanir.

  const oldMrConfigurationV45 = `mrConfigurationV2=function(){
        const levels=Math.max(1,Math.min(15,Math.round(Number($("mrLevels")?.value)||4)));
        const firstTraverse=Math.max(0,Number($("mrFirstTraverse")?.value)||200);
        const requestedLevelGap=Math.max(100,Number($("mrLevelGap")?.value)||1000);
        const [uprightType="MR60",uprightThicknessText="1.5"]=String($("mrUprightType")?.value||"MR60|1.5").split("|");
        const [traverseType="ZS65",traverseThicknessText="1.5"]=String($("mrTraverseType")?.value||"ZS65|1.5").split("|");
        const traverseHeight={ZS35:55,ZS55:75,ZS65:85}[traverseType]||85;
        const levelGap=requestedLevelGap,levelPitch=levelGap+traverseHeight;
        const height=firstTraverse+Math.max(0,levels-1)*levelPitch;
        const automaticUprightHeight=height+traverseHeight+levelGap/2;
        const topTraverseMode=$("mrTopTraverseMode")?.value==="manual"?"manual":"auto";
        const enteredUprightHeight=Number($("mrHeight")?.value);
        const manualUprightHeight=Math.max(height+traverseHeight,Number.isFinite(enteredUprightHeight)?enteredUprightHeight:automaticUprightHeight);
        const uprightHeight=topTraverseMode==="manual"?manualUprightHeight:automaticUprightHeight;
        const topExtension=Math.max(0,uprightHeight-(height+traverseHeight));
        return{modules:Math.max(1,Number($("mrModuleCount")?.value)||1),levels,width:Math.max(300,Number($("mrSectionWidth")?.value)||2400),depth:Math.max(300,Number($("mrDepth")?.value)||800),firstTraverse,levelGap,requestedLevelGap,height,automaticUprightHeight,topExtension,topTraverseMode,uprightHeight,uprightType,uprightThickness:Number(uprightThicknessText)||1.5,uprightWidth:60,traverseType,traverseThickness:Number(traverseThicknessText)||1.5,traverseHeight,uprightFinish:$("mrUprightFinish")?.value||"ral5010",traverseFinish:$("mrTraverseFinish")?.value||"ral1007",accessories:mrAccessoryStateV5(),dimensions:{levels:$("mrShowLevelDims")?.checked!==false,markers:$("mrShowMarkers")?.checked!==false,width:$("mrShowWidth")?.checked!==false,depth:$("mrShowDepth")?.checked!==false},dimensionScale:Math.max(.7,Math.min(1.5,Number($("mrDimensionScale")?.value)||1))}
      };`;
  const newMrConfigurationV45 = `mrConfigurationV2=function(){
        const levels=Math.max(1,Math.min(15,Math.round(Number($("mrLevels")?.value)||4))),firstTraverse=Math.max(0,Number($("mrFirstTraverse")?.value)||200),requestedLevelGap=Math.max(100,Number($("mrLevelGap")?.value)||1000),[uprightType="MR60",uprightThicknessText="1.5"]=String($("mrUprightType")?.value||"MR60|1.5").split("|"),[traverseType="ZS65",traverseThicknessText="1.5"]=String($("mrTraverseType")?.value||"ZS65|1.5").split("|"),traverseHeight={ZS35:55,ZS55:75,ZS65:85}[traverseType]||85,levelGap=requestedLevelGap,levelPitch=levelGap+traverseHeight,height=firstTraverse+Math.max(0,levels-1)*levelPitch,automaticUprightHeight=height+traverseHeight+levelGap/2,topTraverseMode=$("mrTopTraverseMode")?.value==="manual"?"manual":"auto",enteredUprightHeight=Number($("mrHeight")?.value),manualUprightHeight=Math.max(height+traverseHeight,Number.isFinite(enteredUprightHeight)?enteredUprightHeight:automaticUprightHeight),rawUprightHeight=topTraverseMode==="manual"?manualUprightHeight:automaticUprightHeight,uprightHeight=Math.ceil(rawUprightHeight/50)*50,topExtension=Math.max(0,uprightHeight-(height+traverseHeight)),rowCount=$("mrRowType")?.value==="double"?2:1,rowGap=rowCount===2?Math.max(0,Number($("mrRowGap")?.value)||200):0;
        return{modules:Math.max(1,Number($("mrModuleCount")?.value)||1),levels,width:Math.max(300,Number($("mrSectionWidth")?.value)||2400),depth:Math.max(300,Number($("mrDepth")?.value)||800),rowCount,rowGap,firstTraverse,levelGap,requestedLevelGap,height,automaticUprightHeight,topExtension,topTraverseMode,uprightHeight,uprightType,uprightThickness:Number(uprightThicknessText)||1.5,uprightWidth:60,traverseType,traverseThickness:Number(traverseThicknessText)||1.5,traverseHeight,uprightFinish:$("mrUprightFinish")?.value||"ral5010",traverseFinish:$("mrTraverseFinish")?.value||"ral1007",accessories:mrAccessoryStateV5(),dimensions:{levels:$("mrShowLevelDims")?.checked!==false,markers:$("mrShowMarkers")?.checked!==false,width:$("mrShowWidth")?.checked!==false,depth:$("mrShowDepth")?.checked!==false},dimensionScale:Math.max(.7,Math.min(3,Number($("mrDimensionScale")?.value)||2))}
      };`;
  if (portal.includes(oldMrConfigurationV45)) portal = portal.replace(oldMrConfigurationV45, newMrConfigurationV45);
  else if (!portal.includes('rowCount=$("mrRowType")?.value==="double"?2:1')) throw new Error("MR v45: sira ve 50 mm ayak konfigurasyonu bulunamadi.");

  const oldMrSummaryHead = 'const{modules,width,depth,levels,height,uprightHeight,firstTraverse,levelGap,topExtension,topTraverseMode,uprightWidth,uprightType,uprightThickness,traverseType,traverseThickness,traverseHeight}=mrConfigurationV2(),totalWidth=modules*width+(modules+1)*uprightWidth;';
  const newMrSummaryHead = 'const{modules,width,depth,rowCount,rowGap,levels,height,uprightHeight,firstTraverse,levelGap,topExtension,topTraverseMode,uprightWidth,uprightType,uprightThickness,traverseType,traverseThickness,traverseHeight}=mrConfigurationV2(),totalWidth=modules*width+(modules+1)*uprightWidth,footprintDepth=rowCount*depth+Math.max(0,rowCount-1)*rowGap;';
  if (portal.includes(oldMrSummaryHead)) portal = portal.replace(oldMrSummaryHead, newMrSummaryHead);
  else if (!portal.includes('footprintDepth=rowCount*depth')) throw new Error("MR v45: sira ozet hesabi bulunamadi.");

  const oldMrHeightInput = 'if(heightInput){heightInput.disabled=topTraverseMode!=="manual";if(topTraverseMode!=="manual"||document.activeElement!==heightInput)heightInput.value=String(Math.round(uprightHeight))}';
  const newMrHeightInput = 'if(heightInput){heightInput.disabled=topTraverseMode!=="manual";if(topTraverseMode!=="manual"||document.activeElement!==heightInput)heightInput.value=String(Math.round(uprightHeight))}const rowGapInput=$("mrRowGap");if(rowGapInput)rowGapInput.disabled=rowCount!==2;';
  if (portal.includes(oldMrHeightInput)) portal = portal.replace(oldMrHeightInput, newMrHeightInput);
  else if (!portal.includes('rowGapInput.disabled=rowCount!==2')) throw new Error("MR v45: sira araligi kontrolu bulunamadi.");

  const oldMrFootprintSummary = '$("mrFootprint").textContent=`${fmt(totalWidth)} × ${fmt(depth)} mm`';
  const newMrFootprintSummary = '$("mrFootprint").textContent=`${fmt(totalWidth)} × ${fmt(footprintDepth)} mm`';
  if (portal.includes(oldMrFootprintSummary)) portal = portal.replace(oldMrFootprintSummary, newMrFootprintSummary);
  else if (!portal.includes('${fmt(totalWidth)} × ${fmt(footprintDepth)} mm')) throw new Error("MR v45: cift sira yerlesim ozeti bulunamadi.");

  const oldMrLevelSummary = '`${levels} kat · ${modules} modül · ${uprightType} ${String(uprightThickness).replace(".",",")} mm · ${traverseType} ${String(traverseThickness).replace(".",",")} mm / H ${fmt(traverseHeight)}`';
  const newMrLevelSummary = '`${levels} kat · ${modules} modül · ${rowCount===2?"Çift sıra":"Tek sıra"} · ${uprightType} ${String(uprightThickness).replace(".",",")} mm · ${traverseType} ${String(traverseThickness).replace(".",",")} mm / H ${fmt(traverseHeight)}`';
  if (portal.includes(oldMrLevelSummary)) portal = portal.replace(oldMrLevelSummary, newMrLevelSummary);
  else if (!portal.includes('rowCount===2?"Çift sıra":"Tek sıra"')) throw new Error("MR v47: sira konfigurasyon ozeti bulunamadi.");

  const oldMrDistanceSummary = '${fmt(height)} mm · üst uzatma ${fmt(levelGap/2)} mm';
  const newMrDistanceSummary = '${fmt(height)} mm · üst uzatma ${fmt(uprightHeight-height)} mm · ayak ${fmt(uprightHeight)} mm';
  if (portal.includes(oldMrDistanceSummary)) portal = portal.replace(oldMrDistanceSummary, newMrDistanceSummary);
  else if (!portal.includes('ayak ${fmt(uprightHeight)} mm')) throw new Error("MR v45: yuvarlanmis ayak ozeti bulunamadi.");

  const oldMrLayoutDrawingV45 = `mrLayoutDrawingV4=function(){
        const config=mrConfigurationV2(),footWidth=config.uprightWidth,totalWidth=config.modules*config.width+(config.modules+1)*footWidth,sectionWidth=config.modules*config.width;
        return{plan:{feet:[config.depth],braces:[],mr:true},totalWidth,railLength:config.depth,widthMm:totalWidth,depthMm:config.depth,bays:config.modules,levels:config.levels,depth:1,palW:config.width,palD:config.depth,palletWeight:0,palletHeight:0,levelH:config.levelGap,firstRailHeight:config.firstTraverse,traverseHeight:config.traverseHeight,totalRackHeight:config.height,sideUprightHeight:config.uprightHeight,footType:footWidth,systemType:"mr",palletPositions:[0],palletGaps:[],layoutView:"b2b-top",b2bLayout:{palletCount:config.modules,palletWidth:config.width,palletDepth:config.depth,palletOverhang:0,palletType:"mr",sectionWidth,frameDepth:config.depth,rowCount:1,rowGap:0},b2b:{mr:true,modules:config.modules,levels:config.levels,width:config.width,depth:config.depth,height:config.height,uprightHeight:config.uprightHeight,firstTraverse:config.firstTraverse,levelGap:config.levelGap,requestedLevelGap:config.requestedLevelGap,topTraverseMode:config.topTraverseMode,uprightType:config.uprightType,uprightThickness:config.uprightThickness,uprightWidth:config.uprightWidth,traverseType:config.traverseType,traverseThickness:config.traverseThickness,traverseHeight:config.traverseHeight,uprightFinish:config.uprightFinish,traverseFinish:config.traverseFinish,accessories:config.accessories,dimensions:config.dimensions,dimensionScale:config.dimensionScale,firstPalletPosition:"traverse"}}
      };`;
  const newMrLayoutDrawingV45 = `mrLayoutDrawingV4=function(){
        const config=mrConfigurationV2(),footWidth=config.uprightWidth,totalWidth=config.modules*config.width+(config.modules+1)*footWidth,sectionWidth=config.modules*config.width,footprintDepth=config.rowCount*config.depth+Math.max(0,config.rowCount-1)*config.rowGap;
        return{plan:{feet:[config.depth],braces:[],mr:true},totalWidth,railLength:footprintDepth,widthMm:totalWidth,depthMm:footprintDepth,bays:config.modules,levels:config.levels,depth:config.rowCount,palW:config.width,palD:config.depth,palletWeight:0,palletHeight:0,levelH:config.levelGap,firstRailHeight:config.firstTraverse,traverseHeight:config.traverseHeight,totalRackHeight:config.height,sideUprightHeight:config.uprightHeight,footType:footWidth,systemType:"mr",palletPositions:Array.from({length:config.rowCount},(_,index)=>index*(config.depth+config.rowGap)),palletGaps:config.rowCount===2?[config.rowGap]:[],layoutView:"b2b-top",b2bLayout:{palletCount:config.modules,palletWidth:config.width,palletDepth:config.depth,palletOverhang:0,palletType:"mr",sectionWidth,frameDepth:config.depth,rowCount:config.rowCount,rowGap:config.rowGap},b2b:{mr:true,modules:config.modules,levels:config.levels,width:config.width,depth:config.depth,rowCount:config.rowCount,rowGap:config.rowGap,height:config.height,uprightHeight:config.uprightHeight,firstTraverse:config.firstTraverse,levelGap:config.levelGap,requestedLevelGap:config.requestedLevelGap,topTraverseMode:config.topTraverseMode,uprightType:config.uprightType,uprightThickness:config.uprightThickness,uprightWidth:config.uprightWidth,traverseType:config.traverseType,traverseThickness:config.traverseThickness,traverseHeight:config.traverseHeight,uprightFinish:config.uprightFinish,traverseFinish:config.traverseFinish,accessories:config.accessories,dimensions:config.dimensions,dimensionScale:config.dimensionScale,firstPalletPosition:"traverse"}}
      };`;
  if (portal.includes(oldMrLayoutDrawingV45)) portal = portal.replace(oldMrLayoutDrawingV45, newMrLayoutDrawingV45);
  else if (!portal.includes('footprintDepth=config.rowCount*config.depth')) throw new Error("MR v45: cift sira cizim verisi bulunamadi.");

  const oldMrApplyDrawingV45 = 'if($("mrTraverseType"))$("mrTraverseType").value=`${settings.traverseType||"ZS65"}|${Number(settings.traverseThickness)||1.5}`;mrTrayAccessoryV5=';
  const newMrApplyDrawingV45 = 'if($("mrTraverseType"))$("mrTraverseType").value=`${settings.traverseType||"ZS65"}|${Number(settings.traverseThickness)||1.5}`;if($("mrRowType"))$("mrRowType").value=(Number(settings.rowCount)||Number(drawing.b2bLayout?.rowCount)||1)>1?"double":"single";if($("mrRowGap"))$("mrRowGap").value=String(Number(settings.rowGap??drawing.b2bLayout?.rowGap)||200);if($("mrDimensionScale"))$("mrDimensionScale").value=String(Math.max(.7,Math.min(3,Number(settings.dimensionScale)||2)));if($("mrShowLevelDims"))$("mrShowLevelDims").checked=settings.dimensions?.levels!==false;if($("mrShowMarkers"))$("mrShowMarkers").checked=settings.dimensions?.markers!==false;if($("mrShowWidth"))$("mrShowWidth").checked=settings.dimensions?.width!==false;if($("mrShowDepth"))$("mrShowDepth").checked=settings.dimensions?.depth!==false;mrTrayAccessoryV5=';
  if (portal.includes(oldMrApplyDrawingV45)) portal = portal.replace(oldMrApplyDrawingV45, newMrApplyDrawingV45);
  else if (!portal.includes('$("mrRowType").value=(Number(settings.rowCount)')) throw new Error("MR v45: kayitli sira form aktarimi bulunamadi.");

  const oldMrHeightAndGapV45 = 'heightLabel.innerHTML=`Ayak boyu (mm)<div class="mr-height-mode"><select id="mrTopTraverseMode" aria-label="Ayak boyu modu"><option value="auto">Otomatik</option><option value="manual">Manuel</option></select><input id="mrHeight" type="number" min="200" max="12000" step="10" value="3300" placeholder="Otomatik hesaplanır" disabled></div>`;heightLabel.insertAdjacentHTML("beforebegin",`<label class="mr-level-gap-field">Kat arası mesafe (mm)<input id="mrLevelGap" type="number" min="100" max="5000" step="10" value="1000"></label>`)';
  const newMrHeightAndGapV45 = 'heightLabel.innerHTML=`Ayak boyu (mm)<div class="mr-height-mode"><select id="mrTopTraverseMode" aria-label="Ayak boyu modu"><option value="auto">Otomatik</option><option value="manual">Manuel</option></select><input id="mrHeight" type="number" min="200" max="12000" step="50" value="3300" placeholder="Otomatik hesaplanır" disabled></div>`;heightLabel.insertAdjacentHTML("beforebegin",`<div class="mr-row-field"><div class="mr-row-mode"><label>Sıra düzeni<select id="mrRowType" aria-label="MR sıra düzeni"><option value="single">Tek sıra</option><option value="double">Çift sıra</option></select></label><label class="mr-row-gap-field">Çift sıra mesafesi (mm)<input id="mrRowGap" type="number" min="0" max="2000" step="10" value="200" aria-label="Çift sıra mesafesi" disabled></label></div></div><label class="mr-level-gap-field">Kat arası mesafe (mm)<input id="mrLevelGap" type="number" min="100" max="5000" step="10" value="1000"></label>`)';
  if (portal.includes(oldMrHeightAndGapV45)) portal = portal.replace(oldMrHeightAndGapV45, newMrHeightAndGapV45);
  else if (!portal.includes('id="mrRowType" aria-label="MR sıra düzeni"')) throw new Error("MR v45: tek cift sira kontrolu bulunamadi.");

  portal = portal.replace('<details class="mr-measure-overlay" id="mrMeasureOverlay" open><summary>ÖLÇÜLER VE MESAFELER</summary>', '<details class="mr-measure-overlay" id="mrMeasureOverlay"><summary>ÖLÇÜLER VE MESAFELER</summary>');
  if (!portal.includes('<details class="mr-measure-overlay" id="mrMeasureOverlay"><summary>ÖLÇÜLER VE MESAFELER</summary>')) throw new Error("MR v48: alttaki olcu duzenleyici bulunamadi.");

  const oldMrDimensionSliderV45 = '<input id="mrDimensionScale" type="range" min="0.7" max="1.5" step="0.1" value="1">';
  const newMrDimensionSliderV45 = '<input id="mrDimensionScale" type="range" min="0.7" max="3" step="0.1" value="2">';
  if (portal.includes(oldMrDimensionSliderV45)) portal = portal.replace(oldMrDimensionSliderV45, newMrDimensionSliderV45);
  else if (!portal.includes('id="mrDimensionScale" type="range" min="0.7" max="3"')) throw new Error("MR v45: 3D yazi olcegi bulunamadi.");

  const oldMrSavePlacementV45 = 'form.insertAdjacentHTML("afterend",`<div class="mr-rack-save">';
  const newMrSavePlacementV45 = 'const viewCard=page.querySelector(".mr-view-card");viewCard?.insertAdjacentHTML("beforeend",`<div class="mr-rack-save">';
  if (portal.includes(oldMrSavePlacementV45)) portal = portal.replace(oldMrSavePlacementV45, newMrSavePlacementV45);
  else if (!portal.includes('viewCard?.insertAdjacentHTML("beforeend",`<div class="mr-rack-save">')) throw new Error("MR v45: 3D alti raf kaydet bulunamadi.");

  const oldMrAccessoryPlacementV45 = 'const parts=page.querySelector(".mr-parts-panel");parts?.insertAdjacentHTML("beforeend",`<div class="mr-accessory-area"';
  const newMrAccessoryPlacementV45 = 'form.insertAdjacentHTML("afterend",`<div class="mr-accessory-area"';
  if (portal.includes(oldMrAccessoryPlacementV45)) portal = portal.replace(oldMrAccessoryPlacementV45, newMrAccessoryPlacementV45);
  else if (!portal.includes('form.insertAdjacentHTML("afterend",`<div class="mr-accessory-area"')) throw new Error("MR v45: aksesuar sol panel konumu bulunamadi.");

  const oldMrProfilePlacementV47 = 'if(traverseField)traverseField.insertAdjacentHTML("afterend",`<label class="mr-profile-field">Ayak tipi';
  const newMrProfilePlacementV47 = 'form.insertAdjacentHTML("beforeend",`<label class="mr-profile-field">Ayak tipi';
  if (portal.includes(oldMrProfilePlacementV47)) portal = portal.replace(oldMrProfilePlacementV47, newMrProfilePlacementV47);
  else if (!portal.includes(newMrProfilePlacementV47)) throw new Error("MR v47: ayak ve travers tipleri aksesuar ustune tasinamadi.");

  const oldMrInputSelectorV45 = '#mrModuleCount,#mrLevels,#mrSectionWidth,#mrDepth,#mrFirstTraverse,#mrLevelGap,#mrHeight,#mrDimensionScale,#mrShowLevelDims,#mrShowMarkers,#mrShowWidth,#mrShowDepth';
  const newMrInputSelectorV45 = '#mrModuleCount,#mrLevels,#mrSectionWidth,#mrDepth,#mrRowGap,#mrFirstTraverse,#mrLevelGap,#mrHeight,#mrDimensionScale,#mrShowLevelDims,#mrShowMarkers,#mrShowWidth,#mrShowDepth';
  if (portal.includes(oldMrInputSelectorV45)) portal = portal.replace(oldMrInputSelectorV45, newMrInputSelectorV45);
  else if (!portal.includes('#mrDepth,#mrRowGap,#mrFirstTraverse')) throw new Error("MR v45: sira araligi canli guncellemesi bulunamadi.");

  const oldMrChangeSelectorV45 = '#mrUprightFinish,#mrTraverseFinish,#mrTopTraverseMode,#mrUprightType,#mrTraverseType';
  const newMrChangeSelectorV45 = '#mrUprightFinish,#mrTraverseFinish,#mrTopTraverseMode,#mrUprightType,#mrTraverseType,#mrRowType';
  if (portal.includes(oldMrChangeSelectorV45)) portal = portal.replace(oldMrChangeSelectorV45, newMrChangeSelectorV45);
  else if (!portal.includes('#mrTraverseType,#mrRowType')) throw new Error("MR v45: sira secimi canli guncellemesi bulunamadi.");

  if (!portal.includes('data-rafex-mr-editor-v45')) {
    const headEnd = portal.lastIndexOf('</head>');
    if (headEnd < 0) throw new Error("MR v45: stil baglanti noktasi bulunamadi.");
    const mrEditorStyles = `<style data-rafex-mr-editor-v45>
      .mr-mode .mr-workspace{grid-template-columns:minmax(280px,330px) minmax(520px,1fr)}
      .mr-mode .mr-parts-panel{display:none!important}
      .mr-mode .mr-form{gap:11px}
      .mr-mode .mr-form input,.mr-mode .mr-form select{min-height:44px;padding:10px 11px;font-size:10px}
      .mr-mode .mr-profile-field small,.mr-mode .mr-row-field small{line-height:1.35}
      .mr-mode .mr-row-field{grid-column:1/-1}
      .mr-mode .mr-row-field{display:grid;gap:6px;font-size:9px;font-weight:850;color:#26352d}
      .mr-mode .mr-row-mode{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px;align-items:end}
      .mr-mode .mr-row-mode>label{grid-column:auto!important;min-width:0!important}
      .mr-mode .mr-row-gap-field{display:grid;gap:5px;font-size:8px;font-weight:850;color:#526158}
      .mr-mode .mr-row-mode input:disabled{opacity:.55;background:#edf1ee}
      .mr-mode label:has(#mrModuleCount){display:grid!important}
      .mr-mode .mr-accessory-area{margin:11px 0 0;padding:11px 0 0;border-top:1px solid #dce4df}
      .mr-mode .mr-accessory-launch{min-height:46px;font-size:11px;border-radius:9px}
      .mr-mode .mr-view-toolbar button{min-height:36px;padding:8px 12px;font-size:10px}
      .mr-mode .mr-view-card>.mr-rack-save{margin:0;padding:13px;border-top:1px solid #dce4df;background:#fff}
      .mr-mode .mr-rack-save>button{min-height:54px;border-radius:10px;font-size:15px;letter-spacing:.02em}
      .mr-mode .mr-rack-save>small{text-align:center;font-size:9px}
      .mr-mode .mr-block-list{grid-template-columns:repeat(6,minmax(0,1fr))}
      .mr-mode .mr-block-button{min-height:50px;padding:7px}
      .mr-mode .m2-saved-type-preview{width:auto;min-width:64px;min-height:42px;padding:0 10px;font-size:9px}
      .mr-mode .m2-saved-type-copy{min-width:72px;min-height:42px;padding:0 11px}
      .mr-mode .mr-measure-overlay .mr-distance-panel input:not([type=checkbox]){min-height:34px}
      .mr-mode .mr-accessory-note{font-size:10px;line-height:1.5}
      .mr-mode .m2-selected-pallet-total{display:none!important}
      .mr-mode .m2-wall-editor,.mr-mode .m2-edge-editor{grid-template-columns:repeat(auto-fit,minmax(145px,1fr))!important;gap:8px!important}
      .mr-mode .m2-wall-editor-title{grid-column:1/-1}
      .mr-mode .rafex-mr-gap-row{grid-column:1/-1;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;min-width:0}
      .mr-mode .rafex-mr-gap-field{min-width:0}
      .mr-mode .m2-edge-field{min-height:44px!important;padding:7px 8px!important;gap:6px!important;font-size:9px!important}
      .mr-mode .m2-edge-field input[type="number"]{width:100%!important;min-width:0!important;min-height:44px!important;height:44px!important;padding:10px 11px!important;font-size:10px!important}
      @media(max-width:1050px){.mr-mode .mr-workspace{grid-template-columns:1fr}.mr-mode .mr-block-list{grid-template-columns:repeat(4,minmax(0,1fr))}}
    </style>`;
    portal = portal.slice(0, headEnd) + mrEditorStyles + '\n' + portal.slice(headEnd);
  }

  const oldControlSelector = 'controls.querySelectorAll("input,button").forEach((element)=>element.disabled=!active);';
  const newControlSelector = 'controls.querySelectorAll("input,button:not(.rafex-extension-toggle)").forEach((element)=>element.disabled=!active);';
  if (portal.includes(oldControlSelector)) portal = portal.replace(oldControlSelector, newControlSelector);
  else if (!portal.includes(newControlSelector)) throw new Error("MR v42: uzatma kontrol secicisi bulunamadi.");

  // Serbest mesafe cizimi aktifken raf, duvar, raf-arasi ve kenar olcu
  // etiketleri olayi ele geciremez. Ilk ve ikinci nokta SVG'nin her yerinde,
  // bir rafin veya olcu yazisinin ustunde olsa bile cizime gider.
  const oldMeasurePriorityV46 = 'if(m2MultiSelect.active){m2MultiSelect.start=point;m2MultiSelect.hover=point;svg.setPointerCapture?.(event.pointerId);m2RenderLayout();return;}\n          if(m2CopyMode&&(rackNode||symbolNode))';
  const newMeasurePriorityV46 = 'if(m2MultiSelect.active){m2MultiSelect.start=point;m2MultiSelect.hover=point;svg.setPointerCapture?.(event.pointerId);m2RenderLayout();return;}\n          if(m2LayoutTool==="measure"){event.preventDefault();event.stopPropagation();m2FreeMeasure.points.push(point);m2FreeMeasure.hover=null;if(m2FreeMeasure.points.length>=2){m2LayoutTool=null;$("m2MeasureToolButton")?.classList.remove("active");const[a,b]=m2FreeMeasure.points;$("m2FloorStatus").textContent=`Ölçülen mesafe: ${fmt(Math.round(Math.hypot(b.x-a.x,b.y-a.y)/m2LayoutState.scale))} mm`;}else $("m2FloorStatus").textContent="Başlangıç seçildi; şimdi bitiş noktasına tıkla.";m2RenderLayout();return;}\n          if(m2CopyMode&&(rackNode||symbolNode))';
  if (portal.includes(oldMeasurePriorityV46)) portal = portal.replace(oldMeasurePriorityV46, newMeasurePriorityV46);
  else if (!portal.includes('if(m2LayoutTool==="measure"){event.preventDefault();event.stopPropagation();m2FreeMeasure.points.push(point)')) throw new Error("MR v46: mesafe cizim onceligi bulunamadi.");
  portal = portal.replaceAll("if(m2LayoutTool!=='dimension'){", "if(m2LayoutTool!=='dimension'&&m2LayoutTool!=='measure'){");
  portal = portal.replaceAll("if(m2LayoutTool!=='dimension')event.stopPropagation()", "if(m2LayoutTool!=='dimension'&&m2LayoutTool!=='measure')event.stopPropagation()");
  portal = portal.replaceAll("if(m2LayoutTool!=='dimension')m2PromptEdgeLength", "if(m2LayoutTool!=='dimension'&&m2LayoutTool!=='measure')m2PromptEdgeLength");

  // MR uzatma taslagi acikken mevcut olcu etiketleri olayi yutmaz. Tiklama
  // SVG'ye ulasir ve uzatma hedefi olarak islenir; olcu editoru acilmaz.
  portal = portal
    .replaceAll("event.stopPropagation();if(m2LayoutTool!=='dimension'&&m2LayoutTool!=='measure')", "if(m2AutoFillDraft?.rafexSystem==='mr')return;event.stopPropagation();if(m2LayoutTool!=='dimension'&&m2LayoutTool!=='measure')")
    .replaceAll("onpointerdown=\"if(m2LayoutTool!=='dimension'&&m2LayoutTool!=='measure')event.stopPropagation()\"", "onpointerdown=\"if(m2AutoFillDraft?.rafexSystem==='mr')return;if(m2LayoutTool!=='dimension'&&m2LayoutTool!=='measure')event.stopPropagation()\"")
    .replaceAll("onclick=\"event.stopPropagation();if(m2LayoutTool!=='dimension'&&m2LayoutTool!=='measure')", "onclick=\"if(m2AutoFillDraft?.rafexSystem==='mr')return;event.stopPropagation();if(m2LayoutTool!=='dimension'&&m2LayoutTool!=='measure')")
    .replaceAll("onclick=\"event.stopPropagation();m2PromptSymbolDistance(", "onclick=\"if(m2AutoFillDraft?.rafexSystem==='mr')return;event.stopPropagation();m2PromptSymbolDistance(")
    .replaceAll("onclick=\"event.stopPropagation();if(m2LayoutTool!=='dimension')m2PromptFreeMeasure(", "onclick=\"if(m2AutoFillDraft?.rafexSystem==='mr')return;event.stopPropagation();if(m2LayoutTool!=='dimension')m2PromptFreeMeasure(");
  const promptGuardPatternsV48 = [
    ['function m2PromptFreeMeasure(currentMm) {', 'function m2PromptFreeMeasure(currentMm) { if(m2AutoFillDraft?.rafexSystem==="mr")return;'],
    ['function m2PromptRackDistance(rackId, currentMm) {', 'function m2PromptRackDistance(rackId, currentMm) { if(m2AutoFillDraft?.rafexSystem==="mr")return;'],
    ['function m2PromptColumnDistance(rackId,currentMm){', 'function m2PromptColumnDistance(rackId,currentMm){if(m2AutoFillDraft?.rafexSystem==="mr")return;'],
    ['function m2PromptWallDistance(rackId, direction, currentMm) {', 'function m2PromptWallDistance(rackId, direction, currentMm) { if(m2AutoFillDraft?.rafexSystem==="mr")return;'],
    ['function m2PromptEdgeLength(index, currentMm) {', 'function m2PromptEdgeLength(index, currentMm) { if(m2AutoFillDraft?.rafexSystem==="mr")return;'],
    ['function m2PromptSymbolDistance(symbolId,key,currentMm){', 'function m2PromptSymbolDistance(symbolId,key,currentMm){if(m2AutoFillDraft?.rafexSystem==="mr")return;']
  ];
  promptGuardPatternsV48.forEach(([before,after])=>{if(portal.includes(before))portal=portal.replace(before,after);});
  if (!portal.includes('function m2PromptWallDistance(rackId, direction, currentMm) { if(m2AutoFillDraft?.rafexSystem==="mr")return;')) throw new Error("MR v48: uzatma olcu onceligi uygulanamadi.");

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

  // MR 3D motoru kayitli tek/cift sira verisini birebir kurar. Ayak boyu
  // da form, kayit, onizleme ve kesit ekranlarinda ayni 50 mm kuralini kullanir.
  const oldViewerPitchV45 = `    const topTraverse = firstTraverse + Math.max(0, levels - 1) * levelGap;`;
  const newViewerPitchV45 = `    const topTraverse = firstTraverse + Math.max(0, levels - 1) * (levelGap + traverseHeight);`;
  if (mrViewer.includes(oldViewerPitchV45)) mrViewer = mrViewer.replace(oldViewerPitchV45, newViewerPitchV45);
  else if (!mrViewer.includes('const topTraverse = firstTraverse + Math.max(0, levels - 1) * levelPitch')&&!mrViewer.includes('const topTraverse = firstTraverse + Math.max(0, levels - 1) * (levelGap + traverseHeight)')) throw new Error("MR v45: viewer net kat araligi bulunamadi.");

  const oldViewerDepthV45 = `      depth: bounded(config.depth, 800, 300, 2500),`;
  const newViewerDepthV45 = `      depth: bounded(config.depth, 800, 300, 2500),
      rowCount: Math.round(bounded(config.rowCount, 1, 1, 2)),
      rowGap: bounded(config.rowGap, 200, 0, 2000),`;
  if (mrViewer.includes(oldViewerDepthV45)) mrViewer = mrViewer.replace(oldViewerDepthV45, newViewerDepthV45);
  else if (!mrViewer.includes('rowCount: Math.round(bounded(config.rowCount, 1, 1, 2))')) throw new Error("MR v45: viewer sira konfigurasyonu bulunamadi.");

  const oldViewerUprightV45 = `    const uprightHeight = Number.isFinite(requestedUprightHeight)
      ? Math.max(topTraverse + traverseHeight, requestedUprightHeight)
      : automaticUprightHeight;`;
  const newViewerUprightV45 = `    const rawUprightHeight = Number.isFinite(requestedUprightHeight)
      ? Math.max(topTraverse + traverseHeight, requestedUprightHeight)
      : automaticUprightHeight;
    const uprightHeight = Math.ceil(rawUprightHeight / 50) * 50;`;
  if (mrViewer.includes(oldViewerUprightV45)) mrViewer = mrViewer.replace(oldViewerUprightV45, newViewerUprightV45);
  else if (!mrViewer.includes('const uprightHeight = Math.ceil(rawUprightHeight / 50) * 50')) throw new Error("MR v45: viewer 50 mm ayak kurali bulunamadi.");

  const oldViewerScaleV45 = `      dimensionScale: bounded(config.dimensionScale, 1, .7, 1.5),`;
  const newViewerScaleV45 = `      dimensionScale: bounded(config.dimensionScale, 2, .7, 3),`;
  if (mrViewer.includes(oldViewerScaleV45)) mrViewer = mrViewer.replace(oldViewerScaleV45, newViewerScaleV45);
  else if (!mrViewer.includes('dimensionScale: bounded(config.dimensionScale, 2, .7, 3)')) throw new Error("MR v45: viewer olcu yazi olcegi bulunamadi.");

  // Ayak boyu kalır; son travers ile ayak ucu arasındaki üst yarım kat için
  // ayrı bir ölçü çizgisi 3D'de ve 3D yakalayan PDF çıktısında gösterilmez.
  mrViewer = mrViewer.replace(/\s*const topTraverse = levelYs\.at\(-1\) \|\| 0;\s*const topTraverseTop = topTraverse \+ this\.config\.traverseHeight;\s*this\.addVerticalDimension\(layer, totalWidth\+280, z, topTraverseTop, uprightHeight, `ÜST YARIM KAT · \$\{this\.dimensionValue\(uprightHeight-topTraverseTop\)\}`, totalWidth, "uprightHeight"\);/u, "");
  if (mrViewer.includes("ÜST YARIM KAT")) throw new Error("MR v47: 3D ust yarim kat olcusu kaldirilamadi.");

  const oldUprightLabelV48 = 'this.addDimensionLabel(layer, totalWidth+510, uprightHeight, z, `AYAK BOYU · ${this.dimensionValue(uprightHeight)}`, 760, "uprightHeight");';
  const newUprightLabelV48 = 'this.addDimensionLabel(layer, x-420, uprightHeight, z, `AYAK BOYU · ${this.dimensionValue(uprightHeight)}`, 760, "uprightHeight");';
  if (mrViewer.includes(oldUprightLabelV48)) mrViewer = mrViewer.replace(oldUprightLabelV48, newUprightLabelV48);
  else if (!mrViewer.includes(newUprightLabelV48)) throw new Error("MR v48: ayak boyu etiketi sol tarafa tasinamadi.");

  // MR ayak GLB'sinde KP kodlu yatay ve capraz profiller ile baglanti
  // elemanlari galvanizdir; yalniz MRD kodlu dikmeler secilen ayak rengini alir.
  const oldViewerFinishV46 = `    if (finishKey !== "default") applyFinish(object, finishKey);
    return { object, size: template.size.clone() };`;
  const newViewerFinishV46 = `    if (finishKey !== "default") applyFinish(object, finishKey);
    if (kind === "upright") object.traverse((part) => {
      let node = part, partLabel = "";
      while (node) { partLabel += " " + String(node.name || ""); node = node.parent; }
      if (!part.isMesh || !part.material || !/\\b(?:KP|MRAS)\\d|hex (?:nut|screw)/i.test(partLabel)) return;
      const galvanized = FINISHES.pgv, sourceMaterials = Array.isArray(part.material) ? part.material : [part.material];
      const materials = sourceMaterials.map((source) => { const material = source.clone(); if (material.color) material.color.setHex(galvanized.color); if ("metalness" in material) material.metalness = galvanized.metalness; if ("roughness" in material) material.roughness = galvanized.roughness; material.needsUpdate = true; return material; });
      part.material = Array.isArray(part.material) ? materials : materials[0];
    });
    return { object, size: template.size.clone() };`;
  if (mrViewer.includes(oldViewerFinishV46)) mrViewer = mrViewer.replace(oldViewerFinishV46, newViewerFinishV46);
  else if (!mrViewer.includes('if (kind === "upright") object.traverse')) throw new Error("MR v46: galvaniz diagonal renklendirmesi bulunamadi.");

  // Yuklenen ayak sablonundaki malzeme daha sonra instance clone edilirken
  // secili ayak rengiyle yeniden ezilebiliyor. Galvanizi son sahne kopyasinda
  // da uygula; MRD dikmeler secilen renkte, KP/MRAS ve baglantilar galvanizdir.
  if (!mrViewer.includes("__rafexMrFinalInstanceGalvanizeV49")) {
    const boundedAnchorV49 = `function bounded(value, fallback, min, max) { return Math.min(max, Math.max(min, Number(value) || fallback)); }`;
    const galvanizedHelperV49 = `function applyGalvanizedUprightMembersV49(object) {
  // __rafexMrFinalInstanceGalvanizeV49
  if (!object) return object;
  object.traverse((part) => {
    let node = part, partLabel = "";
    while (node) { partLabel += " " + String(node.name || ""); node = node.parent; }
    if (!part.isMesh || !part.material || !/\\b(?:KP|MRAS)\\d|hex (?:nut|screw)/i.test(partLabel)) return;
    const galvanized = FINISHES.pgv;
    const sources = Array.isArray(part.material) ? part.material : [part.material];
    const materials = sources.map((source) => {
      const material = source.clone();
      if (material.color) material.color.setHex(galvanized.color);
      if ("metalness" in material) material.metalness = galvanized.metalness;
      if ("roughness" in material) material.roughness = galvanized.roughness;
      material.needsUpdate = true;
      return material;
    });
    part.material = Array.isArray(part.material) ? materials : materials[0];
  });
  return object;
}

${boundedAnchorV49}`;
    if (!mrViewer.includes(boundedAnchorV49)) throw new Error("MR v49: instance galvaniz yardimci baglanti noktasi bulunamadi.");
    mrViewer = mrViewer.replace(boundedAnchorV49, galvanizedHelperV49);
  }

  const oldMrGroundV46 = `new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.92, metalness: 0 })`;
  const newMrGroundV46 = `new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, metalness: 0 })`;
  if (mrViewer.includes(oldMrGroundV46)) mrViewer = mrViewer.replace(oldMrGroundV46, newMrGroundV46);
  else if (!mrViewer.includes(newMrGroundV46)) throw new Error("MR v46: PDF zemin malzemesi bulunamadi.");
  mrViewer = mrViewer.replace('this.ground.position.y = -3;', 'this.ground.position.y = -12;');
  const oldMrGridV48 = `    this.grid.material.opacity = 0.5;
    this.grid.material.transparent = true;
    this.grid.position.y = 1;
    this.scene.add(this.grid);`;
  const newMrGridV48 = `    this.grid.material.opacity = 0;
    this.grid.material.transparent = true;
    this.grid.visible = false;
    this.grid.position.y = 1;
    this.scene.add(this.grid);`;
  if (mrViewer.includes(oldMrGridV48)) mrViewer = mrViewer.replace(oldMrGridV48, newMrGridV48);
  else if (!mrViewer.includes('this.grid.visible = false;')) throw new Error("MR v48: B2B ile ayni gridsiz zemin uygulanamadi.");

  const oldMrSetViewEndV48 = `    this.controls.update();
  }
  setAutoRotate(enabled) { this.controls.autoRotate = Boolean(enabled); this.controls.autoRotateSpeed = 0.75; }`;
  const newMrSetViewEndV48 = `    this.controls.update();
  }
  setCameraAngles(azimuth = 41, elevation = 24) {
    const target = this.controls.target.clone();
    const radius = Math.max(this.camera.position.distanceTo(target), 1000);
    const theta = THREE.MathUtils.degToRad(Number(azimuth) || 0);
    const phi = THREE.MathUtils.degToRad(Math.max(-80, Math.min(80, Number(elevation) || 0)));
    this.camera.position.set(target.x + radius * Math.cos(phi) * Math.sin(theta), target.y + radius * Math.sin(phi), target.z + radius * Math.cos(phi) * Math.cos(theta));
    this.controls.update();
  }
  setAutoRotate(enabled) { this.controls.autoRotate = Boolean(enabled); this.controls.autoRotateSpeed = 0.75; }`;
  if (mrViewer.includes(oldMrSetViewEndV48)) mrViewer = mrViewer.replace(oldMrSetViewEndV48, newMrSetViewEndV48);
  else if (!mrViewer.includes('setCameraAngles(azimuth = 41, elevation = 24)')) throw new Error("MR v48: kesit kamera aci kontrolu eklenemedi.");

  const oldMrViewerApiV48 = 'setView(view) { active?.setView(view); },\n  setAutoRotate(enabled)';
  const newMrViewerApiV48 = 'setView(view) { active?.setView(view); },\n  setCameraAngles(azimuth, elevation) { active?.setCameraAngles(azimuth, elevation); },\n  setAutoRotate(enabled)';
  if (mrViewer.includes(oldMrViewerApiV48)) mrViewer = mrViewer.replace(oldMrViewerApiV48, newMrViewerApiV48);
  else if (!mrViewer.includes('setCameraAngles(azimuth, elevation) { active?.setCameraAngles')) throw new Error("MR v48: MR viewer kamera API eklenemedi.");

  const oldViewerBuildHeadV45 = `      const { modules, levels, width, depth, firstTraverse, levelGap, uprightHeight, uprightWidth, traverseHeight } = this.config;
      const levelYs = Array.from({ length: levels }, (_, index) => firstTraverse + index * (levelGap + traverseHeight));
      const framePitch = width + uprightWidth;
      const totalWidth = modules * width + (modules + 1) * uprightWidth;
      const uprightScale = new THREE.Vector3(uprightWidth / upright.size.x, uprightHeight / upright.size.y, depth / upright.size.z);
      for (let frame = 0; frame <= modules; frame += 1) {
        const instance = upright.object.clone(true);
        instance.scale.copy(uprightScale);
        instance.position.x = frame * framePitch;
        this.root.add(instance);
      }`;
  const newViewerBuildHeadV45 = `      const { modules, levels, width, depth, rowCount, rowGap, firstTraverse, levelGap, uprightHeight, uprightWidth, traverseHeight } = this.config;
      const levelYs = Array.from({ length: levels }, (_, index) => firstTraverse + index * (levelGap + traverseHeight));
      const framePitch = width + uprightWidth;
      const totalWidth = modules * width + (modules + 1) * uprightWidth;
      const footprintDepth = rowCount * depth + Math.max(0, rowCount - 1) * rowGap;
      const uprightScale = new THREE.Vector3(uprightWidth / upright.size.x, uprightHeight / upright.size.y, depth / upright.size.z);
      for (let row = 0; row < rowCount; row += 1) {
        const rowZ = row * (depth + rowGap);
        for (let frame = 0; frame <= modules; frame += 1) {
          const instance = upright.object.clone(true);
          applyGalvanizedUprightMembersV49(instance);
          instance.scale.copy(uprightScale);
          instance.position.set(frame * framePitch, 0, rowZ);
          this.root.add(instance);
        }
      }`;
  if (mrViewer.includes(oldViewerBuildHeadV45)) mrViewer = mrViewer.replace(oldViewerBuildHeadV45, newViewerBuildHeadV45);
  else if (!mrViewer.includes('const footprintDepth = rowCount * depth')) throw new Error("MR v45: viewer cift sira ayak kurulumu bulunamadi.");

  const oldViewerModulesV45 = `      for (let module = 0; module < modules; module += 1) {
        const moduleX = module * framePitch + uprightWidth;
        for (let level = 1; level <= levels; level += 1) {
          const levelY = levelYs[level - 1];
          for (const side of ["front", "back"]) {
            const beam = traverse.object.clone(true);
            // Extend the ZS traverse to the upright centre lines so the GLB end
            // brackets engage the MR60 posts instead of stopping in the clear bay.
            const beamOverlap = uprightWidth / 2;
            beam.scale.set((width + beamOverlap * 2) / traverse.size.x, traverseHeight / traverse.size.y, 1);
            // 773a baseline follow-up: ZS travers end brackets must mount to the
            // MR Ayak Toplama GLB in the same handed orientation on both sides.
            // The beam reaches the centre of each 60 mm upright (30 mm engagement per side).
            if (side === "front") {
              beam.position.set(moduleX - beamOverlap, levelY, 0);
            } else {
              beam.rotation.y = Math.PI;
              beam.position.set(moduleX + width + beamOverlap, levelY, depth);
            }
            this.root.add(beam);
          }
          trayAccessories.filter((item) => item.levels.includes(level)).forEach((accessory) => {
            let cursor = 0;
            this.trayPiecePlan(width, accessory.width).forEach((pieceWidth) => {
              const shelf = tray.object.clone(true);
              // Leave 10 mm clearance at the front and back and lift the tray 10 mm.
              const trayDepth = Math.max(1, depth - 20);
              shelf.scale.set(pieceWidth / tray.size.x, 1, trayDepth / tray.size.z);
              shelf.rotation.x = Math.PI;
              shelf.position.set(moduleX + cursor, levelY + traverseHeight + tray.size.y - 40, depth - 10);
              this.root.add(shelf);
              cursor += pieceWidth;
            });
          });
        }
      }`;
  const newViewerModulesV45 = `      for (let row = 0; row < rowCount; row += 1) {
        const rowZ = row * (depth + rowGap);
        for (let module = 0; module < modules; module += 1) {
          const moduleX = module * framePitch + uprightWidth;
          for (let level = 1; level <= levels; level += 1) {
            const levelY = levelYs[level - 1];
            for (const side of ["front", "back"]) {
              const beam = traverse.object.clone(true);
              const beamOverlap = uprightWidth / 2;
              beam.scale.set((width + beamOverlap * 2) / traverse.size.x, traverseHeight / traverse.size.y, 1);
              if (side === "front") {
                beam.position.set(moduleX - beamOverlap, levelY, rowZ);
              } else {
                beam.rotation.y = Math.PI;
                beam.position.set(moduleX + width + beamOverlap, levelY, rowZ + depth);
              }
              this.root.add(beam);
            }
            trayAccessories.filter((item) => item.levels.includes(level)).forEach((accessory) => {
              let cursor = 0;
              this.trayPiecePlan(width, accessory.width).forEach((pieceWidth) => {
                const shelf = tray.object.clone(true);
                const trayDepth = Math.max(1, depth - 20);
                shelf.scale.set(pieceWidth / tray.size.x, 1, trayDepth / tray.size.z);
                shelf.rotation.x = Math.PI;
                shelf.position.set(moduleX + cursor, levelY + traverseHeight + tray.size.y - 40, rowZ + depth - 10);
                this.root.add(shelf);
                cursor += pieceWidth;
              });
            });
          }
        }
      }`;
  if (mrViewer.includes(oldViewerModulesV45)) mrViewer = mrViewer.replace(oldViewerModulesV45, newViewerModulesV45);
  else if (!mrViewer.includes('for (let row = 0; row < rowCount; row += 1)')) throw new Error("MR v45: viewer cift sira govde kurulumu bulunamadi.");

  // 773a ve tava-bosluk yamalarindan sonra govde blogunun metni degisebilir.
  // Ayak dongusunun varligi, travers/tava dongusunun de cift sirali oldugunu
  // kanitlamaz; tum govde bolgesini sira ofsetiyle kesin olarak yeniden kur.
  const bodyStartV46 = mrViewer.indexOf('      const beamDepth = Math.max(1, traverse.size.z);');
  const bodyEndV46 = mrViewer.indexOf('      this.root.updateMatrixWorld(true);', bodyStartV46);
  if (bodyStartV46 < 0 || bodyEndV46 < 0) throw new Error("MR v46: viewer govde montaj bolgesi bulunamadi.");
  const bodyRegionV46 = mrViewer.slice(bodyStartV46, bodyEndV46);
  if (!bodyRegionV46.includes('rowZ + depth - 10')) {
    const doubleRowBodyV46 = `      const beamDepth = Math.max(1, traverse.size.z);
      const trayAccessories = this.config.accessories.filter((item) => item.type === "tray");
      for (let row = 0; row < rowCount; row += 1) {
        const rowZ = row * (depth + rowGap);
        for (let module = 0; module < modules; module += 1) {
          const moduleX = module * framePitch + uprightWidth;
          for (let level = 1; level <= levels; level += 1) {
            const levelY = levelYs[level - 1];
            for (const side of ["front", "back"]) {
              const beam = traverse.object.clone(true);
              const beamOverlap = uprightWidth / 2;
              beam.scale.set((width + beamOverlap * 2) / traverse.size.x, traverseHeight / traverse.size.y, 1);
              if (side === "front") {
                beam.position.set(moduleX - beamOverlap, levelY, rowZ);
              } else {
                beam.rotation.y = Math.PI;
                beam.position.set(moduleX + width + beamOverlap, levelY, rowZ + depth);
              }
              this.root.add(beam);
            }
            trayAccessories.filter((item) => item.levels.includes(level)).forEach((accessory) => {
              let cursor = 0;
              this.trayPiecePlan(width, accessory.width).forEach((pieceWidth) => {
                const shelf = tray.object.clone(true);
                const trayDepth = Math.max(1, depth - 25);
                shelf.scale.set(pieceWidth / tray.size.x, 1, trayDepth / tray.size.z);
                shelf.rotation.x = Math.PI;
                shelf.position.set(moduleX + cursor, levelY + traverseHeight + tray.size.y - 40, rowZ + depth - 10);
                this.root.add(shelf);
                cursor += pieceWidth;
              });
            });
          }
        }
      }
`;
    mrViewer = mrViewer.slice(0, bodyStartV46) + doubleRowBodyV46 + mrViewer.slice(bodyEndV46);
  }

  const oldViewerDimensionsV45 = `      this.addDimensions(levelYs, totalWidth, depth, uprightHeight);`;
  const newViewerDimensionsV45 = `      this.addDimensions(levelYs, totalWidth, footprintDepth, uprightHeight);`;
  if (mrViewer.includes(oldViewerDimensionsV45)) mrViewer = mrViewer.replace(oldViewerDimensionsV45, newViewerDimensionsV45);
  else if (!mrViewer.includes('this.addDimensions(levelYs, totalWidth, footprintDepth, uprightHeight)')) throw new Error("MR v45: viewer cift sira derinlik olcusu bulunamadi.");

  if (!mrViewer.includes('K${index} → K${index+1} NET')) throw new Error("MR v45: viewer net kat olcusu bulunamadi.");
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
    const azimuth = Number(settings.azimuth), elevation = Number(settings.elevation);
    viewer.setCameraAngles(Number.isFinite(azimuth) ? azimuth : 41, Number.isFinite(elevation) ? elevation : 24);
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
  }

  // MR genislik olcusu toplam diziyi degil yalniz ilk modulun net bolumunu
  // gosterir. Duzenleme anahtari ayni kalir ve mrSectionWidth alanini acmaya
  // devam eder.
  if (!mrViewer.includes("__rafexMrSingleSectionWidthV52")) {
    const widthDimensionV52 = `      const y = -90, left = new THREE.Vector3(0,y,z+220), right = new THREE.Vector3(totalWidth,y,z+220);
      this.addDimensionLine(layer,[left,right]);this.addDimensionLine(layer,[left,new THREE.Vector3(0,0,z)]);this.addDimensionLine(layer,[right,new THREE.Vector3(totalWidth,0,z)]);this.addDimensionPoint(layer,left);this.addDimensionPoint(layer,right);this.addDimensionLabel(layer,totalWidth/2,y,z+220,\`TOPLAM GENİŞLİK · \${this.dimensionValue(totalWidth)}\`,900,"width");`;
    const singleWidthDimensionV52 = `      // __rafexMrSingleSectionWidthV52
      const y = -90, sectionWidth = this.config.width, sectionLeft = this.config.uprightWidth, sectionRight = sectionLeft + sectionWidth, left = new THREE.Vector3(sectionLeft,y,z+220), right = new THREE.Vector3(sectionRight,y,z+220);
      this.addDimensionLine(layer,[left,right]);this.addDimensionLine(layer,[left,new THREE.Vector3(sectionLeft,0,z)]);this.addDimensionLine(layer,[right,new THREE.Vector3(sectionRight,0,z)]);this.addDimensionPoint(layer,left);this.addDimensionPoint(layer,right);this.addDimensionLabel(layer,(sectionLeft+sectionRight)/2,y,z+220,\`GENİŞLİK · \${this.dimensionValue(sectionWidth)}\`,760,"width");`;
    if (!mrViewer.includes(widthDimensionV52)) throw new Error("MR v52: toplam genislik olcu blogu bulunamadi.");
    mrViewer = mrViewer.replace(widthDimensionV52, singleWidthDimensionV52);
  }
  for (const required of ['rowCount: Math.round(bounded(config.rowCount, 1, 1, 2))', 'dimensionScale: bounded(config.dimensionScale, 2, .7, 3)', 'const uprightHeight = Math.ceil(rawUprightHeight / 50) * 50', 'const footprintDepth = rowCount * depth', 'firstTraverse + index * (levelGap + traverseHeight)', 'rowZ + depth - 10', 'K${index} → K${index+1} NET', 'this.addDimensions(levelYs, totalWidth, footprintDepth, uprightHeight)', '__rafexMrDetachedPerspectiveCaptureV38', '__rafexMrSingleSectionWidthV52', '`GENİŞLİK · ${this.dimensionValue(sectionWidth)}`']) {
    if (!mrViewer.includes(required)) throw new Error(`MR v45 viewer kaynak dogrulama hatasi: ${required}`);
  }
  fs.writeFileSync(mrViewerPath, mrViewer);

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
    const mrOptions = mr ? window.rafexMrConfigFromRackV37?.(seed?.drawing) : null;
    const options = mr ? (mrOptions ? { ...mrOptions, dimensions:{ ...(mrOptions.dimensions || {}), ...settings.dimensions } } : null) : optionsForType(type, settings);
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

  // Kesit Yer Belirleme'de MR kendi modul/kat verisini kayittan kullanir.
  // Bu nedenle B2B'ye ait 4-3-2-1 ve palet secenekleri MR seciliyken gizlenir.
  if (!positioner.includes("__rafexMrSectionControlsV46")) {
    const controlsAnchorV46 = `    const value = ensureSetting(activeKey);
    document.querySelectorAll("[data-rafex-count]")`;
    const controlsReplacementV46 = `    const value = ensureSetting(activeKey);
    // __rafexMrSectionControlsV46
    const modal = document.getElementById("m2SectionPlacementModal"), mr = type?.system === "mr" || isMrDrawing(type?.entries?.values?.().next?.().value?.drawing);
    modal?.classList.toggle("is-mr", Boolean(mr));
    if (mr) value.showPallets = false;
    document.querySelectorAll("[data-rafex-count]")`;
    if (!positioner.includes(controlsAnchorV46)) throw new Error("MR v46: kesit kontrol baglanti noktasi bulunamadi.");
    positioner = positioner.replace(controlsAnchorV46, controlsReplacementV46);
    positioner = positioner.replace('perspektif, ölçüler, palet görünümü ve modül dağılımını ayrı ayrı kaydet.', 'perspektif ve ölçü görünümünü raf tipine göre ayrı ayrı kaydet.');
    positioner = positioner.replace('      @media(max-width:820px){.rafex-section-editor-shell{grid-template-columns:1fr}', '      .rafex-section-placement-modal.is-mr .rafex-module-selector,.rafex-section-placement-modal.is-mr .rafex-option-row:has([data-rafex-pallets]){display:none!important}\n      @media(max-width:820px){.rafex-section-editor-shell{grid-template-columns:1fr}');
    fs.writeFileSync(sectionPositionerPath, positioner);
  }

  // MR'de 4-3-2-1 modul satiri gizli kalirken mevcut bos toolbar alani aci
  // bilgisini gosterir. B2B'nin markup ve kontrolleri aynen korunur.
  if (!positioner.includes("__rafexMrSectionWorkingControlsV48")) {
    positioner = positioner.replace(
      '.rafex-section-placement-modal.is-mr .rafex-module-selector,.rafex-section-placement-modal.is-mr .rafex-option-row:has([data-rafex-pallets]){display:none!important}',
      '.rafex-section-placement-modal.is-mr .rafex-placement-controls>span:nth-of-type(2){color:#68736c;font-size:9px;font-weight:850}.rafex-section-placement-modal.is-mr .rafex-module-selector,.rafex-section-placement-modal.is-mr .rafex-option-row:has([data-rafex-pallets]){display:none!important}'
    );
    positioner = positioner.replace(
      'if (mr) value.showPallets = false;',
      'if (mr) value.showPallets = false;\n    const mrAngles = modal?.querySelector(".rafex-placement-controls>span:nth-of-type(2)");\n    if (mrAngles) mrAngles.textContent = mr ? `${Math.round(value.azimuth)}° / ${Math.round(value.elevation)}°` : ""; // __rafexMrSectionWorkingControlsV48'
    );
    for (const required of ["__rafexMrSectionWorkingControlsV48", "mrAngles.textContent", "mrOptions.dimensions"]) {
      if (!positioner.includes(required)) throw new Error(`MR v48 kesit kontrol dogrulama hatasi: ${required}`);
    }
    fs.writeFileSync(sectionPositionerPath, positioner);
  }

  // MR kesit ekraninda ilk olcu yazi boyu 3D ile aynidir. Metin olcegi raf
  // tipine gore saklanir; On görünüm ve Sığdır (perspektif) birbirinden nettir.
  if (!positioner.includes("__rafexMrSectionViewAndTextV49")) {
    const cloneViewAnchorV49 = `      elevation: clamp(number(value.elevation, defaults.elevation), -35, 75),
      counts: Array.isArray(value.counts)`;
    const cloneViewReplacementV49 = `      elevation: clamp(number(value.elevation, defaults.elevation), -35, 75),
      dimensionScale: clamp(number(value.dimensionScale, number(defaults.dimensionScale, 2)), .7, 3),
      counts: Array.isArray(value.counts)`;
    if (!positioner.includes(cloneViewAnchorV49)) throw new Error("MR v49: kesit yazi olcegi ayar noktasi bulunamadi.");
    positioner = positioner.replace(cloneViewAnchorV49, cloneViewReplacementV49);

    const defaultsForAnchorV49 = `    return cloneView({ ...DEFAULT_VIEW, counts: type?.existingCounts?.length ? type.existingCounts : [3] });`;
    const defaultsForReplacementV49 = `    const seed = type?.entries?.values?.().next?.().value, mrScale = type?.system === "mr" ? number(window.rafexMrConfigFromRackV37?.(seed?.drawing)?.dimensionScale, 2) : 2;
    return cloneView({ ...DEFAULT_VIEW, dimensionScale:mrScale, counts: type?.existingCounts?.length ? type.existingCounts : [3] });`;
    if (!positioner.includes(defaultsForAnchorV49)) throw new Error("MR v49: kesit varsayilan 3D yazi olcegi bulunamadi.");
    positioner = positioner.replace(defaultsForAnchorV49, defaultsForReplacementV49);

    const mrOptionsAnchorV49 = `const options = mr ? (mrOptions ? { ...mrOptions, dimensions:{ ...(mrOptions.dimensions || {}), ...settings.dimensions } } : null) : optionsForType(type, settings);`;
    const mrOptionsReplacementV49 = `const options = mr ? (mrOptions ? { ...mrOptions, dimensions:{ ...(mrOptions.dimensions || {}), ...settings.dimensions }, dimensionScale:settings.dimensionScale } : null) : optionsForType(type, settings);`;
    if (!positioner.includes(mrOptionsAnchorV49)) throw new Error("MR v49: kesit MR olcu olcegi aktarimi bulunamadi.");
    positioner = positioner.replace(mrOptionsAnchorV49, mrOptionsReplacementV49);

    const toolbarAnchorV49 = `<button type="button" data-rafex-fit>Sığdır</button><span></span><button type="button" data-rafex-rotate-left`;
    const toolbarReplacementV49 = `<button type="button" data-rafex-fit>Sığdır</button><button type="button" data-rafex-front>Önden</button><span></span><button type="button" data-rafex-rotate-left`;
    if (!positioner.includes(toolbarAnchorV49)) throw new Error("MR v49: kesit görünüm dugmesi baglanti noktasi bulunamadi.");
    positioner = positioner.replace(toolbarAnchorV49, toolbarReplacementV49);

    const dimensionRowEndV49 = `</label><button type="button" data-rafex-dim-all>Hepsini Göster</button><button type="button" data-rafex-dim-none>Hepsini Gizle</button></div>`;
    const dimensionRowReplacementV49 = `${dimensionRowEndV49}<div class="rafex-option-row rafex-mr-text-scale"><strong>YAZI BÜYÜKLÜĞÜ</strong><button type="button" data-rafex-text-smaller aria-label="Kesit ölçü yazısını küçült">−</button><span data-rafex-text-scale>200%</span><button type="button" data-rafex-text-larger aria-label="Kesit ölçü yazısını büyüt">+</button></div>`;
    if (!positioner.includes(dimensionRowEndV49)) throw new Error("MR v49: kesit yazi kontrol satiri bulunamadi.");
    positioner = positioner.replace(dimensionRowEndV49, dimensionRowReplacementV49);

    const fitListenerV49 = `    modal.querySelector("[data-rafex-fit]")?.addEventListener("click", fitCurrent);`;
    const fitListenerReplacementV49 = `${fitListenerV49}
    modal.querySelector("[data-rafex-front]")?.addEventListener("click", frontCurrentV49);
    modal.querySelector("[data-rafex-text-smaller]")?.addEventListener("click", () => changeDimensionScaleV49(-.2));
    modal.querySelector("[data-rafex-text-larger]")?.addEventListener("click", () => changeDimensionScaleV49(.2));`;
    if (!positioner.includes(fitListenerV49)) throw new Error("MR v49: kesit kontrol olaylari bulunamadi.");
    positioner = positioner.replace(fitListenerV49, fitListenerReplacementV49);

    const fitFunctionV49 = `  function fitCurrent() {
    if (!activeKey) return;`;
    const newViewFunctionsV49 = `  // __rafexMrSectionViewAndTextV49
  function frontCurrentV49() {
    if (!activeKey) return;
    const value = ensureSetting(activeKey);
    value.azimuth = 0; value.elevation = 0;
    updateArtwork();
    schedulePreview(true, 80);
  }

  function changeDimensionScaleV49(delta) {
    if (!activeKey) return;
    const value = ensureSetting(activeKey);
    value.dimensionScale = clamp(Math.round((value.dimensionScale + delta) * 10) / 10, .7, 3);
    previewCache.delete(activeKey);
    updateArtwork();
    schedulePreview(true, 80);
  }

${fitFunctionV49}`;
    if (!positioner.includes(fitFunctionV49)) throw new Error("MR v49: Sığdır görünüm fonksiyonu bulunamadi.");
    positioner = positioner.replace(fitFunctionV49, newViewFunctionsV49);

    const renderControlsEndV49 = `      pallet.textContent = value.showPallets ? "Paletleri Gizle" : "Paletleri Göster";
    }
  }`;
    const renderControlsReplacementV49 = `      pallet.textContent = value.showPallets ? "Paletleri Gizle" : "Paletleri Göster";
    }
    const textScale = document.querySelector("[data-rafex-text-scale]");
    if (textScale) textScale.textContent = \`${'${'}Math.round(value.dimensionScale * 100)}%\`;
  }`;
    if (!positioner.includes(renderControlsEndV49)) throw new Error("MR v49: kesit yazi degeri görünümü bulunamadi.");
    positioner = positioner.replace(renderControlsEndV49, renderControlsReplacementV49);

    const mrStyleAnchorV49 = `.rafex-section-placement-modal.is-mr .rafex-placement-controls>span:nth-of-type(2){color:#68736c;font-size:9px;font-weight:850}`;
    const mrStyleReplacementV49 = `.rafex-section-placement-modal .rafex-mr-text-scale{display:none}.rafex-section-placement-modal.is-mr .rafex-mr-text-scale{display:flex}.rafex-section-placement-modal.is-mr .rafex-mr-text-scale span{min-width:48px;text-align:center;font-size:10px;font-weight:900;color:#173c2d}.rafex-section-placement-modal.is-mr .rafex-placement-controls{grid-template-columns:auto 32px 58px 32px auto auto 1fr auto auto auto auto}.rafex-section-placement-modal.is-mr .rafex-placement-controls>span:nth-of-type(2){color:#68736c;font-size:9px;font-weight:850}`;
    if (!positioner.includes(mrStyleAnchorV49)) throw new Error("MR v49: kesit MR kontrol stili bulunamadi.");
    positioner = positioner.replace(mrStyleAnchorV49, mrStyleReplacementV49);
    fs.writeFileSync(sectionPositionerPath, positioner);
  }

  // MR Kesit Yer Belirleme her acildiginda temel 41/24 perspektifiyle baslar.
  // Yalnizca acik editor taslagi degisir; kayitli B2B gorunumleri etkilenmez.
  if (!positioner.includes("__rafexMrInitialPerspectiveV50")) {
    const prepareEditorAnchorV50 = `    if (activeKey) ensureSetting(activeKey);
    renderSectionList();`;
    const prepareEditorReplacementV50 = `    if (activeKey) {
      const openingView = ensureSetting(activeKey);
      const activeType = sections.find((item) => item.key === activeKey);
      if (activeType?.system === "mr") {
        openingView.azimuth = 41;
        openingView.elevation = 24;
        previewCache.delete(activeKey);
      } // __rafexMrInitialPerspectiveV50
    }
    renderSectionList();`;
    if (!positioner.includes(prepareEditorAnchorV50)) throw new Error("MR v50: kesit acilis perspektifi baglanti noktasi bulunamadi.");
    positioner = positioner.replace(prepareEditorAnchorV50, prepareEditorReplacementV50);
    for (const required of ["__rafexMrInitialPerspectiveV50", "openingView.azimuth = 41", "openingView.elevation = 24", 'activeType?.system === "mr"']) {
      if (!positioner.includes(required)) throw new Error(`MR v50 kesit acilis perspektifi dogrulama hatasi: ${required}`);
    }
    fs.writeFileSync(sectionPositionerPath, positioner);
  }

  // MR kesit metin olcegi, onceki goruntu halen uretiliyorsa son tiklamayi
  // kaybetmez. Sigdir da MR icin her zaman taze 41/24 perspektifi uretir.
  if (!positioner.includes("__rafexMrSectionLiveControlsV51")) {
    const pendingAnchorV51 = `    if (previewPending.has(key)) return previewPending.get(key);`;
    const pendingReplacementV51 = `    if (previewPending.has(key)) {
      const pending = previewPending.get(key);
      if (!force) return pending;
      try { await pending; } catch {}
    } // __rafexMrSectionLiveControlsV51`;
    if (!positioner.includes(pendingAnchorV51)) throw new Error("MR v51: kesit render kuyrugu baglanti noktasi bulunamadi.");
    positioner = positioner.replace(pendingAnchorV51, pendingReplacementV51);

    const fitAnchorV51 = `    value.x = 0; value.y = 0; value.scale = 1; value.azimuth = 41; value.elevation = 24;
    updateArtwork();`;
    const fitReplacementV51 = `    value.x = 0; value.y = 0; value.scale = 1; value.azimuth = 41; value.elevation = 24;
    const activeType = rackTypeCache.find((item) => item.key === safeKey(activeKey));
    if (activeType?.system === "mr") previewCache.delete(activeKey);
    updateArtwork();`;
    if (!positioner.includes(fitAnchorV51)) throw new Error("MR v51: Sigdir 41/24 baglanti noktasi bulunamadi.");
    positioner = positioner.replace(fitAnchorV51, fitReplacementV51);
    fs.writeFileSync(sectionPositionerPath, positioner);
  }

  // MR'de Sigdir, eski bir kesit renderi tamamlanirken yeniden onbellege
  // dusmez. B2B ve Mekik ayni zamanlanmis Sigdir akislarini kullanir.
  if (!positioner.includes("__rafexMrFit4124V53")) {
    const fitCurrentAnchorV53 = `  function fitCurrent() {
    if (!activeKey) return;
    const value = ensureSetting(activeKey);
    value.x = 0; value.y = 0; value.scale = 1; value.azimuth = 41; value.elevation = 24;
    const activeType = rackTypeCache.find((item) => item.key === safeKey(activeKey));
    if (activeType?.system === "mr") previewCache.delete(activeKey);
    updateArtwork();
    schedulePreview(true, 80);
  }`;
    const fitCurrentReplacementV53 = `  function fitCurrent() {
    if (!activeKey) return;
    const value = ensureSetting(activeKey);
    value.x = 0; value.y = 0; value.scale = 1; value.azimuth = 41; value.elevation = 24;
    const activeType = rackTypeCache.find((item) => item.key === safeKey(activeKey)) || collectRackTypes().find((item) => item.key === safeKey(activeKey));
    const seed = activeType?.entries?.values?.().next?.().value;
    const isMr = activeType?.system === "mr" || isMrDrawing(seed?.drawing);
    if (isMr) {
      value.azimuth = 41;
      value.elevation = 24;
      previewCache.delete(activeKey);
      updateArtwork();
      void fillArtwork(true);
      return;
    } // __rafexMrFit4124V53
    updateArtwork();
    schedulePreview(true, 80);
  }`;
    if (!positioner.includes(fitCurrentAnchorV53)) throw new Error("MR v53: kesin 41/24 Sigdir fonksiyonu bulunamadi.");
    positioner = positioner.replace(fitCurrentAnchorV53, fitCurrentReplacementV53);
    fs.writeFileSync(sectionPositionerPath, positioner);
  }

  // MR duvar ve raf arasi mesafeleri masaustunde tek satirdadir. Alanlar
  // Raf derinligi girdisi gibi okunakli kalir; dar ekranda kuculmek yerine
  // yatay kaydirma kullanilir. Diger sistemlerin editor stilleri degismez.
  if (!portal.includes("__rafexMrMeasureSingleRowV51")) {
    const headEndV51 = portal.indexOf("</head>");
    if (headEndV51 < 0) throw new Error("MR v51: tek satir olcu stili icin head bulunamadi.");
    const measureStylesV51 = `<style data-rafex-mr-measure-single-row="v51">
      /* __rafexMrMeasureSingleRowV51 */
      #page.mr-mode .m2-wall-editor{display:flex!important;flex-wrap:nowrap!important;align-items:stretch!important;gap:8px!important;overflow-x:auto!important;padding-bottom:3px}
      #page.mr-mode .m2-wall-editor>.rafex-mr-gap-row{display:contents!important}
      #page.mr-mode .m2-wall-editor .m2-edge-field{flex:1 0 220px!important;min-width:220px!important;grid-template-columns:18px minmax(82px,max-content) minmax(110px,1fr)!important;align-items:center!important;min-height:58px!important;padding:7px 9px!important;gap:7px!important;font-size:9px!important;white-space:nowrap}
      #page.mr-mode .m2-wall-editor .m2-edge-field>span{min-width:82px;white-space:nowrap}
      #page.mr-mode .m2-wall-editor .m2-edge-field input[type="number"]{width:100%!important;min-width:110px!important;min-height:44px!important;height:44px!important;padding:10px 11px!important;font-size:10px!important}
    </style>`;
    portal = portal.slice(0, headEndV51) + measureStylesV51 + "\n" + portal.slice(headEndV51);
  }

  // MR tek bir bolum/modul olcusu uzerinden tanimlanir. Ozet ve 3D'de
  // toplam raf dizisi yerine kullanicinin girdigi net bolum genisligi yazilir.
  if (!portal.includes("__rafexMrSingleWidthAndSaveBarV52")) {
    portal = portal
      .replaceAll('<span>Toplam genişlik</span><b id="mrTotalWidth"', '<span>Genişlik</span><b id="mrTotalWidth"')
      .replaceAll('if($("mrTotalWidth"))$("mrTotalWidth").textContent=`${fmt(totalWidth)} mm`', 'if($("mrTotalWidth"))$("mrTotalWidth").textContent=`${fmt(width)} mm`');
    const headEndV52 = portal.indexOf("</head>");
    if (headEndV52 < 0) throw new Error("MR v52: kaydet cubugu stili icin head bulunamadi.");
    const saveBarStylesV52 = `<style data-rafex-mr-single-width-save-bar="v52">
      /* __rafexMrSingleWidthAndSaveBarV52 */
      #page.mr-mode .mr-view-card>.mr-rack-save{width:100%!important;margin:0!important;padding:0!important;gap:0!important;justify-self:stretch!important;border-top:1px solid #d8b100;background:#fff}
      #page.mr-mode .mr-view-card>.mr-rack-save>#mrSaveRackButton{display:block;width:100%!important;min-height:64px!important;margin:0!important;padding:15px 18px!important;border-left:0!important;border-right:0!important;border-radius:0!important;font-size:16px!important;letter-spacing:.03em}
      #page.mr-mode .mr-view-card>.mr-rack-save>#mrSaveRackStatus{display:block;padding:9px 14px 5px;text-align:center;font-size:9px}
      #page.mr-mode .mr-view-card>.mr-rack-save>.mr-block-panel{margin:8px 13px 13px}
    </style>`;
    portal = portal.slice(0, headEndV52) + saveBarStylesV52 + "\n" + portal.slice(headEndV52);
  }

  // MR metin olceginin adi ekrandaki islemi dogrudan anlatir. Kaydet butonu
  // 3D kartin altinda durum metniyle bolunmeden tum yatay alani kaplar.
  if (!portal.includes("__rafexMrLabelsSaveAndFreeV53")) {
    portal = portal
      .replaceAll('>Ölçü yazısı boyutu<input id="mrDimensionScale"', '>Yazı büyüklüğü<input id="mrDimensionScale"')
      .replaceAll('<div class="mr-panel-head"><b>Proje Girdileri</b><small>MR sistemi için hazırlanan çalışma değerleri</small></div>', '<div class="mr-panel-head"><b>Ürün Girdileri</b><small>Yalnız MR sistemi için kullanılan çalışma değerleri</small></div>')
      .replace('renderMR=function(){\n        mrConfiguredRendererV4();', 'renderMR=function(){\n        if(m2ActiveModule!=="mr")m2ActivateModule("mr"); // __rafexMrLabelsSaveAndFreeV53\n        mrConfiguredRendererV4();');
    const headEndV53 = portal.indexOf("</head>");
    if (headEndV53 < 0) throw new Error("MR v53: tam genislik kaydet stili icin head bulunamadi.");
    const mrUiStylesV53 = `<style data-rafex-mr-ui-v53>
      /* __rafexMrLabelsSaveAndFreeV53 */
      #page.mr-mode .mr-view-card>.mr-rack-save{display:grid!important;grid-template-columns:minmax(0,1fr)!important;grid-auto-flow:row!important;width:100%!important;max-width:none!important;margin:0!important;padding:0!important;gap:0!important;background:transparent!important}
      #page.mr-mode .mr-view-card>.mr-rack-save>#mrSaveRackButton{grid-column:1/-1!important;display:block!important;width:100%!important;max-width:none!important;min-height:64px!important;margin:0!important;border-radius:0!important;background:#ffd400!important;color:#111!important}
      #page.mr-mode .mr-view-card>.mr-rack-save>#mrSaveRackStatus{display:none!important}
      #page.mr-mode .mr-view-card>.mr-rack-save>.mr-block-panel{grid-column:1/-1!important;width:auto!important;margin:8px 13px 13px!important}
      #page.mr-mode .m2-layout-products{display:block!important}
      #page.mr-mode .m2-saved-type-preview,#page.mr-mode .m2-saved-type-copy{display:inline-grid!important;place-items:center!important;width:42px!important;min-width:42px!important;height:42px!important;min-height:42px!important;padding:0!important;font-size:18px!important;line-height:1!important;font-weight:950!important}
      #page.mr-mode .m2-saved-type-preview{text-transform:none!important;font-family:Georgia,serif!important;font-style:italic!important}
      #page.mr-mode .m2-saved-type-copy{font-size:21px!important}
    </style>`;
    portal = portal.slice(0, headEndV53) + mrUiStylesV53 + "\n" + portal.slice(headEndV53);
  }

  // MR olcu panelinde ilk iki raf araligi en basta ve tek satirda görünür.
  // B2B panelinin mevcut sirasi ve davranisi aynen korunur.
  if (!portal.includes("__rafexMrTwoNearestGapsV49")) {
    const wallMeasureAnchorV49 = `const measurements = m2WallMeasurements(measurementRack), labels = { left: "Sol duvar", right: "Sağ duvar", top: "Üst duvar", bottom: "Alt duvar" }, nearest = m2NearestRackGap(measurementRack), nearestColumn=m2NearestColumnGap(measurementRack), rackPinned=m2PinnedForRack(measurementRack.id), samePinnedRack=Object.values(rackPinned).some(Boolean);`;
    const wallMeasureReplacementV49 = `const measurements = m2WallMeasurements(measurementRack), labels = { left: "Sol duvar", right: "Sağ duvar", top: "Üst duvar", bottom: "Alt duvar" }, nearest = m2NearestRackGap(measurementRack), nearestColumn=m2NearestColumnGap(measurementRack), rackPinned=m2PinnedForRack(measurementRack.id), samePinnedRack=Object.values(rackPinned).some(Boolean), mrGapRelations=m2ActiveModule==="mr"?(window.rafexRackGapRelationsV46?.(measurementRack)||[nearest]).filter(Boolean).slice(0,2):[]; // __rafexMrTwoNearestGapsV49`;
    if (!portal.includes(wallMeasureAnchorV49)) throw new Error("MR v49: olcu paneli raf iliskileri bulunamadi.");
    portal = portal.replace(wallMeasureAnchorV49, wallMeasureReplacementV49);

    const wallEditorLineV49 = `            wallEditor.innerHTML = \`${'${'}m2ActiveModule==="b2b"?\`<div class="m2-wall-editor-title"><span>RAF / DUVAR UZAKLIKLARI</span><small>${'${'}esc(measurementRack.blockName||measurementRack.typeName||"RAF")}</small></div>\`:""}\` + Object.entries(measurements).map(([direction, item]) => \`<label class="m2-edge-field dimension-field"><input type="checkbox" ${'${'}rackPinned[direction] ? "checked" : ""} onchange="m2TogglePinnedDimension('${'${'}direction}',this.checked)" aria-label="${'${'}labels[direction]} ölçüsünü sabitle"><span>${'${'}labels[direction]}</span><input type="number" min="0" step="1" value="${'${'}Math.round(item.px / m2LayoutState.scale)}" oninput="event.stopPropagation()" onchange="m2SetWallDistance('${'${'}direction}',this.value)" aria-label="${'${'}labels[direction]} mesafesi milimetre"></label>\`).join("") + (nearest ? \`<label class="m2-edge-field dimension-field"><input type="checkbox" ${'${'}rackPinned.gap ? "checked" : ""} onchange="m2TogglePinnedDimension('gap',this.checked)" aria-label="En yakın raf arası ölçüsünü sabitle"><span>En yakın raf arası</span><input type="number" min="0" step="1" value="${'${'}Math.max(0, Math.round(nearest.distance / m2LayoutState.scale) - nearest.clearanceMm)}" oninput="event.stopPropagation()" onchange="m2SetRackCenterDistance(this.value)" aria-label="En yakın raf arası gösterge ölçüsü milimetre"></label>\` : "") + (nearestColumn ? \`<label class="m2-edge-field dimension-field"><i aria-hidden="true">↔</i><span>Kolon–raf arası</span><input type="number" min="0" step="1" value="${'${'}Math.max(0,Math.round(nearestColumn.distance/m2LayoutState.scale))}" oninput="event.stopPropagation()" onchange="m2SetColumnDistance(this.value)" aria-label="Kolon ile raf arası mesafe milimetre"></label>\` : "");`;
    const wallEditorReplacementV49 = `            const wallFieldsV49=Object.entries(measurements).map(([direction,item])=>\`<label class="m2-edge-field dimension-field"><input type="checkbox" ${'${'}rackPinned[direction]?"checked":""} onchange="m2TogglePinnedDimension('${'${'}direction}',this.checked)" aria-label="${'${'}labels[direction]} ölçüsünü sabitle"><span>${'${'}labels[direction]}</span><input type="number" min="0" step="1" value="${'${'}Math.round(item.px/m2LayoutState.scale)}" oninput="event.stopPropagation()" onchange="m2SetWallDistance('${'${'}direction}',this.value)" aria-label="${'${'}labels[direction]} mesafesi milimetre"></label>\`).join(""),columnFieldV49=nearestColumn?\`<label class="m2-edge-field dimension-field"><i aria-hidden="true">↔</i><span>Kolon–raf arası</span><input type="number" min="0" step="1" value="${'${'}Math.max(0,Math.round(nearestColumn.distance/m2LayoutState.scale))}" oninput="event.stopPropagation()" onchange="m2SetColumnDistance(this.value)" aria-label="Kolon ile raf arası mesafe milimetre"></label>\`:"";
            if(m2ActiveModule==="mr"){const gapFieldsV49=mrGapRelations.map((relation,index)=>{const gapMm=Math.max(0,Math.round(relation.distance/m2LayoutState.scale)-relation.clearanceMm),otherId=Number(relation.other?.id)||0;return\`<label class="m2-edge-field dimension-field rafex-mr-gap-field"><i aria-hidden="true">↔</i><span>En yakın raf arası ${'${'}index+1}</span><input type="number" min="0" step="1" value="${'${'}gapMm}" oninput="event.stopPropagation()" onchange="rafexSetRackGapV49(${'${'}Number(measurementRack.id)},${'${'}otherId},this.value)" aria-label="En yakın raf arası ${'${'}index+1} milimetre"></label>\`;}).join("");wallEditor.innerHTML=\`<div class="rafex-mr-gap-row">${'${'}gapFieldsV49}</div>\`+wallFieldsV49+columnFieldV49;}else wallEditor.innerHTML=\`<div class="m2-wall-editor-title"><span>RAF / DUVAR UZAKLIKLARI</span><small>${'${'}esc(measurementRack.blockName||measurementRack.typeName||"RAF")}</small></div>\`+wallFieldsV49+(nearest?\`<label class="m2-edge-field dimension-field"><input type="checkbox" ${'${'}rackPinned.gap?"checked":""} onchange="m2TogglePinnedDimension('gap',this.checked)" aria-label="En yakın raf arası ölçüsünü sabitle"><span>En yakın raf arası</span><input type="number" min="0" step="1" value="${'${'}Math.max(0,Math.round(nearest.distance/m2LayoutState.scale)-nearest.clearanceMm)}" oninput="event.stopPropagation()" onchange="m2SetRackCenterDistance(this.value)" aria-label="En yakın raf arası gösterge ölçüsü milimetre"></label>\`:"")+columnFieldV49;`;
    if (!portal.includes(wallEditorLineV49)) throw new Error("MR v49: olcu paneli siralama satiri bulunamadi.");
    portal = portal.replace(wallEditorLineV49, wallEditorReplacementV49);
  }

  // Teknik PDF SVG'lerinde üst uzatma/yarım kat etiketi bulunmaz; ayak boyu
  // ve gerçek kat ölçüleri gösterilmeye devam eder.
  portal = portal
    .replace(/<text\b[^>]*>SON KAT ÜSTÜ AYAK UZATMASI · \$\{fmt\(extension\)\} mm<\/text>/gu, "")
    .replace(/<text\b[^>]*>AYAK UZATMASI \$\{fmt\(extension\)\} mm<\/text>/gu, "")
    .replaceAll(' · ÜST UZATMA ${fmt(extension)} mm', '')
    .replaceAll(' · üst yarım kat ${fmt(topExtension)} mm', '');
  if (/ÜST YARIM KAT|AYAK UZATMASI/u.test(portal)) throw new Error("MR v47: PDF ust yarim kat etiketi kaldirilamadi.");
  for (const required of ['__rafexMrSingleWidthAndSaveBarV52', '__rafexMrLabelsSaveAndFreeV53', '<span>Genişlik</span><b id="mrTotalWidth"', 'textContent=`${fmt(width)} mm`', '>Yazı büyüklüğü<input id="mrDimensionScale"', '<b>Ürün Girdileri</b><small>Yalnız MR sistemi', 'if(m2ActiveModule!=="mr")m2ActivateModule("mr")', 'min-height:64px!important']) {
    if (!portal.includes(required)) throw new Error(`MR v52 portal kaynak dogrulama hatasi: ${required}`);
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
  if(window.__rafexMrFreeExtensionV35)return;window.__rafexMrFreeExtensionV35=true;window.__rafexMrPointerDoubleTapV36=true;window.__rafexMrExtensionGeometryV72=true;
  var originalStart=window.m2StartAutoFillGuide;
  var originalPreview=window.m2PreviewAutoFillLength;
  var originalApply=window.m2ApplyAutoFillLength;
  var originalCancel=window.m2CancelAutoFill;
  var originalCommit=window.m2CommitAutoFillGuide;
  var originalCustomizeOpen=window.m2OpenCustomizeModal;
  var originalCustomizeClose=window.m2CloseCustomizeModal;
  var originalCustomizePreview=window.m2PreviewRackCustomization;
  var originalCustomizeApply=window.m2ApplyRackCustomization;
  var pendingCustom=null;
  var lastMrPointerTap={id:null,at:0};
  var suppressMrDblClickUntil=0;

  function isMr(rack){return !!(rack?.b2b?.mr||rack?.rafexSystem==='mr'||rack?.systemType==='mr'||rack?.b2bLayout?.palletType==='mr'||rack?.plan?.mr);}
  function rackById(id){try{return m2LayoutState.racks.find(function(r){return Number(r.id)===Number(id);})||null;}catch{return null;}}
  function formatMm(value){try{return Math.round(Number(value)||0).toLocaleString('tr-TR')+' mm';}catch{return String(Math.round(Number(value)||0))+' mm';}}
  window.rafexRackGapRelationsV46=function(owner){
    try{
      var a=m2CombinedRackBounds(owner),relations=[];
      m2LayoutState.racks.forEach(function(other){
        if(Number(other.id)===Number(owner.id)||(owner.joinGroup&&other.joinGroup===owner.joinGroup))return;
        var b=m2RackBounds(other),candidates=[],horizontalStart=Math.max(a.top,b.top),horizontalEnd=Math.min(a.bottom,b.bottom),verticalStart=Math.max(a.left,b.left),verticalEnd=Math.min(a.right,b.right),candidate;
        if(a.right<=b.left&&horizontalStart<=horizontalEnd){candidate=m2ClearRackGapLine(owner,other,'right',a.right,b.left,horizontalStart,horizontalEnd);if(candidate)candidates.push(candidate);}
        if(b.right<=a.left&&horizontalStart<=horizontalEnd){candidate=m2ClearRackGapLine(owner,other,'left',a.left,b.right,horizontalStart,horizontalEnd);if(candidate)candidates.push(candidate);}
        if(a.bottom<=b.top&&verticalStart<=verticalEnd){candidate=m2ClearRackGapLine(owner,other,'bottom',a.bottom,b.top,verticalStart,verticalEnd);if(candidate)candidates.push(candidate);}
        if(b.bottom<=a.top&&verticalStart<=verticalEnd){candidate=m2ClearRackGapLine(owner,other,'top',a.top,b.bottom,verticalStart,verticalEnd);if(candidate)candidates.push(candidate);}
        candidate=candidates.sort(function(first,second){return first.distance-second.distance;})[0];if(candidate){candidate.clearanceMm=m2RackClearanceMm(owner,other,candidate.direction);relations.push({...candidate,other:other,a:a,b:b});}
      });
      var perDirection=new Map();relations.sort(function(first,second){return first.distance-second.distance;}).forEach(function(item){if(!perDirection.has(item.direction))perDirection.set(item.direction,item);});return Array.from(perDirection.values()).sort(function(first,second){return first.distance-second.distance;}).slice(0,2);
    }catch(e){try{var nearest=m2NearestRackGap(owner);return nearest?[nearest]:[];}catch(_){return[];}}
  };
  window.rafexSetRackGapV49=function(ownerId,otherId,rawValue){
    var owner=rackById(ownerId);if(!owner)return;var relation=(window.rafexRackGapRelationsV46(owner)||[]).find(function(item){return Number(item.other?.id)===Number(otherId);});if(!relation)return;
    var displayMm=Math.max(0,Number(rawValue)||0),desiredPx=(displayMm+(Number(relation.clearanceMm)||0))*Math.max(.0001,Number(m2LayoutState.scale)||.04),delta=desiredPx-Number(relation.distance||0),nextX=owner.x,nextY=owner.y;
    if(relation.direction==='right')nextX-=delta;else if(relation.direction==='left')nextX+=delta;else if(relation.direction==='bottom')nextY-=delta;else if(relation.direction==='top')nextY+=delta;
    if(!m2MoveRackOrJoinedGroup(owner,nextX,nextY))setStatus('Girilen raf arası mesafe bloğu alan dışına çıkarıyor veya başka bir rafla çakıştırıyor.');else setStatus('Raf arası '+formatMm(displayMm)+' olarak ayarlandı.');m2RenderLayout();
  };
  function ensureMrRowControlsV49(){
    var page=document.getElementById('page');if(!page?.classList?.contains('mr-mode'))return;var form=page.querySelector('.mr-form');if(!form)return;
    var row=form.querySelector('.mr-row-field');if(!row){row=document.createElement('div');row.className='mr-row-field';row.innerHTML='<div class="mr-row-mode"><label>Sıra düzeni<select id="mrRowType" aria-label="MR sıra düzeni"><option value="single">Tek sıra</option><option value="double">Çift sıra</option></select></label><label class="mr-row-gap-field">Çift sıra mesafesi (mm)<input id="mrRowGap" type="number" min="0" max="2000" step="10" value="200" aria-label="Çift sıra mesafesi" disabled></label></div>';}
    var depth=document.getElementById('mrDepth')?.closest('label');if(depth&&row.previousElementSibling!==depth)depth.insertAdjacentElement('afterend',row);
    var type=document.getElementById('mrRowType'),gap=document.getElementById('mrRowGap');if(type&&gap)gap.disabled=type.value!=='double';
  }
  function configFromRack(rack){
    var state=rack?.b2b||{},layout=rack?.b2bLayout||{},levels=Math.max(1,Math.round(Number(state.levels)||Number(rack?.levels)||1)),width=Math.max(300,Number(state.width)||Number(layout.palletWidth)||Number(rack?.palW)||2400),depth=Math.max(300,Number(state.depth)||Number(layout.palletDepth)||Number(rack?.palD)||800),rowCount=Math.max(1,Math.min(2,Math.round(Number(state.rowCount)||Number(layout.rowCount)||1))),rowGap=rowCount>1?Math.max(0,Number(state.rowGap??layout.rowGap??200)):0,firstTraverse=Math.max(0,Number(state.firstTraverse??rack?.firstRailHeight??200)),levelGap=Math.max(100,Number(state.requestedLevelGap)||Number(state.levelGap)||Number(rack?.levelH)||1000),traverseType=String(state.traverseType||'ZS65'),traverseHeight=Math.max(1,Number(state.traverseHeight)||Number(rack?.traverseHeight)||({ZS35:55,ZS55:75,ZS65:85}[traverseType]||85)),topTraverse=firstTraverse+Math.max(0,levels-1)*(levelGap+traverseHeight),automaticUprightHeight=topTraverse+traverseHeight+levelGap/2,uprightHeight=Math.ceil(Math.max(automaticUprightHeight,Number(state.uprightHeight)||Number(rack?.sideUprightHeight)||0)/50)*50;
    var dimensions=state.dimensions||{};
    return{modules:Math.max(1,Math.round(Number(state.modules)||Number(rack?.bays)||1)),levels:levels,width:width,depth:depth,rowCount:rowCount,rowGap:rowGap,firstTraverse:firstTraverse,levelGap:levelGap,requestedLevelGap:levelGap,height:topTraverse,uprightHeight:uprightHeight,uprightType:state.uprightType||'MR60',uprightThickness:Number(state.uprightThickness)||1.5,uprightWidth:60,traverseType:traverseType,traverseThickness:Number(state.traverseThickness)||1.5,traverseHeight:traverseHeight,uprightFinish:state.uprightFinish||'ral5010',traverseFinish:state.traverseFinish||'ral1007',accessories:Array.isArray(state.accessories)?JSON.parse(JSON.stringify(state.accessories)):[],dimensions:{levels:dimensions.levels!==false,markers:dimensions.markers!==false,width:dimensions.width!==false,depth:dimensions.depth!==false},dimensionScale:Math.max(.7,Math.min(3,Number(state.dimensionScale)||2))};
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
      var settings=rack.b2b||{},modules=Math.max(1,Math.round(Number(settings.modules)||Number(rack.bays)||1)),levels=Math.max(1,Math.round(Number(settings.levels)||Number(rack.levels)||1)),rowCount=Math.max(1,Math.min(2,Math.round(Number(settings.rowCount)||Number(rack.b2bLayout?.rowCount)||1))),width=Math.max(300,Math.round(Number(settings.width)||Number(rack.palW)||2400)),depth=Math.max(300,Math.round(Number(settings.depth)||Number(rack.b2bLayout?.palletDepth)||Number(rack.palD)||800)),uprightHeight=Math.ceil(Math.max(0,Number(rack.sideUprightHeight)||Number(settings.uprightHeight)||0)/50)*50,uprightKey=(settings.uprightType||'MR60')+' · '+String(Number(settings.uprightThickness)||1.5).replace('.',',')+' mm · 60 mm · '+mrFinish(settings.uprightFinish||'ral5010')+' · H '+mrNumber(uprightHeight)+' × D '+mrNumber(depth)+' mm',traverseKey=(settings.traverseType||'ZS65')+' · '+String(Number(settings.traverseThickness)||1.5).replace('.',',')+' mm · H '+mrNumber(Number(settings.traverseHeight)||85)+' mm · '+mrFinish(settings.traverseFinish||'ral1007')+' · L '+mrNumber(width)+' mm';
      // Her bagimsiz blokta N modul = N+1 ayak. Bagli moduller ise yalniz
      // ekledikleri N yeni ayagi getirir; ortak ayak ikinci kez sayilmaz.
      var uprightQty=(modules+(rack.sharedFootWith?0:1))*rowCount;uprights.set(uprightKey,(uprights.get(uprightKey)||0)+uprightQty);traverses.set(traverseKey,(traverses.get(traverseKey)||0)+modules*levels*2*rowCount);
      (settings.accessories||[]).filter(function(item){return item&&item.type==='tray';}).forEach(function(item){var selectedLevels=new Set((item.levels||[]).map(Number).filter(function(level){return level>=1&&level<=levels;}));if(!selectedLevels.size)return;mrTrayPieces(width,item.width).forEach(function(piece){var key=mrNumber(piece)+' × '+mrNumber(depth)+' mm';trays.set(key,(trays.get(key)||0)+modules*selectedLevels.size*rowCount);});});
    });
    var rows=[];uprights.forEach(function(qty,spec){rows.push({item:'MR Ayak Toplama',spec:spec,qty:qty});});traverses.forEach(function(qty,spec){rows.push({item:'ZS Travers',spec:spec,qty:qty});});trays.forEach(function(qty,spec){rows.push({item:'Tava',spec:spec,qty:qty});});return rows;
  }
  window.rafexMrQuantitySummaryV42=mrQuantitySummary;
  var originalLayoutProductsV42=window.m2LayoutProductRows,originalCorporateBomV42=window.m2CorporateBomRows;
  var exactLayoutProductsV42=function(){
    var withoutColumns=function(rows){return(rows||[]).filter(function(row){return !/^Kolon(?:\b|\s*·)/i.test(String(row?.name||''));});};
    if(typeof m2ActiveModule==='undefined'||m2ActiveModule!=='mr')return withoutColumns(originalLayoutProductsV42?.apply(this,arguments)||[]);
    var exact=mrQuantitySummary(m2LayoutState.racks).map(function(row){return{name:row.item+' · '+row.spec,qty:row.qty};}),other=withoutColumns(originalLayoutProductsV42?.apply(this,arguments)||[]).filter(function(row){var name=String(row?.name||'');return !name.startsWith('MR Ayak Toplama')&&!name.startsWith('ZS Travers')&&!name.startsWith('Tava');});return exact.concat(other);
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
    try{var previewConfig=configFromRack(rack);previewConfig.dimensionScale=Math.max(2,Number(previewConfig.dimensionScale)||2);var instance=window.RafexMRViewer.mount(canvas,{config:previewConfig});try{mrViewerInstance=instance;}catch(e){}}catch(error){setStatus(error?.message||'MR 3D önizlemesi açılamadı.');}
  }
  function openMrCustomize(rack){
    var modal=document.getElementById('m2CustomizeModal');if(!modal)return;
    try{m2CustomizeRackId=rack.id;m2CustomizeMode=false;}catch(e){}m2LayoutState.selected=rack.id;document.getElementById('m2CustomizeRackButton')?.classList.remove('active');modal.classList.add('rafex-mr-customize-v37');modal.hidden=false;
    var head=modal.querySelector('.m2-customize-head'),title=head?.querySelector('b'),copy=head?.querySelector('small'),close=head?.querySelector('button'),badge=modal.querySelector('.m2-customize-preview>span');if(title)title.textContent='MR Modül Önizlemesi';if(copy)copy.textContent='Ölçüler oluşturduğun MR raf tipinden birebir alınır; B2B değerleri uygulanmaz.';if(close)close.setAttribute('onclick','window.rafexCloseMrCustomizeV37()');if(badge)badge.textContent='MR 3D RAF ÖNİZLEMESİ';
    var config=configFromRack(rack),summary=modal.querySelector('.rafex-mr-customize-summary');if(!summary){summary=document.createElement('div');summary.className='rafex-mr-customize-summary';head?.after(summary);}summary.innerHTML='<div><small>GENİŞLİK</small><b>'+formatMm(config.width)+'</b></div><div><small>DERİNLİK</small><b>'+formatMm(config.depth)+'</b></div><div><small>ZEMİN → K1</small><b>'+formatMm(config.firstTraverse)+'</b></div><div><small>KAT ARASI NET</small><b>'+formatMm(config.levelGap)+'</b></div><div><small>AYAK BOYU</small><b>'+formatMm(config.uprightHeight)+'</b></div><div><small>SİSTEM</small><b>MR60 · '+config.traverseType+'</b></div>';
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
    var foot=footOf(source),physical=width+2*foot,copy=JSON.parse(JSON.stringify(source)),rowCount=Math.max(1,Math.min(2,Math.round(Number(source?.b2b?.rowCount)||Number(source?.b2bLayout?.rowCount)||1))),rowGap=rowCount>1?Math.max(0,Number(source?.b2b?.rowGap??source?.b2bLayout?.rowGap??200)):0;
    copy.id=Date.now()+Math.floor(Math.random()*100000);copy.x=centerX-physical*m2LayoutState.scale/2;copy.y=centerY-copy.h/2;copy.w=physical*m2LayoutState.scale;copy.widthMm=physical;copy.bays=1;copy.palW=width;copy.joinGroup=null;copy.sharedFootWith=null;copy.sharedFootSide=null;copy.freePlacement=false;copy.staged=false;copy.locked=true;copy.specLocked=true;copy.rafexSystem='mr';copy.rafexSystemLabel='MR';
    copy.b2b={...(copy.b2b||{}),mr:true,modules:1,width:width,uprightWidth:foot,rowCount:rowCount,rowGap:rowGap};
    copy.b2bLayout={...(copy.b2bLayout||{}),palletCount:1,palletWidth:width,palletType:'mr',sectionWidth:width,rowCount:rowCount,rowGap:rowGap};
    return copy;
  }
  function placeAfter(anchor,source,width,direction,ux,uy,typeName){
    var foot=footOf(source),anchorPhysical=Math.max(1,Number(anchor.widthMm)||anchor.w/m2LayoutState.scale),probePhysical=width+2*foot,step=(anchorPhysical+probePhysical)/2-foot,anchorCx=anchor.x+anchor.w/2,anchorCy=anchor.y+anchor.h/2,probe=copyRack(source,width,anchorCx+direction*ux*step*m2LayoutState.scale,anchorCy+direction*uy*step*m2LayoutState.scale);
    probe.angle=source.angle;if(typeName){probe.typeName=typeName;probe.typeColor=m2TypeColor(typeName);}
    if(!m2RackInsideArea(probe)||m2RackOverlapsExcept(probe,probe.x,probe.y,probe.angle,[anchor.id]))return null;
    var group=anchor.joinGroup||source.joinGroup||('mr-auto-'+source.id);anchor.joinGroup=group;probe.joinGroup=group;probe.sharedFootWith=anchor.id;probe.sharedFootSide=direction>0?'left':'right';m2LayoutState.racks.push(probe);return probe;
  }
  function drawingFor(source,width){
    var foot=footOf(source),drawing=JSON.parse(JSON.stringify(source)),physical=width+2*foot,rowCount=Math.max(1,Math.min(2,Math.round(Number(source?.b2b?.rowCount)||Number(source?.b2bLayout?.rowCount)||1))),rowGap=rowCount>1?Math.max(0,Number(source?.b2b?.rowGap??source?.b2bLayout?.rowGap??200)):0;
    ['id','x','y','w','h','angle','joinGroup','sharedFootWith','sharedFootSide','freePlacement','staged','locked','rafexSystem','rafexSystemLabel'].forEach(function(key){delete drawing[key];});
    drawing.totalWidth=physical;drawing.widthMm=physical;drawing.railLength=Number(source.depthMm)||Number(source.railLength)||Number(source.b2b?.depth)||800;drawing.depthMm=drawing.railLength;drawing.bays=1;drawing.palW=width;drawing.layoutView='b2b-top';drawing.systemType='mr';drawing.plan={feet:[...(source.plan?.feet||[drawing.railLength])],braces:[...(source.plan?.braces||[])]};
    drawing.b2b={...(drawing.b2b||{}),mr:true,modules:1,width:width,uprightWidth:foot,rowCount:rowCount,rowGap:rowGap};drawing.b2bLayout={...(drawing.b2bLayout||{}),palletCount:1,palletWidth:width,palletType:'mr',sectionWidth:width,rowCount:rowCount,rowGap:rowGap};return drawing;
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
  window.rafexCopyMrSavedV45=function(index){var entry=Array.isArray(m2SavedRackTypes)?m2SavedRackTypes[index]:null,drawing=entry?.drawing;if(!entry||!isMr(drawing)){setStatus('Kopyalanacak MR kaydı bulunamadı.');return;}try{if(typeof window.mrSelectBlockV7==='function')window.mrSelectBlockV7(Number(index));else{m2SelectedSavedType=Number(index);m2LastDrawing=JSON.parse(JSON.stringify(drawing));mrApplyDrawingToFormV4(drawing);mrUpdateSummary(true);mrSyncLayoutDrawingV4(false);}setStatus(String(entry.name||'MR')+' bilgileri üst MR düzenleyiciye getirildi.');setTimeout(function(){ensureMrRowControlsV49();document.querySelector('.mr-form')?.scrollIntoView?.({behavior:'smooth',block:'start'});},50);}catch(error){setStatus(error?.message||'MR kaydı kopyalanamadı.');}};
  window.rafexCloseMrSavedV48=function(){var modal=document.getElementById('rafexMrSavedPreviewModal');if(modal)modal.hidden=true;try{window.RafexMRViewer?.destroy?.();}catch(e){}requestAnimationFrame(function(){try{if(m2ActiveModule==='mr'&&document.getElementById('mrCanvas'))mrMountViewer();}catch(e){}});};
  window.rafexInspectMrSavedV45=function(index){var entry=Array.isArray(m2SavedRackTypes)?m2SavedRackTypes[index]:null;if(!entry||!isMr(entry.drawing)){setStatus('İncelenecek MR kaydı bulunamadı.');return;}var modal=document.getElementById('rafexMrSavedPreviewModal');if(!modal){document.body.insertAdjacentHTML('beforeend','<div class="m2-layout-modal rafex-mr-saved-preview-v48" id="rafexMrSavedPreviewModal" hidden onclick="if(event.target===this)rafexCloseMrSavedV48()"><div class="m2-readonly-preview-dialog" role="dialog" aria-modal="true" aria-labelledby="rafexMrSavedPreviewTitle"><div class="m2-readonly-preview-head"><div><b id="rafexMrSavedPreviewTitle">MR 3D RAF ÖNİZLEMESİ</b><small>Salt okunur · kayıtlı MR verileri birebir gösterilir</small></div><button type="button" aria-label="Önizlemeyi kapat" onclick="rafexCloseMrSavedV48()">×</button></div><div class="m2-readonly-preview-canvas"><canvas id="rafexMrSavedPreviewCanvas"></canvas></div></div></div>');modal=document.getElementById('rafexMrSavedPreviewModal');}document.getElementById('rafexMrSavedPreviewTitle').textContent=String(entry.name||'MR')+' · MR 3D RAF ÖNİZLEMESİ';modal.hidden=false;requestAnimationFrame(function(){var canvas=document.getElementById('rafexMrSavedPreviewCanvas');if(!canvas||!window.RafexMRViewer)return;try{window.RafexMRViewer.destroy?.();var inspectConfig=configFromRack(entry.drawing);inspectConfig.dimensionScale=Math.max(2,Number(inspectConfig.dimensionScale)||2);window.RafexMRViewer.mount(canvas,{config:inspectConfig});window.RafexMRViewer.setView?.('perspective');}catch(error){setStatus(error?.message||'MR 3D önizlemesi açılamadı.');}});};
  try{m2StartAutoFillGuide=wrappedStart;m2PreviewAutoFillLength=wrappedPreview;m2ApplyAutoFillLength=wrappedApply;m2CancelAutoFill=wrappedCancel;m2CommitAutoFillGuide=wrappedCommit;}catch(e){}
  try{m2OpenCustomizeModal=wrappedCustomizeOpen;m2CloseCustomizeModal=wrappedCustomizeClose;m2PreviewRackCustomization=wrappedCustomizePreview;m2ApplyRackCustomization=wrappedCustomizeApply;}catch(e){}
  window.m2StartAutoFillGuide=wrappedStart;window.m2PreviewAutoFillLength=wrappedPreview;window.m2ApplyAutoFillLength=wrappedApply;window.m2CancelAutoFill=wrappedCancel;window.m2CommitAutoFillGuide=wrappedCommit;
  window.m2OpenCustomizeModal=wrappedCustomizeOpen;window.m2CloseCustomizeModal=wrappedCustomizeClose;window.m2PreviewRackCustomization=wrappedCustomizePreview;window.m2ApplyRackCustomization=wrappedCustomizeApply;
  var originalSelectedRackInfoV46=window.m2RenderSelectedRackInfo;
  var selectedRackInfoV46=function(){
    originalSelectedRackInfoV46?.apply(this,arguments);var box=document.getElementById('m2SelectedRackInfo');if(!box)return;var rack=null,entry=null,drawing=null;try{rack=m2SelectedRack();entry=!rack&&m2SelectedSavedType!=null?m2SavedRackTypes[m2SelectedSavedType]:null;drawing=entry?.drawing;}catch(e){}
    var source=rack||drawing;if(!isMr(source)){return;}var settings=source.b2b||{},layout=source.b2bLayout||{},name=String(rack?.typeName||entry?.name||'MR'),block=String(rack?.blockName||'').trim(),project=String(document.getElementById('m2ProjectName')?.value||'').trim()||'MR RAF PROJESİ',rowCount=Math.max(1,Math.min(2,Math.round(Number(settings.rowCount)||Number(layout.rowCount)||1))),rowText=rowCount>1?'ÇİFT SIRA':'TEK SIRA',width=Math.round(Number(rack?.widthMm)||Number(drawing?.totalWidth)||0),depth=Math.round(Number(settings.depth)||Number(layout.palletDepth)||Number(drawing?.railLength)||0),modules=Math.max(1,Math.round(Number(settings.modules)||Number(source.bays)||1)),levels=Math.max(1,Math.round(Number(settings.levels)||Number(source.levels)||1)),upright=Math.ceil(Math.max(0,Number(settings.uprightHeight)||Number(source.sideUprightHeight)||0)/50)*50,tray=(settings.accessories||[]).find(function(item){return item?.type==='tray';}),trayText=tray?'Tava '+Math.round(Number(tray.width)||300)+' mm · '+(tray.levels||[]).length+' kat':'Tava yok',color=typeof m2TypeColor==='function'?m2TypeColor(name):'#1d5f8a';
    var next='<div class="m2-selected-rack-main"><small>'+esc(project)+' · '+esc(rowText)+' · '+fmt(modules)+' MODÜL</small><br>'+(block?'<b>'+esc(block.replace(' · ',' '))+'</b><br>':'')+'<b><i class="m2-info-swatch" style="background:'+color+'"></i>'+esc(name)+'</b><br>MR · '+fmt(width)+' × '+fmt(depth)+' mm · '+fmt(levels)+' kat<br>Ayak '+esc(settings.uprightType||'MR60')+' · '+fmt(upright)+' mm · Travers '+esc(settings.traverseType||'ZS65')+' · '+esc(trayText)+'</div>';if(box.innerHTML!==next)box.innerHTML=next;
  };
  try{m2RenderSelectedRackInfo=selectedRackInfoV46;}catch(e){}window.m2RenderSelectedRackInfo=selectedRackInfoV46;
  function installSavedActionsV46(){
    if(typeof m2ActiveModule==='undefined'||m2ActiveModule!=='mr')return;var list=document.getElementById('m2SavedTypeList');if(!list)return;list.querySelectorAll('.m2-saved-type-row').forEach(function(row,index){var entry=Array.isArray(m2SavedRackTypes)?m2SavedRackTypes[index]:null;if(!entry||!isMr(entry.drawing))return;var main=row.querySelector('.m2-saved-type'),copy=row.querySelector('.m2-saved-type-copy'),preview=row.querySelector('.m2-saved-type-preview');if(main){var title=main.querySelector('b');if(title)title.innerHTML=title.innerHTML.replace(/\s*·\s*MR\s*·\s*[12]\s*SIRA(?:\s*BİRLEŞİK)?/iu,' · MR');}if(!preview){preview=document.createElement('button');preview.type='button';preview.className='m2-saved-type-preview';(copy||row.querySelector('.m2-type-delete'))?.before(preview);}if(preview){preview.textContent='i';preview.title='İncele';preview.setAttribute('aria-label',String(entry.name||'MR')+' rafını incele');preview.onclick=function(event){event.preventDefault();event.stopPropagation();window.rafexInspectMrSavedV45(index);};}if(copy){copy.textContent='⧉';copy.title='Kopyala';copy.setAttribute('aria-label',String(entry.name||'MR')+' rafını kopyala');copy.onclick=function(event){event.preventDefault();event.stopPropagation();window.rafexCopyMrSavedV45(index);};}row.dataset.rafexActionsV53='1';});
  }
  var savedActionScanV46=false;new MutationObserver(function(){if(savedActionScanV46)return;savedActionScanV46=true;requestAnimationFrame(function(){savedActionScanV46=false;ensureMrRowControlsV49();installSavedActionsV46();selectedRackInfoV46();});}).observe(document.body,{childList:true,subtree:true});ensureMrRowControlsV49();installSavedActionsV46();try{if(typeof m2RenderLayout==='function')m2RenderLayout();}catch(e){}
  document.addEventListener('click',function(event){
    if(typeof m2ActiveModule==='undefined'||m2ActiveModule!=='mr')return;var button=event.target?.closest?.('#m2SavedTypeList .m2-saved-type-preview,#m2SavedTypeList .m2-saved-type-copy');if(!button)return;var row=button.closest('.m2-saved-type-row'),rows=Array.from(document.querySelectorAll('#m2SavedTypeList .m2-saved-type-row')),index=rows.indexOf(row);if(index<0)return;event.preventDefault();event.stopImmediatePropagation();if(button.classList.contains('m2-saved-type-preview'))window.rafexInspectMrSavedV45(index);else window.rafexCopyMrSavedV45(index);
  },true); // __rafexMrSavedActionsV51
  installExtensionDisclosure();var disclosureScanPending=false;new MutationObserver(function(){if(disclosureScanPending)return;disclosureScanPending=true;requestAnimationFrame(function(){disclosureScanPending=false;installExtensionDisclosure();});}).observe(document.body,{childList:true,subtree:true});
  document.addEventListener('pointerdown',function(event){
    if(event.button!=null&&event.button!==0||event.isPrimary===false)return;
    if(typeof m2LayoutTool!=='undefined'&&m2LayoutTool==='measure'){lastMrPointerTap={id:null,at:0};return;}
    var node=event.target?.closest?.('#m2LayoutSvg [data-rack]'),rack=node&&rackById(node.dataset.rack);if(!isMr(rack)){lastMrPointerTap={id:null,at:0};return;}if(typeof m2CustomizeMode!=='undefined'&&m2CustomizeMode){lastMrPointerTap={id:null,at:0};event.preventDefault();event.stopImmediatePropagation();openMrCustomize(rack);return;}
    var now=Date.now(),same=Number(lastMrPointerTap.id)===Number(rack.id)&&now-lastMrPointerTap.at<520;
    if(!same){lastMrPointerTap={id:rack.id,at:now};return;}
    lastMrPointerTap={id:null,at:0};suppressMrDblClickUntil=now+700;event.preventDefault();event.stopImmediatePropagation();try{m2LayoutState.drag=null;}catch(e){}wrappedStart(rack.id);
  },true);
  document.addEventListener('dblclick',function(event){if(typeof m2LayoutTool!=='undefined'&&m2LayoutTool==='measure')return;var node=event.target?.closest?.('#m2LayoutSvg [data-rack]'),rack=node&&rackById(node.dataset.rack);if(!isMr(rack))return;event.preventDefault();event.stopImmediatePropagation();if(Date.now()<suppressMrDblClickUntil)return;wrappedStart(rack.id);},true);
})();</script>`;

  const bodyEnd = html.lastIndexOf("</body>");
  if (bodyEnd < 0) throw new Error("MR v35: body kapanisi bulunamadi.");
  html = html.slice(0, bodyEnd) + runtime + "\n" + html.slice(bodyEnd);
  for (const required of [marker, "__rafexMrPointerDoubleTapV36", "__rafexMrExtensionGeometryV72", "rafexMrConfigFromRackV37", "__rafexMrSectionCaptureV38", "function buildMRCard(group,index)", "rafex-v38-mr-type-card", "data-rafex-system=\"mr\"", "x==='b2b'||x==='mekik2'||x==='mr'", "if(document.activeElement===input)input.blur()", "rafexProjectMrObstacleV40", "rafexCommitMrObstacleV40", "DUVARA KALAN", "KOLONA KALAN", "RAFA KALAN", "rafex-mr-customize-v37", "MR 3D RAF ÖNİZLEMESİ", "addEventListener('pointerdown'", "rafexMrExtensionPlan", "Kalan MR Bölümü", "Özel Rafı Oluştur", "netRemaining>500", "step=\"50\"", "rafex-extension-disclosure-v42", "rafexMrQuantitySummaryV42", "__rafexMrExactQuantitiesV42", "rafexInspectMrSavedV45", "rafexCopyMrSavedV45", "rowCount:rowCount", "rowGap:rowGap", "Math.min(3,Number(state.dimensionScale)||2)", "inspectConfig.dimensionScale=Math.max(2", "<small>GENİŞLİK</small>"]) {
    if (!html.includes(required)) throw new Error(`MR v35 runtime dogrulama hatasi: ${required}`);
  }
  const encoded = Buffer.from(html, "utf8").toString("base64");
  worker = worker.slice(0, match.index) + match[1] + match[2] + encoded + match[2] + worker.slice(match.index + match[0].length);
  fs.writeFileSync(workerPath, worker);
  console.log("MR v42 runtime: acilir uzatma blogu, tam bagimsiz ayirma ve ortak-ayak duyarlı kesin MR adetleri eklendi.");
} else {
  throw new Error("Kullanim: node scripts/patch-mr-free-extension-v35.mjs source|runtime");
}
