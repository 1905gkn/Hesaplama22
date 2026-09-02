import fs from 'node:fs';

const file = 'dist/server/index.js';
let source = fs.readFileSync(file, 'utf8');
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error('HTML_BASE64 not found for Konsol common save v74');
let html = Buffer.from(match[2], 'base64').toString('utf8');

html = html
  .replace(/<style data-rafex-konsol-common-save="v74">[\s\S]*?<\/style>/g, '')
  .replace(/<script data-rafex-konsol-common-save="v74">[\s\S]*?<\/script>/g, '');

const runtime = String.raw`
<style data-rafex-konsol-common-save="v74">
#page .rafex-konsol-common-savebar{display:flex;align-items:center;justify-content:flex-end;gap:12px;margin:12px 0 16px;padding:10px 12px;border:1px solid #d9e4dc;border-radius:12px;background:#f7faf8}
#page .rafex-konsol-common-savebar small{margin-right:auto;color:#617067;font-size:10px;font-weight:800}
#page #rafexKonsolCommonSaveRack{min-width:150px;min-height:46px;padding:0 28px;border:0;border-radius:9px;background:#173c2d;color:#fff;font-size:13px;font-weight:900;cursor:pointer}
#page #rafexKonsolCommonSaveRack:disabled{opacity:.55;cursor:wait}
@media(max-width:720px){#page .rafex-konsol-common-savebar{align-items:stretch;flex-direction:column}#page #rafexKonsolCommonSaveRack{width:100%}}
</style>
<script data-rafex-konsol-common-save="v74">
(function(){
 if(window.__rafexKonsolCommonSaveV74)return;window.__rafexKonsolCommonSaveV74=true;
 var timer=0;
 function isCommonKonsol(){var page=document.getElementById('page');return !!(page&&page.classList.contains('rafex-free-drawing-page')&&page.classList.contains('konsol-common-mode')&&page.dataset.rafexFreeContextSystem==='konsol')}
 function enhance(){
   if(!isCommonKonsol())return;
   var page=document.getElementById('page'),shell=page&&page.querySelector('.konsol-shell');if(!shell||document.getElementById('rafexKonsolCommonSaveRack'))return;
   var bar=document.createElement('div');bar.className='rafex-konsol-common-savebar';bar.innerHTML='<small id="rafexKonsolCommonSaveStatus">Mevcut Konsol ölçülerini ortak kayıtlı raf tiplerine ekler.</small><button type="button" id="rafexKonsolCommonSaveRack">Rafı Kaydet</button>';
   shell.insertAdjacentElement('afterend',bar);
   bar.querySelector('button').addEventListener('click',async function(){
     var button=this,status=document.getElementById('rafexKonsolCommonSaveStatus'),sync=document.getElementById('konsolSpacing')||document.getElementById('konsolLevels');
     if(sync)sync.dispatchEvent(new Event('change',{bubbles:true}));
     await new Promise(function(resolve){setTimeout(resolve,30)});
     if(typeof window.m2SaveRackType!=='function'){if(status)status.textContent='Ortak kayıt motoru hazırlanamadı.';return}
     button.disabled=true;if(status)status.textContent='Konsol raf tipi kaydediliyor…';
     try{
       await window.m2SaveRackType();
       var floor=document.getElementById('m2FloorStatus');if(status)status.textContent=floor&&floor.textContent||'Konsol raf tipi kaydedildi.';
     }catch(error){if(status)status.textContent=error&&error.message||'Konsol raf tipi kaydedilemedi.'}
     finally{button.disabled=false}
   });
 }
 function schedule(){clearTimeout(timer);timer=setTimeout(enhance,40)}
 document.addEventListener('change',function(event){if(event.target&&event.target.name==='rafexUnifiedSystem')schedule()});
 document.addEventListener('click',function(event){if(event.target&&event.target.closest&&event.target.closest('[data-page="free"],#rafexUnifiedSystemPicker'))schedule()});
 new MutationObserver(schedule).observe(document.getElementById('page')||document.body,{childList:true,subtree:true});
 [80,240,700,1400].forEach(function(delay){setTimeout(enhance,delay)});
})();
</script>`;

const close = html.lastIndexOf('</body>');
if (close < 0) throw new Error('body close missing for Konsol common save v74');
html = html.slice(0, close) + runtime + '\n' + html.slice(close);

for (const required of [
  'data-rafex-konsol-common-save="v74"',
  'id="rafexKonsolCommonSaveRack"',
  'Rafı Kaydet',
  'window.m2SaveRackType',
  "page.dataset.rafexFreeContextSystem==='konsol'",
]) if (!html.includes(required)) throw new Error('Konsol common save v74 eksik: ' + required);

const encoded = Buffer.from(html).toString('base64');
source = source.slice(0, match.index) + match[0].replace(match[2], encoded) + source.slice(match.index + match[0].length);
fs.writeFileSync(file, source);
console.log('Konsol v74: Ortak Çizim Rafı Kaydet düğmesi ortak katalog akışına bağlandı.');

