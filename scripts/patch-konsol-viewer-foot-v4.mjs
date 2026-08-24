import fs from 'node:fs';

const file='client/konsol-viewer.entry.js';
let source=fs.readFileSync(file,'utf8');
const oldMat="    const baseMat = new THREE.MeshStandardMaterial({ color: 0x385b49, metalness: 0.65, roughness: 0.4 });";
if(source.includes(oldMat))source=source.replace(oldMat,'    const baseMat = uprightMat;');

const oldBase=`      const base = new THREE.Mesh(new THREE.BoxGeometry(330, 28, 430), baseMat);
      base.position.set(x, 14, 0);
      base.castShadow = true;
      base.receiveShadow = true;
      this.root.add(base);`;
const newBase=`      // Ayak profili ayrı bir parça gibi değil, dikey ayağın zemindeki devamıdır.
      // Tek taraflı sistemde kol yönüne; çift taraflı sistemde iki yöne aynı galvaniz
      // malzeme ve aynı kesit görünümüyle uzanır.
      const baseDepth = o.doubleSided ? (o.armLength * 2 + uprightDepth) : (o.armLength + uprightDepth);
      const base = new THREE.Mesh(new THREE.BoxGeometry(uprightWidth, uprightDepth, baseDepth), baseMat);
      base.position.set(x, uprightDepth / 2, o.doubleSided ? 0 : o.armLength / 2);
      base.castShadow = true;
      base.receiveShadow = true;
      this.root.add(base);`;
if(!source.includes(oldBase)&&!source.includes('const baseDepth = o.doubleSided'))throw new Error('Konsol ayak profili kaynak bloğu bulunamadı.');
if(source.includes(oldBase))source=source.replace(oldBase,newBase);
for(const required of ['const baseMat = uprightMat;','const baseDepth = o.doubleSided','o.armLength / 2'])if(!source.includes(required))throw new Error('Konsol ayak profili v4 eksik: '+required);
fs.writeFileSync(file,source);
console.log('Konsol v4: ayak profili ayağın devamı ve aynı galvaniz renk olarak uygulandı.');
