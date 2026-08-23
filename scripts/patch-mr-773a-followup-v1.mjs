import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const viewerPath = path.join(root, "client", "mr-viewer.entry.js");
const portalPath = path.join(root, "portal.html");

function replaceRequired(source, from, to, label) {
  if (source.includes(to)) return source;
  if (!source.includes(from)) throw new Error(`MR 773a v3: ${label} bulunamadi.`);
  return source.replace(from, to);
}

const originalConfigHead = `    const levelGap = bounded(config.levelGap, 1000, 100, 5000);
    const topTraverse = firstTraverse + Math.max(0, levels - 1) * levelGap;
    const uprightType = config.uprightType === "MR60" ? "MR60" : "MR60";
    const uprightThickness = [1.5, 2].includes(Number(config.uprightThickness)) ? Number(config.uprightThickness) : 1.5;
    const traverseType = ["ZS35", "ZS55", "ZS65"].includes(config.traverseType) ? config.traverseType : "ZS65";
    const traverseThickness = [1.5, 2].includes(Number(config.traverseThickness)) ? Number(config.traverseThickness) : 1.5;
    const traverseHeight = { ZS35: 55, ZS55: 75, ZS65: 85 }[traverseType];`;

const fittedConfigHead = `    const levelGap = bounded(config.levelGap, 1000, 100, 5000);
    const uprightType = config.uprightType === "MR60" ? "MR60" : "MR60";
    const uprightThickness = [1.5, 2].includes(Number(config.uprightThickness)) ? Number(config.uprightThickness) : 1.5;
    const traverseType = ["ZS35", "ZS55", "ZS65"].includes(config.traverseType) ? config.traverseType : "ZS65";
    const traverseThickness = [1.5, 2].includes(Number(config.traverseThickness)) ? Number(config.traverseThickness) : 1.5;
    const traverseHeight = { ZS35: 55, ZS55: 75, ZS65: 85 }[traverseType];
    // Kat arasi, iki travers arasindaki NET bosluktur. Her yeni kat konumuna
    // secilen travers yuksekligi de eklenir.
    const levelPitch = levelGap + traverseHeight;
    const topTraverse = firstTraverse + Math.max(0, levels - 1) * levelPitch;
    const automaticUprightHeight = topTraverse + traverseHeight + levelGap / 2;
    const requestedUprightHeight = Number(config.uprightHeight);
    // Manuel ayak boyu kat aralarini degistirmez; fark sadece en ust uzatmaya gider.
    const uprightHeight = Number.isFinite(requestedUprightHeight)
      ? Math.max(topTraverse + traverseHeight, requestedUprightHeight)
      : automaticUprightHeight;`;

const originalLevelYs = `      const levelYs = Array.from({ length: levels }, (_, index) => firstTraverse + index * levelGap);`;
const fittedLevelYs = `      const levelYs = Array.from({ length: levels }, (_, index) => firstTraverse + index * (levelGap + traverseHeight));`;

const originalDimensions = [
  '    if (this.config.dimensions.levels) levelYs.forEach((height, index) => {',
  '      const from = index === 0 ? 0 : levelYs[index - 1], label = index === 0 ? `ZEMİN → K1 · ${this.dimensionValue(height)}` : `K${index} → K${index+1} · ${this.dimensionValue(height-from)}`;',
  '      this.addVerticalDimension(layer, x, z, from, height, label, 0, index === 0 ? "firstTraverse" : "levelGap");',
  '    });',
  '    if (this.config.dimensions.markers) {',
  '      const topTraverse = levelYs.at(-1) || 0; this.addVerticalDimension(layer, totalWidth+280, z, topTraverse, uprightHeight, `SON KAT ÜSTÜ · ${this.dimensionValue(uprightHeight-topTraverse)}`, totalWidth, "topTraverse");',
  '      this.addDimensionLabel(layer, totalWidth+510, uprightHeight, z, `AYAK BOYU · ${this.dimensionValue(uprightHeight)}`, 760, "topTraverse");',
  '    }'
].join("\n");

const fittedDimensions = [
  '    if (this.config.dimensions.levels) levelYs.forEach((height, index) => {',
  '      const from = index === 0 ? 0 : levelYs[index - 1] + this.config.traverseHeight;',
  '      const value = height - from;',
  '      const label = index === 0 ? `ZEMİN → K1 · ${this.dimensionValue(height)}` : `K${index} → K${index+1} NET · ${this.dimensionValue(value)}`;',
  '      this.addVerticalDimension(layer, x, z, from, height, label, 0, index === 0 ? "firstTraverse" : "levelGap");',
  '    });',
  '    if (this.config.dimensions.markers) {',
  '      this.addDimensionLabel(layer, totalWidth+510, uprightHeight, z, `AYAK BOYU · ${this.dimensionValue(uprightHeight)}`, 760, "uprightHeight");',
  '    }'
].join("\n");

const originalTraverseScale = `            beam.scale.set(width / traverse.size.x, traverseHeight / traverse.size.y, 1);`;
const fittedTraverseScale = `            // Extend the ZS traverse to the upright centre lines so the GLB end
            // brackets engage the MR60 posts instead of stopping in the clear bay.
            const beamOverlap = uprightWidth / 2;
            beam.scale.set((width + beamOverlap * 2) / traverse.size.x, traverseHeight / traverse.size.y, 1);`;

const wrongTraverse = `            if (side === "front") {
              beam.rotation.y = Math.PI;
              beam.position.set(moduleX + width, levelY, beamDepth);
            } else {
              beam.position.set(moduleX, levelY, Math.max(0, depth - beamDepth));
            }`;

const previousCorrectTraverse = `            // 773a baseline follow-up: ZS travers end brackets must mount to the
            // MR Ayak Toplama GLB in the same handed orientation on both sides.
            if (side === "front") {
              beam.position.set(moduleX, levelY, 0);
            } else {
              beam.rotation.y = Math.PI;
              beam.position.set(moduleX + width, levelY, depth);
            }`;

const correctTraverse = `            // 773a baseline follow-up: ZS travers end brackets must mount to the
            // MR Ayak Toplama GLB in the same handed orientation on both sides.
            // The beam reaches the centre of each 60 mm upright (30 mm engagement per side).
            if (side === "front") {
              beam.position.set(moduleX - beamOverlap, levelY, 0);
            } else {
              beam.rotation.y = Math.PI;
              beam.position.set(moduleX + width + beamOverlap, levelY, depth);
            }`;

const originalTray = `              shelf.scale.set(pieceWidth / tray.size.x, 1, depth / tray.size.z);
              shelf.rotation.x = Math.PI;
              shelf.position.set(moduleX + cursor, levelY + traverseHeight + tray.size.y - 50, depth);`;

const fittedTray = `              // Leave 10 mm clearance at the front and back and lift the tray 10 mm.
              const trayDepth = Math.max(1, depth - 20);
              shelf.scale.set(pieceWidth / tray.size.x, 1, trayDepth / tray.size.z);
              shelf.rotation.x = Math.PI;
              shelf.position.set(moduleX + cursor, levelY + traverseHeight + tray.size.y - 40, depth - 10);`;

let viewer = fs.readFileSync(viewerPath, "utf8");
viewer = replaceRequired(viewer, originalConfigHead, fittedConfigHead, "ayak otomatik hesap formulu");
viewer = replaceRequired(viewer, "      uprightHeight: topTraverse + levelGap / 2,", "      uprightHeight,", "ayak boyu config degeri");
viewer = replaceRequired(viewer, originalLevelYs, fittedLevelYs, "kat konumlari");
viewer = replaceRequired(viewer, originalDimensions, fittedDimensions, "net kat ve ust yarim kat olculeri");
viewer = replaceRequired(viewer, originalTraverseScale, fittedTraverseScale, "travers olcekleme");

if (viewer.includes(wrongTraverse)) {
  viewer = viewer.replace(wrongTraverse, correctTraverse);
} else if (viewer.includes(previousCorrectTraverse)) {
  viewer = viewer.replace(previousCorrectTraverse, correctTraverse);
} else if (!viewer.includes(correctTraverse)) {
  throw new Error("MR 773a v3: beklenen travers yerlesim blogu bulunamadi.");
}

viewer = replaceRequired(viewer, originalTray, fittedTray, "tava yerlesimi");
fs.writeFileSync(viewerPath, viewer);
console.log("MR 773a v3: ayak boyu = K1 + traversler + net kat aralari + son net katin yarisi olarak hesaplandi.");
console.log("MR 773a v3: manuel ayak boyu kat aralarini degistirmeden sadece ust uzatmayi degistiriyor.");
console.log("MR 773a v3: travers ayaga 30 mm oturuyor; tavalar 10+10 mm kisa ve 10 mm yukarida.");

let portal = fs.readFileSync(portalPath, "utf8");
const runtimeMarker = 'data-rafex-mr-773a-followup="v1"';

const configStart = portal.indexOf("      mrConfigurationV2=function(){");
const configEnd = portal.indexOf("      mrUpdateSummary=function", configStart);
if (configStart < 0 || configEnd < 0) throw new Error("MR 773a v3: konfigurasyon blogu bulunamadi.");
const configBlock = [
  '      mrConfigurationV2=function(){',
  '        const levels=Math.max(1,Math.min(15,Math.round(Number($("mrLevels")?.value)||4)));',
  '        const firstTraverse=Math.max(0,Number($("mrFirstTraverse")?.value)||200);',
  '        const requestedLevelGap=Math.max(100,Number($("mrLevelGap")?.value)||1000);',
  '        const [uprightType="MR60",uprightThicknessText="1.5"]=String($("mrUprightType")?.value||"MR60|1.5").split("|");',
  '        const [traverseType="ZS65",traverseThicknessText="1.5"]=String($("mrTraverseType")?.value||"ZS65|1.5").split("|");',
  '        const traverseHeight={ZS35:55,ZS55:75,ZS65:85}[traverseType]||85;',
  '        const levelGap=requestedLevelGap,levelPitch=levelGap+traverseHeight;',
  '        const height=firstTraverse+Math.max(0,levels-1)*levelPitch;',
  '        const automaticUprightHeight=height+traverseHeight+levelGap/2;',
  '        const topTraverseMode=$("mrTopTraverseMode")?.value==="manual"?"manual":"auto";',
  '        const enteredUprightHeight=Number($("mrHeight")?.value);',
  '        const manualUprightHeight=Math.max(height+traverseHeight,Number.isFinite(enteredUprightHeight)?enteredUprightHeight:automaticUprightHeight);',
  '        const uprightHeight=topTraverseMode==="manual"?manualUprightHeight:automaticUprightHeight;',
  '        const topExtension=Math.max(0,uprightHeight-(height+traverseHeight));',
  '        return{modules:Math.max(1,Number($("mrModuleCount")?.value)||1),levels,width:Math.max(300,Number($("mrSectionWidth")?.value)||2400),depth:Math.max(300,Number($("mrDepth")?.value)||800),firstTraverse,levelGap,requestedLevelGap,height,automaticUprightHeight,topExtension,topTraverseMode,uprightHeight,uprightType,uprightThickness:Number(uprightThicknessText)||1.5,uprightWidth:60,traverseType,traverseThickness:Number(traverseThicknessText)||1.5,traverseHeight,uprightFinish:$("mrUprightFinish")?.value||"ral5010",traverseFinish:$("mrTraverseFinish")?.value||"ral1007",accessories:mrAccessoryStateV5(),dimensions:{levels:$("mrShowLevelDims")?.checked!==false,markers:$("mrShowMarkers")?.checked!==false,width:$("mrShowWidth")?.checked!==false,depth:$("mrShowDepth")?.checked!==false},dimensionScale:Math.max(.7,Math.min(1.5,Number($("mrDimensionScale")?.value)||1))}',
  '      };'
].join("\n") + "\n";
portal = portal.slice(0, configStart) + configBlock + portal.slice(configEnd);

const summaryStart = portal.indexOf("      mrUpdateSummary=function", configStart);
const summaryEnd = portal.indexOf("      mrLayoutDrawingV4=function", summaryStart);
if (summaryStart < 0 || summaryEnd < 0) throw new Error("MR 773a v3: ozet blogu bulunamadi.");
const summaryBlock = [
  '      mrUpdateSummary=function(refresh3d=false){const{modules,width,depth,levels,height,uprightHeight,firstTraverse,levelGap,topExtension,topTraverseMode,uprightWidth,uprightType,uprightThickness,traverseType,traverseThickness,traverseHeight}=mrConfigurationV2(),totalWidth=modules*width+(modules+1)*uprightWidth;const heightInput=$("mrHeight");if(heightInput){heightInput.disabled=topTraverseMode!=="manual";if(topTraverseMode!=="manual"||document.activeElement!==heightInput)heightInput.value=String(Math.round(uprightHeight))}if($("mrTotalWidth"))$("mrTotalWidth").textContent=`${fmt(totalWidth)} mm`;if($("mrFootprint"))$("mrFootprint").textContent=`${fmt(totalWidth)} × ${fmt(depth)} mm`;if($("mrLevelSummary"))$("mrLevelSummary").textContent=`${levels} kat · ${modules} modül · ${uprightType} ${String(uprightThickness).replace(".",",")} mm · ${traverseType} ${String(traverseThickness).replace(".",",")} mm / H ${fmt(traverseHeight)}`;if($("mrDistanceSummary"))$("mrDistanceSummary").textContent=`K1 ${fmt(firstTraverse)} mm · kat arası NET ${fmt(levelGap)} mm · travers ${fmt(traverseHeight)} mm · son travers alt kotu ${fmt(height)} mm · ayak ${fmt(uprightHeight)} mm`;if(refresh3d){clearTimeout(window.__rafexMrBuildTimer);window.__rafexMrBuildTimer=setTimeout(()=>mrViewerInstance?.setConfiguration?.(mrConfigurationV2()),320)}};',
  ''
].join("\n");
portal = portal.slice(0, summaryStart) + summaryBlock + portal.slice(summaryEnd);

portal = portal.replace(/Son travers kotu \(mm\)/g, "Ayak boyu (mm)");
portal = portal.replace(/aria-label="Son travers kotu modu"/g, 'aria-label="Ayak boyu modu"');
portal = portal.replace('if($("mrHeight"))$("mrHeight").value=String(settings.height??drawing.totalRackHeight??3300);', 'if($("mrHeight"))$("mrHeight").value=String(settings.uprightHeight??drawing.sideUprightHeight??settings.height??drawing.totalRackHeight??3300);');
portal = portal.replace('if(key==="topTraverse"&&$("mrTopTraverseMode"))', 'if((key==="topTraverse"||key==="uprightHeight")&&$("mrTopTraverseMode"))');
portal = portal.replace('topTraverse:"mrHeight",width:"mrSectionWidth"', 'topTraverse:"mrHeight",uprightHeight:"mrHeight",width:"mrSectionWidth"');

const oldFrontFormula = 'const settings=drawing.b2b||{},modules=Math.max(1,Number(settings.modules)||Number(drawing.bays)||1),levels=Math.max(1,Number(settings.levels)||Number(drawing.levels)||1),width=Math.max(300,Number(settings.width)||Number(drawing.palW)||2400),first=Math.max(0,Number(settings.firstTraverse)||200),gap=Math.max(100,Number(settings.levelGap)||1000),topTraverse=first+Math.max(0,levels-1)*gap,uprightHeight=Math.max(topTraverse+gap/2,Number(settings.uprightHeight)||Number(drawing.sideUprightHeight)||0),extension=uprightHeight-topTraverse,upright=';
const newFrontFormula = 'const settings=drawing.b2b||{},modules=Math.max(1,Number(settings.modules)||Number(drawing.bays)||1),levels=Math.max(1,Number(settings.levels)||Number(drawing.levels)||1),width=Math.max(300,Number(settings.width)||Number(drawing.palW)||2400),first=Math.max(0,Number(settings.firstTraverse)||200),gap=Math.max(100,Number(settings.levelGap)||1000),traverseHeight=Math.max(1,Number(settings.traverseHeight)||85),pitch=gap+traverseHeight,topTraverse=first+Math.max(0,levels-1)*pitch,uprightHeight=Math.max(topTraverse+traverseHeight,Number(settings.uprightHeight)||Number(drawing.sideUprightHeight)||topTraverse+traverseHeight+gap/2),extension=Math.max(0,uprightHeight-(topTraverse+traverseHeight)),upright=';
portal = replaceRequired(portal, oldFrontFormula, newFrontFormula, "on rapor ayak formulu");
portal = replaceRequired(portal, 'for(let level=1;level<=levels;level++){const height=first+(level-1)*gap,y=mapY(height);', 'for(let level=1;level<=levels;level++){const height=first+(level-1)*pitch,y=mapY(height);', "on rapor kat konumlari");
portal = portal.replaceAll('level===1?0:first+(level-2)*gap', 'level===1?0:first+(level-2)*pitch+traverseHeight');

const oldSideFormula = 'const settings=drawing.b2b||{},levels=Math.max(1,Number(settings.levels)||Number(drawing.levels)||1),depth=Math.max(300,Number(settings.depth)||Number(drawing.railLength)||800),first=Math.max(0,Number(settings.firstTraverse)||200),gap=Math.max(100,Number(settings.levelGap)||1000),topTraverse=first+Math.max(0,levels-1)*gap,uprightHeight=Math.max(topTraverse+gap/2,Number(settings.uprightHeight)||Number(drawing.sideUprightHeight)||0),upright=';
const newSideFormula = 'const settings=drawing.b2b||{},levels=Math.max(1,Number(settings.levels)||Number(drawing.levels)||1),depth=Math.max(300,Number(settings.depth)||Number(drawing.railLength)||800),first=Math.max(0,Number(settings.firstTraverse)||200),gap=Math.max(100,Number(settings.levelGap)||1000),traverseHeight=Math.max(1,Number(settings.traverseHeight)||85),pitch=gap+traverseHeight,topTraverse=first+Math.max(0,levels-1)*pitch,uprightHeight=Math.max(topTraverse+traverseHeight,Number(settings.uprightHeight)||Number(drawing.sideUprightHeight)||topTraverse+traverseHeight+gap/2),upright=';
portal = replaceRequired(portal, oldSideFormula, newSideFormula, "yan rapor ayak formulu");
portal = replaceRequired(portal, 'mapY(first+(level-1)*gap)', 'mapY(first+(level-1)*pitch)', "yan rapor kat konumlari");

if (!portal.includes(runtimeMarker)) {
  // Ayak ve travers tipi, formun sonunda ve Aksesuar Ekle'nin hemen üstünde
  // kalır. Bu alanları 3D altındaki Kaydet paneline taşımıyoruz.
  const style = `\n    <style ${runtimeMarker}>.mr-mode .mr-profile-field{display:grid;gap:5px;color:#425148;font-size:9px;font-weight:800}</style>\n`;
  if (!portal.includes("</head>")) throw new Error("MR 773a v3: head kapanisi bulunamadi.");
  portal = portal.replace("</head>", `${style}</head>`);
}

portal = portal.replace(/\/mr-viewer\.js\?v=[^\"'`<\s]+/g, "/mr-viewer.js?v=mr-layout-v48");
fs.writeFileSync(portalPath, portal);
console.log("MR 773a v3: ayak otomatik/manual hesap kurali ve rapor kat konumlari uygulandi.");
