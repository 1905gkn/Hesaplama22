import fs from "node:fs";
import path from "node:path";

const p=path.join(process.cwd(),"portal.html");
let html=fs.readFileSync(p,"utf8");

const oldInteractive="const interactiveRender=Boolean(m2LayoutState.drag||m2SymbolDrag||m2NoteDrag||m2DimensionDrag||m2ProtectionDraft?.start||m2SeismicDraft?.start||m2MultiSelect.active&&m2MultiSelect.start);";
const newInteractive="const interactiveRender=Boolean(m2LayoutState.drag||m2SymbolDrag||m2NoteDrag||m2DimensionDrag||m2ProtectionDraft?.start||m2SeismicDraft?.start||m2MultiSelect.active&&m2MultiSelect.start||m2LayoutState.racks.some((rack)=>rack?.staged&&rack?.freePlacement));";
if(html.includes(oldInteractive)) html=html.replace(oldInteractive,newInteractive);

const oldAdd='m2LayoutState.selected = id; $("m2FloorStatus").textContent = `${typeName || "Raf"} çizimin ortasına getirildi. İlk bırakmaya kadar duvarları ve diğer rafları dikkate almadan taşıyabilirsin.`; m2RenderLayout();';
const newAdd='m2LayoutState.selected = id; $("m2FloorStatus").textContent = `${typeName || "Raf"} çizimin ortasına getirildi. İlk bırakmaya kadar duvarları ve diğer rafları dikkate almadan taşıyabilirsin.`; if(typeof m2QueueLayoutRender==="function")m2QueueLayoutRender();else m2RenderLayout(); setTimeout(()=>{if(typeof m2RefreshActiveReport==="function")m2RefreshActiveReport();},120);';
if(html.includes(oldAdd)) html=html.replace(oldAdd,newAdd);

if(!html.includes(newInteractive)) throw new Error("Staged raf interactive render optimizasyonu uygulanamadi.");
if(!html.includes(newAdd)) throw new Error("Raf ekleme queued render optimizasyonu uygulanamadi.");

fs.writeFileSync(p,html);
console.log("Serbest alanda yeni raf ilk yerlesim performansi optimize edildi.");
