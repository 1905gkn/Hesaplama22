import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("B2B 3D height v103: HTML_BASE64 bulunamadi");
let html = Buffer.from(match[3], "base64").toString("utf8");

html = html.replace(/<style\s+data-rafex-b2b-3d-save-height="v103">[\s\S]*?<\/style>\s*/g, "");
const css = `<style data-rafex-b2b-3d-save-height="v103">
@media(min-width:651px){
  #page.b2b-mode .m2-layout{align-items:stretch!important}
  #page.b2b-mode .m2-layout>.m2-views{display:flex!important;min-height:0!important;flex-direction:column!important}
  #page.b2b-mode .m2-layout>.m2-views>[data-m2-view="front"]{display:flex!important;flex:1 1 auto!important;min-height:820px!important;flex-direction:column!important}
  #page.b2b-mode .m2-layout .b2b-main-3d-canvas{flex:1 1 auto!important;min-height:760px!important;height:auto!important}
  #page.b2b-mode .m2-layout .b2b-main-3d-viewer{min-height:100%!important;height:100%!important}
  #page.b2b-mode .m2-layout>.m2-export{align-self:end!important;margin-top:12px!important}
}
</style>`;
const closing = html.lastIndexOf("</body>");
if (closing < 0) throw new Error("B2B 3D height v103: body bulunamadi");
html = html.slice(0, closing) + css + "\n" + html.slice(closing);
if (!html.includes('data-rafex-b2b-3d-save-height="v103"')) throw new Error("B2B 3D height v103 dogrulama eksigi");
const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.replace(match[0], `${match[1]}${match[2]}${encoded}${match[2]}`);
fs.writeFileSync(workerPath, worker);
console.log("v103: B2B 3D alani Rafı Kaydet hizasina kadar uzatildi.");
