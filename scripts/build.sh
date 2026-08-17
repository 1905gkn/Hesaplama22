#!/usr/bin/env bash
# B2B accessories + top-safe centered side fit build v50
set -euo pipefail

project_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
dist_root="$project_root/dist"

mkdir -p "$dist_root/server" "$dist_root/.openai/drizzle" "$dist_root/accessories"
cp "$project_root/worker/index.js" "$dist_root/server/index.js"
cp "$project_root/.openai/hosting.json" "$dist_root/.openai/hosting.json"
cp "$project_root/drizzle/"*.sql "$dist_root/.openai/drizzle/"

accessory_src="$project_root/assets/accessory-src"
pallet_stop_glb="$dist_root/accessories/b2b-palet-dayama.glb"
h_traverse_glb="$dist_root/accessories/b2b-h-travers.glb"
tray_glb="$dist_root/accessories/b2b-tava.glb"
cat "$accessory_src"/palet-dayama.* | base64 -d | gzip -dc > "$pallet_stop_glb"
cat "$accessory_src"/h-travers.* | base64 -d | gzip -dc > "$h_traverse_glb"
cat "$accessory_src"/tava.* | base64 -d | gzip -dc > "$tray_glb"

test -s "$pallet_stop_glb"
test -s "$h_traverse_glb"
test -s "$tray_glb"

viewer_source="$project_root/client/b2b-viewer.entry.js"
patched_viewer="$dist_root/b2b-viewer.patched.entry.js"
viewer_bundle="$dist_root/b2b-viewer.js"

node - "$viewer_source" "$patched_viewer" <<'NODE'
const fs = require('node:fs');
const sourcePath = process.argv[2];
const outputPath = process.argv[3];
let source = fs.readFileSync(sourcePath, 'utf8');

const replaceRequired = (from, to, label) => {
  if (!source.includes(from)) throw new Error(`${label} bulunamadı.`);
  source = source.replace(from, to);
};

if (!source.includes('row.scale.y=-1')) throw new Error('B2B çift sıra yönü kaynakta bulunamadı.');
replaceRequired('const ASSET_VERSION = "b2b-detail-layout-camera-519";', 'const ASSET_VERSION = "b2b-accessories-599";', 'B2B asset version');

// Mevcut ve kullanıcı tarafından onaylanan ön/yan kamera oranını aynen koru.
const oldFit = 'const fitWidth = size.x / (2 * Math.tan(vFov / 2) * Math.max(this.camera.aspect, 0.25));';
const newFit = 'const visibleWidth = view === "side" ? size.z : size.x;\n    const fitWidth = visibleWidth / (2 * Math.tan(vFov / 2) * Math.max(this.camera.aspect, 0.25));';
replaceRequired(oldFit, newFit, 'B2B kamera genişlik hesabı');

// Aksesuar ürün GLB'lerini mevcut viewer model havuzuna ekle.
replaceRequired(
`          loader.loadAsync(source("b2b-sac-arabag")),\n        ]).finally(() => draco.dispose());`,
`          loader.loadAsync(source("b2b-sac-arabag")),\n          loader.loadAsync(source("b2b-palet-dayama")),\n          loader.loadAsync(source("b2b-h-travers")),\n          loader.loadAsync(source("b2b-tava")),\n        ]).finally(() => draco.dispose());`,
'B2B model yükleme listesi');
replaceRequired(
`      const [module, pallet, traverse, foot, straightTie] = await sharedModelsPromise;`,
`      const [module, pallet, traverse, foot, straightTie, palletStop, hTraverse, tray] = await sharedModelsPromise;`,
'B2B model destructuring');
replaceRequired(
`        straightTie: straightTie.scene.clone(true),\n      };`,
`        straightTie: straightTie.scene.clone(true),\n        palletStop: palletStop.scene.clone(true),\n        hTraverse: hTraverse.scene.clone(true),\n        tray: tray.scene.clone(true),\n      };`,
'B2B viewer model map');

replaceRequired(
`      rowGap: clamp(Number(next.rowGap) || 200, 0, 3000),\n      straightTieCount:`,
`      rowGap: clamp(Number(next.rowGap) || 200, 0, 3000),\n      accessories: Array.isArray(next.accessories) ? next.accessories\n        .filter((item) => item && ["palletStop", "hTraverse", "tray"].includes(item.type))\n        .map((item) => ({\n          type: item.type,\n          levels: Array.isArray(item.levels) ? [...new Set(item.levels.map(Number).filter((level) => Number.isFinite(level) && level >= 1 && level <= 15))].sort((a,b)=>a-b) : [],\n          ...(item.type === "tray" ? { width: [200,250,300].includes(Number(item.width)) ? Number(item.width) : 300 } : {}),\n        })) : [],\n      straightTieCount:`,
'B2B accessories normalize');

replaceRequired(
`        this.addTraverses(section,sectionScale,depthScale);if(spec.showPallets)this.addLoads(section,sectionScale);`,
`        this.addTraverses(section,sectionScale,depthScale);if(spec.showPallets)this.addLoads(section,sectionScale);this.addAccessories(section,sectionScale,depthScale);`,
'B2B section accessory hook');

const accessoryMethods = `
  accessoryModel(source, targetSize, swapXY = false) {
    const raw = source.clone(true);
    raw.traverse((part) => {
      if (!part.isMesh) return;
      part.castShadow = true;
      part.receiveShadow = true;
      const materials = Array.isArray(part.material) ? part.material : [part.material];
      const adjusted = materials.map((base) => {
        const material = base.clone();
        material.metalness = Math.max(.18, Number(material.metalness) || 0);
        material.roughness = Math.max(.42, Number(material.roughness) || 0);
        return material;
      });
      part.material = Array.isArray(part.material) ? adjusted : adjusted[0];
    });
    const oriented = new THREE.Group();
    oriented.add(raw);
    if (swapXY) oriented.rotation.z = -Math.PI / 2;
    oriented.updateMatrixWorld(true);
    let bounds = new THREE.Box3().setFromObject(oriented);
    const size = bounds.getSize(new THREE.Vector3());
    oriented.position.sub(bounds.min);
    const sx = targetSize.x / Math.max(1, size.x);
    const sy = targetSize.y / Math.max(1, size.y);
    const sz = targetSize.z / Math.max(1, size.z);
    oriented.scale.set(sx, sy, -sz);
    oriented.updateMatrixWorld(true);
    bounds = new THREE.Box3().setFromObject(oriented);
    oriented.position.x -= bounds.min.x;
    oriented.position.y -= bounds.min.y;
    oriented.position.z -= bounds.max.z;
    return oriented;
  }

  trayPiecePlan(clearWidth, requestedWidth) {
    const width = Math.max(0, Math.round(Number(clearWidth) || 0));
    const trayWidth = [200,250,300].includes(Number(requestedWidth)) ? Number(requestedWidth) : 300;
    const full = Math.floor(width / trayWidth);
    const remainder = width - full * trayWidth;
    const pieces = Array.from({ length:full }, () => trayWidth);
    if (remainder >= 50) pieces.push(remainder);
    return pieces;
  }

  addAccessories(section, sectionScale, depthScale) {
    const accessories = Array.isArray(this.options.accessories) ? this.options.accessories : [];
    if (!accessories.length) return;
    const clearLeft = SOURCE_CLEAR_LEFT * sectionScale;
    const clearWidth = this.options.sectionWidth;
    const frameDepth = Math.max(100, this.options.palletDepth - this.options.frontPalletGap - this.options.rearPalletGap);
    const depthInner = Math.max(100, frameDepth - 30);

    accessories.forEach((accessory) => {
      const levels = Array.isArray(accessory.levels) ? accessory.levels : [];
      levels.forEach((humanLevel) => {
        const level = Math.max(0, Math.min(14, Math.round(Number(humanLevel) || 1) - 1));
        const maxTraverse = this.options.firstPalletPosition === "traverse" ? this.options.levels : Math.max(0, this.options.levels - 1);
        if (level >= maxTraverse) return;
        if (this.options.tunnelHeight > 0 && this.traverseTop(level) <= this.options.tunnelHeight) return;
        const supportTop = this.traverseBottom(level) + this.options.traverseHeight;

        if (accessory.type === "palletStop" && this.models.palletStop) {
          const stop = this.accessoryModel(this.models.palletStop, { x:clearWidth, y:163 * depthScale, z:90 }, false);
          stop.name = `Palet Dayama K${humanLevel}`;
          stop.position.set(clearLeft - 4 * sectionScale, 42 * depthScale, -(supportTop + 40));
          section.add(stop);
          return;
        }

        if (accessory.type === "hTraverse" && this.models.hTraverse) {
          const targetX = Math.max(200, clearWidth - 106 * sectionScale);
          const h = this.accessoryModel(this.models.hTraverse, { x:targetX, y:depthInner, z:89 }, true);
          h.name = `H Travers K${humanLevel}`;
          h.position.set(clearLeft + 50 * sectionScale, 162 * depthScale, -this.traverseBottom(level));
          section.add(h);
          return;
        }

        if (accessory.type === "tray" && this.models.tray) {
          let cursor = 0;
          const pieces = this.trayPiecePlan(clearWidth, accessory.width);
          pieces.forEach((pieceWidth, pieceIndex) => {
            const tray = this.accessoryModel(this.models.tray, { x:pieceWidth, y:depthInner, z:45 }, true);
            tray.name = `Tava K${humanLevel}-${pieceIndex + 1} · ${pieceWidth} mm`;
            tray.position.set(clearLeft + cursor, 176 * depthScale, -(this.traverseBottom(level) + 65));
            section.add(tray);
            cursor += pieceWidth;
          });
        }
      });
    });
  }

`;
replaceRequired('  addLoads(section, sectionScale) {', accessoryMethods + '  addLoads(section, sectionScale) {', 'B2B addLoads insertion point');

// Kullanıcı tarafından onaylanan ortak ön/yan fiziksel ölçeği koru.
const oldTakeStart = '    const take = (view, dimensions) => {\n';
const oldTakeEnd = '      return canvas.toDataURL("image/png");\n    };';
const takeStartIndex = source.indexOf(oldTakeStart);
const takeEndIndex = source.indexOf(oldTakeEnd, takeStartIndex);
if (takeStartIndex < 0 || takeEndIndex < 0) throw new Error('B2B rapor yakalama bloğu bulunamadı.');
const takeEnd = takeEndIndex + oldTakeEnd.length;
const newTake = `    const capturePadding = clamp(Number(settings.cameraPadding)||1.16,.72,1.6);
    const take = (view, dimensions) => {
      viewer.update({ ...options, dimensions }, false);
      viewer.dimensionLabels.forEach((label) => {
        const baseScale = label?.userData?.baseScale;
        if (!baseScale || label.userData.rafexCaptureScaleApplied) return;
        baseScale.multiplyScalar(1.5);
        label.scale.copy(baseScale);
        label.userData.rafexCaptureScaleApplied = true;
      });
      viewer.setView(view);
      const direction = viewer.camera.position.clone().sub(viewer.controls.target);
      const fittedDistance = direction.length() * capturePadding;
      let targetDistance = fittedDistance;
      if (view === "side") {
        // Yan kesiti CSS ile büyütüp kırpmak yerine, gerçek 3D sınırlarını kameraya sığdır.
        // %8 güvenlik payı tepeyi ve tabanı eksiksiz bırakır; hedef tam bölüm merkezidir.
        const bounds = viewer.contentBounds();
        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());
        const vFov = THREE.MathUtils.degToRad(viewer.camera.fov);
        const fitHeight = size.y / (2 * Math.tan(vFov / 2));
        const fitWidth = size.z / (2 * Math.tan(vFov / 2) * Math.max(viewer.camera.aspect, 0.25));
        targetDistance = Math.max(fitHeight, fitWidth) * 1.22;
        center.y += size.y * 0.04;
        viewer.controls.target.copy(center);
        direction.set(1, 0.005, 0).normalize();
      }
      viewer.camera.position.copy(viewer.controls.target).add(direction.setLength(targetDistance));
      viewer.camera.near = Math.max(5, targetDistance / 500);
      viewer.camera.far = Math.max(200000, targetDistance * 12);
      viewer.camera.updateProjectionMatrix();
      viewer.controls.update();
      viewer.renderer.render(viewer.scene, viewer.camera);
      return canvas.toDataURL("image/png");
    };`;
source = source.slice(0, takeStartIndex) + newTake + source.slice(takeEnd);
fs.writeFileSync(outputPath, source);
NODE

"$project_root/node_modules/.bin/esbuild" "$patched_viewer" \
  --bundle \
  --format=iife \
  --minify \
  --target=es2022 \
  --outfile="$viewer_bundle"

node - "$project_root/portal.html" "$project_root/assets/mekik-corridor-front.png" "$project_root/assets/ray-side.png" "$project_root/assets/travers-side.png" "$project_root/assets/ayak-side.png" "$project_root/assets/paletli-side.png" "$project_root/assets/ayak2-front.png" "$project_root/assets/pallet-definition.png" "$project_root/assets/b2b-takim.glb" "$project_root/assets/b2b-palet.glb" "$project_root/assets/b2b-travers.glb" "$project_root/assets/b2b-ayak.glb" "$project_root/assets/b2b-sac-arabag.glb" "$pallet_stop_glb" "$h_traverse_glb" "$tray_glb" "$viewer_bundle" "$project_root/client/b2b-visual-fixes.js" "$project_root/client/b2b-report-3d.js" "$project_root/client/b2b-report-sections.js" "$project_root/client/b2b-accessories.js" "$project_root/node_modules/three/examples/jsm/libs/draco/gltf/draco_decoder.js" "$project_root/node_modules/three/examples/jsm/libs/draco/gltf/draco_wasm_wrapper.js" "$project_root/node_modules/three/examples/jsm/libs/draco/gltf/draco_decoder.wasm" "$dist_root/server/index.js" <<'NODE'
const fs = require('node:fs');
const portalPath = process.argv[2];
const corridorFrontPath = process.argv[3];
const rayPath = process.argv[4], traversPath = process.argv[5], ayakPath = process.argv[6], paletliPath = process.argv[7];
const ayak2FrontPath = process.argv[8];
const palletDefinitionPath = process.argv[9];
const b2bTakimPath = process.argv[10];
const b2bPaletPath = process.argv[11];
const b2bTraversPath = process.argv[12];
const b2bAyakPath = process.argv[13];
const b2bStraightTiePath = process.argv[14];
const b2bPalletStopPath = process.argv[15];
const b2bHTraversePath = process.argv[16];
const b2bTrayPath = process.argv[17];
const b2bViewerPath = process.argv[18];
const b2bVisualFixesPath = process.argv[19];
const b2bReport3dPath = process.argv[20];
const b2bReportSectionsPath = process.argv[21];
const b2bAccessoriesPath = process.argv[22];
const dracoDecoderPath = process.argv[23];
const dracoWasmWrapperPath = process.argv[24];
const dracoDecoderWasmPath = process.argv[25];
const workerPath = process.argv[26];
const corridorFrontBase64 = fs.readFileSync(corridorFrontPath).toString('base64');
const ayak2FrontBase64 = fs.readFileSync(ayak2FrontPath).toString('base64');
const b2bBuildVersion = (process.env.VERCEL_GIT_COMMIT_SHA || "local").slice(0, 7);
const b2bBuildTime = new Date().toISOString();
const b2bVisualFixes = fs.readFileSync(b2bVisualFixesPath, 'utf8')
  .replaceAll('__B2B_BUILD_VERSION__', b2bBuildVersion)
  .replaceAll('__B2B_BUILD_TIME__', b2bBuildTime);
const b2bReport3d = fs.readFileSync(b2bReport3dPath, 'utf8');
const b2bReportSections = fs.readFileSync(b2bReportSectionsPath, 'utf8');
const b2bAccessories = fs.readFileSync(b2bAccessoriesPath, 'utf8');
let portalSource = fs.readFileSync(portalPath, 'utf8')
  .replaceAll('__MEKIK_CORRIDOR_FRONT_BASE64__', corridorFrontBase64)
  .replaceAll('__M2_RAY_SIDE_BASE64__', fs.readFileSync(rayPath).toString('base64'))
  .replaceAll('__M2_TRAVERS_SIDE_BASE64__', fs.readFileSync(traversPath).toString('base64'))
  .replaceAll('__M2_AYAK_SIDE_BASE64__', fs.readFileSync(ayakPath).toString('base64'))
  .replaceAll('__M2_PALETLI_SIDE_BASE64__', fs.readFileSync(paletliPath).toString('base64'))
  .replaceAll('__M2_AYAK2_FRONT_BASE64__', ayak2FrontBase64)
  .replaceAll('__M2_PALLET_DEFINITION_BASE64__', fs.readFileSync(palletDefinitionPath).toString('base64'))
  .replaceAll('b2b-double-row-side-ties-367', 'b2b-accessories-599');
portalSource = portalSource.replace(/<\/body>\s*<\/html>\s*$/i, `<script data-rafex-b2b-visual-fixes="back-to-back-reference-v2">\n${b2bVisualFixes}\n</script>\n<script data-rafex-b2b-report-3d="front-side-capture-v35">\n${b2bReport3d}\n</script>\n<script data-rafex-b2b-report-sections="corporate-type-sections-v6">\n${b2bReportSections}\n</script>\n<script data-rafex-b2b-accessories="b2b-accessories-v1">\n${b2bAccessories}\n</script>\n</body>\n</html>`);
if (!portalSource.includes('data-rafex-b2b-accessories="b2b-accessories-v1"')) throw new Error('B2B aksesuar betiği portala eklenemedi.');
const unresolvedAsset = portalSource.match(/__[A-Z0-9_]+_BASE64__/);
if (unresolvedAsset) throw new Error(`Çözümlenmemiş görsel yer tutucusu: ${unresolvedAsset[0]}`);
const portalBase64 = Buffer.from(portalSource).toString('base64');
let workerSource = fs.readFileSync(workerPath, 'utf8');
const straightTieConst = 'const B2B_STRAIGHT_TIE_BASE64 = "__B2B_STRAIGHT_TIE_BASE64__";';
if (!workerSource.includes(straightTieConst)) throw new Error('Worker aksesuar sabit ekleme noktası bulunamadı.');
workerSource = workerSource.replace(straightTieConst, `${straightTieConst}\nconst B2B_PALLET_STOP_BASE64 = "__B2B_PALLET_STOP_BASE64__";\nconst B2B_H_TRAVERSE_BASE64 = "__B2B_H_TRAVERSE_BASE64__";\nconst B2B_TRAY_BASE64 = "__B2B_TRAY_BASE64__";`);
const viewerRoute = '    if (path === "/b2b-viewer.js")';
if (!workerSource.includes(viewerRoute)) throw new Error('Worker aksesuar route ekleme noktası bulunamadı.');
workerSource = workerSource.replace(viewerRoute, `    if (path === "/b2b-palet-dayama.glb") return binary(B2B_PALLET_STOP_BASE64, "model/gltf-binary");\n    if (path === "/b2b-h-travers.glb") return binary(B2B_H_TRAVERSE_BASE64, "model/gltf-binary");\n    if (path === "/b2b-tava.glb") return binary(B2B_TRAY_BASE64, "model/gltf-binary");\n${viewerRoute}`);
const nextSource = workerSource
  .replace(/^const HTML_BASE64\s*=\s*"[^"]*";/m, `const HTML_BASE64 = "${portalBase64}";`)
  .replaceAll('__B2B_TAKIM_BASE64__', fs.readFileSync(b2bTakimPath).toString('base64'))
  .replaceAll('__B2B_PALET_BASE64__', fs.readFileSync(b2bPaletPath).toString('base64'))
  .replaceAll('__B2B_TRAVERS_BASE64__', fs.readFileSync(b2bTraversPath).toString('base64'))
  .replaceAll('__B2B_AYAK_BASE64__', fs.readFileSync(b2bAyakPath).toString('base64'))
  .replaceAll('__B2B_STRAIGHT_TIE_BASE64__', fs.readFileSync(b2bStraightTiePath).toString('base64'))
  .replaceAll('__B2B_PALLET_STOP_BASE64__', fs.readFileSync(b2bPalletStopPath).toString('base64'))
  .replaceAll('__B2B_H_TRAVERSE_BASE64__', fs.readFileSync(b2bHTraversePath).toString('base64'))
  .replaceAll('__B2B_TRAY_BASE64__', fs.readFileSync(b2bTrayPath).toString('base64'))
  .replaceAll('__B2B_VIEWER_BASE64__', fs.readFileSync(b2bViewerPath).toString('base64'))
  .replaceAll('__DRACO_DECODER_BASE64__', fs.readFileSync(dracoDecoderPath).toString('base64'))
  .replaceAll('__DRACO_WASM_WRAPPER_BASE64__', fs.readFileSync(dracoWasmWrapperPath).toString('base64'))
  .replaceAll('__DRACO_DECODER_WASM_BASE64__', fs.readFileSync(dracoDecoderWasmPath).toString('base64'))
  .replaceAll('__M2_AYAK2_FRONT_BASE64__', ayak2FrontBase64);
fs.writeFileSync(workerPath, nextSource);
NODE

echo "Built $dist_root"
