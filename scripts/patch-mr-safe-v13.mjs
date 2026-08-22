import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const portalPath = path.join(root, "portal.html");
const viewerPath = path.join(root, "client", "mr-viewer.entry.js");

function replaceRequired(source, from, to, label) {
  if (source.includes(to)) return source;
  if (!source.includes(from)) throw new Error(`MR v14: ${label} bulunamadi`);
  return source.replace(from, to);
}

let viewer = fs.readFileSync(viewerPath, "utf8");
viewer = replaceRequired(
  viewer,
  "new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.92, metalness: 0 })",
  "new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, metalness: 0 })",
  "B2B zemin malzemesi"
);
viewer = replaceRequired(
  viewer,
  "    this.grid.position.y = 1;\n    this.scene.add(this.grid);",
  "    this.grid.position.y = 1;\n    this.grid.visible = false;\n    this.scene.add(this.grid);",
  "B2B gibi temiz zemin"
);
viewer = replaceRequired(
  viewer,
  "      const gridSize = Math.max(1800, this.size.x, this.size.z) * 2.2;\n      this.grid.scale.setScalar(gridSize / 12000);\n      this.ground.scale.set(gridSize, gridSize, 1);",
  "      const gridSize = Math.max(1800, this.size.x, this.size.z) * 2.2;\n      this.grid.scale.setScalar(gridSize / 12000);\n      this.ground.geometry.dispose();\n      this.ground.geometry = new THREE.PlaneGeometry(Math.max(this.size.x * 1.55, 7000), Math.max(this.size.z * 2.4, 7000));\n      this.ground.position.set(this.center.x, this.bounds.min.y - 12, this.center.z);",
  "B2B zemin boyutlandirma"
);
viewer = replaceRequired(
  viewer,
  "      uprightHeight: topTraverse + levelGap / 2,",
  "      uprightHeight: bounded(config.uprightHeight, topTraverse, topTraverse, 30000),",
  "ayak boyu dogrudan kullanimi"
);
viewer = replaceRequired(
  viewer,
  "      const beamDepth = Math.max(1, traverse.size.z);\n      const trayAccessories = this.config.accessories.filter((item) => item.type === \"tray\");\n      for (let module = 0; module < modules; module += 1) {\n        const moduleX = module * framePitch + uprightWidth;",
  "      const beamDepth = Math.max(1, traverse.size.z);\n      const trayAccessories = this.config.accessories.filter((item) => item.type === \"tray\");\n      for (let module = 0; module < modules; module += 1) {\n        const beamLength = width + uprightWidth;\n        const moduleX = module * framePitch + uprightWidth / 2;",
  "travers ayak merkezlerine otursun"
);
viewer = replaceRequired(
  viewer,
  "            beam.scale.set(width / traverse.size.x, traverseHeight / traverse.size.y, 1);\n            if (side === \"front\") {\n              beam.rotation.y = Math.PI;\n              beam.position.set(moduleX + width, levelY, beamDepth);\n            } else {\n              beam.position.set(moduleX, levelY, Math.max(0, depth - beamDepth));\n            }",
  "            beam.scale.set(beamLength / traverse.size.x, traverseHeight / traverse.size.y, 1);\n            if (side === \"front\") {\n              beam.rotation.y = Math.PI;\n              beam.position.set(moduleX + beamLength, levelY, beamDepth);\n            } else {\n              beam.position.set(moduleX, levelY, Math.max(0, depth - beamDepth));\n            }",
  "traversleri ayak toplama eksenine yerlestirme"
);
viewer = replaceRequired(
  viewer,
  "    if (this.config.dimensions.markers) {\n      const topTraverse = levelYs.at(-1) || 0; this.addVerticalDimension(layer, totalWidth+280, z, topTraverse, uprightHeight, `SON KAT ÜSTÜ · ${this.dimensionValue(uprightHeight-topTraverse)}`, totalWidth, \"topTraverse\");\n      this.addDimensionLabel(layer, totalWidth+510, uprightHeight, z, `AYAK BOYU · ${this.dimensionValue(uprightHeight)}`, 760, \"topTraverse\");\n    }",
  "    if (this.config.dimensions.markers) {\n      this.addDimensionLabel(layer, totalWidth+510, uprightHeight, z, `AYAK BOYU · ${this.dimensionValue(uprightHeight)}`, 760, \"uprightHeight\");\n    }",
  "ust uzatma olcusunu kaldirma"
);
fs.writeFileSync(viewerPath, viewer);

let portal = fs.readFileSync(portalPath, "utf8");
portal = portal.replaceAll('/mr-viewer.js?v=mr-system-3', '/mr-viewer.js?v=mr-system-14');
portal = portal.replaceAll('/mr-viewer.js?v=mr-system-13', '/mr-viewer.js?v=mr-system-14');
portal = portal.replace(/<style\s+data-rafex-mr-safe-v13="1">[\s\S]*?<\/style>\s*/g, "");
const style = `<style data-rafex-mr-safe-v13="1">
/* MR alanlari okunakli kalsin. */
.mr-mode .mr-upright-height-field{grid-column:1/-1!important;min-width:0!important}
.mr-mode .mr-upright-height-field input{width:100%!important;min-width:0!important}
/* Olculer ve Mesafeler 3D'nin icinde kalir; B2B benzeri temiz, acilir panel. */
.mr-mode .mr-measure-overlay{top:12px!important;bottom:auto!important;left:12px!important;width:min(390px,calc(100% - 24px))!important;max-height:calc(100% - 24px)!important}
.mr-mode .mr-measure-overlay .mr-distance-panel{max-height:330px!important;overflow:auto!important}
.mr-mode .mr-measure-overlay input[type=number]{min-height:36px!important;padding:7px 9px!important;border:1px solid #d8e1db!important;border-radius:7px!important;background:#fff!important}
@media(max-width:700px){.mr-mode .mr-measure-overlay{top:8px!important;left:8px!important;width:calc(100% - 16px)!important}}
</style>`;
const headEnd = portal.indexOf("</head>");
if (headEnd < 0) throw new Error("MR v14: head kapanisi bulunamadi");
portal = portal.slice(0, headEnd) + style + "\n  " + portal.slice(headEnd);

portal = portal.replace(/\/\* RAFEX_MR_V14_START \*\/[\s\S]*?\/\* RAFEX_MR_V14_END \*\//g, "");
const runtime = `
      /* RAFEX_MR_V14_START */
      const mrConfigurationBeforeV14=mrConfigurationV2;
      mrConfigurationV2=function(){
        const base=mrConfigurationBeforeV14();
        const levels=Math.max(1,Math.min(15,Math.round(Number($("mrLevels")?.value)||4)));
        const firstTraverse=Math.max(0,Number($("mrFirstTraverse")?.value)||200);
        const requestedLevelGap=Math.max(100,Number($("mrLevelGap")?.value)||1000);
        const fallbackHeight=firstTraverse+Math.max(0,levels-1)*requestedLevelGap;
        const uprightHeight=Math.max(firstTraverse,Number($("mrHeight")?.value)||fallbackHeight);
        const levelGap=levels>1?(uprightHeight-firstTraverse)/(levels-1):requestedLevelGap;
        return {...base,levels,firstTraverse,requestedLevelGap,levelGap,height:uprightHeight,uprightHeight,topTraverseMode:"uprightHeight"};
      };
      mrUpdateSummary=function(refresh3d=false){
        const {modules,width,depth,levels,uprightHeight,firstTraverse,levelGap,uprightWidth,uprightType,uprightThickness,traverseType,traverseThickness,traverseHeight}=mrConfigurationV2(),totalWidth=modules*width+(modules+1)*uprightWidth;
        if($("mrTotalWidth"))$("mrTotalWidth").textContent=\`${fmt(totalWidth)} mm\`;
        if($("mrFootprint"))$("mrFootprint").textContent=\`${fmt(totalWidth)} × ${fmt(depth)} mm\`;
        if($("mrLevelSummary"))$("mrLevelSummary").textContent=\`${levels} kat · ${modules} modül · ${uprightType} ${String(uprightThickness).replace(".",",")} mm · ${traverseType} ${String(traverseThickness).replace(".",",")} mm / H ${fmt(traverseHeight)}\`;
        if($("mrDistanceSummary"))$("mrDistanceSummary").textContent=\`K1 ${fmt(firstTraverse)} mm · kat arası ${fmt(levelGap)} mm · ayak boyu ${fmt(uprightHeight)} mm\`;
        if(refresh3d){clearTimeout(window.__rafexMrBuildTimer);window.__rafexMrBuildTimer=setTimeout(()=>mrViewerInstance?.setConfiguration?.(mrConfigurationV2()),220)}
      };
      const mrApplyDrawingToFormBeforeV14=mrApplyDrawingToFormV4;
      mrApplyDrawingToFormV4=function(drawing,projectName=""){
        mrApplyDrawingToFormBeforeV14(drawing,projectName);
        if(!drawing?.b2b?.mr)return;
        const settings=drawing.b2b;
        if($("mrHeight"))$("mrHeight").value=String(settings.uprightHeight??drawing.sideUprightHeight??settings.height??drawing.totalRackHeight??3300);
      };
      window.mrOpenMeasureV12=(key="")=>{
        const panel=$("mrMeasureOverlay");if(panel)panel.open=true;
        const target={firstTraverse:"mrFirstTraverse",levelGap:"mrLevelGap",topTraverse:"mrHeight",uprightHeight:"mrHeight",width:"mrSectionWidth",depth:"mrDepth"}[key];
        if(target)setTimeout(()=>{const input=$(target);input?.scrollIntoView?.({behavior:"smooth",block:"center"});input?.focus?.();input?.select?.()},40)
      };
      const mrFrontReportSvgBeforeV14=mrFrontReportSvgV4;
      mrFrontReportSvgV4=function(drawing){return mrFrontReportSvgBeforeV14(drawing).replace(/ · ÜST UZATMA [^<]+/,"")};
      const renderMRBeforeV14=renderMR;
      renderMR=function(){
        renderMRBeforeV14();
        const height=$("mrHeight"),label=height?.closest("label");
        if(label){label.classList.remove("mr-top-traverse-field");label.classList.add("mr-upright-height-field");label.innerHTML='Ayak boyu (mm)<input id="mrHeight" type="number" min="200" max="30000" step="10" value="3300">'}
        const restored=mrPendingDrawingV5||(m2LastDrawing?.b2b?.mr?m2LastDrawing:null);mrPendingDrawingV5=null;
        if(restored?.b2b?.mr)mrApplyDrawingToFormV4(restored);
        mrUpdateSummary(true);
      };
      /* RAFEX_MR_V14_END */`;
const hook = "      changeProgramLanguage(appLanguage, false);";
if (!portal.includes(hook)) throw new Error("MR v14: runtime hook bulunamadi");
portal = portal.replace(hook, runtime + "\n" + hook);
fs.writeFileSync(portalPath, portal);

console.log("MR v14: traverse alignment, upright height and no automatic top extension applied.");
