import fs from 'node:fs';

const file='dist/server/index.js';
let source=fs.readFileSync(file,'utf8');
const match=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if(!match) throw new Error('HTML_BASE64 not found');
let html=Buffer.from(match[2],'base64').toString('utf8');
html=html.replace(/<script data-rafex-cantilever-final-level-gap="v1">[\s\S]*?<\/script>/g,'');

const runtime=String.raw`
<script data-rafex-cantilever-final-level-gap="v1">
(()=>{
  if(window.__rafexCantileverFinalLevelGapV1)return;
  window.__rafexCantileverFinalLevelGapV1=true;
  const STORAGE='rafex-cantilever-v1';
  const readStore=()=>{try{return JSON.parse(localStorage.getItem(STORAGE)||'{}')||{}}catch{return{}}};
  const savedGap=()=>Math.max(100,Number(readStore().levelGap)||1000);
  const saveGap=(gap)=>{try{const s=readStore();s.levelGap=gap;localStorage.setItem(STORAGE,JSON.stringify(s))}catch{}};
  const calcAuto=(page)=>{
    const mode=page.querySelector('#kHeightMode');
    if(mode&&mode.value==='manual')return;
    const levels=Math.max(1,Number(page.querySelector('#kLevels')?.value)||1);
    const gap=Math.max(100,Number(page.querySelector('#kLevelGap')?.value)||savedGap());
    const height=Math.max(1500,Math.round(((levels+1)*gap)/100)*100);
    const el=page.querySelector('#kHeight');
    if(el&&Number(el.value)!==height){
      el.value=String(height);
      el.dispatchEvent(new Event('input',{bubbles:true}));
      el.dispatchEvent(new Event('change',{bubbles:true}));
    }
  };
  const bind=(el,key,handler)=>{if(!el||el.dataset[key])return;el.dataset[key]='1';el.addEventListener('input',handler);el.addEventListener('change',handler)};
  const mount=()=>{
    const page=document.getElementById('page');
    if(!page||!page.querySelector('#kLevels')||!page.querySelector('#kHeight')||!page.querySelector('#kArmLength'))return;
    if(!page.classList.contains('rafex-cantilever-v1'))return;
    let gap=page.querySelector('#kLevelGap');
    if(!gap){
      const levels=page.querySelector('#kLevels');
      const parent=levels.closest('.k-field')||levels.parentElement;
      if(!parent)return;
      const label=document.createElement('label');
      label.className='k-field';
      label.dataset.rafexCantileverLevelGap='v1';
      label.innerHTML='Kat arası mesafe (mm)<input id="kLevelGap" type="number" min="100" max="3000" step="50" value="'+savedGap()+'">';
      parent.after(label);
      gap=label.querySelector('#kLevelGap');
    }
    if(gap&&!gap.value)gap.value=String(savedGap());
    bind(gap,'finalGapBound',()=>{const v=Math.max(100,Number(gap.value)||1000);gap.value=String(v);saveGap(v);calcAuto(page)});
    bind(page.querySelector('#kLevels'),'finalGapBound',()=>calcAuto(page));
    bind(page.querySelector('#kHeightMode'),'finalGapBound',()=>calcAuto(page));
    calcAuto(page);
  };
  const observer=new MutationObserver(()=>mount());
  observer.observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('click',(e)=>{if(e.target.closest('[data-page="konsol"]')){setTimeout(mount,20);setTimeout(mount,120);setTimeout(mount,350)}});
  setTimeout(mount,50);setTimeout(mount,300);
})();
</script>`;
html=html.replace(/<\/body>\s*<\/html>\s*$/i,runtime+'\n</body>\n</html>');
const encoded=Buffer.from(html).toString('base64');
source=source.replace(match[0],`const HTML_BASE64 = "${encoded}"`);
fs.writeFileSync(file,source);
console.log('FINAL Konsol: Kat arasi mesafe runtime en sonda aktif.');
