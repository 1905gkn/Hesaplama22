import fs from 'node:fs';

const file='client/konsol-viewer.entry.js';
let source=fs.readFileSync(file,'utf8');

const oldPlan="      setPlan: Array.isArray(next.setPlan) ? next.setPlan.map((n) => clamp(Math.round(Number(n) || 2), 2, 3)) : [],";
const newPlan="      setPlan: Array.isArray(next.setPlan) ? next.setPlan.map((n) => clamp(Math.round(Number(n) || 2), 2, 5)) : [],";
if(source.includes(oldPlan)) source=source.replace(oldPlan,newPlan);
else if(!source.includes('clamp(Math.round(Number(n) || 2), 2, 5)')) throw new Error('Konsol v7 setPlan normalize hedefi bulunamadı.');

const marker='// RAFEX_KONSOL_BRACE_V7';
if(!source.includes(marker)){
  const braceRe=/    let cursor = 0;[\s\S]*?\n    const floor =/;
  if(!braceRe.test(source)) throw new Error('Konsol v7 çapraz çizim bloğu bulunamadı.');
  const block=`    ${marker}\n    // İlk referans görseldeki 2/3/4/5 ayaklı deprem çapraz düzeni.\n    // Yatay profiller tüm açıklıklarda devam eder; çaprazlar yalnız referans düzenindeki iki açıklıkta toplanır.\n    const horizontalRowCount = o.height <= 3500 ? 3 : (o.height <= 4500 ? 4 : 5);\n    const yBottom = Math.max(220, o.height * 0.08);\n    const yTop = Math.max(yBottom + 500, o.height * 0.90);\n    const braceRows = Array.from({ length: horizontalRowCount }, (_, row) =>\n      yBottom + (yTop - yBottom) * (row / Math.max(1, horizontalRowCount - 1))\n    );\n    const yMid = braceRows[Math.floor(braceRows.length / 2)];\n    const addBrace = (x1, y1, x2, y2, z) => this.root.add(cylinderBetween([x1, y1, z], [x2, y2, z], 18, braceMat));\n    let cursor = 0;\n    const plan = o.setPlan.length ? o.setPlan : [Math.min(5, o.uprightCount)];\n    plan.forEach((setSize, setIndex) => {\n      const actual = Math.min(Math.max(2, setSize), o.uprightCount - cursor);\n      if (actual < 2) return;\n      const z = -uprightDepth / 2 - 42 - setIndex * 4;\n      const xs = Array.from({ length: actual }, (_, i) => startX + (cursor + i) * o.spacing);\n\n      // Görseldeki gibi yatay deprem profilleri set içindeki bütün açıklıklarda devam eder.\n      for (let bay = 0; bay < actual - 1; bay += 1) {\n        braceRows.forEach((y) => addBrace(xs[bay], y, xs[bay + 1], y, z));\n      }\n\n      const low = braceRows[0];\n      const high = braceRows[braceRows.length - 1];\n      if (actual === 2) {\n        // 2 ayak: iki diyagonal sağ orta düğümde birleşir.\n        addBrace(xs[0], high, xs[1], yMid, z);\n        addBrace(xs[0], low, xs[1], yMid, z);\n      } else if (actual === 3) {\n        // 3 ayak: dört diyagonal orta ayağın orta düğümünde birleşir.\n        addBrace(xs[0], high, xs[1], yMid, z);\n        addBrace(xs[0], low, xs[1], yMid, z);\n        addBrace(xs[1], yMid, xs[2], high, z);\n        addBrace(xs[1], yMid, xs[2], low, z);\n      } else if (actual === 4) {\n        // 4 ayak: ilk iki açıklık çaprazlı, son açıklık yalnız yatay profilli.\n        addBrace(xs[0], high, xs[1], yMid, z);\n        addBrace(xs[0], low, xs[1], yMid, z);\n        addBrace(xs[1], yMid, xs[2], high, z);\n        addBrace(xs[1], yMid, xs[2], low, z);\n      } else if (actual === 5) {\n        // 5 ayak: ortadaki iki açıklık çaprazlı, dış açıklıklar yalnız yatay profilli.\n        const c = 2;\n        addBrace(xs[c - 1], high, xs[c], yMid, z);\n        addBrace(xs[c - 1], low, xs[c], yMid, z);\n        addBrace(xs[c], yMid, xs[c + 1], high, z);\n        addBrace(xs[c], yMid, xs[c + 1], low, z);\n      }\n      cursor += actual;\n    });\n\n    const floor =`;
  source=source.replace(braceRe,block);
}

for(const required of [marker,'horizontalRowCount','actual === 4','actual === 5','clamp(Math.round(Number(n) || 2), 2, 5)']){
  if(!source.includes(required)) throw new Error('Konsol viewer v7 doğrulaması eksik: '+required);
}
fs.writeFileSync(file,source);
console.log('Konsol v7 viewer: 2/3/4/5 ayak deprem çapraz düzeni ilk referans görsele göre çiziliyor.');
