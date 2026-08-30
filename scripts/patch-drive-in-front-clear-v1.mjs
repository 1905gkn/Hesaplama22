import fs from "node:fs";

const file = "dist/server/index.js";
let source = fs.readFileSync(file, "utf8");
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error("HTML_BASE64 not found for Drive In front clear v1");

let html = Buffer.from(match[2], "base64").toString("utf8");
html = html
  .replace(/<style data-rafex-drive-in-front-clear="v1">[\s\S]*?<\/style>/g, "")
  .replace(/<script data-rafex-drive-in-front-clear="v1">[\s\S]*?<\/script>/g, "")
  .replace(/<script data-rafex-drive-in-viewer-loader="v1"[^>]*><\/script>/g, "");

const patch = String.raw`
<style data-rafex-drive-in-front-clear="v1">
#page.drive-in-mode .m2-view[data-m2-view="front"]{display:none!important}
</style>
<script data-rafex-drive-in-front-clear="v1">
(()=>{
  const clearDriveFront=()=>{
    const page=document.getElementById("page");
    if(!page?.classList.contains("drive-in-mode"))return;
    try{window.RafexDriveInViewer?.destroy?.()}catch{}
    const host=document.getElementById("m2Front");
    if(host)host.replaceChildren();
  };
  window.addEventListener("load",clearDriveFront);
  window.addEventListener("hashchange",()=>setTimeout(clearDriveFront,0));
  document.addEventListener("click",()=>setTimeout(clearDriveFront,0),true);
  setTimeout(clearDriveFront,0);
})();
</script>`;

html = html.replace("</body>", patch + "</body>");
if (!html.includes('data-rafex-drive-in-front-clear="v1"')) {
  throw new Error("Drive In ön görünüş kaldırma işareti eklenemedi");
}
if (html.includes('data-rafex-drive-in-viewer-loader="v1"')) {
  throw new Error("Drive In ön görünüş viewer yükleyicisi kaldırılamadı");
}

const encoded = Buffer.from(html).toString("base64");
source = source.slice(0, match.index) + match[0].replace(match[2], encoded) + source.slice(match.index + match[0].length);
fs.writeFileSync(file, source);
console.log("Drive In ön görünüş tamamen gizlendi ve mevcut viewer yükleyicisi kaldırıldı.");
