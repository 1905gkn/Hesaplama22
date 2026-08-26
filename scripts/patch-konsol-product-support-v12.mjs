import fs from 'node:fs';

const file = 'dist/server/index.js';
let source = fs.readFileSync(file, 'utf8');
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error('HTML_BASE64 not found for Konsol product support v12');
let html = Buffer.from(match[2], 'base64').toString('utf8');
if (!html.includes('data-rafex-konsol-input-redesign="v11"')) throw new Error('Konsol v12 için v11 ekranı bulunamadı.');
html = html
  .replace(/<style data-rafex-konsol-product-support="v12">[\s\S]*?<\/style>/g, '')
  .replace(/<script data-rafex-konsol-product-support="v12">[\s\S]*?<\/script>/g, '');

const runtime = String.raw`
<style data-rafex-konsol-product-support="v12">
#page .konsol-field:has(#konsolLiftClearance) input,#page .konsol-field:has(#konsolSpacing){background:#eef7f1!important;border-color:#8db69f!important}
#page .konsol-field:has(#konsolSpacing){pointer-events:none}
#page .fem10209-field:has(#femSupportArms){display:none!important}
#page .konsol-support-summary{grid-column:1/-1;border:1px solid #d7e3dc;border-left:5px solid #2f7651;border-radius:10px;background:#fff;padding:10px 11px;color:#53675d;font-size:9px;line-height:1.45}
#page .konsol-support-summary b{display:block;color:#153f2b;font-size:12px;margin-bottom:3px}
#page .konsol-support-summary.warn{border-color:#d9a55a;border-left-color:#c57a12;background:#fff9ed}
#page .konsol-auto-count{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 9px;border:1px solid #d8e3dc;border-radius:9px;background:#f8fbf9;color:#53675d;font-size:9px}
#page .konsol-auto-count button{padding:7px 9px;border-radius:7px;background:#315846;color:#fff;font-size:9px;font-weight:900}
</style>
<script data-rafex-konsol-product-support="v12">
(function(){
 if(window.__rafexKonsolProductSupportV12)return;window.__rafexKonsolProductSupportV12=true;
 var baseRender=window.renderKonsol,manualCount=false,writing=false;
 function e(id){return document.getElementById(id)}
 function n(id,f){var v=Number(e(id)&&e(id).value);return Number.isFinite(v)?v:f}
 function fmt(v){return Math.round(Number(v)||0).toLocaleString('tr-TR')}
 function fire(node){if(!node)return;node.dispatchEvent(new Event('input',{bubbles:true}));node.dispatchEvent(new Event('change',{bubbles:true}))}
 function labelText(node,text){var label=node&&node.closest('label');if(label&&label.firstChild&&label.firstChild.nodeType===3)label.firstChild.nodeValue=text}
 function ensureSpacing(value){
   var node=e('konsolSpacing');if(!node)return;
   var rounded=Math.round(value),option=Array.from(node.options||[]).find(function(o){return Number(o.value)===rounded});
   if(!option){option=document.createElement('option');option.value=String(rounded);option.textContent=fmt(rounded);node.appendChild(option)}
   node.value=String(rounded);fire(node);
 }
 function calculate(forceAuto){
   if(writing)return;writing=true;
   if(forceAuto)manualCount=false;
   var length=Math.max(500,n('femProductLength',3000));
   var count=manualCount?Math.max(2,Math.min(30,Math.round(n('konsolUprightCount',2)))):Math.max(2,Math.min(30,Math.ceil(length/2000)));
   var spacing=length/count,overhang=spacing/2;
   var countNode=e('konsolUprightCount');if(countNode&&Number(countNode.value)!==count){countNode.value=String(count);fire(countNode)}
   ensureSpacing(spacing);
   var arms=e('femSupportArms');if(arms&&Number(arms.value)!==count){arms.value=String(count);fire(arms)}
   var summary=e('konsolSupportSummary'),tooWide=spacing>2000.5;
   var lift=Math.max(0,n('konsolLiftClearance',100)),productHeight=Math.max(50,n('konsolLevelGap',1000)-lift),loadType=window.__rafexKonsolLoadType||'profile',loadLabel=loadType==='pallet'?'paletli yük':(loadType==='unpacked'?'paletsiz yük':'kutu profil bağı');
   if(summary){summary.className='konsol-support-summary'+(tooWide?' warn':'');summary.innerHTML='<b>'+count+' ayak · '+fmt(spacing)+' mm merkez aralığı</b>'+fmt(length)+' mm ürün · sağ/sol '+fmt(overhang)+' mm taşma (ayak aralığının yarısı) · '+loadLabel+' '+fmt(productHeight)+' mm yüksekliğinde ve '+fmt(n('konsolArmLength',1000))+' mm derinliğinde · kaldırma boşluğu '+fmt(lift)+' mm'+(tooWide?' · UYARI: 2.000 mm maksimum aralık aşıldı':' · maksimum aralık uygun')}
   var mode=e('konsolAutoCountMode');if(mode)mode.textContent=manualCount?'Ayak adedi manuel':'Ayak adedi otomatik';
   var lift=e('konsolLiftClearance');if(lift)fire(lift);
   writing=false;
 }
 function enhance(){
   var grid=document.querySelector('#page .konsol-grid'),spacing=e('konsolSpacing'),count=e('konsolUprightCount'),product=e('femProductLength');if(!grid||!spacing||!count||!product||e('konsolLiftClearance'))return;
   labelText(spacing,'Ayak merkez aralığı (otomatik mm)');
   var liftLabel=document.createElement('label');liftLabel.className='konsol-field';liftLabel.innerHTML='Ürünün kaldırma mesafesi (mm)<input id="konsolLiftClearance" type="number" min="0" max="1000" step="10" value="100">';
   spacing.closest('label').insertAdjacentElement('afterend',liftLabel);
   var info=document.createElement('div');info.className='konsol-auto-count';info.innerHTML='<span id="konsolAutoCountMode">Ayak adedi otomatik</span><button id="konsolAutoCountReset" type="button">Otomatik hesapla</button>';
   liftLabel.insertAdjacentElement('afterend',info);
   var summary=document.createElement('div');summary.id='konsolSupportSummary';summary.className='konsol-support-summary';info.insertAdjacentElement('afterend',summary);
   e('konsolAutoCountReset').addEventListener('click',function(){calculate(true)});
   count.addEventListener('input',function(){if(writing)return;manualCount=true;calculate(false)});
   count.addEventListener('change',function(){if(writing)return;manualCount=true;calculate(false)});
   product.addEventListener('input',function(){calculate(!manualCount)});
   product.addEventListener('change',function(){calculate(!manualCount)});
   var arm=e('konsolArmLength');if(arm){arm.addEventListener('input',function(){calculate(false)});arm.addEventListener('change',function(){calculate(false)})}
   var gap=e('konsolLevelGap');if(gap){gap.addEventListener('input',function(){calculate(false)});gap.addEventListener('change',function(){calculate(false)})}
   e('konsolLiftClearance').addEventListener('input',function(){fire(spacing)});
   e('konsolLiftClearance').addEventListener('change',function(){fire(spacing)});
   calculate(true);
 }
 window.renderKonsol=function(){if(typeof baseRender==='function')baseRender();setTimeout(enhance,40)};
 document.addEventListener('click',function(ev){if(ev.target.closest('[data-page="konsol"]'))setTimeout(enhance,150)});
 setTimeout(enhance,350);
})();
</script>`;

const close = html.lastIndexOf('</body>');
if (close < 0) throw new Error('body close missing for Konsol product support v12');
html = html.slice(0, close) + runtime + '\n' + html.slice(close);
for (const required of [
  'data-rafex-konsol-product-support="v12"',
  'Ürünün kaldırma mesafesi (mm)',
  'Ayak adedi otomatik',
  'ayak aralığının yarısı',
  'Math.ceil(length/2000)',
]) if (!html.includes(required)) throw new Error('Konsol product support v12 eksik: ' + required);
const encoded = Buffer.from(html).toString('base64');
source = source.slice(0, match.index) + match[0].replace(match[2], encoded) + source.slice(match.index + match[0].length);
fs.writeFileSync(file, source);
console.log('Konsol v12: yarım ayak aralığı taşması, 2.000 mm sınırı, manuel ayak adedi ve 100 mm kaldırma alanı aktif.');
