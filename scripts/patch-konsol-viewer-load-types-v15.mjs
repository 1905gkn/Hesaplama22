import fs from 'node:fs';

const file = 'client/konsol-viewer.entry.js';
let source = fs.readFileSync(file, 'utf8');

function replaceRequired(from, to, label) {
  if (!source.includes(from)) throw new Error('Konsol yük görünümü v15 hedefi bulunamadı: ' + label);
  source = source.replace(from, to);
}

const normalizeAnchor = '      liftClearance: clamp(Number(next.liftClearance) || 100, 0, 1000),';
if (!source.includes("loadType: ['profile', 'pallet', 'unpacked']")) {
  replaceRequired(
    normalizeAnchor,
    normalizeAnchor + "\n      loadType: ['profile', 'pallet', 'unpacked'].includes(String(globalThis.__rafexKonsolLoadType || next.loadType)) ? String(globalThis.__rafexKonsolLoadType || next.loadType) : 'profile',",
    'ürün tipi normalize alanı',
  );
}

const helpersAnchor = '    // İlk profil bağı zemindeki taban profilinin üzerinde başlar.';
if (!source.includes('const addSelectedLoad = (centerZ, supportTopY)')) {
  const helpers = `    this.konsolLoadTypesVersion = 'RAFEX_KONSOL_LOAD_TYPES_V15';
    const addPalletLoad = (centerZ, supportTopY) => {
      const palletHeight = Math.min(130, Math.max(70, o.productHeight * 0.14));
      const cargoHeight = Math.max(80, o.productHeight - palletHeight);
      const cargo = new THREE.Mesh(
        new THREE.BoxGeometry(o.productLength, cargoHeight, o.armLength),
        new THREE.MeshStandardMaterial({ color: 0xc58b47, metalness: 0.05, roughness: 0.94 }),
      );
      cargo.position.set(0, supportTopY + palletHeight + cargoHeight / 2, centerZ);
      cargo.castShadow = true;
      cargo.receiveShadow = true;
      cargo.name = 'Paletli yük · Konsol Kollu';
      this.root.add(cargo);

      const wood = new THREE.MeshStandardMaterial({ color: 0x9a6028, metalness: 0.02, roughness: 0.94 });
      const deck = new THREE.Mesh(new THREE.BoxGeometry(o.productLength, 28, o.armLength), wood);
      deck.position.set(0, supportTopY + palletHeight - 14, centerZ);
      deck.castShadow = true;
      deck.name = 'Palet üst tablası';
      this.root.add(deck);
      [-0.34, 0, 0.34].forEach((ratio) => {
        const runnerHeight = Math.max(22, palletHeight - 32);
        const runner = new THREE.Mesh(new THREE.BoxGeometry(o.productLength, runnerHeight, 76), wood);
        runner.position.set(0, supportTopY + runnerHeight / 2, centerZ + ratio * o.armLength);
        runner.castShadow = true;
        runner.name = 'Palet taşıyıcı kızağı';
        this.root.add(runner);
      });
    };

    const addSelectedLoad = (centerZ, supportTopY) => {
      if (o.loadType === 'pallet') addPalletLoad(centerZ, supportTopY);
      else if (o.loadType === 'profile') addProfileBundle(centerZ, supportTopY);
    };

`;
  replaceRequired(helpersAnchor, helpers + helpersAnchor, 'palet ve profil yardımcıları');
}

source = source
  .replace('addProfileBundle(o.armLength / 2 + uprightDepth / 2, uprightSection.h);', 'addSelectedLoad(o.armLength / 2 + uprightDepth / 2, uprightSection.h);')
  .replace('if (o.doubleSided) addProfileBundle(-(o.armLength / 2 + uprightDepth / 2), uprightSection.h);', 'if (o.doubleSided) addSelectedLoad(-(o.armLength / 2 + uprightDepth / 2), uprightSection.h);')
  .replace('      const armY = (o.height / Math.max(1, o.levels)) * level;', '      const armY = uprightSection.h + visualLevelGap * level - armSection.h / 2;')
  .replace('      addProfileBundle(o.armLength / 2 + uprightDepth / 2, armTopY);', '      addSelectedLoad(o.armLength / 2 + uprightDepth / 2, armTopY);')
  .replace('      if (o.doubleSided) addProfileBundle(-(o.armLength / 2 + uprightDepth / 2), armTopY);', '      if (o.doubleSided) addSelectedLoad(-(o.armLength / 2 + uprightDepth / 2), armTopY);');

for (const required of [
  "loadType: ['profile', 'pallet', 'unpacked']",
  'globalThis.__rafexKonsolLoadType || next.loadType',
  "this.konsolLoadTypesVersion = 'RAFEX_KONSOL_LOAD_TYPES_V15';",
  'const addSelectedLoad = (centerZ, supportTopY)',
  "o.loadType === 'pallet'",
  "o.loadType === 'profile'",
  "cargo.name = 'Paletli yük · Konsol Kollu'",
  'const armY = uprightSection.h + visualLevelGap * level - armSection.h / 2;',
  'addSelectedLoad(o.armLength / 2 + uprightDepth / 2, armTopY);',
]) {
  if (!source.includes(required)) throw new Error('Konsol yük görünümü v15 doğrulaması eksik: ' + required);
}

fs.writeFileSync(file, source);
console.log('Konsol viewer v15: güvenli kat kotlarıyla Kutu Profil / Palet / Paletsiz görünümü aktif.');

