import fs from "node:fs";
import path from "node:path";
const p=path.join(process.cwd(),"portal.html");
let html=fs.readFileSync(p,"utf8");
const pattern=/\n\s*document\.addEventListener\('pointerdown',function\(event\)\{[\s\S]*?window\.m2ToggleCustomizeRackAccessoryLevel\(type,level\);\n\s*\},true\);\n/;
if(pattern.test(html))html=html.replace(pattern,"\n");
if(/document\.addEventListener\('pointerdown',function\(event\)\{[\s\S]*?m2-customize-accessory-levels button/.test(html))throw new Error('Cift kat pointerdown handler kaldirilamadi.');
fs.writeFileSync(p,html);
console.log('Aksesuar katlari tek click akisina indirildi.');
