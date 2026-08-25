import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error("Ortak Cizim nav: HTML_BASE64 bulunamadi");

let html = Buffer.from(match[2], "base64").toString("utf8");
html = html.replace(/<script\s+data-rafex-free-nav-ortak="v39">[\s\S]*?<\/script>/g, "");

const runtime = `<script data-rafex-free-nav-ortak="v39">
(function(){
  const LABEL='Ortak Çizim';
  let navObserver=null;
  function apply(){
    const button=document.querySelector('#nav button[data-page="free"]');
    if(!button)return;
    const textNodes=Array.from(button.childNodes).filter(function(node){return node.nodeType===3&&String(node.nodeValue||'').trim();});
    if(textNodes.length){
      textNodes.forEach(function(node,index){
        if(index===0){if(String(node.nodeValue||'').trim()!==LABEL)node.nodeValue=LABEL;}
        else node.nodeValue='';
      });
    }else{
      button.appendChild(document.createTextNode(LABEL));
    }
    button.setAttribute('aria-label',LABEL);
  }
  function bind(){
    apply();
    const nav=document.getElementById('nav');
    if(!nav||navObserver)return;
    navObserver=new MutationObserver(apply);
    navObserver.observe(nav,{childList:true,subtree:true,characterData:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
  setTimeout(bind,0);
  setTimeout(bind,250);
})();
</script>`;

const closing = html.lastIndexOf("</body>");
if (closing < 0) throw new Error("Ortak Cizim nav: </body> bulunamadi");
html = html.slice(0, closing) + runtime + "\n" + html.slice(closing);
if (!html.includes('data-rafex-free-nav-ortak="v39"') || !html.includes("const LABEL='Ortak Çizim'")) {
  throw new Error("Ortak Cizim nav runtime eklenemedi");
}

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.slice(0, match.index) + match[0].replace(match[2], encoded) + worker.slice(match.index + match[0].length);
fs.writeFileSync(workerPath, worker);
console.log("v39: Sol menudeki Serbest Cizim sekmesi Ortak Cizim olarak degistirildi.");

await import("./patch-free-layout-system-switch-v40.mjs");
await import("./patch-free-ortak-switch-ux-v41.mjs");
await import("./patch-free-b2b-remount-v42.mjs");\nawait import("./patch-free-editor-preserve-v43.mjs");
