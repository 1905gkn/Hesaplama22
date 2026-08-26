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
    const productOuterMat = new THREE.MeshStandardMaterial({ color: 0xb7bfbc, metalness: 0.72, roughness: 0.34 });
    const productInnerMat = new THREE.MeshStandardMaterial({ color: 0x202825, metalness: 0.16, roughness: 0.82 });
    const productBandMat = new THREE.MeshStandardMaterial({ color: 0x747d79, metalness: 0.82, roughness: 0.26 });`;
if (source.includes(materialAnchor)) source = source.replace(materialAnchor, materialReplacement);
else if (!source.includes('const productOuterMat = new THREE.MeshStandardMaterial')) throw new Error('Konsol profil bağı malzemesi ekleme noktası bulunamadı.');

const addAnchor = `    // RAFEX_KONSOL_BRACE_V7`;
const addReplacement = `    // Ürünü tek parça blok yerine galvaniz kare kutu profillerden oluşan bir bağ olarak göster.
    // Boy = ürün uzunluğu, yükseklik = kat arası eksi kaldırma boşluğu, derinlik = kol derinliği.
    const addProfileBundle = (centerZ, supportTopY) => {
      const targetProfileSize = 100;
      const rows = Math.max(1, Math.min(32, Math.ceil(o.productHeight / targetProfileSize)));
      const columns = Math.max(1, Math.min(24, Math.ceil(o.armLength / targetProfileSize)));
      const cellHeight = o.productHeight / rows;
      const cellDepth = o.armLength / columns;
      const gap = Math.min(8, Math.max(3, Math.min(cellHeight, cellDepth) * 0.08));
      const count = rows * columns;
      const outerGeometry = new THREE.BoxGeometry(
        o.productLength,
        Math.max(12, cellHeight - gap),
        Math.max(12, cellDepth - gap),
      );
      const mouthGeometry = new THREE.BoxGeometry(
        7,
        Math.max(7, cellHeight - gap * 3),
        Math.max(7, cellDepth - gap * 3),
      );
      const outer = new THREE.InstancedMesh(outerGeometry, productOuterMat, count);
      const leftMouths = new THREE.InstancedMesh(mouthGeometry, productInnerMat, count);
      const rightMouths = new THREE.InstancedMesh(mouthGeometry, productInnerMat, count);
      const dummy = new THREE.Object3D();
      let index = 0;
      for (let row = 0; row < rows; row += 1) {
        const y = supportTopY + (row + 0.5) * cellHeight;
        for (let column = 0; column < columns; column += 1) {
          const z = centerZ - o.armLength / 2 + (column + 0.5) * cellDepth;
          dummy.position.set(0, y, z);
          dummy.updateMatrix();
          outer.setMatrixAt(index, dummy.matrix);
          dummy.position.set(-(o.productLength / 2 + 4), y, z);
          dummy.updateMatrix();
          leftMouths.setMatrixAt(index, dummy.matrix);
          dummy.position.set(o.productLength / 2 + 4, y, z);
          dummy.updateMatrix();
          rightMouths.setMatrixAt(index, dummy.matrix);
          index += 1;
        }
      }
      outer.instanceMatrix.needsUpdate = true;
      leftMouths.instanceMatrix.needsUpdate = true;
      rightMouths.instanceMatrix.needsUpdate = true;
      outer.castShadow = true;
      outer.receiveShadow = true;
      outer.frustumCulled = false;
      leftMouths.frustumCulled = false;
      rightMouths.frustumCulled = false;
      outer.name = 'Kutu profil bağı · galvaniz profil demeti';
      leftMouths.name = 'Kutu profil bağı · sol boş profil ağızları';
      rightMouths.name = 'Kutu profil bağı · sağ boş profil ağızları';
      this.root.add(outer, leftMouths, rightMouths);

      const bundleY = supportTopY + o.productHeight / 2;
      const bandInset = Math.max(140, Math.min(360, o.productLength * 0.055));
      const bandGeometry = new THREE.BoxGeometry(42, o.productHeight + 26, o.armLength + 24);
      for (const x of [-(o.productLength / 2 - bandInset), o.productLength / 2 - bandInset]) {
        const band = new THREE.Mesh(bandGeometry, productBandMat);
        band.position.set(x, bundleY, centerZ);
        band.castShadow = true;
        band.name = 'Kutu profil bağı · paketleme şeridi';
        this.root.add(band);
      }
    };

    // İlk profil bağı zemindeki taban profilinin üzerinde başlar.
    addProfileBundle(o.armLength / 2 + uprightDepth / 2, uprightSection.h);
    if (o.doubleSided) addProfileBundle(-(o.armLength / 2 + uprightDepth / 2), uprightSection.h);

    // Dengeli yüklemede uç taşma = gerçek ayak merkez aralığının yarısıdır.
    for (let level = 1; level <= o.levels; level += 1) {
      const armY = (o.height / Math.max(1, o.levels)) * level;
      const armTopY = armY + armSection.h / 2;
      addProfileBundle(o.armLength / 2 + uprightDepth / 2, armTopY);
      if (o.doubleSided) addProfileBundle(-(o.armLength / 2 + uprightDepth / 2), armTopY);
    }

    // RAFEX_KONSOL_BRACE_V7`;
if (source.includes(addAnchor)) source = source.replace(addAnchor, addReplacement);
else if (!source.includes("Kutu profil bağı · galvaniz profil demeti")) throw new Error('Konsol profil bağı ekleme noktası bulunamadı.');

for (const required of [
  'productLength: clamp(Number(next.productLength)',
  'liftClearance: clamp(Number(next.liftClearance)',
  'new THREE.InstancedMesh(outerGeometry, productOuterMat, count)',
  'addProfileBundle(o.armLength / 2 + uprightDepth / 2, uprightSection.h)',
  "Kutu profil bağı · galvaniz profil demeti",
  "Kutu profil bağı · paketleme şeridi",
]) if (!source.includes(required)) throw new Error('Konsol viewer ürün desteği v12 eksik: ' + required);

fs.writeFileSync(file, source);
console.log('Konsol viewer v12: zemin profili dahil her taşıma seviyesine galvaniz kare kutu profil bağı eklendi.');
