import fs from 'node:fs';

const file = 'dist/server/index.js';
let source = fs.readFileSync(file, 'utf8');
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error('HTML_BASE64 not found');

let html = Buffer.from(match[2], 'base64').toString('utf8');
html = html.replace(/<script data-rafex-product-toggle="v24">[\s\S]*?<\/script>/g, '');

const runtime = String.raw`<script data-rafex-product-toggle="v24">
(()=>{
  if(window.__rafexProductToggleV24)return;
  window.__rafexProductToggleV24=true;
  const KEY='rafex_free_product_disclosures_v1';
  const isFree=()=>{const p=document.getElementById('page');return !!p&&(p.dataset.rafexFreeDrawing==='1'||p.classList.contains('rafex-free-drawing-page'))};
  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch{return{}}};
  const write=(key,value)=>{const state=read();state[key]=value;try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}};
  const enforce=(details,value)=>{if(details?.isConnected)details.open=value};
  document.addEventListener('click',event=>{
    if(!isFree())return;
    const summary=event.target?.closest?.('#m2LayoutProductList details.rafex-system-product-disclosure > summary');
    if(!summary)return;
    const details=summary.parentElement,key=details?.dataset?.rafexProductSystem;
    if(!details||!key)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const next=!details.open;
    write(key,next);
    enforce(details,next);
    requestAnimationFrame(()=>enforce(document.querySelector('#m2LayoutProductList details[data-rafex-product-system="'+key+'"]'),next));
    setTimeout(()=>enforce(document.querySelector('#m2LayoutProductList details[data-rafex-product-system="'+key+'"]'),next),80);
  },true);
})();
</script>`;

html = html.replace('</body>', `${runtime}</body>`);
const encoded = Buffer.from(html).toString('base64');
source = source.slice(0, match.index) + match[0].replace(match[2], encoded) + source.slice(match.index + match[0].length);
fs.writeFileSync(file, source);
console.log('Final Serbest Cizim product disclosure toggle v24 applied');
