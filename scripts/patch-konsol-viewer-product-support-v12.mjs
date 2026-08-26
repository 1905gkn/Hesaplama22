import fs from 'node:fs';

const file = 'client/konsol-viewer.entry.js';
let source = fs.readFileSync(file, 'utf8');

const normalizeAnchor = `      armLength: clamp(Number(next.armLength) || 1200, 250, 3000),
      levels: clamp(Math.round(Number(next.levels) || 4), 1, 12),`;
const normalizeReplacement = `      armLength: clamp(Number(next.armLength) || 1200, 250, 3000),
      productLength: clamp(Number(next.productLength) || 3000, 500, 60000),
      productHeight: clamp(Number(next.productHeight) || 900, 50, 5000),
      liftClearance: clamp(Number(next.liftClearance) || 100, 0, 1000),
      levels: clamp(Math.round(Number(next.levels) || 4), 1, 12),`;
if (source.includes(normalizeAnchor)) source = source.replace(normalizeAnchor, normalizeReplacement);
else if (!source.includes('productLength: clamp(Number(next.productLength)')) throw new Error('Konsol ürün ölçüsü normalize noktası bulunamadı.');

const materialAnchor = `    const endMat = new THREE.MeshStandardMaterial({ color: 0xd2a600, metalness: 0.35, roughness: 0.48 });`;
const materialReplacement = `${materialAnchor}
    const productMat = new THREE.MeshStandardMaterial({ color: 0x9fb6a9, metalness: 0.08, roughness: 0.68, transparent: true, opacity: 0.72 });`;
if (source.includes(materialAnchor)) source = source.replace(materialAnchor, materialReplacement);
else if (!source.includes('const productMat = new THREE.MeshStandardMaterial')) throw new Error('Konsol ürün malzemesi ekleme noktası bulunamadı.');

const addAnchor = `    let cursor = 0;
    const plan = o.setPlan.length ? o.setPlan : [Math.min(3, o.uprightCount)];`;
const addReplacement = `    // Her kol katındaki uzun ürünü gerçek uzunluk ve kol derinliğiyle göster.
    // Dengeli yüklemede uç taşma = ayak merkez aralığının yarısıdır.
    for (let level = 1; level <= o.levels; level += 1) {
      const armY = (o.height / (o.levels + 1)) * level;
      const productY = armY + 57.5 + o.productHeight / 2;
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

    let cursor = 0;
    const plan = o.setPlan.length ? o.setPlan : [Math.min(3, o.uprightCount)];`;
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
