import fs from 'node:fs';

const file='client/konsol-viewer.entry.js';
let source=fs.readFileSync(file,'utf8');

function replaceRequired(from,to,label){
  if(!source.includes(from))throw new Error('Konsol viewer v5 hedefi bulunamadı: '+label);
  source=source.replace(from,to);
}

replaceRequired(
`      armLength: clamp(Number(next.armLength) || 1200, 250, 3000),
      levels: clamp(Math.round(Number(next.levels) || 4), 1, 12),`,
`      armLength: clamp(Number(next.armLength) || 1200, 250, 3000),
      baseDepth: clamp(Number(next.baseDepth) || 1200, 250, 3500),
      armColor: next.armColor === 'ral2004' ? 'ral2004' : 'ral1007',
      levels: clamp(Math.round(Number(next.levels) || 4), 1, 12),`,
'normalize alanları');

replaceRequired(
`    const uprightMat = new THREE.MeshStandardMaterial({ color: 0xa7b0ab, metalness: 0.72, roughness: 0.36 });
    const armMat = new THREE.MeshStandardMaterial({ color: 0xe2b423, metalness: 0.36, roughness: 0.48 });
    const braceMat = new THREE.MeshStandardMaterial({ color: 0x355a48, metalness: 0.55, roughness: 0.42 });
    const baseMat = uprightMat;
    const endMat = new THREE.MeshStandardMaterial({ color: 0xd2a600, metalness: 0.35, roughness: 0.48 });`,
`    // Ayak grubu RAL-5010. Kol grubu kullanıcı seçimine göre RAL-1007 / RAL-2004.
    const uprightMat = new THREE.MeshStandardMaterial({ color: 0x005387, metalness: 0.62, roughness: 0.4 });
    const armColor = o.armColor === 'ral2004' ? 0xE25303 : 0xE1A100;
    const armMat = new THREE.MeshStandardMaterial({ color: armColor, metalness: 0.36, roughness: 0.48 });
    const braceMat = uprightMat;
    const baseMat = uprightMat;
    const endMat = new THREE.MeshStandardMaterial({ color: armColor, metalness: 0.35, roughness: 0.48 });`,
'RAL malzemeleri');

replaceRequired(
`      const baseDepth = o.doubleSided ? (o.armLength * 2 + uprightDepth) : (o.armLength + uprightDepth);`,
`      const baseDepth = o.doubleSided ? (o.baseDepth * 2 + uprightDepth) : (o.baseDepth + uprightDepth);`,
'taban derinliği geometrisi');
replaceRequired(
`      base.position.set(x, uprightDepth / 2, o.doubleSided ? 0 : o.armLength / 2);`,
`      base.position.set(x, uprightDepth / 2, o.doubleSided ? 0 : o.baseDepth / 2);`,
'taban derinliği konumu');
replaceRequired(
`      new THREE.PlaneGeometry(Math.max(8000, width + 5000), Math.max(7000, o.armLength * 2 + 4000)),`,
`      new THREE.PlaneGeometry(Math.max(8000, width + 5000), Math.max(7000, Math.max(o.armLength, o.baseDepth) * 2 + 4000)),`,
'zemin derinliği');

for(const required of ["baseDepth: clamp(Number(next.baseDepth)","armColor: next.armColor === 'ral2004'","color: 0x005387","0xE25303","0xE1A100","o.baseDepth * 2","o.baseDepth / 2"]){
  if(!source.includes(required))throw new Error('Konsol viewer v5 doğrulaması eksik: '+required);
}
fs.writeFileSync(file,source);
console.log('Konsol v5 viewer: RAL-5010 ayak, RAL-1007/2004 kol ve bağımsız taban kat derinliği aktif.');
