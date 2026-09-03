import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync("dist/server/index.js", "utf8");
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error("Runtime authority verify: HTML_BASE64 bulunamadi");
const html = Buffer.from(match[2], "base64").toString("utf8");
const count = (needle) => html.split(needle).length - 1;
if (count('data-rafex-runtime-authority="v2"') !== 2) throw new Error("Runtime authority v2 style/script tekil degil");
if (count('window.RafexRuntimeAuthority=') !== 1) throw new Error("Runtime authority nesnesi tekil degil");
if (html.includes('data-rafex-runtime-authority="v1"') || html.includes('data-rafex-common-layout-theme="v96"')) throw new Error("Eski tema katmani hala aktif");
for (const required of ['grid-template-columns:repeat(5','rafex-system-picker-head','display:none!important',"active.dataset.page==='free'",'leaveCommon(page)','ensurePicker(page)','ensureProject(picker)','projectNode','if(node!==projectNode)node.remove()','rafexAuthorityProjectName',"window.addEventListener('input'",'data-rafex-authority-project-name','projectName=event.target.value']) {
  if (!html.includes(required)) throw new Error("Runtime authority v2 verify eksigi: " + required);
}
const runtime = html.match(/<script data-rafex-runtime-authority="v2">([\s\S]*?)<\/script>/)?.[1];
if (!runtime) throw new Error("Runtime authority v2 scripti bulunamadi");
new vm.Script(runtime, { filename: "runtime-authority-v2.js" });
console.log("Runtime authority v2 verified: besli sabit secim ve kalici proje adi aktif.");
