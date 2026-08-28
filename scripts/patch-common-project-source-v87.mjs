import fs from "node:fs";
import path from "node:path";

const portalPath = path.join(process.cwd(), "portal.html");
let html = fs.readFileSync(portalPath, "utf8");

const commonFilter = `projects.filter((item)=>{const systems=new Set((item?.payload?.layout?.racks||[]).map((rack)=>String(rack?.rafexSystem||(rack?.b2b?.mr?"mr":rack?.b2bLayout?"b2b":"")).toLowerCase()).filter(Boolean));return String(item?.module||"").toLowerCase()==="ortak"||systems.size>1;})`;
const oldBlock = `            const moduleName=["b2b","mr","mekik2"].includes(project.module)?project.module:"b2b";\n            showPage(moduleName);\n            m2ProjectRecords=projects.filter((item)=>item.module===moduleName);`;
const newBlock = `            const projectSystems=new Set((project?.payload?.layout?.racks||[]).map((rack)=>String(rack?.rafexSystem||(rack?.b2b?.mr?"mr":rack?.b2bLayout?"b2b":"")).toLowerCase()).filter(Boolean));\n            const commonProject=String(project?.module||"").toLowerCase()==="ortak"||projectSystems.size>1;\n            const moduleName=commonProject?"free":(["b2b","mr","mekik2"].includes(project.module)?project.module:"b2b");\n            showPage(moduleName);\n            m2ProjectRecords=commonProject?${commonFilter}:projects.filter((item)=>item.module===moduleName);`;

if (!html.includes(newBlock)) {
  if (!html.includes(oldBlock)) throw new Error("Common project v87: deeplink module anchor bulunamadi");
  html = html.replace(oldBlock, newBlock);
}

const lateOld = `              m2ProjectRecords=projects.filter((item)=>item.module===moduleName);`;
const lateNew = `              m2ProjectRecords=commonProject?${commonFilter}:projects.filter((item)=>item.module===moduleName);`;
if (html.includes(lateOld)) html = html.replace(lateOld, lateNew);
if (!html.includes(lateNew)) throw new Error("Common project v87: gec proje yukleyici ortak filtreye baglanamadi");

if (!html.includes('const commonProject=String(project?.module||"").toLowerCase()==="ortak"||projectSystems.size>1;')) {
  throw new Error("Common project v87: ortak proje algisi eklenemedi");
}

fs.writeFileSync(portalPath, html);
console.log("SOURCE v87.1: ilk ve gec proje yukleyiciler karma/ortak projeyi Ortak Cizim'de tutar.");
