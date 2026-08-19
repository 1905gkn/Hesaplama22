import fs from "node:fs";
import path from "node:path";

const portalPath = path.join(process.cwd(), "portal.html");
let html = fs.readFileSync(portalPath, "utf8");

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

if (!html.includes(marker) || !html.includes(guardMarker)) throw new Error("Giriş/yan menü düzeltmesi eklenemedi.");
fs.writeFileSync(portalPath, html);
console.log("Şifre ekranında uygulama menüsü gizlendi; giriş sonrası sol menü sabit tutuldu.");
