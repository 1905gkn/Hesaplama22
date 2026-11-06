import fs from 'node:fs';
import {konsolDimensions,addKonsolDimensions} from '../client/konsol-dimensions.mjs';
export function transform(source){
 if(source.includes('/* konsol-preview-v526 */'))return source;
 const replace=(a,b)=>{if(!source.includes(a))throw Error('v526 missing '+a);source=source.replace(a,b);};
 replace('    // RAFEX_KONSOL_BRACE_V7',`    if(this.canvas){const rows=levelGeometry||Array.from({length:o.levels},(_,i)=>({top:uprightSection.h+visualLevelGap*(i+1),depth:o.armLength}));addKonsolDimensions(THREE,this.root,konsolDimensions(o,rows,uprightSection.h,visualUprightHeight,width,uprightDepth));}
    // RAFEX_KONSOL_BRACE_V7`);
 replace("    if(this.canvas?.id==='konsolCanvas')next=window.rafexCopiedDetailV135?.('konsol')||next;",`    if(this.canvas?.id==='konsolCanvas'){next=window.rafexCopiedDetailV135?.('konsol')||next;if(this.selectedLoadType)next={...next,loadType:this.selectedLoadType};}`);
 replace('  getSavedDetail() {',`  setLoadType(type){if(!['profile','pallet','unpacked'].includes(type)||!savedMainViewer||savedMainViewer.destroyed)return false;savedMainViewer.selectedLoadType=type;savedMainViewer.update({...savedMainViewer.options,loadType:type},false);return true;},
  getSavedDetail() {`);
 replace('materials.forEach((material) => material?.dispose?.());','materials.forEach((material) => {material?.map?.dispose?.();material?.dispose?.();});');
 return '/* konsol-preview-v526 */\n'+konsolDimensions.toString()+'\n'+addKonsolDimensions.toString()+'\n'+source;
}
if(/[\\/]konsol-preview-v526\.mjs$/.test(process.argv[1]||'')){const p='client/konsol-viewer.entry.js';fs.writeFileSync(p,transform(fs.readFileSync(p,'utf8')));}
