import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error("Ortak Cizim nav: HTML_BASE64 bulunamadi");

let html = Buffer.from(match[2], "base64").toString("utf8");
html = html
  .replace(/<script\s+data-rafex-free-nav-ortak="v39">[\s\S]*?<\/script>/g, "")
  .replace(/<script\s+data-rafex-free-layout-system-switch="v40">[\s\S]*?<\/script>/g, "")
  .replace(/<script\s+data-rafex-free-ortak-switch-ux="v41">[\s\S]*?<\/script>/g, "")
  .replace(/<script\s+data-rafex-free-b2b-remount="v42">[\s\S]*?<\/script>/g, "")
  .replace(/<script\s+data-rafex-free-editor-preserve="v43">[\s\S]*?<\/script>/g, "");

const staticFrontWrite = '$("m2Front").innerHTML = elevation("front");';
const b2b3DOnlyWrite = 'if (m2ActiveModule !== "b2b") $("m2Front").innerHTML = elevation("front");';
if (html.includes(staticFrontWrite)) html = html.replace(staticFrontWrite, b2b3DOnlyWrite);
if (!html.includes(b2b3DOnlyWrite)) throw new Error("B2B 3D-only: statik on gorunus yazimi devre disi birakilamadi");

html = html.replace(
  'if (frontTab) frontTab.textContent = "3D / Önden Görünüş";',
  'if (frontTab) frontTab.textContent = "3D Görünüş";'
);
html = html.replace(
  `<button type="button" onclick="b2bSet3DCamera('front')">Önden</button>`,
  ""
);

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

