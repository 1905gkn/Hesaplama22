import fs from "node:fs";
import path from "node:path";

const portalPath = path.join(process.cwd(), "portal.html");
let html = fs.readFileSync(portalPath, "utf8");

// Giriş formunda her tuş vuruşunda tüm uygulama ağacını yeniden taratan pahalı :has seçicisini kaldır.
html = html.replace(/\s*body:has\(\.auth:not\(\.hidden\)\) \.shell\{display:none!important\}\s*/g, "\n");

// Oturum açılırken Türkçe zaten aktifse 865 KB portal DOM'unu baştan sona tekrar çeviri taramasından geçirme.
const languageNeedle = 'await changeProgramLanguage(user.default_language || appLanguage, false);';
const languageFastPath = `const targetLanguage = user.default_language || appLanguage;
        if (!(targetLanguage === "tr" && appLanguage === "tr")) {
          await changeProgramLanguage(targetLanguage, false);
        }`;
if (html.includes(languageNeedle)) html = html.replace(languageNeedle, languageFastPath);
else if (!html.includes('const targetLanguage = user.default_language || appLanguage;')) throw new Error("Giriş dil hızlı yolu eklenemedi.");

// Proje geçmişi büyük olduğunda uygulamanın açılmasını bloklama. Ana ekran hemen açılır,
// projeler arkada yüklenir ve Proje Geçmişi açıldığında hazır olur.
const projectLoadNeedle = 'await loadProjects();\n        showPage("home");';
const projectLoadFastPath = `showPage("home");
        loadProjects().catch((error) => console.warn("Proje geçmişi arka planda yüklenemedi:", error));`;
if (html.includes(projectLoadNeedle)) html = html.replace(projectLoadNeedle, projectLoadFastPath);
else if (!html.includes('Proje geçmişi arka planda yüklenemedi:')) throw new Error("Proje geçmişi hızlı yolu eklenemedi.");

// Türkçe temel dil olduğunda büyük Serbest Çizim/SVG DOM güncellemelerini i18n gözlemcisiyle
// tekrar tekrar dolaşma. İngilizce/Fransızca seçildiğinde mevcut çeviri davranışı aynen sürer.
const i18nNeedle = 'const i18nObserver = new MutationObserver((mutations) => {\n        i18nObserver.disconnect();';
const i18nFastPath = 'const i18nObserver = new MutationObserver((mutations) => {\n        if (appLanguage === "tr") return;\n        i18nObserver.disconnect();';
if (html.includes(i18nNeedle)) html = html.replace(i18nNeedle, i18nFastPath);
else if (!html.includes('if (appLanguage === "tr") return;\n        i18nObserver.disconnect();')) throw new Error("Türkçe i18n hızlı yolu eklenemedi.");

// B2B ve MR Three.js bundle'ları toplamda ~1.26 MB. Login/ana sayfa için gerekmezler.
// İlk yükleme yolundan çıkar ve kullanıcı oturum açtıktan sonra browser idle iken ısıt.
html = html.replace(/\s*<script\s+defer\s+src="\/b2b-viewer\.js[^"]*"><\/script>\s*/g, "\n");
html = html.replace(/\s*<script\s+defer\s+src="\/mr-viewer\.js[^"]*"><\/script>\s*/g, "\n");

const viewerWarmMarker = 'data-rafex-viewer-idle-warm="v1"';
if (!html.includes(viewerWarmMarker)) {
  const viewerWarmRuntime = `<script ${viewerWarmMarker}>
(function(){
  const auth=document.getElementById('auth');
  let started=false;
  const load=()=>{
    if(started)return;
    started=true;
    [
      '/b2b-viewer.js?v=b2b-double-row-side-ties-367',
      '/mr-viewer.js?v=mr-system-3'
    ].forEach((src)=>{
      const script=document.createElement('script');
      script.src=src;
      script.async=true;
      document.head.appendChild(script);
    });
  };
  const schedule=()=>{
    if(!auth||!auth.classList.contains('hidden'))return;
    if('requestIdleCallback' in window) requestIdleCallback(load,{timeout:2200});
    else setTimeout(load,700);
  };
  if(auth){
    new MutationObserver(schedule).observe(auth,{attributes:true,attributeFilter:['class','hidden']});
  }
  document.addEventListener('click',(event)=>{
    if(auth && !auth.classList.contains('hidden') && event.target.closest?.('[data-page]')) load();
  },true);
  schedule();
})();
</script>`;
  const bodyEnd = html.lastIndexOf("</body>");
  if (bodyEnd < 0) throw new Error("Portal </body> bulunamadı.");
  html = html.slice(0, bodyEnd) + viewerWarmRuntime + html.slice(bodyEnd);
}

const speedMarker = 'data-rafex-login-speed="v7"';
if (!html.includes(speedMarker)) {
  const speedStyle = `<style ${speedMarker}>
.auth:not(.hidden){contain:layout style paint;isolation:isolate}
.auth:not(.hidden) ~ .shell{display:none!important}
</style>`;
  const headEnd = html.indexOf("</head>");
  if (headEnd < 0) throw new Error("Portal </head> bulunamadı.");
  html = html.slice(0, headEnd) + speedStyle + html.slice(headEnd);
}

const marker = 'data-rafex-login-home-sidebar="v6"';
if (!html.includes(marker)) {
  const style = `<style ${marker}>
/* Giriş ekranı görünürken yalnızca ucuz kardeş seçicisi kullanılır; global :has yok. */
.auth:not(.hidden) ~ .shell{display:none!important}

/* Giriş tamamlandıktan sonra sol uygulama menüsü Ana Sayfa dahil sabit/tam boy kalsın. */
.shell:not(.hidden){display:block!important;min-height:100dvh!important}
.shell:not(.hidden) .side{display:flex!important;position:fixed!important;left:0!important;top:0!important;bottom:0!important;height:100dvh!important;min-height:100dvh!important;max-height:100dvh!important;width:var(--rafex-side-width,240px)!important;flex-direction:column!important;overflow-y:auto!important;overflow-x:hidden!important;z-index:1200!important}
.shell:not(.hidden) .content{margin-left:var(--rafex-side-width,240px)!important;width:calc(100% - var(--rafex-side-width,240px))!important;min-width:0!important}
@media(max-width:760px){
  .shell:not(.hidden) .side{display:flex!important;position:fixed!important;left:0!important;top:0!important;bottom:0!important;width:var(--rafex-side-width,240px)!important;height:100dvh!important}
  .shell:not(.hidden) .content{margin-left:var(--rafex-side-width,240px)!important;width:calc(100% - var(--rafex-side-width,240px))!important}
}
</style>`;
  const headEnd = html.indexOf("</head>");
  if (headEnd < 0) throw new Error("Portal </head> bulunamadı.");
  html = html.slice(0, headEnd) + style + html.slice(headEnd);
}

const guardMarker = 'data-rafex-login-sidebar-guard="v3"';
if (!html.includes(guardMarker)) {
  const runtime = `<script ${guardMarker}>
(function(){
  const auth=document.querySelector('.auth');
  const shell=document.querySelector('.shell');
  if(!auth||!shell)return;
  const sync=()=>{
    const loginVisible=!auth.classList.contains('hidden')&&auth.hidden!==true;
    if(loginVisible){
      shell.style.setProperty('display','none','important');
      shell.dataset.rafexLoginSuppressed='1';
    }else if(shell.dataset.rafexLoginSuppressed==='1'){
      shell.style.removeProperty('display');
      delete shell.dataset.rafexLoginSuppressed;
    }
  };
  new MutationObserver(sync).observe(auth,{attributes:true,attributeFilter:['class','hidden']});
  sync();
})();
</script>`;
  const bodyEnd = html.lastIndexOf("</body>");
  if (bodyEnd < 0) throw new Error("Portal </body> bulunamadı.");
  html = html.slice(0, bodyEnd) + runtime + html.slice(bodyEnd);
}

const speedGuardMarker = 'data-rafex-login-input-isolation="v4"';
if (!html.includes(speedGuardMarker)) {
  const speedRuntime = `<script ${speedGuardMarker}>
(function(){
  const auth=document.querySelector('.auth'),form=document.getElementById('loginForm'),shell=document.querySelector('.shell');
  if(!auth||!form||!shell)return;
  const loginVisible=()=>!auth.classList.contains('hidden')&&auth.hidden!==true;
  const isolate=(event)=>{if(loginVisible())event.stopPropagation();};
  ['input','change','keydown','keyup'].forEach((type)=>form.addEventListener(type,isolate));
  const sync=()=>{const visible=loginVisible();shell.inert=visible;if(visible)shell.setAttribute('aria-hidden','true');else shell.removeAttribute('aria-hidden');};
  new MutationObserver(sync).observe(auth,{attributes:true,attributeFilter:['class','hidden']});
  sync();
})();
</script>`;
  const bodyEnd = html.lastIndexOf("</body>");
  if (bodyEnd < 0) throw new Error("Portal </body> bulunamadı.");
  html = html.slice(0, bodyEnd) + speedRuntime + html.slice(bodyEnd);
}

// Normal enter() artık hızlıdır. Yalnızca gerçekten takılırsa, 1.8 sn sonra doğrulanmış
// /api/me oturumunda görünürlük katmanını kurtar; yarım başlatılmış ekranı erkenden gösterme.
const sessionRecoveryMarker = 'data-rafex-login-session-recovery="v3"';
if (!html.includes(sessionRecoveryMarker)) {
  const sessionRecoveryRuntime = `<script ${sessionRecoveryMarker}>
(function(){
  const auth=document.getElementById('auth');
  const app=document.getElementById('app');
  const shell=document.querySelector('.shell');
  const form=document.getElementById('loginForm');
  if(!auth||!app||!form)return;
  const verifySession=async()=>{
    if(auth.classList.contains('hidden'))return;
    try{
      const response=await fetch('/api/me',{cache:'no-store'});
      if(!response.ok||auth.classList.contains('hidden'))return;
      auth.classList.add('hidden');
      app.classList.remove('hidden');
      if(shell){
        shell.style.removeProperty('display');
        shell.inert=false;
        shell.removeAttribute('aria-hidden');
        delete shell.dataset.rafexLoginSuppressed;
      }
    }catch{}
  };
  form.addEventListener('submit',()=>setTimeout(verifySession,1800),true);
})();
</script>`;
  const bodyEnd = html.lastIndexOf("</body>");
  if (bodyEnd < 0) throw new Error("Portal </body> bulunamadı.");
  html = html.slice(0, bodyEnd) + sessionRecoveryRuntime + html.slice(bodyEnd);
}

if (!html.includes(marker) || !html.includes(guardMarker) || !html.includes(speedMarker) || !html.includes(speedGuardMarker) || !html.includes(sessionRecoveryMarker) || !html.includes(viewerWarmMarker)) throw new Error("Giriş/yan menü performans düzeltmesi eklenemedi.");
fs.writeFileSync(portalPath, html);
console.log("Giriş hızlı yolu etkin: TR DOM hot-loop kapalı, proje geçmişi bloklamıyor, 3D bundle'lar idle yükleniyor.");
