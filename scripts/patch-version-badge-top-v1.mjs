import fs from 'node:fs';

const target = 'dist/server/index.js';
let source = fs.readFileSync(target, 'utf8');
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1\s*;/);
if (!match) throw new Error('Version badge: HTML_BASE64 bulunamadi.');

let html = Buffer.from(match[2], 'base64').toString('utf8');
const marker = 'data-rafex-version-badge-top="v1"';

html = html
  .replace(/<style\s+data-rafex-version-badge-top="v1">[\s\S]*?<\/style>\s*/g, '')
  .replace(/<script\s+data-rafex-version-badge-top="v1">[\s\S]*?<\/script>\s*/g, '');

const buildSha = String(process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || 'local').slice(0, 7);

const style = `
<style ${marker}>
  #rafexVersionBadge{
    box-sizing:border-box;
    white-space:nowrap;
    padding:6px 9px;
    border:1px solid #d7dfda;
    border-radius:8px;
    background:rgba(255,255,255,.96);
    box-shadow:0 3px 12px rgba(23,32,27,.10);
    color:#536058;
    font:800 10px/1.15 Arial,sans-serif;
    letter-spacing:.035em;
    pointer-events:none;
  }
  #rafexVersionBadge.rafex-version-login{
    position:fixed;
    right:18px;
    bottom:18px;
    top:auto;
    left:auto;
    z-index:99991;
  }
  .top-actions>#rafexVersionBadge.rafex-version-top{
    position:static;
    inset:auto;
    margin:0 8px 0 0;
    flex:0 0 auto;
    align-self:center;
    z-index:auto;
  }
  @media(max-width:760px){
    #rafexVersionBadge.rafex-version-login{right:10px;bottom:10px}
    .top-actions>#rafexVersionBadge.rafex-version-top{margin-right:4px}
  }
</style>`;

const script = `
<script ${marker}>
(function(){
  if(window.__rafexVersionBadgeTopV1)return;
  window.__rafexVersionBadgeTopV1=true;
  var BUILD_SHA=${JSON.stringify(buildSha)};

  function cleanText(el){
    return String(el && (el.innerText || el.textContent) || '').replace(/\\s+/g,' ').trim().toLocaleLowerCase('tr-TR');
  }
  function visible(el){
    if(!el) return false;
    if(el.classList && el.classList.contains('hidden')) return false;
    var s=getComputedStyle(el);
    return s.display!=='none' && s.visibility!=='hidden';
  }
  function authVisible(){
    return visible(document.querySelector('.auth'));
  }
  function findHistory(actions){
    if(!actions) return null;
    var direct=actions.querySelector('.history-top');
    if(direct) return direct;
    return Array.from(actions.children).find(function(el){
      var t=cleanText(el);
      return t.includes('proje geçmişi') || t.includes('proje gecmisi');
    }) || null;
  }
  function ensureBadge(){
    var badge=document.getElementById('rafexVersionBadge');
    if(!badge){
      badge=document.createElement('div');
      badge.id='rafexVersionBadge';
      badge.setAttribute('aria-label','Son sürüm bilgisi');
    }
    badge.textContent='SON SÜRÜM · '+BUILD_SHA;

    var actions=document.querySelector('.top-actions');
    if(!authVisible() && visible(actions)){
      badge.classList.remove('rafex-version-login');
      badge.classList.add('rafex-version-top');
      var history=findHistory(actions);
      if(history){
        if(history.previousElementSibling!==badge) actions.insertBefore(badge,history);
      }else if(badge.parentElement!==actions){
        actions.appendChild(badge);
      }
    }else{
      badge.classList.remove('rafex-version-top');
      badge.classList.add('rafex-version-login');
      if(badge.parentElement!==document.body) document.body.appendChild(badge);
    }
  }

  var queued=false;
  function schedule(){
    if(queued)return;
    queued=true;
    requestAnimationFrame(function(){queued=false;ensureBadge();});
  }
  new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style']});
  window.addEventListener('load',schedule);
  document.addEventListener('click',function(){setTimeout(schedule,0)},true);
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
console.log(`Version badge top v1 applied: ${buildSha}`);
