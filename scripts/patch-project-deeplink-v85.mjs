import fs from "node:fs";
import path from "node:path";

const portalPath = path.join(process.cwd(), "portal.html");
let html = fs.readFileSync(portalPath, "utf8");

const oldBlock = `            requestAnimationFrame(()=>requestAnimationFrame(()=>{\n              m2ApplyProjectRecord(project,false);done=true;\n              if($("m2FloorStatus"))$("m2FloorStatus").textContent="Proje #"+wantedPad+" açıldı.";\n            }));`;
const legacyBlock = `            setTimeout(()=>{\n              m2ProjectRecords=projects.filter((item)=>item.module===moduleName);\n              m2RenderProjects?.();\n              m2LoadProject(project.id);done=true;\n              if($("m2FloorStatus"))$("m2FloorStatus").textContent="Proje #"+wantedPad+" açıldı.";\n            },900);`;
const newBlock = `            setTimeout(()=>{\n              const v90Open=window.rafexOpenProjectV90;\n              if(typeof v90Open==="function"){v90Open(project,false);done=true;return;}\n              m2ProjectRecords=projects.filter((item)=>item.module===moduleName);\n              m2RenderProjects?.();\n              m2LoadProject(project.id);done=true;\n              if($("m2FloorStatus"))$("m2FloorStatus").textContent="Proje #"+wantedPad+" açıldı.";\n            },900);`;

if (!html.includes(newBlock)) {
  if (html.includes(legacyBlock)) html = html.replace(legacyBlock, newBlock);
  else if (html.includes(oldBlock)) html = html.replace(oldBlock, newBlock);
  else throw new Error("Project deeplink v85: apply anchor bulunamadi");
}

if (!html.includes('window.rafexOpenProjectV90') || !html.includes('m2LoadProject(project.id)')) {
  throw new Error("Project deeplink v85 dogrulama eksigi");
}
fs.writeFileSync(portalPath, html);
console.log("Project deeplink v85.1: tek acilis noktasi v90 kontrolcusune baglandi; eski v87 kaynak override kaldirildi.");

await import("./patch-common-source-performance-v90.mjs");
await import("./patch-viewer-pause-hook-v90.mjs");
