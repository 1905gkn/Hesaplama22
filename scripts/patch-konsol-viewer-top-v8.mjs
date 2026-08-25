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
    const bounds = this.contentBounds();
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const radius = Math.max(size.x, size.y, size.z, 1000) * 1.55;
    this.controls.target.copy(center);
    this.topPlanViewVersion = 'RAFEX_KONSOL_TOP_V8';

    // Üst görünüş gerçek plan görünüşüne yakın olmalı. Perspektif kamerayı çok uzaktan
    // ve dar FOV ile kullanarak farklı katların üst üste büyüyüp küçülmesini engelliyoruz.
    if (view === 'top') {
      this.controls.enableRotate = false;
      this.camera.up.set(0, 0, -1);
      this.camera.fov = 3;
      this.camera.zoom = 1;
      this.camera.position.set(center.x, center.y + radius * 18, center.z);
      this.camera.near = Math.max(1, radius / 1000);
      this.camera.far = Math.max(300000, radius * 80);
    } else {
      this.controls.enableRotate = true;
      this.camera.up.set(0, 1, 0);
      this.camera.fov = 36;
      this.camera.zoom = 1;
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

for(const required of ["this.topPlanViewVersion = 'RAFEX_KONSOL_TOP_V8';",'this.camera.fov = 3','this.camera.up.set(0, 0, -1)','this.controls.enableRotate = false','radius * 18']){
  if(!source.includes(required)) throw new Error('Konsol top v8 doğrulaması eksik: '+required);
}

fs.writeFileSync(file,source);
console.log('Konsol v8 viewer: üst görünüş temiz plan görünüşüne sabitlendi; kat perspektif yığılması kaldırıldı.');
