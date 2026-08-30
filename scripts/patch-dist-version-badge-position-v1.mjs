import fs from 'node:fs';

const target = 'dist/server/index.js';
let source = fs.readFileSync(target, 'utf8');
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1\s*;/);
if (!match) throw new Error('HTML_BASE64 bulunamadi.');

let html = Buffer.from(match[2], 'base64').toString('utf8');
const marker = 'data-rafex-version-badge-position="v5"';
const buildSha = String(process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || 'local').slice(0, 7);

html = html
  .replace(/<style\s+data-rafex-version-badge-position="v\d+">[\s\S]*?<\/style>\s*/g, '')
  .replace(/<script\s+data-rafex-version-badge-position="v\d+">[\s\S]*?<\/script>\s*/g, '');

const style = `
<style ${marker}>
  .top-actions{align-items:center!important;}
  #rafexVersionBadge{
    box-sizing:border-box!important;
    white-space:nowrap!important;
    padding:6px 9px!important;
    border:1px solid #d7dfda!important;
    border-radius:8px!important;
    background:rgba(255,255,255,.96)!important;
    box-shadow:0 3px 12px rgba(23,32,27,.10)!important;
    color:#536058!important;
    font:800 10px/1.15 Arial,sans-serif!important;
    letter-spacing:.035em!important;
    pointer-events:none!important;
    opacity:1!important;
    visibility:visible!important;
  }
  #rafexVersionBadge.rafex-version-badge-login{
    position:fixed!important;
    right:18px!important;
    bottom:18px!important;
    top:auto!important;
    left:auto!important;
    margin:0!important;
    transform:none!important;
    z-index:99991!important;
  }
  .top-actions>#rafexVersionBadge.rafex-version-badge-top{
    position:static!important;
    inset:auto!important;
    right:auto!important;
    bottom:auto!important;
    top:auto!important;
    left:auto!important;
    margin:0 8px 0 0!important;
    transform:none!important;
    display:inline-flex!important;
    align-items:center!important;
    flex:0 0 auto!important;
    align-self:center!important;
    z-index:auto!important;
  }
  @media(max-width:760px){
    #rafexVersionBadge.rafex-version-badge-login{right:10px!important;bottom:10px!important;}
    .top-actions>#rafexVersionBadge.rafex-version-badge-top{margin-right:4px!important;}
  }
</style>`;

const script = `
<script ${marker}>
(function(){
  if(window.__rafexVersionBadgePositionV5)return;
  window.__rafexVersionBadgePositionV5=true;
  var BUILD_SHA=${JSON.stringify(buildSha)};

  function cleanText(el){
    return String(el && (el.innerText || el.textContent) || '').replace(/\\s+/g,' ').trim().toLocaleLowerCase('tr-TR');
  }
  function isVisible(el){
    if(!el) return false;
    if(el.classList && el.classList.contains('hidden')) return false;
    var s=getComputedStyle(el);
    return s.display!=='none' && s.visibility!=='hidden';
  }
  function isAuthVisible(){
    return isVisible(document.querySelector('.auth'));
  }
  function findHistory(actions){
    if(!actions) return null;
    var direct=actions.querySelector('.history-top');
    if(direct) return direct;
    return Array.from(actions.children).find(function(el){
      var text=cleanText(el);
      return text.includes('proje geçmişi') || text.includes('proje gecmisi');
    }) || null;
  }
  function ensureSource(){
    var badge=document.getElementById('rafexVersionBadge');
    if(!badge){
      badge=document.createElement('div');
      badge.id='rafexVersionBadge';
      badge.setAttribute('aria-label','Son sürüm bilgisi');
      document.body.appendChild(badge);
    }
    badge.textContent='SON SÜRÜM · '+BUILD_SHA;
    return badge;
  }
  function placeBadge(){
    var badge=ensureSource();
    var actions=document.querySelector('.top-actions');
    var appMode=!isAuthVisible() && !!actions && isVisible(actions);
    if(!appMode){
      badge.classList.remove('rafex-version-badge-top');
      badge.classList.add('rafex-version-badge-login');
      if(badge.parentElement!==document.body) document.body.appendChild(badge);
      return;
    }
    badge.classList.remove('rafex-version-badge-login');
    badge.classList.add('rafex-version-badge-top');
    var history=findHistory(actions);
    if(history){
      if(badge.parentElement!==actions || badge.nextElementSibling!==history){
        actions.insertBefore(badge,history);
      }
    }else if(badge.parentElement!==actions){
      actions.appendChild(badge);
    }
  }
  var queued=false;
  function schedule(){
    if(queued)return;
    queued=true;
    requestAnimationFrame(function(){queued=false;placeBadge();});
  }
  new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class','style']});
  window.addEventListener('load',schedule);
  document.addEventListener('click',function(){setTimeout(schedule,0);},true);
  setInterval(placeBadge,1000);
  schedule();
  setTimeout(schedule,120);
  setTimeout(schedule,500);
})();
</script>`;

if (html.includes('</head>')) html = html.replace('</head>', style + '\n</head>');
else html = style + html;
if (html.includes('</body>')) html = html.replace('</body>', script + '\n</body>');
else html += script;

const encoded = Buffer.from(html, 'utf8').toString('base64');
source = source.replace(match[0], `const HTML_BASE64 =\n  "${encoded}";`);
fs.writeFileSync(target, source);

console.log(`Version badge position patch v5 applied: ${buildSha}`);
