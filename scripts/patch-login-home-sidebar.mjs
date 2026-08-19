import fs from "node:fs";
import path from "node:path";

const portalPath = path.join(process.cwd(), "portal.html");
let html = fs.readFileSync(portalPath, "utf8");

const marker = 'data-rafex-login-home-sidebar="v3"';
if (!html.includes(marker)) {
  const style = `<style ${marker}>
/* Giriş ekranına dokunma: dünkü/orijinal iki kolonlu giriş tasarımı aynen kalsın.
   Uygulama sol menüsü yalnızca giriş yapıldıktan sonra görünür ve sabit kalır. */
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

if (!html.includes(marker)) throw new Error("Giriş/yan menü düzeltmesi eklenemedi.");
fs.writeFileSync(portalPath, html);
console.log("Dünkü/orijinal giriş ekranı korundu; giriş sonrası sol menü Ana Sayfa dahil sabit/tam boy kaldı.");
