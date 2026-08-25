import fs from 'node:fs';

const file='client/konsol-viewer.entry.js';
let source=fs.readFileSync(file,'utf8');
const oldLine='        const y = (o.height / (o.levels + 1)) * level;';
const newLine='        const y = (o.height / Math.max(1, o.levels)) * level;';
if(source.includes(oldLine)) source=source.replace(oldLine,newLine);
else if(!source.includes(newLine)) throw new Error('Konsol top-arm hedef satiri bulunamadi.');
fs.writeFileSync(file,source);
console.log('Konsol v8 viewer: en ust kol kotu secilen KRS H degerine esit.');