import fs from "node:fs";
import path from "node:path";

const portalPath = path.join(process.cwd(), "portal.html");
let html = fs.readFileSync(portalPath, "utf8");

const commonFilter = `projects.filter((item)=>{const systems=new Set((item?.payload?.layout?.racks||[]).map((rack)=>String(rack?.rafexSystem||(rack?.b2b?.mr?"mr":rack?.b2bLayout?"b2b":"")).toLowerCase()).filter(Boolean));return String(item?.module||"").toLowerCase()==="ortak"||systems.size>1;})`;

const legacyStart = `            const moduleName=["b2b","mr","mekik2"].includes(project.module)?project.module:"b2b";\n            showPage(moduleName);\n            m2ProjectRecords=projects.filter((item)=>item.module===moduleName);`;
const v871Start = `            const projectSystems=new Set((project?.payload?.layout?.racks||[]).map((rack)=>String(rack?.rafexSystem||(rack?.b2b?.mr?"mr":rack?.b2bLayout?"b2b":"")).toLowerCase()).filter(Boolean));\n            const commonProject=String(project?.module||"").toLowerCase()==="ortak"||projectSystems.size>1;\n            const moduleName=commonProject?"free":(["b2b","mr","mekik2"].includes(project.module)?project.module:"b2b");\n            showPage(moduleName);\n            m2ProjectRecords=commonProject?${commonFilter}:projects.filter((item)=>item.module===moduleName);`;
const v872Start = `            const projectSystems=new Set((project?.payload?.layout?.racks||[]).map((rack)=>String(rack?.rafexSystem||(rack?.b2b?.mr?"mr":rack?.b2bLayout?"b2b":"")).toLowerCase()).filter(Boolean));\n            const commonProject=String(project?.module||"").toLowerCase()==="ortak"||projectSystems.size>1;\n            const moduleName=["b2b","mr","mekik2"].includes(project.module)?project.module:"b2b";\n            if(commonProject){\n              let commonOpenTries=0;\n              const openCommonProject=()=>{\n                const loader=window.rafexLoadUnifiedProjectV75;\n                if(typeof loader==="function"){\n                  m2ProjectRecords=${commonFilter};\n                  loader(project,false);done=true;\n                  if($("m2FloorStatus"))$("m2FloorStatus").textContent="Proje #"+wantedPad+" Ortak Çizim'de açıldı.";\n                  return;\n                }\n                if(++commonOpenTries<80){setTimeout(openCommonProject,50);return;}\n                if($("m2FloorStatus"))$("m2FloorStatus").textContent="Ortak Çizim yükleyicisi hazırlanamadı.";\n              };\n              setTimeout(openCommonProject,0);\n              return;\n            }\n            showPage(moduleName);\n            m2ProjectRecords=projects.filter((item)=>item.module===moduleName);`;
const v873Start = `            const projectSystems=new Set((project?.payload?.layout?.racks||[]).map((rack)=>String(rack?.rafexSystem||(rack?.b2b?.mr?"mr":rack?.b2bLayout?"b2b":"")).toLowerCase()).filter(Boolean));\n            const commonProject=String(project?.module||"").toLowerCase()==="ortak"||projectSystems.size>1;\n            const moduleName=["b2b","mr","mekik2"].includes(project.module)?project.module:"b2b";\n            if(commonProject){\n              let commonOpenTries=0;\n              const commonRecord={...project,module:"ortak"};\n              const openCommonProject=()=>{\n                const loader=window.rafexLoadUnifiedProjectV75;\n                if(typeof loader==="function"){\n                  m2ProjectRecords=${commonFilter}.map((item)=>({ ...item, module:"ortak" }));\n                  loader(commonRecord,false);done=true;\n                  if($("m2FloorStatus"))$("m2FloorStatus").textContent="Proje #"+wantedPad+" Ortak Çizim'de açıldı.";\n                  return;\n                }\n                if(++commonOpenTries<80){setTimeout(openCommonProject,50);return;}\n                if($("m2FloorStatus"))$("m2FloorStatus").textContent="Ortak Çizim yükleyicisi hazırlanamadı.";\n              };\n              setTimeout(openCommonProject,0);\n              return;\n            }\n            showPage(moduleName);\n            m2ProjectRecords=projects.filter((item)=>item.module===moduleName);`;

if (!html.includes(v873Start)) {
  if (html.includes(v872Start)) html = html.replace(v872Start, v873Start);
  else if (html.includes(v871Start)) html = html.replace(v871Start, v873Start);
  else if (html.includes(legacyStart)) html = html.replace(legacyStart, v873Start);
  else throw new Error("Common project v87.3: deeplink module anchor bulunamadi");
}

const lateV871 = `              m2ProjectRecords=commonProject?${commonFilter}:projects.filter((item)=>item.module===moduleName);`;
const lateNative = `              m2ProjectRecords=projects.filter((item)=>item.module===moduleName);`;
if (html.includes(lateV871)) html = html.replace(lateV871, lateNative);
if (!html.includes(lateNative)) throw new Error("Common project v87.3: normal gec yukleyici bulunamadi");

for (const required of [
  'if(commonProject){',
  'const commonRecord={...project,module:"ortak"};',
  'const loader=window.rafexLoadUnifiedProjectV75;',
  '.map((item)=>({ ...item, module:"ortak" }))',
  'loader(commonRecord,false);done=true;',
  'return;\n            }\n            showPage(moduleName);'
]) if (!html.includes(required)) throw new Error("Common project v87.3 dogrulama eksigi: " + required);

fs.writeFileSync(portalPath, html);
console.log("SOURCE v87.3: eski karma projeler yukleme aninda module=ortak normalize edilir; MR/B2B etiketi Ortak Cizim'i bozamaz.");
