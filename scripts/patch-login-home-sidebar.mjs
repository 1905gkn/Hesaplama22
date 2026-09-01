import fs from "node:fs";
import path from "node:path";

const portalPath = path.join(process.cwd(), "portal.html");
let html = fs.readFileSync(portalPath, "utf8");

// Giris formunda her tus vurusunda tum uygulama agacini yeniden taratan pahali :has secicisini kaldir.
html = html.replace(/\s*body:has\(\.auth:not\(\.hidden\)\) \.shell\{display:none!important\}\s*/g, "\n");

const speedMarker = 'data-rafex-login-speed="v5"';
if (!html.includes(speedMarker)) {
  const speedStyle = `<style ${speedMarker}>
.auth:not(.hidden){contain:layout style paint;isolation:isolate}
.auth:not(.hidden) ~ .shell{display:none!important}
</style>`;
  const headEnd = html.indexOf("</head>");
  if (headEnd < 0) throw new Error("Portal </head> bulunamadı.");
  html = html.slice(0, headEnd) + speedStyle + html.slice(headEnd);
}

const marker = 'data-rafex-login-home-sidebar="v4"';
if (!html.includes(marker)) {
  const style = `<style ${marker}>
/* Giriş ekranının eski/orijinal görünümünü koru. Şifre girilirken uygulama menüsü asla görünmesin. */
body:has(.auth:not(.hidden)) .shell{display:none!important}
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

const guardMarker = 'data-rafex-login-sidebar-guard="v1"';
if (!html.includes(guardMarker)) {
  const runtime = `<script ${guardMarker}>
(function(){
  const auth=document.querySelector('.auth');
  const shell=document.querySelector('.shell');
  if(!auth||!shell)return;
  const sync=()=>{
    const loginVisible=!auth.classList.contains('hidden')&&auth.hidden!==true&&getComputedStyle(auth).display!=='none';
    if(loginVisible){
      shell.style.setProperty('display','none','important');
      shell.dataset.rafexLoginSuppressed='1';
    }else if(shell.dataset.rafexLoginSuppressed==='1'){
      shell.style.removeProperty('display');
      delete shell.dataset.rafexLoginSuppressed;
    }
  };
  new MutationObserver(sync).observe(auth,{attributes:true,attributeFilter:['class','hidden','style']});
  sync();
})();
</script>`;
  const bodyEnd = html.lastIndexOf("</body>");
  if (bodyEnd < 0) throw new Error("Portal </body> bulunamadı.");
  html = html.slice(0, bodyEnd) + runtime + html.slice(bodyEnd);
}

const speedGuardMarker = 'data-rafex-login-input-isolation="v2"';
if (!html.includes(speedGuardMarker)) {
  const speedRuntime = `<script ${speedGuardMarker}>
(function(){
  const auth=document.querySelector('.auth'),form=document.getElementById('loginForm'),shell=document.querySelector('.shell');
  if(!auth||!form||!shell)return;
  const loginVisible=()=>!auth.classList.contains('hidden')&&auth.hidden!==true;
  const isolate=(event)=>{if(loginVisible())event.stopPropagation();};
  ['input','change','keydown','keyup'].forEach((type)=>form.addEventListener(type,isolate));
  const sync=()=>{const visible=loginVisible();shell.inert=visible;if(visible)shell.setAttribute('aria-hidden','true');else shell.removeAttribute('aria-hidden');};
  new MutationObserver(sync).observe(auth,{attributes:true,attributeFilter:['class','hidden','style']});
  sync();
})();
</script>`;
  const bodyEnd = html.lastIndexOf("</body>");
  if (bodyEnd < 0) throw new Error("Portal </body> bulunamadı.");
  html = html.slice(0, bodyEnd) + speedRuntime + html.slice(bodyEnd);
}

if (!html.includes(marker) || !html.includes(guardMarker) || !html.includes(speedMarker) || !html.includes(speedGuardMarker)) throw new Error("Giriş/yan menü performans düzeltmesi eklenemedi.");
fs.writeFileSync(portalPath, html);
console.log("Giriş alanları genel uygulama olaylarından ayrıldı; pahalı :has seçicisi kaldırıldı.");
