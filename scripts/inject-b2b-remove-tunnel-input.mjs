import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("HTML_BASE64 build çıktısında bulunamadı.");

let html = Buffer.from(match[3], "base64").toString("utf8");
const marker = 'data-rafex-remove-b2b-tunnel-input="v1"';

if (!html.includes(marker)) {
  const script = `<script ${marker}>(function(){
    function norm(v){return String(v||"").toLocaleUpperCase("tr-TR").replace(/\\s+/g," ").trim()}
    function removeTunnelInput(){
      if(!document.getElementById("b2bModuleCount")) return;
      const phrases=["TÜNEL OLACAK BÖLÜM","TUNEL OLACAK BOLUM","TÜNEL BÖLÜMÜ","TUNEL BOLUMU"];
      document.querySelectorAll("label,.input-field,.field,.b2b-field,.b2b-input-group,.form-group,.form-row").forEach((node)=>{
        const text=norm(node.textContent);
        if(!phrases.some((p)=>text.includes(p))) return;
        const host=node.closest(".input-field,.field,.b2b-field,.b2b-input-group,.form-group,.form-row")||node;
        host.remove();
      });
      const tunnelControl=document.getElementById("b2bTunnelModules")||document.querySelector('[data-b2b-tunnel-modules]');
      if(tunnelControl){const host=tunnelControl.closest(".input-field,.field,.b2b-field,.b2b-input-group,.form-group,.form-row")||tunnelControl;host.remove();}
    }
    if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",removeTunnelInput,{once:true}); else removeTunnelInput();
    const observer=new MutationObserver(()=>removeTunnelInput());
    observer.observe(document.documentElement,{childList:true,subtree:true});
  })();<\/script>`;
  const bodyEnd = html.lastIndexOf("</body>");
  if (bodyEnd < 0) throw new Error("Portal </body> kapanışı bulunamadı.");
  html = `${html.slice(0, bodyEnd)}${script}${html.slice(bodyEnd)}`;
}

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.slice(0, match.index) + match[1] + match[2] + encoded + match[2] + worker.slice(match.index + match[0].length);
fs.writeFileSync(workerPath, worker);

const verify = Buffer.from(encoded, "base64").toString("utf8");
if (!verify.includes(marker) || !verify.includes("TÜNEL OLACAK BÖLÜM")) throw new Error("B2B tünel alanı kaldırma injector doğrulanamadı.");
