import fs from 'node:fs';

const file='client/konsol-viewer.entry.js';
let source=fs.readFileSync(file,'utf8');

const oldBlock=`  setView(view) {
    const bounds = this.contentBounds();
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const radius = Math.max(size.x, size.y, size.z, 1000) * 1.55;
    this.controls.target.copy(center);
    if (view === 'front') this.camera.position.set(center.x, center.y + size.y * 0.03, center.z + radius);
    else if (view === 'side') this.camera.position.set(center.x + radius, center.y + size.y * 0.03, center.z);
    else if (view === 'top') this.camera.position.set(center.x, center.y + radius, center.z + 1);
    else this.camera.position.set(center.x + radius * 0.72, center.y + radius * 0.42, center.z + radius * 0.72);
    this.camera.near = Math.max(1, radius / 1000);
    this.camera.far = Math.max(200000, radius * 20);
    this.camera.updateProjectionMatrix();
    this.controls.update();
  }`;

const newBlock=`  setView(view) {
    let bounds = this.contentBounds();

    // Üst görünüşte zemin plakasını hesaba katma. Sadece gerçek raf geometrisini fit et.
    // Böylece Serbest Çizim'deki üst görünüş küçük bir ikon gibi kalmaz.
    if (view === 'top') {
      const rackBounds = new THREE.Box3();
      this.root.traverse((node) => {
        if (!node?.isMesh || node.geometry?.type === 'PlaneGeometry') return;
        rackBounds.expandByObject(node, true);
      });
      if (!rackBounds.isEmpty()) bounds = rackBounds;
    }

    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const radius = Math.max(size.x, size.y, size.z, 1000) * 1.55;
    this.controls.target.copy(center);
    this.topPlanViewVersion = 'RAFEX_KONSOL_TOP_V8';

    if (view === 'top') {
      this.controls.enableRotate = false;
      this.camera.up.set(0, 0, -1);
      this.camera.fov = 3;
      this.camera.zoom = 1;

      // Gerçek plan ayak izini canvas'a yaklaşık %85 dolulukla sığdır.
      // Uzak kamera + dar FOV, kat yüksekliklerinin perspektifte farklı ölçeklenmesini önler.
      const aspect = Math.max(0.25, Number(this.camera.aspect) || 1);
      const vfov = THREE.MathUtils.degToRad(this.camera.fov);
      const hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspect);
      const fitX = (Math.max(size.x, 1) / 2) / Math.max(0.0001, Math.tan(hfov / 2));
      const fitZ = (Math.max(size.z, 1) / 2) / Math.max(0.0001, Math.tan(vfov / 2));
      const topDistance = Math.max(fitX, fitZ, 1000) * 1.16;

      this.camera.position.set(center.x, center.y + topDistance, center.z);
      this.camera.near = Math.max(1, topDistance / 10000);
      this.camera.far = Math.max(300000, topDistance * 3 + size.y * 2);

      if (this.grid) this.grid.visible = false;
      this.root.traverse((node) => {
        if (node?.isMesh && node.geometry?.type === 'PlaneGeometry') node.visible = false;
      });
    } else {
      this.controls.enableRotate = true;
      this.camera.up.set(0, 1, 0);
      this.camera.fov = 36;
      this.camera.zoom = 1;
      if (this.grid) this.grid.visible = true;
      this.root.traverse((node) => {
        if (node?.isMesh && node.geometry?.type === 'PlaneGeometry') node.visible = true;
      });
      if (view === 'front') this.camera.position.set(center.x, center.y + size.y * 0.03, center.z + radius);
      else if (view === 'side') this.camera.position.set(center.x + radius, center.y + size.y * 0.03, center.z);
      else this.camera.position.set(center.x + radius * 0.72, center.y + radius * 0.42, center.z + radius * 0.72);
      this.camera.near = Math.max(1, radius / 1000);
      this.camera.far = Math.max(200000, radius * 20);
    }
    this.camera.updateProjectionMatrix();
    this.controls.update();
  }`;

if(source.includes(oldBlock)) source=source.replace(oldBlock,newBlock);
else if(!source.includes("this.topPlanViewVersion = 'RAFEX_KONSOL_TOP_V8';")) throw new Error('Konsol top v8 setView bloğu bulunamadı.');

for(const required of [
  "this.topPlanViewVersion = 'RAFEX_KONSOL_TOP_V8';",
  "node.geometry?.type === 'PlaneGeometry'",
  'const topDistance = Math.max(fitX, fitZ, 1000) * 1.16;',
  'this.camera.up.set(0, 0, -1)',
  'this.controls.enableRotate = false',
  'this.grid.visible = false'
]){
  if(!source.includes(required)) throw new Error('Konsol top v8 doğrulaması eksik: '+required);
}

fs.writeFileSync(file,source);
console.log('Konsol v8 viewer: üst görünüş gerçek raf ayak izine fit edildi; zemin/grid ölçek şişirmesi kaldırıldı.');
