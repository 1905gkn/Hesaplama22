import fs from 'node:fs';

const file='client/konsol-viewer.entry.js';
let source=fs.readFileSync(file,'utf8');

// Kollar mevcut KRS H / kat düzeninde kalır. Yalnızca 3D görselde,
// en üst kolun üzerinde görünen ayak devamı tam bir kat aralığıdır.
// Böylece kapasite tablosu ve H seçimi değişmeden yalnız görsel geometri uzatılır.
const oldArmLine='        const y = (o.height / (o.levels + 1)) * level;';
const topArmLine='        const y = (o.height / Math.max(1, o.levels)) * level;';
if(source.includes(oldArmLine)) source=source.replace(oldArmLine,topArmLine);
else if(!source.includes(topArmLine)) throw new Error('Konsol top-arm hedef satiri bulunamadi.');

const oldGeometry=`    const uprightDepth = uprightSection.h;
    const uprightWidth = uprightSection.b;`;
const newGeometry=`    const uprightDepth = uprightSection.h;
    const uprightWidth = uprightSection.b;
    const visualLevelGap = o.height / Math.max(1, o.levels);
    const visualTopExtension = Math.max(0, visualLevelGap);
    const visualUprightHeight = o.height + visualTopExtension;`;
if(source.includes(oldGeometry)) source=source.replace(oldGeometry,newGeometry);
else if(!source.includes('const visualTopExtension = Math.max(0, visualLevelGap);')) throw new Error('Konsol ust ayak uzama geometrisi hedefi bulunamadi.');

const oldUpright=`      const upright = iBeamAlongY(o.height, uprightSection, uprightMat);
      upright.name = o.uprightProfile.toUpperCase() + ' Ayak';
      upright.position.set(x, o.height / 2, 0);`;
const newUpright=`      const upright = iBeamAlongY(visualUprightHeight, uprightSection, uprightMat);
      upright.name = o.uprightProfile.toUpperCase() + ' Ayak';
      upright.position.set(x, visualUprightHeight / 2, 0);`;
if(source.includes(oldUpright)) source=source.replace(oldUpright,newUpright);
else if(!source.includes('iBeamAlongY(visualUprightHeight, uprightSection, uprightMat)')) throw new Error('Konsol ayak boyu hedefi bulunamadi.');

for(const required of [
  topArmLine.trim(),
  'const visualLevelGap = o.height / Math.max(1, o.levels);',
  'const visualTopExtension = Math.max(0, visualLevelGap);',
  'iBeamAlongY(visualUprightHeight, uprightSection, uprightMat)',
  'upright.position.set(x, visualUprightHeight / 2, 0)'
]){
  if(!source.includes(required)) throw new Error('Konsol ust ayak uzama dogrulamasi eksik: '+required);
}

fs.writeFileSync(file,source);
console.log('Konsol v8 viewer: en ust kol ustunde tam bir kat aralığı kadar ayak devamı gorselde aktif.');
