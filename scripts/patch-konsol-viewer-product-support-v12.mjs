import fs from 'node:fs';

const file = 'client/konsol-viewer.entry.js';
let source = fs.readFileSync(file, 'utf8');

const normalizeAnchor = `      armLength: clamp(Number(next.armLength) || 1200, 250, 3000),
      baseDepth: clamp(Number(next.baseDepth) || 1200, 250, 3500),`;
const normalizeReplacement = `      armLength: clamp(Number(next.armLength) || 1200, 250, 3000),
      productLength: clamp(Number(next.productLength) || 3000, 500, 60000),
      productHeight: clamp(Number(next.productHeight) || 900, 50, 5000),
      liftClearance: clamp(Number(next.liftClearance) || 100, 0, 1000),
      baseDepth: clamp(Number(next.baseDepth) || 1200, 250, 3500),`;
if (source.includes(normalizeAnchor)) source = source.replace(normalizeAnchor, normalizeReplacement);
else if (!source.includes('productLength: clamp(Number(next.productLength)')) throw new Error('Konsol ürün ölçüsü normalize noktası bulunamadı.');

const materialAnchor = `    const endMat = new THREE.MeshStandardMaterial({ color: armColor, metalness: 0.35, roughness: 0.48 });`;
const materialReplacement = `${materialAnchor}
    const productMat = new THREE.MeshStandardMaterial({ color: 0x9fb6a9, metalness: 0.08, roughness: 0.68, transparent: true, opacity: 0.72 });`;
if (source.includes(materialAnchor)) source = source.replace(materialAnchor, materialReplacement);
else if (!source.includes('const productMat = new THREE.MeshStandardMaterial')) throw new Error('Konsol ürün malzemesi ekleme noktası bulunamadı.');

const addAnchor = `    // RAFEX_KONSOL_BRACE_V7`;
const addReplacement = `    // Her kol katındaki uzun ürünü gerçek uzunluk ve kol derinliğiyle göster.
    // Dengeli yüklemede uç taşma = ayak merkez aralığının yarısıdır.
    for (let level = 1; level <= o.levels; level += 1) {
      const armY = (o.height / Math.max(1, o.levels)) * level;
      const productY = armY + armSection.h / 2 + o.productHeight / 2;
      const frontProduct = new THREE.Mesh(
        new THREE.BoxGeometry(o.productLength, o.productHeight, o.armLength),
        productMat.clone(),
      );
      frontProduct.position.set(0, productY, o.armLength / 2 + uprightDepth / 2);
      frontProduct.castShadow = true;
      frontProduct.receiveShadow = true;
      frontProduct.name = 'Uzun ürün · dengeli yarım ayak aralığı taşmalı';
      this.root.add(frontProduct);
      if (o.doubleSided) {
        const backProduct = frontProduct.clone();
        backProduct.position.z = -(o.armLength / 2 + uprightDepth / 2);
        this.root.add(backProduct);
      }
    }

    // RAFEX_KONSOL_BRACE_V7`;
if (source.includes(addAnchor)) source = source.replace(addAnchor, addReplacement);
else if (!source.includes("Uzun ürün · dengeli yarım ayak aralığı taşmalı")) throw new Error('Konsol ürün kutusu ekleme noktası bulunamadı.');

for (const required of [
  'productLength: clamp(Number(next.productLength)',
  'liftClearance: clamp(Number(next.liftClearance)',
  'new THREE.BoxGeometry(o.productLength, o.productHeight, o.armLength)',
  "Uzun ürün · dengeli yarım ayak aralığı taşmalı",
]) if (!source.includes(required)) throw new Error('Konsol viewer ürün desteği v12 eksik: ' + required);

fs.writeFileSync(file, source);
console.log('Konsol viewer v12: kat aralığı eksi kaldırma boşluğu yüksekliğinde ürün kutusu ve dengeli taşma 3D modele eklendi.');
