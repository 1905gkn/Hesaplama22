import fs from "node:fs";

const file='dist/server/index.js';
let source=fs.readFileSync(file,'utf8');
const match=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if(!match)throw new Error('Common identity v89: HTML_BASE64 not found');
let html=Buffer.from(match[2],'base64').toString('utf8');

const oldV87=`const pageIsCommon=()=>{const p=document.getElementById('page');return !!(p&&(p.dataset.rafexFreeDrawing==='1'||p.classList.contains('rafex-free-drawing-page')));};`;
const newV87=`const pageIsCommon=()=>{try{return window.rafexUnifiedFreeDrawingActiveV75?.()===true&&!!document.getElementById('rafexUnifiedSystemPicker');}catch{return false}};`;
if(html.includes(oldV87))html=html.replace(oldV87,newV87);
else if(!html.includes(newV87))throw new Error('Common identity v89: v87 pageIsCommon anchor missing');

const oldV88=`const page=document.getElementById('page'),alreadyCommon=!!(page&&(page.dataset.rafexFreeDrawing==='1'||page.classList.contains('rafex-free-drawing-page')));`;
const newV88=`const alreadyCommon=window.rafexUnifiedFreeDrawingActiveV75?.()===true&&!!document.getElementById('rafexUnifiedSystemPicker');`;
if(html.includes(oldV88))html=html.replace(oldV88,newV88);
else if(!html.includes(newV88))throw new Error('Common identity v89: v88 alreadyCommon anchor missing');

html=html.replace(/<script data-rafex-common-mode-identity="v89">[\s\S]*?<\/script>/g,'');
const runtime=String.raw`<script data-rafex-common-mode-identity="v89">(()=>{
  if(window.__rafexCommonModeIdentityV89)return;window.__rafexCommonModeIdentityV89=true;
  const unified=()=>{try{return window.rafexUnifiedFreeDrawingActiveV75?.()===true&&!!document.getElementById('rafexUnifiedSystemPicker')}catch{return false}};
  const mark=()=>{const node=document.querySelector('[data-rafex-common-runtime="v88"]');if(node)node.textContent='RAFEX COMMON RUNTIME V89 · '+(unified()?'ORTAK':'STANDALONE');};
  mark();setTimeout(mark,600);setTimeout(mark,1800);setTimeout(mark,3200);
  window.rafexRealCommonDrawingActiveV89=unified;
})();</script>`;
html=html.replace('</body>',runtime+'\n</body>');

for(const token of [newV87,newV88,'data-rafex-common-mode-identity="v89"'])if(!html.includes(token))throw new Error('Common identity v89 verification missing: '+token.slice(0,80));
const encoded=Buffer.from(html,'utf8').toString('base64');
source=source.slice(0,match.index)+match[0].replace(match[2],encoded)+source.slice(match.index+match[0].length);
fs.writeFileSync(file,source);
console.log('v89: Ortak Cizim kimligi standalone MR/B2B serbest yerlesiminden kesin olarak ayrildi.');
