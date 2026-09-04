import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error("v100: HTML_BASE64 bulunamadı");

let html = Buffer.from(match[2], "base64").toString("utf8");
html = html.replace(/<script\s+data-rafex-sidebar-order="v100">[\s\S]*?<\/script>/g, "");

const runtime = `<script data-rafex-sidebar-order="v100">
(function(){
  const order=['home','free','b2b','ayak','travers','mr','drive','mekik2','konsol','admin'];
  function apply(){
    const nav=document.getElementById('nav');
    if(!nav)return;
    const buttons=new Map(Array.from(nav.querySelectorAll(':scope > button[data-page]')).map(function(button){return [button.dataset.page,button];}));
    const free=buttons.get('free');
    const b2b=buttons.get('b2b');
    if(free&&b2b&&free.nextElementSibling!==b2b)nav.insertBefore(free,b2b);
    order.forEach(function(page,index){
      const button=buttons.get(page)||nav.querySelector(':scope > button[data-page="'+page+'"]');
      const number=button&&button.querySelector('i');
      if(number)number.textContent=String(index).padStart(2,'0');
    });
  }
  function bind(){
    const nav=document.getElementById('nav');
    if(!nav)return;
    apply();
    if(nav.dataset.rafexOrderBound==='1')return;
    nav.dataset.rafexOrderBound='1';
    new MutationObserver(apply).observe(nav,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
  setTimeout(bind,0);
  setTimeout(apply,300);
})();
</script>`;

const closing = html.lastIndexOf("</body>");
if (closing < 0) throw new Error("v100: </body> bulunamadı");
html = html.slice(0, closing) + runtime + "\n" + html.slice(closing);

for (const required of ['data-rafex-sidebar-order="v100"', "const order=['home','free','b2b','ayak','travers','mr','drive','mekik2','konsol','admin']", "nav.insertBefore(free,b2b)"]) {
  if (!html.includes(required)) throw new Error(`v100 doğrulaması eksik: ${required}`);
}

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.slice(0, match.index) + match[0].replace(match[2], encoded) + worker.slice(match.index + match[0].length);
fs.writeFileSync(workerPath, worker);
console.log("v100: Sol menü Ana Sayfa, Ortak Çizim ve ardından 02-09 sırasına sabitlendi.");
