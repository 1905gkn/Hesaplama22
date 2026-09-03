import fs from "node:fs";

const file = "dist/server/index.js";
let source = fs.readFileSync(file, "utf8");
const match = source.match(/(const HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("v98: HTML_BASE64 bulunamadı.");

let html = Buffer.from(match[3], "base64").toString("utf8");
const marker = 'data-rafex-module-access-common="v98"';
if (!html.includes(marker)) {
  const runtime = `<script ${marker}>(function(){
  function allowed(){try{return typeof canViewModule!=='function'||canViewModule('free')}catch(_){return true}}
  function sync(){var b=document.querySelector('#nav button[data-page="free"]');if(b)b.hidden=!allowed()}
  document.addEventListener('click',function(event){var b=event.target&&event.target.closest&&event.target.closest('#nav button[data-page="free"]');if(b&&!allowed()){event.preventDefault();event.stopImmediatePropagation();try{showPage('home')}catch(_){window.showPage&&window.showPage('home')}}},true);
  new MutationObserver(sync).observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded',sync,{once:true});sync();
})();</script>`;
  const closing = html.lastIndexOf("</body>");
  if (closing < 0) throw new Error("v98: </body> bulunamadı.");
  html = html.slice(0, closing) + runtime + html.slice(closing);
}

const encoded = Buffer.from(html, "utf8").toString("base64");
source = source.replace(match[0], `${match[1]}${match[2]}${encoded}${match[2]}`);
fs.writeFileSync(file, source);

if (!html.includes(marker) || !html.includes("canViewModule('free')")) throw new Error("v98 doğrulanamadı.");
console.log("v98: Ortak Çizim görünürlüğü kullanıcı modül yetkisine bağlandı.");
