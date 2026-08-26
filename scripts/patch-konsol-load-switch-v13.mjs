import fs from 'node:fs';

const file = 'dist/server/index.js';
let source = fs.readFileSync(file, 'utf8');
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error('HTML_BASE64 not found for Konsol load switch v13');
let html = Buffer.from(match[2], 'base64').toString('utf8');
html = html
  .replace(/<style data-rafex-konsol-load-switch="v13">[\s\S]*?<\/style>/g, '')
  .replace(/<script data-rafex-konsol-load-switch="v13">[\s\S]*?<\/script>/g, '');

const runtime = [
  '<style data-rafex-konsol-load-switch="v13">',
  '#page .konsol-view-wrap>div:first-child{display:flex;align-items:flex-start;gap:10px;flex-wrap:wrap}',
  '#page .konsol-load-switch{margin-left:auto;display:flex;gap:4px;padding:4px;border:1px solid #c9d9d0;border-radius:10px;background:#f4f8f5;box-shadow:0 4px 14px rgba(21,63,43,.08)}',
  '#page .konsol-load-switch button{border:1px solid transparent;border-radius:7px;background:transparent;color:#496055;padding:7px 10px;font-size:8px;font-weight:900;letter-spacing:.02em;cursor:pointer}',
  '#page .konsol-load-switch button.active{border-color:#295f47;background:#315846;color:#fff;box-shadow:0 2px 7px rgba(21,63,43,.18)}',
  '#page .konsol-load-switch-label{width:100%;padding:0 4px 2px;color:#708079;font-size:7px;font-weight:900;letter-spacing:.08em}',
  '@media(max-width:720px){#page .konsol-load-switch{margin-left:0;width:100%;justify-content:stretch}#page .konsol-load-switch button{flex:1}}',
  '</style>',
  '<script data-rafex-konsol-load-switch="v13">',
  '(function(){',
  ' if(window.__rafexKonsolLoadSwitchV13)return;window.__rafexKonsolLoadSwitchV13=true;',
  " var allowed=['profile','pallet','unpacked'],saved='';",
  " try{saved=localStorage.getItem('rafexKonsolLoadType')||''}catch(_){ }",
  " window.__rafexKonsolLoadType=allowed.indexOf(saved)>=0?saved:'profile';",
  ' var baseRender=window.renderKonsol;',
  ' function fireGeometry(){',
  "   var node=document.getElementById('konsolArmLength')||document.getElementById('konsolSpacing')||document.getElementById('konsolLevelGap');",
  "   if(!node)return;node.dispatchEvent(new Event('input',{bubbles:true}));node.dispatchEvent(new Event('change',{bubbles:true}));",
  ' }',
  ' function sync(box){',
  "   Array.from(box.querySelectorAll('button[data-konsol-load]')).forEach(function(button){button.classList.toggle('active',button.dataset.konsolLoad===window.__rafexKonsolLoadType)});",
  ' }',
  ' function enhance(){',
  "   var head=document.querySelector('#page .konsol-view-wrap>div:first-child');if(!head||head.querySelector('.konsol-load-switch'))return;",
  "   var box=document.createElement('div');box.className='konsol-load-switch';box.setAttribute('role','group');box.setAttribute('aria-label','3D ürün görünümü');",
  "   box.innerHTML='<span class=\"konsol-load-switch-label\">KOLLARIN ÜZERİNDEKİ ÜRÜN</span><button type=\"button\" data-konsol-load=\"profile\">KUTU PROFİL</button><button type=\"button\" data-konsol-load=\"pallet\">PALET</button><button type=\"button\" data-konsol-load=\"unpacked\">PALETSİZ</button>';",
  '   box.addEventListener("click",function(event){',
  "     var button=event.target.closest('button[data-konsol-load]');if(!button)return;",
  '     window.__rafexKonsolLoadType=button.dataset.konsolLoad;',
  "     try{localStorage.setItem('rafexKonsolLoadType',window.__rafexKonsolLoadType)}catch(_){ }",
  '     sync(box);fireGeometry();',
  '   });',
  '   head.appendChild(box);sync(box);',
  ' }',
  " window.renderKonsol=function(){if(typeof baseRender==='function')baseRender();setTimeout(enhance,60)};",
  " document.addEventListener('click',function(event){if(event.target.closest('[data-page=\"konsol\"]'))setTimeout(enhance,160)});",
  ' setTimeout(enhance,400);',
  '})();',
  '</script>',
].join('\n');

const close = html.lastIndexOf('</body>');
if (close < 0) throw new Error('body close missing for Konsol load switch v13');
html = html.slice(0, close) + runtime + '\n' + html.slice(close);
for (const required of [
  'data-rafex-konsol-load-switch="v13"',
  'data-konsol-load="profile"',
  'data-konsol-load="pallet"',
  'data-konsol-load="unpacked"',
  'window.__rafexKonsolLoadType',
]) {
  if (!html.includes(required)) throw new Error('Konsol load switch v13 eksik: ' + required);
}
const encoded = Buffer.from(html).toString('base64');
source = source.slice(0, match.index) + match[0].replace(match[2], encoded) + source.slice(match.index + match[0].length);
fs.writeFileSync(file, source);
console.log('Konsol v13: sağ üst ürün seçimi Kutu Profil / Palet / Paletsiz olarak eklendi.');
