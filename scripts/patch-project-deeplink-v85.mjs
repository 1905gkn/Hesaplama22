import fs from "node:fs";
import path from "node:path";

const portalPath = path.join(process.cwd(), "portal.html");
let html = fs.readFileSync(portalPath, "utf8");

const oldBlock = `            requestAnimationFrame(()=>requestAnimationFrame(()=>{\n              m2ApplyProjectRecord(project,false);done=true;\n              if($("m2FloorStatus"))$("m2FloorStatus").textContent="Proje #"+wantedPad+" açıldı.";\n            }));`;
const newBlock = `            setTimeout(()=>{\n              m2ProjectRecords=projects.filter((item)=>item.module===moduleName);\n              m2RenderProjects?.();\n              m2LoadProject(project.id);done=true;\n              if($("m2FloorStatus"))$("m2FloorStatus").textContent="Proje #"+wantedPad+" açıldı.";\n            },900);`;

if (!html.includes(newBlock)) {
  if (!html.includes(oldBlock)) throw new Error("Project deeplink v85: apply anchor bulunamadi");
  html = html.replace(oldBlock, newBlock);
}

if (!html.includes('m2LoadProject(project.id)') || !html.includes('setTimeout(()=>{')) throw new Error("Project deeplink v85 dogrulama eksigi");
fs.writeFileSync(portalPath, html);
console.log("Project deeplink v85: kayitli proje, UI'daki kayit butonuyla ayni m2LoadProject yolundan aciliyor.");

await import("./patch-common-project-source-v87.mjs");
