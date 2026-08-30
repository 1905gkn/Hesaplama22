import fs from 'node:fs';

const target = 'dist/server/index.js';
let source = fs.readFileSync(target, 'utf8');
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1\s*;/);
if (!match) throw new Error('HTML_BASE64 bulunamadi.');

let html = Buffer.from(match[2], 'base64').toString('utf8');
const marker = 'data-rafex-version-badge-position="v7"';
const buildSha = String(process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || 'local').slice(0, 7);

html = html
  .replace(/<style\s+data-rafex-version-badge-position="v\d+">[\s\S]*?<\/style>\s*/g, '')
  .replace(/<script\s+data-rafex-version-badge-position="v\d+">[\s\S]*?<\/script>\s*/g, '');

const style = `
<style ${marker}>
  /* Legacy badge remains available to its old runtime but is never shown. */
  #rafexVersionBadge{display:none!important;}
  .top-actions{align-items:center!important;}
  #rafexBuildVersionBadge{
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
  #rafexBuildVersionBadge.rafex-build-version-login{
    display:inline-flex!important;
    align-items:center!important;
    position:fixed!important;
    right:18px!important;
    bottom:18px!important;
    top:auto!important;
    left:auto!important;
    margin:0!important;
    transform:none!important;
    z-index:99991!important;
  }
  .top-actions>#rafexBuildVersionBadge.rafex-build-version-top{
    display:inline-flex!important;
    align-items:center!important;
    position:static!important;
    inset:auto!important;
    right:auto!important;
    bottom:auto!important;
    top:auto!important;
    left:auto!important;
    margin:0 8px 0 0!important;
    transform:none!important;
    flex:0 0 auto!important;
    align-self:center!important;
    z-index:auto!important;
  }
  @media(max-width:760px){
    #rafexBuildVersionBadge.rafex-build-version-login{right:10px!important;bottom:10px!important;}
    .top-actions>#rafexBuildVersionBadge.rafex-build-version-top{margin-right:4px!important;}
  }
</style>`;

const script = `
<script ${marker}>
(function(){
  if(window.__rafexBuildVersionBadgeV7)return;
  window.__rafexBuildVersionBadgeV7=true;
  var BUILD_SHA=${JSON.stringify(buildSha)};
  var EXPECTED_TEXT='SON SÜRÜM · '+BUILD_SHA;

  function cleanText(el){
    return String(el && (el.innerText || el.textContent) || '').replace(/\\s+/g,' ').trim().toLocaleLowerCase('tr-TR');
  }
  function isVisible(el){
    if(!el) return false;
    if(el.classList && el.classList.contains('hidden')) return false;
    var s=getComputedStyle(el);
    return s.display!=='none' && s.visibility!=='hidden' && s.opacity!=='0';
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
  function ensureBadge(){
    var badge=document.getElementById('rafexBuildVersionBadge');
    if(!badge){
      badge=document.createElement('div');
      badge.id='rafexBuildVersionBadge';
      badge.setAttribute('aria-label','Canlı sürüm bilgisi');
      badge.textContent=EXPECTED_TEXT;
    } else if(badge.textContent!==EXPECTED_TEXT){
      badge.textContent=EXPECTED_TEXT;
    }
    return badge;
  }
  function placeBadge(){
    if(!document.body)return;
    var badge=ensureBadge();
    var actions=document.querySelector('.top-actions');
    var appMode=!!actions && isVisible(actions);

    if(appMode){
      if(badge.className!=='rafex-build-version-top') badge.className='rafex-build-version-top';
      var history=findHistory(actions);
      if(history){
        if(badge.parentElement!==actions || badge.nextElementSibling!==history){
          actions.insertBefore(badge,history);
        }
      }else if(badge.parentElement!==actions){
        actions.appendChild(badge);
      }
      return;
    }

    if(badge.className!=='rafex-build-version-login') badge.className='rafex-build-version-login';
    if(badge.parentElement!==document.body) document.body.appendChild(badge);
  }

  var queued=false;
  function schedule(){
    if(queued)return;
    queued=true;
    requestAnimationFrame(function(){queued=false;placeBadge();});
  }
  function delayed(){setTimeout(schedule,0);}

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',schedule,{once:true});
  else schedule();
  window.addEventListener('load',schedule,{once:true});
  document.addEventListener('click',delayed,true);
  new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style']});
  setTimeout(schedule,100);
  setTimeout(schedule,400);
  setTimeout(schedule,1200);
  setInterval(placeBadge,2500);
})();
</script>`;

if (html.includes('</head>')) html = html.replace('</head>', style + '\n</head>');
else html = style + html;
if (html.includes('</body>')) html = html.replace('</body>', script + '\n</body>');
else html += script;

const encoded = Buffer.from(html, 'utf8').toString('base64');
source = source.replace(match[0], `const HTML_BASE64 =\n  "${encoded}";`);
fs.writeFileSync(target, source);

console.log(`Version badge position patch v7 applied: ${buildSha}`);
