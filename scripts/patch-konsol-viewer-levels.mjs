import fs from 'node:fs';
import {konsolLevelGeometry} from '../client/konsol-level-model.mjs';
export function transform(source){
 if(source.includes('/* konsol-level-geometry */'))return source;
 function replace(a,b){if(!source.includes(a))throw Error('Konsol levels viewer missing '+a.slice(0,70));source=source.replace(a,b);}
 replace('      levels: clamp(Math.round(Number(next.levels) || 4), 1, 12),', '      levelRows: Array.isArray(next.levelRows)?next.levelRows.map(r=>({...r})):null,\n      levelGap: Number(next.levelGap)||1000,\n      levels: clamp(Math.round(Number(next.levels) || 4), 1, 12),');
 replace('    const visualTopArmSupport = uprightSection.h + visualLevelGap * o.levels;', `    /* konsol-level-geometry */
    const levelGeometry=o.levelRows?.length===o.levels?konsolLevelGeometry(o.levelRows,o.levelGap):null;
    const visualTopArmSupport = levelGeometry?levelGeometry.at(-1).top:uprightSection.h + visualLevelGap * o.levels;`);
 replace('    const visualTopExtension = Math.max(0, visualLevelGap);','    const visualTopExtension = levelGeometry?Math.max(0,o.height-visualTopArmSupport):Math.max(0, visualLevelGap);');
 const start=source.indexOf('      for (let level = 1; level <= o.levels; level += 1) {'),end=source.indexOf('    // Ürünü tek parça',start);
 if(start<0||end<0)throw Error('Arm loop boundary missing');
 let block=source.slice(start,end).replaceAll('o.armLength','levelDepth').replace('        const y = uprightSection.h + visualLevelGap * level - armSection.h / 2;', '        const levelDepth=levelGeometry?.[level-1]?.depth??o.armLength;\n        const y = (levelGeometry?.[level-1]?.top??(uprightSection.h + visualLevelGap * level)) - armSection.h / 2;');
 source=source.slice(0,start)+block+source.slice(end);
 // Give each load helper its own depth and available height, without mutating viewer options.
 for(const name of ['addProfileBundle','addPalletLoad']){
  const a=source.indexOf('    const '+name+' = (centerZ, supportTopY) => {'),b=source.indexOf('\n    };',a)+7;if(a<0||b<7)throw Error('Missing load helper '+name);
  let block=source.slice(a,b).replace('(centerZ, supportTopY)', '(centerZ, supportTopY, depth=o.armLength, loadHeight=o.productHeight)').replaceAll('o.armLength','depth').replaceAll('o.productHeight','loadHeight').replace('depth=depth, loadHeight=loadHeight','depth=o.armLength, loadHeight=o.productHeight');source=source.slice(0,a)+block+source.slice(b);
 }
 replace('const addSelectedLoad = (centerZ, supportTopY) => {','const addSelectedLoad = (centerZ, supportTopY, depth=o.armLength, loadHeight=o.productHeight) => {');
 replace('addPalletLoad(centerZ, supportTopY);','addPalletLoad(centerZ, supportTopY, depth, loadHeight);');
 replace('addProfileBundle(centerZ, supportTopY);','addProfileBundle(centerZ, supportTopY, depth, loadHeight);');
 const a=source.indexOf('    // İlk profil bağı'),b=source.indexOf('    // RAFEX_KONSOL_BRACE_V7',a);
 if(a<0||b<0)throw Error('Load loop missing');
 source=source.slice(0,a)+`    // Ground goods and arm goods use their respective available clearances.
    const groundHeight=levelGeometry?Math.max(50,levelGeometry[0].top-armSection.h-uprightSection.h-o.liftClearance):o.productHeight;
    addSelectedLoad(o.baseDepth/2+uprightDepth/2,uprightSection.h,o.baseDepth,groundHeight);
    if(o.doubleSided)addSelectedLoad(-(o.baseDepth/2+uprightDepth/2),uprightSection.h,o.baseDepth,groundHeight);
    for(let level=1;level<=o.levels;level++){
      const row=levelGeometry?.[level-1],depth=row?.depth??o.armLength,top=row?.top??(uprightSection.h+visualLevelGap*level);
      const loadHeight=row?Math.max(50,(levelGeometry[level]?.distance??o.levelGap)-armSection.h-o.liftClearance):o.productHeight;
      if(!row||row.load>0){addSelectedLoad(depth/2+uprightDepth/2,top,depth,loadHeight);if(o.doubleSided)addSelectedLoad(-(depth/2+uprightDepth/2),top,depth,loadHeight);}
    }
`+source.slice(b);
 return konsolLevelGeometry.toString()+'\n'+source;
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-konsol-viewer-levels.mjs')){const p='client/konsol-viewer.entry.js';fs.writeFileSync(p,transform(fs.readFileSync(p,'utf8')));}
