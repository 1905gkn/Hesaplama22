import fs from 'node:fs';

const file='client/konsol-viewer.entry.js';
let source=fs.readFileSync(file,'utf8');

const oldPlan="      setPlan: Array.isArray(next.setPlan) ? next.setPlan.map((n) => clamp(Math.round(Number(n) || 2), 2, 3)) : [],";
const newPlan="      setPlan: Array.isArray(next.setPlan) ? next.setPlan.map((n) => clamp(Math.round(Number(n) || 2), 2, 5)) : [],";
if(source.includes(oldPlan)) source=source.replace(oldPlan,newPlan);
else if(!source.includes('clamp(Math.round(Number(n) || 2), 2, 5)')) throw new Error('Konsol v7 setPlan normalize hedefi bulunamadı.');

const oldBraceMat='    const braceMat = uprightMat;';
const newBraceMat='    const braceMat = new THREE.MeshStandardMaterial({ color: 0xd5443f, metalness: 0.36, roughness: 0.48 });';
if(source.includes(oldBraceMat)) source=source.replace(oldBraceMat,newBraceMat);
else if(!source.includes('color: 0xd5443f')) throw new Error('Konsol v7 deprem profili malzemesi bulunamadı.');

const marker='// RAFEX_KONSOL_BRACE_V7';
if(!source.includes(marker)){
  const braceRe=/    let cursor = 0;[\s\S]*?\n    const floor =/;
  if(!braceRe.test(source)) throw new Error('Konsol v7 çapraz çizim bloğu bulunamadı.');
  const block=`    ${marker}
    // Yatay ve diyagonal deprem profilleri, ayakların önüne ya da arkasına taşmadan
    // doğrudan iki ayak profilinin orta düzleminde yerleşir.
    const horizontalRowCount = o.height <= 3500 ? 3 : (o.height <= 4500 ? 4 : 5);
    const yBottom = Math.max(220, o.height * 0.08);
    const yTop = Math.max(yBottom + 500, o.height * 0.90);
    const braceRows = Array.from({ length: horizontalRowCount }, (_, row) =>
      yBottom + (yTop - yBottom) * (row / Math.max(1, horizontalRowCount - 1))
    );
    const yMid = braceRows[Math.floor(braceRows.length / 2)];
    const addBrace = (x1, y1, x2, y2) => this.root.add(cylinderBetween([x1, y1, 0], [x2, y2, 0], 18, braceMat));
    let cursor = 0;
    const plan = o.setPlan.length ? o.setPlan : [Math.min(5, o.uprightCount)];
    plan.forEach((setSize) => {
      const actual = Math.min(Math.max(2, setSize), o.uprightCount - cursor);
      if (actual < 2) return;
      const xs = Array.from({ length: actual }, (_, i) => startX + (cursor + i) * o.spacing);

      for (let bay = 0; bay < actual - 1; bay += 1) {
        braceRows.forEach((y) => addBrace(xs[bay], y, xs[bay + 1], y));
      }

      const low = braceRows[0];
      const high = braceRows[braceRows.length - 1];
      if (actual === 2) {
        addBrace(xs[0], high, xs[1], yMid);
        addBrace(xs[0], low, xs[1], yMid);
      } else if (actual === 3) {
        addBrace(xs[0], high, xs[1], yMid);
        addBrace(xs[0], low, xs[1], yMid);
        addBrace(xs[1], yMid, xs[2], high);
        addBrace(xs[1], yMid, xs[2], low);
      } else if (actual === 4) {
        addBrace(xs[0], high, xs[1], yMid);
        addBrace(xs[0], low, xs[1], yMid);
        addBrace(xs[1], yMid, xs[2], high);
        addBrace(xs[1], yMid, xs[2], low);
      } else if (actual === 5) {
        const c = 2;
        addBrace(xs[c - 1], high, xs[c], yMid);
        addBrace(xs[c - 1], low, xs[c], yMid);
        addBrace(xs[c], yMid, xs[c + 1], high);
        addBrace(xs[c], yMid, xs[c + 1], low);
      }
      cursor += actual;
    });

    const floor =`;
  source=source.replace(braceRe,block);
}

for(const required of [
  marker,
  'horizontalRowCount',
  'actual === 4',
  'actual === 5',
  'cylinderBetween([x1, y1, 0], [x2, y2, 0]',
  'clamp(Math.round(Number(n) || 2), 2, 5)',
  'color: 0xd5443f',
]){
  if(!source.includes(required)) throw new Error('Konsol viewer v7 doğrulaması eksik: '+required);
}
fs.writeFileSync(file,source);
console.log('Konsol v7 viewer: deprem çaprazları ayakların orta düzleminde, 2/3/4/5 ayak düzeniyle çiziliyor.');
