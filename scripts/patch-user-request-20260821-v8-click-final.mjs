import fs from "node:fs";
import path from "node:path";

const workerPath=path.join(process.cwd(),"dist/server/index.js");
let worker=fs.readFileSync(workerPath,"utf8");
const match=worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if(!match)throw new Error('v8-click HTML_BASE64 bulunamadi');
let html=Buffer.from(match[3],'base64').toString('utf8');
html=html.replace(/<script\s+data-rafex-v8-accessory-click="1">[\s\S]*?<\/script>\s*/g,'');
const runtime=String.raw`<script data-rafex-v8-accessory-click="1">(function(){
  if(window.__rafexV8AccessoryClick)return;window.__rafexV8AccessoryClick=true;
  document.addEventListener('click',function(event){
    const button=event.target instanceof Element?event.target.closest('#m2CustomizeAccessories .m2-customize-accessory-levels button'):null;
    if(!button)return;
    const card=button.closest('[data-accessory-type]'),type=card?.dataset?.accessoryType;if(!type)return;
    const raw=button.dataset.level;
    const text=String(button.textContent||'').toLocaleUpperCase('tr-TR');
    const level=raw!==undefined?Number(raw):(text.includes('ZEM')?0:Number(text.replace(/\D/g,'')));
    if(!Number.isFinite(level)||level<0||typeof window.m2ToggleCustomizeRackAccessoryLevel!=='function')return;
    event.preventDefault();event.stopImmediatePropagation();
    window.m2ToggleCustomizeRackAccessoryLevel(type,level);
    setTimeout(function(){try{window.rafexRefreshProductListsV8?.();}catch{}},0);
  },true);
})();</script>`;
const end=html.lastIndexOf('</body>');if(end<0)throw new Error('v8-click body yok');
html=html.slice(0,end)+runtime+html.slice(end);
const encoded=Buffer.from(html,'utf8').toString('base64');
worker=worker.slice(0,match.index)+match[1]+match[2]+encoded+match[2]+worker.slice(match.index+match[0].length);
fs.writeFileSync(workerPath,worker);
console.log('FINAL v8-click: Ozellestir aksesuar ZEMIN/K kat tiklamalari capture fazinda garanti edildi.');
