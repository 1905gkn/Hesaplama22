import fs from 'node:fs';

const target = 'dist/server/index.js';
let source = fs.readFileSync(target, 'utf8');
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1\s*;/);
if (!match) throw new Error('HTML_BASE64 bulunamadi.');

let html = Buffer.from(match[2], 'base64').toString('utf8');
const marker = 'data-rafex-version-badge-position="v17"';
const buildSha = String(process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || 'local').slice(0, 7);

function istanbulStamp(date = new Date()) {
  const parts = new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const val = (type) => parts.find((p) => p.type === type)?.value || '';
  return `${val('day')}.${val('month')}.${val('year')} ${val('hour')}:${val('minute')}:${val('second')}`;
}
const buildTime = istanbulStamp();

// Eski tum badge enjeksiyonlarini ve bilinen kart elemanlarini build cikisindan fiziksel olarak temizle.
html = html
  .replace(/<style\s+data-rafex-version-badge-position="v\d+">[\s\S]*?<\/style>\s*/g, '')
  .replace(/<script\s+data-rafex-version-badge-position="v\d+">[\s\S]*?<\/script>\s*/g, '')
  .replace(/<style\s+data-rafex-version-badge-top="v\d+">[\s\S]*?<\/style>\s*/g, '')
  .replace(/<script\s+data-rafex-version-badge-top="v\d+">[\s\S]*?<\/script>\s*/g, '')
  .replace(/<(?:div|span)\s+id="rafexVersionBadge"[^>]*>[\s\S]*?<\/(?:div|span)>\s*/g, '')
  .replace(/<(?:div|span)\s+id="rafexBuildVersionBadge"[^>]*>[\s\S]*?<\/(?:div|span)>\s*/g, '')
  .replace(/<div\s+id="rafexVersionInfoCard"[^>]*>[\s\S]*?<\/div>\s*/g, '')
  .replace(/<div\s+id="rafexVersionInfoTop"[^>]*>[\s\S]*?<\/div>\s*/g, '')
  .replace(/<div\s+id="rafexVersionInfoLogin"[^>]*>[\s\S]*?<\/div>\s*/g, '');

const cardInner = `<span class="rafex-version-dot" aria-hidden="true"></span><span class="rafex-version-copy"><span class="rafex-version-main">Son sürüm · ${buildSha}</span><span class="rafex-version-time">Yüklenme: ${buildTime}</span></span>`;
const singleCard = `<div id="rafexVersionInfoCard" class="rafex-version-info-card rafex-version-login" aria-label="Son sürüm ve yüklenme bilgisi">${cardInner}</div>`;

const style = `
<style ${marker}>
  #rafexVersionBadge,#rafexBuildVersionBadge,#rafexVersionInfoTop,#rafexVersionInfoLogin{display:none!important;}
  .top-actions{display:flex!important;align-items:center!important;gap:8px!important;}
  .rafex-version-info-card{
    box-sizing:border-box!important;
    min-width:188px!important;
    height:46px!important;
    display:flex!important;
    align-items:center!important;
    gap:10px!important;
    padding:6px 12px!important;
    border:1px solid #dfadb5!important;
    border-radius:12px!important;
    background:#fff8f9!important;
    color:#65000d!important;
    box-shadow:none!important;
    white-space:nowrap!important;
    flex:0 0 auto!important;
    font-family:Arial,sans-serif!important;
    line-height:1.15!important;
    opacity:1!important;
    visibility:visible!important;
  }
  #rafexVersionInfoCard.rafex-version-header{position:static!important;inset:auto!important;margin:0!important;transform:none!important;z-index:auto!important;}
  #rafexVersionInfoCard.rafex-version-login{position:fixed!important;right:18px!important;bottom:18px!important;top:auto!important;left:auto!important;margin:0!important;transform:none!important;z-index:99991!important;}
  .rafex-version-dot{width:6px!important;height:6px!important;border-radius:50%!important;background:#690013!important;flex:0 0 6px!important;}
  .rafex-version-copy{display:flex!important;flex-direction:column!important;justify-content:center!important;gap:3px!important;min-width:0!important;}
  .rafex-version-main{color:#65000d!important;font-size:11px!important;font-weight:800!important;letter-spacing:0!important;}
  .rafex-version-time{color:#8c646a!important;font-size:9px!important;font-weight:400!important;}
  @media(max-width:760px){
    .rafex-version-info-card{min-width:172px!important;height:42px!important;padding:5px 10px!important;gap:8px!important;}
    .rafex-version-main{font-size:10px!important;}.rafex-version-time{font-size:8px!important;}
    #rafexVersionInfoCard.rafex-version-login{right:10px!important;bottom:10px!important;}
  }
</style>`;

if (html.includes('<body>')) html = html.replace('<body>', `<body>${singleCard}`);
else throw new Error('body etiketi bulunamadi.');

const runtime = `
<script ${marker}>
(function(){
  if(window.__rafexSinglePhysicalVersionCardV17)return;
  window.__rafexSinglePhysicalVersionCardV17=true;

  function normalized(el){
    return String(el && (el.innerText || el.textContent) || '').replace(/\\s+/g,' ').trim().toLocaleLowerCase('tr-TR');
  }
  function isVersionCopy(el){
    var txt=normalized(el);
    return (txt.includes('son sürüm') || txt.includes('son surum')) && (txt.includes('yüklenme') || txt.includes('yuklenme'));
  }
  function visible(el){
    return !!(el && !el.classList.contains('hidden') && getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden');
  }
  function findHistoryButton(){
    var direct=document.querySelector('button.history-top');
    if(direct)return direct;
    return Array.from(document.querySelectorAll('button')).find(function(btn){
      var t=normalized(btn);
      return t.includes('proje geçmişi') || t.includes('proje gecmisi');
    }) || null;
  }
  function removeAllOtherVersionCopies(card){
    ['rafexVersionBadge','rafexBuildVersionBadge','rafexVersionInfoTop','rafexVersionInfoLogin'].forEach(function(id){
      var old=document.getElementById(id);if(old)old.remove();
    });
    Array.from(document.body ? document.body.querySelectorAll('*') : []).forEach(function(el){
      if(el===card || card.contains(el))return;
      if(!isVersionCopy(el))return;
      var r=el.getBoundingClientRect ? el.getBoundingClientRect() : {width:0,height:0};
      var cardSized=r.width>=110 && r.width<=420 && r.height>=24 && r.height<=120;
      var labelled=String(el.getAttribute && el.getAttribute('aria-label') || '').toLocaleLowerCase('tr-TR').includes('son sürüm');
      var known=el.classList && (el.classList.contains('rafex-version-info-card') || el.classList.contains('version-badge') || el.classList.contains('version-info'));
      if(cardSized || labelled || known)el.remove();
    });
  }
  function place(){
    if(!document.body)return;
    var card=document.getElementById('rafexVersionInfoCard');
    if(!card)return;
    removeAllOtherVersionCopies(card);

    var app=document.getElementById('app');
    var auth=document.getElementById('auth');
    var history=findHistoryButton();
    var actions=history && (history.closest('.top-actions') || history.parentElement);
    var appVisible=visible(app) || (!!history && !visible(auth));

    if(appVisible && history && actions){
      if(card.parentElement!==actions || card.previousElementSibling!==history){
        history.insertAdjacentElement('afterend',card);
      }
      card.classList.remove('rafex-version-login');
      card.classList.add('rafex-version-header');
    }else{
      if(card.parentElement!==document.body)document.body.appendChild(card);
      card.classList.remove('rafex-version-header');
      card.classList.add('rafex-version-login');
    }
  }

  var queued=false;
  function schedule(){
    if(queued)return;queued=true;
    requestAnimationFrame(function(){queued=false;place();});
  }
  new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style']});
  window.addEventListener('load',schedule);
  document.addEventListener('click',function(){setTimeout(schedule,0)},true);
  window.addEventListener('hashchange',schedule);
  schedule();
  setTimeout(schedule,100);
  setTimeout(schedule,500);
  setTimeout(schedule,1500);
})();
</script>`;

if (html.includes('</head>')) html = html.replace('</head>', style + '\n</head>');
else html = style + html;
// JavaScript içindeki yazdırma şablonlarında da </body> metni bulunuyor.
 // İlk eşleşmeye replace uygulamak dış <script> etiketini erken kapatıp kaynak
 // kodunu sayfanın altında düz metin olarak gösterir. Yalnız gerçek, son body
 // kapanışına ekle.
const finalBodyClose = html.lastIndexOf('</body>');
if (finalBodyClose >= 0) {
  html = html.slice(0, finalBodyClose) + runtime + '\n' + html.slice(finalBodyClose);
} else {
  html += runtime;
}

const runtimeIndex = html.lastIndexOf(`<script ${marker}>`);
const verifiedBodyClose = html.lastIndexOf('</body>');
if (runtimeIndex < 0 || verifiedBodyClose < 0 || runtimeIndex > verifiedBodyClose) {
  throw new Error('Version badge runtime gercek body kapanisina eklenemedi.');
}

const count = (needle) => html.split(needle).length - 1;
if (count('id="rafexVersionInfoCard"') !== 1) throw new Error('Tek fiziksel version card sayisi 1 degil.');
if (count('id="rafexVersionInfoTop"') !== 0 || count('id="rafexVersionInfoLogin"') !== 0) throw new Error('Eski ikili version card build icinde kaldi.');

const encoded = Buffer.from(html, 'utf8').toString('base64');
source = source.replace(match[0], `const HTML_BASE64 =\n  "${encoded}";`);
fs.writeFileSync(target, source);

console.log(`Version badge position patch v17: exactly one physical card: ${buildSha} @ ${buildTime}`);
