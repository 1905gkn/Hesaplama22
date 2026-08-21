import fs from "node:fs";
import path from "node:path";

const portalPath = path.join(process.cwd(), "portal.html");
let html = fs.readFileSync(portalPath, "utf8");

const functionStart = html.indexOf("function m2ChooseSavedRackType(index)");
if (functionStart < 0) throw new Error("m2ChooseSavedRackType bulunamadi.");

const functionEnd = html.indexOf("function m2CopySavedRackType", functionStart);
if (functionEnd < 0) throw new Error("m2ChooseSavedRackType bitisi bulunamadi.");

let block = html.slice(functionStart, functionEnd);
const heavySequence = "m2SelectedSavedType=index;m2LayoutState.selected=null;m2RenderSavedRackTypes();m2RenderLayout();";
const lightSequence = "m2SelectedSavedType=index;m2LayoutState.selected=null;m2RenderSavedRackTypes();";

if (block.includes(heavySequence)) {
  block = block.replace(heavySequence, lightSequence);
} else if (block.includes("m2RenderLayout();")) {
  block = block.replace("m2RenderLayout();", "");
} else {
  console.log("Kayitli raf tipi tiklama performans duzeltmesi zaten uygulanmis.");
  process.exit(0);
}

html = html.slice(0, functionStart) + block + html.slice(functionEnd);
fs.writeFileSync(portalPath, html);
console.log("Kayitli raf tipi tiklamasindaki agir yerlesim renderi kaldirildi.");
