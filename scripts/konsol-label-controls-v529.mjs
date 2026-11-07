import fs from 'node:fs';
export function sourceTransform(s){
 if(s.includes('/* konsol-label-controls-v529 */'))return s;
 const replace=(a,b)=>{if(!s.includes(a))throw Error('v529 missing '+a);s=s.replace(a,b);};
 replace('      levels: clamp(Math.round(Number(next.levels) || 4), 1, 12),','      dimensionScale:clamp(Number(next.dimensionScale)||1,.5,2),\n      levels: clamp(Math.round(Number(next.levels) || 4), 1, 12),');
 replace('visualUprightHeight,width,uprightDepth));','visualUprightHeight,width,uprightDepth),o.dimensionScale);');
 replace('if(this.selectedLoadType)next={...next,loadType:this.selectedLoadType};','if(this.selectedLoadType)next={...next,loadType:this.selectedLoadType};if(this.selectedDimensionScale)next={...next,dimensionScale:this.selectedDimensionScale};');
 replace('  getSavedDetail() {',`  setDimensionScale(value){const v=savedMainViewer;if(!v||v.destroyed)return false;v.selectedDimensionScale=clamp(Number(value)||1,.5,2);v.update({...v.options,dimensionScale:v.selectedDimensionScale},false);return true;},
  getSavedDetail() {`);
 return '/* konsol-label-controls-v529 */\n'+s;
}
function runtime(){
 function install(){
  const box=document.querySelector('#page .konsol-load-switch');if(!box)return;
  const existing=document.getElementById('konsolLabelScale');if(existing){const saved=window.RafexKonsolViewer?.getSavedDetail();if(saved&&document.activeElement!==existing)existing.value=String(Math.round((saved.dimensionScale||1)*100));return;}
  const wrap=document.createElement('div');wrap.className='konsol-label-scale';wrap.innerHTML='<label for="konsolLabelScale">Ölçü yazısı</label><button type="button" aria-label="Ölçü yazısını küçült">−</button><input id="konsolLabelScale" aria-label="Konsol ölçü yazısı boyutu (%)" type="number" min="50" max="200" step="10" value="100"><span>%</span><button type="button" aria-label="Ölçü yazısını büyüt">+</button>';
  box.before(wrap);const input=wrap.querySelector('input');input.value=String(Math.round((window.RafexKonsolViewer?.getSavedDetail()?.dimensionScale||1)*100));
  const apply=()=>{let value=Math.max(50,Math.min(200,Number(input.value)||100));input.value=String(value);window.RafexKonsolViewer?.setDimensionScale(value/100);};
  input.addEventListener('input',()=>{const value=Number(input.value);if(input.value!==''&&value>=50&&value<=200)apply();});input.addEventListener('change',apply);
  const buttons=wrap.querySelectorAll('button');buttons.forEach((button,i)=>button.addEventListener('click',()=>{input.value=String(Number(input.value)+(i?10:-10));apply();}));
 }
 let queued=false;new MutationObserver(()=>{if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;install();});}}).observe(document.getElementById('page'),{childList:true,subtree:true});install();
}
export function transform(html){
 if(html.includes('data-konsol-label-controls="v529"'))return html;
 const css='.konsol-label-scale{display:flex;align-items:center;gap:5px;margin-left:auto;padding:5px 8px;border:1px solid #c9d9d0;border-radius:9px;background:#f4f8f5;white-space:nowrap}.konsol-label-scale label{font:700 11px Arial}.konsol-label-scale input{width:64px!important;min-height:30px!important;padding:4px!important;text-align:center!important}.konsol-label-scale button{min-width:30px!important;min-height:30px!important;padding:4px!important}#page .konsol-view-wrap>div:first-child{flex-wrap:wrap;gap:8px}#page .konsol-label-scale+.konsol-load-switch{margin-left:0}';
 const end=html.lastIndexOf('</body>');return html.slice(0,end)+'<style data-konsol-label-controls="v529">'+css+'</style><script>('+runtime.toString()+')();</script>'+html.slice(end);
}
if(process.argv[2]==='source'){const p='client/konsol-viewer.entry.js';fs.writeFileSync(p,sourceTransform(fs.readFileSync(p,'utf8')));}
else if(process.argv[1]?.endsWith('konsol-label-controls-v529.mjs'))for(const p of ['dist/index.html','dist/server/index.js']){
 let s=fs.readFileSync(p,'utf8');if(p.endsWith('.html'))s=transform(s);else{const m=s.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);s=s.replace(m[0],m[0].replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64')));}fs.writeFileSync(p,s);
}
