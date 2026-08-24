import fs from 'node:fs';

const file='client/konsol-viewer.entry.js';
let source=fs.readFileSync(file,'utf8');

function replaceRequired(from,to,label){
  if(!source.includes(from))throw new Error('Konsol viewer v5 hedefi bulunamadı: '+label);
  source=source.replace(from,to);
}

if(!source.includes('const IPE_SECTIONS = {')){
  const classAnchor='class KonsolViewer {';
  if(!source.includes(classAnchor))throw new Error('Konsol viewer sınıf başlangıcı bulunamadı.');
  const profileHelpers=`const IPE_SECTIONS = {
  ipe180:{h:180,b:91,tw:5.3,tf:8.0}, ipe200:{h:200,b:100,tw:5.6,tf:8.5},
  ipe220:{h:220,b:110,tw:5.9,tf:9.2}, ipe240:{h:240,b:120,tw:6.2,tf:9.8},
  ipe270:{h:270,b:135,tw:6.6,tf:10.2}, ipe300:{h:300,b:150,tw:7.1,tf:10.7},
};
const NPI_SECTIONS = {
  npi80:{h:80,b:42,tw:3.9,tf:5.9}, npi100:{h:100,b:50,tw:4.5,tf:6.8},
  npi120:{h:120,b:58,tw:5.1,tf:7.7}, npi140:{h:140,b:66,tw:5.7,tf:8.6},
  npi160:{h:160,b:74,tw:6.3,tf:9.5}, npi180:{h:180,b:82,tw:6.9,tf:10.4},
  npi200:{h:200,b:90,tw:7.5,tf:11.3}, npi220:{h:220,b:98,tw:8.1,tf:12.2},
};
function profileSpec(table,key,fallback){return table[key]||table[fallback]}
function prepProfileMesh(mesh){mesh.castShadow=true;mesh.receiveShadow=true;return mesh}
function iBeamAlongY(length,section,material){
  const group=new THREE.Group();
  const web=Math.max(1,section.h-section.tf*2);
  const f1=prepProfileMesh(new THREE.Mesh(new THREE.BoxGeometry(section.b,length,section.tf),material));
  const f2=prepProfileMesh(new THREE.Mesh(new THREE.BoxGeometry(section.b,length,section.tf),material));
  const w=prepProfileMesh(new THREE.Mesh(new THREE.BoxGeometry(section.tw,length,web),material));
  f1.position.z=section.h/2-section.tf/2;f2.position.z=-section.h/2+section.tf/2;
  group.add(f1,f2,w);return group;
}
function iBeamAlongZ(length,section,material){
  const group=new THREE.Group();
  const web=Math.max(1,section.h-section.tf*2);
  const f1=prepProfileMesh(new THREE.Mesh(new THREE.BoxGeometry(section.b,section.tf,length),material));
  const f2=prepProfileMesh(new THREE.Mesh(new THREE.BoxGeometry(section.b,section.tf,length),material));
  const w=prepProfileMesh(new THREE.Mesh(new THREE.BoxGeometry(section.tw,web,length),material));
  f1.position.y=section.h/2-section.tf/2;f2.position.y=-section.h/2+section.tf/2;
  group.add(f1,f2,w);return group;
}

`;
  source=source.replace(classAnchor,profileHelpers+classAnchor);
}

replaceRequired(
`      armLength: clamp(Number(next.armLength) || 1200, 250, 3000),
      levels: clamp(Math.round(Number(next.levels) || 4), 1, 12),`,
`      armLength: clamp(Number(next.armLength) || 1200, 250, 3000),
      baseDepth: clamp(Number(next.baseDepth) || 1200, 250, 3500),
      armColor: next.armColor === 'ral2004' ? 'ral2004' : 'ral1007',
      uprightProfile: IPE_SECTIONS[next.uprightProfile] ? next.uprightProfile : 'ipe180',
      armProfile: NPI_SECTIONS[next.armProfile] ? next.armProfile : 'npi120',
      levels: clamp(Math.round(Number(next.levels) || 4), 1, 12),`,
'normalize alanları');

replaceRequired(
`    const uprightMat = new THREE.MeshStandardMaterial({ color: 0xa7b0ab, metalness: 0.72, roughness: 0.36 });
    const armMat = new THREE.MeshStandardMaterial({ color: 0xe2b423, metalness: 0.36, roughness: 0.48 });
    const braceMat = new THREE.MeshStandardMaterial({ color: 0x355a48, metalness: 0.55, roughness: 0.42 });
    const baseMat = uprightMat;
    const endMat = new THREE.MeshStandardMaterial({ color: 0xd2a600, metalness: 0.35, roughness: 0.48 });`,
`    // Deliksiz, gerçek I kesit görünümü: ayak IPE; kollar NPI.
    const uprightMat = new THREE.MeshStandardMaterial({ color: 0x005387, metalness: 0.62, roughness: 0.4 });
    const armColor = o.armColor === 'ral2004' ? 0xE25303 : 0xE1A100;
    const armMat = new THREE.MeshStandardMaterial({ color: armColor, metalness: 0.36, roughness: 0.48 });
    const braceMat = uprightMat;
    const baseMat = uprightMat;
    const endMat = new THREE.MeshStandardMaterial({ color: armColor, metalness: 0.35, roughness: 0.48 });`,
'RAL malzemeleri');

replaceRequired(
`    const uprightDepth = 105;
    const uprightWidth = 130;`,
`    const uprightSection = profileSpec(IPE_SECTIONS,o.uprightProfile,'ipe180');
    const armSection = profileSpec(NPI_SECTIONS,o.armProfile,'npi120');
    const uprightDepth = uprightSection.h;
    const uprightWidth = uprightSection.b;`,
'profil kesit ölçüleri');

replaceRequired(
`      const upright = new THREE.Mesh(new THREE.BoxGeometry(uprightWidth, o.height, uprightDepth), uprightMat);
      upright.position.set(x, o.height / 2, 0);
      upright.castShadow = true;
      upright.receiveShadow = true;
      this.root.add(upright);`,
`      const upright = iBeamAlongY(o.height, uprightSection, uprightMat);
      upright.name = o.uprightProfile.toUpperCase() + ' Ayak';
      upright.position.set(x, o.height / 2, 0);
      this.root.add(upright);`,
'IPE ayak geometrisi');

replaceRequired(
`      const baseDepth = o.doubleSided ? (o.armLength * 2 + uprightDepth) : (o.armLength + uprightDepth);
      const base = new THREE.Mesh(new THREE.BoxGeometry(uprightWidth, uprightDepth, baseDepth), baseMat);
      base.position.set(x, uprightDepth / 2, o.doubleSided ? 0 : o.armLength / 2);
      base.castShadow = true;
      base.receiveShadow = true;
      this.root.add(base);`,
`      const baseDepth = o.doubleSided ? o.baseDepth * 2 : o.baseDepth;
      const base = iBeamAlongZ(baseDepth, uprightSection, baseMat);
      base.name = o.uprightProfile.toUpperCase() + ' Taban';
      base.position.set(x, uprightSection.h / 2, o.doubleSided ? 0 : o.baseDepth / 2);
      this.root.add(base);`,
'IPE taban geometrisi');

replaceRequired(
`        const frontArm = new THREE.Mesh(new THREE.BoxGeometry(95, 115, o.armLength), armMat);
        frontArm.position.set(x, y, o.armLength / 2 + uprightDepth / 2);
        frontArm.castShadow = true;
        frontArm.receiveShadow = true;
        this.root.add(frontArm);`,
`        const frontArm = iBeamAlongZ(o.armLength, armSection, armMat);
        frontArm.name = o.armProfile.toUpperCase() + ' Kol';
        frontArm.position.set(x, y, o.armLength / 2 + uprightDepth / 2);
        this.root.add(frontArm);`,
'NPI kol geometrisi');

replaceRequired(
`      new THREE.PlaneGeometry(Math.max(8000, width + 5000), Math.max(7000, o.armLength * 2 + 4000)),`,
`      new THREE.PlaneGeometry(Math.max(8000, width + 5000), Math.max(7000, Math.max(o.armLength, o.baseDepth) * 2 + 4000)),`,
'zemin derinliği');

for(const required of [
  'const IPE_SECTIONS = {','const NPI_SECTIONS = {','iBeamAlongY','iBeamAlongZ',
  "uprightProfile: IPE_SECTIONS[next.uprightProfile]","armProfile: NPI_SECTIONS[next.armProfile]",
  "color: 0x005387","0xE25303","0xE1A100","o.baseDepth * 2","o.baseDepth / 2",
  "o.uprightProfile.toUpperCase() + ' Ayak'","o.armProfile.toUpperCase() + ' Kol'"
]){
  if(!source.includes(required))throw new Error('Konsol viewer v5 doğrulaması eksik: '+required);
}
fs.writeFileSync(file,source);
console.log('Konsol v5 viewer: deliksiz IPE 180-300 ayak, NPI 80-220 kol, RAL-5010 ve RAL-1007/2004 aktif.');
