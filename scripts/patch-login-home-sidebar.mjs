import fs from "node:fs";
import path from "node:path";

const portalPath = path.join(process.cwd(), "portal.html");
let html = fs.readFileSync(portalPath, "utf8");

// Giris formunda her tus vurusunda tum uygulama agacini yeniden taratan pahali :has secicisini kaldir.
html = html.replace(/\s*body:has\(\.auth:not\(\.hidden\)\) \.shell\{display:none!important\}\s*/g, "\n");

// Turkce zaten aktifken buyuk uygulama DOM'unu giriste yeniden cevirme.
const languageNeedle = 'await changeProgramLanguage(user.default_language || appLanguage, false);';
const languageFastPath = `const targetLanguage = user.default_language || appLanguage;
        if (!(targetLanguage === "tr" && appLanguage === "tr")) {
          await changeProgramLanguage(targetLanguage, false);
        }`;
if (html.includes(languageNeedle)) html = html.replace(languageNeedle, languageFastPath);
else if (!html.includes('const targetLanguage = user.default_language || appLanguage;')) throw new Error("Giris dil hizli yolu eklenemedi.");

// Proje gecmisi ana ekranin acilmasini bloklamasin; veri arka planda hazirlanir.
const projectLoadNeedle = /await loadProjects\(\);\r?\n\s*showPage\("home"\);/;
const projectLoadFastPath = `showPage("home");
        loadProjects().catch((error) => console.warn("Proje gecmisi arka planda yuklenemedi:", error));`;
if (projectLoadNeedle.test(html)) html = html.replace(projectLoadNeedle, projectLoadFastPath);
else if (!html.includes('Proje gecmisi arka planda yuklenemedi:')) throw new Error("Proje gecmisi hizli yolu eklenemedi.");

// Varsayilan Turkce dilde MutationObserver'in her SVG/Ortak Cizim eklemesinde
// tum alt agaci tekrar taramasini engelle. Diger dillerin cevirisi aynen korunur.
const i18nNeedle = /const i18nObserver = new MutationObserver\(\(mutations\) => \{\r?\n\s*i18nObserver\.disconnect\(\);/;
const i18nFastPath = 'const i18nObserver = new MutationObserver((mutations) => {\n        if (appLanguage === "tr") return;\n        i18nObserver.disconnect();';
if (i18nNeedle.test(html)) html = html.replace(i18nNeedle, i18nFastPath);
else if (!html.includes('if (appLanguage === "tr") return;\n        i18nObserver.disconnect();')) throw new Error("Turkce i18n hizli yolu eklenemedi.");

// Buyuk 3D bundle'lari login HTML'inin defer zincirinden cikar. Modul kodu
// degismez; her motor yalniz kendi menu ogesi acilinca yuklenir.
const deferredViewerSources = [];
html = html.replace(/\s*<script\s+defer\s+src="(\/(?:b2b|mr)-viewer\.js[^"]*)"\s*><\/script>\s*/g, (match, src) => {
  deferredViewerSources.push(src);
  return "\n";
});
const viewerWarmMarker = 'data-rafex-viewer-on-demand="v3"';
if (!html.includes(viewerWarmMarker)) {
  if (deferredViewerSources.length !== 2) throw new Error("B2B/MR viewer defer kaynaklari bulunamadi.");
  const viewerSourcesJson = JSON.stringify(deferredViewerSources);
  const viewerWarmRuntime = `<script ${viewerWarmMarker}>
(function(){
  const sources=${viewerSourcesJson};
  const sourceByModule=Object.fromEntries(sources.map((src)=>[src.includes('/mr-viewer.js')?'mr':'b2b',src]));
  const started=new Set();
  const load=(module)=>{
    const src=sourceByModule[module];
    if(!src||started.has(module))return;
    started.add(module);
    const path=src.split('?')[0];
    if(document.querySelector('script[src^="'+path+'"]'))return;
    const script=document.createElement('script');
    script.src=src;
    script.async=true;
    document.head.appendChild(script);
  };
  document.addEventListener('click',(event)=>{
    const target=event.target.closest?.('[data-page="b2b"],[data-page="mr"]');
    if(target)load(target.getAttribute('data-page'));
  },true);
})();
</script>`;
  const bodyEnd = html.lastIndexOf("</body>");
  if (bodyEnd < 0) throw new Error("Portal </body> bulunamadı.");
  html = html.slice(0, bodyEnd) + viewerWarmRuntime + html.slice(bodyEnd);
}

const speedMarker = 'data-rafex-login-speed="v8"';
if (!html.includes(speedMarker)) {
  const speedStyle = `<style ${speedMarker}>
.auth:not(.hidden){contain:layout style paint;isolation:isolate}
.auth:not(.hidden) ~ .shell{display:none!important}
</style>`;
  const headEnd = html.indexOf("</head>");
  if (headEnd < 0) throw new Error("Portal </head> bulunamadı.");
  html = html.slice(0, headEnd) + speedStyle + html.slice(headEnd);
}

const marker = 'data-rafex-login-home-sidebar="v7"';
if (!html.includes(marker)) {
  const style = `<style ${marker}>
/* Giris gorunurken yalniz ucuz kardes secicisi kullanilir; global :has yoktur. */
.auth:not(.hidden) ~ .shell{display:none!important}

/* Giriş tamamlandıktan sonra sol uygulama menüsü Ana Sayfa dahil sabit/tam boy kalsın. */
.shell:not(.hidden){display:block!important;min-height:100dvh!important}
.shell:not(.hidden) .side{display:flex!important;position:fixed!important;left:0!important;top:0!important;bottom:0!important;height:100dvh!important;min-height:100dvh!important;max-height:100dvh!important;width:var(--rafex-side-width,240px)!important;flex-direction:column!important;overflow-y:auto!important;overflow-x:hidden!important;z-index:1200!important}
.shell:not(.hidden) .content{margin-left:var(--rafex-side-width,240px)!important;width:calc(100% - var(--rafex-side-width,240px))!important;min-width:0!important}
@media(max-width:760px){
  .shell:not(.hidden) .side{display:flex!important;position:fixed!important;left:0!important;top:0!important;bottom:0!important;width:var(--rafex-side-width,240px)!important;height:100dvh!important}
  .shell:not(.hidden) .content{margin-left:0!important;width:100%!important;min-width:0!important}
}
</style>`;
  const headEnd = html.indexOf("</head>");
  if (headEnd < 0) throw new Error("Portal </head> bulunamadı.");
  html = html.slice(0, headEnd) + style + html.slice(headEnd);
}

const guardMarker = 'data-rafex-login-sidebar-guard="v4"';
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

const speedGuardMarker = 'data-rafex-login-input-isolation="v5"';
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

const sessionRecoveryMarker = 'data-rafex-login-session-recovery="v4"';
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
console.log("Giris hizli yolu etkin: TR DOM hot-loop kapali ve proje gecmisi acilisi bloklamiyor.");

