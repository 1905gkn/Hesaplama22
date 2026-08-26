import fs from 'node:fs';

const file = 'dist/server/index.js';
let source = fs.readFileSync(file, 'utf8');
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error('HTML_BASE64 not found for Konsol bottom workspace v44');
let html = Buffer.from(match[2], 'base64').toString('utf8');
if (!html.includes('data-rafex-konsol-ortak-ui="v43"')) throw new Error('Konsol v44 için Ortak Çizim v43 bulunamadı.');
html = html
  .replace(/<style data-rafex-konsol-bottom-workspace="v44">[\s\S]*?<\/style>/g, '')
  .replace(/<script data-rafex-konsol-bottom-workspace="v44">[\s\S]*?<\/script>/g, '');

const runtime = String.raw`
<style data-rafex-konsol-bottom-workspace="v44">
#page .konsol-bottom-workspace{display:grid;grid-template-columns:minmax(0,1fr);gap:18px;width:100%;margin-top:18px}
#page .konsol-bottom-workspace>.konsol-free-card,#page .konsol-bottom-workspace>.konsol-pdf-card{grid-column:1!important;width:100%;margin:0!important;box-sizing:border-box}
#page .konsol-bottom-workspace>.konsol-free-card{order:1}
#page .konsol-bottom-workspace>.konsol-pdf-card{order:2}
</style>
<script data-rafex-konsol-bottom-workspace="v44">
(function(){
 if(window.__rafexKonsolBottomWorkspaceV44)return;window.__rafexKonsolBottomWorkspaceV44=true;
 var baseRender=window.renderKonsol;
 function arrange(){
  var page=document.getElementById('page'),shell=page&&page.querySelector('.konsol-shell'),free=page&&page.querySelector('.konsol-free-card'),pdf=page&&page.querySelector('.konsol-pdf-card');
  if(!page||!shell||!free||!pdf)return false;
  var bottom=document.getElementById('konsolBottomWorkspace');
  if(!bottom){bottom=document.createElement('div');bottom.id='konsolBottomWorkspace';bottom.className='konsol-bottom-workspace';bottom.setAttribute('aria-label','Konsol Kollu Serbest Çizim ve PDF alanı');shell.insertAdjacentElement('afterend',bottom)}
  if(free.parentElement!==bottom)bottom.appendChild(free);
  if(pdf.parentElement!==bottom)bottom.appendChild(pdf);
  page.dataset.konsolBottomWorkspace='v44';
  return true;
 }
 function settle(){[0,40,120,300].forEach(function(ms){setTimeout(arrange,ms)})}
 window.renderKonsol=function(){if(typeof baseRender==='function')baseRender.apply(this,arguments);settle()};
 document.addEventListener('click',function(event){if(event.target.closest('[data-page="konsol"]'))settle()});
 window.rafexArrangeKonsolBottomWorkspaceV44=arrange;
 settle();
})();
</script>`;

const close = html.lastIndexOf('</body>');
if (close < 0) throw new Error('body close missing for Konsol bottom workspace v44');
html = html.slice(0, close) + runtime + '\n' + html.slice(close);
for (const required of [
  'data-rafex-konsol-bottom-workspace="v44"',
  'konsolBottomWorkspace',
  'Konsol Kollu Serbest Çizim ve PDF alanı',
  'rafexArrangeKonsolBottomWorkspaceV44',
  'shell.insertAdjacentElement(\'afterend\',bottom)',
]) if (!html.includes(required)) throw new Error('Konsol bottom workspace v44 eksik: ' + required);

const encoded = Buffer.from(html).toString('base64');
source = source.slice(0, match.index) + match[0].replace(match[2], encoded) + source.slice(match.index + match[0].length);
fs.writeFileSync(file, source);
console.log('v44: Konsol Serbest Çizim ve PDF alanları ana ekranın altına sabit sırayla taşındı.');
