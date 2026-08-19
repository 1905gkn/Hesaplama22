import fs from "node:fs";
import path from "node:path";

const portalPath = path.join(process.cwd(), "portal.html");
let html = fs.readFileSync(portalPath, "utf8");

const marker = 'data-rafex-login-home-sidebar="v1"';
if (!html.includes(marker)) {
  const style = `<style ${marker}>
/* Login ekranında soldaki yeşil tanıtım alanı görünmesin. */
.auth{display:grid!important;grid-template-columns:1fr!important;min-height:100dvh!important;background:var(--bg)!important}
.auth-brand{display:none!important}
.auth-side{min-height:100dvh!important;width:100%!important;display:grid!important;place-items:center!important;padding:30px!important}
.auth-card{margin:auto!important}

/* Uygulamaya giriş yapıldıktan sonra sol menü Ana Sayfa dahil her sayfada sabit ve tam boy kalsın. */
body.rafex-home-page .side,.shell .side{display:flex!important;position:fixed!important;left:0!important;top:0!important;bottom:0!important;height:100dvh!important;min-height:100dvh!important;max-height:100dvh!important;width:var(--rafex-side-width,240px)!important;flex-direction:column!important;overflow-y:auto!important;overflow-x:hidden!important;z-index:1200!important}
body.rafex-home-page .content,.shell .content{margin-left:var(--rafex-side-width,240px)!important;width:calc(100% - var(--rafex-side-width,240px))!important;min-width:0!important}
body.rafex-home-page .shell,.shell{display:block!important;min-height:100dvh!important}
@media(max-width:760px){
  .auth-side{padding:18px!important}
  body.rafex-home-page .side,.shell .side{display:flex!important;position:fixed!important;left:0!important;top:0!important;bottom:0!important;width:var(--rafex-side-width,240px)!important;height:100dvh!important}
  body.rafex-home-page .content,.shell .content{margin-left:var(--rafex-side-width,240px)!important;width:calc(100% - var(--rafex-side-width,240px))!important}
}
</style>`;
  const headEnd = html.indexOf("</head>");
  if (headEnd < 0) throw new Error("Portal </head> bulunamadı.");
  html = html.slice(0, headEnd) + style + html.slice(headEnd);
}

if (!html.includes(marker)) throw new Error("Login/Ana Sayfa yan menü düzeltmesi eklenemedi.");
fs.writeFileSync(portalPath, html);
console.log("Login yeşil alanı kaldırıldı; uygulama yan menüsü Ana Sayfa dahil sabit/tam boy yapıldı.");
