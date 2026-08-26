import fs from 'node:fs';

const file = 'client/konsol-viewer.entry.js';
let source = fs.readFileSync(file, 'utf8');

function replaceRequired(from, to, label) {
  if (!source.includes(from)) throw new Error('Konsol viewer v13 hedefi bulunamadı: ' + label);
  source = source.replace(from, to);
}

const importAnchor = "import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';";
const importReplacement = [
  importAnchor,
  "import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';",
  "import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';",
  "import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';",
].join('\n');
if (!source.includes("from 'three/examples/jsm/loaders/GLTFLoader.js'")) replaceRequired(importAnchor, importReplacement, 'GLB importları');

const clampAnchor = 'const clamp = (value, min, max) => Math.max(min, Math.min(max, value));';
const clampReplacement = [
  clampAnchor,
  "const KONSOL_ARM_GLB_VERSION = 'konsol-arm-v13';",
  'let sharedKonsolArmPromise = null;',
].join('\n');
if (!source.includes('sharedKonsolArmPromise')) replaceRequired(clampAnchor, clampReplacement, 'GLB ortak önbelleği');

const disposeAnchor = '    materials.forEach((material) => material?.dispose?.());';
const disposeReplacement = "    materials.forEach((material) => { material?.map?.dispose?.(); material?.dispose?.(); });";
if (source.includes(disposeAnchor)) source = source.replace(disposeAnchor, disposeReplacement);

const stateAnchor = '    this.destroyed = false;';
if (!source.includes('this.konsolArmModel = null;')) {
  replaceRequired(stateAnchor, stateAnchor + '\n    this.konsolArmModel = null;', 'kol modeli durumu');
}

const loadAnchor = [
  '    this.update(options, false);',
  "    this.setView('perspective');",
].join('\n');
const loadReplacement = [
  '    this.update(options, false);',
  '    this.loadKonsolArmModel();',
  "    this.setView('perspective');",
].join('\n');
if (!source.includes('this.loadKonsolArmModel();')) replaceRequired(loadAnchor, loadReplacement, 'kol modeli yükleme çağrısı');

const methodsAnchor = '  normalize(next = {}) {';
if (!source.includes('async loadKonsolArmModel()')) {
  const methods = [
    '  async loadKonsolArmModel() {',
    '    try {',
    '      if (!sharedKonsolArmPromise) {',
    '        const draco = new DRACOLoader();',
    "        draco.setDecoderPath('/draco/');",
    "        draco.setDecoderConfig({ type: 'wasm' });",
    '        const loader = new GLTFLoader();',
    '        loader.setDRACOLoader(draco);',
    '        loader.setMeshoptDecoder(MeshoptDecoder);',
    "        sharedKonsolArmPromise = loader.loadAsync('/b2b-travers.glb?v=' + KONSOL_ARM_GLB_VERSION).finally(() => draco.dispose());",
    '      }',
    '      const gltf = await sharedKonsolArmPromise;',
    '      if (this.destroyed) return;',
    '      this.konsolArmModel = gltf.scene;',
    '      this.update(this.options, false);',
    '      this.fitPerspective(this.sectionAngle);',
    "      this.canvas.dispatchEvent(new CustomEvent('rafex-konsol-arm-glb-ready'));",
    '    } catch (error) {',
    '      sharedKonsolArmPromise = null;',
    "      console.warn('Konsol kol GLB yüklenemedi; NPI geometrik yedeği kullanılıyor.', error);",
    '    }',
    '  }',
    '',
    '  makeDetailedArm(length, section, material) {',
    '    if (!this.konsolArmModel) return null;',
    '    const raw = this.konsolArmModel.clone(true);',
    '    raw.traverse((part) => {',
    '      if (!part.isMesh) return;',
    '      if (part.geometry) part.geometry = part.geometry.clone();',
    '      part.material = material.clone();',
    '      part.castShadow = true;',
    '      part.receiveShadow = true;',
    '    });',
    '    const oriented = new THREE.Group();',
    '    oriented.add(raw);',
    '    oriented.updateMatrixWorld(true);',
    '    let bounds = new THREE.Box3().setFromObject(oriented);',
    '    const sourceSize = bounds.getSize(new THREE.Vector3());',
    '    const center = bounds.getCenter(new THREE.Vector3());',
    '    raw.position.sub(center);',
    "    const sourceAxis = sourceSize.x >= sourceSize.y && sourceSize.x >= sourceSize.z ? 'x' : (sourceSize.z >= sourceSize.y ? 'z' : 'y');",
    "    if (sourceAxis === 'x') oriented.rotation.y = -Math.PI / 2;",
    "    else if (sourceAxis === 'y') oriented.rotation.x = Math.PI / 2;",
    '    const outer = new THREE.Group();',
    '    outer.add(oriented);',
    '    outer.updateMatrixWorld(true);',
    '    bounds = new THREE.Box3().setFromObject(outer);',
    '    const recenter = bounds.getCenter(new THREE.Vector3());',
    '    oriented.position.sub(recenter);',
    '    outer.updateMatrixWorld(true);',
    '    bounds = new THREE.Box3().setFromObject(outer);',
    '    const size = bounds.getSize(new THREE.Vector3());',
    '    outer.scale.set(',
    '      section.b / Math.max(1, size.x),',
    '      section.h / Math.max(1, size.y),',
    '      length / Math.max(1, size.z),',
    '    );',
    "    outer.name = 'Konsol kolu · TRAVERS GLB detayı';",
    '    return outer;',
    '  }',
    '',
  ].join('\n');
  replaceRequired(methodsAnchor, methods + methodsAnchor, 'GLB kol yardımcıları');
}

const normalizeAnchor = '      liftClearance: clamp(Number(next.liftClearance) || 100, 0, 1000),';
const normalizeReplacement = [
  normalizeAnchor,
  "      loadType: ['profile', 'pallet', 'unpacked'].includes(String(globalThis.__rafexKonsolLoadType || next.loadType)) ? String(globalThis.__rafexKonsolLoadType || next.loadType) : 'profile',",
].join('\n');
if (!source.includes('loadType: [')) replaceRequired(normalizeAnchor, normalizeReplacement, 'ürün tipi normalize alanı');

const armAnchor = [
  '        const frontArm = iBeamAlongZ(o.armLength, armSection, armMat);',
  "        frontArm.name = o.armProfile.toUpperCase() + ' Kol';",
  '        frontArm.position.set(x, y, o.armLength / 2 + uprightDepth / 2);',
  '        this.root.add(frontArm);',
].join('\n');
const armReplacement = [
  '        let frontArm = this.makeDetailedArm(o.armLength, armSection, armMat);',
  '        if (!frontArm) frontArm = iBeamAlongZ(o.armLength, armSection, armMat);',
  "        frontArm.name = o.armProfile.toUpperCase() + ' Konsol Kolu · GLB';",
  '        frontArm.position.set(x, y, o.armLength / 2 + uprightDepth / 2);',
  '        this.root.add(frontArm);',
].join('\n');
if (!source.includes('this.makeDetailedArm(o.armLength')) replaceRequired(armAnchor, armReplacement, 'GLB konsol kolu');

const helpersAnchor = '    // İlk profil bağı zemindeki taban profilinin üzerinde başlar.';
if (!source.includes('const addSelectedLoad = (centerZ, supportTopY)')) {
  const loadHelpers = [
    '    const addBoxLoad = (centerZ, supportTopY, withPallet) => {',
    '      const palletHeight = withPallet ? Math.min(130, Math.max(35, o.productHeight * 0.14)) : 0;',
    '      const cargoHeight = Math.max(15, o.productHeight - palletHeight);',
    '      const cargo = new THREE.Mesh(',
    '        new THREE.BoxGeometry(o.productLength, cargoHeight, o.armLength),',
    '        new THREE.MeshStandardMaterial({ color: withPallet ? 0xd7d1bd : 0x9fb6a9, metalness: 0.05, roughness: 0.72 }),',
    '      );',
    '      cargo.position.set(0, supportTopY + palletHeight + cargoHeight / 2, centerZ);',
    '      cargo.castShadow = true;',
    '      cargo.receiveShadow = true;',
    "      cargo.name = withPallet ? 'Paletli yük · toplam yükseklik kat formülü' : 'Paletsiz yük · toplam yükseklik kat formülü';",
    '      this.root.add(cargo);',
    '      if (!withPallet) return;',
    "      const wood = new THREE.MeshStandardMaterial({ color: 0xa9783d, metalness: 0.02, roughness: 0.82 });",
    '      const deck = new THREE.Mesh(new THREE.BoxGeometry(o.productLength, 26, o.armLength), wood);',
    '      deck.position.set(0, supportTopY + palletHeight - 13, centerZ);',
    '      deck.castShadow = true;',
    "      deck.name = 'Palet üst tablası';",
    '      this.root.add(deck);',
    '      [-0.34, 0, 0.34].forEach((ratio) => {',
    '        const runner = new THREE.Mesh(new THREE.BoxGeometry(o.productLength, Math.max(18, palletHeight - 30), 72), wood);',
    '        runner.position.set(0, supportTopY + Math.max(18, palletHeight - 30) / 2, centerZ + ratio * o.armLength);',
    '        runner.castShadow = true;',
    "        runner.name = 'Palet taşıyıcı kızağı';",
    '        this.root.add(runner);',
    '      });',
    '    };',
    '',
    '    const addSelectedLoad = (centerZ, supportTopY) => {',
    "      if (o.loadType === 'pallet') addBoxLoad(centerZ, supportTopY, true);",
    "      else if (o.loadType === 'unpacked') addBoxLoad(centerZ, supportTopY, false);",
    '      else addProfileBundle(centerZ, supportTopY);',
    '    };',
    '',
  ].join('\n');
  replaceRequired(helpersAnchor, loadHelpers + helpersAnchor, 'palet ve paletsiz yük yardımcıları');
}

source = source
  .replace('addProfileBundle(o.armLength / 2 + uprightDepth / 2, uprightSection.h);', 'addSelectedLoad(o.armLength / 2 + uprightDepth / 2, uprightSection.h);')
  .replace('if (o.doubleSided) addProfileBundle(-(o.armLength / 2 + uprightDepth / 2), uprightSection.h);', 'if (o.doubleSided) addSelectedLoad(-(o.armLength / 2 + uprightDepth / 2), uprightSection.h);')
  .replace('      const armY = (o.height / Math.max(1, o.levels)) * level;', '      const armY = uprightSection.h + (o.productHeight + o.liftClearance) * level - armSection.h / 2;')
  .replace('      addProfileBundle(o.armLength / 2 + uprightDepth / 2, armTopY);', '      addSelectedLoad(o.armLength / 2 + uprightDepth / 2, armTopY);')
  .replace('      if (o.doubleSided) addProfileBundle(-(o.armLength / 2 + uprightDepth / 2), armTopY);', '      if (o.doubleSided) addSelectedLoad(-(o.armLength / 2 + uprightDepth / 2), armTopY);');

const dimensionAnchor = '    // RAFEX_KONSOL_BRACE_V7';
if (!source.includes("dimensions.name = 'Konsol 3D Ölçüler';")) {
  const dimensions = [
    '    // B2B görünümündeki gibi kat arası, son kat yüksekliği ve ayak boyu ölçüleri.',
    '    const dimensions = new THREE.Group();',
    "    dimensions.name = 'Konsol 3D Ölçüler';",
    "    this.konsolDimensionsVersion = 'RAFEX_KONSOL_DIMENSIONS_V13';",
    '    const dimMaterial = new THREE.LineBasicMaterial({ color: 0x287293, depthTest: false, transparent: true, opacity: 0.94 });',
    '    const addDimLine = (points) => {',
    '      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), dimMaterial);',
    '      line.renderOrder = 100;',
    '      dimensions.add(line);',
    '    };',
    '    const addDimLabel = (text, x, y, z, width = 760) => {',
    "      const canvas = document.createElement('canvas');",
    '      canvas.width = 2048;',
    '      canvas.height = 256;',
    "      const context = canvas.getContext('2d');",
    "      context.fillStyle = 'rgba(5,40,72,.96)';",
    '      context.beginPath();',
    '      context.roundRect(8, 8, 2032, 240, 30);',
    '      context.fill();',
    "      context.strokeStyle = '#4ba0c4';",
    '      context.lineWidth = 8;',
    '      context.stroke();',
    "      context.fillStyle = '#ffffff';",
    "      context.font = '900 58px Arial';",
    "      context.textAlign = 'center';",
    "      context.textBaseline = 'middle';",
    '      context.fillText(text, 1024, 128, 1940);',
    '      const texture = new THREE.CanvasTexture(canvas);',
    '      texture.colorSpace = THREE.SRGBColorSpace;',
    '      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true }));',
    '      sprite.position.set(x, y, z);',
    '      sprite.scale.set(width, 105, 1);',
    '      sprite.renderOrder = 102;',
    '      dimensions.add(sprite);',
    '    };',
    '    const dimensionZ = o.armLength + uprightDepth / 2 + 360;',
    '    const gapX = startX - Math.max(520, o.spacing * 0.24);',
    '    const totalX = gapX - 920;',
    '    const witnessX = startX - uprightWidth / 2;',
    '    const addVerticalDim = (x, from, to, label, labelWidth) => {',
    '      const bottom = new THREE.Vector3(x, from, dimensionZ);',
    '      const top = new THREE.Vector3(x, to, dimensionZ);',
    '      addDimLine([bottom, top]);',
    '      addDimLine([bottom, new THREE.Vector3(witnessX, from, dimensionZ)]);',
    '      addDimLine([top, new THREE.Vector3(witnessX, to, dimensionZ)]);',
    '      const arrow = 70;',
    '      addDimLine([new THREE.Vector3(x - arrow, from + arrow, dimensionZ), bottom, new THREE.Vector3(x + arrow, from + arrow, dimensionZ)]);',
    '      addDimLine([new THREE.Vector3(x - arrow, to - arrow, dimensionZ), top, new THREE.Vector3(x + arrow, to - arrow, dimensionZ)]);',
    '      addDimLabel(label, x - 400, (from + to) / 2, dimensionZ, labelWidth);',
    '    };',
    '    const netGap = o.productHeight + o.liftClearance;',
    '    const supportTops = Array.from({ length: o.levels + 1 }, (_, index) => uprightSection.h + index * netGap);',
    '    for (let index = 0; index < supportTops.length - 1; index += 1) {',
    "      addVerticalDim(gapX, supportTops[index], supportTops[index + 1], 'K' + index + '–K' + (index + 1) + '  ·  ' + Math.round(netGap).toLocaleString('tr-TR') + ' mm', 720);",
    '    }',
    "    addVerticalDim(totalX, 0, visualUprightHeight, 'AYAK BOYU  ·  ' + Math.round(visualUprightHeight).toLocaleString('tr-TR') + ' mm', 880);",
    '    const lastSupport = supportTops[supportTops.length - 1];',
    '    addDimLine([new THREE.Vector3(totalX, lastSupport, dimensionZ), new THREE.Vector3(witnessX, lastSupport, dimensionZ)]);',
    "    addDimLabel('SON KAT YÜKSEKLİĞİ  ·  ' + Math.round(lastSupport).toLocaleString('tr-TR') + ' mm', totalX - 430, lastSupport + 120, dimensionZ, 960);",
    '    this.root.add(dimensions);',
    '',
  ].join('\n');
  replaceRequired(dimensionAnchor, dimensions + dimensionAnchor, '3D ölçü katmanı');
}

for (const required of [
  "from 'three/examples/jsm/loaders/GLTFLoader.js'",
  'async loadKonsolArmModel()',
  'this.makeDetailedArm(o.armLength, armSection, armMat)',
  'loadType: [',
  'const addSelectedLoad = (centerZ, supportTopY)',
  "o.loadType === 'pallet'",
  "o.loadType === 'unpacked'",
  "dimensions.name = 'Konsol 3D Ölçüler';",
  "RAFEX_KONSOL_DIMENSIONS_V13",
  'SON KAT YÜKSEKLİĞİ',
  'cylinderBetween([x1, y1, 0]',
]) {
  if (!source.includes(required)) throw new Error('Konsol viewer v13 doğrulaması eksik: ' + required);
}

fs.writeFileSync(file, source);
console.log('Konsol viewer v13: net kat kotları, B2B tipi ölçüler, GLB kol ve üç ürün görünümü aktif.');
