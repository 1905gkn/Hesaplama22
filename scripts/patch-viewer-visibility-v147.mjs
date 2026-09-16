import fs from 'node:fs';
import {viewerVisibleV147} from './viewer-visibility-v147.mjs';
import {viewerFrameChanged} from './viewer-frame-budget.mjs';
for (const name of ['b2b','mr']) {
  const file=`client/${name}-viewer.entry.js`;
  let source=fs.readFileSync(file,'utf8');
  if(source.includes('function viewerVisibleV147('))continue;
  const anchor=name==='b2b'?'  animate() {\n    if (this.destroyed) return;':'  animate() { if (!this.destroyed) {';
  if(!source.includes(anchor))throw Error('v147 missing animation anchor '+name);
  source=source.replace(anchor, anchor+'\n    this.animationFrame = null;\n    if (!viewerVisibleV147(this)) return;');
  const dispose='    this.resizeObserver?.disconnect?.();';
  if(!source.includes(dispose))throw Error('v147 missing disposal anchor '+name);
  source=source.replace(dispose,'    this.visibilityV147?.dispose();\n'+dispose);
  const animate=source.indexOf('  animate() {'),end=source.indexOf('  destroy()',animate);
  let block=source.slice(animate,end);
  block=block.replace('this.dimensionLabels.forEach','if(viewerFrameChanged(this)){this.dimensionLabels.forEach');
  block=block.replace('this.renderer.render(this.scene, this.camera);','this.renderer.render(this.scene, this.camera);}');
  if(!block.includes('if(viewerFrameChanged(this))'))throw Error('Missing frame budget anchor '+name);
  source=source.slice(0,animate)+block+source.slice(end);
  for(const method of ['update','build','onResize','addDimensions','disposeDimensions','applyRackMaterials']){
    const re=new RegExp('(^  (?:async )?'+method+'\\([^\\n]*?\\) \\{)','m');
    source=source.replace(re,'$1 this.frameDirty=true;');
  }
  fs.writeFileSync(file,viewerFrameChanged.toString()+'\n'+viewerVisibleV147.toString()+'\n'+source);
}
console.log('v147: pause offscreen B2B/MR animation and resume on visibility.');
