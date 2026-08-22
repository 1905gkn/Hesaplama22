import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const portalPath = path.join(root, "portal.html");
const viewerPath = path.join(root, "client", "mr-viewer.entry.js");

function replaceRequired(source, from, to, label) {
  if (source.includes(to)) return source;
  if (!source.includes(from)) throw new Error(`MR v15: ${label} bulunamadi`);
  return source.replace(from, to);
}

const round50 = "Math.ceil(Math.max(0, Number(config.uprightHeight) || topTraverse) / 50) * 50";

let viewer = fs.readFileSync(viewerPath, "utf8");
viewer = replaceRequired(
  viewer,
  "new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.92, metalness: 0 })",
  "new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, metalness: 0 })",
  "zemin malzemesi"
);
viewer = replaceRequired(
  viewer,
  "    this.grid.position.y = 1;\n    this.scene.add(this.grid);",
  "    this.grid.position.y = 1;\n    this.grid.visible = false;\n    this.scene.add(this.grid);",
  "temiz zemin"
);
viewer = replaceRequired(
  viewer,
  "      uprightHeight: topTraverse + levelGap / 2,",
  `      uprightHeight: Math.max(topTraverse, ${round50}),`,
  "ayak boyu"
);
viewer = replaceRequired(
  viewer,
  "      const beamDepth = Math.max(1, traverse.size.z);\n      const trayAccessories = this.config.accessories.filter((item) => item.type === \"tray\");\n      for (let module = 0; module < modules; module += 1) {\n        const moduleX = module * framePitch + uprightWidth;",
  "      const beamDepth = Math.max(1, traverse.size.z);\n      const trayAccessories = this.config.accessories.filter((item) => item.type === \"tray\");\n      for (let module = 0; module < modules; module += 1) {\n        // MR ayak toplama mantigi: travers iki 60 mm ayagin merkez eksenine kadar girer.\n        const beamLength = width + uprightWidth;\n        const moduleX = module * framePitch + uprightWidth / 2;",
  "travers ayak ekseni"
);
viewer = replaceRequired(
  viewer,
  "            beam.scale.set(width / traverse.size.x, traverseHeight / traverse.size.y, 1);\n            if (side === \"front\") {\n              beam.rotation.y = Math.PI;\n              beam.position.set(moduleX + width, levelY, beamDepth);\n            } else {\n              beam.position.set(moduleX, levelY, Math.max(0, depth - beamDepth));\n            }",
  "            beam.scale.set(beamLength / traverse.size.x, traverseHeight / traverse.size.y, 1);\n            if (side === \"front\") {\n              beam.rotation.y = Math.PI;\n              beam.position.set(moduleX + beamLength, levelY, beamDepth);\n            } else {\n              beam.position.set(moduleX, levelY, Math.max(0, depth - beamDepth));\n            }",
  "travers yerlesimi"
);
viewer = replaceRequired(
  viewer,
  "    if (this.config.dimensions.markers) {\n      const topTraverse = levelYs.at(-1) || 0; this.addVerticalDimension(layer, totalWidth+280, z, topTraverse, uprightHeight, `SON KAT ÜSTÜ · ${this.dimensionValue(uprightHeight-topTraverse)}`, totalWidth, \"topTraverse\");\n      this.addDimensionLabel(layer, totalWidth+510, uprightHeight, z, `AYAK BOYU · ${this.dimensionValue(uprightHeight)}`, 760, \"topTraverse\");\n    }",
  "    if (this.config.dimensions.markers) {\n      this.addDimensionLabel(layer, totalWidth+510, uprightHeight, z, `AYAK BOYU · ${this.dimensionValue(uprightHeight)}`, 760, \"uprightHeight\");\n    }",
  "ust uzatma olcusu"
);
viewer = replaceRequired(
  viewer,
  "      const gridSize = Math.max(1800, this.size.x, this.size.z) * 2.2;\n      this.grid.scale.setScalar(gridSize / 12000);\n      this.ground.scale.set(gridSize, gridSize, 1);",
  "      const gridSize = Math.max(1800, this.size.x, this.size.z) * 2.2;\n      this.grid.scale.setScalar(gridSize / 12000);\n      this.ground.geometry.dispose();\n      this.ground.geometry = new THREE.PlaneGeometry(Math.max(this.size.x * 1.55, 7000), Math.max(this.size.z * 2.4, 7000));\n      this.ground.position.set(this.center.x, this.bounds.min.y - 12, this.center.z);",
  "zemin boyutu"
);
fs.writeFileSync(viewerPath, viewer);

let portal = fs.readFileSync(portalPath, "utf8");
portal = portal.replace(/\/mr-viewer\.js\?v=mr-system-\d+/g, "/mr-viewer.js?v=mr-system-15");

// Kaynak UI'da Son travers kotu tamamen kalkar; tek alan Ayak boyudur.
const oldHeightBlock = 'heightLabel.innerHTML=`Son travers kotu (mm)<div class="mr-height-mode"><select id="mrTopTraverseMode" aria-label="Son travers kotu modu"><option value="auto">Otomatik</option><option value="manual">Manuel</option></select><input id="mrHeight" type="number" min="200" max="12000" step="10" value="3300" placeholder="Otomatik hesaplanır" disabled></div>`;';
const newHeightBlock = 'heightLabel.innerHTML=`Ayak boyu (mm)<input id="mrHeight" type="number" min="200" max="30000" step="10" value="3200">`;';
portal = replaceRequired(portal, oldHeightBlock, newHeightBlock, "Ayak boyu UI");
portal = portal.replace('heightLabel.classList.add("mr-top-traverse-field");', 'heightLabel.classList.add("mr-upright-height-field");');

const configStart = portal.indexOf("      mrConfigurationV2=function(){");
const configEnd = portal.indexOf("      mrUpdateSummary=function", configStart);
if (configStart < 0 || configEnd < 0) throw new Error("MR v15: konfigurasyon blogu bulunamadi");
const configBlock = `      mrConfigurationV2=function(){
        const levels=Math.max(1,Math.min(15,Math.round(Number($("mrLevels")?.value)||4)));
        const firstTraverse=Math.max(0,Number($("mrFirstTraverse")?.value)||200);
        const requestedLevelGap=Math.max(100,Number($("mrLevelGap")?.value)||1000);
        const topTraverse=firstTraverse+Math.max(0,levels-1)*requestedLevelGap;
        const requestedUpright=Math.max(topTraverse,Number($("mrHeight")?.value)||topTraverse);
        const uprightHeight=Math.ceil(requestedUpright/50)*50;
        const [uprightType="MR60",uprightThicknessText="1.5"]=String($("mrUprightType")?.value||"MR60|1.5").split("|"),[traverseType="ZS65",traverseThicknessText="1.5"]=String($("mrTraverseType")?.value||"ZS65|1.5").split("|"),traverseHeight={ZS35:55,ZS55:75,ZS65:85}[traverseType]||85;
        return{modules:Math.max(1,Number($("mrModuleCount")?.value)||1),levels,width:Math.max(300,Number($("mrSectionWidth")?.value)||2400),depth:Math.max(300,Number($("mrDepth")?.value)||800),firstTraverse,levelGap:requestedLevelGap,requestedLevelGap,height:topTraverse,uprightHeight,uprightType,uprightThickness:Number(uprightThicknessText)||1.5,uprightWidth:60,traverseType,traverseThickness:Number(traverseThicknessText)||1.5,traverseHeight,uprightFinish:$("mrUprightFinish")?.value||"ral5010",traverseFinish:$("mrTraverseFinish")?.value||"ral1007",accessories:mrAccessoryStateV5(),dimensions:{levels:$("mrShowLevelDims")?.checked!==false,markers:$("mrShowMarkers")?.checked!==false,width:$("mrShowWidth")?.checked!==false,depth:$("mrShowDepth")?.checked!==false},dimensionScale:Math.max(.7,Math.min(1.5,Number($("mrDimensionScale")?.value)||1))}
      };
`;
portal = portal.slice(0, configStart) + configBlock + portal.slice(configEnd);

const summaryStart = portal.indexOf("      mrUpdateSummary=function");
const summaryEnd = portal.indexOf("      mrLayoutDrawingV4=function", summaryStart);
if (summaryStart < 0 || summaryEnd < 0) throw new Error("MR v15: ozet blogu bulunamadi");
const summaryBlock = `      mrUpdateSummary=function(refresh3d=false){const{modules,width,depth,levels,height,uprightHeight,firstTraverse,levelGap,uprightWidth,uprightType,uprightThickness,traverseType,traverseThickness,traverseHeight}=mrConfigurationV2(),totalWidth=modules*width+(modules+1)*uprightWidth;if($("mrTotalWidth"))$("mrTotalWidth").textContent=\`${'${fmt(totalWidth)}'} mm\`;if($("mrFootprint"))$("mrFootprint").textContent=\`${'${fmt(totalWidth)}'} × ${'${fmt(depth)}'} mm\`;if($("mrLevelSummary"))$("mrLevelSummary").textContent=\`${'${levels}'} kat · ${'${modules}'} modül · ${'${uprightType}'} ${'${String(uprightThickness).replace(".",",")}'} mm · ${'${traverseType}'} ${'${String(traverseThickness).replace(".",",")}'} mm / H ${'${fmt(traverseHeight)}'}\`;if($("mrDistanceSummary"))$("mrDistanceSummary").textContent=\`K1 ${'${fmt(firstTraverse)}'} mm · kat arası ${'${fmt(levelGap)}'} mm · ayak boyu ${'${fmt(uprightHeight)}'} mm\`;if(refresh3d){clearTimeout(window.__rafexMrBuildTimer);window.__rafexMrBuildTimer=setTimeout(()=>mrViewerInstance?.setConfiguration?.(mrConfigurationV2()),220)}};
`;
portal = portal.slice(0, summaryStart) + summaryBlock + portal.slice(summaryEnd);

// Kayit/geri yuklemede ayak boyu korunur.
portal = portal.replace('if($("mrHeight"))$("mrHeight").value=String(settings.height??drawing.totalRackHeight??3300);', 'if($("mrHeight"))$("mrHeight").value=String(settings.uprightHeight??drawing.sideUprightHeight??settings.height??drawing.totalRackHeight??3200);');

// 3D olcu tiklamasi Ayak boyuna gider; eski topTraverse davranisi yoktur.
const openStart = portal.indexOf('      window.mrOpenMeasureV12=(key="")=>');
const renderStart = portal.indexOf('      renderMR=function(){', openStart);
if (openStart >= 0 && renderStart > openStart) {
  portal = portal.slice(0, openStart) + `      window.mrOpenMeasureV12=(key="")=>{const panel=$("mrMeasureOverlay");if(panel)panel.open=true;const target={firstTraverse:"mrFirstTraverse",levelGap:"mrLevelGap",topTraverse:"mrHeight",uprightHeight:"mrHeight",width:"mrSectionWidth",depth:"mrDepth"}[key];if(target)setTimeout(()=>{const input=$(target);input?.scrollIntoView?.({behavior:"smooth",block:"center"});input?.focus?.();input?.select?.()},40)};\n` + portal.slice(renderStart);
}

// Inputtan cikildiginda 50 mm yukariya yuvarla; kat araliklarini degistirme.
portal = portal.replace('if(event.target?.matches?.("#mrUprightFinish,#mrTraverseFinish,#mrTopTraverseMode,#mrUprightType,#mrTraverseType"))sync()', 'if(event.target?.id==="mrHeight"){event.target.value=String(Math.ceil(Math.max(0,Number(event.target.value)||0)/50)*50);sync()}else if(event.target?.matches?.("#mrUprightFinish,#mrTraverseFinish,#mrUprightType,#mrTraverseType"))sync()');

// Rapor metninde ust uzatma ifadesi kalmasin.
portal = portal.replace('· ÜST UZATMA ${fmt(extension)} mm', '');

portal = portal.replace(/<style\s+data-rafex-mr-safe-v13="1">[\s\S]*?<\/style>\s*/g, "");
const style = `<style data-rafex-mr-safe-v13="1">
.mr-mode .mr-upright-height-field{grid-column:1/-1!important;min-width:0!important}
.mr-mode .mr-upright-height-field input{width:100%!important;min-width:0!important}
.mr-mode .mr-measure-overlay{top:12px!important;bottom:auto!important;left:12px!important;width:min(390px,calc(100% - 24px))!important;max-height:calc(100% - 24px)!important}
.mr-mode .mr-measure-overlay .mr-distance-panel{max-height:330px!important;overflow:auto!important}
.mr-mode .mr-measure-overlay input[type=number]{min-height:36px!important;padding:7px 9px!important;border:1px solid #d8e1db!important;border-radius:7px!important;background:#fff!important}
@media(max-width:700px){.mr-mode .mr-measure-overlay{top:8px!important;left:8px!important;width:calc(100% - 16px)!important}}
</style>`;
const headEnd = portal.indexOf("</head>");
if (headEnd < 0) throw new Error("MR v15: head kapanisi bulunamadi");
portal = portal.slice(0, headEnd) + style + "\n  " + portal.slice(headEnd);
fs.writeFileSync(portalPath, portal);

console.log("MR v15: Ayak boyu, sabit kat araliklari ve ayak-toplama travers ekseni uygulandi.");
